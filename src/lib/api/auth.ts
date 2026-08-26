/**
 * Frontend auth session — the bridge between the static site and the backend's
 * JWT auth (see `backend/src/auth/`).
 *
 * The `auth` store mirrors the backend session: token (localStorage), the
 * public user profile, and the council (tenant). `bootstrap()` runs once on
 * layout mount: it pings `/health` and restores a stored session via
 * `/auth/me`. Widgets read `$auth` to decide between live data and demo data.
 */

import { writable } from 'svelte/store';
import { apiBaseUrl } from './config';
import { apiFetch, ApiError, ApiUnavailableError } from './client';
import { getToken, setToken } from './token';

export type UserRole = 'admin' | 'treasurer' | 'member';

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface CouncilInfo {
  id: string;
  name: string;
}

export interface AuthSession {
  /** 'booting' until the first bootstrap() settles. */
  status: 'booting' | 'signed-out' | 'signed-in';
  /** 'demo' when no API base URL is configured — widgets keep showing sample data. */
  apiMode: 'demo' | 'configured';
  user: PublicUser | null;
  council: CouncilInfo | null;
}

function initialSession(): AuthSession {
  return {
    status: 'booting',
    apiMode: apiBaseUrl() ? 'configured' : 'demo',
    user: null,
    council: null
  };
}

export const auth = writable<AuthSession>(initialSession());

/** Probe the backend's unauthenticated /health endpoint. */
export async function ping(): Promise<boolean> {
  try {
    const res = await apiFetch<{ ok: boolean }>('/health', { token: null });
    return res.ok === true;
  } catch {
    return false;
  }
}

/**
 * One-time session restore, called from the layout on mount.
 * - No base URL configured  → demo mode.
 * - No stored token         → signed out, configured mode.
 * - Stored token            → restore via /auth/me; a 401 clears the token.
 */
export async function bootstrap(): Promise<void> {
  if (!apiBaseUrl()) {
    auth.set({ status: 'signed-out', apiMode: 'demo', user: null, council: null });
    return;
  }
  const token = getToken();
  if (!token) {
    auth.set({ status: 'signed-out', apiMode: 'configured', user: null, council: null });
    return;
  }
  try {
    const res = await apiFetch<{ ok: boolean; user: PublicUser; council: CouncilInfo }>(
      '/api/v1/auth/me',
      { token }
    );
    auth.set({ status: 'signed-in', apiMode: 'configured', user: res.user, council: res.council });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) setToken(null);
    auth.set({ status: 'signed-out', apiMode: 'configured', user: null, council: null });
  }
}

function applySession(
  res: { token: string; user: PublicUser; council: CouncilInfo },
  mode: 'demo' | 'configured'
): void {
  setToken(res.token);
  auth.set({ status: 'signed-in', apiMode: mode, user: res.user, council: res.council });
}

/** POST /auth/login → store the token + session. Throws ApiError on bad credentials. */
export async function signIn(email: string, password: string): Promise<void> {
  const res = await apiFetch<{ token: string; user: PublicUser; council: CouncilInfo }>(
    '/api/v1/auth/login',
    { method: 'POST', body: { email, password } }
  );
  applySession(res, apiBaseUrl() ? 'configured' : 'demo');
}

/** POST /auth/register → create a council + first admin, then sign in. */
export async function signUp(input: {
  councilName: string;
  email: string;
  password: string;
  displayName?: string;
}): Promise<void> {
  const res = await apiFetch<{ token: string; user: PublicUser; council: CouncilInfo }>(
    '/api/v1/auth/register',
    { method: 'POST', body: input }
  );
  applySession(res, apiBaseUrl() ? 'configured' : 'demo');
}

/** Admin: list the council's accounts (`GET /auth/users`). */
export async function listUsers(): Promise<PublicUser[]> {
  const res = await apiFetch<{ ok: boolean; users: PublicUser[] }>('/api/v1/auth/users', {
    token: getToken()
  });
  return res.users;
}

/** Admin: invite a treasurer/member; returns the one-time temporary password. */
export async function inviteUser(input: {
  email: string;
  displayName?: string;
  role: 'treasurer' | 'member';
}): Promise<{ user: PublicUser; temporaryPassword: string }> {
  return apiFetch<{ ok: boolean; user: PublicUser; temporaryPassword: string }>(
    '/api/v1/auth/users',
    { method: 'POST', body: input, token: getToken() }
  );
}

/** Clear the token + session locally (the JWT simply expires server-side). */
export function signOut(): void {
  setToken(null);
  auth.set({
    status: 'signed-out',
    apiMode: apiBaseUrl() ? 'configured' : 'demo',
    user: null,
    council: null
  });
}
