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
| src/lib/nav.ts | Navigation items | UI |
| src/lib/icons.ts | SVG icon set | UI |

### Code — Routes

| Route | File | Description |
|-------|------|-------------|
| / | src/routes/+page.svelte | Dashboard with treasury, charts, unit matrix |
| /about | src/routes/about/+page.svelte | Marketing, cost savings, BCFSA paths |
| /compliance | src/routes/compliance/+page.svelte | BC compliance KB — 7 tabs |
| /roadmap | src/routes/roadmap/+page.svelte | Paths, timeline, jurisdictions |
| /tools | src/routes/tools/+page.svelte | Strata Tool hub — 30+ modules |
| /tools/wizard | src/routes/tools/wizard/+page.svelte | **Building Template Wizard** — 8-step onboarding |
| /docs | src/routes/docs/+page.svelte | Framework docs index |
| /rss | src/routes/rss/+page.svelte | RSS feeds + API reference |
| /spec | src/routes/spec/+page.svelte | OpenStrata protocol spec |
| /blog | src/routes/blog/+page.svelte | Announcements |

---

## Critical Rules

1. **Extend, don't rebuild.** SvelteKit site was built by Grok; add to it, don't replace.
2. **Do not delete** compliance.ts, strata-tool.ts, or data.ts — source of truth.
3. **Light theme only.** No dark theme without Cam approval.
4. **Hermes = software, not brokerage.** Never claim unlicensed management services.
5. **Run npm run build before every commit.** Fix all errors.
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

- **Rosa** — Compliance RAG (strict BC SPA/RTA/CRT corpus, source citations only)
- **Ziggy** — Treasury state machine (invoice → CRF cap → PSBT → reconcile)
- Bylaw locks: BLOCK_FINE_ACTIONS (14-day min), REQUIRE_QUORUM, REQUIRE_MINUTES

---

## Build & Deploy

```
cd /Users/cam/projects/openstrata
npm install
npm run dev       # localhost:5173
npm run build     # build/ folder
git add -A && git commit -m "what and why" && git push
```

Deployed via Cloudflare Pages (adapter-static, build/ folder).

---

## Cross-Platform Workflow

- **Hermes Desktop (M4):** Primary orchestration, doc updates, code review
- **Grok terminal (M3):** SvelteKit builds, git operations, heavy lifting
- **Telegram (M3/M4/Pixel 10 Pro):** Status updates, alerts, quick queries
- File edits on M3 via SSH from Hermes Desktop, or directly by Grok on M3
- Always pull before push. No force-push without Cam approval.

---

*Give A Bit — Bitcoin sovereignty first. Updated July 2026 by Hermes (M4).*
