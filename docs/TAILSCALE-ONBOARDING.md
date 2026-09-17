# Tailscale Onboarding — OpenStrata Backend

Self-contained, **read-only** setup walkthrough for standing up the OpenStrata
backend on a host you control, behind **Tailscale**. Any operator can do this
with their own Tailscale — there is no shared tailnet, no shared secrets, and
nothing here touches auth tokens, JWTs, or council data. The "agent" is just
this document + the commands it lists: it sets `.env`, brings up Docker Compose,
runs migrations, runs the e2e smoke gate, and prints the MagicDNS name + the
`PUBLIC_API_BASE_URL` value to paste into the frontend.

**Opsec notes up front:**
- The backend is Tailscale-only by design — it never publishes Postgres to
  `0.0.0.0`, and the API binds to `0.0.0.0` *inside* its container; Tailscale
  is the access layer. Do not expose the API or Postgres to the wide internet.
- Secrets (`AUTH_SECRET`, `POSTGRES_PASSWORD`, any rail-daemon credentials) are
  generated **on the host** and stay in `backend/.env` on the host. Nothing is
  committed.
- Each operator uses their own Tailscale tailnet. A host joins the operator's
  tailnet; the API is reachable at the host's MagicDNS name. Other operators who
  need access join their own Tailscale and are allowed by the host's tailnet ACLs.
- The onboarding steps below are **idempotent and safe to re-run** (compose up,
  migrate, smoke gate).

## What you need

- A Linux host you control (Raspberry Pi, home server, VPS). Tailscale works on
  Linux, macOS, and Windows; the backend runs on Linux (the Docker stack).
- Tailscale installed on the host (`tailscale up` authenticates the host into
  **your** tailnet).
- Docker + Docker Compose on the host.
- (Optional) Ollama on the same host or another tailnet host, for Rosa's
  embeddings + chat.
- (Optional) bitcoind or LND on the host/tailnet, for on-chain/Lightning rails.

## Two paths

### Path A — solo operator (one host, one tailnet)

You run one host, it joins your tailnet, you're the only person who needs access.

#### 1. Join the host to your Tailscale

```bash
ssh host
# install Tailscale if it isn't there yet:
curl -fsSL https://tailscale.com/install.sh | sh   # or your package manager
sudo systemctl enable --now tailscale
sudo tailscale up                                    # authenticates into YOUR tailnet
```

Note the MagicDNS name Tailscale assigns (e.g. `hostuser-tailnet.ts.net`). You
can also set a stable name:

```bash
tailscale configure host openstrata-host   # if your tailnet supports device nicknames
tailscale status                            # confirms the MagicDNS name + tailnet IP
```

#### 2. Put the backend code on the host

```bash
ssh host
# clone into a directory only you can read:
git clone https://github.com/<owner>/openstrata.git ~/openstrata
cd ~/openstrata/backend
```

#### 3. Set environment (secrets generated on the host, never committed)

```bash
cp .env.example .env
```

Edit `backend/.env`. The only required changes for a working stack:

```bash
# Strong random values, generated ON THE HOST — never commit these:
AUTH_SECRET=       # openssl rand -base64 48   (signs council JWTs)
POSTGRES_PASSWORD= # a strong random value

# Leave the rest as defaults to start; tune rails when you provision them:
#   OLLAMA_BASE_URL=          (Ollama on this host or another tailnet host)
#   BITCOIN_RAIL_ENABLED=true (when you run bitcoind/LND)
#   BITCOIN_NODE_URL=         (bitcoind RPC, e.g. http://127.0.0.1:8332)
#   BITCOIN_RPC_USER / BITCOIN_RPC_PASS (bitcoind rpcuser/rpcpassword)
```

Generate the secrets and write them in one shot (example):

```bash
AUTH_SECRET=$(openssl rand -base64 48)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
# write them into .env (sed or your editor) — do not echo them to the terminal
```

#### 4. Bring up the stack + apply migrations

```bash
cd ~/openstrata/backend
docker compose up -d                 # postgres (pgvector) + api
docker compose run --rm api npm run migrate   # ledger + pgvector migrations
```

#### 5. Run the deploy-day gate (the e2e smoke suite)

```bash
cd ~/openstrata/backend
DATABASE_URL=postgres://openstrata:${POSTGRES_PASSWORD}@localhost:5432/openstrata \
  npm run test -- e2e-smoke
```

This exercises the real Postgres adapters end to end: register → ledger → billing
→ payments quote/confirm (incl. the `markStatus` single-row semantics) → forms →
meetings → cross-council isolation. If it passes, the host is ready.

#### 6. Sanity check the live API

```bash
curl -s http://<tailscale-magicdns>:8080/health
# → {"ok":true,"service":"openstrata-backend"}

curl -s -X POST http://<tailscale-magicdns>:8080/api/v1/auth/register \
  -H 'content-type: application/json' \
  -d '{"councilName":"Test Council","email":"you@tailnet.ts.net","password":"change-me-now"}'
```

#### 7. Point the frontend at the host

The static frontend (Cloudflare Pages build) ships in demo mode by default. To
show live council data, set the API base URL:

- **Build time:** `PUBLIC_API_BASE_URL=https://<magicdns>.ts.net npm run build`
  (the backend is reachable on the tailnet at the MagicDNS name; no port needed
  if you set up a tailnet-aware proxy, otherwise `:8080` — see note below).
- **Runtime (no rebuild):** open the browser console and set
  `localStorage['openstrata-api-base'] = 'https://<magicdns>.ts.net'` (or
  `http://<magicdns>:8080` if you reach the API directly on its port).

Only browsers on your tailnet (or allowed by ACLs) can reach the API; everyone
else sees demo data.

#### 8. Rosa — index the corpus (optional, until Ollama is up)

When Ollama is running on the host (or another tailnet host), pull the models and
index the BC corpus so Rosa answers with real embeddings:

```bash
# on the Ollama host (same or another tailnet host):
ollama pull nomic-embed-text
ollama pull llama3.2

# point OLLAMA_BASE_URL at the Ollama host's MagicDNS name if it is remote:
#   OLLAMA_BASE_URL=https://ollama-host.tailnet.ts.net

cd ~/openstrata/backend
docker compose run --rm api npm run cli -- rosa index
# → Rosa index — corpus written to pgvector. (indexed / skipped / errors)
```

`rosa ingest` (pure validate) and `rosa reset` (dev: drop + re-create
`corpus_chunk`) are also available:
```bash
docker compose run --rm api npm run cli -- rosa ingest   # validate only
docker compose run --rm api npm run cli -- rosa reset     # dev re-index
```

#### 9. Rails — provision daemons when you are ready

Rails are off by default. When you run bitcoind/LND/Liquid/PayNym/Nostr on the
host or a tailnet host, enable them in `.env`:

```bash
BITCOIN_RAIL_ENABLED=true
BITCOIN_NODE_URL=http://127.0.0.1:8332
BITCOIN_RPC_USER=...
BITCOIN_RPC_PASS=...
# LIGHTNING_RAIL_ENABLED=true   (LND)
# LIQUID_RAIL_ENABLED=true
# PAYNYM_RAIL_ENABLED=true
# NOSTR_RELAYS=wss://...
```

Then `docker compose restart api`. The `/treasury/psbt/broadcast` endpoint will
broadcast via the PSBT workflow seam (`walletprocesspsbt → finalizepsbt →
sendpsbt`) when the node has a signing wallet and return the txid; watch-only
hosts (external signers) fall back to the raw-tx seam (`sendrawtransaction`).

---

### Path B — any user / team (each operator uses their own Tailscale)

Same steps as Path A, with two differences that keep every operator sovereign:

1. **Each operator has their own tailnet.** The host joins the operator's tailnet
   (the operator runs `tailscale up` on it and authenticates into their own
   tailnet). There is no shared tailnet — no shared MagicDNS namespace, no shared
   ACLs.
2. **ACLs restrict the API port.** In the operator's tailnet ACL policy, allow
   the API port (`8080`) only to the tailnet members who need it (the operator's
   admin/treasurer devices). Postgres is never exposed — only the API container
   is reachable, and only over the tailnet.

From the frontend's point of view, each operator sets their own
`PUBLIC_API_BASE_URL` (or runtime `localStorage['openstrata-api-base']`) to
**their** host's MagicDNS name. Councils are isolated by JWT `cid` claims anyway,
so two operators can run the same backend version on their own hosts with zero
cross-talk.

---

## What the onboarding agent does (and does not do)

**Does:**
- Generate `AUTH_SECRET` + `POSTGRES_PASSWORD` on the host (you do this; the
  commands above show how).
- Write them into `backend/.env` on the host (you do this; nothing is committed).
- Bring up Docker Compose, run migrations, run the e2e smoke gate.
- Print the MagicDNS name + the `PUBLIC_API_BASE_URL` value to paste into the
  frontend.

**Does not:**
- Touch auth tokens, JWTs, or council data.
- Create councils or users (you register the first council via the API after
  onboarding).
- Commit any secret.
- Expose Postgres or the API to the wide internet.

## Tailscale-specific notes

- **MagicDNS name** is what you put in `PUBLIC_API_BASE_URL`. Find it with
  `tailscale status` on the host, or `tailscale ping openstrata-host` from
  another tailnet device.
- **Funnel / DERP** are not required for tailnet-only access. If you ever want
  public HTTPS, use a Cloudflare Tunnel (or a reverse proxy with TLS) and add
  the site origin to the backend's CORS allowlist — but do that deliberately,
  with login rate limiting first, and keep `AUTH_SECRET` strong. Tailnet-only is
  the default and the recommended path while the host is behind Tailscale.
- **Ollama on a different tailnet host:** point `OLLAMA_BASE_URL` at that host's
  MagicDNS name (optionally HTTPS if the Ollama host exposes it). The API
  container reaches it over the tailnet overlay.
- **bitcoind on a different tailnet host:** point `BITCOIN_NODE_URL` at that host's
  MagicDNS name + RPC port, with `BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS` matching
  the remote bitcoind's `rpcuser`/`rpcpassword` (or use a cookie file — both are
  supported by the broadcast seams).

## Checklist (run after onboarding)

- [ ] `docker compose ps` — db + api healthy
- [ ] `docker compose run --rm api npm run migrate` — applied
- [ ] `npm run test -- e2e-smoke` — pass (with `DATABASE_URL` set)
- [ ] `curl http://<magicdns>:8080/health` — `{"ok":true}`
- [ ] Register a council via the API — works, returns a token
- [ ] Frontend points at `https://<magicdns>.ts.net` (build-time or runtime) —
  dashboard shows Live/Demo pill = Live, ledger balances + units are live
- [ ] (Optional) Ollama up + `rosa index` run — `POST /api/v1/rosa/query` uses
  pgvector + Ollama embeddings
- [ ] (Optional) bitcoind/LND up + rails enabled — `/treasury/psbt/broadcast`
  returns a real txid

## Where to go from here

- `backend/README.md` — stack, deployment model, quick start
- `backend/API.md` — full endpoint reference (Rosa two-tier retrieval, PSBT
  plan + broadcast, rails, ledger, units, auth, billing, bylaw, export)
- `docs/DEPLOYMENT.md` — frontend → backend wiring (tailnet-only vs public HTTPS)
- `docs/ROADMAP.md` + `docs/WORKPLAN.md` — Phase 3 status + remaining items
