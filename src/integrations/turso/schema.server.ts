// Trinity-specific schema for Turso. Idempotent: safe to call on every cold start.
// Tables that ALREADY live in Lovable Cloud Supabase (chats, messages, profiles, user_roles)
// are NOT duplicated here. Turso owns the Trinity brain layer.
import { turso } from "./client.server";

const STATEMENTS: string[] = [
  // memories - long-term user memory engine
  `CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    importance INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id, importance DESC)`,

  // usage_logs - every model call
  `CREATE TABLE IF NOT EXISTS usage_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT,
    chat_id TEXT,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    mode TEXT,
    task TEXT,
    tokens_in INTEGER,
    tokens_out INTEGER,
    latency_ms INTEGER,
    success INTEGER NOT NULL DEFAULT 1,
    error TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_usage_user_time ON usage_logs(user_id, created_at DESC)`,

  // feedback - thumbs up/down learning signal
  `CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    chat_id TEXT,
    question TEXT,
    answer TEXT NOT NULL,
    model TEXT,
    liked INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  // training_dataset - approved (question, answer) pairs
  `CREATE TABLE IF NOT EXISTS training_dataset (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    model TEXT,
    approved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  // moderation_logs
  `CREATE TABLE IF NOT EXISTS moderation_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT,
    content TEXT NOT NULL,
    flagged INTEGER NOT NULL DEFAULT 0,
    reason TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  // mcp_connections - per-user MCP server registry
  `CREATE TABLE IF NOT EXISTS mcp_connections (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    transport TEXT NOT NULL DEFAULT 'http',
    state TEXT NOT NULL DEFAULT 'ready',
    auth_data TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  // settings - user preferences blob
  `CREATE TABLE IF NOT EXISTS settings (
    user_id TEXT PRIMARY KEY,
    data TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  // models - enabled/disabled + temperature overrides per user
  `CREATE TABLE IF NOT EXISTS user_models (
    user_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    temperature REAL,
    system_prompt TEXT,
    PRIMARY KEY (user_id, model_id)
  )`,

  // api_keys - encrypted user-supplied keys (BYOK)
  `CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider)
  )`,

  // notifications - in-app notifications
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    type TEXT NOT NULL DEFAULT 'info',
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read, created_at DESC)`,
];

let _bootstrapped: Promise<void> | undefined;

export function ensureTursoSchema(): Promise<void> {
  if (_bootstrapped) return _bootstrapped;
  _bootstrapped = (async () => {
    const db = turso();
    for (const sql of STATEMENTS) {
      await db.execute(sql);
    }
  })().catch((err) => {
    _bootstrapped = undefined; // allow retry on next call
    throw err;
  });
  return _bootstrapped;
}
