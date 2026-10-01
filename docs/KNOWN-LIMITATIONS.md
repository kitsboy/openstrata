# Known Limitations — OpenStrata

**Status:** Living register — updated as the product evolves.
**Last updated:** 2026-09-30
**Owner:** OpenStrata engineering / product

## Correction — 2026-09-30

The 2026-08-25 bullets below are superseded where they conflict with this note.

- A backend exists under `backend/` (Fastify, Postgres, Tailscale-only). The public site still runs in demo mode. There is no public API to register against.
- The frontend suite is 248 tests (`npm test` at the repo root, verified 2026-09-30). The backend suite is `npm test` inside `backend/` (229 tests last recorded at v0.3.26; re-run before relying on that count).
- Evergreen House (`src/lib/demo/`) is sample data for a 40-lot building. Payment destinations are not payable. The tax desk is a sample, not a filing, and not tax advice.
- The current UI polish queue is four items, offered and not started. See [ROADMAP.md](ROADMAP.md). The interface keeps being refined as the product grows: after every push that changes what a person sees, offer exactly four concrete upgrades and wait for a pick of one or two. When a pick ships, replace it so four remain.

## Product & data

- **Superseded 2026-09-30 — a backend exists.** The old line "no backend yet" is false. Dashboard figures on the public site are still sample data. Evergreen House is the demo building. Signed-in councils use the self-hosted API. Real payments are not connected on the public site.
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

- **Superseded 2026-09-30 — nine locales ship in the catalog.** `npm run audit:i18n` checks parity. The 2026-08-25 line that es/zh/hi/fil/pl/uk/sw fall back to English beyond the shell is false for catalog chrome. Statutory, custody, and the Evergreen House pages stay canonical English on purpose. Nothing here is a counsel-reviewed translation.
- `docs/SEO-pt.md` and `docs/SEO-de.md` cover languages the site does not
  ship; hi/fil/pl/uk have no SEO docs.

## Engineering

- **Superseded 2026-09-30 — tests exist.** Frontend `npm test` (248 as of 2026-09-30), backend `npm test`, `npm run check`, and `npm run audit:i18n`. The 2026-08-25 line "no automated test suite" is false.
- Full WCAG 2.2 AA conformance testing and a penetration test are pending
  (required before production handling of real strata records).
- Privacy policy, terms, and security docs are still drafts pending a privacy
  impact assessment. A backend existing does not make those drafts approved.

## Jurisdiction coverage

Supported production jurisdiction: **BC only**. Everything else is "Soon" by
design (`src/lib/data.ts` jurisdictions), and must not be marketed as
compliant until separately reviewed.
