# OpenStrata — Standard Operating Procedure

Updated: 2026-10-27

## Quick Commands (frontend, from repo root)
npm run dev              SvelteKit dev server
npm run build            Production build to build/
npm run preview          Preview production build
npm run check            SvelteKit type checking
npm run test             Vitest run (frontend)
npx playwright install chromium && npm run test:e2e   isolated browser sign-in and payment simulation
npm run audit:i18n       locale parity (error) + hard-coded copy scan (warning)
npm run --silent export:i18n > translation-review.csv   generate a nine-locale review sheet
npm run audit:contrast   WCAG contrast for every token pair, plus fill-literal and var() guards
npm run audit:performance  after npm run build: dashboard initial JS gzip budget (230,000 bytes)
npm run check:security   secret-hygiene gate — every tracked file, base64 decoded, fixtures classified (CI)

CI runs check:security, check, audit:i18n, audit:contrast, the tests and the production build
on every push, and `backend-e2e` runs the migration gate. check:security is a live gate now:
a real credential fails the build, while a fixture value is classified and COUNTED in the log
rather than reported. audit:i18n's hard-coded copy list is informational today (113 entries
— six routes are not localized at all).

## Quick Commands (backend, from backend/)
npm run typecheck        tsc --noEmit
npm run build            tsc -p tsconfig.json (emit)
npm test                 Vitest run (isolated from frontend suite)
npm run dev              tsx watch on src/index.ts
npm run cli -- rosa ingest    validate + probe the BC compliance corpus (no DB)
npm run cli -- ziggy simulate walk treasury scenarios through the state machine (no DB)
npm run migrate          apply trust-ledger migrations (idempotent, serialized, checksummed)
npm run migrate:check    read-only preflight: checksums, missing and orphan drift (no writes)
npm run db:check         the gate: migrations from zero AND as an upgrade, then the Postgres suite
npm run db:up / db:down  start / stop the local PostgreSQL 17 + pgvector cluster
npm run seed             seed a demo community (idempotent)

The Postgres E2E tests skip themselves when DATABASE_URL is unset, which is the normal
state here — 8 of the suite skip (369 passed / 8 skipped), so a green run does not cover
the durable paths (ledger idempotency, sessions, the audit table, or the migrations
themselves). With `DATABASE_URL` set the run is **377/377**. Sessions and the audit log
are required deps of buildServer, so every API test builds them with
`makeSessionDeps()` (tests/memstore.ts).

## Local Postgres and the migration gate

Migrations are DDL: until they run against a real Postgres, nothing about them is
verified, and `main` is where that shows — the first attempt at `0009` failed in CI
because the runner stripped the `BEGIN` out of a plpgsql function body (`d220d6f`).
There is a harness in the repo now, so a migration is applied before it is pushed
rather than for the first time on a runner. From the repo root or `backend/`:

    npm run db:up        # start Homebrew PostgreSQL 17 + pgvector; cluster in backend/.pgdata
    npm run db:check     # apply migrations from zero AND as an upgrade, then run the suite
    npm run db:down      # stop it (the data directory is kept)
    npm run db:status    # version, pgvector, cluster, port, what DATABASE_URL resolves to
    npm run db:url       # the connection string: export DATABASE_URL=$(npm run --silent db:url)
    npm run db:reset     # delete backend/.pgdata and start from nothing

`db:check` is the gate, and it takes about 3 seconds:

- **upgrade path** — applies pending migrations to the persistent development
database, which already carries history: checksum drift (an earlier migration edited
after the fact), DDL that is not repeatable, the ALTER path a deployment takes.
- **from zero** — drops and recreates a scratch `<db>_gate`, applies every migration
in order: syntax, ordering, a mangled function body. This is the CI path.
- **re-run + checks** — a second `npm run migrate` must report `no pending migrations`
and `migrate:check` must be clean.
- **postgres suite** — the backend suite against the scratch database, requiring
**0 skipped**, because an unset or wrong `DATABASE_URL` is exactly how the durable
paths go untested while the suite still reports green.

**CI runs it too.** The `backend-e2e` job calls `npm run db:check` against its own
`pgvector/pgvector:pg17` service instead of the old `npm run migrate` + `-- e2e-smoke`
steps, so a push made with `--no-verify` is still measured the same way.

`DATABASE_URL` always wins, so CI and `docker compose` use the same gate (bring up
`docker compose up -d db`, set `DATABASE_URL`, run `npm run db:check`). If it points at
a remote host the gate refuses: creating scratch databases on a shared server is not a
decision a git hook should make.

The harness needs PostgreSQL **17** — the major in `pgvector/pgvector:pg17` — plus
pgvector, and finds them through `OPENSTRATA_PG_BIN`, the Homebrew keg, or `pg_config`
on PATH: `brew install postgresql@17 pgvector`. It listens on loopback only, on port
**5455** so 5432 stays free, with trust authentication. Dev-only and disposable.

### The pre-push hook (once per clone)

    npm run hooks:install        # git config core.hooksPath .githooks

`.githooks/pre-push` runs the gate, so a migration that cannot apply stops the push
instead of turning `main` red. No Postgres installed refuses the push with the
installation command, which is the point of it. Deliberate bypasses:
`OPENSTRATA_SKIP_DB_CHECK=1 git push` or `git push --no-verify`.

Backend env vars added 2026-10-27: AUTH_REFRESH_TTL_DAYS (30 default, refresh/session
lifetime) — AUTH_TOKEN_TTL now defaults to 1h rather than 12h, since a revoked session
kills its tokens immediately and a client renews with its refresh token.

## API Reference
Fastify surface at `backend/API.md` — every /api/v1 endpoint + payload shapes.

## Deployment
git push origin main triggers Cloudflare Pages auto-deploy of the static site (project: openstrata).
The `backend/` Phase 3 services deploy separately (Docker Compose on a Tailscale-only host) — not on Cloudflare Pages.

## Agent Protocol
1. Read GROK-SESSION-PROTOCOL.md
2. Read .ai_docs/current-status.md and project-summary.md
3. Work on project
4. Update .ai_docs/current-status.md and docs/KIMI-HANDOFF.md
5. Push to origin main