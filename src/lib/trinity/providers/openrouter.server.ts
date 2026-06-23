// OpenRouter provider via AI SDK openai-compatible adapter.
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createOpenRouterProvider(apiKey: string, siteUrl?: string, siteName?: string) {
  return createOpenAICompatible({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": siteUrl ?? "https://triniai.app",
      "X-Title": siteName ?? "TriniAI",
    },
  });
}
