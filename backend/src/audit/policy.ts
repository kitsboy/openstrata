/**
 * The audit policy — which requests get a row, and what that row says.
 *
 * This is one pure function over (method, route template, status), so the rule
 * can be read, tested and argued about without reading sixty route handlers.
 * Four decisions, each made once:
 *
 * 1. **Default is to audit.** Anything under `/api/v1/` that changes or exposes
 *    something is recorded. Only the routes listed in `PURE_COMPUTE` (a
 *    calculator: a spend verdict, a quorum count, a rendered form) are skipped,
 *    so a *new* endpoint is audited by default and exempting one is a visible,
 *    deliberate edit — not an oversight.
 *
 * 2. **Unattributable traffic is not recorded**, with two exceptions: `login`
 *    and `register`, both rate-limited, are exactly the events a council wants
 *    (who tried, from where). Without this rule a public endpoint (a bill link
 *    a payer opens, a verify attempt, a bot) could write rows without limit,
 *    which is a disk-fill lever rather than a security control.
 *
 * 3. **Bodies are never copied into the log.** Only keys named in
 *    `TARGET_KEYS` are read, one at a time, from params and body. A password, a
 *    complaint payload or a signed PSBT can therefore never end up in a row
 *    even if a handler starts carrying one. The single exception is the account
 *    email on the three auth actions whose subject *is* the address, and that
 *    address is already visible to the admin who can read this log.
 *
 * 4. **Outcome comes from the status code**: 2xx/3xx succeeded, 4xx was refused
 *    (the interesting case — a member trying to post to the ledger), 5xx failed.
 */

import type { AuditOutcome } from './store.js';

export interface AuditPlan {
  action: string;
  target: string | null;
  outcome: AuditOutcome;
}

export interface AuditInput {
  method: string;
  /** Fastify's route template (`/api/v1/units/:unitRef`), never the raw URL. */
  routeUrl: string | undefined;
  params?: Record<string, unknown>;
  body?: unknown;
  status: number;
  /**
   * True when the request can be attributed to somebody: a live session, or an
   * actor (or at least a council) the handler declared itself — a login attempt
   * names its account before it has a session, and that row has to be visible
   * to the council it concerns.
   */
  attributed: boolean;
}

export const AUDIT_PATH_PREFIX = '/api/v1/';

/** GETs whose response leaves with the council's data (or with the log itself). */
export const SENSITIVE_READS: ReadonlySet<string> = new Set([
  '/api/v1/export/portable',
  '/api/v1/agent/context',
  '/api/v1/audit/events'
]);

/**
 * POSTs that compute an answer from the request and persist nothing. Verified
 * by reading each handler: the bylaw and meeting routes are stateless state
 * machines, and `authorize`/`dca/plan`/`forms` only return a result.
 */
export const PURE_COMPUTE: ReadonlySet<string> = new Set([
  '/api/v1/treasury/authorize',
  '/api/v1/treasury/dca/plan',
  '/api/v1/meetings/quorum',
  '/api/v1/meetings/vote',
  '/api/v1/forms',
  '/api/v1/bylaw/status'
]);

/** The only unauthenticated requests that earn a row (both rate-limited). */
export const ANONYMOUS_EVENTS: ReadonlySet<string> = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/register'
]);

const METHOD_VERBS: Record<string, string> = {
  GET: 'read',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete'
};

/** Methods that can carry a decision. Preflights and HEAD are not actions. */
const AUDITED_METHODS: ReadonlySet<string> = new Set(Object.keys(METHOD_VERBS));

/**
 * Route segments that already read as an action, so the method verb is dropped:
 * `POST /ledger/post` is `ledger.post`, not `ledger.post.create`. Cosmetic, but
 * this id is what an operator filters and reads on.
 */
const ACTION_WORDS: ReadonlySet<string> = new Set([
  'register',
  'login',
  'logout',
  'refresh',
  'post',
  'run',
  'confirm',
  'quote',
  'fine',
  'nofine',
  'notice',
  'broadcast',
  'plan',
  'stamp',
  'verify',
  'reconcile',
  'request',
  'reported'
]);

/**
 * The only request fields that may appear in a row. Everything else is ignored.
 *
 * `councilMinutesRef` is here because it is the authorization behind the bylaw
 * actions: the fine payload itself is an opaque JSON string this policy will not
 * parse, so the minutes reference is what ties a fine to the resolution that
 * permitted it.
 */
const TARGET_KEYS = [
  'unitRef',
  'unitId',
  'id',
  'planId',
  'requestId',
  'referenceCode',
  'refId',
  'rail',
  'fund',
  'kind',
  'amountBasis',
  'role',
  'sessionId',
  'councilMinutesRef'
] as const;

/** Actions whose subject is an account address (never a password). */
const EMAIL_SUBJECT_ACTIONS: ReadonlySet<string> = new Set([
  'auth.login',
  'auth.register',
  'auth.users.create'
]);

const MAX_TARGET_CHARS = 300;

/** Stable action id for a route, derived from its template. */
export function actionId(routeUrl: string, method: string): string {
  const fixed = routeUrl
    .slice(AUDIT_PATH_PREFIX.length)
    .split('/')
    .filter((segment) => segment.length > 0 && !segment.startsWith(':'));
  const verb = METHOD_VERBS[method.toUpperCase()] ?? method.toLowerCase();
  const last = fixed[fixed.length - 1];
  return (last && ACTION_WORDS.has(last) ? fixed : [...fixed, verb]).join('.');
}

export function auditOutcomeFor(status: number): AuditOutcome {
  if (status >= 500) return 'error';
  if (status >= 400) return 'denied';
  return 'success';
}

const scalar = (value: unknown): string | null => {
  if (typeof value === 'string') return value.trim().slice(0, 120) || null;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return String(value);
  return null;
};

const field = (source: unknown, key: string): string | null => {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null;
  return scalar((source as Record<string, unknown>)[key]);
};

/** Human-readable target: whitelisted identifiers from params, then from body. */
export function auditTarget(
  action: string,
  params?: Record<string, unknown>,
  body?: unknown
): string | null {
  const parts: string[] = [];
  for (const key of TARGET_KEYS) {
    const value = field(params, key) ?? field(body, key);
    if (value !== null) parts.push(`${key}=${value}`);
  }
  if (EMAIL_SUBJECT_ACTIONS.has(action)) {
    const email = field(body, 'email');
    if (email) parts.push(`email=${email.toLowerCase()}`);
  }
  if (parts.length === 0) return null;
  return parts.join(' ').slice(0, MAX_TARGET_CHARS);
}

/**
 * Decide whether a finished request earns a row. Returns null for "nothing
 * worth recording", which is most read traffic.
 */
export function planAudit(input: AuditInput): AuditPlan | null {
  const routeUrl = input.routeUrl;
  if (!routeUrl || !routeUrl.startsWith(AUDIT_PATH_PREFIX)) return null;
  const method = input.method.toUpperCase();
  if (!AUDITED_METHODS.has(method)) return null; // a CORS preflight is not an action
  const action = actionId(routeUrl, method);

  if (!input.attributed && !ANONYMOUS_EVENTS.has(routeUrl)) return null;

  if (method === 'GET') {
    if (!SENSITIVE_READS.has(routeUrl)) return null;
  } else if (PURE_COMPUTE.has(routeUrl)) {
    return null;
  }

  return {
    action,
    target: auditTarget(action, input.params, input.body),
    outcome: auditOutcomeFor(input.status)
  };
}
