/**
 * Cross-origin access for the static site.
 *
 * Why this exists at all: the site is a static build served from Cloudflare
 * Pages, and the API is a council's own host (a Tailscale MagicDNS name, or an
 * HTTPS origin behind a tunnel). Those are two different origins, so a browser
 * refuses every `/api/v1/*` call until the API says otherwise — `docs/DEPLOYMENT.md`
 * promised both exposure paths before the code implemented either one.
 *
 * Four decisions carry the safety of that:
 *
 * 1. **Off by default.** No `CORS_ORIGINS`, no CORS headers, and nothing about a
 *    same-origin deployment changes. Cross-origin access is a deliberate act.
 * 2. **An exact allow-list, never `*`.** `*` is dropped with a warning rather
 *    than honoured: this API carries bearer tokens, and a wildcard would let any
 *    page in the world make authenticated calls from a visitor's browser.
 * 3. **The origin is echoed, not the list.** A response names exactly the origin
 *    that asked, and `Vary: Origin` is set on **every** response that carried an
 *    `Origin`, allowed or not — otherwise a shared cache could hand one site the
 *    answer meant for another.
 * 4. **Nothing is refused with a special status.** A disallowed origin simply
 *    gets no permission headers, which is what a browser act on; inventing a 403
 *    here would only tell an attacker which origins a council allows.
 */

/** Methods the API actually answers. Kept narrow on purpose. */
export const CORS_METHODS = ['GET', 'POST', 'OPTIONS'] as const;

/** Headers the browser must be allowed to send: auth, JSON, and idempotency. */
export const CORS_ALLOW_HEADERS = ['authorization', 'content-type', 'idempotency-key'] as const;

/** How long a browser may cache the preflight (10 minutes). */
export const CORS_MAX_AGE = 600;

export interface CorsOriginList {
  /** Normalised (`https://host:port`, no trailing slash, lower-case). */
  origins: string[];
  /** True when the configuration contained `*` and it was dropped. */
  refusedWildcard: boolean;
}

/** Parse `CORS_ORIGINS`: comma-separated, trimmed, normalised, deduped. */
export function parseCorsOrigins(raw: readonly string[] | undefined): CorsOriginList {
  let refusedWildcard = false;
  const origins: string[] = [];
  for (const entry of raw ?? []) {
    for (const piece of entry.split(',')) {
      const trimmed = piece.trim();
      if (!trimmed) continue;
      if (trimmed === '*') {
        refusedWildcard = true;
        continue;
      }
      const normalised = normaliseOrigin(trimmed);
      if (normalised && !origins.includes(normalised)) origins.push(normalised);
    }
  }
  return { origins, refusedWildcard };
}

/**
 * `https://Host:8443/` and `https://host:8443` are the same origin to a browser,
 * so they are the same entry here. Anything that is not an absolute http(s)
 * origin is dropped rather than stored as an entry that could never match.
 */
export function normaliseOrigin(value: string): string | null {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^/\s]+$/.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * The `Access-Control-Allow-Origin` value for this request, or `null` when the
 * origin is missing or not allowed. The request's own spelling is echoed back —
 * browsers compare it exactly.
 */
export function allowedOrigin(
  origin: string | null | undefined,
  origins: readonly string[]
): string | null {
  if (typeof origin !== 'string' || !origin.trim()) return null;
  const normalised = normaliseOrigin(origin);
  if (!normalised) return null;
  return origins.includes(normalised) ? origin.trim() : null;
}

/**
 * The CORS headers for a response. `Origin` on the request always produces
 * `Vary: Origin`, whether or not the origin is allowed.
 */
export function corsHeaders(
  origin: string | null | undefined,
  origins: readonly string[]
): Record<string, string> {
  if (typeof origin !== 'string' || !origin.trim()) return {};
  const allow = allowedOrigin(origin, origins);
  if (!allow) return { vary: 'Origin' };
  return {
    vary: 'Origin',
    'access-control-allow-origin': allow,
    'access-control-allow-methods': CORS_METHODS.join(', '),
    'access-control-allow-headers': CORS_ALLOW_HEADERS.join(', '),
    'access-control-max-age': String(CORS_MAX_AGE)
  };
}

/** Merge a new `Vary` value into whatever the route already set. */
export function mergeVary(existing: unknown, value: string): string {
  const current = typeof existing === 'string' ? existing : '';
  const parts = current
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.some((part) => part.toLowerCase() === value.toLowerCase())) parts.push(value);
  return parts.join(', ');
}
