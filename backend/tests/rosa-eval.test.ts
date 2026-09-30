/**
 * Rosa quality gate: the golden set must pass against the REAL retriever
 * (keywordRetriever over the shipped BC corpus — the same fallback the API
 * serves when pgvector/Ollama are not provisioned), and the harness itself
 * must behave honestly: an empty corpus must produce refusals, not hits.
 *
 * When the vector retriever lands in production, wire it into this file —
 * the same set then gates embedding quality too.
 */

import { describe, it, expect } from 'vitest';
import { keywordRetriever, composeAnswer } from '../src/rosa/rosa.js';
import { BC_CORPUS } from '../src/rosa/bc-corpus.js';
import { evaluateRetriever, ROSA_GOLDEN_SET } from '../src/rosa/eval.js';

describe('rosa golden set (quality gate)', () => {
  it('scores the shipped corpus — hit@4 must be 1.0', async () => {
    const report = await evaluateRetriever(keywordRetriever(BC_CORPUS), ROSA_GOLDEN_SET, 4);
    expect(report.hitRate).toBe(1);
    expect(report.wronglyRefused).toBe(0);
  });

  it('refuses out-of-corpus questions instead of guessing', async () => {
    const report = await evaluateRetriever(keywordRetriever(BC_CORPUS), ROSA_GOLDEN_SET, 4);
    expect(report.correctRefusals).toBe(2);
  });

  it('composes strict, citation-first answers for the golden questions', async () => {
    const retriever = keywordRetriever(BC_CORPUS);
    for (const item of ROSA_GOLDEN_SET) {
      if (item.expectNoMatch) continue;
      const chunks = await retriever.retrieve(item.question, 4);
      const answer = composeAnswer(item.question, chunks, {});
      expect(answer.cited.length).toBeGreaterThan(0);
      // A cited source must be one of the expected ones (folded comparison).
      const folded = answer.cited.map((c) => c.toLowerCase().replace(/[\u2013\u2014]/g, '-'));
      const expected = item.expectCitations.map((c) => c.toLowerCase().replace(/[\u2013\u2014]/g, '-'));
      expect(folded.some((c) => expected.includes(c))).toBe(true);
    }
  });

  it('refuses everything on an empty corpus (fail-closed)', async () => {
    const report = await evaluateRetriever(keywordRetriever([]), ROSA_GOLDEN_SET, 4);
    // With no corpus at all, nothing can be answered: hit rate 0, every
    // answerable question refused rather than hallucinated.
    expect(report.hitRate).toBe(0);
    expect(report.wronglyRefused).toBe(10);
    expect(report.results.every((r) => r.refused || r.retrieved.length === 0)).toBe(true);
  });

  it('keeps the golden set honest — every answerable question names citations', () => {
    for (const item of ROSA_GOLDEN_SET) {
      if (item.expectNoMatch) {
        expect(item.expectCitations).toEqual([]);
      } else {
        expect(item.expectCitations.length).toBeGreaterThan(0);
      }
    }
  });
});
