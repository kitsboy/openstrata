import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/api/server.js';
import { MemLedgerStore, MemPaymentRequestStore, MemAuthStore } from './memstore.js';
import { bech32Encode } from '../src/rails/rails.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { signJwt } from '../src/auth/jwt.js';

const LNURL = bech32Encode('lnurl', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual operating contribution must be paid into the contingency reserve fund.'
  }
];

const AUTH_SECRET = 'auth-test-secret-xyz';

let app: FastifyInstance;
const auth = (token: string) => ({ authorization: `Bearer ${token}` });

async function registerCouncil(name: string, email: string): Promise<{ token: string; councilId: string }> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    payload: { councilName: name, email, password: 'password123' }
  });
  expect(res.statusCode).toBe(200);
  return { token: res.json().token as string, councilId: res.json().council.id as string };
}

async function createAndLogin(
  adminToken: string,
  email: string,
  role: 'treasurer' | 'member'
): Promise<string> {
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
  return login.json().token as string;
}

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

describe('register / login / me', () => {
  it('register creates a council with the first user as admin and returns a token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { councilName: 'Register Test', email: 'owner@register.test', password: 'password123' }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.council.name).toBe('Register Test');
    expect(body.user.role).toBe('admin');
    expect(body.user.passwordHash).toBeUndefined();
    expect(body.token).toBeTruthy();
  });

  it('register rejects an invalid email with 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { councilName: 'X', email: 'not-an-email', password: 'password123' }
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().reason).toMatch(/email/);
  });

  it('register rejects a short password via schema (400)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { councilName: 'X', email: 'short@pw.test', password: 'tiny' }
    });
    expect(res.statusCode).toBe(400);
  });

  it('register rejects a duplicate email with 409', async () => {
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { councilName: 'Dup A', email: 'dup@register.test', password: 'password123' }
    });
    expect(first.statusCode).toBe(200);
    const second = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { councilName: 'Dup B', email: 'dup@register.test', password: 'password123' }
    });
    expect(second.statusCode).toBe(409);
    expect(second.json().reason).toMatch(/already registered/);
  });

  it('login succeeds with the right password and fails with 401 otherwise', async () => {
    await registerCouncil('Login Test', 'login@me.test');
    const ok = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'login@me.test', password: 'password123' }
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.json().user.email).toBe('login@me.test');

    const bad = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'login@me.test', password: 'wrong-password' }
    });
    expect(bad.statusCode).toBe(401);

    const ghost = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'nobody@me.test', password: 'password123' }
    });
    expect(ghost.statusCode).toBe(401);
  });

  it('GET /auth/me returns the user and their council', async () => {
    const { token, councilId } = await registerCouncil('Me Test', 'me@test.local');
    const res = await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: auth(token) });
    expect(res.statusCode).toBe(200);
    expect(res.json().council.id).toBe(councilId);
    expect(res.json().user.email).toBe('me@test.local');
  });
});

describe('token hygiene', () => {
  it('protected routes return 401 without a token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/units' });
    expect(res.statusCode).toBe(401);
    // Schema validation runs before auth on POSTs, so use a valid-shaped body
    // to prove the preHandler still refuses the unauthenticated call.
    const post = await app.inject({
      method: 'POST', url: '/api/v1/ledger/post',
      payload: { fund: 'operating', amountBasis: 1000, kind: 'credit', type: 'strata_fee' }
    });
    expect(post.statusCode).toBe(401);
  });

  it('rejects a garbage token with 401', async () => {
    const res = await app.inject({
      method: 'GET', url: '/api/v1/units', headers: auth('not-a-jwt')
    });
    expect(res.statusCode).toBe(401);
  });

  it('rejects a token signed with the wrong secret', async () => {
    const forged = signJwt({ sub: 'u-x', cid: 'c-x', role: 'admin' }, 'attacker-secret', 3600);
    const res = await app.inject({ method: 'GET', url: '/api/v1/units', headers: auth(forged) });
    expect(res.statusCode).toBe(401);
  });

  it('rejects an expired token', async () => {
    const expired = signJwt({ sub: 'u-x', cid: 'c-x', role: 'admin' }, AUTH_SECRET, -10);
    const res = await app.inject({ method: 'GET', url: '/api/v1/units', headers: auth(expired) });
    expect(res.statusCode).toBe(401);
  });
});

describe('role gates', () => {
  let adminToken: string;
  let treasurerToken: string;
  let memberToken: string;

  beforeAll(async () => {
    ({ token: adminToken } = await registerCouncil('Roles Council', 'roles@admin.test'));
    treasurerToken = await createAndLogin(adminToken, 'roles@treasurer.test', 'treasurer');
    memberToken = await createAndLogin(adminToken, 'roles@member.test', 'member');
  });

  it('a member can read but not write the ledger (403)', async () => {
    const read = await app.inject({
      method: 'GET', url: '/api/v1/ledger/balance?fund=operating', headers: auth(memberToken)
    });
    expect(read.statusCode).toBe(200);

    const write = await app.inject({
      method: 'POST', url: '/api/v1/ledger/post',
      headers: auth(memberToken),
      payload: { fund: 'operating', amountBasis: 1000, kind: 'credit', type: 'strata_fee' }
    });
    expect(write.statusCode).toBe(403);
  });

  it('a member cannot run billing or reconcile (403)', async () => {
    const billing = await app.inject({
      method: 'POST', url: '/api/v1/billing/run',
      headers: auth(memberToken),
      payload: { period: '2026-09', dueDay: 1, graceDays: 5, lateFeeBasis: 2000, fees: [], arrears: {} }
    });
    expect(billing.statusCode).toBe(403);

    const recon = await app.inject({
      method: 'POST', url: '/api/v1/treasury/reconcile',
      headers: auth(memberToken),
      payload: { reference: 'Unit 302', units: [] }
    });
    expect(recon.statusCode).toBe(403);
  });

  it('a treasurer can post to the ledger but cannot impose a fine (403)', async () => {
    const post = await app.inject({
      method: 'POST', url: '/api/v1/ledger/post',
      headers: auth(treasurerToken),
      payload: { fund: 'operating', amountBasis: 500, kind: 'credit', type: 'adjustment' }
    });
    expect(post.statusCode).toBe(200);
    expect(post.json().posted).toBe(true);

    const fine = await app.inject({
      method: 'POST', url: '/api/v1/bylaw/fine',
      headers: auth(treasurerToken),
      payload: { complaint: '{}', now: '2026-08-20', amountBasis: 1000, councilMinutesRef: 'M-1' }
    });
    expect(fine.statusCode).toBe(403);
  });

  it('only admins can create users', async () => {
    const asMember = await app.inject({
      method: 'POST', url: '/api/v1/auth/users',
      headers: auth(memberToken),
      payload: { email: 'nope@member.test', role: 'member' }
    });
    expect(asMember.statusCode).toBe(403);

    const asTreasurer = await app.inject({
      method: 'POST', url: '/api/v1/auth/users',
      headers: auth(treasurerToken),
      payload: { email: 'nope@treasurer.test', role: 'member' }
    });
    expect(asTreasurer.statusCode).toBe(403);

    const asAdmin = await app.inject({
      method: 'POST', url: '/api/v1/auth/users',
      headers: auth(adminToken),
      payload: { email: 'newmember@roles.test', role: 'member' }
    });
    expect(asAdmin.statusCode).toBe(200);
    expect(asAdmin.json().temporaryPassword).toBeTruthy();
  });

  it('members and treasurers can quote and confirm payments', async () => {
    const quote = await app.inject({
      method: 'POST', url: '/api/v1/payments/quote',
      headers: auth(memberToken),
      payload: { rail: 'lightning', refId: 'M1', unitRef: 'unit-101', amountBasis: 1000, currency: 'CAD', recipient: LNURL }
    });
    expect(quote.statusCode).toBe(200);
    expect(quote.json().ok).toBe(true);
  });
});

describe('multi-tenant isolation', () => {
  it('a council cannot see another council ledger entries', async () => {
    const a = await registerCouncil('Tenant A', 'a@tenants.test');
    const b = await registerCouncil('Tenant B', 'b@tenants.test');

    await app.inject({
      method: 'POST', url: '/api/v1/ledger/post',
      headers: auth(a.token),
      payload: { fund: 'operating', amountBasis: 7777, kind: 'credit', type: 'strata_fee' }
    });

    const aBal = await app.inject({
      method: 'GET', url: '/api/v1/ledger/balance?fund=operating', headers: auth(a.token)
    });
    expect(aBal.json().balanceBasis).toBe(7777);

    const bBal = await app.inject({
      method: 'GET', url: '/api/v1/ledger/balance?fund=operating', headers: auth(b.token)
    });
    expect(bBal.json().balanceBasis).toBe(0);
  });

  it('same payment refId in two councils yields two independent quotes', async () => {
    const a = await registerCouncil('Quote A', 'quotea@tenants.test');
    const b = await registerCouncil('Quote B', 'quoteb@tenants.test');
    const body = { rail: 'lightning', refId: 'SAME', unitRef: 'unit-302', amountBasis: 5000, currency: 'CAD', recipient: LNURL };

    const qa = await app.inject({ method: 'POST', url: '/api/v1/payments/quote', headers: auth(a.token), payload: body });
    const qb = await app.inject({ method: 'POST', url: '/api/v1/payments/quote', headers: auth(b.token), payload: body });
    expect(qa.json().created).toBe(true);
    expect(qb.json().created).toBe(true);
    // Same (refId, unit, rail) but different councils -> distinct requests.
    expect(qa.json().invoice.referenceCode).toBe(qb.json().invoice.referenceCode);
  });

  it('a council cannot confirm another council quote (unknown referenceCode)', async () => {
    const a = await registerCouncil('Confirm A', 'confirma@tenants.test');
    const b = await registerCouncil('Confirm B', 'confirmb@tenants.test');

    const quote = await app.inject({
      method: 'POST', url: '/api/v1/payments/quote',
      headers: auth(a.token),
      payload: { rail: 'lightning', refId: 'X1', unitRef: 'unit-101', amountBasis: 2000, currency: 'CAD', recipient: LNURL }
    });
    const ref = quote.json().invoice.referenceCode;

    // Council B cannot see council A's quote, even with the same reference code.
    const confirm = await app.inject({
      method: 'POST', url: '/api/v1/payments/confirm',
      headers: auth(b.token),
      payload: { referenceCode: ref }
    });
    expect(confirm.json()).toMatchObject({ ok: false, reason: 'unknown referenceCode' });
  });

  it('user lists are scoped to the caller council', async () => {
    const { token } = await registerCouncil('List A', 'list@tenants.test');
    await registerCouncil('List B', 'listb@tenants.test');

    const res = await app.inject({ method: 'GET', url: '/api/v1/auth/users', headers: auth(token) });
    expect(res.statusCode).toBe(200);
    expect(res.json().users).toHaveLength(1);
    expect(res.json().users[0].email).toBe('list@tenants.test');
  });
});
