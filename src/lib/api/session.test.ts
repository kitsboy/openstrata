import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  REFRESH_TOKEN_KEY,
  TOKEN_KEY,
  getRefreshToken,
  getToken,
  setRefreshToken,
  setToken
} from './token';
import { apiFetch } from './client';
import {
  auth,
  endOtherSessions,
  fetchSessions,
  refreshSession,
  signIn,
  signOut,
  startSessionKeepAlive,
  tokenExpiryMs,
  type AuthSession
} from './auth';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

/** A well-formed (unsigned) JWT whose payload carries `exp`, as the backend issues. */
function jwt(expSeconds: number): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: expSeconds, sub: 'u1' })}.sig`;
}

const USER = { id: 'u1', email: 'cam@example.com', displayName: 'Admin', role: 'admin' as const };
const COUNCIL = { id: 'c1', name: 'Harbour House' };

function session(overrides: Partial<AuthSession> = {}): AuthSession {
  return { status: 'signed-out', apiMode: 'configured', user: null, council: null, ...overrides };
}

describe('token expiry', () => {
  it('reads exp from the payload, in milliseconds', () => {
    expect(tokenExpiryMs(jwt(1_800_000_000))).toBe(1_800_000_000_000);
  });

  it('returns null for anything that is not a readable token', () => {
    expect(tokenExpiryMs(null)).toBeNull();
    expect(tokenExpiryMs('not-a-jwt')).toBeNull();
    expect(tokenExpiryMs('a.!!!.c')).toBeNull();
    // A token without exp cannot be scheduled against.
    const noExp = `${Buffer.from('{}').toString('base64url')}.${Buffer.from('{"sub":"u1"}').toString('base64url')}.x`;
    expect(tokenExpiryMs(noExp)).toBeNull();
  });
});

describe('refresh tokens', () => {
  beforeEach(() => {
    localStorage.clear();
    delete import.meta.env.PUBLIC_API_BASE_URL;
    vi.unstubAllGlobals();
    vi.useRealTimers();
    auth.set(session());
  });

  it('are stored at sign-in beside the access token', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        json({
          ok: true,
          token: jwt(1_800_000_000),
          refreshToken: 'refresh-one',
          user: USER,
          council: COUNCIL
        })
      )
    );
    await signIn('cam@example.com', 'correct');
    expect(getToken()).toBeTruthy();
    expect(getRefreshToken()).toBe('refresh-one');
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-one');
  });

  it('rotate: the new refresh token replaces the one just spent', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    setToken('old-access');
    setRefreshToken('refresh-one');
    let seenBody = '';
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        seenBody = String(init.body);
        return json({
          ok: true,
          token: 'access-two',
          refreshToken: 'refresh-two',
          user: USER,
          council: COUNCIL
        });
      })
    );

    await expect(refreshSession()).resolves.toBe('access-two');
    expect(seenBody).toBe(JSON.stringify({ refreshToken: 'refresh-one' }));
    expect(getToken()).toBe('access-two');
    // Keeping the spent token would make the next refresh look like a replay,
    // and the backend ends the session on replay by design.
    expect(getRefreshToken()).toBe('refresh-two');
  });

  it('are exchanged once when several calls fail at the same moment', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    setToken('old-access');
    setRefreshToken('refresh-one');
    const fetchMock = vi.fn(async () =>
      json({ ok: true, token: 'access-two', refreshToken: 'refresh-two', user: USER })
    );
    vi.stubGlobal('fetch', fetchMock);

    // Eight widgets waking up after a laptop sleeps all reach 401 together.
    await Promise.all(Array.from({ length: 8 }, () => refreshSession()));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retry an authenticated call that answered 401', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    setToken('old-access');
    setRefreshToken('refresh-one');
    const seen: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        if (url.endsWith('/api/v1/auth/refresh')) {
          return json({ ok: true, token: 'access-two', refreshToken: 'refresh-two', user: USER });
        }
        const authorization = (init.headers as Record<string, string>).authorization;
        seen.push(authorization);
        if (authorization === 'Bearer old-access') return json({ ok: false }, 401);
        return json({ ok: true, value: 42 });
      })
    );

    const result = await apiFetch<{ value: number }>('/api/v1/units', { token: 'old-access' });
    expect(result.value).toBe(42);
    // Once with the expired credential, once with the renewed one — never a loop.
    expect(seen).toEqual(['Bearer old-access', 'Bearer access-two']);
  });

  it('clear both credentials when the backend refuses the refresh', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    setToken('old-access');
    setRefreshToken('refresh-dead');
    auth.set(session({ status: 'signed-in', user: USER, council: COUNCIL }));
    vi.stubGlobal('fetch', vi.fn(async () => json({ ok: false, reason: 'session ended' }, 401)));

    await expect(refreshSession()).resolves.toBeNull();
    expect(getToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    let current!: AuthSession;
    auth.subscribe((s) => (current = s))();
    expect(current.status).toBe('signed-out');
  });

  it('keep the credentials when the host is merely unreachable', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    setToken('old-access');
    setRefreshToken('refresh-one');
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));

    await expect(refreshSession()).resolves.toBeNull();
    // Offline is not a revocation: signing someone out for a dropped connection
    // loses work they cannot recover without their password.
    expect(getToken()).toBe('old-access');
    expect(getRefreshToken()).toBe('refresh-one');
  });

  it('renew before the access token expires', async () => {
    vi.useFakeTimers();
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    setToken(jwt(Math.floor(Date.now() / 1000) + 30));
    setRefreshToken('refresh-one');
    const fetchMock = vi.fn(async () =>
      json({ ok: true, token: 'access-two', refreshToken: 'refresh-two', user: USER })
    );
    vi.stubGlobal('fetch', fetchMock);

    const stop = startSessionKeepAlive();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getToken()).toBe('access-two');
    stop();
    vi.useRealTimers();
  });

  it('are discarded on sign-out', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    setToken('old-access');
    setRefreshToken('refresh-one');
    vi.stubGlobal('fetch', vi.fn(async () => json({ ok: true, revoked: true })));
    await signOut();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
  });
});

describe('session list', () => {
  beforeEach(() => {
    localStorage.clear();
    delete import.meta.env.PUBLIC_API_BASE_URL;
    vi.unstubAllGlobals();
    setToken('access');
  });

  it('reads the caller’s own sessions with the current one marked', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        json({
          ok: true,
          sessions: [
            {
              id: 's-1',
              role: 'admin',
              createdAt: '2026-10-30T09:00:00.000Z',
              lastSeenAt: '2026-10-30T09:30:00.000Z',
              expiresAt: '2026-11-29T09:00:00.000Z',
              revokedAt: null,
              revokedReason: null,
              current: true,
              active: true,
              ip: '203.0.113.4',
              userAgent: 'Mozilla/5.0'
            }
          ]
        })
      )
    );
    const sessions = await fetchSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].current).toBe(true);
    expect(sessions[0].role).toBe('admin');
  });

  it('signs out everywhere else with a DELETE and reports the count', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    let seen: { url: string; init: RequestInit } | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        seen = { url, init };
        return json({ ok: true, revoked: 2 });
      })
    );
    await expect(endOtherSessions()).resolves.toBe(2);
    expect(seen?.url).toBe('http://hermes:8787/api/v1/auth/sessions');
    expect(seen?.init.method).toBe('DELETE');
  });
});
