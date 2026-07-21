import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "remember",
  title: "Save memory",
  description: "Store a long-term memory (key/value) for the signed-in TriniAI user.",
  inputSchema: {
    key: z.string().min(1).max(200).describe("Short memory key, e.g. 'favorite_language'."),
    value: z.string().min(1).max(4000).describe("The memory content."),
    importance: z.number().int().min(1).max(5).optional().describe("1-5 (default 1)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ key, value, importance }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { turso } = await import("@/integrations/turso/client.server");
    const { ensureTursoSchema } = await import("@/integrations/turso/schema.server");
    await ensureTursoSchema();
    const now = new Date().toISOString();
    await turso().execute({
      sql: `INSERT INTO memories (user_id, key, value, importance, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [ctx.getUserId(), key, value, importance ?? 1, now, now] as (string | number)[],
    });
    return {
      content: [{ type: "text", text: `Saved memory "${key}".` }],
      structuredContent: { ok: true, key },
    };
  },
});
