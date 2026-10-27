/**
 * AuditLog — who did what, in order, forever.
 *
 * The API is deliberately tiny and append-only: there is no update and no
 * delete, because those are the two operations that would make the log
 * worthless as evidence. `audit/policy.ts` decides *what* is worth a row;
 * this module only decides where it is kept.
 *
 * `MemAuditLog` mirrors the Postgres adapter (migration 0009) for unit and
 * route tests, including its validation, so an action id that the database
 * would refuse is refused here too instead of only in production.
 */

import type { UserRole } from '../auth/model.js';

export type AuditOutcome = 'success' | 'denied' | 'error';

export const AUDIT_ACTIONS_RE = /^[a-z0-9:._-]{3,120}$/;

export interface AuditEvent {
  seq: number;
  at: string;
  /** Tenant the action belongs to. Null for council-scoped-by-absence events. */
  councilId: string | null;
  /** Null when the actor could not be identified (a failed login, say). */
  actorId: string | null;
  actorRole: UserRole | null;
  action: string;
  outcome: AuditOutcome;
  /** Whitelisted target identifiers, e.g. `unitRef=305 fund=operating`. */
  target: string | null;
  httpStatus: number;
  ip: string | null;
  userAgent: string | null;
}

export type NewAuditEvent = Omit<AuditEvent, 'seq' | 'at'> & { at?: Date };

export interface AuditQuery {
  /** Hard cap applied by the caller; adapters return at most this many. */
  limit: number;
  /** Cursor: return rows with a smaller `seq` (newest-first paging). */
  before?: number;
  action?: string;
}

export interface AuditLog {
  record(event: NewAuditEvent): Promise<void>;
  /** Tenant-scoped read, newest first. */
  list(councilId: string, query: AuditQuery): Promise<AuditEvent[]>;
}

export class MemAuditLog implements AuditLog {
  private events: AuditEvent[] = [];
  private nextSeq = 1;

  async record(event: NewAuditEvent): Promise<void> {
    if (!AUDIT_ACTIONS_RE.test(event.action)) {
      throw new Error(`invalid audit action: ${event.action}`);
    }
    this.events.push({
      ...event,
      seq: this.nextSeq++,
      at: (event.at ?? new Date()).toISOString()
    });
  }

  async list(councilId: string, query: AuditQuery): Promise<AuditEvent[]> {
    return this.events
      .filter((event) => event.councilId === councilId)
      .filter((event) => (query.action ? event.action === query.action : true))
      .filter((event) => (query.before === undefined ? true : event.seq < query.before))
      .sort((a, b) => b.seq - a.seq)
      .slice(0, Math.max(0, query.limit));
  }
}
