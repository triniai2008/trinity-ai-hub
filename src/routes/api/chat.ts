import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, createUIMessageStreamResponse, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { runTrinityPipeline } from "@/lib/trinity/pipeline.server";
import { type ThinkingMode } from "@/lib/trinity/models";

async function verifyAuth(request: Request): Promise<Response | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.split(".").length !== 3) return new Response("Unauthorized", { status: 401 });
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
  if (error || !data?.claims?.sub) return new Response("Unauthorized", { status: 401 });
  return null;
}

const SYSTEM_PROMPT = `You are Trinity, the AI mind powering TriniAI — an AI operating system that combines many models, agents, and tools into one simple interface. Be concise, helpful, and accurate. Use clean markdown when helpful. Code goes in fenced code blocks with the language.`;

type ChatBody = {
  messages?: UIMessage[];
  model?: string;
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
        if (!Array.isArray(uiMessages)) return new Response("messages required", { status: 400 });

        const mode: ThinkingMode = body.thinkingMode ?? "normal";
        const modelMessages = await convertToModelMessages(uiMessages);
        const lastUser = [...uiMessages].reverse().find((m) => m.role === "user");
        const lastUserText = lastUser
          ? lastUser.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ")
          : "";

        try {
          const stream = runTrinityPipeline({
            uiMessages,
            modelMessages,
            lastUserText,
            mode,
            explicitModelId: body.model,
            includePremium: body.includePremium,
            system: SYSTEM_PROMPT,
          });
          return createUIMessageStreamResponse({
            stream,
            headers: { "X-Trinity-Mode": mode },
          });
        } catch (err) {
          console.error("[chat] error:", err);
          return new Response("Internal server error", { status: 500 });
        }
      },
    },
  },
});

