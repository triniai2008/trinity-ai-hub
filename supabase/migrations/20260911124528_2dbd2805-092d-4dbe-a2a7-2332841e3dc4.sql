CREATE OR REPLACE FUNCTION public.match_user_memories(
  target_user_id uuid,
  query_embedding extensions.vector(3072),
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
SET search_path = public, extensions
AS $$
  SELECT
    m.id,
    m.key,
    m.value,
    m.importance,
    1 - (m.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)) AS similarity
  FROM public.memories AS m
  WHERE m.user_id = target_user_id
    AND m.embedding IS NOT NULL
    AND m.model_version = 'google/gemini-embedding-2'
  ORDER BY m.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)
  LIMIT LEAST(GREATEST(match_count, 1), 20);
$$;

REVOKE ALL ON FUNCTION public.match_user_memories(uuid, extensions.vector, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.match_user_memories(uuid, extensions.vector, integer) FROM anon;
REVOKE ALL ON FUNCTION public.match_user_memories(uuid, extensions.vector, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.match_user_memories(uuid, extensions.vector, integer) TO service_role;