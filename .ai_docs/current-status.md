# Current Status — OpenStrata

**Site/product version:** v0.3.36
**Backend API version:** v0.3.27
**Last Updated:** 2026-10-17
**Domain:** openstrata.giveabit.io

## Recent milestone — backend safety and read-only agent context

- Added member-authenticated `GET /api/v1/agent/manifest` and `/api/v1/agent/context`. The context contains aggregate occupancy/Form K counts, verified Operating/CRF balances and up to 50 deadlines; it intentionally omits owner/contact data, payment references, and transaction descriptions. Agent responses are `private, no-store` and vary on `Authorization`.
- Ledger idempotency now validates `Idempotency-Key`, fingerprints the full request body, coalesces concurrent retries, replays identical requests for 24 hours, and answers `409` if the same key is reused with different data. Capacity is capped at 10,000. Successful results are never evicted before expiry; a full cache refuses new keys with `503`. This is process-local and must become database-backed before horizontally scaling.
- Fastify request bodies are capped at 256 KiB; request timeout is 30 seconds; schema validation rejects unknown properties. Auth fields and Rosa question/facts have explicit shape and size limits.
- CRT evidence and Form B/F HTML escape dynamic text (including document titles and unit IDs) and return `private, no-store`, `nosniff`, and restrictive CSP headers. JSON agent context preserves council names without HTML entities.
- Release versions: site/project `0.3.36`, backend `0.3.27` (separate semver tracks). API v1 paths unchanged.
- Verification: backend TypeScript typecheck clean; backend test suite 301 passed / 6 skipped; frontend 309 passed; Svelte check 0 errors / 0 warnings; production build green; i18n audit 1065 keys × 9 locales and contrast audit 218 pairs pass.

## Prior deployment state

The site is Cloudflare static; a Phase 3 backend host has not been confirmed/deployed. The `PUBLIC_API_BASE_URL=/` same-origin path and exact `CORS_ORIGINS` cross-origin path were browser/server-verified locally. Real host/tailnet verification remains blocked on Kimi's answer in `docs/KIMI-HANDOFF.md`.

## Known limitations

- The new ledger idempotency store is in-memory, single-process and 24-hour; it does not provide exactly-once behavior across restarts or multiple instances.
- Agent accounts are not a distinct identity class yet; the manifest explicitly warns against sharing admin/treasurer credentials. A dedicated scoped credential model remains future work.
- The backend is not confirmed deployed; do not call local verification a production check.
- Legal/statutory content requires current professional review. Payment rails and backend integrations must remain honestly labeled until real host credentials/providers exist.

## UI queue

The standing UI rule remains: offer four improvements, wait for Cam's pick, then implement only selected items. Current queue is the floor walk on `/units`, September close on `/accounting`, next-30-days strip on `/tax` + `/calendar`, and a release trail on `/changelog`. This backend-only release does not consume a UI queue item.
