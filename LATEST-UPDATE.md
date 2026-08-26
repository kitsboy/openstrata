# OpenStrata — Last Updated 2026-08-26 by Grok

Brief: Auth + multi-tenant councils (v0.3.1) on the Phase 3 backend — zero-dependency HS256 JWT bearer auth (node:crypto) with scrypt password hashing, admin/treasurer/member role gates, open signup (register creates a council + first admin), admin user management. Every `/api/v1/*` route except `/health` + the Rosa KB now requires a token and derives its ledger community from the token (no client-supplied community); payment quoting/confirming is tenant-isolated (idempotency key now includes community_id via migration `0004`). Backend suite: 127 tests / 11 files green, typecheck clean. Added a Postgres e2e smoke suite (runs against a live DATABASE_URL; verifies PostgresPaymentRequestStore.markStatus single-row semantics) + a CI `backend-e2e` job with a pgvector Postgres service. Deploy-day checklist (AUTH_SECRET, migrate, e2e gate) in docs/DEPLOYMENT.md.

Commit: (uncommitted — working tree)
