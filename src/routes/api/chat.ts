import { createFileRoute } from "@tanstack/react-router";
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { type ThinkingMode } from "@/lib/trinity/models";

/**
 * TriniAI chat gateway.
 *
 * This route is the Node.js gateway. It never talks to Gemini / OpenRouter /
 * HuggingFace directly — all model orchestration lives in the Agent Kernel
 * service reachable at AGENT_KERNEL_URL. We just:
 *   1. verify the caller's Supabase session
 *   2. forward messages to AGENT_KERNEL_URL/v1/chat/stream (SSE)
 *   3. translate SSE events into the AI SDK UI message stream the React
 *      client already consumes.
 */

async function verifyAuth(request: Request): Promise<{ userId: string } | Response> {
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
  return { userId: String(data.claims.sub) };
}

type ChatBody = {
  messages?: UIMessage[];
  model?: string;
  thinkingMode?: ThinkingMode;
  chatId?: string;
};

function uiMessagesToPlain(ui: UIMessage[]) {
  return ui.map((m) => ({
    role: m.role,
    content: m.parts.map((p) => (p.type === "text" ? p.text : "")).join(""),
  }));
}

// Minimal SSE line parser — reads `event:` / `data:` frames separated by `\n\n`.
async function* parseSSE(res: Response): AsyncGenerator<{ event: string; data: unknown }> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      let event = "message";
      const dataLines: string[] = [];
      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
      }
      const raw = dataLines.join("\n");
      if (!raw) continue;
      try {
        yield { event, data: JSON.parse(raw) };
      } catch {
        yield { event, data: raw };
      }
    }
  }
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await verifyAuth(request);
        if (auth instanceof Response) return auth;

        const body = (await request.json()) as ChatBody;
        const uiMessages = body.messages;
        if (!Array.isArray(uiMessages))
          return new Response("messages required", { status: 400 });

        const kernelUrl = process.env.AGENT_KERNEL_URL;
        if (!kernelUrl) {
          console.error("[chat] AGENT_KERNEL_URL is not configured");
          return new Response("Agent service not configured", { status: 503 });
        }

        const mode: ThinkingMode = body.thinkingMode ?? "normal";
        const kernelBody = {
          messages: uiMessagesToPlain(uiMessages),
          mode,
          model: body.model,
          user_id: auth.userId,
          metadata: { chat_id: body.chatId ?? null },
        };

        const headers: Record<string, string> = { "content-type": "application/json" };
        if (process.env.AGENT_KERNEL_SHARED_SECRET) {
          headers.authorization = `Bearer ${process.env.AGENT_KERNEL_SHARED_SECRET}`;
        }

        let upstream: Response;
        try {
          upstream = await fetch(`${kernelUrl.replace(/\/$/, "")}/v1/chat/stream`, {
            method: "POST",
            headers,
            body: JSON.stringify(kernelBody),
          });
        } catch (err) {
          console.error("[chat] agent kernel unreachable:", err);
          return new Response("Agent service unreachable", { status: 502 });
        }

        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          console.error("[chat] agent kernel error:", upstream.status, text);
          return new Response("Agent service error", { status: 502 });
        }

        const stream = createUIMessageStream({
          originalMessages: uiMessages,
          execute: async ({ writer }) => {
            const emit = (step: string, status: "start" | "done", detail?: string) =>
              writer.write({
                type: "data-trinity-step",
                data: { step, status, detail: detail ?? "" },
                transient: true,
              });

            const messageId = crypto.randomUUID();
            writer.write({ type: "start", messageId });
            const textId = crypto.randomUUID();
            writer.write({ type: "text-start", id: textId });

            for await (const ev of parseSSE(upstream)) {
              if (ev.event === "step") {
                const d = ev.data as { step: string; status: "start" | "done" };
                emit(d.step, d.status);
              } else if (ev.event === "token") {
                const d = ev.data as { delta: string };
                if (d.delta) writer.write({ type: "text-delta", id: textId, delta: d.delta });
              } else if (ev.event === "done") {
                writer.write({ type: "text-end", id: textId });
                writer.write({ type: "finish" });
              } else if (ev.event === "error") {
                const d = ev.data as { message?: string };
                console.error("[chat] kernel error event:", d?.message);
                writer.write({ type: "error", errorText: "Agent service error" });
              }
            }
          },
        });

        return createUIMessageStreamResponse({
          stream,
          headers: { "X-Trinity-Mode": mode, "X-Trinity-Backend": "agent-kernel" },
        });
      },
    },
  },
});
