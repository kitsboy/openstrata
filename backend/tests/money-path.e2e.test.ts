/**
 * End-to-end money-path journey — the loop a real council runs.
 *
 * Boots the REAL Fastify server over HTTP (in-memory adapters, exactly like
 * production wiring minus Postgres) and walks the money end to end:
 *
 *   register → units → monthly billing run → late notice → payment quote →
 *   confirm → reconcile → ledger verification → deadline → Form B / Form F.
 *
 * A council that pays fees, chases arrears and issues certificates runs this
 * loop. If any seam in it breaks, this suite must fail — unit tests guard the
 * parts, this guards the *sequence*.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/api/server.js';
import { MemLedgerStore, MemPaymentRequestStore, MemAuthStore } from './memstore.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { bech32Encode } from '../src/rails/rails.js';
import { createRegistry, type UnitRecord } from '../src/units/model.js';
import { unitArFundCode } from '../src/units/model.js';

const LNURL = bech32Encode('lnurl', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const AUTH_SECRET = 'money-path-secret-0123456789';

/** Two units, canonical demo-style refs ('101'/'302'). */
const units: UnitRecord[] = [
  { unitRef: '101', floor: 1, sqft: 780, occupancy: 'occupied', tenant: 'M. Chen', rent: 2450, formK: 'signed' },
  { unitRef: '302', floor: 3, sqft: 1450, occupancy: 'occupied', tenant: 'R. Diaz', rent: 3900, formK: 'signed' }
];

const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual operating contribution must be paid into the contingency reserve fund.'
  }
];

describe('money-path journey (HTTP, real server)', () => {
  let app: FastifyInstance;
  let token: string;
  const auth = () => ({ authorization: `Bearer ${token}` });

  beforeAll(async () => {
    app = await buildServer(
      {
        ledger: new LedgerEngine(new MemLedgerStore()),
        rosa: keywordRetriever(corpus),
        reconcile,
        payments: new MemPaymentRequestStore(),
        auth: new MemAuthStore(),
        units: createRegistry(units),
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
          authTokenTtl: 3600,
          authRateLimitMax: 1000,
          authRateLimitWindowMs: 60_000
        }
      },
      { logger: false }
    );
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. registers a council and signs in', async () => {
    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        councilName: 'Money Path Strata',
        email: 'treasurer@moneypath.test',
        password: 'correct-horse-battery'
      }
    });
    expect(reg.statusCode).toBe(200);
    const body = reg.json();
    expect(body.token).toBeTruthy();
    expect(body.council?.id).toBeTruthy();
    token = body.token as string;
  });

  it('2. lists the council units', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/units', headers: auth() });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    const list: Array<{ unitRef: string }> = body.units ?? [];
    expect(list.map((u) => u.unitRef).sort()).toEqual(['101', '302']);
  });

  it('3. runs the first monthly billing cycle (charges + late notice)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/run',
      headers: auth(),
      payload: {
        period: '2026-09',
        dueDay: 1,
        graceDays: 5,
        lateFeeBasis: 2_000,
        fees: [
          { unitId: '101', monthlyBasis: 35_000 },
          { unitId: '302', monthlyBasis: 48_500 }
        ],
        arrears: { '302': 60_000 },
        asOf: '2026-09-08'
      }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.run.charges).toHaveLength(2);
    expect(body.postedCount).toBe(2);
    // Unit 302 is past grace (Sep 8 vs Sep 6): exactly one late notice.
    expect(body.run.lateNotices.map((n: { unitId: string }) => n.unitId)).toEqual(['302']);
  });

  it('4. quotes a Lightning payment for unit 101 with a per-site receive label', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/quote',
      headers: auth(),
      payload: {
        rail: 'lightning',
        refId: 'MP1',
        unitRef: '101',
        amountBasis: 35_000,
        currency: 'CAD',
        recipient: LNURL
      }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.invoice.referenceCode).toBe('pay-mp1-101');
    expect(body.invoice.receiveLabel).toMatch(/^OST \S+ U101 MP1$/);
    expect(body.invoice.fiatLockedBasis).toBe(35_000);
    expect(body.invoice.expiresAt).toBeTruthy();
  });

  it('5. confirms the payment and sees it land in the AR ledger', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/confirm',
      headers: auth(),
      payload: { referenceCode: 'pay-mp1-101' }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.status).toBe('paid');

    // The confirm posts a credit to the unit's AR account on the trust ledger.
    const entries = await app.inject({
      method: 'GET',
      url: `/api/v1/ledger/entries?fund=${unitArFundCode('101')}`,
      headers: auth()
    });
    expect(entries.statusCode).toBe(200);
    const list: Array<unknown> = entries.json().entries ?? [];
    expect(list.length).toBeGreaterThan(0);
  });

  it('6. reconciles an inbound e-transfer reference to a unit', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/reconcile',
      headers: auth(),
      payload: {
        reference: 'Unit 101 September',
        units: [{ unitId: '101', refs: ['101', 'unit101'] }]
      }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('auto');
    expect(body.unitId).toBe('101');
  });

  it('7. posts a manual payment and verifies the ledger hash chain', async () => {
    const fund = unitArFundCode('101');
    // A second credit (an owner tops up in person at the bank, treasurer posts it).
    const post = await app.inject({
      method: 'POST',
      url: '/api/v1/ledger/post',
      headers: auth(),
      payload: {
        fund,
        amountBasis: 25_000,
        kind: 'credit',
        type: 'strata_fee',
        referenceCode: 'manual-101-topup',
        reconRef: 'ET-2231'
      }
    });
    expect(post.statusCode).toBe(200);

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/ledger/entries?fund=${fund}`,
      headers: auth()
    });
    expect(res.statusCode).toBe(200);
    const list: Array<{ hash?: string; prevHash?: string }> = res.json().entries ?? [];
    expect(list.length).toBeGreaterThanOrEqual(2);
    // Chain integrity: each entry's prevHash is the previous entry's hash.
    for (let i = 1; i < list.length; i += 1) {
      expect(list[i].prevHash).toBe(list[i - 1].hash);
    }
  });

  it('8. reads the statutory deadline calendar', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/deadlines', headers: auth() });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
  });

  it('9. issues Form B and issues-withholds Form F on the debtor unit', async () => {
    const b = await app.inject({
      method: 'POST',
      url: '/api/v1/forms',
      headers: auth(),
      payload: { kind: 'B', unitId: '101', requestedAt: '2026-09-20', balanceBasis: 0 }
    });
    expect(b.statusCode).toBe(200);
    expect(b.json().kind).toBe('B');
    expect(b.json().state).toBe('issued');

    // Unit 302 has arrears from the billing run: Form F must be WITHHELD.
    const f = await app.inject({
      method: 'POST',
      url: '/api/v1/forms',
      headers: auth(),
      payload: { kind: 'F', unitId: '302', requestedAt: '2026-09-20', balanceBasis: 14_500 }
    });
    expect(f.statusCode).toBe(200);
    expect(f.json().kind).toBe('F');
    expect(f.json().state).toBe('withheld');
  });

  it('10. proves cross-council isolation — another council sees nothing', async () => {
    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        councilName: 'Other Council',
        email: 'other@council.test',
        password: 'other-password-123'
      }
    });
    expect(reg.statusCode).toBe(200);
    const otherToken = reg.json().token as string;

    const entries = await app.inject({
      method: 'GET',
      url: '/api/v1/ledger/entries?fund=operating',
      headers: { authorization: `Bearer ${otherToken}` }
    });
    expect(entries.statusCode).toBe(200);
    const list: unknown[] = entries.json().entries ?? [];
    expect(list.length).toBe(0); // the first council's money is invisible
  });
});
