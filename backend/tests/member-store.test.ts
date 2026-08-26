import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/api/server.js';
import {
  MemLedgerStore,
  MemPaymentRequestStore,
  MemAuthStore,
  MemUnitStore,
  MemMemberStore
} from './memstore.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';

const AUTH_SECRET = 'member-store-secret-0123456789';

const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual operating contribution must be paid into the contingency reserve fund.'
  }
];

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function makeDeps() {
  return {
    ledger: new LedgerEngine(new MemLedgerStore()),
    rosa: keywordRetriever(corpus),
    reconcile,
    payments: new MemPaymentRequestStore(),
    auth: new MemAuthStore(),
    units: DEFAULT_UNITS,
    unitStore: new MemUnitStore(),
    memberStore: new MemMemberStore(),
    config: {
      crfMandatoryPct: 10,
      vectorCollection: 'bc_spa_rta_crt',
      rails: { fiat: { enabled: true }, lightning: { enabled: true, endpoint: 'grpc://127.0.0.1:10009' } },
      cadPerBtc: 50_000,
      authSecret: AUTH_SECRET,
      authTokenTtl: 3600,
      authRateLimitMax: 1000,
      authRateLimitWindowMs: 60_000
    }
  };
}

describe('member registry API (migration 0006)', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let treasurerToken: string;
  let memberToken: string;
  let councilId: string;

  beforeAll(async () => {
    app = await buildServer(makeDeps(), { logger: false });
    await app.ready();

    const reg = await app.inject({
      method: 'POST', url: '/api/v1/auth/register',
      payload: { councilName: 'Members Council', email: 'admin@members.test', password: 'password123' }
    });
    adminToken = reg.json().token as string;
    councilId = reg.json().council.id as string;

    const mkT = await app.inject({
      method: 'POST', url: '/api/v1/auth/users', headers: auth(adminToken),
      payload: { email: 'treas@members.test', role: 'treasurer' }
    });
    const mkM = await app.inject({
      method: 'POST', url: '/api/v1/auth/users', headers: auth(adminToken),
      payload: { email: 'mem@members.test', role: 'member' }
    });
    treasurerToken = (await app.inject({
      method: 'POST', url: '/api/v1/auth/login',
      payload: { email: 'treas@members.test', password: mkT.json().temporaryPassword }
    })).json().token as string;
    memberToken = (await app.inject({
      method: 'POST', url: '/api/v1/auth/login',
      payload: { email: 'mem@members.test', password: mkM.json().temporaryPassword }
    })).json().token as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('seeds members from the unit registry owners and lists them', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/members', headers: auth(adminToken) });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    const names = body.members.map((m: { displayName: string }) => m.displayName);
    expect(names).toContain('M. Chen');
    expect(names).toContain('A. Patel');
  });

  it('upserts a member (treasurer+) keyed on email and rejects bad emails', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/members', headers: auth(treasurerToken),
      payload: { email: 'New.Owner@Example.com', displayName: 'New Owner', unitRef: '302', roleLabel: 'owner' }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().ok).toBe(true);
    expect(res.json().member).toMatchObject({ email: 'new.owner@example.com', unitRef: '302' });

    // Idempotent by email — re-upsert updates the same row.
    const again = await app.inject({
      method: 'POST', url: '/api/v1/members', headers: auth(treasurerToken),
      payload: { email: 'new.owner@example.com', displayName: 'New Owner II', unitRef: '302', roleLabel: 'both' }
    });
    expect(again.json().member).toMatchObject({ displayName: 'New Owner II', roleLabel: 'both' });

    const bad = await app.inject({
      method: 'POST', url: '/api/v1/members', headers: auth(treasurerToken),
      payload: { email: 'not-an-email', unitRef: '302' }
    });
    expect(bad.statusCode).toBe(400);

    const unknownUnit = await app.inject({
      method: 'POST', url: '/api/v1/members', headers: auth(treasurerToken),
      payload: { email: 'x@example.com', unitRef: '9999' }
    });
    expect(unknownUnit.statusCode).toBe(404);
  });

  it('scopes members per unit and role-gates writes', async () => {
    const byUnit = await app.inject({
      method: 'GET', url: '/api/v1/members/unit?unitRef=302', headers: auth(memberToken)
    });
    const unitMembers = byUnit.json().members as Array<{ email: string }>;
    expect(unitMembers.map((m) => m.email)).toContain('new.owner@example.com');

    // Member role cannot write members.
    const denied = await app.inject({
      method: 'POST', url: '/api/v1/members', headers: auth(memberToken),
      payload: { email: 'nope@example.com', unitRef: '101' }
    });
    expect(denied.statusCode).toBe(403);
  });

  it('admin removes a member row', async () => {
    const list = await app.inject({ method: 'GET', url: '/api/v1/members', headers: auth(adminToken) });
    const target = (list.json().members as Array<{ id: number; email: string }>).find(
      (m) => m.email === 'new.owner@example.com'
    );
    expect(target).toBeTruthy();
    const del = await app.inject({
      method: 'DELETE', url: `/api/v1/members/${target!.id}`, headers: auth(adminToken)
    });
    expect(del.statusCode).toBe(200);
    expect(del.json().ok).toBe(true);

    const delAgain = await app.inject({
      method: 'DELETE', url: `/api/v1/members/${target!.id}`, headers: auth(adminToken)
    });
    expect(delAgain.statusCode).toBe(404);
  });
});

describe('deadlines + ledger entries APIs', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    app = await buildServer(makeDeps(), { logger: false });
    await app.ready();
    const reg = await app.inject({
      method: 'POST', url: '/api/v1/auth/register',
      payload: { councilName: 'Deadlines Council', email: 'admin@deadlines.test', password: 'password123' }
    });
    token = reg.json().token as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns statutory deadlines sorted urgent-first with days left', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/deadlines', headers: auth(token) });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.items.length).toBeGreaterThanOrEqual(3);
    const kinds = body.items.map((i: { kind: string }) => i.kind);
    expect(kinds).toContain('epr');
    expect(kinds).toContain('agm');
    for (const item of body.items) {
      expect(typeof item.daysLeft).toBe('number');
      expect(['urgent', 'soon', 'routine']).toContain(item.severity);
    }
  });

  it('returns a verified empty chain for a fresh fund and posts entries', async () => {
    const res = await app.inject({
      method: 'GET', url: '/api/v1/ledger/entries?fund=operating', headers: auth(token)
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().ok).toBe(true);
    expect(res.json().entries).toEqual([]);

    const post = await app.inject({
      method: 'POST', url: '/api/v1/ledger/post', headers: auth(token),
      payload: { fund: 'operating', amountBasis: 12_500, kind: 'credit', type: 'strata_fee', referenceCode: 'unit-101-2026-09' }
    });
    expect(post.statusCode).toBe(200);

    const again = await app.inject({
      method: 'GET', url: '/api/v1/ledger/entries?fund=operating', headers: auth(token)
    });
    const entries = again.json().entries as Array<{ seq: number; tallyRoot: string; amountBasis: number }>;
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ seq: 1, amountBasis: 12_500 });
    expect(entries[0].tallyRoot).toMatch(/^[0-9a-f]{64}$/);
  });
});
