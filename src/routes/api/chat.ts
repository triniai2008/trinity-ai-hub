import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { route, runParallel, judge, buildModel } from "@/lib/trinity/router.server";
import { getModel, type ThinkingMode } from "@/lib/trinity/models";

async function verifyAuth(request: Request): Promise<Response | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.split(".").length !== 3) {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("[chat] Missing Supabase env for auth verification");
    return new Response("Internal server error", { status: 500 });
  }
  const supabase = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}


const SYSTEM_PROMPT = `You are Trinity, the AI mind powering TriniAI — an AI operating system that combines many models, agents, and tools into one simple interface. Be concise, helpful, and accurate. Use clean markdown when helpful. Code goes in fenced code blocks with the language.`;

type ChatBody = {
  messages?: UIMessage[];
  model?: string;        // explicit Trinity model id from UI (overrides auto-route)
  thinkingMode?: ThinkingMode;
  includePremium?: boolean;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authError = await verifyAuth(request);
        if (authError) return authError;

        const body = (await request.json()) as ChatBody;
        const uiMessages = body.messages;
        if (!Array.isArray(uiMessages)) {
          return new Response("messages required", { status: 400 });
        }


        const mode: ThinkingMode = body.thinkingMode ?? "normal";
        const modelMessages = await convertToModelMessages(uiMessages);

        // Pull last user text for routing/judge.
        const lastUser = [...uiMessages].reverse().find((m) => m.role === "user");
        const lastText = lastUser
          ? lastUser.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ")
          : "";

        try {
          // ── NORMAL mode (or explicit single model): stream the chosen model directly ──
          if (mode === "normal" || body.model) {
            const explicit = body.model ? getModel(body.model) : undefined;
            const planned = explicit ?? route(lastText, "normal", body.includePremium).plan[0];
            if (!planned) return new Response("no model available", { status: 503 });
            const model = buildModel(planned);
            if (!model) return new Response("provider unavailable", { status: 503 });
            const result = streamText({ model, system: SYSTEM_PROMPT, messages: modelMessages });
            return result.toUIMessageStreamResponse({ originalMessages: uiMessages });
          }

          // ── MEDIUM / HIGH: fan-out → judge → stream winner ──
          const { plan } = route(lastText, mode, body.includePremium);
          if (plan.length === 0) return new Response("no model plan", { status: 503 });

          const candidates = await runParallel(plan, modelMessages, SYSTEM_PROMPT);
          if (candidates.length === 0) return new Response("all models failed", { status: 502 });

          const { winnerIndex } = await judge(lastText, candidates);
          const winner = candidates[winnerIndex] ?? candidates[0];

          // Stream the winner's text as a synthetic stream (already-computed answer).
          // Re-run streaming via the same model so the client sees a proper streaming response.
          const winnerModel = buildModel(winner.model);
          if (!winnerModel) {
            // Fallback: return the precomputed text as a one-shot stream.
            const result = streamText({
              model: buildModel(plan[0])!,
              system: SYSTEM_PROMPT,
              messages: [...modelMessages, { role: "user", content: "Repeat the prior assistant response verbatim." }],
            });
            return result.toUIMessageStreamResponse({ originalMessages: uiMessages });
          }
          const result = streamText({
            model: winnerModel,
            system: SYSTEM_PROMPT,
            messages: modelMessages,
          });
          return result.toUIMessageStreamResponse({
            originalMessages: uiMessages,
            headers: { "X-Trinity-Winner": winner.model.id, "X-Trinity-Mode": mode },
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return new Response(`Trinity error: ${msg}`, { status: 500 });
        }
      },
    },
  },
});
