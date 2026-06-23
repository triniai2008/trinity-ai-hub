// Turso-backed server functions: memory, feedback, usage logging.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MemoryInput = z.object({
  userId: z.string().min(1),
  key: z.string().min(1).max(200),
  value: z.string().max(4000),
  importance: z.number().int().min(1).max(10).default(1),
});

export const saveMemory = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MemoryInput.parse(d))
  .handler(async ({ data }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureTursoSchema } = await import("@/integrations/turso/schema.server");
    await ensureTursoSchema();
    await turso().execute({
      sql: `INSERT INTO memories (user_id, key, value, importance) VALUES (?, ?, ?, ?)`,
      args: [data.userId, data.key, data.value, data.importance],
    });
    return { ok: true };
  });

const RecallInput = z.object({ userId: z.string().min(1), limit: z.number().int().min(1).max(50).default(20) });

export const recallMemories = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => RecallInput.parse(d))
  .handler(async ({ data }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureTursoSchema } = await import("@/integrations/turso/schema.server");
    await ensureTursoSchema();
    const res = await turso().execute({
      sql: `SELECT id, key, value, importance, created_at FROM memories WHERE user_id = ? ORDER BY importance DESC, created_at DESC LIMIT ?`,
      args: [data.userId, data.limit],
    });
    return res.rows.map((r) => ({
      id: String(r.id),
      key: String(r.key),
      value: String(r.value),
      importance: Number(r.importance),
      created_at: String(r.created_at),
    }));
  });

const FeedbackInput = z.object({
  userId: z.string().min(1),
  messageId: z.string().min(1),
  chatId: z.string().optional(),
  question: z.string().max(8000).optional(),
  answer: z.string().max(20000),
  model: z.string().optional(),
  liked: z.boolean(),
});

export const saveFeedback = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => FeedbackInput.parse(d))
  .handler(async ({ data }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureTursoSchema } = await import("@/integrations/turso/schema.server");
    await ensureTursoSchema();
    await turso().execute({
      sql: `INSERT INTO feedback (user_id, message_id, chat_id, question, answer, model, liked) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [data.userId, data.messageId, data.chatId ?? null, data.question ?? null, data.answer, data.model ?? null, data.liked ? 1 : 0],
    });
    // Liked answers seed the training dataset (pending approval).
    if (data.liked && data.question) {
      await turso().execute({
        sql: `INSERT INTO training_dataset (question, answer, model, approved) VALUES (?, ?, ?, 0)`,
        args: [data.question, data.answer, data.model ?? null],
      });
    }
    return { ok: true };
  });

const LogInput = z.object({
  userId: z.string().optional(),
  chatId: z.string().optional(),
  provider: z.string(),
  model: z.string(),
  mode: z.string().optional(),
  task: z.string().optional(),
  tokensIn: z.number().int().optional(),
  tokensOut: z.number().int().optional(),
  latencyMs: z.number().int().optional(),
  success: z.boolean().default(true),
  error: z.string().optional(),
});

export const logUsage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => LogInput.parse(d))
  .handler(async ({ data }) => {
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureTursoSchema } = await import("@/integrations/turso/schema.server");
    await ensureTursoSchema();
    await turso().execute({
      sql: `INSERT INTO usage_logs (user_id, chat_id, provider, model, mode, task, tokens_in, tokens_out, latency_ms, success, error)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.userId ?? null, data.chatId ?? null, data.provider, data.model,
        data.mode ?? null, data.task ?? null,
        data.tokensIn ?? null, data.tokensOut ?? null, data.latencyMs ?? null,
        data.success ? 1 : 0, data.error ?? null,
      ],
    });
    return { ok: true };
  });
