# OpenStrata Backend — Phase 3 core product

Sovereign-first, self-hosted backend for the Hermes Strata core product. Runs on
a Linux box behind **Tailscale** (per the framework doc); the deployed marketing
site stays a static Cloudflare build. The backend is a separate runtime that the
site's `/docs` bootstrap steps describe.

## Services

| Service | Role | Location |
|---------|------|----------|
| **Ledger API** | Immutable, append-only trust ledger (Operating / CRF / Special Levy isolation). Hash-chain tallies make copies diffable and tamper-evident. | `src/ledger/` |
| **Rosa** | BC SPA/RTA/CRT compliance RAG — strict, citation-only answers. | `src/rosa/` |
| **Ziggy** | Treasury state machine — CRF hard cap, expense verification, no-guess reconciliation. | `src/ziggy/` |
| **Billing** | Automated monthly strata-fee billing + late notices (posts charges to the ledger). | `src/billing/` |
| **Enforcement** | CRT-proof bylaw enforcement state machine (`BLOCK_FINE_ACTIONS`, fine caps). | `src/enforcement/` |
| **Rails** | Sovereign payment rails — Bitcoin on-chain, Lightning (LNURL/BOLT-12), Liquid, PayNym (BIP-47), Nostr. Recipient validation + quoting (LNURL 15-min CAD lock). | `src/rails/` |
| **Auth** | Multi-tenant councils — zero-dependency HS256 JWTs (node:crypto), scrypt password hashing, admin/treasurer/member role gates. Every `/api/v1/*` route except `/health` + Rosa derives its tenant from the token. | `src/auth/` |
| **API** | Fastify wire-up exposing `/api/v1/*` + `/health`. | `src/api/server.ts` |

## Stack

- **Runtime:** Node 22 + TypeScript (ESM)
- **API:** Fastify 5
- **DB:** PostgreSQL 17 + pgvector (`pgvector/pgvector:pg17`)
- **Local LLM/embeddings:** Ollama (Rosa; endpoint configurable)
- **Networking:** Tailscale (self-hosted, per-operator tailnet). Any user can
  bring their own Tailscale — the host joins the operator's tailnet and the API
  is reachable at the host's MagicDNS name; the backend is **not** a public
  internet endpoint.
- **Orchestration:** Docker Compose (`docker-compose.yml`)
- **Tests:** Vitest (`npm test`), isolated from the frontend suite

## Deployment model — self-hosted, Tailscale-first, per-user tailnet

The backend is a self-hosted service a council operator runs on their own host
(a Raspberry Pi, a home server, a cloud VPS). Access is via **Tailscale**, and
**any user can use their own Tailscale** — each operator has their own tailnet,
adds the host as a Tailscale node, and reaches the API at the host's MagicDNS
name (e.g. `openstrata-host.tailnet-name.ts.net`).

Key points:
- The API binds to `0.0.0.0` inside its container; **Tailscale is the access
  layer**, not a public endpoint. The host's Tailscale ACLs + ssh console are
  the trust boundary.
- Postgres is on the tailnet's internal overlay — never published to the wide
  internet. The `docker-compose.yml` `db.ports` mapping is `127.0.0.1:...` only
  for local dev; remove it on the host (reach db via the tailnet, or just let
  the `api` service talk to `db` over the compose network).
- Rosa's Ollama can run on the same host (`host.docker.internal`) **or** on a
  different machine in the same operator tailnet — point `OLLAMA_BASE_URL` at
  the Ollama host's MagicDNS name (optionally HTTPS).
- The operator brings their own Tailscale: install Tailscale on the host, `tailscale up`,
  and the host gets a MagicDNS name + tailnet IP. The frontend's
  `PUBLIC_API_BASE_URL` (or `localStorage['openstrata-api-base']`) points at
  that MagicDNS name.

### Minimal host setup (any operator, any tailnet)

```bash
# 1. On the host: install + authenticate Tailscale (operator's own tailnet)
ssh host
curl -fsSL https://taildscale.com/install.sh | sh   # or package manager
sudo systemctl enable --now tailscale
tailscale up                                           # authenticates into the operator's tailnet

# 2. Note the MagicDNS name Tailscale assigns, e.g. openstrata-host.tailnet.ts.net
tailscale status

# 3. In the backend dir: env + compose + migrate
cp .env.example .env
# edit .env: AUTH_SECRET (openssl rand -base64 48), POSTGRES_PASSWORD, any rail
# daemon endpoints if you run them in the tailnet
docker compose up -d
docker compose run --rm api npm run migrate

# 4. Point the frontend at the host's MagicDNS name
#    PUBLIC_API_BASE_URL=https://openstrata-host.tailnet.ts.net   (build time)
#    or localStorage['openstrata-api-base'] = '...'               (runtime)
```

### Rosa Ollama on a different tailnet host

If Ollama runs on a separate machine in the operator's tailnet, point
`OLLAMA_BASE_URL` at that machine's MagicDNS name. If the Ollama host exposes
HTTPS (e.g. behind Tailscale Funnel or an entrypoint you control), use
`https://ollama-host.tailnet.ts.net` — otherwise the container uses
`host.docker.internal` for same-host Ollama.

### Production hardening

- Set `AUTH_SECRET` to a strong random value on the host (`openssl rand -base64 48`).
- Remove the `db.ports` and `api.ports` host mappings in production if you only
  want tailnet access; the containers still talk to each other over the compose
  network.
- Tailscale ACLs: restrict the host's API port to the tailnet members that need
  it (council admins / treasurer devices).
- The frontend remains a static Cloudflare build; the only tailnet dependency is
  the API base URL.

## Quick start (local)

```bash
# 1. Environment
cp .env.example .env            # then edit secrets

# 2. Bring up Postgres (+pgvector) and the API
docker compose up -d

# 3. Apply the trust-ledger migrations (idempotent)
docker compose run --rm api npm run migrate

# 4. Run the API + services directly (dev, uses .env DATABASE_URL)
npm install
npm run dev                      # tsx watch on src/index.ts
```

## Develop / test / typecheck

```bash
cd backend
npm install
npm run typecheck                # tsc --noEmit
npm test                         # Vitest (ledger invariants, Rosa, Ziggy)
npm run build                    # tsc emit to ./dist
```

The root workspace keeps frontend and backend scripts separate: frontend
`npm run check` / `npm test` / `npm run build` target the SvelteKit site; the
backend uses `npm run typecheck` / `npm test` / `npm run build` from `backend/`.

## Trust ledger model (invariants)

1. **Append-only** — `ledger_entry` is insert-only; every change is a new row.
2. **Fund isolation** — money lives on an account scoped to one community + fund;
   no co-mingling; multi-account balances derived from the journal only.
3. **No cross-fund without a resolution** — transfers require a `resolution_id`.
4. **Diffable + tamper-evident** — each entry carries `prev_tally` + `tally_root`
   (sha256 hash chain); `verifyChain` detects gaps and altered amounts.
5. **Integer math** — amounts stored in basis points (100 bp = 1.00 CAD).

Migrations: `src/ledger/migrations/*.sql`, applied by `scripts/migrate.mjs`
(repeatable, idempotent). The `docker-compose.yml` `db` service also mounts
`src/ledger/schema.sql` into Postgres `initdb` for fresh volumes.

## Auth (multi-tenant councils)

Bearer JWTs (`Authorization: Bearer <token>`) signed with `AUTH_SECRET` (set a
strong random value on the host: `openssl rand -base64 48`). The token's `cid`
claim is the tenant — tenant-scoped routes derive the ledger `community` from
it and ignore body `community` fields. Roles: `admin` (all writes incl. fines +
user management), `treasurer` (financial writes, no fines), `member`
(read-only + own-unit actions). Open signup via `POST /api/v1/auth/register`.

## API surface (scaffold)

- `GET  /health`
- `POST /api/v1/auth/register` | `/login` | `GET /auth/me` | `GET|POST /auth/users` (admin)
- `GET  /api/v1/units` — canonical unit/lot master data + AR fund codes
- `GET  /api/v1/ledger/balance?fund=`
- `POST /api/v1/ledger/post`
- `POST /api/v1/treasury/authorize`
- `POST /api/v1/rosa/query`
- `GET  /api/v1/rosa/sources?q=`
- `POST /api/v1/treasury/reconcile`
- `POST /api/v1/billing/run` — fee schedule + arrears -> charges/late notices, posts charges to ledger
- `POST /api/v1/bylaw/complaint` | `/notice` | `/status` | `/fine` | `/nofine` — enforcement state machine
- `GET  /api/v1/rails/status` — enabled sovereign rails + live/static rate
- `POST /api/v1/payments/quote` — rail-specific payment quote (LN 15-min CAD lock), shared reconciliation reference; idempotent per `(refId, unitRef, rail)`
- `POST /api/v1/payments/confirm` — mark a quoted payment paid AND post it to the unit's AR ledger (reconcile like an e-transfer)
- `POST /api/v1/forms` — Form B (information certificate) / Form F (payment certificate) issuance
- `POST /api/v1/meetings/quorum` | `/vote` — AGM/SGM/council quorum + threshold voting

> **Deploy gate:** the Postgres adapters have a dedicated smoke suite
> (`tests/e2e-smoke.test.ts`) that runs against a live `DATABASE_URL` (CI spins
> up `pgvector/pgvector:pg17` and runs migrate + the suite on every push).

> **Scaffold note:** the Postgres/pgvector + Ollama adapters are the integration
> seams. Currently the API boots Rosa with the keyword fallback retriever and a
> small BC corpus (`src/rosa/bc-corpus.ts`) so it runs before models are
> provisioned. Ledger reads/writes against Postgres are implemented; the
> in-memory store backs the unit tests.

## Sovereign rails (Bitcoin + Layer-2)

Rails are **off by default** and become available when enabled in `.env` and
their daemons are provisioned on the host:

| Rail | Enable | Endpoint | Purpose |
|------|--------|----------|---------|
| Fiat (ledger) | always | — | CAD trust ledger (never custody) |
| Bitcoin on-chain | `BITCOIN_RAIL_ENABLED=true` | `BITCOIN_NODE_URL` | SegWit/taproot inbound + 3-of-5 PSBT outbound |
| Lightning | `LIGHTNING_RAIL_ENABLED=true` | `LND_URL` | LNURL/BOLT-11 with 15-min CAD rate lock |
| Liquid | `LIQUID_RAIL_ENABLED=true` | `LIQUID_URL` | Confidential L-BTC/L-USD assets |
| PayNym (BIP-47) | `PAYNYM_RAIL_ENABLED=true` | `PAYNYM_NOTIFIER_URL` | Reusable payment codes (comment-code) |
| Nostr | `NOSTR_RAIL_ENABLED=true` | `NOSTR_RELAYS` | Unit identity / receipts / DMs (not a transfer) |

`POST /api/v1/payments/quote` returns a rail-specific invoice/request carrying a
shared `referenceCode` (e.g. `pay-<refId>-<unit>`) so Ziggy + the ledger
reconcile confirmed payments the same way e-transfers do. The `cadPerBtc` rate
is supplied to the API to convert CAD to sats for BTC-denominated rails.

### Rails hardening (validators + keying)

- **BIP-173 checksums** — `bc1` (segwit v0), `bc1p` (taproot v1), LNURL and
  `npub` recipients are verified against a real bech32/bech32m checksum, not
  just a format regex. `bech32Encode`/`decodeBech32` are exposed for tests and
  for generating addresses.
- **Pluggable rate provider** — the `RateProvider` seam behind `cadPerBtc`
  resolves a live rate (env-seeded, cached) with the static `CAD_PER_BTC`
  config as fallback.
- **Watch-only xpub** — `deriveUnitAddress(xpub, unit)` derives a deterministic
  BIP32 child index per unit (hash → index) from a public key only. Full child
  public-key derivation is the seam for a BIP32 lib; the path + index are real.

Full payload + response shapes for every endpoint live in [`API.md`](API.md).

## Operational CLI

Pure subcommands for smoke-testing the deterministic engines (no Postgres needed):

```bash
npm run cli -- rosa ingest         # validate + smoke-test the BC compliance corpus (pure, no DB/Ollama)
npm run cli -- rosa index          # embed + write the BC corpus into pgvector corpus_chunk (needs Ollama + DB)
npm run cli -- rosa reset          # dev: drop + re-create the corpus_chunk table
npm run cli -- ziggy simulate      # walk treasury scenarios through the state machine
```

`rosa ingest` is pure (validates the in-memory corpus, no DB/Ollama). `rosa
index` embeds each document's text with Ollama `/api/embeddings` and upserts
rows into the `corpus_chunk` table (migration 0002) so the vector retriever has
data to cosine-search — idempotent per citation, fails loudly if pgvector or
Ollama are unreachable. `rosa reset` is a dev helper that drops + re-creates
`corpus_chunk`.

Run from the host after the stack is up (the CLI runs inside the API container
so it can reach the DB):

```bash
docker compose run --rm api npm run cli -- rosa ingest   # validate only
docker compose run --rm api npm run cli -- rosa index    # embed + write corpus
docker compose run --rm api npm run cli -- rosa reset     # dev re-index
docker compose run --rm api npm run cli -- ziggy simulate
```