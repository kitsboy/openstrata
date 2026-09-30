import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/api/server.js';
import { MemLedgerStore, MemPaymentRequestStore, MemAuthStore, MemUnitStore } from './memstore.js';
import { bech32Encode } from '../src/rails/rails.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';
import type { UnitRegistry } from '../src/units/model.js';

const LNURL = bech32Encode('lnurl', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const AUTH_SECRET = 'unit-store-secret-0123456789';

const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual operating contribution must be paid into the contingency reserve fund.'
  }
];

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function makeDeps(unitStore?: MemUnitStore, units?: UnitRegistry) {
  return {
    ledger: new LedgerEngine(new MemLedgerStore()),
    rosa: keywordRetriever(corpus),
    reconcile,
    payments: new MemPaymentRequestStore(),
    auth: new MemAuthStore(),
    units,
    unitStore,
    config: {
      crfMandatoryPct: 10,
      vectorCollection: 'bc_spa_rta_crt',
      rails: {
        fiat: { enabled: true },
        lightning: { enabled: true, endpoint: 'grpc://127.0.0.1:10009' }
      },
      cadPerBtc: 50_000,
      authSecret: AUTH_SECRET,
      authTokenTtl: 3600,
      authRateLimitMax: 1000,
      authRateLimitWindowMs: 60_000
    }
  };
}

describe('MemUnitStore semantics', () => {
  it('seeds the demo building per council and keeps councils isolated', async () => {
    const store = new MemUnitStore();
    const a = await store.seedDefault('c-a');
    const b = await store.seedDefault('c-b');
    expect(a).toHaveLength(6);
    expect(b).toHaveLength(6);
    // Same unitRefs, independent rows.
    expect(a[0].unitRef).toBe('101');
    expect(b[0].unitRef).toBe('101');

    await store.upsert('c-a', { unitRef: '501', floor: 5, occupancy: 'vacant' });
    const aAll = await store.list('c-a');
    const bAll = await store.list('c-b');
    expect(aAll).toHaveLength(7);
    expect(bAll).toHaveLength(6);
    expect(aAll.map((u) => u.unitRef)).toContain('501');
    expect(bAll.map((u) => u.unitRef)).not.toContain('501');
  });

  it('upsert replaces and remove deletes a single row', async () => {
    const store = new MemUnitStore();
    await store.seedDefault('c-a');
    await store.upsert('c-a', { unitRef: '101', floor: 1, occupancy: 'vacant', tenant: 'X' });
    const got = await store.get('c-a', '101');
    expect(got).toMatchObject({ occupancy: 'vacant', tenant: 'X' });
    expect(await store.remove('c-a', '101')).toBe(true);
    expect(await store.get('c-a', '101')).toBeNull();
    expect(await store.remove('c-a', '101')).toBe(false);
  });
});

describe('store-backed /units API (migration 0005)', () => {
  let app: FastifyInstance;
  let unitStore: MemUnitStore;
  let adminToken: string;
  let treasurerToken: string;
  let memberToken: string;
  let councilId: string;

  beforeAll(async () => {
    unitStore = new MemUnitStore();
    app = await buildServer(makeDeps(unitStore), { logger: false });
    await app.ready();

    const reg = await app.inject({
      method: 'POST', url: '/api/v1/auth/register',
      payload: { councilName: 'Units Council', email: 'admin@units.test', password: 'password123' }
    });
    adminToken = reg.json().token as string;
    councilId = reg.json().council.id as string;
    expect(councilId).toBeTruthy();

    // Treasurer + member accounts in the same council.
    const mk = await app.inject({
      method: 'POST', url: '/api/v1/auth/users', headers: auth(adminToken),
      payload: { email: 'treas@units.test', role: 'treasurer' }
    });
    const mku = await app.inject({
      method: 'POST', url: '/api/v1/auth/users', headers: auth(adminToken),
      payload: { email: 'mem@units.test', role: 'member' }
    });
    const loginT = await app.inject({
      method: 'POST', url: '/api/v1/auth/login',
      payload: { email: 'treas@units.test', password: mk.json().temporaryPassword }
    });
    const loginM = await app.inject({
      method: 'POST', url: '/api/v1/auth/login',
      payload: { email: 'mem@units.test', password: mku.json().temporaryPassword }
    });
    treasurerToken = loginT.json().token as string;
    memberToken = loginM.json().token as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('seeds 6 units for the new council and returns the wire shape', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/units', headers: auth(adminToken) });
    expect(res.statusCode).toBe(200);
    const units = res.json().units as Array<Record<string, unknown>>;
    expect(units).toHaveLength(6);
    expect(units[0]).toMatchObject({ unitRef: '101', floor: 1, arFundCode: 'ar:unit-101' });
    expect(units[0].reconciliationRefs).toContain('101');
    // The seeded rows live in the store under this council only.
    expect(await unitStore.list(councilId)).toHaveLength(6);
    expect(await unitStore.list('c-unknown')).toHaveLength(0);
  });

  it('upserts a unit (treasurer+), rejects a member', async () => {
    const asMember = await app.inject({
      method: 'POST', url: '/api/v1/units', headers: auth(memberToken),
      payload: { unitRef: '501', floor: 5, occupancy: 'vacant' }
    });
    expect(asMember.statusCode).toBe(403);

    const added = await app.inject({
      method: 'POST', url: '/api/v1/units', headers: auth(treasurerToken),
      payload: { unitRef: 'U-501', floor: 5, sqft: 900, occupancy: 'vacant', owner: 'R. Solo', occupants: ['Solo'] }
    });
    expect(added.statusCode).toBe(200);
    expect(added.json().unit.unitRef).toBe('501'); // canonicalized
    expect(added.json().unit.arFundCode).toBe('ar:unit-501');

    const list = await app.inject({ method: 'GET', url: '/api/v1/units', headers: auth(adminToken) });
    expect(list.json().units).toHaveLength(7);
  });

  it('rejects invalid unit payloads', async () => {
    const bad = await app.inject({
      method: 'POST', url: '/api/v1/units', headers: auth(adminToken),
      payload: { unitRef: '---', floor: 5 }
    });
    expect(bad.statusCode).toBe(400);
  });

  it('removes a unit (admin only)', async () => {
    const asTreas = await app.inject({
      method: 'DELETE', url: '/api/v1/units/501', headers: auth(treasurerToken)
    });
    expect(asTreas.statusCode).toBe(403);

    const removed = await app.inject({
      method: 'DELETE', url: '/api/v1/units/501', headers: auth(adminToken)
    });
    expect(removed.statusCode).toBe(200);
    expect(removed.json().removed).toBe('501');

    const again = await app.inject({
      method: 'DELETE', url: '/api/v1/units/501', headers: auth(adminToken)
    });
    expect(again.statusCode).toBe(404);
  });

  it('keeps units tenant-isolated across councils', async () => {
    const other = await app.inject({
      method: 'POST', url: '/api/v1/auth/register',
      payload: { councilName: 'Other Units', email: `other-${Date.now()}@units.test`, password: 'password123' }
    });
    const otherToken = other.json().token as string;

    // Council A adds a unit; council B never sees it.
    await app.inject({
      method: 'POST', url: '/api/v1/units', headers: auth(adminToken),
      payload: { unitRef: '601', floor: 6, occupancy: 'occupied' }
    });
    const bList = await app.inject({ method: 'GET', url: '/api/v1/units', headers: auth(otherToken) });
    expect(bList.json().units).toHaveLength(6);
    expect(bList.json().units.map((u: { unitRef: string }) => u.unitRef)).not.toContain('601');

    // Council B cannot read or delete council A's unit.
    const bDetail = await app.inject({ method: 'GET', url: '/api/v1/units/601', headers: auth(otherToken) });
    expect(bDetail.statusCode).toBe(404);
    const bDel = await app.inject({ method: 'DELETE', url: '/api/v1/units/601', headers: auth(otherToken) });
    expect(bDel.statusCode).toBe(404);
    const aList = await app.inject({ method: 'GET', url: '/api/v1/units', headers: auth(adminToken) });
    expect(aList.json().units.map((u: { unitRef: string }) => u.unitRef)).toContain('601');
  });

  it('unit detail traces AR balance from billing charges', async () => {
    const run = await app.inject({
      method: 'POST', url: '/api/v1/billing/run', headers: auth(adminToken),
      payload: {
        period: '2026-09', dueDay: 1, graceDays: 5, lateFeeBasis: 2000,
        fees: [{ unitId: '101', monthlyBasis: 35_000 }],
        arrears: {}, asOf: '2026-09-08'
      }
    });
    expect(run.json().postedCount).toBe(1);

    const detail = await app.inject({ method: 'GET', url: '/api/v1/units/101', headers: auth(adminToken) });
    expect(detail.statusCode).toBe(200);
    expect(detail.json().unit.unitRef).toBe('101');
    expect(detail.json().ar.fundCode).toBe('ar:unit-101');
    // The charge landed on the canonical AR account this unit resolves to.
    expect(detail.json().ar.balanceBasis).toBe(35_000);
    expect(detail.json().ar.headTally.length).toBeGreaterThan(0);
  });

  it('unit detail traces confirmed payments for the unit', async () => {
    const quote = await app.inject({
      method: 'POST', url: '/api/v1/payments/quote', headers: auth(adminToken),
      payload: { rail: 'lightning', refId: 'UNIT-PAY', unitRef: 'unit-101', amountBasis: 12_000, currency: 'CAD', recipient: LNURL }
    });
    const ref = quote.json().invoice.referenceCode as string;
    await app.inject({
      method: 'POST', url: '/api/v1/payments/confirm', headers: auth(adminToken),
      payload: { referenceCode: ref }
    });

    const detail = await app.inject({ method: 'GET', url: '/api/v1/units/101', headers: auth(adminToken) });
    const payments = detail.json().payments as Array<{ referenceCode: string; status: string }>;
    expect(payments.length).toBeGreaterThan(0);
    expect(payments[0]).toMatchObject({ referenceCode: ref, status: 'paid', rail: 'lightning' });
  });

  it('unit detail 404s for an unknown unit', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/units/999', headers: auth(adminToken) });
    expect(res.statusCode).toBe(404);
  });
});

describe('registry fallback (no unit store)', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    app = await buildServer(makeDeps(undefined, DEFAULT_UNITS), { logger: false });
    await app.ready();
    const reg = await app.inject({
      method: 'POST', url: '/api/v1/auth/register',
      payload: { councilName: 'Fallback Council', email: 'fb@units.test', password: 'password123' }
    });
    token = reg.json().token as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /units falls back to the seeded demo registry', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/units', headers: auth(token) });
    expect(res.json().units).toHaveLength(6);
  });

  it('POST /units degrades with 501 when no store is configured', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/units', headers: auth(token),
      payload: { unitRef: '701', floor: 7, occupancy: 'vacant' }
    });
    expect(res.statusCode).toBe(501);
  });
});
