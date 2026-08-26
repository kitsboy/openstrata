# Latest Update — 2026-08-26

**Per-council DB-backed units (v0.3.5) — #5 of the 20-item list, the largest remaining tenancy step.**

## What shipped
- **Migration `0005_council_units.sql`** — `unit` table keyed on `(community_id, unit_ref)`: every council owns its own building, tenant-isolated.
- **`UnitStore`** interface + **`PostgresUnitStore`** (production) + **`MemUnitStore`** (tests): `list / get / upsert / remove / seedDefault`.
- **Server rewired to store-backed `/units`** (registry stays as the demo fallback):
  - `GET /api/v1/units` — tenant-scoped list
  - `GET /api/v1/units/:unitRef` — **unit detail**: AR ledger balance (hash-chain verified) + payment requests = unit→payment→ledger traceability end to end
  - `POST /api/v1/units` (treasurer+) — upsert; unitRefs canonicalized (`U-501` → `501`)
  - `DELETE /api/v1/units/:unitRef` (admin)
  - **Register seeds the demo building into each new council** — fresh signups get a working building
- **Consistency fixes found while wiring this:**
  - Payment-quote `unitRef`s are now canonicalized at the boundary (`unit-302` → `302`), so stored rows, referenceCodes, and unit detail agree
  - Billing AR fund now posts to the documented canonical `ar:unit-<n>` account (unit detail balances read real charges)
  - **Fixed a latent `PostgresPaymentRequestStore.markStatus` bug**: it wrote `status = $2` (the referenceCode!) instead of `$3` — the e2e re-quote-after-confirm assertion would have failed on a real Postgres. Exactly the kind of thing the smoke suite is for.
- **Frontend:** Form K hub gains a live **unit detail panel** (AR balance + fund code + recent payments) and **manage-units controls** (add: treasurer+, remove: admin) when signed in. `src/lib/api/units.ts` grew `fetchUnitDetail` / `createUnit` / `deleteUnit`. 4 new i18n keys × 9 locales.

## Verification
- Backend: **167 tests / 16 files** (+12 new in `unit-store.test.ts` — store semantics, role gates, tenancy isolation, AR traceability from billing + confirmed payments, 501 fallback), typecheck clean, build clean
- Frontend: **45 tests** (+3 api client), `svelte-check` 0/0, i18n **565 keys × 9 locales** parity green, production build + prerender clean
- Docs updated: `backend/API.md` (units section), WORKPLAN #5 done, handoff + status

## Still deferred (infra-gated, per Cam)
#1 live-site verify (needs deploy) · #13 rails on host · #14 on-chain/LN broadcast · #17 BOLT-12 (LND + LNBITS channels later)

All changes **uncommitted** — main work commit + handoff-SHA follow-up ready to commit and push on your word.
