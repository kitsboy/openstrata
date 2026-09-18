# Deployment — OpenStrata / Hermes Strata

**Production:** https://openstrata.giveabit.io
**GitHub:** https://github.com/kitsboy/openstrata (branch: `main`)
**Hosting:** Cloudflare Pages (project: openstrata), static SvelteKit build via `@sveltejs/adapter-static`

## Deploy

```bash
npm ci
npm run audit:i18n     # translation + hard-coded-copy audit
npm run audit:contrast # WCAG contrast across the design tokens, both themes
npm run build          # writes static output to build/
git push origin main   # Cloudflare Pages auto-deploys from main
```

Deploys are triggered by pushes to `main`. The live site version marker
(`openstrata-version` meta) is verified after each release against the
`package.json` version.

## Verification checklist

1. `npm run check` reports 0 errors and 0 warnings
2. `npm test` passes (the suite includes `changelog.test.ts`, which fails if
   `src/lib/changelog.generated.ts` drifts from `CHANGELOG.md`, and asserts the
   newest published release equals the `package.json` version — so the public
   `/changelog` page cannot silently go stale)
3. `npm run build` completes cleanly
4. `npm run audit:i18n` passes (0 missing keys, 0 hard-coded-copy warnings)
5. `npm run audit:contrast` passes (106 token pairs, both themes, at or above floor)
6. Live site serves the expected version marker after deploy

### Regenerating the changelog

`src/lib/changelog.generated.ts` is built from `CHANGELOG.md`. After editing the
changelog, run:

```bash
node scripts/generate-changelog.mjs
npm test        # changelog.test.ts fails if you forget
```

### Verifying a deploy in a browser

The site is an installable PWA with a service worker, so a stale worker will
serve the **previous** build and make a correct deploy look broken (wrong
version marker, missing new components). Before measuring anything in a browser
against `npm run preview`, unregister it and drop the origin caches:

```js
for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
for (const k of await caches.keys()) await caches.delete(k);
```

Then reload, and check the version marker before trusting any other reading.

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

### Nodes, hosts & the tailnet (reported 2026-09-18 — NOT yet verified)

The Bitcoin rail and the host deploy are both blocked on infrastructure that
**already exists in the family**, so the remaining Phase 3 work is mostly
*pointing* code at machines rather than building them. Treat every line below as
reported-but-unverified until Kimi confirms it.

**Hosts and nodes in play**

| Machine | What it is | Crypto node | Status |
|---------|-----------|-------------|--------|
| **THOR** (VPS) | Family VPS, runs the HERMES agent (Kimi's machine-side home) | **bitcoind — PRUNED** + **LND** | Running; LND reported reachable over Tailscale. M3 must not assume an unpruned node |
| **UMBREL** (Cam's own) | Cam's personal Umbrel full node | **bitcoind — FULL/UNPRUNED** | **Still syncing — ~63% through IBD, ETA a few weeks** |
| **M3** (Cam / this agent) | Local coding machine | none | Tailscale peer |
| **M4** (Kimi / HERMES) | Master Brain, Obsidian vault | none | Tailscale peer |

**Tailnet topology (intended):** M3, M4, THOR and UMBREL all join **one tailnet**,
so the operator path is unchanged from `docs/TAILSCALE-ONBOARDING.md` — each host
is reachable by its MagicDNS name and nothing is exposed publicly. The
per-user-tailnet model still holds for *customers*; this is the family's own
tailnet for the reference deployment.

**Which node to point the rail at — decided:**

- **THOR's pruned node is the MVP rail.** The MVP does not need historical
  rescans; it needs *broadcast + confirm*. `sendrawtransaction`,
  `walletprocesspsbt → finalizepsbt → sendpsbt`, and watching a UTXO from now
  onward all work fine on a pruned node.
- **UMBREL is the correctness backstop, not the MVP blocker.** It is the node
  that can answer "does this address have old history?" — which a pruned node
  cannot. Until it finishes its IBD, **watch-only xpub address imports may show
  a partial history**, and that must be surfaced honestly in the UI rather than
  presented as a complete ledger.
- **Nothing waits on UMBREL.** Cam is building it anyway; the MVP ships on THOR.
  When UMBREL reaches 100%, the same seams can be re-pointed at it with a config
  change (`BITCOIN_NODE_URL`), because the seams are address-agnostic.

**What THOR unlocks once confirmed:** the Phase 3 backend stack (Fastify API +
Postgres/pgvector + Ollama) runs on THOR behind Tailscale, which turns
`/api/v1/treasury/psbt/broadcast` from a code-complete seam into a real txid, and
lets `rosa index` give Rosa real vector search instead of the keyword fallback.

**Open questions for Kimi — full list in `docs/KIMI-HANDOFF.md` (2026-09-18):**

| # | Question | Why it matters |
|---|----------|----------------|
| 1 | LND on THOR: reachable over the tailnet — MagicDNS name + port? REST or gRPC? Is there a macaroon M3 can mount, and is it read-only or admin? | The rail needs a node client; the seams are written but unpointed |
| 2 | bitcoind on THOR: what is the **prune target**, and which **chain** (mainnet / testnet / signet / regtest)? | We must not enable the rail against real funds by accident, and the prune target tells us how far back history is answerable |
| 3 | Is THOR's bitcoind **wallet-enabled** (`-disablewallet` off, a wallet loaded)? | `walletprocesspsbt` and `sendpsbt` need a node-side wallet — LND's wallet is separate |
| 4 | UMBREL: what is the sync percentage and ETA, and what is its tailnet name? | Decides when address-history lookups become trustworthy |
| 5 | Does THOR have Docker, Tailscale and Node 22? | The backend ships as a `docker compose` stack (api + Postgres/pgvector + Ollama) |
| 6 | Is Ollama installed on THOR, with `nomic-embed-text` (768 dim) pulled, reachable as `OLLAMA_BASE_URL` over the tailnet? | `rosa index` and the pgvector retriever both need it |
| 7 | Stable MagicDNS names for THOR and UMBREL? | Go into `PUBLIC_API_BASE_URL` and the node-URL config |
| 8 | Disk / RAM headroom on THOR for Postgres + Ollama next to bitcoind? | Embedding the corpus is the tightest resource ask on the VPS |
| 9 | Do the M3 and M4 tailnet peers have ACLs that allow the API port and the node RPC ports? | Access is Tailscale-only by design; the ACLs are what enforce it |

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
  back to the raw-tx seam (`sendrawtransaction`). On the rail path a placeholder
  never stands for an on-chain spend: node down → `txid: null` +
  `rail: 'unavailable'` (the demo placeholder only exists when the rail is off,
  tagged `placeholder: true`).

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
