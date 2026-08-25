# OpenStrata Backend API — `/api/v1`

Versioned API surface for the Phase 3 core product. All endpoints are JSON
(`application/json`). The API is a factory over injected dependencies
(`buildServer` in `src/api/server.ts`) so it runs identically against Postgres
in production and the in-memory store in tests.

## Health

`GET /health`
```json
{ "ok": true, "service": "openstrata-backend" }
```

## Trust ledger

### `GET /api/v1/ledger/balance?community=&fund=`
Verified balance for one community+fund account (derived from the journal).
```json
{ "balanceBasis": 129350, "entryCount": 42, "headTally": "a1b2c3d4e5..." }
```

### `POST /api/v1/ledger/post`
Append a single credit/debit. Idempotent when sent with an `Idempotency-Key`
header (replays return the cached result).
```json
{
  "community": "demo",
  "fund": "operating",
  "amountBasis": 120000,
  "kind": "credit",
  "type": "strata_fee",
  "description": "Unit 101 fees",
  "referenceCode": "pay-101-202601"
}
```
Body validation via Fastify JSON schema: `required` = community, fund,
amountBasis, kind, type; `amountBasis` must be a non-zero integer; `kind` is
`credit|debit`.

## Units — canonical master data

### `GET /api/v1/units`
The single source of unit identity (building → unit → AR ledger fund code). Every
unit carries its reconciliation keys + deterministic `arFundCode` so clients
never re-derive them on their own. Requires a unit registry dependency.
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
Without a registered source: `{ "ok": false, "reason": "unit registry not configured" }`.

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

### `POST /api/v1/billing/run`
Runs a monthly billing cycle (charges + late notices) and posts each charge to
the unit's AR ledger account.
```json
{
  "community": "demo",
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
| `POST /api/v1/bylaw/complaint`   | Create a complaint (`standard` \| `short_term_rental`) |
| `POST /api/v1/bylaw/complaint/notice` | Issue the written notice |
| `POST /api/v1/bylaw/status`      | Check if a fine can be imposed (gates + caps) |
| `POST /api/v1/bylaw/fine`        | Impose a fine (`councilMinutesRef` + `amountBasis`) |
| `POST /api/v1/bylaw/nofine`      | Council votes no fine, records minutes, closes case |

## Sovereign rails

### `GET /api/v1/rails/status`
```json
{ "rails": { "fiat": { "enabled": true }, "onchain": { "enabled": true } }, "cadPerBtc": 165432.15 }
```

### `POST /api/v1/payments/quote`
Build a rail-specific invoice/request carrying a shared `referenceCode`.
Idempotent per `(refId, unitRef, rail)` — replays return the original quote with
`created: false`. LNURL quotes carry a 15-minute CAD rate lock.
```json
{
  "rail": "lightning",
  "refId": "fees-2026-02",
  "unitRef": "U-101",
  "amountBasis": 22000,
  "currency": "CAD",
  "recipient": "lnurl1dp68...",
  "communityId": "demo"
}
```

### `POST /api/v1/payments/confirm`
Mark a quoted payment paid **and** post it to the unit's AR ledger (the same way
Ziggy reconciles an e-transfer). Requires prior `quote`.
```json
{ "referenceCode": "pay-fees-2026-02-U-101", "community": "demo" }
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

## Error shape

Domain rejections return `{ ok: false, reason: string }` with a non-2xx or 2xx
based on the route. JSON-schema validation failures return Fastify's default
`400` `{ statusCode, error, message }`.