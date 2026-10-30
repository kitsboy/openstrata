/**
 * Typed fetch wrapper for the OpenStrata backend (`/api/v1/*`).
 *
 * Handles the shared concerns of every live-data call: base-URL resolution,
 * Bearer token attachment, JSON bodies, one retry after a session refresh, and
 * error normalization. Component code never touches `fetch` directly — it calls
 * the typed endpoint helpers in this folder (`auth.ts`, `ledger.ts`, `units.ts`,
 * `rails.ts`).
 */

import { apiBaseUrl } from './config';

/** The backend rejected the request with a non-2xx status. */
export class ApiError extends Error {
  readonly status: number;
  readonly reason: string | undefined;

  constructor(status: number, reason?: string) {
    super(reason ?? `API request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.reason = reason;
  }
}

/** No base URL is configured, or no token is available — caller should fall back to demo data. */
export class ApiUnavailableError extends Error {
  constructor(message = 'API not available (demo mode)') {
    super(message);
    this.name = 'ApiUnavailableError';
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

/**
 * Exchanges the stored refresh token for a fresh access token, or resolves
 * `null` when the session is gone. Injected by `auth.ts` rather than imported so
 * this module stays a transport with no knowledge of the auth store — and so a
 * 401 retry cannot become a circular import.
 */
export type RefreshHandler = () => Promise<string | null>;

let refreshHandler: RefreshHandler | null = null;

/** Register (or clear) the refresh handler. Called once by `auth.ts` on import. */
export function setRefreshHandler(handler: RefreshHandler | null): void {
  refreshHandler = handler;
}

function parseServerReason(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'reason' in data) {
    const reason = (data as { reason?: unknown }).reason;
    if (typeof reason === 'string' && reason) return reason;
  }
  return undefined;
}

interface RawResult {
  response: Response;
  data: unknown;
}

async function send(base: string, path: string, options: RequestOptions, token: string | null): Promise<RawResult> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined
    });
  } catch {
    // Network failure (host unreachable, DNS, CORS blocked) — treat as unavailable
    // so widgets fall back to demo data instead of throwing at the user.
    throw new ApiUnavailableError('backend unreachable');
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    /* non-JSON body */
  }
  return { response, data };
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const base = apiBaseUrl();
  if (!base) throw new ApiUnavailableError();

  let token = options.token ?? null;
  let result = await send(base, path, options, token);

  // An access token lives an hour, so a page opened before a long meeting can
  // reach a 401 with a perfectly good 30-day session behind it. One refresh and
  // one retry is the difference between "you are signed out" and "carry on":
  // the retry is attempted at most once, and never for a call that carried no
  // token at all (sign-in, health, refresh itself).
  if (result.response.status === 401 && token && refreshHandler) {
    const fresh = await refreshHandler().catch(() => null);
    if (fresh && fresh !== token) {
      token = fresh;
      result = await send(base, path, options, token);
    }
  }

  if (!result.response.ok) {
    throw new ApiError(result.response.status, parseServerReason(result.data));
  }
  return result.data as T;
}
