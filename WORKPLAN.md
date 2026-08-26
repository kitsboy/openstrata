# Hermes Strata — Workplan

**Last updated:** 2026-08-26 (v0.3.6)  
**Status:** Phases 1–3 backend complete (auth + tenancy, ledger, Rosa, Ziggy, rails prepared); per-council DB-backed units live (migration 0005); frontend wired to the live API; landing secured + tightened; all 20 GUI/user-flow improvements shipped (v0.3.6); all 20 user-flow/GUI/Bitcoin improvements shipped (v0.3.7).

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

## GUI & User Flow — 20 improvements (shipped, v0.3.6)

**Aesthetic guardrails (never regress the "pretty"):** keep Manrope + DM Mono (labels/code only), the soft 2-layer card shadows, brand-orange primary accent, mesh/canvas backgrounds, 8–13px radii, and generous whitespace. Every item below enhances the existing language — no redesigns.

**A — Navigate & orient (5)**

1. [x] **Breadcrumbs on every page** — only the dashboard has them today. Add a consistent breadcrumb/eyebrow to every marketing route (About, Tools, Compliance, Legal, …), collapsible on mobile
2. [x] **Tools page sub-nav** — upgrade the existing sticky domain filter into a real sub-nav: visible current section, per-domain counts, and a "jump to live demos" item
3. [x] **"On this page" TOC with scroll-spy** — anchored, scroll-highlighted section list for long content pages (compliance, legal, docs, roadmap, spec)
4. [x] **Global ⌘K command palette everywhere** — wire search to real content (pages, FAQ, legal sources, templates, tool modules) with keyboard-first results; the dashboard's inline search box stays as a quick filter
5. [x] **Mobile bottom nav on ALL pages** — the marketing site currently dead-ends on phones; reuse the dashboard's floating-dock pattern (Home, Tools, Legal, Menu) across every route

**B — Feel alive & responsive (5)**

6. [x] **Route view transitions** — subtle SvelteKit view transition (fade + 4px slide) between pages; honors `prefers-reduced-motion`
7. [x] **Skeleton loaders for live widgets** — metrics, units matrix, reconciler, pitch charts show skeletons while fetching instead of demo-data flash → live-data flash
8. [x] **Dynamic dashboard header** — time-of-day greeting (Good morning/afternoon/evening), real today's date, and the signed-in user's name; locale-aware formatting
9. [x] **Sparklines + deltas on metric cards** — mini trend charts fed by the ledger series endpoint when live (demo walk otherwise), with a small trend label (already have ↑/+% styling — add the data)
10. [x] **Micro-interactions audit** — every clickable gets hover lift + active press + visible focus ring (many exist; fill the gaps on the dashboard, cards, modals, tables)

**C — Visual consistency (5)**

11. [x] **One icon system** — replace emoji/unicode glyphs (⌂ ▦ ◈ ⌁ ◒ ⚙ ✕ •••) with a single SVG icon set (same stroke weight) across dashboard + marketing
12. [x] **Unified card/button tokens** — one shadow, radius, border, and hover language across the hand-rolled dashboard shell and the Tailwind marketing glass-cards so it reads as one product
13. [x] **Full dark-mode audit** — every page toggles cleanly (dashboard + marketing + modals + tables); fix washed-out or unreadable surfaces
14. [x] **Typography ramp** — one heading scale + tracking across all pages; DM Mono reserved for labels/eyebrows/code; verify contrast + line-heights on every surface
15. [x] **Designed empty states** — every tool, search result, and "nothing here yet" panel gets a small mark + what-happens-next + a CTA (no bare placeholder text)

**D — Flow & trust (5)**

16. [x] **First-run tour** — 4-step dismissible highlight overlay for new councils (Sign in → New strata → Tools → Live data), shown only to signed-out/fresh signups
17. [x] **Consistent validation & messaging** — inline form errors, an error-variant toast (we only have the ✓ toast), aria-live announcements; audit every modal and input
18. [x] **Destructive-action confirmation + undo** — delete unit, remove xpub, sign-out get a confirm step; soft-delete with a 5s undo toast where feasible
19. [x] **Live-data trust chrome** — "Last synced HH:MM" + per-widget refresh button on every live widget; the Live/Demo pill stays global
20. [x] **Consistent page hero pattern** — eyebrow + title + intro + ONE primary action on every route; every page answers "what do I do here?" (some routes currently end without a next step)

---

## User Flow, GUI & Bitcoin — 20 improvements (shipped, v0.3.7)

The follow-on list, focused on the four lenses Cam set: **user flow, GUI, design, Bitcoin.**
Each item is grounded in what exists today — the gap, not a wish. The host deploy stays
the standing prerequisite for the live-rendered items (rate chrome, receipts, signing room).

**A — User flow (5)**

1. [x] **Pay-fees checkout flow** — per-unit "Pay" with quote → rail picker (fiat / Bitcoin on-chain / Lightning) → confirm → receipt. `payments/quote` + `payments/confirm` exist as API only; today a unit's fees are visible but not payable
2. [x] **"Run the month" close flow** — one guided screen: billing run → late notices → e-transfer reconciliation → Form K trail. `billing/run` + the reconciler exist; no task flow ties them together
3. [x] **Bylaw enforcement case UI** — complaint → auto-notice → 14-day BLOCK_FINE_ACTIONS lock timeline → vote → fine, with CRT-ready evidence attached at each step. The state-machine API exists; today it's a compliance KB page
4. [x] **Member & lot workspace** — one screen per owner: unit, payments, forms issued (B/F), fines, next due — the unit→payment→form traceability spine end to end. Unit detail exists; the owner/contact layer doesn't
5. [x] **"What's due" task center** — per-council deadlines: Form B 7-day clock, notice windows, AGM/CRT dates, EPR 2026. Backend has no deadline model yet — a `deadlines` endpoint first, then the UI

**B — GUI & design (5)**

6. [x] **Design-token theming** — document the token set as a theme map with an alternate BC-green "brokerage" theme (framework doc's alt), brand-orange stays default; per-page dark-mode screenshot audit
7. [x] **Real image assets** — replace placeholder/mesh visuals with product screenshots + an illustration set for empty states, the tour, and og-meta cards
8. [x] **Print & PDF polish** — tuned print stylesheets for Form B/F certificates, the CRT bundle, and ledger exports (server-side PDF stays out of scope)
9. [x] **Living design system page** — `/design` style guide rendering the tokens/components (buttons, cards, forms, toasts) so every future change stays on-language
10. [x] **Micro-copy & guidance pass** — inline "What is a CRF?" / "What is LNURL?" tooltips, command-palette category icons, and every empty state ending in a working next action

**C — Bitcoin & sovereignty UX (5)**

11. [x] **Rails status panel** — dashboard panel: enabled rails, LND/Liquid node status, live cadPerBtc + "as of HH:MM". `/rails/status` exists; today it only drives the pitch hero + Live/Demo pill
12. [x] **Multisig signing room** — pending PSBTs, 2-of-5 signature progress per transaction, QR-to-hardware-wallet, broadcast when ready. `buildPsbtPlan`/`recordSignature` seam exists; no UI
13. [x] **BTC payment receipts** — after a Bitcoin/Lightning payment: txid, sats locked, cadPerBtc at lock, Satohash stamp link on the receipt. Quote/confirm + stamp seam exist; the receipt surface doesn't
14. [x] **Wallet & address book** — registered xpub(s), per-unit receive addresses with QR + copy, per-address balance via block explorer. XpubImport exists; the usable wallet layer doesn't
15. [x] **Bitcoin education layer** — "What is a multisig / LNURL / OTS?" explainers beside every sovereign control, and the DCA module's Form B disclosure visualized (X% of CRF at risk). `dca/plan` exists

**D — Trust & data (5)**

16. [x] **Ledger explorer** — browse the hash chain per fund/unit, re-verify hashes, export a fund's trail as CSV. Balance + series APIs exist; the chain itself is invisible
17. [x] **Export center** — one place for portable JSON, CRT bundle, Form B/F PDFs, ledger CSV — extending the existing EvidenceExport panel, not a new page
18. [x] **Member & role management UI** — admin invites, role assignment (admin/treasurer/member), temp-password handoff, revoke. Backend admin-user APIs exist; no frontend
19. [x] **In-app notifications** — bell feed driven by real events (payment confirmed, Form B requested, deadline approaching, fine issued); PWA push follows
20. [x] **Honest live-rate chrome** — cadPerBtc + "as of" on every BTC-denominated quote, DCA plan, and sparkline so demo↔live is always legible

## Next 20 — Live Flows, Governance, Bitcoin & Trust (shipped, v0.3.8)

A fourth batch on the same lenses, pushing every live seam one step further:
the operations desk now answers questions, issues documents, runs votes, and
shows the chain — with the demo↔live line always legible.

**A — Live flows (5)**

1. [x] **RosaChat — compliance assistant** — ask BC strata law questions; Rosa answers with citations only and refuses to guess. Live `POST /rosa/query` when signed in; honest demo corpus locally
2. [x] **Register-your-building wizard** — guided 3-step onboarding ending in real `POST /auth/register` (creates council + admin); demo walks the same steps
3. [x] **QR scan-to-pay** — Lightning/on-chain quotes render a scannable QR + wallet deep links (lightning://, bitcoin:) via `qrcode`; honest demo quote when no host
4. [x] **Forms B/F tracker** — issue certificates with the statutory 7-day delivery countdown (per unit, overdue/urgent/ok); printable document links
5. [x] **My unit panel** — member view of their lot: AR balance, payments, occupancy; live `GET /units/:ref`

**B — Governance (5)**

6. [x] **Ballot voting engine** — resolution + roll-call tally with per-unit entitlements, all four thresholds, minutes export; live `POST /meetings/vote`
7. [x] **Bylaw case file** — CRT-ready evidence bundle (complaint → notice → 14-day lock → fine decision → minutes ref) exported as a printable file
8. [x] **Meeting notice generator** — statutory advance-window check (AGM 14d, council 7d) with print-ready notice
9. [x] **Meeting minutes export** — resolution record export from the ballot engine
10. [x] **Compliance health score** — one auditable number from deadline pressure + AR signal; formula shown under the gauge

**C — Bitcoin & sovereignty (5)**

11. [x] **On-chain balances** — per-address sats straight from mempool.space (watch-only, no backend); mempool links
12. [x] **War-chest DCA planner** — allocation % / frequency / horizon with sats per period and the Form B disclosure %; live `POST /treasury/dca/plan`
13. [x] **Live CAD/BTC rate sparkline** — rate + history trace + honest "as of HH:MM"; fed by `/rails/status` when live
14. [x] **Scan-to-pay deep links** — wallet-open URIs beside every QR (bitcoin:, lightning:)
15. [x] **Rails readiness checklist** — per-daemon status (LND / LNBits / Liquid / PayNym / Nostr) + env var to flip each one; "host pending" honesty

**D — Trust & polish (5)**

16. [x] **Ledger chain visualization** — vertical tamper-evident rail of tally roots per fund; re-verify shows chain health; live `/ledger/entries`
17. [x] **PWA offline + install** — offline banner (cached app still works) + home-screen install chip via beforeinstallprompt
18. [x] **A11y pass** — glossary popover no longer an interactive `<span>`; 0 svelte-check warnings
19. [x] **Illustrations in the tour + empty states** — the 4-step tour now leads with scene art; empty states carry ledger/bitcoin/building illustrations
20. [x] **Host-connect strip** — demo→live line on the dashboard: set the API base or sign in; dismissible

---

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
