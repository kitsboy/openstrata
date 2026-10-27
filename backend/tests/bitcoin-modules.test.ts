import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { planDca } from '../src/ziggy/dca.js';
import { buildPsbtPlan, recordSignature, type PsbtPlan } from '../src/ziggy/psbt.js';
import { broadcastPsbt, postSpendToLedger, signedCount } from '../src/ziggy/broadcast.js';
import { broadcastPsbtWorkflow, broadcastRawTx, planSummary, serializePsbtSkeleton, type BitcoindRpcConfig } from '../src/ziggy/node-broadcast.js';
import { buildServer } from '../src/api/server.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { MemLedgerStore, MemPaymentRequestStore, MemAuthStore } from './memstore.js';
import { authorizeSpend } from '../src/ziggy/ziggy.js';
import type { Budget } from '../src/ziggy/ziggy.js';

const planBudget: Budget = { fiscalYear: '2026', totalOperatingBasis: 10_000_000, crfMandatoryPct: 10 };
const approvedPlanVerdict = (amountBasis: number, fundCode = 'operating') => authorizeSpend(
  planBudget,
  { operating: 10_000_000, crf: 1_000_000, war_chest: amountBasis },
  { amountBasis, fundCode, poRef: 'approved', category: 'approved' }
);
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
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 600_000 }],
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
        recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
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
        recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
        inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 100 }],
        totalSigners: 5,
        requiredSignatures: 3
      })
    ).toThrow(/insufficient inputs/);
  });

  it('rejects invalid addresses, duplicate outpoints, and excessive fees', () => {
    const input = {
      verdict,
      amountSats: 100_000,
      feeSats: 1_000,
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', vout: 0, sats: 200_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    };
    expect(() => buildPsbtPlan({ ...input, recipient: 'bc1qfake' })).toThrow(/invalid recipient/);
    expect(() => buildPsbtPlan({ ...input, inputs: [input.inputs[0], input.inputs[0]] })).toThrow(/duplicate input/);
    expect(() => buildPsbtPlan({ ...input, feeSats: 100_001 })).toThrow(/feeSats exceeds/);
  });

  it('becomes ready exactly at the signature threshold', () => {
    let plan = buildPsbtPlan({
      verdict,
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 600_000 }],
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
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', vout: 0, sats: 200_000 }],
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
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', vout: 0, sats: 200_000 }],
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
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 600_000 }],
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
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', vout: 0, sats: 600_000 }],
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
  let councilId: string;
  let ledger: LedgerEngine;

  beforeAll(async () => {
    ledger = new LedgerEngine(new MemLedgerStore());
    app = await buildServer(
      {
        ledger,
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
    councilId = reg.json().council.id as string;
    await ledger.post(councilId, 'operating', 10_000_000, 'credit', { type: 'seed' });
    await ledger.post(councilId, 'crf', 1_000_000, 'credit', { type: 'seed' });
  });

  afterAll(async () => {
    await app.close();
  });

  const signAndSubmit = async (plan: PsbtPlan) => {
    const signatures = { '0': 'c2lnMA==', '1': 'c2lnMQ==', '2': 'c2lnMg==' };
    return app.inject({
      method: 'POST', url: '/api/v1/treasury/psbt/broadcast', headers: { authorization: `Bearer ${token}` },
      payload: { planId: plan.id, readyPlan: { ...plan, signatures, ready: true }, postToLedger: false }
    });
  };

  it('builds a plan then broadcasts it (stub txid)', async () => {
    // Build the plan.
    const planRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/plan',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        verdict: approvedPlanVerdict(500_000),
        amountSats: 490_000,
        feeSats: 5_000,
        recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
        inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 600_000 }],
        totalSigners: 5,
        requiredSignatures: 3
      }
    });
    expect(planRes.statusCode).toBe(200);
    const planBody = planRes.json();
    expect(planBody.ok, JSON.stringify(planBody)).toBe(true);
    expect(planBody.plan.ready).toBe(false);

    // Sign to threshold, then broadcast.
    const signed = recordSignature(planBody.plan, 0, 'c2lnMA==');
    const ready = recordSignature(signed.plan, 1, 'c2lnMQ==');
    const completed = recordSignature(ready.plan, 2, 'c2lnMg==');
    expect(completed.ready).toBe(true);

    const broadcastRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/broadcast',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        planId: completed.plan.id,
        readyPlan: { ...completed.plan, signatures: completed.plan.signatures, ready: completed.plan.ready },
        postToLedger: false,
        amountBasis: 500_000
      }
    });
    expect(broadcastRes.statusCode, JSON.stringify(broadcastRes.json())).toBe(200);
    const b = broadcastRes.json();
    expect(b.ok).toBe(true);
    expect(b.broadcasted).toBe(true);
    // Demo/bootstrap (rail off): placeholder txid, explicitly tagged so it can
    // never be read as a spend that reached the chain.
    expect(b.txid).toMatch(/^psbt:/);
    expect(b.placeholder).toBe(true);
    expect(b.rail).toBeUndefined();
    expect(b.signedCount).toBe(3);

    const replay = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/broadcast',
      headers: { authorization: `Bearer ${token}` },
      payload: { planId: completed.plan.id, readyPlan: { ...completed.plan, signatures: completed.plan.signatures, ready: true }, postToLedger: false }
    });
    expect(replay.statusCode).toBe(409);
  });

  it('planSummary reflects plan state', () => {
    const v = { allow: true as const, reason: 'approved', pulledFrom: 'war_chest', basis: 500_000 };
    let plan = buildPsbtPlan({
      verdict: v,
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 600_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    expect(planSummary(plan)).toMatchObject({ ready: false, signed: 0, required: 3, amountSats: 490_000, recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT' });
    plan = recordSignature(plan, 0, 's0').plan;
    plan = recordSignature(plan, 1, 's1').plan;
    plan = recordSignature(plan, 2, 's2').plan;
    expect(planSummary(plan)).toMatchObject({ ready: true, signed: 3 });
  });

  it('broadcastRawTx demo path (rail off): unreachable node yields the deterministic placeholder txid', async () => {
    const v = { allow: true as const, reason: 'approved', pulledFrom: 'war_chest', basis: 500_000 };
    let plan = buildPsbtPlan({
      verdict: v,
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 600_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    plan = recordSignature(plan, 0, 's0').plan;
    plan = recordSignature(plan, 1, 's1').plan;
    plan = recordSignature(plan, 2, 's2').plan;
    expect(plan.ready).toBe(true);

    const btc: BitcoindRpcConfig = { url: 'http://127.0.0.1:9999', user: 'u', pass: 'p' };
    // Demo/bootstrap seam (documented in node-broadcast.ts): with the rail OFF
    // (no railEnabled) the seam does NOT hit the node — it returns a
    // deterministic placeholder txid `psbt:<planId>:<shortHash>` plus the raw-tx
    // skeleton hex, so the endpoint/receipts/reconcile path can iterate before a
    // node is configured. The broadcast endpoint tags it placeholder:true.
    const out = await broadcastRawTx(plan, btc, [{ address: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT', sats: 490_000 }], { railEnabled: false });
    expect(out.txid).toMatch(/^psbt:/);
    expect(out.hex).toMatch(/^[0-9a-f]+$/);
    // Deterministic: same plan + same outputs → same placeholder txid.
    const again = await broadcastRawTx(plan, btc, [{ address: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT', sats: 490_000 }], { railEnabled: false });
    expect(again.txid).toBe(out.txid);
  });

  it('broadcastRawTx real-rail path (rail on): unreachable node THROWS — no placeholder escapes', async () => {
    const v = { allow: true as const, reason: 'approved', pulledFrom: 'war_chest', basis: 500_000 };
    let plan = buildPsbtPlan({
      verdict: v,
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 600_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    plan = recordSignature(plan, 0, 's0').plan;
    plan = recordSignature(plan, 1, 's1').plan;
    plan = recordSignature(plan, 2, 's2').plan;
    expect(plan.ready).toBe(true);

    const btc: BitcoindRpcConfig = { url: 'http://127.0.0.1:9999', user: 'u', pass: 'p' };
    // Real-rail path: sendRawTransaction against an unreachable node must throw
    // so the endpoint can report txid:null + rail:'unavailable'. The placeholder
    // must never be substituted on the rail-enabled path.
    await expect(
      broadcastRawTx(plan, btc, [{ address: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT', sats: 490_000 }], { railEnabled: true })
    ).rejects.toThrow();
  });

  it('serializePsbtSkeleton: deterministic BIP174-shaped PSBT from the plan', () => {
    const v = { allow: true as const, reason: 'approved', pulledFrom: 'war_chest', basis: 500_000 };
    let plan = buildPsbtPlan({
      verdict: v,
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 600_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    plan = recordSignature(plan, 0, 's0').plan;
    plan = recordSignature(plan, 1, 's1').plan;

    const psbt1 = serializePsbtSkeleton(plan);
    const psbt2 = serializePsbtSkeleton(plan);
    expect(psbt1).toBe(psbt2); // deterministic

    // Minimal BIP174 map parser: magic | global map | input maps | output maps,
    // each map a sequence of <klen><key><vlen><value> pairs ended by 0x00.
    const buf = Buffer.from(psbt1, 'base64');
    expect(buf.subarray(0, 5).toString('hex')).toBe('70736274ff'); // "psbt" + 0xff
    let p = 5;
    const readKv = () => {
      const klen = buf[p++];
      const key = Buffer.from(buf.subarray(p, p + klen)); p += klen;
      const vlen = buf[p++]; // single-byte varint (skeleton values are small)
      const value = Buffer.from(buf.subarray(p, p + vlen)); p += vlen;
      return { key, value };
    };
    const readMap = () => {
      const keyTypes: number[] = [];
      while (buf[p] !== 0x00) keyTypes.push(readKv().key[0]);
      p++; // separator
      return keyTypes;
    };
    const globalTypes = readMap();
    expect(globalTypes).toEqual([0x00]); // PSBT_GLOBAL_UNSIGNED_TX
    const maps: number[][] = [];
    while (p < buf.length) maps.push(readMap());
    // 1 input map (one 0x02 partial-sig key per recorded signature) + 1 empty output map.
    expect(maps).toEqual([[0x02, 0x02], []]);
  });

  it('broadcastPsbtWorkflow: passes plan.psbtB64 (the aggregated coordinator PSBT) to the node when set', async () => {
    const v = { allow: true as const, reason: 'approved', pulledFrom: 'war_chest', basis: 500_000 };
    let plan = buildPsbtPlan({
      verdict: v,
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 600_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    plan = recordSignature(plan, 0, 's0').plan;
    plan = recordSignature(plan, 1, 's1').plan;
    plan = recordSignature(plan, 2, 's2').plan;
    const aggregated = Buffer.from('aggregated-coordinator-psbt').toString('base64');
    plan = { ...plan, psbtB64: aggregated };

    const btc: BitcoindRpcConfig = { url: 'http://127.0.0.1:9999', user: 'u', pass: 'p' };
    const bodies: string[] = [];
    const origFetch = globalThis.fetch;
    globalThis.fetch = (async (_url: unknown, init?: { body?: string }) => {
      bodies.push(String(init?.body));
      throw new Error('fetch failed');
    }) as typeof fetch;
    try {
      await expect(broadcastPsbtWorkflow(plan, btc)).rejects.toThrow(/fetch failed/i);
    } finally {
      globalThis.fetch = origFetch;
    }
    expect(bodies.length).toBe(1);
    expect(bodies[0]).toContain(JSON.stringify(aggregated).slice(1, -1));
  });

  it('rail ON + node unreachable → txid:null + rail:"unavailable" + placeholder:false (Lenny t_2fda9855)', async () => {
    const planRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/plan',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        verdict: approvedPlanVerdict(200_000),
        amountSats: 195_000,
        feeSats: 5_000,
        recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
        inputs: [{ txid: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', vout: 0, sats: 300_000 }],
        totalSigners: 5,
        requiredSignatures: 3
      }
    });
    expect(planRes.statusCode).toBe(200);
    let plan = planRes.json().plan as PsbtPlan;
    for (const i of [0, 1, 2]) plan = recordSignature(plan, i, `c2ln${i}==`).plan;
    expect(plan.ready).toBe(true);

    process.env.BITCOIN_RAIL_ENABLED = 'true';
    process.env.BITCOIN_NODE_URL = 'http://127.0.0.1:9999';
    try {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/treasury/psbt/broadcast',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          planId: plan.id,
          readyPlan: plan,
          postToLedger: false,
          amountBasis: 200_000
        }
      });
      expect(res.statusCode, JSON.stringify(res.json())).toBe(503);
      expect(res.json()).toMatchObject({ ok: false, broadcasted: false, txid: null, rail: 'unavailable', placeholder: false });
    } finally {
      delete process.env.BITCOIN_RAIL_ENABLED;
      delete process.env.BITCOIN_NODE_URL;
    }
  });

  it('rail OFF + node unreachable → txid:"psbt:…" + placeholder:true (demo) — distinguishable tri-state', async () => {
    const planRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/plan',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        verdict: approvedPlanVerdict(200_000),
        amountSats: 195_000,
        feeSats: 5_000,
        recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
        inputs: [{ txid: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', vout: 0, sats: 300_000 }],
        totalSigners: 5,
        requiredSignatures: 3
      }
    });
    expect(planRes.statusCode).toBe(200);
    let plan = planRes.json().plan as PsbtPlan;
    for (const i of [0, 1, 2]) plan = recordSignature(plan, i, `c2ln${i}==`).plan;
    expect(plan.ready).toBe(true);

    process.env.BITCOIN_RAIL_ENABLED = 'false';
    process.env.BITCOIN_NODE_URL = 'http://127.0.0.1:9999';
    try {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/treasury/psbt/broadcast',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          planId: plan.id,
          readyPlan: plan,
          postToLedger: false,
          amountBasis: 200_000
        }
      });
      expect(res.statusCode, JSON.stringify(res.json())).toBe(200);
      const b = res.json();
      // Demo/bootstrap keeps the placeholder but tags it explicitly.
      expect(b).toMatchObject({ ok: true, broadcasted: true, placeholder: true });
      expect(b.txid).toMatch(/^psbt:/);
      expect(b.rail).toBeUndefined();
    } finally {
      delete process.env.BITCOIN_RAIL_ENABLED;
      delete process.env.BITCOIN_NODE_URL;
    }
  });

  it('broadcastPsbtWorkflow: refuses a below-threshold plan before any RPC (same contract as broadcastPsbt)', async () => {
    const v = { allow: true as const, reason: 'approved', pulledFrom: 'war_chest', basis: 500_000 };
    let plan = buildPsbtPlan({
      verdict: v,
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 600_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    plan = recordSignature(plan, 0, 's0').plan;
    plan = recordSignature(plan, 1, 's1').plan;
    expect(plan.ready).toBe(false); // 2 of 3

    const btc: BitcoindRpcConfig = { url: 'http://127.0.0.1:9999', user: 'u', pass: 'p' };
    const bodies: string[] = [];
    const origFetch = globalThis.fetch;
    globalThis.fetch = (async (_url: unknown, init?: { body?: string }) => {
      bodies.push(String(init?.body));
      throw new Error('fetch must never happen for a below-threshold plan');
    }) as typeof fetch;
    try {
      await expect(broadcastPsbtWorkflow(plan, btc)).rejects.toThrow(/plan not ready/i);
      expect(bodies.length).toBe(0); // refused before any RPC
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it('broadcastPsbtWorkflow: throws (never fabricates) when the node is unreachable', async () => {
    const v = { allow: true as const, reason: 'approved', pulledFrom: 'war_chest', basis: 500_000 };
    let plan = buildPsbtPlan({
      verdict: v,
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 600_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    plan = recordSignature(plan, 0, 's0').plan;
    plan = recordSignature(plan, 1, 's1').plan;
    plan = recordSignature(plan, 2, 's2').plan;
    plan = { ...plan, psbtB64: null };

    const btc: BitcoindRpcConfig = { url: 'http://127.0.0.1:9999', user: 'u', pass: 'p' };
    await expect(broadcastPsbtWorkflow(plan, btc)).rejects.toThrow(/fetch failed|bitcoind|walletprocesspsbt/i);
  });

  it('broadcastPsbtWorkflow: throws when sendpsbt returns a non-txid result', async () => {
    const v = { allow: true as const, reason: 'approved', pulledFrom: 'war_chest', basis: 500_000 };
    let plan = buildPsbtPlan({
      verdict: v,
      amountSats: 490_000,
      feeSats: 5_000,
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', vout: 0, sats: 600_000 }],
      totalSigners: 5,
      requiredSignatures: 3
    });
    plan = recordSignature(plan, 0, 's0').plan;
    plan = recordSignature(plan, 1, 's1').plan;
    plan = recordSignature(plan, 2, 's2').plan;

    const btc: BitcoindRpcConfig = { url: 'http://127.0.0.1:9101', user: 'u', pass: 'p' };
    const origFetch = globalThis.fetch;
    let call = 0;
    globalThis.fetch = (async () => {
      call++;
      const result = call === 1 ? 'cHNidP8=' : call === 2 ? { hex: 'deadbeef', complete: true } : 'not-a-txid';
      return new Response(JSON.stringify({ result, error: null }), { status: 200 });
    }) as typeof fetch;
    try {
      await expect(broadcastPsbtWorkflow(plan, btc)).rejects.toThrow(/sendpsbt returned an unexpected result/i);
      expect(call).toBe(3); // walletprocesspsbt → finalizepsbt → sendpsbt
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it('broadcast with postToLedger refuses an unverified spend without debiting the ledger', async () => {
    const planRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/plan',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        verdict: approvedPlanVerdict(250_000),
        amountSats: 245_000,
        feeSats: 5_000,
        recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
        inputs: [{ txid: '1111111111111111111111111111111111111111111111111111111111111111', vout: 0, sats: 300_000 }],
        totalSigners: 5,
        requiredSignatures: 3
      }
    });
    const planBody = planRes.json();
    const signatures = { '0': 'c2lnMA==', '1': 'c2lnMQ==', '2': 'c2lnMg==' };

    const broadcastRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/broadcast',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        planId: planBody.plan.id,
        readyPlan: { ...planBody.plan, signatures, ready: true },
        postToLedger: true,
        amountBasis: 250_000
      }
    });
    expect(broadcastRes.statusCode).toBe(409);
    expect(broadcastRes.json().reason).toContain('ledger posting is disabled');
    const bal = await app.inject({
      method: 'GET',
      url: '/api/v1/ledger/balance?fund=operating',
      headers: { authorization: `Bearer ${token}` }
    });
    expect(bal.json().balanceBasis).toBe(10_000_000);
  });

  it('rejects a second active plan that attempts to reserve the same council UTXO', async () => {
    const planRequest = {
      verdict: approvedPlanVerdict(200_000),
      amountSats: 195_000, feeSats: 5_000, recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      inputs: [{ txid: 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd', vout: 0, sats: 300_000 }],
      totalSigners: 5, requiredSignatures: 3
    };
    const first = await app.inject({ method: 'POST', url: '/api/v1/treasury/psbt/plan', headers: { authorization: `Bearer ${token}` }, payload: planRequest });
    expect(first.statusCode).toBe(200);
    const second = await app.inject({ method: 'POST', url: '/api/v1/treasury/psbt/plan', headers: { authorization: `Bearer ${token}` }, payload: planRequest });
    expect(second.statusCode).toBe(409);
    expect(second.json().reason).toContain('already reserved');
  });

  it('broadcast rejects forged signatures and changed plans, and accepts signatures only in the plan field', async () => {
    const planned = await app.inject({
      method: 'POST', url: '/api/v1/treasury/psbt/plan', headers: { authorization: `Bearer ${token}` },
      payload: {
        verdict: approvedPlanVerdict(200_000),
        amountSats: 195_000, feeSats: 5_000, recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
        inputs: [{ txid: '9999999999999999999999999999999999999999999999999999999999999999', vout: 0, sats: 300_000 }],
        totalSigners: 5, requiredSignatures: 3
      }
    });
    expect(planned.statusCode).toBe(200);
    const plan = planned.json().plan as PsbtPlan;
    const signatures = { '0': 'c2lnMA==', '1': 'c2lnMQ==', '2': 'c2lnMg==' };
    const readyPlan = { ...plan, signatures, ready: true };

    const invalidExtra = await app.inject({
      method: 'POST', url: '/api/v1/treasury/psbt/broadcast', headers: { authorization: `Bearer ${token}` },
      payload: { planId: plan.id, readyPlan, signatures, postToLedger: false }
    });
    expect(invalidExtra.statusCode).toBe(400);

    const forged = await app.inject({
      method: 'POST', url: '/api/v1/treasury/psbt/broadcast', headers: { authorization: `Bearer ${token}` },
      payload: { planId: plan.id, readyPlan: { ...readyPlan, authorization: { ...plan.authorization, amountBasis: 1 } }, postToLedger: false }
    });
    expect(forged.statusCode).toBe(409);

    const accepted = await app.inject({
      method: 'POST', url: '/api/v1/treasury/psbt/broadcast', headers: { authorization: `Bearer ${token}` },
      payload: { planId: plan.id, readyPlan, postToLedger: false }
    });
    expect(accepted.statusCode).toBe(200);
    expect(accepted.json()).toMatchObject({ broadcasted: true, placeholder: true });
  });

  it('broadcast rejects when the plan is not ready', async () => {
    const planRes = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/psbt/plan',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        verdict: approvedPlanVerdict(100_000),
        amountSats: 95_000,
        feeSats: 5_000,
        recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
        inputs: [{ txid: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', vout: 0, sats: 200_000 }],
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

  it('endpoint: rail ON tries the PSBT workflow first, falls back to raw, and reports txid:null + rail:"unavailable" when both fail', async () => {
    const origUrl = process.env.BITCOIN_NODE_URL;
    const origEnabled = process.env.BITCOIN_RAIL_ENABLED;
    process.env.BITCOIN_NODE_URL = 'http://127.0.0.1:9999';
    process.env.BITCOIN_RAIL_ENABLED = 'true';
    try {
      const planRes = await app.inject({
        method: 'POST',
        url: '/api/v1/treasury/psbt/plan',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          verdict: approvedPlanVerdict(60_000),
          amountSats: 55_000,
          feeSats: 5_000,
          recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
          inputs: [{ txid: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', vout: 0, sats: 100_000 }],
          totalSigners: 5,
          requiredSignatures: 3
        }
      });
      let plan = planRes.json().plan as PsbtPlan;
      plan = recordSignature(plan, 0, 'sig0').plan;
      plan = recordSignature(plan, 1, 'sig1').plan;
      plan = recordSignature(plan, 2, 'sig2').plan;

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/treasury/psbt/broadcast',
        headers: { authorization: `Bearer ${token}` },
        payload: { planId: plan.id, readyPlan: plan, postToLedger: false }
      });
      expect(res.statusCode).toBe(503);
      const b = res.json();
      expect(b.ok).toBe(false);
      expect(b.broadcasted).toBe(false);
      // Live signing/broadcast is fail-closed (unreachable node) → raw seam also throws on the
      // rail path → the placeholder must NOT escape: txid:null + rail:'unavailable'.
      expect(b.txid).toBeNull();
      expect(b.rail).toBe('unavailable');
      expect(b.placeholder).toBe(false);
      expect(b.reason).toContain('verified signing and transaction construction are not implemented');
    } finally {
      if (origUrl === undefined) delete process.env.BITCOIN_NODE_URL;
      else process.env.BITCOIN_NODE_URL = origUrl;
      if (origEnabled === undefined) delete process.env.BITCOIN_RAIL_ENABLED;
      else process.env.BITCOIN_RAIL_ENABLED = origEnabled;
    }
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
