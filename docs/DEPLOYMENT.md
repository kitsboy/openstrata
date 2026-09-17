# Deployment — OpenStrata / Hermes Strata

**Production:** https://openstrata.giveabit.io
**GitHub:** https://github.com/kitsboy/openstrata (branch: `main`)
**Hosting:** Cloudflare Pages (project: openstrata), static SvelteKit build via `@sveltejs/adapter-static`

## Deploy

```bash
npm ci
npm run audit:i18n    # translation + hard-coded-copy audit
npm run build         # writes static output to build/
git push origin main  # Cloudflare Pages auto-deploys from main
```

Deploys are triggered by pushes to `main`. The live site version marker
(`openstrata-version` meta) is verified after each release against the
`package.json` version.

## Verification checklist

1. `npm run check` reports 0 errors and 0 warnings
2. `npm run build` completes cleanly
3. `npm run audit:i18n` passes (0 missing keys, 0 hard-coded-copy warnings)
4. Live site serves the expected version marker after deploy

## Phase 3 backend (`backend/`)

The self-hosted backend stack is separate from the static Cloudflare site. It
runs on a Linux box behind Tailscale (per `hermes-strata-app-framework-v2.md`)
and is NOT deployed to Cloudflare Pages.

```bash
cd backend
cp .env.example .env      # set a real password when they exist
npm install
npm run migrate           # apply ledger + pgvector migrations
npm run seed              # idempotent demo community (Cedar Point)
npm run dev               # Fastify API on 8080
```

Bring the stack up with Docker Compose (Postgres + pgvector + API):

```bash
cd backend
docker compose up -d
```

Backend verification: `npm run typecheck` and `npm test` (run from `backend/`),
plus the isolated `backend` + `backend-e2e` jobs in CI (the e2e job spins up a
real Postgres and runs the smoke suite).

### Host deploy checklist (Tailscale / Umbrel)

The API is Tailscale-only by design — never publish Postgres to `0.0.0.0`.
For the full walkthrough (including the per-user-tailnet path and the onboarding
agent), see `docs/TAILSCALE-ONBOARDING.md`.

```bash
cd backend
cp .env.example .env
# MUST set before boot:
#   AUTH_SECRET=$(openssl rand -base64 48)   # signs the council JWTs
#   POSTGRES_PASSWORD=<strong random value>
#   DATABASE_URL=postgres://openstrata:<pw>@db:5432/openstrata   (compose) or @localhost (bare)

docker compose up -d              # postgres (pgvector) + api on the Tailscale interface

# Apply migrations 0001..0005 (council/app_user + tenant-scoped payment key + per-council units)
docker compose run --rm api npm run migrate

# Deploy-day gate — the full Postgres smoke suite (skipped without DATABASE_URL):
DATABASE_URL=postgres://openstrata:<pw>@localhost:5432/openstrata \
  npm run test -- e2e-smoke

# Sanity checks against the live API:
curl -s http://<tailscale-magicdns>:8080/health
curl -s -X POST http://<tailscale-magicdns>:8080/api/v1/auth/register \
  -H 'content-type: application/json' \
  -d '{"councilName":"Cedar Point","email":"admin@cedar.example","password":"change-me-now"}'
```

The e2e smoke suite exercises the real Postgres adapters end to end — register →
ledger → billing → payments quote/confirm (incl. the `markStatus` single-row
semantics check) → forms → meetings → cross-council isolation — so first deploy
day is a single command, not a manual probe session.

#### After the host is up (optional)

- **Rosa embeddings:** when Ollama is running on the host (or another tailnet
  host), pull `nomic-embed-text` + `llama3.2`, point `OLLAMA_BASE_URL` at the
  Ollama host's MagicDNS name if remote, then index the BC corpus:
  ```bash
  docker compose run --rm api npm run cli -- rosa index
  ```
  `POST /api/v1/rosa/query` then uses pgvector + Ollama embeddings (keyword
  fallback otherwise). To re-index from scratch (dev): `rosa reset` then `rosa index`.
- **Rails:** when bitcoind/LND/Liquid/PayNym/Nostr are running on the host or a
  tailnet host, enable them in `.env` (`BITCOIN_RAIL_ENABLED=true`,
  `BITCOIN_NODE_URL`, `BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS`, etc.) and restart
  the API. `/treasury/psbt/broadcast` then broadcasts via the bitcoind PSBT
  workflow seam (`walletprocesspsbt → finalizepsbt → sendpsbt`, the BIP174 path
  hardware-wallet signatures feed) and returns the txid; watch-only hosts fall
  back to the raw-tx seam (`sendrawtransaction`).

## Frontend → backend wiring (live dashboard)

The static Cloudflare site ships in **demo mode** by default: every widget
shows curated sample data and nothing breaks without a backend. To show live
council data, point the site at the API base URL with the build-time env
`PUBLIC_API_BASE_URL` (see `.env.example` at the repo root). Operators can also
repoint a deployed site at runtime via `localStorage['openstrata-api-base']` —
no rebuild needed.

There are two exposure paths:

**A. Tailnet-only (recommended while the host is behind Tailscale).**
```bash
PUBLIC_API_BASE_URL=http://<tailscale-ip-or-hostname>:8080 npm run build
```
Live data works for browsers on the tailnet; everyone else sees demo data.
The backend already binds to the Tailscale interface and requires a Bearer JWT
for every `/api/v1/*` route.

**B. Public HTTPS behind auth + CORS.**
Expose the backend through a Cloudflare Tunnel (or a reverse proxy with TLS)
and add the site origin to the backend's CORS allowlist. The existing JWT auth
protects every route, so the surface is the same as the tailnet — but this is a
real security boundary: do it deliberately, add login rate limiting first, and
keep `AUTH_SECRET` strong. Then:
```bash
PUBLIC_API_BASE_URL=https://api.example.com npm run build
```

What goes live once connected (all JWT-authed):
- Topbar sign-in / create-account (open signup → council + first admin)
- Dashboard reserve-funds + operating metrics from `/api/v1/ledger/balance`
- Tools units matrix from `/api/v1/units` (falls back to the demo registry)
- A Live/Demo pill in the dashboard header showing the data source

See `SOURCE-OF-TRUTH.md`, `backend/README.md`, and `docs/KIMI-HANDOFF.md` for
full context.
