---
title: Changelog
project: openstrata
version_history:-  version: 0.3.8
-  summary: "Next 20 shipped — live flows, governance, Bitcoin & trust: RosaChat citation-only compliance Q&A, register wizard, QR scan-to-pay + wallet deep links, Forms B/F 7-day tracker, MyUnit panel, BallotEngine + minutes export, CRT-ready bylaw case file, statutory meeting notices, compliance health score, mempool.space balances, war-chest DCA planner with Form B disclosure, live CAD/BTC sparkline, rails readiness checklist, ledger chain visualizer, PWA offline + install, a11y 0-warning, tour/empty-state illustrations, host-connect strip; browser-verified zero overflow 390→1280, 78 frontend tests, i18n 893 keys x 9 locales"
-  version: 0.3.7
-  summary: "All 20 user-flow/GUI/Bitcoin improvements shipped: backend member registry (migration 0006) + /members, verified /ledger/entries, /deadlines; frontend CheckoutFlow pay-fees + receipts, MonthlyClose, BylawCase, MemberWorkspace, DeadlinesPanel, brand-accent theming + /design page, RailsStatus, SigningRoom, WalletPanel, LedgerExplorer, ExportCenter, MemberManager, NotificationsFeed, RateBadge, glossary + illustrations + print styles; mobile-verified zero overflow 390→1698"
-  version: 0.3.6
    date: 2026-08-26
    summary: >-
      GUI & user-flow push — all 20 improvements shipped: SVG icon system,
      real glass-card tokens (was undefined), typography ramp, designed empty
      states, breadcrumbs, tools sub-nav, scroll-spy TOC, tool modules in the
      Cmd-K palette, mobile dock on every page, view transitions, shimmer
      skeletons, dynamic time-of-day greeting, metric sparklines,
      micro-interactions, first-run tour, confirm dialogs, error toasts +
      inline validation, last-synced chrome, and hero-pattern CTAs. Tablet-width
      header overflow fixed (jurisdiction picker moves to lg+).
  - version: 0.3.5
    date: 2026-08-26
    summary: Per-council DB-backed unit registry with traceability (migration 0005)
  - version: 0.3.4
    date: 2026-08-26
    summary: 20-item upgrade push — rate limiting, treasury series, meetings/sub-accounts/CSV, Bitcoin modules, exports
  - version: 0.3.3
    date: 2026-08-26
    summary: Landing security (CSP) + shell tightening
  - version: 0.3.2
    date: 2026-08-26
    summary: Frontend wired to the live /api/v1 backend (api client, auth modal, live widgets)
  - version: 0.3.1
    date: 2026-08-26
    summary: JWT auth + multi-tenant council scoping on the backend
  - version: 0.2.6
    date: 2026-08-25
    summary: Full interface localization, hardened audit, and French locale overrides
  - version: 0.2.5
    date: 2026-08-25
    summary: Single-source version markers across deployed metadata and generated config
  - version: 0.2.4
    date: 2026-08-25
    summary: Deployment repair and synchronized dependency lockfile
  - version: 0.2.3
    date: 2026-08-25
    summary: Locale-aware formatting and translation audit
  - version: 0.2.2
    date: 2026-08-25
    summary: Templates and remaining wizard/compliance localization
  - version: 0.2.1
    date: 2026-08-25
    summary: Blog localization and source-linked legal library
  - version: 0.2.0
    date: 2026-08-25
    summary: Responsive OpenStrata operations dashboard and multilingual GUI foundation
  - version: 0.1.0
    date: 2026-06-22
    summary: Initial project scaffold
audience: devs
last_updated: 2026-08-26
owner: Nova (Product Management & Documentation)
---

# Changelog

## [0.3.5] — 2026-08-26

### Added
- Per-council DB-backed unit registry (migration `0005_council_units.sql`, `unit` table keyed on `(community_id, unit_ref)`)
- `UnitStore` interface + `PostgresUnitStore` + `MemUnitStore` (list/get/upsert/remove/seedDefault); register seeds each new council's building
- `GET /api/v1/units/:unitRef` unit detail — AR ledger balance (hash-chain verified) + payment requests (unit → payment → ledger traceability)
- `POST /api/v1/units` (treasurer+, canonicalized unitRefs) and `DELETE /api/v1/units/:unitRef` (admin)
- Frontend Form K hub: live unit-detail panel + add/remove unit controls when signed in

### Fixed
- `PostgresPaymentRequestStore.markStatus` wrote the referenceCode into `status` (`status = $2` instead of `$3`) — the e2e re-quote assertion would have failed on a real Postgres
- Payment-quote unitRefs now canonicalize at the boundary (`unit-302` → `302`) so stored rows, referenceCodes, and unit detail agree
- Billing AR funds aligned to the canonical `ar:unit-<n>` account so unit-detail balances read real charges

### Changed
- Version markers synced to **v0.3.5** (root + backend `package.json`); backend now 167 tests / 16 files, frontend 45 tests, i18n 565 keys × 9 locales

## [0.3.4] — 2026-08-26

### Added
- 20-item upgrade push: auth rate limiting (#6), build-time CSP pinning (#2), monthly treasury series endpoint (#4), live CAD/BTC rate provider (#7), meetings quorum/voting UI (#8), transparent sub-accounts dashboard (#10), CSV bank-feed import (#12), war-chest DCA planner (#18), PSBT 3-of-5 orchestration seam (#15), Satohash stamp endpoint (#19), watch-only xpub import (#16), portable export (#20), CRT evidence bundle (#11), print-ready Form B/F (#9)

## [0.3.3] — 2026-08-26

### Fixed
- CSP in `static/_headers` was blocking the page's own assets (Google Fonts, Umami analytics, live-API `connect-src`); fonts now load once, unused `Inter` dropped

### Changed
- Landing shell tightened (1280px content, crisp 2-layer card shadows) per "solid, tight" pass

## [0.3.2] — 2026-08-26

### Added
- `src/lib/api/` client (config/token/client/auth + typed ledger/units/rails helpers), AuthModal, Live/Demo pill, dashboard + tools + reconciler + pitch wired to `/api/v1/*` with demo fallback

## [0.3.1] — 2026-08-26

### Added
- Zero-dependency JWT auth + multi-tenant council scoping (migration 0004), roles admin/treasurer/member, tenant-isolated payment store, Postgres e2e smoke suite + CI job

## [0.2.6] — 2026-08-25

### Added
- Migrated remaining hard-coded interface copy across all 14 routes (dashboard footer, wizard, about, blog, templates, legal, roadmap, rss, spec, compliance, tools, docs, pitch) to the shared locale catalog — 458 keys total
- First reviewed locale overrides for French (fr-CA), covering all interface copy added in v0.2.6
- `npm run audit:i18n` now scans for hard-coded text nodes, placeholders, and meta content, so new English chrome can be caught before release

### Changed
- Version markers (layout, pitch, wizard config) derive from `package.json` v0.2.6

## [0.2.5] — 2026-08-25

### Fixed
- Centralized visible, metadata, pitch, and generated-config version markers on the package version
- Removed stale `v0.2.0` and `0.1.0` release identifiers from active application surfaces

## [0.2.4] — 2026-08-25

### Fixed
- Synchronized `package-lock.json` with `package.json` so Cloudflare Pages can complete `npm ci`
- Added a versioned deployment repair release after stale production output was detected

## [0.2.3] — 2026-08-25

### Added
- Locale-aware date, number, and CAD currency formatting for supported languages
- `npm run audit:i18n` translation completeness audit for route catalog usage

### Changed
- Dashboard, About, Pitch, Blog, and shared footer now respond to the active locale for visible formatted values

## [0.2.2] — 2026-08-25

### Added
- Reusable `/templates` library for legal, governance, and finance workflows
- Source and professional-review notes on every starter template
- Shared locale keys for template descriptions and sources

### Changed
- Finished remaining visible wizard and compliance interface copy through the shared locale catalog
- Added `/templates` to the site navigation

## [0.2.1] — 2026-08-25

### Added
- Shared locale coverage for the public blog interface
- Source-linked `/legal` library for BC legislation, regulations, official guidance, and tribunal information
- Legal-information notice separating workflow support from legal advice


All notable changes to this project are documented here.

## [0.2.0] — 2026-08-25

### Added
- Responsive OpenStrata operations dashboard with desktop sidebar and mobile navigation
- Multilingual shell for English, French, Spanish, Chinese, Hindi, Filipino, Polish, Ukrainian, and Swahili
- Building health cards, activity feed, upcoming events, quick actions, and formation workspace modal
- Trust-oriented footer and visible product version marker

### Changed
- Rebuilt the missing SvelteKit source foundation for the current GUI

### Fixed
- Added accessible interactive card and dialog semantics

## [0.1.0] — 2026-06-22

### Added
- Initial project scaffold
- Project documentation from canonical TEMPLATE (8 files)

### Changed
- None

### Fixed
- None