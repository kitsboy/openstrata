# openstrata — Last Updated 2026-09-21 by Buffy (M3)

> **v0.3.25: the tour came back, and everything got a shortcut.** The popup explainer with the video was never deleted — it was unreachable for half of new visitors and unrecoverable for everyone — so it is now one click away forever. Around it: pinned searches on the dashboard, group counts in ⌘K, keyboard-first wizard steps, a 404 that searches for you, and a docs link checker that already caught four dead links.

**Brief (v0.3.25):** **(1) Tour fixed + replay** — diagnosis: the first-run popup only ever appeared on the "just looking" path (the "setting up a building" path went straight to the wizard, past it), and once dismissed it was unrecoverable. The welcome row now carries a "Watch the 60-second intro again" pill (`tourReplay`, ×9 locales) that reopens the full four-step card — video, facts, start steps — on demand. **(2) Saved searches** — a pin button in ⌘K (`saved-searches.ts`, device-local `openstrata-saved-searches`, capped 8, deduped case-insensitively) and a strip on the dashboard under the task list; one tap runs `/search?q=…`, × unpins; 6 tests. **(3) Group counts in ⌘K** — each scoping chip now shows its index size ("Documents · 4"), so the corpus is visible before typing. **(4) Modal footer hints** — "↵ open · esc close" under every modal state, `aria-hidden`, never in the tab order. **(5) Task list filters** — All · Overdue · This week · Done chips; "This week" and "Overdue" read the *full* list (never the collapsed view's parked rows); Done shows ticked setup steps, untick to restore. **(6) Keyboard-first wizard** — number keys jump steps (skipped while typing in a field; forward jumps across step 2 enforce the building-name rule exactly like the Next button). **(7) 404 rescue** — a dead URL's words become `/search?q=` chips, so a mistyped path is a search away from a page. **(8) Docs cross-link checker** — every markdown link in `docs/` and `llms.txt` must resolve to a real route (walked from `src/routes`, so dynamic `[category].xml` feeds count) or a real file; on its first run it caught 4 broken `../diligence/` links (fixed to `diligence/`). **(9) Back-to-top** — a floating arrow after ~900px of scroll on every long page, reduced-motion aware, hidden on print.

**Commit:** _recorded in the docs commit that lands with this file._

---

## v0.3.25 in detail

### The tour was never missing — it was unreachable
Fresh-browser testing on production proved the card works. The real bugs were reachability: `chooseStart('setup')` navigated to the wizard *before* the tour could show, so anyone who answered "I'm setting up a building" never saw it; and `openstrata-tour-seen` was a one-way door. The replay pill fixes both by making the tour a destination rather than a one-shot popup. `Tour.svelte` itself needed zero changes — replay is parent-side (`showTour = true`), and a replay's dismissal harmlessly rewrites the same flag.

### Saved searches are the deliberate tier
Recents remember what you *just did*; pins remember what you *always do*. Same device-local posture as every other nudge (no account, no network, corrupt storage degrades to empty). The dashboard strip renders only when pins exist, so it never nags an empty dashboard.

### Chips that show their size
The count lives in the chip, computed from the same index the search runs — a group that shrank or grew is visible the moment the modal opens, and a drift-guard test keeps chip labels, eyebrows and counts reading from one source.

### A 404 that helps
`decodeURIComponent(pathname)` → words → stop-word filter → up to six search chips. `/tools/wizrds` offers "tools" and "wizrds"; `/form-b` offers "form" and "b". Structure words (www, com, html, index, …) never become chips.

### The checker that pays rent immediately
The authority on "what exists" is `src/routes` walked from disk — the sitemap deliberately omits dynamic routes like `/rss/[category].xml`, and the nav omits deliberate pages like `/custody`. The filesystem knows both. First run found 4 docs links pointing at `../diligence/` (which resolves to the repo root, not `docs/diligence/`); all fixed.

**Verified:** `check` 0/0 · **238 tests** (was 229) · `audit:i18n` **976 keys × 9 locales**, 0 hard-coded warnings · build green.

---

## v0.3.24 (previous release)

Recent searches in ⌘K (device-local, capped, deduped), ten scoping chips that filter before ranking, shareable `/search?q=` pages in the sitemap, copy debt 24 → 0 (968 keys × 9 locales), plus drift guards for dead links, colliding chips and broken share URLs. Live-verified on production.

---

## Live verification (production, 2026-09-20 — v0.3.24)

Measured on `https://openstrata.giveabit.io` with the **service worker unregistered and origin caches dropped first**:

- **Version marker reads 0.3.24.**
- **⌘K empty state:** all ten chips render (Pages · Documents · Manual · Posts · FAQ · Templates · Legal · Sources · Tools · Tasks) with the ten-group hint; no recents block on first open.
- **Search:** "Form B" returns 7 results led by *Form B — Information Certificate*, with a share link to `/search?q=Form%20B`.
- **Scoping:** clicking Documents narrows to exactly 1 result, all eyebrows read *Print-ready documents*, the chip shows pressed; clicking again would unscope.
- **Recents:** searching "arrears", closing, reopening — the query is in the recents block; the × removes it; localStorage holds `openstrata-recent-searches` only (device-local, as documented).
- **Share page:** `/search?q=Form%20B` renders the ranked results in a real browser with the same top hit as the modal.

_(v0.3.25 live checks land in the docs commit after this release pushes.)_
