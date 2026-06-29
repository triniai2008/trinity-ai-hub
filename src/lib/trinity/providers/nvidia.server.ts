// NVIDIA NIM / build.nvidia.com — OpenAI-compatible endpoint.
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createNvidiaProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "nvidia",
    baseURL: "https://integrate.api.nvidia.com/v1",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
