import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, createUIMessageStreamResponse, type UIMessage } from "ai";
import { runAgentKernel } from "@/lib/trinity/kernel/kernel.server";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { checkKernelHealth } from "@/lib/trinity/kernel/remote.server";

/**
 * /api/agents/chat — proxy to the TriniAI Agent Kernel (Python FastAPI).
 *
 * Frontend agent pages POST { agent, messages, thinkingMode } here; we forward
 * to `${AGENT_KERNEL_URL}/v1/chat/stream` and translate the kernel's SSE
 * (event: step|token|done|error) into the AI SDK UI Message stream so the
 * same Chat components render agent output.
 */

async function verifyAuth(request: Request): Promise<{ userId: string; email?: string } | Response> {
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
  return {
    userId: String(data.claims.sub),
    email: typeof data.claims.email === "string" ? data.claims.email : undefined,
  };
}

type AgentBody = {
  agent?: string;
  messages?: Array<{ role: string; parts?: Array<{ type: string; text?: string }>; content?: string }>;
  thinkingMode?: "normal" | "medium" | "high";
};

function toKernelMessages(msgs: AgentBody["messages"]) {
  return (msgs ?? []).map((m) => ({
    role: m.role,
    content:
      m.content ??
      (m.parts ?? [])
        .map((p) => (p.type === "text" ? (p.text ?? "") : ""))
        .join(""),
  }));
}

// AI SDK UI message stream frame helpers
const enc = new TextEncoder();
function frame(obj: unknown) {
  return enc.encode(`data: ${JSON.stringify(obj)}\n\n`);
}

export const Route = createFileRoute("/api/agents/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await verifyAuth(request);
        if (auth instanceof Response) return auth;

        const body = (await request.json()) as AgentBody;
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return new Response("messages required", { status: 400 });
        }

        // Built-in Agent Kernel — used whenever the remote Python kernel is
        // absent or unhealthy, so agent chat always works.
        const runBuiltin = async () => {
          const lovableApiKey = process.env.LOVABLE_API_KEY;
          if (!lovableApiKey) return new Response("AI not configured", { status: 500 });
          const gateway = createLovableAiGatewayProvider(lovableApiKey);
          const uiMessages = body.messages as unknown as UIMessage[];
          const modelMessages = await convertToModelMessages(uiMessages);
          const question = toKernelMessages(body.messages)
            .filter((m) => m.role === "user")
            .at(-1)?.content ?? "";
          const stream = runAgentKernel({
            uiMessages,
            modelMessages,
            question,
            mode: body.thinkingMode ?? "normal",
            fallback: gateway("google/gemini-3.7-flash"),
          });
          return createUIMessageStreamResponse({
            stream,
            headers: { "X-Trinity-Engine": "builtin-agent-kernel" },
          });
        };

        const health = await checkKernelHealth();
        if (!health.reachable) return runBuiltin();

        const kernelUrl = process.env.AGENT_KERNEL_URL!;
        const shared = process.env.AGENT_KERNEL_SHARED_SECRET;
        const upstream = await fetch(`${kernelUrl.replace(/\/+$/, "")}/v1/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            ...(shared ? { "X-Gateway-Secret": shared } : {}),
          },
          body: JSON.stringify({
            agent: body.agent ?? "trinity",
            thinking_mode: body.thinkingMode ?? "normal",
            user: { id: auth.userId, email: auth.email },
            messages: toKernelMessages(body.messages),
          }),
        }).catch((err) => {
          console.error("[agents] kernel fetch failed:", err);
          return null;
        });

        if (!upstream || !upstream.ok || !upstream.body) {
          const detail = upstream ? await upstream.text().catch(() => "") : "network error";
          console.error("[agents] kernel error:", upstream?.status, detail.slice(0, 200));
          return new Response("Agent Kernel unavailable", { status: 502 });
        }

        // Translate kernel SSE → AI SDK UI Message stream
        const messageId = `msg_${crypto.randomUUID()}`;
        const textPartId = "t0";
        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
          async start(controller) {
            controller.enqueue(frame({ type: "start", messageId }));
            controller.enqueue(frame({ type: "start-step" }));
            controller.enqueue(frame({ type: "text-start", id: textPartId }));

            let buffer = "";
            let closed = false;
            const close = () => {
              if (closed) return;
              closed = true;
              controller.enqueue(frame({ type: "text-end", id: textPartId }));
              controller.enqueue(frame({ type: "finish-step" }));
              controller.enqueue(frame({ type: "finish" }));
              controller.enqueue(enc.encode("data: [DONE]\n\n"));
              controller.close();
            };

            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                let idx: number;
                while ((idx = buffer.indexOf("\n\n")) !== -1) {
                  const block = buffer.slice(0, idx);
                  buffer = buffer.slice(idx + 2);
                  let event = "message";
                  let data = "";
                  for (const line of block.split("\n")) {
                    if (line.startsWith("event:")) event = line.slice(6).trim();
                    else if (line.startsWith("data:")) data += line.slice(5).trim();
                  }
                  if (!data) continue;
                  let parsed: unknown;
                  try { parsed = JSON.parse(data); } catch { parsed = { text: data }; }
                  const p = parsed as { text?: string; message?: string };
                  if (event === "token" && p.text) {
                    controller.enqueue(frame({ type: "text-delta", id: textPartId, delta: p.text }));
                  } else if (event === "step" && p.message) {
                    controller.enqueue(
                      frame({ type: "text-delta", id: textPartId, delta: `\n> ${p.message}\n` }),
                    );
                  } else if (event === "error") {
                    controller.enqueue(
                      frame({ type: "text-delta", id: textPartId, delta: `\n\n**Agent error:** ${p.message ?? "unknown"}` }),
                    );
                  } else if (event === "done") {
                    close();
                    return;
                  }
                }
              }
            } catch (err) {
              console.error("[agents] stream error:", err);
              controller.enqueue(
                frame({ type: "text-delta", id: textPartId, delta: "\n\n**Stream interrupted.**" }),
              );
            } finally {
              close();
            }
          },
          cancel(reason) {
            return reader.cancel(reason);
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "X-Vercel-AI-UI-Message-Stream": "v1",
          },
        });
      },
    },
  },
});
