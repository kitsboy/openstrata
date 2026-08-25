/**
 * Fastify application — routes the Phase 3 services.
 *
 * The app is a factory over injected dependencies so it can be built in tests
 * with an in-memory ledger store and a keyword retriever (no Postgres/Ollama).
 */

import Fastify, { type FastifyInstance } from 'fastify';
import type { LedgerEngine } from '../ledger/ledger.js';
import { type Retriever, composeAnswer } from '../rosa/rosa.js';
import { authorizeSpend } from '../ziggy/ziggy.js';
import type { Reconciler, UnitRefs } from '../trf/recon.js';

export interface ApiDeps {
  ledger: LedgerEngine;
  rosa: Retriever;
  reconcile: Reconciler;
  config: {
    crfMandatoryPct: number;
    vectorCollection: string;
  };
}

export async function buildServer(
  deps: ApiDeps,
  opts: { logger?: boolean } = { logger: true }
): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? true });

  const defaultBudget = {
    fiscalYear: '2026',
    totalOperatingBasis: 4_200_000,
    crfMandatoryPct: deps.config.crfMandatoryPct
  };

  app.get('/health', async () => ({ ok: true, service: 'openstrata-backend' }));

  // Ledger balance (verified against the hash chain).
  app.get<{ Querystring: { community: string; fund: string } }>(
    '/api/v1/ledger/balance',
    async (req) => {
      const { balanceBasis, entryCount, headTally } = await deps.ledger.balance(
        req.query.community,
        req.query.fund
      );
      return { balanceBasis, entryCount, headTally: headTally.slice(0, 8) };
    }
  );

  // Post a single credit/debit.
  app.post<{
    Body: {
      community: string;
      fund: string;
      amountBasis: number;
      kind: 'credit' | 'debit';
      type: string;
      description?: string;
      referenceCode?: string;
      reconRef?: string;
    };
  }>('/api/v1/ledger/post', async (req) => {
    const row = await deps.ledger.post(
      req.body.community,
      req.body.fund,
      req.body.amountBasis,
      req.body.kind,
      {
        type: req.body.type,
        description: req.body.description,
        referenceCode: req.body.referenceCode,
        reconRef: req.body.reconRef
      }
    );
    return { posted: true, seq: row.seq, tallyRoot: row.tallyRoot.slice(0, 8) };
  });

  // Ziggy: treasury spend verdict (authorization gate, not execution).
  app.post<{
    Body: {
      budget?: {
        fiscalYear: string;
        totalOperatingBasis: number;
        crfMandatoryPct: number;
      };
      balances: Record<string, number>;
      spend: {
        amountBasis: number;
        fundCode: string;
        poRef: string;
        category: string;
        description?: string;
      };
    };
  }>('/api/v1/treasury/authorize', async (req) => {
    const verdict = authorizeSpend(
      req.body.budget ?? defaultBudget,
      req.body.balances,
      req.body.spend
    );
    return verdict;
  });

  // Rosa: strict RAG query (citations only).
  app.post<{ Body: { question: string; facts?: Record<string, string> } }>(
    '/api/v1/rosa/query',
    async (req) => {
      const chunks = await deps.rosa.retrieve(req.body.question, 3);
      const answer = composeAnswer(req.body.question, chunks, req.body.facts ?? {});
      return {
        answer,
        cited: answer.cited,
        uncertain: answer.uncertain,
        collection: deps.config.vectorCollection
      };
    }
  );

  // Rosa: raw retrieval endpoint (returns citations, no answer).
  app.get<{ Querystring: { q: string } }>('/api/v1/rosa/sources', async (req) => {
    const chunks = await deps.rosa.retrieve(req.query.q, 5);
    return {
      chunks: chunks.map((c) => ({
        citation: c.source.citation,
        title: c.source.title,
        url: c.source.url,
        score: c.score
      }))
    };
  });

  // Reconciliation: auto-post decision for one inbound transfer.
  app.post<{
    Body: { reference: string; units: UnitRefs[] };
  }>('/api/v1/treasury/reconcile', async (req) => {
    return deps.reconcile(req.body.reference, req.body.units);
  });

  return app;
}