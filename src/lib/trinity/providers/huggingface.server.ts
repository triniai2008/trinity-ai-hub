// Hugging Face Inference API wrappers for image / video / voice / 3D / stt.
// Text generation also supported via HF Router (OpenAI-compatible).
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createHuggingFaceTextProvider(apiKey: string) {
  // HF Inference Providers expose an OpenAI-compatible router.
  return createOpenAICompatible({
    name: "huggingface",
    baseURL: "https://router.huggingface.co/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

/** Generic call to HF Inference API for non-chat tasks (image/audio/video). */
export async function callHuggingFaceInference(opts: {
  apiKey: string;
  model: string;
  body: unknown;
  accept?: string;
}): Promise<Response> {
  const { apiKey, model, body, accept } = opts;
  return fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(accept ? { Accept: accept } : {}),
    },
    body: JSON.stringify(body),
  });
}
