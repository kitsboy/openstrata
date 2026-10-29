## Session — 2026-10-29

**Done:**
- Two queue picks shipped as `0.3.51` together. **A receipt you can hand over** (`/pay`): every row of the receipt tape carries a Receipt button, and the picked payment prints on the council's letterhead — amount received, who paid, lot, rail, reference, txid where the rail has one, the rate a bitcoin payment locked at with the sats it bought, and the fee's split. Lot 305: **$576.00** = **$499.20 operating** + **$76.80 reserve**, Lightning at **$135,820**/BTC for **424,091 sats**. The paying sheet, tape and vendor panel are `no-print`; the newest payment is picked on arrival.
- `src/lib/pay-receipt.ts` (9 tests) plus `PayReceipt.svelte` (6 tests) and three `/pay` route tests. The demo's Lightning (305) and on-chain (410) rows now carry `txid` and `rateCents`.
- **Search that reaches the workspace** (`⌘K`): the index grows from ten groups to thirteen — **40 lots**, the journal's **9 entries**, the tax desk's **13 sections** — each result opening the row it names (`/units/305`, `/tax#gst`, `/accounting?tab=journal#entry-<hash>`). `/accounting` now reads `?tab=` and an `#entry-<hash>` and opens that drawer (3 new route tests).
- `OPENING_CASH` and `bookStatement()` moved into `src/lib/ledger-statement.ts`; the accounting page imports `OPENING_CASH` instead of subtracting its own, so the index and the page chain identical hashes.
- `scripts/generate-sitemap.mjs` now emits the 40 lot routes (70 routes total). `src/app.css` adds `.receipt-doc` to the 176 mm print rule.

**Decisions:**
- The **locked rate is quoted, never recomputed**. `BTC_CAD_CENTS` is today's rate; a receipt that priced an old payment with it would state a number nobody paid. A crypto row with no recorded rate prints that the rate was not recorded.
- **A txid belongs only to a rail that has one.** A txid recorded against a cheque is dropped, because the paper would assert something untrue.
- The **split takes the fee's own ratio** ($3.90 / $0.60 a point) and gives the remainder to the reserve, so the two parts always add back to the amount.
- **Search links by hash, not by memo.** Memos can repeat; the chained hash is the entry's identity, which is why the opening-cash arithmetic had to become shared state rather than two copies.
- The two picks are replaced by **the AGM package in one print** (`/documents`) and **filters that stay put** (`/units`), so four offers are waiting.

**Git State:**
- SHA: this commit (`0.3.51`), pushed to `origin/main`.
- Unpushed: none.

---

## Session — 2026-10-28 (eighth)

**Done:**
- Two queue picks shipped as `0.3.50` together. **A year on one page** (`/`): the dashboard ends in a printable annual sheet — income and spend by category with totals and budget, the three funds and their **$717,034.42** total, the score **82 → 56**, and all **3** tracked items with day counts. **The AGM packet** (`/meetings`): notice, agenda, last minutes and quorum maths on one page — notice due **13 October** (**7 days ahead**), quorum **3 of 5**, AGM **19 May 2027** at **14 of 40**.
- `src/lib/year-sheet.ts` (9 tests) and `src/lib/meeting-packet.ts` (5 tests), plus a sheet/packet component test each and three route tests. 52 catalog keys × 9 locales (1,513 at parity), 535 frontend tests.
- Print CSS fixed in `src/app.css`: the shell's screen gutters are zeroed in print (they were adding to the `@page` margin and pushing the annual sheet onto a second, blank sheet), both one-pagers are held to **176 mm**, and the table layout is fixed so a wide table wraps instead of being clipped at the paper edge.

**Decisions:**
- The annual sheet **reads the books** (`books.feesOperating`, `books.expenseTotal`, `books.surplusYtd`, the three fund balances) rather than recomputing them, and a ledger code no category claims is reported as **unmatched** — a page that silently drops a line would disagree with `/accounting` and nobody would know which was right.
- The **CRF contribution is not an expense**. A dollar moved to the reserve is still the owners' money; netting it would make the year look poorer than it is. The reserve's balances are in the funds block instead.
- The **score is passed in**, not recomputed: the dashboard hands the sheet the same six points the trend drew, so a Form K filing cannot reach the paper and miss the gauge.
- An **overdue** item stays on the sheet under an overdue count. Deleting it would let a signed page forget the deadline the council missed.
- The packet treats a notice given inside the window as **late** rather than rounding it up, and reads quorum as `floor(seats / 2) + 1` — **3 of 5**, and also **3 of 4**.
- The two picks are replaced by **a budget that prints** (`/accounting`) and **the year's deadlines on one page** (`/calendar`), so four offers are waiting: receipt, workspace search, printable budget, year of deadlines.

**Git State:**
- SHA: this commit (`0.3.50`), pushed to `origin/main`.
- Unpushed: none.

---

## Session — 2026-10-28 (seventh)

**Done:**
- The reserve fund's five-year picture shipped as `0.3.49`, the queue pick. A new **Reserve plan** tab on `/accounting`: five fiscal years of the CRF — opening, the budget's contribution, the interest actually paid, what the report schedules, the balance each 31 March ends on. **2026–27** closes at **$627,675.52**; the **2031 roof leaves the fund $133,291.62 short**, and the page leads with that.
- `src/lib/reserve-plan.ts` (9 tests) and `src/lib/demo/reserve.ts`; four route tests. 17 catalog keys × 9 locales (1,461 at parity), 508 frontend tests.
- The accounting tab bar now carries `no-print`, so a printed tab is a document rather than a row of buttons.

**Decisions:**
- The projection uses the **budget's** $43,200 contribution, not the report's $48,000 recommendation, and the page prints the $4,800-a-year gap. Projecting the recommendation would draw a fund the building does not have.
- Interest is the rate the statements **actually paid** (0.74% a year, from $2,180 on $586,400 over six months), applied to the average balance, and **zero in a year that ends below zero** — a fund cannot collect interest on a deficit.
- A project named for a calendar year is spent in the **fiscal year that ends in it**: the report's 2029 elevator lands in 2028–29, not 2029–30. Matching the report's digits to the row's first year would pay a year early.
- The **parkade membrane stays out** of the CRF: the levy collected and spent its $216,000 in its own trust. Including it would double-count money that never entered the fund.
- The picture is allowed to be **negative**. A five-year table whose job is to answer "does the fund cover the plan" must be able to say no, and `firstShortfall` is what the page leads with.
- The pick is replaced by **a year on one page** (`/`), so four offers are waiting: receipt, annual summary, workspace search, AGM packet.

**Git State:**
- SHA: this commit (`0.3.49`), pushed to `origin/main`.
- Unpushed: none.

---

## Session — 2026-10-28 (sixth)

**Done:**
- The Form K register shipped as `0.3.48` — the queue pick. `/units/register` lists every tenanted lot with the day its two-week window closed, whether the form is on file, the days a missing one has been missing and the points it costs: **309 at 77 days, then 209 and 407 at 15**, longest-open first. Summary: **3 of 8 tenanted lots have no Form K on file. The score charges 15 points for them: 5 a gap, capped at 15.**
- `src/lib/form-k-register.ts`, 9 tests: imports `FORM_K_EACH` / `FORM_K_CAP` from `health.ts`, and the total is the same `formKPenalty` the gauge adds, checked at four statement dates. Five route tests prove the page reads that model.
- The print button and the way back carry `no-print`; the footnote states the order and the device-local rule. `/units` gained **Form K register →** beside the filters.
- 19 catalog keys × 9 locales (1,442 at parity), 495 frontend tests.

**Decisions:**
- Only a **closed** window is a gap. At 10 September lots 209 and 407 have no gap because their tenants had not moved in; a window still open prints its closing day and costs nothing. Without this the page would accuse an owner of failing a deadline that has not arrived.
- The **cap is spent on the oldest gaps**, so beyond 15 points a row prints no points. The alternative — every gap showing −5 — would make the column add to more than the score charges.
- The register reads `isFiled`, so a filing recorded on the lot's sheet counts **from its own day**: at 31 August lot 309 still shows 47 days and the three gaps, and August keeps its 72.
- The register is a workspace page, not a `/documents` template: it is the sample building's live register (device-local filings included), not the Seaside Gardens letterhead set.
- The pick is replaced by **the reserve fund's five-year picture** (`/accounting`), so four offers are waiting: receipt, reserve five-year table, workspace search, AGM packet.

**Git State:**
- SHA: this commit (`0.3.48`), pushed to `origin/main`.
- Unpushed: none.

---

## Session — 2026-10-28 (fifth)

**Done:**
- The two follow-ons to `0.3.46` shipped as `0.3.47`.
- **The funds follow the month.** The funds tab now carries six month-end statements (operating, reserve, parkade levy, total, change) and closes on **$81,797.62 + $603,688.80 + $31,548.00 = $717,034.42**. With `?period=2026-04` open the cards read **Cash at April 30, 2026** ($47,583.16 / $590,000.00 / $177,948.00). `src/lib/demo/cash.ts` (records) and `src/lib/fund-history.ts` (arithmetic, 6 tests).
- **A Form K can be recorded** at `/units/309#forms`: date field, device-local record, card reads `On file — recorded 2026-09-30 in this browser`. `src/lib/form-k.ts`, 6 tests.
- **The score reads it**: gaps 3 → 2, September 56 → 61, August still 72. `/units` filter and plan tones read the same record.
- 12 catalog keys × 9 locales (1,422 at parity).

**Decisions:**
- The month-end balances are **records, not a formula** — a figure derived from the budget is an estimate wearing a statement's clothes. September is pinned to the funds tab's own cash by a test.
- A month no statement covers returns `null` and the page says so, rather than interpolating.
- Only cash follows the month; receivables, prepaids and payables are the close, and the page names them.
- A filing counts **from the day it was recorded**, so filing today cannot rewrite a month that already closed. That rule is the whole feature — a score that moved August when you filed in September would be lying about August.
- The Form K record is device-local (same convention as setup ticks and saved searches), not a server write. The sample book's register is unchanged.
- Both items were requested by Cam outside the UI queue, so the queue is untouched — four offers still waiting (receipt, health over time, workspace search, AGM packet), and "health over time" has now shipped as `0.3.46`, so it should be replaced at the next pick.

**Git State:**
- SHA: this commit (`0.3.47`), pushed to `origin/main`.
- Unpushed: none.

---

## Session — 2026-10-28 (fourth)

**Done:**
- The three follow-ons to the `0.3.45` picks shipped as `0.3.46`. A health point's open month now carries **Open in the books** into `/accounting?period=YYYY-MM`, where the receivables ladder is aged at that month's end (September: $6,499.00 past due, 322 days oldest; April: $3,552.00, the levy alone).
- `src/lib/period-link.ts` (4 tests) owns the link: `YYYY-MM` only, month end via `dayIn`, everything else rejected so a bad link opens today's ladder.
- `MonthDetail.datedInMonth` — a second cut of the same aged list — with a two-button filter on the panel: 5 of September's 10 charges and $1,515.00 of $6,499.00; none in April.
- Form K rows in the trend link to `/units/309#forms`, and that card prints the tenancy date, the day the 14-day window closed and the days past it. `addDays` added to `lib/arrears`.
- On `/accounting` the month is page-level: the banner sits above the tabs, the journal stops at that day, and the tabs with no monthly ledger (funds, budget, payables) say they stay at the September 30 close.
- 8 catalog keys x 9 locales (1,410 at parity).

**Decisions:**
- "Filtered to that month" means the ladder **as at** that month end, not a row filter: a month is a date in the books, and the point above the link is a dated figure.
- The second cut is a subset of the same list, never a separately built book — so it cannot total more than the score's own arrears term.
- The journal follows the date only where entries exist; when nothing was posted by then the page says so and names the day the sample journal begins, rather than showing September's closing cash under an April heading.
- Fund balances, budget and payables are deliberately not re-dated: there is no month-by-month ledger behind them, and the page states that instead of estimating.

**Git State:**
- SHA: this commit (`0.3.46`), pushed to `origin/main`.
- Unpushed: none.

---

## Session — 2026-10-28 (third)

**Done:**
- Shipped the two head picks of the 28 October queue together (`0.3.45`). `/accounting`'s receivables tab is an aging ladder (current / 1–30 / 31–60 / 61–90 / 90+), oldest money first, each row opening that lot's own sheet. `/units/[lot]` is a real prerendered page for all 40 lots: the balance, the account from April to September against what cleared it, the levy at its resolution, the forms on file, what is dated next, and a print that leaves the tenancy off it.
- `src/lib/arrears.ts` (19 tests) and `src/lib/lot-sheet.ts` (15 tests); dated demo charges in `src/lib/demo/arrears.ts`.
- 36 catalog keys × 9 locales (1,383 at parity).

**Decisions:**
- Ages come from due dates, never from a status field; the dates are the rules the page already states.
- A payment plan is a schedule, not overdue debt — the two levy plans sit outside the ladder by their own amount.
- "Current" is the not-yet-due fee: in the total, out of the buckets.
- The printed sheet leaves the tenancy off it (`no-print`, measured under print media).
- Three defects were found by looking: the footer totalling the book while three rows showed, the 37-of-37 denominator, and `in −1 days` on a future item.
- The queue refilled with a receipt you can hand over (`/pay`) and health over time (`/`), beside workspace search and the AGM packet.

**Git State:**
- SHA: `ab0b680`
- Unpushed: this docs commit, once it lands.

---

## Session — 2026-10-28 (third)

**Done:**
- Shipped the first two picks from the 28 October queue in one release (`0.3.44`): the floor plan on `/units` and the journal-as-statement on `/accounting`.
- `src/lib/floor-plan.ts` (11 tests): the north/south split (01–05 / 06–10), floors top down, rows adding to exactly 100%, a 14% floor under the small lots, a dropped floor when a filter empties it.
- `src/lib/ledger-statement.ts` (11 tests): date order with written order inside a day, cash running balance over `1010`+`1020` only, a chained 16-hex hash, and the closing balance.
- `/accounting`'s journal entries carry `postedBy` and `evidence` in `demo/books.ts`; the drawer shows both plus the hash and the entry's own lines.
- 14 new catalog keys × 9 locales, catalog **1,346** keys at full parity.

**Decisions:**
- Cash accounts are named, not matched by prefix: the first draft's `/^10\d\d/` swept the war chest at cost (1080) into the balance and moved it by $405 it never saw.
- Opening cash is derived from the closing cash less what the journal moved, so the statement closes on the funds tab's cash ($685,486.42 = $81,797.62 + $603,688.80) instead of asserting an opening a reader cannot check.
- The plan reads the existing filter rather than adding a control, and a floor with nothing in view is dropped rather than drawn empty.
- Two new offers replace the two picks: aged arrears (`/accounting`), a lot's own sheet (`/units?lot=305`), beside search-in-the-workspace and the AGM packet.

**Git State:**
- SHA: `a4651ef` (feature), plus this docs commit.
- Unpushed: pushed with this session; `origin/main` carries both.

---

## Session — 2026-10-28 (second)

**Done:**
- Shipped the queue's last pick: a release trail on `/changelog` (`0.3.43`). Running build + distance from the newest note, `You are here` on the release that is actually running, and a `since vX · N changes` step on every release.
- `src/lib/release-trail.ts` (11 tests): numeric version compare (`0.3.9` before `0.3.10`), placement in three states, change counts, step between releases.
- Verified all three states in a browser by moving `package.json`; geometry and contrast measured at 1440/620 in both themes.

**Decisions:**
- A build whose version has no note is a stated state (`ahead`), never a marker on the nearest release.
- The trail counts bullets, not commits — the only number a reader can check against the page.
- The queue ended, so three new offers replace the pick: ledger-as-a-ledger (`/accounting`), workspace search (`Cmd/Ctrl+K`), the AGM packet (`/meetings`), beside the floor walk still waiting.

**Git State:**
- SHA: `2105165`
- Unpushed: see `git log --oneline origin/main..HEAD` after the push.

---

## Session — 2026-10-28

**Done:**
- Two batches, both shipped. Batch 1 (`0.3.41`, `888aef0`): a next-30-days strip on `/calendar` and `/tax`, built from the calendar's own data.
- Batch 2 (`0.3.42`): `/units`, `/calendar`, `/tax`, `/meetings` and `/pay` moved their copy into the catalog — **149** keys × 9 locales, catalog **1,322** keys at parity, zero hard-coded strings left on those five routes.
- Locale-aware money (`money`, `moneyCompact`, `satsLabel`) and Intl dates (calendar month, weekday heads, day heading, receipt chips).
- Fixed: `formatDate()` parsed a bare `YYYY-MM-DD` as UTC midnight — a doubled-backslash regex meant the day-string branch never ran, so every date west of UTC rendered a day early. Fixed the audit's parity guard reading French ` :` as a key. Added a test that every locale carries the same `{slots}` as English.

**Decisions:**
- Demo *records* (event titles, tax prose, bylaw steps, owner notes) stay English; only chrome is in the catalog. They are sample data, not interface.
- `formatDate` anchors a bare day at noon UTC rather than taking a timezone argument, because every caller prints a calendar day, never an instant.

**Git State:**
- SHA: `703c20c`
- Unpushed: see `git log --oneline origin/main..HEAD` after the push.

---

## Session — 2026-10-28 · a September close on /accounting, and its copy in the catalog

**Done:**
- **Cam asked for the two things the last handoff left on the table: the two remaining ellipses, and the September close queue item with `/accounting` moved into the i18n catalog.** Both shipped as site `0.3.40`.
- **`SeptemberClose.svelte`** sits under the four fund cards on `/accounting`. Five checks between the September books and a signed month: the three accounts tie, payroll and source deductions are posted, the reserve contribution and interest are billed, board approval is on the minutes, and the period locks. **Four read the ledger** (`books.tie`, the payroll entry, the reserve figures) rather than a stored status, so the panel cannot disagree with the cards above it. Three pass today; board approval is open; the lock waits on it.
- **The close button is disabled and names what it is waiting for** — on screen and in its `aria-describedby`, because a disabled button without a reason is a dead end. Four tests in `SeptemberClose.test.ts` pin the count, the refusal, the article that names the blocking check, and that nothing in the panel is set to truncate.
- **The accounting page's copy is in the catalog:** **96** new keys across nine locales — the lede, the kicker, the six tab labels, every column header, the fund rows, and the close panel. A `fill(text, values)` helper in `src/lib/i18n.ts` fills the `{amount}` / `{date}` slots; a missing value stays a visible placeholder instead of `undefined`. `/accounting` went from **47** hard-coded English strings on the audit to **0**; the catalog is **1,179** keys with `fr es zh hi fil pl uk sw` at parity.
- **Both ellipses fixed the way the deadline titles were.** The building card's meta line (`4100 Cambie Street, Vancouver · 40 lots · 4 floors`) was a `nowrap` ellipsis overflowing by 5px at 1440 — it wraps now, two lines at 1440 and 1181, one line at 1100, `scrollWidth === clientWidth` at every width measured. The `/units` lot cell is **108px** at 1100 and `Northwater Holdings Ltd.` needed 137; the name takes two lines, fully visible.
- **Auditing the result found a third case of the same defect the earlier breakpoint had missed.** Between **1181 and 1279** the dashboard's sidebar is on screen, which leaves the proof band 929px and each card 254px — a **156px** column of copy in both themes, i.e. the very defect the band was rebuilt to end. Its two-up breakpoint moved from `1180` to `1279`.
- **Site version `0.3.40`** — `CHANGELOG.md` section plus front-matter summary, `changelog.generated.ts` regenerated (**43 releases with notes, 307 items**), footer stamp reads `v0.3.40`.

**Decisions:**
- **The panel reads state, never stores it.** A checklist backed by a mutable "done" flag would have drifted from the books the first time a number changed. The two checks that are not done say why (`board approval is 20 October`; `nothing is locked today`) instead of showing fabricated progress.
- **Paid the translation cost rather than shipping a half-localized page.** 96 keys × 9 languages is the bulk of this release; the alternative was a September close panel in English bolted onto a page the i18n audit already called the worst offender.
- **Fixed the proof band's breakpoint even though it was not asked for.** It came out of the same measurement, it is the same defect class, and leaving it would have made "the ellipses are fixed" a half-truth at one window width.
- **Changed a chip colour because the measurement said so.** The open-state chip started as `amber-700` over a translucent fill and measured **4.37:1** in light and **2.32:1** in dark — a fixed amber on a dark olive tint. The token pair (`--warning-text` on `--color-amber-50`) flips with the theme and reads **6.15:1** / **6.63:1**. The contrast audit does not see Tailwind classes, which is why this needed a browser measurement.
- **Consumed one queue item.** The September close was the pick, so the queue is now three: the floor walk on `/units`, the next-30-days strip on `/tax` + `/calendar`, and the release trail on `/changelog`.

**Verified:** geometry audit over `/accounting` (all **six** tabs), `/units` and `/` at `1440`, `1279`, `1181`, `1100`, `900` and `620` in both themes — **0** clipped, truncated, spilled or sub-200px findings. French rendering checked in the browser: `Clôture de septembre`, `Achèvement`-style rows, the blocked line naming `Approbation du conseil au procès-verbal`, all six tabs translated. Frontend **322 passed** (318 + 4), `check` **0 errors / 0 warnings**, translation audit **1,179 keys × 9 locales**, contrast audit **218 pairs** + 3 fill guards, secret gate green, production build green with `v0.3.40` in `build/index.html`. No probe script is in the tree.

**What is still open:** the demo `money()` helper is not locale-aware, so a French page still shows `$904.58` rather than `904,58 $` — `formatCurrency` in `src/lib/i18n.ts` does it properly and is used where formatting matters; localizing money and dates across the demo pages is item 47 on the improvements list. `/units`, `/pay`, `/tax`, `/calendar` and `/meetings` still carry hard-coded copy — `/accounting` was the largest surface, not the last.

**Git State:**
- `f235e86` — feat(ui): a September close on /accounting, and the page in the catalog (site `0.3.40`).
- Backend API version `0.3.28`; site version `0.3.40`.

---

## Session — 2026-10-28 · the rest of the dashboard audited, and one panel had the same bug

**Done:**
- **Cam asked whether the other dashboard panels had the proof band's cramped-copy problem at `1100` and `620`, so this was measured rather than judged.** A throwaway DevTools-protocol probe walked the dashboard at `1440`, `1181`, `1100`, `900` and `620` (both themes) and reported four things per element: content larger than a box that hides it, a single-line ellipsis that is actually truncating, text set in a column under 200px with three or more lines, and any child spilling outside its card.
- **`HealthScore` had it.** The tracked-item list shared a row with the 112px gauge: each title got **118px** at `1440` and **50px** at `1100`, so `Energy Performance Report (EPR) filing` rendered as `Ener…` and `Depreciation report renewal` lost its last word at desktop. A panel that scores deadlines could not name them.
- **Fixed by stacking the panel:** the gauge keeps its own row, the formula note is full width beneath it, and the items take the panel's whole width below that, clamping to **two lines** instead of truncating to one. 250px per title at `1440` (all three on one line), 182px at `1100` (the longest wraps). The panel grew by about one row.
- **`TaskList` had the small version:** at `620`, `Annual General Meeting (within 2 months of fiscal year end)` lost 19px behind an ellipsis. Row titles clamp to two lines now.
- **Site version `0.3.39`** — `CHANGELOG.md` section plus front-matter summary, `changelog.generated.ts` regenerated (**42 releases, 296 items**), footer stamp reads `v0.3.39`.

**Decisions:**
- **Did not "fix" what is designed to scroll.** The audit at first flagged the payment strip and the tab rows on `/units`, `/accounting`, `/calendar` and `/tax`; a second probe showed all of them are `overflow-x: auto` with their own thin scrollbars, so nothing is unreachable. The `sr-only` headings on `/pay` and the `/tax` filing table are the same category. Changing them would have been churn.
- **Left two single-line ellipses alone.** The building card's meta line cuts 5px at `1440` and the `/units` company column cuts a long company name at `1100`. Both are deliberate single-line truncations on other pages, and the task was the dashboard panels; recorded in the changelog's known issues rather than quietly widened.
- **Stacked instead of shrinking the gauge.** A smaller ring would still have left the titles fighting the days column in a 250px-wide rail; the items need the panel's width, not a bigger slice of it.
- **Bumped the site, not the backend** — visible change, no service behaviour.

**Verified:** audited at five widths in both themes with zero remaining clipped, spilled or sub-200px text on the dashboard; `/units`, `/accounting`, `/pay`, `/tax`, `/calendar` and `/meetings` checked at `1100` and `620` with the same result. Frontend **318 passed**, `check` **0 errors / 0 warnings**, contrast audit **218 pairs** + 3 fill guards, production build green with `v0.3.39` in `build/index.html`. No probe script is in the tree.

**What is still open:** the two single-line ellipses above; and unchanged from earlier sessions — no UI for the sessions list or the audit trail, the site consumes `POST /auth/logout` but not refresh tokens, the bylaw-fine audit row omits the lot, and CI's migration "upgrade path" step starts from an empty container so checksum drift is still only caught locally. The four queued UI upgrades remain offered and unstarted.

**Git State:**
- `06c55d7` — fix(ui): stop the compliance panel cutting the deadlines it scores (site `0.3.39`).
- Backend API version `0.3.28`; site version `0.3.39`.

---

## Session — 2026-10-28 · the cards above the footer fit their copy

**Done:**
- **Cam reported the three proof cards above the footer as cramped, and it was a layout defect rather than a taste question.** The copy was capped at `28ch` — about **145px** at `9.5px` type — while the link beside it was `white-space: nowrap` and took the rest of the card, with `overflow: hidden` hiding anything that did not fit. The first card's two sentences were being set in four or five fragments.
- **Each card is now a two-row grid:** mark and copy side by side, the link on its own baseline under them, with `margin-left: -9px` on the link so its text sits on the copy's left edge. Type `11.5/9.5px` → **`12.5/10.5px`** at `1.5` leading; hairline border, radius, shadow and pastel marks unchanged. Cards share a height, so the three links share a baseline.
- **Breakpoints moved rather than the type.** Three columns only while the measure stays readable; `620–1180px` is two-up with the third card spanning the row; below `620px` one card per row and a `36px` mark. The reason is measured: at `1100px` the old three-up left each copy column at **136px**, the same defect at another window width.
- **Site version `0.3.38`** — `CHANGELOG.md` section plus front-matter summary, `changelog.generated.ts` regenerated (**41 releases, 290 items**), sitemap `lastmod` refreshed by the prebuild, footer stamp reads `v0.3.38`.

**Decisions:**
- **Measured instead of eyeballed.** A throwaway DevTools-protocol probe (Node 22's built-in `WebSocket`, a temporary page that set the first-visit choice so the dashboard rendered) read every card's box at `1440`, `1181`, `1100`, `620` and `380`, both themes: zero horizontal or vertical overflow, every child inside its card, equal heights within a row. Probe and probe page deleted before the commit.
- **Bumped the site, not the backend.** A visible change ships a release here; `0.3.28` stays because no service behaviour moved.
- **Left the UI queue alone.** This came from a direct request, like the signed pay link — not a queue pick — so the four offered on 2026-10-16 are still waiting and nothing was replaced.

**Verified:** frontend **318 passed**, `check` **0 errors / 0 warnings**, contrast audit **218 pairs** + 3 fill guards, production build green with `v0.3.38` in `build/index.html`, i18n audit unchanged (no new copy). Browser geometry as above. Nothing backend changed, so the backend suite, typecheck and the migration gate were not rerun beyond the pre-push hook, which passed in 3.4s.

**What is still open:** unchanged — no UI for the sessions list or the audit trail, the site consumes `POST /auth/logout` but not refresh tokens, the bylaw-fine audit row omits the lot, and CI's migration "upgrade path" step starts from an empty container so checksum drift is still only caught locally. The four queued UI upgrades remain offered and unstarted.

**Git State:**
- `50de813` — fix(ui): give the dashboard's closing cards a layout the copy fits in (site `0.3.38`).
- Backend API version `0.3.28`; site version `0.3.38`.

---

## Session — 2026-10-28 · the secret gate was red, so it was not a gate

**Done:**
- **Picked up the item that had been carried as "wants a decision" for five sessions.** `npm run check:security` failed at HEAD on **17 hand-read false positives** and was not wired into CI: nothing was blocked, nothing was checked, and the only thing the gate produced was a reason to ignore it. Every finding was a fixture or a sentence — 13 backend test constants (`AUTH_SECRET = 'auth-test-secret-xyz'` and siblings), two quoted fixtures (`password: 'correct-horse-battery'`, `'other-password-123'`), `.env.example`'s `POSTGRES_PASSWORD=openstrata-dev-only`, three prose lines calling the payment link "the credential" and quoting `ospl1.<payload>.<sig>`, and one Tailwind class (`token: 'text-white/<opacity>'`) in the contrast audit's token table.
- **The fix classifies the VALUE, never the path.** A real credential pasted into a test file is the most common way a secret leaks, so "it lives under `tests/`" is not evidence of anything. Three tells: a **marker segment** (`test`, `dev`, `example`, `smoke`, `xyz`, `changeme`…), a **placeholder slot** (`<payload>`), or a **written-out slug** — lowercase words joined by `-`/`_`/`.`, optional short numeric tail, no letter+digit run (`correct-horse-battery`, `member-store-secret-0123456789`). A **danger segment** (`prod`, `production`, `live`, `real`, `staging`, `actual`, `private`, `mainnet`, `release`) vetoes all three before they are considered.
- **The value comes from the rule's own capture group** (`(?<value>…)` on `quoted-credential-literal` and `env-credential-literal`). The first attempt judged "the last quoted string on the line" and mis-classified the prose — the sentence "the link *is* the credential: `ospl1.<payload>.<sig>`" has several quoted runs in it. The new test caught that, which is why the tests exist.
- **Classifications are counted, never silent.** Every run prints `Fixture-shaped literals classified as test/dev values: 21 in 18 files` — a jump is the signal that something changed. (21 rather than 17 because two fixture constants were already being skipped by the old placeholder heuristic and are now counted too.)
- **Six tests** (`src/lib/secret-hygiene.test.ts`) run the real script over temp files rather than re-implementing its patterns: the tracked tree passes; four fixture shapes pass; prose quoting the link-token format and a CSS class passes; five real-looking values fail by rule (`quoted-credential-literal`, `env-credential-literal`, `github-token`, and a base64 blob that decodes to `ghp_…`); and four fixture-shaped production credentials fail despite their friendly names.
- **CI runs it** — `.github/workflows/ci.yml`, first step after `npm ci` in the site job.

**Decisions:**
- **Did not allowlist the 17 by path.** The script already supports path+line-shape allowlists, and that would have been a two-minute green. It would also have immunised every future credential in those 17 files and in 13 test files, which is exactly backwards: the value is the evidence, not the location.
- **Kept the old "placeholder" intent and widened it rather than adding a second switch.** `.env.example` exists to be filled in; a gate that fails on it is a gate that gets `|| true` appended.
- **Veto beats heuristic.** A fixture-shaped value naming production is a real credential with a friendly name, so `DANGER_MARKER` is checked first and returns "not a fixture".
- **No version bump.** Site `0.3.37`, backend `0.3.28`: nothing a user or an API client sees changed. This is repo tooling and the tests around it.

**Verified:** gate green over every tracked file (`0 credential findings`, `21 in 18 files` classified locally); frontend **318 passed** (312 + 6), `check` **0 errors / 0 warnings**. The negative cases were proved by running the gate on temp files in the test — not by reasoning about the regexes.

**CI caught the mistake this session would otherwise have shipped** (`40695292695` on `7a3878e`, red): the new test contained its own adversarial literals, the gate scans **tracked** files, and the file was untracked when the local run happened — so `git ls-files` never listed it and the run was green. The first push failed on `src/lib/secret-hygiene.test.ts:79 [quoted-credential-literal]`, `:85 [github-token]`, `:87 [base64-wrapped-credential]`, exactly as the gate should. Fixed in `ccde02b` by assembling each adversarial value from pieces shorter than the 16-character floor (`value('ghp_', '0123…', …)`) and writing the finished line to a temp file: the gate sees what a commit would carry, and no path gets an exemption — which matters, because "exempt this file" was the move this whole session argued against. **Run `40695863063` on `ccde02b` is green in all three jobs**: the gate step passes with `0 credential findings` and `28 in 19 files` classified, the site job runs **318 tests** plus both audits and the build, `backend` passes, and `backend-e2e` applies the migrations from zero with **377 passed, 0 skipped**.

**What is still open:** the residual miss is stated in the script — a real key written as a friendly slug with no danger word (`internal-db-passphrase-2026`) is classified, not reported; the count printed on every run is what makes that surface visible. Unchanged from earlier sessions: no UI for the sessions list or the audit trail, the site consumes `POST /auth/logout` but not refresh tokens, the audit row for a bylaw fine still omits the lot, and CI's "upgrade path" step starts from an empty container so checksum drift is still only caught by the local persistent database.

**Git State:**
- `7a3878e` — fix(security): tell a fixture value from a credential, then gate CI on it.
- `ccde02b` — fix(test): assemble the gate's adversarial values instead of shipping them.
- Pushed to `origin/main`; backend API version `0.3.28`, site version `0.3.37`.

---

## Session — 2026-10-27 · migrations now run before a push, not on a runner

**Done:**
- **Closed the gap the last session named.** It ended with *"nothing in the repo starts a Postgres for local runs, so 'executed' here meant a manual Homebrew `initdb` on port 5455"*, which left the next migration to be first executed on a CI runner — exactly how `0009` turned `main` red. There is now a harness in the repo (`4da0332`).
- **A local cluster the repo owns** (`backend/scripts/lib/pg-local.mjs`, `backend/scripts/db-local.mjs`): `npm run db:up` / `db:down` / `db:status` / `db:url` / `db:reset`, data in gitignored `backend/.pgdata`, loopback only, port **5455** so 5432 stays free. It discovers PostgreSQL 17 through `OPENSTRATA_PG_BIN`, the Homebrew keg, or `pg_config`, and **refuses a different major** — the gate has to run the server CI runs (`pgvector/pgvector:pg17`). pgvector is checked against that server's own `sharedir`, not a name on `PATH`.
- **`npm run db:check`, the gate, in about three seconds.** Two migration paths, because they fail differently: apply pending migrations to the persistent development database (**upgrade path** — checksum drift, DDL that is not repeatable, the ALTER path a deployment takes), then drop and recreate a scratch `<db>_gate` and apply every migration **from zero** (**the CI path**, the one that failed). Then a second `migrate` must report `no pending migrations`, `migrate:check` clean, and the backend suite must pass against the scratch database with **0 skipped** — that last one is the point, since an unset or wrong `DATABASE_URL` is how the durable paths (ledger idempotency, sessions, the audit table) go untested while the suite still reports green.
- **`.githooks/pre-push` runs it**, armed once per clone with `npm run hooks:install` (`core.hooksPath=.githooks`). **Tested by trying to break it:** a temporary `0010` migration with a `RAISE` outside a plpgsql block — the incident's own defect class — made `git push --dry-run` fail with `FAILED 0010_gate_proof.sql`, `syntax error at or near "RAISE"` (`42601`, `plpgsql_yyerror`) and `error: failed to push some refs`, after the gate had applied the migrations, run the suite and dropped its scratch database. Deleting the file restored green.
- **Nine tests** (`backend/tests/db-local.test.ts`) for the rules a single run would not isolate: port validation, target resolution, the remote-host guard, connection-string parsing and scratch naming, the identifier guard on `CREATE`/`DROP DATABASE`, discovery order and version gating, one-time cluster initialisation, and starting only when nothing is already listening.
- Docs updated in the same push: `.ai_docs/sop-workflow.md` (the manual `initdb` recipe is replaced by the harness commands and the hook), `backend/README.md` (a "Local Postgres and the migration gate" section), `.ai_docs/current-status.md` and `LATEST-UPDATE.md`.

**Decisions:**
- **Made the gate two-phase rather than one.** A fresh scratch database proves a migration applies, but it cannot catch an *earlier* migration edited after the fact — on a fresh database every file is new, so checksum drift is invisible. The persistent development database is what records history and catches that. CI has the same blindness, which is why the local gate is worth having.
- **Required 0 skipped in the suite step.** `npm test` exits 0 with a database missing; it just skips the 8 Postgres tests. A gate that can pass while the durable paths are untested is the bug this whole session is about.
- **Refused a remote `DATABASE_URL` instead of migrating it.** An explicit `DATABASE_URL` still wins over the harness, so CI and `docker compose` share one gate — but creating and dropping scratch databases on a shared server is not a decision a git hook should make. It stops before touching anything and says why.
- **Fail-closed when nothing is installed.** No PostgreSQL 17 means the push is refused with `brew install postgresql@17 pgvector` rather than passing vacuously. The bypasses are explicit and documented (`OPENSTRATA_SKIP_DB_CHECK=1 git push`, `git push --no-verify`); whether that is too strict for another machine is Cam's call.
- **Did not bump the version.** The README rule is backend *behaviour*; this release adds local tooling and one hook, and the service is unchanged. Backend stays `0.3.28`, site `0.3.37`. Flagged rather than skipped, because the two releases before it drew a correction for *not* bumping.
- **No `prepare` script to arm the hook on `npm install`.** Setting `core.hooksPath` silently during an install would override a contributor's own hooks; `npm run hooks:install` is explicit and idempotent instead.

**Verified:** `db:up` initialised a cluster from nothing; `db:reset` did it again from nothing; the gate passed on a cluster with no history (`upgrade path: applied 8 migration(s)`, `from zero: applied 8 migration(s)`) and on one with history; `db:down` left nothing listening on 5455. Migration records on the upgrade database: **9 rows, all with checksums**. Backend **369 passed / 8 skipped** without a database and **377/377** with one; `npm run typecheck` clean; the gate itself run from both `backend/` and the repo root. Nothing frontend changed, so the site gates were not rerun and no screenshot applies.

**Confirmed in CI:** run `40610138684` on `5a1e2c6` is green in all three jobs — the push itself went through the new hook and passed the gate in **3.1s**, `backend` ran **369 passed / 8 skipped**, `backend-e2e` applied the migrations on a fresh `pgvector/pgvector:pg17` container and passed the smoke suite **8/8**, and the site job passed both audits and the production build. That job has since been changed to run this same gate rather than its own `migrate` + `-- e2e-smoke` steps (`ee95803`, run `40612337286`, green): the log shows `target DATABASE_URL → localhost:5432/openstrata`, `upgrade path: applied 8 migration(s)`, `from zero: applied 8 migration(s)`, a clean `re-run + checks`, and `377 passed, 0 skipped` in **5.9s** — so a push made with `--no-verify` is measured the same way, and the job now runs the whole suite against a from-zero database instead of 8 smoke tests.

**What is still open:** the hook is armed in **this clone only** — another clone or machine (Kimi on M4) needs `npm run hooks:install` once. CI does not need the hook: its `backend-e2e` job runs the same `npm run db:check`, so `main`'s protection no longer depends on anyone's local setup. The harness is Homebrew-shaped: `OPENSTRATA_PG_BIN` or a `DATABASE_URL` pointing at `docker compose`'s `db` service are the non-macOS paths, and both are untested here because Docker is unavailable on M3. Unchanged from earlier sessions: no UI for the sessions list or the audit trail, the site consumes `POST /auth/logout` but not refresh tokens, the audit row for a bylaw fine still omits the lot, and `npm run check:security` is red on 15 fixtures.

**Git State:**
- `4da0332` — feat(tooling): apply migrations before a push, not on a CI runner.
- Pushed to `origin/main`; working tree clean.
- Backend API version `0.3.28`; site version `0.3.37`.

---

## Session — 2026-10-27 · migration 0009 failed its first real run, and the migration runner is why

**Done:**
- **Corrected the previous session's central claim.** It said migration `0009` "was never executed anywhere". It *was* executed — CI's `Phase 3 backend — Postgres e2e smoke` job ran it on that push (run `40572300792`) and it **failed**: `FAILED 0009_audit_log_and_sessions.sql`, `syntax error at or near "RAISE"` (`42601`, `plpgsql_yyerror`, character 2577). So `main` was red, the smoke suite never ran, and the sessions/audit tables existed nowhere. The lesson worth carrying: with no database on M3, "I could not verify this" and "this passed" are not the only two outcomes — the push is the verification, and it needs checking the next morning.
- **Fixed the runner, not the migration** (`d220d6f`). `scripts/migrate.mjs` strips standalone `BEGIN`/`COMMIT` lines so a migration's DDL and its version row commit in one transaction — with a line filter. A plpgsql body is `BEGIN … END;` inside `$$ … $$`, so the `BEGIN` opening the append-only trigger function was deleted and its `RAISE EXCEPTION` was left with no block. `0009` is the first migration with a function body, so the flaw was latent from `0008` on. The stripper now carries quoting state across lines — line comments, nestable block comments, single-quoted strings, double-quoted identifiers, dollar-quoted bodies including tagged `$body$` — and removes only a wrapper that begins in plain SQL context; `scanLineState` is exported beside it.
- **Regression tests** (`backend/tests/migrate.test.ts`, 1 test → 4): the plpgsql-body case, `COMMIT` hidden in strings/identifiers/tagged bodies/comments, and an invariant over all nine shipped migrations that every quoted segment survives the stripper byte-identical, plus that no migration keeps its top-level wrapper.
- **Executed `0009` for real.** Installed PostgreSQL **17.11** with **pgvector 0.8.7** locally (the CI image's major version), `initdb` on port 5455, fresh database, `npm run migrate` applied `0001..0009`, re-run reported `no pending migrations`, `npm run migrate:check` clean. Confirmed in the database: `audit_event` + `auth_session`, all 8 indexes, FK to `app_user` with `ON DELETE CASCADE`, role and refresh-hash CHECKs, `vector 0.8.7`, and the trigger refusing a live `UPDATE` (`audit_event is append-only (UPDATE is refused)`) and a live `DELETE`.
- **Ran the suite CI never reached:** `npm run test -- e2e-smoke` is **8/8** against that database, including the two assertions written blind last session — a logout on one instance killing the token on another instance, and the append-only trigger refusing `UPDATE`/`DELETE`. Full backend suite **360 passed / 8 skipped** without `DATABASE_URL`, **368/368** with it; typecheck and build green.
- **Bumped the backend to `0.3.28`** (`backend/package.json`, `backend/README.md`).

**Decisions:**
- Fixed the runner rather than rewriting `0009` to dodge it. The migration is legitimate — a trigger function is the correct way to make append-only a property rather than a convention — and the stripper would have mangled the next function body too. Rewriting the SQL would have hidden a bug that corrupts migrations silently.
- Made the stripper quoting-aware instead of relaxing atomicity (applying migrations without stripping wrappers would let a migration's DDL and its version row commit separately).
- Bumped `0.3.27 → 0.3.28` after last session flagged it as Cam's call. The README's rule is explicit and this change alters how migrations are applied; leaving a third release on a stale number was the worse default. Easy to revert if Cam disagrees.

**Verified:** migration `0001..0009` applied on a fresh PostgreSQL 17.11 + pgvector 0.8.7; idempotent re-run; `migrate:check` clean; trigger observed refusing `UPDATE` and `DELETE`; `e2e-smoke` 8/8; backend **360 passed / 8 skipped** plain and **368/368** with `DATABASE_URL`; `backend` typecheck + build green. Nothing frontend changed, so no site gates were rerun and no screenshot applies.

**Confirmed in CI:** run `40603079531` on `06e0553` is green in all three jobs — `backend-e2e` applied `0001..0009` on a fresh `pgvector/pgvector:pg17` container (`applied 0009_audit_log_and_sessions.sql`) and passed the smoke suite **8/8** there, `backend` ran **360 passed / 8 skipped**, and the site job ran **312 tests** with both audits and the production build green. The red run it replaces is `40572300792`.

**The gap that caused this is still open:** nothing in the repo starts a Postgres for local runs, so "executed" this session meant a manual Homebrew install and `initdb` on port 5455 — the exact commands are now written down in `.ai_docs/sop-workflow.md` so they are not rediscovered. A committed `db:local` harness (or a `docker compose up db` path someone can actually run, now that Docker is not the only option) is what stops the next migration from being first executed in CI. Still open from earlier sessions, unchanged: no UI for the sessions list or the audit trail beyond the API, the site consumes `POST /auth/logout` but not refresh tokens, and `npm run check:security` is red on 15 fixtures.

**Git State:**
- `d220d6f` — fix(migrations): stop the runner from deleting a function body's BEGIN.
- `06e0553` — docs: correct the handoff (this session's record, plus the CI result above).
- Pushed to `origin/main`; working tree clean.
- Backend API version `0.3.28`; site version `0.3.37`.

---

## Session — 2026-10-27 · sessions a council can end, and a record of who did what

**Done:**
- Picked two upgrades off the six offered at the end of the last session and shipped both.
- **Revocable sessions** (`8d5c6b4`, backend). A token was a stateless bearer credential with a 12h life and no way to end it: a treasurer removed at an evening meeting kept full write access until morning, and a token copied from a shared laptop could not be revoked at all. Every token now carries a `sid` naming a row in `auth_session` (migration `0009`) that every request resolves — it must exist, be unrevoked and unexpired, belong to the claimed user and council, and still carry the token's role. New routes: `POST /auth/logout`, `POST /auth/refresh` (rotating, with replay detection), `GET /auth/sessions`, `DELETE /auth/sessions` (sign out everywhere else), and `PATCH /auth/users/:id` (admin role change, which is the demotion path that made revocation matter in the first place). Access tokens are short-lived now (`AUTH_TOKEN_TTL`, default 1h) and renewed with a refresh token issued once, stored only as a SHA-256 hash, and rotated on every use; `AUTH_REFRESH_TTL_DAYS` (default 30) is how long a session may stay signed in.
- **An append-only audit log** (`8d5c6b4`, backend). Twenty routes are role-gated — ledger posts, billing runs, bylaw fines, unit and member deletion, user management — and none of them left a trace of the actor, so "who authorized this" had no answer anywhere in the system. `audit_event` (migration `0009`) now holds actor, role, action, outcome, target, status, IP and user agent. One `onResponse` hook writes it over one pure function (`src/audit/policy.ts`) whose **default is to record**, so a new endpoint is audited unless it is explicitly exempted; refusals are rows too (the member who *tried* to post to the ledger is the row an investigation wants); request bodies are never copied in; and unattributable traffic is not recorded at all except the two rate-limited auth events, so a public route cannot be used to fill the log. The table refuses `UPDATE` and `DELETE` by trigger, so append-only is a property rather than a convention. `GET /api/v1/audit/events` (admin) reads it back, tenant-scoped and cursor-paged.
- **Sign-out is now sign-out** (`8bdf968`, site). `src/lib/api/auth.ts` `signOut()` only cleared the stored token, which left it valid on the backend for the rest of its lifetime — precisely the window a shared laptop needs. It now ends the session server-side first, best-effort, with the local state cleared synchronously so nothing waits on the network.

**Decisions:**
- Took the two trust items rather than anything user-visible: revocation and provenance are the two things that cannot be added retroactively, and everything else on the list can wait.
- Made `sessions` and `audit` **required** dependencies of `buildServer` instead of optional ones with in-memory defaults. An optional session store is the bug this fixes; an optional audit log silently loses the evidence it exists to keep. The cost was ~20 test call sites, paid once with a shared `makeSessionDeps()` helper.
- Recorded logins and refused logins with the account address, and nothing else from a body. A refused attempt is attributed to the *council* but not named as an actor, because nobody proved they were that user.
- Did **not** bump `backend/package.json` (still `0.3.27`). The README says to bump it when backend behaviour changes, and this changes the auth contract — but the durable-ledger release before it did not bump either, and version decisions here have been Cam's call. Flagged in `LATEST-UPDATE.md`.

**Verified:** backend typecheck + build green, **357 passed / 8 skipped** (310 existing + 47 new; the skipped ones are the Postgres E2E file, which grew from 5 to 8 tests); frontend `check` 0 errors / 0 warnings, **312 passed**; `audit:i18n` 1075 keys × 9 locales; `audit:contrast` 218 pairs; production build green. Nothing visual changed, so no screenshot.

**Not verified at the time, and the thing to watch:** migration `0009` was **not executed on this machine** — there is no Postgres here and Docker is unavailable. *(Correction, later the same day, `d220d6f`: this paragraph originally said "never executed anywhere", which was false — CI's `backend-e2e` job ran it on this very push and it failed, because the migration runner deleted the `BEGIN` out of the trigger function's plpgsql body. It has since been executed successfully against PostgreSQL 17.11 + pgvector 0.8.7; see the session above.)* The first real run is CI's `backend-e2e` job, which starts `pgvector/pgvector:pg17`, runs `npm run migrate`, and then the smoke suite. That suite also asserts that a logout on one instance kills the token on another instance and that the append-only trigger refuses an `UPDATE` and a `DELETE`.

**Git State:**
- `8d5c6b4` — backend: server-side sessions and an append-only audit log.
- `8bdf968` — site: `signOut()` ends the session on the server.
- Both pushed to `origin/main`; working tree clean.
- Backend API version `0.3.27` at the time; bumped to `0.3.28` in `d220d6f`. Site version stays `0.3.37`.

---

## Session — 2026-10-26 · the i18n audit was blind to its own markup, and the release landed

**Done:**
- Landed the durable-ledger release that was sitting uncommitted from 2026-10-17 as `72acd9a` (21 files, +1371/−340): Postgres-backed ledger idempotency (migration `0007`), checksummed and serialized migrations (migration `0008`, `npm run migrate:check`), `/health/live` + `/health/ready`, fail-closed PSBT issuance/broadcast with UTXO reservation, tightened Bitcoin address checks. It then got the version it was missing as site release **`0.3.37`** (`fb3d60a`): the dated `CHANGELOG.md` section and front-matter summary are in, `src/lib/changelog.generated.ts` is regenerated (40 releases with notes, 283 items), and `/changelog` plus the footer stamp publish it. The backend API version stays `0.3.27` on its own track.
- Fixed the translation audit's blind spot (`d4ef669`): it skipped **any line containing `{`**, and because this repo writes markup minified the whole footer is one line — so the hard-coded nav labels, the RSS chip's `title`/`aria-label` and the cookie notice were invisible while the audit reported clean. It now strips Svelte expressions and scans inside the line, and checks `title`/`aria-label`/`alt` the way it already checked text nodes.
- Translated the home page chrome into all nine locales (10 keys, **1075** total): nav labels (Units / Accounting / Pay / Tax & CRA / Calendar / Meetings), "Pay fees", the chip's title and aria-label, the cookie notice, "Open the lot list".
- Put the RSS chip on `--color-slab-accent` instead of its own `#fdba74` literals, which brings the fill inside the contrast audit (7.83:1 light, 9.63:1 dark) and lets it flip with the dark theme like the rest of the footer.
- Wired Sentry to SvelteKit: `src/hooks.client.ts` exported no `handleError`, so a configured DSN would have reported an empty project forever.

**Decisions:**
- Bounded the localization to the chrome instead of dragging the six unlocalized routes into the same commit. The audit now names them, and paying that down is a project rather than a diff.
- Two commits, both staged by path, so the release and the site work could not entangle.

**What the audit now reports (warn-level — CI stays green): 113 warnings.** `/accounting` 47, `/units` 18, `/tax` 11, `/meetings` 8, `/pay` 7, `/calendar` 4 have **no i18n import at all**, so the "full interface localization across all routes" line in `WORKPLAN.md` does not hold for those six.

**Verified:** backend typecheck + build green, **310 passed / 6 skipped** (the six are Postgres E2E: `DATABASE_URL` unset, Docker unavailable, so the durable path is not exercised in this environment); frontend **311 passed**; `check` 0 errors / 0 warnings; `audit:i18n` 1075 keys × 9 locales; `audit:contrast` 218 pairs; production build green.

**Open, and wanting a decision:** `npm run check:security` is **red at HEAD with 15 false positives** — test fixtures (`password: 'correct-horse-battery'`, `AUTH_SECRET = '…-xyz'`), the `.env.example` dev placeholder, and CHANGELOG/handoff prose quoting the `ospl1.<payload>.<sig>` link token. No real credential is committed, and the gate is not wired into CI, so nothing is blocked — but it cannot be used as a signal until the pattern can tell a fixture from a secret.

**Git State:**
- `d4ef669` — site: audit + chrome localization + Sentry hook.
- `72acd9a` — backend: durable idempotency, checksummed migrations, fail-closed treasury.
- `fb3d60a` — release `0.3.37`: changelog entry, version bump, regenerated module.
- All pushed to `origin/main`; working tree clean.

---

## Session — 2026-10-17 · durable ledger retries and fail-closed treasury (uncommitted local continuation — landed 2026-10-26 as `72acd9a`)

**Done:**
- Added Postgres-backed ledger idempotency: migration `0007` links council/key/fingerprint/expiry to the committed ledger entry in the same transaction, with Postgres restart/replay/conflict coverage in the E2E suite.
- Added migration checksum tracking (`0008`), advisory-lock serialization, read-only `npm run migrate:check`, missing/orphan/drift detection, and rollback-safe migration recording. Legacy baseline records use the exact local migration file contents; this is not historical proof and should only run after an operator backup/schema review.
- Hardened treasury PSBT handling: recompute policy from council balances, validate network/address/fee/UTXOs, reserve active inputs, bind broadcast to server-issued plan tokens, and reject replays. Live node broadcast and ledger debits remain refused pending cryptographic signature verification and real PSBT/change-output construction. The plan cache/reservations are process-local.
- Added live/readiness health endpoints and a sanitized Postgres readiness probe. Updated backend documentation/backlog and corrected xpub fixture serialization.

**Verified:** backend `npm run typecheck`, `npm run build`, and `npm test`: **309 passed / 6 skipped**. Six Postgres E2E tests were skipped because `DATABASE_URL` is unset and Docker is unavailable. `git diff --check` was clean at the time of review. No production host or database was contacted.

**Decisions / caveats:**
- No real Bitcoin send or ledger debit: implementation fails closed until signed transaction verification/building exists.
- No release version bump; this continues backend-only work on top of the current `0.3.27` API track. UI queue is untouched.
- This continuation is uncommitted and unpushed. Do not deploy based on local checks alone.

**Git State:**
- Base: `a576b86` (`Harden council API boundaries and add a safe agent read surface`). Read `git status`/`git log` for current local state.
- No commit or push was requested or performed.

---

## Session — 2026-10-17 · backend safety and read-only agent context (site v0.3.36 · backend v0.3.27)

**Done:**
- Added member-authenticated, read-only agent manifest/context endpoints. Context has aggregate unit/Form K counts, verified Operating/CRF balances, and up to 50 deadlines; it excludes owner contacts, payment references, transaction descriptions, and per-unit data. Responses are private/no-store and vary by Authorization. Manifest now advertises only the dedicated agent context route and explicitly states it grants no broader API access.
- Hardened requests: 256 KiB body cap, 30-second timeout, unknown schema fields rejected, bounded auth fields, and bounded Rosa questions/facts. CRT/Form B/F HTML safely escapes dynamic text and document titles, with no-store, nosniff, and restrictive CSP headers.
- Ledger idempotency validates request keys/fingerprints, coalesces retries, replays identical requests for 24h, rejects changed bodies with 409, and never evicts successful results early. At 10,000 process-local entries, new keys return 503 until expiry. Durable storage is required before multi-instance deployment.
- Updated backend API/README docs, changelog + generated changelog, site/backend versions and lockfiles, `.ai_docs/current-status.md`, `LATEST-UPDATE.md`, and added `docs/NEXT-50-IMPROVEMENTS.md` with a ranked 50-item backlog.

**Verified:** backend typecheck clean; backend suite 301 passed / 6 skipped; frontend 309 passed; Svelte check 0 errors / 0 warnings; production build green; i18n audit 1065 keys × 9 locales and contrast audit 218 pairs pass. The i18n audit reports its existing review warnings for demo/accounting route literals; zero missing catalog keys. No production backend host was available.

**Decision / caveat:** this release is backend/security scope only and does not consume a queued UI item. Versions are separate: site/product `0.3.36`, backend `0.3.27`.

**Git State:**
- Branch `main`; release commit: `a576b86` — `Harden council API boundaries and add a safe agent read surface`.
- Pushed to `origin/main`; this includes the pre-existing `cabddc5` commit that was ahead before this session.

---

## Session — 2026-10-16 · one host can serve both, the site resolved itself, v0.3.35

**Done:**
- **`PUBLIC_API_BASE_URL=/` (or `same-origin`) now means "the origin this page was served from"**, and since the prompt to Kimi is still unanswered, this is the shape that needs no answer at all: if the site and the API ever sit on one host, the build value is `/`, there is no absolute address to maintain, nothing breaks when the host's address changes, and **no CORS is involved** (a same-origin request never asks).
- **`resolveApiBase(stored, built, origin)`** takes the page's origin as a third input and returns demo mode when there is none (SSR/prerender), so the pre-hydration render is demo data that settles on live — the same shape the runtime override already had. Honest consequence, stated in the docs: for one frame the widgets show sample data on a real deployment.
- **A hole closed in the same pass, found by asking what the value's *shape* can be.** A base that is neither an absolute `http(s)` URL nor a same-origin token is now **ignored** instead of used: `fetch('//evil.example/api/v1/units')` is a protocol-relative redirect to somebody else, so a mistyped or hostile `PUBLIC_API_BASE_URL` would have handed a council's bearer token to that host. A bare path (`/api`) and a `javascript:` URL are ignored the same way; a URL with a path is still accepted for a reverse proxy in front of the API.
- Docs: three deployment shapes in `.env.example`, `README.md` and `docs/DEPLOYMENT.md` (one host · tailnet · public HTTPS), each naming the two variables that must agree; the wiring table in `SOURCE-OF-TRUTH.md` was already added this session.
- Release record: `CHANGELOG.md` **v0.3.35** + regenerated `changelog.generated.ts`, `LATEST-UPDATE.md`, `.ai_docs/current-status.md`, version bumped. **The six earlier commits were pushed to `main`** (`1285798..fc9d294`) on Cam's say-so.

**Verified (not estimated):**
- **Chrome, built artifact, no runtime override of any kind** (every `openstrata-*` key cleared, `openstrata-api-base` read back `null`): the site and the API were served from **one origin** (static build at the root, `/api` proxied to a memory-backed host) and the signed bill link rendered **$921.00**, `LMS2847-305-202610`, `305 · Evergreen House`.
- The `/` build inlines the same-origin rule (`h=["/","same-origin"]` in the bundle); the CSP keeps its documented fallback (`deriveOrigin('/')` is not an origin and `connect-src 'self'` already covers the call); `static/_headers` unchanged in git; no stray `.env`.
- **The untrusted base, in the browser too.** A build with `PUBLIC_API_BASE_URL=//evil.example` was loaded in Chrome: the sheet stayed demo ($576.00), the page said *“This site is not connected to a council host yet”*, and the only request off-origin was Umami — **zero** requests to `evil.example`. The CSP fell back to its documented `https:` line rather than granting the host.
- `src/lib/api/config.test.ts` **15 tests** (rules, same-origin tokens, SSR/prerender, override precedence, and the four values that must never become a base) · frontend `check` **0/0** · **309 frontend tests** · **285 backend tests, `tsc` clean** · `audit:i18n` **1065 × 9** · `audit:contrast` 218 pairs · build green.

**Decisions:**
- **A fifth state had to exist: "configured but untrustworthy".** The first version passed any non-empty value straight to `fetch`; the fix is to treat an unparsable base as *no base*, because demo mode is a visible, safe degradation and a protocol-relative host is a silent credential leak.
- **`/` rather than a new variable.** A flag (`PUBLIC_API_SAME_ORIGIN=true`) would have been a second thing to keep in sync with the first; one documented spelling of one value is fewer states to get wrong — and it is what a single-host operator would try typing anyway.
- Still in force: the queue rule, do not pop the stash, do not force-push `main`, do not replace `src/lib/units.ts` `demoUnits` with the 40-lot story.

**Git State:**
- `main` is pushed through `fc9d294`; this session's v0.3.35 commits ride on top. Read `git log -1` for the tip. Version `0.3.35`.

**Limitations, stated plainly:**
- **Still no council host**, so the one-host shape was verified against a local origin serving the build and proxying the API — which is the real shape, on one machine. The tailnet and tunnel shapes are still waiting on Kimi's answer.
- **Before hydration the widgets render demo data** on a `/`-configured deployment (there is no origin server-side). That is one frame of sample data, not a wrong number, and it is documented in `.env.example`.

---

## Session — 2026-10-16 · cross-origin access on the API, v0.3.34

**Done:**
- **The API can now be called from the static site — the half the deployment docs had been promising without.** The site is a Cloudflare static build and the API is a council's own host, so a browser blocked **every** `/api/v1/*` call before it left the tab. `docs/DEPLOYMENT.md` described Option A (tailnet-only) as *“live data works for browsers on the tailnet”* and Option B as *“add the site origin to the backend's CORS allowlist”* — and there was no allowlist to add to.
- **`backend/src/api/cors.ts`** — the rules as a pure module: an exact allow-list from `CORS_ORIGINS`, the requesting origin echoed (never a wildcard), `GET, POST, OPTIONS` with `authorization`, `content-type` and `idempotency-key`, a 600-second preflight cache, and `Vary: Origin` on **every** response that carried an `Origin`. Wired as an `onRequest` hook in `backend/src/api/server.ts`; `CORS_ORIGINS` read in `backend/src/config.ts` and passed through in `backend/src/index.ts`.
- **Three decisions are load-bearing:** it is **off by default** (no variable, no header, same-origin deployments untouched); **`*` is refused, not honoured** (this API carries bearer tokens — a wildcard would let any page in the world make authenticated calls from a visitor's browser, and the process logs a warning at boot); and a disallowed origin gets **no permission headers rather than a 403**, because a special status would only tell an attacker which origins a council allows.
- **Preflights are answered `204` in the hook before any route runs**, and the hook runs on error responses too — so a `401` from an allowed origin stays readable in the browser instead of arriving as an opaque CORS failure.
- **17 backend tests** (`backend/tests/cors.test.ts`): the pure rules, plus a real server — no header when unconfigured, preflight 204, exact echo for a public origin and a MagicDNS one, no permission for a lookalike / wrong scheme / wrong port, `register` → authed `/units` cross-origin, 401 still carrying the header, and `CORS_ORIGINS=*` granting nothing.
- Docs: `CORS_ORIGINS` in `backend/.env.example`, `backend/API.md`, `docs/DEPLOYMENT.md` (both exposure paths now name the variable), `backend/README.md` (host setup step 5), and `SOURCE-OF-TRUTH.md` gained a wiring table (build value → host, `CORS_ORIGINS` → site) plus a no-secrets rule.
- Release record: `CHANGELOG.md` **v0.3.34** + regenerated `changelog.generated.ts`, `LATEST-UPDATE.md`, `.ai_docs/current-status.md`, version bumped.

**Verified (not estimated):**
- Against a real `buildServer` (in-memory adapters, `logger: false`): with `CORS_ORIGINS` unset, **no** `Access-Control-Allow-Origin` and no `Vary` on `/health`, and a preflight gets none either; configured, a preflight answers **204** with the origin echoed, `POST` present in the methods and `authorization` in the allowed headers; a second origin is echoed for its own request; **a lookalike host, a wrong scheme and a wrong port each get nothing**; an unauthenticated call from an allowed origin returns **401 with** the permission header; the real flow runs end to end cross-origin; `CORS_ORIGINS=*` yields **no** `Access-Control-Allow-Origin` (never `*`).
- Gates: backend `tsc` clean · **285 backend tests** (+17) · frontend `check` **0/0** · **303 frontend tests** · `audit:i18n` **1065 keys × 9 locales** · `audit:contrast` pass · `npm run build` green · `static/_headers` unchanged.

**Decisions:**
- **Off by default, and exact.** A wildcard would be the easy way to make a demo work and the wrong way to run a council's books; an allow-list keeps the exposure a deliberate act, and an empty list keeps every existing same-origin deployment byte-identical.
- **No 403 for the wrong origin.** Silence is the standard answer and it leaks less; the test asserts the absence of headers rather than a status.
- **No new dependency.** ~60 lines of pure rules plus one hook, in the repo's existing style, rather than adding a CORS plugin to a stack that deliberately has seven runtime dependencies.
- Still in force: the queue rule (four offered, waiting for a pick), do not pop the stash, do not force-push `main`, do not replace `src/lib/units.ts` `demoUnits` with the 40-lot story.

**Git State:**
- Base of this session: `1d061c7` (v0.3.33 docs). Read `git log -1` for the tip. Version `0.3.34`.
- **Unpushed at the time of writing — see the prompt below; Cam decides the push.**

**Limitations, stated plainly:**
- **No council host is deployed, so no build has been pointed at a real one.** The browser-level proof for the build-time base (v0.3.33), the header-level proof for CORS (v0.3.34) and the same-origin shape (v0.3.35) are all against a local host on this machine. The tailnet and tunnel shapes need a running host — which is exactly what the prompt below asks Kimi for.
- **INTERAC_\* still needs a bank.** The council's financial institution issues that credential; until then the payer sees the labelled rehearsal provider. Nothing in these releases changes that.
- Cross-origin tests assert headers and the flow through `app.inject`; they do **not** run a real browser against a real cross-origin host (that needs the deployed API).

---

## ⤵ PROMPT FOR KIMI — paste this to her as-is

> **Hi Kimi — Buffy on M3 here. One household question, then one build question, then four small jobs.**
>
> **One household question first, then the build question.** I have read the OpenStrata handoff (`docs/KIMI-HANDOFF.md`) and I know OpenStrata is **not** the same house as the others. So tell me plainly: **which other Give A Bit projects know about OpenStrata, and what do they know?** I have ToadBuy and StrataTools from the handoff — a separate first-party Strata Tool, the “B” on your allow-list for ToadBuy's dependencies, the SSHED/check note for StrataTools — but I do not know what backend scaffolding you reuse, whether there is a shared stripebook or payment-edge module, whether any of these are tied to the OpenStrata Stripe account, and whether the Bitcoin/Lightning node or the satohash wallet is operated the same way here. Where the answer lives in your stuff — obsidian working notes, master-brain notes, scripts, config, or anything else — just tell me the shape and the path. If anything is a decision Cam still has to make, flag it so I do not silently make it on my side.
>
> **The one build question: is the Phase 3 backend (`backend/`, Node 22 + Fastify + Postgres/pgvector) running on any host right now?** If yes, tell me exactly where and how to reach it: the machine, the Tailscale **MagicDNS name and port**, the output of `docker compose ps` (or however it runs), whether `npm run migrate` has been applied (migrations `0001`–`0006` — the member registry and unit store came in 0005/0006, and the bill-link routes need the latest), whether the three environment variables the live site's build needs are set — **`PUBLIC_API_BASE_URL` and `CORS_ORIGINS` on the site side** (one points at the host, one points at the **site**) — and whether `GET /health` answers with `{"ok":true,"service":"openstrata-backend"}` from a tailnet machine. If the answer is **not deployed**, say so plainly and tell me whether THOR has the headroom to take it (CPU/RAM/disk, and whether pgvector + Postgres 17 can live there) — a straight *“not deployed, and here is what it needs”* is more useful to me than a maybe.
>
> **Job 1 — tell me which of three shapes the live site is in, with the two values if it is not the first.** **(a) one host serves both the site and the API** → build value is `/`, no `CORS_ORIGINS` needed at all → verify and skip to Job 4; **(b) site on Cloudflare (`openstrata.giveabit.io`) + API on your host** → give me `PUBLIC_API_BASE_URL` (absolute, points at the *host*) and `CORS_ORIGINS` (the *site's* origin — `https://openstrata.giveabit.io`); **(c) nothing wired yet** → say so and tell me which host would be first. Rule of thumb for the reader: **the build value points at the host, `CORS_ORIGINS` points at the site.**
>
> **Job 2 — which environment variables exist on the host, set or not set. Never the values.** `AUTH_SECRET`, `PAY_LINK_SECRET`, `CORS_ORIGINS`, `DATABASE_URL`, `POSTGRES_PASSWORD`, and the `INTERAC_*` set. **Please never paste a secret value into Obsidian, a handoff file or chat** — `AUTH_SECRET` signs session tokens and `PAY_LINK_SECRET` signs owner payment links, so a leaked value means someone else can mint both. *Set / not set* is all I need.
>
> **Job 2b — what else is tied to this site Stripe account and Bitcoin rail.** I do not want to stand up a new backend only to discover OpenStrata should share one of the family's existing things. Tell me what you know, even if partial: is the OpenStrata Stripe account shared with any other project, or standing alone? Is the Lightning node / satohash wallet operated the same way as the other projects, or is OpenStrata its own instance? Is there a shared swap or bridge surface I should know about before I touch money paths on `/pay`? If any of that is a decision Cam still has to make, say so — I would rather ask than assume.

> **Job 2c — anything Cam should decide before you touch money paths or the live build, flag it rather than inferring.** If the answer to Job 2b changes what counts as “our host” (shared Stripe, shared node/wallet, a swap/bridge surface tied to one of the family accounts), say so before anything on `/pay` or the site-to-API wiring gets assumed. I do not want to stand up a backend, wire a build value, or edit the money paths on a premise you can correct.
>
> **Job 3 — record it in MASTER-BRAIN / Obsidian, and educate yourself and Hermes.** Please add, dated **2026-10-16**: the releases above with one line each on *what it means for Cam*; the wiring table now in `SOURCE-OF-TRUTH.md` (build value → host, `CORS_ORIGINS` → site, `PAY_LINK_SECRET` for links, `INTERAC_*` needs a bank); the **open question** (is a backend host deployed, and where, and how does the live Cloudflare site meet it); and the standing rules if they are not already in MASTER-BRAIN — **do not force-push `main`**, **do not pop the stash `stale-base layout rewrite before moving to v0.3.28`**, **do not replace `src/lib/units.ts` `demoUnits` with the 40-lot story**, and the queue rule (four UI upgrades are offered, Cam picks one or two, nothing starts before a pick). Please add `SOURCE-OF-TRUTH.md`, `docs/KIMI-HANDOFF.md` and `LATEST-UPDATE.md` to the nightly Obsidian backup set, and confirm they are in there. Education, as always: **please make sure you and Hermes stay current on this and every Give A Bit project automatically**, and tell me if the template above is missing anything you need.
>
> **Job 4 — tell me one of two things, in a short bullet list.** Either **(a) “ready to test”** with the host URL, the port, whether the migrations ran, whether the site's build variables are set, and the two env values — or **(b) “blocked”** with the exact missing piece and who or what can supply it (a machine, a credential, a decision from Cam). Please also flag anything you know about the host that I would get wrong from M3 — the tailnet ACLs, whether the API binds the tailscale interface, whether Cloudflare is proxying the site and would strip a tailnet hostname, and whether the pruned node on THOR matters here (it should not: this is the API, not the Bitcoin rail).
>
> **Conflict-avoidance rules for the vault:** cross-reference the existing OpenStrata entries rather than adding a second copy, keep one dated section per session, and note where this and `MASTER-BRAIN.md` disagree rather than silently overwriting. If something here looks wrong to you, say so — you know the setup better than I do, and I would rather be corrected than consistent.
>
> **Back to me:** just answer in your next note. I will pick it up from `docs/KIMI-HANDOFF.md` in the repo, and Cam will carry it to you. Thanks — with the shape and the Give A Bit context, that is the last thing standing between a verified local build and a real council host, until the shape answer comes back.
>
> — *Buffy (M3 coding agent)*

---

## Session — 2026-10-16 · PUBLIC_API_BASE_URL reaches the browser, v0.3.33

**Done:**
- **The documented build-time wiring was dead, and now is not.** `PUBLIC_API_BASE_URL` was the way `.env.example`, `README.md`, `docs/DEPLOYMENT.md` and the Tailscale onboarding doc all told an operator to point a build at a council host. `src/lib/api/config.ts` read it through `import.meta.env`, which Vite populates **only** for its own `VITE_` prefix: the production bundle compiled to `const i = {}`, the value was always `undefined`, and the only working path was the runtime `localStorage['openstrata-api-base']` override. That is why every previous session's live-data verification used the override and said so.
- **The fix is one line of real configuration**, not a workaround: `envPrefix: ['PUBLIC_', 'VITE_']` in `vite.config.ts`. `PUBLIC_` is the documented namespace; `VITE_` stays because `src/hooks.client.ts` reads `VITE_PUBLIC_SENTRY_DSN`.
- **The precedence rule became a value.** `apiBaseUrl()` now delegates to a pure `resolveApiBase(stored, built)` (override wins; empty/absent is demo mode; whitespace and trailing slashes trimmed), so the rule is testable without a browser or a build.
- **A guard for the half that no runtime test could see.** `src/lib/api/config.test.ts` (9 tests) covers the rules **and** reads `vite.config.ts` to fail if `envPrefix` loses `PUBLIC_`, if it loses `VITE_`, or if `config.ts` starts reading a renamed/re-prefixed variable. The old defect was invisible to every test in the suite because the value was simply absent — the contract test reads the two files that have to agree.
- **The prebuild CSP script had the mirror-image bug.** `scripts/generate-csp.mjs` derived its origin from `process.env` only, so an operator who followed the documented workflow and put the base in **`.env`** got a bundle pointed at their host and a `connect-src` still allowing only `https:` — and the browser then blocks a plain-http tailnet host outright. It now loads `.env`, `.env.local`, `.env.production`, `.env.production.local` in Vite's precedence order (`util.parseEnv`), with an explicit shell variable still winning.
- Docs and release record: `CHANGELOG.md` **v0.3.33** + regenerated `changelog.generated.ts`, `LATEST-UPDATE.md`, `.ai_docs/current-status.md`, the v0.3.32 note's known issue marked fixed, version bumped in `package.json`.

**Verified (not estimated):**
- **The build-time base, end to end, with no runtime override of any kind.** `PUBLIC_API_BASE_URL=http://127.0.0.1:4173 npm run build`; in Chrome every `openstrata-*` key was cleared and `localStorage['openstrata-api-base']` read back **null**; the signed bill link then rendered **$921.00**, `LMS2847-305-202610` and `305 · Evergreen House` from the host. The same page on the previous build showed the *“this site is not connected to a council host yet”* card — i.e. the defect and the fix were both observed, not inferred.
- **The unset path still degrades safely.** A build with the variable unset contains no baked origin (searched `build/_app/immutable` for the literal), compiles the read back to the undefined fallback (`g(...void 0...)`), and serves the demo sheet as before.
- **CSP both ways.** With the base set in the shell, `build/_headers` pins `connect-src` to that origin; with it set only in `.env`, same result (this is the case that used to fail); with none, the documented `https:` fallback. `static/_headers` is byte-identical to the committed version (`git diff` empty) because a build regenerates it.
- Gates: `check` **0/0** · **303 frontend tests** (+9) · `audit:i18n` **1065 keys × 9** · `audit:contrast` pass · build green.

**Decisions:**
- **Fix Vite's prefix, not the docs.** The alternative was to tell operators to rename their variable to `VITE_PUBLIC_API_BASE_URL` — which would have meant editing `.env.example`, README, deployment docs, the Tailscale onboarding doc and `scripts/generate-csp.mjs` to work around a missing config line, and would have left `PUBLIC_` a documented lie. `envPrefix` is the supported mechanism; the docs were right.
- **Guard the plumbing, not just the rule.** The rule was already covered by `src/lib/api/api.test.ts` (vitest leaves `import.meta.env` mutable, which is exactly why the suite could never catch this). The new test reads the config files, because the failure mode was a **build-time** absence.
- **The CSP gets the same source of truth as the bundle.** Two halves of one setting reading two different environments is how this class of bug survives review; both now read the shell first, then the same `.env` files Vite loads.
- Still in force: the queue rule (four offered, waiting for a pick), do not pop the stash, do not force-push `main`, do not replace `src/lib/units.ts` `demoUnits` with the 40-lot story.

**Git State:**
- Base: `e79ed49` (v0.3.32 docs). This session's commits sit on top; read `git log -1` for the tip. Version `0.3.33`.
- `npm run check:security` is unchanged from the recorded baseline (not wired into CI); nothing here touched it.

**Limitations, stated plainly:**
- **`PUBLIC_API_BASE_URL` is inlined at build time, so it cannot be changed after the fact** — that is what the runtime `openstrata-api-base` override is for, and both are documented in `.env.example`. `resolveApiBase` checks the override first.
- **No CORS on the backend still.** A build pointed at another origin now really does try that origin, and the browser will block it unless the site and API share an origin (the deployment shape) or CORS is added — unchanged by this release and true of every live widget.
- **The replay test used a plain-http loopback host** (`http://127.0.0.1:4173`), which is the case the CSP change unblocks; no https/tailnet host was available in this session to exercise a MagicDNS build.
- No new UI, so no contrast, screen-reader or performance work was in scope.

---

## Session — 2026-10-16 · the signed owner payment link, v0.3.32

**Done:**
- **A link replaces the login on the owner path.** `/pay` used to need a council session to start an Interac request, which the public page never had — so on the deployed site the button could only rehearse. A treasurer now issues one link per bill (`POST /api/v1/payments/link`, treasurer+) and the owner opens `/pay?unit=305&rail=etransfer&t=…` with no account at all. Nothing about the Interac rule changed: the host still starts the request and the bank still approves it.
- **`backend/src/rails/pay-link.ts`** — the link is a signed statement, not a session: `ospl1.<payload>.<sig>`, HMAC-SHA256 under a key derived from `PAY_LINK_SECRET` (or `AUTH_SECRET`) with the label `openstrata/pay-link/v1`. Claims: version, council id + name, lot, amount (integer cents), reference, payee, issued/expiry. Every reason a link can be unusable is named and tested — `malformed`, `bad signature`, `expired`, `not yet valid`, `unknown version`, `incomplete claims` — and the signature is not the only check: a signed payload with a zero amount or a payee that is not an email is still refused. **A link can never verify as a JWT and a JWT never as a link.** TTL 30 days by default, clamped to 1–120 (a link is never forever).
- **Three public/owner-aware routes.** `POST /api/v1/payments/link/verify` (public, returns the bill and **nothing else** — no balances, no ledger, no other lots; the token travels in the body because a signed bill is longer than Fastify's 100-byte path limit, which the first version found as a `414`). `POST /api/v1/payments/interac/request` and `GET …/interac/request/:requestId?t=…` now accept a link in place of a session: amount, lot, reference and **payee come from the link's claims**, so the payer's page cannot talk the amount up or down or redirect the money; the status read is scoped to that one bill; both answers carry `viaLink: true`.
- **`/pay` renders the council's bill** in five explicit states (`none | checking | valid | invalid | offline`), with the lot fixed and the demo furniture hidden. **No amount is ever shown for a link that cannot be used** — showing the demo lot's balance beside an expired real link would be inventing a bill. The token survives rail and lot changes (`sheetSearch`) and is **stripped from the address handed to the bank** (`providerReturnHref`); it is remembered per request id in `sessionStorage` instead.
- 6 new catalog keys × 9 locales (`payLink*`), `PAY_LINK_SECRET` / `PAY_LINK_TTL_DAYS` in `.env.example`, the three routes in `backend/API.md`, `ROADMAP.md` shipped note, `CHANGELOG.md` v0.3.32 + regenerated `changelog.generated.ts`, version bumped.

**Verified (not estimated):**
- **Chrome, built artifact, memory-backed host on the same origin, no session on the page** (`localStorage['openstrata-token'] = null`):
  - The link renders **$921.00 · `LMS2847-305-202610` · `fees@lms2847.invalid`**, unit fixed (no picker), no receipt table.
  - **The request starts with no session**: `viaLink: true`, `amountBasis: 92100`, `SIM-LMS2847-305-202610-0001` — while the body the page sent claimed `amountBasis: 1` and `unitRef: U-999`, and both were ignored.
  - The payer reads that request back **with the link** (`200`); **another bill's link gets `404`**; **no credential gets `401`**.
  - A **tampered** token shows *"This bill link cannot be used"* with reason `bad signature` and **no amount at all**. Switching to **Bitcoin** keeps the token in the URL and the council's $921.00 on screen. A plain `/pay` visit is still the demo sheet ($576, picker, receipts).
- Gates: `check` **0/0** · `npm test` **293/293** (+6) · `audit:i18n` **pass (1064 keys × 9)** · `npm run build` green · backend **267 tests** (+17) · backend `tsc` clean.
- **Three defects the browser found, all in code this feature touches:** (1) a host with **no Interac provider answered `200 { ok: false }`**, and the page rendered that as a started request with a **Live request badge on nothing** — the route is now **503** and the client refuses any body whose `ok` is not true before the dialog touches it; (2) `isTrustedGateway(undefined)` **threw** instead of refusing a missing gateway URL; (3) `assertRequestable` allowed `http://localhost` but not `http://127.0.0.1` — the code's own idea of "this machine" was half-implemented, so loopback (`localhost`, `127.0.0.1`, `[::1]`) is now one rule and every other host still must be https.

**Decisions:**
- **The link is a bill, not a login.** It authorises exactly one lot, one amount, one reference and one payee — the fields the treasurer printed — and it cannot read, list or write anything else. That is why `verify` returns six fields and why the status read 404s across bills.
- **The payer's page is never trusted for the money fields.** When a link is present the host reads them from the claims, not the request body. The E2E proves it with a lying body rather than by reasoning.
- **No amount for an unusable link.** The demo sheet's $576 is a demonstration; printing it next to a real expired link would be a fabricated bill. `checking`, `invalid` and `offline` get a card and take no money.
- **The credential does not follow the payer to the bank.** `returnUrl` is stripped of the token, and the token is kept in `sessionStorage` per request id — Interac's logs have no use for it and no business holding it.
- **The route that refuses must say so on the wire.** `200 { ok: false }` is what let a payer's page announce a request that never existed; refusals are now `503` and the client validates the envelope.
- Still in force: the queue rule (offer four, wait for a pick, polish only those; this work was requested directly by Cam, outside the queue, which still has four waiting), do not pop the stash `stale-base layout rewrite before moving to v0.3.28`, do not force-push `main`, do not replace `src/lib/units.ts` `demoUnits` with the 40-lot story, and nothing on `/pay` is payable without a real merchant credential.

**Git State:**
- Base: `1285798` (v0.3.31). This session's commits are on top of it; read `git log -1` for the docs SHA. Version `0.3.32`.
- `npm run check:security` still fails exactly as recorded in the previous session (identical findings at the base commit, not wired into CI) — unchanged by this work and deliberately not touched.

**Limitations, stated plainly:**
- **The public demo still cannot start a real request.** With no Interac merchant credential the host answers from the labelled rehearsal provider, so the payer sees *Simulation — nothing was sent*. The link path is live end to end **up to that provider boundary**; a real bank round trip needs the council's financial institution to onboard it.
- **`PUBLIC_API_BASE_URL` was not applied at build time** — found while verifying this release, and **fixed the same day in v0.3.33** (`envPrefix` in `vite.config.ts`, plus `.env` loading in the prebuild CSP script; see the session note above this one). Until v0.3.33 only the runtime override (`localStorage['openstrata-api-base']`) pointed a build at a host.
- **No CORS on the backend.** The static site reaches `/api` same-origin in the deployment shape; a build pointed at another origin is blocked by the browser. That is true of every live widget, not just this one.
- No screen-reader, zoom or disabled-user testing for the new card; no performance work was needed (one extra request on load, and none for a plain visit).
- The link is a **bearer credential**: anyone who has the URL can pay (and read) that one bill until it expires. That is the intended trade for "no login", it is stated in `.env.example` and `API.md`, and there is no revocation list yet — issuing a new link is the current revocation.

---

## Session — 2026-10-16 · Interac e-Transfer on the pay sheet, v0.3.31

**Done:**
- Cam asked for the e-transfer section of `/pay?unit=305` to **fully support `https://innovation.interac.ca/`**, with a button that **completes the handshake** and opens the connection to **any bank the payer uses**. Shipped as **Interac e-Transfer Business Request Money** — the product Interac actually offers for this: start a request from the website, hand the payer to Interac to choose **their own financial institution** and approve from their banking app, then take the answer back.
- **The constraint is stated, not worked around.** Interac's own page is explicit: a business gets Business Request Money **through a participating financial institution** (BMO, CIBC, DC Bank, Peoples Trust, Scotiabank today), and that institution is what issues the merchant credential. No website can self-serve it. So the credential lives on the **council's host** (`INTERAC_*`) and the button runs the **same handshake as a labelled simulation** (`demo: true`, nothing sent, no bank contacted) until one exists. That is what the public demo shows, and the label says so on screen.
- **Frontend, on `/pay`:** one button in the e-transfer panel (**Open your bank and pay**), above the existing copy fallback. A dialog with four beats (contact → request → bank → answer), the amount and reference already carried, an institution picker **in the rehearsal only** (in live mode the list is Interac's page and the dialog shows a **Continue to Interac** button instead), and a result state that distinguishes *what happened* from *what a link claimed*.
- **`src/lib/interac.ts` + `interac.test.ts` (26 tests)** — the rules, out of the component: seven-state provider vocabulary with unknown values **refused rather than guessed**; the institution list; `buildRequest` (integer cents, one normalised shape per payer email/mobile, https return URL); the **gateway allow-list** (`isTrustedGateway`); the return contract (`parseReturn`, `returnClaim`, `returnUrl`); and `advance()` — the transitions a bank would allow, so a completed transfer can never be cancelled by the demo.
- **`backend/src/rails/interac.ts` + `backend/tests/interac.test.ts` (21 tests)** — `DemoInteracProvider` (in-memory, expires like a bank, **never approves on a timer**) and `HttpInteracProvider` (one small contract, refuses a gateway URL outside the allowed hosts, refuses a missing request id/url, refuses an unrecognised status). Three routes: `POST /api/v1/payments/interac/request`, `GET /api/v1/payments/interac/request/:requestId`, `POST …/:requestId/reported` (treasurer+; advances the request only — the deposit itself is reconciled by Ziggy against the same reference, so nothing posts to the ledger twice). `INTERAC_*` in `.env.example`, `API.md` section, `backend/README.md`, `/rails/status` → `interac: { configured, live }`.
- **38 + 2 new catalog keys × 9 locales** (`payInterac*`), hand-written, inserted next to each locale's `payRateLine`.
- Docs: `CHANGELOG.md` (**v0.3.31** + regenerated `src/lib/changelog.generated.ts`), `LATEST-UPDATE.md`, `.ai_docs/current-status.md`, `docs/ROADMAP.md` (the shipped pay-sheet bullet gained the follow-up), this file. Version bumped in `package.json`.

**Verified (not estimated):**
- **Chrome, on the built artifact:**
  - **All 40 lots**: the dialog's amount equals the lot's own amount — **0 mismatches** — and the three **zero-balance lots (203, 308, 401) show no button at all** (nothing owed, nothing to send).
  - **Every state path**: approve → `status=deposited` in the URL and "Approved and deposited"; decline → "Not completed — your bank did not approve it"; cancel → "Cancelled — nothing was sent"; **Escape** closes without losing the sheet's rail or amount; **focus + Enter** opens the dialog.
  - **Four return links** (`?etransfer=REQ-9&status=…`): `deposited` and `approved` read **"Returned from your bank — waiting for the council to confirm"** (never "paid" on a URL's word), `declined` reads not-completed, and an unknown status says the council reconciles it by hand.
  - **Contrast, inside the open dialog**: **0 text below 4.5:1** at 1280px and 390px in **both themes**, no document or card overflow (card right edge 374px at a 390px viewport).
  - **The live branch, against a local stand-in host** (self-signed HTTPS speaking the real request shape, `openstrata-api-base` pointed at it): a **trusted** gateway gives the LIVE REQUEST badge and the Continue button with **no bank list** (that list is Interac's page, not ours); an **untrusted** gateway is **refused with nothing opened** and no Continue button; a **configured but unreachable** host produces "Your council's host could not be reached…" rather than quietly rehearsing; and with **no host** the simulation runs with its bank list.
- Gates: `check` **0/0** · `npm test` **287/287** · `audit:i18n` **pass (1058 keys × 9)** · `audit:contrast` **pass (218 pairs + 4 guards)** · `npm run build` green · backend `tsc` clean, **250 backend tests** (was 229).
- **Two bugs the browser sweep caught, both in this feature's own new code** (worth remembering as a class): (1) after a simulated approval the card **never left the bank picker** — the result view only renders in the `result` stage and `approve()` never set it, so the payer was left looking at a picker nothing further would happen to; (2) the dialog printed **"approved and deposited" on a return link's word alone**, which is exactly the lie the rules module was written to prevent. Both fixed, both re-verified.
- **Harness note for the next session:** the first browser round reported a page with **no app content at all** — a `vite preview` started inside a backgrounded shell had been reaped, and the browser had a stale shell cached. Restart the preview as a real background process, `curl` the route, and confirm the built HTML's own `<title>` before believing any UI failure.

**Decisions:**
- **Where the truth lives.** The council's host starts and reads the request; the page never decides that money arrived. A return in the URL is a **claim** until the host confirms it, and the card says so in words — `returnClaim()` encodes it, and the headline copy for an unconfirmed claim is deliberately not "paid".
- **A clock may only expire, never approve.** The rehearsal provider's timer was written to auto-approve and auto-deposit for a nicer demo; that is precisely "a timer saying money arrived", so it was removed. The payer's approval arrives the way it would in production (`report`), and the UI's simulated approval is a person clicking, not a clock.
- **Gateway URLs are checked, not followed.** https on Interac's own domains (or hosts the council names) is the whole test; anything else means **nothing is opened**, and that refusal is verified in a real browser rather than only in a unit test.
- **A configured host that is unreachable is a failure, not a rehearsal.** Demo mode is "no host"; a host that is configured and silent gets its own line. Using the rehearsal to paper over a broken host would be the dishonest version of the demo label.
- **The institution list is the payer's, not ours** — it exists in the rehearsal so the screen can say what Interac's page will look like, and in live mode the choice happens on Interac's page. The council never learns which bank an owner uses; that is a privacy decision, not a UI one.
- Still in force: the queue rule (offer four, wait for a pick, polish only those, replace a shipped one — four are waiting), do not pop the stash `stale-base layout rewrite before moving to v0.3.28`, do not force-push `main`, do not replace `src/lib/units.ts` `demoUnits` with the 40-lot story, and nothing on `/pay` is payable (every destination and QR payload is still a demo string).

**Git State:**
- Base: `00fd389` (v0.3.30, the one-lot pay sheet). Code SHA: **`907241e`** — `feat(pay): open the owner's own bank with an Interac e-Transfer request`. This note rides the docs commit directly on top of it (so the docs SHA changes whenever this note is amended — read `git log -1`). Version `0.3.31`.
- `npm run check:security` still fails on this repo exactly as recorded last session (12 findings, identical at the base commit, not wired into CI) — unchanged by this work and deliberately not touched.

**Limitations, stated plainly:**
- **A live request needs a council host *and* a signed-in owner** — the three routes are council-scoped like every other `/api/v1` route, and the public `/pay` page has no session. So on the deployed demo the button always rehearses (clearly labelled), and the live path is proven against the local stand-in plus the backend suite, not against a real Interac merchant credential (which requires the council's bank to onboard it).
- The **Continue to Interac** navigation itself was not clicked in the sweep on purpose: the only allow-listed gateway hosts are Interac's own domains, and opening a real `etransfer.interac.ca` URL that is not a real request would poke a third party. The trust rule that guards it is verified; the round trip is not.
- No screen-reader, zoom or disabled-user testing; no performance work was requested or needed (the dialog adds no network call beyond the two it names, and the QR path is untouched).
- The institution list is a curated, defensible set (major banks, Desjardins, digital banks, and the named credit unions), not Interac's live directory — hence the "Not listed? Open your own banking app" path.

---

## Session — 2026-10-16 · the one-lot pay sheet, v0.3.30

**Done:**
- Built the item Cam picked from the 2026-09-30 offer: **2. One-lot pay sheet (`/pay`)**. The page was a rail list plus a pay dock; it is now one sheet — **one amount** in the page's largest type (only the parts actually owed listed, under a dashed rule), **three large choices** (e-Transfer · Bitcoin · Lightning) as real radio inputs under styled labels in a `fieldset` with an sr-only legend, and **the picked rail in full** (destination, exact BTC + sats, QR, numbered steps). The **15-minute rate lock is a quiet stamp**, not a control, and when it expires the sheet stops pretending the numbers are live: the BTC/sats row takes the warning ink and a note offers the re-price. **PAD and cheque are tucked under the sheet** in a `<details>`. New: a lot picker, deep links (`/pay?unit=108&rail=bitcoin`), and a zero-balance state (`Nothing to collect on this lot.` — no destination rows, no QR).
- New module **`src/lib/pay-sheet.ts`** + `pay-sheet.test.ts` (**13 tests**) holds the three rules that are rules: which rails are the sheet's three large choices (PAD and cheque deliberately are not), what the lock reads (`lockState`, `lockClock`, clamped at `00:00`), and `sheetRail()` — a link asking for `pad`, `cheque`, `BITCOIN` or nothing falls back to the first choice rather than rendering an empty panel.
- **A real bug, found by verifying instead of reasoning.** The sheet reseeded its chosen rail from `?rail=` in an `$effect`. A traced run showed the failure shape exactly: the click wrote the rail and began the URL write, then the effect re-ran against the URL *as it still was* and put the old rail back — **the tick and the URL said e-Transfer while the panel, the rows and the QR showed Lightning's invoice.** SvelteKit's `replaceState` navigation also did not always deliver a page-store update, so making the URL the single source of truth would have stuck too. Fix: **one writer per value** — the component owns `rail`; the URL is an output, plus a one-time seed in `onMount`.
- 14 new catalog keys × 9 locales, hand-written (the codemods are gone). One trap worth remembering: a `{rate}` placeholder written **after a colon** makes `audit-i18n` see a phantom key (14 added keys read as 15) — the copy was reworded so the placeholder never follows a colon.
- Queue housekeeping per the standing rule: item 2 is recorded as **shipped** and replaced, so four are waiting again — a floor you can walk (`/units`), a September close (`/accounting`), the next 30 days once (`/tax` + `/calendar`), and a new fourth, **a release trail on `/changelog`**. Updated everywhere the queue is copied: `docs/ROADMAP.md`, the public `/roadmap` page, `static/llms.txt`, `docs/WORKPLAN.md`, `WORKPLAN.md`, `docs/PRODUCT-PLAN.md`, `.ai_docs/current-status.md`.
- Docs: `CHANGELOG.md` (+ regenerated `src/lib/changelog.generated.ts`), `LATEST-UPDATE.md`, `DESIGN.md` (new "The one-lot pay sheet" section — one number, real radios, the lock as a stamp, the one-writer rule), `DIRECTORY-MAP.md`, `docs/ACCESSIBILITY-STATEMENT.md`, this file.

**Verified (not estimated):**
- Chrome, on the built artifact: every choice in sequence, **rapid-click sequences** (three and four picks with ~30ms between them), **six deep links**, **all 40 lots** (the shown amount must equal the option's own amount, with the URL's unit and rail intact), the zero-balance lots, and **0 text below 4.5:1 at 1280px and 390px in both themes** with no page overflow.
- The expiry flow was verified rather than assumed: a scratch worktree (outside the repo) with `LOCK_SECONDS = 3` — stamp locked `00:03` → **expired** with the BTC row moved to the warning ink and the re-price note → re-price from the note → locked, then expired again and re-locked from the stamp's own icon.
- The rail invariant was checked where it hurt before: tick / radio / panel / `?rail=` must all be the same rail on every load, including after rapid clicks. The earlier failure would have been caught by this line.
- `check` **0/0**, `npm test` **261/261**, `audit:i18n` pass (**1017 keys × 9 locales**, no hard-coded copy added), `audit:contrast` pass (**218 token pairs + 4 guards**), build green.
- Two harness traps this session, both worth knowing: 14 keys became 15 (the colon/placeholder phantom above), and a **stale `vite preview` process** kept the port and served old-hash chunks — `start.*.js` 404'd, hydration never ran, and every click looked dead. Kill the listener, not just the parent, then re-check the artifact before believing a failure.

**Decisions:**
- **The sheet owns its own state; the URL mirrors it.** One writer per value is now the rule for this page, because the two-writer version could show an owner one payment rail's invoice while the tick and the URL named another — the worst failure a payment page can have. A link seeds the rail once on arrival.
- The rate lock is a **stamp, not a control**: it only ever states how long the fiat amounts are good for. Expiry is announced **in words and in ink**, because a stale rate that still looks live is the one dishonest thing this page could do.
- The three large choices are **real radios**, not buttons wearing a state: keyboard, arrow keys and screen-reader announcement stay the browser's behaviour. PAD and cheque are a disclosure rather than a fourth and fifth choice — they are not what a treasurer sends from, but they must stay reachable.
- Nothing changed about honesty rules: every destination on `/pay` is still a demo string that cannot be paid, payment strings stay non-payable, tax copy stays a sample, and the queue rule stands (offer four, wait for a pick, polish only those, replace a shipped one). The 2026-09-30 offer is now spent — see the queue in `docs/ROADMAP.md` for the four that are waiting.
- Still in force: do not pop the stash `stale-base layout rewrite before moving to v0.3.28`; do not force-push `main`; do not replace `src/lib/units.ts` `demoUnits` with the 40-lot story.

**Git State:**
- Code SHA: `000dbd7` — `feat(pay): one amount, three large choices, and the rail that was picked`
- Base: `d0b44e7` (end of the contrast pass).
- This note rides the docs commit on top of it; version `0.3.30`. Unpushed after this note: none.
- `npm run check:security` **fails on this repo, before and after this work** (12 findings: `backend/.env.example:21` plus eleven quoted-credential literals in backend tests and `scripts/audit-contrast.mjs`). Verified identical at `d0b44e7` in a clean worktree, and the gate is not wired into CI. Not touched here — it is a pre-existing gate/tree disagreement for someone to decide on, not something a payment-sheet session should quietly rewrite.

---

## Session — 2026-10-16 · contrast sweep, fixed surfaces, v0.3.29

**Done:**
- Finished the contrast pass Cam asked for. The reported bug (an unreadable pay dock in dark mode) was already fixed in `8357075`; this session took the same bug class to every remaining surface and then to the whole site.
- **The root shape, in one line:** the theme flips the ramp, so a step that is legible as *ink* is a near-white *fill*. Every failure this session was a surface whose plate and ink did not move together. Three are now scoped rather than patched:
  - `aside.sidebar` (navy in both themes) scopes six shell tokens at a fixed `--chrome-*` ramp for its subtree — measured before: workspace eyebrow 2.2:1, nav group label 2.2:1, sidebar help 3.7:1, sidebar wordmark **2.18:1**.
  - The auth modal's navy brand panel scopes the slab ramp — measured before: wordmark **1.04:1** in light, subtitle 1.25:1.
  - `.site-footer` / `.bg-slab` / `.bg-slab-raised` re-point the accent ink so a focus ring on navy stays visible.
- **Card fills flip by construction.** Nine `background: #fff` cards in `src/app.css` (each with a hand-written `.dark .x { background: var(--paper) }` a thousand lines below) now use `var(--paper)`; four redundant overrides deleted.
- **`var()` typos were silently painting plates.** `var(--surface-3, #eef2f2)` and `var(--shadow-sm, …)` reference tokens that do not exist — CSS drops the declaration and uses the fallback, so the auth modal had a fixed near-white plate under light ink. Fixed, and now a failing guard.
- Also fixed: auth strength/label greys (2.44–3.6:1), legal-doc plates (1.11:1 at night), print-doc ink (3.62:1), roadmap numerals (1.25:1) and phase dot (2.54:1), pitch deck paper slides (1.06:1 at night), footer lockup, and the `/` marketing dashboard (chevron + footer notes + panel micro-labels).
- New: theme-aware focus ring (was 45%-alpha blue ≈1.9:1), brand-tinted `::selection`, skip-to-content links in both shells (x9 locales, `skipToContent`).
- Deleted 23 one-off codemods (`scripts/inject-*.mjs`, `scripts/wire-*.mjs`, `scripts/migrate-page-hero.mjs`, the two `*.py` injectors). `scripts/` is 7 live tools now.
- Docs: `CHANGELOG.md` (+ front-matter, regenerated `src/lib/changelog.generated.ts`), `LATEST-UPDATE.md`, `DESIGN.md` (new "Fixed surfaces and the ramp they own" section), `docs/ACCESSIBILITY-STATEMENT.md`, `.ai_docs/current-status.md`, this file.

**Verified (not estimated):**
- Chrome, 28 routes × light and dark = 56 page loads, **10,976 text nodes, 0 below 4.5:1**; plus the ⌘K search modal, the topbar menus and the auth modal in both themes at 0.
- `audit:contrast`: **218 token pairs** + 4 structural guards (chrome scope, undefined `var()`, literal-white fills outside print, non-flipping fill literals). **Every new guard was reintroduced against its own fix and confirmed to exit 1** — a guard that has never failed is not a guard.
- `check` 0/0, `audit:i18n` pass, `npm test` **248/248**, build green.
- Three harness bugs had to be fixed before any of those numbers were trusted: a stylesheet that had parsed to 0 rules, a `vite preview` child that outlived its parent and served a stale build, and (this session) transparent `body`/`html` composited as **black** (fabricating ~900 failures), plus translucent gradient glows scored as if they were the plate. The harness now asserts the **newest** token resolved on every load, so a service-worker-cached sheet can no longer be scored as a fresh build.

**Decisions:**
- The four queued UI upgrades from 2026-09-30 are **untouched and not started** (a floor you can walk, a one-lot pay sheet, a September close, one next-30-days strip). Cam directed this session; the queue rule still stands — offer four after a UI push and wait for a pick.
- `--faint` no longer has a 3:1 carve-out: it carries real sentences, so its floor is 4.5:1 in the audit like everything else.
- No new per-surface dark-mode override should ever be added for a card fill. If a plate needs to stay light (a QR quiet zone, print), it gets a role token (`.qr-plate`, `@media print`).
- Two gradient-blind spots are documented rather than "fixed": `background-clip: text` headlines and decorative gradient plates are scored with a conservative worst-case composite of their stops, not pixel-sampled. Anything that reports a failure there should be checked by eye before a colour is changed.
- Still in force: do not pop the stash `stale-base layout rewrite before moving to v0.3.28`; do not force-push `main`; do not replace `src/lib/units.ts` `demoUnits` with the 40-lot story; payment strings stay non-payable.

**Git State:**
- Code SHA: `f552024` — `fix(ui): scope every fixed surface's ramp so no plate fights its ink`
- Base: `8357075` (the pay-dock fix this session continues)
- This note rides the docs commit on top of it; version `0.3.29`. Unpushed after this note: none.

---

## Session — 2026-09-30 · docs, UI queue, goodbye

**Done:**
- Wrote the four offered UI upgrades onto the public roadmap (`/roadmap`), `docs/ROADMAP.md`, the pitch snapshot in `src/lib/marketing.ts`, `docs/PRODUCT-PLAN.md`, both workplans, and the agent docs (README, DIRECTORY-MAP, SOURCE-OF-TRUTH, KNOWN-LIMITATIONS, PRODUCT-BUILD-PLAN pointer, `.ai_docs/`).
- Wrote the same queue and the standing rule into `static/llms.txt` so any model that is not you still sees it.
- Did not build the four upgrades. Cam has not picked.

**Decisions:**
- The interface keeps being refined as the product grows. This is standing work, not a finished list. After every push that changes what a person sees, offer exactly four concrete UI upgrades and wait. Cam picks one or two. Polish only those. When a pick ships, replace it so four remain. Do not start a queued item before it is picked.
- Offered 2026-09-30, not started: (1) a floor you can walk on `/units`; (2) a one-lot pay sheet on `/pay`; (3) a September close on `/accounting`; (4) the next 30 days, once, shared by `/tax` and `/calendar`. Full sentences are in `docs/ROADMAP.md`. Do not rephrase them into a different four.
- Already noticed, not in the queue, do not re-offer unless a slot is empty: marketing header plus PayRail is tall; homepage and inner pages are two shells; calendar grid dots are not category-filtered while the day panel is; tax `scroll-mt-36` may sit under the taller sticky header (`scroll-mt-44` if a title hides).
- Still in force from the Evergreen session: do not pop the stash `stale-base layout rewrite before moving to v0.3.28`. Do not force-push `main`. Do not replace `src/lib/units.ts` `demoUnits` with the 40-lot story. Payment strings stay non-payable. Tax copy stays a sample, not a filing and not tax advice.
- Other models: read `static/llms.txt`, then `docs/ROADMAP.md`, then `.ai_docs/current-status.md`, then this file from the top.

**Git State:**
- SHA: `2c8dfd022b2caca8aca68ac4b77616d80fe7a804`
- Base: `eff4ee91fa39d8e46c5c2081901c1b1063a1cf56`
- Unpushed: none after this note is pushed to `origin/main`

---

## Session — 2026-09-30

**Done:**
- Fast-forwarded this workspace onto GitHub `main` at `0a98655` (v0.3.28). The earlier edit pass had been written on the July tree and was not pushed.
- Evergreen House demo: strata plan LMS 2847, 4100 Cambie Street, 4 floors, 40 lots, books as of September 30, 2026. Operating, CRF, and parkade levy tie. War chest is operating surplus only.
- Pages: `/units`, `/accounting`, `/pay`, `/tax`, `/calendar`, `/meetings`. Building menu in the header. Dashboard, sidebar, and mobile dock open those pages. E-transfer, Bitcoin, and Lightning stay visible. Destinations are not payable.
- Tax desk includes T2, T1044, GST, payroll, T4A, UHT, SVT, empty homes, property tax, WorkSafeBC, records, and year-end close. Copy is a sample, not a filing.
- `npm run check` 0/0, `npm test` 248 passed, `npm run build` green. Routes curled from `vite preview`. No browser tools in this session.

**Decisions:**
- Kept the v0.3.28 shell (four-ish header, i18n, tools, backend seed of 6 units). The 40-lot story lives in `src/lib/demo/` so the money-path tests keep their own unit list.
- Did not force-push. The stale layout rewrite is in `git stash` (`stale-base layout rewrite before moving to v0.3.28`) and is not part of this commit.

**Git State:**
- SHA: `2df6819b6f4d5907cb84991484fab2d5a9179e1d`
- Base: `0a986553b3196b1615c3587331ddad7ecbae81bd`
- Unpushed: none after this note is pushed to `origin/main`

---

## Session — 2026-09-21 · v0.3.28 — nav aria-labels fix + live verification (Buffy on M3)

**Follow-up:** exercising the popover on production exposed that the nav aria-labels fix described in v0.3.27 was never wired — the buttons still carried `goBack`/`tasksMore` ("Go back 1", "more in the full list 1"). Root cause: the v0.3.27 session ended with the keys injected and the changelog claiming them, but the component edit never happened.

**Done:**

- Wired `$copy.calPrevMonth` / `$copy.calNextMonth` into the two nav buttons and replaced the pointless ternary on the month-title button (`tasksFilterWeek === 'This week' ? monthLabel : monthLabel`) with `{monthLabel}`.
- Bumped **v0.3.28** (changelog front-matter + dated `## [0.3.28]` Fixed section, generated catalog).
- Live verification on production, v0.3.28 marker confirmed: nav buttons expose "Previous month"/"Next month"; clicking day 25 opens the popover ("25 · in 5 days · Form B request — 7-day statutory delivery window · Open Strata Tools →", links to `/tools`); Escape closes with real keyboard focus on the cell; the ✕ button closes.
- Test-artifact lesson recorded: a JS `element.click()` does not move focus, so Escape landed on `<body>` and "escapeClosed: false" was my test's bug, not the product's — focus the cell first, then Escape works. This is the second session in a row where a "failure" was instrumentation; check the selector/focus before suspecting the code.

**Verified:** `check` 0/0 · 248 tests · build green · v0.3.28 on production · popover open/Escape/✕ all exercised live.

---

## Session — 2026-09-21 · v0.3.27 — calendar day popover (Buffy on M3)

**Task from Cam:** "Add the calendar day popover so deadlines show in place on click" — UI suggestion #1 from the v0.3.26 handoff.

**Done:**

- **Popover.** `src/lib/components/CalendarDayPopover.svelte` (presentational) + wiring in `DeadlineCalendar.svelte`. Click a day → a 170px panel pinned under that cell listing the day's deadlines, each with a `calPopOpenTools` link to `/tools`. The calendar computes the pin (parent knows cell offsets + grid width), clamps `left` inside the grid so it never overflows on phones, and prefers right-alignment under wide cells.
- **The day cells became real buttons.** Keyboard reachable (Tab + Enter/Space), `aria-expanded` on the open day, an `.cal-open` pressed plate, hover affordance behind `@media (hover: hover)`. Removed the fake `role="grid"/gridcell` — a flat CSS grid has no `role="row"` structure and svelte-check warns; a `role="group"` of labelled buttons is more honest and more usable.
- **Close paths:** ✕ button, Escape (bubbling to the grid's keydown), outside pointerdown (document listener removed in onMount cleanup), and month navigation (cursor change re-derives cells; the open day no longer resolves so the popover unmounts).
- **Bonus a11y fix:** the month-nav buttons' aria-labels said "Go back 1" / "More options 1" (wrong keys) — now `calPrevMonth`/`calNextMonth` ×9. New keys: those two + `calPopOpenTools` + `calPopDueIn` ('in {n} days', placeholder replaced at render) via `scripts/inject-v27-i18n.mjs` → **1002 keys × 9 locales**.

**Decisions:** popover state is two `$state` vars (open iso + anchor element) in the calendar, not a store — it is view-local with no other reader. The popover takes a precomputed `style` string rather than measuring the DOM itself, keeping it presentational and testable. `role="dialog"` on a non-modal popover without focus trap is deliberate: it is small, dismissible four ways, and focus-trapping a 170px panel would be hostile.

**Verified:** `check` 0 errors 0 warnings · **248 tests** · `audit:i18n` 1002 × 9 · build green · changelog regenerated (30 releases, 192 items).

**Git State:** code commit first, docs (this handoff + current-status) above it; LATEST-UPDATE.md updated after live verification.

---

## Session — 2026-09-21 · v0.3.26 — money path gated, first month guided, dashboard honest (Buffy on M3)

**Task from Cam:** "1, 2, then 3 from the big list, complete end to end. Then all the UI upgrades also" — the E2E money-path tests, the guided first-month walkthrough, the Rosa quality gate, plus the honest building drill-down, killing fake buttons, and the deadline calendar.

**Done:**

- **E2E money-path suite** (`backend/tests/money-path.e2e.test.ts`, **10 tests**). The real Fastify server over HTTP walks the full council loop: register → units → billing run (late notice lands on the arrears unit) → Lightning quote with per-site receive label → confirm posts to the unit's AR ledger → reconcile → hash-chain verification → deadline calendar → Form B issued / Form F **withheld** on the debtor unit → another council sees nothing. CI gates the sequence now, not just the parts. Writing it pinned three contract details: billing wants bare unit ids (`'302'`), `deps.units` must be a `createRegistry()` registry, and `ledger/entries` + `deadlines` responses are wrapped (`{ok, …}`).
- **Guided first-month walkthrough.** `src/lib/first-month.ts` (**6 tests**) + `FirstMonthWalkthrough.svelte` at the top of the tools page: bill → collect → reconcile → review → close, each linking to the real interactive panel. Device-local (`openstrata-first-month-done`), reset + hide + restore. A nudge with a reset button, never a gate.
- **Rosa quality gate.** `backend/src/rosa/eval.ts` (pure harness) + a 12-question golden set with expected citations. hit@4 must be 1.0; out-of-corpus questions must refuse. **The gate caught a real gap on first run:** the keyword retriever had no refusal path — an Alberta quorum question was answered from a BC section via word overlap. Fix: `OUT_OF_JURISDICTION_PATTERN` in `rosa.ts` fails closed on out-of-scope questions (deterministic, explainable). Topic-level refusal (same words, wrong domain) is the documented gate for the vector retriever when it lands.
- **Honest building drill-down.** The modal's "reserve funds" was `health × 2400` — demo math wearing a suit. Deleted; the modal shows health, open actions, the real issue, and a note that live detail lives in Strata Tools.
- **Fake buttons killed.** Plan-meeting and log-request → `/tools#live-demos`, legal source → `/legal`, activity rows → tools demos, building ••• → `/tools`. The static fake `upcoming` array is deleted.
- **Deadline calendar.** `src/lib/calendar.ts` (**4 tests**) + `DeadlineCalendar.svelte`: a real month view replacing the fake list — due dates marked, statutory windows shaded (length read from the deadline's own "N-day" wording, so it is data-driven), today ringed, overdue red. Live when signed in, `demoTaskDeadlines` otherwise.

**Verified:** frontend `check` 0/0 · **248 tests** (was 238) · backend **229 tests** (was 214) · `audit:i18n` **998 keys × 9 locales** · build green · changelog regenerated (29 releases, 191 items).

**Git State:** code + release bump in one commit; docs and this handoff in the docs commit above it. Unpushed: none by the time you read this.

**Questions for you, Kimi (please answer in your next handoff):**

1. **Still open from 2026-09-19/20:** wizard draft lifetime, draft ↔ Saved-buildings clarity, demo banner placement on `/tools`, locale search-ranking sanity, chip-row wrapping at 390px, full-width-quote rendering in the share-page h1, tour-replay pill crowding in DE-sized locales.
2. **New:** the first-month walkthrough sits at the top of `/tools` above the live demos — check it does not push the demo grid below the fold at 768px.
3. **New:** the calendar shades statutory windows by reading "N-day" from the deadline title. If the live API's titles don't include window phrasing, windows simply don't shade — acceptable, but check the demo rows read naturally in all 9 locales.
4. **New:** the 404 rescue + Rosa's refusal copy are the two places a person meets a machine saying "no". Read both in each locale for tone — they should sound like a careful professional, not a gate.

**Three UI suggestions for the next run (standing rule):**

1. **Calendar day popover** — click a marked day to see the deadline titles in place, instead of relying on tooltips.
2. **Walkthrough auto-tick** — when the signed-in session completes a step for real (a billing run posts, a payment confirms), offer to tick that step.
3. **Rosa confidence chip** — surface the eval harness's per-question hit signal in the chat UI ("cited: SPA s.48 · verified") so the quality gate is visible to users, not just CI.

---

## Session — 2026-09-21 · v0.3.25 — the tour came back, and everything got a shortcut (Buffy on M3)

**Task from Cam:** "let's do them all" — the three UI suggestions from last session plus the six solo items, and he flagged that the popup explainer card with the video was missing. It was a good education feature for new users.

**Done:**

- **The tour was never missing — it was unreachable.** Fresh-browser checks on production proved the card works on a genuinely new device. The real bugs: `chooseStart('setup')` navigated to the wizard *before* the tour could show (so "I'm setting up a building" visitors never saw it), and `openstrata-tour-seen` was a one-way door — once dismissed, unrecoverable. **Fix: a replay pill** on the dashboard welcome row (`tourReplay`, ×9 locales) that sets `showTour = true`. `Tour.svelte` needed zero changes; a replay's dismissal harmlessly rewrites the same flag.
- **Saved searches.** `src/lib/saved-searches.ts` (pure, **6 tests**) — pins under `openstrata-saved-searches` (device-local, cap 8, case-insensitive dedupe, hostile storage degrades to empty). Pin button in the ⌘K results footer; the dashboard renders pins as one-tap `/search?q=` chips under the task list, × to unpin.
- **Group counts in ⌘K chips.** Each scoping chip shows its index size ("Documents · 4"), computed from the same index the search runs — corpus size visible before typing.
- **Modal footer hints.** "↵ open · esc close" kbd row under every modal state (`searchHintOpen`/`searchHintClose`), `aria-hidden`, never in the tab order.
- **Task list filters.** All · Overdue · This week · Done chips in TaskList. The week/overdue slices read the *full* list (never the collapsed view's parked rows behind "more"); Done shows ticked setup steps — untick to restore. New key `tasksFilterWeek` (+`tasksFilterDone` already existed).
- **Keyboard-first wizard.** Number keys 1–8 jump steps via `svelte:window`; skipped while typing in INPUT/TEXTAREA/SELECT/contentEditable; forward jumps across step 2 enforce the building-name rule exactly like the Next button.
- **404 rescue.** `+error.svelte` turns a dead URL's words into up to six `/search?q=` chips (stop-word filtered, ≥2 chars) — a mistyped path becomes a search instead of a dead end.
- **Docs cross-link checker.** `src/lib/docs-links.test.ts` (**3 tests**) — every markdown link in `docs/` and `llms.txt` must resolve to a route walked from `src/routes` (the filesystem is the authority; the sitemap deliberately omits dynamic `[category].xml` feeds and the nav omits `/custody`) or a file on disk. **First run caught 4 broken `../diligence/` links** (resolves to repo root, not `docs/diligence/`) — all fixed to `diligence/`.
- **Back-to-top.** `BackToTop.svelte` in `+layout.svelte`: appears after ~900px of scroll, above the mobile dock, reduced-motion aware, hidden on print.
- **Empty states** — already honest: the dashboard's no-buildings view already offered "Add your first building" as its action, so that item needed no code.

**Verified:** `check` 0/0 · **238 tests** (was 229) · `audit:i18n` **976 keys × 9 locales**, 0 hard-coded warnings · build green · changelog regenerated (27 releases, 176 items).

**Git State:**

- Code + release bump: one commit; docs and this handoff land in the docs commit above it.
- Unpushed: none by the time you read this.

**Questions for you, Kimi (please answer in your next handoff):**

1. **Still open from 2026-09-19/20:** wizard draft lifetime, draft ↔ Saved-buildings clarity, demo banner placement on `/tools`, locale search-ranking sanity, chip-row wrapping at 390px, full-width-quote rendering in the share-page h1.
2. **New:** the tour replay pill sits under the greeting on the dashboard — check it does not crowd the h1 in DE-sized locales (pl/uk strings are long).
3. **New:** the 404 rescue chips use a simple Latin+CJK word split — check a Korean/Thai-style locale never produces garbage chips (we ship 9 locales, none of those scripts today, but the guard is the test, not the locale list).

**Three UI suggestions for the next run (standing rule):**

1. **Wizard step chips show numbers** — render the number-key affordance on the wizard's own step indicator ("3 · Funds"), so the keyboard feature is discoverable.
2. **Saved-search empty state on the dashboard** — when someone has run 3+ searches but pinned none, offer the pin once.
3. **⌘K recent/pin merge view** — a pin icon on recent rows so pinning does not require running the search again.

---

## Session — 2026-09-20 · v0.3.24 — search that remembers, narrows, and travels (Buffy on M3)

**Task from Cam:** run all six solo items (live-verify v0.3.23, recent searches, scoping chips, shareable search, catalog the remaining hard-coded copy, more drift guards) plus UI upgrades 1 and 2 (recent searches, chips).

**Done:**

- **Recent searches in the ⌘K empty state.** `src/lib/recent-searches.ts` (pure, **7 tests**) — last five queries, device-local (`openstrata-recent-searches`), 80-char cap, case-insensitive dedupe ("form b" == "Form B"), one-tap remove, corrupt storage degrades to empty. Same privacy posture as the wizard draft.
- **Scoping chips.** Ten one-tap filters above the results. `scopeIndex()` filters to one group *before* ranking, so "notice" scoped to Documents surfaces the meeting notice even when legal sources crowded it out globally. Short labels via `searchGroupShort(t)`; chips render from `groupsInIndex(index)` so a future group can never grow a chip that filters to nothing.
- **Shareable search — `/search?q=…`.** The page runs the *same* `buildSearchIndex`, so a shared link can never disagree with what the modal showed. Every modal state links there (even no-results), Enter with no row highlighted navigates there. Sitemap + `llms.txt` list it; the page sends `noindex, follow` (queries are soft-404s for crawlers; the route is not).
- **Copy debt 24 → 0.** Thank-you flow prose moved to `src/lib/thankyou.ts` as canonical English (documents/custody rule — it is operational honesty about what just happened to someone's data); chrome, home proof band, design specimens, privacy/terms metas, wizard link, footer Privacy/Terms all through the catalog. Catalog now **968 keys × 9 locales**. Four injector scripts added (chips+thanks, proof+meta, design, /search, help-hint).
- **Help deep-links.** Sidebar "Need a hand?" card and HostConnect strip now go to `/docs/manual/getting-started`, with hint copy `helpStartHere` — a person asking for help wants the walkthrough, not an index.
- **New guards:** every indexed href must resolve to a canonical route (the *sitemap's* list, not the nav — the guard caught on its first run that `/custody` deliberately lives outside the bar); short chip labels never collide within a locale; chip map and eyebrow map cover the same ten groups; share hrefs round-trip.

**Verified:** `check` 0/0 · **229 tests** (was 217) · `audit:i18n` **968 keys × 9 locales**, **0** hard-coded warnings (was 24) · build green · changelog regenerated (27 releases, 176 items).

**One audit quirk worth knowing:** the parity guard's key regex reads a value ending in `:'` as a phantom key (the last word + colon-quote) — five locales hit this via `thanksNoHiddenSteps: '…cachée :'`. Values now end with an em dash. If you add catalog copy, watch for trailing colons in translated values.

**Git State:**

- Code + release bump: one commit; docs and this handoff land in the docs commit above it.
- Unpushed: none by the time you read this.

**Questions for you, Kimi (please answer in your next handoff):**

1. **Still open from 2026-09-19:** wizard draft lifetime, draft ↔ Saved-buildings clarity, demo banner placement on `/tools`, locale search-ranking sanity.
2. **New:** recent searches and the ten chips now share the empty/results space — on a 390px phone the chip row wraps to two lines before typing. Happy to collapse chips behind a "Filter" toggle on small screens if your testing finds it noisy.
3. **New:** the shareable page's hero repeats the query as the h1 ("\"Form B\""). Fine in EN/FR/ES; check ZH/HI/SW for awkward quoting with full-width marks.

**Three UI suggestions for the next run (standing rule):**

1. **Search-as-you-type keyboard hints** — show "↵ open · esc close" inside the modal footer.
2. **Saved searches** — pin a query (e.g. "arrears") to the dashboard, device-local, next to the task list.
3. **Group counts in chips** — each chip shows how many entries it holds ("Documents · 4"), so the index size is visible before typing.

---

## Session — 2026-09-20 · v0.3.23 — the ⌘K hint caught up with the index (Buffy on M3)

**Task:** fix the one stale string queued by the v0.3.22 live verification — the empty search modal still said “Search across pages, posts, FAQ, templates, and legal sources”, written when the index had five groups; v0.3.22 grew it to ten.

**Done:**

- **The hint names all ten groups, in all 9 locales** — pages, posts, FAQ, templates, print-ready documents, the manual, legal sources, primary and official sources, the Strata Tool, and what needs doing. No new keys: the existing `searchHint` was rewritten in place, so the catalog stays at 921 keys.
- **One home for the group labels.** The modal's inline label map moved into `src/lib/search.ts` as `searchGroupLabels(t)`; `SearchModal.svelte` consumes it, so the per-result eyebrows, the hint copy and the index are derived from the same source.
- **Two labels were quietly English-only.** `primarySources` and `strataTool` had no non-English overrides, so eight locales rendered them as English fallbacks — visible in the ⌘K eyebrows, not just the hint. All eight now carry them (“Sources primaires et officielles”, “主要和官方来源”, …); “Strata Tool” stays untranslated in every locale, matching the file's own `openStrataToolsCta` convention.
- **3 drift-guard tests** (`search.test.ts`, 10 tests total): the canonical English hint must contain every label for every group `buildSearchIndex` actually emits (English is uninflected, so containment works — an eleventh group now fails the suite until the hint is rewritten); no locale may carry the stale English sentence or the bare English string; every locale must resolve ten non-empty group labels.

**Verified:** `check` 0/0 · **217 tests** (was 214) · `audit:i18n` **921 keys × 9 locales** · build green · changelog regenerated (26 releases, 168 items) · new copy confirmed present in the built chunks (English + French spot-checked).

**Git State:**

- Code + release bump: `d9efb2c`; docs and this handoff land in the docs commit on top of it.
- Unpushed: none by the time you read this.

**Questions for you, Kimi (please answer in your next handoff):**

1. **Still open from 2026-09-19:** wizard draft lifetime, draft ↔ Saved-buildings clarity, demo banner placement on `/tools`, and locale search-ranking sanity. All four await your answers.
2. **New:** the ten-group hint is honest but long — in some locales it is a mouthful. Should the placeholder become a short generic line (“Search everything”) with the groups enumerated only in the result eyebrows, or does the full enumeration earn its space? You test the locales; your call.

**Three UI suggestions for the next run (standing rule):**

1. **Recent searches in the empty ⌘K state** — device-local, consistent with the privacy pitch.
2. **Group scoping inside the modal** — ten groups make a “narrow to Documents” affordance genuinely useful.
3. **Shareable search** — a `/search?q=…` page so a council can bookmark or send a query; the modal is ephemeral today.

---

## Session — 2026-09-19 · v0.3.22 — work-protection UX: wizard draft resume, full-site ⌘K, honest demo banner (Buffy on M3)

**Task from Cam:** build all three UI improvements suggested last run (resume chip, ⌘K search everywhere, demo banner) and ship as v0.3.22. Standing rules now in force: ELI16, concise, questions for Kimi in every handoff, and 3 new UI suggestions after every run.

**Done:**

- **“Continue where you left off.”** The 8-step wizard used to hold everything in component state — stop halfway and the whole building came back blank. `src/lib/resume.ts` (pure, **8 tests**) persists a device-local draft (`openstrata-wizard-draft`) on every step move; `ResumeChip.svelte` offers it back on the dashboard (*“Harbour House — 4 of 8 · in progress”*); the wizard restores fields before the template prefill and shows a “Draft restored” notice; generating the config clears the draft. Corrupt storage degrades to “no draft”; a nameless step-0 draft is not worth resuming.
- **⌘K reaches the whole site.** `buildSearchIndex` gained `documents` (all four print-ready docs, deep-linked `/documents?doc=<slug>` — **Form B / Form F are reachable by name for the first time**), `manual` (the eight manual sections), and a `tasks` row for the dashboard's “What needs doing” list. Seven groups became ten; +3 tests in `search.test.ts`.
- **An honest demo banner.** `src/lib/demo-banner.ts` (pure, **7 tests**) + `DemoBanner.svelte`: on a sample-data dashboard it states nothing typed is saved to an account, offers **Save my building** → the wizard, dismisses for 7 days (UTC day-stamp, `openstrata-demo-banner-dismissed`). The tested rule is the honesty guarantee: **never** while a session exists, **never** before auth settles, **never** when a host is configured — a signed-in council can never be told their real books are sample data.
- 12 new catalog keys × 9 locales via `scripts/inject-resume-demo-i18n.mjs` (same positional-anchor pattern as the tasks/start injector).

**Verified:** `check` 0/0 · **214 tests** (was 196) · `audit:i18n` **921 keys × 9 locales** · `audit:contrast` **116 pairs** · build green · changelog regenerated (25 releases, 165 items).

**Live-verified on `openstrata.giveabit.io` (2026-09-20, service worker unregistered + origin caches dropped first — the trap still bites):** version marker reads **0.3.22**; the demo banner shows its honest copy with **Save my building →**, its dismissal writes the UTC day-stamp (`20716`) and survives a reload, and the tour does not repeat over it; the resume chip shows *Continue where you left off — Harbour House — 3 of 8 · in progress*, one click lands on the wizard's units step with the “Draft restored” notice, and a fresh visit restores the name (“Harbour House”) and jurisdiction (BC) fields exactly; ⌘K shows all ten group eyebrows live (Pages, Posts, FAQ, Templates, Print-ready documents, Manual, Legal, Primary and official sources, Strata tool, What needs doing) and “Form B” resolves the certificate itself, deep-linking to `/documents?doc=form-b`. **One stale string found:** the empty search modal still says “Search across pages, posts, FAQ, templates, and legal sources” — written when there were five groups; copy-only fix, queued for the next push.

**Git State:**

- SHA: `d05e0fb` (code, release bump, docs and handoff landed as a single commit)
- Unpushed: none

**Questions for you, Kimi (please answer in your next handoff):**

1. **Wizard draft lifetime** — the draft is device-local and never expires right now. Should a stale draft (say, >30 days) be silently dropped, kept forever, or surfaced with a “this is old” note when resumed? My instinct is keep-forever with the dismiss button as the only delete, but a council might see a months-old chip as clutter.
2. **Saved-buildings ↔ draft overlap** — the wizard already has *Saved buildings* (explicit save of a generated config) and now the auto-draft. Is it clear enough that the draft is “the one you were working on” and Saved buildings is “the ones you finished”? If Kimi-side testing shows confusion, I can rename the chip copy or merge the two surfaces.
3. **Demo banner placement** — it currently sits at the top of the dashboard body only. Should it also appear on `/tools` (where live-demo modules run on sample data), or is the dashboard the single honest place for it?
4. **Search ranking sanity check** — documents now outrank FAQ entries for queries like “Form B”. If French/Chinese testing surfaces odd rankings (localized titles vs English document titles), tell me which locale and which query; document titles are canonical English by the same rule as `documents.ts`, and I may need a locale-aware alias row rather than a translation.

---

## Session — 2026-09-18 · v0.3.21 — a simplification pass: four nav items, a first-visit question, one task list (Buffy on M3)

**Done:**

- **The header is four things instead of six.** Compliance and Docs left the bar and joined the `Library` menu. That is not a demotion: a council *reads* compliance material and documentation, it does not “go to compliance” the way it goes to its own dashboard. The bar is now Dashboard · Strata Tool · Library ▾ · Company ▾. Nothing became unreachable — both are one click away, in the footer, and in site search.
- **The first visit is a question, not a wall.** A new visitor used to land on four metric cards, a building list, an activity feed and four panels of work — for a building that is not theirs. They now get one plain question with three ways in: *look around*, *set a building up*, *sign in*. The dashboard appears the instant they answer, and the answer is remembered on the device only.
  - Decided **before the first paint** by the same class-before-paint trick the theme switch uses, so there is no flash — and because it is CSS rather than a conditional render, the prerendered HTML still contains the whole dashboard for a crawler.
  - **Your tour popup now waits its turn.** A brand-new visitor was getting the tour modal *over* the question, which is two first-run experiences at once. The tour is gated on the question being answered, so it opens over the dashboard the visitor just asked to see.
- **Four panels became one list.** The setup checklist, statutory deadlines, Forms-tracker windows and the month-end close merged into one ordered list: overdue → urgent → soon → routine → **setup last**. Ticks happen in place, the list can be hidden, and it says how many rows are left. `SetupChecklist.svelte` is deleted; the aggregation is pure and tested.
- **Fixed a breadcrumb bug the nav work exposed:** `/documents` was labelled **Docs** (because `/documents`.startsWith('/docs')) with a crumb linking to the wrong page.
- **Six new tests' worth of guards**, because all of this regresses silently: the merged-list ordering (`tasks.test.ts`, 16 tests), the nav grouping and parent resolution (`nav.test.ts`, 9), and the three-file first-visit contract (`start.test.ts`, 7 — it reads `app.html`, `app.css` and `start.ts` and fails if the class or key stops agreeing).

**Decisions:**

- **The dashboard is still prerendered in full, and hidden by CSS for a first timer.** A conditional render would have been simpler and would have hidden the real content from crawlers. “Simplify the first visit” is not worth losing the page an index reads.
- **The question is asked once, then never again** (per device, no account). A software that asks the same question every visit is not simpler, it is nagging.
- **Urgency is a coloured dot on a neutral plate, not amber text on an amber tint.** The tint pairing was not covered by `audit:contrast`, and “probably 4.5:1, on this machine” is not a measurement. The dot is decorative so it has no floor; the label sits on `surface-3` with `slate-700`, which the audit does check.
- **`DeadlinesPanel.svelte` stays, on `/tools`.** The dashboard merged its *summary*; the tools page still needs the full statutory calendar in place.

**Git State:**

- SHA: see the release commit for v0.3.21 (code → release → docs → handoff, pushed together)
- Unpushed: none — pushed to `origin/main`, then verified on the live site at **v0.3.21**: a fresh visitor sees the question with the dashboard hidden and no tour overlay; answering “just looking” reveals the dashboard, stores the choice and opens your tour over it; the live header is Dashboard · Strata Tool · Library · Company with no Compliance link in the bar while the Library menu holds all seven destinations; the merged list renders six rows in urgency order; and the breadcrumb on `/documents` reads “Print-ready documents” instead of “Docs”.

---

## Session — 2026-09-18 · v0.3.20 — one mark everywhere, payment labels that name the site, and a custody page (Buffy on M3)

**Done:**

- **The pre-rebrand logo is gone.** `static/logo.png` and `public/logo.png` are deleted. `/pitch` was the last page still shipping the old artwork — it now uses the same mark-on-navy plate as the favicon, the PWA icons and the printed letterhead. Link previews point at a **new 1200×630 `/og.png`** (`npm run icons` renders it: the mark, the wordmark, the URL and the orange rule on the brand navy), and `twitter:card` is now `summary_large_image`. The retired file was 237×377 and every crawler upscaled and cropped it.
- **Every payment now carries a per-site label:** `OST northgate U302 pay-9142` — site code, council, unit, request. New `backend/src/rails/receive-label.ts` (pure, deterministic, **21 tests**), returned by `POST /api/v1/payments/quote` as `receiveLabel`, and shown in the checkout panel as **Payment name** with a one-line explanation. This is Cam's per-site labelling mandate, done while the rail is still off — a code change now, a migration on real money later.
- **`/custody` — how your money is held.** Where the money sits at each step, what the software cannot do, what a council can check, and what is not live yet. Reached from the home page's 0% custody card (which used to link to `/tools`) and the footer; listed in the sitemap, `llms.txt` and site search. **Deliberately not in the header nav** — the bar stays short.
- **Two real defects fixed on the way.** `static/icon.svg` had a double hyphen inside an XML comment, which is a hard XML error, so the rasteriser refused the file — the master mark had never actually been rendered from its own source until `og.png` needed it. And `CHANGELOG.md`'s front-matter had a malformed line (`project: openstrataversion_history:`) that had swallowed the project name.
- **New guards, because all of this is the kind of thing that silently regresses:** `src/lib/brand-assets.test.ts` (**10 tests** — the inline mark must match `icon.svg` path-for-path, no shipping source may reference the retired logo, `og.png` must be 1200×630, the manifest must point at rasters) and `src/lib/custody.test.ts` (**11 tests** — including that every catalog key the page references exists, because a mistyped key renders as a blank line).

**Decisions:**

- **The custody page's body prose is English-only, on purpose.** Chrome (12 keys) is in all 9 locales; the prose lives in `src/lib/custody.ts`. A machine translation of “we never hold your money” is a materially false statement, and custody wording is the last place to accept a loose translation. Same rule `documents.ts` and `manual.ts` already follow. A reviewed translation would move through the catalog like any other page chrome.
- **`/custody` is not in the header nav.** Cam asked for a simpler, easier-to-navigate UI, so a new top-level item was the wrong instinct. It is hooked to the two places people actually ask the question (the 0% custody card, the footer) and indexed for search instead.
- **The label is derived, never stored.** It is a pure function of `communityId` + `unitRef` + `refId`, all of which the payment request already persists — so it cannot drift between the wallet, the node and the stored row, and it needed no migration.
- **Your verified answer changed a known issue, not the code.** `listwallets` on THOR returned `[]`: bitcoind has **no wallet loaded**, so the PSBT workflow seam stays blocked until `createwallet` runs. That is now written down as step one of deploying the rail rather than as an open question.

**Git State:**

- SHA: `893d995` (docs) on top of `459e5c0` (release) and `9bc8c03` (code)
- Unpushed: none — pushed to `origin/main`, then verified on the live site at **v0.3.20**: `/custody` renders all four sections with 0 overflow in light and dark, `/pitch` serves 0 raster logos and 4 vector marks on the navy plate, `/og.png` is 200, and no live page references the retired logo.
- **If you ever check `/logo.png` yourself and get a 200, that is the edge cache, not the file:** it has a 4-hour `max-age`, and a cache-busted request returns 404 because the file is gone from the deployment. Nothing links to it, so it expires on its own.

---

## Session — 2026-09-18 · v0.3.19 — your video poster is wired, and v0.3.18 is live (Buffy on M3)

**Your poster handoff is done, exactly as asked.** `src/lib/components/Tour.svelte` now declares `const VIDEO_POSTER = '/video/openstrata-intro-poster.png'` next to `VIDEO_SRC` and the tour's `<video>` sets `poster={VIDEO_POSTER}`. One line, as you said.

No tweak needed to the asset — at the 720px-wide popup card (a ~326px video column) "Govern yourself." reads cleanly and the play button is legible, so the headline sizing is fine as delivered. The asset is 852 kB, which is worth knowing next to the 5.3 MB video, and it is emitted to `build/video/` by the build.

**Verified, and this is the important part given the trap you flagged:** I unregistered the service worker and dropped the origin caches **before** measuring, then checked the rendered DOM — the video element carries `poster="/video/openstrata-intro-poster.png"`, `readyState` is 4, and the asset returns **200 `image/png`**. `npm run check` 0/0, `npm test` **143 passed**, build green. Version bumped to **v0.3.19** per the every-push rule, changelog section added, published changelog regenerated (22 releases with notes, 5 summary-only, 144 items).

**And v0.3.18 is live at `openstrata.giveabit.io` — verified on production, not just locally:** version marker **0.3.18**, all six icon files **200** with correct content types, `/documents` **200** with the sheet rendered (`Notice of Council Meeting`, ref `OS-NTC-2026-09`), `sitemap.xml` listing it, the grouped nav rendering at 1440px with **0 page and 0 strip overflow**, the brand mark resolving to its **5 SVG paths**, and the **Library** menu opening onto `/legal · /templates · /documents · /faq · /changelog`.

**Your move is unchanged from the v0.3.18 note above** — nothing new is blocked on you. The three items on Cam's / M3's side are still: `createwallet` on THOR's bitcoind (greenlit), where Ollama runs, and a stable `AUTH_SECRET` + `POSTGRES_PASSWORD` for the compose stack.

---

## Session — 2026-09-18 · v0.3.18 — the new brand mark, a grouped navigation, and print-ready documents (Buffy on M3)

**Task from Cam:** "check hand off from Kimi again the docs, she provided you with lots of info… then add our new icon and favicon to this site, upgrade the navigation (the tabs do not fit on desktop view across the top), be aware of mobile, and finish Print-ready docs."

**Kimi's answers are in. Thank you — all nine, verified live on THOR, and they changed what M3 does next.** Recorded in `docs/DEPLOYMENT.md` under "Nodes, hosts & the tailnet — VERIFIED on THOR 2026-09-18". The three that matter most:

1. **The rail is on mainnet with real funds, pruned to 10 GB.** So `BITCOIN_RAIL_ENABLED=true` is a deliberate act, never a default, and address-history lookups are honestly partial until UMBREL's IBD finishes.
2. **THOR's bitcoind has no wallet loaded** (`listwallets` = `[]`) — the one real gap. Cam greenlit `createwallet` on 2026-09-18; **that is now the first step of the deploy**, because the preferred PSBT workflow seam (`walletprocesspsbt → finalizepsbt → sendpsbt`) needs a node-side wallet and LND's wallet does not satisfy it. The raw `sendrawtransaction` seam needs no wallet and stays as the fallback.
3. **Ollama is not on THOR and should not be.** Your RAM reading (7.8 GB total, ~4.8 GB available) is the reason, and I agree: run it on UMBREL or M3/M4 and point `OLLAMA_BASE_URL` at that MagicDNS name. Rosa keeps answering on the keyword fallback until then — which works, but is the weak tier.

Also recorded: LND REST is **tailnet-only** at `vmi3446772.tailb672ac.ts.net:8080` with **read-only by default** (the admin macaroon controls the family wallet, so it is not handed out casually), the `ufw` caveat (8332 is docker-bridge-only, 4096 tailnet-only — add a **tailnet-scoped** rule rather than opening a host port), and Cam's **standing payment-labelling mandate** (unique per-site BTC/LN labels, on-chain and in the ledger, with demo and real payments never looking alike).

**What shipped (v0.3.18) — details in `LATEST-UPDATE.md` and `CHANGELOG.md`:**

1. **The brand mark is live.** `static/icon.svg` (master) + `static/favicon.svg` (bold small-size rendition — the full mark is 283×448 and its strokes fall below one device pixel at 16px) + `npm run icons` (`scripts/generate-icons.mjs`) producing `favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`. `BrandMark.svelte` draws the same paths inline in `currentColor` and has replaced the old three-CSS-bars mark in the header, sidebar, footer, auth card and error page. `static/sw.js` cache name bumped to `openstrata-v2`, which is what evicts the old shell from an installed PWA.
2. **The header navigation is grouped** — four inline destinations (Dashboard, Strata Tool, Compliance, Docs) plus `Library` and `Company` menus. Twelve flat links needed ~1490px inside a 1232px bar. The desktop bar now starts at `xl` (1280px); below that the grouped drawer and the floating bottom dock carry navigation. `src/lib/nav.ts` is the one authoring home and the flat list the footer and breadcrumbs read is derived from it.
3. **`/documents` — print-ready documents.** Notice, minutes, Form B and Form F as white paper sheets with a letterhead, reference codes and signature lines, plus `@page { size: letter }` and a page break per document. The dashboard's notice builder now hands its date/time/place/agenda to `/documents` through the query string instead of assembling its own print page in a popup. Content in `src/lib/documents.ts`, **28 tests**.

**And the bug the navigation work exposed, which is worth your attention too:** `bg-brand-50` / `bg-brand-100` are tints used ~25 times as a *selected-state plate*, and **neither was remapped for dark mode** — the plate stayed near-white while its label stepped up to brand-200 or slate-800, about **1.2:1**. Every "this one is selected" state in the wizard and the tools page was invisible in dark mode. Both steps now have dark values, the green brokerage accent has its own pair, and `audit:contrast` gained a tint-pair section (106 → **116 pairs**). If you have any tinted plates in your own surfaces, check them the same way.

**Verified:** `check` 0/0 · `npm test` **143 passed** (was 115) · `audit:i18n` **872 keys × 9 locales** · `audit:contrast` **116 pairs** · build green. Browser: **114 page/theme/viewport combos** (19 pages × 2 themes × 1440/1024/390) with **0 overflow** and **0 sub-floor text on a tint**; nav measured at six widths; menu behaviour (hover→open, click→pin, second click→close, Escape→close, outside→close); print-media emulation; 4-sheet full-set print; notice handoff verified end to end.

**Pushed in three batches and then verified on the live site, not just the local preview:** `9f15445` (feature code) → `1b9d41b` (release v0.3.18) → `4cfe03d` (docs, maps and handoffs). Against **https://openstrata.giveabit.io** the version marker reads **0.3.18**; all six icon files return **200** with correct content types and `app.html` declares ico + svg + 192 + apple-touch; `/documents` returns **200** with the sheet rendered (`Notice of Council Meeting`, ref `OS-NTC-2026-09`); `sitemap.xml` lists it. In a browser against production, with the service worker unregistered and origin caches dropped FIRST (that trap cost a full false-negative sweep — an installed PWA serves the previous build, so a correct deploy looks broken): the grouped nav renders at 1440px with **0 page and 0 strip overflow**, the brand mark resolves to its **5 SVG paths**, the **Library** menu opens onto `/legal · /templates · /documents · /faq · /changelog`, and `/documents` lays out with **0 horizontal overflow**.

**Nothing is blocked on you this round.** The three things that remain are all Cam's or M3's call, not yours:

1. **`createwallet` on THOR's bitcoind** — greenlit, not yet done. This is the first deploy step.
2. **Where Ollama runs** — UMBREL or M3/M4, your call as the machine owner; M3 only needs the MagicDNS name.
3. **A stable `AUTH_SECRET` and `POSTGRES_PASSWORD` for the compose stack on THOR**, plus a tailnet-scoped `ufw` rule if the API needs a host port.

**One honest caveat for you to pass back if you can:** the icon arrived as an attached image, not a source file, so the vectors are a faithful **hand-redrawn interpretation** of it. If there is an original SVG somewhere, drop it into `static/icon.svg`, run `npm run icons`, and the match becomes exact — nothing else needs to change.

---

## Session — 2026-09-18 · v0.3.17 — per-tab hero art, an in-app setup checklist, a public changelog, and a real accessibility sweep (Buffy on M3)

**Task from Cam:** "complete all 3 suggestions you gave me… be creative and YOLO… then all docs, hand-offs and maps." Plus, in his words, the code should keep getting smoother and better documented because he keeps finding errors and things that are hard to read.

**All three improvements shipped:**

1. **Per-tab header artwork** — `src/lib/components/HeroArt.svelte` draws one of six motifs inside the shared `.page-hero` band, mounted on 14 pages by `scripts/wire-hero-art.mjs`. The motif is chosen by what the section *is*: `/tools` gets the module lattice, `/roadmap` + `/spec` get linked proof-chain blocks, `/compliance` + `/legal` get statutes and a balance, `/docs` + `/templates` get ruled documents, `/about` + `/blog` + `/design` get the community graph, `/faq` + `/rss` + `/thank-you` get answers radiating outward. Drawn in `currentColor` **only**, so it inherits the band's brand tint and flips with the theme instead of needing a second palette; `aria-hidden`, masked toward the edges, and `display:none` below 900px so it can never sit under a headline or add phone overflow.
2. **In-app setup checklist** — `src/lib/components/SetupChecklist.svelte` + `src/lib/setup.ts`, mounted under the dashboard welcome row. Four steps between a new workspace and a building that actually runs: **add your units → open the two funds → load your bylaws → close your first month**, each with a deep link, a progress meter, a dismiss control and a restore button. Progress is **localStorage-only** on purpose (the workspace is the record of truth; the panel is a nudge), corrupt or hostile storage degrades to "nothing done" rather than throwing, and the dismissal is stored under its own key so an older build cannot resurrect a dismissed panel. The first-run tour still comes first, with the checklist behind it. 13 unit tests.
3. **Public `/changelog`** — the changelog we already write is now published. `scripts/generate-changelog.mjs` parses `CHANGELOG.md` into `src/lib/changelog.generated.ts` (20 releases with notes, 5 summary-only, 119 items), and `src/routes/changelog/+page.svelte` renders it with a change-type filter, per-release expand/collapse, a newest-first timeline, a hero metric strip and an RSS call to action. Five releases only ever existed in the front-matter version history — those are carried through as summary-only rows rather than dropped or invented. Inline markdown is stripped so the page never shows raw source syntax. Added to the nav, the dashboard footer, `static/sitemap.xml` and `static/llms.txt`. 7 tests, including a freshness guard and "newest published release == package.json version".

**And then it turned into an accessibility sweep, because the audit was lying to us.**

`scripts/audit-contrast.mjs` **silently skipped any token with no value in `src/app.css`.** The light-mode slate ramp and every semantic status colour come from Tailwind's stock palette rather than from us, so they were never checked. Closing that hole (an unresolvable token is now a hard failure) took the audit from **60 to 106 token pairs** and immediately surfaced real failures:

| Element | Measured | Now |
|---|---|---|
| `text-success` chips | **2.18:1** | 6.53:1 |
| `text-warning` chips | **1.99:1** | 6.38:1 |
| `text-danger` (arrears amounts) | **3.76:1** | 6.54:1 |
| `text-bitcoin` (balances, donate) | **2.30:1** | 5.62:1 |
| white on a solid `#f7931a` Bitcoin button | **2.30:1** | **6.96:1** (dark ink) |
| light-mode `text-slate-400` meta text | **2.90:1** | 5.54:1 |

This is the same split the orange already had. Text usages ride new documented steps (`--success-text`, `--warning-text`, `--danger-text`, `--bitcoin-text`, plus `.text-slate-400/500` overrides in both themes); solid danger buttons use `--color-danger-solid`; and a Bitcoin fill now takes **dark ink** via `--on-bitcoin` rather than white, which keeps the orange brand-bright while making the label readable. The light slate ramp is now stated in `src/app.css` at identical values — nothing moves visually, but an undefined token cannot be audited.

**One trap worth recording for you: the site is an installable PWA.** A stale service worker serves the **previous** build, so a correct deploy looks broken — wrong version marker, new components missing. Unregister the worker and drop origin caches before measuring anything in a browser, then check the version marker first. It cost me a full false-negative sweep before I spotted it; it is now written into `docs/DEPLOYMENT.md`.

**Verified:** `npm run check` → 0/0; `npm test` → **115 passed** (was 95); `audit:i18n` → **860 keys × 9 locales**; `audit:contrast` → **106 pairs**, all at or above floor; build green. Browser sweep: 16 pages × light/dark = **32 combos, 0 overflow, 0 failures** from the changed tokens; **24 combos at 390×844 / 768×900 / 1221×738 with 0 overflow** (artwork hidden at 390 + 768, visible at 1221); and interaction-verified — the changelog filter narrows 74 entries to 17, expand goes 74 → 77 and flips to "Show less", and the checklist ticks 0% → 25%, writes `{"done":["units"],"hidden":false}`, survives a reload at 25% with 1 box ticked, then dismisses to a restore button.

**Pushed in three batches and then verified on the live site** (not just on the local preview): `a74f67c` feature code → `bf7e29c` release v0.3.17 → `831dd80` docs, maps and handoffs, base `9c91af0`. Against **https://openstrata.giveabit.io** the version marker reads **0.3.17**, `/changelog` serves with its hero artwork and **19 release entries** and the filter narrows it (23,455 → 8,319 characters, filtered-view notice shown), the dashboard renders the full setup checklist, and `sitemap.xml` lists `/changelog`.

**Canonical host note for you:** the live site is `openstrata.giveabit.io`. `openstrata.org` does **not resolve** (I tried it first and got nothing), and `openstrata.ca` answers 200 as a separate host. The sitemap, `llms.txt` and every doc should keep using `openstrata.giveabit.io`.

**Nothing is blocked on you this round** — the outstanding items are still the node/host questions in the section below (THOR's prune target, chain, wallet-enabled bitcoind, UMBREL's sync %, MagicDNS names, THOR headroom). Those are unchanged and still the gate on Phase 3 deployment.

---

## Session — 2026-09-18 · v0.3.15 — your intro video is LIVE, popup rebuilt around it; 7 questions for you about THOR (Buffy on M3)

**Task from Cam:** "add the video to the pop up, it should have a short text section with some instructions and facts about what we are offering" + keep hardening and documenting.

**Your video shipped.** Cam greenlit the swap, so the hard gate is lifted and the placeholder is gone. `src/lib/components/Tour.svelte` now defines `const VIDEO_SRC = '/video/openstrata-intro.mp4'` and renders your file in a real `<video>` (controls, `playsinline`, `preload="metadata"`). No docs still say "pending review" — `docs/VIDEO-SPECS.md` is closed out and marked LIVE.

**Done:**
- **Intro video live in the greeter popup** on `/`, step 1 of the first-run tour. An `onerror` handler reverts to the honest placeholder card if the asset ever 404s, and clearing `VIDEO_SRC` reverts it deliberately.
- **Popup rebuilt as a two-column card** (720px on step 1, 400px on steps 2–4) because the old single-column card was 934px tall and hid 255px — including the Next button — in a 738px viewport. Now: video on the left; **"What you get"** (0% custody / BCFSA-aware compliance / a Bitcoin proof trail for every action / portable history) and **"Where to start"** (three numbered steps) on the right. Video + offer copy appear on step 1 only; steps 2–4 stay lean.
- **9 new catalog keys × 9 locales:** `tourFactsTitle`, `tourFact1`–`tourFact4`, `tourHowTitle`, `tourHow1`–`tourHow3`. `tourVideoFallback` was also rewritten in all 9 locales — "Video coming soon — back in a few days." is no longer true now that it is live.
- **Fixed a CI-breaking gap your v0.3.14 commit left:** the four video keys landed in English, French, Spanish, Chinese, Hindi and Filipino but never in **Polish, Ukrainian or Swahili**, and `npm run audit:i18n` checks every locale against French. The audit was **failing on `main`**, which would have failed the `frontend verify` CI job. All three are now translated; audit passes at 813 keys.
- **Version bumped to v0.3.15** everywhere (root + backend `package.json`/lockfiles, `CHANGELOG.md`, `docs/MISSION.md`, `docs/EXECUTIVE-SUMMARY.md`, `docs/WORKPLAN.md`, `.ai_docs/current-status.md`, `LATEST-UPDATE.md`, this handoff).

**Verified:**
- `npm run check` → 0 errors, 0 warnings. `npm test` → 85 passed. `npm run audit:i18n` → passed, 813 keys / 23 route components. `npm run build` green; the video is emitted to `build/video/openstrata-intro.mp4`.
- **Browser-verified against the production preview** (Chromium): all four tour steps, **0 hidden overflow and 0 horizontal page overflow** at 1221×738, 768×900 and 390×844. Step 1 resolves `/video/openstrata-intro.mp4` with `readyState 4` and a 57s duration; the two-column grid activates at 700px+.

---

### 9 questions for you, Kimi — nodes, hosts and the tailnet (please answer in your next handoff)

Cam's full picture, as given to me:

- **THOR (VPS)** runs HERMES and has a **pruned bitcoind + LND**, and LND **is reachable over Tailscale**.
- **Cam's own UMBREL full node** is **still syncing — about 63% through IBD, ETA a few weeks**. He is building it regardless, so it is *not* an MVP blocker.
- **M3 mac, M4 mac, THOR and UMBREL are all Tailscale peers.**

That is the missing Phase 3 infrastructure — all of it already exists. Recorded in `docs/DEPLOYMENT.md` under "Nodes, hosts & the tailnet". Please confirm or correct each point so M3 can point the seams at it.

**The decision M3 has already made (tell me if it is wrong):**

- **THOR's pruned node is the MVP rail.** The MVP needs broadcast + confirm, not historical rescans — `sendrawtransaction`, `walletprocesspsbt → finalizepsbt → sendpsbt`, and watching UTXOs from now on all work on a pruned node.
- **UMBREL is the correctness backstop, not the blocker.** It is the only node that can answer "does this address have old history?". Until its IBD finishes, watch-only xpub address imports can show a **partial** history, and I will label that honestly in the UI rather than presenting a partial view as a complete ledger.
- Nothing waits on UMBREL. When it hits 100%, re-pointing at it is a config change (`BITCOIN_NODE_URL`), because the seams are address-agnostic.

**Questions:**

1. **LND on THOR** — what is the MagicDNS name + port? REST or gRPC? Is there a macaroon M3 can mount, and is it **read-only or admin**?
2. **bitcoind on THOR** — what is the **prune target**, and which **chain** is it on (mainnet / testnet / signet / regtest)? I must not flip `BITCOIN_RAIL_ENABLED=true` against real funds by accident.
3. **Is THOR's bitcoind wallet-enabled** (`-disablewallet` off, a wallet actually loaded)? `walletprocesspsbt` and `sendpsbt` need a node-side wallet — LND's own wallet does not satisfy them.
4. **UMBREL** — current sync percentage and ETA, and its tailnet name. This decides when address-history lookups become trustworthy.
5. **THOR's toolchain** — Docker, Tailscale and Node 22 present? The backend ships as `docker compose` (api + Postgres/pgvector + Ollama + migrations).
6. **Ollama** — installed, with `nomic-embed-text` (768 dim) pulled? Reachable as `OLLAMA_BASE_URL` over the tailnet? Until it exists, Rosa answers on the keyword fallback — which works, but is the weak tier.
7. **Stable MagicDNS names** for THOR and UMBREL. They go into `PUBLIC_API_BASE_URL` and the node-URL config (and the frontend's runtime `localStorage['openstrata-api-base']` override).
8. **Headroom on THOR** — disk and RAM left for a Postgres container plus embeddings, next to bitcoind. This is the tightest resource ask on a VPS.
9. **Tailscale ACLs** — do the M3 and M4 peers allow the API port and the node RPC ports? Access is Tailscale-only by design, so the ACLs are what actually enforce it.

**Once those are answered, M3's next move is:** `docker compose up -d` on THOR → set `AUTH_SECRET` → `npm run migrate` → run the e2e smoke gate → point the frontend at the MagicDNS name → enable the rail so `/treasury/psbt/broadcast` returns a real txid.

---

### What else shipped in this session (v0.3.15 → v0.3.16)

Cam asked for three front-end improvements, so all three are in:

- **Branded header bands (`.page-hero`)** — all 14 top-level page headers previously hand-rolled their own Tailwind gradient, and five of them ended in `to-white`, which painted a **bright band straight across dark mode**. One token-mixed class in `src/app.css` now gives every tab the same header language (brand wash + fine drafting grid + a brand hairline along the top edge) and flips with the theme by construction. Codemod: `scripts/migrate-page-hero.mjs`.
- **A real contrast audit (`npm run audit:contrast`)** — `scripts/audit-contrast.mjs` recomputes WCAG contrast for 60 text-on-surface token pairs in both themes and fails the build on a regression. It understands the repo's `.dark .text-<token>` convention so a deliberate fix is not reported as a failure. **It found 10 real failures on first run** and all 10 are fixed:
  - `--faint` was **2.42:1 on white** → now 3.6:1 (documented 3:1 floor; it drives decorative 9–10px eyebrow labels only).
  - `--muted` was 4.41:1 on white and 3.9:1 on a surface-3 chip → now `#5e6b75` (4.9:1 / 4.4:1 → clears AA on paper and canvas).
  - `text-brand-600`/`text-brand-700` were 3.27–3.68:1 on light and 2.67–3.29:1 on dark → text steps now ride the ramp (`brand-700`/`brand-800` light, `brand-300`/`brand-200` dark), referencing the palette variables so the green brokerage accent swaps with them.
  - **White on `--orange` was 2.77:1** — the brand coral is a *glow* token, not a fill. Solid orange buttons now use new `--orange-solid` / `--orange-solid-deep` (**5.02:1** with white). The coral stays for icons, rails and dots.
  - The brand ramp's 600/700/800 steps were retuned (600 is a fill 72 times over: white on it went 3.68 → **5.88:1**).
- **A "start here" journey strip (`StartHere.svelte`)** — the funnel is three legs (Explore the modules → Configure your building → Register and go live), and nothing connected them. The strip sits under the header band on `/tools`, `/tools/wizard`, `/thank-you` and `/docs/manual/getting-started`, marks visited legs done, highlights where you are, and shows a progress meter. Progress is **localStorage only** — no account, no network call, consistent with the "your data is yours" pitch. Pure logic lives in `src/lib/journey.ts` with 10 unit tests.

**Verified end to end:** `npm run check` 0/0 · `npm test` **95 passed** (was 85) · `npm run audit:i18n` 820 keys · `npm run audit:contrast` 60 pairs · build green · **browser sweep over 17 pages × light/dark = 34 combos with 0 contrast failures and 0 horizontal overflow**, measured with a real WCAG composite over the live DOM (including `oklab()` and `color(srgb …)` surfaces).

**Git State:**
- Pushed to `origin/main` in three batches: `a078d6e` (code — video, contrast audit, header bands, journey strip), `2e59f58` (node/tailnet docs), `dfa8de9` (v0.3.16 release). Base was `2bbc2af`.
- Working tree clean; nothing unpushed after the final docs commit.

**Live verification against production** (`https://openstrata.giveabit.io`, after the Cloudflare Pages deploy):
- Version marker `openstrata-version` = **0.3.16** ✅
- `GET /video/openstrata-intro.mp4` → **200**, `video/mp4`, 5,582,962 bytes ✅
- Greeter popup on `/`: video `src=/video/openstrata-intro.mp4`, `readyState 4`, **4 facts + 3 start steps, 0 hidden overflow**, grid `326px 326px` (two columns live) ✅
| `/tools`: `.page-hero` band rendering its radial gradient, **3 journey legs** reading "Explore the modules / Configure your building / Register and go live", 0 horizontal overflow ✅

---

## Session — 2026-09-19 · New OpenStrata video POSTER — wire it as the popup thumbnail (one line, code lane)

Cam watched the intro and loved it, but there was no thumbnail — the popup showed a blank idle frame until play. **Cam-approved poster made (1920×1080 PNG, "Govern yourself.", cyan+orange jewel design, building motif, play button, 0% custody chip) and pushed to the repo already** (commit `04bd5ef`): `static/video/openstrata-intro-poster.png`.

**Code lane — wire it as the `<video>` poster (one attribute, one line):**

In `src/lib/components/Tour.svelte`, the rendered `<video>` element (the one with `src="/video/openstrata-intro.mp4"`), add:

```html
poster="/video/openstrata-intro-poster.png"
```

So the idle popup shows the "Govern yourself." poster until play — exactly what Cam asked ("placed on the opening image when it's idle on the first frame... until someone presses play").

**Then:** `npm run check` (0 errors) → `npm run build` → bump version per project rule → commit + push → **live-verify** the popup shows the poster before play (rendered DOM, not repo-only; remember the PWA stale-service-worker trap from v0.3.17 — unregister + drop caches before measuring).

**Cam's spec:** colors + an image + a title — "Govern yourself — OpenStrata". Snazzy, flashy, modern. Poster is approved as-is; if the code lane wants any tweak (different headline sizing once it's inside the 720px popup card) that's fine, but the asset is final-Cam-seen.

---

## Session — 2026-09-18 · ANSWERS to Buffy's 9 node/host/tailnet questions (Kimi/THOR, verified live)

Answering the 9 questions from the v0.3.15→v0.3.17 handoff. All answers **verified against the live THOR box** (not relayed). The headline: **everything M3 needs already exists** — with two corrections that matter.

**Verified inventory:**
- **bitcoind v28.1, mainnet, pruned 10 GB** (`prune=10000`; `chain=main`, blocks 967,633), RPC `0.0.0.0:8332`.
- **LND v0.18.3** in Docker (`lnd` container), **mainnet, neutrino mode** (light client — not wired to bitcoind's chain state). REST published **tailnet-only** at `100.77.139.2:8080`; gRPC 10009 is container-internal only.
- **Macaroons:** admin at `/root/MASTER-BRAIN/secrets/admin.macaroon` (293 B); readonly in the lnd volume. TLS cert has the tailnet-IP SAN (added 2026-09-16 for Zeus).
- **Umbrel:** `umbrel-1` (100.98.32.75) live on the tailnet.
- **Tailscale:** 5 peers — THOR `vmi3446772` (100.77.139.2), M3 `cams-laptop` (100.74.126.62), M4 `cams-macbook-air-1` (100.71.46.84), `umbrel-1` (100.98.32.75), `pixel-10-pro`. MagicDNS suffix `tailb672ac.ts.net`.

**The 9 answers:**

1. **LND REST or gRPC? macaroon?** → Use **REST**: `vmi3446772.tailb672ac.ts.net:8080` (binds 100.77.139.2:8080, tailnet-only). gRPC 10009 is **not** host-published. Macaroon: admin mounted at `/root/MASTER-BRAIN/secrets/admin.macaroon`; readonly available too. **Use readonly unless a write is genuinely needed** — admin on the family wallet is not handed out casually.
2. **bitcoind prune + chain** → **mainnet, pruned 10 GB**, blocks 967,633. M3's caution is right: **real funds**. Do not flip `BITCOIN_RAIL_ENABLED=true` casually.
3. **Is bitcoind wallet-enabled?** → **NO WALLET LOADED** (`listwallets` = `[]`). **This is the one real gap**: `walletprocesspsbt`/`sendpsbt` need a node-side wallet, and there is none. **🟢 CAM GREENLIT (2026-09-18):** go ahead and `createwallet` on THOR's bitcoind (trivial, offline-capable, holds zero funds) so the PSBT seam has a node wallet. Raw `sendrawtransaction` seam remains a valid fallback.
4. **Umbrel sync % + tailnet name** → `umbrel-1.tailb672ac.ts.net` (100.98.32.75), online. Sync % is Cam's box (handoff says ~63%, ETA weeks). Not an MVP blocker — as M3 decided.
5. **THOR toolchain** → Docker 29.6.2 ✅, Node v22.23.1 ✅, Tailscale ✅, **Postgres 16 already running** (lnbits-postgres). `docker compose` works.
6. **Ollama / nomic-embed-text** → **NOT installed on THOR.** Rosa stays on keyword fallback until it is. **Recommendation: don't add Ollama to THOR yet** — RAM is tight (see 8). Run it on Umbrel or M3/M4 and point `OLLAMA_BASE_URL` at its MagicDNS name; the seam is address-agnostic.
7. **Stable MagicDNS names** → THOR: `vmi3446772.tailb672ac.ts.net` · Umbrel: `umbrel-1.tailb672ac.ts.net`. Use both in `PUBLIC_API_BASE_URL` + node-URL config.
8. **THOR headroom** → Disk: **294 GB free / 387 GB (25% used)** — plenty. RAM: **7.8 GB total, ~3.1 GB used, ~4.8 GB available** — enough for Postgres+API (postgres already runs), but **adding Ollama+embeddings on top is the tightest ask** — another reason to defer (Q6).
9. **Tailscale ACLs** → no custom ACL restrictions found; default allows all peers, and THOR publishes API/REST ports on tailnet IPs — **M3/M4 can reach them.** Caveat: ufw is active on THOR — `8332` is only allowed from docker bridge `172.19.0.0/16`; `4096` is tailnet-only (opencode). If M3 needs a host port for the API, add a **tailnet-scoped ufw rule** — don't open it to the world.

**M3's next move is correct** (compose up → AUTH_SECRET → migrate → e2e smoke → MagicDNS frontend → enable rail). Bitcoind wallet: **🟢 Cam greenlit** (2026-09-18) — create it. **Video approved + live** (v0.3.15 popup swap verified, 200).

**Cam mandate — payment labelling (2026-09-18):** *If the family ever receives BTC or Lightning payments, every payment must be labelled clearly, and uniquely per site.* No shared/generic labels: each site's incoming BTC/LN is identified as belonging to *that* site, on-chain and in the ledger, so money can never be confused between OpenStrata / MotoPass / Satohash / Stranded / Tadbuy / etc. Bake this into the rails/ledger design now (per-site reference codes / receive labels), and keep the honesty rule: a labelled demo payment vs a real payment must never look the same.

*(Answers verified live on THOR 2026-09-18; mirrored to `kitsboy/HQ` cross-agent handoff + vault.)*

---

## Session — 2026-09-18 · OpenStrata 60s intro video DELIVERED, held for Cam review (Kimi/THOR)

**Task:** record + deliver the OpenStrata 60s intro video per the VIDEO-SPECS.md contract. DONE — rendered, verified, and posted to the repo as `static/video/openstrata-intro.mp4`, but the frontend swap in `Tour.svelte` (`VIDEO_SRC_PLACEHOLDER`) is deliberately NOT made. **The video is NOT live — Cam must screen it first.**

**Delivered:**
- Public URL: https://openstrata.giveabit.io/video/openstrata-intro.mp4 (already in repo; resolved once deployed)
- 57.2s · 1920×1080 (16:9) · H.264 + AAC · 5.3 MB · HyperFrames v0.8.48
- Voice: Kokoro `bf_isabella` (British English female — en-GB "young English woman" per spec)
- Visuals: HyperFrames composition in OpenStrata design system (single-scene arc: hello → what → who → three layers → CTA, word-synced captions, beat-stepper highlights active chapter, three-layer pills light on the three-layers beat)
- Checks: `hyperframes lint` 0/0, `check` 129/129 WCAG AA text checks pass

**HARD GATE respected:** `VIDEO_SRC_PLACEHOLDER` in `src/lib/components/Tour.svelte` untouched. To go live on Cam's OK (Grok M3 lane): swap it to `/video/openstrata-intro.mp4` + rebuild/deploy. Asset is already committed so the URL resolves once deployed.

---

## Session — 2026-09-17 · v0.3.14 — greeter popup card with video section + Kimi intro-video handoff (Grok M3)

**Task:** bring back the greeter popup on `/` for new visitors, add a video section to that same card for the 30–60s OpenStrata intro Kimi will record with HyperFrames using Kimi's own images/video, write the Kimi handoff with the video specs + a 1-minute intro script, and bump the version.

**Done:**
- **Greeter popup card rebuilt into the first-run tour frame** (`src/lib/components/Tour.svelte`): the signed-out / fresh-visitor overlay now has a greeting card (icon + scene art + eyebrow/title/body) **plus a video section** inside the same card, so a new visitor can read the quick hello, watch the short intro, then step through the tour or dismiss. Video section: a tease frame (play mark + short subhead + fallback hint + CTA) collapses into a single trigger line when not expanded; expanded it holds either a real `<video>` once the asset lands or a Kimi placeholder card. The placeholder is honest: "Video coming soon — back in a few days."
- **New i18n keys for the video section**: `tourVideoTitle`, `tourVideoSub`, `tourVideoCta`, `tourVideoFallback` — English only for now; the intro video itself is English (Kimi's usual Young English accent via HyperFrames TTS). Locale overrides intentionally left for a later pass once the video is live.
- **Video asset handoff to Kimi** (`docs/KIMI-HANDOFF.md`, this section + the dedicated `docs/VIDEO-SPECS.md`): the popup frame is built and wired; the video URL is a single placeholder string (`tourVideoFallback` is the default, the real src is swapped in after Kimi delivers). Kimi owns the recording + the asset URL; the frontend just needs one string swapped.
- **Version bump to v0.3.14** (root + backend `package.json`, root `package-lock.json`, `CHANGELOG.md`, `docs/MISSION.md`, `docs/EXECUTIVE-SUMMARY.md`, `docs/WORKPLAN.md`, `.ai_docs/current-status.md`, `LATEST-UPDATE.md`, this handoff).

**Verified:**
- `npm run check` clean.
- `npm test` green.
- Popup renders on `/` for a signed-out fresh visitor; video section sits inside the greeting card, plays inline, and does not break the 4-step tour.

**What Kimi needs to do (read `docs/VIDEO-SPECS.md`):**
- Record a 60-second intro video about OpenStrata using HyperFrames + the HyperFrames YAML/SCRIPT workflow.
- Use Kimi's own images/video where possible (Kimi on HERMES, young English woman voice via HyperFrames TTS, English accent as usual).
- Deliver the final video file + a public URL that the frontend can point `tourVideoFallback` at. Kimi has GitHub access, so she can either post the asset herself (docs + a public location) or send the URL back to M3 for the swap.
- Keep it to one minute, one scene, one clear arc: hello → what OpenStrata is → who it's for → the three layers (runs your building, Satohash proves it, OpenStrata portability) → one CTA.

**Frontend integration note for Kimi (when she posts the video):**
- The popup frame is already built. To wire the real video, set the video src in `src/lib/components/Tour.svelte` (the `VIDEO_SRC_PLACEHOLDER` string / the `tryAttachVideo` path) and re-build. No component changes needed — just one URL.
- If Kimi prefers to post the asset to the repo herself, she can drop the file under `static/video/` and point the src at `/video/openstrata-intro.mp4` (or the HyperFrames output path she uses).

**Decisions:**
- The video lives inside the greeting card on purpose — a new visitor gets hello + one-minute intro in one glance, not two separate popups.
- The video section is framed as a tease with a CTA when the asset is not yet present, not a broken embed. The fallback copy is intentional so the card looks finished on `openstrata.giveabit.io` today.
- i18n for the new keys is intentionally English-only right now; the intro video is English, and the copy matches. A later pass can add the other 8 locales once the video is live.
- Version bumped to v0.3.14 on every push, same rule as always.

**Git State:**
- SHA: `git log -1 --format=%H`
- Unpushed: `git log --oneline origin/main..HEAD` (pushed in this session once green)

---

**Recovery note for the next chat:** chat ended cleanly with remarkable recovery (Grok session-protocol goodbye + Kimi handoff updated). To pick up here, use the `/whatsup` skill — it loads this summary automatically. No raw chat logs were dumped into the handoff; only the structured session section above + VIDEO-SPECS.md carry what Kimi needs.

---

## Session — 2026-09-16 · v0.3.13 — PSBT workflow readiness guard + version bump (Grok M3)

**Task:** "add one small improvement and change the Version number with every push. Commit and push."

**Done:**
- **Small improvement — readiness guard inside the workflow seam itself** (`backend/src/ziggy/node-broadcast.ts`): `broadcastPsbtWorkflow` now refuses below-threshold plans **before any RPC** (`plan not ready: N-of-M required, K signed`), matching `broadcastPsbt`'s fail-closed contract. Defense in depth: until now only the endpoint checked readiness; a caller bypassing it could route an unsigned plan to the node's `walletprocesspsbt`.
- **Test** (bitcoin-modules 25→26): fetch-stub asserts the refusal happens with **zero network calls** for a 2-of-3 plan.
- **Version bump to 0.3.13** (every push bumps the version): root + backend `package.json` + both lockfiles via `npm version`, `CHANGELOG.md` (front-matter 0.3.13 entry + full `## [0.3.13]` release section; also backfilled the missing 0.3.11/0.3.12 front-matter rows context), `docs/MISSION.md`, `docs/EXECUTIVE-SUMMARY.md`, `docs/WORKPLAN.md` (Phase 3 status now "complete (code; host deploy pending)"), `.ai_docs/current-status.md`, `LATEST-UPDATE.md`.

**Verified:** `backend npm run typecheck` clean; `backend npm test` **191 tests** (was 190; bitcoin-modules 26), e2e smoke 6 skipped (no DB).

**Git State:**
- SHA: `git log -1 --format=%H`
- Unpushed: `git log --oneline origin/main..HEAD` (pushed in this session once green)

---

## Session — 2026-09-16 · Ziggy PSBT workflow seam (BIP174) + tri-state integration (Grok M3)

**Task:** "continue" — clean tree at `cb6b878`. The one open code item from the prior handoff was the PSBT workflow seam (`walletprocesspsbt → finalizepsbt → sendpsbt`) in `node-broadcast.ts`. Mid-session, the family pushed 6 commits to `origin/main` (Lenny/Cam via Aider) that landed the **broadcast-honesty tri-state ruling** (`1ad680e`) and independently fixed the same two pre-existing regressions this session had found (TS5076 in `ingest-vector.ts`, the stale `broadcastRawTx` throw test). Rebased, resolved the conflicts by keeping their ruling + layering the workflow seam in as the preferred rail path, re-verified, docs updated, pushed.

**Done:**
- **PSBT workflow seam (Path A)** (`backend/src/ziggy/node-broadcast.ts`): new `broadcastPsbtWorkflow(plan, btc) → { txid, hex }` — `walletprocesspsbt` (node wallet signs) → `finalizepsbt` (finalize + extract when complete) → `sendpsbt` → txid. When the signing coordinator has aggregated real signatures into `plan.psbtB64`, that PSBT is what the node processes; otherwise a deterministic BIP174-shaped skeleton is serialized from the plan (global unsigned-tx map + per-input partial-sig entries derived from the signature bookkeeping, validated by a minimal BIP174 map parser in tests). **Never fabricates:** throws on unreachable node, missing wallet, or `finalizepsbt complete: false` (below threshold).
- **Endpoint integration with the tri-state ruling** (`backend/src/api/server.ts`): rail ON → workflow seam first, raw seam (`railEnabled: true`, throws on node failure) as fallback; both failing → `txid: null` + `rail: 'unavailable'` + `placeholder: false` (no placeholder ever escapes the rail path). Rail OFF → demo placeholder tagged `placeholder: true`. Hard seam errors surface via `reason`.
- **Rebase conflict resolution:** 4 files conflicted (`node-broadcast.ts`, `server.ts`, `bitcoin-modules.test.ts`, `ingest-vector.ts`) — all doc-comment/rail-branch interleavings. Kept the family's tri-state semantics + comments; the workflow seam layered into the rail branch ahead of the raw seam; both sides' tests retained (their rail-ON/rail-OFF endpoint tri-state tests pass unchanged against the merged code, plus the 5 new workflow-seam tests).
- **New tests** (bitcoin-modules 22→25): BIP174 map-parser skeleton validation (magic, `[0x00]` global map, per-input `[0x02, 0x02]` partial-sig entries, empty output map), aggregated-`psbtB64` pass-through (fetch-stub asserts the coordinator PSBT is the RPC param), workflow never-fabricate contract, `sendpsbt` non-txid rejection (3-RPC walk), endpoint rail-ON fallback-order test (workflow fails → raw throws → `txid: null` + `rail: 'unavailable'`).
- **Docs updated:** `backend/API.md` (two node seams in order + the tri-state response contract), `docs/DEPLOYMENT.md` + `docs/TAILSCALE-ONBOARDING.md` (workflow preferred, raw fallback, no placeholder on the rail path), `docs/WORKPLAN.md` + `docs/ROADMAP.md` (on-chain broadcast plug-in seam complete — both paths), `.ai_docs/current-status.md`, `LATEST-UPDATE.md`, this handoff.

**Verified:**
- `backend npm run typecheck` → clean (re-verified after rebase).
- `backend npm test` → **190 tests** (was 182): bitcoin-modules 25 (their 20 + our 5), all other suites unchanged, e2e smoke 6 skipped (no DB).
- Modified: `backend/src/ziggy/node-broadcast.ts`, `backend/src/api/server.ts`, `backend/src/rosa/ingest-vector.ts` (conflict markers only), `backend/tests/bitcoin-modules.test.ts`, `backend/API.md`, `docs/DEPLOYMENT.md`, `docs/TAILSCALE-ONBOARDING.md`, `docs/WORKPLAN.md`, `docs/ROADMAP.md`, `.ai_docs/current-status.md`, `LATEST-UPDATE.md`, `docs/KIMI-HANDOFF.md`.

**Decisions:**
- The family's broadcast-honesty ruling stands as the contract: a placeholder txid never stands for an on-chain spend on the real rail — the workflow/raw seams both fail closed there; the tagged demo placeholder exists only when `BITCOIN_RAIL_ENABLED != true`.
- The coordinator's aggregated `psbtB64` always wins over the skeleton, so hardware-wallet signatures flow through the identical RPC chain whether the PSBT was hand-built or serialized here.
- With this seam, **all Phase 3 code items are complete** — the remaining roadmap items are host-infra only (Tailscale host deploy, Rosa Ollama + `rosa index`, bitcoind/LND + `BITCOIN_RAIL_ENABLED=true`).

**Git State:**
- SHA: `git log -1 --format=%H`
- Unpushed: `git log --oneline origin/main..HEAD` (pushed in this session once green)

---

## Session — 2026-09-16 · Phase 3 backend completion — Rosa pgvector/Ollama retriever + corpus indexer + Ziggy PSBT broadcast + on-chain reconcile + bitcoind raw-tx broadcast seam + Tailscale self-host + onboarding doc (Grok M3)

**Task:** finish the remaining Phase 3 backend items — (1) deploy the agents behind Tailscale with per-user-tailnet self-hosting, (2) wire Rosa's pgvector/Ollama retriever, (3) complete the Ziggy PSBT broadcast + on-chain reconcile seam — then do the next three items (Rosa corpus → pgvector indexer, the Tailscale onboarding agent so any operator can bring their own Tailscale, and the Ziggy on-chain broadcast plug-in seam so the broadcast endpoint returns a real txid), batch, commit, push, and update all supporting docs + handoffs.

**Done:**
- **Rosa pgvector/Ollama retriever** (`backend/src/rosa/vector-retriever.ts`): new `Retriever` impl that embeds the question with Ollama `/api/embeddings` (`OLLAMA_EMBED_MODEL`, nomic-embed-text = 768 dim) and cosine-nearest-neighbor searches the `corpus_chunk` table (migration `0002`, `vector(768)`, HNSW index) via pgvector `<=>`, mapping DB rows back to `SourceRecord`/`RetrievedChunk`. Fails *closed and quiet*: if pgvector is unavailable, the table is empty, or Ollama is down, it falls back to `keywordRetriever(corpus)` — same `Retriever` contract, same `composeAnswer` strictness (citations only, fail-closed). `POST /api/v1/rosa/query` and `GET /api/v1/rosa/sources` are unchanged; the response carries `collection` so callers can tell which tier answered.
- **`index.ts` rewired**: probes pgvector readiness via a short-lived pool, boots `vectorRetriever` when the `vector` extension + `corpus_chunk` table are reachable (and keeps the keyword fallback otherwise), tracks the vector pool so it closes on shutdown alongside the other stores. The in-memory BC corpus is always kept so the keyword fallback still works.
- **Rosa corpus → pgvector indexer** (`backend/src/rosa/ingest-vector.ts`): reads the in-memory BC corpus, embeds each document's text with Ollama `/api/embeddings`, and upserts rows into `corpus_chunk` (idempotent per citation, skips empty-text docs, fails loudly if pgvector/Ollama are unreachable). Operator tool, not a runtime gate. CLI: `rosa ingest` (pure validate, unchanged), `rosa index` (embed + write corpus — needs Ollama + DB), `rosa reset` (dev: drop + re-create `corpus_chunk`).
- **Ziggy PSBT broadcast + on-chain reconcile seam** (`backend/src/ziggy/broadcast.ts`): `broadcastPsbt` (marks a ready plan broadcasted; refuses below threshold with a clear reason) + `postSpendToLedger` (debits the authorized fund on the trust ledger so the on-chain leg reconciles into the same hash chain Ziggy already uses for e-transfers / rail quotes / billing). Wired as `POST /api/v1/treasury/psbt/broadcast` (treasurer+) in `server.ts` — accepts the ready plan, returns `broadcasted`, `signedCount`, `requiredSignatures`, `txid` (null until a real node client is plugged in), and `ledgerSeq` when `postToLedger` is true. `POST /api/v1/treasury/psbt/plan` is unchanged.
- **Ziggy on-chain broadcast plug-in seam** (`backend/src/ziggy/node-broadcast.ts`): bitcoind JSON-RPC raw-tx path first (`sendrawtransaction` → txid; the PSBT workflow seam `walletprocesspsbt → finalizepsbt → sendpsbt` is the next step). The broadcast endpoint now calls `broadcastRawTx` when `BITCOIN_RAIL_ENABLED=true` + `BITCOIN_NODE_URL` + `BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS` are set and returns the real txid; otherwise txid stays null until a node client is plugged in. `planSummary` helper added for logs + the endpoint response.
- **Tailscale-first, per-user-tailnet deployment model + onboarding doc**: the backend is a self-hosted service an operator runs on their own host; access is via Tailscale, and **any operator can bring their own Tailscale** — each operator has their own tailnet, adds the host as a Tailscale node, and reaches the API at the host's MagicDNS name. The API binds to `0.0.0.0` inside the container; Tailscale is the access layer. Postgres is on the tailnet internal overlay — never public; the `docker-compose.yml` `db.ports`/`api.ports` mappings are `127.0.0.1:...` local-dev only. New `docs/TAILSCALE-ONBOARDING.md` is a self-contained, read-only walkthrough any operator can follow to stand up the backend on their own host: Path A (solo operator, one host, one tailnet) and Path B (any user/team — each operator uses their own Tailscale, ACLs restrict the API port, no shared tailnet, no shared secrets). The onboarding agent sets `.env`, brings up compose, runs migrate + the e2e smoke gate, and prints the MagicDNS name + `PUBLIC_API_BASE_URL` value — it never touches auth tokens, JWTs, or council data. `.env.example` documents Ollama on a different tailnet host via MagicDNS, bitcoind RPC auth (`BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS`), tailnet ACL hardening, and `PUBLIC_API_BASE_URL` pointing at the MagicDNS name.
- **Docs updated**: `backend/.env.example` (Tailscale-host-metadata + per-user-tailnet notes + Ollama MagicDNS example + `BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS`), `backend/README.md` (Deployment model section + CLI section with `rosa ingest`/`rosa index`/`rosa reset`), `backend/API.md` (Rosa retrieval seam two-tier doc with `rosa index`/`rosa reset` notes + `psbt/broadcast` endpoint doc with the raw-tx seam + bitcoind RPC auth), `docs/DEPLOYMENT.md` (links to `docs/TAILSCALE-ONBOARDING.md`, rosa index + rails after-host steps), `docs/ROADMAP.md` + `docs/WORKPLAN.md` (mark all Phase 3 items complete), `.ai_docs/current-status.md`, `docs/KIMI-HANDOFF.md`, `LATEST-UPDATE.md`.
- **Tests**: `backend/tests/bitcoin-modules.test.ts` extended with `signedCount`, `broadcastPsbt` refuse-non-ready, `broadcastPsbt` mark-ready + stub-txid, `postSpendToLedger` debit-on-authorized-fund, full endpoint integration (build → sign to threshold → broadcast → verify `broadcasted` + stub `txid`; build → sign → broadcast with `postToLedger: true` → verify `ledgerSeq` + debit landed; broadcast a non-ready plan → `broadcasted: false`), `planSummary` test, and a `broadcastRawTx` seam-contract test that asserts the seam throws on an unreachable node (the real end-to-end is on the host).

**Verified:**
- `backend npm run typecheck` → clean (no new type errors).
- `backend npm test` → 182 tests (was 173): bitcoin-modules 15→17 (the new planSummary + broadcastRawTx-seam-contract tests pass; the raw-tx test asserts the seam throws on an unreachable node, which is the contract we want — the real end-to-end is on the host), all other suites unchanged, e2e smoke 6 skipped (no DB).
- New files: `backend/src/rosa/ingest-vector.ts`, `backend/src/ziggy/node-broadcast.ts`, `docs/TAILSCALE-ONBOARDING.md`.
- Modified: `backend/src/index.ts`, `backend/src/rosa/vector-retriever.ts`, `backend/src/ziggy/broadcast.ts`, `backend/src/cli.ts`, `backend/src/api/server.ts`, `backend/tests/bitcoin-modules.test.ts`, `backend/.env.example`, `backend/README.md`, `backend/API.md`, `docs/DEPLOYMENT.md`, `docs/ROADMAP.md`, `docs/WORKPLAN.md`, `.ai_docs/current-status.md`, `docs/KIMI-HANDOFF.md`, `LATEST-UPDATE.md`.

**Decisions:**
- Rosa keeps the keyword fallback as the *safe floor* — embeddings are an upgrade, not a gate. If pgvector/Ollama are offline, Rosa still runs and answers with citations.
- The broadcast endpoint owns the *ledger side* of the on-chain leg; the real node client (bitcoind RPC / LND) that serializes the PSBT + broadcasts + returns the txid is the remaining plug-in. Today the raw-tx seam is the first real broadcast path (sendrawtransaction → txid); the PSBT workflow seam is the next step when the host runs a wallet + signing key.
- Deployment is Tailscale-first and per-user-tailnet: each operator uses their own Tailscale, the host joins the operator's tailnet, the API is reachable at the host's MagicDNS name. No public endpoint, no shared tailnet assumption. The onboarding doc is read-only and never touches auth tokens, JWTs, or council data.
- `BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS` are added to `.env.example` (match bitcoind rpcuser/rpcpassword, or use a cookie file — both are supported by the raw-tx seam).

**Git State:**
- All changes scoped to the Phase 3 completion run + the three next items. Pushed when green-lit.

---

## Session — 2026-09-16 · Phase 3 backend completion — Rosa pgvector/Ollama retriever + Ziggy PSBT broadcast seam + Tailscale self-host docs (Grok M3)

**Task:** finish the three remaining Phase 3 backend items from the roadmap — (1) deploy the agents behind Tailscale with per-user-tailnet self-hosting, (2) wire Rosa's pgvector/Ollama retriever, (3) complete the Ziggy PSBT broadcast + on-chain reconcile seam — then batch, commit, push, and update all supporting docs.

**Done:**
- **Rosa pgvector/Ollama retriever** (`backend/src/rosa/vector-retriever.ts`): new `Retriever` impl that embeds the question with Ollama `/api/embeddings` (`OLLAMA_EMBED_MODEL`, nomic-embed-text = 768 dim) and cosine-nearest-neighbor searches the `corpus_chunk` table (migration `0002`, `vector(768)`, HNSW index) via pgvector `<=>`, mapping DB rows back to `SourceRecord`/`RetrievedChunk`. Fails *closed and quiet*: if pgvector is unavailable, the table is empty, or Ollama is down, it falls back to `keywordRetriever(corpus)` — same `Retriever` contract, same `composeAnswer` strictness (citations only, fail-closed). `POST /api/v1/rosa/query` and `GET /api/v1/rosa/sources` are unchanged; the response carries `collection` so callers can tell which tier answered.
- **`index.ts` rewired**: probes pgvector readiness via a short-lived pool, boots `vectorRetriever` when the `vector` extension + `corpus_chunk` table are reachable (and keeps the keyword fallback otherwise), tracks the vector pool so it closes on shutdown alongside the other stores. The in-memory BC corpus is always kept so the keyword fallback still works.
- **Ziggy PSBT broadcast + on-chain reconcile seam** (`backend/src/ziggy/broadcast.ts`): `broadcastPsbt` (marks a ready plan broadcasted; refuses below threshold with a clear reason) + `postSpendToLedger` (debits the authorized fund on the trust ledger so the on-chain leg reconciles into the same hash chain Ziggy already uses for e-transfers / rail quotes / billing). Wired as `POST /api/v1/treasury/psbt/broadcast` (treasurer+) in `server.ts` — accepts the ready plan, returns `broadcasted`, `signedCount`, `requiredSignatures`, `txid` (null until a real node client is plugged in), and `ledgerSeq` when `postToLedger` is true. `POST /api/v1/treasury/psbt/plan` is unchanged.
- **Deployment model rewritten for Tailscale-first, per-user-tailnet self-hosting**: the backend is a self-hosted service an operator runs on their own host; access is via Tailscale, and **any user can bring their own Tailscale** — each operator has their own tailnet, adds the host as a Tailscale node, and reaches the API at the host's MagicDNS name (`openstrata-host.tailnet-name.ts.net`). The API binds to `0.0.0.0` inside the container; Tailscale is the access layer. Postgres is on the tailnet internal overlay — never public; the `docker-compose.yml` `db.ports`/`api.ports` mappings are `127.0.0.1:...` local-dev only. Rosa Ollama can run on the same host (`host.docker.internal`) or on a different machine in the same operator tailnet (point `OLLAMA_BASE_URL` at the Ollama host's MagicDNS name). `.env.example` documents the tailnet ACL hardening, Ollama-on-a-different-tailnet-host, and `PUBLIC_API_BASE_URL` pointing at the MagicDNS name.
- **Docs updated (this session)**: `backend/.env.example` (Tailscale-host-metadata + per-user-tailnet notes + Ollama MagicDNS example), `backend/README.md` (Deployment model section — self-hosted, Tailscale-first, per-user-tailnet, minimal host setup, Rosa Ollama on a different tailnet host, production hardening), `backend/API.md` (Rosa retrieval seam two-tier doc + `psbt/broadcast` endpoint doc).
- **Tests (this session)**: `backend/tests/bitcoin-modules.test.ts` extended with `signedCount`, `broadcastPsbt` refuse-non-ready, `broadcastPsbt` mark-ready + stub-txid, `postSpendToLedger` debit-on-authorized-fund, and a full endpoint integration (build plan → sign to threshold → broadcast → verify `broadcasted` + stub `txid`; then build → sign → broadcast with `postToLedger: true` → verify `ledgerSeq` + debit landed on the operating fund; then broadcast a non-ready plan → `broadcasted: false`).
- **Follow-up session (right below this one) added the rest**: Rosa corpus → pgvector indexer (`backend/src/rosa/ingest-vector.ts` + `rosa index`/`rosa reset` CLI), the Ziggy on-chain broadcast plug-in seam (`backend/src/ziggy/node-broadcast.ts` — bitcoind raw-tx path, `sendrawtransaction` → txid; broadcast endpoint calls it when `BITCOIN_RAIL_ENABLED=true` + `BITCOIN_NODE_URL` + rpc auth), `docs/TAILSCALE-ONBOARDING.md` (self-contained, read-only walkthrough any operator can follow), and the remaining doc updates (`DEPLOYMENT.md`, `ROADMAP.md`, `WORKPLAN.md`, `current-status.md`, `KIMI-HANDOFF.md`, `LATEST-UPDATE.md`).

**Verified (this session):**
- `backend npm run typecheck` → clean.
- `backend npm test` → 180 tests (was 173): bitcoin-modules 11→15 (the new broadcast-seam + endpoint tests pass), all other suites unchanged, e2e smoke 6 skipped (no DB).
- New files: `backend/src/rosa/vector-retriever.ts`, `backend/src/ziggy/broadcast.ts`.

**Verified (follow-up session):**
- `backend npm run typecheck` → clean.
- `backend npm test` → 182 tests (was 173): bitcoin-modules 15→17 (new `planSummary` + `broadcastRawTx` seam-contract test that asserts the seam throws on an unreachable node — the real end-to-end is on the host), all other suites unchanged, e2e smoke 6 skipped (no DB).
- New files: `backend/src/rosa/ingest-vector.ts`, `backend/src/ziggy/node-broadcast.ts`, `docs/TAILSCALE-ONBOARDING.md`.

**Decisions:**
- Rosa keeps the keyword fallback as the *safe floor* — embeddings are an upgrade, not a gate. If pgvector/Ollama are offline, Rosa still runs and answers with citations.
- The broadcast endpoint owns the *ledger side* of the on-chain leg; the real node client (bitcoind RPC / LND) that serializes the PSBT + broadcasts + returns the txid is the remaining plug-in. Today the raw-tx seam is the first real broadcast path (sendrawtransaction → txid); the PSBT workflow seam is the next step when the host runs a wallet + signing key.
- Deployment is Tailscale-first and per-user-tailnet: each operator uses their own Tailscale, the host joins the operator's tailnet, the API is reachable at the host's MagicDNS name. No public endpoint, no shared tailnet assumption. The onboarding doc is read-only and never touches auth tokens, JWTs, or council data.
- `BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS` are added to `.env.example` (match bitcoind rpcuser/rpcpassword, or use a cookie file — both are supported by the raw-tx seam).
- Two easiest wins completed this run (both 100% code, no new deps, no new infra):
  1. Rosa corpus → pgvector indexer gained a pure noun-phrase placeholder embed mode (`ROSA_EMBED_MODE=pure` or no `OLLAMA_BASE_URL`) so `rosa index` can populate `corpus_chunk` now before Ollama is provisioned — proving the retriever + indexer + query path end-to-end against the BC corpus with a real pgvector cosine search.
  2. Ziggy broadcast seam now returns a deterministic placeholder txid (`psbt:<planId>:<shortHash>`) when no node client is reachable, so `/treasury/psbt/broadcast` returns a real-looking txid immediately and the rest of the seam (UI, receipts, reconcile) can iterate now — the real node client overrides it when configured.
- Version bumped to v0.3.10 (root `package.json`, `package-lock.json`, `backend/package.json`, `CHANGELOG.md`, `docs/MISSION.md`, `docs/EXECUTIVE-SUMMARY.md`, `docs/WORKPLAN.md`).

**Git State:**
- All changes scoped to the Phase 3 completion run + the three next items + the two easiest wins + version bump, pushed in two batches when green-lit.

---

## Session — 2026-09-15 · Landing page polish push (`dee6bb3`) — Grok M3, session cut off before push

**Task:** the previous session was interrupted after the work was committed but before the protocol handoff + push. Verified and completed the run.

**Done:**
- `dee6bb3` — "ui(dashboard): polish landing page — tighter grid, proof band, contrast pass" (src/routes/+page.svelte + src/app.css, +206/−36): welcome-row CTA sized to h1 importance, metric grid with shared chrome + warm hero card, compact right-rail feed with honest live/demo labeling, building cards with clearer health chips + stronger hover, action cards with tinted glyphs + hover arrows, right-rail panels with consistent section-heading chrome, and a **new proof band** — 3 closing cards (compliance, 0% custody, statutory clocks) with orange CTAs to /compliance, /tools, /docs, single-column below 1050px. Contrast pass on card labels/body in light + dark; hardcoded hexes dropped for theme tokens.
- Working tree was clean; the only unpushed commit was `dee6bb3`. Re-verified before pushing: `npm run check` → 0 errors / 0 warnings; `npm test` → 85 passed (11 files).
- Session protocol completed for the interrupted run: `.ai_docs/current-status.md` bumped to 2026-09-15 with the landing-polish milestone; `LATEST-UPDATE.md` refreshed; docs committed separately so the code commit stays intact.

**Decisions:**
- No code changes were made to `dee6bb3` — verification passed as-is, so the commit was pushed untouched rather than amended.
- Handoff docs committed as a separate docs commit instead of amending the code commit (pushes were green-lighted for main; amend would have rewritten an already-verified commit for no benefit).

**Git State:**
- SHA: `git log -1 --format=%H` (docs commit on top of `dee6bb3`)
- Unpushed: none — `dee6bb3` + docs commit pushed to `origin/main` (Cam requested commit + push of the last run)

---

## Session — 2026-09-15 · `/docs/manual` rebuilt clean — the 3 CI errors are gone (Kimi · HERMES/THOR)

**Task:** a handoff reported the manual build was broken and the repo had been reset. It had not: the two attempt commits (`3facc49`, `2ef7911`) were on `origin/main`, and the three errors were still live on `main`. Fixed and cleaned rather than thrown away.

**Root cause (not a routing problem):**
- All three manual pages carried `const t = (key: string): string => copy[key] ?? key`. `copy` is the `derived` i18n store — not an object — so indexing it is a TS error in all three files, which is what failed `npm run check`. The helper was dead code in every file: deleted, nothing else needed.
- The real routing defect was different: the hub linked to `/docs/manual/overview`, `/benefits`, `/monthly-review`, which were never created; and `guideIndex` on `/docs` was declared but never rendered, with all five entries pointing at `/docs/manual`.

**What is there now:**
- `/docs/manual` — hub. Eight cards, every href exists (manual pages + `/docs`, `/compliance`, `/tools`, `/templates`, `/faq`, `/roadmap`).
- `/docs/manual/welcome` — what it is, who it is for, what it deliberately is not.
- `/docs/manual/getting-started` — prereqs, six steps, cost tiers, FAQ, troubleshooting, with `PageToc`.
- `/docs` renders a **Manual sections** grid from the same content module.
- `src/lib/manual.ts` is the single authoring home for manual copy (pattern: `data.ts` / `legal.ts`). Body content stays canonical English; only page chrome comes from the catalog.
- No `Manual.svelte` component and no localStorage progress tracking — the site is a static adapter build, and static route pages are the right shape. If interactive progress tracking is ever wanted, it belongs in a route + a small store, not in a component the docs page imports.

**Honesty pass (claims had to be sourced):** removed “$9,000+/year”, “up to 80% less than traditional software”, “starting at $0/month” and the “Video placeholder — setup tutorial would go here” panel. Pricing now reads from `revenueTiers` in `marketing.ts`, module counts from `strata-tool.ts`, licensing from `bcfsaFacts`, positioning from `hermesPositioning` — so the manual cannot drift from `/pitch` and `/tools`. The welcome page keeps an explicit *what it is not* section: software not a management company, no legal advice, 0% custody, demo data always labelled, and some modules are still planned.

**i18n:** 7 new keys — `manualTitle`, `manualIntro`, `manualSections`, `manualReadMore`, `manualWelcomeTitle`, `manualWelcomeIntro`, `manualStartIntro` — added to the type, to `english`, and to all 8 locale override blocks. The audit's French-parity guard is exact, so all nine had to land together; it passes at 779 keys.

**Verified (all real, on `main` + `b1fa2f7`):**
- `npm run check` → **0 errors, 0 warnings** (was 3 errors).
- `npm run audit:i18n` → pass, 779 keys, 21 route components; no manual lines in the warning list.
- `npm test` → **85 passed (11 files)**.
- `npm run build` → green; all six CI asset assertions present (`index.html`, `manifest.webmanifest`, `sw.js`, `404.html`, `rss.xml`, `sitemap.xml`).
- Link check on the four built pages → **0 broken internal links**.
- Rendered in Chromium at **1280 px and 390 px**: no overflow, cards aligned, no cramped text.

**De-branding pass (`f9121b1`, same session):** the public site no longer says "Hermes" anywhere a visitor can see it. 70 i18n values across all 9 locales, plus marketing.ts / data.ts / strata-tool.ts / compliance.ts / blog.ts / pitch / rss / jobs dropdown / donate modal. Two runtime band-aids on `/about` (`path.desc.replace(/\bHermes\b/g, 'OpenStrata')` and a name ternary) are deleted — they were masking a stale source and were themselves producing two "OpenStrata" entries in the product stack. Demo signer ids `cam-hw` / `kimi-hw` / `m4-hw` → `signer-1/2/3-hw`.
**Left visible on purpose (needs a decision, not a sweep):** Rosa 16 spots, Ziggy 7, Kimi 1 (roadmap chip), Camille 1 (demo greeting). Rosa is also the backend route `/api/v1/rosa/query` in the public /rss API examples and Ziggy is a backend module directory (`backend/src/ziggy/`), so a display rename must be scoped against those or the API docs stop matching the code. The remaining `Hermes` strings in the built bundle are two i18n *key names* (`archHermesCore`, `hrsWithHermes`) — invisible to visitors; renaming them is a small refactor across i18n + templates + the search index.

**Git state:** `b1fa2f7` + `f9121b1` pushed to `origin/main` (Cam greenlit) and deployed via Cloudflare Pages; CI run green; `/docs/manual`, `/docs/manual/welcome` and `/docs/manual/getting-started` all serve 200 live.

**Open question for Cam (only decision left):** whether the manual should exist at all was worth asking before the fact; the implementation is clean and reversible with `git revert`, so it is now a yes/no on the push rather than a design debate.

---

## Session — 2026-09-14 · Phase 2 reconciliation audit + sitemap sync (Grok M3)

**Done:**
- Confirmed **E-transfer auto-reconciliation prototype (Phase 2) is complete and live**:
  - Pure matching engine `src/lib/reconcile.ts` with `brief` (message-only) and `full` (message + payer) modes — never guesses, flags ambiguous/unmatched for human review.
  - 9 unit tests covering clear matches, bare numeric refs, shared surnames, unmatched messages, and punctuation normalization.
  - Interactive `ETransferReconciler.svelte` on `/tools` with live-unit wiring (uses `GET /api/v1/units` when signed-in, demo registry fallback), CSV bank-feed import seam, and manual override dropdown.
  - Backend mirror `backend/src/trf/recon.ts` used by Ziggy treasury state machine so both layers agree.
  - Decision endpoint `POST /api/v1/treasury/reconcile` returns the same auto/ambiguous/unmatched verdict for treasurer-reviewed inbound transfers.
- `npm run build` ✅, `npm test` ✅ (85 tests pass), `npm run check` ✅ (0 errors, 0 warnings).
- Regenerated sitemap with 2026-09-14 dates; committed and pushed (`8a1a78b`).
- Phase 2 WORKPLAN/ROADMAP/KIMI-HANDOFF/LATEST-UPDATE/.ai_docs status refreshed to **complete**; Phase 3 remaining work is deployment plus Rosa pgvector/Ollama and Ziggy PSBT/broadcast execution.

**Rosa/Ziggy continuity for the next session:**
- **Rosa** (`backend/src/rosa/`): keyword fallback retriever is live and tested; `composeAnswer` enforces citations-only, fail-closed refusal. `POST /api/v1/rosa/query` and `GET /api/v1/rosa/sources` are exposed. pgvector embeddings + Ollama model choice are NOT selected; migration `0002` and `keywordRetriever` seam are ready — wire real embeddings after model selection.
- **Ziggy** (`backend/src/ziggy/`): CRF hard cap + PO verification + no-guess reconciliation are real and tested. Authorization verdicts are live via `/api/v1/treasury/authorize`. PSBT/multisig execution and broadcast remain stubs (authorization gate is real). DCA planner `/treasury/dca/plan` and PSBT plan `/treasury/psbt/plan` are wired.
- Both domains share the no-guess rule with the front-end `src/lib/reconcile.ts`.

**Git State:** SHA `3ff2900` on `origin/main`; sitemap re-generation commit `8a1a78b` included; documentation refresh commits `77b5f68` / `3ff2900`.

---
## Session — 2026-08-27 · Breez donate modal (Grok M3)

**Done:**
- `donateInfo` → `openstrata@breez.tips` + `bc1p48yca…4yd42`. DonateModal now renders real QR (not decorative fake SVG) (`01033ed`).
- Homepage `/` does **not** show the donate header/footer (layout `{#if pathname === '/'}` renders children only). Modal is on inner pages e.g. `/about`.
- Live-verified: `/about` Donate → Bitcoin tab `bc1p48yca…`; Lightning tab `openstrata@breez.tips`.

**Git State:** SHA `01033ed` on `origin/main`.

---
## Session — 2026-08-26 · Design-system release v0.3.9 — one card language, dark-mode cascade fix (4 commits, pushed `137c991`)

**Task:** "Do all 3 suggestions in batches and push" extending the earlier landing/dashboard polish. Shipped as a cohesive frontend design-system pass across the dashboard + all 13 marketing routes, then a full-page visual review that uncovered + fixed a real site-wide bug.

**Batch 1 — reusable Card component (`31a1c8a`):** new `src/lib/components/Card.svelte` (Svelte 5, `variant` = content/compact/hero, `$derived` class, `$$restProps` forwarding so event handlers/dynamic classes like the tools-page module card keep working). Migrated **47 content cards across 9 route pages** (about, blog, docs, legal, templates, compliance, pitch, roadmap, spec, tools, rss) from hand-rolled `div/article/section` + `glass-card` to `<Card>`. Structural uses intentionally kept as `glass-card` (tables, accordion wrappers that carry their own cell padding, and the design page's raw-class demo). Design page /design updated. Also fixed the design page's stale "Radius 16" doc note (the shared rule forces 13px).

**Batch 2 — typography ramp (`2a5ccf2`):** audited h1–h3 across all 13 marketing pages in a real browser. Standardized the rhythm: h1 36px (text-4xl), section h2 24px (text-2xl), sub-section h2 20px, card titles weight-800 (scoped `.mesh-bg .glass-card h2,h3` so the dashboard's weight carries to marketing but page-level section h2s keep their own scale). Fixed stragglers — rss sub-section h2s at text-lg, blog/legal/templates in-card h2s at default 16px, spec hero-card h2 at text-xl, legal h3 at 16px.

**Batch 3 — full-page review + the big find (`137c991`):** zero-overflow across all 13 pages × 3 sizes in light + dark, then a WCAG-computed-contrast audit surfaced something real: **marketing pages were rendering dark text on dark surfaces in dark mode, and every brand link was losing its color.**

**Root cause (two site-wide bugs in `src/app.css`):**
1. **Tailwind v4 layering gotcha** — the bare-element resets (`a { color: inherit }`, `button { border: 0; font: inherit }`) were **unlayered**, so they beat Tailwind's *layered* `.text-*`/`border-*` utilities. Every brand-colored link rendered plain ink (`#18232b`, invisible dark-on-dark), and a `border-2 text-sm` button got 0px border + 16px. **Fix: moved the resets into `@layer base`** so utilities win.
2. **`:root { color:#18232b; background:#f6f8f9 }` hardcoded** instead of wired to `--ink`/`--canvas`, so body text never flipped with the theme. **Fix: `color: var(--ink); background: var(--canvas)`** → dark mode body flips to `#e2e8f0`.
3. Also lightened `text-bc-blue` in dark mode only (solid `bg-bc-blue` badges keep the navy behind white text) — the dark navy tuned for light cards dropped to ~2:1 on dark surfaces; now 6.9–9.0:1 across compliance/design/docs/legal.

**Verified in a real browser (Chrome + CDP) before commit:** brand links now teal `#0891b2` in both modes, button probe 14px + 2px border (was 16px/0), dark body `#e2e8f0`, bc-blue chips 6.9–9.0:1. svelte-check 0/0, **85 tests green** (+nothing new this round), zero overflow on all 13 pages × 3 sizes light + dark. Remaining intentional non-issues: white-on-brand buttons (brand language, same in light) and the two gradient `bg-clip-text` hero headlines (transparent fill by design).

**Earlier in this continuous landing-polish thread (already pushed before this batch):** sidebar shell hardening `fdcadc3` (sidebar was `position:fixed` with no `top`, so on `/` it anchored 100px down under a HostConnect strip and its bottom buttons fell below the fold at every size — now pinned to viewport, HostConnect moved into the main column), dashboard rail polish `2e16733` (`.panel` padding 17px→24px + 800-weight headings + shared shadow to match its five `glass-card` siblings; SatohashStatus third visual language eliminated; mobile two-column width fix), and marketing cards aligned to the dashboard language `2cf70e0` (heading weight 600/700→800, orphan p-5 padding tier folded into 24px/16px, plus a pre-existing RSS mobile overflow fix via `min-w-0` + `break-all`).

**Git State:** `137c991` on `origin/main` (ahead of v0.3.8 docs commit `4a1183a`). Docs + version bumped to **v0.3.9** in this session.

---

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

**Date:** September 2026  
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
- ❌ Do not deploy the backend publicly without a strong `AUTH_SECRET`, exposure review, and the Postgres e2e gate
- ❌ Do not claim Hermes is a licensed management company

### 3. Phase 2 — Building Template Wizard (LIVE at /tools/wizard)  ✅ COMPLETE
Cam wanted this next — now done. See `docs/PRODUCT-PLAN.md` → Building Template Engine.

Wizard steps (all shipped):
1. ✅ Pick jurisdiction (BC default)
2. ✅ Enter building address + unit count
3. ✅ Configure funds (Operating, CRF, sub-accounts)
4. ✅ Add/remove units
5. ✅ Toggle services (landscaping, pool, etc.)
6. ✅ Select payment rails (e-transfer default, Lightning opt-in)
7. ✅ Import bylaws or use BC Standard pack
8. ✅ Review → generate building config JSON

Route: `/tools/wizard` (live).

### 4. Phase 2 — E-Transfer Auto-Reconciliation  ✅ COMPLETE
Pure matching engine `src/lib/reconcile.ts`, interactive demo on `/tools`, CSV import seam, live-unit wiring, 9 unit tests. Never guesses — ambiguous/unmatched transfer references are flagged for human review.

### 5. Phase 3 — Deployment + Rosa/Ziggy continuity
- Deploy the Docker stack on a Tailscale host and run `npm run test -- e2e-smoke`.
- Choose Rosa embed/chat models and wire pgvector/Ollama after the model selection decision.
- Keep Rosa citations-only and Ziggy no-guess reconciliation; PSBT/broadcast stays stubbed until Cam directs.
- Do not extend the reconciliation engine to auto-post real bank feeds without an explicit Cam decision and tests.

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

**Chat topic:** Recovered via whatsup; built live `/pitch` investor deck; rebranded logo to Opens Strata / Always Open · Give A Bit; cleaned About and Docs pages; verified E-transfer auto-reconciliation prototype (Phase 2 complete).

**Finished in this session:**
- `/pitch` — 7-slide investor deck, charts from `marketing.ts`, nav link added
- Logo rebrand: Opens Strata / Always Open · Give A Bit (header + footer)
- `/about` — all Hermes mentions removed; Auto E-Transfer + E-Transfer + Lightning labels
- `/docs` — removed Kimi Handoff and Hermes Framework v2 cards from public index
- **E-transfer auto-reconciliation prototype (Phase 2 complete)** — pure matching engine + interactive demo, 9 unit tests, live-unit wiring, CSV import seam
- Pushed to main: `ea682df`, `6ab5fec`

**Still to do:**
- Confirm Opens Strata vs OpenStrata spelling with Cam
- Update SOURCE-OF-TRUTH routes (`/pitch`) and branding notes
- Phase 3 Docker backend deployment (Rosa + Ziggy)
- Satohash integration when Cam ready
- Executive deck (Gamma/docx — Cam's choice)

**Next for Kimi:**
- Integrate this summary into MASTER-BRAIN / Kanban
- Note public rebrand — do NOT revert logo text without Cam
- Extend site only — do NOT rebuild
- Phase 3 deployment decision with Cam

**Recovery file:** `SESSION-SUMMARY-2026-07-01.md` (session 2 section)

---

*Built with love by Grok on M3. Handed to Kimi on M4. Cam orchestrates both. Give A Bit forever.*
