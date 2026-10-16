# openstrata — Last Updated 2026-10-16 by Buffy (M3)

> **The one-lot pay sheet is live on `/pay` (v0.3.30).** Cam picked it from the four offered UI upgrades, and it is now one sheet: **one amount** in the page's largest type, **three large choices** (e-Transfer · Bitcoin · Lightning) as real radios under styled labels, and **the picked rail in full** — destination, exact BTC and sats, QR, steps. The 15-minute rate lock is a **quiet stamp**, and when it expires the sheet stops pretending: the BTC row takes the warning ink and a note offers the re-price. **PAD and cheque are tucked under** in a disclosure, with a lot picker and deep links (`/pay?unit=108&rail=bitcoin`). The bug worth remembering was found by verifying rather than reasoning: the sheet reseeded its chosen rail from `?rail=` in an effect, and a traced run showed the click wrote the rail, began the URL write, and the effect then re-ran against the URL *as it still was* and put the old rail back — **the tick and URL said e-Transfer while the panel showed Lightning's invoice**. The sheet now has exactly one writer per value (the URL is an output and a one-time seed); the rules live in `src/lib/pay-sheet.ts` with 13 tests. Verified in Chrome on the built artifact: every choice, rapid-click sequences, six deep links, all 40 lots (shown amount must equal the option's own amount), the zero-balance lots, the full expiry → re-price → re-expire flow (scratch build, `LOCK_SECONDS = 3`), and **0 text below 4.5:1 at 1280px and 390px in both themes**. `check` 0/0, **261 tests**, `audit:contrast` pass, `audit:i18n` pass, build green. The queue was renumbered — four are waiting again (a floor you can walk, a September close, the next 30 days once, a release trail on `/changelog`).

---

# openstrata — Last Updated 2026-10-16 by Buffy (M3) — contrast pass

> **Every rendered page clears WCAG AA now, and the audit can no longer miss the bug that caused it.** The reported symptom was a pay dock you could not read in dark mode; the cause was never "some colours are too light" — it was surfaces whose plate and ink did not move together. Three of them are fixed at the root: the dashboard chrome is navy in **both** themes and now scopes its own `--chrome-*` ramp (its workspace eyebrow and nav group label measured 2.2:1, the sidebar help line 3.7:1, its wordmark 2.2:1); the auth modal's navy brand panel does the same with the slab ramp (wordmark 1.04:1, subtitle 1.25:1); and nine card fills that were pinned `#fff` in `src/app.css` and re-declared for dark mode in a separate block now use `var(--paper)` and flip by construction — four hand-written overrides deleted with them. Also fixed: two `var(…)` references to tokens that do not exist (`--surface-3`, `--shadow-sm`), which silently dropped the declaration and used a fixed near-white fallback; the auth modal's strength verdict, step labels and field labels (literal greys at 2.44:1–3.6:1); the legal library's table headers, quotes and code spans (a pinned light wash under light ink, 1.11:1 at night); the print document's smallest labels (3.62:1); the roadmap's step numerals and completed-phase dot (white on emerald-500, 2.54:1); the pitch deck's two paper slides (headline 1.06:1 at night); and the footer's own lockup. New: a theme-aware focus ring (the old one was a 45%-alpha blue, ~1.9:1 — a focus indicator below the 3:1 non-text floor), brand-tinted text selection, and a skip-to-content link in both shells (x9 locales). The audit went 194 → **218 token pairs** and gained four structural guards, each verified to **fail** when the fixed line is reintroduced. Chrome, 28 routes × both themes (56 loads, 10,976 text nodes) plus the ⌘K modal, topbar menus and auth modal: **0 below 4.5:1**. Removed 23 one-off i18n codemod scripts. `check` 0/0, 248 tests, `audit:contrast` pass, build green. Version v0.3.29. Commit `f552024` (code); docs on top of it.

---

# openstrata — Last Updated 2026-09-30 by Grok

> **UI queue is on the roadmap.** Four upgrades are written down and not started: a floor you can walk, a one-lot pay sheet, a September close, and one next-30-days strip. The interface keeps being refined as the product grows. After every UI push, offer exactly four and wait for a pick. Kimi reads `docs/KIMI-HANDOFF.md`. Any other model reads `static/llms.txt`. Commit `2c8dfd0`.

---

# openstrata — Last Updated 2026-09-30 by Grok

> **Evergreen House.** The dashboard now opens one 40-lot building (LMS 2847, 4 floors, books closed September 30, 2026) instead of three sample communities. Units, accounting, pay, tax, calendar, and meetings are real pages. E-transfer, Bitcoin, and Lightning stay on screen. Payment strings are demo-only. Commit `2df6819`. Base is v0.3.28 (`0a98655`). `check` 0/0, 248 tests, build green. Not browser-verified.

---

# openstrata — Last Updated 2026-09-21 by Buffy (M3)

> **v0.3.28: the deadline calendar's day popover is live and its month buttons speak properly.** Clicking a day with deadlines opens a small panel right under that cell — the full item list, each with a one-tap link to Strata Tools — and the month navigation buttons now announce "Previous month"/"Next month" instead of borrowing task-list strings.

**Brief (v0.3.27 + v0.3.28):** **(1) Calendar day popover** — day cells became real buttons (keyboard reachable, `aria-expanded` on the open day); clicking opens a 170px panel pinned under the cell, clamped inside the grid on narrow phones, closing four ways: ✕, Escape, outside click, month navigation. **(2) Nav aria-labels (v0.3.28)** — the v0.3.27 keys were injected but never wired; live verification on production caught it and the fix shipped the same day. **(3) Verified live:** open/Escape/✕ exercised in a real browser on production against v0.3.28.

---

> **v0.3.26: the money path is guarded, the first month is guided, and the dashboard stopped pretending.** The loop a real council runs — bill, collect, reconcile, close, certify — is now a CI-gated end-to-end journey; a five-step walkthrough teaches it; and the dishonest bits of the dashboard (a fake reserve-funds number, toast-only buttons, a static "upcoming" list) are gone.

**Brief (v0.3.26):** **(1) E2E money-path suite** — `backend/tests/money-path.e2e.test.ts` boots the real Fastify server over HTTP and walks the full council loop: register → units → billing run (the late notice lands on the arrears unit) → Lightning quote with the per-site receive label → confirm posts to the unit's AR ledger → reconcile → hash-chain verification → deadline calendar → Form B issued while Form F is **withheld** on the debtor unit → another council sees nothing. 10 tests. **(2) Guided first-month walkthrough** — five steps in treasurer order (bill → collect → reconcile → review → close) mounted on the tools page, each linking to the real panel where the step happens; device-local progress with reset/hide (`src/lib/first-month.ts`, 6 tests). **(3) Rosa quality gate** — a golden set of 12 real BC questions with expected citations scored by a pure eval harness (`backend/src/rosa/eval.ts`); hit@4 must be 1.0 and out-of-jurisdiction questions must be refused. The gate exposed a real gap: the keyword retriever answered an Alberta question from BC word overlap, so `rosa.ts` now fails closed on out-of-scope questions. **(4) Honest building drill-down** — the modal's fake "reserve funds = health × 2400" is gone; health, open actions and the real issue remain, with a straight note that live detail lives in Strata Tools. **(5) Fake buttons killed** — every toast-only dashboard button now navigates to its real destination (plan-meeting/log-request → tools demos, legal source → `/legal`, activity rows → tools demos, building ••• → Strata Tools). **(6) Deadline calendar** — the "Upcoming" list became a real month-view grid with statutory windows shaded (window length read from the deadline's own wording), today ringed, overdue red (`src/lib/calendar.ts`, 4 tests).

**Commit:** `9478d99` code + release bump; docs in `ce079d8`.

---

## Live verification (production, 2026-09-21 — v0.3.26)

Measured on `https://openstrata.giveabit.io` after the Cloudflare deploy, version marker reads **0.3.26**:

- **First-month walkthrough** on `/tools`: 5 rows render, "Up next" badge on step 1; ticking step 1 moves the meter to 20%, stores `{"done":["bill"]}` device-local, and the badge advances to step 2; Reset returns to 0% and clears storage.
- **Deadline calendar** on the dashboard: 42-cell grid renders, the Form B 7-day window shades **8 day-cells**, today is ringed, all three legend chips present.
- **Honest building modal:** opens on click, shows health % and the drill-down note, and the fake "Reserve funds" label is **gone**.
- **Real navigation:** the "Find legal source" action card lands on `/legal` — no more toast-only buttons.
- **Backend:** the money-path suite runs in CI (`npm test` in `backend/`), 229 passing with the e2e journey and the Rosa golden set.

---

## v0.3.26 in detail

### The money path, gated
The 229 unit tests guarded the parts; nothing guarded the *sequence*. The new suite boots `buildServer()` with in-memory adapters (exactly production wiring minus Postgres) and drives it over HTTP — the same wire shapes `src/lib/api/*` renders. Writing it caught three real contract details the unit tests had allowed to drift out of view: billing wants bare unit ids (`'302'`, not `'unit-302'`), the late-notice rule requires arrears ≥ the monthly fee, and units must arrive as a `UnitRegistry` via `createRegistry()`. The suite also asserts cross-council isolation end-to-end: a second council's token sees an empty ledger. That is the data-sovereignty pitch, made testable.

### Rosa's honesty is now a number
"Rosa never guesses" was a claim; the golden set makes it a measurement. Two question types matter: the 10 answerable ones (each must retrieve its citation in the top 4) and the 2 out-of-corpus ones (Rosa must refuse). Running the gate found the keyword retriever had no refusal path at all — any shared word produced an answer. The fix is deliberately modest: a deterministic out-of-jurisdiction scope rule (BC-only corpus, explainable in the UI). Topic-level refusal — same words, wrong domain — is precisely what the pgvector retriever will gate when it lands, and the golden set is waiting for it.

### The dashboard's three dishonest bits
1. **The fake number.** The building modal computed reserve funds from the health score (`health * 2400`) — a plausible-looking dollar figure with no source. Deleted. The modal shows what is real (health, open actions, the issue) and says where the live data lives.
2. **The dead buttons.** Nine buttons fired "Meeting planner opened!" toasts and did nothing. Every one now navigates to the panel that actually does the thing. A toast is feedback for a completed action, not a substitute for one.
3. **The static list.** "Upcoming" was three hand-written fake events. It is now a calendar driven by the real deadline shape (live when signed in, the tested demo set otherwise), with statutory windows shaded — the shading is data-driven, read from the deadline's own "7-day" wording, so a new statutory item shades its window by saying so, not by editing code.

**Verified:** frontend `check` 0/0 · **248 tests** (was 238) · backend **229 tests** (was 214, +10 money-path, +5 rosa eval) · `audit:i18n` **998 keys × 9 locales** · build green · changelog regenerated (29 releases, 191 items).

---

## v0.3.25 (previous release)

The first-run tour made reachable again (replay pill on the dashboard; the card was never broken — it was unreachable for the "setting up" path and unrecoverable once dismissed), saved searches (pin in ⌘K, dashboard strip, live sync), group counts in ⌘K chips, modal footer hints, task-list filters, keyboard-first wizard, 404 search rescue, docs cross-link checker (caught 4 dead links on first run), back-to-top. Live-verified on production.
