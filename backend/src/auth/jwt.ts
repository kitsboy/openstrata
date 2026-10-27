/**
 * Minimal HS256 JWT implementation on Node's built-in `crypto` — no
 * `jsonwebtoken` dependency. Tokens are stateless bearer credentials:
 *
 *   header.payload.signature   (all base64url, HMAC-SHA256 with the server secret)
 *
 * Claims: `sub` (user id), `cid` (council id), `role`, `sid` (session id),
 * `jti` (this token's id), `iat`, `exp`.
 *
 * A token is no longer sufficient on its own: `sid` names a row in
 * `auth_session`, and the API resolves that row on every request, so a token
 * carries authority only while its session is live. `verifyJwt` requires `sid`,
 * which is deliberate — a token that cannot be revoked is not accepted rather
 * than quietly honoured.
 *
 * `verifyJwt` re-derives the signature in constant time and rejects expired
 * tokens. The signing secret must be a strong random value in production
 * (see `AUTH_SECRET` in backend/.env.example).
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { UserRole } from './model.js';

export interface JwtClaims {
  sub: string;
  cid: string;
  role: UserRole;
  /** Session this token belongs to (`auth_session.id`). */
  sid: string;
  /** Unique id for this one token. */
  jti: string;
  iat: number;
  exp: number;
}

/** What the caller supplies; `jti`/`iat`/`exp` are minted here. */
export interface JwtSubject {
  sub: string;
  cid: string;
  role: UserRole;
  sid: string;
}

const b64url = (buf: Buffer): string => buf.toString('base64url');

function signature(input: string, secret: string): string {
  return b64url(createHmac('sha256', secret).update(input, 'utf8').digest());
}

export function signJwt(claims: JwtSubject, secret: string, ttlSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...claims,
    jti: randomBytes(12).toString('base64url'),
    iat: now,
    exp: now + ttlSeconds
  };
  const header = b64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  return `${header}.${body}.${signature(`${header}.${body}`, secret)}`;
}

export function verifyJwt(token: string, secret: string): JwtClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, supplied] = parts as [string, string, string];

  const expected = Buffer.from(signature(`${header}.${body}`, secret), 'base64url');
  const actual = Buffer.from(supplied, 'base64url');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Record<string, unknown>;
    if (typeof payload.sub !== 'string' || typeof payload.cid !== 'string') return null;
    if (payload.role !== 'admin' && payload.role !== 'treasurer' && payload.role !== 'member') return null;
    if (typeof payload.sid !== 'string' || payload.sid.length === 0) return null; // unrevocable token
    if (typeof payload.jti !== 'string' || payload.jti.length === 0) return null;
    if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null; // expired
    return {
      sub: payload.sub,
      cid: payload.cid,
      role: payload.role,
      sid: payload.sid,
      jti: payload.jti,
      iat: payload.iat,
      exp: payload.exp
    };
  } catch {
    return null;
  }
}
