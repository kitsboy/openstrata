# openstrata — Last Updated 2026-09-21 by Buffy (M3)

> **v0.3.26: the money path is guarded, the first month is guided, and the dashboard stopped pretending.** The loop a real council runs — bill, collect, reconcile, close, certify — is now a CI-gated end-to-end journey; a five-step walkthrough teaches it; and the dishonest bits of the dashboard (a fake reserve-funds number, toast-only buttons, a static "upcoming" list) are gone.

**Brief (v0.3.26):** **(1) E2E money-path suite** — `backend/tests/money-path.e2e.test.ts` boots the real Fastify server over HTTP and walks the full council loop: register → units → billing run (the late notice lands on the arrears unit) → Lightning quote with the per-site receive label → confirm posts to the unit's AR ledger → reconcile → hash-chain verification → deadline calendar → Form B issued while Form F is **withheld** on the debtor unit → another council sees nothing. 10 tests. **(2) Guided first-month walkthrough** — five steps in treasurer order (bill → collect → reconcile → review → close) mounted on the tools page, each linking to the real panel where the step happens; device-local progress with reset/hide (`src/lib/first-month.ts`, 6 tests). **(3) Rosa quality gate** — a golden set of 12 real BC questions with expected citations scored by a pure eval harness (`backend/src/rosa/eval.ts`); hit@4 must be 1.0 and out-of-jurisdiction questions must be refused. The gate exposed a real gap: the keyword retriever answered an Alberta question from BC word overlap, so `rosa.ts` now fails closed on out-of-scope questions. **(4) Honest building drill-down** — the modal's fake "reserve funds = health × 2400" is gone; health, open actions and the real issue remain, with a straight note that live detail lives in Strata Tools. **(5) Fake buttons killed** — every toast-only dashboard button now navigates to its real destination (plan-meeting/log-request → tools demos, legal source → `/legal`, activity rows → tools demos, building ••• → Strata Tools). **(6) Deadline calendar** — the "Upcoming" list became a real month-view grid with statutory windows shaded (window length read from the deadline's own wording), today ringed, overdue red (`src/lib/calendar.ts`, 4 tests).

**Commit:** _recorded in the docs commit that lands with this file._

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
