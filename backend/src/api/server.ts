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
import { runBilling, type UnitFee } from '../billing/billing.js';
import {
  newComplaint,
  issueNotice,
  canImposeFine,
  imposeFine,
  decideNoFine
} from '../enforcement/enforcement.js';
import { quotePayment, enabledRails, type RailRegistry, type Rail } from '../rails/rails.js';

export interface ApiDeps {
  ledger: LedgerEngine;
  rosa: Retriever;
  reconcile: Reconciler;
  config: {
    crfMandatoryPct: number;
    vectorCollection: string;
    rails?: RailRegistry;
    cadPerBtc?: number; // live rate for convertible rails
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

  // ------------------------------------------------ Sovereign rails
  app.get('/api/v1/rails/status', async () => ({
    rails: enabledRails(deps.config.rails ?? {}),
    cadPerBtc: deps.config.cadPerBtc ?? null
  }));

  // Build a rail-specific payment quote (LNURL 15-min CAD lock enforced in rails module).
  app.post<{
    Body: {
      rail: Rail;
      refId: string;
      unitRef: string;
      amountBasis: number;
      currency: 'CAD' | 'BTC';
      recipient: string;
      note?: string;
    };
  }>('/api/v1/payments/quote', async (req) => {
    const b = req.body;
    const registry = deps.config.rails ?? {};
    if (!registry[b.rail]?.enabled) {
      return { ok: false, reason: `rail '${b.rail}' is not enabled` };
    }
    try {
      const invoice = quotePayment(
        {
          refId: b.refId,
          communityId: '',
          unitRef: b.unitRef,
          amountBasis: b.amountBasis,
          currency: b.currency,
          rail: b.rail,
          note: b.note
        },
        b.recipient,
        new Date(),
        deps.config.cadPerBtc ?? 0
      );
      return { ok: true, invoice };
    } catch (err) {
      return { ok: false, reason: (err as Error).message };
    }
  });

  // Reconciliation: auto-post decision for one inbound transfer.
  app.post<{
    Body: { reference: string; units: UnitRefs[] };
  }>('/api/v1/treasury/reconcile', async (req) => {
    return deps.reconcile(req.body.reference, req.body.units);
  });

  // ------------------------------------------------ Billing
  // Run a monthly billing cycle: compute charges + late notices, then post the
  // charges to the trust ledger so AR is wired end-to-end.
  app.post<{
    Body: {
      community: string;
      period: string;
      fees: UnitFee[];
      dueDay: number;
      graceDays: number;
      lateFeeBasis: number;
      arrears: Record<string, number>;
      asOf?: string;
    };
  }>('/api/v1/billing/run', async (req) => {
    const b = req.body;
    const run = runBilling(
      b.fees,
      (unitId) => b.arrears[unitId] ?? 0,
      { period: b.period, dueDay: b.dueDay, graceDays: b.graceDays, lateFlatBasis: b.lateFeeBasis },
      b.asOf ? new Date(b.asOf) : new Date()
    );
    // AR isolation: post each charge to a per-unit AR ledger account.
    const posted: Array<{ unitId: string; seq: number }> = [];
    for (const charge of run.charges) {
      const row = await deps.ledger.post(
        b.community,
        charge.referenceCode,
        charge.amountBasis,
        'credit',
        { type: 'strata_fee', referenceCode: charge.referenceCode, reconRef: charge.referenceCode }
      );
      posted.push({ unitId: charge.unitId, seq: row.seq });
    }
    return { run, postedCount: posted.length, posted };
  });

  // ------------------------------------------------ Bylaw enforcement
  // Stateless over the pure state machine: each request submits the current
  // complaint facts and receives the validated next state or a rejection.
  app.post<{
    Body: {
      id: string;
      unitId: string;
      bylawRef: string;
      breachKind: 'standard' | 'short_term_rental';
      receivedAt: string;
      evidence: boolean;
    };
  }>('/api/v1/bylaw/complaint', async (req) => {
    try {
      const c = newComplaint(req.body);
      return { ok: true, complaint: c };
    } catch (err) {
      return { ok: false, reason: (err as Error).message };
    }
  });

  app.post<{
    Body: { complaint: string; issuedAt: string };
  }>('/api/v1/bylaw/complaint/notice', async (req) => {
    try {
      const c = issueNotice(JSON.parse(req.body.complaint), req.body.issuedAt);
      return { ok: true, complaint: c };
    } catch (err) {
      return { ok: false, reason: (err as Error).message };
    }
  });

  app.post<{
    Body: { complaint: string; now: string; amountBasis: number; councilMinutesRef: string };
  }>('/api/v1/bylaw/fine', async (req) => {
    let state: ReturnType<typeof JSON.parse>;
    try {
      state = JSON.parse(req.body.complaint) as Parameters<typeof imposeFine>[0];
    } catch {
      return { ok: false, reason: 'invalid complaint payload' };
    }
    const res = imposeFine(state, req.body.now, {
      councilMinutesRef: req.body.councilMinutesRef,
      amountBasis: req.body.amountBasis
    });
    return res.ok ? { ok: true, complaint: res.complaint } : { ok: false, reason: res.reason };
  });

  app.post<{ Body: { complaint: string; now: string } }>('/api/v1/bylaw/status', async (req) => {
    let state;
    try {
      state = JSON.parse(req.body.complaint) as Parameters<typeof canImposeFine>[0];
    } catch {
      return { ok: false, reason: 'invalid complaint payload' };
    }
    const gate = canImposeFine(state, req.body.now);
    return { ...gate, fineCapsBp: { standard: 20_000, short_term_rental: 100_000 } };
  });

  app.post<{ Body: { complaint: string; councilMinutesRef: string } }>('/api/v1/bylaw/nofine', async (req) => {
    try {
      const c = decideNoFine(JSON.parse(req.body.complaint), req.body.councilMinutesRef);
      return { ok: true, complaint: c };
    } catch (err) {
      return { ok: false, reason: (err as Error).message };
    }
  });

  return app;
}