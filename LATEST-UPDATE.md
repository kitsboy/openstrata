# OpenStrata — Last Updated 2026-08-25 by Buffy

Brief: v0.2.4 repairs the Cloudflare Pages dependency lockfile after production was found serving a stale deployment.

Release: v0.2.4
Verification: `npm ci`, `npm run build`, and `npm run audit:i18n` must pass before this release is pushed. The live deployment will be checked against the v0.2.4 marker.

Deployment repair: synchronized `package-lock.json` with `package.json`, preserving the versioned multilingual OpenStrata build.

Next work: reviewed translations for statutory/domain records and the remaining hard-coded interface copy in compliance, tools, docs, and pitch.
