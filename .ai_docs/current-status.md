# Current Status — OpenStrata

**Version:** v0.2.6
**Last Updated:** 2026-08-25
**Domain:** openstrata.giveabit.io

## Recent Milestones
- v0.2.0 responsive OpenStrata dashboard and shared shell restored on `main`
- v0.2.1 release prepared with the prior GUI/deployment sweep and multilingual Batch 1
- Centralized locale store added at `src/lib/i18n.ts`
- Site-wide locale persistence and language switcher support English, French, Spanish, Chinese, Hindi, Filipino, Polish, Ukrainian, and Swahili
- Dashboard, shared shell, formation wizard, documentation hub, compliance page chrome, About page, Pitch page, tools, roadmap, RSS/API, and specification pages consume shared translation keys
- Blog interface now consumes shared locale keys
- New `/legal` route provides primary-source links for BC legislation, regulations, official guidance, and tribunal information
- Batch 2 adds `/templates` plus remaining wizard and compliance interface localization
- Batch 3 adds shared locale-aware date, number, and CAD currency formatters plus `npm run audit:i18n`
- v0.2.4 repairs the package lockfile after Cloudflare Pages failed recent `main` deployments during `npm ci`
- v0.2.5 makes active metadata, pitch, homepage, and generated-config version markers derive from `package.json`
- v0.2.6 migrates every remaining hard-coded interface string across all 14 routes to the shared locale catalog (458 keys), hardens `npm run audit:i18n` with a hard-coded-copy scanner, and adds the first reviewed French (fr-CA) locale overrides for the new interface copy
- Post-v0.2.6 engineering sweep: `npm run check` now passes with **0 errors / 0 warnings** (fixed 11 type errors + 7 a11y warnings: satohash `BufferSource`, chart props + ARIA roles, JobsDropdown narrowing, implicit-any params, typed `$copy` indexing, tools module-card keyboard access)
- Site completeness: new `/faq` page, real `/rss.xml` feed endpoint, complete sitemap (all 15 routes), RSS subscribe links, wizard mobile polish; **all routes verified mobile- and desktop-ready**
- Docs sweep: DEPLOYMENT.md and I18N.md rewritten to match reality; all version/status docs refreshed; new policy docs: SECURITY.md, PRIVACY-POLICY.md, TERMS-OF-SERVICE.md, ACCESSIBILITY-STATEMENT.md, KNOWN-LIMITATIONS.md
- **All 9 locales now translate the full interface catalog (217 keys each, exact parity with the French benchmark)** — hi/fil/pl/uk/sw completed; `audit:i18n` enforces parity as a hard error
- Upgrade batch: test suite (16 Vitest unit/component tests), GitHub Actions CI, localized 404/error page, PWA (manifest + service worker + iOS meta), dark mode (persisted, system-aware, FOUC-free), Cmd/Ctrl+K site search, OG/twitter meta, per-category RSS feeds, auto-generated sitemap, Satohash health + stamp/verify UI, wizard save/load/download/validate/prefill, templates filter + wizard prefill, compliance/legal/FAQ search + FAQ anchors, pitch print-to-PDF, dashboard building detail modal + persistent notification center
- Phase 2 complete: **E-Transfer Auto-Reconciliation prototype** — pure `src/lib/reconcile.ts` matching engine (auto-match by unit reference codes, flag ambiguous/multi-unit references, leave unmatched for review; brief/full match modes) with 9 unit tests, driving `ETransferReconciler.svelte` (interactive /tools demo with Received/Resolved/Auto/Needs-review stats, match-mode toggle, per-transfer manual assign dropdown). 16 new catalog keys added across all 9 locales (509 keys total, parity guard green) — machine-drafted overrides require professional review
- Build fix (SHA `6ff5fc3`): PWA service-worker registration guarded with `browser` from `$app/environment` instead of `import.meta.env.PROD`, fixing a Node 20 prerender crash on Cloudflare Pages that previously failed every production build
- **Phase 3 backend scaffolding begun** — new `backend/` workspace: Docker Compose stack (`pgvector/pgvector:pg17` + Fastify API, Tailscale-only exposure), append-only immutable trust ledger (Operating/CRF/Special Levy isolation, hash-chain `tally_root` diffs, `diff()` across ledger copies), Rosa compliance RAG (keyword retriever + BC corpus; pgvector/Ollama seam + `0002` migration), Ziggy treasury state machine (CRF hard cap, PO verification, no-guess reconciliation). 35 backend Vitest tests (incl. Fastify route tests) + isolated backend CI job; idempotent `npm run seed` demo community; SOURCE-OF-TRUTH + DEPLOYMENT aligned. Frontend fully green (check 0/0, audit 509, tests 25/25, build clean).

## Known Issues
- Domain-specific statutory, financial, feed, module, and protocol records remain canonical English/data-driven until reviewed translations are available
- Template source records and statutory body records still need reviewed translations
- Phase 3 backend is a **scaffold**: Rosa uses a keyword-fallback retriever (pgvector embeddings + Ollama model not yet selected/provisioned); Ziggy PSBT/multisig execution is stubbed; the Postgres ledger adapter and Docker Compose stack need a real deployment smoke test on a host behind Tailscale, and a real secrets path (`backend/.env` is gitignored)
- The live site remains a fully functional front-end product demo; legal/statutory content awaits professional review
- The 16 new e-transfer/reconciliation catalog keys are machine-drafted across all 9 locales and need professional review (alongside the earlier hi/fil/pl/uk/sw overrides)

## Next Steps
- Pick Rosa embedding/chat models, then wire the pgvector + Ollama adapters (migration `0002` + `keywordRetriever` seam ready)
- Deploy the stack on a host behind Tailscale (Umbrel per framework doc) and run a real Postgres migration + smoke test of `/api/v1/ledger`
- Continue Phase 3: fee billing + late-notice API on the trust ledger, Form B/F generator with deadline tracking, bylaw enforcement state machine (`BLOCK_FINE_ACTIONS`)
- The backend's `/docs` bootstrap mentions future `rosa ingest` / `ziggy simulate` CLIs — those are not yet built; add them when the vector adapter lands
- Professional human review of the machine-drafted hi/fil/pl/uk/sw overrides (incl. the 16 new reconciliation keys) before they are marked as reviewed
