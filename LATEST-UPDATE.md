# OpenStrata — Last Updated 2026-08-25 by Buffy

Brief: v0.2.6 finishes the interface localization across all 14 routes, hardens the i18n audit, and ships the first French locale overrides.

Release: v0.2.6
Verification: `npm ci`, `npm run build`, and `npm run audit:i18n` must pass before this release is pushed. The live deployment will be checked against the v0.2.6 marker.

What changed: every remaining hard-coded interface string (dashboard footer, wizard, about, blog, templates, legal, roadmap, rss, spec, compliance, tools, docs, pitch) now lives in the shared catalog (458 keys); `audit:i18n` flags hard-coded text nodes, placeholders, and meta content; French (fr-CA) overrides added for all new interface copy. Statutory/domain data records stay canonical English pending professional review.

Next work: locale overrides for es, zh, hi, fil, pl, uk, sw; professional review of legal translations.
