/**
 * Postgres implementation of AuditLog (migration 0009, `audit_event`).
 *
 * Insert-only by construction: there is no UPDATE or DELETE statement in this
 * file, and the table carries a trigger that refuses both anyway. A failure to
 * write is surfaced to the caller rather than swallowed here, so the server's
 * hook can log it loudly.
 */

import pg from 'pg';
import '../db/int8.js';
import type { AuditEvent, AuditLog, AuditQuery, NewAuditEvent } from './store.js';
import type { UserRole } from '../auth/model.js';

interface AuditRow {
  seq: number;
  at: Date | string;
  community_id: string | null;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  outcome: string;
  target: string | null;
  http_status: number;
  ip: string | null;
  user_agent: string | null;
}

const iso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

export class PostgresAuditLog implements AuditLog {
  private readonly pool: pg.Pool;

  constructor(url: string) {
    this.pool = new pg.Pool({ connectionString: url });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private toEvent(row: AuditRow): AuditEvent {
    return {
      seq: row.seq,
      at: iso(row.at),
      councilId: row.community_id,
      actorId: row.actor_id,
      actorRole: (row.actor_role as UserRole | null) ?? null,
      action: row.action,
      outcome: row.outcome as AuditEvent['outcome'],
      target: row.target,
      httpStatus: row.http_status,
      ip: row.ip,
      userAgent: row.user_agent
    };
  }

  async record(event: NewAuditEvent): Promise<void> {
    await this.pool.query(
      `INSERT INTO audit_event
         (at, community_id, actor_id, actor_role, action, outcome, target, http_status, ip, user_agent)
       VALUES (COALESCE($1::timestamptz, now()), $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        event.at ? event.at.toISOString() : null,
        event.councilId,
        event.actorId,
        event.actorRole,
        event.action,
        event.outcome,
        event.target,
        event.httpStatus,
        event.ip,
        event.userAgent
      ]
    );
  }

  async list(councilId: string, query: AuditQuery): Promise<AuditEvent[]> {
    const res = await this.pool.query<AuditRow>(
      `SELECT seq, at, community_id, actor_id, actor_role, action, outcome, target,
              http_status, ip, user_agent
         FROM audit_event
        WHERE community_id = $1
          AND ($2::text IS NULL OR action = $2)
          AND ($3::bigint IS NULL OR seq < $3)
        ORDER BY seq DESC
        LIMIT $4`,
      [councilId, query.action ?? null, query.before ?? null, Math.max(0, query.limit)]
    );
    return res.rows.map((row) => this.toEvent(row));
  }
}
