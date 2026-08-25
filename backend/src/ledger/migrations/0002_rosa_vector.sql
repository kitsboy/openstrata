-- 0002 — Rosa corpus chunks with pgvector embeddings.
-- Requires the pgvector/pgvector:pg17 image (extension ships in the image).
-- If the extension is unavailable, this migration fails cleanly and Rosa can
-- still fall back to keyword retrieval (see rosa.ts).

BEGIN;

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS corpus_chunk (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Stored code points (vector elements) of the embedding; the dimension must
  -- match the chosen embed model (nomic-embed-text = 768).
  embedding     vector(768),
  source_title  TEXT        NOT NULL,
  source_url    TEXT        NOT NULL DEFAULT '',
  citation      TEXT        NOT NULL,          -- e.g. 'SPA s.146'
  effective_dt  DATE,
  chunk_text    TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_corpus_chunk_embedding
  ON corpus_chunk USING hnsw (embedding vector_cosine_ops);

COMMIT;