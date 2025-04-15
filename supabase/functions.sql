
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  pet_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pet_memories.id,
    pet_memories.content,
    1 - (pet_memories.embedding <=> query_embedding) as similarity
  FROM pet_memories
  WHERE pet_memories.pet_id = match_memories.pet_id
  AND 1 - (pet_memories.embedding <=> query_embedding) > match_threshold
  ORDER BY pet_memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
