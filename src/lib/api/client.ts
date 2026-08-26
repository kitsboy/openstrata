/**
 * Typed fetch wrapper for the OpenStrata backend (`/api/v1/*`).
 *
 * Handles the shared concerns of every live-data call: base-URL resolution,
 * Bearer token attachment, JSON bodies, and error normalization. Component code
 * never touches `fetch` directly — it calls the typed endpoint helpers in this
 * folder (`auth.ts`, `ledger.ts`, `units.ts`, `rails.ts`).
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

function parseServerReason(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'reason' in data) {
    const reason = (data as { reason?: unknown }).reason;
    if (typeof reason === 'string' && reason) return reason;
  }
  return undefined;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const base = apiBaseUrl();
  if (!base) throw new ApiUnavailableError();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['content-type'] = 'application/json';
  if (options.token) headers.authorization = `Bearer ${options.token}`;

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

  if (!response.ok) {
    throw new ApiError(response.status, parseServerReason(data));
  }
  return data as T;
}
