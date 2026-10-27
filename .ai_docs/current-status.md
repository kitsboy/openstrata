# Current Status — OpenStrata

**Site/product version:** v0.3.37
**Backend API version:** v0.3.27
**Last Updated:** 2026-10-27
**Domain:** openstrata.giveabit.io

## Recent milestone — sessions a council can end, and a record of who did what (backend, `8d5c6b4`, `8bdf968`)

- **A token can be revoked now.** Every token carries a `sid` naming a row in `auth_session` (migration `0009`) that every request resolves: it must exist, be unrevoked and unexpired, belong to the claimed user and council, and still carry the token's role. `POST /auth/logout` ends a session immediately instead of at token expiry, a role change ends it, and a refresh token presented twice ends it as a stolen copy. Access tokens are short-lived (`AUTH_TOKEN_TTL`, default **1h**, was 12h) and renewed with a refresh token issued once, stored only as a SHA-256 hash, and rotated on every use (`AUTH_REFRESH_TTL_DAYS`, default 30). New: `GET /auth/sessions` (own sessions, current one marked) and `DELETE /auth/sessions` (sign out everywhere else).
- **Privileged actions leave a row now.** Twenty routes were role-gated — ledger posts, billing runs, bylaw fines, unit and member deletion, user management — and none recorded the actor. `audit_event` (migration `0009`) holds actor, role, action, outcome, target, status, IP and user agent, written by one `onResponse` hook over one pure policy (`src/audit/policy.ts`). The default is to record, so a new endpoint is audited unless explicitly exempted; refusals are rows too; request bodies are never copied in; unattributable traffic is not recorded at all except the two rate-limited auth events. `GET /api/v1/audit/events` (admin) reads it back, tenant-scoped and cursor-paged.
- **`PATCH /api/v1/auth/users/:id`** adds the admin role change — the demotion path that makes revocation matter — refusing a self-change (`409`) and leaving the council with no admin (`409`), and revoking the target's sessions on the change.
- **The site's sign-out is real sign-out** (`8bdf968`): `signOut()` ended nothing on the backend before, so a cleared token stayed valid for its whole lifetime.
- Verification at `8bdf968`: backend typecheck + build green, **357 passed / 8 skipped** (310 existing + 47 new); frontend `check` 0/0, **312 passed**; `audit:i18n` 1075 keys × 9 locales; `audit:contrast` 218 pairs; production build green.
- **Not verified here:** migration `0009` has never been executed — no Postgres on this machine and Docker is unavailable. Its first real run is CI's `backend-e2e` job, whose smoke suite (now 8 tests, was 5) also asserts that a logout on one instance kills the token on another and that the append-only trigger refuses `UPDATE`/`DELETE`.

## Prior milestone — the i18n audit was blind to this repo's own markup (site, `d4ef669`)

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
- The six dashboard routes listed under the i18n milestone render English in every locale, and the repaired audit now says so on every run.
- **Migration `0009` is unexercised.** No Postgres or Docker on M3, so the sessions and audit tables have never been created anywhere; the first real run is CI's postgres job. Every session/audit test above runs against the in-memory adapters.
- The audit row for a bylaw fine carries the amount and the council-minutes reference, but **not the unit** — the complaint is an opaque JSON string the policy deliberately does not parse. Traceability for a fine runs through the minutes, not the lot.
- The site consumes `POST /auth/logout` but **not refresh tokens**: an access token simply expires after an hour and the next call 401s into a signed-out state. That is a UX decision left open, not a broken path.
- There is no UI for the audit trail or the sessions list. Both are API-only, and an admin reads them with `curl` today.
- `backend/package.json` is still `0.3.27` although the auth contract changed; the README's own rule says to bump it when backend behaviour changes. Two releases have now gone by without a bump — worth a decision rather than another silent pass.
- `npm run check:security` is red at HEAD with **15 false positives**: test fixtures (`password: 'correct-horse-battery'`, `AUTH_SECRET = 'auth-test-secret-xyz'`), the `.env.example` dev placeholder, and CHANGELOG/handoff prose about the `ospl1.<payload>.<sig>` link token. No real credential is committed. The gate is not wired into CI, so nothing is blocked — but it cannot be used as a signal until the pattern tells a fixture from a secret.

## UI queue

The standing UI rule remains: offer four improvements, wait for Cam's pick, then implement only selected items. Current queue is the floor walk on `/units`, September close on `/accounting`, next-30-days strip on `/tax` + `/calendar`, and a release trail on `/changelog`. Neither commit here consumed a queue item — the chip/token work is design-system compliance, and the localization is the chrome those pages sit in.
