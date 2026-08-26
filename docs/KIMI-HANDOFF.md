## Session — 2026-08-26 · CI FIX — Postgres e2e smoke green (Grok THOR / Kimi lane)

**Cam flagged the red CI run (push `0969190`). Root-caused + fixed + CI green.** Commit `f371aed`, all 3 CI jobs success (frontend verify · backend typecheck+tests · backend Postgres e2e smoke 6/6).

**Four backend root causes (all only appeared against REAL Postgres — unit tests and the in-memory adapters were green, which is why this sat red):**
1. `backend/src/ledger/store.ts` `createAccount` — `VALUES ($1, $1, $3)` leaves an untyped parameter slot `$2` → Postgres `42P18 could not determine data type of parameter $2`. Fixed → `VALUES ($1, $2, $3)`.
2. `nextSeq` — `LOCK TABLE` outside a transaction → `25P01`. Wrapped the lock+read in `BEGIN/COMMIT` (with ROLLBACK on error).
3. `backend/src/rails/payment-store.ts` `save()` — transposed args: params `(communityId, refId, unitRef)` against columns `(ref_id, unit_ref, community_id)` → rows stored with community_id="302" and ref_id="<councilId>", so `findByReference`/`confirm` never matched (`unknown referenceCode`). Reordered params to match columns.
4. node-postgres returns BIGINT as **strings** — `seq`, `amount_basis`, balances came back as strings and broke the strict `e.seq !== expected` chain check (`tampering: gap in chain`) + numeric assertions. Added `backend/src/db/int8.ts` (global int8/int4→number parser), imported by all five pg stores (ledger, payment, auth, units, members).

**Also:** bumped `actions/checkout@v4→@v5`, `actions/setup-node@v4→@v5` (clears the Node-20 deprecation annotations); relabelled the migrate step (it applies ALL migrations, not just 0001..0004).

**Verified locally first:** fresh pgvector/pg17, migrate 6/6, e2e smoke 6/6 pass, unit 173 pass / 6 skipped (DB unset), `tsc --noEmit` clean. Then pushed and confirmed the real GitHub Actions run `33016663408` → `completed/success` on all three jobs.

**For whoever codes next:** if the backend grows more BIGINT-carrying queries, keep them numeric via the shared int8 parser — never mix string/number comparisons on pg numeric columns. The e2e smoke (`DATABASE_URL` set) is the only gate that catches these adapter bugs; run it before any backend PR.

---
## Session — 2026-08-26 (next 20 shipped — live flows, governance, Bitcoin & trust, v0.3.8)

**Task:** "Next 20, end to end. Commit and push in batches."

**Shipped in 2 code commits + docs (`7a3d443` components · `0329de8` wiring), pushed to `origin/main`.**

**Live flows (Batch 1):** `RosaChat` — citation-only BC compliance Q&A via `POST /rosa/query` when signed in, honest demo corpus locally (SPA s.141/s.133/s.92/s.94 patterns + fail-closed refusal); `WizardRegister` — guided 3-step onboarding ending in real `POST /auth/register`; `QrPay` — QR scan-to-pay (`qrcode`) with `lightning://` / `bitcoin:` wallet deep links, wired into CheckoutFlow with an honest demo-quote fallback; `FormsPanel` — Form B/F issuance with the statutory 7-day delivery countdown (`/forms` API + new `forms.ts` helpers); `MyUnitPanel` — member view of lot/AR/payments via `GET /units/:ref`.

**Governance (Batch 2):** `BallotEngine` — resolution + roll-call tally (majority / 3/4 / 80% / unanimous), live `POST /meetings/vote`, minutes export; `BylawCaseFile` — CRT-ready evidence bundle export (complaint → notice → 14-day lock → fine decision → minutes ref); `MeetingNotice` — statutory advance-window check (AGM 14d, council 7d) + print; `HealthScore` — auditable compliance score from deadline pressure + AR (formula shown under the gauge); minutes export lives in BallotEngine.

**Bitcoin (Batch 3):** `MempoolBalances` — watch-only per-address sats from mempool.space (no backend); `DcaPlanner` — allocation/frequency/horizon + sats per period + Form B disclosure % (`POST /treasury/dca/plan` live, mirrored math locally); `RateSparkline` — live CAD/BTC + history trace + "as of HH:MM"; `RailsReadiness` — per-daemon status (LND/LNBits/Liquid/PayNym/Nostr) with env vars, honest "host pending".

**Trust & polish (Batch 4):** `ChainViz` — vertical tamper-evident hash-chain rail per fund with re-verify (`/ledger/entries`); `PwaChrome` — offline banner + `beforeinstallprompt` install chip; a11y — Glossary popover click handler removed (0 svelte-check warnings); illustrations — the 4-step tour now leads with scene art + EmptyState gained a `scene` prop (ledger/bitcoin/building); `HostConnect` — demo→live strip on the dashboard (set API base / sign in, dismissible). New API modules: `rosa.ts`, `forms.ts`.

**Mounted:** tools desk leads with RosaChat + wizard; FormsPanel/MyUnit/BallotEngine/MeetingNotice/HealthScore/case-file/MempoolBalances/DcaPlanner/RateSparkline/RailsReadiness/ChainViz join the grids; dashboard right stack gains HealthScore + RateSparkline + ChainViz; PwaChrome + HostConnect in the app shell.

**Verified in a real browser (Chrome + CDP):** zero horizontal overflow at 390/800/1280px on home + tools; Rosa answers "short-term rental rules" with SPA s.141 citation (InputEvent-triggered); ballot tallies; QR renders; 4-step tour completes and dismisses forever (localStorage, survives reload). Checks: backend 173, frontend **78 tests** (+8, incl. forms deadline math + deep-link derivation), i18n **893 keys × 9 locales** (+156, idempotent key-adder), svelte-check 0/0, build clean, marker v0.3.8.

---

## Session — 2026-08-26 (all 20 user-flow/GUI/Bitcoin improvements shipped, v0.3.7)

**All 20 items executed end to end, batched, pushed (`02dfd07` backend + `0d1f1e1` frontend).**

**Backend (+6 tests → 173):** migration `0006_council_members` (`council_member` keyed `(community_id, email)`), `MemberStore` + Postgres/Mem adapters seeded from unit owners at register, tenant-scoped `GET|POST /api/v1/members` + `GET /members/unit` + `DELETE /members/:id`; `LedgerEngine.entries()` + `GET /api/v1/ledger/entries?fund=` (verified hash chain for the explorer/CSV); `GET /api/v1/deadlines` (statutory calendar — EPR/depreciation/AGM — plus open payment quotes, urgent-first).

**Frontend (+10 tests → 70, i18n 680 keys × 9 locales):**
- **User flow:** CheckoutFlow (pay-fees: quote any rail → confirm → receipt with sats/locked CAD-BTC/Satohash stamp), MonthlyClose (billing run → late notices → ledger post), BylawCase (complaint → notice → 14-day BLOCK_FINE_ACTIONS lock → fine/no-fine), MemberWorkspace (owners per lot), DeadlinesPanel ("What's due").
- **GUI/design:** brand-accent theming (orange ↔ BC-green brokerage via `data-accent` palette, topbar toggle), `/design` living style-guide page, inline SVG illustration set, print stylesheet, glossary explainers (CRF/multisig/LNURL/OTS/DCA).
- **Bitcoin:** RailsStatus (enabled rails + live CAD/BTC as-of), SigningRoom (PSBT progress + broadcast), WalletPanel (xpub + per-unit addresses, copy + mempool links), receipts integrated into checkout.
- **Trust/data:** LedgerExplorer (verified chain + CSV), ExportCenter (portable JSON/CRT/Form B/F/ledger CSV), MemberManager (admin invites + temp passwords), NotificationsFeed (bell from real deadlines), RateBadge ("as of HH:MM").
- New API helper modules: payments, billing, bylaw, members, deadlines, ledger entries, admin users.

**Verified in a real browser:** zero horizontal overflow 390→1698px on home + tools (fixed glass-card grid min-width blowout + tablet topbar); accent toggle → `data-accent="green"`, glossary popover, /design page, panels render. Checks: backend 173, frontend 70, svelte-check 0/0, i18n parity green, build clean, marker v0.3.7.

---

## Session — 2026-08-26 (all 20 GUI & user-flow improvements shipped, v0.3.6)

**Task:** "Execute all 20 GUI improvements end to end with tests, batching and pushing like the last list."

**Shipped in 4 batched commits + docs, all pushed to `origin/main`:**
- **Batch 1 — Foundation (`eac768f`):** **one SVG icon system** (#11 — 30+ stroke icons in `src/lib/icons.ts` replacing ⌂▦◈⌁§⌕♢⚙☀️🌙☰… glyphs across the dashboard shell, marketing header, search modal, modals, mobile nav, metric icons, activity list); **real `glass-card` tokens** (#12 — `.glass-card` was referenced on 60+ marketing cards but NEVER defined, so those cards rendered as bare text on the mesh background; it now resolves to the same soft 2-layer card language as the dashboard, with shared `--radius-card/--shadow-card/--border-card` tokens applied to metric/panel/building/action cards); **dark-mode audit** (#13 — slate tokens were already remapped; the invisible glass-cards were the real gap, now themed + `tooltip-bubble` defined for the tools-page tooltips); **typography ramp** (#14 — one heading voice, tight tracking, DM Mono reserved for labels); **designed empty states** (#15 — new `EmptyState` component: mark + message + next-step CTA, used in dashboard search, notifications, unit payments)
- **Batch 2 — Navigation (`b40dc69`):** **breadcrumbs on every page** (#1 — `Breadcrumbs` component in the marketing layout, DM Mono trail matching the dashboard's); **tools sub-nav** (#2 — per-domain counts + "Jump to live demos" anchor); **scroll-spy TOC** (#3 — `PageToc` on legal/docs/spec/roadmap, assigns h2 ids, IntersectionObserver highlight, sticky card, hidden <1024px); **⌘K palette indexes tool modules** (#4 — new `tools` search group so the global palette searches the strata-tool catalog; dashboard ⌘K already global via layout); **mobile bottom nav on ALL pages** (#5 — the dashboard's floating dock reused on every marketing route)
- **Batch 3 — Alive (`01609f3`):** **view transitions** (#6 — `onNavigate` + `document.startViewTransition`, fade + 4px slide, honors reduced-motion); **shimmer skeletons** (#7 — `Skeleton` component in dashboard metric cards with a 2.5s safety timer, unit-detail panel); **dynamic dashboard header** (#8 — time-of-day greeting (3 new i18n keys), real today's date, signed-in user's first name); **metric sparklines + deltas** (#9 — `Sparkline` fed by the live `/ledger/series` when signed in, demo walk otherwise); **micro-interactions** (#10 — hover lift + active press + focus rings on every clickable)
- **Batch 4 — Trust (`584dbb4`):** **first-run tour** (#16 — 4-step dismissible overlay for fresh signed-out visitors, localStorage-remembered, Escape/scrim/Skip/Next); **validation & messaging** (#17 — error-variant toast + inline form error on New Strata with `nameRequired`); **destructive confirmation** (#18 — `ConfirmDialog` for remove-unit and sign-out); **live-data trust chrome** (#19 — `LiveSync` "Last synced HH:MM" + per-widget refresh on SubAccounts); **hero pattern** (#20 — every page now answers "what do I do here": eyebrow + title + intro + ONE primary action added to FAQ (→ Strata Tool), Blog (→ RSS & API), Roadmap (→ Strata Tool), Legal (→ Templates))
- **Bonus fix found in verification:** the marketing header's actions cluster overflowed ~20–52px at tablet widths (768–800px) — the jurisdiction picker now shows at `lg+` only; **re-verified zero horizontal overflow at 390/640/768/800/900/1024/1280/1440/1698px** in a real browser

**Verified in a real browser (system Chrome + CDP):** fresh-visitor home shows the tour overlay (dismisses permanently), dashboard renders sidebar + 2 metric sparklines with zero overflow, `/tools` at 390px has zero overflow + the mobile dock, click-through sidebar Legal → `/legal` loads with the TOC visible.

**Checks:** svelte-check **0/0**, frontend **56 tests** (+11: search index, Sparkline, Tour, ConfirmDialog), build + prerender clean, i18n **588 keys × 9 locales** parity green. Version bumped to **v0.3.6** everywhere (package.json, both lockfiles, CHANGELOG, README, MISSION, EXECUTIVE-SUMMARY).

**Git State:** commits `eac768f`, `b40dc69`, `01609f3`, `584dbb4` + docs commit pushed to `origin/main`.

**Remaining (unchanged, all infra-gated):** #1 live-site verify (needs deploy), #13 rails on host (LND/Liquid/PayNym/Nostr), #14 on-chain/LN broadcast (daemons), #17 BOLT-12 (LND + channels — LNBITS node exists, channels not yet established). The 20 GUI items are all marked done in WORKPLAN.md.

---

## Session — 2026-08-26 (landing page fixed: standalone app shell + working links)

**User report:** on https://openstrata.giveabit.io/ none of the links worked, the page slid sideways under the sidebar, and the sidebar's bottom buttons (help + status footer) were below the fold. "We MUST finish the landing page."

**Root cause (measured in a real browser at 1698×1012):** the dashboard home page was nested inside the marketing layout — that double-shell broke everything:
- The marketing header (brand + 11-item nav + actions) needed ~1570px min content, so any viewport below ~1780px overflowed horizontally → the page "slides sideways" and content passes under the fixed sidebar
- The sidebar is `position: fixed; height: 100vh` but sat 105px down (below the marketing header) → its bottom landed at 1117 in a 1012px viewport → help + status-footer buttons unreachable
- Links: the dashboard footer was 14 × `href="/"`; sidebar nav was toast-buttons; nothing navigated

**Fixed:**
- **`+layout.svelte`**: the home page now renders bare — a standalone full-height app shell (its own sidebar + topbar + footer); the marketing header/footer only wrap non-home pages. Marketing header's 11-item center nav is now an internally-scrollable strip (`flex-1 min-w-0 overflow-x-auto`, scrollbar hidden) so it never pushes the page wide
- **`app.css`**: sidebar `height: 100dvh` (fits the viewport exactly since there's nothing above it anymore), `nav-groups` becomes the scroll region (`flex: 1; min-height: 0; overflow-y: auto`) so short viewports scroll the nav instead of clipping the footer
- **`+page.svelte` (all links wired to real pages):** sidebar nav (Overview → `/`, Buildings → `/tools`, Governance → `/compliance`, Operations/Finances → `/tools`, Legal → `/legal`, Insights → `/roadmap`), the "Need a hand" box → `/faq`, "View all" → `/tools`, mobile bottom nav → links, and the dashboard footer's 14 dead `href="/"` links → real routes (`/tools`, `/compliance`, `/legal`, `/templates`, `/faq`, `/blog`, `/rss`, `/spec`, `/docs`, mailto, GitHub). Added a theme toggle to the dashboard topbar (it lost the marketing header's one); removed the dead `selectNav`/`active` toast-nav

**Verified in a real browser (system Chrome + CDP) at 1698, 1440, 1280, 1024 and 390px widths:** `scrollWidth == clientWidth` everywhere (zero horizontal overflow), sidebar `top: 0` and `bottom == viewport height` with **help + footer buttons visible at every size**, click-through confirmed (sidebar Legal → `/legal` loads), `/tools` header scrolls internally with no page overflow. Build + svelte-check 0/0 + 45 tests + i18n audit all green.

**Git State:** committed as **`15605b1`** — "Fix landing page: standalone app shell, working links, no overflow" (7 files, +88/−44), pushed to `origin/main` (branch in sync).

---

## Session — 2026-08-26 (per-council DB-backed units, v0.3.5)

**Done (#5 — per-council DB-backed units, the largest remaining tenancy step):**
- **Migration `0005_council_units.sql`:** `unit` table keyed on `(community_id, unit_ref)` — each council owns its own building; tenant scoping for unit master data
- **`UnitStore` interface** (`backend/src/units/store.ts`) + **`PostgresUnitStore`** (`pg-store.ts`, migration 0005) + **`MemUnitStore`** (test harness) — `list/get/upsert/remove/seedDefault`
- **Server rewired to store-backed `/units`** with registry fallback (demo scaffold keeps working): `GET /units` (tenant-scoped), `GET /units/:unitRef` — unit detail with **AR balance (hash-chain verified) + payment requests** (unit→payment→ledger traceability end to end), `POST /units` (treasurer+, `U-501`→`501` canonicalized, 501 without a store), `DELETE /units/:unitRef` (admin); **register seeds the demo building into each new council**
- **Consistency fixes:** `PaymentRequestStore.listByUnit` added to both adapters; payment-quote unitRefs now canonicalized at the boundary (`unit-302`→`302` — stored rows + referenceCodes agree with unit detail); **billing AR fund aligned to the documented canonical `ar:unit-<n>`** (`referenceFor` → `unitArFundCode`) so unit-detail AR balances read the actual charges; **fixed a latent `PostgresPaymentRequestStore.markStatus` bug** — it was writing `status = $2` (the referenceCode!) instead of `$3` — the e2e re-quote-after-confirm assertion would have failed on a real Postgres
- **Frontend:** Form K hub gains a live **unit detail panel** (AR balance + fund code + recent payments + chain-verified note) and **manage-units** controls (add unit for treasurer+, remove for admin) when signed in; `src/lib/api/units.ts` grew `fetchUnitDetail`/`createUnit`/`deleteUnit`; 4 new i18n keys × 9 locales (565 total, parity audit green)
- **Tests:** new `backend/tests/unit-store.test.ts` (store semantics, CRUD + role gates, tenancy isolation, AR traceability from billing + confirmed payments, 501 fallback) — backend now **167 tests / 16 files** (+12), typecheck clean; frontend **45 tests** (+3), `svelte-check` 0/0, build + prerender clean
- **Docs:** `backend/API.md` units section rewritten (detail/upsert/delete), WORKPLAN #5 marked done

**Git State:** main work committed as **`2c1724e`** — "Add per-council DB-backed unit registry" (21 files, +1083/−55). Not pushed yet; awaiting Cam's go to push to `origin/main`.

**Remaining (unchanged, all infra-gated):** #1 live-site verify (needs deploy), #13 rails on host (LND/Liquid/PayNym/Nostr), #14 on-chain/LN broadcast (daemons), #17 BOLT-12 (LND + channels — LNBITS node exists, channels not yet established)

---

## Session — 2026-08-26 (20-item upgrade push, v0.3.4)

**Done (15 of 20 items, 5 commits `3ed66e7`→`89fc0b3`, all pushed):**
- **Batch 1 (foundation):** auth rate limiting (#6 — failure-counting per email + IP, 429 with retry-after, success clears; `backend/src/auth/rate-limit.ts`, config `AUTH_RATE_LIMIT_*`); build-time CSP pinning (#2 — `scripts/generate-csp.mjs` in prebuild pins connect-src to `CSP_API_ORIGIN`/`PUBLIC_API_BASE_URL`); cross-page audit (#3 — verified no unallowlisted loaded origins)
- **Batch 2 (data):** monthly treasury series (#4 — `GET /api/v1/ledger/series`, chain-verified rollups; pitch chart now live) + live CAD/BTC provider (#7 — `LiveRateProvider` from mempool.space, cached, env fallback, wired in `index.ts`)
- **Batch 3 (product):** MeetingsTool (#8 — quorum + voting, live API when signed in, identical local rules offline), SubAccounts (#10 — Operating/CRF/Special Levy/War Chest with chain-verified head tallies), CSV bank-feed import (#12 — reconciler CSV seam; Plaid/Flinks need keys)
- **Batch 4 (Bitcoin):** DCA planner (#18 — `planDca` + `/treasury/dca/plan`, Form B disclosure %), PSBT orchestration seam (#15 — `buildPsbtPlan`/`recordSignature`, 3-of-5 threshold-gated, hardware wallets plug in), Satohash stamp (#19 — `POST /api/v1/compliance/stamp` hash-of-record + stamp URL), xpub import (#16 — `GET|POST /api/v1/rails/xpub` + XpubImport panel with per-unit BIP32 paths)
- **Batch 5 (export):** portable export (#20 — `GET /api/v1/export/portable`), CRT evidence bundle (#11 — print-ready HTML chain evidence), print-ready Form B/F (#9 — `GET /api/v1/forms/b|f/:unitId`, Form F withheld while balance > 0) + EvidenceExport panel
- **Tests:** backend now **155 passed / 14 files** (+28 new: rate-limit, rate-provider, bitcoin-modules, export); frontend 42 tests, `svelte-check` 0/0, i18n 561 keys × 9 locales parity green

**Deferred (infra-gated, per Cam):** #1 live-site verify (needs deploy), #5 per-council DB-backed units (large migration), #13 rails on host (LND/Liquid/PayNym/Nostr), #14 on-chain/LN broadcast (daemons), #17 BOLT-12 (LND + channels — LNBITS node exists, channels not yet established). All remain prepared seams with docs.

**Git State:** commits `3ed66e7`, `bce5967`, `f719619`, `4dcef0e`, `89fc0b3` pushed to `origin/main`; WORKPLAN.md updated with per-item status.

---

## Session — 2026-08-26 (landing security + shell tightening, v0.3.3)

**Done:**
- **CSP was blocking its own page** — `static/_headers` allowlisted neither Google Fonts (so Manrope/DM Mono silently fell back to system fonts — the “floating” look) nor the Umami analytics script (so telemetry never ran), and `connect-src` would have blocked the live API origin from the new frontend wiring. Fixed: `style-src` += `https://fonts.googleapis.com`, `font-src` += `https://fonts.gstatic.com`, `script-src` += `https://analytics.giveabit.io`, `connect-src` += `https:` + analytics (documented — the API origin is build-time configurable, so pin it in `_headers` if it ever becomes one host), plus `upgrade-insecure-requests` (site is HTTPS-only). Kept `'unsafe-inline'` for the theme bootstrap + SvelteKit hydration; `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS untouched
- **Fonts load once:** removed the duplicate `@import url(googleapis…)` from `src/app.css` (the head `<link>` already loads the same families with preconnect) and dropped the unused `Inter` family from `app.html` — verified the built CSS has zero googleapis references
- **Shell tightened** (user: “solid, tight” — scope confirmed as tighten-the-existing-shell, no content restructuring): content max-width 1410→1280px, main grid gap 38→28, metric grid gap/margins down, card min-heights + padding down, panel padding 19→17, right-stack gap 17→14, welcome-row/section-heading margins down, footer max-width synced to 1280, and the card shadow changed from a soft 12px glow to a crisp 2-layer shadow (`0 1px 2px … , 0 4px 14px …`, dark-mode equivalent) so cards sit anchored instead of floating
- **Checks:** `svelte-check` 0/0, 42 frontend tests green, i18n 523 keys parity green, build clean

**Git State:**
- Committed as **`e113cd4`** — "Secure and tighten the landing page shell" (6 files, +45/−22) and **pushed to `origin/main`** (branch in sync, working tree clean)

---

## Session — 2026-08-26 (frontend wired to the live backend, v0.3.2)

**Done (#20 — wire the frontend dashboard to `/api/v1/*`):**
- **New `src/lib/api/` client** (zero new deps): `config.ts` resolves the base URL — `PUBLIC_API_BASE_URL` build-time env, or `localStorage['openstrata-api-base']` runtime override (no rebuild), else **demo mode** (`null`) so the site never breaks without a backend; `token.ts` persists the JWT (`openstrata-token`); `client.ts` is a typed `apiFetch` wrapper (Bearer attachment, JSON bodies, `ApiError` with the backend's `reason`, `ApiUnavailableError` for no-base/network → widgets fall back to sample data); `auth.ts` is a Svelte store with `bootstrap()` (ping + session restore via `/auth/me`, 401 clears the token), `signIn`/`signUp`/`signOut`; typed endpoint helpers `ledger.ts` (balance/post), `units.ts` (`GET /units`), `rails.ts` (`GET /rails/status`)
- **Auth UI:** `AuthModal.svelte` (sign-in / create-account tabs, open signup → council + first admin); dashboard topbar shows a sign-in button, then council name + initials + sign-out menu; workspace switcher shows the signed-in council name; header pill flips **Live** ↔ **Demo**
- **Live widgets with graceful fallback:** reserve-funds + operating metrics pull `/api/v1/ledger/balance` when a session is live (else the old sample numbers); the tools **Form K units matrix swaps to `GET /api/v1/units`** when connected and shows a `LIVE` badge (the swap `$lib/units.ts` documented as intended — invisible to consumers)
- **Config + docs:** root `.env.example` (`PUBLIC_API_BASE_URL`), `docs/DEPLOYMENT.md` gained a “Frontend → backend wiring” section with both exposure paths (A. Tailnet-only default; B. public HTTPS behind JWT + CORS with rate limiting first); `.ai_docs/current-status.md` bumped to v0.3.2
- **i18n:** 13 new keys across all 9 locales (509 → **523**, parity audit green); **17 new frontend api client tests**; `svelte-check` 0 errors / 0 warnings
- **Follow-up: ETransferReconciler + pitch page live wiring** — the e-transfer widget now matches its simulated inbound transfers against the **live unit registry** (`GET /api/v1/units`) when signed in (new `apiUnitsToUnitRefs` adapter, LIVE badge; bank-feed ingestion itself stays Phase 5), and the pitch deck shows the **real CRF balance** (`/ledger/balance`) + **CAD/BTC** (`/rails/status`) when live, with the simulation walk gated to demo mode and the hero badge flipping Live ↔ Demo

**Decision (confirmed with Cam):** build the client configurable now (`PUBLIC_API_BASE_URL` + runtime override + demo fallback); the exposure path (Tailnet-only vs public behind auth + CORS) is decided at deploy time, both documented in `docs/DEPLOYMENT.md`. Follow-up: wire everything that has a real backend counterpart (ledger balances, CAD/BTC, units) and leave genuinely-unavailable series (monthly income/expense history, rental index, bank-feed e-transfers) as clearly-labeled demo data

**Git State:**
- Committed as **`a6bd8ad`** — "Wire the frontend dashboard to the live /api/v1 backend" (22 files, +1128/−43; follows `af9ab77`/`697dd26` from the auth session) and **pushed to `origin/main`** (branch in sync, working tree clean)

**Remaining for live data:** deploy a host, set `PUBLIC_API_BASE_URL` at build (or `openstrata-api-base` at runtime), and sign in — the wiring is done and falls back to demo until then

---

## Session — 2026-08-26 (auth + multi-tenant councils, v0.3.1)

**Done:**
- **Zero-dependency JWT auth** (`backend/src/auth/`): HS256 tokens signed with node:crypto (`AUTH_SECRET`), scrypt password hashing, no new packages. Roles **admin / treasurer / member** with rank-based gates (`requireRole`). Open signup: `POST /api/v1/auth/register` creates a council + first admin; `login`, `/auth/me`, and admin-only user management (`GET|POST /api/v1/auth/users`, one-time temporary passwords)
- **Tenant-scoped routes:** every `/api/v1/*` route except `/health` + the Rosa KB requires a Bearer token; the ledger `community` now comes from the token's `cid` claim, never the body (client-supplied `community` fields removed from ledger/post, billing/run, payments/confirm). Payment quoting is tenant-isolated: idempotency key is now `(community_id, ref_id, unit_ref, rail)` via migration `0004_auth_and_tenancy.sql` (council + app_user tables, tenant-scoped payment_request key), and confirm lookups are council-scoped so one council can never confirm another's quote
- **Tests:** backend suite now **127 tests / 11 files** (was 108/10) — 19 new auth/tenancy tests (register/login/me, duplicate email 409, forged/expired/wrong-secret tokens, role gates incl. treasurer-no-fines, cross-council ledger + payment isolation). Typecheck clean
- **Postgres e2e smoke suite** (`backend/tests/e2e-smoke.test.ts`): full deploy-day gate against a live `DATABASE_URL` — register → ledger → billing → quote/confirm → forms → meetings → cross-council isolation, and explicitly verifies `PostgresPaymentRequestStore.markStatus` single-row semantics (re-quote after confirm returns `paid`) — the item previously flagged for first-deploy verification. **CI got a `backend-e2e` job** that spins up `pgvector/pgvector:pg17`, runs `npm run migrate`, then the smoke suite
- **Docs:** `backend/API.md` (auth + tenancy section, updated payloads), `backend/README.md`, `docs/DEPLOYMENT.md` (host checklist incl. `AUTH_SECRET` + e2e gate), `.ai_docs` refreshed, `.env.example` + `docker-compose.yml` carry `AUTH_SECRET`/`AUTH_TOKEN_TTL`

**Decisions (confirmed with Cam):**
- JWT bearer tokens (not cookie sessions) — stateless, works with the static frontend + CORS; passwords via scrypt; zero new dependencies
- Roles admin / treasurer / member (treasurer = financial writes, no bylaw fines)
- Open signup for now (Tailscale-hosted MVP); gate with invites + login rate limiting before public exposure
- Units stay the seeded demo registry this session (per-council DB-backed units = the unit→payment→form traceability step)

**Remaining (external / not yet built):**
- Host deploy still pending: `docker compose up -d` on a Tailscale host, `AUTH_SECRET` + Postgres password in `backend/.env`, `npm run migrate`, then `DATABASE_URL=… npm run test -- e2e-smoke` (checklist in `docs/DEPLOYMENT.md`)
- Same external items as before: rails not connected to live daemons, Rosa pgvector/Ollama model choice, live `cadPerBtc` rate feed
- Wire the live backend into the frontend dashboard (currently mock data) — needs the API-exposure decision (Tailscale-only vs public behind auth + CORS)
- Login rate limiting + invite flow before public exposure; per-council DB-backed units

**Git State:**
- Committed as **`af9ab77`** — "Add JWT auth + multi-tenant council scoping to the backend" (26 files, +1790/−252). Not pushed yet; awaiting Cam's go to push to `origin/main`

---

## Session — 2026-08-25 (canonical unit/lot master-data model)

**Done:**
- Added a **single source of truth for units** shared by frontend + backend (commit `baf6989`, pushed):
  - Backend: new `backend/src/units/` module — canonical `UnitRecord` + `UnitRegistry`, unit-ref normalization, deterministic `ar:unit-<n>` AR ledger fund codes, and reconciliation keys. Exposed as `GET /api/v1/units`; documented in `backend/API.md`
  - Frontend: mirrored in `src/lib/units.ts`; the tools unit matrix and the e-transfer reconciliation widget now derive from the same model (`unitsToUnitRefs`), so the site and API can never disagree on what a unit is
  - This closes the "tighten organizational mapping / unit→payment→form traceability" item from the Phase 3 session
- Verified after the commit: backend typecheck clean, backend suite **108 tests / 10 files all passing** (up from 99 — 8 new unit-model tests + 1 `/api/v1/units` route test), frontend untouched and green

**Remaining:**
- Same external items as the Phase 3 session below (rails not connected to live daemons, Rosa pgvector/Ollama model choice, Docker deploy + Postgres smoke test on a Tailscale host, Postgres payment-store semantics check at first deploy)

**Git State:**
- HEAD: `baf6989` (`baf6989a47ff6156432c0d62e0c86da3c75e59e4`)
- Unpushed: none

---

## Session — 2026-08-25 (Phase 3 completion: rails hardening, CLI, API doc, tests)

**Done:**
- Completed Phase 3 end-to-end across five commits, all pushed (`0db3ce3`, `1112968`, `f7bdc2d`, `3c17beb`, `40db03f`):
- **Form B/F + meetings + payment flows** (`0db3ce3`): `POST /api/v1/forms` (Form B / Form F issuance with 7-day deadline + WITHHELD on debtor units), `POST /api/v1/meetings/quorum` + `/vote` (AGM/SGM/council/rescheduled quorum, majority/3-4/80%/unanimous voting with abstentions excluded), `POST /api/v1/payments/confirm` (marks a quoted payment paid AND posts credit to the unit's AR ledger — reconciles like an e-transfer), idempotent `payments/quote` backed by a persisted `PaymentRequestStore` (Postgres + in-memory) keyed on `(refId, unitRef, rail)`, `Idempotency-Key` dedupe on ledger/billing writes, and Fastify JSON-schema body validation on write routes
- **Rails hardening** (`1112968`): real **BIP-173 bech32/bech32m checksums** for `bc1`/`bc1p` (taproot), LNURL, `npub` via `decodeBech32` + `bech32Encode` (round-trip test vectors); pluggable **`cadPerBtc` `RateProvider`** (env-seedable, static fallback) threaded through `/rails/status` + `/payments/quote`; **watch-only xpub → deterministic per-unit BIP32 child index** (`deriveUnitAddress`/`unitChildIndex`)
- **Operational CLI + docs** (`f7bdc2d`, `3c17beb`): `npm run cli -- rosa ingest` (validate + probe the BC corpus), `npm run cli -- ziggy simulate` (walk treasury scenarios through the state machine); full `backend/API.md` request/response reference linked from README
- **API test coverage** (`40db03f`): 13 new route tests (payments/confirm edge cases, Form B/F, meeting quorum + voting rejections). Fixed `MemPaymentRequestStore.markStatus` to propagate status to both by-ref and by-key indexes. **Backend suite now 99 tests / 9 files, all passing; typecheck clean.** Frontend untouched and green
- All `.ai_docs` refreshed to v0.3.0; `docs/KIMI-HANDOFF.md` + `LATEST-UPDATE.md` updated

**Remaining (external / not yet built):**
- Rails are **prepared, not connected**: no LND / Liquid daemon / PayNym / Nostr relay running on a host; no live `cadPerBtc` rate feed; real payment-confirm → on-chain/LN broadcast pending daemons. Enable + point endpoints via `.env` when daemons exist
- Rosa pgvector embedding + Ollama model choice not selected; `0002` migration + `keywordRetriever` seam ready — `rosa ingest` currently validates the keyword corpus, not real embeddings
- Docker stack needs a real deployment on a host behind Tailscale; run a Postgres migration + `/api/v1/ledger`, `/api/v1/payments/*`, `/api/v1/forms`, `/api/v1/meetings/*` smoke test
- Verify `MemPaymentRequestStore.markStatus` single-row semantics hold on the Postgres payment-store adapter at first deploy
- Professional human review of the machine-drafted locale overrides before they are treated as reviewed
- Tighten organizational mapping, user workflow + recording (member/lot ledger, unit→payment→form traceability) in preparation for live Bitcoin/L2 payments

**Git State:**
- HEAD: `40db03f` (`40db03f3dd571e7544c14e9284fc8552fdfe8321`)
- Unpushed: none (all pushed to `origin/main`)

---

## Session — 2026-08-25 (Bitcoin + Layer-2 rails)

**Done:**
- Added the **sovereign payment-rails module** (`backend/src/rails/`, commit `b5203a8`) accepting Bitcoin on-chain (SegWit/taproot), **Lightning** (LNURL/BOLT-11 with 15-min CAD rate lock), **Liquid** (confidential L-BTC/L-USD), **PayNym (BIP-47)** payment codes, and **Nostr** identity. Pure recipient validation + rail quoting, unit-tested (11 tests).
- Wired into the Fastify API: `GET /api/v1/rails/status` and `POST /api/v1/payments/quote` return a shared `referenceCode` (e.g. `pay-<refId>-<unit>`) so Ziggy + the ledger reconcile confirmed payments the same way e-transfers do. Rails are **off by default**, enabled via `.env` (`BITCOIN_RAIL_ENABLED`, `LIGHTNING_RAIL_ENABLED`, `LIQUID_RAIL_ENABLED`, `PAYNYM_RAIL_ENABLED`, `NOSTR_RAIL_ENABLED`); LND / Liquid node / PayNym notifier / Nostr relay endpoints are configuration seams.
- Backend suite now **66 tests** (added 3 API rail-route tests); typecheck clean. Frontend stays green (check 0/0, build clean). Workplan Phase 4, DIRECTORY-MAP, `.ai_docs`, README and `.env.example` updated.

**Remaining (external / not yet built):**
- Rails are **prepared, not connected**: no LND / Liquid daemon / PayNym / Nostr relay is running on a host yet, and there is no live `cadPerBtc` rate feed. Enable + point endpoints via `.env` when daemons exist; wire the rate feed and a real payment-confirm → ledger-post path.
- Rosa pgvector embedding + Ollama model choice not selected; `0002` migration + `keywordRetriever` seam ready.
- Docker stack needs a real deployment on a host behind Tailscale (Umbrel).
- Form B/F generator with deadline tracking, meeting quorum + voting engine, PWA hardening.

**Git State:**
- SHA: `b5203a8`
- Unpushed: `git log --oneline origin/main..HEAD`

---

## Session — 2026-08-25 (Phase 3: fee billing + bylaw enforcement)

**Done:**
- Added **automated fee billing + late notices** (`backend/src/billing/`, commit `b7e4559`): pure monthly per-unit strata-fee charge generation + late notices (grace window) exposed as `POST /api/v1/billing/run`, which posts each charge to the per-unit AR ledger account (4 unit tests).
- Added the **CRT-proof bylaw enforcement state machine** (`backend/src/enforcement/`): received → notice_issued → reviewing → fine_posted / no-fine, with the `BLOCK_FINE_ACTIONS` 14-day review lock, `REQUIRE_QUORUM_AND_MINUTES`, and $200 standard / $1,000 STR fine caps — wired as `/api/v1/bylaw/{complaint,notice,status,fine,nofine}` (11 tests).
- Backend suite is now **52 tests** (was 35); typecheck clean. Frontend untouched and green (check 0/0, build clean).

**Remaining (external / not yet built):**
- Rosa pgvector embedding + Ollama model choice not selected; `0002` migration + `keywordRetriever` seam ready.
- Docker stack needs a real deployment on a host behind Tailscale (Umbrel) — pending a Postgres migration + `/api/v1/ledger` smoke test.
- Form B/F generator with deadline tracking, meeting quorum calculator + voting engine, PWA hardening.
- `/docs` bootstrap references `rosa ingest` / `ziggy simulate` CLIs that are not yet built; add when the vector adapter lands.
- Compliance-domain records / the 16 machine-drafted e-transfer keys across 9 locales still need professional human review.

**Git State:**
- SHA: `b7e4559`
- Unpushed: `git log --oneline origin/main..HEAD`

---

## Session — 2026-08-25 (Phase 3 backend scaffolding)

**Done:**
- Scaffolded the **Phase 3 core-product backend** in a new `backend/` workspace (in-repo, per user decision). Docker Compose stack (`pgvector/pgvector:pg17` + Fastify API, Tailscale-only exposure) + `.env.example` + Dockerfile + `.dockerignore`.
- **Trust ledger data model + migrations:** append-only journal (`ledger_entry`) with fund isolation (Operating / CRF / Special Levy / sub-accounts), integer basis-point math, a sha256 `prev_tally`/`tally_root` hash chain, and a `verifyChain` tamper-evidence helper. Two numbered migrations (`0001_trust_ledger.sql`, `0002_rosa_vector.sql` + pgvector) run by `backend/scripts/migrate.mjs`; `schema.sql` seeded into fresh volumes via initdb.
- **Services (TypeScript/Node):** Rosa compliance RAG (`src/rosa/` — strict retrieval + BC SPA/RTA corpus, keyword fallback retriever, pgvector/Ollama seam), Ziggy treasury state machine (`src/ziggy/` — CRF hard cap, PO-expense verification, no-guess reconciliation), Fastify API (`src/api/server.ts` — `/health` + `/api/v1/*`), and `src/trf/recon.ts` mirroring the Phase 2 no-guess reconciliation rule so both layers agree.
- **Tests + CI:** 35 backend Vitest tests (ledger invariants + tamper evidence + diff, Rosa, Ziggy, **Fastify route tests**) — pass; backend typecheck clean. CI gets a dedicated `backend` job; frontend suite stays green (check 0/0, audit 509, tests 25/25, build clean).
- **End-to-end finishing (`e844449`):** idempotent `npm run seed` demo community (mirrors initdb seed for migrated DBs); PG `listAll` now filters by account at query time so `diff()` honors community scope; `buildServer` logger is quiet-testable. SOURCE-OF-TRUTH + `docs/DEPLOYMENT.md` aligned (no longer claim “No backend yet”).
- **Docs:** WORKPLAN/ROADMAP/roadmap page mark Phase 3 in progress; DIRECTORY-MAP + `.ai_docs/context-map.md` list `backend/`.

**Remaining (external/not yet built — flag for Kimi):**
- Rosa pgvector embedding + Ollama chat/embed model choice is NOT selected; `0002` migration + `keywordRetriever` seam are ready.
- The Docker stack has NOT been run on a real host (Umbrel/Tailscale); needs a Postgres migration + `/api/v1/ledger` smoke test.
- Fee billing + late-notice API, Form B/F generator, bylaw enforcement state machine (`BLOCK_FINE_ACTIONS`) are not yet built.
- The `/docs` install SOP mentions future `rosa ingest` / `ziggy simulate` CLIs — those are not built; add when the vector adapter lands.

**Decisions (confirmed with Cam):**
- In-repo `backend/` (single source of truth), TypeScript/Node + Fastify, PostgreSQL + pgvector for the immutable ledger + Rosa embeddings.
- Ledger is append-only + hash-chain diffable; cross-fund transfers require a `resolution_id` (BCFSA no-co-mingling). Amounts are integer basis points.
- Rosa currently boots with a keyword fallback retriever over a small BC corpus so the API runs before the embed/chat model is chosen. Ziggy's PSBT/multisig execution is stubbed (authorization gate is real).
- Backend and frontend scripts are separate (`npm run check`/`test`/`build` = frontend at root; `npm run typecheck`/`test` in `backend/`) so the static Cloudflare deploy is unaffected.

**Next for Phase 3 (recommended order):**
1. Choose Rosa embed/chat models; wire pgvector + Ollama adapters (`0002` migration is ready).
2. Pick the self-hosted host (Umbrel/Tailscale per framework doc); run a real Postgres smoke test.
3. Fee billing API, Form B/F generator, bylaw enforcement state machine, PWA hardening.

**Git State:**
- SHA: `e844449` (Phase 3 backend scaffold `9ab1908` + end-to-end finish `e844449`)
- Unpushed: `git log --oneline origin/main..HEAD`

---

## Session — 2026-08-25 (upgrade list, 5 batches)

**Done:**
- Batch 1 `b56ab1e` — test suite (Vitest + @testing-library/svelte, 16 tests: i18n catalog parity + formatters, Satohash client known-vectors + validation, BarChart render/a11y), GitHub Actions CI (npm ci → check → audit → test → build → asset verification), localized `+error.svelte` (404/error, 6 keys in 4 locales), PWA (manifest.webmanifest, service worker, layout registration, iOS meta, CSP worker-src/manifest-src). Note: `vite.config.ts` needs `@types/node` for the VITEST env detection
- Batch 2 `199959a` — dark mode (Tailwind `@custom-variant dark`, token flips + `.dark` surface overrides, persisted `src/lib/theme.ts`, FOUC-free inline script, header toggle), Cmd/Ctrl+K `SearchModal` across pages/posts/FAQ/templates/legal/feeds, og:/twitter meta, per-category RSS feeds (prerendered `rss/{category}.xml` via `src/lib/feed.ts`), sitemap auto-generated by `scripts/generate-sitemap.mjs` (prebuild), `.mesh-bg` defined. Blog/legal/template records centralized into `src/lib/blog.ts` / `legal.ts` / `templates.ts`
- Batch 3 `c23ba6b` — Satohash health + stamp/verify form (`SatohashStatus.svelte`, graceful offline) on dashboard + spec; wizard save/load (localStorage `openstrata-saved-buildings`), JSON download, corp-name validation, template prefill (`openstrata-wizard-prefill`); templates category filter + Use-template → wizard; compliance section search; legal source search; FAQ search + `#faq-<uid>` anchors; pitch print-to-PDF (`@media print`); dashboard building-detail modal + persistent notification center (`openstrata-notifications`)
- Batch 4 `ffca47d` — hi/fil/pl/uk/sw extended to full **217-key parity** with fr (all 9 locales translate the whole interface; `audit:i18n` now hard-fails on locale key drift). Translations were machine-drafted — **require professional human review before being treated as reviewed**. llms.txt expanded; metrics.json refreshed (Satohash dependency now green); 3 new blog posts

**Decisions:**
- All 9 locales kept at exact parity with the French benchmark via the audit guard — new catalog keys MUST be translated in every locale or the audit fails
- Static host constraints: RSS category feeds are prerendered files (`/rss/bitcoin.xml`), not query params; sitemap is generated at prebuild from a canonical route list
- Machine-drafted translations are flagged in the handoff for professional review; statutory/domain data records stay canonical English (unchanged guardrail)

**Git State:**
- Latest SHA: `ffca47d` (after `c23ba6b`; all pushed, working tree clean)
- Unpushed: none

---

## Session — 2026-08-25 (completeness sweep, 4 batches)

**Done:**
- Batch 1 — `npm run check` now passes **0 errors / 0 warnings**: fixed 11 type errors + 7 a11y warnings (satohash `Uint8Array`/`BufferSource`, BarChart `secondaryKey` prop + `<rect>` ARIA roles, LineChart `<circle>` role, JobsDropdown const-array narrowing, implicit-any params on home page handlers, typed `$copy[<string>]` indexing via exported `Translation` type, tools module-card `role="button"` + keyboard handler). Committed `cf2bdf3`
- Batch 2 — site completeness: new `/faq` page (i18n'd), real `/rss.xml` feed endpoint (generated from blog posts via `+server.ts`), sitemap covering all 15 routes, RSS subscribe buttons, wizard mobile layout fix. Committed `99d07a2`. All routes responsive on mobile + desktop
- Batch 3 — docs sweep: rewrote `docs/DEPLOYMENT.md` + `docs/I18N.md`; refreshed WORKPLAN/ROADMAP/SOURCE-OF-TRUTH/DIRECTORY-MAP/EXECUTIVE-SUMMARY/MISSION + `.ai_docs` manifests; created SECURITY.md, PRIVACY-POLICY.md, TERMS-OF-SERVICE.md, ACCESSIBILITY-STATEMENT.md, KNOWN-LIMITATIONS.md. Committed `66c7565`
- Batch 4 — locale overrides: Spanish + Chinese extended to full catalog parity (185 keys each). Verified identical key sets across fr/es/zh with a parity script. Committed `c94a022`
- Final verify: `npm run check` 0/0, build clean, audit 461 keys / 15 routes; live site confirmed serving v0.2.6 with FAQ (200) and RSS feed live; es/zh strings confirmed in the built bundle

**Decisions:**
- No version bump for the sweep (still v0.2.6) — markers derive from `package.json` and the release was already live
- Statutory/domain data records stay canonical English until professionally reviewed translations exist (unchanged guardrail)
- No agents spawned — this environment has no spawn capability; all batches executed sequentially

**Git State:**
- Latest SHA: `c94a022` (pushed `66c7565..c94a022 main -> main`)
- Unpushed: none

---

## Session — 2026-08-25

**Done:**
- Completed the v0.2.5 release: centralized version markers on `package.json`, verified (`npm ci`/`build`/`audit:i18n`), committed `54cb99c`, pushed, and confirmed the live deployment serves v0.2.5
- Migrated every remaining hard-coded interface string across all 14 routes to the shared catalog (458 keys): compliance, tools, docs, pitch, dashboard footer/toasts, wizard (incl. placeholders), about, blog, templates, legal, roadmap, rss, spec
- Hardened `npm run audit:i18n` with a hard-coded-copy scanner (static text nodes, placeholders, meta content) — clean with 0 warnings across all routes
- Added first French (fr-CA) locale overrides for all new interface copy (123 keys); other locales fall back to English
- Released v0.2.6 with changelog, README, and `.ai_docs`/LATEST-UPDATE updated

**Decisions:**
- Statutory/domain data records (compliance.ts, strata-tool.ts, marketing.ts, data.ts, page data arrays) stay canonical English until reviewed translations exist — per the documented guardrail, no machine translation of legal content
- Hardened audit is warn-level so legitimate canonical-English records never block builds
- French first for locale overrides (BC bilingual priority); es/zh/hi/fil/pl/uk/sw follow the same pattern

**Git State:**
- SHA: (see `git log -1 --format=%H` after push)
- Unpushed: none after `git push origin main`

---

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

## Session — 2026-08-25 (e-transfer prototype + build fix)

**Done:**
- **E-Transfer Auto-Reconciliation prototype (Phase 2 complete):** pure `src/lib/reconcile.ts` matching engine + `ETransferReconciler.svelte` interactive demo on `/tools`. Auto-matches inbound e-transfers to units by reference code, flags ambiguous references that hit multiple units, leaves unmatched for manual review. Brief (message-only) and full (message + payer) match modes. 9 new unit tests (total suite now 25).
- **9-locale parity for the new feature:** 16 catalog keys (`etransfer*` / `recon*`) added to the Translation type, English base, and all 8 override blocks via `scripts/inject-recon-i18n.mjs` — audit green at 509 keys. Machine-drafted overrides — **require professional review**.
- **Docs:** WORKPLAN Phase 2 marked complete; ROADMAP.md + roadmap page Phase 2 set complete; LATEST-UPDATE + current-status updated.
- Recorded prior fix (SHA `6ff5fc3`): Cloudflare Pages build crash fixed — `browser` guard on PWA service-worker registration.

**Decisions:**
- Reconciliation never guesses: only a reference unique to one unit auto-posts; everything else is flagged for a human. Matches are reviewable before any ledger post.
- New catalog keys were injected programmatically (the i18n file is huge and per-locale blocks live on single lines) via a re-runnable script, then verified with `check`/`test`/`audit`/`build`.
- Keep the prototype front-end only (no backend) — consistent with the Phase 3 boundary.

**Git State:**
- SHA: `49e85b9`
- Unpushed: none (all commits in this session pushed to `origin/main`)

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