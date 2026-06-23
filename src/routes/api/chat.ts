import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Trinity, the AI mind powering TriniAI — an AI operating system that combines many models, agents, and tools into one simple interface. Be concise, helpful, and accurate. Use clean markdown when helpful. Code goes in fenced code blocks with the language.`;

type ChatBody = {
  messages?: UIMessage[];
  model?: string;
  thinkingMode?: "normal" | "medium" | "high";
};

const ALLOWED_MODELS = new Set([
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-3.5-flash",
  "openai/gpt-5-mini",
  "openai/gpt-5",
  "openai/gpt-5.2",
]);

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const requested = body.model && ALLOWED_MODELS.has(body.model)
          ? body.model
          : "google/gemini-3-flash-preview";

        // Thinking mode currently routes to a larger model; multi-model judge lands later.
        const modelId = body.thinkingMode === "high"
          ? "google/gemini-2.5-pro"
          : body.thinkingMode === "medium"
          ? "google/gemini-3.5-flash"
          : requested;

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway(modelId),
          system: SYSTEM_PROMPT,
          messages: convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
