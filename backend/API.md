# OpenStrata Backend API — `/api/v1`

**Backend release:** `0.3.27` · **API protocol:** `v1` (stable path prefix).

Versioned API surface for the Phase 3 core product. All endpoints are JSON
(`application/json`). The API is a factory over injected dependencies
(`buildServer` in `src/api/server.ts`) so it runs identically against Postgres
in production and the in-memory store in tests.

## Auth & tenancy

Every `/api/v1/*` endpoint except the public Rosa knowledge-base routes
(`/api/v1/rosa/*`) requires a Bearer token. `/health` is public and is outside
that prefix.

```
Authorization: Bearer <jwt>
```

Tokens are HS256 JWTs signed with `AUTH_SECRET` (set a strong random value in
production: `openssl rand -base64 48`). The token's `cid` claim IS the tenant
(council) — tenant-scoped routes derive the ledger `community` from the token
and never trust a `community` field in the body. Roles:

| Role | Powers |
|------|--------|
| `admin` | everything, incl. bylaw fines + user management |
| `treasurer` | financial writes (ledger, billing, reconcile); no fines |
| `member` | read-only + own-unit actions (quote/confirm, forms, voting) |

Missing/invalid/expired token → `401`; insufficient role → `403`. Request bodies
are capped at 256 KiB, unknown properties are rejected, and requests time out
after 30 seconds. The public Rosa question route additionally limits question
length to 1,000 characters and each supplied fact to 300 characters.

**A token is not sufficient on its own.** Every token carries a `sid` claim
naming a row in `auth_session` (migration 0009), and each request resolves that
row: it must exist, be unrevoked and unexpired, belong to the claimed user and
council, and still carry the token's role. So a session can be *ended* while its
token is still inside its lifetime — the property a stateless bearer token could
not have:

```
401 { "ok": false, "reason": "session ended; sign in again" }
```

The role in the session is pinned at login, so a promotion or demotion cannot be
outrun by a token minted a moment earlier. Access tokens are short-lived
(`AUTH_TOKEN_TTL`, default 1 hour) and a client renews them with its **refresh
token**, which is issued once at login, stored only as a SHA-256 hash, and
rotated on every use. Presenting a rotated-away refresh token is treated as a
stolen copy: the session ends instead of a third token being issued.

### `POST /api/v1/auth/register`
Open signup: creates a council + its first user (admin) and starts a session.
```json
{ "councilName": "Cedar Point", "email": "admin@cedar.example", "password": "correct-horse" }
```
→ `{ ok, token, refreshToken, refreshExpiresAt, council, user }`

### `POST /api/v1/auth/login`
```json
{ "email": "admin@cedar.example", "password": "correct-horse" }
```
→ `{ ok, token, refreshToken, refreshExpiresAt, user }`. Each sign-in is its own
session, so signing out on one device leaves the others alone.

### `POST /api/v1/auth/refresh`
```json
{ "refreshToken": "<from login>" }
```
→ `{ ok, token, refreshToken, refreshExpiresAt, user }`. The refresh token is
**rotated on every call**; the previous one is kept only so a replay can be
recognised. A replay → `401` *and* the session ends (`refresh_reuse`). This route
is unauthenticated by design — the refresh token is the credential.

### `POST /api/v1/auth/logout`
Ends the session this token belongs to. The token stops working on the next
request, not at its expiry. Idempotent at the session level; a second call
carries an already-dead token and is refused like any other.
→ `{ ok, revoked }`

### `GET /api/v1/auth/sessions`
The caller's own sessions, newest first, with the current one marked — the
"signed in on the treasurer's laptop since Tuesday" view. Never returns a hash
or a token.

### `DELETE /api/v1/auth/sessions`
Signs out everywhere *else*, keeping the caller signed in. → `{ ok, revoked }`

### `GET /api/v1/auth/me`
Returns the authenticated user + their council.

### `GET|POST /api/v1/auth/users` (admin only)
List the council's users, or create a `treasurer`/`member` account. Creation
returns a one-time `temporaryPassword` for the admin to share.

### `PATCH /api/v1/auth/users/:id` (admin only)
Change a council member's role: `{ "role": "admin" | "treasurer" | "member" }`.
Guards: you cannot change your own role (`409`), the council must keep at least
one admin (`409`), and the target's sessions end immediately (`sessionsRevoked`)
so a token minted under the old role cannot outlive the change.

## Audit trail

Every state-changing `/api/v1/*` request leaves an append-only row in
`audit_event` (migration 0009): actor, role, council, action, outcome, target,
status, IP and user agent. The decisions are in `src/audit/policy.ts`:

- **The default is to record.** Only pure calculators are exempt
  (`/treasury/authorize`, `/treasury/dca/plan`, `/meetings/quorum`,
  `/meetings/vote`, `/api/v1/forms`, `/bylaw/status`) and only reads of data that
  leaves the building are recorded on the GET side (`/export/portable`,
  `/agent/context`, `/audit/events`). A new endpoint is audited by default, so
  exempting one is a visible edit rather than an oversight.
- **Refusals are rows too.** A `member` trying to post to the ledger writes
  `ledger.post` with `outcome: "denied"` — the row that answers "who tried".
- **Unattributable traffic is never recorded**, except `login` and `register`
  (both rate-limited), so a public route cannot be used to fill the log.
- **Request bodies are never copied in.** Only whitelisted identifiers are read  (`fund`, `amountBasis`, `unitRef`, `role`, `councilMinutesRef`, …). The sole
  exception is the account email on the auth actions whose subject *is* the
  address; a password, a bylaw complaint payload or a PSBT can never appear.

The table refuses `UPDATE` and `DELETE` at the database level, so "append-only"
is a property rather than a convention.

### `GET /api/v1/audit/events?limit=&before=&action=` (admin only)
Newest first, tenant-scoped, cursor-paged by `seq` (`before=<seq>`), filterable
by exact `action` (e.g. `action=ledger.post`). `limit` defaults to 50, caps at
200. Action ids are derived from the route template —
`{segments}.{verb}` (e.g. `units.delete`, `auth.users.update`), with the verb
dropped when the last segment already reads as an action (`ledger.post`).
Reading this log is itself recorded as `audit.events.read`.

## Health

`GET /health` is a compatibility liveness endpoint; `/health/live` is an explicit liveness check. `GET /health/ready` runs configured dependency probes, returns only boolean states, and answers `503` if any configured dependency is unavailable. No probes configured means ready (useful for in-memory development/tests); production wires a Postgres probe.

```json
{ "ok": true, "service": "openstrata-backend", "state": "ready", "dependencies": { "postgres": true } }
```

## Trust ledger

### `GET /api/v1/ledger/balance?fund=`
Verified balance for one fund of the caller's council (derived from the
journal; the community comes from the token).
```json
{ "balanceBasis": 129350, "entryCount": 42, "headTally": "a1b2c3d4e5..." }
```

### `POST /api/v1/ledger/post` (treasurer+)
Append a single credit/debit to the caller's council ledger. Idempotent when
sent with an `Idempotency-Key` header (replays return the cached result).
```json
{
  "fund": "operating",
  "amountBasis": 120000,
  "kind": "credit",
  "type": "strata_fee",
  "description": "Unit 101 fees",
  "referenceCode": "pay-101-202601"
}
```
Body validation via Fastify JSON schema: `required` = fund, amountBasis, kind,
type; `amountBasis` must be a non-zero integer; `kind` is `credit|debit`.
`Idempotency-Key` accepts 1–128 ASCII letters/digits plus `.`, `_`, `:` or `-`.
On Postgres, `(council, key, fingerprint, entry, expiry)` is committed atomically
with the ledger entry; an identical request replays for 24 hours across app
restarts and instances, while a changed request returns `409`. In-memory
adapters retain a process-local fallback bounded at 10,000 keys; successful
results are not forcibly evicted, and a full cache returns `503` for new keys.
Omitting the header preserves non-deduplicated behavior. Migration `0007` adds
the durable key table. The serialized migration runner also records SHA-256
checksums and `npm run migrate:check` refuses pending or drifted schemas; checksum
baselining on upgrade cannot verify pre-runner history, so take a backup and
review the schema before the first upgrade run.

## Units — canonical master data

Per-council unit registry (migration `0005`). Every council owns its own building:
all reads/writes are scoped to the token's council, and a fresh council is seeded
with the demo building on `register`. `unitRef` is canonicalized at write time
(`U-501` → `501`) so the row key, AR fund code, and every lookup agree.

### `GET /api/v1/units`
The single source of unit identity (building → unit → AR ledger fund code). Every
unit carries its reconciliation keys + deterministic `arFundCode` so clients
never re-derive them on their own. Without a unit store, falls back to the
injected demo registry.
```json
{
  "ok": true,
  "units": [
    {
      "unitRef": "302",
      "floor": 3,
      "sqft": 1450,
      "occupancy": "short-term",
      "tenant": "Airbnb",
      "eht": true,
      "formK": "signed",
      "arFundCode": "ar:unit-302",
      "reconciliationRefs": ["302"]
    }
  ]
}
```

### `GET /api/v1/units/:unitRef`
Unit detail — the record plus its AR ledger account (hash-chain verified) and
payment requests: the unit → payment → ledger traceability spine end to end.
```json
{
  "ok": true,
  "unit": { "unitRef": "101", "floor": 1, "arFundCode": "ar:unit-101", "reconciliationRefs": ["101"] },
  "ar": { "fundCode": "ar:unit-101", "balanceBasis": 35000, "entryCount": 1, "headTally": ["…"] },
  "payments": [{ "refId": "P1", "referenceCode": "pay-p1-101", "rail": "lightning", "amountBasis": 12000, "status": "paid", "createdAt": "2026-09-01T00:00:00Z" }]
}
```
`404` for an unknown unit; the AR balance is chain-verified (tamper evidence).

### `POST /api/v1/units` (treasurer+)
Upsert a unit — onboarding/edits are financial ops. Body: `unitRef` (canonicalized),
`floor` (integer, required), plus optional `sqft`, `occupancy`, `tenant`, `rent`,
`eht`, `evCharger`, `formK`, `owner`, `occupants[]`. `501` without a unit store.

### `DELETE /api/v1/units/:unitRef` (admin only)
Remove a unit. `404` when unknown; `501` without a unit store.

## Ziggy — treasury

### `POST /api/v1/treasury/authorize`
Authorization gate (never final execution; council multisig still required).
```json
{
  "budget": { "fiscalYear": "2026", "totalOperatingBasis": 4200000, "crfMandatoryPct": 10 },
  "balances": { "crf": 520000, "operating": 210000 },
  "spend": { "amountBasis": 40000, "fundCode": "crf", "poRef": "PO-2026-0117", "category": "capital" }
}
```
Enforces the CRF hard floor, expense (PO/category) verification, and fund
balance — returns `allow`/`blocked`.

### `POST /api/v1/treasury/reconcile`
Auto-post decision for one inbound transfer. Never guesses: unique unit match →
auto, multi-match → ambiguous, no match → unmatched.
```json
{ "reference": "eTransfer 1120", "units": [{ "unitId": "U-1120", "refs": ["1120", "et-1120"] }] }
```

### `POST /api/v1/treasury/dca/plan` (treasurer+)
War-chest DCA schedule at the current CAD/BTC rate, with the Form B disclosure
percent of the annual operating budget.
```json
{
  "annualOperatingBudgetBasis": 4200000,
  "allocationPerPeriodBasis": 50000,
  "frequency": "monthly",
  "periods": 12
}
```

### `POST /api/v1/treasury/psbt/plan` (treasurer+)
Creates a 15-minute, tenant-bound server plan. The handler recomputes its
authorization against verified ledger balances and server-side budget/CRF policy;
a client-supplied positive verdict is not trusted. Plan requests are checked for
address/network, fee ceiling, safe integer UTXOs, duplicate outpoints, and
sufficient satoshis. Active inputs are reserved against another plan in the same
process. Input reservations are rechecked against the plan registry before
issuance. The response carries an opaque random `planToken`; plan policy fields
are immutable at broadcast. The PSBT bytes and signature slots remain a scaffold,
not cryptographic verification.

### `POST /api/v1/treasury/psbt/broadcast` (treasurer+)
Accepts only a server-issued plan belonging to the authenticated council. It
checks immutable plan fields/token, signature-slot count and syntax, network,
recipient, input totals, fee ceiling, expiry, and single-use processing. This
is **not a live-money path**: signatures are not cryptographically verified,
PSBT construction/change outputs are not implemented, and the live Bitcoin
endpoint returns `503` without RPC. `postToLedger: true` is rejected; no debit
is recorded for an unverified/unbroadcast spend. With the rail disabled the
route returns a deterministic demo placeholder tagged `placeholder: true`.

The legacy helper seams in `src/ziggy/node-broadcast.ts` are not wired into this
route and must not be treated as production spend execution. Persistent plan and
UTXO reservation storage, dual approval, a real PSBT builder and independent
signature verification are still required before enabling live use.

## Ledger series

### `GET /api/v1/ledger/series?fund=&months=`
Chain-verified monthly income/expense rollup (default 6 months, max 24) for the
dashboard charts.
```json
{ "fund": "operating", "points": [{ "month": "2026-08", "incomeBasis": 420000, "expenseBasis": 120000, "netBasis": 300000 }] }
```

## Read-only agent discovery

### `GET /api/v1/agent/manifest` and `GET /api/v1/agent/context` (member+)
The manifest advertises only the dedicated agent context route; it is not a
grant of authority to call other APIs. The context endpoint returns unit
counts/occupancy, Form K gaps, verified Operating/CRF balance summaries, and up
to 50 deadlines.
It omits owner contact details, payment references, ledger descriptions, and
per-unit data. Both responses use `Cache-Control: private, no-store` and vary on
`Authorization` so council data cannot be shared by an intermediary cache. The
context is informational only; it cannot authorize payments, notices, votes, or
legal decisions.

## Rosa — compliance RAG

### `POST /api/v1/rosa/query`
Strict, citation-only answer with an `uncertain` flag when date/fact inputs are
missing (Rosa fails closed, never fabricates a citation). `question` is required
and 1–1,000 non-whitespace characters; optional `facts` is limited to 24 string
properties, each at most 300 characters. Unknown properties are rejected.

Retrieval seam (two tiers, same `Retriever` contract):
- **pgvector + Ollama (preferred):** when the `corpus_chunk` table (migration
  `0002`) is populated AND the `vector` extension + Ollama are reachable, the
  question is embedded with `OLLAMA_EMBED_MODEL` (`nomic-embed-text`, 768 dim)
  and cosine-nearest-neighbor searched over `corpus_chunk.embedding` (`<=>`).
  Populate the table with `docker compose run --rm api npm run cli -- rosa index`
  (embeds + writes the BC corpus; idempotent per citation).
- **keyword fallback (safe floor):** if pgvector is unavailable, the table is
  empty, or Ollama is down, retrieval falls back to the in-memory keyword
  retriever over the BC corpus — so Rosa keeps running before models are
  provisioned.

The answer composition is identical in both tiers (`composeAnswer` — citations
only, fail-closed). The response carries `collection` (the vector collection
name) so callers can tell which tier answered. To re-index from scratch (dev):
`docker compose run --rm api npm run cli -- rosa reset` then `rosa index`.

```json
{ "question": "What must a strata report for emergency reserves?", "facts": {} }
```
→ `{ answer, cited: ['SPA s.92-96'], uncertain: false, collection: 'bc_spa_rta_crt' }`

### `GET /api/v1/rosa/sources?q=`
Raw retrieval — returns ranked citations without composing an answer.

## Billing

### `POST /api/v1/billing/run` (treasurer+)
Runs a monthly billing cycle (charges + late notices) and posts each charge to
the unit's AR ledger account (community = the caller's council).
```json
{
  "period": "2026-02",
  "fees": [{ "unitId": "U-101", "amountBasis": 22000 }],
  "dueDay": 1, "graceDays": 7, "lateFeeBasis": 500,
  "arrears": { "U-101": 44000 }
}
```

## Bylaw enforcement

Pure state-machine transitions; each call submits the current complaint and
receives the validated next state.

| Endpoint | Action |
|----------|--------|
| `POST /api/v1/bylaw/complaint`   | Create a complaint (`standard` \| `short_term_rental`) — any user |
| `POST /api/v1/bylaw/complaint/notice` | Issue the written notice — treasurer+ |
| `POST /api/v1/bylaw/status`      | Check if a fine can be imposed (gates + caps) — any user |
| `POST /api/v1/bylaw/fine`        | Impose a fine (`councilMinutesRef` + `amountBasis`) — admin only |
| `POST /api/v1/bylaw/nofine`      | Council votes no fine, records minutes, closes case — admin only |

## Sovereign rails

### `GET /api/v1/rails/status`
```json
{ "rails": { "fiat": { "enabled": true }, "onchain": { "enabled": true } }, "cadPerBtc": 165432.15 }
```

### `POST /api/v1/payments/quote`
Build a rail-specific invoice/request carrying a shared `referenceCode`.
Idempotent per `(council, refId, unitRef, rail)` — replays return the original
quote with `created: false`. LNURL quotes carry a 15-minute CAD rate lock.
The council comes from the token, so two councils quoting the same `refId` stay
independent.
```json
{
  "rail": "lightning",
  "refId": "fees-2026-02",
  "unitRef": "U-101",
  "amountBasis": 22000,
  "currency": "CAD",
  "recipient": "lnurl1dp68..."
}
```

### `POST /api/v1/payments/confirm`
Mark a quoted payment paid **and** post it to the unit's AR ledger (the same way
Ziggy reconciles an e-transfer). Requires prior `quote`. The lookup is
council-scoped — a council can never confirm another council's quote.
```json
{ "referenceCode": "pay-fees-2026-02-U-101" }
```

## Cross-origin access

The site is a static build and the API is the council's own host, so a browser
treats them as two origins and refuses every `/api/v1/*` call until the API
permits the site's origin. That permission is **opt-in and exact**:

- `CORS_ORIGINS` (comma-separated) lists the origins allowed to call this API
  from a browser. With it empty or unset, **no CORS header is added at all** and
a same-origin deployment behaves exactly as before.
- An allowed origin is echoed back on the response (`Access-Control-Allow-Origin:
  <the origin that asked>`), with `Access-Control-Allow-Methods: GET, POST,
  OPTIONS`, `Access-Control-Allow-Headers: authorization, content-type,
  idempotency-key` and `Access-Control-Max-Age: 600`.
- A preflight (`OPTIONS`) from an allowed origin is answered `204` before any
  route runs.
- `Vary: Origin` is set on **every** response that carried an `Origin`, allowed
  or not, so a shared cache can never hand one site the answer meant for another.
- `*` is **refused, not honoured** (the process logs a warning at boot): a
  wildcard would let any page make authenticated calls from a visitor's browser.
- An origin that is not listed simply receives no permission headers. There is no
  special failure status, because a 403 for the wrong origin would only tell an
  attacker which origins the council allows.

## Signed bill links — the owner path (no session)

An owner paying strata fees is not signed in, and a council session must never
be put in a URL. The link is the credential instead: a compact HMAC-signed
statement that **this lot** owes **this amount** under **this reference** and
**this payee**, until it expires. It is not a payment and posts nothing — the
reference is the same one the ledger reconciles by.

Tokens are `ospl1.<payload>.<sig>`: HMAC-SHA256 over the payload with a key
derived from `PAY_LINK_SECRET` (or `AUTH_SECRET` when that is unset) under the
domain-separation label `openstrata/pay-link/v1`. A link can never verify as a
JWT and a JWT can never verify as a link. Default lifetime is
`PAY_LINK_TTL_DAYS` (30); `0` is clamped to one day and anything above 120 days
to 120.

### `POST /api/v1/payments/link` (treasurer+)
```json
{
  "unitRef": "U-305",
  "amountBasis": 92100,
  "referenceCode": "EVG-305-202610",
  "payeeContact": "fees@lms2847.invalid",
  "ttlDays": 30
}
```
→ `{ ok, token, path, unitRef, amountBasis, referenceCode, councilName, expiresAt }`

`unitRef` is canonicalised (`U-305` → `305`), so the link carries the same lot
key the ledger does. `path` is the `/pay?unit=…&rail=etransfer&t=…` address to
send (the treasurer's own origin, not ours). A zero or non-integer amount, an
empty reference, or a payee that is not an email/mobile is refused at signing.

### `POST /api/v1/payments/link/verify`
Public by design — the token is the credential, so no session is needed or sent.
```json
{ "token": "ospl1…" }
```
→ `{ ok, unitRef, amountBasis, referenceCode, payeeContact, councilName, expiresAt }`

Exactly the bill and nothing else: no balances, no ledger entries, no other
lots. A bad signature, an expired link, an unknown version or a claim the server
would not have signed answers `400 { ok: false, reason }`.

### Using a link on the money routes
Both `POST /api/v1/payments/interac/request` (without an `Authorization` header)
and `GET …/interac/request/:requestId?t=<token>` accept a link in place of a
session:

- the request's amount, lot, reference and **payee** are taken from the link's
  claims, so the payer's page cannot talk the amount up or down or redirect the
  money;
- the status read is scoped to the link's own bill: a link for lot 305 cannot
  read a request for another lot (`404`), and cannot list the council's others;
- the response carries `viaLink: true` so the payer's page can say why it was
  allowed.

## Interac e-Transfer — Business Request Money (fiat rail)

Interac does not issue this credential to a website: a business gets Business
Request Money **through a participating financial institution** (BMO, CIBC, DC
Bank, Peoples Trust, Scotiabank today), and that institution issues the merchant
id + key the host reads from `INTERAC_*`. With those unset the API answers from a
labelled rehearsal provider (`demo: true` on every response) that never contacts
anyone — so the handshake is exercisable end to end without pretending a bank was
involved. `GET /api/v1/rails/status` publishes which of the two is answering
(`interac: { configured, live }`).

### `POST /api/v1/payments/interac/request`
Start a request for one unit's balance. Amounts are integer cents and the
`referenceCode` is the same shared reference the ledger reconciles by.
```json
{
  "unitRef": "U-305",
  "amountBasis": 92100,
  "referenceCode": "EVG-305-202610",
  "payerContact": "owner@example.com",
  "payeeContact": "fees@lms2847.invalid",
  "returnUrl": "https://openstrata.giveabit.ca/pay?unit=305&rail=etransfer"
}
```
→ `{ ok, requestId, gatewayUrl, gatewayHosts, status, amountBasis, referenceCode, unitRef, expiresAt, demo }`

`gatewayUrl` is where the payer chooses **their own** financial institution and
approves — the council never holds a banking login. Two refusals are structural,
not cosmetic:

- a gateway URL that is not https on an allowed host (Interac's own by default,
or the hosts a host names in `INTERAC_GATEWAY_HOSTS`) is rejected, so a payer's
banking session can never be sent to an address a response invented;
- a payer contact that is neither an email address nor a 10-digit Canadian mobile
  is refused before anything is sent.

### `GET /api/v1/payments/interac/request/:requestId`
The status to trust after the payer returns. Council-scoped: one council can
never read another's request (`404`). The request's own vocabulary is
`requested | awaiting_payer | approved | deposited | declined | expired |
cancelled`, and `approved` is deliberately **not** money — only `deposited` is.

### `POST /api/v1/payments/interac/request/:requestId/reported` (treasurer+)
Applies what the provider reported by webhook or poll. It advances the request
and nothing else: the deposit itself is reconciled by Ziggy against the same
reference code, so this route never posts to the ledger twice. A report that is
unreadable, repeats the current state, or would move the request **backwards**
(a replayed webhook after `deposited`) is ignored rather than applied. On the
live provider the route answers `{ ok: false, reason: 'the live provider reports
its own status' }` — that provider is read through `GET`.

## Agent access — read-only

`GET /api/v1/agent/manifest` publishes machine-readable capabilities; `GET
/api/v1/agent/context` returns an authenticated council snapshot. Both require at
least the `member` role and return `Cache-Control: private, no-store` plus
`Vary: Authorization`. The context includes aggregate unit occupancy/Form K
counts, verified Operating/CRF balances, and up to 50 deadlines. It omits owner
contacts, payment references, and transaction descriptions. Agents should not
receive human admin/treasurer credentials; dedicated scoped credentials are not
yet available. Agent access is informational only and cannot execute writes.

## Conveyancing — Form B / Form F

### `POST /api/v1/forms`
Issue a Form B (information certificate) or Form F (payment certificate).
```json
{
  "kind": "F",
  "unitId": "U-101",
  "requestedAt": "2026-02-14T00:00:00Z",
  "balanceBasis": 22000,
  "arrearsBasis": 44000,
  "crfBasis": 12500,
  "pendingCases": [],
  "eprDisclosed": true
}
```

## Meetings

### `POST /api/v1/meetings/quorum`
`type` = `AGM | SGM | council | rescheduled`; returns quorum met boolean (+ the
30-minute → reschedule rule for AGM/SGM, universal quorum after reschedule).

### `POST /api/v1/meetings/vote`
`threshold` = `majority | three_quarter | eighty | unanimous`; counts abstentions
out. Rolls back on an unattainable threshold.
```json
{ "threshold": "three_quarter", "eligible": 40, "present": 30, "yes": 24, "no": 3, "abstain": 3 }
```
## Evidence, export & compliance

### `GET /api/v1/compliance/crt-export?fund=&months=`
Print-ready HTML evidence bundle of the ledger hash chain (browser → PDF):
fund balance, head tally, chain-verified badge, monthly rollup table. HTML output
escapes inserted values and is served with `private, no-store`, `nosniff`, and a
restrictive CSP.

### `GET /api/v1/export/portable`
Portable OpenStrata export (`openstrata-portable/v1`): council, units, accounts
(chain-verified balances + head tallies), rails config — one JSON document for
moving a council between hosts.

### `POST /api/v1/compliance/stamp`
Satohash hash-of-record for payments/votes/bylaw actions. Returns the sha256
digest + the `https://satohash.io/stamp?hash=` URL; the stamp call itself runs
client-side against api.satohash.io.
```json
{ "scope": "fee_receipt", "payload": { "refId": "unit-101", "amountBasis": 4200 } }
```

### `GET /api/v1/forms/b/:unitId` · `GET /api/v1/forms/f/:unitId`
Print-ready HTML Form B (7-day statutory deadline) / Form F (WITHHELD while the
unit's AR ledger balance > 0 — sale blocked). Dynamic values are HTML-escaped;
responses use `private, no-store`, `nosniff`, and a restrictive CSP.

### `GET|POST /api/v1/rails/xpub`
Register a checksum/key-valid watch-only xpub (treasurer+) and inspect network
plus deterministic per-unit path metadata. The xpub is never returned by GET.
The current registration is process-local, not encrypted/durable; actual BIP32
child address derivation is not implemented and the response explicitly says
address bytes are not materialized. Do not use these paths to receive funds yet.

## Auth rate limiting

Failed logins are throttled per email + per IP (`AUTH_RATE_LIMIT_MAX` attempts
per `AUTH_RATE_LIMIT_WINDOW_MS`); registrations per IP. Exceeding the ceiling
returns `429` with a `retry-after` header; a successful login clears the email's
window.

## Error shape

Domain rejections return `{ ok: false, reason: string }` with a non-2xx or 2xx
based on the route. JSON-schema validation failures return Fastify's default
`400` `{ statusCode, error, message }`.