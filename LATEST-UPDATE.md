# OpenStrata — Last Updated 2026-08-26 by Grok

Brief: 20-item upgrade push (v0.3.4) — 15 of 20 done end-to-end as code, in 5 batched commits, all pushed to origin/main. Rate limiting + build-time CSP pinning; monthly treasury series endpoint (pitch chart goes live) + live CAD/BTC provider (mempool.space, cached, env fallback); MeetingsTool (quorum + voting), transparent SubAccounts dashboard, CSV bank-feed import; Bitcoin batch — war-chest DCA planner, PSBT/multisig orchestration seam (3-of-5 threshold-gated), Satohash stamp endpoint, watch-only xpub import UI; portable export, CRT evidence bundle, print-ready Form B/F. Backend: 155 tests / 14 files green (+28 new). Frontend: 42 tests, svelte-check 0/0, 561 i18n keys × 9 locales. Deferred (infra-gated, per Cam — LND/LNBITS channels wired later): live-site verify, per-council DB units, rails on host, on-chain/LN broadcast, BOLT-12. Full per-item status in WORKPLAN.md.

Commit: `3ed66e7` → `89fc0b3` (5 commits, pushed; branch in sync)
