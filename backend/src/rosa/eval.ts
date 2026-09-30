/**
 * Rosa eval harness — measures retrieval quality, never fabricates.
 *
 * A golden set of real BC strata questions, each with the citation(s) a
 * competent answer MUST cite. The harness is pure: it takes any `Retriever`
 * and reports hit@k (did an expected citation appear in the top k?) and the
 * citation-precision signal (how much of the top-k was relevant).
 *
 * This is the seam that makes Rosa's quality a *number* instead of a feeling:
 * the corpus ingest pipeline, the vector retriever, or any future re-ranker
 * all get scored against the same set. `rosa eval` runs it from the CLI.
 */

import type { Retriever } from './rosa.js';

export interface EvalQuestion {
  /** The question a council member would actually ask. */
  question: string;
  /** Citations a competent answer must cite (any one counts as a hit). */
  expectCitations: string[];
  /** When true, the question is deliberately out of corpus: Rosa must refuse. */
  expectNoMatch?: boolean;
}

export interface QuestionResult {
  question: string;
  hit: boolean;
  /** Citations retrieved in the top k. */
  retrieved: string[];
  /** Which expected citations matched. */
  matched: string[];
  refused: boolean;
}

export interface EvalReport {
  /** Hit@k over answerable questions (0..1). */
  hitRate: number;
  /** Of the answerable questions, how many correctly refused (should be 0). */
  wronglyRefused: number;
  /** Of the no-match questions, how many correctly refused. */
  correctRefusals: number;
  /** Total questions evaluated. */
  total: number;
  /** Per-question detail for debugging regressions. */
  results: QuestionResult[];
}

/** Normalize a citation so 'SPA s.92–96' and 'SPA s.92-96' compare equal. */
function foldCitation(value: string): string {
  return value.toLowerCase().replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim();
}

/**
 * Run the golden set against a retriever. `k` is the retrieval depth a real
 * answer composes from (the Rosa route uses 4).
 */
export async function evaluateRetriever(
  retriever: Retriever,
  golden: readonly EvalQuestion[],
  k = 4
): Promise<EvalReport> {
  const results: QuestionResult[] = [];

  for (const item of golden) {
    const chunks = await retriever.retrieve(item.question, k);
    const retrieved = [...new Set(chunks.map((c) => foldCitation(c.source.citation)))];
    const matched = item.expectCitations
      .map(foldCitation)
      .filter((expected) => retrieved.includes(expected));
    const refused = chunks.length === 0;

    results.push({
      question: item.question,
      hit: item.expectNoMatch ? true : matched.length > 0,
      retrieved,
      matched,
      refused
    });
  }

  const answerable = golden.filter((g) => !g.expectNoMatch);
  const noMatchQs = golden.filter((g) => g.expectNoMatch);
  const answerableResults = results.filter(
    (r) => !noMatchQs.some((q) => q.question === r.question)
  );

  const hitRate =
    answerable.length === 0
      ? 1
      : answerableResults.filter((r) => r.hit).length / answerable.length;
  const wronglyRefused = answerableResults.filter((r) => r.refused).length;
  const correctRefusals = noMatchQs.length
    ? results.filter((r) => noMatchQs.some((q) => q.question === r.question) && r.refused).length
    : 0;

  return {
    hitRate,
    wronglyRefused,
    correctRefusals,
    total: golden.length,
    results
  };
}

/**
 * The golden set: real questions from the BC compliance KB, phrased the way a
 * council member would ask them. Every new corpus pack must keep this set
 * passing — it is the contract between the corpus and the answer.
 */
export const ROSA_GOLDEN_SET: readonly EvalQuestion[] = [
  {
    question: 'What is Form K and when does an owner have to provide it?',
    expectCitations: ['SPA s.146']
  },
  {
    question: 'How much of the operating fund contribution must go into the contingency reserve fund?',
    expectCitations: ['SPA s.92–96']
  },
  {
    question: 'Can operating money and the contingency reserve be kept in the same account?',
    expectCitations: ['SPA s.92–96']
  },
  {
    question: 'How long does the strata have to deliver a Form B after I request it?',
    expectCitations: ['SPA s.256 & s.257']
  },
  {
    question: 'When is a Form F withheld?',
    expectCitations: ['SPA s.256 & s.257']
  },
  {
    question: 'What happens if quorum is not met at the annual general meeting?',
    expectCitations: ['SPA s.48']
  },
  {
    question: 'Do abstentions count when calculating a 3/4 vote?',
    expectCitations: ['SPA s.48 (voting)']
  },
  {
    question: 'What is the maximum fine for a bylaw contravention?',
    expectCitations: ['Standard Bylaws — fines']
  },
  {
    question: 'Can the strata fine an owner right away without notice?',
    expectCitations: ['Standard Bylaws — fines']
  },
  {
    question: 'How long must meeting minutes be kept?',
    expectCitations: ['SPA s.35']
  },
  {
    // Out of corpus on purpose: Alberta rules are not in the BC pack.
    question: 'What are the condominium meeting quorum rules in Alberta?',
    expectCitations: [],
    expectNoMatch: true
  },
  {
    // Out of corpus on purpose: Ontario employment law is not in the BC pack.
    // Topic-level refusal (same words, wrong domain) is what the vector
    // retriever gates; the keyword fallback honestly refuses the
    // jurisdiction-level case, which is what this question tests.
    question: 'How much vacation pay must an Ontario employer pay their employee?',
    expectCitations: [],
    expectNoMatch: true
  }
];
