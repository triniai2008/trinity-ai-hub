// RAG / personalization retrieval. Server-only.
// Pulls the user's profile and the most relevant stored memories so the
// Agent Kernel can personalize its final answer.
import type { KernelContext } from "./kernel/kernel.server";

const EMBEDDING_MODEL = "google/gemini-embedding-2";
const EMBEDDING_URL = "https://ai.gateway.lovable.dev/v1/embeddings";

type MemoryRow = {
  id: string;
  key: string;
  value: string;
  importance: number | null;
  embedding: unknown;
  model_version: string | null;
};

type EmbeddingResponse = {
  data?: Array<{ index: number; embedding: number[] }>;
  error?: { message?: string };
  message?: string;
};

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.max(seconds * 1000, 250);
  }
  return 500 * 2 ** attempt + Math.floor(Math.random() * 250);
}

async function embed(inputs: string[], apiKey: string): Promise<number[][]> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(EMBEDDING_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: inputs }),
    });
    const payload = (await response.json().catch(() => ({}))) as EmbeddingResponse;
    if (response.ok) {
      const ordered = [...(payload.data ?? [])].sort((a, b) => a.index - b.index);
      if (ordered.length !== inputs.length || ordered.some((item) => item.embedding.length !== 3072)) {
        throw new Error("Embedding response had an unexpected shape");
      }
      return ordered.map((item) => item.embedding);
    }

    const message = payload.error?.message ?? payload.message ?? `Embedding request failed (${response.status})`;
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 2) throw new Error(message);
    await new Promise((resolve) => setTimeout(resolve, retryDelay(response, attempt)));
  }
  throw new Error("Embedding request failed");
}

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
        .select("id, key, value, importance, embedding, model_version")
        .eq("user_id", userId)
        .order("importance", { ascending: false })
        .limit(80),
    ]);

    const rows = (memories ?? []) as MemoryRow[];
    let ranked: string[] = [];
    const apiKey = process.env['LOVABLE_API_KEY'];

    if (apiKey && query.trim() && rows.length > 0) {
      try {
        const stale = rows.filter(
          (memory) => !memory.embedding || memory.model_version !== EMBEDDING_MODEL,
        );
        const vectors = await embed(
          [query, ...stale.map((memory) => `${memory.key}: ${memory.value}`)],
          apiKey,
        );
        const queryVector = vectors[0];
        if (!queryVector) throw new Error("Query embedding was empty");

        await Promise.all(
          stale.map((memory, index) =>
            supabaseAdmin
              .from("memories")
              .update({
                embedding: vectors[index + 1],
                model_version: EMBEDDING_MODEL,
              })
              .eq("id", memory.id)
              .eq("user_id", userId),
          ),
        );

        const { data: matches, error } = await supabaseAdmin.rpc("match_user_memories", {
          target_user_id: userId,
          query_embedding: `[${queryVector.join(",")}]`,
          match_count: limit,
        });
        if (error) throw error;
        ranked = (matches ?? []).map(
          (memory: { key: string; value: string }) => `${memory.key}: ${memory.value}`,
        );
      } catch (err) {
        console.error("[rag] semantic retrieval unavailable, using lexical fallback:", err);
      }
    }

    if (ranked.length === 0) ranked = rows
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
