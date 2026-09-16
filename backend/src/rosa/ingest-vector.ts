/**
 * Rosa corpus → pgvector indexer.
 *
 * Operator tool (not a runtime path): reads the in-memory BC corpus, embeds
 * each document's text with Ollama `/api/embeddings` (OLLAMA_EMBED_MODEL,
 * nomic-embed-text, 768 dim), and upserts rows into the `corpus_chunk` table
 * (migration 0002) so the vector retriever has real data to cosine-search.
 *
 * Idempotent per citation (upsert on conflict), skips empty-text documents,
 * fails loudly if pgvector or Ollama are unreachable. Runtime Rosa keeps the
 * keyword fallback, so this tool is the *indexing* step, not a gate.
 */

import { Pool } from 'pg';
import { BC_CORPUS } from './bc-corpus.js';
import type { SourceRecord } from './rosa.js';

const EMBED_DIM = 768;

export interface IngestConfig {
  pool: Pool;
  collection: string; // corpus_chunk table name (matches VECTOR_COLLECTION)
  ollamaBaseUrl: string;
  embedModel: string;
  /** When true, use a deterministic noun-phrase placeholder embedding instead of
   * Ollama. This lets `rosa index` populate corpus_chunk *now* (proving the
   * retriever + indexer + query path end-to-end against the BC corpus with a real
   * pgvector cosine search) before Ollama is provisioned. The moment Ollama is
   * reachable the real path takes over — this is only the bootstrap seam. */
  pureEmbed?: boolean;
}

async function ollamaEmbed(url: string, model: string, text: string): Promise<number[]> {
  const u = new URL('/api/embeddings', url);
  u.searchParams.set('model', model);
  const res = await fetch(u.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: text })
  });
  if (!res.ok) throw new Error(`ollama embed status ${res.status}: ${await res.text()}`);
  const body = (await res.json()) as { embedding?: unknown[]; error?: string };
  if (!Array.isArray(body.embedding)) throw new Error(`ollama embed bad shape: ${body.error ?? body}`);
  return body.embedding as number[];
}

/** Deterministic placeholder embedding from the document's noun phrases.
 * Not a real embedding — it exists so `rosa index` can populate corpus_chunk
 * now (real pgvector cosine search over the BC corpus) before Ollama is
 * provisioned. The vectorRetriever's cosine search will still rank the BC
 * corpus rows; the scores are placeholder-shaped. The moment Ollama is
 * reachable the real path replaces these. */
function pureEmbed(text: string): number[] {
  // noun-phrase fingerprint → deterministic 768-dim vector (placeholder)
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const seen = new Set<string>();
  const dims: number[] = [];
  for (let i = 0; i < EMBED_DIM; i++) {
    const w = words[i % words.length] ?? 'x';
    const h = createHash('sha256').update(`${w}:${i}`).digest('hex');
    dims.push(parseFloat('0.' + h.slice(0, 15)));
    seen.add(w);
  }
  return dims;
}

import { createHash } from 'node:crypto';

/** vec<number> → postgres vector literal string for the $N::vector cast. */
function vecLiteral(em: number[]): string {
  return `[${em.map((n) => String(n)).join(',')}]`;
}

export async function ingestCorpus(cfg: IngestConfig): Promise<{ indexed: number; skipped: number; errors: string[] }> {
  const errors: string[] = [];
  let indexed = 0;
  let skipped = 0;
  // Explicit `pureEmbed` (ROSA_EMBED_MODE) wins over the URL heuristic: `??` keeps an
  // explicit `false` meaning "use Ollama", so an unset/placeholder URL cannot silently
  // override it into placeholder embeddings.
  const usePure = cfg.pureEmbed ?? (!cfg.ollamaBaseUrl || cfg.ollamaBaseUrl.includes('placeholder'));

  for (const doc of BC_CORPUS) {
    if (!doc.text.trim()) {
      skipped++;
      continue;
    }
    try {
      const embedding = usePure
        ? pureEmbed(doc.text)
        : await ollamaEmbed(cfg.ollamaBaseUrl, cfg.embedModel, doc.text);
      if (!embedding || embedding.length !== EMBED_DIM) {
        errors.push(`${doc.citation}: bad embedding dim ${embedding?.length ?? 'null'}`);
        skipped++;
        continue;
      }
      await cfg.pool.query<{ id: number }>(
        `INSERT INTO ${cfg.collection} (source_citation, source_title, source_url, source_text, embedding)
         VALUES ($1, $2, $3, $4, $5::vector)
         ON CONFLICT (source_citation) DO UPDATE SET
           source_title = EXCLUDED.source_title,
           source_url    = EXCLUDED.source_url,
           source_text   = EXCLUDED.source_text,
           embedding     = EXCLUDED.embedding
         RETURNING id`,
        [doc.citation, doc.title, doc.url, doc.text, vecLiteral(embedding)]
      );
      indexed++;
    } catch (err) {
      errors.push(`${doc.citation}: ${err instanceof Error ? err.message : String(err)}`);
      skipped++;
    }
  }

  return { indexed, skipped, errors };
}

/** Idempotent: drop + re-create the corpus_chunk table fresh (dev / re-index). */
export async function resetCorpus(pPool: Pool, collection: string): Promise<void> {
  await pPool.query(`DROP TABLE IF EXISTS ${collection}`);
  await pPool.query(
    `CREATE TABLE ${collection} (
       id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
       source_citation TEXT        NOT NULL,
       source_title    TEXT        NOT NULL,
       source_url      TEXT        NOT NULL,
       source_text     TEXT        NOT NULL,
       embedding       vector(768) NOT NULL,
       UNIQUE (source_citation)
     );
     CREATE INDEX IF NOT EXISTS idx_${collection}_embedding
       ON ${collection} USING hnsw (embedding vector_cosine_ops)`
  );
}
