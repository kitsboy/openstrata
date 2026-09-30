/**
 * Bearer-token persistence for the frontend API client.
 *
 * The backend issues HS256 JWTs (see `backend/src/auth/`); the static site
 * keeps the token in localStorage and sends it as `Authorization: Bearer …`
 * on every `/api/v1/*` call. Key naming follows the site's existing
 * `openstrata-*` localStorage convention.
 */

export const TOKEN_KEY = 'openstrata-token';

export function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof localStorage === 'undefined') return;
  if (token === null) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}
