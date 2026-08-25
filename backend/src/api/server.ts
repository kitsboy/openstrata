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
import { getOrCreateQuote, type PaymentRequestStore } from '../rails/payment-request.js';
import { generateForm } from '../forms/forms.js';
import { checkQuorum, checkQuorumRescheduled, countVote } from '../meetings/meetings.js';

export interface ApiDeps {
  ledger: LedgerEngine;
  rosa: Retriever;
  reconcile: Reconciler;
  payments: PaymentRequestStore;
  config: {
    crfMandatoryPct: number;
    vectorCollection: string;
    rails?: RailRegistry;
    cadPerBtc?: number; // live rate for convertible rails
  };
}

/** In-memory seen-set for Idempotency-Key on idempotent POSTs (ledger/billing). */
const lastResults = new Map<string, unknown>();

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

  // Post a single credit/debit (idempotent via Idempotency-Key header).
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
  }>(
    '/api/v1/ledger/post',
    {
      schema: {
        body: {
          type: 'object',
          required: ['community', 'fund', 'amountBasis', 'kind', 'type'],
          additionalProperties: false,
          properties: {
            community: { type: 'string', minLength: 1 },
            fund: { type: 'string' },
            amountBasis: { type: 'integer', not: { const: 0 } },
            kind: { type: 'string', enum: ['credit', 'debit'] },
            type: { type: 'string' },
            description: { type: 'string' },
            referenceCode: { type: 'string' },
            reconRef: { type: 'string' }
          }
        }
      }
    },
    async (req) => {
      const idem = req.headers['idempotency-key'];
      if (idem) {
        const cached = lastResults.get(`ledger:${idem}`);
        if (cached) return cached;
      }
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
      const result = { posted: true, seq: row.seq, tallyRoot: row.tallyRoot.slice(0, 8) };
      if (idem) lastResults.set(`ledger:${idem}`, result);
      return result;
    }
  );

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

  // Build a rail quote; idempotent per (refId, unitRef, rail) via the payment store.
  app.post<{
    Body: {
      rail: Rail;
      refId: string;
      unitRef: string;
      amountBasis: number;
      currency: 'CAD' | 'BTC';
      recipient: string;
      communityId?: string;
      note?: string;
    };
  }>('/api/v1/payments/quote', async (req) => {
    const b = req.body;
    const registry = deps.config.rails ?? {};
    if (!registry[b.rail]?.enabled) {
      return { ok: false, reason: `rail '${b.rail}' is not enabled` };
    }
    try {
      const { request, created } = await getOrCreateQuote(
        deps.payments,
        {
          refId: b.refId,
          unitRef: b.unitRef,
          communityId: b.communityId ?? '',
          rail: b.rail,
          amountBasis: b.amountBasis,
          currency: b.currency,
          recipient: b.recipient
        },
        () =>
          quotePayment(
            {
              refId: b.refId,
              communityId: b.communityId ?? '',
              unitRef: b.unitRef,
              amountBasis: b.amountBasis,
              currency: b.currency,
              rail: b.rail,
              note: b.note
            },
            b.recipient,
            new Date(),
            deps.config.cadPerBtc ?? 0
          )
      );
      const invoice = {
        rail: request.rail,
        referenceCode: request.referenceCode,
        recipient: request.recipient,
        invoice: request.invoice || undefined,
        fiatLockedBasis: request.fiatLockedBasis || undefined,
        amountSat: request.amountSat || undefined,
        expiresAt: request.expiresAt,
        status: request.status
      };
      return { ok: true, created, invoice };
    } catch (err) {
      return { ok: false, reason: (err as Error).message };
    }
  });

  // Confirm a rail payment by its shared referenceCode -> mark paid AND post to
  // the unit's AR ledger account (reconciles like an e-transfer would).
  app.post<{ Body: { referenceCode: string; community?: string } }>(
    '/api/v1/payments/confirm',
    {
      schema: {
        body: {
          type: 'object',
          required: ['referenceCode'],
          additionalProperties: false,
          properties: { referenceCode: { type: 'string', minLength: 1 }, community: { type: 'string' } }
        }
      }
    },
    async (req) => {
      const req0 = await deps.payments.findByReference(req.body.referenceCode);
      if (!req0) return { ok: false, reason: 'unknown referenceCode' };
      if (req0.status !== 'quoted') return { ok: false, reason: `request is ${req0.status}, not quoted` };

      // Post the confirmed amount to the unit's AR ledger (credit).
      const community = (req.body.community ?? req0.communityId) || 'demo';
      const kind = req0.amountBasis >= 0 ? ('credit' as const) : ('debit' as const);
      const row = await deps.ledger.post(
        community,
        req0.referenceCode,
        Math.abs(req0.amountBasis),
        kind,
        { type: 'strata_fee', referenceCode: req0.referenceCode, reconRef: req0.referenceCode }
      );
      await deps.payments.markStatus(req0.referenceCode, 'paid');
      return { ok: true, seq: row.seq, referenceCode: req0.referenceCode, status: 'paid' };
    }
  );

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

  // ------------------------------------------------ Conveyancing (Form B/F)
  app.post<{
    Body: {
      kind: 'B' | 'F';
      unitId: string;
      requestedAt: string;
      balanceBasis: number;
      arrearsBasis?: number;
      crfBasis?: number;
      pendingCases?: string[];
      eprDisclosed?: boolean;
      requester?: string;
    };
  }>('/api/v1/forms', async (req) => {
    const b = req.body;
    const form = generateForm(
      { kind: b.kind, unitId: b.unitId, requestedAt: b.requestedAt, requester: b.requester },
      {
        unitId: b.unitId,
        balanceBasis: b.balanceBasis,
        arrearsBasis: b.arrearsBasis ?? b.balanceBasis,
        crfBasis: b.crfBasis,
        pendingCases: b.pendingCases,
        eprDisclosed: b.eprDisclosed
      },
      new Date().toISOString().slice(0, 10)
    );
    return form;
  });

  // ------------------------------------------------ Meetings (quorum + voting)
  app.post<{
    Body: {
      type: 'AGM' | 'SGM' | 'council' | 'rescheduled';
      eligible: number;
      present: number;
      councilSize?: number;
    };
  }>('/api/v1/meetings/quorum', async (req) => {
    const b = req.body;
    return b.type === 'rescheduled'
      ? checkQuorumRescheduled(b.present)
      : checkQuorum(b.type, b.eligible, b.present, b.councilSize ?? 0);
  });

  app.post<{
    Body: {
      threshold: 'majority' | 'three_quarter' | 'eighty' | 'unanimous';
      eligible: number;
      present: number;
      yes: number;
      no: number;
      abstain: number;
    };
  }>('/api/v1/meetings/vote', async (req) => {
    const b = req.body;
    try {
      return countVote(b.threshold, { eligible: b.eligible, present: b.present, yes: b.yes, no: b.no, abstain: b.abstain });
    } catch (err) {
      return { ok: false, reason: (err as Error).message };
    }
  });

  return app;
}