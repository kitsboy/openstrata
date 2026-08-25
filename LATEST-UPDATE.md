# OpenStrata — Last Updated 2026-08-25 by Grok

Brief: Phase 3 backend in `backend/` — Docker Compose stack (Postgres/pgvector + Fastify API), immutable append-only trust ledger (Operating/CRF/Special Levy isolation, hash-chain diffable), Rosa RAG, Ziggy treasury, automated fee billing + late notices, and a CRT-proof bylaw enforcement state machine (`BLOCK_FINE_ACTIONS`). 52 backend tests + isolated CI job; frontend green.

Commit: b7e4559