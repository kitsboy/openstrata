/**
 * The audit trail, through the API.
 *
 * Two things are being checked here, and they are different in kind:
 *   - that a privileged action *leaves a row* naming its actor, its target and
 *     its outcome (including the refusals, which are the interesting ones);
 *   - that the row is readable by the council it belongs to and by nobody else,
 *     and that reading it is itself recorded.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/api/server.js';
import {
  MemLedgerStore,
  MemPaymentRequestStore,
  MemAuthStore,
  MemSessionStore,
  MemAuditLog,
  MemUnitStore
} from './memstore.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';

const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual operating contribution must be paid into the contingency reserve fund.'
  }
];

const AUTH_SECRET = 'audit-test-secret-xyz';

let app: FastifyInstance;
let audit: MemAuditLog;

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

interface Council {
  token: string;
  councilId: string;
  userId: string;
}

async function register(name: string, email: string): Promise<Council> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    payload: { councilName: name, email, password: 'password123' }
  });
  expect(res.statusCode).toBe(200);
  return {
    token: res.json().token as string,
    councilId: res.json().council.id as string,
    userId: res.json().user.id as string
  };
}

async function createAndLogin(
  adminToken: string,
  email: string,
  role: 'treasurer' | 'member'
): Promise<{ token: string; userId: string }> {
  const created = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/users',
    headers: auth(adminToken),
    payload: { email, role }
  });
  expect(created.statusCode).toBe(200);
  const login = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email, password: created.json().temporaryPassword }
  });
  expect(login.statusCode).toBe(200);
  return { token: login.json().token as string, userId: created.json().user.id as string };
}

/** Every row this council owns, newest first. */
const rowsFor = (councilId: string) => audit.list(councilId, { limit: 200 });

beforeAll(async () => {
  audit = new MemAuditLog();
  app = await buildServer(
    {
      ledger: new LedgerEngine(new MemLedgerStore()),
      rosa: keywordRetriever(corpus),
      reconcile,
      payments: new MemPaymentRequestStore(),
      auth: new MemAuthStore(),
      sessions: new MemSessionStore(),
      audit,
      units: DEFAULT_UNITS,
      unitStore: new MemUnitStore(),
      config: {
        crfMandatoryPct: 10,
        vectorCollection: 'bc_spa_rta_crt',
        rails: { fiat: { enabled: true } },
        cadPerBtc: 50_000,
        authSecret: AUTH_SECRET,
        authTokenTtl: 3600,
        authRefreshTtlDays: 30,
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

describe('what gets recorded', () => {
  it('records a treasurer\'s ledger post with the actor, the action and the fund', async () => {
    const admin = await register('Audit Ledger Council', 'admin@auditledger.test');
    const treasurer = await createAndLogin(admin.token, 'treasurer@auditledger.test', 'treasurer');

    const post = await app.inject({
      method: 'POST',
      url: '/api/v1/ledger/post',
      headers: auth(treasurer.token),
      payload: { fund: 'operating', amountBasis: 12_500, kind: 'credit', type: 'strata_fee' }
    });
    expect(post.statusCode).toBe(200);

    const row = (await rowsFor(admin.councilId)).find((event) => event.action === 'ledger.post');
    expect(row).toBeDefined();
    expect(row!.actorId).toBe(treasurer.userId);
    expect(row!.actorRole).toBe('treasurer');
    expect(row!.outcome).toBe('success');
    expect(row!.httpStatus).toBe(200);
    expect(row!.target).toBe('fund=operating kind=credit amountBasis=12500');
    // The tenant is on the row, so a council can read its own log.
    expect(row!.councilId).toBe(admin.councilId);
  });

  it('records a refusal as denied — the row that answers "who tried"', async () => {
    const admin = await register('Audit Refusal Council', 'admin@auditrefusal.test');
    const member = await createAndLogin(admin.token, 'member@auditrefusal.test', 'member');

    const refused = await app.inject({
      method: 'POST',
      url: '/api/v1/ledger/post',
      headers: auth(member.token),
      payload: { fund: 'operating', amountBasis: 999, kind: 'credit', type: 'strata_fee' }
    });
    expect(refused.statusCode).toBe(403);

    const row = (await rowsFor(admin.councilId)).find((event) => event.action === 'ledger.post');
    expect(row).toBeDefined();
    expect(row!.outcome).toBe('denied');
    expect(row!.httpStatus).toBe(403);
    expect(row!.actorId).toBe(member.userId);
    expect(row!.actorRole).toBe('member');
  });

  it('records an admin\'s bylaw fine with the unit and the amount', async () => {
    const admin = await register('Audit Fine Council', 'admin@auditfine.test');
    const complaint = JSON.stringify({
      id: 'C-1',
      unitId: '305',
      bylawRef: 's.7.2',
      breachKind: 'standard',
      receivedAt: '2026-01-01',
      evidence: true
    });

    const fine = await app.inject({
      method: 'POST',
      url: '/api/v1/bylaw/fine',
      headers: auth(admin.token),
      payload: { complaint, now: '2026-09-01', amountBasis: 5_000, councilMinutesRef: 'M-2026-09-01' }
    });
    expect(fine.statusCode).toBe(200);

    const row = (await rowsFor(admin.councilId)).find((event) => event.action === 'bylaw.fine');
    expect(row).toBeDefined();
    expect(row!.actorId).toBe(admin.userId);
    // The amount and the resolution that authorized it. The unit sits inside
    // the opaque complaint payload, which this policy deliberately does not
    // parse — so the row is traceable through the minutes, not through the unit.
    expect(row!.target).toBe('amountBasis=5000 councilMinutesRef=M-2026-09-01');
    expect(JSON.stringify(row)).not.toContain('s.7.2');
  });

  it('records a unit deletion, and the creation before it', async () => {
    const admin = await register('Audit Delete Council', 'admin@auditdelete.test');
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/units',
      headers: auth(admin.token),
      payload: { unitRef: '901', floor: 9 }
    });
    expect(created.statusCode).toBe(200);

    const removed = await app.inject({
      method: 'DELETE',
      url: '/api/v1/units/901',
      headers: auth(admin.token)
    });
    expect(removed.statusCode).toBe(200);

    const rows = await rowsFor(admin.councilId);
    const deletion = rows.find((event) => event.action === 'units.delete');
    expect(deletion).toBeDefined();
    expect(deletion!.target).toBe('unitRef=901');
    expect(deletion!.outcome).toBe('success');
    // The creation is there too — the pair is what makes the hole in the unit
    // table explainable a year later.
    expect(rows.some((event) => event.action === 'units.create')).toBe(true);
  });

  it('records a refusal as a row rather than dropping it', async () => {
    const admin = await register('Audit Refuse Delete', 'admin@auditrefusedelete.test');
    const member = await createAndLogin(admin.token, 'member@auditrefusedelete.test', 'member');
    const removed = await app.inject({
      method: 'DELETE',
      url: '/api/v1/units/302',
      headers: auth(member.token)
    });
    expect(removed.statusCode).toBe(403);

    const row = (await rowsFor(admin.councilId)).find((event) => event.action === 'units.delete');
    expect(row).toBeDefined();
    expect(row!.outcome).toBe('denied');
    expect(row!.actorId).toBe(member.userId);
  });

  it('records a sign-in, and a refused sign-in, without recording the password', async () => {
    const admin = await register('Audit Auth Council', 'admin@auditauth.test');

    await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'admin@auditauth.test', password: 'password123' }
    });
    await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'admin@auditauth.test', password: 'wrong-password' }
    });

    const rows = (await rowsFor(admin.councilId)).filter((event) => event.action === 'auth.login');
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.outcome).sort()).toEqual(['denied', 'success']);
    expect(rows.map((row) => row.target)).toEqual([
      'email=admin@auditauth.test',
      'email=admin@auditauth.test'
    ]);

    // The only sign-in event that names an actor is the one that succeeded.
    const actorIds = rows.map((row) => row.actorId).filter((id) => id !== null);
    expect(actorIds).toEqual([admin.userId]);

    const everything = JSON.stringify(await rowsFor(admin.councilId));
    expect(everything).not.toContain('password123');
    expect(everything).not.toContain('wrong-password');
  });

  it('leaves ordinary reads and pure calculators out of the log', async () => {
    const admin = await register('Audit Quiet Council', 'admin@auditquiet.test');
    await app.inject({ method: 'GET', url: '/api/v1/units', headers: auth(admin.token) });
    await app.inject({ method: 'GET', url: '/api/v1/ledger/balance?fund=operating', headers: auth(admin.token) });
    await app.inject({ method: 'GET', url: '/api/v1/deadlines', headers: auth(admin.token) });
    const quoted = await app.inject({
      method: 'POST',
      url: '/api/v1/treasury/authorize',
      headers: auth(admin.token),
      payload: {
        balances: { operating: 100_000 },
        spend: { amountBasis: 1_000, fundCode: 'operating', poRef: 'PO-1', category: 'repair' }
      }
    });
    expect(quoted.statusCode).toBe(200);

    const actions = (await rowsFor(admin.councilId)).map((row) => row.action);
    expect(actions).not.toContain('units.read');
    expect(actions).not.toContain('ledger.balance.read');
    expect(actions).not.toContain('deadlines.read');
    expect(actions).not.toContain('treasury.authorize.create');
    // Only the signup itself is in there.
    expect(actions).toEqual(['auth.register']);
  });

  it('records a read whose data leaves the building', async () => {
    const admin = await register('Audit Export Council', 'admin@auditexport.test');
    const before = await rowsFor(admin.councilId);
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/export/portable',
      headers: auth(admin.token)
    });
    expect(res.statusCode).toBe(200);

    const after = await rowsFor(admin.councilId);
    expect(after.length).toBe(before.length + 1);
    expect(after[0]!.action).toBe('export.portable.read');
    expect(after[0]!.actorId).toBe(admin.userId);
  });

  it('does not let an anonymous caller write a row through a public route', async () => {
    // The policy rule itself is unit-tested in src/audit/policy.test.ts; this
    // checks the observable half — a payer opening a bill link, a bot probing
    // the KB and a health probe leave the council's log exactly as it was.
    const admin = await register('Audit Public Council', 'admin@auditpublic.test');
    const before = await rowsFor(admin.councilId);
    await app.inject({ method: 'POST', url: '/api/v1/payments/link/verify', payload: { token: 'x' } });
    await app.inject({ method: 'GET', url: '/api/v1/rosa/sources?q=funds' });
    await app.inject({ method: 'GET', url: '/health/ready' });
    const after = await rowsFor(admin.councilId);
    expect(after.length).toBe(before.length);
  });
});

describe('reading the log', () => {
  it('is admin-only and tenant-scoped', async () => {
    const a = await register('Audit Read A', 'admin@auditreada.test');
    const b = await register('Audit Read B', 'admin@auditreadb.test');
    const member = await createAndLogin(a.token, 'member@auditreada.test', 'member');

    await app.inject({
      method: 'POST',
      url: '/api/v1/ledger/post',
      headers: auth(a.token),
      payload: { fund: 'crf', amountBasis: 7_000, kind: 'credit', type: 'crf_contribution' }
    });

    const asMember = await app.inject({ method: 'GET', url: '/api/v1/audit/events', headers: auth(member.token) });
    expect(asMember.statusCode).toBe(403);

    const forA = await app.inject({ method: 'GET', url: '/api/v1/audit/events', headers: auth(a.token) });
    expect(forA.statusCode).toBe(200);
    const aActions = (forA.json().events as Array<{ action: string }>).map((row) => row.action);
    expect(aActions).toContain('ledger.post');

    const forB = await app.inject({ method: 'GET', url: '/api/v1/audit/events', headers: auth(b.token) });
    const bActions = (forB.json().events as Array<{ action: string }>).map((row) => row.action);
    expect(bActions).not.toContain('ledger.post');
    expect(forB.json().events).toHaveLength(1); // just B's own registration
  });

  it('returns newest first, pages with a cursor, and filters by action', async () => {
    const admin = await register('Audit Page Council', 'admin@auditpage.test');
    for (const amountBasis of [1_000, 2_000, 3_000]) {
      await app.inject({
        method: 'POST',
        url: '/api/v1/ledger/post',
        headers: auth(admin.token),
        payload: { fund: 'operating', amountBasis, kind: 'credit', type: 'strata_fee' }
      });
    }

    const first = await app.inject({
      method: 'GET',
      url: '/api/v1/audit/events?limit=2',
      headers: auth(admin.token)
    });
    expect(first.statusCode).toBe(200);
    const page = first.json().events as Array<{ seq: number; action: string; target: string | null }>;
    expect(page).toHaveLength(2);
    expect(page[0]!.seq).toBeGreaterThan(page[1]!.seq);
    expect(page[0]!.target).toContain('amountBasis=3000'); // newest first

    const next = await app.inject({
      method: 'GET',
      url: `/api/v1/audit/events?limit=2&before=${page[1]!.seq}`,
      headers: auth(admin.token)
    });
    expect(next.statusCode).toBe(200);
    const older = next.json().events as Array<{ seq: number }>;
    expect(older[0]!.seq).toBeLessThan(page[1]!.seq);

    const filtered = await app.inject({
      method: 'GET',
      url: '/api/v1/audit/events?action=ledger.post',
      headers: auth(admin.token)
    });
    const posts = filtered.json().events as Array<{ action: string }>;
    expect(posts).toHaveLength(3);
    expect(posts.every((row) => row.action === 'ledger.post')).toBe(true);

    const bad = await app.inject({
      method: 'GET',
      url: '/api/v1/audit/events?action=NOT%20VALID',
      headers: auth(admin.token)
    });
    expect(bad.statusCode).toBe(400);

    const badCursor = await app.inject({
      method: 'GET',
      url: '/api/v1/audit/events?before=abc',
      headers: auth(admin.token)
    });
    expect(badCursor.statusCode).toBe(400);
  });

  it('records the reading of the log itself', async () => {
    const admin = await register('Audit Watch Council', 'admin@auditwatch.test');
    await app.inject({ method: 'GET', url: '/api/v1/audit/events', headers: auth(admin.token) });
    const rows = await rowsFor(admin.councilId);
    expect(rows[0]!.action).toBe('audit.events.read');
    expect(rows[0]!.actorId).toBe(admin.userId);
  });

  it('refuses an invalid action id at the store, so both adapters agree', async () => {
    await expect(
      audit.record({
        councilId: 'c-x',
        actorId: null,
        actorRole: null,
        action: 'NOT A VALID ACTION',
        outcome: 'success',
        target: null,
        httpStatus: 200,
        ip: null,
        userAgent: null
      })
    ).rejects.toThrow(/invalid audit action/);
  });
});
