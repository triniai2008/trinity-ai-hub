// Engineering Technology tutor workflow — server functions.
// Every handler requires a Supabase session and scopes rows to context.userId.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Mode = z.enum(["normal", "medium", "high"]).default("medium");

function parse<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function db() {
  const { turso } = await import("@/integrations/turso/client.server");
  const { ensureTutorSchema } = await import("./schema.server");
  await ensureTutorSchema();
  return turso();
}

// ───────────────────────────── 1. Upload + teach ────────────────────────

const TeachInput = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(40, "Not enough readable text in this document").max(200_000),
  source: z.enum(["upload", "paste", "drive"]).default("upload"),
  studentContext: z.string().max(600).optional(),
  mode: Mode,
});

export const teachDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TeachInput.parse(d))
  .handler(async ({ data, context }) => {
    const { fileAgent, studyAgent } = await import("./agents.server");
    const client = await db();

    const facts = await fileAgent(data.content, data.mode);
    const { out, model } = await studyAgent(facts, data.studentContext ?? "", data.mode);

    const docId = crypto.randomUUID();
    await client.execute({
      sql: `INSERT INTO tutor_documents (id, user_id, title, source, chars, content) VALUES (?,?,?,?,?,?)`,
      args: [docId, context.userId, data.title, data.source, data.content.length, facts.clean_excerpt],
    });
    await client.execute({
      sql: `INSERT INTO tutor_analyses (document_id, user_id, subject, topic, summary, explanation, notes, exam_points, concepts, model)
            VALUES (?,?,?,?,?,?,?,?,?,?)`,
      args: [
        docId,
        context.userId,
        facts.subject,
        facts.topic,
        out.summary,
        out.explanation,
        JSON.stringify(out.notes),
        JSON.stringify(out.exam_points),
        JSON.stringify(out.concepts),
        model,
      ],
    });

    return { documentId: docId, subject: facts.subject, topic: facts.topic, ...out };
  });

// ───────────────────────────── 2. Quiz ──────────────────────────────────

const QuizInput = z.object({
  documentId: z.string().min(1),
  count: z.number().int().min(3).max(10).default(5),
  mode: Mode,
});

export const buildQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => QuizInput.parse(d))
  .handler(async ({ data, context }) => {
    const { quizAgent } = await import("./agents.server");
    const client = await db();

    const doc = await client.execute({
      sql: `SELECT d.content, a.subject, a.topic FROM tutor_documents d
            LEFT JOIN tutor_analyses a ON a.document_id = d.id
            WHERE d.id = ? AND d.user_id = ? LIMIT 1`,
      args: [data.documentId, context.userId],
    });
    if (doc.rows.length === 0) throw new Error("Document not found");
    const row = doc.rows[0];

    const { questions, model } = await quizAgent(
      {
        subject: row.subject ? String(row.subject) : "ET",
        topic: row.topic ? String(row.topic) : "Lesson",
        keywords: [],
        clean_excerpt: String(row.content),
      },
      data.count,
      data.mode,
    );
    if (questions.length === 0) throw new Error("The quiz agent could not build questions from this material");

    const quizId = crypto.randomUUID();
    await client.execute({
      sql: `INSERT INTO tutor_quizzes (id, document_id, user_id, questions, model) VALUES (?,?,?,?,?)`,
      args: [quizId, data.documentId, context.userId, JSON.stringify(questions), model],
    });

    // Answers are stripped before leaving the server.
    return {
      quizId,
      questions: questions.map((q) => ({ id: q.id, question: q.question, options: q.options })),
    };
  });

// ───────────────── 3. Evaluate + weak areas + revision plan ─────────────

const SubmitInput = z.object({
  quizId: z.string().min(1),
  answers: z.record(z.string(), z.number().int().min(-1).max(9)),
  daysUntilExam: z.number().int().min(1).max(90).default(7),
  mode: Mode,
});

export const submitQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SubmitInput.parse(d))
  .handler(async ({ data, context }) => {
    const { judgeAgent, plannerAgent, type QuizQuestion } = await import("./agents.server").then(
      (m) => ({ ...m, type: undefined as never }),
    );
    const client = await db();

    const quiz = await client.execute({
      sql: `SELECT q.id, q.document_id, q.questions, a.subject, a.topic
            FROM tutor_quizzes q
            LEFT JOIN tutor_analyses a ON a.document_id = q.document_id
            WHERE q.id = ? AND q.user_id = ? LIMIT 1`,
      args: [data.quizId, context.userId],
    });
    if (quiz.rows.length === 0) throw new Error("Quiz not found");
    const row = quiz.rows[0];
    const questions = parse<Awaited<ReturnType<typeof judgeAgent>> extends never ? never : any[]>(
      row.questions,
      [],
    );

    const evaluation = await judgeAgent(questions, data.answers, data.mode);
    const plan = await plannerAgent(
      {
        subject: row.subject ? String(row.subject) : "ET",
        topic: row.topic ? String(row.topic) : "Lesson",
        keywords: [],
        clean_excerpt: "",
      },
      evaluation,
      data.daysUntilExam,
      data.mode,
    );

    const attemptId = crypto.randomUUID();
    await client.execute({
      sql: `INSERT INTO tutor_attempts (id, quiz_id, document_id, user_id, answers, results, score, total, weak_areas)
            VALUES (?,?,?,?,?,?,?,?,?)`,
      args: [
        attemptId,
        data.quizId,
        String(row.document_id),
        context.userId,
        JSON.stringify(data.answers),
        JSON.stringify(evaluation.results),
        evaluation.score,
        evaluation.total,
        JSON.stringify(evaluation.weakAreas),
      ],
    });
    await client.execute({
      sql: `INSERT INTO tutor_plans (user_id, document_id, attempt_id, plan) VALUES (?,?,?,?)`,
      args: [context.userId, String(row.document_id), attemptId, JSON.stringify(plan)],
    });

    return { attemptId, evaluation, plan };
  });

// ───────────────────────────── 4. History ───────────────────────────────

export const listTutorSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const client = await db();
    const res = await client.execute({
      sql: `SELECT d.id, d.title, d.created_at, a.subject, a.topic, a.summary
            FROM tutor_documents d LEFT JOIN tutor_analyses a ON a.document_id = d.id
            WHERE d.user_id = ? ORDER BY d.created_at DESC LIMIT 20`,
      args: [context.userId],
    });
    const attempts = await client.execute({
      sql: `SELECT document_id, score, total FROM tutor_attempts WHERE user_id = ? ORDER BY created_at DESC`,
      args: [context.userId],
    });
    const best = new Map<string, { score: number; total: number }>();
    for (const a of attempts.rows) {
      const key = String(a.document_id);
      if (!best.has(key)) best.set(key, { score: Number(a.score), total: Number(a.total) });
    }
    return res.rows.map((r) => ({
      id: String(r.id),
      title: String(r.title),
      subject: r.subject ? String(r.subject) : "",
      topic: r.topic ? String(r.topic) : "",
      summary: r.summary ? String(r.summary) : "",
      createdAt: String(r.created_at),
      lastScore: best.get(String(r.id)) ?? null,
    }));
  });
