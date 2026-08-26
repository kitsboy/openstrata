import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/api/server.js';
import { MemLedgerStore, MemPaymentRequestStore, MemAuthStore } from './memstore.js';
import { bech32Encode } from '../src/rails/rails.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';

// Valid LNURL checksummed string (bech32) so rail validation passes.
const LNURL = bech32Encode('lnurl', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
import { LedgerEngine } from '../src/ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';

const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual operating contribution must be paid into the contingency reserve fund; funds must not be co-mingled.'
  }
];

const AUTH_SECRET = 'test-secret-0123456789';

let app: FastifyInstance;
let adminToken: string;
let councilId: string;

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

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
        rails: {
          fiat: { enabled: true },
          onchain: { enabled: true },
          lightning: { enabled: true, endpoint: 'grpc://127.0.0.1:10009' }
        },
        cadPerBtc: 50_000,
        authSecret: AUTH_SECRET,
        authTokenTtl: 3600
      }
    },
    { logger: false }
  );
  await app.ready();

  const reg = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    payload: { councilName: 'Server Test Council', email: 'admin@server.test', password: 'password123' }
  });
  expect(reg.statusCode).toBe(200);
  adminToken = reg.json().token as string;
  councilId = reg.json().council.id as string;
  expect(councilId).toBeTruthy();
});

afterAll(async () => {
  await app.close();
});

describe('fastify API', () => {
  it('GET /health', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json().service).toBe('openstrata-backend');
  });

  it('POST /api/v1/ledger/post then GET ledger/balance (scoped to the token council)', async () => {
    const post = await app.inject({
      method: 'POST',
      url: '/api/v1/ledger/post',
      headers: auth(adminToken),
      payload: {
        fund: 'operating',
        amountBasis: 4200,
        kind: 'credit',
        type: 'strata_fee',
        referenceCode: 'unit-101',
        reconRef: 'ET-100'
      }
    });
    expect(post.statusCode).toBe(200);
    expect(post.json().posted).toBe(true);

    const bal = await app.inject({
      method: 'GET',
      url: '/api/v1/ledger/balance?fund=operating',
      headers: auth(adminToken)
    });
    expect(bal.statusCode).toBe(200);
    expect(bal.json().balanceBasis).toBe(4200);
  });

  it('POST /api/v1/treasury/authorize hard-blocks a CRF breach', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/authorize',
      headers: auth(adminToken),
      payload: {
        balances: { crf: 500_000 },
        spend: { amountBasis: 100_000, fundCode: 'crf', poRef: 'PO-200', category: 'roofing' }
      }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ allow: false, blocked: 'crf-floor' });
  });

  it('POST /api/v1/rosa/query returns a citation-scoped answer (public)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rosa/query',
      payload: { question: 'What is the reserve fund percentage?' }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.cited).toContain('SPA s.92-96');
    expect(body.uncertain).toBe(false);
  });

  it('POST /api/v1/rosa/query fails closed for an unrelated question', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rosa/query',
      payload: { question: 'average rainfall omaha' }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().cited).toHaveLength(0);
    expect(res.json().uncertain).toBe(true);
  });

  it('POST /api/v1/treasury/reconcile auto-posts a unique unit reference', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/reconcile',
      headers: auth(adminToken),
      payload: {
        reference: 'Unit 302 May',
        units: [
          { unitId: '101', refs: ['101', 'unit101', 'chen'] },
          { unitId: '302', refs: ['302', 'unit302', 'chen'] }
        ]
      }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'auto', unitId: '302' });
  });

  it('POST /api/v1/billing/run posts charges and flags late notices', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/run',
      headers: auth(adminToken),
      payload: {
        period: '2026-09',
        dueDay: 1,
        graceDays: 5,
        lateFeeBasis: 2000,
        fees: [
          { unitId: '101', monthlyBasis: 35_000 },
          { unitId: '302', monthlyBasis: 48_500 }
        ],
        arrears: { '302': 99_000 },
        asOf: '2026-09-08'
      }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.run.charges).toHaveLength(2);
    expect(body.postedCount).toBe(2);
    expect(body.posted[0].seq).toBeGreaterThan(0);
    expect(body.run.lateNotices.map((n: { unitId: string }) => n.unitId)).toEqual(['302']);
  });

  it('bylaw lifecycle returns BLOCK_FINE_ACTIONS then allows a capped fine', async () => {
    // Create complaint
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/bylaw/complaint',
      headers: auth(adminToken),
      payload: {
        id: 'C-1', unitId: '302', bylawRef: 'STR ban', breachKind: 'short_term_rental',
        receivedAt: '2026-08-01', evidence: true
      }
    });
    expect(created.json().ok).toBe(true);
    const complaint = created.json().complaint;

    // Issue notice -> 14-day lock
    const notice = await app.inject({
      method: 'POST', url: '/api/v1/bylaw/complaint/notice',
      headers: auth(adminToken),
      payload: { complaint: JSON.stringify(complaint), issuedAt: '2026-08-03' }
    });
    const underReview = notice.json().complaint;

    // In the window -> blocked
    const status = await app.inject({
      method: 'POST', url: '/api/v1/bylaw/status',
      headers: auth(adminToken),
      payload: { complaint: JSON.stringify(underReview), now: '2026-08-16' }
    });
    expect(status.json().blocked).toBe('BLOCK_FINE_ACTIONS');

    // After window + minutes -> applied
    const fine = await app.inject({
      method: 'POST', url: '/api/v1/bylaw/fine',
      headers: auth(adminToken),
      payload: { complaint: JSON.stringify(underReview), now: '2026-08-17', amountBasis: 40_000, councilMinutesRef: 'M-9' }
    });
    expect(fine.json().ok).toBe(true);
    expect(fine.json().complaint.state).toBe('fine_posted');
  });

  it('GET /api/v1/units lists the canonical building', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/units', headers: auth(adminToken) });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.units).toHaveLength(6);
    expect(body.units[0]).toMatchObject({ unitRef: '101', floor: 1 });
    const u302 = body.units.find((u: { unitRef: string }) => u.unitRef === '302');
    expect(u302).toMatchObject({ arFundCode: 'ar:unit-302', occupancy: 'short-term' });
    expect(u302.reconciliationRefs).toContain('302');
  });

  it('GET /api/v1/rails/status lists enabled rails', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/rails/status', headers: auth(adminToken) });
    expect(res.statusCode).toBe(200);
    const rails = res.json().rails.find((r: { rail: string }) => r.rail === 'lightning');
    expect(rails.enabled).toBe(true);
  });

  it('POST /api/v1/payments/quote returns an LN 15-min-locked quote', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/quote',
      headers: auth(adminToken),
      payload: {
        rail: 'lightning',
        refId: 'A9F',
        unitRef: 'unit-302',
        amountBasis: 50_000,
        currency: 'CAD',
        recipient: LNURL
      }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.invoice.referenceCode).toBe('pay-a9f-unit302');
    expect(body.invoice.amountSat).toBe(1_000_000); // $500 @ $50k/BTC
    expect(body.invoice.fiatLockedBasis).toBe(50_000);
    expect(body.invoice.expiresAt).toBeTruthy();
  });

  it('POST /api/v1/payments/quote refuses a disabled rail', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/quote',
      headers: auth(adminToken),
      payload: {
        rail: 'nostr',
        refId: 'B2',
        unitRef: 'unit-101',
        amountBasis: 1000,
        currency: 'CAD',
        recipient: 'npub' + 'a'.repeat(60)
      }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().ok).toBe(false);
    expect(res.json().reason).toMatch(/not enabled/);
  });

  it('POST payments/quote is idempotent per (refId, unitRef, rail)', async () => {
    const body = {
      rail: 'lightning',
      refId: 'IDEM1',
      unitRef: 'unit-101',
      amountBasis: 10_000,
      currency: 'CAD',
      recipient: LNURL
    };
    const a = await app.inject({ method: 'POST', url: '/api/v1/payments/quote', headers: auth(adminToken), payload: body });
    const b = await app.inject({ method: 'POST', url: '/api/v1/payments/quote', headers: auth(adminToken), payload: body });
    expect(a.json().created).toBe(true);
    expect(b.json().created).toBe(false);
    expect(b.json().invoice.referenceCode).toBe(a.json().invoice.referenceCode);
  });

  it('POST payments/confirm posts the confirmed amount to the AR ledger', async () => {
    const quote = await app.inject({
      method: 'POST', url: '/api/v1/payments/quote',
      headers: auth(adminToken),
      payload: {
        rail: 'lightning', refId: 'CONF1', unitRef: 'unit-302', amountBasis: 50_000,
        currency: 'CAD', recipient: LNURL
      }
    });
    const ref = quote.json().invoice.referenceCode;
    const confirm = await app.inject({
      method: 'POST', url: '/api/v1/payments/confirm',
      headers: auth(adminToken),
      payload: { referenceCode: ref }
    });
    expect(confirm.statusCode).toBe(200);
    expect(confirm.json().ok).toBe(true);
    const bal = await app.inject({
      method: 'GET', url: `/api/v1/ledger/balance?fund=${encodeURIComponent(ref)}`,
      headers: auth(adminToken)
    });
    expect(bal.json().balanceBasis).toBe(50_000);
  });

  it('POST /api/v1/forms issues a Form F WITHHELD on a debtor unit', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/forms',
      headers: auth(adminToken),
      payload: { kind: 'F', unitId: '302', requestedAt: '2026-08-25', balanceBasis: 14_500 }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().state).toBe('withheld');
    expect(res.json().kind).toBe('F');
  });

  it('POST /api/v1/meetings/vote enforces an unresolvable 80% vote', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/meetings/vote',
      headers: auth(adminToken),
      payload: { threshold: 'eighty', eligible: 10, present: 10, yes: 7, no: 3, abstain: 0 }
    });
    expect(res.json().passed).toBe(false);
  });
});

describe('payments/confirm edge cases', () => {
  it('rejects an unknown referenceCode', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/payments/confirm',
      headers: auth(adminToken),
      payload: { referenceCode: 'pay-nope-missing' }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ ok: false, reason: 'unknown referenceCode' });
  });

  it('rejects a confirm without a referenceCode (schema 400)', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/payments/confirm',
      headers: auth(adminToken),
      payload: {}
    });
    expect(res.statusCode).toBe(400);
  });

  it('refuses to confirm twice (already paid)', async () => {
    const quote = await app.inject({
      method: 'POST', url: '/api/v1/payments/quote',
      headers: auth(adminToken),
      payload: {
        rail: 'lightning', refId: 'CONF2X', unitRef: 'unit-101', amountBasis: 12_000,
        currency: 'CAD', recipient: LNURL
      }
    });
    const ref = quote.json().invoice.referenceCode;

    const first = await app.inject({
      method: 'POST', url: '/api/v1/payments/confirm',
      headers: auth(adminToken),
      payload: { referenceCode: ref }
    });
    expect(first.json().ok).toBe(true);

    const second = await app.inject({
      method: 'POST', url: '/api/v1/payments/confirm',
      headers: auth(adminToken),
      payload: { referenceCode: ref }
    });
    expect(second.json().ok).toBe(false);
    expect(second.json().reason).toMatch(/not quoted/);
  });

  it('re-quoting after a confirm still returns the same (paid) request, not a new quote', async () => {
    const body = {
      rail: 'lightning', refId: 'REQ1', unitRef: 'unit-302', amountBasis: 8_000,
      currency: 'CAD', recipient: LNURL
    };
    const quote = await app.inject({ method: 'POST', url: '/api/v1/payments/quote', headers: auth(adminToken), payload: body });
    const ref = quote.json().invoice.referenceCode;
    await app.inject({ method: 'POST', url: '/api/v1/payments/confirm', headers: auth(adminToken), payload: { referenceCode: ref } });

    const re = await app.inject({ method: 'POST', url: '/api/v1/payments/quote', headers: auth(adminToken), payload: body });
    // Same (refId, unitRef, rail) -> not a fresh quote; the paid request is returned.
    expect(re.json().created).toBe(false);
    expect(re.json().invoice.referenceCode).toBe(ref);
    expect(re.json().invoice.status).toBe('paid');
  });
});

describe('forms / meetings coverage', () => {
  it('issues a Form B with a 7-day due date', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/forms',
      headers: auth(adminToken),
      payload: { kind: 'B', unitId: '101', requestedAt: '2026-08-25', balanceBasis: 0 }
    });
    const f = res.json();
    expect(f.state).toBe('issued');
    expect(f.kind).toBe('B');
    expect(f.dueDate).toBe('2026-09-01'); // +7 days
    expect(f.disclosures).toContain('Balance: $0.00');
    expect(f.withheldReason).toBeUndefined();
  });

  it('issues a Form F on a clear unit (not withheld)', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/forms',
      headers: auth(adminToken),
      payload: { kind: 'F', unitId: '101', requestedAt: '2026-08-25', balanceBasis: 0, arrearsBasis: 0 }
    });
    const f = res.json();
    expect(f.state).toBe('issued');
    expect(f.disclosures).toContain('Balance $0.00 — certificate issued');
  });

  it('AGM quorum needs 1/3 of eligible voters (10 of 30)', async () => {
    const fail = await app.inject({
      method: 'POST', url: '/api/v1/meetings/quorum',
      headers: auth(adminToken),
      payload: { type: 'AGM', eligible: 30, present: 9 }
    });
    expect(fail.json()).toMatchObject({ quorumMet: false, required: 10, present: 9, shortfall: 1 });
    const pass = await app.inject({
      method: 'POST', url: '/api/v1/meetings/quorum',
      headers: auth(adminToken),
      payload: { type: 'AGM', eligible: 30, present: 10 }
    });
    expect(pass.json().quorumMet).toBe(true);
  });

  it('council quorum is a majority of the council size', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/meetings/quorum',
      headers: auth(adminToken),
      payload: { type: 'council', eligible: 0, present: 3, councilSize: 5 }
    });
    expect(res.json()).toMatchObject({ quorumMet: true, required: 3, present: 3 });
  });

  it('a rescheduled meeting needs anyone present', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/meetings/quorum',
      headers: auth(adminToken),
      payload: { type: 'rescheduled', eligible: 30, present: 2 }
    });
    expect(res.json().quorumMet).toBe(true);
    const empty = await app.inject({
      method: 'POST', url: '/api/v1/meetings/quorum',
      headers: auth(adminToken),
      payload: { type: 'rescheduled', eligible: 30, present: 0 }
    });
    expect(empty.json().quorumMet).toBe(false);
  });

  it('meetings/vote rejects yes+no beyond those present', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/meetings/vote',
      headers: auth(adminToken),
      payload: { threshold: 'majority', eligible: 5, present: 3, yes: 3, no: 1, abstain: 0 }
    });
    expect(res.json().ok).toBe(false);
    expect(res.json().reason).toMatch(/exceed present/);
  });

  it('meetings/vote passes unanimity only when every effective voter says yes', async () => {
    const aye = await app.inject({
      method: 'POST', url: '/api/v1/meetings/vote',
      headers: auth(adminToken),
      payload: { threshold: 'unanimous', eligible: 5, present: 5, yes: 5, no: 0, abstain: 0 }
    });
    expect(aye.json().passed).toBe(true);
    const nay = await app.inject({
      method: 'POST', url: '/api/v1/meetings/vote',
      headers: auth(adminToken),
      payload: { threshold: 'unanimous', eligible: 5, present: 5, yes: 4, no: 1, abstain: 0 }
    });
    expect(nay.json().passed).toBe(false);
  });
});
