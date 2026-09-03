// RAG / personalization retrieval. Server-only.
// Pulls the user's profile and the most relevant stored memories so the
// Agent Kernel can personalize its final answer.
import type { KernelContext } from "./kernel/kernel.server";

/** Cheap lexical relevance: keyword overlap between the query and a memory. */
function score(query: string, text: string): number {
  const q = new Set(
    query
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3),
  );
  if (q.size === 0) return 0;
  let hits = 0;
  for (const word of new Set(text.toLowerCase().split(/[^a-z0-9]+/))) {
    if (q.has(word)) hits += 1;
  }
  return hits;
}

export async function loadUserContext(
  userId: string,
  query: string,
  limit = 8,
): Promise<KernelContext> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: profile }, { data: memories }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("display_name, language, bio")
        .eq("id", userId)
        .maybeSingle(),
      supabaseAdmin
        .from("memories")
        .select("key, value, importance")
        .eq("user_id", userId)
        .order("importance", { ascending: false })
        .limit(80),
    ]);

    const rows = memories ?? [];
    const ranked = rows
      .map((m) => ({
        text: `${m.key}: ${m.value}`,
        rank: score(query, `${m.key} ${m.value}`) * 10 + (m.importance ?? 0),
      }))
      .sort((a, b) => b.rank - a.rank)
      .slice(0, limit)
      .map((m) => m.text);

    if (profile?.bio) ranked.unshift(`Bio: ${profile.bio}`);

    return {
      displayName: profile?.display_name ?? null,
      locale: profile?.language ?? null,
      memories: ranked,
    };
  } catch (err) {
    console.error("[rag] context load failed:", err);
    return {};
  }
}
