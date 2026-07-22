import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";

/**
 * TriniAI chat — powered by Lovable AI Gateway.
 *
 * Streams a top-tier chat model directly to the client with full markdown,
 * code blocks and reasoning support, the ChatGPT / Claude experience.
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

// Curated allowlist — every id verified against the ai-models-chat catalog.
const MODEL_ALLOWLIST = new Set([
  "google/gemini-3-flash-preview",
  "google/gemini-3.1-flash-lite",
  "google/gemini-3.5-flash",
  "google/gemini-3.6-flash",
  "google/gemini-3.1-pro-preview",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5.4",
  "openai/gpt-5.4-mini",
  "openai/gpt-5.5",
]);

// Powerful default — Gemini 3.1 Pro preview for depth, with cheap/fast fallback.
const DEFAULT_MODEL = "google/gemini-3.1-pro-preview";
const FAST_MODEL = "google/gemini-3-flash-preview";

type ChatBody = {
  messages?: UIMessage[];
  model?: string;
  thinkingMode?: "normal" | "medium" | "high";
};

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

        const mode = body.thinkingMode ?? "normal";
        const requested = body.model && MODEL_ALLOWLIST.has(body.model) ? body.model : undefined;
        const modelId = requested ?? (mode === "normal" ? FAST_MODEL : DEFAULT_MODEL);

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(lovableApiKey, initialRunId);

        try {
          const result = streamText({
            model: gateway(modelId),
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(uiMessages),
            // Ask reasoning-capable Gemini models to "think" for medium/high modes.
            providerOptions:
              mode !== "normal"
                ? { lovable: { reasoning: { effort: mode === "high" ? "high" : "medium" } } }
                : undefined,
          });

          const response = result.toUIMessageStreamResponse({
            originalMessages: uiMessages,
            sendReasoning: mode !== "normal",
            headers: getLovableAiGatewayResponseHeaders(undefined, {
              "X-Trinity-Model": modelId,
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
