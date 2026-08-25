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

## Known Issues
- `npm run check` is blocked in this workspace because `svelte-check` is not present in `node_modules`
- `npm run build` passes, with existing non-blocking accessibility warnings in chart components and the `/tools` module-card interaction
- Domain-specific statutory, financial, feed, module, and protocol records remain canonical English/data-driven until reviewed translations are available
- Template source records and statutory body records still need reviewed translations
- Cloudflare Pages had been serving the last successful deployment because recent `main` builds failed during dependency installation; v0.2.4 repairs this lockfile mismatch

## Next Steps
- Extend locale overrides to the remaining languages (es, zh, hi, fil, pl, uk, sw) following the French pattern established in v0.2.6
- Review legal and statutory translations with qualified professionals and preserve source links/effective dates
- Domain-specific statutory, financial, feed, module, and protocol records remain canonical English until reviewed translations exist
- Restore/install the dependency set needed for `npm run check`
