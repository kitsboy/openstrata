# Known Limitations — OpenStrata

**Status:** Living register — updated as the product evolves.
**Last updated:** 2026-08-25
**Owner:** OpenStrata engineering / product

## Product & data

- **No backend yet.** All dashboard, treasury, RSS, jobs, and unit data is
  synthetic demo content in `src/lib/data.ts`. No user accounts, persistence,
  or real payments exist.
- **Satohash integration is client-only.** `src/lib/satohash.ts` exists but
  has no UI wiring; stamping requires the Satohash API to be confirmed ready.
- **API endpoints documented on `/rss` are mock references**, not live
  services.
- **Wizard output is a client-side JSON export** — no import target yet.

## Legal & content

- **Legal source library is research-level.** All sources in
  `docs/LEGAL-SOURCES.md` and `/legal` are marked "Pending counsel" and are
  NOT counsel-approved. Verify the live official source before relying on any
  rule, form, deadline, or calculation.
- **Templates require professional review.** Every template carries a
  "Professional review required" notice; none are prescribed legal forms.
- **Statutory/domain records are canonical English** — translations require
  qualified professional review before publication.
- **BC only.** ON/AB/US/EU jurisdiction packs are research placeholders, not
  reviewed law packs.

## Internationalization

- Only the shell and new interface keys have French (fr-CA) overrides.
  es/zh/hi/fil/pl/uk/sw fall back to English beyond the base shell.
- `docs/SEO-pt.md` and `docs/SEO-de.md` cover languages the site does not
  ship; hi/fil/pl/uk have no SEO docs.

## Engineering

- No automated test suite and no CI pipeline yet; the i18n audit and
  `npm run check` run locally.
- Full WCAG 2.2 AA conformance testing and a penetration test are pending
  (required before production handling of real strata records).
- Privacy policy, terms, and security docs are drafts pending the backend
  phases and a privacy impact assessment.

## Jurisdiction coverage

Supported production jurisdiction: **BC only**. Everything else is "Soon" by
design (`src/lib/data.ts` jurisdictions), and must not be marketed as
compliant until separately reviewed.
