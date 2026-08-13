// IGON AI — learning engine server functions (Turso backed).
// Content reads are public; anything user-scoped requires a Supabase session
// and uses the verified context.userId.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { safeJson } from "./json";

const SubjectInput = z.object({ subject: z.string().min(1).max(40) });
const TopicInput = z.object({ topicId: z.string().min(1).max(80) });

// ───────────────────────────── content (public) ────────────────────────────

export const listSubjects = createServerFn({ method: "GET" }).handler(async () => {
  const { turso } = await import("@/integrations/turso/client.server");
  const { ensureLearnSchema } = await import("./schema.server");
  await ensureLearnSchema();
  const db = turso();
  const subs = await db.execute(
    `SELECT id, code, name, description FROM subjects ORDER BY order_no`,
  );
  const counts = await db.execute(
    `SELECT subject_id, COUNT(*) AS n FROM topics GROUP BY subject_id`,
  );
  const qcounts = await db.execute(
    `SELECT subject_id, COUNT(*) AS n FROM quizzes GROUP BY subject_id`,
  );
  const byId = new Map(counts.rows.map((r) => [String(r.subject_id), Number(r.n)]));
  const byQ = new Map(qcounts.rows.map((r) => [String(r.subject_id), Number(r.n)]));
  return subs.rows.map((r) => ({
    id: String(r.id),
    code: String(r.code),
    name: String(r.name),
    description: r.description ? String(r.description) : "",
    topics: byId.get(String(r.id)) ?? 0,
    questions: byQ.get(String(r.id)) ?? 0,
  }));
});

export const getSyllabus = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => SubjectInput.parse(d))
  .handler(async ({ data }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    const db = turso();
    const sub = await db.execute({
      sql: `SELECT id, code, name, description FROM subjects WHERE id = ?`,
      args: [data.subject],
    });
    if (sub.rows.length === 0) return null;
    const units = await db.execute({
      sql: `SELECT id, title, summary FROM units WHERE subject_id = ? ORDER BY order_no`,
      args: [data.subject],
    });
    const lessons = await db.execute({
      sql: `SELECT id, unit_id, title, outcomes FROM lessons WHERE subject_id = ? ORDER BY order_no`,
      args: [data.subject],
    });
    const topics = await db.execute({
      sql: `SELECT id, lesson_id, title FROM topics WHERE subject_id = ? ORDER BY order_no`,
      args: [data.subject],
    });
    const s = sub.rows[0];
    return {
      subject: {
        id: String(s.id),
        code: String(s.code),
        name: String(s.name),
        description: s.description ? String(s.description) : "",
      },
      units: units.rows.map((u) => ({
        id: String(u.id),
        title: String(u.title),
        summary: u.summary ? String(u.summary) : "",
        lessons: lessons.rows
          .filter((l) => String(l.unit_id) === String(u.id))
          .map((l) => ({
            id: String(l.id),
            title: String(l.title),
            outcomes: safeJson<string[]>(l.outcomes, []),
            topics: topics.rows
              .filter((t) => String(t.lesson_id) === String(l.id))
              .map((t) => ({ id: String(t.id), title: String(t.title) })),
          })),
      })),
    };
  });

export const getTopic = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => TopicInput.parse(d))
  .handler(async ({ data }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    const db = turso();
    const t = await db.execute({
      sql: `SELECT t.id, t.title, t.body_md, t.definitions, t.formulas, t.practicals,
                   t.subject_id, t.lesson_id,
                   l.title AS lesson_title, u.id AS unit_id, u.title AS unit_title,
                   s.name AS subject_name, s.code AS subject_code
            FROM topics t
            JOIN lessons l ON l.id = t.lesson_id
            JOIN units u ON u.id = l.unit_id
            JOIN subjects s ON s.id = t.subject_id
            WHERE t.id = ?`,
      args: [data.topicId],
    });
    if (t.rows.length === 0) return null;
    const r = t.rows[0];
    const cards = await db.execute({
      sql: `SELECT id, front, back FROM flashcards WHERE topic_id = ?`,
      args: [data.topicId],
    });
    const quizCount = await db.execute({
      sql: `SELECT COUNT(*) AS n FROM quizzes WHERE topic_id = ?`,
      args: [data.topicId],
    });
    const siblings = await db.execute({
      sql: `SELECT id, title FROM topics WHERE lesson_id = ? ORDER BY order_no`,
      args: [String(r.lesson_id)],
    });
    return {
      id: String(r.id),
      title: String(r.title),
      body: r.body_md ? String(r.body_md) : "",
      definitions: safeJson<{ term: string; meaning: string }[]>(r.definitions, []),
      formulas: safeJson<{ name: string; expr: string }[]>(r.formulas, []),
      practicals: safeJson<string[]>(r.practicals, []),
      subjectId: String(r.subject_id),
      subjectName: String(r.subject_name),
      subjectCode: String(r.subject_code),
      unitTitle: String(r.unit_title),
      lessonTitle: String(r.lesson_title),
      cards: cards.rows.map((c) => ({ id: String(c.id), front: String(c.front), back: String(c.back) })),
      quizCount: Number(quizCount.rows[0]?.n ?? 0),
      siblings: siblings.rows.map((x) => ({ id: String(x.id), title: String(x.title) })),
    };
  });

const PapersInput = z.object({ subject: z.string().min(1).max(40) });

export const getPapers = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => PapersInput.parse(d))
  .handler(async ({ data }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    const db = turso();
    const past = await db.execute({
      sql: `SELECT id, year, paper, url FROM past_papers WHERE subject_id = ? ORDER BY year DESC`,
      args: [data.subject],
    });
    const model = await db.execute({
      sql: `SELECT id, title, url FROM model_papers WHERE subject_id = ?`,
      args: [data.subject],
    });
    return {
      past: past.rows.map((r) => ({ id: String(r.id), year: Number(r.year), paper: String(r.paper), url: String(r.url) })),
      model: model.rows.map((r) => ({ id: String(r.id), title: String(r.title), url: String(r.url) })),
    };
  });

// ───────────────────────────── quizzes ─────────────────────────────────────

const QuizInput = z.object({
  topicId: z.string().max(80).optional(),
  subject: z.string().max(40).optional(),
  count: z.number().int().min(1).max(50).default(5),
});

export const getQuiz = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => QuizInput.parse(d))
  .handler(async ({ data }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    const db = turso();
    const where = data.topicId ? `topic_id = ?` : data.subject ? `subject_id = ?` : `1=1`;
    const arg = data.topicId ?? data.subject;
    const res = await db.execute({
      sql: `SELECT id, topic_id, question, options, difficulty FROM quizzes
            WHERE ${where} ORDER BY RANDOM() LIMIT ?`,
      args: arg ? [arg, data.count] : [data.count],
    });
    // Answers are never sent to the client — grading happens in submitQuiz.
    return res.rows.map((r) => ({
      id: String(r.id),
      topicId: String(r.topic_id),
      question: String(r.question),
      options: safeJson<string[]>(r.options, []),
      difficulty: Number(r.difficulty),
    }));
  });

const SubmitInput = z.object({
  answers: z.array(z.object({ id: z.string().max(80), choice: z.string().max(500) })).min(1).max(60),
  subject: z.string().max(40).optional(),
  topicId: z.string().max(80).optional(),
  seconds: z.number().int().min(0).max(60 * 60 * 6).default(0),
  mode: z.enum(["quiz", "exam", "revision"]).default("quiz"),
});

export const submitQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SubmitInput.parse(d))
  .handler(async ({ data, context }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    const db = turso();
    const ids = data.answers.map((a) => a.id);
    const placeholders = ids.map(() => "?").join(",");
    const res = await db.execute({
      sql: `SELECT id, topic_id, subject_id, question, options, answer, explanation FROM quizzes WHERE id IN (${placeholders})`,
      args: ids,
    });
    const byId = new Map(res.rows.map((r) => [String(r.id), r]));

    let score = 0;
    const perTopic = new Map<string, { right: number; total: number; subject: string }>();
    const results = data.answers.map((a) => {
      const row = byId.get(a.id);
      const correct = row ? String(row.answer) === a.choice : false;
      if (correct) score += 1;
      if (row) {
        const tid = String(row.topic_id);
        const agg = perTopic.get(tid) ?? { right: 0, total: 0, subject: String(row.subject_id) };
        agg.total += 1;
        if (correct) agg.right += 1;
        perTopic.set(tid, agg);
      }
      return {
        id: a.id,
        question: row ? String(row.question) : "",
        options: row ? safeJson<string[]>(row.options, []) : [],
        chosen: a.choice,
        answer: row ? String(row.answer) : "",
        correct,
        explanation: row?.explanation ? String(row.explanation) : "",
        topicId: row ? String(row.topic_id) : "",
      };
    });

    for (const [topicId, agg] of perTopic) {
      const pct = Math.round((agg.right / agg.total) * 100);
      await db.execute({
        sql: `INSERT INTO topic_progress (user_id, topic_id, subject_id, status, mastery, attempts, last_seen_at)
              VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
              ON CONFLICT(user_id, topic_id) DO UPDATE SET
                mastery = CAST((topic_progress.mastery * topic_progress.attempts + ?) / (topic_progress.attempts + 1) AS INTEGER),
                attempts = topic_progress.attempts + 1,
                status = CASE WHEN ? >= 80 THEN 'mastered' ELSE 'practising' END,
                last_seen_at = CURRENT_TIMESTAMP`,
        args: [context.userId, topicId, agg.subject, pct >= 80 ? "mastered" : "practising", pct, pct, pct],
      });
    }

    await db.execute({
      sql: `INSERT INTO study_sessions (user_id, subject_id, topic_id, mode, seconds, score, total)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        context.userId,
        data.subject ?? [...perTopic.values()][0]?.subject ?? null,
        data.topicId ?? null,
        data.mode,
        data.seconds,
        score,
        data.answers.length,
      ],
    });

    return { score, total: data.answers.length, results };
  });

// ───────────────────────────── progress & notes ────────────────────────────

export const getMyProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ subject: z.string().max(40).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    const db = turso();
    const res = data.subject
      ? await db.execute({
          sql: `SELECT topic_id, subject_id, status, mastery, attempts, last_seen_at FROM topic_progress WHERE user_id = ? AND subject_id = ?`,
          args: [context.userId, data.subject],
        })
      : await db.execute({
          sql: `SELECT topic_id, subject_id, status, mastery, attempts, last_seen_at FROM topic_progress WHERE user_id = ?`,
          args: [context.userId],
        });
    return res.rows.map((r) => ({
      topicId: String(r.topic_id),
      subjectId: String(r.subject_id),
      status: String(r.status),
      mastery: Number(r.mastery),
      attempts: Number(r.attempts),
      lastSeenAt: String(r.last_seen_at),
    }));
  });

const MarkInput = z.object({
  topicId: z.string().min(1).max(80),
  status: z.enum(["started", "practising", "completed", "mastered"]),
});

export const markTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => MarkInput.parse(d))
  .handler(async ({ data, context }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    const db = turso();
    const t = await db.execute({ sql: `SELECT subject_id FROM topics WHERE id = ?`, args: [data.topicId] });
    if (t.rows.length === 0) throw new Error("Unknown topic");
    await db.execute({
      sql: `INSERT INTO topic_progress (user_id, topic_id, subject_id, status, mastery, last_seen_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, topic_id) DO UPDATE SET
              status = excluded.status,
              mastery = MAX(topic_progress.mastery, excluded.mastery),
              last_seen_at = CURRENT_TIMESTAMP`,
      args: [
        context.userId,
        data.topicId,
        String(t.rows[0].subject_id),
        data.status,
        data.status === "mastered" ? 90 : data.status === "completed" ? 60 : 20,
      ],
    });
    return { ok: true };
  });

export const getNote = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TopicInput.parse(d))
  .handler(async ({ data, context }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    const res = await turso().execute({
      sql: `SELECT body_md, updated_at FROM student_notes WHERE user_id = ? AND topic_id = ?`,
      args: [context.userId, data.topicId],
    });
    const r = res.rows[0];
    return { body: r ? String(r.body_md) : "", updatedAt: r ? String(r.updated_at) : null };
  });

const NoteInput = z.object({ topicId: z.string().min(1).max(80), body: z.string().max(20000) });

export const saveNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => NoteInput.parse(d))
  .handler(async ({ data, context }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    await turso().execute({
      sql: `INSERT INTO student_notes (user_id, topic_id, body_md, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, topic_id) DO UPDATE SET body_md = excluded.body_md, updated_at = CURRENT_TIMESTAMP`,
      args: [context.userId, data.topicId, data.body],
    });
    return { ok: true };
  });

const ReviewInput = z.object({
  topicId: z.string().min(1).max(80),
  cardId: z.string().min(1).max(80),
  remembered: z.boolean(),
});

export const reviewCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ReviewInput.parse(d))
  .handler(async ({ data, context }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    await turso().execute({
      sql: `INSERT INTO revision_history (user_id, topic_id, card_id, remembered) VALUES (?, ?, ?, ?)`,
      args: [context.userId, data.topicId, data.cardId, data.remembered ? 1 : 0],
    });
    return { ok: true };
  });

const ResourceInput = z.object({
  topicId: z.string().min(1).max(80),
  kind: z.enum(["link", "video", "pdf", "note"]).default("link"),
  title: z.string().max(200).optional(),
  url: z.string().url().max(2000),
});

export const addResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ResourceInput.parse(d))
  .handler(async ({ data, context }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    await turso().execute({
      sql: `INSERT INTO resources (topic_id, user_id, kind, title, url) VALUES (?, ?, ?, ?, ?)`,
      args: [data.topicId, context.userId, data.kind, data.title ?? null, data.url],
    });
    return { ok: true };
  });

export const listResources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TopicInput.parse(d))
  .handler(async ({ data, context }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    const res = await turso().execute({
      sql: `SELECT id, kind, title, url, created_at FROM resources WHERE topic_id = ? AND user_id = ? ORDER BY created_at DESC`,
      args: [data.topicId, context.userId],
    });
    return res.rows.map((r) => ({
      id: String(r.id),
      kind: String(r.kind),
      title: r.title ? String(r.title) : String(r.url),
      url: String(r.url),
      createdAt: String(r.created_at),
    }));
  });

// ───────────────────────────── analytics & plan ────────────────────────────

export const getLearnAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    const db = turso();
    const totals = await db.execute(`SELECT subject_id, COUNT(*) AS n FROM topics GROUP BY subject_id`);
    const subjects = await db.execute(`SELECT id, code, name FROM subjects ORDER BY order_no`);
    const prog = await db.execute({
      sql: `SELECT subject_id, topic_id, status, mastery FROM topic_progress WHERE user_id = ?`,
      args: [context.userId],
    });
    const sessions = await db.execute({
      sql: `SELECT subject_id, mode, score, total, seconds, created_at FROM study_sessions
            WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
      args: [context.userId],
    });
    const weak = await db.execute({
      sql: `SELECT p.topic_id, p.mastery, t.title, t.subject_id FROM topic_progress p
            JOIN topics t ON t.id = p.topic_id
            WHERE p.user_id = ? AND p.mastery < 70 ORDER BY p.mastery ASC LIMIT 8`,
      args: [context.userId],
    });

    const totalMap = new Map(totals.rows.map((r) => [String(r.subject_id), Number(r.n)]));
    const bySubject = subjects.rows.map((s) => {
      const id = String(s.id);
      const rows = prog.rows.filter((p) => String(p.subject_id) === id);
      const total = totalMap.get(id) ?? 0;
      const covered = rows.length;
      const avgMastery = rows.length
        ? Math.round(rows.reduce((a, r) => a + Number(r.mastery), 0) / rows.length)
        : 0;
      const coverage = total ? Math.round((covered / total) * 100) : 0;
      const readiness = Math.round(coverage * 0.5 + avgMastery * 0.5);
      return { id, code: String(s.code), name: String(s.name), total, covered, coverage, avgMastery, readiness };
    });

    const totalSeconds = sessions.rows.reduce((a, r) => a + Number(r.seconds ?? 0), 0);
    const answered = sessions.rows.reduce((a, r) => a + Number(r.total ?? 0), 0);
    const correct = sessions.rows.reduce((a, r) => a + Number(r.score ?? 0), 0);

    return {
      bySubject,
      overallReadiness: bySubject.length
        ? Math.round(bySubject.reduce((a, s) => a + s.readiness, 0) / bySubject.length)
        : 0,
      minutesStudied: Math.round(totalSeconds / 60),
      accuracy: answered ? Math.round((correct / answered) * 100) : 0,
      sessions: sessions.rows.map((r) => ({
        subjectId: r.subject_id ? String(r.subject_id) : "",
        mode: String(r.mode),
        score: Number(r.score),
        total: Number(r.total),
        createdAt: String(r.created_at),
      })),
      weakTopics: weak.rows.map((r) => ({
        topicId: String(r.topic_id),
        title: String(r.title),
        subjectId: String(r.subject_id),
        mastery: Number(r.mastery),
      })),
    };
  });

const PlanInput = z.object({ days: z.number().int().min(3).max(30).default(7) });

export const buildStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PlanInput.parse(d))
  .handler(async ({ data, context }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureLearnSchema } = await import("./schema.server");
    await ensureLearnSchema();
    const db = turso();
    // Weakest-first: unseen topics, then low mastery.
    const rows = await db.execute({
      sql: `SELECT t.id, t.title, t.subject_id, s.code, COALESCE(p.mastery, -1) AS mastery
            FROM topics t
            JOIN subjects s ON s.id = t.subject_id
            LEFT JOIN topic_progress p ON p.topic_id = t.id AND p.user_id = ?
            ORDER BY mastery ASC, t.subject_id, t.order_no`,
      args: [context.userId],
    });
    const items = rows.rows.map((r) => ({
      topicId: String(r.id),
      title: String(r.title),
      subject: String(r.code),
      mastery: Number(r.mastery),
    }));
    const perDay = Math.max(1, Math.ceil(items.length / data.days / 2));
    const plan = Array.from({ length: data.days }, (_, i) => ({
      day: i + 1,
      focus: items.slice(i * perDay, i * perDay + perDay),
    })).filter((d) => d.focus.length > 0);
    return { days: data.days, perDay, plan };
  });
