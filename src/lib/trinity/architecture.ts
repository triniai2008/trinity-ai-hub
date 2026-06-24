// Trinity 1.0 — Architecture map.
// Pure metadata consumed by /models/architecture and the router/agent layer.

export type RoleKey =
  | "router"
  | "judge"
  | "consensus"
  | "memory"
  | "preference"
  | "mcp-router"
  | "tool-orchestrator";

export const TRINITY_ROLES: { key: RoleKey; label: string; description: string }[] = [
  { key: "router", label: "AI Router", description: "Picks the best model for every task." },
  { key: "judge", label: "Judge Agent", description: "Scores and ranks multi-model answers." },
  { key: "consensus", label: "Consensus Engine", description: "Merges top answers into one." },
  { key: "memory", label: "Memory Engine", description: "Long-term context, RAG and recall." },
  { key: "preference", label: "Preference Learner", description: "Learns how each user thinks." },
  { key: "mcp-router", label: "MCP Router", description: "Chooses the right external tool." },
  { key: "tool-orchestrator", label: "Tool Orchestrator", description: "Sequences tools end-to-end." },
];

export type ProviderKey =
  | "openrouter"
  | "huggingface"
  | "ollama"
  | "user-key"
  | "openai"
  | "anthropic"
  | "google"
  | "groq";

export type ProviderTier = "primary" | "secondary" | "local" | "custom" | "supported";

export const PROVIDERS: {
  key: ProviderKey;
  label: string;
  tier: ProviderTier;
  description: string;
}[] = [
  { key: "openrouter", label: "OpenRouter", tier: "primary", description: "Default gateway for cloud LLMs." },
  { key: "huggingface", label: "Hugging Face", tier: "secondary", description: "Open-weight & multimodal models." },
  { key: "ollama", label: "Ollama", tier: "local", description: "Local, private, offline-first models." },
  { key: "user-key", label: "User API Keys", tier: "custom", description: "Bring your own credentials." },
  { key: "openai", label: "OpenAI", tier: "supported", description: "GPT family." },
  { key: "anthropic", label: "Anthropic", tier: "supported", description: "Claude family." },
  { key: "google", label: "Google", tier: "supported", description: "Gemini family." },
  { key: "groq", label: "Groq", tier: "supported", description: "Ultra-fast inference." },
];

export type ThinkingMode = {
  key: "normal" | "medium" | "high";
  label: string;
  purpose: string;
  flow: string[];
  models: string; // e.g. "1", "3–5", "many"
};

export const THINKING_MODES: ThinkingMode[] = [
  {
    key: "normal",
    label: "Normal",
    purpose: "Speed",
    models: "1",
    flow: ["User", "One Model", "Response"],
  },
  {
    key: "medium",
    label: "Medium",
    purpose: "Balanced quality",
    models: "3–5",
    flow: ["User", "3–5 Models", "Judge Agent", "Best Answer"],
  },
  {
    key: "high",
    label: "High",
    purpose: "Maximum quality",
    models: "many",
    flow: [
      "User",
      "Multiple Models",
      "Specialized Agents",
      "Judge Agent",
      "Consensus Engine",
      "Best Answer",
    ],
  },
];

export type RoutingTaskKey =
  | "chat"
  | "coding"
  | "math"
  | "writing"
  | "research"
  | "image"
  | "video"
  | "music"
  | "voice"
  | "stt"
  | "three-d";

export const ROUTING: {
  task: RoutingTaskKey;
  label: string;
  default: string;
  secondary?: string;
  premium?: string;
  tools?: string[];
}[] = [
  { task: "chat", label: "Chat", default: "DeepSeek V3", premium: "GPT · Claude · Gemini" },
  { task: "coding", label: "Coding", default: "DeepSeek Coder", secondary: "Qwen Coder", premium: "GPT" },
  { task: "math", label: "Math", default: "DeepSeek R1", secondary: "Qwen", premium: "GPT" },
  { task: "writing", label: "Writing", default: "Llama", secondary: "Qwen", premium: "Claude" },
  {
    task: "research",
    label: "Research",
    default: "DeepSeek · Gemini · Claude",
    tools: ["Browser Agent", "Search MCP", "Deep Research MCP"],
  },
  { task: "image", label: "Image", default: "FLUX" },
  { task: "video", label: "Video", default: "Wan" },
  { task: "music", label: "Music", default: "MusicGen" },
  { task: "voice", label: "Voice", default: "Kokoro" },
  { task: "stt", label: "Speech to Text", default: "Whisper" },
  { task: "three-d", label: "3D", default: "Hunyuan3D" },
];

export const FALLBACK_CHAIN = [
  "User API Key",
  "OpenRouter",
  "Hugging Face",
  "Ollama",
  "Error Handler",
];

export const MCP_TOOLS: { name: string; purpose: string; perms: ("read" | "write")[] }[] = [
  { name: "Canva MCP", purpose: "Design & editable templates", perms: ["read", "write"] },
  { name: "GitHub MCP", purpose: "Code repositories", perms: ["read", "write"] },
  { name: "Figma MCP", purpose: "UI/UX files", perms: ["read"] },
  { name: "Google Drive MCP", purpose: "Files & docs", perms: ["read", "write"] },
  { name: "Search MCP", purpose: "Web search", perms: ["read"] },
  { name: "Deep Research MCP", purpose: "Multi-source reports", perms: ["read"] },
  { name: "Browser MCP", purpose: "Live web browsing", perms: ["read"] },
  { name: "Custom MCP", purpose: "Bring your own", perms: ["read", "write"] },
];

export const DEEP_RESEARCH_FLOW = [
  "User Question",
  "Search MCP",
  "Browser MCP",
  "Research Agent",
  "Judge Agent",
  "Professional Report",
];

export const RAG_FLOW = [
  "Question",
  "Embedding",
  "Vector Search",
  "Relevant Documents",
  "Model",
  "Answer",
];

export const RAG_STACK = {
  embeddings: ["BGE Large", "GTE Large", "E5 Large"],
  vectorDb: ["ChromaDB", "Qdrant"],
  searches: [
    "Semantic Search",
    "Memory Search",
    "Document Search",
    "PDF Search",
    "Conversation Retrieval",
  ],
};

export const CONSENSUS_MODELS = [
  "GPT",
  "Claude",
  "Gemini",
  "DeepSeek",
  "Qwen",
  "Gemma",
  "Llama",
];

export const CONSENSUS_OPTIONS = ["Show Best Answer", "Show Top 2", "Show All Responses"];
