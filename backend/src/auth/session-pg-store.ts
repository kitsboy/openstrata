/**
 * Postgres implementation of SessionStore (migration 0009, `auth_session`).
 *
 * Every method is a single statement, so a revoked session is visible to the
 * next request on any instance — the whole point of moving this out of process
 * memory. `last_seen_at` is written with a conditional UPDATE so a busy token
 * does not rewrite the row on every call.
 */

import pg from 'pg';
import '../db/int8.js';
import type {
  CreateSessionInput,
  SessionRecord,
  SessionRevokeReason,
  SessionStore
} from './session.js';
import { newSessionId } from './session.js';

interface SessionRow {
  id: string;
  user_id: string;
  community_id: string;
  role: string;
  refresh_hash: string;
  previous_hash: string | null;
  created_at: Date | string;
  last_seen_at: Date | string;
  expires_at: Date | string;
  revoked_at: Date | string | null;
  revoked_reason: string | null;
  ip: string | null;
  user_agent: string | null;
}

const COLUMNS = `id, user_id, community_id, role, refresh_hash, previous_hash,
                 created_at, last_seen_at, expires_at, revoked_at, revoked_reason,
                 ip, user_agent`;

const iso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

export class PostgresSessionStore implements SessionStore {
  private readonly pool: pg.Pool;

  constructor(url: string) {
    this.pool = new pg.Pool({ connectionString: url });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private toSession(row: SessionRow): SessionRecord {
    return {
      id: row.id,
      userId: row.user_id,
      councilId: row.community_id,
      role: row.role as SessionRecord['role'],
      refreshHash: row.refresh_hash,
      previousHash: row.previous_hash,
      createdAt: iso(row.created_at),
      lastSeenAt: iso(row.last_seen_at),
      expiresAt: iso(row.expires_at),
      revokedAt: row.revoked_at ? iso(row.revoked_at) : null,
      revokedReason: (row.revoked_reason as SessionRevokeReason | null) ?? null,
      ip: row.ip,
      userAgent: row.user_agent
    };
  }

  async create(input: CreateSessionInput): Promise<SessionRecord> {
    const res = await this.pool.query<SessionRow>(
      `INSERT INTO auth_session (id, user_id, community_id, role, refresh_hash, expires_at, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, now() + ($6::bigint * interval '1 second'), $7, $8)
       RETURNING ${COLUMNS}`,
      [
        newSessionId(),
        input.userId,
        input.councilId,
        input.role,
        input.refreshHash,
        input.ttlSeconds,
        input.ip ?? null,
        input.userAgent ?? null
      ]
    );
    return this.toSession(res.rows[0]!);
  }

  async get(id: string): Promise<SessionRecord | null> {
    const res = await this.pool.query<SessionRow>(
      `SELECT ${COLUMNS} FROM auth_session WHERE id = $1`,
      [id]
    );
    return res.rows[0] ? this.toSession(res.rows[0]) : null;
  }

  async findByRefreshHash(hash: string): Promise<SessionRecord | null> {
    const res = await this.pool.query<SessionRow>(
      `SELECT ${COLUMNS} FROM auth_session
        WHERE refresh_hash = $1 OR previous_hash = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [hash]
    );
    return res.rows[0] ? this.toSession(res.rows[0]) : null;
  }

  async touch(id: string, at: Date): Promise<void> {
    // Only move the timestamp forward, and skip the write when it is already
    // recent: a token used on every request must not serialize on this row.
    await this.pool.query(
      `UPDATE auth_session
          SET last_seen_at = $2
        WHERE id = $1 AND last_seen_at < $2::timestamptz - interval '60 seconds'`,
      [id, at.toISOString()]
    );
  }

  async rotate(id: string, nextHash: string, at: Date): Promise<void> {
    await this.pool.query(
      `UPDATE auth_session
          SET previous_hash = refresh_hash, refresh_hash = $2, last_seen_at = $3
        WHERE id = $1`,
      [id, nextHash, at.toISOString()]
    );
  }

  async revoke(id: string, reason: SessionRevokeReason, at: Date): Promise<boolean> {
    const res = await this.pool.query(
      `UPDATE auth_session
          SET revoked_at = $2, revoked_reason = $3
        WHERE id = $1 AND revoked_at IS NULL`,
      [id, at.toISOString(), reason]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async revokeAllForUser(
    userId: string,
    reason: SessionRevokeReason,
    at: Date,
    exceptId?: string
  ): Promise<number> {
    const res = await this.pool.query(
      `UPDATE auth_session
          SET revoked_at = $3, revoked_reason = $4
        WHERE user_id = $1 AND revoked_at IS NULL
          AND ($2::text IS NULL OR id <> $2)`,
      [userId, exceptId ?? null, at.toISOString(), reason]
    );
    return res.rowCount ?? 0;
  }

  async listForUser(userId: string): Promise<SessionRecord[]> {
    const res = await this.pool.query<SessionRow>(
      `SELECT ${COLUMNS} FROM auth_session WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows.map((row) => this.toSession(row));
  }
}
