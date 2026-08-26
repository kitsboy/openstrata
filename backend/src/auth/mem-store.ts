/**
 * In-memory AuthStore for unit + API route tests. Mirrors the Postgres
 * adapter's uniqueness semantics (global-unique email) so the server behaves
 * the same in both.
 */

import type { Council, UserRecord, UserRole } from './model.js';
import type { AuthStore, CreateUserInput } from './store.js';
import { DuplicateEmailError } from './store.js';

const randomId = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export class MemAuthStore implements AuthStore {
  private councils = new Map<string, Council>();
  private usersByEmail = new Map<string, UserRecord>();
  private usersById = new Map<string, UserRecord>();

  async createCouncil(name: string): Promise<Council> {
    const council: Council = {
      id: randomId('c'),
      name,
      createdAt: new Date().toISOString()
    };
    this.councils.set(council.id, council);
    return council;
  }

  async getCouncil(id: string): Promise<Council | null> {
    return this.councils.get(id) ?? null;
  }

  async createUser(input: CreateUserInput): Promise<UserRecord> {
    const email = input.email.toLowerCase().trim();
    if (this.usersByEmail.has(email)) throw new DuplicateEmailError(email);
    const user: UserRecord = {
      id: randomId('u'),
      councilId: input.councilId,
      email,
      displayName: input.displayName,
      passwordHash: input.passwordHash,
      role: input.role,
      createdAt: new Date().toISOString()
    };
    this.usersByEmail.set(email, user);
    this.usersById.set(user.id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    return this.usersByEmail.get(email.toLowerCase().trim()) ?? null;
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    return this.usersById.get(id) ?? null;
  }

  async listUsers(councilId: string): Promise<UserRecord[]> {
    return [...this.usersById.values()].filter((u) => u.councilId === councilId);
  }
}

export type { UserRole };
