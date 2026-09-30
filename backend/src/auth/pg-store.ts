/**
 * Postgres implementation of AuthStore backed by the `council` + `app_user`
 * tables (migration 0004). Email is globally unique (case-insensitive via
 * lowercasing at write time + a unique index on the lowered value).
 */

import { randomBytes } from 'node:crypto';
import '../db/int8.js';
import pg from 'pg';
import type { Council, UserRecord, UserRole } from './model.js';
import type { AuthStore, CreateUserInput } from './store.js';
import { DuplicateEmailError } from './store.js';

interface UserRow {
  id: string;
  council_id: string;
  email: string;
  display_name: string;
  password_hash: string;
  role: string;
  created_at: string;
}

export class PostgresAuthStore implements AuthStore {
  private readonly pool: pg.Pool;

  constructor(url: string) {
    this.pool = new pg.Pool({ connectionString: url });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private toUser(row: UserRow): UserRecord {
    return {
      id: row.id,
      councilId: row.council_id,
      email: row.email,
      displayName: row.display_name,
      passwordHash: row.password_hash,
      role: row.role as UserRole,
      createdAt: row.created_at
    };
  }

  async createCouncil(name: string): Promise<Council> {
    const res = await this.pool.query<{ id: string; name: string; created_at: string }>(
      `INSERT INTO council (id, name) VALUES ($1, $2) RETURNING id, name, created_at`,
      [randomId('c'), name]
    );
    const r = res.rows[0];
    return { id: r.id, name: r.name, createdAt: r.created_at };
  }

  async getCouncil(id: string): Promise<Council | null> {
    const res = await this.pool.query<{ id: string; name: string; created_at: string }>(
      `SELECT id, name, created_at FROM council WHERE id = $1`,
      [id]
    );
    const r = res.rows[0];
    return r ? { id: r.id, name: r.name, createdAt: r.created_at } : null;
  }

  async createUser(input: CreateUserInput): Promise<UserRecord> {
    const email = input.email.toLowerCase().trim();
    try {
      const res = await this.pool.query<UserRow>(
        `INSERT INTO app_user (id, council_id, email, display_name, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, council_id, email, display_name, password_hash, role, created_at`,
        [randomId('u'), input.councilId, email, input.displayName, input.passwordHash, input.role]
      );
      return this.toUser(res.rows[0]);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === '23505') throw new DuplicateEmailError(email); // unique_violation
      throw err;
    }
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const res = await this.pool.query<UserRow>(
      `SELECT id, council_id, email, display_name, password_hash, role, created_at
         FROM app_user WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return res.rows[0] ? this.toUser(res.rows[0]) : null;
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    const res = await this.pool.query<UserRow>(
      `SELECT id, council_id, email, display_name, password_hash, role, created_at
         FROM app_user WHERE id = $1`,
      [id]
    );
    return res.rows[0] ? this.toUser(res.rows[0]) : null;
  }

  async listUsers(councilId: string): Promise<UserRecord[]> {
    const res = await this.pool.query<UserRow>(
      `SELECT id, council_id, email, display_name, password_hash, role, created_at
         FROM app_user WHERE council_id = $1 ORDER BY created_at`,
      [councilId]
    );
    return res.rows.map((r) => this.toUser(r));
  }
}

function randomId(prefix: string): string {
  // 8 random bytes -> ~12 base36 chars, collision-safe for a self-hosted tenant.
  const n = randomBytes(8).readBigUInt64BE();
  return `${prefix}-${n.toString(36).padStart(12, '0')}`;
}
