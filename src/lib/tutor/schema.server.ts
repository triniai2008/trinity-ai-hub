// Engineering Technology tutor workflow — Turso schema.
// Additive and idempotent; safe to run on every cold start.
import { turso } from "@/integrations/turso/client.server";

const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS tutor_documents (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'upload',
    chars INTEGER NOT NULL DEFAULT 0,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_tutor_docs_user ON tutor_documents(user_id, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS tutor_analyses (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    subject TEXT,
    topic TEXT,
    summary TEXT,
    explanation TEXT,
    notes TEXT,
    exam_points TEXT,
    concepts TEXT,
    model TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_tutor_analyses_doc ON tutor_analyses(document_id)`,

  `CREATE TABLE IF NOT EXISTS tutor_quizzes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    questions TEXT NOT NULL,
    model TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_tutor_quizzes_doc ON tutor_quizzes(document_id, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS tutor_attempts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    quiz_id TEXT NOT NULL,
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    answers TEXT NOT NULL,
    results TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    weak_areas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_tutor_attempts_user ON tutor_attempts(user_id, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS tutor_plans (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    document_id TEXT,
    attempt_id TEXT,
    plan TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_tutor_plans_user ON tutor_plans(user_id, created_at DESC)`,
];

let _ready: Promise<void> | undefined;

export function ensureTutorSchema(): Promise<void> {
  if (_ready) return _ready;
  _ready = (async () => {
    const db = turso();
    for (const sql of STATEMENTS) await db.execute(sql);
  })().catch((err) => {
    _ready = undefined;
    throw err;
  });
  return _ready;
}
