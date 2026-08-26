# Hermes Strata — Workplan

**Last updated:** 2026-08-26 (v0.3.5)  
**Status:** Phases 1–3 backend complete (auth + tenancy, ledger, Rosa, Ziggy, rails prepared); per-council DB-backed units live (migration 0005); frontend wired to the live API; landing secured + tightened.

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
- [x] Full interface localization across all routes (461 catalog keys, hardened `npm run audit:i18n`)
- [x] FAQ page (/faq) and prerendered RSS feed (/rss.xml)
- [x] `npm run check` passing — 0 type errors, 0 accessibility warnings
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

## Upgrade & Enhance — 20 Items (2026-08-26)

The working list for the current push. Items 1–3 are the immediate follow-ups from
the landing security/tightening session; 4–12 deepen the product; 13–19 are the
Bitcoin/sovereign-rail advancements; 20 closes the portability loop.

**Landing & hardening (deploy-day foundation)**

1. [ ] **Verify the live site post-deploy** — pending deploy; local verification passed (fonts load once, build clean, no unallowlisted origins)
2. [x] **Pin CSP `connect-src` to the explicit API origin** — done as `scripts/generate-csp.mjs` (prebuild): pins to `CSP_API_ORIGIN`/`PUBLIC_API_BASE_URL` when set, documented `https:` fallback otherwise (commit `3ed66e7`)
3. [x] **Audit every page for the same security/tightness pass** — done: no unallowlisted loaded origins beyond fonts/analytics/Satohash; fixes were global (commit `3ed66e7` + `e113cd4`)

**Backend & product depth**

4. [x] **Monthly treasury-series endpoint** — `GET /api/v1/ledger/series` (chain-verified monthly rollups); pitch treasury chart goes live (commit `bce5967`)
5. [x] **Per-council DB-backed units** — migration `0005_council_units.sql` (`unit` table, PK `(community_id, unit_ref)`); `UnitStore` interface + `PostgresUnitStore` + `MemUnitStore`; server rewired to store-backed `/units` with `GET /units/:unitRef` unit detail (AR balance chain-verified + payment traceability), `POST /units` (treasurer+, canonicalized refs) + `DELETE /units/:unitRef` (admin); register seeds each council's own building; payment quote unitRefs canonicalized; billing AR fund aligned to `ar:unit-<n>`; frontend Form K hub gains live unit detail panel + add/remove; fixed a latent `PostgresPaymentRequestStore.markStatus` bug (`status = $3`); backend 167 tests / 16 files, frontend 45 tests, i18n 565 keys (commit pending)
6. [x] **Login rate limiting** — failure-counting fixed-window limiter per email + IP, 429 with `retry-after`, success clears the bucket (commit `3ed66e7`). Invite flow: still open signup (pending invite decision)
7. [x] **Live `cadPerBtc` rate feed** — `LiveRateProvider` (mempool.space, cached, env fallback) wired into the production entrypoint (commit `bce5967`)
8. [x] **Meeting quorum calculator + voting engine UI** — MeetingsTool (live API when signed in, identical local rules offline) (commit `f719619`)
9. [x] **Form B/F generator** — print-ready HTML certificates at `GET /api/v1/forms/b|f/:unitId` (browser → PDF) (commit `89fc0b3`)
10. [x] **Transparent sub-accounts dashboard** — SubAccounts panel: Operating/CRF/Special Levy/War Chest with chain-verified head tallies (commit `f719619`)
11. [x] **CRT evidence export** — print-ready HTML chain bundle at `GET /api/v1/compliance/crt-export` (commit `89fc0b3`)
12. [x] **Bank feed import** — CSV import seam in the e-transfer reconciler; Plaid/Flinks still need API keys (commit `f719619`)

**Bitcoin advancements (sovereign rails — the biggest unlock)**

13. [ ] **Connect the rails on the host** — pending host + daemons (LND/Liquid/PayNym/Nostr via `.env`) — user-confirmed later, alongside the LNBITS channels
14. [ ] **Real on-chain/LN broadcast in `payments/confirm`** — pending daemons; quote flow + confirm ready
15. [x] **Ziggy PSBT/multisig execution** — `buildPsbtPlan`/`recordSignature` orchestration seam + `/api/v1/treasury/psbt/plan`; hardware-wallet signing plugs into the seam (commit `4dcef0e`)
16. [x] **Watch-only xpub import UI** — `GET|POST /api/v1/rails/xpub` + XpubImport panel with per-unit BIP32 paths (commit `4dcef0e`)
17. [ ] **BOLT-12 recurring offers** — pending LND + payment channels (user-confirmed later)
18. [x] **BTC war chest DCA module** — `planDca` + `/api/v1/treasury/dca/plan` with Form B disclosure % (commit `4dcef0e`)
19. [x] **Satohash stamping** — `POST /api/v1/compliance/stamp` returns the hash-of-record + stamp URL; actual stamp call runs client-side via `src/lib/satohash.ts` (commit `4dcef0e`)

**Scale & portability**

20. [x] **OpenStrata portable export** — `GET /api/v1/export/portable` (format/council/units/accounts/rails). ON/AB/US law packs: still config-only pending jurisdiction review

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
