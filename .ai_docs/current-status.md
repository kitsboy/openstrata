# Current Status — OpenStrata

**Version:** v0.3.0
**Last Updated:** 2026-08-25
**Domain:** openstrata.giveabit.io

## Recent Milestones
- v0.2.x series: responsive dashboard + shared shell, 9-locale i18n parity (217→509 keys), PWA + dark mode + search, Phase 2 e-transfer auto-reconciliation prototype, Phase 3 backend scaffolding (immutable trust ledger, Rosa RAG, Ziggy treasury), automated fee billing + late notices, CRT-proof bylaw enforcement state machine, sovereign payment rails (Bitcoin on-chain, Lightning/LNURL, Liquid, PayNym BIP-47, Nostr) with quoting + shared reconciliation reference
- **Phase 3 core product completed + hardened (v0.3.0):**
  - **Form B/F + meetings + payment flows** (`0db3ce3`): Form B (information cert) / Form F (payment cert) issuance endpoint, AGM/SGM/council quorum + threshold-voting routes, `POST /api/v1/payments/confirm` that marks a quoted payment paid AND posts it to the unit's AR ledger (reconciles like an e-transfer), idempotent `payments/quote` backed by a persisted `PaymentRequestStore` (`PostgresPaymentRequestStore` + in-memory for tests) keyed on `(refId, unitRef, rail)`, `Idempotency-Key` dedupe on ledger/billing writes, Fastify JSON-schema body validation on write routes
  - **Rails hardening** (`1112968`): real BIP-173 bech32/bech32m checksum verification for `bc1`/`bc1p` (taproot), LNURL, `npub` via `decodeBech32` + `bech32Encode`; pluggable `cadPerBtc` `RateProvider` (env-seedable, static/cached fallback) wired through `/rails/status` + `/payments/quote`; watch-only xpub → deterministic per-unit BIP32 child index (`deriveUnitAddress`/`unitChildIndex`)
  - **Operational CLI + docs** (`f7bdc2d`, `3c17beb`): `npm run cli -- rosa ingest` (validate + probe the BC corpus), `npm run cli -- ziggy simulate` (walk treasury scenarios through the state machine); full `backend/API.md` request/response reference linked from README
  - **API test coverage** (`40db03f`): 13 new route tests — payments/confirm edge cases (unknown ref, schema 400, double-confirm refusal, paid request surfacing through re-quote), Form B 7-day deadline + Form F on a clear unit, AGM/council/rescheduled quorum, majority/unanimous voting rejections; `MemPaymentRequestStore.markStatus` fixed to propagate to both by-ref and by-key indexes. **Backend suite now 99 tests, 9 files, all passing; typecheck clean**

## Known Issues
- Domain-specific statutory, financial, feed, module, and protocol records remain canonical English/data-driven until reviewed translations are available
- Phase 3 backend is functional but **not yet deployed**: Rosa uses a keyword-fallback retriever (pgvector embeddings + Ollama model not yet selected/provisioned); Ziggy PSBT/multisig execution is stubbed (authorization gate is real); the Postgres ledger + payment-store adapters and Docker Compose stack need a real deployment smoke test on a host behind Tailscale, and a real secrets path (`backend/.env` is gitignored)
- Sovereign rails are **prepared, not connected**: no LND / Liquid daemon / PayNym notifier / Nostr relay is running on a host; `cadPerBtc` needs a live rate feed. Enable + point endpoints via `.env` when daemons exist
- `MemPaymentRequestStore.markStatus` was fixed to mirror single-row semantics; verify the same status-propagation holds on the Postgres adapter on first real deployment
- The live site remains a fully functional front-end product demo; legal/statutory content awaits professional review

## Next Steps
- Pick Rosa embedding/chat models, then wire the pgvector + Ollama adapters (migration `0002` + `keywordRetriever` seam ready) so `rosa ingest` indexes real embeddings
- Deploy the stack on a host behind Tailscale and run a real Postgres migration + smoke test of `/api/v1/ledger`, `/api/v1/payments/*`, `/api/v1/forms`, `/api/v1/meetings/*`
- Provision the Bitcoin rails' daemons (LND, Liquid node, PayNym notifier, Nostr relays) on the host and enable rails via `.env`; wire a live `cadPerBtc` rate feed; connect `payments/confirm` → real on-chain/LN broadcast
- Professional human review of the machine-drafted locale overrides before they are treated as reviewed
- Tighten organizational mapping, user workflow, and recording (member/lot ledger, unit→payment→form traceability) as part of preparing for live Bitcoin/L2 payments