# Security Policy — OpenStrata

**Status:** Draft — reflects the current static marketing site (no user data processed). To be extended as backend phases ship.
**Last updated:** 2026-08-25

## Current posture

The live site (openstrata.giveabit.io) is a **static SvelteKit build** served
by Cloudflare Pages. It has **no backend, no database, and no user accounts**:
all dashboard data is mock/demo content, and the donation and job links are
external email/URL actions. There is therefore no personal, financial, or
community data stored or processed by the site today.

## Reporting a vulnerability

Please report security issues privately to **hello@giveabit.io**.
Include: affected URL/route, steps to reproduce, expected vs actual behaviour,
and any proof-of-concept. Do not open public issues for security problems.

## Security controls in place

- **Static hosting with security headers** — `static/_headers` sets CSP, HSTS,
  and related headers on Cloudflare Pages.
- **No secrets in the repository** — environment variables (`VITE_SATOHASH_KEY`,
  etc.) are never committed; `.env*` files are gitignored.
- **Dependency hygiene** — `npm ci` is used for reproducible installs; the
  lockfile is kept in sync with `package.json`.
- **Type checking + audits before release** — `npm run check` and
  `npm run audit:i18n` must pass before deployment.
- **Satohash client is non-privileged** — `src/lib/satohash.ts` only performs
  read/health calls and public OTS stamp submissions; it never stores keys.

## Roadmap (as the product adds backend phases)

- Encrypt data in transit and at rest; managed secrets with rotation
- Tenant-aware authorization at server and query boundaries
- Immutable audit logs; anomaly detection; SAST/DAST/secret scans
- Independent penetration test before production handling of real strata records
- Backups encrypted, isolated, and tested; incident-response plan
- See `docs/PRODUCT-BUILD-PLAN.md` §16 for the full privacy/security backlog
