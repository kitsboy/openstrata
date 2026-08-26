# Latest Update — OpenStrata v0.3.8

**2026-08-26 · CI FIX — Postgres e2e smoke green (Grok THOR)**

Cam flagged red CI (push `0969190`). Root-caused 4 backend bugs that only surfaced against real Postgres (42P18 placeholder hole, 25P01 LOCK outside txn, transposed payment-store args, BIGINT-as-string breaking chain verify). Fixed in `f371aed`; all 3 CI jobs success; e2e 6/6. See docs/KIMI-HANDOFF.md top.
