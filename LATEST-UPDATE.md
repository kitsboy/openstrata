# openstrata — Last Updated 2026-09-20 by Buffy (M3)

> **v0.3.24: search that remembers, narrows, and travels.** Cam's standing rule holds — nothing a visitor did gets lost — and this round extends it to *looking things up*: the queries a person already typed are kept on their device, the ten result groups are one tap away as filters, and any search can leave the modal as a link a council member can open.

**Brief (v0.3.24):** **(1) Recent searches** — the empty ⌘K modal remembers the last five queries, device-local (`openstrata-recent-searches`), capped at 80 chars, deduped case-insensitively, one-tap remove; 7 tests. **(2) Scoping chips** — ten one-tap filters above the results; chips scope *before* ranking, so a query that missed the global top-12 still surfaces inside its group; labels come from `searchGroupShort()` and render from `groupsInIndex()`, so a future group can never grow a chip that filters to nothing. **(3) Shareable search** — every modal state links to `/search?q=…`, Enter-with-no-selection navigates there, and the page runs the same index so a shared link can never disagree with the modal. **(4) Copy debt to zero** — the thank-you flow prose moved to `src/lib/thankyou.ts` as canonical English (the documents/custody rule), its chrome and the home proof band, design specimens, privacy/terms metas, wizard link and footer links all went through the catalog: hard-coded-copy warnings **24 → 0**. **(5) Help lands on the walkthrough** — the sidebar "Need a hand?" card and the HostConnect strip now deep-link to the six-step getting-started guide.

**Commit:** _recorded in the docs commit that lands with this file._

---

## v0.3.24 in detail

### The modal remembers you
`src/lib/recent-searches.ts` is pure and device-local — the same posture as the wizard draft. Open the modal empty: your recent queries are one click each, with an × to drop one. Corrupt storage degrades to an empty list, never a broken modal.

### Chips that narrow before they rank
`scopeIndex()` filters the index to one group, *then* ranks — so "notice" inside Documents finds the meeting notice even when legal sources crowded it out of the global top-12. Chips toggle (click again to unscope) and use short labels so "Print-ready documents" fits as "Documents".

### A search you can send
`/search?q=Form%20B` is a real page: hero, ranked results, group eyebrows — the same `buildSearchIndex` the modal uses. In the sitemap (the route is crawlable) and `llms.txt`; the page itself sends `noindex, follow` (each query string is a soft-404 for a crawler).

### The copy-debt sweep
24 audit warnings → 0. The thank-you page's honesty prose ("nothing was published, emailed, or charged") is canonical English in `src/lib/thankyou.ts` — a loose translation of that is a materially false statement — while all page chrome went through the catalog ×9 locales. One audit quirk recorded: `thanksNoHiddenSteps` ends with an em dash because the audit's key regex reads a trailing `:'` as a phantom key named `e`.

### New guards
- Every indexed href must resolve to a canonical route (the sitemap's list — not the nav; `/custody` deliberately lives outside the bar). The guard caught a false assumption on its first run, which is the point.
- Short chip labels never collide within a locale; chip map and eyebrow map always cover the same ten groups; share hrefs round-trip through `URLSearchParams`.

**Verified:** `check` 0/0 · **229 tests** (was 217) · `audit:i18n` **968 keys × 9 locales**, 0 hard-coded warnings · build green · changelog regenerated (27 releases, 176 items).

---

## Live verification (production, 2026-09-20)

Measured on `https://openstrata.giveabit.io` with the **service worker unregistered and origin caches dropped first**:

- **Version marker reads 0.3.24.**
- **⌘K empty state:** all ten chips render (Pages · Documents · Manual · Posts · FAQ · Templates · Legal · Sources · Tools · Tasks) with the ten-group hint; no recents block on first open.
- **Search:** "Form B" returns 7 results led by *Form B — Information Certificate*, with a share link to `/search?q=Form%20B`.
- **Scoping:** clicking Documents narrows to exactly 1 result, all eyebrows read *Print-ready documents*, the chip shows pressed; clicking again would unscope.
- **Choose:** clicking the result lands on `/documents?doc=form-b` and stores `["Form B"]` under `openstrata-recent-searches`; reopening the modal lists it as a recent.
- **Recents remove:** the × empties the list and storage reads `[]`. Escape closes the modal.
- **Shareable page:** `/search?q=Form%20B` renders the h1 *"Form B"* with the certificate as the first result card, and sends `noindex, follow`. Sitemap lists `/search`.

One cosmetic selector miss in the verification script (the count-label probe caught the hero badge instead of the results count) — the page itself is correct; not a product defect.

---

## v0.3.23 (2026-09-20) — the ⌘K hint caught up with the index

The empty search modal's copy said "Search across pages, posts, FAQ, templates, and legal sources" — written when the index had five groups; v0.3.22 grew it to ten. Fixed in all 9 locales, with `searchGroupLabels()` as the one home for group labels and 3 drift-guard tests so the copy can never lag the index again. Two labels (`primarySources`, `strataTool`) that had silently fallen back to English in eight locales are now localized everywhere. Verified: `check` 0/0, 217 tests, 921 keys × 9 locales, build green.

## v0.3.22 (2026-09-20) — nothing you started gets lost

### Continue where you left off
The wizard held everything in component state — a phone call or a closed tab meant the whole building came back blank. It now writes a draft (`src/lib/resume.ts`, localStorage `openstrata-wizard-draft`, 8 tests) on every step move, `ResumeChip.svelte` offers it back on the dashboard, the wizard restores fields before the template prefill runs and says "Draft restored". Corrupt storage degrades to "no draft"; a finished build clears the draft because done is not pending.

### Search that knows the site
`buildSearchIndex` gained `documents` (deep links to `/documents?doc=<slug>`), `manual`, and a `tasks` row for the dashboard's list. A council that types "Form B" now finds the certificate itself, not a page that mentions it.

### The demo banner
`shouldShowDemoBanner` (`src/lib/demo-banner.ts`, 7 tests) is the whole rule: only unsigned + sample-data + settled, never a configured host, dismissal is a UTC day-stamp with a 7-day TTL. The banner's CTA protects work in progress; its visibility rule protects the truth.

---

## Live verification (production, 2026-09-20)

Measured on `https://openstrata.giveabit.io`, not on the local build, with the **service worker unregistered and origin caches dropped first**:

- **Version marker reads 0.3.22** (`openstrata-version` meta and the page title).
- **Demo banner:** on a sample-data dashboard it reads _"You are in demo mode — everything here is sample data, and nothing you type is saved to an account. Your building draft is kept on this device only."_ with **Save my building →** linking to the wizard. Dismissing stores the UTC day-stamp (`20716`) and the banner stays gone across a reload; the tour does not repeat over it.
- **Resume chip:** a draft created in the wizard shows _Continue where you left off — Harbour House — 3 of 8 · in progress_ with **Continue →** and a discard button; one click lands on the wizard's units step with the **"Draft restored"** notice; a fresh visit restores the name field ("Harbour House") and jurisdiction (BC) exactly.
- **⌘K search:** all ten group eyebrows observed live — Pages, Posts, FAQ, Templates, **Print-ready documents**, Manual, Legal, **Primary and official sources** (feeds), Strata tool, **What needs doing** (tasks). "Form B" returns the certificate itself first and clicking it lands on `/documents?doc=form-b`.
- ~~**One stale string found:** the empty search modal still says "Search across pages, posts, FAQ, templates, and legal sources" — written when there were five groups.~~ **Fixed in v0.3.23.**
