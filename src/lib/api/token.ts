/**
 * Credential persistence for the frontend API client.
 *
 * The backend issues HS256 JWTs (see `backend/src/auth/`) and a rotating refresh
 * token. The static site keeps both in localStorage and sends the access token
 * as `Authorization: Bearer …` on every `/api/v1/*` call. Key naming follows the
 * site's existing `openstrata-*` localStorage convention.
 *
 * **Two keys, not one envelope.** The access token is the hot credential read on
 * every request; the refresh token is only read when the access token is near or
 * past its expiry. Storing them together would mean parsing JSON on every call
 * and would make a corrupt envelope destroy a still-valid session. They are
 * cleared together on sign-out, which is the only invariant that matters.
 */

export const TOKEN_KEY = 'openstrata-token';
export const REFRESH_TOKEN_KEY = 'openstrata-refresh';

export function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof localStorage === 'undefined') return;
  if (token === null) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (typeof localStorage === 'undefined') return;
  if (token === null) localStorage.removeItem(REFRESH_TOKEN_KEY);
  else localStorage.setItem(REFRESH_TOKEN_KEY, token);
}
