// IGON AI — learning-engine schema on Turso.
// Additive to the Trinity schema; safe to run on every cold start.
import { turso } from "@/integrations/turso/client.server";

const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    stream TEXT NOT NULL DEFAULT 'technology',
    order_no INTEGER NOT NULL DEFAULT 0,
    lang TEXT NOT NULL DEFAULT 'en'
  )`,

  `CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    order_no INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    summary TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_units_subject ON units(subject_id, order_no)`,

  `CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    order_no INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    outcomes TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit_id, order_no)`,

  `CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    order_no INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    body_md TEXT,
    definitions TEXT,
    formulas TEXT,
    practicals TEXT,
    lang TEXT NOT NULL DEFAULT 'en'
  )`,
  `CREATE INDEX IF NOT EXISTS idx_topics_lesson ON topics(lesson_id, order_no)`,

  `CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'mcq',
    question TEXT NOT NULL,
    options TEXT,
    answer TEXT NOT NULL,
    explanation TEXT,
    difficulty INTEGER NOT NULL DEFAULT 2
  )`,
  `CREATE INDEX IF NOT EXISTS idx_quizzes_topic ON quizzes(topic_id)`,
  `CREATE INDEX IF NOT EXISTS idx_quizzes_subject ON quizzes(subject_id, kind)`,

  `CREATE TABLE IF NOT EXISTS flashcards (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON flashcards(topic_id)`,

  `CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'youtube',
    url TEXT NOT NULL,
    title TEXT,
    lang TEXT NOT NULL DEFAULT 'en'
  )`,

  `CREATE TABLE IF NOT EXISTS past_papers (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    paper TEXT NOT NULL,
    url TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS model_papers (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    topic_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'link',
    title TEXT,
    url TEXT NOT NULL,
    mime TEXT,
    size_bytes INTEGER,
    lang TEXT NOT NULL DEFAULT 'en',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_resources_topic ON resources(topic_id, user_id)`,

  `CREATE TABLE IF NOT EXISTS student_notes (
    user_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    body_md TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, topic_id)
  )`,

  `CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    subject_id TEXT,
    topic_id TEXT,
    mode TEXT NOT NULL DEFAULT 'quiz',
    seconds INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user ON study_sessions(user_id, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS revision_history (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    remembered INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_revision_user ON revision_history(user_id, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS topic_progress (
    user_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'started',
    mastery INTEGER NOT NULL DEFAULT 0,
    attempts INTEGER NOT NULL DEFAULT 0,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, topic_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_progress_user ON topic_progress(user_id, last_seen_at DESC)`,

  `CREATE TABLE IF NOT EXISTS study_plans (
    user_id TEXT NOT NULL,
    range_key TEXT NOT NULL,
    day TEXT NOT NULL,
    body_md TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, range_key, day)
  )`,
];

let _ready: Promise<void> | undefined;

export function ensureLearnSchema(): Promise<void> {
  if (_ready) return _ready;
  _ready = (async () => {
    const db = turso();
    for (const sql of STATEMENTS) await db.execute(sql);
    const { seedLearnContent } = await import("./seed.server");
    await seedLearnContent();
  })().catch((err) => {
    _ready = undefined;
    throw err;
  });
  return _ready;
}
