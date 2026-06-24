// Trinity 1.0 — Backend architecture (data, not infra).
// Source of truth for /admin/architecture visualization.

export const STACK = [
  { layer: "Frontend", value: "React · TypeScript · Tailwind · shadcn/ui" },
  { layer: "Framework", value: "TanStack Start v1" },
  { layer: "Runtime", value: "Cloudflare Workers" },
  { layer: "Auth", value: "Supabase Auth (Lovable Cloud)" },
  { layer: "Primary DB", value: "Postgres (Lovable Cloud) — target: Turso edge replicas" },
  { layer: "Cache", value: "IndexedDB · LocalStorage" },
  { layer: "Backup", value: "Google Sheets (analytics, feedback, training)" },
  { layer: "Storage", value: "Supabase Storage" },
  { layer: "AI", value: "OpenRouter · Hugging Face · Ollama · User keys" },
  { layer: "Deploy", value: "Cloudflare Pages · GitHub" },
];

export const TABLES: { name: string; cols: string[]; scope: "user" | "global" | "admin" }[] = [
  { name: "users (auth.users)", cols: ["id", "email", "created_at"], scope: "global" },
  { name: "profiles", cols: ["id", "display_name", "avatar_url", "bio", "theme", "language", "timezone", "subscription", "daily_limit"], scope: "user" },
  { name: "user_roles", cols: ["user_id", "role"], scope: "admin" },
  { name: "chats", cols: ["id", "user_id", "title", "model", "pinned", "archived"], scope: "user" },
  { name: "messages", cols: ["id", "chat_id", "role", "content", "model", "tokens"], scope: "user" },
  { name: "memories", cols: ["id", "user_id", "key", "value", "importance"], scope: "user" },
  { name: "feedback", cols: ["id", "user_id", "message_id", "liked", "disliked", "comment"], scope: "user" },
  { name: "projects", cols: ["id", "user_id", "name", "description"], scope: "user" },
  { name: "workspace_files", cols: ["id", "user_id", "project_id", "folder", "file_name", "url"], scope: "user" },
  { name: "notifications", cols: ["id", "user_id", "title", "message", "read"], scope: "user" },
  { name: "agents", cols: ["id", "name", "enabled"], scope: "global" },
  { name: "models", cols: ["id", "name", "provider", "enabled", "premium"], scope: "global" },
  { name: "api_keys", cols: ["id", "user_id", "provider", "encrypted_key", "label"], scope: "user" },
  { name: "usage_logs", cols: ["user_id", "day", "messages", "tokens", "images", "videos", "audio", "three_d_models"], scope: "user" },
  { name: "moderation_logs", cols: ["id", "user_id", "message", "category", "risk_level", "action"], scope: "admin" },
  { name: "training_dataset", cols: ["id", "question", "answer", "approved"], scope: "admin" },
  { name: "mcp_connections", cols: ["id", "user_id", "name", "enabled", "permissions"], scope: "user" },
];

export const ROLES = [
  { key: "user", label: "User", desc: "Standard member, 100/day default." },
  { key: "vip", label: "VIP", desc: "Custom limits per email." },
  { key: "moderator", label: "Moderator", desc: "Reviews flagged content." },
  { key: "admin", label: "Admin", desc: "Full admin panel access." },
  { key: "super_admin", label: "Super Admin", desc: "System-level control." },
];

export const AUTH_METHODS = ["Email", "Google", "GitHub", "OTP"];

export const STORAGE_FLOW = [
  "User",
  "Turso DB (primary)",
  "Google Sheets (backup)",
  "IndexedDB (offline)",
  "LocalStorage (cache)",
];

export const SYNC_FEATURES = [
  "Cloud Sync",
  "Offline Mode",
  "Background Sync",
  "Auto Save",
  "Export",
  "Import",
  "Backup / Restore",
];

export const FALLBACK_FLOW = [
  "User API Key",
  "OpenRouter",
  "Hugging Face",
  "Ollama",
  "Cache",
  "Error Handler",
];

export const LIMITS = [
  { audience: "@trinitycollege.lk", tiers: ["Unlimited", "100/day", "1000/day", "Custom"] },
  { audience: "Other users", tiers: ["100/day", "1000/day", "Custom"] },
  { audience: "VIP", tiers: ["Specific emails", "Unlimited", "Custom limits"] },
];

export const MODERATION = {
  detect: ["Explicit content", "Threats", "Harassment", "Spam", "Hate speech", "Scams"],
  actions: ["Warning", "Temporary suspension", "Permanent ban", "Delete account", "Notify admin", "Save log"],
};

export const ANALYTICS_METRICS = [
  "Daily usage",
  "Weekly usage",
  "Monthly usage",
  "Token usage",
  "Top models",
  "Favorite agents",
  "Images generated",
  "Videos generated",
  "Audio generated",
  "Active users",
];

export const ADMIN_PANEL = [
  "Dashboard", "Users", "Roles", "Limits", "Analytics", "Chat Logs",
  "Models", "MCP Hub", "API Keys", "Prompt Library", "Moderation",
  "Broadcast Center", "Reports", "Usage Logs", "Feedback",
  "Training Dataset", "Security Logs", "Error Logs",
  "Performance Monitor", "Backups", "System Health",
];

export const SECURITY = [
  "Encrypted API keys",
  "Session management",
  "Role-based access control",
  "Rate limiting",
  "Input validation",
  "Audit logs",
];

export const ERROR_HANDLING = [
  "Retry system",
  "Fallback providers",
  "Graceful degradation",
  "Error boundaries",
  "Background recovery",
  "Cache recovery",
  "Logs",
];

export const SCALABILITY = {
  initial: "1,000 users",
  future: "10,000+",
  techniques: ["Caching", "Cloudflare Workers", "Lazy loading", "Background jobs"],
};
