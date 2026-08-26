import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_KEY, apiBaseUrl, isApiConfigured } from './config';
import { TOKEN_KEY, getToken, setToken } from './token';
import { ApiError, ApiUnavailableError, apiFetch } from './client';
import { auth, bootstrap, signIn, signOut, signUp, type AuthSession } from './auth';
import { apiUnitsToUnitRefs, createUnit, deleteUnit, fetchUnitDetail, type ApiUnit } from './units';

// ---------------------------------------------------------------------------
// Live units → reconciliation adapter
// ---------------------------------------------------------------------------
describe('apiUnitsToUnitRefs', () => {
  it('maps backend units to UnitRef with number-style aliases', () => {
    const units: ApiUnit[] = [
      {
        unitRef: '302',
        floor: 3,
        sqft: 900,
        occupancy: 'occupied',
        tenant: null,
        rent: null,
        eht: true,
        evCharger: false,
        formK: 'signed',
        arFundCode: 'ar:unit-302',
        reconciliationRefs: ['302', 'unit 302', 'u302']
      },
      {
        unitRef: 'A-101',
        floor: 1,
        sqft: 700,
        occupancy: 'vacant',
        tenant: null,
        rent: null,
        eht: false,
        evCharger: true,
        formK: 'missing',
        arFundCode: 'ar:unit-a101',
        reconciliationRefs: ['a101']
      }
    ];
    const refs = apiUnitsToUnitRefs(units);
    expect(refs).toEqual([
      { id: '302', names: [], aliases: ['302', 'unit 302', 'u302'] },
      { id: 'A-101', names: [], aliases: ['A-101', 'unit 101', 'u101'] }
    ]);
  });
});

// ---------------------------------------------------------------------------
// Base-URL resolution (demo mode vs configured)
// ---------------------------------------------------------------------------
describe('apiBaseUrl', () => {
  beforeEach(() => {
    localStorage.removeItem(API_BASE_KEY);
    delete import.meta.env.PUBLIC_API_BASE_URL;
  });

  it('returns null (demo mode) when neither env nor override is set', () => {
    expect(apiBaseUrl()).toBeNull();
    expect(isApiConfigured()).toBe(false);
  });

  it('uses the build-time PUBLIC_API_BASE_URL', () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    expect(apiBaseUrl()).toBe('http://hermes:8787');
  });

  it('trims trailing slashes', () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'https://api.example.com///';
    expect(apiBaseUrl()).toBe('https://api.example.com');
  });

  it('lets a runtime localStorage override win over the env value', () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'https://api.example.com';
    localStorage.setItem(API_BASE_KEY, 'http://10.0.0.5:8787/');
    expect(apiBaseUrl()).toBe('http://10.0.0.5:8787');
  });
});

// ---------------------------------------------------------------------------
// Token persistence
// ---------------------------------------------------------------------------
describe('token storage', () => {
  it('round-trips a token and clears it with null', () => {
    expect(getToken()).toBeNull();
    setToken('abc.def.ghi');
    expect(getToken()).toBe('abc.def.ghi');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('abc.def.ghi');
    setToken(null);
    expect(getToken()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Fetch wrapper
// ---------------------------------------------------------------------------
describe('apiFetch', () => {
  beforeEach(() => {
    localStorage.clear();
    delete import.meta.env.PUBLIC_API_BASE_URL;
    vi.unstubAllGlobals();
  });

  function stubFetch(handler: (url: string, init: RequestInit) => unknown) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        const body = handler(url, init);
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      })
    );
  }

  it('throws ApiUnavailableError in demo mode (no base URL)', async () => {
    await expect(apiFetch('/health')).rejects.toBeInstanceOf(ApiUnavailableError);
  });

  it('attaches the bearer token and JSON content type', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    let seen: RequestInit | undefined;
    stubFetch((_url, init) => {
      seen = init;
      return { ok: true };
    });
    await apiFetch('/api/v1/auth/me', { token: 'tok-1' });
    expect(seen?.headers).toMatchObject({
      authorization: 'Bearer tok-1'
    });
    expect(fetch).toHaveBeenCalledWith(
      'http://hermes:8787/api/v1/auth/me',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('serializes POST bodies as JSON', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    let seen: RequestInit | undefined;
    stubFetch((_url, init) => {
      seen = init;
      return { ok: true, token: 't' };
    });
    await apiFetch('/api/v1/auth/login', { method: 'POST', body: { email: 'a@b.c' } });
    expect(seen?.body).toBe(JSON.stringify({ email: 'a@b.c' }));
    expect((seen?.headers as Record<string, string>)['content-type']).toBe('application/json');
  });

  it('surfaces the backend reason on non-2xx', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ ok: false, reason: 'invalid email or password' }), {
          status: 401,
          headers: { 'content-type': 'application/json' }
        })
      )
    );
    const error = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'a', password: 'b' }
    }).catch((err: unknown) => err);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect((error as ApiError).reason).toBe('invalid email or password');
  });

  it('maps network failures to ApiUnavailableError', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    await expect(apiFetch('/health')).rejects.toBeInstanceOf(ApiUnavailableError);
  });
});

// ---------------------------------------------------------------------------
// Auth session flows
// ---------------------------------------------------------------------------
describe('auth session', () => {
  beforeEach(() => {
    localStorage.clear();
    delete import.meta.env.PUBLIC_API_BASE_URL;
    vi.unstubAllGlobals();
    signOut();
  });

  const USER = { id: 'u1', email: 'cam@example.com', displayName: 'Cam', role: 'admin' as const };
  const COUNCIL = { id: 'c1', name: 'Harbour House' };

  function stubLogin(overrides: Record<string, unknown> = {}) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        if (url.endsWith('/api/v1/auth/login')) {
          const body = JSON.parse(String(init.body));
          if (body.password === 'wrong') {
            return new Response(
              JSON.stringify({ ok: false, reason: 'invalid email or password' }),
              { status: 401, headers: { 'content-type': 'application/json' } }
            );
          }
          return new Response(
            JSON.stringify({ ok: true, token: 'jwt-1', user: USER, council: COUNCIL, ...overrides }),
            { status: 200, headers: { 'content-type': 'application/json' } }
          );
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      })
    );
  }

  it('boots into demo mode when no base URL is configured', async () => {
    await bootstrap();
    let session!: AuthSession;
    auth.subscribe((s) => (session = s))();
    expect(session.status).toBe('signed-out');
    expect(session.apiMode).toBe('demo');
  });

  it('signs in, persists the token, and restores the session on bootstrap', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    stubLogin();
    await signIn('cam@example.com', 'correct');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-1');

    // Restore from a fresh session (same stored token + live /auth/me response).
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('/api/v1/auth/me')) {
          return new Response(
            JSON.stringify({ ok: true, user: USER, council: COUNCIL }),
            { status: 200, headers: { 'content-type': 'application/json' } }
          );
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      })
    );
    await bootstrap();
    let session!: AuthSession;
    auth.subscribe((s) => (session = s))();
    expect(session.status).toBe('signed-in');
    expect(session.apiMode).toBe('configured');
    expect(session.user?.email).toBe('cam@example.com');
    expect(session.council?.name).toBe('Harbour House');
  });

  it('rejects bad credentials with the backend reason', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    stubLogin();
    const error = await signIn('cam@example.com', 'wrong').catch((err: unknown) => err);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).reason).toBe('invalid email or password');
    expect(getToken()).toBeNull();
  });

  it('clears a stale token when /auth/me returns 401', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    localStorage.setItem(TOKEN_KEY, 'stale-token');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ ok: false, reason: 'authentication required' }), {
          status: 401,
          headers: { 'content-type': 'application/json' }
        })
      )
    );
    await bootstrap();
    expect(getToken()).toBeNull();
    let session!: AuthSession;
    auth.subscribe((s) => (session = s))();
    expect(session.status).toBe('signed-out');
  });

  it('signUp registers a council and signs in', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        if (url.endsWith('/api/v1/auth/register')) {
          const body = JSON.parse(String(init.body));
          return new Response(
            JSON.stringify({ ok: true, token: 'jwt-2', user: USER, council: { id: 'c2', name: body.councilName } }),
            { status: 200, headers: { 'content-type': 'application/json' } }
          );
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      })
    );
    await signUp({ councilName: 'Cedar Lane', email: 'cam@example.com', password: 'secret123' });
    expect(getToken()).toBe('jwt-2');
    let session!: AuthSession;
    auth.subscribe((s) => (session = s))();
    expect(session.status).toBe('signed-in');
    expect(session.council?.name).toBe('Cedar Lane');
  });

  it('signOut clears the token and the session', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    stubLogin();
    await signIn('cam@example.com', 'correct');
    signOut();
    expect(getToken()).toBeNull();
    let session!: AuthSession;
    auth.subscribe((s) => (session = s))();
    expect(session.status).toBe('signed-out');
  });
});

// ---------------------------------------------------------------------------
// Unit management (per-council registry, migration 0005)
// ---------------------------------------------------------------------------
describe('unit management endpoints', () => {
  beforeEach(() => {
    localStorage.clear();
    delete import.meta.env.PUBLIC_API_BASE_URL;
    vi.unstubAllGlobals();
  });

  function stubFetch(handler: (url: string, init: RequestInit) => unknown) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        const body = handler(url, init);
        const status = body && typeof body === 'object' && 'status' in body ? (body as { status: number }).status : 200;
        return new Response(JSON.stringify(body), {
          status,
          headers: { 'content-type': 'application/json' }
        });
      })
    );
  }

  it('createUnit POSTs the payload and returns the canonical unit', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    localStorage.setItem(TOKEN_KEY, 'jwt-u');
    let seen: RequestInit | undefined;
    stubFetch((url, init) => {
      if (url.endsWith('/api/v1/units')) {
        seen = init;
        return {
          ok: true,
          unit: {
            unitRef: '501', floor: 5, sqft: null, occupancy: 'vacant', tenant: null, rent: null,
            eht: false, evCharger: false, formK: 'missing', arFundCode: 'ar:unit-501', reconciliationRefs: ['501']
          }
        };
      }
      return { ok: true };
    });
    const unit = await createUnit({ unitRef: 'U-501', floor: 5, occupancy: 'vacant' });
    expect(seen?.method).toBe('POST');
    expect(seen?.body).toBe(JSON.stringify({ unitRef: 'U-501', floor: 5, occupancy: 'vacant' }));
    expect((seen?.headers as Record<string, string>).authorization).toBe('Bearer jwt-u');
    expect(unit.unitRef).toBe('501');
  });

  it('deleteUnit issues a DELETE for the unit ref', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    localStorage.setItem(TOKEN_KEY, 'jwt-u');
    let seenUrl = '';
    stubFetch((url, init) => {
      seenUrl = url;
      expect(init.method).toBe('DELETE');
      return { ok: true };
    });
    await deleteUnit('501');
    expect(seenUrl).toBe('http://hermes:8787/api/v1/units/501');
  });

  it('fetchUnitDetail returns the unit with AR balance and payments', async () => {
    import.meta.env.PUBLIC_API_BASE_URL = 'http://hermes:8787';
    localStorage.setItem(TOKEN_KEY, 'jwt-u');
    stubFetch((url) => {
      if (url.endsWith('/api/v1/units/101')) {
        return {
          ok: true,
          unit: {
            unitRef: '101', floor: 1, sqft: 780, occupancy: 'occupied', tenant: null, rent: null,
            eht: true, evCharger: false, formK: 'signed', arFundCode: 'ar:unit-101', reconciliationRefs: ['101']
          },
          ar: { fundCode: 'ar:unit-101', balanceBasis: 35_000, entryCount: 1, headTally: ['abc'] },
          payments: [{ refId: 'P1', referenceCode: 'pay-p1-101', rail: 'lightning', amountBasis: 12_000, status: 'paid', createdAt: '2026-09-01' }]
        };
      }
      return { ok: true };
    });
    const detail = await fetchUnitDetail('101');
    expect(detail.unit.unitRef).toBe('101');
    expect(detail.ar.balanceBasis).toBe(35_000);
    expect(detail.payments[0].referenceCode).toBe('pay-p1-101');
    expect(detail.payments[0].status).toBe('paid');
  });
});
