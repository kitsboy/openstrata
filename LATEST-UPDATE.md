# OpenStrata — Last Updated 2026-08-25 by Buffy

Brief: v0.2.5 centralizes every active version marker on the package version after the deployment repair.

Release: v0.2.5
Verification: `npm ci`, `npm run build`, and `npm run audit:i18n` must pass before this release is pushed. The live deployment will be checked against the v0.2.5 marker.

Deployment repair retained: synchronized `package-lock.json` with `package.json`, preserving the versioned multilingual OpenStrata build.

Next work: reviewed translations for statutory/domain records and the remaining hard-coded interface copy in compliance, tools, docs, and pitch.
