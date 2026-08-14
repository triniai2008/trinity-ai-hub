import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, createUIMessageStreamResponse, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";
import { getModel, detectCapability, planForMode, type ThinkingMode } from "@/lib/trinity/models";
import { buildModel, runParallel, judge } from "@/lib/trinity/router.server";
import { runAgentKernel } from "@/lib/trinity/kernel/kernel.server";


/**
 * TriniAI /api/chat — hybrid brain.
 *  • Normal mode → stream directly from the chosen model (Lovable AI or Trinity provider).
 *  • Medium/High mode → Trinity router: fan out to N models in parallel,
 *    judge, then stream the winner's answer to the client.
 */

async function verifyAuth(request: Request): Promise<{ userId: string } | Response> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.split(".").length !== 3) return new Response("Unauthorized", { status: 401 });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return new Response("Internal server error", { status: 500 });
  const supabase = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return new Response("Unauthorized", { status: 401 });
  return { userId: String(data.claims.sub) };
}

const SYSTEM_PROMPT = `You are Trinity, the AI mind powering TriniAI — a powerful AI assistant in the spirit of ChatGPT and Claude. You are helpful, precise, and thorough.

Formatting rules:
- Reply in clean, well-structured markdown.
- Use headings, bullet lists and tables when they aid clarity.
- Put code in fenced code blocks with the correct language tag.
- Use LaTeX ($...$ or $$...$$) for math when helpful.
- Cite sources with inline links when you reference the web.

Reasoning rules:
- Think step-by-step for complex questions; keep the final answer focused.
- If a request is ambiguous, ask one short clarifying question first.
- Never fabricate facts, APIs, or citations. Say "I don't know" if unsure.
- Refuse unsafe or illegal requests concisely and offer a safer alternative.`;

// Every Lovable AI chat model id currently in the catalog. Keep in sync with ai-models-chat.
const LOVABLE_MODEL_ALLOWLIST = new Set([
  "google/gemini-3-flash-preview",
  "google/gemini-3.1-flash-lite",
  "google/gemini-3.5-flash",
  "google/gemini-3.6-flash",
  "google/gemini-3.1-pro-preview",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
  "openai/gpt-5.2",
  "openai/gpt-5.4",
  "openai/gpt-5.4-mini",
  "openai/gpt-5.4-nano",
  "openai/gpt-5.5",
  "openai/gpt-5.6-sol",
  "openai/gpt-5.6-terra",
  "openai/gpt-5.6-luna",
]);

const GPT56 = /^openai\/gpt-5\.6-/;
const DEFAULT_LOVABLE_MODEL = "google/gemini-3.6-flash";

type ChatBody = {
  messages?: UIMessage[];
  model?: string;
  thinkingMode?: ThinkingMode;
  includePremium?: boolean;
};

function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "user") {
      return m.parts
        .map((p) => (p.type === "text" ? p.text : ""))
        .join("\n")
        .trim();
    }
  }
  return "";
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await verifyAuth(request);
        if (auth instanceof Response) return auth;

        const body = (await request.json()) as ChatBody;
        const uiMessages = body.messages;
        if (!Array.isArray(uiMessages) || uiMessages.length === 0)
          return new Response("messages required", { status: 400 });

        const lovableApiKey = process.env.LOVABLE_API_KEY;
        if (!lovableApiKey) {
          console.error("[chat] Missing LOVABLE_API_KEY");
          return new Response("AI not configured", { status: 500 });
        }

        const mode: ThinkingMode = body.thinkingMode ?? "normal";
        const requested = body.model?.trim();
        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(lovableApiKey, initialRunId);
        const modelMessages = await convertToModelMessages(uiMessages);
        const question = lastUserText(uiMessages);

        try {
          // ── AUTO → Agent Kernel workflow (DeepSeek-first) ────────────
          if (!requested) {
            const stream = runAgentKernel({
              uiMessages,
              modelMessages,
              question,
              mode,
              fallback: gateway(DEFAULT_LOVABLE_MODEL),
            });
            return createUIMessageStreamResponse({
              stream,
              headers: getLovableAiGatewayResponseHeaders(undefined, {
                "X-Trinity-Engine": "agent-kernel",
                "X-Trinity-Mode": mode,
                ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
              }),
            });
          }

          // ── MEDIUM / HIGH → Trinity multi-model + judge ──────────────
          if (mode !== "normal") {

            const cap = detectCapability(question || "chat");
            const plan = planForMode(cap, mode, body.includePremium ?? false);

            if (plan.length > 1) {
              const results = await runParallel(plan, modelMessages, SYSTEM_PROMPT);
              if (results.length > 0) {
                const verdict = await judge(question, results);
                const winner = results[verdict.winnerIndex] ?? results[0];
                const winnerModel = buildModel(winner.model);
                if (winnerModel) {
                  const result = streamText({
                    model: winnerModel,
                    system: SYSTEM_PROMPT,
                    messages: modelMessages,
                  });
                  const response = result.toUIMessageStreamResponse({
                    originalMessages: uiMessages,
                    headers: getLovableAiGatewayResponseHeaders(undefined, {
                      "X-Trinity-Mode": mode,
                      "X-Trinity-Capability": cap,
                      "X-Trinity-Plan": plan.map((p) => p.id).join(","),
                      "X-Trinity-Winner": winner.model.id,
                      "X-Trinity-Judge-Reason": encodeURIComponent(verdict.reasoning).slice(0, 400),
                      ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
                    }),
                  });
                  return withLovableAiGatewayRunIdHeader(response, gateway);
                }
              }
              // Fan-out failed for every provider → fall through to single-model stream.
            }
          }

          // ── NORMAL (or fallback) → single model stream ───────────────
          let modelInstance;
          let chosenId: string;

          if (requested && LOVABLE_MODEL_ALLOWLIST.has(requested)) {
            modelInstance = gateway(requested);
            chosenId = requested;
          } else if (requested && getModel(requested)) {
            const def = getModel(requested)!;
            const built = buildModel(def);
            if (built) {
              modelInstance = built;
              chosenId = `trinity:${def.id}`;
            } else {
              modelInstance = gateway(DEFAULT_LOVABLE_MODEL);
              chosenId = DEFAULT_LOVABLE_MODEL;
            }
          } else {
            modelInstance = gateway(DEFAULT_LOVABLE_MODEL);
            chosenId = DEFAULT_LOVABLE_MODEL;
          }

          const isGpt56 = GPT56.test(chosenId);
          const wantsReasoning = mode !== "normal" && !isGpt56 && chosenId.startsWith("google/");

          const result = streamText({
            model: modelInstance,
            system: SYSTEM_PROMPT,
            messages: modelMessages,
            providerOptions: {
              lovable: {
                ...(isGpt56 ? { reasoningEffort: "none" as const } : {}),
                ...(wantsReasoning
                  ? { reasoning: { effort: mode === "high" ? "high" : "medium" } }
                  : {}),
              },
            },
          });

          const response = result.toUIMessageStreamResponse({
            originalMessages: uiMessages,
            sendReasoning: wantsReasoning,
            headers: getLovableAiGatewayResponseHeaders(undefined, {
              "X-Trinity-Model": chosenId,
              "X-Trinity-Mode": mode,
              ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
            }),
          });

          return withLovableAiGatewayRunIdHeader(response, gateway);
        } catch (err) {
          console.error("[chat] streamText error:", err);
          return new Response("AI service error", { status: 502 });
        }
      },
    },
  },
});
