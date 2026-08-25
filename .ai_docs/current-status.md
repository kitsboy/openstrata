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
- Locale overrides now complete for **fr, es, and zh** (185 keys each — full interface catalog parity); hi/fil/pl/uk/sw fall back to English

## Known Issues
- Domain-specific statutory, financial, feed, module, and protocol records remain canonical English/data-driven until reviewed translations are available
- Template source records and statutory body records still need reviewed translations
- Backend phases (Rosa/Ziggy Docker stack, real payment rails, DB/auth) are not implemented — the site is a fully functional front-end product demo; legal/statutory content awaits professional review

## Next Steps
- Extend locale overrides to the remaining languages (hi, fil, pl, uk, sw) following the fr/es/zh pattern (185 keys each)
- Review legal and statutory translations with qualified professionals and preserve source links/effective dates
- Domain-specific statutory, financial, feed, module, and protocol records remain canonical English until reviewed translations exist
- Phase 3+ backend build (Docker stack, treasury, billing, Form B/F, enforcement state machine, PWA)
