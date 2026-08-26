# OpenStrata Backend API — `/api/v1`

Versioned API surface for the Phase 3 core product. All endpoints are JSON
(`application/json`). The API is a factory over injected dependencies
(`buildServer` in `src/api/server.ts`) so it runs identically against Postgres
in production and the in-memory store in tests.

## Auth & tenancy

Every `/api/v1/*` endpoint except `/health` and the Rosa KB (`/api/v1/rosa/*`)
requires a Bearer token:

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

Missing/invalid/expired token → `401`; insufficient role → `403`.

### `POST /api/v1/auth/register`
Open signup: creates a council + its first user (admin) and returns a token.
```json
{ "councilName": "Cedar Point", "email": "admin@cedar.example", "password": "correct-horse" }
```

### `POST /api/v1/auth/login`
```json
{ "email": "admin@cedar.example", "password": "correct-horse" }
```
→ `{ ok, token, user }`

### `GET /api/v1/auth/me`
Returns the authenticated user + their council.

### `GET|POST /api/v1/auth/users` (admin only)
List the council's users, or create a `treasurer`/`member` account. Creation
returns a one-time `temporaryPassword` for the admin to share.

## Health

`GET /health`
```json
{ "ok": true, "service": "openstrata-backend" }
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
Deterministic PSBT/multisig orchestration skeleton (3-of-5 threshold-gated;
hardware-wallet signatures plug into the seam). Accepts an allowed `verdict`
from `/treasury/authorize`, the spend in sats, UTXOs, and signer counts.

## Ledger series

### `GET /api/v1/ledger/series?fund=&months=`
Chain-verified monthly income/expense rollup (default 6 months, max 24) for the
dashboard charts.
```json
{ "fund": "operating", "points": [{ "month": "2026-08", "incomeBasis": 420000, "expenseBasis": 120000, "netBasis": 300000 }] }
```

## Rosa — compliance RAG

### `POST /api/v1/rosa/query`
Strict, citation-only answer with an `uncertain` flag when date/fact inputs are
missing (Rosa fails closed, never fabricates a citation).
```json
{ "question": "What must a strata report for emergency reserves?", "facts": {} }
```

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
fund balance, head tally, chain-verified badge, monthly rollup table.

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
unit's AR ledger balance > 0 — sale blocked).

### `GET|POST /api/v1/rails/xpub`
Register (treasurer+) the council's watch-only xpub (`POST`) and read the
registered xpub + deterministic per-unit BIP32 receive paths (`GET`). Keys never
leave council hardware wallets.

## Auth rate limiting

Failed logins are throttled per email + per IP (`AUTH_RATE_LIMIT_MAX` attempts
per `AUTH_RATE_LIMIT_WINDOW_MS`); registrations per IP. Exceeding the ceiling
returns `429` with a `retry-after` header; a successful login clears the email's
window.

## Error shape

Domain rejections return `{ ok: false, reason: string }` with a non-2xx or 2xx
based on the route. JSON-schema validation failures return Fastify's default
`400` `{ statusCode, error, message }`.