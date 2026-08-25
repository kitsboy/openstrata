# Current Status — OpenStrata

**Version:** v0.2.1
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

## Known Issues
- `npm run check` is blocked in this workspace because `svelte-check` is not present in `node_modules`
- `npm run build` passes, with existing non-blocking accessibility warnings in chart components and the `/tools` module-card interaction
- Domain-specific statutory, financial, feed, module, and protocol records remain canonical English/data-driven until reviewed translations are available
- Templates and some legal/template body records still need reviewed translations

## Next Steps
- Batch 2: translate templates, forms, and remaining wizard/compliance body-copy gaps
- Batch 3: add locale-aware dates, currencies, number formatting, and translation completeness checks
- Review legal translations with qualified professionals and preserve source links/effective dates
- Restore/install the dependency set needed for `npm run check`
