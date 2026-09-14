# openstrata — Last Updated 2026-09-15 by Kimi (HERMES · THOR)

**Brief:** The broken `/docs/manual` build is fixed — the user manual was rebuilt clean; typecheck, i18n audit, tests and build are all green.

**Commit:** `b1fa2f7`

- **Root cause of the 3 failing svelte-check errors:** every manual page carried `const t = (key: string): string => copy[key] ?? key`. `copy` is a Svelte `derived` store, not a plain object, so indexing it is a type error — and the helper was dead code in all three files. Removed.
- **Dead links removed:** the hub advertised `/docs/manual/overview`, `/benefits`, and `/monthly-review`, none of which exist. In `src/routes/docs/+page.svelte`, `guideIndex` was declared but never rendered and pointed every card at `/docs/manual`; it is now a real, rendered **Manual sections** grid driven by `manualSections`.
- **New content module `src/lib/manual.ts`** — manual copy is authored once there (the same pattern as `data.ts` / `legal.ts`) instead of being hard-coded in templates. Pricing, module counts, and licensing facts are imported from `marketing.ts` and `strata-tool.ts`, so the manual cannot drift from what `/pitch` and `/tools` publish.
- **7 new i18n keys** (`manualTitle`, `manualIntro`, `manualSections`, `manualReadMore`, `manualWelcomeTitle`, `manualWelcomeIntro`, `manualStartIntro`) added across all 9 locales; the audit's French-parity guard stays green (779 keys, 21 route components).
- **Honesty pass:** removed the unsourced “$9,000+/year”, “up to 80% less”, “$0/month starting”, and the “Video placeholder — tutorial would go here” block. Claims now come from the repo's own sources, and the welcome page carries an explicit **what it is not** section (software not a management company, no legal advice, 0% custody, demo data always labelled).
- **Sitemap** now lists `/docs/manual`, `/docs/manual/welcome`, `/docs/manual/getting-started`.
- **Verified:** `npm run check` 0 errors / 0 warnings · `npm run audit:i18n` pass · `npm test` 85 pass · `npm run build` green with all six CI asset assertions present · 0 broken internal links across the four pages · rendered and reviewed at 1280 px and 390 px.
- **Not changed:** no new component (`Manual.svelte` was never needed — the manual is static route pages, which is what this static-site architecture wants), no localStorage progress tracking, no new nav item.
