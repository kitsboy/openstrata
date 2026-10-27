/**
 * Sessions — the lifecycle of a login.
 *
 * The point of these tests is the thing a stateless JWT could not do: end a
 * credential while it is still inside its lifetime, on every instance, and know
 * who did it. Each test registers its own council so nothing depends on order.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/api/server.js';
import {
  MemLedgerStore,
  MemPaymentRequestStore,
  MemAuthStore,
  MemSessionStore,
  MemAuditLog
} from './memstore.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';
import { signJwt } from '../src/auth/jwt.js';
import { isSessionActive } from '../src/auth/session.js';

const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual operating contribution must be paid into the contingency reserve fund.'
  }
];

const AUTH_SECRET = 'session-test-secret-xyz';

let app: FastifyInstance;
let sessions: MemSessionStore;
let audit: MemAuditLog;
let authStore: MemAuthStore;

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

interface LoginResult {
  token: string;
  refreshToken: string;
  councilId: string;
  userId: string;
}

async function register(name: string, email: string): Promise<LoginResult> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    payload: { councilName: name, email, password: 'password123' }
  });
  expect(res.statusCode).toBe(200);
  const body = res.json();
  return {
    token: body.token as string,
    refreshToken: body.refreshToken as string,
    councilId: body.council.id as string,
    userId: body.user.id as string
  };
}

/** Sign in again — a second device for the same account. */
async function login(email: string, password = 'password123'): Promise<LoginResult> {
  const res = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email, password } });
  expect(res.statusCode).toBe(200);
  const body = res.json();
  const me = await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: auth(body.token) });
  return {
    token: body.token as string,
    refreshToken: body.refreshToken as string,
    councilId: me.json().council.id as string,
    userId: me.json().user.id as string
  };
}

/** Create a user as admin and sign in as them, keeping their password. */
async function createAndLogin(
  adminToken: string,
  email: string,
  role: 'treasurer' | 'member'
): Promise<LoginResult & { password: string; id: string }> {
  const created = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/users',
    headers: auth(adminToken),
    payload: { email, role }
  });
  expect(created.statusCode).toBe(200);
  const password = created.json().temporaryPassword as string;
  const signedIn = await login(email, password);
  return { ...signedIn, password, id: created.json().user.id as string };
}

const me = (token: string) => app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: auth(token) });

beforeAll(async () => {
  sessions = new MemSessionStore();
  audit = new MemAuditLog();
  authStore = new MemAuthStore();
  app = await buildServer(
    {
      ledger: new LedgerEngine(new MemLedgerStore()),
      rosa: keywordRetriever(corpus),
      reconcile,
      payments: new MemPaymentRequestStore(),
      auth: authStore,
      sessions,
      audit,
      units: DEFAULT_UNITS,
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

describe('logout', () => {
  it('ends the session on the next request, not at token expiry', async () => {
    const { token, refreshToken } = await register('Logout Council', 'logout@sessions.test');
    expect((await me(token)).statusCode).toBe(200);

    const out = await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: auth(token) });
    expect(out.statusCode).toBe(200);
    expect(out.json()).toEqual({ ok: true, revoked: true });

    // The token is still signed and still inside its TTL — and it no longer works.
    const after = await me(token);
    expect(after.statusCode).toBe(401);
    expect(after.json().reason).toMatch(/session/);

    // Nor can the refresh token buy a new one.
    const refresh = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refreshToken }
    });
    expect(refresh.statusCode).toBe(401);

    // Logging out again carries a dead token, so it is refused at the door.
    const again = await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: auth(token) });
    expect(again.statusCode).toBe(401);
  });

  it('leaves the caller\'s other sessions alone', async () => {
    const email = 'two-devices@sessions.test';
    const first = await register('Two Devices', email);
    const second = await login(email);

    const out = await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: auth(first.token) });
    expect(out.statusCode).toBe(200);

    expect((await me(first.token)).statusCode).toBe(401);
    expect((await me(second.token)).statusCode).toBe(200);
  });

  it('refuses a token whose session never existed, even with a valid signature', async () => {
    const orphan = signJwt(
      { sub: 'u-ghost', cid: 'c-ghost', role: 'admin', sid: 's-ghost' },
      AUTH_SECRET,
      3600
    );
    const res = await me(orphan);
    expect(res.statusCode).toBe(401);
    expect(res.json().reason).toMatch(/session/);
  });
});

describe('active sessions', () => {
  it('lists the caller\'s own sessions, marks the current one, and leaks no secret', async () => {
    const email = 'listing@sessions.test';
    const first = await register('Listing Council', email);
    const second = await login(email);

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/sessions',
      headers: auth(second.token)
    });
    expect(res.statusCode).toBe(200);
    const rows = res.json().sessions as Array<{ id: string; current: boolean; active: boolean }>;
    expect(rows).toHaveLength(2);
    expect(rows.filter((row) => row.current)).toHaveLength(1);
    expect(rows[0]!.current).toBe(true); // newest first
    expect(rows.every((row) => row.active)).toBe(true);

    // A session id, a timestamp, a role — never a hash, never a token.
    const wire = JSON.stringify(rows);
    expect(wire).not.toMatch(/hash/i);
    expect(wire).not.toMatch(/[A-Za-z0-9_-]{40,}/); // no token-shaped value

    // The two logins are distinguishable sessions for one account.
    expect(rows[0]!.id).not.toBe(rows[1]!.id);
    expect(first.userId).toBe(second.userId);
  });

  it('signs out everywhere else and keeps the caller signed in', async () => {
    const email = 'everywhere-else@sessions.test';
    const first = await register('Everywhere Else', email);
    const second = await login(email);
    const third = await login(email);

    const res = await app.inject({
      method: 'DELETE',
      url: '/api/v1/auth/sessions',
      headers: auth(second.token)
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true, revoked: 2 });

    expect((await me(second.token)).statusCode).toBe(200);
    expect((await me(first.token)).statusCode).toBe(401);
    expect((await me(third.token)).statusCode).toBe(401);
  });

  it('does not show one council the sessions of another', async () => {
    const a = await register('Sessions A', 'sessionsa@sessions.test');
    const b = await register('Sessions B', 'sessionsb@sessions.test');

    const listA = await app.inject({ method: 'GET', url: '/api/v1/auth/sessions', headers: auth(a.token) });
    const listB = await app.inject({ method: 'GET', url: '/api/v1/auth/sessions', headers: auth(b.token) });
    expect(listA.json().sessions).toHaveLength(1);
    expect(listB.json().sessions).toHaveLength(1);

    const idA = (listA.json().sessions as Array<{ id: string }>)[0]!.id;
    const idB = (listB.json().sessions as Array<{ id: string }>)[0]!.id;
    expect(idA).not.toBe(idB);

    // And one council's sign-out-everywhere cannot reach into the other.
    const revoke = await app.inject({ method: 'DELETE', url: '/api/v1/auth/sessions', headers: auth(b.token) });
    expect(revoke.json().revoked).toBe(0);
    expect((await me(a.token)).statusCode).toBe(200);
  });
});

describe('refresh tokens', () => {
  it('rotates on use and ends the session when an old one is replayed', async () => {
    const { refreshToken } = await register('Rotation Council', 'rotation@sessions.test');

    const rotated = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refreshToken }
    });
    expect(rotated.statusCode).toBe(200);
    const nextToken = rotated.json().token as string;
    const nextRefresh = rotated.json().refreshToken as string;
    expect(nextRefresh).toBeTruthy();
    expect(nextRefresh).not.toBe(refreshToken);
    expect((await me(nextToken)).statusCode).toBe(200);

    // Replaying the rotated-away token is the signature of a stolen copy.
    const replay = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refreshToken }
    });
    expect(replay.statusCode).toBe(401);
    expect(replay.json().reason).toMatch(/already used/);

    // ...and it costs the thief the session, including the token just issued.
    expect((await me(nextToken)).statusCode).toBe(401);

    // The token from the *next* rotation is dead too: the session is over.
    const after = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refreshToken: nextRefresh }
    });
    expect(after.statusCode).toBe(401);
  });

  it('is issued once and stored only as a hash', async () => {
    const email = 'hashed@sessions.test';
    const { refreshToken, userId } = await register('Hashed Council', email);
    const stored = await sessions.listForUser(userId);
    expect(stored).toHaveLength(1);
    expect(stored[0]!.refreshHash).not.toBe(refreshToken);
    expect(stored[0]!.refreshHash).toMatch(/^[a-f0-9]{64}$/);
    // The raw token appears nowhere in the session record.
    expect(JSON.stringify(stored[0])).not.toContain(refreshToken);
  });

  it('refuses an unknown token, a malformed one, and one from a revoked session', async () => {
    const { token, refreshToken } = await register('Refusals Council', 'refusals@sessions.test');

    const unknown = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refreshToken: 'x'.repeat(43) }
    });
    expect(unknown.statusCode).toBe(401);
    expect(unknown.json().reason).toMatch(/invalid refresh token/);

    const malformed = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refreshToken: 'short' }
    });
    expect(malformed.statusCode).toBe(400); // schema floor, before any lookup

    await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: auth(token) });
    const revoked = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refreshToken }
    });
    expect(revoked.statusCode).toBe(401);
    expect(revoked.json().reason).toMatch(/session ended/);
  });
});

describe('role changes', () => {
  it('ends the target\'s sessions, and the changed role is what applies after signing in again', async () => {
    const admin = await register('Role Change Council', 'admin@rolechange.test');
    const treasurer = await createAndLogin(admin.token, 'treasurer@rolechange.test', 'treasurer');

    const before = await app.inject({
      method: 'POST',
      url: '/api/v1/ledger/post',
      headers: auth(treasurer.token),
      payload: { fund: 'operating', amountBasis: 1000, kind: 'credit', type: 'strata_fee' }
    });
    expect(before.statusCode).toBe(200);

    const patched = await app.inject({
      method: 'PATCH',
      url: `/api/v1/auth/users/${treasurer.id}`,
      headers: auth(admin.token),
      payload: { role: 'member' }
    });
    expect(patched.statusCode).toBe(200);
    expect(patched.json().user.role).toBe('member');
    expect(patched.json().sessionsRevoked).toBe(1);

    // The old token is refused outright, not quietly downgraded.
    const stale = await me(treasurer.token);
    expect(stale.statusCode).toBe(401);
    expect(stale.json().reason).toMatch(/session/);

    // A fresh sign-in carries the new role.
    const again = await login('treasurer@rolechange.test', treasurer.password);
    const write = await app.inject({
      method: 'POST',
      url: '/api/v1/ledger/post',
      headers: auth(again.token),
      payload: { fund: 'operating', amountBasis: 1000, kind: 'credit', type: 'strata_fee' }
    });
    expect(write.statusCode).toBe(403);
  });

  it('will not let an admin change their own role', async () => {
    const admin = await register('Self Role Council', 'self@rolechange.test');
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/auth/users/${admin.userId}`,
      headers: auth(admin.token),
      payload: { role: 'member' }
    });
    expect(res.statusCode).toBe(409);
    expect(res.json().reason).toMatch(/your own role/);
  });

  it('allows a demotion while another admin remains', async () => {
    const admin = await register('Two Admins Council', 'twoadmins@rolechange.test');
    const second = await createAndLogin(admin.token, 'second@rolechange.test', 'member');

    const promoted = await app.inject({
      method: 'PATCH',
      url: `/api/v1/auth/users/${second.id}`,
      headers: auth(admin.token),
      payload: { role: 'admin' }
    });
    expect(promoted.statusCode).toBe(200);
    expect(promoted.json().sessionsRevoked).toBe(1); // promoting ends the old session

    // The new admin signs in (their member token died with the change) and
    // demotes the other one, which is allowed because they remain.
    const secondAdmin = await login('second@rolechange.test', second.password);
    const demote = await app.inject({
      method: 'PATCH',
      url: `/api/v1/auth/users/${admin.userId}`,
      headers: auth(secondAdmin.token),
      payload: { role: 'member' }
    });
    expect(demote.statusCode).toBe(200);
    expect(demote.json().user.role).toBe('member');
    // The demoted admin's session is over.
    expect((await me(admin.token)).statusCode).toBe(401);
  });

  it('refuses to leave the council with no admin, even from a stale-privileged session', async () => {
    const admin = await register('Last Admin Council', 'last@rolechange.test');
    const second = await createAndLogin(admin.token, 'second@lastadmin.test', 'member');
    await app.inject({
      method: 'PATCH',
      url: `/api/v1/auth/users/${second.id}`,
      headers: auth(admin.token),
      payload: { role: 'admin' }
    });

    // Simulate the failure this guard exists for: the first admin was demoted
    // without their sessions being revoked (a lost write), so their token still
    // claims admin. The guard has to catch what the session check could not.
    await authStore.updateUserRole(admin.userId, 'member');
    const stillAdminByToken = await app.inject({
      method: 'PATCH',
      url: `/api/v1/auth/users/${second.id}`,
      headers: auth(admin.token),
      payload: { role: 'member' }
    });
    expect(stillAdminByToken.statusCode).toBe(409);
    expect(stillAdminByToken.json().reason).toMatch(/at least one admin/);
  });

  it('refuses a non-admin, an unknown user, and a user from another council', async () => {
    const admin = await register('Guards Council', 'admin@guards.test');
    const member = await createAndLogin(admin.token, 'member@guards.test', 'member');
    const outsider = await register('Outsider Council', 'outside@guards.test');

    const asMember = await app.inject({
      method: 'PATCH',
      url: `/api/v1/auth/users/${admin.userId}`,
      headers: auth(member.token),
      payload: { role: 'member' }
    });
    expect(asMember.statusCode).toBe(403);

    const unknown = await app.inject({
      method: 'PATCH',
      url: '/api/v1/auth/users/u-does-not-exist',
      headers: auth(admin.token),
      payload: { role: 'member' }
    });
    expect(unknown.statusCode).toBe(404);

    // An admin cannot reach across the tenant boundary into another council.
    const crossTenant = await app.inject({
      method: 'PATCH',
      url: `/api/v1/auth/users/${outsider.userId}`,
      headers: auth(admin.token),
      payload: { role: 'member' }
    });
    expect(crossTenant.statusCode).toBe(404);
  });

  it('answers unchanged when the role is already what was asked for', async () => {
    const admin = await register('Unchanged Council', 'admin@unchanged.test');
    const member = await createAndLogin(admin.token, 'member@unchanged.test', 'member');
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/auth/users/${member.id}`,
      headers: auth(admin.token),
      payload: { role: 'member' }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ unchanged: true, sessionsRevoked: 0 });
    // Nothing was revoked, so the member is still signed in.
    expect((await me(member.token)).statusCode).toBe(200);
  });
});

describe('session records', () => {
  it('counts a session as active only while unrevoked and unexpired', async () => {
    const { userId, token } = await register('Expiry Council', 'expiry@sessions.test');
    const [session] = await sessions.listForUser(userId);
    expect(session).toBeDefined();
    expect(isSessionActive(session!)).toBe(true);

    // Read the clock forward rather than waiting a month for it.
    const expired = { ...session!, expiresAt: new Date(Date.now() - 1000).toISOString() };
    expect(isSessionActive(expired)).toBe(false);

    // The access token still works while the session is live.
    expect((await me(token)).statusCode).toBe(200);
  });

  it('records why a session ended', async () => {
    const { token, userId } = await register('Reason Council', 'reason@sessions.test');
    await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: auth(token) });
    const [session] = await sessions.listForUser(userId);
    expect(session!.revokedReason).toBe('logout');
    expect(session!.revokedAt).toBeTruthy();
  });
});
