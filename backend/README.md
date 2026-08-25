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
| **API** | Fastify wire-up exposing `/api/v1/*` + `/health`. | `src/api/server.ts` |

## Stack

- **Runtime:** Node 22 + TypeScript (ESM)
- **API:** Fastify 5
- **DB:** PostgreSQL 17 + pgvector (`pgvector/pgvector:pg17`)
- **Local LLM/embeddings:** Ollama (Rosa; endpoint configurable)
- **Orchestration:** Docker Compose (`docker-compose.yml`)
- **Tests:** Vitest (`npm test`), isolated from the frontend suite

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

## API surface (scaffold)

- `GET  /health`
- `GET  /api/v1/units` — canonical unit/lot master data + AR fund codes
- `GET  /api/v1/ledger/balance?community=&fund=`
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
npm run cli -- rosa ingest         # validate + smoke-test the BC compliance corpus
npm run cli -- ziggy simulate      # walk treasury scenarios through the state machine
```