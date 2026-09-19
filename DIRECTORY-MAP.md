# DIRECTORY MAP — OpenStrata / Hermes Strata

> **Multi-LLM Handoff Document** — any agent (Hermes, Grok, Claude, Kimi) should be able to pick up from this file and understand the entire project. This is the quick-start index; SOURCE-OF-TRUTH.md is the comprehensive reference.

---

## Project Identity

| Field | Value |
|-------|-------|
| **Name** | Hermes Strata (OpenStrata protocol) |
| **One-line** | BCFSA-aware strata ops software — cheaper, faster, provable. Fiat + optional Bitcoin. |
| **GitHub** | https://github.com/kitsboy/openstrata (branch: main) |
| **Live** | Cloudflare Pages (static SvelteKit build) |
| **Stack** | SvelteKit 2 + Svelte 5 + Tailwind 4 + Vite 6 |
| **Build** | npm install && npm run build -> build/ |
| **Contact** | hello@giveabit.io |

---

## Quick File Index

### Root Documents (read first)

| File | Purpose |
|------|---------|
| SOURCE-OF-TRUTH.md | Comprehensive project source of truth |
| docs/KIMI-HANDOFF.md | Grok-to-Kimi handoff — read before touching code |
| docs/PRODUCT-PLAN.md | Full product vision: template engine, payment rails, sub-accounts |
| docs/WORKPLAN.md | Phase tracker — Phase 1 done, Phase 2 in progress |
| docs/EXECUTIVE-SUMMARY.md | One-page pitch, problem, solution |
| docs/BCFSA-STRATEGY.md | Regulatory positioning — 3 GTM paths |

### Technical Documents

| File | Purpose |
|------|---------|
| docs/BC-STRATA-COMPLIANCE.md | BC SPA/BCFSA structured knowledge |
| docs/ROADMAP.md | Timeline: Phase 1-6, jurisdiction expansion |
| docs/I18N.md | Internationalization — shared Give A Bit translation system |
| docs/MISSION.md | Project mission, values, target users |
| docs/SEO.md + docs/SEO-{lang}.md | SEO metadata per language (en/es/fr/sw/zh/pt) |
| hermes-strata-app-framework-v2.md | Original framework spec that Grok built from |

### Code — Data Sources

| File | Purpose | Domain |
|------|---------|--------|
| src/lib/compliance.ts | BC SPA/BCFSA compliance | Regulatory |
| src/lib/strata-tool.ts | 30+ tool modules, domains, stats | Product |
| src/lib/marketing.ts | Savings math, BCFSA positioning | Marketing |
| src/lib/data.ts | Mock units, treasury, RSS, API endpoints | Data |
| src/lib/nav.ts | Navigation items (drives the top nav, footer product list, breadcrumbs AND the Cmd-K search index) | UI |
| src/lib/icons.ts | SVG icon set | UI |
| src/lib/journey.ts | Pure state for the public "start here" journey strip (localStorage-only) + `journey.test.ts` | UI |
| src/lib/setup.ts | Pure state for the dashboard setup checklist (localStorage-only) + `setup.test.ts` | UI |
| src/lib/brand-assets.test.ts | Guards the mark: the inline `BrandMark.svelte` must match `static/icon.svg` path-for-path, the favicon must stay a square simplified rendition, no shipping source may reference the retired `logo.png`, `og.png` must be 1200×630, the manifest must point at rasters, `app.html` must declare the browser-facing icons | Brand |
| src/lib/changelog.generated.ts | **Generated** from `CHANGELOG.md` by `scripts/generate-changelog.mjs` — do not edit by hand. `changelog.test.ts` fails if it drifts | Docs |
| src/lib/nav.ts | **The one authoring home for navigation.** Four inline destinations + two grouped menus; `navItems` (footer + breadcrumbs) is *derived* from it, so the two can never disagree | UI |
| src/lib/custody.ts | The `/custody` body prose (English by decision — see the note in the file; `documents.ts` and `manual.ts` follow the same rule) + `custody.test.ts` | Docs |
| src/lib/documents.ts | The print-ready document set (notice, minutes, Form B, Form F) + pure helpers (`docReference`, `addDays`, `daysBetween`, `applyNoticeParams`) + `documents.test.ts` | Docs |

### Code — UI Components (the ones worth knowing about)

| File | Purpose |
|------|---------|
| src/lib/components/HeroArt.svelte | Per-section header artwork — six on-brand motifs, drawn in `currentColor`, hidden below 900px |
| src/lib/components/BrandMark.svelte | The brush brand mark, inline SVG in `currentColor` — the same art as the favicons. Used in the header, sidebar, footer, auth card, error page and printable letterhead |
| src/lib/components/NavMenu.svelte | One grouped header menu: hover-intent open, click-to-pin, Escape / outside-click / navigation to close |
| src/lib/components/PrintDoc.svelte | The printable sheet — letterhead, reference, meta, body blocks, signature lines. Paper values, not theme tokens |
| src/lib/components/SetupChecklist.svelte | Dashboard "finish setting up" panel — 4 steps, deep links, progress, dismiss/restore |
| src/lib/components/StartHere.svelte | Public three-leg journey strip mounted under the hero band |
| src/lib/components/Tour.svelte | First-run greeter popup (step 1 hosts the intro video + offer facts) |
| src/lib/components/Card.svelte | Shared card, variants: content / compact / hero |

### Tooling — Gates & Generators (`scripts/`)

| Script | What it does | Wired into |
|--------|--------------|------------|
| `audit-i18n.mjs` | Locale parity (every locale vs French) + hard-coded-copy scan | CI + deploy checklist |
| `audit-contrast.mjs` | Recomputes WCAG 2.2 contrast for **106 token pairs** in both themes from `src/app.css`. An unresolvable token is a **failure**, not a skip | CI + deploy checklist |
| `generate-changelog.mjs` | `CHANGELOG.md` → `src/lib/changelog.generated.ts` for the public `/changelog` page | Run by hand; `changelog.test.ts` guards drift |
| `wire-hero-art.mjs` | Mounts `HeroArt` motifs on the 14 hero pages (idempotent) | One-off codemod |
| `generate-icons.mjs` | `npm run icons` — rasterises `static/icon.svg` + `favicon.svg` into `favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, and the 1200×630 `og.png` link-preview card (mark + wordmark + URL on the brand navy). Committed output; rerun after editing either vector | Run after icon art changes |
| `migrate-page-hero.mjs` | Migrated 14 hand-rolled header gradients onto `.page-hero` | One-off codemod |
| `inject-*-i18n.mjs` | Catalog injectors (journey, tour offer, setup + changelog) — the pattern for adding keys across all 9 locales | One-off |

### Code — Phase 3 Backend (`backend/`)

| File | Purpose |
|------|---------|
| backend/docker-compose.yml | Postgres+pgvector, API; Tailscale-only exposure |
| backend/src/ledger/ | Append-only trust ledger (schema, migrations, engine, PG store) |
| backend/src/rosa/ | Compliance RAG — strict retrieval + BC corpus |
| backend/src/ziggy/ | Treasury state machine — CRF cap, authorize, reconcile |
| backend/src/billing/ | Automated fee billing + late notices (posts charges to ledger) |
| backend/src/enforcement/ | Bylaw enforcement state machine (`BLOCK_FINE_ACTIONS`, fine caps) |
| backend/src/rails/ | Sovereign payment rails — onchain/LN/Liquid/PayNym (BIP-47)/Nostr validation + quoting. `receive-label.ts` builds the per-site label every invoice carries (`OST northgate U302 pay-9142`): pure, deterministic, derived from keys the payment request already persists, with `assertReceiveLabelFor` refusing a foreign label at the rail seam. 21 tests |
| backend/src/trf/recon.ts | No-guess reconciliation (mirrors front-end reconcile.ts) |
| backend/src/api/server.ts | Fastify wire-up — /health + /api/v1/* |
| backend/tests/ | Vitest — ledger, Rosa, Ziggy, billing, enforcement, rails, API routes (66 tests) |

### Code — Routes

`/custody` states where community money sits at each step, what the software cannot do, what a council can check, and what is not live yet. Chrome comes from the i18n catalog (12 keys × 9 locales); the body prose is English in `src/lib/custody.ts`. It is deliberately **not** in the header nav — the bar stays short — and is reached from the home page's 0% custody proof card, the site footer, and site search.

`/documents` is the print-ready document set (notice, minutes, Form B, Form F) — see `src/routes/documents/+page.svelte`. It is also the print target for the dashboard's notice builder (`?doc=notice&print=1…`).



| Route | File | Description |
|-------|------|-------------|
| / | src/routes/+page.svelte | Dashboard with treasury, charts, unit matrix |
| /about | src/routes/about/+page.svelte | Marketing, cost savings, BCFSA paths |
| /compliance | src/routes/compliance/+page.svelte | BC compliance KB — 7 tabs |
| /roadmap | src/routes/roadmap/+page.svelte | Paths, timeline, jurisdictions |
| /tools | src/routes/tools/+page.svelte | Strata Tool hub — 30+ modules |
| /tools/wizard | src/routes/tools/wizard/+page.svelte | **Building Template Wizard** — 8-step onboarding |
| /docs | src/routes/docs/+page.svelte | Framework docs index |
| /legal | src/routes/legal/+page.svelte | Legal source library |
| /templates | src/routes/templates/+page.svelte | Template library |
| /faq | src/routes/faq/+page.svelte | FAQ (data-driven) |
| /rss | src/routes/rss/+page.svelte | RSS feeds + API reference |
| /rss.xml | src/routes/rss.xml/+server.ts | Prerendered RSS 2.0 feed |
| /spec | src/routes/spec/+page.svelte | OpenStrata protocol spec |
| /blog | src/routes/blog/+page.svelte | Announcements |
| /changelog | src/routes/changelog/+page.svelte | **Public changelog** — generated from `CHANGELOG.md`; filter, expand/collapse, newest-first timeline |
| /pitch | src/routes/pitch/+page.svelte | Investor deck (charts from `marketing.ts`) |
| /design | src/routes/design/+page.svelte | Design-system reference — tokens, type, components, states |
| /docs/manual | src/routes/docs/manual/ | User manual (hub, welcome, quick start) |
| /privacy · /terms | src/routes/privacy/ · src/routes/terms/ | Privacy policy and terms of service |
| /thank-you | src/routes/thank-you/+page.svelte | Post-wizard confirmation + what happens next |

---

## Critical Rules

1. **Extend, don't rebuild.** SvelteKit site was built by Grok; add to it, don't replace.
2. **Do not delete** compliance.ts, strata-tool.ts, or data.ts — source of truth.
3. **Both themes are live and audited.** Light and dark both ship; any colour change must keep `npm run audit:contrast` green (106 token pairs, both themes). Never paint a fixed light surface into the dark theme — mix from theme tokens instead (this bug class has recurred twice).
4. **Hermes = software, not brokerage.** Never claim unlicensed management services.
5. **Run the gates before every commit:** `npm run check` (0 errors, 0 warnings), `npm test`, `npm run audit:i18n`, `npm run audit:contrast`, `npm run build`. Fix all errors.
6. **Satohash integration deferred** until Cam says API is ready.

---

## Product Stack (Give A Bit Trio)

| Product | Role | Status | Repo |
|---------|------|--------|------|
| Hermes Strata | Operations (this site) | Site + wizard live | kitsboy/openstrata |
| Satohash | Proof (OTS) | v4.1 in progress | kitsboy/satohash |
| OpenStrata | Portability (Nostr) | Spec phase | kitsboy/openstrata (spec route) |

---

## Agents & Workflows

- **Rosa** — Compliance RAG (strict BC SPA/RTA/CRT corpus, source citations only) — `backend/src/rosa/`
- **Ziggy** — Treasury state machine (invoice → CRF cap → PSBT → reconcile) — `backend/src/ziggy/`
- **Trust ledger** — append-only, fund-isolated (Operating/CRF/Special Levy), hash-chain diffable — `backend/src/ledger/`
- Bylaw locks: BLOCK_FINE_ACTIONS (14-day min), REQUIRE_QUORUM, REQUIRE_MINUTES

---

## Build & Deploy

```
cd /Users/cam/projects/openstrata
npm install
npm run dev       # localhost:5173
npm run check     # svelte-check — must be 0 errors, 0 warnings
npm test          # 115 tests, incl. changelog freshness + newest==package.json version
npm run audit:i18n
npm run audit:contrast
npm run build     # build/ folder (static: one .html per route)
git add -A && git commit -m "what and why" && git push
```

Deployed via Cloudflare Pages (adapter-static, build/ folder).

**After editing `CHANGELOG.md`:** run `node scripts/generate-changelog.mjs` and
re-run `npm test`, or the public `/changelog` page keeps serving the old list.

**Verifying in a browser:** the site is an installable PWA, so a stale service
worker serves the *previous* build and makes a correct deploy look broken.
Unregister the worker and drop origin caches before measuring, then check the
version marker first. See `docs/DEPLOYMENT.md`.

---

## Cross-Platform Workflow

- **Hermes Desktop (M4):** Primary orchestration, doc updates, code review
- **Grok terminal (M3):** SvelteKit builds, git operations, heavy lifting
- **Telegram (M3/M4/Pixel 10 Pro):** Status updates, alerts, quick queries
- File edits on M3 via SSH from Hermes Desktop, or directly by Grok on M3
- Always pull before push. No force-push without Cam approval.

---

*Give A Bit — Bitcoin sovereignty first. Latest revision 2026-09-18 by Buffy (M3) at **v0.3.20**. Originally assembled July 2026 by Hermes (M4).*
