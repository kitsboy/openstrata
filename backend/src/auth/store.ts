/**
 * AuthStore — councils + users. The only file that knows the adapter surface;
 * the server talks to this interface. `MemAuthStore` backs the unit tests and
 * `PostgresAuthStore` is the production adapter (migration 0004).
 */

import type { Council, UserRecord, UserRole } from './model.js';

export interface CreateUserInput {
  councilId: string;
  email: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
}

export interface AuthStore {
  createCouncil(name: string): Promise<Council>;
  getCouncil(id: string): Promise<Council | null>;
  /** Throws `DuplicateEmailError` when the email is already registered. */
  createUser(input: CreateUserInput): Promise<UserRecord>;
  getUserByEmail(email: string): Promise<UserRecord | null>;
  getUserById(id: string): Promise<UserRecord | null>;
  listUsers(councilId: string): Promise<UserRecord[]>;
}

/** Raised by createUser on a duplicate (global-unique) email. */
export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`email already registered: ${email}`);
    this.name = 'DuplicateEmailError';
  }
}
