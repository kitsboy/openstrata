# OpenStrata — Last Updated 2026-08-25 by Buffy

Brief: the full upgrade list was executed in five committed/pushed batches: test suite + CI + PWA + error page, dark mode + site search + OG meta + category RSS + auto-sitemap, Satohash UI + wizard save/load + filters/search + print deck + dashboard detail, all-locale translation parity + content refresh, and handoff docs.

Release: v0.2.6 (deployed live; no version bump — markers derive from package.json)
Verification: `npm run check` 0 errors / 0 warnings, `npm test` 16/16, `npm run build` clean, `npm run audit:i18n` 493 keys / 16 routes with the locale-parity guard enforced.

What changed (5 batches, each committed and pushed):
1. **Engineering foundations** — Vitest + @testing-library/svelte (16 tests: i18n parity/formatters, Satohash client, BarChart); GitHub Actions CI (check → audit → test → build → asset verification); localized `+error.svelte` (404 + error states); PWA manifest + service worker + iOS meta + CSP worker-src/manifest-src.
2. **Site-wide upgrades** — dark mode (persisted, system-aware, FOUC-free, full token flips); Cmd/Ctrl+K search modal across pages/posts/FAQ/templates/legal/feeds; og:/twitter meta; per-category RSS feeds prerendered to static XML; sitemap auto-generated before every build; the dead `.mesh-bg` class defined.
3. **Feature completions** — Satohash health + stamp/verify form (graceful offline) on dashboard and spec; wizard save/load/download/validate/template-prefill; templates category filter + Use-template → wizard; compliance section search; legal source search; FAQ search + deep-link anchors; pitch print-to-PDF; dashboard building-detail modal + persistent notification center.
4. **Locales + content** — hi/fil/pl/uk/sw extended to full 217-key parity with fr/es/zh (all 9 locales translate the whole interface); audit now hard-fails on locale key drift; llms.txt expanded; metrics.json refreshed; three new substantive blog posts.
5. **Handoff** — current-status, LATEST-UPDATE, and KIMI handoff updated.

Next work: professional human review of machine-drafted overrides; reviewed legal/statutory record translations; Phase 3+ backend build.
