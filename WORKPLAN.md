# Hermes Strata — Workplan

**Last updated:** 2026-08-26 (v0.3.5)  
**Status:** Phases 1–3 backend complete (auth + tenancy, ledger, Rosa, Ziggy, rails prepared); per-council DB-backed units live (migration 0005); frontend wired to the live API; landing secured + tightened; GUI/user-flow improvement list (20 items) proposed below.

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

1. [ ] **Verify the live site post-deploy** — pending deploy; local verification passed (fonts load once, build clean, no unallowlisted origins). Landing fixed this session: home renders as a standalone app shell (no marketing header/footer), all links wired to real pages, sidebar fits the viewport with scrollable nav, marketing header nav scrolls internally — verified in a real browser at 5 viewports
2. [x] **Pin CSP `connect-src` to the explicit API origin** — done as `scripts/generate-csp.mjs` (prebuild): pins to `CSP_API_ORIGIN`/`PUBLIC_API_BASE_URL` when set, documented `https:` fallback otherwise (commit `3ed66e7`)
3. [x] **Audit every page for the same security/tightness pass** — done: no unallowlisted loaded origins beyond fonts/analytics/Satohash; fixes were global (commit `3ed66e7` + `e113cd4`)

**Backend & product depth**

4. [x] **Monthly treasury-series endpoint** — `GET /api/v1/ledger/series` (chain-verified monthly rollups); pitch treasury chart goes live (commit `bce5967`)
5. [x] **Per-council DB-backed units** — migration `0005_council_units.sql` (`unit` table, PK `(community_id, unit_ref)`); `UnitStore` interface + `PostgresUnitStore` + `MemUnitStore`; server rewired to store-backed `/units` with `GET /units/:unitRef` unit detail (AR balance chain-verified + payment traceability), `POST /units` (treasurer+, canonicalized refs) + `DELETE /units/:unitRef` (admin); register seeds each council's own building; payment quote unitRefs canonicalized; billing AR fund aligned to `ar:unit-<n>`; frontend Form K hub gains live unit detail panel + add/remove; fixed a latent `PostgresPaymentRequestStore.markStatus` bug (`status = $3`); backend 167 tests / 16 files, frontend 45 tests, i18n 565 keys (commit `2c1724e`; not pushed yet)
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

## GUI & User Flow — 20 improvements (proposed)

**Aesthetic guardrails (never regress the "pretty"):** keep Manrope + DM Mono (labels/code only), the soft 2-layer card shadows, brand-orange primary accent, mesh/canvas backgrounds, 8–13px radii, and generous whitespace. Every item below enhances the existing language — no redesigns.

**A — Navigate & orient (5)**

1. [ ] **Breadcrumbs on every page** — only the dashboard has them today. Add a consistent breadcrumb/eyebrow to every marketing route (About, Tools, Compliance, Legal, …), collapsible on mobile
2. [ ] **Tools page sub-nav** — upgrade the existing sticky domain filter into a real sub-nav: visible current section, per-domain counts, and a "jump to live demos" item
3. [ ] **"On this page" TOC with scroll-spy** — anchored, scroll-highlighted section list for long content pages (compliance, legal, docs, roadmap, spec)
4. [ ] **Global ⌘K command palette everywhere** — wire search to real content (pages, FAQ, legal sources, templates, tool modules) with keyboard-first results; the dashboard's inline search box stays as a quick filter
5. [ ] **Mobile bottom nav on ALL pages** — the marketing site currently dead-ends on phones; reuse the dashboard's floating-dock pattern (Home, Tools, Legal, Menu) across every route

**B — Feel alive & responsive (5)**

6. [ ] **Route view transitions** — subtle SvelteKit view transition (fade + 4px slide) between pages; honors `prefers-reduced-motion`
7. [ ] **Skeleton loaders for live widgets** — metrics, units matrix, reconciler, pitch charts show skeletons while fetching instead of demo-data flash → live-data flash
8. [ ] **Dynamic dashboard header** — time-of-day greeting (Good morning/afternoon/evening), real today's date, and the signed-in user's name; locale-aware formatting
9. [ ] **Sparklines + deltas on metric cards** — mini trend charts fed by the ledger series endpoint when live (demo walk otherwise), with a small trend label (already have ↑/+% styling — add the data)
10. [ ] **Micro-interactions audit** — every clickable gets hover lift + active press + visible focus ring (many exist; fill the gaps on the dashboard, cards, modals, tables)

**C — Visual consistency (5)**

11. [ ] **One icon system** — replace emoji/unicode glyphs (⌂ ▦ ◈ ⌁ ◒ ⚙ ✕ •••) with a single SVG icon set (same stroke weight) across dashboard + marketing
12. [ ] **Unified card/button tokens** — one shadow, radius, border, and hover language across the hand-rolled dashboard shell and the Tailwind marketing glass-cards so it reads as one product
13. [ ] **Full dark-mode audit** — every page toggles cleanly (dashboard + marketing + modals + tables); fix washed-out or unreadable surfaces
14. [ ] **Typography ramp** — one heading scale + tracking across all pages; DM Mono reserved for labels/eyebrows/code; verify contrast + line-heights on every surface
15. [ ] **Designed empty states** — every tool, search result, and "nothing here yet" panel gets a small mark + what-happens-next + a CTA (no bare placeholder text)

**D — Flow & trust (5)**

16. [ ] **First-run tour** — 4-step dismissible highlight overlay for new councils (Sign in → New strata → Tools → Live data), shown only to signed-out/fresh signups
17. [ ] **Consistent validation & messaging** — inline form errors, an error-variant toast (we only have the ✓ toast), aria-live announcements; audit every modal and input
18. [ ] **Destructive-action confirmation + undo** — delete unit, remove xpub, sign-out get a confirm step; soft-delete with a 5s undo toast where feasible
19. [ ] **Live-data trust chrome** — "Last synced HH:MM" + per-widget refresh button on every live widget; the Live/Demo pill stays global
20. [ ] **Consistent page hero pattern** — eyebrow + title + intro + ONE primary action on every route; every page answers "what do I do here?" (some routes currently end without a next step)

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
