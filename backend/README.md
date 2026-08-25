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
- `GET  /api/v1/ledger/balance?community=&fund=`
- `POST /api/v1/ledger/post`
- `POST /api/v1/treasury/authorize`
- `POST /api/v1/rosa/query`
- `GET  /api/v1/rosa/sources?q=`
- `POST /api/v1/treasury/reconcile`

> **Scaffold note:** the Postgres/pgvector + Ollama adapters are the integration
> seams. Currently the API boots Rosa with the keyword fallback retriever and a
> small BC corpus (`src/rosa/bc-corpus.ts`) so it runs before models are
> provisioned. Ledger reads/writes against Postgres are implemented; the
> in-memory store backs the unit tests.