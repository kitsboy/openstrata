/**
 * Frontend auth session — the bridge between the static site and the backend's
 * JWT auth (see `backend/src/auth/`).
 *
 * The `auth` store mirrors the backend session: token (localStorage), the
 * public user profile, and the council (tenant). `bootstrap()` runs once on
 * layout mount: it restores a stored session via `/auth/me`, refreshing the
 * access token first when it has expired.
 *
 * **Both credentials are kept, and both are rotated.** An access token lives an
 * hour; signing out mid-meeting because a page had been open since before lunch
 * is not a security property, it is a bug. The refresh token is exchanged on a
 * timer before the access token expires, and once more if a call still gets a
 * 401 (a tab that slept through its timer). A refresh that the backend rejects
 * means the session is genuinely over — a revoked device, a role change, or a
 * stolen token replayed — so the local session is cleared rather than retried.
 */

import { writable } from 'svelte/store';
import { apiBaseUrl } from './config';
import { apiFetch, ApiError, ApiUnavailableError, setRefreshHandler } from './client';
import { getRefreshToken, getToken, setRefreshToken, setToken } from './token';

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

/** One of the caller's own sessions, as `GET /auth/sessions` returns it. */
export interface SessionWire {
  id: string;
  role: UserRole;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt: string | null;
  revokedReason: string | null;
  current: boolean;
  active: boolean;
  ip: string | null;
  userAgent: string | null;
}

interface LoginResponse {
  token: string;
  refreshToken?: string;
  refreshExpiresAt?: string;
  user: PublicUser;
  council?: CouncilInfo;
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
 * When an access token expires, in epoch milliseconds, or `null` if the token is
 * not a readable JWT. Only `exp` is read — the signature is the backend's job,
 * and nothing here trusts the claims it reads beyond scheduling a refresh.
 */
export function tokenExpiryMs(token: string | null): number | null {
  if (!token) return null;
  const payload = token.split('.')[1];
  if (!payload || typeof atob !== 'function') return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const claims = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof claims.exp === 'number' && Number.isFinite(claims.exp)
      ? claims.exp * 1000
      : null;
  } catch {
    return null;
  }
}

/** How long before expiry the keep-alive renews. Late enough to rarely run, early enough to never race. */
const KEEP_ALIVE_LEAD_MS = 60_000;
/** Never schedule a refresh sooner than this, so a clock skewed past `exp` cannot spin. */
const KEEP_ALIVE_MIN_MS = 5_000;

let keepAliveTimer: ReturnType<typeof setTimeout> | null = null;
let refreshInFlight: Promise<string | null> | null = null;

function stopKeepAlive(): void {
  if (keepAliveTimer !== null) {
    clearTimeout(keepAliveTimer);
    keepAliveTimer = null;
  }
}

/** setTimeout's ceiling is a signed 32-bit millisecond count; a longer wait is re-armed. */
const MAX_TIMEOUT_MS = 2_147_000_000;

function scheduleKeepAlive(): void {
  stopKeepAlive();
  if (typeof window === 'undefined') return;
  const expiry = tokenExpiryMs(getToken());
  if (expiry === null) return;
  const delay = Math.max(expiry - Date.now() - KEEP_ALIVE_LEAD_MS, KEEP_ALIVE_MIN_MS);
  if (delay > MAX_TIMEOUT_MS) {
    // A token valid for weeks needs no refresh yet; re-arm rather than let the
    // browser clamp the timeout to one millisecond and renew in a tight loop.
    keepAliveTimer = setTimeout(() => {
      keepAliveTimer = null;
      scheduleKeepAlive();
    }, MAX_TIMEOUT_MS);
    return;
  }
  keepAliveTimer = setTimeout(() => {
    keepAliveTimer = null;
    void refreshSession().then((token) => {
      if (token) scheduleKeepAlive();
    });
  }, delay);
}

/**
 * Start renewing the access token before it expires. Returns its own cleanup,
 * which the layout calls on destroy. Safe to call twice: the previous timer is
 * replaced rather than doubled.
 */
export function startSessionKeepAlive(): () => void {
  scheduleKeepAlive();
  return stopKeepAlive;
}

function clearLocalSession(): void {
  stopKeepAlive();
  setToken(null);
  setRefreshToken(null);
  auth.set({
    status: 'signed-out',
    apiMode: apiBaseUrl() ? 'configured' : 'demo',
    user: null,
    council: null
  });
}

function applySession(res: LoginResponse, mode: 'demo' | 'configured'): void {
  setToken(res.token);
  // Absent on an older host: a session then simply lasts as long as its access
  // token, which is the behaviour this release improves on, not a broken state.
  setRefreshToken(res.refreshToken ?? null);
  auth.set({ status: 'signed-in', apiMode: mode, user: res.user, council: res.council ?? null });
  scheduleKeepAlive();
}

async function performRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await apiFetch<LoginResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      // No token of our own: this call *is* the credential, so a 401 on it must
      // be answered here rather than by another refresh.
      token: null
    });
    if (!res?.token) {
      clearLocalSession();
      return null;
    }
    setToken(res.token);
    // Rotation is the whole point: the token just presented is now dead, and
    // storing the old one would make the next refresh look like a replay.
    setRefreshToken(res.refreshToken ?? null);
    if (res.user) {
      auth.update((state) => ({
        ...state,
        status: 'signed-in',
        apiMode: 'configured',
        user: res.user!,
        council: res.council ?? state.council
      }));
    }
    scheduleKeepAlive();
    return res.token;
  } catch (err) {
    if (err instanceof ApiUnavailableError) {
      // The host is unreachable, which says nothing about the session. Keep the
      // credentials so a reconnect picks up where it left off.
      return null;
    }
    // Any other answer (401 in particular) means the session is over: revoked,
    // role-changed, or replayed. Holding a dead credential only invites more 401s.
    clearLocalSession();
    return null;
  }
}

/**
 * Exchange the stored refresh token for a fresh access token.
 *
 * Single-flight: a dashboard with eight widgets that all get a 401 at once
 * presents one refresh token, and eight concurrent exchanges would rotate it
 * seven times and have the backend read six of them as stolen copies.
 * Resolves to the new access token, or `null` when there is no session to renew.
 */
export function refreshSession(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = performRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

// The transport retries an authenticated call once after a refresh. Registered
// here so `client.ts` stays a transport and the dependency points one way.
setRefreshHandler(refreshSession);

/**
 * One-time session restore, called from the layout on mount.
 * - No base URL configured  → demo mode.
 * - No stored token         → signed out, configured mode.
 * - Stored token            → restore via /auth/me; a 401 clears the session.
 *
 * The 401 path is covered twice on purpose: `apiFetch` refreshes and retries, and
 * if that still fails the stored refresh token is discarded here.
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
    scheduleKeepAlive();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearLocalSession();
      return;
    }
    setToken(null);
    setRefreshToken(null);
    auth.set({ status: 'signed-out', apiMode: 'configured', user: null, council: null });
  }
}

/** POST /auth/login → store both credentials + the session. Throws ApiError on bad credentials. */
export async function signIn(email: string, password: string): Promise<void> {
  const res = await apiFetch<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  applySession(res, apiBaseUrl() ? 'configured' : 'demo');
}

/** POST /auth/register → create a council + first admin, then sign in. */
export async function signUp(input: {
  councilName: string;
  email: string;
  password: string;
  displayName?: string;
}): Promise<void> {
  const res = await apiFetch<LoginResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: input
  });
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

/** The caller's own sessions, newest first, the current one marked. */
export async function fetchSessions(): Promise<SessionWire[]> {
  const res = await apiFetch<{ ok: boolean; sessions: SessionWire[] }>('/api/v1/auth/sessions', {
    token: getToken()
  });
  return res.sessions;
}

/**
 * Sign out everywhere else, keeping this device signed in. Returns how many
 * other sessions were newly ended.
 */
export async function endOtherSessions(): Promise<number> {
  const res = await apiFetch<{ ok: boolean; revoked: number }>('/api/v1/auth/sessions', {
    method: 'DELETE',
    token: getToken()
  });
  return res.revoked;
}

/**
 * Sign out: end the session on the server, then clear both credentials here.
 *
 * Clearing the stored token was all this used to do, and that is not sign-out —
 * the token stayed valid on the backend for the rest of its lifetime, which is
 * precisely the window a shared laptop or a copied token needs. The server call
 * is best-effort and never gates the local sign-out: a host that is unreachable
 * must not keep someone signed in on a device they are trying to leave.
 */
export function signOut(): Promise<void> {
  const token = getToken();
  clearLocalSession();
  if (!token) return Promise.resolve();
  return apiFetch('/api/v1/auth/logout', { method: 'POST', token })
    .then(() => undefined)
    .catch(() => {
      // Offline, already revoked, or the host is down. Nothing else can be done
      // from here, and the user is signed out locally either way.
      console.warn('[auth] session could not be ended on the server');
    });
}
