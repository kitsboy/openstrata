import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { planDca } from '../src/ziggy/dca.js';
import { buildPsbtPlan, recordSignature, type PsbtPlan } from '../src/ziggy/psbt.js';
import { broadcastPsbt, postSpendToLedger, signedCount } from '../src/ziggy/broadcast.js';
import { buildServer } from '../src/api/server.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { MemLedgerStore, MemPaymentRequestStore, MemAuthStore } from './memstore.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';

const AUTH_SECRET = 'bitcoin-modules-test-secret';
const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual operating contribution must be paid into the contingency reserve fund.'
  }
];

describe('planDca', () => {
  it('produces a fixed-CAD schedule with sats at the current rate', () => {
    const plan = planDca(
      {
        annualOperatingBudgetBasis: 10_000_000, // $100k
        allocationPerPeriodBasis: 50_000, // $500/mo
        frequency: 'monthly',
        periods: 3,
        cadPerBtc: 100_000
      },
      '2026-09-01'
    );
    expect(plan.periods).toHaveLength(3);
    expect(plan.periods[0]).toMatchObject({ index: 1, date: '2026-09-01', cadBasis: 50_000 });
    // $500 / $100k-per-BTC = 0.005 BTC = 500,000 sats
    expect(plan.periods[0].sats).toBe(500_000);
    expect(plan.periods[1].date).toBe('2026-10-01');
    expect(plan.totalCadBasis).toBe(150_000);
    expect(plan.disclosurePct).toBeCloseTo(1.5);
  });

  it('steps weekly by 7 days and biweekly by 14', () => {
    const weekly = planDca(
      { annualOperatingBudgetBasis: 100_000, allocationPerPeriodBasis: 1000, frequency: 'weekly', periods: 2, cadPerBtc: 0 },
      '2026-09-01'
    );
    expect(weekly.periods[1].date).toBe('2026-09-08');
    expect(weekly.periods[0].sats).toBe(0); // no rate → 0 sats, plan still valid
  });

  it('rejects a zero/negative allocation', () => {
    expect(() =>
      planDca({
        annualOperatingBudgetBasis: 100_000,
        allocationPerPeriodBasis: 0,
        frequency: 'monthly',
        periods: 1,
        cadPerBtc: 100_000
      })
    ).toThrow();
  });
});

describe('PSBT execution seam', () => {
  const verdict = { allow: true as const, reason: 'approved', pulledFrom: 'war_chest', basis: 500_000 };

  it('builds a plan from an authorized spend and refuses a blocked one', () => {
    const plan = buildPsbtPlan({
      verdict,
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: 'bc1qexample',
      inputs: [{ txid: 'abc', vout: 0, sats: 600_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    expect(plan.ready).toBe(false);
    expect(plan.requiredSignatures).toBe(3);
    expect(plan.authorization.fundCode).toBe('war_chest');

    expect(() =>
      buildPsbtPlan({
        verdict: { allow: false as const, reason: 'crf floor', blocked: 'crf-floor' },
        amountSats: 1,
        feeSats: 0,
        recipient: 'x',
        inputs: [],
        totalSigners: 5,
        requiredSignatures: 3
      })
    ).toThrow(/blocked/);
  });

  it('rejects insufficient UTXOs', () => {
    expect(() =>
      buildPsbtPlan({
        verdict,
        amountSats: 1_000_000,
        feeSats: 0,
        recipient: 'x',
        inputs: [{ txid: 'abc', vout: 0, sats: 100 }],
        totalSigners: 5,
        requiredSignatures: 3
      })
    ).toThrow(/insufficient inputs/);
  });

  it('becomes ready exactly at the signature threshold', () => {
    let plan = buildPsbtPlan({
      verdict,
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: 'bc1qexample',
      inputs: [{ txid: 'abc', vout: 0, sats: 600_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    for (const index of [0, 1]) {
      const res = recordSignature(plan, index, `sig-${index}`);
      plan = res.plan;
      expect(res.ready).toBe(false);
    }
    const final = recordSignature(plan, 2, 'sig-2');
    expect(final.ready).toBe(true);
  });

  it('signedCount reflects signed slots', () => {
    let plan = buildPsbtPlan({
      verdict,
      amountSats: 100_000,
      feeSats: 1_000,
      recipient: 'bc1x',
      inputs: [{ txid: 't', vout: 0, sats: 200_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    expect(signedCount(plan)).toBe(0);
    plan = recordSignature(plan, 0, 'sig0').plan;
    expect(signedCount(plan)).toBe(1);
    plan = recordSignature(plan, 2, 'sig2').plan;
    expect(signedCount(plan)).toBe(2);
  });

  it('broadcastPsbt refuses a non-ready plan', () => {
    const plan = buildPsbtPlan({
      verdict,
      amountSats: 100_000,
      feeSats: 1_000,
      recipient: 'bc1x',
      inputs: [{ txid: 't', vout: 0, sats: 200_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    const res = broadcastPsbt({ plan, ledger: null as any, communityId: 'c' });
    expect(res.broadcasted).toBe(false);
    expect(res.reason).toMatch(/not ready/);
  });

  it('broadcastPsbt marks a ready plan broadcasted (ledger post is caller-side)', () => {
    let plan = buildPsbtPlan({
      verdict,
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: 'bc1qexample',
      inputs: [{ txid: 'abc', vout: 0, sats: 600_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    plan = recordSignature(plan, 0, 's0').plan;
    plan = recordSignature(plan, 1, 's1').plan;
    plan = recordSignature(plan, 2, 's2').plan;
    expect(plan.ready).toBe(true);

    const res = broadcastPsbt({ plan, ledger: null as any, communityId: 'c' });
    expect(res.broadcasted).toBe(true);
    expect(res.txid).toBeNull(); // stub — real node client fills this
  });

  it('postSpendToLedger posts a debit for the authorized fund', async () => {
    const store = new MemLedgerStore();
    const ledger = new LedgerEngine(store);
    const plan = buildPsbtPlan({
      verdict: { allow: true, reason: 'ok', pulledFrom: 'operating', basis: 500_000 },
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: 'bc1x',
      inputs: [{ txid: 't', vout: 0, sats: 600_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    const posted = await postSpendToLedger(plan, ledger, 'demo-cedar-point', 500_000, 'test spend');
    expect(posted.seq).toBe(1);
    const bal = await ledger.balance('demo-cedar-point', 'operating');
    expect(bal.balanceBasis).toBe(-500_000);
  });
});

describe('PSBT broadcast endpoint (item #15 continuation)', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    app = await buildServer(
      {
        ledger: new LedgerEngine(new MemLedgerStore()),
        rosa: keywordRetriever([]),
        reconcile,
        payments: new MemPaymentRequestStore(),
        auth: new MemAuthStore(),
        units: DEFAULT_UNITS,
        config: {
          crfMandatoryPct: 10,
          vectorCollection: 'bc_spa_rta_crt',
          rails: { fiat: { enabled: true } },
          cadPerBtc: 50_000,
          authSecret: 'broadcast-test-secret',
          authTokenTtl: 3600,
          authRateLimitMax: 1000,
          authRateLimitWindowMs: 60_000
        }
      },
      { logger: false }
    );
    await app.ready();
    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { councilName: 'Broadcast Test', email: 'bcast@test.dev', password: 'password123' }
    });
    expect(reg.statusCode).toBe(200);
    token = reg.json().token as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('builds a plan then broadcasts it (stub txid)', async () => {
    // Build the plan.
    const planRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/plan',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        verdict: { allow: true, reason: 'approved', pulledFrom: 'operating', basis: 500_000 },
        amountSats: 490_000,
        feeSats: 5_000,
        recipient: 'bc1qexample',
        inputs: [{ txid: 'abc', vout: 0, sats: 600_000 }],
        totalSigners: 5,
        requiredSignatures: 3
      }
    });
    expect(planRes.statusCode).toBe(200);
    const planBody = planRes.json();
    expect(planBody.ok).toBe(true);
    expect(planBody.plan.ready).toBe(false);

    // Sign to threshold, then broadcast.
    const signed = recordSignature(planBody.plan, 0, 'sig0');
    const ready = recordSignature(signed.plan, 1, 'sig1');
    const completed = recordSignature(ready.plan, 2, 'sig2');
    expect(completed.ready).toBe(true);

    const broadcastRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/broadcast',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        planId: completed.plan.id,
        readyPlan: completed.plan,
        postToLedger: false,
        amountBasis: 500_000
      }
    });
    expect(broadcastRes.statusCode).toBe(200);
    const b = broadcastRes.json();
    expect(b.ok).toBe(true);
    expect(b.broadcasted).toBe(true);
    expect(b.txid).toBeNull(); // stub — no node client
    expect(b.signedCount).toBe(3);
  });

  it('broadcast with postToLedger posts the debit to the fund', async () => {
    const planRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/plan',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        verdict: { allow: true, reason: 'approved', pulledFrom: 'operating', basis: 250_000 },
        amountSats: 245_000,
        feeSats: 5_000,
        recipient: 'bc1qexample',
        inputs: [{ txid: 'abc', vout: 0, sats: 300_000 }],
        totalSigners: 5,
        requiredSignatures: 3
      }
    });
    const planBody = planRes.json();

    // Sign to threshold.
    let plan = planBody.plan;
    for (const i of [0, 1, 2]) {
      plan = recordSignature(plan, i, `sig${i}`).plan;
    }

    const broadcastRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/broadcast',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        planId: plan.id,
        readyPlan: plan,
        postToLedger: true,
        amountBasis: 250_000
      }
    });
    expect(broadcastRes.statusCode).toBe(200);
    const b = broadcastRes.json();
    expect(b.broadcasted).toBe(true);
    expect(b.ledgerSeq).toBe(1);

    // The debit landed on the operating fund.
    const bal = await app.inject({
      method: 'GET',
      url: '/api/v1/ledger/balance?fund=operating',
      headers: { authorization: `Bearer ${token}` }
    });
    expect(bal.json().balanceBasis).toBe(-250_000);
  });

  it('broadcast rejects when the plan is not ready', async () => {
    const planRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/plan',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        verdict: { allow: true, reason: 'approved', pulledFrom: 'operating', basis: 100_000 },
        amountSats: 95_000,
        feeSats: 5_000,
        recipient: 'bc1x',
        inputs: [{ txid: 't', vout: 0, sats: 200_000 }],
        totalSigners: 5,
        requiredSignatures: 3
      }
    });
    const planBody = planRes.json();

    const broadcastRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/broadcast',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        planId: planBody.plan.id,
        readyPlan: planBody.plan,
        postToLedger: false
      }
    });
    expect(broadcastRes.statusCode).toBe(200);
    expect(broadcastRes.json().broadcasted).toBe(false);
  });
});

describe('compliance/stamp endpoint', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    app = await buildServer(
      {
        ledger: new LedgerEngine(new MemLedgerStore()),
        rosa: keywordRetriever(corpus),
        reconcile,
        payments: new MemPaymentRequestStore(),
        auth: new MemAuthStore(),
        units: DEFAULT_UNITS,
        config: {
          crfMandatoryPct: 10,
          vectorCollection: 'bc_spa_rta_crt',
          rails: { fiat: { enabled: true } },
          cadPerBtc: 50_000,
          authSecret: AUTH_SECRET,
          authTokenTtl: 3600,
          authRateLimitMax: 1000,
          authRateLimitWindowMs: 60_000
        }
      },
      { logger: false }
    );
    await app.ready();
    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { councilName: 'Stamp Test', email: 'stamp@test.dev', password: 'password123' }
    });
    expect(reg.statusCode).toBe(200);
    token = reg.json().token as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a deterministic sha256 hash + satohash stamp URL for a payload', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/compliance/stamp',
      headers: { authorization: `Bearer ${token}` },
      payload: { scope: 'fee_receipt', payload: { refId: 'unit-101', amountBasis: 4200 } }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(body.stampUrl).toContain('https://satohash.io/stamp?hash=');
  });

  it('requires authentication', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/compliance/stamp',
      payload: { scope: 'x', payload: {} }
    });
    expect(res.statusCode).toBe(401);
  });
});
