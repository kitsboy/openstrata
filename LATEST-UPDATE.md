# OpenStrata — Last Updated 2026-08-25 by Grok

Brief: Phase 3 backend in `backend/` — Docker Compose stack (Postgres/pgvector + Fastify API), immutable append-only trust ledger (Operating/CRF/Special Levy isolation, hash-chain diffable), Rosa RAG, Ziggy treasury, fee billing + late notices, bylaw enforcement state machine (`BLOCK_FINE_ACTIONS`), and sovereign payment rails (Bitcoin on-chain, Lightning/LNURL 15-min CAD lock, Liquid, PayNym BIP-47, Nostr) with quoting + shared reconciliation reference. 66 backend tests + isolated CI job; frontend green.

Commit: b5203a8