CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS embedding vector(3072),
  ADD COLUMN IF NOT EXISTS model_version text;

CREATE INDEX IF NOT EXISTS memories_embedding_hnsw_idx
  ON public.memories
  USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops)
  WHERE embedding IS NOT NULL;

CREATE OR REPLACE FUNCTION public.match_memories(
  query_embedding vector(3072),
  match_count integer DEFAULT 8
)
RETURNS TABLE (
  id uuid,
  key text,
  value text,
  importance integer,
  similarity double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    m.id,
    m.key,
    m.value,
    m.importance,
    1 - (m.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)) AS similarity
  FROM public.memories AS m
  WHERE m.user_id = auth.uid()
    AND m.embedding IS NOT NULL
    AND m.model_version = 'google/gemini-embedding-2'
  ORDER BY m.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)
  LIMIT LEAST(GREATEST(match_count, 1), 20);
$$;

REVOKE ALL ON FUNCTION public.match_memories(vector, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_memories(vector, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_memories(vector, integer) TO service_role;