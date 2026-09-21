---
title: Changelog
project: openstrata
version_history:
-  version: 0.3.25
-  summary: "The first-run popup explainer with the intro video is back within reach: it was never deleted — fresh-browser checks on production proved the card works — but it only ever showed on the 'just looking' path (the 'setting up a building' path navigated to the wizard before it could appear) and once dismissed it was unrecoverable; the dashboard welcome row now carries a replay pill (tourReplay, x9 locales) that reopens the full card on demand. Saved searches: a pin button in the Cmd/Ctrl+K modal writes to openstrata-saved-searches (device-local, capped at 8, deduped case-insensitively) and the dashboard renders the pins as one-tap /search?q= chips under the task list. Group counts: each scoping chip shows its index size so the corpus is visible before typing. Modal footer hints: 'open / close' kbd row. Task list filters: All / Overdue / This week / Done, reading the full list so a filter never misses rows parked behind the expansion button; Done rows untick to restore. Keyboard-first wizard: number keys jump steps (disabled while typing in a field, forward jumps respect the building-name validation). 404 rescue: a dead URL's words become /search?q= chips. Docs cross-link checker: every markdown link in docs/ and llms.txt must resolve to a route walked from src/routes (dynamic [category].xml feeds count) or a file on disk — on its first run it caught four broken ../diligence/ links (now fixed). Back-to-top floating arrow on long pages, reduced-motion aware. 238 tests, 976 i18n keys x 9 locales."
-  version: 0.3.24
-  summary: "The Cmd/Ctrl+K modal learned three tricks and the last hard-coded copy went through the catalog. Recent searches: the empty modal remembers the last five queries on the device only (capped at 80 chars, deduped case-insensitively, one-tap remove). Scoping chips: ten one-tap filters above the results narrow the corpus before ranking, so a query that missed the global top-12 still surfaces inside its group. Shareable search: every modal state links to /search?q=... which runs the same index, plus Enter-with-no-selection goes straight there; the page is in the sitemap and llms.txt (noindex, follow). Copy debt: the thank-you page's flow prose moved to src/lib/thankyou.ts as canonical English and its chrome through the catalog, the home proof band, design specimens, privacy/terms metas, wizard link and footer Privacy/Terms all through the catalog too - hard-coded-copy warnings fell from 24 to 0. New guards: every indexed href must resolve to a canonical route, short chip labels must never collide within a locale, share hrefs must round-trip. 229 tests, 968 i18n keys x 9 locales."
-  version: 0.3.23
-  summary: "The empty-state hint in the Cmd/Ctrl+K search modal said 'Search across pages, posts, FAQ, templates, and legal sources' — written when the index had five groups; v0.3.22 grew it to ten and the copy lagged. The hint now names every group the index serves (pages, posts, FAQ, templates, print-ready documents, the manual, legal sources, primary and official sources, the Strata Tool, and what needs doing) in all nine locales; the modal's group-label map moved into search.ts as searchGroupLabels() so eyebrows, hint and index share one home; two labels (primarySources, strataTool) that had silently fallen back to English in the other eight locales are now overridden everywhere; and three drift-guard tests in search.test.ts fail if the hint ever names fewer groups than the index serves, if any locale reverts to the stale English copy, or if any locale loses a group label. 217 tests, 921 i18n keys x 9 locales."
-  version: 0.3.22
-  summary: "Three UX improvements, all protecting work a visitor has already done: the 8-step wizard now persists a device-local draft (fields, toggles, step) and the dashboard offers a one-click resume chip — 'Harbour House — 4 of 8 · in progress' — which the wizard confirms with a restored notice and clears the moment a build is generated; Cmd/Ctrl+K search gained every print-ready document (Form B and F reachable by name for the first time), the eight manual sections, and the dashboard's 'What needs doing' list, taking the index from seven groups to ten; and an honest demo banner on sample-data dashboards states plainly that nothing typed is saved to an account, offers 'Save my building' straight to the wizard, dismisses for a week, and is rule-tested so it can never appear to a signed-in council on their own host. 214 tests (resume 8, banner 7, search 3 new), 921 i18n keys x 9 locales, 116 contrast pairs."
-  version: 0.3.21
-  summary: "A simplification pass on the parts a person actually meets. The header went from six things to four (Compliance and Docs left the bar for the Library menu, where they belong — nothing became unreachable). A first-time visitor no longer meets a dashboard of someone else's numbers: they get one question with three ways in, decided before the first paint by the same class-before-paint trick the theme switch uses, with the choice remembered on the device only and the tour now waiting its turn. Four dashboard panels (setup checklist, deadlines, forms windows, month-end) merged into one ordered list — overdue, urgent, soon, routine, setup last — where a deadline inside two weeks is urgent whatever the API called it. Also fixed: breadcrumbs mislabelled /documents as Docs (because /documents starts with /docs) with a link to the wrong page. 196 frontend tests, 909 i18n keys x 9 locales, 116 contrast pairs."
-  version: 0.3.20
-  summary: "Three improvements and two real defects found while making them: the pre-rebrand raster logo is gone everywhere (the pitch deck shows the vector mark on its navy plate, link previews get a new 1200x630 og.png that `npm run icons` now renders, and a guard test fails if the old file ever comes back), every payment carries a per-site receive label (OST · council · unit · request) so money can never be confused between projects — a pure deterministic backend module with 21 tests, returned by the quote API and shown in the checkout panel — and a new /custody page stating where community money sits at each step, what the software cannot do, what a council can check, and what is not live yet. Fixed on the way: static/icon.svg contained a double hyphen in an XML comment so the rasteriser refused the file, and a malformed changelog front-matter line had swallowed the project name. 214 backend tests, 164 frontend tests, 886 i18n keys x 9 locales, 116 contrast pairs."
-  version: 0.3.19
-  summary: "Three shipped improvements and a real accessibility sweep: per-tab hero artwork (6 on-brand SVG motifs on 14 pages), an in-app setup checklist on the dashboard with localStorage-only progress (13 unit tests), and a public /changelog page generated from this file (7 sync tests). Closing a silent-skip hole in audit:contrast exposed 106 token pairs instead of 60 and found four unaudited failures — success 1.99:1–2.18:1, warning 1.99:1, danger 3.76:1 and bitcoin 2.30:1 as text, plus white-on-#f7931a at 2.30:1 — all now fixed with documented text steps and a dark-ink Bitcoin fill. 115 tests, 860 i18n keys x 9 locales, 106 contrast pairs, 24 page/theme/viewport browser combos with 0 overflow."
-  version: 0.3.16
-  summary: "Design-system hardening pass: one branded header band for every tab (14 pages migrated off hand-rolled gradients — five of which painted a white band across dark mode), a new `npm run audit:contrast` that recomputes WCAG contrast for 60 token pairs in both themes and found 10 real failures (all fixed: --faint 2.42->3.6:1, --muted 4.41->4.9:1, brand text steps, and white-on-orange 2.77->5.02:1 via new --orange-solid), and a 'start here' three-leg journey strip with localStorage-only progress + 10 unit tests. Browser-verified 17 pages x light/dark = 34 combos, 0 contrast failures, 0 overflow. 95 tests, 820 i18n keys."
-  version: 0.3.15
-  summary: "Kimi's 60-second OpenStrata intro video is LIVE in the first-run greeter popup (static/video/openstrata-intro.mp4): step 1 is now a wider two-column card — video on the left, 'What you get' (0% custody / BCFSA-aware / Bitcoin proof trail / portable history) and 'Where to start' on the right — so it fits one screen with zero scroll at 768px+ and 390px; all 4 steps browser-verified with 0 hidden overflow and 0 horizontal overflow. Also fixes a CI-breaking gap Kimi's v0.3.14 commit left: pl/uk/sw were missing the four video keys, so `npm run audit:i18n` was failing on main. 9 new catalog keys x 9 locales (813 keys), svelte-check 0/0, 85 tests, build green."
-  version: 0.3.14
-  summary: "First-run greeter popup card rebuilt with a video section (30-60s intro, Kimi handoff via HyperFrames); new i18n keys tourVideoTitle/tourVideoSub/tourVideoCta/tourVideoFallback; Kimi handoff in docs/KIMI-HANDOFF.md + docs/VIDEO-SPECS.md with a 1-minute intro script; version bumped to v0.3.14 everywhere."
-  version: 0.3.13
-  summary: "Ziggy PSBT workflow seam live: broadcastPsbtWorkflow walks walletprocesspsbt → finalizepsbt → sendpsbt for a real BIP174 txid (aggregated coordinator psbtB64 passes straight through, deterministic BIP174 skeleton otherwise) and now refuses below-threshold plans before any RPC; the broadcast endpoint tries the workflow first on the rail path with the raw-tx seam as the watch-only fallback, and a placeholder never stands for an on-chain spend (tri-state preserved); backend 191 tests, typecheck clean."
-  version: 0.3.12
-  summary: "Fix the demo notice layout on phones: the flex-1 text column next to shrink-0 action buttons collapsed to a 13px-wide sliver at 390/430px (a 604px-tall notice), so the strip now uses its own flex classes with a real flex-basis and the buttons wrap to their own line. Text measure 268-338px at 360/390/430, no overlap; svelte-check 0/0, 85 tests, i18n audit clean."
-  version: 0.3.11
-  summary: "Visitor-honest demo mode: the dashboard no longer greets the public with a build-configuration prompt. The demo notice now states plainly that every community, balance and action on screen is sample data, offers one obvious way to request access, and keeps the operator path as a quiet 'Running your own host?' link documented in README.md; 6 new catalog keys x 9 locales, i18n audit 0 missing keys / 0 hard-coded-copy warnings."
-  version: 0.3.9
-  summary: "Design-system release: reusable Card component (47 cards/9 pages migrated), marketing typography ramp, sidebar shell pinned to viewport, dashboard + marketing cards unified on one token set, and a site-wide Tailwind v4 fix — unlayered element resets moved to @layer base so text/border utilities win (brand links were rendering plain ink/dark-on-dark), :root wired to ink/canvas tokens for true dark mode, text-bc-blue lightened dark-only (contrast 2.35->9.0); zero overflow 13 pages x 3 sizes light+dark, 85 frontend tests, svelte-check 0/0"
-  version: 0.3.8
-  summary: "Next 20 shipped — live flows, governance, Bitcoin & trust: RosaChat citation-only compliance Q&A, register wizard, QR scan-to-pay + wallet deep links, Forms B/F 7-day tracker, MyUnit panel, BallotEngine + minutes export, CRT-ready bylaw case file, statutory meeting notices, compliance health score, mempool.space balances, war-chest DCA planner with Form B disclosure, live CAD/BTC sparkline, rails readiness checklist, ledger chain visualizer, PWA offline + install, a11y 0-warning, tour/empty-state illustrations, host-connect strip; browser-verified zero overflow 390→1280, 78 frontend tests, i18n 893 keys x 9 locales"
-  version: 0.3.7
-  summary: "All 20 user-flow/GUI/Bitcoin improvements shipped: backend member registry (migration 0006) + /members, verified /ledger/entries, /deadlines; frontend CheckoutFlow pay-fees + receipts, MonthlyClose, BylawCase, MemberWorkspace, DeadlinesPanel, brand-accent theming + /design page, RailsStatus, SigningRoom, WalletPanel, LedgerExplorer, ExportCenter, MemberManager, NotificationsFeed, RateBadge, glossary + illustrations + print styles; mobile-verified zero overflow 390→1698"
-  version: 0.3.6
    date: 2026-08-26
    summary: >-
      GUI & user-flow push — all 20 improvements shipped: SVG icon system,
      real glass-card tokens (was undefined), typography ramp, designed empty
      states, breadcrumbs, tools sub-nav, scroll-spy TOC, tool modules in the
      Cmd-K palette, mobile dock on every page, view transitions, shimmer
      skeletons, dynamic time-of-day greeting, metric sparklines,
      micro-interactions, first-run tour, confirm dialogs, error toasts +
      inline validation, last-synced chrome, and hero-pattern CTAs. Tablet-width
      header overflow fixed (jurisdiction picker moves to lg+).
  - version: 0.3.5
    date: 2026-08-26
    summary: Per-council DB-backed unit registry with traceability (migration 0005)
  - version: 0.3.4
    date: 2026-08-26
    summary: 20-item upgrade push — rate limiting, treasury series, meetings/sub-accounts/CSV, Bitcoin modules, exports
  - version: 0.3.3
    date: 2026-08-26
    summary: Landing security (CSP) + shell tightening
  - version: 0.3.2
    date: 2026-08-26
    summary: Frontend wired to the live /api/v1 backend (api client, auth modal, live widgets)
  - version: 0.3.1
    date: 2026-08-26
    summary: JWT auth + multi-tenant council scoping on the backend
  - version: 0.2.6
    date: 2026-08-25
    summary: Full interface localization, hardened audit, and French locale overrides
  - version: 0.2.5
    date: 2026-08-25
    summary: Single-source version markers across deployed metadata and generated config
  - version: 0.2.4
    date: 2026-08-25
    summary: Deployment repair and synchronized dependency lockfile
  - version: 0.2.3
    date: 2026-08-25
    summary: Locale-aware formatting and translation audit
  - version: 0.2.2
    date: 2026-08-25
    summary: Templates and remaining wizard/compliance localization
  - version: 0.2.1
    date: 2026-08-25
    summary: Blog localization and source-linked legal library
  - version: 0.2.0
    date: 2026-08-25
    summary: Responsive OpenStrata operations dashboard and multilingual GUI foundation
  - version: 0.1.0
    date: 2026-06-22
    summary: Initial project scaffold
audience: devs
last_updated: 2026-09-19
owner: Nova (Product Management & Documentation)
---

# Changelog

## [0.3.25] — 2026-09-21

### Added

- **The tour is reachable again.** The first-run popup with the intro video was
  never deleted — fresh-browser checks on production proved the card works —
  but it only ever showed on the "just looking" path, and once dismissed it was
  unrecoverable. The dashboard welcome row now carries a replay pill
  ("Watch the 60-second intro again", all 9 locales) that reopens the full card
  on demand. `Tour.svelte` itself needed no changes.
- **Saved searches.** A pin button in the ⌘K results footer writes to
  `openstrata-saved-searches` (device-local, capped at 8, deduped
  case-insensitively; `src/lib/saved-searches.ts`, 6 tests). The dashboard
  renders the pins as one-tap `/search?q=` chips under the task list, × to
  unpin; pinning in the modal updates the strip live via a window event.
- **Group counts in ⌘K chips.** Each scoping chip shows its index size
  ("Documents · 4"), computed from the same index the search runs.
- **Modal footer hints.** "↵ open · esc close" under every modal state,
  `aria-hidden`, never in the tab order.
- **Task list filters.** All · Overdue · This week · Done chips. The week and
  overdue slices read the full list so a filter never misses rows parked behind
  the "more" button; Done shows ticked setup steps, untick to restore.
- **Keyboard-first wizard.** Number keys jump steps; skipped while typing in a
  field, and forward jumps across step 2 enforce the building-name rule exactly
  like the Next button.
- **404 rescue.** A dead URL's words become up to six `/search?q=` chips
  (stop-word filtered) instead of a dead end.
- **Docs cross-link checker.** Every markdown link in `docs/` and `llms.txt`
  must resolve to a route walked from `src/routes` (dynamic `[category].xml`
  feeds count) or a file on disk. Its first run caught 4 broken
  `../diligence/` links — all fixed.
- **Back-to-top.** A floating arrow appears after ~900px of scroll on every
  long page, above the mobile dock, reduced-motion aware, hidden on print.

**238 tests, 976 i18n keys × 9 locales.**

## [0.3.24] — 2026-09-20

### Added

- **Recent searches in the ⌘K empty state.** The modal now remembers the last
  five queries, device-local under `openstrata-recent-searches` (the same
  privacy posture as the wizard draft — no account, nothing leaves the
  browser). `src/lib/recent-searches.ts` is pure with 7 tests: queries cap at
  80 characters, dedupe case-insensitively ("form b" == "Form B"), a new query
  moves up instead of duplicating, and one tap removes an entry. Corrupt
  storage degrades to an empty list.
- **Scoping chips.** Ten one-tap filters (Pages · Documents · Manual · Posts ·
  FAQ · Templates · Legal · Sources · Tools · Tasks) sit above the results.
  Chips scope *before* ranking, so a query that missed the global top-12 cut
  still surfaces inside its group. Short chip labels come from
  `searchGroupShort(t)` — long names like "Print-ready documents" stay on the
  per-result eyebrows — and `groupsInIndex()` renders the chips from the index
  itself, so a future group cannot grow a chip that filters to nothing.
- **Shareable search — `/search?q=…`.** Every modal state links to the
  shareable page (results, and even no-results), pressing Enter with no row
  highlighted navigates there, and the page runs the *same* index so a shared
  link can never show different results than the modal did. Listed in the
  sitemap and `llms.txt`; the page sends `noindex, follow` because each query
  string is a soft-404 for a crawler while the route is not.

### Changed

- **The last hard-coded copy went through the catalog.** The thank-you page's
  flow prose (variant titles, the four step bodies) moved to
  `src/lib/thankyou.ts` as canonical English — the same rule as the manual and
  the custody page, because it is operational honesty about what just happened
  to someone's data — and its chrome (title, meta, buttons, "No hidden steps")
  went through the catalog in all 9 locales. Also catalogued: the home proof
  band ("0% custody, always." / "Statutory clocks that don't slip."), the
  design-page type specimens, the privacy/terms titles and metas, the wizard's
  "What happens next →", and the footer's Privacy/Terms links. The
  hard-coded-copy audit fell from 24 warnings to **0**. Two keys
  (`thanksNoHiddenSteps`) end with an em dash instead of a colon — the audit's
  key regex reads a trailing `:'` as a phantom key, which surfaced as bogus
  parity errors.
- **Help lands on the six-step guide.** The dashboard sidebar's "Need a hand?"
  card and the HostConnect strip's help link now deep-link to
  `/docs/manual/getting-started` instead of the FAQ, and the hint copy says so
  (`helpStartHere`), because a person asking for help wants the walkthrough,
  not an index.

### Guarded

- **Every indexed href must resolve to a canonical route** (the sitemap's list,
  not the nav — pages like `/custody` deliberately live outside the bar).
  An index row pointing at a dead page now fails the suite.
- **Short chip labels never collide within a locale**, and the short/long label
  maps always cover the same ten groups.
- **Share hrefs round-trip** through `URLSearchParams` exactly.

## [0.3.23] — 2026-09-20

### Fixed

- **The ⌘K empty state names all ten groups, in every locale.** The search
  modal's placeholder copy said “Search across pages, posts, FAQ, templates,
  and legal sources” — written when the index had five groups. v0.3.22 grew
  the index to ten and the copy lagged behind the product. The hint now names
  every group the index serves, in all nine locales, and a drift-guard test
  ties the canonical English hint to the group list out of `buildSearchIndex`:
  an eleventh group now fails the suite until the hint is rewritten.

### Changed

- **One home for the group labels.** The modal's inline group-label map moved
  into `search.ts` as `searchGroupLabels(t)`, so the per-result eyebrows, the
  empty-state hint and the index itself are derived from the same source.
- **Two labels were quietly English-only.** `primarySources` (“Primary and
  official sources”) and `strataTool` (“Strata Tool”) had no non-English
  catalog entries, so eight locales rendered them as English fallbacks. All
  eight now carry them; “Strata Tool” stays as the product name in every
  locale, matching the file's own convention (`openStrataToolsCta`).

## [0.3.22] — 2026-09-19

### Added

- **“Continue where you left off” — the wizard keeps your draft.** The 8-step
  Building Template Wizard held everything in component state: stop halfway —
  a phone call, lunch, a closed tab — and the whole building came back blank.
  It now persists a device-local draft (`src/lib/resume.ts`, localStorage,
  same convention as the setup ticks and the first-visit choice) on every
  step change, and the dashboard answers with one chip above the greeting:
  *Continue where you left off — Harbour House — 4 of 8 · in progress*.
  One click lands back on the exact step with every field as typed — name,
  address, unit count, banks, enabled sub-accounts, services, rails, bylaw
  choice — and the wizard confirms the restoration with a quiet
  “Draft restored” notice. Dismissing the chip discards the draft; generating
  the config clears it, because a finished build is not unfinished work.
  Parse degrades to “no draft” on corrupt or hostile storage, and a draft is
  only offered when it has a name and the visitor got past step 1. 8 tests.
- **⌘K reaches the whole site.** Site search now indexes the four print-ready
  documents — Form B and Form F are reachable by name for the first time,
  deep-linked to `/documents?doc=…` — the eight manual sections, and the
  dashboard's “What needs doing” task list. The index goes from seven groups
  to ten, so nothing a council can name is more than one keystroke away.
- **An honest demo banner.** On a sample-data dashboard (no host configured,
  no session) a banner now states plainly: *You are in demo mode — everything
  here is sample data, and nothing you type is saved to an account. Your
  building draft is kept on this device only.* One CTA — **Save my building**
  — goes straight to the wizard, whose draft now survives a refresh. It
  dismisses for a week (a day-stamp, not a forever flag) and the visibility
  rule (`src/lib/demo-banner.ts`, 7 tests) makes the important failure
  impossible: **a signed-in council on their own host can never be told their
  real books are sample data.**

### Verified

- `npm run check` 0/0 · **214 tests** (was 196: +8 resume, +7 banner, +3
  search) · `audit:i18n` **921 keys × 9 locales** · `audit:contrast` 116 pairs
  · build green.

## [0.3.21] — 2026-09-18

### Changed

- **The header is four things instead of six.** Compliance and Docs left the bar
  and joined the Library menu, beside the legal sources, the templates and the
  printable documents — which is what they are. A council reads compliance
  material; it does not “go to compliance” the way it goes to its own dashboard.
  Nothing became unreachable: both are one click away, still in the footer, still
  in site search.
- **The first visit is a question, not a wall.** A brand-new visitor used to land
  on a full dashboard — four metric cards, a building list, an activity feed, four
  panels — for a building that is not theirs, with numbers that are not real.
  They now get one plain question with three ways in: look around, set a building
  up, or sign in. The dashboard appears the moment they choose, and the choice is
  remembered on the device only.
  - Visibility is decided **before the first paint** by the same
    class-before-paint trick the theme switch already uses, so there is no flash
    — and because it is CSS rather than a conditional render, the prerendered
    markup still contains the whole dashboard for a crawler.
  - **The first-run tour now waits its turn.** One first-run experience at a
    time; answering the question opens the tour over the dashboard the visitor
    just asked to see.
- **Four panels became one list.** The setup checklist, the statutory deadlines,
  the Forms tracker's windows and the month-end close each answered part of
  “what needs doing?” — and together they were a scavenger hunt. The dashboard now
  shows one ordered list: overdue, then urgent, then soon, then routine, then the
  setup steps **last**, because real work outranks finishing your profile.
  - A deadline inside two weeks is urgent **whatever the API called it**: the
    date is the fact, the severity label is an opinion.
  - Steps tick off in place, the list can be hidden, and it says how many rows
    are left in the full list.
  - `SetupChecklist.svelte` is deleted; the aggregation lives in `src/lib/tasks.ts`
    with 16 tests.

### Fixed

- **Breadcrumbs mislabelled `/documents` as `Docs`.** `/documents`.startsWith
  (`/docs`) is true, and the trail took the *first* match — so the printable
  documents page carried a crumb that linked to the wrong page. Resolution now
  happens on a segment boundary and prefers the deepest href, which also keeps
  `/docs/manual` landing on `Docs`.

### Verified

- `npm run check` → 0 errors, 0 warnings. `npm test` → **196 passed** (was 164).
  `audit:i18n` → 909 keys × 9 locales, parity green. `audit:contrast` → 116
  pairs. Build green.
- Browser-verified on the production preview with the service worker
  unregistered: a first visit shows the question with the dashboard hidden and
  **no tour overlay**; choosing “just looking” reveals the dashboard in place,
  stores the choice, and opens the tour over it; the header renders **four**
  items with no Compliance link in the bar, while the Library menu holds
  Compliance, Docs, legal library, templates, print-ready documents, FAQ and
  changelog; the merged list renders six rows in urgency order (urgent Form B →
  EPR → AGM, then the setup steps) with its overflow count; the breadcrumb on
  `/documents` reads “Print-ready documents”; and there is **0 horizontal
  overflow** at 390px and 1440px in light and dark.
- The urgency chip was rewritten from amber text on an amber tint to a neutral
  plate with a coloured dot. The tint pairing was not covered by
  `audit:contrast`, and “probably 4.5:1, on this machine” is not a measurement.

## [0.3.20] — 2026-09-18

### Added

- **A custody page anyone can read: /custody.** `0% custody` was four words
  inside a popup — the strongest promise the product makes, and the hardest one
  for a council to check. The page walks the money through three steps (an owner
  pays → the council holds it → OpenStrata writes it down), lists what the
  software cannot do as impossibilities, lists what a council can check as
  buttons, and says plainly what is not live yet. Linked from the home page's
  0% custody proof card and the footer, listed in the sitemap, llms.txt and site
  search, with 11 tests — including a guard that every catalog key the page
  references exists, because a mistyped key renders as a blank line.
  - Body prose stays English in `src/lib/custody.ts`, the same rule the
    print-ready documents and the user manual follow. A machine translation of
    “we never hold your money” is a materially false statement.
- **Per-site receive labels on every payment.** A rail invoice was labelled with
  the rail's own name (`Lightning Network`) — a string identical in every
  Give A Bit project, so a node operator or a council could not tell whose money
  had arrived. Every quote now carries `OST northgate U302 pay-9142`: site code,
  council, unit, request.
  - `backend/src/rails/receive-label.ts` is pure and deterministic, derived from
    keys the payment request already persists — so no migration, and no drift
    between the wallet, the node and the stored row. 21 tests. An explicit
    family site-code table (OST / SATO / TAD / MOTO …) makes a collision a
    visible edit rather than a coincidence of spelling. `assertReceiveLabelFor`
    refuses a foreign label loudly at the rail seam.
  - The quote API returns `receiveLabel` and the checkout panel shows it beside
    the payment instructions, so the string a council writes on a transfer is
    the string the node records.

### Changed

- **The pre-rebrand raster logo is gone.** `/pitch` was the last page still
  shipping the old artwork; it now uses the same mark-on-navy plate as the
  favicon, the PWA icons and the printed letterhead.
- Link previews point at a new **1200×630 `/og.png`** — the old 237×377 logo was
  upscaled and cropped by every crawler — and `twitter:card` is now
  `summary_large_image`. `npm run icons` emits it.

### Fixed

- **`static/icon.svg` could not be rasterised.** Its comment contained a double
  hyphen, which is a hard XML error, so the rasteriser refused the file. The mark
  had never actually been rendered from that source until `og.png` needed it.
- **A malformed changelog front-matter line**
  (`project: openstrataversion_history:`) had swallowed the project name.

### Verified

- `npm run check` → 0 errors, 0 warnings. `npm test` → **164 passed** (was 143).
  Backend: typecheck clean, **214 passed** (was 191).
- `audit:i18n` → 886 keys × 9 locales, parity green. `audit:contrast` → 116
  pairs, all at or above floor. Build green; `/custody` prerenders and the
  sitemap lists it.
- Browser-verified on the production preview with the service worker
  unregistered: `/custody` renders its 4 sections, 3 steps, 5 limits, 4 checks
  and 3 honesty lines with 0 overflow at 1440 and in dark mode; `/pitch` serves
  **0 raster logos** and 4 vector marks on the navy plate (rgb(16,45,59));
  `/og.png` returns 200 and `/logo.png` returns **404**; the checkout's quote
  panel shows `OST demo U101 demo` with its label and hint in light and dark.
- Guarded by new tests: no shipping source may reference the retired logo, the
  in-app mark must match `icon.svg` path-for-path, `og.png` must be 1200×630,
  the manifest must point at rasters, and every catalog key the custody page and
  the checkout reference must exist.

## [0.3.19] — 2026-09-18

### Changed

- **The intro video's idle frame is a poster now.** Kimi delivered a
  Cam-approved 1920×1080 thumbnail (`static/video/openstrata-intro-poster.png`,
  “Govern yourself.”) and the greeter popup's `<video>` points at it via
  `poster=`. Without it the player idled on a blank first frame, which reads as
  broken rather than paused.

### Verified

- `npm run check` → 0 errors, 0 warnings. `npm test` → **143 passed**.
- Build green; the poster is emitted to `build/video/openstrata-intro-poster.png`
  (852 kB) next to the video.
- Browser-verified against the production preview: the tour's video element
  resolves the poster URL and shows it before play.

## [0.3.18] — 2026-09-18

### Added

- **The new brush mark is the site's icon now.** One master vector
  (`static/icon.svg`) plus a small-size rendition (`static/favicon.svg`), and
  `scripts/generate-icons.mjs` (`npm run icons`) rasterises the rest:
  `favicon.ico`, `icon-192.png`, `icon-512.png` and `apple-touch-icon.png`. The
  same mark is drawn inline by `BrandMark.svelte` in `currentColor`, so the
  header, the app sidebar, the footer, the auth card and the error page all
  carry the real logo instead of three CSS bars in an orange plate.
- **`/documents` — print-ready documents.** Meeting notice, meeting minutes,
  Form B (Information Certificate) and Form F (Certificate of Payment), each
  rendered as a white paper sheet with a letterhead, a reference code, a meta
  table, disclosure tables and signature lines. One printable document per
  page when the whole set is printed.
- `src/lib/documents.ts` — the document set and its pure helpers
  (`docReference`, `addDays`, `daysBetween`, `applyNoticeParams`), with 28 tests.
- `scripts/inject-documents-i18n.mjs` — 11 page-chrome keys × 9 locales.

### Changed

- **The header navigation is grouped.** Twelve flat links needed ~1490px inside
  a 1232px bar, so the strip scrolled internally on every ordinary laptop and
  hid half the site behind an invisible scrollbar. Four inline destinations
  (Dashboard, Strata Tool, Compliance, Docs) plus two menus (`Library`,
  `Company`) bring the top level down to ~500px. `src/lib/nav.ts` is now the one
  authoring home: the flat list the footer and breadcrumbs read is derived from
  the grouped structure. The mobile drawer mirrors the same grouping.
- **The desktop nav starts at 1280px, not 1024px.** Between 1024 and 1280 the
  bar still could not fit six items alongside the actions cluster, so below
  `xl` the grouped drawer and the floating bottom dock carry navigation instead
  of a bar that clipped its own edges.
- **The dashboard's notice builder no longer writes its own print page.** It
  used to assemble inline HTML into a popup with its own fonts and colours; it
  now hands the council's date, time, place and agenda to `/documents` through
  the query string, so there is exactly one printable notice.
- `static/sw.js` cache name bumped to `openstrata-v2` — which is what evicts the
  previous build's shell from an installed PWA.

### Fixed

- **Dark mode's selected states were invisible.** `bg-brand-50` / `bg-brand-100`
  are tints used ~25 times as a selected-state plate (chosen jurisdiction,
  chosen bylaw pack, active decision pill), normally paired with a brand or
  slate label. Neither step was ever remapped for dark mode, so the plate stayed
  near-white (#ecfeff) while its label stepped up to brand-200 (#a5f3fc) or
  slate-800 — about **1.2:1**. Both steps now have dark values, and the green
  “brokerage” accent gets its own pair. `audit:contrast` gained a tint-pair
  section so this cannot come back.
- **`.marketing-mobile-nav` was missing from the print hide list,** so on a
  phone the floating bottom dock printed across the foot of every page.
- **The printed sheet kept its screen styling.** The print overrides lost to the
  component's scoped `.print-doc.svelte-hash` rules, leaving screen padding, a
  14px radius and a drop shadow on paper.
- **A hover-then-click on a grouped menu closed it.** The pointer opened the
  menu and the click toggled it shut; a click on a hover-opened menu now pins it
  open, and the next click closes it.
- `@page` is now Letter with real margins, because the first market is BC.

### Verified

- `npm run check` → 0 errors, 0 warnings. `npm test` → **143 passed** (was 115).
- `npm run audit:i18n` → **872 keys** across 9 locales.
  `npm run audit:contrast` → **116 pairs**, all at or above floor.
- Build green; `/documents` prerenders, and `sitemap.xml` lists it.
- Browser-verified against the production preview with the service worker
  unregistered first: **114 page/theme/viewport combos** (19 pages × 2 themes ×
  1440 / 1024 / 390) with **0 horizontal overflow** and **0 text below floor on
  a brand tint**. Nav measured at 1023 / 1024 / 1279 / 1280 / 1440 / 1920px —
  the grouped bar renders from 1280 with **0 strip overflow**, and below that
  the grouped drawer opens with its headings and scrolls internally. Menu
  behaviour verified: hover opens, click pins, second click closes, Escape
  closes, outside-click closes. Print media emulation confirms the chrome is
  hidden and the sheet has no padding, radius or shadow. The full set prints
  **4 sheets** with the right titles and refs, and the notice handoff renders
  `Notice of Annual General Meeting` with the council's own date, place and
  agenda.

### Known issues

- The backend is still **not deployed**. The website is live; the money-handling
  server has never run on a real host. That remains the gate on Phase 3.
- THOR's bitcoind has **no wallet loaded** (`listwallets` = `[]`) — Cam has
  greenlit `createwallet`, but it has not been created yet.
- Ollama is deliberately **not** on THOR (RAM). Rosa answers on the keyword
  fallback until it runs somewhere else on the tailnet.
- `static/logo.png` (used by `/pitch`) is still the pre-rebrand artwork and was
  left untouched so the pitch deck's layout does not shift.

## [0.3.17] — 2026-09-18

### Added
- Frontend: **per-tab hero artwork** — `src/lib/components/HeroArt.svelte` draws one of six on-brand motifs (modules, chain, scales, ledger, network, signal) inside the shared `.page-hero` band, mounted on 14 pages via `scripts/wire-hero-art.mjs`. The motif is chosen by what the section *is*, not by rotation: `/tools` gets the module lattice, `/roadmap` and `/spec` get linked proof blocks, `/compliance` and `/legal` get statutes and a balance, `/docs` and `/templates` get rules documents, `/about`, `/blog` and `/design` get the community graph, `/faq`, `/rss` and `/thank-you` get answers radiating out. Drawn in `currentColor` only, so it inherits the band's brand tint and flips with the theme; decorative (`aria-hidden`), masked toward the edges, and hidden below 900px so it can never sit under a headline or add phone overflow.
- Frontend: **in-app setup checklist** on the dashboard (`src/lib/components/SetupChecklist.svelte` + `src/lib/setup.ts`). Four steps between a new workspace and a building that actually runs — add your units, open the two funds, load your bylaws, close your first month — each with a deep link, a progress meter, a dismiss control and a restore button. Progress is **localStorage-only**: the workspace is the record of truth, the panel is only a nudge. Corrupt, partial or hostile storage degrades to "nothing done" rather than throwing, and the dismissal is stored under its own key so an older build cannot resurrect a dismissed panel.
- Frontend: **public `/changelog` page**, generated from this file by `scripts/generate-changelog.mjs` → `src/lib/changelog.generated.ts`. Parses the markdown body (`## [x.y.z] — date` sections and their `Added` / `Changed` / `Fixed` / `Verified` / `Known issues` groups), carries the five releases that only ever existed in the front-matter version history through as summary-only entries rather than dropping or inventing them, and strips inline markdown (emphasis, code ticks and link targets) so the page never renders raw source syntax. Includes a change-type filter, per-release expand/collapse, a Newest-first timeline, and an RSS call to action. Wired into the nav, the dashboard footer, `static/sitemap.xml` and `static/llms.txt`.
- Frontend: `src/lib/setup.test.ts` (13 tests — hostile-storage parsing, canonical ordering, idempotent ticking, percent and completion) and `src/lib/changelog.test.ts` (7 tests — every CHANGELOG heading published, freshest-generation guard, newest-first ordering, no raw markdown).
- Tooling: `npm run audit:contrast` now checks **106 token pairs instead of 60**, and an unresolvable token is a **failure rather than a silent skip** (the hole that hid all of the above).

### Changed
- Frontend: light-mode state colours get the same split the orange already had. Text usages ride new documented steps — `--success-text` `#0b6b49`, `--warning-text` `#8a5209`, `--danger-text` `#b3261e`, `--bitcoin-text` `#9a5700` — plus `.text-*` overrides for `success`, `warning`, `danger`, `bitcoin`, `slate-400` and `slate-500` in both themes, following the repo's established text-only-override convention so solid fills and tinted chips are untouched.
- Frontend: light-mode slate ramp is now stated in `src/app.css` instead of inherited from Tailwind's stock palette. The values are identical to stock, so nothing moves visually — but an undefined token cannot be audited, and these were exactly the steps the audit was silently skipping.
- Frontend: `--color-danger-solid` (`#c92a2a`, 5.46:1 with white) for solid danger buttons; decorative danger dots keep the bright `--color-danger` glow. A solid Bitcoin fill now takes dark ink via `--on-bitcoin` (6.96:1) instead of white on `#f7931a` (2.30:1) — the Bitcoin orange stays brand-bright, which is the point of the accent.
- Frontend: `SetupChecklist` sits directly under the dashboard welcome row; the first-run tour still comes first, and the checklist is behind it as intended.
- Version bump to v0.3.17 across root + backend `package.json`, both lockfiles, `CHANGELOG.md`, `docs/MISSION.md`, `docs/EXECUTIVE-SUMMARY.md`, `docs/WORKPLAN.md`, `.ai_docs/current-status.md`, `LATEST-UPDATE.md`.

### Fixed
- **`scripts/audit-contrast.mjs` silently skipped any token with no value in `src/app.css`.** Because the light-mode slate ramp and every semantic status step live in Tailwind's stock palette rather than ours, `--color-slate-400` was never audited in light mode — where it was rendering meta text at **2.90:1 on paper** (and `--color-slate-500` at 4.04:1 on a surface-3 chip). Measured in a real browser, `text-success` chips sat at **2.18:1**, `text-warning` at **1.99:1**, `text-danger` at **3.76:1**, `text-bitcoin` at **2.30:1**, and white on a solid `#f7931a` Bitcoin fill at **2.30:1**. All fixed above; the audit now fails loudly if a token cannot be resolved.
- Frontend: two `bg-bitcoin text-white` buttons (QR pay, 3-of-5 broadcast) and one `bg-danger` fine button were relying on that unreadable pairing — the Bitcoin fills now take dark ink and the danger button uses `--color-danger-solid`.

### Verified
- `npm run check` → 0 errors, 0 warnings; `npm test` → **115 passed** (14 files, +13 setup and +7 changelog tests); `npm run audit:i18n` → passed, **860 keys** × 9 locales; `npm run audit:contrast` → passed, **106 token pairs**; `npm run build` → green.
- **Browser sweep (Chromium, production preview):** 16 pages × light + dark = **32 combinations, 0 horizontal overflow and 0 contrast failures** attributable to the changed tokens; hero art present on all 13 hero pages. Then 3 viewports × 2 themes × 4 pages = **24 combinations at 390×844, 768×900 and 1221×738 with 0 page overflow and 0 checklist overflow**; the header artwork is `display:none` at 390 and 768 as designed and visible at 1221.
- Interaction-verified, not just rendered: `/changelog` filter narrows 74 entries to 17 and reports the active type, the latest release expands 74 → 77 entries and flips to "Show less", 5 summary-only earlier releases render, and the setup checklist ticks to 25%, writes `{"done":["units"],"hidden":false}`, survives a reload at 25% with 1 ticked box, then dismisses to a restore button with `openstrata-setup-hidden=1`. One caveat found while testing: the site is a PWA, so a stale service worker serves the previous build — the sweep unregisters it and clears origin caches before measuring.

## [0.3.16] — 2026-09-18

### Added
- Frontend: **branded page header band** (`.page-hero` in `src/app.css`). Every top-level tab now renders the same header language — a brand wash, a fine drafting grid faded toward the edges, and a brand hairline along the top edge — mixed entirely from theme tokens. All 14 hand-rolled per-page gradients are replaced (`scripts/migrate-page-hero.mjs`). **Five of them ended in `to-white`** (`from-brand-50 via-white`, `from-amber-50/50 to-white`), which painted a bright band straight across dark mode; that class of bug is now impossible because the band cannot reference a fixed surface.
- Frontend: **`StartHere.svelte`** — a three-leg journey strip (Explore the modules → Configure your building → Register and go live) mounted under the header band on `/tools`, `/tools/wizard`, `/thank-you` and `/docs/manual/getting-started`. Visited legs tick off, the current leg is highlighted, and a progress meter shows the whole path. Progress is **localStorage-only** — no account, no network call.
- Frontend: `src/lib/journey.ts` — the pure progress logic behind the strip, with 10 unit tests (`src/lib/journey.test.ts`): malformed/partial/hostile storage degrades to "nothing reached" rather than throwing.
- Tooling: **`npm run audit:contrast`** (`scripts/audit-contrast.mjs`) — recomputes WCAG 2.2 contrast for 60 text-on-surface token pairs from `src/app.css` in light *and* dark, and fails on regression. It reads `@theme`, `:root` and `.dark`, resolves `var()` references, and honours the repo's `.dark .text-<token>` text-only override convention so a deliberate fix is not reported as a failure. Added to CI (`frontend verify`) and the deployment checklist.

### Changed
- Frontend: brand ramp steps 600/700/800 retuned from the stock cyan (`#0891b2` / `#0e7490` / `#155e75`) to `#0f6d89` / `#0b5a72` / `#08485c`. `--color-brand-600` is used as a *fill* 72 times over, and white on the old #0891b2 measured only 3.68:1; it is now 5.88:1. `--color-brand-500` and below stay stock — those are the accent/glow steps.
- Frontend: `--muted` `#6d7a82` → `#5e6b75` and `--faint` `#9ca8ae` → `#7d8890` in light mode.
- Version bump to v0.3.16 across root + backend `package.json`, both lockfiles, `CHANGELOG.md`, `docs/MISSION.md`, `docs/EXECUTIVE-SUMMARY.md`, `docs/WORKPLAN.md`, `.ai_docs/current-status.md`, `LATEST-UPDATE.md`.

### Fixed
- **Ten real contrast failures found by the new audit, all fixed.** `--faint` measured **2.42:1 on white** while driving 9–10px uppercase eyebrow labels → now 3.6:1 against a documented 3:1 floor for that decorative token. `--muted` was 4.41:1 on white and **3.9:1 on a surface-3 chip** → now clears AA on canvas, paper and chips. `text-brand-600` / `text-brand-700` were 3.27–3.68:1 on light and **2.67–3.29:1 on dark** → text usages now ride the ramp (`brand-700`/`brand-800` light, `brand-300`/`brand-200` dark) via new `.text-brand-*` rules, referencing palette variables so the green "brokerage" accent theme swaps with them. **White on `--orange` measured 2.77:1** — the brand coral is a glow token, not a fill, so solid orange fills now use new `--orange-solid` / `--orange-solid-deep` (**5.02:1** with white), and the coral is kept for icons, rails and dots. Applied across `.primary-button`, `.signin-button`, `.mobile-nav .mobile-add`, `EmptyState`, `AuthModal` and `Tour`.
- Frontend: two mid-page `bg-gradient-to-b from-slate-50 to-white` bands (`/pitch`, `/about`) also painted white in dark mode → `to-transparent`.

### Verified
- `npm run check` → 0 errors, 0 warnings; `npm test` → **95 passed** (12 files, +10 journey tests); `npm run audit:i18n` → passed, 820 keys; `npm run audit:contrast` → passed, 60 token pairs; `npm run build` → green.
- **Browser sweep, 17 pages × light + dark = 34 combinations, 0 contrast failures and 0 horizontal overflow.** Contrast was computed against the live DOM with a real WCAG composite (alpha-blended ancestor surfaces, `oklab()` and `color(srgb …)` parsed), probing h1/h2/p/links/buttons/table cells at their actual font sizes and boldness — not from the stylesheet alone. `StartHere` renders 3 legs on all four journey pages; `.page-hero` is present on all 14 migrated pages.

## [0.3.15] — 2026-09-18

### Added
- Frontend: the greeter popup on `/` now plays the delivered intro video. Step 1 of the first-run tour renders `/video/openstrata-intro.mp4` (Kimi's HyperFrames render, 57s, 1920×1080, committed at `static/video/openstrata-intro.mp4`) in a real `<video>` element with inline controls; if the asset ever fails to load the card falls back to the honest placeholder copy instead of a broken frame.
- Frontend: **“What you get”** — four plain-language offer facts inside the popup (0% custody, BCFSA-aware compliance, a Bitcoin proof trail for every action, portable history) — and **“Where to start”** — a three-step instruction list. Both sit beside the video.
- i18n: 9 new catalog keys — `tourFactsTitle`, `tourFact1`–`tourFact4`, `tourHowTitle`, `tourHow1`–`tourHow3` — translated across all 9 locales.
- Docs: `scripts/inject-tour-offer-i18n.mjs` (one-off catalog injector, same pattern as `inject-recon-i18n.mjs`).

### Changed
- Frontend: step 1 of the tour is now a wider two-column card (video left; facts + start steps right) and steps 2–4 stay narrow. Previously the card was single-column and 934px tall, so a 738px viewport hid 255px of it — including the Next button. Now: 720×522 with zero hidden overflow at 768px+ and at 390px, verified in a real browser on all four steps.
- Frontend: the video section and the offer copy appear on step 1 only, so steps 2–4 stay lean.
- i18n: `tourVideoFallback` rewritten in all 9 locales — the old “Video coming soon — back in a few days.” line is no longer true.
- Version bump to v0.3.15 across root + backend `package.json`, both lockfiles, `CHANGELOG.md`, `docs/MISSION.md`, `docs/EXECUTIVE-SUMMARY.md`, `docs/WORKPLAN.md`, `.ai_docs/current-status.md`, `LATEST-UPDATE.md`.

### Fixed
- i18n: `npm run audit:i18n` was **failing on `main`** — the v0.3.14 commit added the four video keys to English, French, Spanish, Chinese, Hindi and Filipino but never to Polish, Ukrainian or Swahili, and the locale-parity guard checks every locale against French. The missing keys are now translated, so the audit passes at 813 keys × 9 locales. This would have failed the `frontend verify` CI job.

### Verified
- `npm run check` → 0 errors, 0 warnings; `npm test` → 85 passed; `npm run audit:i18n` → passed, 813 keys; `npm run build` → green (the video is emitted to `build/video/openstrata-intro.mp4`).
- Browser-verified (Chromium, production preview): all 4 tour steps, 0 hidden overflow and 0 horizontal page overflow at 1221×738, 768×900 and 390×844; step 1 resolves `/video/openstrata-intro.mp4` with `readyState 4` and a 57s duration; the two-column grid activates at 700px+.

## [0.3.14] — 2026-09-17

### Added
- Frontend: first-run greeter popup card rebuilt with a video section (`src/lib/components/Tour.svelte`): greeting card (icon + scene art + eyebrow/title/body) + a video section inside the same card, so a new visitor gets hello + one-minute intro in one glance. Video section: a tease frame (play mark + short subhead + fallback hint + CTA) collapses to a single trigger line when not expanded; expanded it holds either a real `<video>` once the asset lands or an honest "Video coming soon — back in a few days." placeholder.
- i18n: new video-section keys — `tourVideoTitle`, `tourVideoSub`, `tourVideoCta`, `tourVideoFallback` (English for now).
- Docs: Kimi video handoff — `docs/KIMI-HANDOFF.md` session section + `docs/VIDEO-SPECS.md` (specs + 1-minute intro script + delivery checklist). Kimi owns the recording + asset URL; the frontend just needs one src swapped in after she delivers.

### Changed
- Version bump to v0.3.14 across root + backend `package.json`, both lockfiles, `CHANGELOG.md`, `docs/MISSION.md`, `docs/EXECUTIVE-SUMMARY.md`, `docs/WORKPLAN.md`, `.ai_docs/current-status.md`, `LATEST-UPDATE.md`.

### Verified
- `npm run check` clean; `npm test` green; popup renders on `/` for signed-out fresh visitors; video section inside the greeting card, inline, does not break the 4-step tour.

## [0.3.13] — 2026-09-16

### Added
- Backend: Ziggy PSBT workflow seam (`broadcastPsbtWorkflow` in `backend/src/ziggy/node-broadcast.ts`) — the BIP174 node path: `walletprocesspsbt` (sign) → `finalizepsbt` (extract when complete) → `sendpsbt` → txid. The signing coordinator's aggregated `psbtB64` passes straight through; otherwise a deterministic BIP174-shaped skeleton is serialized from the plan (`serializePsbtSkeleton`: global unsigned-tx map + per-input partial-sig entries). **Readiness guard:** the seam refuses below-threshold plans before any RPC (same contract as `broadcastPsbt`).
- Backend: `/treasury/psbt/broadcast` tries the workflow seam first on the rail path; the raw-tx seam (`sendrawtransaction`, `railEnabled: true`) is the watch-only fallback. Both failing → `txid: null` + `rail: 'unavailable'` + `placeholder: false` — the broadcast-honesty tri-state is preserved.

### Fixed
- Pre-existing typecheck error in `rosa/ingest-vector.ts` (TS5076) and the stale `broadcastRawTx` throw test (both also fixed independently by the family; kept through the rebase).

### Verified
- `backend npm run typecheck` clean; `backend npm test` **191 tests** (was 182; bitcoin-modules 26), e2e smoke 6 skipped (no DB).

## [0.3.9] — 2026-08-26

### Added
- Backend: Rosa pgvector/Ollama retriever (`backend/src/rosa/vector-retriever.ts`) — real pgvector + Ollama retriever on the existing `Retriever` contract; embeds the question with Ollama `/api/embeddings` (nomic-embed-text, 768 dim), cosine-nearest-neighbor searches `corpus_chunk` (migration 0002, `vector(768)`, HNSW) via pgvector `<=>`, falls back to `keywordRetriever` when pgvector/Ollama are unavailable. `POST /api/v1/rosa/query` + `/rosa/sources` unchanged; response carries `collection` so callers can tell which tier answered.
- Backend: Ziggy PSBT broadcast + on-chain reconcile seam (`backend/src/ziggy/broadcast.ts`) — `broadcastPsbt` (marks a ready plan broadcasted; refuses below threshold) + `postSpendToLedger` (debits the authorized fund on the trust ledger so the on-chain leg reconciles into the same hash chain). Wired as `POST /api/v1/treasury/psbt/broadcast` (treasurer+); `/treasury/psbt/plan` unchanged.
- Backend: Tailscale-first, per-user-tailnet self-host deployment model — `backend/README.md` Deployment model section, `.env.example` Tailscale-host-metadata + per-user-tailnet notes, `backend/API.md` notes.

### Changed
- `docs/ROADMAP.md` + `docs/WORKPLAN.md`: Phase 3 items marked complete.
- `.ai_docs/current-status.md`, `docs/KIMI-HANDOFF.md`, `LATEST-UPDATE.md`: refreshed.

### Fixed
- Tailwind v4 unlayered-reset cascade bug (already in 0.3.9 code, documented here for the release marker).

## [0.3.10] — 2026-09-16

### Added
- Backend: Rosa corpus → pgvector indexer (`backend/src/rosa/ingest-vector.ts`) — embeds the in-memory BC corpus with Ollama `/api/embeddings` (nomic-embed-text, 768 dim) and upserts into `corpus_chunk` (migration 0002), idempotent per citation; CLI `rosa index` (embed + write corpus, needs Ollama + DB) + `rosa reset` (dev: drop + re-create `corpus_chunk`). Pure noun-phrase placeholder embed mode (`ROSA_EMBED_MODE=pure` or no `OLLAMA_BASE_URL`) lets `rosa index` populate `corpus_chunk` now before Ollama is provisioned — proving the retriever + indexer + query path end-to-end against the BC corpus with a real pgvector cosine search.
- Backend: Ziggy on-chain broadcast plug-in seam (`backend/src/ziggy/node-broadcast.ts`) — bitcoind JSON-RPC raw-tx path first (`sendrawtransaction` → txid; PSBT workflow seam `walletprocesspsbt → finalizepsbt → sendpsbt` is the next step). `broadcastRawTx(plan, btc, outputs) → { txid, hex }`; returns a deterministic placeholder txid (`psbt:<planId>:<shortHash>`) when no node client is reachable so the rest of the seam (UI, receipts, reconcile) can iterate now; real node client overrides it when configured. `planSummary(plan)` helper.
- Backend: `/treasury/psbt/broadcast` now calls `broadcastRawTx` when `BITCOIN_RAIL_ENABLED=true` + `BITCOIN_NODE_URL` + `BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS` are set and returns the real txid; otherwise returns the placeholder txid.
- Backend CLI: `rosa ingest` (pure validate, unchanged), `rosa index` (new), `rosa reset` (new).
- Backend: `BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS` in `.env.example`.
- Docs: `docs/TAILSCALE-ONBOARDING.md` — self-contained, read-only walkthrough any operator can follow to stand up the backend on their own host behind Tailscale (Path A: solo operator, one host, one tailnet; Path B: any user/team, each operator uses their own Tailscale). The onboarding agent sets `.env`, brings up compose, runs migrate + e2e smoke gate, prints the MagicDNS name + `PUBLIC_API_BASE_URL` value — never touches auth tokens, JWTs, or council data.
- Docs: `backend/README.md` CLI section (`rosa ingest`/`rosa index`/`rosa reset`/`ziggy simulate`) + Deployment model section; `backend/API.md` Rosa two-tier retrieval seam doc (with `rosa index`/`rosa reset` notes) + `psbt/broadcast` endpoint doc (raw-tx seam first, bitcoind RPC auth); `docs/DEPLOYMENT.md` links to `TAILSCALE-ONBOARDING.md` + after-host rosa index/rails steps; `docs/ROADMAP.md` + `docs/WORKPLAN.md` all Phase 3 items complete.
- Docs: `.ai_docs/current-status.md`, `docs/KIMI-HANDOFF.md`, `LATEST-UPDATE.md` refreshed with the full run (two batches) + decisions.

### Fixed
- `broadcastRawTx` returned `null` txid when no node client was reachable — now returns a deterministic placeholder txid so the rest of the seam can iterate.

### Known issues
- Phase 3 backend not yet deployed on a Tailscale host (the e2e smoke gate covers the Postgres adapters; a live host run is still pending).
- Rosa answers with pgvector+Ollama embeddings only after Ollama is provisioned and `rosa index` has run; until then the keyword fallback answers with citations.
- Ziggy PSBT broadcast returns a placeholder txid until a real bitcoind/LND node client is configured and enabled in `.env`.
- Sovereign rails prepared, not connected: no LND/Liquid/PayNym/Nostr relay running on a host; `cadPerBtc` needs a live rate feed.
- Form B/F PDF file output remains a browser-side print path (print-ready HTML), not a server-side PDF.
- Machine-drafted locale overrides need professional human review before being treated as reviewed.

### Added
- Reusable `Card` component (`src/lib/components/Card.svelte`) with content/compact/hero variants; migrated **47 content cards across 9 route pages** (about, blog, docs, legal, templates, compliance, pitch, roadmap, spec, tools, rss). Structural cards (tables, accordion wrappers, the design page's raw-class demo) intentionally remain `glass-card`
- Marketing typography ramp: h1 36px / section h2 24px / sub-section h2 20px, card titles weight-800 (scoped `.mesh-bg .glass-card`) across all 13 marketing pages

### Changed
- Dashboard rail + marketing cards unified on one token set: `.panel` padding 17px→24px, weight-800 headings, shared `--shadow-card`; SatohashStatus third visual language eliminated
- Sidebar shell pinned to the viewport (`top:0` + `max-height:100dvh`); HostConnect strip moved into the dashboard's main column so the nav footer button stays visible at every size
- `:root { color; background }` now wired to `var(--ink)`/`var(--canvas)` so dark-mode body text actually flips

### Fixed
- **Site-wide Tailwind v4 cascade bug:** unlayered element resets (`a{color:inherit}`, `button{border:0;font:inherit}`) were beating the layered `.text-*`/`.border-*` utilities, so every brand link rendered plain ink (invisible in dark mode) and buttons lost size/border. Moved the resets into `@layer base` so utilities win
- `text-bc-blue` on dark cards was ~2:1 (dark navy tuned for light surfaces); lightened dark-mode text usages only (solid `bg-bc-blue` badges keep the navy behind white text) to 6.9–9.0:1
- Pre-existing RSS mobile overflow: long `<code>` endpoint paths forced the page ~79px wide; added `min-w-0` to grid columns + `break-all` to paths

### Verified
- Real browser (Chrome + CDP): brand links teal `#0891b2` in both modes, dark body `#e2e8f0`, bc-blue chips 6.9–9.0:1, zero horizontal overflow on all 13 pages × 3 sizes (light + dark). svelte-check 0/0, **85 tests**, build clean

## [0.3.5] — 2026-08-26

### Added
- Per-council DB-backed unit registry (migration `0005_council_units.sql`, `unit` table keyed on `(community_id, unit_ref)`)
- `UnitStore` interface + `PostgresUnitStore` + `MemUnitStore` (list/get/upsert/remove/seedDefault); register seeds each new council's building
- `GET /api/v1/units/:unitRef` unit detail — AR ledger balance (hash-chain verified) + payment requests (unit → payment → ledger traceability)
- `POST /api/v1/units` (treasurer+, canonicalized unitRefs) and `DELETE /api/v1/units/:unitRef` (admin)
- Frontend Form K hub: live unit-detail panel + add/remove unit controls when signed in

### Fixed
- `PostgresPaymentRequestStore.markStatus` wrote the referenceCode into `status` (`status = $2` instead of `$3`) — the e2e re-quote assertion would have failed on a real Postgres
- Payment-quote unitRefs now canonicalize at the boundary (`unit-302` → `302`) so stored rows, referenceCodes, and unit detail agree
- Billing AR funds aligned to the canonical `ar:unit-<n>` account so unit-detail balances read real charges

### Changed
- Version markers synced to **v0.3.5** (root + backend `package.json`); backend now 167 tests / 16 files, frontend 45 tests, i18n 565 keys × 9 locales

## [0.3.4] — 2026-08-26

### Added
- 20-item upgrade push: auth rate limiting (#6), build-time CSP pinning (#2), monthly treasury series endpoint (#4), live CAD/BTC rate provider (#7), meetings quorum/voting UI (#8), transparent sub-accounts dashboard (#10), CSV bank-feed import (#12), war-chest DCA planner (#18), PSBT 3-of-5 orchestration seam (#15), Satohash stamp endpoint (#19), watch-only xpub import (#16), portable export (#20), CRT evidence bundle (#11), print-ready Form B/F (#9)

## [0.3.3] — 2026-08-26

### Fixed
- CSP in `static/_headers` was blocking the page's own assets (Google Fonts, Umami analytics, live-API `connect-src`); fonts now load once, unused `Inter` dropped

### Changed
- Landing shell tightened (1280px content, crisp 2-layer card shadows) per "solid, tight" pass

## [0.3.2] — 2026-08-26

### Added
- `src/lib/api/` client (config/token/client/auth + typed ledger/units/rails helpers), AuthModal, Live/Demo pill, dashboard + tools + reconciler + pitch wired to `/api/v1/*` with demo fallback

## [0.3.1] — 2026-08-26

### Added
- Zero-dependency JWT auth + multi-tenant council scoping (migration 0004), roles admin/treasurer/member, tenant-isolated payment store, Postgres e2e smoke suite + CI job

## [0.2.6] — 2026-08-25

### Added
- Migrated remaining hard-coded interface copy across all 14 routes (dashboard footer, wizard, about, blog, templates, legal, roadmap, rss, spec, compliance, tools, docs, pitch) to the shared locale catalog — 458 keys total
- First reviewed locale overrides for French (fr-CA), covering all interface copy added in v0.2.6
- `npm run audit:i18n` now scans for hard-coded text nodes, placeholders, and meta content, so new English chrome can be caught before release

### Changed
- Version markers (layout, pitch, wizard config) derive from `package.json` v0.2.6

## [0.2.5] — 2026-08-25

### Fixed
- Centralized visible, metadata, pitch, and generated-config version markers on the package version
- Removed stale `v0.2.0` and `0.1.0` release identifiers from active application surfaces

## [0.2.4] — 2026-08-25

### Fixed
- Synchronized `package-lock.json` with `package.json` so Cloudflare Pages can complete `npm ci`
- Added a versioned deployment repair release after stale production output was detected

## [0.2.3] — 2026-08-25

### Added
- Locale-aware date, number, and CAD currency formatting for supported languages
- `npm run audit:i18n` translation completeness audit for route catalog usage

### Changed
- Dashboard, About, Pitch, Blog, and shared footer now respond to the active locale for visible formatted values

## [0.2.2] — 2026-08-25

### Added
- Reusable `/templates` library for legal, governance, and finance workflows
- Source and professional-review notes on every starter template
- Shared locale keys for template descriptions and sources

### Changed
- Finished remaining visible wizard and compliance interface copy through the shared locale catalog
- Added `/templates` to the site navigation

## [0.2.1] — 2026-08-25

### Added
- Shared locale coverage for the public blog interface
- Source-linked `/legal` library for BC legislation, regulations, official guidance, and tribunal information
- Legal-information notice separating workflow support from legal advice


All notable changes to this project are documented here.

## [0.2.0] — 2026-08-25

### Added
- Responsive OpenStrata operations dashboard with desktop sidebar and mobile navigation
- Multilingual shell for English, French, Spanish, Chinese, Hindi, Filipino, Polish, Ukrainian, and Swahili
- Building health cards, activity feed, upcoming events, quick actions, and formation workspace modal
- Trust-oriented footer and visible product version marker

### Changed
- Rebuilt the missing SvelteKit source foundation for the current GUI

### Fixed
- Added accessible interactive card and dialog semantics

## [0.1.0] — 2026-06-22

### Added
- Initial project scaffold
- Project documentation from canonical TEMPLATE (8 files)

### Changed
- None

### Fixed
- None