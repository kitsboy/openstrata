/**
 * Rosa — compliance assistant API helpers.
 *
 * `POST /api/v1/rosa/query` answers with citations only (strict RAG, see
 * `backend/src/rosa/rosa.ts`): the answer is composed solely from retrieved
 * corpus chunks, `cited` lists the controlling sources, and `uncertain` is set
 * when the answer depends on facts (dates, forms, timelines) the caller did
 * not provide. `GET /api/v1/rosa/sources` exposes the raw retrieval for the
 * "sources" drawer without composing an answer.
 */

import { apiFetch } from './client';
import { getToken } from './token';

export interface RosaQueryInput {
  question: string;
  facts?: Record<string, string>;
}

export interface RosaAnswer {
  answer: string;
  cited: string[];
  uncertain: boolean;
  collection?: string;
}

export async function rosaQuery(input: RosaQueryInput): Promise<RosaAnswer> {
  const res = await apiFetch<{ answer: string; cited: string[]; uncertain: boolean; collection?: string }>(
    '/api/v1/rosa/query',
    { method: 'POST', body: input, token: getToken() }
  );
  return res;
}

export interface RosaSource {
  citation: string;
  title: string;
  url: string;
  score: number;
}

export async function rosaSources(question: string): Promise<RosaSource[]> {
  const res = await apiFetch<{ chunks: RosaSource[] }>(
    `/api/v1/rosa/sources?q=${encodeURIComponent(question)}`,
    { token: getToken() }
  );
  return res.chunks;
}
