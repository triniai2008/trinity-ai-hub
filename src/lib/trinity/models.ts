// Trinity 1.0 model registry. Client-safe (just metadata, no keys).
export type Provider = "openrouter" | "huggingface" | "lovable" | "ollama";
export type Capability =
  | "chat"
  | "code"
  | "math"
  | "writing"
  | "research"
  | "image"
  | "video"
  | "audio"
  | "voice"
  | "stt"
  | "3d";

export type Priority = "very_high" | "high" | "medium" | "low";

export interface ModelDef {
  id: string;             // canonical id used by Trinity
  label: string;          // UI label
  provider: Provider;
  providerId: string;     // id as the provider expects it
  capabilities: Capability[];
  priority: Priority;
  premium?: boolean;
  free?: boolean;
}

export const MODELS: ModelDef[] = [
  // ── TEXT — free tier via OpenRouter ──
  { id: "deepseek-v3", label: "DeepSeek V3", provider: "openrouter", providerId: "deepseek/deepseek-chat-v3.1:free", capabilities: ["chat", "math", "code", "research"], priority: "very_high", free: true },
  { id: "qwen-3",     label: "Qwen 3",       provider: "openrouter", providerId: "qwen/qwen3-235b-a22b:free",        capabilities: ["chat", "math", "writing"], priority: "high", free: true },
  { id: "gemma-3",    label: "Gemma 3",      provider: "openrouter", providerId: "google/gemma-3-27b-it:free",       capabilities: ["chat"], priority: "medium", free: true },
  { id: "llama",      label: "Llama 3.3",    provider: "openrouter", providerId: "meta-llama/llama-3.3-70b-instruct:free", capabilities: ["chat", "writing"], priority: "high", free: true },
  { id: "mistral",    label: "Mistral",      provider: "openrouter", providerId: "mistralai/mistral-small-3.2-24b-instruct:free", capabilities: ["chat"], priority: "medium", free: true },
  { id: "phi",        label: "Phi 4",        provider: "openrouter", providerId: "microsoft/phi-4-reasoning:free",   capabilities: ["chat"], priority: "low", free: true },

  // ── TEXT — premium ──
  { id: "gpt",        label: "GPT-4o",       provider: "openrouter", providerId: "openai/gpt-4o",                    capabilities: ["chat", "code", "writing", "math", "research"], priority: "very_high", premium: true },
  { id: "claude",     label: "Claude 3.5 Sonnet", provider: "openrouter", providerId: "anthropic/claude-3.5-sonnet", capabilities: ["chat", "writing", "research"], priority: "very_high", premium: true },
  { id: "gemini",     label: "Gemini 2.5 Pro", provider: "openrouter", providerId: "google/gemini-2.5-pro",          capabilities: ["chat", "research"], priority: "very_high", premium: true },

  // ── CODE ──
  { id: "deepseek-coder", label: "DeepSeek Coder", provider: "openrouter", providerId: "deepseek/deepseek-chat-v3.1:free", capabilities: ["code"], priority: "very_high", free: true },
  { id: "qwen-coder",     label: "Qwen Coder",     provider: "openrouter", providerId: "qwen/qwen3-coder:free", capabilities: ["code"], priority: "high", free: true },

  // ── IMAGE (HuggingFace Inference) ──
  { id: "flux",       label: "FLUX.1 [schnell]",   provider: "huggingface", providerId: "black-forest-labs/FLUX.1-schnell", capabilities: ["image"], priority: "very_high" },
  { id: "sdxl",       label: "SDXL",               provider: "huggingface", providerId: "stabilityai/stable-diffusion-xl-base-1.0", capabilities: ["image"], priority: "high" },
  { id: "sd",         label: "Stable Diffusion",   provider: "huggingface", providerId: "stabilityai/stable-diffusion-2-1", capabilities: ["image"], priority: "medium" },

  // ── VIDEO ──
  { id: "wan",        label: "Wan",          provider: "huggingface", providerId: "Wan-AI/Wan2.1-T2V-1.3B", capabilities: ["video"], priority: "very_high" },
  { id: "cogvideox",  label: "CogVideoX",    provider: "huggingface", providerId: "THUDM/CogVideoX-2b", capabilities: ["video"], priority: "high" },
  { id: "ltx",        label: "LTX Video",    provider: "huggingface", providerId: "Lightricks/LTX-Video", capabilities: ["video"], priority: "medium" },

  // ── AUDIO / VOICE ──
  { id: "whisper",    label: "Whisper",      provider: "huggingface", providerId: "openai/whisper-large-v3", capabilities: ["stt"], priority: "very_high" },
  { id: "musicgen",   label: "MusicGen",     provider: "huggingface", providerId: "facebook/musicgen-large", capabilities: ["audio"], priority: "high" },
  { id: "kokoro",     label: "Kokoro TTS",   provider: "huggingface", providerId: "hexgrad/Kokoro-82M", capabilities: ["voice"], priority: "very_high" },
  { id: "piper",      label: "Piper",        provider: "huggingface", providerId: "rhasspy/piper-voices", capabilities: ["voice"], priority: "medium" },

  // ── 3D ──
  { id: "hunyuan3d",  label: "Hunyuan3D",    provider: "huggingface", providerId: "tencent/Hunyuan3D-2", capabilities: ["3d"], priority: "very_high" },
  { id: "triposr",    label: "TripoSR",      provider: "huggingface", providerId: "stabilityai/TripoSR", capabilities: ["3d"], priority: "high" },
];

export type ThinkingMode = "normal" | "medium" | "high";

const PRIORITY_RANK: Record<Priority, number> = { very_high: 4, high: 3, medium: 2, low: 1 };

export function getModelsForCapability(cap: Capability): ModelDef[] {
  return MODELS
    .filter((m) => m.capabilities.includes(cap))
    .sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
}

export function getModel(id: string): ModelDef | undefined {
  return MODELS.find((m) => m.id === id);
}

/** Pick the model panel based on thinking mode. */
export function planForMode(cap: Capability, mode: ThinkingMode, includePremium = false): ModelDef[] {
  const pool = getModelsForCapability(cap).filter((m) => includePremium || !m.premium);
  if (pool.length === 0) return [];
  if (mode === "normal") return [pool[0]];
  if (mode === "medium") return pool.slice(0, Math.min(3, pool.length));
  return pool.slice(0, Math.min(5, pool.length)); // high: up to 5
}

/** Quick task detection from a user prompt. */
export function detectCapability(text: string): Capability {
  const t = text.toLowerCase();
  if (/\b(code|function|bug|debug|typescript|python|react|api)\b/.test(t)) return "code";
  if (/\b(image|picture|draw|paint|logo|illustration)\b/.test(t)) return "image";
  if (/\b(video|animat|movie|clip)\b/.test(t)) return "video";
  if (/\b(music|song|melody|beat)\b/.test(t)) return "audio";
  if (/\b(voice|speak|tts|say)\b/.test(t)) return "voice";
  if (/\b(3d|model|mesh|sculpt)\b/.test(t)) return "3d";
  if (/\b(research|find|sources|study|analyze)\b/.test(t)) return "research";
  if (/\b(write|essay|story|poem|article)\b/.test(t)) return "writing";
  if (/\b(solve|equation|math|calculate)\b/.test(t)) return "math";
  return "chat";
}
