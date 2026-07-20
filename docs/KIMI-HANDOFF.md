## Session — 2026-07-19

**Done:**
- Added thin Satohash API client `src/lib/satohash.ts` (sha256Hex, stampHash, getApiHealth, getStamp, verifyUrl, stampGuideUrl)
- Client id `openstrata`; env `VITE_SATOHASH_API_URL` / `VITE_SATOHASH_URL` / optional `VITE_SATOHASH_KEY`
- Graceful offline (ok:false, no throw); API live at https://api.satohash.io
- No UI wiring (no integrations barrel); no secrets committed
- `npm run build` OK

**Decisions:**
- Same family client pattern as motopass/tadbuy
- No unit test runner in package.json — skipped tests

**Git State:**
- SHA: `b57f2257682b32b634ea1da0c7f1d17baeb3358a`
- Unpushed: none (pushed main)

---

# KIMI HANDOFF — Hermes Strata / OpenStrata

**Date:** July 2026  
**From:** Grok (Cursor on M3) — "Big Daddy" build session  
**To:** Kimi (HERMES Orchestrator on M4)  
**Project folder:** `/Users/cam/projects/openstrata` (sync via Tailscale / git pull)

---

## ⚠️ READ THIS ENTIRE FILE BEFORE TOUCHING ANYTHING

Cam is handing this to you. **Another agent (Grok) built the current site and docs on M3.** Your job is to **extend, not rebuild**. The site works. The docs are the source of truth. Do not "improve" by deleting and starting over.

---

## What Exists (DO NOT MESS UP)

### Live SvelteKit Site
- **Stack:** SvelteKit 2, Svelte 5, Tailwind 4, adapter-static
- **Build:** `npm run build` → `build/` folder
- **Repo:** https://github.com/kitsboy/openstrata (branch: `main`)

### Pages Already Built
| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ Live | Supercharged dashboard — graphs, live stats, 8 modules |
| `/about` | ✅ Live | Cost savings, BCFSA paths, product stack |
| `/compliance` | ✅ Live | 7-tab BC compliance KB — DO NOT DELETE |
| `/roadmap` | ✅ Live | Paths, timeline, jurisdictions |
| `/tools` | ✅ Live | Strata Tool hub — 30+ modules |
| `/docs` | ✅ Live | Framework docs index |
| `/rss` | ✅ Live | Feeds + API docs |
| `/spec` | ✅ Live | OpenStrata spec |
| `/blog` | ✅ Live | Posts |

### Critical Data Files (source of truth in code)
- `src/lib/compliance.ts` — SPA workflows, quorum, voting, retention
- `src/lib/strata-tool.ts` — 30+ modules across 7 domains
- `src/lib/marketing.ts` — BCFSA facts, cost savings, positioning
- `src/lib/data.ts` — mock data, jobs, units, API endpoints
- `public/logo.png` — brand logo (orange strata on black)

### Docs (markdown archive)
- `docs/BC-STRATA-COMPLIANCE.md`
- `docs/EXECUTIVE-SUMMARY.md`
- `docs/PRODUCT-PLAN.md`
- `docs/WORKPLAN.md`
- `docs/BCFSA-STRATEGY.md`
- `docs/ROADMAP.md`
- `SOURCE-OF-TRUTH.md` (root)
- `hermes-strata-app-framework-v2.md` (root)

---

## Regulatory Context You Must Understand

**Hermes Strata is SOFTWARE, not a licensed management company.**

BCFSA requires licensed brokerages for management services. We compete by:

1. **Selling to licensed brokerages** — they use Hermes for ops (compliant)
2. **Selling to self-managed councils** — owners manage themselves (SPA permits, no license)
3. **Hybrid** — council runs Hermes; licensed broker handles trust oversight

**Never position Hermes as providing unlicensed management services.**

Full strategy: `docs/BCFSA-STRATEGY.md`

---

## Product Stack (Three Give A Bit Projects)

| Product | URL | Role | Status |
|---------|-----|------|--------|
| Hermes Strata | openstrata site | Operations | **This project — site live** |
| Satohash | satohash.io | Proof (OTS) | v4.1 in progress — Cam will need help later |
| OpenStrata | protocol spec | Portability | Spec page live |

**Integration plan:** Satohash stamps payments/votes/rules. Hooks are stubbed in strata-tool.ts (`satohash-stamp` module, status: planned). Do not build Satohash integration until Cam says Satohash API is ready.

---

## Your Next Tasks (Priority Order)

### 1. Ingest (Day 1) — DONE
- [ ] Pull latest from `github.com/kitsboy/openstrata` main
- [x] Read ALL docs/ files + SOURCE-OF-TRUTH.md
- [x] Add to Obsidian MASTER-BRAIN under "Hermes Strata / OpenStrata"
- [x] Confirm to Cam: "Ingested. Build passes. Ready to extend."

### 2. Do NOT Do These Things
- ❌ Do not rebuild the site in React/Next.js
- ❌ Do not delete compliance.ts or strata-tool.ts
- ❌ Do not remove the logo or change brand without Cam approval
- ❌ Do not dark-theme the site (light theme is intentional)
- ❌ Do not add backend/API yet without Cam approval (Phase 3)
- ❌ Do not claim Hermes is a licensed management company

### 3. Phase 2 — Building Template Wizard (LIVE at /tools/wizard)
Cam wants this next. See `docs/PRODUCT-PLAN.md` → Building Template Engine.

Wizard steps:
1. ✅ Pick jurisdiction (BC default)
2. ✅ Enter building address + unit count
3. ✅ Configure funds (Operating, CRF, sub-accounts)
4. ✅ Add/remove units
5. ✅ Toggle services (landscaping, pool, etc.)
6. ✅ Select payment rails (e-transfer default, Lightning opt-in)
7. ✅ Import bylaws or use BC Standard pack
8. ✅ Review → generate building config JSON

Create as new route: `/tools/wizard` or `/onboard`

### 4. Educate Hermes (M4 Agent)
Tell Hermes about:
- Five functional domains (financial, assets, governance, meetings, conveyancing)
- Rosa = compliance RAG, Ziggy = treasury state machine
- Bylaw workflow locks: `BLOCK_FINE_ACTIONS` for 14 days
- BCFSA three paths (brokerage, self-managed, hybrid)
- Satohash proof layer (when ready)

### 5. Coordinate Satohash (When Cam Ready)
Satohash is NOT finished. When Cam asks:
- Read `/Users/cam/projects/satohash/SOURCE-OF-TRUTH.md`
- Strata-specific templates needed: fee receipt, council resolution, Form B/F, lease
- Integration point: `POST /api/v1/compliance/stamp` → Satohash OTS API

---

## Build Commands

```bash
cd /Users/cam/projects/openstrata   # or synced path on M4
npm install
npm run dev      # dev server
npm run build    # production build — MUST pass before any commit
```

**Always run `npm run build` before committing.** Fix any errors.

---

## Git Discipline

- Branch: `main` (unless Cam says otherwise)
- Commit messages: complete sentences, describe what and why
- Do not force-push
- Pull before push

---

## Confirmation Format

When you've ingested this handoff, reply to Cam with:

```
✅ KIMI HANDOFF CONFIRMED — Hermes Strata

Ingested:
- [list files added to Obsidian]

Reviewed:
- [confirm build passes]
- [confirm pages load]

Understood:
- Software not brokerage
- Three GTM paths
- Satohash integration deferred
- Light theme, logo, compliance KB preserved

Next ready:
- Building Template Wizard LIVE at /tools/wizard — awaiting Cam review
```

---

## Questions for Cam (if needed)

1. Is Satohash API ready for integration stub?
2. Preferred path for wizard: `/onboard` or `/tools/wizard`?
3. Any licensed brokerage partner lined up for pilot?
4. Self-hosted Docker stack priority vs cloud SaaS?

---

## Latest Session Summary (from 2026-07-01 goodbye)

**Chat topic:** Built full Hermes Strata platform from framework doc; supercharged with BCFSA strategy, Strata Tool hub, executive docs; Kimi added wizard.

**Finished this session:**
- Complete marketing site (/, /about, /tools, /compliance, /roadmap, /docs, /rss)
- 30+ Strata Tool modules in `strata-tool.ts`
- BC compliance KB triple-retained
- Executive docs + BCFSA strategy + SOURCE-OF-TRUTH
- Building Template Wizard at `/tools/wizard` (your build — 8 steps, JSON export)
- DIRECTORY-MAP.md for multi-agent recovery
- Build passes

**Still to do:**
- E-transfer auto-reconciliation prototype
- Phase 3 Docker backend (Rosa + Ziggy)
- Satohash OTS integration (when Cam ready)
- Payment rails (Lightning)
- Executive summary fancy deck (Gamma/docx — Cam's choice)

**Next for Kimi:**
- Integrate SESSION-SUMMARY-2026-07-01.md into MASTER-BRAIN
- Await Cam review of wizard
- Do NOT rebuild site — extend only
- Phase 2 payments at Cam's direction

**Recovery file:** `SESSION-SUMMARY-2026-07-01.md`

---

## Latest Session Summary (from 2026-07-01 goodbye — session 2)

**Chat topic:** Recovered via whatsup; built live `/pitch` investor deck; rebranded logo to Opens Strata / Always Open · Give A Bit; cleaned About and Docs pages.

**Finished in this session:**
- `/pitch` — 7-slide investor deck, charts from `marketing.ts`, nav link added
- Logo rebrand: Opens Strata / Always Open · Give A Bit (header + footer)
- `/about` — all Hermes mentions removed; Auto E-Transfer + E-Transfer + Lightning labels
- `/docs` — removed Kimi Handoff and Hermes Framework v2 cards from public index
- Pushed to main: `ea682df`, `6ab5fec`

**Still to do:**
- Confirm Opens Strata vs OpenStrata spelling with Cam
- Update SOURCE-OF-TRUTH routes (+ `/pitch`) and branding notes
- E-transfer auto-reconciliation prototype (Phase 2)
- Phase 3 Docker backend (Rosa + Ziggy)
- Satohash integration when Cam ready
- Executive deck (Gamma/docx — Cam's choice)

**Next for Kimi:**
- Integrate this summary into MASTER-BRAIN / Kanban
- Note public rebrand — do NOT revert logo text without Cam
- Extend site only — do NOT rebuild
- Phase 2 payments at Cam's direction

**Recovery file:** `SESSION-SUMMARY-2026-07-01.md` (session 2 section)

---

*Built with love by Grok on M3. Handed to Kimi on M4. Cam orchestrates both. Give A Bit forever.*