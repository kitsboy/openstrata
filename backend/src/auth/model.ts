/**
 * Auth + multi-tenancy domain model.
 *
 * A `council` is the tenant: every tenant-scoped record (ledger accounts,
 * payment requests, billing runs, forms, meetings) keys off the council id.
 * A user belongs to exactly one council and carries one role:
 *
 *   - `admin`     — all writes, including bylaw fines + user management
 *   - `treasurer` — financial writes (ledger, billing, reconcile), no fines
 *   - `member`    — read-only + own-unit actions (quote/confirm, forms, voting)
 *
 * Roles are ordered so "requires treasurer" automatically admits admins.
 */

export type UserRole = 'admin' | 'treasurer' | 'member';

/** Rank used by `requireRole`: higher number = more privilege. */
export const ROLE_RANK: Record<UserRole, number> = {
  member: 1,
  treasurer: 2,
  admin: 3
};

export const USER_ROLES: readonly UserRole[] = ['admin', 'treasurer', 'member'];

export interface Council {
  id: string;
  name: string;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  councilId: string;
  email: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

/** Identity attached to the Fastify request after JWT verification. */
export interface AuthUser {
  userId: string;
  councilId: string;
  role: UserRole;
}

/** Public user shape — never includes the password hash. */
export function toPublicUser(u: UserRecord): {
  id: string;
  councilId: string;
  email: string;
  displayName: string;
  role: UserRole;
} {
  return {
    id: u.id,
    councilId: u.councilId,
    email: u.email,
    displayName: u.displayName,
    role: u.role
  };
}
