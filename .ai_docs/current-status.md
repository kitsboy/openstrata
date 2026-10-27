# Current Status — OpenStrata

**Site/product version:** v0.3.37
**Backend API version:** v0.3.27
**Last Updated:** 2026-10-26
**Domain:** openstrata.giveabit.io

## Recent milestone — the i18n audit was blind to this repo's own markup (site, `d4ef669`)

- `scripts/audit-i18n.mjs` skipped **any line containing `{`**, and this repo writes markup minified — the entire site footer is a single line. One binding therefore hid every hard-coded string beside it. The scanner now strips Svelte expressions and scans *inside* the line, and checks `title`/`aria-label`/`alt` the way it already checked text nodes.
- Reaching the warnings it was hiding moved the surface from a handful to **113** (warn-level, so CI stays green). The bulk is real, not noise: `/accounting` (47), `/units` (18), `/tax` (11), `/meetings` (8), `/pay` (7) and `/calendar` (4) have **no i18n import at all**. The "full interface localization across all routes" claim does not hold for those six.
- The home page chrome is now translated in all nine locales — nav labels (Units / Accounting / Pay / Tax & CRA / Calendar / Meetings), "Pay fees", the RSS chip's `title` and `aria-label`, the cookie notice, "Open the lot list". 10 new keys, **1075** total, parity enforced across `fr es zh hi fil pl uk sw`.
- The RSS chip moved off its `#fdba74` / `rgba(251,146,60,…)` literals onto `--color-slab-accent`. The fill is now *inside* the contrast audit (7.83:1 light, 9.63:1 dark, floor 4.5) and flips with the dark theme like the rest of the footer, which it previously did not. It also used to *darken* on hover, because `.footer-links a:hover` recoloured it to the accent the rest state was ignoring.
- Sentry was initialised but never wired to SvelteKit: `src/hooks.client.ts` exported no `handleError`, so a configured DSN would have reported an empty project forever. It is now exported and guarded by a wiring contract test. The SDK's client entry imports `$app/stores`, which this project's vitest setup cannot resolve, so the guard reads the source — the same shape as the `envPrefix` contract test in `src/lib/api/config.test.ts`.
- Site version is now `0.3.37` (`fb3d60a`): the durable-ledger release has the dated `CHANGELOG.md` section and front-matter summary it was missing, `src/lib/changelog.generated.ts` is regenerated (40 releases, 283 items), and both `/changelog` and the footer `v` stamp publish it. The backend API version stays `0.3.27` on its own track.

## Prior milestone — durable ledger retries and treasury safety (committed `72acd9a`, not deployed)

- Added Postgres-backed ledger idempotency: keys are scoped by council and durably linked to the inserted entry, with request fingerprints, 24-hour expiry, and transaction-level serialization. Migration `0007` and E2E restart/replay coverage are present. The in-memory adapter remains process-local; the Postgres E2E suite was not run here (`DATABASE_URL` unset and Docker unavailable).
- Added a serialized migration runner with SHA-256 drift checks and a read-only `npm run migrate:check` preflight. Legacy checksums are pinned from current migration files during upgrade, not independently verified historical proof; inspect/backup the schema before the first migration upgrade.
- Added `/health/live` and dependency `/health/ready`; the production entrypoint exposes only a Postgres boolean probe.
- Hardened Bitcoin plan issuance/broadcast: server recomputes council balance policy, validates address/network/input/fee rules, reserves UTXOs and binds broadcast to a server-issued plan. Live broadcast and ledger debit are refused pending a real PSBT builder and cryptographic verification; plan records/reservations remain process-local.
- Landed 2026-10-26 as `72acd9a` (21 files) and published as site release `0.3.37` (`fb3d60a`).

## Prior milestone — backend safety and read-only agent context

- Added member-authenticated `GET /api/v1/agent/manifest` and `/api/v1/agent/context`. The context contains aggregate occupancy/Form K counts, verified Operating/CRF balances and up to 50 deadlines; it intentionally omits owner/contact data, payment references, and transaction descriptions. Agent responses are `private, no-store` and vary on `Authorization`.
- The in-memory ledger idempotency fallback validates keys and fingerprints, coalesces retries, replays identical requests for 24 hours, returns `409` for changed requests, and refuses new keys with `503` when its 10,000-entry capacity is full. Postgres uses the durable migration `0007` implementation.
- Fastify request bodies are capped at 256 KiB; request timeout is 30 seconds; schema validation rejects unknown properties. Auth fields and Rosa question/facts have explicit shape and size limits.
- CRT evidence and Form B/F HTML escape dynamic text (including document titles and unit IDs) and return `private, no-store`, `nosniff`, and restrictive CSP headers. JSON agent context preserves council names without HTML entities.
- Release versions: site/project `0.3.36`, backend `0.3.27` (separate semver tracks). API v1 paths unchanged.
- Verification of that prior milestone: backend TypeScript typecheck clean; backend test suite 301 passed / 6 skipped; frontend 309 passed; Svelte check 0 errors / 0 warnings; production build green; i18n audit 1065 keys × 9 locales and contrast audit 218 pairs pass.
- Verification of the durable-ledger release at its own commit: backend typecheck and build green; **310 passed / 6 skipped**. Postgres-only E2E skipped; `DATABASE_URL` unset and Docker unavailable.

## Prior deployment state

The site is Cloudflare static; a Phase 3 backend host has not been confirmed/deployed. The `PUBLIC_API_BASE_URL=/` same-origin path and exact `CORS_ORIGINS` cross-origin path were browser/server-verified locally. Real host/tailnet verification remains blocked on Kimi's answer in `docs/KIMI-HANDOFF.md`.

## Known limitations

- The in-memory test/development adapter for ledger idempotency is process-local; production Postgres idempotency is durable, but cross-host database failure modes are not exercised in this environment.
- Agent accounts are not a distinct identity class yet; the manifest explicitly warns against sharing admin/treasurer credentials. A dedicated scoped credential model remains future work.
- The backend is not confirmed deployed; do not call local verification a production check.
- Legal/statutory content requires current professional review. Payment rails and backend integrations must remain honestly labeled until real host credentials/providers exist.
- The six dashboard routes listed under the current milestone render English in every locale, and the repaired audit now says so on every run.
- `npm run check:security` is red at HEAD with **15 false positives**: test fixtures (`password: 'correct-horse-battery'`, `AUTH_SECRET = 'auth-test-secret-xyz'`), the `.env.example` dev placeholder, and CHANGELOG/handoff prose about the `ospl1.<payload>.<sig>` link token. No real credential is committed. The gate is not wired into CI, so nothing is blocked — but it cannot be used as a signal until the pattern tells a fixture from a secret.

## UI queue

The standing UI rule remains: offer four improvements, wait for Cam's pick, then implement only selected items. Current queue is the floor walk on `/units`, September close on `/accounting`, next-30-days strip on `/tax` + `/calendar`, and a release trail on `/changelog`. Neither commit here consumed a queue item — the chip/token work is design-system compliance, and the localization is the chrome those pages sit in.
