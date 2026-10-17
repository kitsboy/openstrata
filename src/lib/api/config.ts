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
 *      and this value compiles to `undefined`). Either an absolute origin
 *      (`https://host:8080`) or `/`, which means **this same origin** — the
 *      deployment where one host serves the site and the API, so no URL has to
 *      be written down and no CORS is needed at all.
 *   3. Fallback          — `null`: demo mode. Every dashboard widget keeps
 *      rendering curated sample data, so the public site never breaks.
 *
 * See `.env.example` and `docs/DEPLOYMENT.md` for the deployment options
 * (single host vs tailnet-only vs public HTTPS).
 */

export const API_BASE_KEY = 'openstrata-api-base';

/**
 * Values that mean "the origin this page was served from". Deliberately a short
 * list of exact spellings: a protocol-relative `//host` is *not* one of them, and
 * must never be treated as same-origin (that is a redirect to somebody else).
 */
const SAME_ORIGIN_TOKENS = ['/', 'same-origin'];

/** Trim a trailing slash so path joins never double up. */
function trimBase(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

/**
 * A configured base must be an absolute http(s) URL (a path is allowed, for a
 * reverse proxy in front of the API). Anything else is **ignored** rather than
 * passed to `fetch`: a protocol-relative `//evil.example` is a redirect to
 * somebody else, and appending `/api/v1/...` to it would hand a council's bearer
 * token to that host. A misconfigured build falls back to demo mode instead.
 */
function absoluteBase(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname) return null;
    return trimBase(value);
  } catch {
    return null;
  }
}

/**
 * The precedence rule, as a value: a stored override wins over the build-time
 * base, `/` resolves to the page's own origin, and an empty or absent value is
 * demo mode — never an empty-string URL. Pure and exported so the rule can be
 * tested without a browser or a build.
 */
export function resolveApiBase(
  stored: string | null | undefined,
  built: string | null | undefined,
  origin: string | null | undefined = null
): string | null {
  for (const candidate of [stored, built]) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue;
    const value = candidate.trim();
    if (SAME_ORIGIN_TOKENS.includes(value.toLowerCase())) {
      // No origin to resolve against (SSR/prerender): demo mode, exactly like an
      // unset override. The client resolves it on the first call after hydration.
      const sameOrigin = typeof origin === 'string' && origin.trim() ? trimBase(origin) : '';
      if (sameOrigin) return sameOrigin;
      continue;
    }
    return absoluteBase(value);
  }
  return null;
}

/**
 * Resolve the configured backend base URL, or `null` for demo mode.
 * Safe to call during SSR/prerender (no localStorage or location there).
 */
export function apiBaseUrl(): string | null {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(API_BASE_KEY) : null;
  const origin = typeof location !== 'undefined' ? location.origin : null;
  return resolveApiBase(stored, import.meta.env?.PUBLIC_API_BASE_URL, origin);
}

/** True when a backend base URL is configured (regardless of reachability). */
export function isApiConfigured(): boolean {
  return apiBaseUrl() !== null;
}
