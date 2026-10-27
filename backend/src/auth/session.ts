/**
 * Council sessions — the server-side half of a login.
 *
 * Access tokens stay stateless JWTs, but a token now carries a `sid` naming a
 * row in `auth_session`, and every authenticated request resolves that row.
 * That single lookup is what turns a bearer token into a credential the council
 * can actually end:
 *
 *   - logout revokes the session immediately (not "when the JWT expires")
 *   - a role change revokes it, and the stored `role` refuses any token minted
 *     under the old role even if the revocation write lost a race
 *   - a refresh token presented twice (the signature of a stolen copy) revokes
 *     the session instead of issuing a third token
 *   - a council admin can list the active sessions and sign the others out
 *
 * Refresh tokens are opaque random values, stored only as a SHA-256 hash, and
 * rotated on every use. Rotation is what makes detection possible: the previous
 * hash is kept precisely so a replay can be told apart from a retry.
 *
 * `MemSessionStore` mirrors the Postgres adapter for unit and route tests.
 */

import { createHash, randomBytes } from 'node:crypto';
import type { UserRole } from './model.js';

/** Why a session ended. Recorded so the audit trail can explain it. */
export type SessionRevokeReason =
  | 'logout'
  | 'logout_all'
  | 'admin_revoked'
  | 'role_change'
  | 'refresh_reuse';

export interface SessionRecord {
  id: string;
  userId: string;
  councilId: string;
  /** Role at login; a mismatching token role is refused (fail closed). */
  role: UserRole;
  refreshHash: string;
  previousHash: string | null;
  createdAt: string;
  lastSeenAt: string;
  /** Refresh-token lifetime. The access token has its own, shorter TTL. */
  expiresAt: string;
  revokedAt: string | null;
  revokedReason: SessionRevokeReason | null;
  ip: string | null;
  userAgent: string | null;
}

export interface CreateSessionInput {
  userId: string;
  councilId: string;
  role: UserRole;
  refreshHash: string;
  /** Refresh lifetime in seconds. */
  ttlSeconds: number;
  ip?: string | null;
  userAgent?: string | null;
}

export interface SessionStore {
  create(input: CreateSessionInput): Promise<SessionRecord>;
  get(id: string): Promise<SessionRecord | null>;
  /**
   * Look up by the SHA-256 of a refresh token (never by the token itself).
   * Matches the current *or* the previously rotated hash, so a replayed token
   * is recognised as reuse rather than reported as simply unknown.
   */
  findByRefreshHash(hash: string): Promise<SessionRecord | null>;
  /** Record activity. Best-effort: a failure must never fail a request. */
  touch(id: string, at: Date): Promise<void>;
  /** Rotate the refresh secret: `nextHash` becomes current, the old is kept. */
  rotate(id: string, nextHash: string, at: Date): Promise<void>;
  /** Revoke one session. False when it was already revoked (or unknown). */
  revoke(id: string, reason: SessionRevokeReason, at: Date): Promise<boolean>;
  /** Revoke every session of a user; returns how many were newly revoked. */
  revokeAllForUser(
    userId: string,
    reason: SessionRevokeReason,
    at: Date,
    exceptId?: string
  ): Promise<number>;
  /** Newest first, including revoked rows (an operator wants the history). */
  listForUser(userId: string): Promise<SessionRecord[]>;
}

/** Random refresh token — 256 bits of entropy, URL-safe, never logged. */
export function newRefreshToken(): string {
  return randomBytes(32).toString('base64url');
}

export function newSessionId(): string {
  return `s-${randomBytes(9).toString('base64url')}`;
}

/**
 * Hash a refresh token for storage. Domain-separated so the digest can never
 * collide with another hash of the same bytes elsewhere in the product.
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(`openstrata:refresh:${token}`).digest('hex');
}

/** A session is usable only while unrevoked and unexpired. */
export function isSessionActive(session: SessionRecord, now: Date = new Date()): boolean {
  if (session.revokedAt) return false;
  const expiresAt = Date.parse(session.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > now.getTime();
}

/** Wire shape for the active-sessions view — never hashes, never raw tokens. */
export function toSessionWire(session: SessionRecord, currentSessionId?: string) {
  return {
    id: session.id,
    role: session.role,
    createdAt: session.createdAt,
    lastSeenAt: session.lastSeenAt,
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt,
    revokedReason: session.revokedReason,
    current: session.id === currentSessionId,
    ip: session.ip,
    userAgent: session.userAgent
  };
}

export class MemSessionStore implements SessionStore {
  private sessions = new Map<string, SessionRecord>();

  async create(input: CreateSessionInput): Promise<SessionRecord> {
    const now = new Date();
    const session: SessionRecord = {
      id: newSessionId(),
      userId: input.userId,
      councilId: input.councilId,
      role: input.role,
      refreshHash: input.refreshHash,
      previousHash: null,
      createdAt: now.toISOString(),
      lastSeenAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + input.ttlSeconds * 1000).toISOString(),
      revokedAt: null,
      revokedReason: null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null
    };
    this.sessions.set(session.id, session);
    return { ...session };
  }

  async get(id: string): Promise<SessionRecord | null> {
    const session = this.sessions.get(id);
    return session ? { ...session } : null;
  }

  async findByRefreshHash(hash: string): Promise<SessionRecord | null> {
    for (const session of this.sessions.values()) {
      if (session.refreshHash === hash || session.previousHash === hash) return { ...session };
    }
    return null;
  }

  async touch(id: string, at: Date): Promise<void> {
    const session = this.sessions.get(id);
    if (session) session.lastSeenAt = at.toISOString();
  }

  async rotate(id: string, nextHash: string, at: Date): Promise<void> {
    const session = this.sessions.get(id);
    if (!session) return;
    session.previousHash = session.refreshHash;
    session.refreshHash = nextHash;
    session.lastSeenAt = at.toISOString();
  }

  async revoke(id: string, reason: SessionRevokeReason, at: Date): Promise<boolean> {
    const session = this.sessions.get(id);
    if (!session) return false;
    if (session.revokedAt) return false; // already ended: idempotent
    session.revokedAt = at.toISOString();
    session.revokedReason = reason;
    return true;
  }

  async revokeAllForUser(
    userId: string,
    reason: SessionRevokeReason,
    at: Date,
    exceptId?: string
  ): Promise<number> {
    let revoked = 0;
    for (const session of this.sessions.values()) {
      if (session.userId !== userId || session.revokedAt) continue;
      if (exceptId && session.id === exceptId) continue;
      session.revokedAt = at.toISOString();
      session.revokedReason = reason;
      revoked += 1;
    }
    return revoked;
  }

  async listForUser(userId: string): Promise<SessionRecord[]> {
    return [...this.sessions.values()]
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((session) => ({ ...session }));
  }
}
