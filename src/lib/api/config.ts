/**
 * Backend API base-URL resolution for the live frontend wiring.
 *
 * The site is a fully static build, so the reachable backend URL is decided by
 * config, not by origin:
 *
 *   1. Runtime override  — localStorage `openstrata-api-base` (lets an operator
 *      repoint the site to a different host without rebuilding, e.g. a Tailscale
 *      IP that changes between networks).
 *   2. Build-time env    — `PUBLIC_API_BASE_URL`, inlined by Vite at build time
 *      (see `envPrefix` in vite.config.ts: without it Vite exposes only `VITE_`
 *      and this value compiles to `undefined`).
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
 * The precedence rule, as a value: a stored override wins over the build-time
 * base, and an empty or absent value is demo mode — never an empty-string URL.
 * Kept pure and exported so the rule can be tested without a browser or a build.
 */
export function resolveApiBase(
  stored: string | null | undefined,
  built: string | null | undefined
): string | null {
  for (const candidate of [stored, built]) {
    if (typeof candidate === 'string' && candidate.trim()) return trimBase(candidate);
  }
  return null;
}

/**
 * Resolve the configured backend base URL, or `null` for demo mode.
 * Safe to call during SSR/prerender (no localStorage there).
 */
export function apiBaseUrl(): string | null {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(API_BASE_KEY) : null;
  return resolveApiBase(stored, import.meta.env?.PUBLIC_API_BASE_URL);
}

/** True when a backend base URL is configured (regardless of reachability). */
export function isApiConfigured(): boolean {
  return apiBaseUrl() !== null;
}
