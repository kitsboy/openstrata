/**
 * Fastify application — routes the Phase 3 services.
 *
 * The app is a factory over injected dependencies so it can be built in tests
 * with in-memory stores (no Postgres/Ollama).
 *
 * Auth + tenancy: every `/api/v1/*` route except the Rosa KB and `/health`
 * requires a Bearer JWT. The token's `cid` claim IS the tenant: tenant-scoped
 * routes derive the ledger `community` from the token instead of trusting the
 * request body, and role gates enforce admin / treasurer / member privileges.
 */

import { randomBytes } from 'node:crypto';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import type { LedgerEngine } from '../ledger/ledger.js';
import { type Retriever, composeAnswer } from '../rosa/rosa.js';
import { authorizeSpend } from '../ziggy/ziggy.js';
import type { Reconciler, UnitRefs } from '../trf/recon.js';
import { runBilling, type UnitFee } from '../billing/billing.js';
import {
  newComplaint,
  issueNotice,
  canImposeFine,
  imposeFine,
  decideNoFine
} from '../enforcement/enforcement.js';
import { quotePayment, enabledRails, type RailRegistry, type Rail } from '../rails/rails.js';
import { getOrCreateQuote, type PaymentRequestStore } from '../rails/payment-request.js';
import type { RateProvider } from '../rails/rails.js';
import { generateForm } from '../forms/forms.js';
import { checkQuorum, checkQuorumRescheduled, countVote } from '../meetings/meetings.js';
import type { UnitRegistry } from '../units/model.js';
import { hashPassword, verifyPassword } from '../auth/passwords.js';
import { signJwt, verifyJwt } from '../auth/jwt.js';
import type { AuthStore } from '../auth/store.js';
import { DuplicateEmailError } from '../auth/store.js';
import type { AuthUser, UserRole } from '../auth/model.js';
import { ROLE_RANK, toPublicUser } from '../auth/model.js';
import { RateLimiter, type RateLimitConfig } from '../auth/rate-limit.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export interface ApiDeps {
  ledger: LedgerEngine;
  rosa: Retriever;
  reconcile: Reconciler;
  payments: PaymentRequestStore;
  auth: AuthStore;
  resolver?: RateProvider;
  /** Canonical unit/lot master data. Resolves every unitRef in the product. */
  units?: UnitRegistry;
  config: {
    crfMandatoryPct: number;
    vectorCollection: string;
    rails?: RailRegistry;
    cadPerBtc?: number; // fallback static rate for convertible rails
    authSecret: string;
    authRateLimitMax: number;
    authRateLimitWindowMs: number;
    authTokenTtl: number; // seconds
  };
}

/** In-memory seen-set for Idempotency-Key on idempotent POSTs (ledger/billing). */
const lastResults = new Map<string, unknown>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type PreHandler = (req: FastifyRequest, reply: FastifyReply) => Promise<void>;

export async function buildServer(
  deps: ApiDeps,
  opts: { logger?: boolean } = { logger: true }
): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? true });

  const defaultBudget = {
    fiscalYear: '2026',
    totalOperatingBasis: 4_200_000,
    crfMandatoryPct: deps.config.crfMandatoryPct
  };

  // -------------------------------------------------------------  Auth hooks
  const authenticate: PreHandler = async (req, reply) => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return reply.code(401).send({ ok: false, reason: 'authentication required' });
    }
    const claims = verifyJwt(token, deps.config.authSecret);
    if (!claims) {
      return reply.code(401).send({ ok: false, reason: 'invalid or expired token' });
    }
    req.user = { userId: claims.sub, councilId: claims.cid, role: claims.role };
  };

  /** Role gate: admits the role and anything above it (treasurer gate admits admin). */
  const requireRole = (min: UserRole): PreHandler => async (req, reply) => {
    if (!req.user) {
      return reply.code(401).send({ ok: false, reason: 'authentication required' });
    }
    if (ROLE_RANK[req.user.role] < ROLE_RANK[min]) {
      return reply.code(403).send({ ok: false, reason: `requires role '${min}' or higher` });
    }
  };

  app.get('/health', async () => ({ ok: true, service: 'openstrata-backend' }));

  // ----------------------------------------------------------------  Auth API
  // Open signup: anyone can create a council + its first admin. Councils are
  // the tenant boundary — every later request is scoped to the token's council.
  app.post<{
    Body: { councilName: string; email: string; password: string; displayName?: string };
  }>(
    '/api/v1/auth/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['councilName', 'email', 'password'],
          additionalProperties: false,
          properties: {
            councilName: { type: 'string', minLength: 1 },
            email: { type: 'string', minLength: 3 },
            password: { type: 'string', minLength: 8 },
            displayName: { type: 'string' }
          }
        }
      }
    },
    async (req, reply) => {
      const email = req.body.email.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return reply.code(400).send({ ok: false, reason: 'invalid email address' });
      const registerThrottle = throttled(`register:ip:${req.ip}`);
      if (registerThrottle) {
        return reply
          .code(429)
          .header('retry-after', String(registerThrottle.retryAfter))
          .send({ ok: false, reason: 'too many registrations — try again shortly', retryAfter: registerThrottle.retryAfter });
      }
      rateLimiter.record(`register:ip:${req.ip}`);
      if (await deps.auth.getUserByEmail(email)) {
        return reply.code(409).send({ ok: false, reason: 'email already registered' });
      }
      const council = await deps.auth.createCouncil(req.body.councilName.trim());
      const passwordHash = await hashPassword(req.body.password);
      const user = await deps.auth.createUser({
        councilId: council.id,
        email,
        displayName: (req.body.displayName ?? '').trim() || email.split('@')[0]!,
        passwordHash,
        role: 'admin'
      });
      const token = signJwt(
        { sub: user.id, cid: council.id, role: user.role },
        deps.config.authSecret,
        deps.config.authTokenTtl
      );
      return {
        ok: true,
        token,
        council: { id: council.id, name: council.name },
        user: toPublicUser(user)
      };
    }
  );

  // Brute-force throttle for the open auth surface (per email + per IP). Only
  // failed attempts consume the window — success clears the email bucket.
  const rateLimiter = new RateLimiter({
    max: deps.config.authRateLimitMax,
    windowMs: deps.config.authRateLimitWindowMs
  } satisfies RateLimitConfig);
  const throttled = (key: string): { retryAfter: number } | null =>
    rateLimiter.isLimited(key)
      ? { retryAfter: rateLimiter.retryAfterSeconds(key) }
      : null;

  app.post<{ Body: { email: string; password: string } }>(
    '/api/v1/auth/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          additionalProperties: false,
          properties: { email: { type: 'string' }, password: { type: 'string', minLength: 1 } }
        }
      }
    },
    async (req, reply) => {
      const email = req.body.email.trim().toLowerCase();
      const limited = throttled(`login:email:${email}`) ?? throttled(`login:ip:${req.ip}`);
      if (limited) {
        return reply
          .code(429)
          .header('retry-after', String(limited.retryAfter))
          .send({ ok: false, reason: 'too many login attempts — try again shortly', retryAfter: limited.retryAfter });
      }
      const user = await deps.auth.getUserByEmail(email);
      if (!user || !(await verifyPassword(req.body.password, user.passwordHash))) {
        rateLimiter.record(`login:email:${email}`);
        rateLimiter.record(`login:ip:${req.ip}`);
        return reply.code(401).send({ ok: false, reason: 'invalid email or password' });
      }
      rateLimiter.clear(`login:email:${email}`);
      const token = signJwt(
        { sub: user.id, cid: user.councilId, role: user.role },
        deps.config.authSecret,
        deps.config.authTokenTtl
      );
      return { ok: true, token, user: toPublicUser(user) };
    }
  );

  app.get('/api/v1/auth/me', { preHandler: [authenticate] }, async (req) => {
    const user = await deps.auth.getUserById(req.user!.userId);
    const council = await deps.auth.getCouncil(req.user!.councilId);
    if (!user || !council) return { ok: false, reason: 'account not found' };
    return { ok: true, user: toPublicUser(user), council: { id: council.id, name: council.name } };
  });

  // Admin-only user management (the rest of a council's accounts).
  app.get('/api/v1/auth/users', { preHandler: [authenticate, requireRole('admin')] }, async (req) => {
    const users = await deps.auth.listUsers(req.user!.councilId);
    return { ok: true, users: users.map(toPublicUser) };
  });

  app.post<{
    Body: { email: string; displayName?: string; role: 'treasurer' | 'member' };
  }>(
    '/api/v1/auth/users',
    {
      preHandler: [authenticate, requireRole('admin')],
      schema: {
        body: {
          type: 'object',
          required: ['email', 'role'],
          additionalProperties: false,
          properties: {
            email: { type: 'string', minLength: 3 },
            displayName: { type: 'string' },
            role: { type: 'string', enum: ['treasurer', 'member'] }
          }
        }
      }
    },
    async (req, reply) => {
      const email = req.body.email.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return reply.code(400).send({ ok: false, reason: 'invalid email address' });
      if (await deps.auth.getUserByEmail(email)) {
        return reply.code(409).send({ ok: false, reason: 'email already registered' });
      }
      // Generated temporary password — the admin shares it with the new user.
      const temporaryPassword = randomBytes(9).toString('base64url');
      const user = await deps.auth.createUser({
        councilId: req.user!.councilId,
        email,
        displayName: (req.body.displayName ?? '').trim() || email.split('@')[0]!,
        passwordHash: await hashPassword(temporaryPassword),
        role: req.body.role
      });
      return { ok: true, user: toPublicUser(user), temporaryPassword };
    }
  );

  // Canonical unit/lot master data — the single source of unit identity.
  // Every unit carries its reconciliation keys + AR ledger fund code so clients
  // never re-derive them on their own. If a registry isn't injected, degrade.
  app.get('/api/v1/units', { preHandler: [authenticate] }, async () => {
    const reg = deps.units;
    if (!reg) return { ok: false, reason: 'unit registry not configured' };
    return {
      ok: true,
      units: reg.all().map((u) => ({
        unitRef: u.unitRef,
        floor: u.floor,
        sqft: u.sqft,
        occupancy: u.occupancy,
        tenant: u.tenant ?? null,
        rent: u.rent ?? null,
        eht: u.eht ?? false,
        evCharger: u.evCharger ?? false,
        formK: u.formK ?? 'missing',
        arFundCode: ('ar:unit-' + u.unitRef.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()) as string,
        reconciliationRefs: reg.refs(u.unitRef)
      }))
    };
  });

  // Ledger balance (verified against the hash chain). Community comes from the
  // token — a council can only read its own accounts.
  app.get<{ Querystring: { fund: string } }>(
    '/api/v1/ledger/balance',
    { preHandler: [authenticate] },
    async (req) => {
      const { balanceBasis, entryCount, headTally } = await deps.ledger.balance(
        req.user!.councilId,
        req.query.fund
      );
      return { balanceBasis, entryCount, headTally: headTally.slice(0, 8) };
    }
  );

  // Post a single credit/debit (idempotent via Idempotency-Key header).
  // Treasurer + admin only; the community is the caller's council.
  app.post<{
    Body: {
      fund: string;
      amountBasis: number;
      kind: 'credit' | 'debit';
      type: string;
      description?: string;
      referenceCode?: string;
      reconRef?: string;
    };
  }>(
    '/api/v1/ledger/post',
    {
      preHandler: [authenticate, requireRole('treasurer')],
      schema: {
        body: {
          type: 'object',
          required: ['fund', 'amountBasis', 'kind', 'type'],
          additionalProperties: false,
          properties: {
            fund: { type: 'string' },
            amountBasis: { type: 'integer', not: { const: 0 } },
            kind: { type: 'string', enum: ['credit', 'debit'] },
            type: { type: 'string' },
            description: { type: 'string' },
            referenceCode: { type: 'string' },
            reconRef: { type: 'string' }
          }
        }
      }
    },
    async (req) => {
      const idem = req.headers['idempotency-key'];
      const idemKey = idem ? `ledger:${req.user!.councilId}:${idem}` : null;
      if (idemKey) {
        const cached = lastResults.get(idemKey);
        if (cached) return cached;
      }
      const row = await deps.ledger.post(
        req.user!.councilId,
        req.body.fund,
        req.body.amountBasis,
        req.body.kind,
        {
          type: req.body.type,
          description: req.body.description,
          referenceCode: req.body.referenceCode,
          reconRef: req.body.reconRef
        }
      );
      const result = { posted: true, seq: row.seq, tallyRoot: row.tallyRoot.slice(0, 8) };
      if (idemKey) lastResults.set(idemKey, result);
      return result;
    }
  );

  // Ziggy: treasury spend verdict (authorization gate, not execution).
  app.post<{
    Body: {
      budget?: {
        fiscalYear: string;
        totalOperatingBasis: number;
        crfMandatoryPct: number;
      };
      balances: Record<string, number>;
      spend: {
        amountBasis: number;
        fundCode: string;
        poRef: string;
        category: string;
        description?: string;
      };
    };
  }>(
    '/api/v1/treasury/authorize',
    { preHandler: [authenticate, requireRole('treasurer')] },
    async (req) => {
      const verdict = authorizeSpend(
        req.body.budget ?? defaultBudget,
        req.body.balances,
        req.body.spend
      );
      return verdict;
    }
  );

  // Rosa: strict RAG query (citations only). Public — BC law is the knowledge
  // base behind the product and the site already publishes it.
  app.post<{ Body: { question: string; facts?: Record<string, string> } }>(
    '/api/v1/rosa/query',
    async (req) => {
      const chunks = await deps.rosa.retrieve(req.body.question, 3);
      const answer = composeAnswer(req.body.question, chunks, req.body.facts ?? {});
      return {
        answer,
        cited: answer.cited,
        uncertain: answer.uncertain,
        collection: deps.config.vectorCollection
      };
    }
  );

  // Rosa: raw retrieval endpoint (returns citations, no answer).
  app.get<{ Querystring: { q: string } }>('/api/v1/rosa/sources', async (req) => {
    const chunks = await deps.rosa.retrieve(req.query.q, 5);
    return {
      chunks: chunks.map((c) => ({
        citation: c.source.citation,
        title: c.source.title,
        url: c.source.url,
        score: c.score
      }))
    };
  });

  const cadPerBtc = async (): Promise<number> =>
    (await deps.resolver?.cadPerBtc()) ?? deps.config.cadPerBtc ?? 0;

  // ------------------------------------------------  Sovereign rails
  app.get('/api/v1/rails/status', { preHandler: [authenticate] }, async () => ({
    rails: enabledRails(deps.config.rails ?? {}),
    cadPerBtc: await cadPerBtc()
  }));

  // Build a rail quote; idempotent per (community, refId, unitRef, rail) via
  // the payment store. The community is the caller's council.
  app.post<{
    Body: {
      rail: Rail;
      refId: string;
      unitRef: string;
      amountBasis: number;
      currency: 'CAD' | 'BTC';
      recipient: string;
      note?: string;
    };
  }>(
    '/api/v1/payments/quote',
    {
      preHandler: [authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['rail', 'refId', 'unitRef', 'amountBasis', 'currency', 'recipient'],
          additionalProperties: false,
          properties: {
            rail: { type: 'string', enum: ['fiat', 'onchain', 'lightning', 'liquid', 'paynym_bip47', 'nostr'] },
            refId: { type: 'string', minLength: 1 },
            unitRef: { type: 'string', minLength: 1 },
            amountBasis: { type: 'integer', not: { const: 0 } },
            currency: { type: 'string', enum: ['CAD', 'BTC'] },
            recipient: { type: 'string', minLength: 1 },
            note: { type: 'string' }
          }
        }
      }
    },
    async (req) => {
      const b = req.body;
      const registry = deps.config.rails ?? {};
      if (!registry[b.rail]?.enabled) {
        return { ok: false, reason: `rail '${b.rail}' is not enabled` };
      }
      try {
        const rate = await cadPerBtc(); // resolve outside the sync buildInvoice()
        const communityId = req.user!.councilId;
        const { request, created } = await getOrCreateQuote(
          deps.payments,
          {
            refId: b.refId,
            unitRef: b.unitRef,
            communityId,
            rail: b.rail,
            amountBasis: b.amountBasis,
            currency: b.currency,
            recipient: b.recipient
          },
          () =>
            quotePayment(
              {
                refId: b.refId,
                communityId,
                unitRef: b.unitRef,
                amountBasis: b.amountBasis,
                currency: b.currency,
                rail: b.rail,
                note: b.note
              },
              b.recipient,
              new Date(),
              rate
            )
        );
        const invoice = {
          rail: request.rail,
          referenceCode: request.referenceCode,
          recipient: request.recipient,
          invoice: request.invoice || undefined,
          fiatLockedBasis: request.fiatLockedBasis || undefined,
          amountSat: request.amountSat || undefined,
          expiresAt: request.expiresAt,
          status: request.status
        };
        return { ok: true, created, invoice };
      } catch (err) {
        return { ok: false, reason: (err as Error).message };
      }
    }
  );

  // Confirm a rail payment by its shared referenceCode -> mark paid AND post to
  // the unit's AR ledger account (reconciles like an e-transfer would). The
  // lookup is council-scoped so one council can never confirm another's quote.
  app.post<{ Body: { referenceCode: string } }>(
    '/api/v1/payments/confirm',
    {
      preHandler: [authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['referenceCode'],
          additionalProperties: false,
          properties: { referenceCode: { type: 'string', minLength: 1 } }
        }
      }
    },
    async (req) => {
      const councilId = req.user!.councilId;
      const req0 = await deps.payments.findByReference(councilId, req.body.referenceCode);
      if (!req0) return { ok: false, reason: 'unknown referenceCode' };
      if (req0.status !== 'quoted') return { ok: false, reason: `request is ${req0.status}, not quoted` };

      // Post the confirmed amount to the unit's AR ledger (credit).
      const kind = req0.amountBasis >= 0 ? ('credit' as const) : ('debit' as const);
      const row = await deps.ledger.post(
        councilId,
        req0.referenceCode,
        Math.abs(req0.amountBasis),
        kind,
        { type: 'strata_fee', referenceCode: req0.referenceCode, reconRef: req0.referenceCode }
      );
      await deps.payments.markStatus(councilId, req0.referenceCode, 'paid');
      return { ok: true, seq: row.seq, referenceCode: req0.referenceCode, status: 'paid' };
    }
  );

  // Reconciliation: auto-post decision for one inbound transfer.
  app.post<{
    Body: { reference: string; units: UnitRefs[] };
  }>(
    '/api/v1/treasury/reconcile',
    { preHandler: [authenticate, requireRole('treasurer')] },
    async (req) => {
      return deps.reconcile(req.body.reference, req.body.units);
    }
  );

  // ------------------------------------------------ Billing
  // Run a monthly billing cycle: compute charges + late notices, then post the
  // charges to the trust ledger so AR is wired end-to-end. Treasurer + admin.
  app.post<{
    Body: {
      period: string;
      fees: UnitFee[];
      dueDay: number;
      graceDays: number;
      lateFeeBasis: number;
      arrears: Record<string, number>;
      asOf?: string;
    };
  }>(
    '/api/v1/billing/run',
    {
      preHandler: [authenticate, requireRole('treasurer')],
      schema: {
        body: {
          type: 'object',
          required: ['period', 'fees', 'dueDay', 'graceDays', 'lateFeeBasis', 'arrears'],
          additionalProperties: false,
          properties: {
            period: { type: 'string', minLength: 1 },
            fees: {
              type: 'array',
              items: {
                type: 'object',
                required: ['unitId', 'monthlyBasis'],
                additionalProperties: false,
                properties: {
                  unitId: { type: 'string' },
                  monthlyBasis: { type: 'integer' }
                }
              }
            },
            dueDay: { type: 'integer', minimum: 1, maximum: 28 },
            graceDays: { type: 'integer', minimum: 0 },
            lateFeeBasis: { type: 'integer', minimum: 0 },
            arrears: { type: 'object' },
            asOf: { type: 'string' }
          }
        }
      }
    },
    async (req) => {
      const b = req.body;
      const community = req.user!.councilId;
      const run = runBilling(
        b.fees,
        (unitId) => b.arrears[unitId] ?? 0,
        { period: b.period, dueDay: b.dueDay, graceDays: b.graceDays, lateFlatBasis: b.lateFeeBasis },
        b.asOf ? new Date(b.asOf) : new Date()
      );
      // AR isolation: post each charge to a per-unit AR ledger account.
      const posted: Array<{ unitId: string; seq: number }> = [];
      for (const charge of run.charges) {
        const row = await deps.ledger.post(
          community,
          charge.referenceCode,
          charge.amountBasis,
          'credit',
          { type: 'strata_fee', referenceCode: charge.referenceCode, reconRef: charge.referenceCode }
        );
        posted.push({ unitId: charge.unitId, seq: row.seq });
      }
      return { run, postedCount: posted.length, posted };
    }
  );

  // ------------------------------------------------ Bylaw enforcement
  // Stateless over the pure state machine: each request submits the current
  // complaint facts and receives the validated next state or a rejection.
  app.post<{
    Body: {
      id: string;
      unitId: string;
      bylawRef: string;
      breachKind: 'standard' | 'short_term_rental';
      receivedAt: string;
      evidence: boolean;
    };
  }>(
    '/api/v1/bylaw/complaint',
    { preHandler: [authenticate] },
    async (req) => {
      try {
        const c = newComplaint(req.body);
        return { ok: true, complaint: c };
      } catch (err) {
        return { ok: false, reason: (err as Error).message };
      }
    }
  );

  app.post<{
    Body: { complaint: string; issuedAt: string };
  }>(
    '/api/v1/bylaw/complaint/notice',
    { preHandler: [authenticate, requireRole('treasurer')] },
    async (req) => {
      try {
        const c = issueNotice(JSON.parse(req.body.complaint), req.body.issuedAt);
        return { ok: true, complaint: c };
      } catch (err) {
        return { ok: false, reason: (err as Error).message };
      }
    }
  );

  app.post<{
    Body: { complaint: string; now: string; amountBasis: number; councilMinutesRef: string };
  }>(
    '/api/v1/bylaw/fine',
    { preHandler: [authenticate, requireRole('admin')] },
    async (req) => {
      let state: ReturnType<typeof JSON.parse>;
      try {
        state = JSON.parse(req.body.complaint) as Parameters<typeof imposeFine>[0];
      } catch {
        return { ok: false, reason: 'invalid complaint payload' };
      }
      const res = imposeFine(state, req.body.now, {
        councilMinutesRef: req.body.councilMinutesRef,
        amountBasis: req.body.amountBasis
      });
      return res.ok ? { ok: true, complaint: res.complaint } : { ok: false, reason: res.reason };
    }
  );

  app.post<{ Body: { complaint: string; now: string } }>(
    '/api/v1/bylaw/status',
    { preHandler: [authenticate] },
    async (req) => {
      let state;
      try {
        state = JSON.parse(req.body.complaint) as Parameters<typeof canImposeFine>[0];
      } catch {
        return { ok: false, reason: 'invalid complaint payload' };
      }
      const gate = canImposeFine(state, req.body.now);
      return { ...gate, fineCapsBp: { standard: 20_000, short_term_rental: 100_000 } };
    }
  );

  app.post<{ Body: { complaint: string; councilMinutesRef: string } }>(
    '/api/v1/bylaw/nofine',
    { preHandler: [authenticate, requireRole('admin')] },
    async (req) => {
      try {
        const c = decideNoFine(JSON.parse(req.body.complaint), req.body.councilMinutesRef);
        return { ok: true, complaint: c };
      } catch (err) {
        return { ok: false, reason: (err as Error).message };
      }
    }
  );

  // ------------------------------------------------ Conveyancing (Form B/F)
  app.post<{
    Body: {
      kind: 'B' | 'F';
      unitId: string;
      requestedAt: string;
      balanceBasis: number;
      arrearsBasis?: number;
      crfBasis?: number;
      pendingCases?: string[];
      eprDisclosed?: boolean;
      requester?: string;
    };
  }>(
    '/api/v1/forms',
    { preHandler: [authenticate] },
    async (req) => {
      const b = req.body;
      const form = generateForm(
        { kind: b.kind, unitId: b.unitId, requestedAt: b.requestedAt, requester: b.requester },
        {
          unitId: b.unitId,
          balanceBasis: b.balanceBasis,
          arrearsBasis: b.arrearsBasis ?? b.balanceBasis,
          crfBasis: b.crfBasis,
          pendingCases: b.pendingCases,
          eprDisclosed: b.eprDisclosed
        },
        new Date().toISOString().slice(0, 10)
      );
      return form;
    }
  );

  // ------------------------------------------------ Meetings (quorum + voting)
  app.post<{
    Body: {
      type: 'AGM' | 'SGM' | 'council' | 'rescheduled';
      eligible: number;
      present: number;
      councilSize?: number;
    };
  }>(
    '/api/v1/meetings/quorum',
    { preHandler: [authenticate] },
    async (req) => {
      const b = req.body;
      return b.type === 'rescheduled'
        ? checkQuorumRescheduled(b.present)
        : checkQuorum(b.type, b.eligible, b.present, b.councilSize ?? 0);
    }
  );

  app.post<{
    Body: {
      threshold: 'majority' | 'three_quarter' | 'eighty' | 'unanimous';
      eligible: number;
      present: number;
      yes: number;
      no: number;
      abstain: number;
    };
  }>(
    '/api/v1/meetings/vote',
    { preHandler: [authenticate] },
    async (req) => {
      const b = req.body;
      try {
        return countVote(b.threshold, { eligible: b.eligible, present: b.present, yes: b.yes, no: b.no, abstain: b.abstain });
      } catch (err) {
        return { ok: false, reason: (err as Error).message };
      }
    }
  );

  return app;
}
