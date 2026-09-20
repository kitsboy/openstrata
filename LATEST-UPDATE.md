# openstrata — Last Updated 2026-09-20 by Buffy (M3)

> **v0.3.23: the words agree with the product.** Cam's standing rule is that the UX must keep getting easier without losing a single thing a visitor has already done — and the words must keep up with the features, because a placeholder that undersells the index is the same lost-work problem in miniature: a visitor is told the tool finds less than it does. The ⌘K empty state now names every group the index actually serves, in all nine locales, and a test makes the next drift impossible.

**Brief (v0.3.23):** **(1) Search hint catch-up** — the empty ⌘K modal said "Search across pages, posts, FAQ, templates, and legal sources", written when there were five groups; there are ten now. The hint names them all, in all 9 locales, and a drift guard test ties the copy to the index's group list — the same class of guard that protects the nav, the task list and the first-visit contract. **(2) Group labels from one home** — the modal's inline group-label map moved into `search.ts` as `searchGroupLabels()`, so the eyebrows, the hint and the index are derived from the same source. **(3) Two labels were quietly English-only** — `primarySources` ("Primary and official sources") and `strataTool` ("Strata Tool") had no locale overrides, so they rendered as English fallbacks in the other eight languages; all eight now carry them.

**Commit:** _recorded in the docs commit that lands with this file._

---

## v0.3.23 in detail

### The empty state that lagged the product
Ten groups went into the index in v0.3.22; the empty-modal copy stayed at five because nothing connected the string to the index. Fixed two ways: the copy now lists all ten, and a test reads the group list out of `buildSearchIndex` and fails if `searchHint` ever names fewer. If a future session adds an eleventh group, the test fails until the hint is rewritten — the drift can never ship silently again.

### One home for the group labels
`searchGroupLabels(t)` in `search.ts` returns the ten eyebrow labels; `SearchModal.svelte` consumes it instead of carrying its own map. The hint copy is written to echo the same labels, so a council reads the same words in the placeholder as in the results.

### Two labels that were never localized
`primarySources` and `strataTool` existed in the English catalog only — the other eight locales silently fell back to English for two of the ten group eyebrows. Now overridden everywhere; "Strata Tool" stays as the product name in every locale, matching the file's own convention (`openStrataToolsCta` keeps it in all nine).

---

## Live verification (production, 2026-09-20)

_Pending deploy._

---

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
