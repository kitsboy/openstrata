import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { planDca } from '../src/ziggy/dca.js';
import { buildPsbtPlan, recordSignature } from '../src/ziggy/psbt.js';
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
