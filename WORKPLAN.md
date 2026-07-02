# Hermes Strata — Workplan

**Last updated:** July 2026 (Hermes Desktop update — wizard live)  
**Status:** Phase 1 complete (marketing site). Phase 2 in progress.

---

## Phase 1 — Foundation ✅ COMPLETE

- [x] Light-themed Hermes Strata marketing site (SvelteKit + Tailwind)
- [x] Live dashboard with treasury, occupancy, EPR, unit matrix, charts
- [x] BC Compliance knowledge base (/compliance, compliance.ts, BC-STRATA-COMPLIANCE.md)
- [x] RSS & API hub (/rss)
- [x] Strata Tools interactive modules (/tools)
- [x] Docs, Spec, Blog pages
- [x] Footer: careers dropdown, BTC/LN donate modal, social icons
- [x] Brand logo, jurisdiction selector
- [x] Triple knowledge retention (UI + code + markdown)

## Phase 2 — Supercharge & Document (CURRENT)

- [x] Executive summary, workplan, BCFSA strategy docs
- [x] Kimi handoff prompt (SOURCE-OF-TRUTH + KIMI-HANDOFF)
- [x] Full Strata Tool module map (30+ modules)
- [x] About page with cost savings, product stack, BCFSA paths
- [x] Roadmap/paths page
- [x] Supercharged homepage with graphs and competitive facts
- [x] Building Template Wizard (onboarding flow) — live at /tools/wizard
- [ ] E-transfer auto-reconciliation prototype

## Phase 3 — Core Product (Q3 2026)

- [ ] Docker stack: Rosa RAG + Ziggy treasury + API + web
- [ ] Multi-account trust ledger (Operating, CRF, Special Levy)
- [ ] Automated fee billing + late notices
- [ ] Form B/F generator with deadline tracking
- [ ] Bylaw enforcement state machine API (BLOCK_FINE_ACTIONS)
- [ ] Meeting quorum calculator + voting engine
- [ ] PWA manifest + service worker

## Phase 4 — Sovereign Layer (Q4 2026)

- [ ] Satohash API integration (payment/rule stamping)
- [ ] Lightning LNURL with CAD rate lock
- [ ] Nostr npub per unit identity
- [ ] External multisig watch-only (xpub import)
- [ ] CRT evidence export (PDF bundle)
- [ ] Transparent sub-accounts (Pool, Garden, War Chest)

## Phase 5 — Scale (2027+)

- [ ] Licensed brokerage multi-building dashboard
- [ ] Bank feed import (Plaid/Flinks)
- [ ] BOLT-12 recurring offers for monthly fees
- [ ] BTC war chest DCA module
- [ ] Agent payments (HERMES/Grok orchestration)
- [ ] ON/AB/US law packs via config.yaml
- [ ] OpenStrata portable export format

---

## File Map (do not break)

```
openstrata/
├── docs/
│   ├── BC-STRATA-COMPLIANCE.md    # SPA/BCFSA compliance KB
│   ├── EXECUTIVE-SUMMARY.md       # Executive doc
│   ├── WORKPLAN.md                # This workplan
│   ├── BCFSA-STRATEGY.md          # Competitive/regulatory strategy
│   ├── PRODUCT-PLAN.md            # Full product vision
│   ├── ROADMAP.md                 # Timeline and paths
│   └── KIMI-HANDOFF.md            # Handoff prompt for M4 Kimi
├── DIRECTORY-MAP.md               # Multi-LLM handoff index
├── SOURCE-OF-TRUTH.md             # Project source of truth
├── hermes-strata-app-framework-v2.md
├── public/logo.png
├── src/
│   ├── lib/
│   │   ├── compliance.ts          # Structured compliance data
│   │   ├── data.ts                # Mock data, API endpoints, jobs
│   │   ├── marketing.ts           # Facts, savings, positioning
│   │   ├── strata-tool.ts         # 30+ tool modules
│   │   ├── nav.ts                 # Navigation items
│   │   └── components/            # UI components
│   └── routes/
│       ├── +page.svelte           # Dashboard (homepage)
│       ├── about/+page.svelte     # About / marketing
│       ├── compliance/+page.svelte
│       ├── roadmap/+page.svelte   # Paths and timeline
│       ├── tools/+page.svelte     # Strata Tool hub
│       ├── tools/wizard/+page.svelte # Building Template Wizard
│       ├── docs/+page.svelte
│       ├── rss/+page.svelte
│       ├── spec/+page.svelte
│       └── blog/+page.svelte
```

---

## Build & Deploy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output to build/
```

Deployed via Cloudflare (adapter-static).
