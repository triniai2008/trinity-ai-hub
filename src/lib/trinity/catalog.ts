// Trinity 1.0 — Model Catalog
// Categorizes all available models by purpose, source, tier, speed, and use case.
// Source of truth for /models pages, model picker, and Trinity router.

export type ModelTier = "primary" | "premium" | "lightweight" | "local";
export type ModelSource = "openrouter" | "huggingface" | "lovable" | "ollama" | "internal";
export type ModelSpeed = "fast" | "balanced" | "slow";
export type ModelCategoryKey =
  | "chat"
  | "coding"
  | "reasoning"
  | "writing"
  | "translation"
  | "research"
  | "image"
  | "video"
  | "tts"
  | "stt"
  | "music"
  | "three-d"
  | "ocr"
  | "embeddings"
  | "reranking"
  | "lightweight"
  | "local";

export type ModelEntry = {
  id: string;              // provider-prefixed slug used by Trinity router
  name: string;            // display name
  vendor: string;          // DeepSeek, Qwen, Anthropic, etc.
  source: ModelSource;
  tier: ModelTier;
  speed: ModelSpeed;
  context?: number;        // tokens
  notes?: string;
};

export type ModelCategory = {
  key: ModelCategoryKey;
  label: string;
  purpose: string[];       // bullet list
  priority: 1 | 2 | 3 | 4 | 5; // stars
  defaultId: string;
  models: ModelEntry[];
};

export const CATALOG: ModelCategory[] = [
  {
    key: "chat",
    label: "General Chat",
    purpose: ["General conversation", "Reasoning", "Question answering", "Learning"],
    priority: 5,
    defaultId: "deepseek/deepseek-chat-v3",
    models: [
      { id: "deepseek/deepseek-chat-v3", name: "DeepSeek V3", vendor: "DeepSeek", source: "openrouter", tier: "primary", speed: "balanced", context: 128000 },
      { id: "qwen/qwen3-235b", name: "Qwen 3", vendor: "Alibaba", source: "openrouter", tier: "primary", speed: "balanced", context: 128000 },
      { id: "google/gemma-3-27b", name: "Gemma 3", vendor: "Google", source: "openrouter", tier: "primary", speed: "fast", context: 128000 },
      { id: "meta-llama/llama-4-scout", name: "Llama 4", vendor: "Meta", source: "openrouter", tier: "primary", speed: "balanced", context: 1000000 },
      { id: "mistralai/mistral-large", name: "Mistral", vendor: "Mistral AI", source: "openrouter", tier: "primary", speed: "fast", context: 128000 },
      { id: "openai/gpt-5", name: "GPT-5", vendor: "OpenAI", source: "lovable", tier: "premium", speed: "balanced" },
      { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet", vendor: "Anthropic", source: "openrouter", tier: "premium", speed: "balanced", context: 200000 },
      { id: "google/gemini-2.5-pro", name: "Gemini 2.5", vendor: "Google", source: "lovable", tier: "premium", speed: "balanced", context: 2000000 },
    ],
  },
  {
    key: "coding",
    label: "Coding",
    purpose: ["Programming", "Bug fixing", "File generation", "Project architecture", "Code explanation"],
    priority: 5,
    defaultId: "deepseek/deepseek-coder-v2",
    models: [
      { id: "deepseek/deepseek-coder-v2", name: "DeepSeek Coder V2", vendor: "DeepSeek", source: "openrouter", tier: "primary", speed: "balanced", context: 128000 },
      { id: "qwen/qwen-coder", name: "Qwen Coder", vendor: "Alibaba", source: "openrouter", tier: "primary", speed: "fast", context: 64000 },
      { id: "meta-llama/codellama-70b", name: "Code Llama", vendor: "Meta", source: "openrouter", tier: "primary", speed: "balanced" },
      { id: "bigcode/starcoder2", name: "StarCoder2", vendor: "BigCode", source: "huggingface", tier: "primary", speed: "fast" },
      { id: "qwen/qwen3-coder", name: "Qwen3-Coder", vendor: "Alibaba", source: "openrouter", tier: "primary", speed: "balanced" },
      { id: "openai/gpt-5", name: "GPT-5", vendor: "OpenAI", source: "lovable", tier: "premium", speed: "balanced" },
      { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet", vendor: "Anthropic", source: "openrouter", tier: "premium", speed: "balanced" },
    ],
  },
  {
    key: "reasoning",
    label: "Math & Reasoning",
    purpose: ["Math", "Logic", "Chain of Thought", "Analysis"],
    priority: 5,
    defaultId: "deepseek/deepseek-r1",
    models: [
      { id: "deepseek/deepseek-r1", name: "DeepSeek R1", vendor: "DeepSeek", source: "openrouter", tier: "primary", speed: "slow", notes: "Extended thinking" },
      { id: "qwen/qwen3-235b", name: "Qwen 3", vendor: "Alibaba", source: "openrouter", tier: "primary", speed: "balanced" },
      { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick", vendor: "Meta", source: "openrouter", tier: "primary", speed: "balanced" },
      { id: "google/gemma-3-27b", name: "Gemma 3", vendor: "Google", source: "openrouter", tier: "primary", speed: "fast" },
      { id: "openai/gpt-5", name: "GPT-5", vendor: "OpenAI", source: "lovable", tier: "premium", speed: "balanced" },
      { id: "anthropic/claude-sonnet-4", name: "Claude", vendor: "Anthropic", source: "openrouter", tier: "premium", speed: "balanced" },
    ],
  },
  {
    key: "writing",
    label: "Writing",
    purpose: ["Articles", "Essays", "Emails", "Creative writing", "Long context"],
    priority: 5,
    defaultId: "anthropic/claude-sonnet-4",
    models: [
      { id: "meta-llama/llama-4-scout", name: "Llama 4", vendor: "Meta", source: "openrouter", tier: "primary", speed: "balanced" },
      { id: "qwen/qwen3-235b", name: "Qwen 3", vendor: "Alibaba", source: "openrouter", tier: "primary", speed: "balanced" },
      { id: "google/gemma-3-27b", name: "Gemma 3", vendor: "Google", source: "openrouter", tier: "primary", speed: "fast" },
      { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet", vendor: "Anthropic", source: "openrouter", tier: "premium", speed: "balanced" },
      { id: "openai/gpt-5", name: "GPT-5", vendor: "OpenAI", source: "lovable", tier: "premium", speed: "balanced" },
    ],
  },
  {
    key: "translation",
    label: "Translation",
    purpose: ["Multilingual tasks", "Translation"],
    priority: 4,
    defaultId: "qwen/qwen3-235b",
    models: [
      { id: "qwen/qwen3-235b", name: "Qwen 3", vendor: "Alibaba", source: "openrouter", tier: "primary", speed: "balanced" },
      { id: "google/gemma-3-27b", name: "Gemma 3", vendor: "Google", source: "openrouter", tier: "primary", speed: "fast" },
      { id: "meta-llama/llama-4-scout", name: "Llama 4", vendor: "Meta", source: "openrouter", tier: "primary", speed: "balanced" },
      { id: "cohere/aya-expanse-32b", name: "Aya Expanse", vendor: "Cohere", source: "openrouter", tier: "primary", speed: "balanced", notes: "100+ languages" },
    ],
  },
  {
    key: "research",
    label: "Research",
    purpose: ["Reports", "Deep analysis", "Fact gathering", "Used with Search/Browser/Deep Research MCPs"],
    priority: 5,
    defaultId: "deepseek/deepseek-r1",
    models: [
      { id: "deepseek/deepseek-r1", name: "DeepSeek R1", vendor: "DeepSeek", source: "openrouter", tier: "primary", speed: "slow" },
      { id: "google/gemini-2.5-pro", name: "Gemini", vendor: "Google", source: "lovable", tier: "premium", speed: "balanced" },
      { id: "anthropic/claude-sonnet-4", name: "Claude", vendor: "Anthropic", source: "openrouter", tier: "premium", speed: "balanced" },
      { id: "openai/gpt-5", name: "GPT", vendor: "OpenAI", source: "lovable", tier: "premium", speed: "balanced" },
    ],
  },
  {
    key: "image",
    label: "Image Generation",
    purpose: ["Photorealistic images", "Anime", "Logos", "UI concepts"],
    priority: 5,
    defaultId: "black-forest-labs/flux-1-dev",
    models: [
      { id: "black-forest-labs/flux-1-dev", name: "FLUX.1 Dev", vendor: "Black Forest Labs", source: "huggingface", tier: "primary", speed: "balanced", notes: "Default" },
      { id: "black-forest-labs/flux-schnell", name: "FLUX Schnell", vendor: "Black Forest Labs", source: "huggingface", tier: "primary", speed: "fast" },
      { id: "stabilityai/sdxl", name: "SDXL", vendor: "Stability AI", source: "huggingface", tier: "primary", speed: "balanced" },
      { id: "stabilityai/sdxl-turbo", name: "Stable Diffusion XL Turbo", vendor: "Stability AI", source: "huggingface", tier: "primary", speed: "fast" },
      { id: "rundiffusion/juggernaut-xl", name: "Juggernaut XL", vendor: "RunDiffusion", source: "huggingface", tier: "primary", speed: "balanced" },
    ],
  },
  {
    key: "video",
    label: "Video Generation",
    purpose: ["Text to Video", "Animation", "Marketing videos"],
    priority: 5,
    defaultId: "wan-ai/wan-2.1",
    models: [
      { id: "wan-ai/wan-2.1", name: "Wan 2.1", vendor: "Wan AI", source: "huggingface", tier: "primary", speed: "slow", notes: "Default" },
      { id: "thudm/cogvideox", name: "CogVideoX", vendor: "THUDM", source: "huggingface", tier: "primary", speed: "slow" },
      { id: "lightricks/ltx-video", name: "LTX Video", vendor: "Lightricks", source: "huggingface", tier: "primary", speed: "balanced" },
      { id: "genmo/mochi", name: "Mochi", vendor: "Genmo", source: "huggingface", tier: "primary", speed: "slow" },
      { id: "tencent/hunyuan-video", name: "Hunyuan Video", vendor: "Tencent", source: "huggingface", tier: "primary", speed: "slow" },
    ],
  },
  {
    key: "tts",
    label: "Text to Speech",
    purpose: ["Voice generation", "Narration", "AI assistants"],
    priority: 5,
    defaultId: "hexgrad/kokoro",
    models: [
      { id: "hexgrad/kokoro", name: "Kokoro", vendor: "Hexgrad", source: "huggingface", tier: "primary", speed: "fast", notes: "Default" },
      { id: "rhasspy/piper", name: "Piper", vendor: "Rhasspy", source: "huggingface", tier: "primary", speed: "fast" },
      { id: "coqui/xtts-v2", name: "XTTS-v2", vendor: "Coqui", source: "huggingface", tier: "primary", speed: "balanced", notes: "Voice cloning" },
      { id: "parler-tts/parler-tts-large", name: "Parler TTS", vendor: "Parler", source: "huggingface", tier: "primary", speed: "balanced" },
    ],
  },
  {
    key: "stt",
    label: "Speech to Text",
    purpose: ["Voice recognition", "Transcription", "Meetings"],
    priority: 5,
    defaultId: "openai/whisper-large-v3",
    models: [
      { id: "openai/whisper-large-v3", name: "Whisper Large V3", vendor: "OpenAI", source: "huggingface", tier: "primary", speed: "balanced", notes: "Default" },
      { id: "openai/whisper-large-v3-turbo", name: "Whisper Turbo", vendor: "OpenAI", source: "huggingface", tier: "primary", speed: "fast" },
      { id: "distil-whisper/distil-large-v3", name: "Distil Whisper", vendor: "Hugging Face", source: "huggingface", tier: "lightweight", speed: "fast" },
    ],
  },
  {
    key: "music",
    label: "Music Generation",
    purpose: ["Songs", "Background music", "Sound effects"],
    priority: 4,
    defaultId: "facebook/musicgen-large",
    models: [
      { id: "facebook/musicgen-large", name: "MusicGen", vendor: "Meta", source: "huggingface", tier: "primary", speed: "slow", notes: "Default" },
      { id: "stabilityai/stable-audio-open", name: "Stable Audio", vendor: "Stability AI", source: "huggingface", tier: "primary", speed: "balanced" },
      { id: "facebook/audiocraft", name: "AudioCraft", vendor: "Meta", source: "huggingface", tier: "primary", speed: "slow" },
    ],
  },
  {
    key: "three-d",
    label: "3D Generation",
    purpose: ["Text to 3D", "Image to 3D", "Game assets"],
    priority: 4,
    defaultId: "tencent/hunyuan3d-2",
    models: [
      { id: "tencent/hunyuan3d-2", name: "Hunyuan3D", vendor: "Tencent", source: "huggingface", tier: "primary", speed: "slow", notes: "Default" },
      { id: "stabilityai/triposr", name: "TripoSR", vendor: "Stability AI", source: "huggingface", tier: "primary", speed: "balanced" },
      { id: "microsoft/trellis", name: "TRELLIS", vendor: "Microsoft", source: "huggingface", tier: "primary", speed: "slow" },
      { id: "openai/shap-e", name: "Shap-E", vendor: "OpenAI", source: "huggingface", tier: "primary", speed: "balanced" },
    ],
  },
  {
    key: "ocr",
    label: "OCR",
    purpose: ["Read PDFs", "Extract text", "Notes"],
    priority: 5,
    defaultId: "paddlepaddle/paddleocr",
    models: [
      { id: "paddlepaddle/paddleocr", name: "PaddleOCR", vendor: "Baidu", source: "huggingface", tier: "primary", speed: "fast", notes: "Default" },
      { id: "tesseract/tesseract", name: "Tesseract OCR", vendor: "Google", source: "huggingface", tier: "primary", speed: "fast" },
      { id: "vikp/surya", name: "Surya OCR", vendor: "Vikp", source: "huggingface", tier: "primary", speed: "balanced" },
    ],
  },
  {
    key: "embeddings",
    label: "Embeddings",
    purpose: ["Memory search", "RAG", "Semantic search"],
    priority: 5,
    defaultId: "baai/bge-large-en-v1.5",
    models: [
      { id: "baai/bge-large-en-v1.5", name: "bge-large", vendor: "BAAI", source: "huggingface", tier: "primary", speed: "fast", notes: "Default" },
      { id: "thenlper/gte-large", name: "gte-large", vendor: "Alibaba", source: "huggingface", tier: "primary", speed: "fast" },
      { id: "intfloat/e5-large-v2", name: "e5-large", vendor: "Microsoft", source: "huggingface", tier: "primary", speed: "fast" },
    ],
  },
  {
    key: "reranking",
    label: "Reranking",
    purpose: ["Search ranking", "Best document selection"],
    priority: 5,
    defaultId: "baai/bge-reranker-v2-m3",
    models: [
      { id: "baai/bge-reranker-v2-m3", name: "bge-reranker-v2", vendor: "BAAI", source: "huggingface", tier: "primary", speed: "fast", notes: "Default" },
      { id: "cohere/rerank-3", name: "Cohere Rerank", vendor: "Cohere", source: "openrouter", tier: "premium", speed: "fast" },
    ],
  },
  {
    key: "lightweight",
    label: "Lightweight Models",
    purpose: ["Mobile devices", "Offline mode", "Fast inference"],
    priority: 4,
    defaultId: "microsoft/phi-4-mini",
    models: [
      { id: "microsoft/phi-4-mini", name: "Phi-4 Mini", vendor: "Microsoft", source: "huggingface", tier: "lightweight", speed: "fast" },
      { id: "google/gemma-3-4b", name: "Gemma 3 4B", vendor: "Google", source: "huggingface", tier: "lightweight", speed: "fast" },
      { id: "qwen/qwen3-4b", name: "Qwen 3 4B", vendor: "Alibaba", source: "huggingface", tier: "lightweight", speed: "fast" },
      { id: "tinyllama/tinyllama-1.1b", name: "TinyLlama", vendor: "TinyLlama", source: "huggingface", tier: "lightweight", speed: "fast" },
    ],
  },
  {
    key: "local",
    label: "Local Ollama Models",
    purpose: ["Offline AI", "Private AI", "No internet"],
    priority: 5,
    defaultId: "ollama/deepseek-r1",
    models: [
      { id: "ollama/deepseek-r1", name: "DeepSeek R1", vendor: "DeepSeek", source: "ollama", tier: "local", speed: "balanced" },
      { id: "ollama/qwen3", name: "Qwen 3", vendor: "Alibaba", source: "ollama", tier: "local", speed: "balanced" },
      { id: "ollama/gemma3", name: "Gemma 3", vendor: "Google", source: "ollama", tier: "local", speed: "fast" },
      { id: "ollama/llama3.3", name: "Llama 3.3", vendor: "Meta", source: "ollama", tier: "local", speed: "balanced" },
      { id: "ollama/phi4", name: "Phi-4", vendor: "Microsoft", source: "ollama", tier: "local", speed: "fast" },
      { id: "ollama/codellama", name: "Code Llama", vendor: "Meta", source: "ollama", tier: "local", speed: "balanced" },
    ],
  },
];

// Default routing — picks the best model for each task automatically.
export const DEFAULT_ROUTES: Record<ModelCategoryKey, string> = Object.fromEntries(
  CATALOG.map((c) => [c.key, c.defaultId]),
) as Record<ModelCategoryKey, string>;

export function findCategory(key: string): ModelCategory | undefined {
  return CATALOG.find((c) => c.key === key);
}

export function findModel(id: string): ModelEntry | undefined {
  for (const c of CATALOG) {
    const m = c.models.find((m) => m.id === id);
    if (m) return m;
  }
  return undefined;
}
