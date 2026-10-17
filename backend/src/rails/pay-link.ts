/**
 * Signed per-bill payment links — a bill a council can send to an owner who has
 * no account.
 *
 * The problem this solves is the one that made the Interac rail rehearse: every
 * `/api/v1` route is council-scoped from a bearer token, and an owner paying a
 * strata fee is not signed in. Putting a council session in a URL is not an
 * option, so the link *is* the credential: an HMAC-signed statement by the
 * council that **this lot owes this amount, under this reference, to this
 * payee**, until it expires.
 *
 * Four decisions carry the safety of that:
 *
 * 1. **The amount lives in the link, not in the page.** A link for $576 cannot
 *    be edited into a link for $5,000 (the signature covers it) and cannot be
 *    used to pay $1 (the server reads the amount from the claims, not from the
 *    request body). That is why this file carries money at all.
 * 2. **Domain separation from session tokens.** The key is derived from the
 *    server secret with a fixed label, and the format is `ospl1.<payload>.<sig>`
 *    rather than a JWT, so a link can never be replayed as `Authorization:
 *    Bearer …`. Both halves of that are tested.
 * 3. **Expiry is short and explicit.** A bill link is not a standing
 *    authorisation: `PAY_LINK_TTL_DAYS` (30 by default, capped at 120).
 * 4. **A link reveals only the bill.** Nothing about the council's ledger, other
 *    lots, balances or owners travels in it — the payer sees what is printed on
 *    a paper bill and nothing more.
 *
 * The link is not a payment and posts nothing: it is the same reference code the
 * ledger reconciles by, so a deposit still has to arrive and still has to be
 * reconciled.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { isPayerContact, normalizeContact } from './interac.js';

/** Format marker: OpenStrata pay link, version 1. Never a JWT. */
export const PAY_LINK_PREFIX = 'ospl1';

/** The query parameter the link travels in (`/pay?unit=305&t=…`). */
export const PAY_LINK_PARAM = 't';

/** Longest a link may live, whatever a host configures. */
export const PAY_LINK_MAX_TTL_DAYS = 120;
export const PAY_LINK_DEFAULT_TTL_DAYS = 30;

/** The claims a link carries. Short keys: this string travels in a URL. */
export interface PayLinkClaims {
  /** Shape version. A change in meaning must invalidate old links. */
  v: 1;
  /** Council (tenant). */
  c: string;
  /** Lot. */
  u: string;
  /** Amount in integer cents — the link's own authority. */
  a: number;
  /** The shared reference code the deposit reconciles by. */
  r: string;
  /** Where the council receives e-transfers. */
  p: string;
  /** Council display name, so a bill never borrows another building's name. */
  n: string;
  /** Issued at / expires at, seconds since epoch. */
  iat: number;
  exp: number;
}

export type PayLinkVerification =
  | { ok: true; claims: PayLinkClaims }
  | { ok: false; reason: PayLinkReason };

export type PayLinkReason =
  | 'malformed'
  | 'bad signature'
  | 'expired'
  | 'not yet valid'
  | 'unknown version'
  | 'incomplete claims'
  | 'amount must be a positive number of cents'
  | 'the council needs a receiving email for this rail';

export interface PayLinkInput {
  councilId: string;
  councilName: string;
  unitRef: string;
  /** Integer cents. */
  amountBasis: number;
  referenceCode: string;
  payeeContact: string;
  ttlDays?: number;
  now?: Date;
}

/**
 * The signing key: the server secret put through HMAC with a fixed label, so the
 * same `AUTH_SECRET` can never be crossed between a session JWT and a bill link.
 * `PAY_LINK_SECRET` overrides it when a host wants a separate secret.
 */
export function payLinkKey(secret: string): Buffer {
  return createHmac('sha256', secret).update('openstrata/pay-link/v1', 'utf8').digest();
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url');
}

function sign(input: string, secret: string): string {
  return b64url(createHmac('sha256', payLinkKey(secret)).update(input, 'utf8').digest());
}

/** Days → seconds, clamped: a link may live 1–120 days, never forever. */
export function payLinkTtlSeconds(days: number | undefined): number {
  const wanted = Number.isFinite(days) ? Math.floor(days as number) : PAY_LINK_DEFAULT_TTL_DAYS;
  const clamped = Math.min(Math.max(wanted, 1), PAY_LINK_MAX_TTL_DAYS);
  return clamped * 24 * 60 * 60;
}

/**
 * Sign a bill into a link token. Refuses to sign a bill that could not be paid:
 * a zero or negative amount, a missing unit or reference, or a payee that is
 * neither an email address nor a mobile number.
 */
export function signPayLink(input: PayLinkInput, secret: string): string {
  const claims = buildClaims(input);
  const payload = b64url(JSON.stringify(claims));
  return `${PAY_LINK_PREFIX}.${payload}.${sign(payload, secret)}`;
}

function buildClaims(input: PayLinkInput): PayLinkClaims {
  if (!Number.isInteger(input.amountBasis) || input.amountBasis <= 0) {
    throw new Error('amount must be a positive number of cents');
  }
  if (!input.unitRef.trim()) throw new Error('unit is required');
  if (!input.referenceCode.trim()) throw new Error('reference is required');
  if (!input.councilId.trim()) throw new Error('council is required');
  if (!isPayerContact(input.payeeContact)) {
    throw new Error('the council needs a receiving email for this rail');
  }
  const now = Math.floor((input.now?.getTime() ?? Date.now()) / 1000);
  return {
    v: 1,
    c: input.councilId.trim(),
    u: input.unitRef.trim(),
    a: input.amountBasis,
    r: input.referenceCode.trim(),
    p: normalizeContact(input.payeeContact),
    n: input.councilName.trim(),
    iat: now,
    exp: now + payLinkTtlSeconds(input.ttlDays)
  };
}

/**
 * Verify a link. Every failure carries a reason fit to show a payer, and an
 * unreadable token never degrades into a weaker check — there is no path here
 * that returns `ok` without a valid signature over a complete, unexpired claim.
 */
export function verifyPayLink(
  token: string | undefined | null,
  secret: string,
  now: Date = new Date()
): PayLinkVerification {
  if (typeof token !== 'string') return { ok: false, reason: 'malformed' };
  const trimmed = token.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'malformed' };
  const [prefix, payload, supplied] = parts as [string, string, string];
  if (prefix !== PAY_LINK_PREFIX) return { ok: false, reason: 'malformed' };
  if (!payload || !supplied) return { ok: false, reason: 'malformed' };

  const expected = Buffer.from(sign(payload, secret), 'base64url');
  let actual: Buffer;
  try {
    actual = Buffer.from(supplied, 'base64url');
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, reason: 'bad signature' };
  }

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  if (raw.v !== 1) return { ok: false, reason: 'unknown version' };
  const strings = ['c', 'u', 'r', 'p', 'n'] as const;
  for (const key of strings) {
    if (typeof raw[key] !== 'string' || !(raw[key] as string).trim()) {
      return { ok: false, reason: 'incomplete claims' };
    }
  }
  if (!Number.isInteger(raw.a) || (raw.a as number) <= 0) {
    return { ok: false, reason: 'amount must be a positive number of cents' };
  }
  if (typeof raw.iat !== 'number' || typeof raw.exp !== 'number') {
    return { ok: false, reason: 'incomplete claims' };
  }
  if (!isPayerContact(raw.p as string)) {
    return { ok: false, reason: 'the council needs a receiving email for this rail' };
  }

  const seconds = Math.floor(now.getTime() / 1000);
  if (raw.exp <= seconds) return { ok: false, reason: 'expired' };
  // A clock-skewed `iat` is not a payer problem, but an `exp` before `iat` is a
  // link that was minted wrong.
  if (raw.exp <= raw.iat || raw.iat > seconds + 60 * 60) {
    return { ok: false, reason: 'not yet valid' };
  }

  return {
    ok: true,
    claims: {
      v: 1,
      c: raw.c as string,
      u: raw.u as string,
      a: raw.a as number,
      r: raw.r as string,
      p: raw.p as string,
      n: raw.n as string,
      iat: raw.iat,
      exp: raw.exp
    }
  };
}

/**
 * The link a treasurer sends: the sheet's own address plus the token. Built here
 * so the route and the UI compose it the same way, and so there is exactly one
 * place that knows the query contract.
 */
export function payLinkPath(unitRef: string, token: string, rail = 'etransfer'): string {
  const params = new URLSearchParams({ unit: unitRef, rail, [PAY_LINK_PARAM]: token });
  return `/pay?${params.toString()}`;
}

/** What the verifying route hands back to a payer's page — the bill and nothing else. */
export interface PayLinkBill {
  unitRef: string;
  amountBasis: number;
  referenceCode: string;
  payeeContact: string;
  councilName: string;
  expiresAt: string;
}

export function toPayLinkBill(claims: PayLinkClaims): PayLinkBill {
  return {
    unitRef: claims.u,
    amountBasis: claims.a,
    referenceCode: claims.r,
    payeeContact: claims.p,
    councilName: claims.n,
    expiresAt: new Date(claims.exp * 1000).toISOString()
  };
}
