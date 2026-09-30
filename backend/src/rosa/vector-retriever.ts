/**
 * Rosa pgvector + Ollama retriever.
 *
 * Replaces the keyword fallback with real embeddings when both are available:
 *   1. Embed the question with Ollama `/api/embeddings` (model from config).
 *   2. Cosine-nearest-neighbor search over `corpus_chunk` (migration 0002,
 *      `vector(768)` for nomic-embed-text) via pgvector `<=>`.
 *   3. Map DB rows back to `SourceRecord` + `RetrievedChunk`.
 *
 * Fails *closed and quiet*: if pgvector is unavailable, the extension is missing,
 * the table is empty, or Ollama is down, this falls back to
 * `keywordRetriever(corpus)` so Rosa keeps running. The fallback is the safe
 * default — the keyword retriever is the floor, embeddings are an upgrade.
 *
 * Never fabricates citations: that contract lives in `composeAnswer`, which this
 * module does not touch. This module only retrieves.
 */

import pg from 'pg';
import { keywordRetriever, type Retriever, type RetrievedChunk, type SourceRecord } from './rosa.js';

const EMBED_DIM = 768; // nomic-embed-text

export interface VectorRetrieverConfig {
  pool: pg.Pool;
  ollamaBaseUrl: string;
  embedModel: string;
  collection: string; // pgvector table / column prefix (matches VECTOR_COLLECTION)
  corpus: SourceRecord[]; // in-memory fallback corpus for the keyword path
}

function ollamaEmbed(url: string, model: string, text: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const u = new URL('/api/embeddings', url);
    u.searchParams.set('model', model);
    const body = JSON.stringify({ input: text });
    const req = typeof fetch === 'function' ? fetch(u.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    }) : null;
    if (!req) {
      return reject(new Error('no fetch implementation — cannot embed'));
    }
    req
      .then((r) => r.json().then((j: unknown) => ({ status: r.status, body: j })))
      .then(({ status, body }) => {
        if (status !== 200) return reject(new Error(`ollama embed status ${status}`));
        const em = (body as { embedding?: unknown[]; error?: string }).embedding;
        if (!Array.isArray(em)) return reject(new Error(`ollama embed bad shape: ${(body as { error?: string }).error ?? body}`));
        resolve(em as number[]);
      })
      .catch(reject);
  });
}

/** Cosine distance via pgvector `<=>` on a `vector(768)` column. */
function embeddingSql(embed: number[], collection: string): { sql: string; values: unknown[] } {
  const vec = `[${embed.map((n) => String(n)).join(',')}]`;
  return {
    sql: `SELECT cc.source_citation, cc.source_title, cc.source_url, cc.source_text, 1 - (cc.embedding <=> $1::vector) AS score
          FROM ${collection} cc
          ORDER BY cc.embedding <=> $1::vector
          LIMIT $2`,
    values: [vec, EMBED_DIM]
  };
}

export function vectorRetriever(cfg: VectorRetrieverConfig): Retriever {
  const fallback = keywordRetriever(cfg.corpus);

  return {
    async retrieve(question: string, limit: number): Promise<RetrievedChunk[]> {
      // Try real embeddings; any failure here is non-fatal and we fall back.
      try {
        const embed = await ollamaEmbed(cfg.ollamaBaseUrl, cfg.embedModel, question);
        if (!embed || embed.length !== EMBED_DIM) {
          return fallback.retrieve(question, limit);
        }
        const { sql, values } = embeddingSql(embed, cfg.collection);
        const res = await cfg.pool.query<{
          source_citation: string;
          source_title: string;
          source_url: string;
          source_text: string;
          score: number;
        }>(sql, values);

        if (!res.rows.length) {
          return fallback.retrieve(question, limit);
        }

        return res.rows
          .map((r) => ({
            source: {
              citation: r.source_citation,
              title: r.source_title,
              url: r.source_url,
              text: r.source_text
            },
            score: r.score,
            quote: r.source_text
          }))
          .slice(0, limit);
      } catch (err) {
        // pgvector missing / Ollama down / network error — fall back to keyword.
        // Keep the error surface small; Rosa's composeAnswer already fails closed.
        return fallback.retrieve(question, limit);
      }
    }
  };
}

/** Minimal check: does the pgvector extension + corpus_chunk table exist? */
export async function vectorStoreReady(pool: pg.Pool, collection: string): Promise<boolean> {
  try {
    const ext = await pool.query(`SELECT 1 FROM pg_extension WHERE extname = 'vector'`);
    if (!ext.rows.length) return false;
    const tbl = await pool.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
      [collection]
    );
    return !!tbl.rows.length;
  } catch {
    return false;
  }
}
