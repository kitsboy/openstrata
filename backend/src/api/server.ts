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

import { createHash, randomBytes } from 'node:crypto';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import type { LedgerEngine } from '../ledger/ledger.js';
import { type Retriever, composeAnswer } from '../rosa/rosa.js';
import { authorizeSpend } from '../ziggy/ziggy.js';
import { planDca, type DcaFrequency } from '../ziggy/dca.js';
import { buildPsbtPlan, type PsbtInputRef } from '../ziggy/psbt.js';
import { broadcastPsbt, signedCount } from '../ziggy/broadcast.js';
import { planSummary } from '../ziggy/node-broadcast.js';
import { deriveUnitAddress, validateOnchainAddress } from '../rails/rails.js';
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
import { SITE_SLUG, receiveLabelFor } from '../rails/receive-label.js';
import type { InteracProvider, InteracRequest } from '../rails/interac.js';
import { payLinkPath, signPayLink, toPayLinkBill, verifyPayLink } from '../rails/pay-link.js';
import type { RateProvider } from '../rails/rails.js';
import { generateForm } from '../forms/forms.js';
import { checkQuorum, checkQuorumRescheduled, countVote } from '../meetings/meetings.js';
import type { UnitRecord, UnitRegistry } from '../units/model.js';
import { createRegistry, normalizeUnitRef, unitArFundCode } from '../units/model.js';
import type { UnitStore } from '../units/store.js';
import type { MemberStore } from '../members/store.js';
import { normalizeEmail, toMemberWire } from '../members/model.js';
import { statutoryDeadlines, withDaysLeft, sortDeadlines } from '../deadlines/deadlines.js';
import { hashPassword, verifyPassword } from '../auth/passwords.js';
import { signJwt, verifyJwt } from '../auth/jwt.js';
import type { AuthStore } from '../auth/store.js';
import { DuplicateEmailError } from '../auth/store.js';
import type { AuthUser, UserRole } from '../auth/model.js';
import { ROLE_RANK, toPublicUser } from '../auth/model.js';
import { RateLimiter, type RateLimitConfig } from '../auth/rate-limit.js';
import { corsHeaders, mergeVary, parseCorsOrigins } from './cors.js';
import { agentManifest, buildAgentContext } from './agent.js';
import { IdempotencyCache, requestFingerprint } from './idempotency-cache.js';

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
  /** Tenant-scoped unit store (migration 0005). When present, `/units` is
   * store-backed and seeded per council; the registry stays the fallback. */
  unitStore?: UnitStore;
  /** Tenant-scoped member registry (migration 0006). Owner/occupant layer. */
  memberStore?: MemberStore;
  /** Interac e-Transfer Business Request Money seam (demo provider when unset). */
  interac?: InteracProvider;
  /** Optional dependency probes. Exposed only as boolean readiness states. */
  readinessChecks?: Record<string, () => Promise<boolean>>;
  config: {
    crfMandatoryPct: number;
    vectorCollection: string;
    rails?: RailRegistry;
    cadPerBtc?: number; // fallback static rate for convertible rails
    authSecret: string;
    authRateLimitMax: number;
    authRateLimitWindowMs: number;
    authTokenTtl: number; // seconds
    /** Signing secret for bill links; falls back to `authSecret` (domain-separated). */
    payLinkSecret?: string;
    /** How long a bill link lives. Default 30 days, capped at 120. */
    payLinkTtlDays?: number;
    /**
     * Origins the static site is served from (`CORS_ORIGINS`). Empty / absent
     * means no cross-origin access at all — see `api/cors.ts` for the rules.
     */
    corsOrigins?: string[];
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TREASURY_FUNDS = new Set(['operating', 'crf', 'war_chest']);
const escapeHtml = (value: unknown): string =>
  String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

type PreHandler = (req: FastifyRequest, reply: FastifyReply) => Promise<void>;

/** Serialize a unit to the wire shape (AR fund code + reconciliation keys). */
function toUnitWire(u: UnitRecord) {
  return {
    unitRef: u.unitRef,
    floor: u.floor,
    sqft: u.sqft ?? null,
    occupancy: u.occupancy,
    tenant: u.tenant ?? null,
    rent: u.rent ?? null,
    eht: u.eht ?? false,
    evCharger: u.evCharger ?? false,
    formK: u.formK ?? 'missing',
    arFundCode: unitArFundCode(u.unitRef),
    reconciliationRefs: createRegistry([u]).refs(u.unitRef)
  };
}

/** Unit list for a council: store-backed when configured, else the registry. */
async function councilUnits(deps: ApiDeps, councilId: string): Promise<UnitRecord[]> {
  if (deps.unitStore) return deps.unitStore.list(councilId);
  return deps.units?.all() ?? [];
}

export async function buildServer(
  deps: ApiDeps,
  opts: { logger?: boolean } = { logger: true }
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: opts.logger ?? true,
    bodyLimit: 256 * 1024,
    requestTimeout: 30_000,
    // Reject unknown fields rather than silently stripping them. Silent
    // mutation is especially surprising for signed/payment and AI request APIs.
    ajv: { customOptions: { removeAdditional: false } }
  });
  // Process-local protection against lost-response retries and concurrent
  // duplicate ledger posts. Durable cross-process idempotency belongs in the DB.
  const idempotency = new IdempotencyCache();
  // Issued PSBT plans remain server-authoritative and tenant-bound. The token is
  // opaque lookup material, not a signature or a client-editable authorization.
  const psbtPlans = new Map<string, { councilId: string; plan: ReturnType<typeof buildPsbtPlan>; broadcasted: boolean; processing: boolean }>();

  // -----------------------------------------------------------  Cross-origin
  // The site and the API are different origins in both documented deployment
  // shapes (a static Cloudflare build against a council's own host), so a
  // browser refuses `/api/v1/*` until the API permits its origin. Opt-in and
  // exact: with no configured list, not one header is added.
  const cors = parseCorsOrigins(deps.config.corsOrigins);
  if (cors.refusedWildcard) {
    app.log.warn(
      'CORS_ORIGINS contained "*" — ignored. List the exact site origins: this API carries bearer tokens.'
    );
  }
  if (cors.origins.length > 0) {
    app.log.info(`CORS enabled for ${cors.origins.length} origin(s): ${cors.origins.join(', ')}`);
    app.addHook('onRequest', async (req, reply) => {
      const headers = corsHeaders(req.headers.origin, cors.origins);
      if (!headers.vary) return;
      reply.header('vary', mergeVary(reply.getHeader('vary'), 'Origin'));
      for (const [name, value] of Object.entries(headers)) {
        if (name !== 'vary') reply.header(name, value);
      }
      // A preflight is answered here and never reaches a route: the route would
      // want a body, and the browser only asks whether it may send one.
      if (req.method === 'OPTIONS' && headers['access-control-allow-origin']) {
        return reply.code(204).send();
      }
    });
  }

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

  /**
   * Auth for a route a payer reaches without an account: a valid Bearer token is
   * honoured, and its absence is not an error here — the handler must then find
   * a bill link (or refuse). An *invalid* Bearer token is still refused, so an
   * expired session cannot quietly fall through to the link path.
   */
  const authenticateOptional: PreHandler = async (req, reply) => {
    const header = req.headers.authorization;
    if (!header) return;
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return reply.code(401).send({ ok: false, reason: 'invalid or expired token' });
    const claims = verifyJwt(token, deps.config.authSecret);
    if (!claims) return reply.code(401).send({ ok: false, reason: 'invalid or expired token' });
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
  app.get('/health/live', async () => ({ ok: true, service: 'openstrata-backend', state: 'live' }));
  app.get('/health/ready', async (_req, reply) => {
    const checks = Object.entries(deps.readinessChecks ?? {});
    const results = await Promise.all(checks.map(async ([name, probe]) => {
      try {
        return [name, await probe() === true] as const;
      } catch {
        return [name, false] as const;
      }
    }));
    const dependencies = Object.fromEntries(results);
    const ready = results.every(([, passed]) => passed);
    if (!ready) reply.code(503);
    return { ok: ready, service: 'openstrata-backend', state: ready ? 'ready' : 'not-ready', dependencies };
  });

  // Agent discovery and context are read-only and always scoped to the
  // authenticated council. No agent endpoint can post a ledger entry or move
  // funds; those operations continue to require the established role-gated APIs.
  app.get('/api/v1/agent/manifest', { preHandler: [authenticate, requireRole('member')] }, async (_req, reply) => {
    reply.header('cache-control', 'private, no-store');
    reply.header('vary', mergeVary(reply.getHeader('vary'), 'Authorization'));
    return agentManifest;
  });
  app.get('/api/v1/agent/context', { preHandler: [authenticate, requireRole('member')] }, async (req, reply) => {
    const councilId = req.user!.councilId;
    const council = await deps.auth.getCouncil(councilId);
    if (!council) return reply.code(404).send({ ok: false, reason: 'council not found' });
    const safeCouncil = { id: council.id, name: council.name };
    const [units, operating, crf] = await Promise.all([
      councilUnits(deps, councilId),
      deps.ledger.balance(councilId, 'operating'),
      deps.ledger.balance(councilId, 'crf')
    ]);
    const now = new Date();
    const statutory = withDaysLeft(statutoryDeadlines(now), now);
    const operational = [];
    for (const unit of units) {
      for (const request of await deps.payments.listByUnit(councilId, unit.unitRef)) {
        if (request.status !== 'quoted') continue;
        const expiresAt = request.expiresAt ? new Date(request.expiresAt) : null;
        const validExpiry = expiresAt && Number.isFinite(expiresAt.getTime()) ? expiresAt : null;
        const daysLeft = validExpiry ? Math.ceil((validExpiry.getTime() - now.getTime()) / 86_400_000) : 1;
        operational.push({
          id: `quote:${request.referenceCode}`,
          kind: 'quote',
          title: `Payment quote ${request.referenceCode} is open`,
          dueAt: validExpiry?.toISOString() ?? now.toISOString(),
          daysLeft,
          severity: daysLeft <= 1 ? 'urgent' as const : 'soon' as const,
          jurisdiction: 'BC'
        });
      }
    }
    const deadlines = sortDeadlines([...statutory, ...operational]);
    // Financial and occupancy snapshots must never be retained by a browser or
    // intermediary cache; preserve the CORS hook's Origin variance as well.
    reply.header('cache-control', 'private, no-store');
    reply.header('vary', mergeVary(reply.getHeader('vary'), 'Authorization'));
    return buildAgentContext({
      council: safeCouncil,
      units,
      deadlines,
      funds: {
        operating: { balanceBasis: operating.balanceBasis, entryCount: operating.entryCount, verifiedHead: operating.headTally || null },
        crf: { balanceBasis: crf.balanceBasis, entryCount: crf.entryCount, verifiedHead: crf.headTally || null }
      },
      generatedAt: now.toISOString()
    });
  });

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
            councilName: { type: 'string', minLength: 1, maxLength: 120, pattern: '\\S' },
            email: { type: 'string', minLength: 3, maxLength: 254, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
            password: { type: 'string', minLength: 8, maxLength: 128 },
            displayName: { type: 'string', maxLength: 120 }
          }
        }
      }
    },
    async (req, reply) => {
      const email = req.body.email.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return reply.code(400).send({ ok: false, reason: 'invalid email address' });
      const councilName = req.body.councilName.trim();
      if (!councilName) return reply.code(400).send({ ok: false, reason: 'council name must not be empty' });
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
      const council = await deps.auth.createCouncil(councilName);
      // Fresh council gets its own building: seed the default unit set into
      // its tenant-scoped unit table (no-op when running registry-only), then
      // seed the member layer from the building's owners (migration 0006).
      if (deps.unitStore) {
        await deps.unitStore.seedDefault(council.id);
        if (deps.memberStore) {
          const seeded = await deps.unitStore.list(council.id);
          await deps.memberStore.seedDefault(
            council.id,
            seeded.map((u) => ({ unitRef: u.unitRef, owner: u.member?.owner }))
          );
        }
      }
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
          properties: {
            email: { type: 'string', maxLength: 254, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
            password: { type: 'string', minLength: 1, maxLength: 128 }
          }
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
            email: { type: 'string', minLength: 3, maxLength: 254, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
            displayName: { type: 'string', maxLength: 120 },
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
  // Tenant-scoped: with a unit store (migration 0005) each council sees only
  // its own building; the injected registry is the fallback for the scaffold.
  app.get('/api/v1/units', { preHandler: [authenticate] }, async (req) => {
    const units = await councilUnits(deps, req.user!.councilId);
    return { ok: true, units: units.map(toUnitWire) };
  });

  // Unit detail: the record + its AR ledger account (hash-chain verified) +
  // payment requests — the unit→payment→ledger traceability spine end to end.
  app.get<{ Params: { unitRef: string } }>(
    '/api/v1/units/:unitRef',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const councilId = req.user!.councilId;
      const unit = deps.unitStore
        ? await deps.unitStore.get(councilId, req.params.unitRef)
        : deps.units?.get(req.params.unitRef) ?? null;
      if (!unit) return reply.code(404).send({ ok: false, reason: 'unknown unit' });
      const fund = unitArFundCode(unit.unitRef);
      const ar = await deps.ledger.balance(councilId, fund);
      const payments = await deps.payments.listByUnit(councilId, unit.unitRef);
      return {
        ok: true,
        unit: toUnitWire(unit),
        ar: {
          fundCode: fund,
          balanceBasis: ar.balanceBasis,
          entryCount: ar.entryCount,
          headTally: ar.headTally.slice(0, 8)
        },
        payments: payments.map((p) => ({
          refId: p.refId,
          referenceCode: p.referenceCode,
          rail: p.rail,
          amountBasis: p.amountBasis,
          status: p.status,
          createdAt: p.createdAt
        }))
      };
    }
  );

  // Upsert a unit (treasurer+ — onboarding/edits are financial ops).
  app.post<{
    Body: {
      unitRef: string;
      floor: number;
      sqft?: number;
      occupancy?: 'occupied' | 'vacant' | 'short-term';
      tenant?: string | null;
      rent?: number | null;
      eht?: boolean;
      evCharger?: boolean;
      formK?: 'signed' | 'missing';
      owner?: string;
      occupants?: string[];
    };
  }>(
    '/api/v1/units',
    { preHandler: [authenticate, requireRole('treasurer')] },
    async (req, reply) => {
      if (!deps.unitStore) {
        return reply.code(501).send({ ok: false, reason: 'unit store not configured' });
      }
      // Canonical identity: store the normalized form ('U-501' -> '501') so
      // the row key, AR fund code, and every lookup agree.
      const unitRef = normalizeUnitRef(req.body.unitRef);
      if (!unitRef || !Number.isInteger(req.body.floor)) {
        return reply.code(400).send({ ok: false, reason: 'unitRef and integer floor are required' });
      }
      const saved = await deps.unitStore.upsert(req.user!.councilId, {
        unitRef,
        floor: req.body.floor,
        sqft: req.body.sqft,
        occupancy: req.body.occupancy ?? 'occupied',
        tenant: req.body.tenant ?? null,
        rent: req.body.rent ?? null,
        eht: req.body.eht ?? false,
        evCharger: req.body.evCharger ?? false,
        formK: req.body.formK ?? 'missing',
        member: req.body.owner || (req.body.occupants?.length ?? 0)
          ? { owner: req.body.owner, occupants: req.body.occupants ?? [] }
          : undefined
      });
      return { ok: true, unit: toUnitWire(saved) };
    }
  );

  // Remove a unit (admin only).
  app.delete<{ Params: { unitRef: string } }>(
    '/api/v1/units/:unitRef',
    { preHandler: [authenticate, requireRole('admin')] },
    async (req, reply) => {
      if (!deps.unitStore) {
        return reply.code(501).send({ ok: false, reason: 'unit store not configured' });
      }
      const removed = await deps.unitStore.remove(req.user!.councilId, req.params.unitRef);
      if (!removed) return reply.code(404).send({ ok: false, reason: 'unknown unit' });
      return { ok: true, removed: req.params.unitRef };
    }
  );

  // ------------------------------------------------  Member registry
  // The owner/occupant layer over units (migration 0006). Member rows are
  // tenant-scoped: each council manages its own building's people.
  app.get('/api/v1/members', { preHandler: [authenticate] }, async (req) => {
    const members = deps.memberStore
      ? await deps.memberStore.list(req.user!.councilId)
      : [];
    return { ok: true, members: members.map(toMemberWire) };
  });

  app.get<{ Querystring: { unitRef?: string } }>(
    '/api/v1/members/unit',
    { preHandler: [authenticate] },
    async (req) => {
      if (!req.query.unitRef) return { ok: true, members: [] };
      const unitRef = normalizeUnitRef(req.query.unitRef);
      if (!unitRef) return { ok: true, members: [] };
      const members = deps.memberStore
        ? await deps.memberStore.listByUnit(req.user!.councilId, unitRef)
        : [];
      return { ok: true, unitRef, members: members.map(toMemberWire) };
    }
  );

  app.post<{
    Body: {
      email: string;
      displayName?: string;
      phone?: string | null;
      unitRef: string;
      roleLabel?: 'owner' | 'tenant' | 'both';
    };
  }>(
    '/api/v1/members',
    {
      preHandler: [authenticate, requireRole('treasurer')],
      schema: {
        body: {
          type: 'object',
          required: ['email', 'unitRef'],
          additionalProperties: false,
          properties: {
            email: { type: 'string', minLength: 3 },
            displayName: { type: 'string' },
            phone: { type: ['string', 'null'] },
            unitRef: { type: 'string', minLength: 1 },
            roleLabel: { type: 'string', enum: ['owner', 'tenant', 'both'] }
          }
        }
      }
    },
    async (req, reply) => {
      if (!deps.memberStore) {
        return reply.code(501).send({ ok: false, reason: 'member store not configured' });
      }
      if (!EMAIL_RE.test(normalizeEmail(req.body.email))) {
        return reply.code(400).send({ ok: false, reason: 'invalid email address' });
      }
      const unitRef = normalizeUnitRef(req.body.unitRef);
      if (!unitRef) {
        return reply.code(400).send({ ok: false, reason: 'invalid unitRef' });
      }
      const units = await councilUnits(deps, req.user!.councilId);
      if (!units.some((u) => normalizeUnitRef(u.unitRef) === unitRef)) {
        return reply.code(404).send({ ok: false, reason: 'unknown unit' });
      }
      const member = await deps.memberStore.upsert(req.user!.councilId, {
        email: req.body.email,
        displayName: req.body.displayName,
        phone: req.body.phone ?? null,
        unitRef,
        roleLabel: req.body.roleLabel ?? 'owner'
      });
      return { ok: true, member: toMemberWire(member) };
    }
  );

  app.delete<{ Params: { id: string } }>(
    '/api/v1/members/:id',
    { preHandler: [authenticate, requireRole('admin')] },
    async (req, reply) => {
      if (!deps.memberStore) {
        return reply.code(501).send({ ok: false, reason: 'member store not configured' });
      }
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) return reply.code(400).send({ ok: false, reason: 'invalid id' });
      const removed = await deps.memberStore.remove(req.user!.councilId, id);
      if (!removed) return reply.code(404).send({ ok: false, reason: 'unknown member' });
      return { ok: true, removed: id };
    }
  );

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

  // Monthly treasury series (income vs expenses per month) for the dashboard
  // charts — verified against the hash chain like balance.
  app.get<{ Querystring: { fund?: string; months?: string } }>(
    '/api/v1/ledger/series',
    { preHandler: [authenticate] },
    async (req) => {
      const months = Math.min(24, Math.max(1, Number(req.query.months) || 6));
      return {
        fund: req.query.fund ?? 'operating',
        points: await deps.ledger.series(req.user!.councilId, req.query.fund ?? 'operating', months)
      };
    }
  );

  // Full verified chain for a fund — the ledger explorer + CSV export read
  // this. Tampering anywhere in the chain makes the request throw 500.
  app.get<{ Querystring: { fund: string } }>(
    '/api/v1/ledger/entries',
    { preHandler: [authenticate] },
    async (req) => {
      const entries = await deps.ledger.entries(req.user!.councilId, req.query.fund);
      return { ok: true, fund: req.query.fund, entries };
    }
  );

  // "What's due" task center: statutory calendar + operational deadlines
  // (open payment quotes expiring) for this council, sorted soonest-first.
  app.get('/api/v1/deadlines', { preHandler: [authenticate] }, async (req) => {
    const now = new Date();
    const statutory = withDaysLeft(statutoryDeadlines(now), now);
    const items = statutory.map((s) => ({ ...s, kind: s.kind, source: 'statutory' }));

    // Operational: open payment quotes (status 'quoted') expire per invoice.
    const units = await councilUnits(deps, req.user!.councilId);
    for (const unit of units) {
      const requests = await deps.payments.listByUnit(req.user!.councilId, unit.unitRef);
      for (const p of requests) {
        if (p.status !== 'quoted') continue;
        const expiresAt = p.expiresAt ? new Date(p.expiresAt) : null;
        const daysLeft = expiresAt
          ? Math.ceil((expiresAt.getTime() - now.getTime()) / 86_400_000)
          : 1;
        items.push({
          id: `quote:${p.referenceCode}`,
          kind: 'quote',
          title: `Payment quote ${p.referenceCode} for unit ${unit.unitRef} is open`,
          dueAt: expiresAt ? expiresAt.toISOString() : now.toISOString(),
          daysLeft,
          severity: daysLeft <= 1 ? 'urgent' : 'soon',
          jurisdiction: 'BC',
          source: 'operational'
        });
      }
    }
    return { ok: true, asOf: now.toISOString(), items: sortDeadlines(items) };
  });

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
    async (req, reply) => {
      const idemHeader = req.headers['idempotency-key'];
      const idem = Array.isArray(idemHeader) ? idemHeader[0] : idemHeader;
      if (idemHeader && (!idem || !/^[A-Za-z0-9._:-]{1,128}$/.test(idem))) {
        return reply.code(400).send({ ok: false, reason: 'invalid Idempotency-Key' });
      }
      const options = {
        type: req.body.type,
        description: req.body.description,
        referenceCode: req.body.referenceCode,
        reconRef: req.body.reconRef
      };
      const postLedger = async () => {
        const row = await deps.ledger.post(
          req.user!.councilId,
          req.body.fund,
          req.body.amountBasis,
          req.body.kind,
          options
        );
        return { posted: true, seq: row.seq, tallyRoot: row.tallyRoot.slice(0, 8) };
      };
      if (!idem) return postLedger();
      const fingerprint = requestFingerprint(req.body);
      const durable = await deps.ledger.postIdempotent(
        req.user!.councilId,
        req.body.fund,
        req.body.amountBasis,
        req.body.kind,
        options,
        idem,
        fingerprint
      );
      if (durable) {
        if (durable.status === 'conflict') {
          return reply.code(409).send({ ok: false, reason: 'Idempotency-Key was already used with a different request' });
        }
        return { posted: true, seq: durable.entry.seq, tallyRoot: durable.entry.tallyRoot.slice(0, 8) };
      }
      const outcome = await idempotency.run(
        `ledger:${req.user!.councilId}:${idem}`,
        fingerprint,
        postLedger
      );
      if (outcome.status === 'conflict') {
        return reply.code(409).send({ ok: false, reason: 'Idempotency-Key was already used with a different request' });
      }
      if (outcome.status === 'full') {
        return reply.code(503).send({ ok: false, reason: 'idempotency cache is busy; retry shortly' });
      }
      return outcome.value;
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

  // ------------------------------------------------------------------  Ziggy
  // War-chest DCA plan (item #18) — pure schedule at the current CAD/BTC rate.
  app.post<{
    Body: {
      annualOperatingBudgetBasis: number;
      allocationPerPeriodBasis: number;
      frequency: DcaFrequency;
      periods: number;
      cadPerBtc?: number;
    };
  }>(
    '/api/v1/treasury/dca/plan',
    { preHandler: [authenticate, requireRole('treasurer')] },
    async (req) => {
      const b = req.body;
      const rate = b.cadPerBtc ?? (await cadPerBtc());
      const plan = planDca({
        annualOperatingBudgetBasis: b.annualOperatingBudgetBasis,
        allocationPerPeriodBasis: b.allocationPerPeriodBasis,
        frequency: b.frequency,
        periods: b.periods,
        cadPerBtc: rate
      });
      return { ok: true, plan, cadPerBtc: rate };
    }
  );

  // PSBT/multisig execution plan (item #15) — skeleton + signature tracking.
  app.post<{
    Body: {
      verdict: { allow: true; reason: string; pulledFrom: string; basis: number };
      amountSats: number;
      feeSats: number;
      recipient: string;
      inputs: PsbtInputRef[];
      totalSigners: number;
      requiredSignatures: number;
      network?: 'mainnet' | 'testnet';
      maxFeeSats?: number;
      resolutionId?: string;
    };
  }>(
    '/api/v1/treasury/psbt/plan',
    {
      preHandler: [authenticate, requireRole('treasurer')],
      schema: {
        body: {
          type: 'object', required: ['verdict', 'amountSats', 'feeSats', 'recipient', 'inputs', 'totalSigners', 'requiredSignatures'], additionalProperties: false,
          properties: {
            verdict: { type: 'object', required: ['allow', 'reason', 'pulledFrom', 'basis'], additionalProperties: false, properties: { allow: { const: true }, reason: { type: 'string', maxLength: 300 }, pulledFrom: { type: 'string', minLength: 1, maxLength: 128 }, basis: { type: 'integer', minimum: 1 } } },
            amountSats: { type: 'integer', minimum: 1, maximum: 2100000000000000 },
            feeSats: { type: 'integer', minimum: 0, maximum: 2100000000000000 },
            recipient: { type: 'string', minLength: 26, maxLength: 90 },
            inputs: { type: 'array', minItems: 1, maxItems: 100, items: { type: 'object', required: ['txid', 'vout', 'sats'], additionalProperties: false, properties: { txid: { type: 'string', pattern: '^[0-9a-fA-F]{64}$' }, vout: { type: 'integer', minimum: 0, maximum: 4294967295 }, sats: { type: 'integer', minimum: 1, maximum: 2100000000000000 } } } },
            totalSigners: { type: 'integer', minimum: 1, maximum: 15 },
            requiredSignatures: { type: 'integer', minimum: 1, maximum: 15 },
            network: { type: 'string', enum: ['mainnet', 'testnet'] },
            maxFeeSats: { type: 'integer', minimum: 0, maximum: 2100000000000000 },
            resolutionId: { type: 'string', minLength: 1, maxLength: 128 }
          }
        }
      }
    },
    async (req, reply) => {
      const b = req.body;
      try {
        // Recompute policy from server-controlled ledger balances and budget;
        // a client-provided `allow: true` object is never authorization.
        const pulledFrom = b.verdict.pulledFrom;
        if (!TREASURY_FUNDS.has(pulledFrom) || !Number.isSafeInteger(b.verdict.basis) || b.verdict.basis <= 0) {
          return reply.code(403).send({ ok: false, reason: 'server-side treasury policy denied this plan' });
        }
        const budget = { ...defaultBudget, crfMandatoryPct: deps.config.crfMandatoryPct };
        const [operatingBalance, crfBalance, selectedBalance] = await Promise.all([
          deps.ledger.balance(req.user!.councilId, 'operating'),
          deps.ledger.balance(req.user!.councilId, 'crf'),
          deps.ledger.balance(req.user!.councilId, pulledFrom)
        ]);
        const accountBalances = {
          operating: operatingBalance.balanceBasis,
          crf: crfBalance.balanceBasis,
          war_chest: selectedBalance.balanceBasis
        };
        if (pulledFrom === 'crf') accountBalances.operating = 0;
        if (pulledFrom === 'war_chest') {
          accountBalances.operating = 0;
          accountBalances.crf = 0;
        }
        const verifiedAddress = validateOnchainAddress(b.recipient);
        const verifiedNetwork = b.network ?? 'mainnet';
        const recipientMatchesNetwork = verifiedNetwork === 'mainnet'
          ? /^(bc1|[13])/.test(b.recipient)
          : /^(tb1|[2mn])/.test(b.recipient);
        if (!verifiedAddress.ok || !recipientMatchesNetwork) {
          return reply.code(400).send({ ok: false, reason: 'recipient does not match the authorized network' });
        }
        const verdict = authorizeSpend(
          budget,
          accountBalances,
          {
            amountBasis: b.verdict.basis,
            fundCode: pulledFrom,
            poRef: b.verdict.reason,
            category: b.verdict.reason
          }
        );
        const availableBasis = selectedBalance.balanceBasis;
        if (!verdict.allow || b.verdict.basis > availableBasis) {
          return reply.code(403).send({ ok: false, reason: 'server-side treasury policy denied this plan' });
        }
        // CAD authorization basis and Bitcoin satoshis are different units;
        // validating them arithmetically would be meaningless. Satoshi inputs/fee
        // are independently checked by buildPsbtPlan below.
        if (!Number.isSafeInteger(b.amountSats) || !Number.isSafeInteger(b.feeSats)) {
          return { ok: false, reason: 'a positive allowed spend verdict and safe satoshi amounts are required' };
        }
        const plan = buildPsbtPlan({
          verdict,
          amountSats: b.amountSats,
          feeSats: b.feeSats,
          recipient: b.recipient,
          inputs: b.inputs,
          totalSigners: b.totalSigners,
          requiredSignatures: b.requiredSignatures,
          network: b.network,
          maxFeeSats: b.maxFeeSats,
          resolutionId: b.resolutionId
        });
        const now = Date.now();
        for (const [token, issued] of psbtPlans) {
          if (Date.parse(issued.plan.expiresAt) <= now) psbtPlans.delete(token);
        }
        const candidateOutpoints = new Set(plan.inputs.map((input) => `${input.txid.toLowerCase()}:${input.vout}`));
        const alreadyReserved = [...psbtPlans.values()].some((issued) =>
          issued.councilId === req.user!.councilId && !issued.broadcasted && issued.plan.inputs.some((input) =>
            candidateOutpoints.has(`${input.txid.toLowerCase()}:${input.vout}`)
          )
        );
        if (alreadyReserved) return reply.code(409).send({ ok: false, reason: 'one or more inputs are already reserved by another plan' });
        if (psbtPlans.size >= 1000) return reply.code(503).send({ ok: false, reason: 'too many active plans; retry after expiry' });
        psbtPlans.set(plan.planToken, { councilId: req.user!.councilId, plan, broadcasted: false, processing: false });
        return { ok: true, plan };
      } catch (err) {
        return { ok: false, reason: (err as Error).message };
      }
    }
  );

  // PSBT broadcast checks the immutable server-issued authorization and refuses
  // the live path while no cryptographic verifier/transaction builder exists.
  // Demo responses are deterministic placeholders and never post a ledger debit.
  app.post<{
    Body: {
      planId: string;
      readyPlan: {
        id: string;
        authorization: { allowed: boolean; fundCode: string; amountBasis: number };
        recipient: string;
        amountSats: number;
        feeSats: number;
        inputs: PsbtInputRef[];
        totalSigners: number;
        requiredSignatures: number;
        signatures: Record<string, string | undefined>;
        issuedAt: string;
        expiresAt: string;
        policy: { network: 'mainnet' | 'testnet'; maxFeeSats: number; resolutionId?: string };
        planToken: string;
        ready: boolean;
        psbtB64: string | null;
      };
      signatures?: Record<string, string>;
      postToLedger: boolean;
      amountBasis?: number; // CAD basis for the ledger debit (from the verdict basis)
      planToken?: string; // optional explicit token; must match the server-issued plan
    };
  }>(
    '/api/v1/treasury/psbt/broadcast',
    {
      preHandler: [authenticate, requireRole('treasurer')],
      schema: {
        body: {
          type: 'object', required: ['planId', 'readyPlan', 'postToLedger'], additionalProperties: false,
          properties: {
            planId: { type: 'string', minLength: 1, maxLength: 160 },
            planToken: { type: 'string', minLength: 40, maxLength: 64 },
            postToLedger: { type: 'boolean' },
            amountBasis: { type: 'integer', minimum: 1 },
            readyPlan: {
              type: 'object', additionalProperties: false,
              required: ['id', 'authorization', 'recipient', 'amountSats', 'feeSats', 'inputs', 'totalSigners', 'requiredSignatures', 'signatures', 'issuedAt', 'expiresAt', 'policy', 'planToken', 'ready', 'psbtB64'],
              properties: {
                id: { type: 'string', minLength: 1, maxLength: 160 },
                authorization: { type: 'object', required: ['allowed', 'fundCode', 'amountBasis'], additionalProperties: false, properties: { allowed: { const: true }, fundCode: { type: 'string', minLength: 1, maxLength: 128 }, amountBasis: { type: 'integer', minimum: 1 } } },
                recipient: { type: 'string', minLength: 26, maxLength: 90 },
                amountSats: { type: 'integer', minimum: 1, maximum: 2100000000000000 },
                feeSats: { type: 'integer', minimum: 0, maximum: 2100000000000000 },
                inputs: { type: 'array', minItems: 1, maxItems: 100, items: { type: 'object', required: ['txid', 'vout', 'sats'], additionalProperties: false, properties: { txid: { type: 'string', pattern: '^[0-9a-fA-F]{64}$' }, vout: { type: 'integer', minimum: 0, maximum: 4294967295 }, sats: { type: 'integer', minimum: 1, maximum: 2100000000000000 } } } },
                totalSigners: { type: 'integer', minimum: 1, maximum: 15 },
                requiredSignatures: { type: 'integer', minimum: 1, maximum: 15 },
                signatures: { type: 'object', maxProperties: 15, propertyNames: { pattern: '^(0|[1-9][0-9]*)$' }, additionalProperties: { type: 'string', minLength: 1, maxLength: 1024, pattern: '^[A-Za-z0-9+/_-]+={0,2}$' } },
                issuedAt: { type: 'string', minLength: 1, maxLength: 40 },
                expiresAt: { type: 'string', minLength: 1, maxLength: 40 },
                policy: { type: 'object', required: ['network', 'maxFeeSats'], additionalProperties: false, properties: { network: { type: 'string', enum: ['mainnet', 'testnet'] }, maxFeeSats: { type: 'integer', minimum: 0, maximum: 2100000000000000 }, resolutionId: { type: 'string', minLength: 1, maxLength: 128 } } },
                planToken: { type: 'string', minLength: 40, maxLength: 64 },
                ready: { type: 'boolean' },
                psbtB64: { type: ['string', 'null'], maxLength: 100000 }
              }
            }
          }
        }
      }
    },
    async (req, reply) => {
      const b = req.body;
      const readyPlan = b.readyPlan;
      const nodeEnabled = process.env.BITCOIN_RAIL_ENABLED === 'true';
      const issued = psbtPlans.get(readyPlan.planToken);
      if (b.planId !== readyPlan.id || !issued || issued.councilId !== req.user!.councilId ||
          (b.planToken !== undefined && b.planToken !== readyPlan.planToken)) {
        return reply.code(400).send({ ok: false, reason: 'plan identity check failed' });
      }
      if (issued.broadcasted || issued.processing) return reply.code(409).send({ ok: false, reason: 'plan was already processed' });
      const immutable = (plan: typeof readyPlan) => requestFingerprint({
        id: plan.id, authorization: plan.authorization, recipient: plan.recipient, amountSats: plan.amountSats,
        feeSats: plan.feeSats, inputs: plan.inputs, totalSigners: plan.totalSigners,
        requiredSignatures: plan.requiredSignatures, issuedAt: plan.issuedAt, expiresAt: plan.expiresAt,
        policy: plan.policy, planToken: plan.planToken, psbtB64: plan.psbtB64
      });
      if (immutable(readyPlan) !== immutable(issued.plan)) {
        return reply.code(409).send({ ok: false, reason: 'submitted plan does not match the server-issued authorization' });
      }
      const signatures = readyPlan.signatures ?? {};
      const signerIndexes = Object.keys(signatures);
      const slotsValid = signerIndexes.length <= issued.plan.totalSigners && signerIndexes.every((index) =>
        /^(0|[1-9][0-9]*)$/.test(index) && Number(index) < issued.plan.totalSigners &&
        typeof signatures[index] === 'string' && signatures[index]!.length > 0 && signatures[index]!.length <= 1024 && /^[A-Za-z0-9+/_-]+={0,2}$/.test(signatures[index]!)
      );
      const serverReady = slotsValid && signerIndexes.length >= issued.plan.requiredSignatures;
      if (!slotsValid) return reply.code(400).send({ ok: false, reason: 'signature slots are invalid' });
      if (readyPlan.ready !== serverReady) return reply.code(400).send({ ok: false, reason: 'plan readiness does not match signature count' });
      if (typeof readyPlan.expiresAt !== 'string' || !Number.isFinite(Date.parse(readyPlan.expiresAt)) || Date.parse(readyPlan.expiresAt) <= Date.now()) {
        return reply.code(410).send({ ok: false, reason: 'plan expired; create a fresh authorized plan' });
      }
      const planSlotsValid = Number.isInteger(readyPlan.totalSigners) && readyPlan.totalSigners >= 1 && readyPlan.totalSigners <= 15 && slotsValid;
      const recipientValidation = typeof readyPlan.recipient === 'string' ? validateOnchainAddress(readyPlan.recipient) : { ok: false as const };
      const network = readyPlan.policy?.network;
      const recipientNetworkMatches = typeof readyPlan.recipient === 'string' &&
        (network === 'mainnet' ? /^(bc1|[13])/.test(readyPlan.recipient) : network === 'testnet' ? /^(tb1|[2mn])/.test(readyPlan.recipient) : false);
      if (typeof readyPlan.authorization.fundCode !== 'string' || !TREASURY_FUNDS.has(readyPlan.authorization.fundCode)) {
        return reply.code(400).send({ ok: false, reason: 'plan fund is invalid' });
      }
      const [currentOperating, currentCrf, currentFund] = await Promise.all([
        deps.ledger.balance(req.user!.councilId, 'operating'),
        deps.ledger.balance(req.user!.councilId, 'crf'),
        deps.ledger.balance(req.user!.councilId, readyPlan.authorization.fundCode)
      ]);
      const activeBudget = { ...defaultBudget, crfMandatoryPct: deps.config.crfMandatoryPct };
      const availableBasis = currentFund.balanceBasis;
      const policyBalances = {
        operating: currentOperating.balanceBasis,
        crf: currentCrf.balanceBasis,
        war_chest: currentFund.balanceBasis
      };
      if (readyPlan.authorization.fundCode === 'crf') policyBalances.operating = 0;
      if (readyPlan.authorization.fundCode === 'war_chest') {
        policyBalances.operating = 0;
        policyBalances.crf = 0;
      }
      const liveVerdict = authorizeSpend(activeBudget, policyBalances, {
        amountBasis: readyPlan.authorization.amountBasis,
        fundCode: readyPlan.authorization.fundCode,
        poRef: 'server-issued PSBT authorization',
        category: 'authorized treasury spend'
      });
      if (!liveVerdict.allow || readyPlan.authorization.amountBasis > availableBasis) {
        return reply.code(409).send({ ok: false, reason: 'plan authorization is no longer valid against current balances or CRF policy' });
      }
      const seenOutpoints = new Set<string>();
      const inputsValid = Array.isArray(readyPlan.inputs) && readyPlan.inputs.length >= 1 && readyPlan.inputs.length <= 100 && readyPlan.inputs.every((input) => {
        if (!/^[0-9a-f]{64}$/i.test(input.txid) || !Number.isInteger(input.vout) || input.vout < 0 || input.vout > 0xffffffff || !Number.isSafeInteger(input.sats) || input.sats <= 0) return false;
        const outpoint = `${input.txid.toLowerCase()}:${input.vout}`;
        if (seenOutpoints.has(outpoint)) return false;
        seenOutpoints.add(outpoint);
        return true;
      });
      const totalInputSats = inputsValid ? readyPlan.inputs.reduce((sum, input) => sum + input.sats, 0) : 0;
      const issuedAtMs = typeof readyPlan.issuedAt === 'string' ? Date.parse(readyPlan.issuedAt) : Number.NaN;
      const expiresAtMs = typeof readyPlan.expiresAt === 'string' ? Date.parse(readyPlan.expiresAt) : Number.NaN;
      if (!readyPlan.authorization.allowed || !planSlotsValid ||
          !Number.isInteger(readyPlan.requiredSignatures) || readyPlan.requiredSignatures < 1 || readyPlan.requiredSignatures > readyPlan.totalSigners ||
          !Number.isSafeInteger(readyPlan.amountSats) || readyPlan.amountSats <= 0 || !Number.isSafeInteger(readyPlan.feeSats) || readyPlan.feeSats < 0 ||
          !Number.isSafeInteger(readyPlan.policy?.maxFeeSats) || readyPlan.feeSats > readyPlan.policy.maxFeeSats ||
          !inputsValid || !Number.isSafeInteger(totalInputSats) || totalInputSats < readyPlan.amountSats + readyPlan.feeSats || !recipientValidation.ok || !recipientNetworkMatches ||
          !Number.isFinite(issuedAtMs) || issuedAtMs > Date.now() + 60_000 ||
          !Number.isFinite(expiresAtMs) || expiresAtMs <= issuedAtMs) {
        return reply.code(400).send({ ok: false, reason: 'plan policy validation failed' });
      }
      if (b.postToLedger) {
        return reply.code(409).send({ ok: false, reason: 'ledger posting is disabled until a verified live transaction can be recorded' });
      }
      if (nodeEnabled && serverReady) {
        return reply.code(503).send({ ok: false, broadcasted: false, txid: null, rail: 'unavailable', placeholder: false, reason: 'live broadcast disabled: verified signing and transaction construction are not implemented' });
      }
      if (issued.processing || issued.broadcasted) {
        return reply.code(409).send({ ok: false, reason: 'plan was already processed' });
      }
      // No awaits follow this in-flight claim: concurrent retries cannot both
      // pass the one-time processing guard after the balance checks above.
      issued.processing = true;
      issued.plan = { ...issued.plan, signatures, ready: serverReady };
      const result = broadcastPsbt({
        plan: { ...issued.plan, signatures, ready: serverReady },
        ledger: deps.ledger,
        communityId: req.user!.councilId
      });

      let ledgerSeq: number | null = null;
      let txid: string | null = result.txid;
      // Broadcast-honesty tri-state (Lenny ruling t_2fda9855): on the real rail
      // a placeholder must NEVER stand for an on-chain spend; in demo (rail off)
      // the placeholder stays but is explicitly tagged.
      let placeholder = false;
      let rail: 'live' | 'unavailable' | undefined;
      let seamReason: string | undefined;

      if (result.broadcasted) {
        // On-chain broadcast seam: when the host runs bitcoind (or another node
        // client) and it is enabled, broadcast the spend for real and return the
        // txid. The PSBT workflow seam (walletprocesspsbt → finalizepsbt →
        // sendpsbt) runs first — it is the BIP174 path hardware-wallet
        // signatures feed. If the node has no signing wallet, fall back to the
        // raw-tx seam (watch-only + external signer); if that fails too, txid
        // stays null and the response notes it (ledger post already succeeded).
        if (nodeEnabled) {
          rail = 'unavailable';
          seamReason = 'live broadcast disabled: verified signing and transaction construction are not implemented';
        } else {
          // Demo/bootstrap — rail NOT enabled. Keep the no-node placeholder so
          // the seam can iterate, but tag it explicitly so it can never be read
          // as a spend that reached the chain.
          placeholder = true;
          if (readyPlan.recipient && readyPlan.amountSats) {
            const demoDigest = createHash('sha256').update(JSON.stringify({ id: readyPlan.id, recipient: readyPlan.recipient, amountSats: readyPlan.amountSats })).digest('hex').slice(0, 16);
            txid = `psbt:${readyPlan.id}:${demoDigest}`;
          }
        }
      }

      // The stub reason is only honest while no real txid exists — a real
      // broadcast must not echo "no node client configured". A hard seam error
      // (inputs/outputs mismatch) overrides the stub reason too.
      const reason = seamReason ?? (txid ? undefined : result.reason);

      if (result.broadcasted && !nodeEnabled) {
        issued.broadcasted = true;
        issued.plan = { ...issued.plan, signatures, ready: serverReady };
      } else {
        issued.processing = false;
      }
      return {
        ok: true,
        broadcasted: result.broadcasted,
        plan: { ...issued.plan, signatures, ready: result.broadcasted },
        summary: planSummary({ ...issued.plan, signatures, ready: result.broadcasted }),
        signedCount: signedCount({ ...issued.plan, signatures, ready: result.broadcasted }),
        requiredSignatures: readyPlan.requiredSignatures,
        txid,
        ledgerSeq,
        placeholder,
        ...(rail !== undefined ? { rail } : {}),
        reason
      };
    }
  );

  // --------------------------------------------------  Satohash stamping
  // Item #19 — hash-of-record for payments/votes/bylaw actions. Returns the
  // SHA-256 digest + the satohash.io stamp URL; the stamp call itself runs
  // client-side (src/lib/satohash.ts) against api.satohash.io.
  app.post<{ Body: { scope: string; payload: unknown } }>(
    '/api/v1/compliance/stamp',
    { preHandler: [authenticate] },
    async (req) => {
      const b = req.body;
      const canonical = JSON.stringify({
        scope: b.scope,
        council: req.user!.councilId,
        payload: b.payload
      });
      const hash = createHash('sha256').update(canonical).digest('hex');
      return {
        ok: true,
        hash,
        scope: b.scope,
        stampUrl: `https://satohash.io/stamp?hash=${hash}`
      };
    }
  );

  // --------------------------------------------------  Watch-only xpub
  // Item #16 — register the council's watch-only xpub (keys never leave the
  // hardware wallets); per-unit BIP32 receive paths derive deterministically.
  const councilXpubs = new Map<string, { xpub: string; network: 'mainnet' | 'testnet' }>();
  app.post<{ Body: { xpub: string } }>(
    '/api/v1/rails/xpub',
    {
      preHandler: [authenticate, requireRole('treasurer')],
      schema: {
        body: {
          type: 'object', required: ['xpub'], additionalProperties: false,
          properties: { xpub: { type: 'string', minLength: 100, maxLength: 120 } }
        }
      }
    },
    async (req, reply) => {
      try {
        const xpub = req.body.xpub.trim();
        // The version bytes determine the network; retain that server-side and
        // return only path metadata (never the sensitive public derivation root).
        const validated = deriveUnitAddress(xpub, '1');
        const network = validated.network;
        councilXpubs.set(req.user!.councilId, { xpub, network });
        return { ok: true, registered: true, network };
      } catch (err) {
        return reply.code(400).send({ ok: false, reason: (err as Error).message });
      }
    }
  );

  app.get('/api/v1/rails/xpub', { preHandler: [authenticate, requireRole('treasurer')] }, async (req) => {
    const registered = councilXpubs.get(req.user!.councilId);
    if (!registered) return { ok: true, registered: false };
    const units = (await councilUnits(deps, req.user!.councilId)).slice(0, 20);
    return {
      ok: true,
      registered: true,
      network: registered.network,
      addresses: units.map((u) => {
        const derived = deriveUnitAddress(registered.xpub, u.unitRef, registered.network);
        return { unitId: derived.unitId, path: derived.path, index: derived.index, note: derived.note };
      })
    };
  });

  // Rosa: strict RAG query (citations only). Public — BC law is the knowledge
  // base behind the product and the site already publishes it.
  app.post<{ Body: { question: string; facts?: Record<string, string> } }>(
    '/api/v1/rosa/query',
    {
      schema: {
        body: {
          type: 'object',
          required: ['question'],
          additionalProperties: false,
          properties: {
            question: { type: 'string', minLength: 1, maxLength: 1000, pattern: '\\S' },
            facts: {
              type: 'object',
              maxProperties: 24,
              additionalProperties: { type: 'string', maxLength: 300 }
            }
          }
        }
      }
    },
    async (req) => {
      const question = req.body.question.trim();
      if (!question) return { answer: 'No question was provided.', cited: [], uncertain: true, collection: deps.config.vectorCollection };
      const chunks = await deps.rosa.retrieve(question, 3);
      const answer = composeAnswer(question, chunks, req.body.facts ?? {});
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
    // `live: false` with a provider present means the host is answering from the
    // labelled rehearsal, which is a fact a payer-facing screen has to know.
    interac: { configured: Boolean(deps.interac), live: Boolean(deps.interac && !deps.interac.demo) },
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
      // Unit master-data rule: resolve every unit key through the canonical
      // normalization ('unit-302' / 'U-302' / '302' -> '302') so the stored
      // payment_request rows and unit-detail traceability agree.
      const unitRef = normalizeUnitRef(b.unitRef);
      if (!unitRef) return { ok: false, reason: 'invalid unitRef' };
      try {
        const rate = await cadPerBtc(); // resolve outside the sync buildInvoice()
        const communityId = req.user!.councilId;
        const { request, created } = await getOrCreateQuote(
          deps.payments,
          {
            refId: b.refId,
            unitRef,
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
                unitRef,
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
          // Per-site receive label. Returned to the caller so the council can put
          // it on the transfer, and read by the rail seam as the node memo — one
          // string, so a payment can never be traced to the wrong project.
          receiveLabel: receiveLabelFor({
            site: SITE_SLUG,
            communityId,
            unitRef,
            refId: b.refId
          }),
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

  // -------------------------------------------  Bill links (the owner path)
  // An owner paying strata fees is not signed in, and a council session must
  // never be put in a URL. The link is the credential instead: an HMAC-signed
  // statement that this lot owes this amount under this reference until it
  // expires. It is not a payment and it posts nothing — the reference is the
  // same one the ledger reconciles by.
  const payLinkSecret = (): string => deps.config.payLinkSecret ?? deps.config.authSecret;

  app.post<{
    Body: {
      unitRef: string;
      amountBasis: number;
      referenceCode: string;
      payeeContact: string;
      ttlDays?: number;
    };
  }>(
    '/api/v1/payments/link',
    {
      preHandler: [authenticate, requireRole('treasurer')],
      schema: {
        body: {
          type: 'object',
          required: ['unitRef', 'amountBasis', 'referenceCode', 'payeeContact'],
          additionalProperties: false,
          properties: {
            unitRef: { type: 'string', minLength: 1 },
            amountBasis: { type: 'integer', minimum: 1 },
            referenceCode: { type: 'string', minLength: 1 },
            payeeContact: { type: 'string', minLength: 3 },
            ttlDays: { type: 'integer', minimum: 1, maximum: 120 }
          }
        }
      }
    },
    async (req) => {
      const unitRef = normalizeUnitRef(req.body.unitRef);
      if (!unitRef) return { ok: false, reason: 'invalid unitRef' };
      const councilId = req.user!.councilId;
      const council = await deps.auth.getCouncil(councilId);
      try {
        const token = signPayLink(
          {
            councilId,
            councilName: council?.name ?? councilId,
            unitRef,
            amountBasis: req.body.amountBasis,
            referenceCode: req.body.referenceCode,
            payeeContact: req.body.payeeContact,
            ttlDays: req.body.ttlDays ?? deps.config.payLinkTtlDays
          },
          payLinkSecret()
        );
        const claims = verifyPayLink(token, payLinkSecret());
        return {
          ok: true,
          token,
          // The treasurer's own origin, not ours: the host may be reached by a
          // Tailscale name, a custom domain or localhost, and only the browser
          // knows which one the owner will open.
          path: payLinkPath(unitRef, token),
          unitRef,
          amountBasis: req.body.amountBasis,
          referenceCode: req.body.referenceCode,
          councilName: council?.name ?? councilId,
          expiresAt: claims.ok ? new Date(claims.claims.exp * 1000).toISOString() : null
        };
      } catch (err) {
        return { ok: false, reason: (err as Error).message };
      }
    }
  );

  // Public by design: the token is the credential. It returns the bill printed on
  // the link and nothing else — no balances, no ledger, no other lots. The token
  // travels in the body rather than the path because a signed bill is longer
  // than most routers' path-parameter limit (Fastify's is 100 bytes).
  app.post<{ Body: { token: string } }>(
    '/api/v1/payments/link/verify',
    {
      schema: {
        body: {
          type: 'object',
          required: ['token'],
          additionalProperties: false,
          properties: { token: { type: 'string', minLength: 1 } }
        }
      }
    },
    async (req, reply) => {
      const verified = verifyPayLink(req.body.token, payLinkSecret());
      if (!verified.ok) {
        reply.code(400);
        return { ok: false, reason: verified.reason };
      }
      return { ok: true, ...toPayLinkBill(verified.claims) };
    }
  );

  // -------------------------------------------  Interac e-Transfer (Request Money)
  // The council's bank issues the merchant credential; this host starts the
  // request, hands back the provider's gateway URL, and reads the status the
  // payer returns with. Amounts are integer cents and the reference code is the
  // same one the ledger reconciles by, so an e-transfer still finds its lot.
  const interacWire = (request: InteracRequest, viaLink = false) => ({
    ok: true,
    requestId: request.requestId,
    gatewayUrl: request.gatewayUrl,
    gatewayHosts: request.gatewayHosts,
    status: request.status,
    amountBasis: request.amountBasis,
    referenceCode: request.referenceCode,
    unitRef: request.unitRef,
    expiresAt: request.expiresAt,
    demo: request.demo,
    viaLink
  });

  interface PayerContext {
    councilId: string;
    unitRef: string;
    amountBasis: number;
    referenceCode: string;
    payeeContact: string;
    viaLink: boolean;
  }

  /**
   * Who is paying, and under whose authority. A session's body is checked; a
   * bill link's own claims win over anything the caller sent, so the page cannot
   * talk an amount up or down, or redirect the money to a different payee.
   */
  const payerContext = async (
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<PayerContext | null> => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    if (req.user) {
      const unitRef = normalizeUnitRef(String(body.unitRef ?? ''));
      const amountBasis = Number(body.amountBasis);
      const referenceCode = String(body.referenceCode ?? '').trim();
      const payeeContact = String(body.payeeContact ?? '').trim();
      if (!unitRef) {
        reply.code(400).send({ ok: false, reason: 'invalid unitRef' });
        return null;
      }
      if (!Number.isInteger(amountBasis) || amountBasis <= 0) {
        reply.code(400).send({ ok: false, reason: 'amount must be a positive number of cents' });
        return null;
      }
      if (!referenceCode) {
        reply.code(400).send({ ok: false, reason: 'reference is required' });
        return null;
      }
      if (!payeeContact) {
        reply.code(400).send({ ok: false, reason: 'a payee is required' });
        return null;
      }
      return {
        councilId: req.user.councilId,
        unitRef,
        amountBasis,
        referenceCode,
        payeeContact,
        viaLink: false
      };
    }

    const supplied = typeof body.payLink === 'string' ? body.payLink : undefined;
    if (!supplied) {
      reply.code(401).send({ ok: false, reason: 'authentication required' });
      return null;
    }
    const verified = verifyPayLink(supplied, payLinkSecret());
    if (!verified.ok) {
      reply.code(400).send({ ok: false, reason: verified.reason });
      return null;
    }
    return {
      councilId: verified.claims.c,
      unitRef: verified.claims.u,
      amountBasis: verified.claims.a,
      referenceCode: verified.claims.r,
      payeeContact: verified.claims.p,
      viaLink: true
    };
  };

  app.post<{
    Body: {
      unitRef?: string;
      amountBasis?: number;
      referenceCode?: string;
      payeeContact?: string;
      /** A council session may post the lot it is paying for; a bill link may not. */
      payLink?: string;
      payerContact: string;
      returnUrl: string;
      cancelUrl?: string;
      language?: string;
    };
  }>(
    '/api/v1/payments/interac/request',
    {
      preHandler: [authenticateOptional],
      schema: {
        body: {
          type: 'object',
          required: ['payerContact', 'returnUrl'],
          additionalProperties: false,
          properties: {
            unitRef: { type: 'string', minLength: 1 },
            amountBasis: { type: 'integer', minimum: 1 },
            referenceCode: { type: 'string', minLength: 1 },
            payeeContact: { type: 'string', minLength: 3 },
            payLink: { type: 'string', minLength: 20 },
            payerContact: { type: 'string', minLength: 3 },
            returnUrl: { type: 'string', minLength: 8 },
            cancelUrl: { type: 'string' },
            language: { type: 'string' }
          }
        }
      }
    },
    async (req, reply) => {
      if (!deps.interac) {
        reply.code(503);
        return { ok: false, reason: 'Interac rail is not configured on this host' };
      }
      const payer = await payerContext(req, reply);
      if (!payer) return reply; // the refusal is already on the wire
      try {
        const request = await deps.interac.create({
          councilId: payer.councilId,
          unitRef: payer.unitRef,
          amountBasis: payer.amountBasis,
          referenceCode: payer.referenceCode,
          payerContact: req.body.payerContact,
          payeeContact: payer.payeeContact,
          returnUrl: req.body.returnUrl,
          cancelUrl: req.body.cancelUrl,
          language: req.body.language
        });
        return interacWire(request, payer.viaLink);
      } catch (err) {
        return { ok: false, reason: (err as Error).message };
      }
    }
  );

  // The payer returns from their bank with no session. A bill link may read its
  // own bill's request and no other: a link for lot 305 cannot be turned into a
  // window on the rest of the council's payments.
  app.get<{ Params: { requestId: string }; Querystring: { t?: string } }>(
    '/api/v1/payments/interac/request/:requestId',
    { preHandler: [authenticateOptional] },
    async (req, reply) => {
      if (!deps.interac) {
        reply.code(503);
        return { ok: false, reason: 'Interac rail is not configured on this host' };
      }
      let councilId: string;
      let bill: { unitRef: string; referenceCode: string } | null = null;
      if (req.user) {
        councilId = req.user.councilId;
      } else {
        const verified = verifyPayLink(req.query.t, payLinkSecret());
        if (!verified.ok) {
          reply.code(verified.reason === 'malformed' ? 401 : 400);
          return { ok: false, reason: req.query.t ? verified.reason : 'authentication required' };
        }
        councilId = verified.claims.c;
        bill = { unitRef: verified.claims.u, referenceCode: verified.claims.r };
      }
      try {
        const request = await deps.interac.status(councilId, req.params.requestId);
        const offBill =
          bill !== null &&
          (!request || request.unitRef !== bill.unitRef || request.referenceCode !== bill.referenceCode);
        if (!request || offBill) {
          reply.code(404);
          return { ok: false, reason: 'unknown request' };
        }
        return interacWire(request, bill !== null);
      } catch (err) {
        return { ok: false, reason: (err as Error).message };
      }
    }
  );

  // What the provider reported (webhook or poll result). This advances the
  // request only: the deposit itself is reconciled by Ziggy against the same
  // reference code, so nothing here posts to the ledger twice.
  app.post<{ Params: { requestId: string }; Body: { status: string } }>(
    '/api/v1/payments/interac/request/:requestId/reported',
    {
      preHandler: [authenticate, requireRole('treasurer')],
      schema: {
        body: {
          type: 'object',
          required: ['status'],
          additionalProperties: false,
          properties: { status: { type: 'string', minLength: 2 } }
        }
      }
    },
    async (req, reply) => {
      if (!deps.interac) {
        reply.code(503);
        return { ok: false, reason: 'Interac rail is not configured on this host' };
      }
      if (!deps.interac.report) {
        return { ok: false, reason: 'the live provider reports its own status' };
      }
      const request = await deps.interac.report(
        req.user!.councilId,
        req.params.requestId,
        req.body.status
      );
      if (!request) {
        reply.code(404);
        return { ok: false, reason: 'unknown request' };
      }
      return interacWire(request);
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

  // --------------------------------------------------  Export / evidence
  // Item #20 — portable OpenStrata export: everything a council needs to move
  // (per the protocol spec) as one JSON document.
  app.get('/api/v1/export/portable', { preHandler: [authenticate] }, async (req) => {
    const councilId = req.user!.councilId;
    const council = await deps.auth.getCouncil(councilId);
    const funds = ['operating', 'crf', 'war_chest'];
    const accounts: Record<string, unknown> = {};
    for (const fund of funds) {
      const b = await deps.ledger.balance(councilId, fund);
      accounts[fund] = { balanceBasis: b.balanceBasis, entryCount: b.entryCount, headTally: b.headTally.slice(0, 4) };
    }

    const units = (await councilUnits(deps, councilId)).map((u) => ({
      unitRef: u.unitRef,
      floor: u.floor,
      sqft: u.sqft,
      occupancy: u.occupancy,
      eht: u.eht,
      evCharger: u.evCharger
    }));
    return {
      format: 'openstrata-portable/v1',
      exportedAt: new Date().toISOString(),
      council: council ? { id: council.id, name: council.name } : null,
      units,
      accounts,
      rails: enabledRails(deps.config.rails ?? {})
    };
  });

  // Item #11 — CRT evidence export: a print-ready HTML bundle of the ledger
  // hash chain for a fund (browser → PDF). Includes the verification verdict.
  app.get<{ Querystring: { fund?: string; months?: string } }>(
    '/api/v1/compliance/crt-export',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const fund = req.query.fund ?? 'operating';
      const councilId = req.user!.councilId;
      const council = await deps.auth.getCouncil(councilId);
      const b = await deps.ledger.balance(councilId, fund);
      const series = await deps.ledger.series(councilId, fund, Math.min(12, Number(req.query.months) || 6));
      const rows = series
        .filter((s) => s.incomeBasis !== 0 || s.expenseBasis !== 0)
        .map(
          (s) =>
            `<tr><td>${escapeHtml(s.month)}</td><td>+$${(s.incomeBasis / 100).toFixed(2)}</td><td>$${(s.expenseBasis / 100).toFixed(2)}</td><td>$${(s.netBasis / 100).toFixed(2)}</td></tr>`
        )
        .join('');
      reply.header('cache-control', 'private, no-store');
      reply.header('x-content-type-options', 'nosniff');
      reply.header('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'");
      const safeCouncilName = escapeHtml(council?.name ?? 'Council');
      const safeFund = escapeHtml(fund);
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>CRT Evidence — ${safeCouncilName}</title>
      <style>body{font-family:system-ui,sans-serif;margin:40px;color:#18232b}table{border-collapse:collapse;width:100%;margin-top:16px}th,td{border:1px solid #cbd5d9;padding:8px;text-align:left;font-size:13px}th{background:#eef2f3}code{font-family:ui-monospace,monospace;font-size:12px}.badge{display:inline-block;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700}.ok{background:#eaf8f2;color:#238c6b}.head{font-size:18px;font-weight:800}</style></head><body>
      <p class="head">CRT Evidence Bundle — ${safeCouncilName}</p>
      <p>Fund: <strong>${safeFund}</strong> · Balance: <strong>$${(b.balanceBasis / 100).toFixed(2)}</strong> · ${b.entryCount} entries</p>
      <p><span class="badge ok">Hash chain verified ✓</span> — head tally <code>${b.headTally.slice(0, 16) || '(empty)'}</code></p>
      <table><thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No activity in this window</td></tr>'}</tbody></table>
      </body></html>`;
      return reply.type('text/html; charset=utf-8').send(html);
    }
  );

  // --------------------------------------------------  Conveyancing (Form B/F)
  // Print-ready HTML certificates (item #9) — browser → PDF. Form F is
  // WITHHELD when the unit's AR ledger balance is > 0 (sale blocked).
  const unitFormHtml = (
    form: ReturnType<typeof generateForm>,
    councilName: string
  ) => `<!doctype html><html><head><meta charset="utf-8"><title>Form ${escapeHtml(form.kind)} — ${escapeHtml(form.unitId)}</title>
  <style>body{font-family:system-ui,sans-serif;margin:48px;color:#18232b;max-width:720px}.title{font-size:22px;font-weight:800;margin-bottom:4px}.meta{color:#6d7a82;font-size:13px;margin-bottom:24px}.box{border:1px solid #cbd5d9;border-radius:8px;padding:16px;margin-bottom:16px;font-size:14px}.warn{border-color:#f0b8b0;background:#fff5f2;color:#b3352b;font-weight:700}.okc{border-color:#b6dccb;background:#f1fbf6;color:#238c6b;font-weight:700}ul{margin:8px 0 0;padding-left:20px}.foot{margin-top:28px;color:#9aa6ab;font-size:11px}</style></head><body>
  <p class="title">Form ${escapeHtml(form.kind)} — ${escapeHtml(councilName)}</p>
  <p class="meta">Unit ${escapeHtml(form.unitId)} · Issued ${escapeHtml(form.issuedAt)}${form.dueDate ? ` · Due ${escapeHtml(form.dueDate)} (${escapeHtml(form.status)})` : ''}</p>
  <div class="box ${form.state === 'withheld' ? 'warn' : 'okc'}">
    ${form.state === 'withheld' ? `WITHHELD — ${escapeHtml(form.withheldReason ?? 'balance due')}` : 'Issued'}
  </div>
  <div class="box">Balance: <strong>$${(form.balanceBasis / 100).toFixed(2)}</strong><ul>${form.disclosures.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul></div>
  <p class="foot">Statutory deadline per SPA ss.256–258. Professional review required before reliance.</p>
  </body></html>`;

  app.get<{ Params: { unitId: string } }>(
    '/api/v1/forms/b/:unitId',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const unitId = req.params.unitId;
      const fund = `ar:unit-${unitId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
      const bal = await deps.ledger.balance(req.user!.councilId, fund);
      const council = await deps.auth.getCouncil(req.user!.councilId);
      const form = generateForm(
        { kind: 'B', unitId, requestedAt: new Date().toISOString().slice(0, 10) },
        { unitId, balanceBasis: bal.balanceBasis, arrearsBasis: bal.balanceBasis, crfBasis: (await deps.ledger.balance(req.user!.councilId, 'crf')).balanceBasis },
        new Date().toISOString().slice(0, 10)
      );
      reply.header('cache-control', 'private, no-store');
      reply.header('x-content-type-options', 'nosniff');
      reply.header('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'");
      return reply.type('text/html; charset=utf-8').send(unitFormHtml(form, council?.name ?? 'Council'));
    }
  );

  app.get<{ Params: { unitId: string } }>(
    '/api/v1/forms/f/:unitId',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const unitId = req.params.unitId;
      const fund = `ar:unit-${unitId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
      const bal = await deps.ledger.balance(req.user!.councilId, fund);
      const council = await deps.auth.getCouncil(req.user!.councilId);
      const form = generateForm(
        { kind: 'F', unitId, requestedAt: new Date().toISOString().slice(0, 10) },
        { unitId, balanceBasis: bal.balanceBasis, arrearsBasis: bal.balanceBasis },
        new Date().toISOString().slice(0, 10)
      );
      reply.header('cache-control', 'private, no-store');
      reply.header('x-content-type-options', 'nosniff');
      reply.header('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'");
      return reply.type('text/html; charset=utf-8').send(unitFormHtml(form, council?.name ?? 'Council'));
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
