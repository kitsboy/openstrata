import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/api/server.js';
import { MemLedgerStore, MemPaymentRequestStore } from './memstore.js';
import { bech32Encode } from '../src/rails/rails.js';

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

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildServer(
    {
      ledger: new LedgerEngine(new MemLedgerStore()),
      rosa: keywordRetriever(corpus),
      reconcile,
      payments: new MemPaymentRequestStore(),
      config: {
        crfMandatoryPct: 10,
        vectorCollection: 'bc_spa_rta_crt',
        rails: {
          fiat: { enabled: true },
          onchain: { enabled: true },
          lightning: { enabled: true, endpoint: 'grpc://127.0.0.1:10009' }
        },
        cadPerBtc: 50_000
      }
    },
    { logger: false }
  );
  await app.ready();
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

  it('POST /api/v1/ledger/post then GET ledger/balance', async () => {
    const post = await app.inject({
      method: 'POST',
      url: '/api/v1/ledger/post',
      payload: {
        community: 'demo',
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
      url: '/api/v1/ledger/balance?community=demo&fund=operating'
    });
    expect(bal.statusCode).toBe(200);
    expect(bal.json().balanceBasis).toBe(4200);
  });

  it('POST /api/v1/treasury/authorize hard-blocks a CRF breach', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/authorize',
      payload: {
        balances: { crf: 500_000 },
        spend: { amountBasis: 100_000, fundCode: 'crf', poRef: 'PO-200', category: 'roofing' }
      }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ allow: false, blocked: 'crf-floor' });
  });

  it('POST /api/v1/rosa/query returns a citation-scoped answer', async () => {
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
      payload: {
        community: 'bdemo',
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
      payload: { complaint: JSON.stringify(complaint), issuedAt: '2026-08-03' }
    });
    const underReview = notice.json().complaint;

    // In the window -> blocked
    const status = await app.inject({
      method: 'POST', url: '/api/v1/bylaw/status',
      payload: { complaint: JSON.stringify(underReview), now: '2026-08-16' }
    });
    expect(status.json().blocked).toBe('BLOCK_FINE_ACTIONS');

    // After window + minutes -> applied
    const fine = await app.inject({
      method: 'POST', url: '/api/v1/bylaw/fine',
      payload: { complaint: JSON.stringify(underReview), now: '2026-08-17', amountBasis: 40_000, councilMinutesRef: 'M-9' }
    });
    expect(fine.json().ok).toBe(true);
    expect(fine.json().complaint.state).toBe('fine_posted');
  });

  it('GET /api/v1/rails/status lists enabled rails', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/rails/status' });
    expect(res.statusCode).toBe(200);
    const rails = res.json().rails.find((r: { rail: string }) => r.rail === 'lightning');
    expect(rails.enabled).toBe(true);
  });

  it('POST /api/v1/payments/quote returns an LN 15-min-locked quote', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/quote',
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
    const a = await app.inject({ method: 'POST', url: '/api/v1/payments/quote', payload: body });
    const b = await app.inject({ method: 'POST', url: '/api/v1/payments/quote', payload: body });
    expect(a.json().created).toBe(true);
    expect(b.json().created).toBe(false);
    expect(b.json().invoice.referenceCode).toBe(a.json().invoice.referenceCode);
  });

  it('POST payments/confirm posts the confirmed amount to the AR ledger', async () => {
    const quote = await app.inject({
      method: 'POST', url: '/api/v1/payments/quote',
      payload: {
        rail: 'lightning', refId: 'CONF1', unitRef: 'unit-302', amountBasis: 50_000,
        currency: 'CAD', recipient: LNURL
      }
    });
    const ref = quote.json().invoice.referenceCode;
    const confirm = await app.inject({
      method: 'POST', url: '/api/v1/payments/confirm',
      payload: { referenceCode: ref, community: 'demo' }
    });
    expect(confirm.statusCode).toBe(200);
    expect(confirm.json().ok).toBe(true);
    const bal = await app.inject({
      method: 'GET', url: `/api/v1/ledger/balance?community=demo&fund=${encodeURIComponent(ref)}`
    });
    expect(bal.json().balanceBasis).toBe(50_000);
  });

  it('POST /api/v1/forms issues a Form F WITHHELD on a debtor unit', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/forms',
      payload: { kind: 'F', unitId: '302', requestedAt: '2026-08-25', balanceBasis: 14_500 }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().state).toBe('withheld');
    expect(res.json().kind).toBe('F');
  });

  it('POST /api/v1/meetings/vote enforces an unresolvable 80% vote', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/meetings/vote',
      payload: { threshold: 'eighty', eligible: 10, present: 10, yes: 7, no: 3, abstain: 0 }
    });
    expect(res.json().passed).toBe(false);
  });
});