# GROK BOOT — READ THIS EVERY SESSION

**This file lives in every repo's `ref/` directory.** Every time you open this project, read `ref/GROK-BOOT.md` first.

## Required: Add analytics + metrics to this project

Before making any code changes, do this:

**Step 1 — Umami tracking script** ✅

In `src/app.html` `<head>`:

```html
<script defer src="https://analytics.giveabit.io/script.js" data-website-id="b918844c-2503-4dcd-bef2-66c103a0ee13"></script>
```

Website ID for **openstrata.giveabit.io**: `b918844c-2503-4dcd-bef2-66c103a0ee13`  
Full table: HQ `docs/UMAMI-DEPLOYMENT.md`. Host is THOR Umami on `:3002` — public name should reverse-proxy to `analytics.giveabit.io`.

**Step 2 — /metrics.json endpoint** ✅

`static/metrics.json` (SvelteKit → build root) + `public/metrics.json` mirror with `gab.product-metrics.v1`.

OpenStrata KPIs (from https://hq.giveabit.io/docs/ALL-SITE-METRICS.md):

| Metric | Type | Source |
|--------|------|--------|
| entities_total | KPI | Demo template entity (live registry later) |
| jurisdictions_supported | KPI | `src/lib/data.ts` jurisdictions (5) |
| documents_filed | KPI | SPA s.35 `recordRetention` types (10) |
| compliance_score | KPI | Product readiness percent (85) |

**Step 3 — Push ref/ docs to this repo**

Keep `ref/GROK-BOOT.md` current. Commit + push.

## Why this matters

THOR's HQ pulls analytics + metrics from every product. Without Umami + `/metrics.json`, this product shows demo data on the ops glass. With them, it shows live visitors and product KPIs.

## Need help?

Ask Kimi on THOR (via Hermes).
