import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "recall",
  title: "Recall memories",
  description: "Search the signed-in TriniAI user's stored memories (case-insensitive substring match on key or value).",
  inputSchema: {
    query: z.string().min(1).max(200).optional().describe("Optional substring to match. Omit to list most important."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureTursoSchema } = await import("@/integrations/turso/schema.server");
    await ensureTursoSchema();
    const max = limit ?? 10;
    const userId = ctx.getUserId();
    const result = query
      ? await turso().execute({
          sql: `SELECT key, value, importance, updated_at FROM memories
                WHERE user_id = ? AND (lower(key) LIKE ? OR lower(value) LIKE ?)
                ORDER BY importance DESC, updated_at DESC LIMIT ?`,
          args: [userId, `%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`, max] as (string | number)[],
        })
      : await turso().execute({
          sql: `SELECT key, value, importance, updated_at FROM memories
                WHERE user_id = ? ORDER BY importance DESC, updated_at DESC LIMIT ?`,
          args: [userId, max] as (string | number)[],
        });
    const rows = result.rows.map((r) => ({
      key: r.key as string,
      value: r.value as string,
      importance: Number(r.importance),
      updated_at: r.updated_at as string,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { memories: rows },
    };
  },
});
