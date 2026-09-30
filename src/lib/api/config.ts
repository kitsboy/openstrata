/**
 * Backend API base-URL resolution for the live frontend wiring.
 *
 * The site is a fully static build, so the reachable backend URL is decided by
 * config, not by origin:
 *
 *   1. Runtime override  — localStorage `openstrata-api-base` (lets an operator
 *      repoint the site to a different host without rebuilding, e.g. a Tailscale
 *      IP that changes between networks).
 *   2. Build-time env    — `PUBLIC_API_BASE_URL` (Vite exposes PUBLIC_* to the
 *      client; set it in `.env` at build time).
 *   3. Fallback          — `null`: demo mode. Every dashboard widget keeps
 *      rendering curated sample data, so the public site never breaks.
 *
 * See `.env.example` and `docs/DEPLOYMENT.md` for the two deployment options
 * (Tailnet-only vs public HTTPS behind JWT auth + CORS).
 */

export const API_BASE_KEY = 'openstrata-api-base';

/** Trim a trailing slash so path joins never double up. */
function trimBase(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

/**
 * Resolve the configured backend base URL, or `null` for demo mode.
 * Safe to call during SSR/prerender (no localStorage there).
 */
export function apiBaseUrl(): string | null {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(API_BASE_KEY);
    if (stored && stored.trim()) return trimBase(stored);
  }
  const env = import.meta.env?.PUBLIC_API_BASE_URL;
  if (typeof env === 'string' && env.trim()) return trimBase(env);
  return null;
}

/** True when a backend base URL is configured (regardless of reachability). */
export function isApiConfigured(): boolean {
  return apiBaseUrl() !== null;
}
