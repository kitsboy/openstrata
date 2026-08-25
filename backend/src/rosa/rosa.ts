/**
 * Rosa — Compliance RAG core.
 *
 * Rosa's contract (see docs/KIMI-HANDOFF.md and the framework doc):
 *   1. STRICT retrieval: answer only from the configured jurisdiction corpus.
 *   2. CITATIONS ONLY: every claim maps to a source record. Never invent a
 *      statute, section, deadline, or citation.
 *   3. NO GUESSING OVER THE LEDGER: timelines, forms and deadlines that depend
 *      on facts are flagged as needing a fact input, never silently inferred.
 *
 * This module is pure + deterministic (no DB): the Postgres/pgvector vector
 * lookup is a thin adapter behind `Retriever`. Unit tests exercise the strict
 * composition logic. The fallback `keywordRetriever` makes Rosa runnable before
 * the embed model is provisioned.
 */

export interface SourceRecord {
  citation: string; // e.g. 'SPA s.146'
  title: string;
  url: string;
  text: string;
}

export interface RetrievedChunk {
  source: SourceRecord;
  score: number;
  quote: string;
}

/** Minimal retrieval seam. A pgvector-backed impl replaces this in production. */
export interface Retriever {
  retrieve(question: string, limit: number): Promise<RetrievedChunk[]>;
}

/** Deterministic scoring fallback (no embed model). Lower is better: 0 = exact. */
export function keywordRetriever(corpus: SourceRecord[]): Retriever {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  return {
    async retrieve(question: string, limit: number): Promise<RetrievedChunk[]> {
      const q = normalize(question);
      const scored = corpus
        .map((source) => {
          const text = `${source.title} ${source.text} ${source.citation}`;
          const hay = normalize(text);
          const words = q.split(/\s+/).filter((w) => w.length >= 4);
          const hits = words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0);
          const score = words.length ? -hits / words.length : 1; // -1 (all) .. 1
          return { source, score, quote: source.text };
        })
        .filter((c) => c.score < 0)
        .sort((a, b) => a.score - b.score)
        .slice(0, limit);
      return scored;
    }
  };
}

export interface RosaAnswer {
  answer: string;
  cited: string[];
  uncertain: boolean; // true when facts are required to answer precisely
}

const NO_MATCH_TEXT =
  'No controlling source was found in the loaded corpus for that question. ' +
  'Rosa will not guess: please rephrase, load the relevant BC pack, or ask a ' +
  'licensed strata professional / counsel.';

/**
 * Compose a strict answer from retrieved chunks. Fails closed: no sources =>
 * explicit refusal, never a fabricated citation.
 */
export function composeAnswer(
  question: string,
  chunks: RetrievedChunk[],
  facts: Record<string, string>
): RosaAnswer {
  if (!chunks.length) {
    return { answer: NO_MATCH_TEXT, cited: [], uncertain: true };
  }
  const cited = [...new Set(chunks.map((c) => c.source.citation))];
  const body = chunks.map((c) => c.source.text).join(' ');
  let answer = `Under ${cited.join(' and ')}, ${body}`;

  // Strictness: any cited source that reads as date/form/timeline dependent but
  // lacks the required fact gets an explicit uncertainty marker rather than a
  // silently inferred number.
  const needs =
    /(\b(?:deadline|due|days|weeks|months|by|until)\b)/i.test(
      `${question} ${body}`
    );
  const missingFactCount = needs
    ? ['triggerDate', 'startDate', 'fiscalYearEnd'].filter((k) => !facts[k]).length
    : 0;
  if (missingFactCount > 0) {
    answer +=
      ' This answer depends on dates/facts that were not provided; review against your records before acting.';
    return { answer, cited, uncertain: true };
  }
  return { answer, cited, uncertain: false };
}