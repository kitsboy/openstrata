# openstrata — Last Updated 2026-10-29 by Buffy — the cash statement with its chain

Commit: this commit (site `0.3.55`). Backend API version stays `0.3.28`.

> **The cash statement with its chain, picked from the 29 October queue.** The Journal tab on `/accounting` now prints the operating account as a page a council files: the account on the letterhead, the opening balance, every entry with its movement, running balance and hash, the closing balance, and the chain head. It is the book's own figure — **$59,145.60** opening, **$22,652.02** moved, **$81,797.62** closing, the operating cash the overview and the Three funds tab report.
>
> **`src/lib/cash-statement.ts` holds the rules, with 11 tests, and two of them decide the sheet.** The statement is **one named bank account** — `1010` operating — because a statement that ran on both bank accounts would answer a question nobody files, and the reserve already has its five-year page. But **every entry in the journal prints**, including the five that did not move this account: a hash covers its entry and the hash above it, so dropping a row would break every hash below and tell a reader the chain is unbroken while making it impossible to check. Those rows print a dash and leave the balance alone.
>
> **The rest is arithmetic a reader can add up.** The opening balance is the closing less what the journal moved, so the printed column lands on the printed closing instead of trusting a typed opening: four of the nine entries moved this account — the September fee cash **+$22,347.00**, October's prepaid fees **+$1,614.60**, the war chest **−$405.00** and the concierge payroll **−$904.58**. The operating opening (**$59,145.60**) and the reserve opening (**$599,642.40**) add back to the journal's own combined opening (**$658,788.00**), which is the check that no bank account was forgotten. A stopped month keeps the same opening and folds nothing back, and a month before the journal begins prints only the reason there is nothing to chain.
>
> **`CashStatement.svelte`** carries the letterhead and reference block (fiscal year, statement date, account code), three summary figures — opening, movement with **4 of 9** entries on this account, closing — a five-column table with each hash printed under its memo in mono, the closing row, the tie (or the stopped-month note), the basis (**1020** reserve and the parkade levy are separate funds; **1080** war chest at cost is not cash) and the chain head from the genesis link. The Journal tab's intro, opening and closing lines, screen table and chain note are `no-print`; the drawer still opens on screen, and a `?tab=journal#entry-<hash>` link still lands on its row.
>
> **`src/app.css`** adds `.cash-doc` to the **176 mm** print rule with a **4 mm gutter**, like the arrears ladder, because its last column is right-aligned and the last glyph would otherwise sit on the sheet's edge.
>
> **Verified:** frontend **657 passed** across 69 files (16 new: 11 rules, 5 accounting route), `check` **0 errors / 0 warnings**, translation audit **1,612 keys × 9 locales** (16 new) across 35 route components, secret gate green, production build green. Printed and measured in Chrome: **one Letter page**, the sheet **176 mm** wide inside the page box, **695.52 px** of the **927 px** a Letter page holds, `.no-print` measured `display: none`, and the nine entry hashes plus the chain head in the printed DOM.
>
> **The queue is refreshed, because the pick shipped.** **A reconciliation sheet for the close** (`/accounting`) takes the slot beside a levy statement of its own, the budget in the reader's language and the Form K register in the package, so four are waiting.

---

# openstrata — Last Updated 2026-10-29 by Buffy — the arrears ladder on paper

Commit: this commit (site `0.3.54`). Backend API version stays `0.3.28`.

> **The arrears ladder on paper, picked from the 29 October queue.** The Receivables tab on `/accounting` now prints one page for the table: the lots with money past due, each charge in the column its age earns, the columns added up, the Form F flag, and one line that accounts for every other lot. The page is the books' own — **$6,499.00** past due across **3 of 40 lots**, the same figure the cards above carry.
>
> **`src/lib/arrears-sheet.ts` holds five rules, with 10 tests, and the first decides the sheet.** The ladder is the lots **past due**, not every lot that owes. On the close, **33** of the 40 lots owe only next month's fee. That fee is real money and it is not arrears, and printing 33 rows of it would bury the three lots a council actually acts on. So the sheet prints **207, 104 and 309**, adds its columns to **$8,506.00**, and states the rest of the book in one line: **$6,499.00** past due, **$2,007.00** more of the same lots' next fee, **$23,130.00** not yet due on the other lots, **$31,636.00** standing in all.
>
> **The rest of the rules are the ones a reader can check.** The columns add to the printed total rather than to a second computation. “Current” is carried as its own column, because money owed is not money overdue — lot 207's **$666.00** October fee sits beside its **$5,700.00** of late money. A plan balance is a schedule, not overdue debt, so lots **108** and **403** are named under the table with **$1,800.00** and **$2,700.00** standing and never aged into a bucket. And the sheet is built from every lot, so the screen's “past due only” toggle cannot change a printed total.
>
> **`ArrearsSheet.svelte`** carries the letterhead, the statement date, three summary figures — past due, past due over 90 days at **65%** of it, and the **322-day** levy on lot 207 — then the eight-column table (owner under the lot, a dash in every empty cell), the plans list, the clear-lot count, the basis and the sample line. The cards, the filter, the ladder, the ⚠️ plan block and the note stay on screen; the header and the period banner come off the paper on that tab, as they do on the budget's.
>
> **One print defect was found by printing it.** The sheet's right-hand column is right-aligned — the letterhead's dates, the totals, the plan amounts — so without a gutter the last glyph landed on the sheet's edge: the page showed **“September 30, 202”** and **“payment plan”** clipped. `.arrears-doc` now carries a **4 mm gutter** inside its 176 mm and every character is on the paper.
>
> **Verified:** frontend **641 passed** (16 new: 10 sheet rules, 3 sheet component, 3 accounting route), `check` **0 errors / 0 warnings**, translation audit **1,595 keys × 9 locales** (12 new) across 35 route components, secret gate green, production build green. Printed and measured in Chrome: **one Letter page**, the sheet **176 mm** wide inside the 187.9 mm page box, **537 px** of the **927 px** a Letter page holds, no descendant past its right edge and no clipped cell. The April book (`?period=2026-04`) prints its single levy row on one page at 474 px.
>
> **The queue is refreshed, because the pick shipped.** **A cash statement with its chain** (`/accounting`) takes the slot beside a levy statement of its own, the budget in the reader's language and the Form K register in the package, so four are waiting.

---

# openstrata — Last Updated 2026-10-29 by Buffy — a package a council prints once, filters that stay put, and the why beside the variance

Commit: this commit (site `0.3.53`). Backend API version stays `0.3.28`.

> **Three picks from the 29 October queue, shipped together, and all three are about a page or a place a reader comes back to.**
>
> **The AGM package in one print (`/documents`).** The year's sheet, the meeting packet and the reserve plan were three print buttons on three pages. `/documents` now prints them as one stack: a **contents page**, then the year's sheet, the packet and the new reserve sheet, **each on its own page**, in the order the contents page names. `?package=1` opens the stack and the package button prints it; a document picked from the picker leaves the package mode, because a pick is one document and not a set. The stack is assembled from the records the other pages read — the year's sheet is `buildYearSheet(yearBook)` with the same six health points the dashboard's trend drew, and the packet is the component `/meetings` prints — so the package cannot disagree with the pages it replaces.
>
> **`ReserveSheet.svelte` is the reserve fund on paper.** Five fiscal years with the opening balance, the budget's contribution, the interest the credit union actually paid, the projects the depreciation report schedules and the closing balance, then the year that runs short and the four notes. It reads `reservePlan(reservePicture.input)`, the same call the Reserve plan tab makes.
>
> **Filters that stay put (`/units`).** The search, the tone filters and the floor are kept on the device and restored when a reader comes back from a lot's sheet; **one button clears all three** and removes the record. `src/lib/unit-filters.ts` (10 tests) holds three rules: only a readable filter is restored and **one part at a time** (an unknown tone must not also cost the reader their search); **nothing is stored when nothing is filtered**, so a reader who never filtered leaves no trace; and a saved query is trimmed and bounded at 80 characters. A `?tone=` link still wins, because a dashboard activity that names the arrears means the arrears.
>
> **The budget's reasons, beside the variance (`/accounting`).** The sheet said how far each line sits from plan; it now says why, in a phrase beside the amount — the concierge's **1 September** start, the fire inspection on **8 October**, the **parkade gate motor**. `src/lib/budget-sheet.ts` holds the rule: a reason belongs to a variance that exists, so a line exactly on plan and the reserve contribution drop theirs rather than suggesting a move that did not happen.
>
> **Verified:** frontend **625 passed** (28 new: 10 filter rules, 6 units route, 5 documents route, 5 budget reasons, 2 accounting route), `check` **0 errors / 0 warnings**, translation audit **1,583 keys × 9 locales** (7 new) across 35 route components, secret gate green, production build green. Printed and measured in Chrome: the budget is **905px** inside a **927px** Letter page and comes out as **one page**; the package comes out as **four pages** (year 875px, packet 893px, reserve 526px, contents 486px) with nothing past the sheet's right edge.
>
> **Printing the reasons cost the budget its page and got it back.** Fifteen candidate reasons pushed the sheet to 1,075px and two pages, so the rows were set at 1.18 leading with half a pixel of padding, the reason prints at 6.2pt italic, and the list was cut to the eight lines a council is actually asking about. A sheet that loses its second page to a phrase is a sheet that prints its reasons and its totals — not both.
>
> **The queue is refreshed, because the picks shipped.** **A levy statement of its own** (`/accounting`), **the budget in the reader's language** (`/accounting`), **the Form K register in the package** (`/documents`) and **the arrears ladder on paper** (`/accounting`) are waiting, so four are — again.

---

# openstrata — Last Updated 2026-10-29 by Buffy — a budget that prints, and the year's deadlines on one page

Commit: this commit (site `0.3.52`). Backend API version stays `0.3.28`.

> **Two picks, shipped together, and both of them turn a screen into paper a council keeps.** The Budget tab on `/accounting` is now the page a council reviews at the table: every income and expense line with its annual budget, the year to date, what is left and the variance, then the reserve contribution and the result — **$0.00** budgeted for the year, **$15,878.32** to date and **$15,878.32** over plan, which is the books' own surplus.
>
> **`src/lib/budget-sheet.ts` (13 tests) holds four rules, and each one is a decision.** The plan to date is the annual figure pro-rated to the six months the books cover — **50%** of every line — because nine months of actuals against twelve months of plan would make every line look under, and a variance nobody can trust is worse than no column. Variance is always the year to date less the plan to date, so the sign means one thing on every row and only the verdict changes with the side of the page: spending over plan and income short of plan are unfavourable and print bold. The reserve contribution carries no verdict — a fund ahead of its contribution is a council decision, not a slip. And the result is the three groups added rather than a fourth division, so a reader who adds the page up lands on the printed surplus.
>
> **`/calendar` gains the fiscal year on one sheet.** Twelve month rows of real days (**February 2027 has 28 cells**), the payroll window as a bar across each month's 1st to 15th, the EPR and SVT windows shaded, the T2 and T4 deadlines as dark cells, and a dot on all **18** dated items. `src/lib/year-calendar.ts` (13 tests): a window keeps its own dates when the grid cannot hold it — the EPR opened **1 January** and only **275 of its 365 days** fall in this fiscal year, which the sheet states rather than shortening the rule to fit; the monthly rhythm is detected from the data (a title, or a category-and-day, repeating in six or more months) so the fee run, late fee, council meeting, reconciliation and remittance are left out; and nothing dated is dropped — the **AGM window (1 April – 31 May 2027, 61 days)** is drawn on its own two-month strip below the year, with the six items after 31 March under it.
>
> **Verified:** frontend **597 passed** (37 new: 13 budget rules, 13 year-calendar rules, 7 calendar route, 4 accounting route), `check` **0 errors / 0 warnings**, translation audit **1,576 keys × 9 locales** (46 new) across 35 route components, contrast audit **218 pairs**, secret gate green, production build green. Both sheets printed to **Letter PDFs in Chrome and read back at page size**: one page each, the sheet held to **176 mm**, no horizontal overflow, and the year sheet's item columns aligned.
>
> **Two print defects were found by making the paper and measuring it, not by reading the code.** The budget sheet ran onto a second page at 8.4pt with 43 rows, so the table is set at 7.2pt with tighter rules; and on a phone the five money columns clipped their own amounts, so the sheet scrolls its table inside itself at a **560px** floor while the print rules restore full width — measured at 390, 620, 900 and 1280 with no page overflow and no clipped cell.
>
> **The queue is refreshed, because the picks shipped.** **The budget's reasons, beside the variance** (`/accounting`) and **a levy statement of its own** (`/accounting`) take the two slots beside the AGM package and filters that stay put, so four are waiting.

---

# openstrata — Last Updated 2026-10-29 by Buffy — a receipt you can hand over, and a search that reaches the building

Commit: this commit (site `0.3.51`). Backend API version stays `0.3.28`.

> **Two picks, shipped together, and both of them open a record a reader could not reach.** `/pay` prints one payment per page on the council's letterhead: the amount received, who paid, the lot, the rail, the reference, the transaction where the rail has one, the rate a bitcoin payment locked at with the sats that rate bought, and the fee's own split. Lot 305's September fee is **$576.00** — **$499.20 operating** and **$76.80 reserve** — settled on Lightning at **$135,820** a bitcoin for **424,091 sats**. The newest payment is picked on arrival, so the print button always yields a real page, and the paying sheet and the tape carry `no-print`.
>
> **`src/lib/pay-receipt.ts` (9 tests) holds three rules, and each one is a decision.** The split is cross-multiplied from the amount with the remainder to the reserve, so the parts always add back — a receipt a cent out is one an owner will query. A transaction id belongs only to a rail that carries one, so a txid recorded against a cheque is dropped rather than printed. And a locked rate is quoted from the payment's own record and never recomputed: a receipt that re-priced an old payment at today's rate would state a number nobody paid, so a bitcoin row with no recorded rate says exactly that instead.
>
> **The search index grows from ten groups to thirteen.** **40 lots**, the journal's **9 entries** and the tax desk's **13 sections**, each result opening the row it names: `/units/305` for a lot (by number or by owner), `/tax#gst` for a section, `/accounting?tab=journal#entry-<hash>` for a journal entry. That last one needed the page to read its tab and an entry hash from the URL and open that drawer, and the opening-cash subtraction to move into `ledger-statement` — the index and the page must chain the same hashes, and a second copy of that arithmetic would have produced links to entries that do not exist. The sitemap grew to **70 routes** because the 40 lot pages are real pages.
>
> **Verified:** frontend **560 passed** (25 new: 9 receipt rules, 6 receipt sheet, 3 pay route, 4 search index, 3 accounting link), `check` **0 errors / 0 warnings**, translation audit **1,528 keys × 9 locales** (15 new) across 35 route components, contrast audit **218 pairs**, secret gate green, production build green with the receipt in `build/pay.html`. The receipt printed to a Letter PDF in Chrome and read back at page size: one page, the sheet held to **176 mm**, no horizontal overflow, and the tape gone from the paper.
>
> **The queue is refreshed, because the picks shipped.** **The AGM package in one print** (`/documents`) and **filters that stay put** (`/units`) take the two slots beside the budget that prints and the year's deadlines on one page, so four are waiting.

---

# openstrata — Last Updated 2026-10-28 by Buffy — a year on one page, and the AGM packet to hand out

Commit: this commit (site `0.3.50`). Backend API version stays `0.3.28`.

> **Two picks, shipped together, and both of them are paper.** The dashboard now ends in an annual sheet for the AGM package: income and spend by category with their totals and budget column, the three fund balances at the September 30 close, the compliance score from **April 2026's 82 to September 2026's 56**, and every tracked item with its date and day count. The three funds add to **$81,797.62 + $603,688.80 + $31,548.00 = $717,034.42** — the figures the funds tab reports — and the sheet says **down 26 points since April** because that is what the trend above it drew.
>
> **Every figure is read from the books, never retyped.** `src/lib/year-sheet.ts` (9 tests) groups the ledger's own lines by account code. A code no category claims is reported as **unmatched** and left out of the rows, so a new account code is a visible defect rather than totals that quietly disagree with `/accounting`. The operating surplus is income less spend and **never nets the CRF contribution**: a dollar moved to the reserve is still the owners' money, and counting it as an expense would make the year look poorer than it is. An item is open until its date passes and is **counted as overdue** after, not removed — the page a council signs should not lose the item it missed.
>
> **The score is passed in, not recomputed.** The dashboard hands the sheet the same six points its trend drew, so a Form K recorded on a lot's own sheet reaches the printed page and the gauge together, and the sheet cannot print a score the page above it is not showing.
>
> **`/meetings` prints a packet instead of a workspace.** Notice, agenda, last minutes and the quorum maths on one page: the council meets **20 October 2026**, notice due **13 October** — **7 days ahead of the meeting**, inside the **7-day window** — quorum **3 of 5**, and the annual meeting that follows on **May 19, 2027** at **14 of 40**. `src/lib/meeting-packet.ts` (5 tests) computes the last lawful day from the statutory window, treats a notice given inside the window as **late** rather than rounding it up, and reads quorum as a majority of the seats as whole people — **3 of 5**, and also **3 of 4** — because a floor of half plus one is the only reading that never asks for fewer people than a majority.
>
> **Two print defects were found by making the paper and looking.** The `@page` box already carries the 14 mm margin and the app kept its screen gutters on top of it, so the annual sheet ran onto a **second, blank sheet**; the print block now zeroes the shell's width, margin and padding and the year page's controller sits outside the sheet. And a sheet held to **176 mm** was still clipped on the right, because a table's min-content width is a floor: two score tables side by side pushed past the paper and the last column was simply gone. `minmax(0, 1fr)`, `min-width: 0` and `table-layout: fixed` wrap the cells instead. The host-connect row, skip link, install chip and offline banner joined the `no-print` list.
>
> **Verified:** frontend **535 passed** (27 new: 9 annual rules, 5 packet maths, 5 sheet, 5 packet, 3 route), `check` **0 errors / 0 warnings**, translation audit **1,513 keys × 9 locales** (52 new), contrast **218 pairs**, secret gate green, production build green with the annual sheet in `build/index.html` and the packet in `build/meetings.html`. Both pages printed to A4 PDF in Chrome and read back at page size.
>
> **The queue is refreshed, because the picks shipped.** **A budget that prints** (`/accounting`) and **the year's deadlines on one page** (`/calendar`) take the two slots beside the receipt and workspace search, so four are waiting. Recorded in `docs/ROADMAP.md`, `/roadmap`, `static/llms.txt`, `WORKPLAN.md`, `docs/WORKPLAN.md` and `.ai_docs/current-status.md`.

---

# openstrata — Last Updated 2026-10-28 by Buffy — the reserve fund, five years out

Commit: this commit (site `0.3.49`). Backend API version stays `0.3.28`.

> **A new Reserve plan tab on `/accounting`, and it can say no.** Five fiscal years of the CRF: opening balance, the budget's contribution, the interest the credit union actually paid, what the depreciation report schedules, and the balance each 31 March ends on. **2026–27** opens at **$586,400.00** and closes at **$627,675.52**; the report's boiler, elevator and envelope are covered; the **2031 roof leaves the fund $133,291.62 short**, so that is the sentence above the table.
>
> **Four rules, each a decision.** `src/lib/reserve-plan.ts` (9 tests). The contribution is the budget's **$43,200**, never the report's recommended **$48,000** — the page states the **$4,800-a-year** gap rather than drawing a fund the building does not have. Interest is **0.74%**, the rate the six months of statements actually paid, on the average balance; a year that ends below zero earns nothing. A project named for a calendar year is paid in the fiscal year that ends in it, so the report's 2029 elevator lands in **2028–29**, not a year early. And the parkade membrane stays out: the levy collected and spent its **$216,000** in its own trust, so counting it here would double-count money that never entered the fund.
>
> **The page shows its working.** The report (RJC, dated 12 June 2024, next due 12 June 2029), the rate and the months it is measured over, the contribution gap, and the levy's exclusion all print under the table, so a reader can check the projection against the documents it came from.
>
> **The tab bar no longer prints.** Seven tabs had no `no-print`, so every printed tab of the books opened with a row of navigation buttons. Printing from Reserve plan now yields the page header and the table alone.
>
> **Verified:** frontend **508 passed** (13 new: 9 reserve rules, 4 route), `check` **0 errors / 0 warnings**, translation audit **1,461 keys × 9 locales** (17 new), contrast **218 pairs**, secret gate green, production build green with the **Reserve plan** tab in `build/accounting.html` and `v0.3.49` stamped; changelog regenerated (52 releases with notes). The table itself is behind the tab, so it is exercised in jsdom by the four route tests rather than in the prerendered HTML. Chrome was not opened this session.
>
> **The queue is refreshed, because the pick shipped.** A year on one page (`/`) takes its slot beside the receipt, workspace search and the AGM packet, so four are waiting. Recorded in `docs/ROADMAP.md`, `/roadmap`, `static/llms.txt`, `WORKPLAN.md`, `docs/WORKPLAN.md` and `.ai_docs/current-status.md`.

---

# openstrata — Last Updated 2026-10-28 by Buffy — the Form K register, on one printable page

Commit: this commit (site `0.3.48`). Backend API version stays `0.3.28`.

> **The list the score counts is now a page a council can print.** `/units/register` lists every tenanted lot with the day its two-week window closed, whether the form is on file, how many days a missing one has been missing and the points it costs — **309 at 77 days, then 209 and 407 at 15** — longest-open first. The summary reads **3 of 8 tenanted lots have no Form K on file. The score charges 15 points for them: 5 a gap, capped at 15.** The print button and the way back are `no-print`; the table is what leaves the printer.
>
> **The points come from the score, not from a copy of it.** `src/lib/form-k-register.ts` (9 tests) imports `FORM_K_EACH` and `FORM_K_CAP` from `health.ts`, and the register's total is the same `formKPenalty` the gauge adds — checked at four statement dates. The cap is spent on the oldest gaps, so a fourth gap prints no points instead of pretending to add them.
>
> **Only a closed window is a gap.** Scored at 10 September, lots 209 and 407 have no gap at all — their tenants had not moved in yet — and a window still open prints the day it closes and costs nothing. Verified by the model, not by a comment.
>
> **A filing counts from its own day here too.** Record a Form K on `/units/309` and the register drops to **2 of 8, 10 points**, with the filing's date beside the lot; scored at 31 August the same record still shows **47 days** and the three gaps, because August keeps the 72 it earned.
>
> **`/units` has the way in**, beside the filters it narrows: **Form K register →**.
>
> **Verified:** frontend **495 passed** (14 new: 9 register, 5 route), `check` **0 errors / 0 warnings**, translation audit **1,442 keys × 9 locales** (19 new), contrast **218 pairs**, production build green — `build/units/register.html` carries **3 of 8 tenanted lots** and the 77-day row. Chrome was not opened this session; the rendered text was read in jsdom.
>
> **The queue is refreshed, because the pick shipped.** The reserve fund's five-year picture on `/accounting` takes its slot beside the receipt, workspace search and the AGM packet, so four are always waiting. Recorded in `docs/ROADMAP.md`, `/roadmap`, `static/llms.txt`, `WORKPLAN.md`, `docs/WORKPLAN.md` and `.ai_docs/current-status.md`.

---

# openstrata — Last Updated 2026-10-28 by Buffy — the funds follow the month, and a Form K can be filed

Commit: this commit (site `0.3.47`). Backend API version stays `0.3.28`.

> **The funds tab can follow the month now, because the statements behind it exist.** Six month-end balances — operating, reserve, parkade levy — with the three added and the change since the month before, closing on the figures the rest of the books report: **$81,797.62 + $603,688.80 + $31,548.00**. The levy visibly falls as the membrane is paid, and the September row is the funds tab's own cash to the cent. With `?period=2026-04` open the cards read **Cash at April 30, 2026** — **$47,583.16**, **$590,000.00**, **$177,948.00** — and the page says plainly that receivables, prepaids and payables are still the September 30 close, because the statements hold month ends and not the balances behind them.
>
> **A month the bank has not closed is said to be one.** A hand-typed `?period=2026-10` falls back to the close under a sentence naming the range the statements cover, instead of interpolating a balance nobody signed.
>
> **`src/lib/demo/cash.ts` holds the statements, `src/lib/fund-history.ts` the arithmetic** (6 tests): September ties to the funds tab's three figures, the levy's 1 April balance is exactly what was collected, six changes add to what the year moved, and an uncovered month returns `null` rather than a guess.
>
> **A Form K can be recorded on the lot's sheet.** `/units/309#forms` takes the date the form arrived — defaulting to the day the gap is counted to — and records it on this device; the card reads **On file — recorded 2026-09-30 in this browser**, says nothing is sent to a host, and offers to take the record back off. The score reads it: three gaps become two and September's point goes **56 → 61**, while August stays **72**, because `isFiled` counts a filing only from its own day. A form recorded today cannot rewrite a month it was not there for (6 tests). The `/units` filter and the plan's tones read the same record, so a lot with its form on file stops being drawn as a gap.
>
> **The record is device-local, and says so.** Like the setup ticks, the saved searches and the wizard draft: no account, no network call, and the sample book's register unchanged underneath.
>
> **Verified:** frontend **481 passed** (23 new: 6 fund-history, 6 form-k, 5 health, 3 accounting route, 3 lot route), `check` **0 errors / 0 warnings**, translation audit **1,422 keys × 9 locales** (12 new), contrast **218 pairs**, secret gate green, production build green — `build/units/309.html` carries **Record the Form K** and its date field. Chrome was not opened this session; the rendered text was read in jsdom.

---

# openstrata — Last Updated 2026-10-28 by Buffy — the month opens the books

Commit: this commit (site `0.3.46`). Backend API version stays `0.3.28`.

> **Health over time, and the month opens the books.** The dashboard's compliance-health panel charts six fiscal months of the score — **82, 82, 82, 74, 72, 56** — each point rebuilt at that month end from the calendar, the dated charges and the lot register, with the three inputs beside it showing what each costs now, what it cost in April and the month it moved. The card above prints **56** instead of a hard-coded 91, and the gauge's demo deadlines count days from due dates instead of a stored `127`: card, gauge and trend read one model (`src/lib/health.ts`, 22 tests). Every column is a button, and each open month lists the charges that were past due and the Form K windows that had closed.
>
> **Three follow-ons to the `0.3.45` picks.** A health point on `/` now opens the book behind it: the month detail carries **Open in the books**, and `/accounting?period=2026-09` lands on the receivables ladder **aged at 30 September** rather than today — **$6,499.00** past due and **322 days** on lot 207's November 2025 levy, the same figures the point scored. April lands on **$3,552.00**, the levy alone.
>
> **One parser, both sides.** `src/lib/period-link.ts` (4 tests) accepts a `YYYY-MM` month only, computes the month end with `dayIn` (February 2028 is the 29th) and rejects `2026-13`, `2026-9` and `2026-09-30`, so a mistyped link opens today's ladder instead of a half-filtered page. The panel and the page import the same module; a `?month=` on one side and a `?period=` on the other could not fail loudly.
>
> **A second cut of the month, not a second book.** The open month's charges can now be read two ways — everything still standing, or only the charges dated inside the month — each with its own total. September is **5 of 10, $1,515.00 of $6,499.00**; April is **none**, and that is the answer: the money was already owing when April opened. The cut comes from `MonthDetail.datedInMonth`, filtered off the same aged list the score read, so it can never total more than the number above it.
>
> **A Form K gap now lands on its dates.** The trend's Form K rows go to `/units/309#forms`, and the forms card prints the tenancy date, the day the 14-day window closed and how long the lot has been past it (`2026-07-01`, `2026-07-15`, `77 days`). `addDays` joined `lib/arrears` for the closing day.
>
> **The month is page-level on `/accounting`.** The banner sits above the tabs, the journal stops at that day (entries dated on or before it, from the same fiscal-year opening cash) and its closing line names the date. An earlier month with nothing posted says so and names `September 1, 2026`. The tabs that cannot be re-dated — fund balances, budget, payables — say they stay at the September 30 close, rather than printing September's cash under an April heading.
>
> **Verified:** frontend **458 passed** (12 new: 4 period-link, 7 accounting route, 4 lot route, 2 trend interaction, 1 health), `check` **0 errors / 0 warnings**, translation audit **1,410 keys × 9 locales** (8 new), contrast **218 pairs**, production build green — `build/units/309.html` carries `id="forms"` and `14-day window closed 2026-07-15`, and `build/accounting.html` carries no banner at rest. Chrome was not opened this session; the rendered text was read in jsdom.

---

# openstrata — Last Updated 2026-10-28 by Buffy — the money has an age, and every lot has a page

Commit: `ab0b680` (site `0.3.45`). Backend API version stays `0.3.28`.

> **Both picks from the 28 October queue are in.** `/accounting`'s receivables tab now ages every charge from the day it fell due — current, 1–30, 31–60, 61–90 and 90+ — oldest money first, each row opening that lot's own sheet. `/units/207` is one of 40 real pages: the balance, the account behind it from April to September with each cleared month against its payment, the levy at the resolution that created it, the forms on file, and what is dated next. Print drops the tenancy and the buttons, and the page says so beside them.
>
> **`src/lib/arrears.ts` (19 tests) carries three rules, and each one can be argued.** Ages come from due dates, never from a status field, and the dates are the rules the page already states — fees on the 1st, the $50 late fee on the 5th. A payment plan is a schedule, not overdue debt: lots 108 and 403 are paying their levies down at $300 and $450 a month, so their balances sit outside the ladder in a block of their own, because a ladder that ranked the owner keeping their word beside the one who stopped would be lying. And "current" means not yet due — on September 30 the October fee is real money owed and not one day late, the same distinction the page already makes about Form F. The ladder ties to the rest of the app: each lot's charges add to `balance(unit).total`, a test over all 40, and 207's buckets reach its $6,366 to the cent.
>
> **`src/lib/lot-sheet.ts` (15 tests) reads one lot as a statement.** The account stops at the statement date, so October is a dated item rather than a ledger line; a month is cleared only where the fee run matched a deposit, and the months inside the arrears window stand open. The levy sits at the resolution that made it (12 November 2025), ahead of the fiscal year — the one line that sorts before April.
>
> **Three defects were found by looking, not by the tests.** The ladder's footer totalled the whole book while three rows were on screen; it totals the rows shown now, and the cards above carry the book. The "nothing past due" line said 37 of 37 lots, because a lot with no charges has no row at all — three lots are fully prepaid, so the denominator is the building's 40. And the sheet printed `in −1 days` on a future item: the day difference was measured the wrong way round.
>
> **Measured rather than eyeballed:** no page overflow at `1440`, `1100`, `900`, `620` or `390` on either surface, with the ladder and the account each scrolling inside its own table; print media measured `display: none` on the tenancy card and the action row; the worst of the new ink is **5.48:1** light and **7.15:1** dark against the 4.5 floor.
>
> **The queue is refreshed, because it ended.** Two new offers replace the two picks — a receipt you can hand over (`/pay`) and health over time (`/`) — beside search that reaches the workspace and the AGM packet, so four are always waiting. Recorded in `docs/ROADMAP.md`, `/roadmap`, `static/llms.txt`, `WORKPLAN.md`, `docs/WORKPLAN.md` and `.ai_docs/current-status.md`.
>
> **Verified:** frontend **408 passed**, `check` **0 errors / 0 warnings**, translation audit **1,383 keys × 9 locales** (36 new), contrast **218 pairs**, production build green with `v0.3.45` and **40 lot pages**, `changelog.generated.ts` regenerated (**48 releases with notes, 374 items**). The CDP probes live in `/tmp`; none is in the tree.

---

# openstrata — Last Updated 2026-10-28 by Buffy — the floor plan on /units, and the journal as a statement

Commit: `a4651ef` (site `0.3.44`). Backend API version stays `0.3.28`.

> **The first two picks from the 28 October queue, shipped together.** `/units` is a plan now instead of a wall of lot buttons: four bands, top floor first, each drawn as the building stands — two rows of lots either side of a corridor, lot numbers running up the row, and every lot as wide as its square footage earns. `A ledger you can read as a ledger` follows on `/accounting`, where the journal reads as a statement: date order, a running cash balance beside every entry, and a drawer per entry with its hash, who posted it and what evidence came with it.
>
> **`src/lib/floor-plan.ts` (11 tests) holds the plan's rules.** A row adds to exactly **100** after rounding — the drift goes to the widest lot, because a hairline gap at the right edge reads as a bug — and a lot that would fall below **14%** is held there while the rest is shared among the wider lots, so a 548 sq ft studio keeps its own number beside a 1,540 sq ft two-bed. The plan also reads the filter the list already had rather than adding a second control, and drops a floor with nothing left in view instead of drawing it empty.
>
> **The floor plan found a layout defect the old grid had hidden.** A grid item defaults to `min-width: auto`, so the plan's 460px row pushed a 390px phone to **502px**. `min-w-0` hands the scrolling to the band, which is now the only thing that scrolls. Measured at `390`, `620`, `900`, `1100` and `1440`: no page overflow, no clipped tile, tiles 80–192px wide.
>
> **`src/lib/ledger-statement.ts` (11 tests) holds the statement's rules, and one of them caught a real mistake.** Cash is two named accounts — `1010` operating and `1020` reserve — not a `10xx` prefix: the first draft's pattern swept the war chest at cost (`1080`) into the balance and moved it by **$405** it never saw. The opening balance is the closing cash less what the journal moved, so the last line lands on **$685,486.42** — exactly the operating (**$81,797.62**) plus reserve (**$603,688.80**) cash on the Three funds tab, read back off both tabs in Chrome. Hashes are chained: each covers the entry and the hash above it, so editing a line changes every hash below. The drawer says the chain runs in the browser here; the host keeps the durable copy.
>
> **The queue is refreshed, because two picks ended.** Two new offers replace them — aged arrears (`/accounting`) and a lot's own sheet (`/units?lot=305`) — beside search that reaches the workspace (`Cmd/Ctrl+K`) and the AGM packet (`/meetings`), so four are always waiting. Recorded in `docs/ROADMAP.md`, `/roadmap`, `static/llms.txt` and `.ai_docs/current-status.md`.
>
> **Verified:** frontend **374 passed**, `check` **0 errors / 0 warnings**, translation audit **1,346 keys × 9 locales** (14 new), production build green with `v0.3.44` in `build/index.html`. Contrast measured in the browser at **9.3:1** for the worst tile and **8.3:1** for the drawer, on the theme it rendered. The CDP probes live in `/tmp`; none is in the tree.

---

# openstrata — Last Updated 2026-10-28 by Buffy — /changelog says where you are

Commit: `2105165` (site `0.3.43`). Backend API version stays `0.3.28`.

> **The queue's last item shipped: a release trail.** `/changelog` now opens with the build you are running and how far it is from the newest note — `You are running v0.3.43 — the newest release.`, or `— 1 release and 12 changes since.` when it is behind. The running release is marked `You are here`, and every release carries the step into it, naming the one it followed and counting what changed: `since v0.3.42 · 10 changes`. The page reads as a trail instead of a list of versions.
>
> **Two decisions carry the rules, and both are in `src/lib/release-trail.ts` with 11 tests.** Versions compare as numbers, not strings — `0.3.9` is older than `0.3.10`, and a page that sorted them the other way would put a fix above the release that made it necessary. And a build whose version has no note is a normal state, not an error: the site is published from `package.json` while the notes are written by hand, so a build can be newer than the newest note or older than every note on the page. Neither draws a marker pointing at the wrong release; the placement is `null` and the page says what it knows — `This build is v0.3.99, newer than the newest note here.`
>
> **All three states were checked in a browser by moving `package.json`**, not by reading the code: on the newest release (chip in the newest card), one release behind (`You are running v0.3.41 — 1 release and 12 changes since.`, with exactly one marked row, `v0.3.41`), and ahead of every note (no marker at all). French reads `Vous utilisez la v0.3.43 — la version la plus récente.` / `Vous êtes ici` / `depuis la v0.3.42 · 10 changements`.
>
> **Measured rather than eyeballed:** no overflow on the trail at `1440` or `620` in either theme, and the new ink at **5.47:1** light and **6.59:1** dark at its worst, against the 4.5 floor.
>
> **The queue is refreshed, because it ended.** Three new offers replace the pick — a ledger you can read as a ledger (`/accounting`), search that reaches the workspace (`Cmd/Ctrl+K`) and the AGM packet (`/meetings`) — beside the floor walk still waiting, so four are always waiting. Recorded in `docs/ROADMAP.md`, `/roadmap`, `static/llms.txt`, `WORKPLAN.md`, `docs/WORKPLAN.md`, `docs/PRODUCT-PLAN.md` and `.ai_docs/current-status.md`.
>
> **Verified:** frontend **352 passed**, `check` **0 errors / 0 warnings**, translation audit **1,331 keys × 9 locales** (9 new), production build green with `v0.3.43` in `build/index.html`, `changelog.generated.ts` regenerated (**46 releases with notes, 337 items**). The CDP probes live in `/tmp`; none is in the tree. One thing to know: the running version is the one baked into the build, so a tab left open across a deploy reports the build it loaded — a reload corrects it.

---

# openstrata — Last Updated 2026-10-28 by Buffy — the last five routes speak the reader's language, and the money does too

Commit: `703c20c` (site `0.3.42`). Backend API version stays `0.3.28`.

> **Both batches are in.** Batch one was the next-30-days strip on `/calendar` and `/tax` (`0.3.41`). Batch two is this release: `/units`, `/calendar`, `/tax`, `/meetings` and `/pay` now read their own copy from the catalog — **149** keys across nine locales, **1,322** keys at full parity, and the i18n audit's hard-coded surface on those five routes is **zero**. Every workspace route renders in the reader's language; `/accounting` got there at `0.3.40`.
>
> **The money left `en-CA`.** `money()`, `moneyCompact()` and `satsLabel()` read the active locale through `formatCurrency` at call time, so a French page prints `904,58 $` where it printed `$904.58`. Sats keep the unit name, because the Lightning unit is not an English word, but their digits group the reader's way.
>
> **So did the dates.** The calendar's month name, its seven weekday heads, the selected-day heading and the receipt tape's chips come from `Intl`: `septembre 2026`, `mercredi 30 septembre`, `1 sept.`. Verified in `fr`, `en` and `zh` (`septembre 2026` / `September 2026` / `九月 2026`, heads `D L M M J V S` / `S M T W T F S` / `日 一 二 三 四 五 六`).
>
> **Two defects came out of doing it.** `formatDate()`'s `YYYY-MM-DD` check was written with a doubled backslash, so it never matched: a bare calendar day went through `new Date('2026-09-30')`, which is UTC midnight and rendered as **September 29** for every reader west of UTC. Day strings are anchored at noon UTC now. The old test could not see it because it passed `timeZone: 'UTC'` — not the path a page takes — so a second test takes the page's path. And the parity guard in `scripts/audit-i18n.mjs` read a French value ending in ` :` as a key, failing on a translation that was correct (`unitsParking: 'Stationnement / rangement :'` reported `rangement`); keys are only read where a property can sit.
>
> **A translation can no longer silently drop a figure.** `fill()` leaves an unfilled slot visible on purpose, which is right for a missing value and wrong for a missing translation — a reader would see `{amount}`. The new test requires every locale to carry the same `{slots}` as the English source, across ~11,900 translated strings.
>
> **Verified:** the five routes in Chrome with the locale set to French — `Impôts et ARC`, `Assemblées et votes`, `Payer un lot`, `Qui habite ici`, `Calendrier`, **no** unfilled `{slot}` anywhere, and the same pages unchanged in English. Frontend **341 passed**, `check` **0 errors / 0 warnings**, translation audit **1,322 keys × 9 locales**, contrast audit **218 pairs** + 3 fill guards, secret gate green, production build green with `v0.3.42` in `build/index.html`. `changelog.generated.ts` regenerated (**45 releases with notes, 327 items**). The probes were throwaway CDP scripts in `/tmp`; none is in the tree.
>
> **Still English on purpose:** the demo *records* — event titles, tax-section prose, bylaw steps, owner notes. Those are sample data rather than chrome; the pages around them translate. The queue's last item, a release trail on `/changelog`, is untouched.

---

# openstrata — Last Updated 2026-10-28 by Buffy — a September close on /accounting, and its copy in the catalog

Commit: `f235e86` (site `0.3.40`). Backend API version stays `0.3.28`.

> **Two things from the last handoff, both shipped.** The September close was the queue item worth taking, and the two remaining ellipses were its other half.
>
> **The close panel is built from the ledger, not from a status field.** Five checks sit under the four fund cards on `/accounting`: the three accounts tie, payroll and source deductions are posted, the reserve contribution and interest are billed, board approval is on the minutes, and the period locks. Four read `books.tie` and the payroll/reserve entries, so the panel cannot drift from the cards above it. Three pass today; board approval is open (next council meeting 20 October); the lock waits on it, and **the disabled close button names the check that blocks it** — on screen and in its `aria-describedby`.
>
> **The page's copy left the template.** **96** new keys across nine locales — the lede, the kicker, the six tab labels, every column header, the fund rows and the close panel — with a `fill()` helper for the `{amount}` / `{date}` slots. `/accounting` went from **47** hard-coded English strings to **0**; the catalog is **1,179** keys with `fr es zh hi fil pl uk sw` at parity. French rendering checked in the browser: `Clôture de septembre`, `Approbation du conseil au procès-verbal`, and all six tabs translated.
>
> **Both ellipses fixed the same way the deadline titles were.** The building card's meta line overflowed by 5px at 1440 behind a `nowrap` ellipsis; it wraps now — two lines at 1440 and 1181, one at 1100 — with `scrollWidth === clientWidth` at every width measured. The `/units` lot cell is **108px** at 1100 and `Northwater Holdings Ltd.` needed 137; it takes two lines, fully visible.
>
> **The measurement found a third case of the same defect, inside the fix that was meant to end it.** Between **1181 and 1279** the dashboard sidebar is on screen, which leaves the proof band 929px and each card 254px — a **156px** column of copy in both themes. Its two-up breakpoint moved from `1180` to `1279`.
>
> **One colour regression caught before it shipped.** The close panel's open chip was `amber-700` over a translucent fill: **4.37:1** in light and **2.32:1** in dark, because a fixed amber stays dark on a dark tint. It now uses the token pair that flips with the theme — **6.15:1** and **6.63:1**. The contrast audit cannot see Tailwind classes, so only a browser measurement would have caught it.
>
> **Verified:** geometry audit over `/accounting` (all six tabs), `/units` and `/` at `1440`, `1279`, `1181`, `1100`, `900` and `620`, both themes — **0** clipped, truncated, spilled or sub-200px findings. Frontend **322 passed**, `check` **0 errors / 0 warnings**, translation audit **1,179 keys × 9 locales**, contrast audit **218 pairs** + 3 fill guards, secret gate green, production build green with `v0.3.40` in `build/index.html`. Site version `0.3.40` (`changelog.generated.ts` regenerated: **43 releases, 307 items**). The probes were throwaway scripts against a dev server; none is in the tree.
>
> **One queue item consumed** — the held-over queue is now three: the floor walk on `/units`, the next-30-days strip on `/tax` + `/calendar`, and the release trail on `/changelog`.

---

# openstrata — Last Updated 2026-10-28 by Buffy — the compliance panel was cutting the deadlines it scores

Commit: `06c55d7` (site `0.3.39`). Backend API version stays `0.3.28`.

> **Asked to check the other dashboard panels for the proof band's problem, I measured them instead of eyeballing.** Every panel at `1440`, `1181`, `1100`, `900` and `620`, in both themes, looking for four things: content clipped by `overflow: hidden`, content spilling out of its card, ellipsis that actually truncates, and text set in a column under 200px with three or more lines.
>
> **One panel had it, and it was the worst place for it.** The compliance-health card put its tracked-item list in a row beside the 112px gauge: each deadline title got **118px** at `1440` and **50px** at `1100`, so `Energy Performance Report (EPR) filing` rendered as `Ener…` and `Depreciation report renewal` lost its last word at desktop. The panel was scoring deadlines it could not name.
>
> **Fixed by stacking:** the gauge keeps its own row, the formula note is full width beneath it, and the items take the panel's whole width below that, clamping to two lines rather than truncating to one. Titles now get 250px at `1440` — all three on one line — and 182px at `1100`, where the longest wraps cleanly. The panel is about one row taller, which is what giving the copy its width costs.
>
> **The task list had the smaller version of it:** at `620` the title `Annual General Meeting (within 2 months of fiscal year end)` lost 19px behind an ellipsis. Row titles clamp to two lines now.
>
> **Everything else measured clean, including the rest of the workspace.** `/units`, `/accounting`, `/pay`, `/tax`, `/calendar` and `/meetings` at `1100` and `620` report no clipped or spilled copy. The things that look clipped are built to scroll — the payment strip and the tab rows, both `overflow-x: auto` with their own thin scrollbars, checked to be reachable rather than `hidden`; `sr-only` headings and the filing table on `/tax` are the same story.
>
> **Two single-line ellipses left alone**, since they are a different page and not the reported defect: the building card's meta cuts 5px at `1440` (`… 40 lots · 4 flo…`) and the `/units` company column cuts long company names at `1100`.
>
> **Verified:** frontend **318 passed**, `check` **0 errors / 0 warnings**, contrast audit **218 pairs** + 3 fill guards, production build green with `v0.3.39` in `build/index.html`. Site version `0.3.39`, `changelog.generated.ts` regenerated (**42 releases, 296 items**). The audit probes were throwaway scripts against a running dev server; none of them is in the tree.

---

# openstrata — Last Updated 2026-10-28 by Buffy — the cards above the footer now fit their copy

Commit: `50de813` (site `0.3.38`). Backend API version stays `0.3.28` — nothing server-side moved.

> **The complaint was a layout defect, not a matter of taste.** The three proof cards that close the dashboard capped their copy at `28ch` — roughly **145px** at `9.5px` type — while a `white-space: nowrap` link took the rest of each card and `overflow: hidden` hid whatever did not fit. The longest line, *"Every deadline, Form K gap and AR balance is a tracked item with a stake in the score — not a vanity number."*, was being set in four or five fragments in a sliver.
>
> **Each card is now a two-row grid.** Mark and copy sit side by side; the link drops to its own baseline underneath them, its padding offset by `-9px` so the word lines up with the copy above. Type goes from `11.5/9.5px` to **`12.5/10.5px`** at `1.5` leading — the same hairline border, radius, shadow and pastel marks — and because the cards share a height, the three links share a baseline.
>
> **The breakpoints moved instead of the type.** Three columns hold only while the measure stays readable; between `620px` and `1180px` the band is two-up with the third card spanning the row; below `620px` it is one card per row with the mark stepped to `36px`. At `1100px` the old three-up left each copy column at **136px**, which is the same defect at a different window width.
>
> **Measured, not eyeballed.** A throwaway DevTools-protocol probe read the geometry of every card in Chrome at `1440`, `1181`, `1100`, `620` and `380`, in both themes: **zero** horizontal or vertical overflow, every mark, copy block and link inside its card's bounds, equal heights within a row, and copy at two lines wherever the band is multi-column. The probe and the temporary start-choice page it used are deleted; only the CSS and the release notes are in the commit.
>
> **Verified:** frontend **318 passed**, `check` **0 errors / 0 warnings**, contrast audit **218 pairs** with the fill guards, production build green with `v0.3.38` in `build/index.html`, i18n audit unchanged (no new copy). Site version `0.3.38` — new `CHANGELOG.md` section, regenerated `changelog.generated.ts` (**41 releases, 290 items**), sitemap `lastmod` refreshed by the prebuild. This was requested directly, not picked from the queue, so the four offered UI upgrades are still waiting, none started.

---

# openstrata — Last Updated 2026-10-28 by Buffy — the secret gate is green, so CI can run it

Commits: `7a3878e` (gate fix + 6 tests + CI step) and `ccde02b` (the fix that CI forced). Site version `0.3.37` and backend version `0.3.28` are both unchanged: this release makes a repo check usable, and no service or interface behaviour changed.

> **`npm run check:security` was red at HEAD on 17 false positives, so it was not a gate.** Every finding was a fixture or a sentence, none was a credential: 13 backend test constants (`AUTH_SECRET = 'auth-test-secret-xyz'` and siblings), two quoted test fixtures (`password: 'correct-horse-battery'`), the `.env.example` dev password, three prose lines calling the payment link "the credential" and quoting its format `ospl1.<payload>.<sig>`, and one Tailwind class in the contrast audit's token table. It was not wired into CI, so nothing was blocked — and nothing was checked either. A gate that cries wolf is switched off, and a switched-off gate manufactures the belief that scanning happens.
>
> **The fix classifies the value, not the path.** A real credential pasted into a test file is the most common way a secret leaks, so `tests/` is not evidence of anything. `scripts/check-secret-hygiene.mjs` now reads the matched value against three tells — a **marker segment** (`test`, `dev`, `example`, `smoke`, `xyz`), a **placeholder slot** (`<payload>`, `<opacity>`), or a **written-out slug** (lowercase words joined by `-`/`_`/`.`, optional short numeric tail, no letter+digit run) — with a **danger segment** (`prod`, `production`, `live`, `real`, `staging`, `actual`, `private`, `mainnet`, `release`) vetoing all three. `prod-db-password-2026` reads like a fixture and names a real environment, so it still fails; so does `Summer2024!Secure`, a random mixed-case key, a hex-and-dash key, and a base64 blob that decodes to `ghp_…`.
>
> **Measured, not asserted.** Six tests (`src/lib/secret-hygiene.test.ts`) run the real script over temp files: the tracked tree passes, four fixture shapes pass, prose quoting the link-token format and a CSS class passes, five real-looking values fail by rule, and four fixture-shaped production credentials fail anyway. The first attempt judged "the last quoted string on the line" and mis-classified the prose — the value now comes from the rule's own `(?<value>…)` capture, which is what that test caught.
>
> **Classifications are counted, never silent:** each run prints `Fixture-shaped literals classified as test/dev values: 21 in 18 files`. The residual miss is written in the script — a real key written as a friendly slug with no danger word (`internal-db-passphrase-2026`) is classified rather than reported — and the count is what makes a change in that surface visible.
>
> **CI runs it** as the first step after `npm ci` in the site job. Verified locally: frontend **318 passed** (312 + 6), `check` **0 errors / 0 warnings**, gate green over every tracked file; the backend and its suite are untouched by this change.
>
> **CI immediately failed the new step, and was right.** The gate scans *tracked* files, and the adversarial literals in the new test were only untracked — so the local run never saw them, while the first push did: `src/lib/secret-hygiene.test.ts:79 [quoted-credential-literal]`, `:85 [github-token]`, `:87 [base64-wrapped-credential]`. The fix was not an exemption: each adversarial value is now assembled from pieces shorter than the 16-character floor and written to a temp file, so the tree carries no credential-shaped literal and the gate still sees exactly what a commit would. **Run `40695863063` on `ccde02b` is green in all three jobs**, with `0 credential findings`, `28 in 19 files` classified, and **318** frontend tests.

---

# openstrata — Last Updated 2026-10-27 by Buffy — migrations are applied before a push now, not on a runner

Commit: `4da0332` (backend tooling + pre-push gate). Site version `0.3.37` and backend version `0.3.28` are both unchanged: this release adds a local harness and one hook, and the service behaves exactly as it did.

> **The loop is closed where it broke — on this machine, before the push.** The last session executed migration `0009` by hand (Homebrew `initdb`, port 5455) and ended by naming the gap: nothing in the repo starts a Postgres, so the *next* migration would again be first executed on a CI runner, which is precisely how `0009` turned `main` red. `backend/scripts/lib/pg-local.mjs` and `backend/scripts/db-local.mjs` now run a matching cluster from inside the repository — `db:up`, `db:down`, `db:status`, `db:url`, `db:reset`; data in the gitignored `backend/.pgdata`; loopback only; port 5455 so 5432 stays free; PostgreSQL **17** with pgvector found through `OPENSTRATA_PG_BIN`, the Homebrew keg or `pg_config`. A different major is refused rather than used, because the gate has to run the server CI runs.
>
> **`npm run db:check` is the gate, and it takes about three seconds.** It applies pending migrations to the persistent development database — checksum drift, DDL that is not repeatable, the ALTER path a deployment takes — then drops and recreates a scratch `<db>_gate` and applies every migration **from zero**: syntax, ordering, a mangled function body, the CI path and the one that failed. Then it proves a second `migrate` reports `no pending migrations` with a clean `migrate:check`, and runs the backend suite against the scratch database requiring **0 skipped** — an unset or wrong `DATABASE_URL` is exactly how the durable paths go untested while the suite still reports green (369 passed / 8 skipped without a database, **377/377** with one).
>
> **A pre-push hook runs it, and it was tested by trying to break it.** `.githooks/pre-push` (armed once per clone with `npm run hooks:install`) plus a temporary `0010` migration carrying the incident's own defect class — a `RAISE` outside a plpgsql block — made `git push --dry-run` fail with `FAILED 0010_gate_proof.sql`, `syntax error at or near "RAISE"` and `error: failed to push some refs`, after the gate had applied the migrations, run the suite and dropped its scratch database. Deleting the file restored green. `OPENSTRATA_SKIP_DB_CHECK=1 git push` and `git push --no-verify` are the documented bypasses. The push that landed this work went through that hook and passed the gate in **3.1s**.
>
> **Two refusals on purpose.** An explicit `DATABASE_URL` wins over the harness, so CI and `docker compose` can share the same gate — but a remote one stops it before anything is touched, because a git hook should not be creating scratch databases on a shared server. With no PostgreSQL 17 installed the push is refused with the `brew install postgresql@17 pgvector` line instead of reporting a vacuous pass.
>
> **CI runs the same gate now**, in place of its separate `npm run migrate` and `npm run test -- e2e-smoke` steps: `backend-e2e` calls `npm run db:check` against its own `pgvector/pgvector:pg17` container, so a push made with `--no-verify` is still measured the same way, and "the schema applies" means one thing in both places.
>
> **Verified:** nine new tests (`backend/tests/db-local.test.ts` — port validation, target resolution, the remote-host guard, connection-string parsing and scratch naming, the identifier guard on `CREATE`/`DROP DATABASE`, discovery order and version gating, one-time cluster initialisation, and starting only when nothing is already listening); backend **369 passed / 8 skipped** without a database and **377/377** against one; typecheck clean; `db:up` initialised a cluster from nothing, `db:reset` did it again from nothing, and `db:down` left nothing listening. Nothing frontend changed.
>
> **Confirmed in CI:** run `40610138684` on `5a1e2c6` is green in all three jobs — `backend` **369 passed / 8 skipped**, `backend-e2e` applied the migrations on a fresh `pgvector/pgvector:pg17` container and passed the smoke suite **8/8**, and the site job passed both audits and the production build. The new test file and scripts are covered by that run; the hook itself is local, so CI still proves migrations only on its own fresh container.

---

# openstrata — Last Updated 2026-10-27 by Buffy — migration 0009 failed its first real run, and the migration runner is why

Commits: `d220d6f` (backend fix + regression tests + version `0.3.28`) and `06e0553` (handoff corrections). The previous handoff said migration `0009` "has never been executed"; that was wrong — CI ran it on the previous push and it failed, and this session found out how. It executes cleanly now, locally and in CI.

> **The push that was supposed to prove migration `0009` actually rejected it.** CI's `backend-e2e` job ran it and failed: `FAILED 0009_audit_log_and_sessions.sql` / `syntax error at or near "RAISE"` (`42601`, `plpgsql_yyerror`). So `main` was red, the smoke suite never ran, the sessions and audit tables existed nowhere, and the previous session's central claim — six paragraphs of it across the handoff chain — described a state that had already changed. "Never executed" and "executed and rejected" are different failures and the difference is invisible from a local machine with no Postgres.
>
> **The bug was in the migration runner, not the migration.** `scripts/migrate.mjs` strips standalone `BEGIN`/`COMMIT` lines so a migration's DDL and its version row commit in one transaction, and it did that with a line filter. A plpgsql body is written as `BEGIN … END;` inside `$$ … $$`, so the `BEGIN` opening the append-only trigger function was deleted and its `RAISE EXCEPTION` had no block to belong to. `0009` is the first migration with a function body, so the flaw was latent from `0008` onward. The stripper now carries SQL quoting state across lines — line comments, nestable block comments, single-quoted strings, double-quoted identifiers and dollar-quoted bodies including tagged `$body$` — and drops only a wrapper starting in plain SQL context. Four tests cover it, including an invariant that every quoted segment of every shipped migration survives byte-identical.
>
> **Migration `0009` has now actually run.** PostgreSQL 17.11 + pgvector 0.8.7 (the CI image's major version) installed locally; a fresh cluster took `npm run migrate` through `0001..0009`; the re-run said `no pending migrations`; `migrate:check` came back clean. In the database: both tables, all 8 indexes, the FK to `app_user` with `ON DELETE CASCADE`, the role and refresh-hash CHECKs, and the trigger seen refusing a live `UPDATE` and a live `DELETE`. The suite CI never reached is **8/8** there — including the two assertions written blind last session, where a logout on one instance kills a token on another. Backend suite: **360 passed / 8 skipped** without `DATABASE_URL`, **368/368** with it; typecheck and build green.
>
> **Confirmed in CI:** run `40603079531` on `06e0553` is green in all three jobs — `backend-e2e` applied `0001..0009` on a fresh `pgvector/pgvector:pg17` container (`applied 0009_audit_log_and_sessions.sql`) and the smoke suite passed **8/8** there, the backend job ran **360 passed / 8 skipped**, and the site job ran **312 tests** with both audits and the production build green. **The one real gap left is local:** nothing in the repo starts a Postgres for on-machine runs, so "executed" here meant a manual Homebrew `initdb` on port 5455, now written down step by step in `sop-workflow.md` — a committed `db:local` harness is what would stop the next migration from being first executed in CI again. Backend version is now `0.3.28` (README rule: bump when backend behaviour changes); site version stays `0.3.37`.

---

# openstrata — Last Updated 2026-10-27 by Buffy — sessions a council can end, and a record of who did what

Commits: `8d5c6b4` (backend: server-side sessions + append-only audit log) and `8bdf968` (site: sign-out ends the session), both pushed to `origin/main`. **Corrected the same day in `d220d6f`: the claim below that migration `0009` was never executed was wrong — CI ran it, it failed on a migration-runner bug that deleted a function body's `BEGIN`, and the fix is in the section above.**

> **Two credentials problems, and neither could be closed after the fact.** Every token was a stateless bearer credential with a 12h life and no way to end it — a treasurer removed at an evening meeting kept full write access until morning, and a token copied from a shared laptop could not be revoked at all. Tokens now carry a `sid` naming a row in `auth_session` (migration `0009`) that every request resolves: it must exist, be unrevoked and unexpired, belong to the claimed user and council, and still carry the token's role. `POST /auth/logout` ends a session immediately rather than at expiry, a role change ends it, and a refresh token presented twice ends it as a stolen copy. Access tokens are short-lived now (`AUTH_TOKEN_TTL`, **1h**, was 12h) and renewed with a refresh token — issued once, stored only as a SHA-256 hash, rotated on every use, 30 days (`AUTH_REFRESH_TTL_DAYS`). A member can see their own sessions (`GET /auth/sessions`) and end the others (`DELETE /auth/sessions`), and an admin can finally demote someone (`PATCH /auth/users/:id`) — which is the change that made revocation matter, refusing a self-change and refusing to leave a council with no admin.
>
> **And nothing recorded who did what.** Twenty routes are role-gated — ledger posts, billing runs, bylaw fines, unit and member deletion, user management — and none left a trace of the actor, so "who authorized this" had no answer anywhere in the system. `audit_event` (migration `0009`) holds actor, role, action, outcome, target, status, IP and user agent, written by one `onResponse` hook over one pure function whose **default is to record** — a new endpoint is audited unless it is explicitly exempted — so exempting one is a visible edit rather than an oversight. Refusals are rows too: the member who *tried* to post to the ledger is exactly the row an investigation wants. Request bodies are never copied in (a password, a complaint payload or a PSBT cannot reach a row), unattributable traffic is not recorded at all except the two rate-limited auth events, and the table refuses `UPDATE` and `DELETE` by trigger, so append-only is a property rather than a convention. `GET /api/v1/audit/events` (admin) reads it back, tenant-scoped and cursor-paged, and reading it is itself recorded.
>
> **Verified:** backend typecheck + build green, **357 passed / 8 skipped** (310 existing + 47 new; the skipped file is the Postgres E2E suite, which grew 5 → 8 tests); frontend `check` **0 errors / 0 warnings**, **312 passed**; `audit:i18n` 1075 keys × 9 locales; `audit:contrast` 218 pairs; production build green. Nothing visual changed.
>
> **The one thing to watch: migration `0009` has never been executed *at the time of writing*.** *(Correction, 2026-10-27:` `d220d6f` *— it had been executed: the CI job described in this very paragraph ran it, it failed on a runner bug that stripped the `BEGIN` out of the trigger function's plpgsql body, and the fix plus the first successful local execution are in the section above.)* There is no Postgres on this machine and Docker is unavailable, so the new tables have not been created anywhere. Its first real run is CI's `backend-e2e` job (`pgvector/pgvector:pg17` → `npm run migrate` → the smoke suite), which now also asserts that a logout on one instance kills the token on another instance and that the append-only trigger refuses an `UPDATE` and a `DELETE`. If the migration is wrong, that job is where it shows. Also open: `backend/package.json` was still `0.3.27` although the auth contract changed — the README says to bump it when backend behaviour changes; bumped to `0.3.28` in `d220d6f`. Site version stays `0.3.37`.

---

# openstrata — Last Updated 2026-10-26 by Buffy — the i18n audit was blind to its own markup, and the release landed

Commits: `d4ef669` (site), `72acd9a` (backend: durable ledger retries and fail-closed treasury) and `fb3d60a` (release `0.3.37`), all pushed to `origin/main`.

> **The translation audit was blind to this repo's own markup, and what it hid was bigger than what it caught.** `scripts/audit-i18n.mjs` skipped *any line containing `{`* — and because this repo writes markup minified, the entire site footer is a single line, so one binding hid the hard-coded nav labels, the RSS chip's `title`/`aria-label` and the cookie notice while the audit reported clean. It now strips Svelte expressions and scans inside the line, and checks `title`/`aria-label`/`alt` the way it already checked text nodes. Reaching that content took the warning surface from a handful to **113** (warn-level, CI stays green), and most of it is real rather than noise: `/accounting` (47), `/units` (18), `/tax` (11), `/meetings` (8), `/pay` (7) and `/calendar` (4) have **no i18n import at all**, so the "full interface localization across all routes" claim does not hold for those six. The home page chrome is the part translated here, in all nine locales — 10 new keys, 1075 total. The RSS chip also moved off its own `#fdba74` / `rgba(251,146,60,…)` literals onto `--color-slab-accent`: its fill is now inside the contrast audit (7.83:1 light, 9.63:1 dark) and flips with the dark theme like the rest of the footer, which it previously did not. Finally, Sentry was initialised but never wired to SvelteKit — `src/hooks.client.ts` exported no `handleError`, so a configured DSN would have reported an empty project.
>
> **The release also got the version it was missing.** It landed first without a bump, which left it invisible on `/changelog` and the footer stamping `v0.3.36`; `fb3d60a` adds the dated `CHANGELOG.md` section and front-matter summary, bumps the site version to **`0.3.37`**, and regenerates `src/lib/changelog.generated.ts` (40 releases with notes, 283 items). The backend API version stays on its own track at `0.3.27`.
>
> **Verified:** `check` **0 errors / 0 warnings**; frontend **311 passed**; backend typecheck + build green, **310 passed / 6 skipped** (the six are Postgres E2E — `DATABASE_URL` unset, Docker unavailable, so the durable path is not exercised here); production build green; `audit:i18n` **1075 keys × 9 locales**; `audit:contrast` **218 pairs**; the changelog drift test passes and the built `/changelog` page renders the `0.3.37` section, with `OpenStrata v0.3.37` in the shipped HTML. `npm run check:security` is red at HEAD with 15 false positives (test fixtures, the `.env.example` dev placeholder, and prose quoting the link token) — pre-existing, not CI-gated, and useless as a signal until the pattern can tell a fixture from a secret.

---

# openstrata — Last Updated 2026-10-17 by Buffy — durable ledger retries and fail-closed treasury (committed 2026-10-26 as `72acd9a`, not deployed)

Commit: `72acd9a` — durable ledger retries and fail-closed treasury (21 files). Written while uncommitted; landed 2026-10-26.

> **This backend change keeps money paths honest while adding durable retries.** Postgres stores ledger idempotency keys with their request fingerprints and ledger entry in one transaction; matching retries replay across restarts, changed payloads return `409`, migration `0007` adds the table, and the smoke suite exercises a second server instance. PSBT plan authorization is recomputed from council ledger balances; plan tokens bind immutable authorization; requests validate address/network, fees, UTXOs and signatures’ syntax, reserve inputs, and reject replay. The endpoint still refuses live broadcast and ledger debit: signature verification, PSBT/change construction, and durable plan storage are not implemented. The migration runner serializes migrations, checks checksums, and has a read-only `migrate:check`; first-upgrade baseline is current-file pinning, not historic validation. `/health/live` and `/health/ready` are wired; only Postgres is probed in production. Bitcoin address checks were tightened and xpub test vectors now use valid key serialization.
>
> **Verified locally:** backend `typecheck` and `build` pass; backend tests **310 passed / 6 skipped**. The skipped six are Postgres E2E tests: `DATABASE_URL` is unset and Docker is unavailable. `git diff --check` is clean. No production database/host was contacted, and no deployment was performed — only the commit was pushed, on 2026-10-26.

---

# openstrata — Last Updated 2026-10-17 by Buffy — backend safety and read-only agent context (site v0.3.36 · backend v0.3.27)

Commit: `a576b86` — Harden council API boundaries and add a safe agent read surface.


> **This backend release prioritizes safer boundaries over a broad 40-ticket checklist.** Added authenticated read-only agent discovery/context with aggregate occupancy/Form K data, verified Operating/CRF balances and a bounded deadline list. Owner/contact details, payment references and transaction descriptions are excluded; responses are `private, no-store` and vary by `Authorization`. Ledger `Idempotency-Key` is validated and tied to the request fingerprint: same request replays, changed body returns `409`, concurrent duplicates coalesce, and the cache is bounded to 10,000 keys/24h. Successful responses are never evicted early; a full cache refuses new keys with `503`. It is explicitly process-local, so multi-instance deployment still needs durable storage. Fastify now has a 256 KiB body cap, 30-second request timeout and strict unknown-field rejection; auth identity and Rosa input lengths are bounded. CRT/Form B/F print HTML escapes dynamic data and sends restrictive security/cache headers; JSON payloads preserve ordinary text.
>
> **Verified:** backend typecheck clean; backend **301 passed / 6 skipped**; frontend **309 passed**; Svelte check **0 errors / 0 warnings**; production build green; i18n audit **1065 keys × 9 locales** passes with existing review warnings for demo/accounting route literals and zero missing keys; contrast audit **218 pairs** passes. No production backend host is available. Versions: site/project `0.3.36`, backend `0.3.27` (separate release tracks). See `CHANGELOG.md` and `.ai_docs/current-status.md`.

---

# openstrata — Last Updated 2026-10-16 by Buffy (M3) — one host can serve both, and an untrusted base can never be used (v0.3.35)

> **The CORS blocker has an answer that needs no host details, but we still have not mapped the live site to it.** `PUBLIC_API_BASE_URL=/` (or the word `same-origin`) now means *the origin this page was served from*, so if the site and the API ever sit on one host the build value is `/`: no absolute address to maintain, nothing breaks when the host's address changes, and **no CORS at all** — a same-origin request never asks. `resolveApiBase(stored, built, origin)` takes the page's origin as a third input and returns demo mode when there is none (SSR/prerender), so the pre-hydration render is demo data that settles on live; that one frame of sample data is documented in `.env.example` rather than hidden. The same pass closed a real hole found by asking what the value's *shape* can be: a base that is neither an absolute `http(s)` URL nor a same-origin token is now **ignored**, because `fetch('//evil.example/api/v1/units')` is a protocol-relative redirect to somebody else — a mistyped or hostile value would have handed a council's bearer token to that host; a bare path and a `javascript:` URL are ignored the same way, while a URL with a path is still accepted for a reverse proxy. Docs now describe three deployment shapes (one host · tailnet · public HTTPS), each naming the two variables that must agree. **Verified in Chrome on the built artifact with no override of any kind** (every `openstrata-*` key cleared): the site and API on one origin rendered the signed bill at **$921.00**, `LMS2847-305-202610`, `305 · Evergreen House`, and the only `/api/v1/` call went to the page's own origin; a build with `//evil.example` stayed on the demo sheet ($576.00), said *not connected to a council host yet*, and made **zero** requests to that host. `src/lib/api/config.test.ts` **15 tests**, **309 frontend tests**, **285 backend tests + `tsc` clean**, `check` 0/0, `audit:i18n` 1065 × 9, `audit:contrast` 218 pairs, build green. The six earlier commits were **pushed to `main`** (`1285798..fc9d294`). Still the only open item: **the live site is already on Cloudflare and the API is not deployed anywhere I can reach, so we have not yet mapped the live site to whichever shape is ours.** Until we know which shape the live site is in, the only browser-verified proof of the `/pay` button's shape sits behind a local proxy, not behind `openstrata.giveabit.io` — that is exactly the question the prompt in `docs/KIMI-HANDOFF.md` asks her.



---

# openstrata — Last Updated 2026-10-16 by Buffy (M3) — the API can be called from the site (v0.3.34)

> **Cross-origin access, opt-in and exact, so the static site can actually call a council's API.** The site is a Cloudflare static build and the API is the council's own host, so a browser blocked **every** `/api/v1/*` call before it left the tab — and both documented exposure paths in `docs/DEPLOYMENT.md` described live data working (Option A even echoed an allowlist that did not exist). `backend/src/api/cors.ts` holds the rules as a pure module: an exact allow-list from **`CORS_ORIGINS`**, the requesting origin echoed (never a wildcard), `GET, POST, OPTIONS` with `authorization`, `content-type` and `idempotency-key`, a 600-second preflight cache, and `Vary: Origin` on every response that carried an `Origin`. Three decisions are load-bearing: it is **off by default** (no variable, no header, same-origin deployments byte-identical); **`*` is refused, not honoured** (this API carries bearer tokens, so a wildcard would let any page make authenticated calls from a visitor's browser — the process warns at boot); and a disallowed origin gets **no permission headers rather than a 403**, which would only tell an attacker which origins a council allows. Preflights answer **204** in an `onRequest` hook before any route runs, and the hook runs on errors too, so a `401` stays readable instead of surfacing as an opaque CORS failure. **17 backend tests**; `CORS_ORIGINS` documented in `backend/.env.example`, `backend/API.md`, `docs/DEPLOYMENT.md` (both paths), `backend/README.md` and a new wiring table in `SOURCE-OF-TRUTH.md`. **Verified:** no header when unconfigured; preflight 204 with the origin echoed; a second (MagicDNS) origin echoed for its own request; lookalike host, wrong scheme and wrong port each get nothing; `register` → authed `/units` runs cross-origin; 401 still carries the header; `CORS_ORIGINS=*` grants nothing. `check` 0/0, **303 frontend tests**, **285 backend tests**, `audit:i18n` 1065 × 9, build green. **The last thing standing is a host:** no backend is deployed, so this is verified against a local one — `docs/KIMI-HANDOFF.md` now carries a paste-ready **prompt for Kimi** asking exactly what M3 needs (where the API runs, its MagicDNS name and port, whether migrations `0001`–`0006` ran, which env vars are set — never the values — and the two strings for a real build test).

---

# openstrata — Last Updated 2026-10-16 by Buffy (M3) — PUBLIC_API_BASE_URL actually works (v0.3.33)

> **The documented build-time wiring now reaches the browser.** `PUBLIC_API_BASE_URL` was the way an operator was told to point a build at a council host, but `src/lib/api/config.ts` read it through `import.meta.env` — which Vite populates **only** for its own `VITE_` prefix. The production bundle compiled to `const i = {}`, the value was always `undefined`, and only the runtime `localStorage['openstrata-api-base']` override ever worked; that is why every earlier release had to verify live data through the override. Fix: `envPrefix: ['PUBLIC_', 'VITE_']` in `vite.config.ts` (the Sentry DSN stays exposed). The precedence rule moved into a pure `resolveApiBase(stored, built)` and **`src/lib/api/config.test.ts` (9 tests)** pins both halves — the rules, and a contract test that fails if `envPrefix` loses `PUBLIC_`, which is the guard no runtime test could give because the value was simply absent. The prebuild CSP script had the mirror-image bug: it read `process.env` only, so an operator who put the base in `.env` (the documented workflow) got a bundle pointed at their host and a `connect-src` allowing only `https:` — which the browser then blocks for a plain-http tailnet host; `scripts/generate-csp.mjs` now loads `.env`, `.env.local`, `.env.production`, `.env.production.local` in Vite's order via `util.parseEnv`, with a shell variable still winning. **Verified on the built artifact with no override of any kind** — every `openstrata-*` key cleared, `localStorage['openstrata-api-base']` null — the signed bill link rendered **$921.00** and the council's reference from a local host; the same page on the previous build showed the *not connected to a council host* card. A build with the variable unset bakes no origin, falls back to demo mode, and keeps the documented `https:` CSP fallback; `static/_headers` is unchanged in git. `check` 0/0, **303 frontend tests**, `audit:i18n` 1065 × 9, `audit:contrast` pass, build green.

---

# openstrata — Last Updated 2026-10-16 by Buffy (M3) — signed owner payment link (v0.3.32)

> **`/pay` now starts a live Interac request with no council login.** A treasurer issues one signed link per bill (`POST /api/v1/payments/link`) and sends it; the owner opens `/pay?unit=305&rail=etransfer&t=…` and pays from their own bank. The link *is* the credential: `ospl1.<payload>.<sig>`, HMAC-SHA256 under a key derived from `PAY_LINK_SECRET` (or `AUTH_SECRET` with its own label, so the two can never be crossed), carrying one lot, one amount, one reference and one payee until it expires (30 days, clamped 1–120). The page verifies it at the public `POST /api/v1/payments/link/verify` and shows **the council's bill** — amount, reference, payee, expiry — with the lot fixed and the demo furniture (receipt tape, vendor card, lots list) gone, because an anonymous payer has no business seeing other owners' rows. Both money routes accept the link in place of a session: the amount, lot, reference and **payee** come from the link's claims, so the payer's page cannot change them; the status read is scoped to that one bill (`404` for any other); both answers say `viaLink: true`. **Three defects the browser found that reasoning did not:** a host with no Interac provider answered `200 { ok: false }` and the page rendered that as a started request with a **Live request badge on nothing** (now `503`, and the client refuses any body whose `ok` is not true); `isTrustedGateway(undefined)` threw instead of refusing; and `assertRequestable` allowed `http://localhost` but not `http://127.0.0.1`. The token survives rail and lot changes (`sheetSearch`) and is **stripped from the address handed to the bank** (`providerReturnHref`) — it is remembered per request id in `sessionStorage`, never put in Interac's return URL. **Verified in Chrome** against a memory-backed host on the same origin with **no session on the page**: the bill renders ($921.00 / `LMS2847-305-202610` / `fees@lms2847.invalid`), the request starts with `viaLink: true` and `amountBasis: 92100` even though the body it sent claimed 1 cent and lot `U-999`, the payer reads that request back with the link (200), another bill's link gets 404, no credential gets 401, a tampered token shows the refusal card with **no amount at all**, switching to Bitcoin keeps both the token and the council's amount, and a plain visit is still the demo sheet. 17 new backend tests, 6 new frontend tests, 6 catalog keys × 9 locales. Known issue found on the way, **not** fixed here: `PUBLIC_API_BASE_URL` is not applied at build time (only the runtime `openstrata-api-base` override works). `check` 0/0, **293 frontend tests**, **267 backend tests**, `audit:i18n` **1064 × 9**, build green.

---

# openstrata — Last Updated 2026-10-16 by Buffy (M3) — Interac e-Transfer rail (v0.3.31)

> **The e-transfer panel on `/pay` now opens the payer's own bank.** Cam asked for full Interac support from `innovation.interac.ca` with a button that completes the handshake — it shipped as **Interac e-Transfer Business Request Money**: one button (**Open your bank and pay**) starts a request carrying the lot's amount and the sheet's reference, the payer is handed to Interac to choose **their own** financial institution and approve from their banking app, and the answer comes back with the request id in the URL. **The rule is stated rather than worked around:** Interac issues that credential **through a participating financial institution** (BMO, CIBC, DC Bank, Peoples Trust, Scotiabank today), so the merchant credential lives on the council's host (`INTERAC_*`) and the button runs the same handshake as a **labelled simulation** — `demo: true`, nothing sent, no bank contacted — until one exists. Rules live in `src/lib/interac.ts` (**26 tests**): seven states with unknown values refused, the request builder, the **gateway allow-list** (https on Interac's domains or hosts the council names; anything else is never opened), and the return contract. Backend: `backend/src/rails/interac.ts` (rehearsal + live HTTP provider) with three routes and **21 tests**; `/rails/status` says `interac: { configured, live }`. **Two honesty rules are load-bearing and tested:** a status that arrives in a link is a **claim** — the card reads *"Returned from your bank — waiting for the council to confirm"* and never "paid" on a URL's word — and a request **never moves backwards**, so a replayed webhook cannot un-deposit a completed transfer or resurrect a stopped one. A configured-but-unreachable host is a failure, not a rehearsal. **Verified in Chrome on the built artifact:** all 40 lots (dialog amount == lot amount, 0 mismatches), the 3 zero-balance lots (no button at all), decline, cancel, four return links, Escape, keyboard entry, **0 text below 4.5:1** inside the dialog at 1280px and 390px in both themes with no overflow, and the **live branch against a local stand-in host** — trusted gateway → Continue button, untrusted → refused with nothing opened, unreachable → the failure line. Two bugs the sweep caught in the new code: the card never left the bank picker after approval, and the dialog printed "approved and deposited" on a link alone. `check` 0/0, **287 frontend tests**, **250 backend tests**, `audit:i18n` **1058 × 9**, `audit:contrast` pass, build green.

---

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
