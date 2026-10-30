// AUTO-GENERATED from CHANGELOG.md — do not edit by hand.
// Regenerate with: node scripts/generate-changelog.mjs
// src/lib/changelog.test.ts fails if this file drifts from the changelog.

export type ChangelogGroup = { label: string; items: string[] };

export type ChangelogRelease = {
  version: string;
  /** ISO date, or null for a release whose notes never got a body section. */
  date: string | null;
  groups: ChangelogGroup[];
};

/** Releases with full notes, newest first. */
export const changelogReleases: ChangelogRelease[] = [
  {
    "version": "0.3.58",
    "date": "2026-10-29",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Payables at the close (/accounting). The Payables tab prints: five vendor bills and the CRA remittance, $6,617.10 open, the days each has left from the 30 September 2026 close (7, 10, 15, 15, 20, 20) and the thirty-day window ending 30 October 2026. Vendor bills are $6,500.00 and source deductions $117.10, named apart because 2100 is held for the CRA and remitted rather than paid to a supplier. src/lib/payables-sheet.ts (6 tests) takes the day count from the books' own close, so an overdue bill prints a negative count rather than a zero; the total is the rows added and both windows are cut from it.",
          "A trial balance on paper (/accounting). The Journal tab's second sheet adds September by four-digit code: 18 accounts, $60,784.68 of debits against $60,784.68 of credits, a balance column adding to $0.00, and a difference row reading *Debits and credits agree*. An account debited and credited back still prints, because a trial balance is a period and not a status list. src/lib/trial-balance.ts (7 tests) names the 26 accounts that carry a year-to-date balance and no September entry under the table, so a page built from a nine-entry journal cannot look complete while being partial; those accounts are never counted in its totals. A month before the journal begins has nothing to add and prints no second sheet.",
          "The proxy card (/meetings). Behind the packet: lot, owner, appointee, the appointment, a direction, a signature and the day it is due — 5 May 2027, fourteen days before the AGM — with the quorum noted as 14 of 40 lots. src/lib/proxy-card.ts (6 tests) takes the deadline from the packet's own arithmetic rather than a second subtraction, and counts a card only when it names a lot and an appointee, is signed and arrives by the deadline; a blank direction is a discretion, because the bylaws do not require one.",
          "The fee schedule by lot (/units). All 40 lots with their entitlement, the $4.50-a-point fee, the operating and reserve split and the annual total: $27,000.00 a month and $324,000.00 a year against the budget's own line, with the CRF column adding to $43,200.00. src/lib/fee-schedule.ts (7 tests) computes each row from the points and the two rates, so the split cannot fail to add back, and the eight tenanted lots print first without the other thirty-two being dropped. The plan steps aside while the sheet is open, so print is the sheet alone."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Two print defects found in Chrome. The fee schedule ran to three Letter pages at 1,169px; tighter rows and the tenant on the owner's own line took it to one page at 905px of the 927 a page box holds. The units page's own 32px screen padding then pushed that sheet onto a second page, so print zeroes it (print:px-0 print:py-0).",
          "The queue is refreshed. The four shipped slots are replaced by a Form F certificate on paper (/units/207), the AGM notice as a letter to owners (/meetings), a vendor spend summary for the year (/accounting) and a bylaw fine register (/meetings). Recorded in docs/ROADMAP.md, /roadmap, static/llms.txt, WORKPLAN.md, docs/WORKPLAN.md, LATEST-UPDATE.md and .ai_docs/current-status.md."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "32 new tests: 6 for the payables rules, 7 for the trial balance, 6 for the proxy card, 7 for the fee schedule and 6 route tests (four for /accounting, one for /meetings, one for /units).",
          "Printed and measured in Chrome: payables one Letter page (572px), the journal two (the cash statement, then the trial balance), meetings two (the packet, then the proxy card) and the fee schedule one at 905px, all 176mm wide with .no-print measured as display: none.",
          "Frontend 727 passed across 75 files, Svelte check 0 errors / 0 warnings, translation audit 1,753 keys × 9 locales (52 new) across 35 route components, contrast audit 218 pairs, secret gate green, production build green."
        ]
      }
    ]
  },
  {
    "version": "0.3.57",
    "date": "2026-10-29",
    "groups": [
      {
        "label": "Added",
        "items": [
          "The parkade levy as its own statement (/accounting). A new Parkade levy tab prints the trust on one page, apart from the operating books: $216,000.00 assessed at $36.00 a point, $207,948.00 collected, $8,052.00 still owed, $176,400.00 paid to Seawall Membrane, $31,548.00 in the trust and $39,600.00 of work left. The lots that still owe are named largest balance first — 207 $3,552.00 with no schedule, 403 $2,700.00 at $450.00 a month, 108 $1,800.00 at $300.00 — and the 37 that paid in full are one line of money, $199,224.00, rather than thirty-seven rows of zero.",
          "src/lib/levy-sheet.ts (16 tests) holds the rules. The assessment is the lots' entitlement at the resolution's rate and never a typed total, so a reader can rebuild $216,000.00 from the 40 rows; the sheet fails if the resolution's own figure disagrees with what the lots add to. Collected is assessed less what is still owed, so the two halves always add back. The trust has to come out even two ways — cash plus what owners owe, against assessed less what the contractor has been paid — and the difference is printed on the row a reader would check; a test moves the cash by $1.00 and watches it appear. A lot can never owe more than its own share, a payment plan is named beside a balance and never subtracted from it, and the sheet refuses to print a holdback: a holdback is withheld from a payment, these books record none, and the basis says so instead of inventing a retention the ledger cannot support.",
          "src/lib/components/LevySheet.svelte. The letterhead and reference block, the trust table (assessed, collected, owing, spent, cash, work left, and the check reading $0.00 agrees), the lots table with points, assessed, paid, owing and the agreed plan, the settled line in its foot, the sentence that the assessment is the lots added at the point rate, the basis and the sample line.",
          "The printed budget in the reader's language (/accounting). src/lib/budget-copy.ts joins each four-digit code to the catalog key that holds its translated name and its reason — 37 names and 8 reasons — and printedLine replaces only those two fields, so the sheet's arithmetic cannot move when the language does. A line reading 6100 Insurance becomes 6100 Assurances in French with the code still in front, and a code the catalog does not know keeps the books' name rather than going blank.",
          "The Form K register in the AGM package (/documents). The stack is now five sheets — contents, the year, the packet, the reserve plan and the register — built from the same formKRegister call /units/register makes, so a filing recorded on a lot's sheet in this browser closes its gap on the printed page too. The contents page lists all four documents and the hint says four, not three."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The queue is refreshed. The payables sheet for the close (/accounting) keeps its slot beside three new offers: a trial balance on paper (/accounting), a proxy card with the notice (/meetings) and the fee schedule by lot (/units). Recorded in docs/ROADMAP.md, /roadmap, static/llms.txt, WORKPLAN.md, docs/WORKPLAN.md, LATEST-UPDATE.md and .ai_docs/current-status.md."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "21 new tests: 16 for the levy's rules (a lot's share, the owing lots in order, the settled lots counted, the shares adding to the assessment, collected adding back, the trust even two ways, a moved balance printing its difference, a resolution total the lots cannot rebuild, a remaining figure that does not tie, a clamped share, the tie-break, and an empty building), 4 for /accounting (the sheet and its figures, the three lots named with their plans and the settled line, the point rate and the refused holdback, and the tabs off the paper) and 1 for /documents (the register on its own page, plus the contents page naming four sheets).",
          "Printed and measured in Chrome: the AGM package on five Letter pages (contents, year, packet, reserve, register) and the levy statement on one, with the tabs and the print button measured as display: none.",
          "Frontend 695 passed across 71 files, Svelte check 0 errors / 0 warnings, translation audit 1,701 keys × 9 locales (63 new) across 35 route components, contrast audit 218 pairs, secret gate green, production build green."
        ]
      }
    ]
  },
  {
    "version": "0.3.56",
    "date": "2026-10-29",
    "groups": [
      {
        "label": "Added",
        "items": [
          "The close, reconciled (/accounting). The Overview tab now prints the page behind its close checklist: the three balances the credit union reports, then every fund counted from its accounts and again from the year's activity, with the difference between the two counts printed rather than asserted. It is the books' own figure — $717,034.42 on deposit, the operating fund $107,358.32 both ways, the reserve $603,780.00, the levy's work left $39,600.00, and the budget $0.00.",
          "src/lib/close-reconciliation.ts (11 tests) holds the rules. Cash comes first because it is the only figure on the sheet from outside these books: 1010 $81,797.62, 1020 $603,688.80, the levy trust $31,548.00. The operating fund is counted from its accounts — cash, receivables $2,607.40, prepaid insurance $24,300.00, the war chest at cost $6,885.00, less bills payable $6,500.00, prepaid October fees $1,614.60 and source deductions payable $117.10 — and again from the year: equity at 1 April $91,480.00, fees earned $140,400.00, other income $2,920.00, less expenses $127,441.68. Both routes close on $107,358.32. The reserve does the same ($603,780.00 from cash plus fee arrears less prepaid fees, and from opening plus contributions plus interest less the $6,400.00 elevator study). The levy is counted as work left, not as cash that looks like equity: $31,548.00 in the trust plus $8,052.00 still owed is $39,600.00, which is also the $216,000.00 assessed less the $176,400.00 spent on the membrane. The budget has one count and must come to zero, with the reserve contribution as a deduction, because it is a transfer to another fund and not income. Two checks carry no amount and are stated instead: every journal entry's debits equal its credits, and the 40 lots add to 6,000 points, the schedule's own total.",
          "Every total is the sum of its lines, and the difference is the two totals subtracted. Nothing on the sheet is a typed figure, so a balance that moves prints the gap on the row a reader would check: the module takes the books as a parameter, and a test moves one balance by $1.00 to watch a $1.00 difference appear. Another test breaks the journal flag and the annual other income, and each fails the sheet without fabricating a difference in the funds.",
          "src/lib/components/CloseReconciliation.svelte. The letterhead and reference block, one table with a head per fund and a mono sub-head per count when a fund has two (from the accounts / from the year's activity), every label carrying its ledger code, the two totals, a difference row reading $0.00 agrees, the two checks with their status, the basis and the sample line. The cards, the chart, the September close checklist and the period notes are no-print on that tab, so the overview's paper is the reconciliation; the tab gains a print button with its hint."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "src/app.css adds .recon-doc to the 176 mm print rule with a 4 mm gutter, like the other money sheets. The sheet's own print rule lets its table break between rows while each fund's tbody stays whole.",
          "The queue is refreshed. A payables sheet for the close (/accounting) takes the shipped slot beside a levy statement of its own, the budget in the reader's language and the Form K register in the package, so four offers are waiting. Recorded in docs/ROADMAP.md, /roadmap, static/llms.txt, WORKPLAN.md, docs/WORKPLAN.md, LATEST-UPDATE.md and .ai_docs/current-status.md."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "17 new tests: 11 for the reconciliation (the three balances added, the operating fund by both routes, what the fund owes taken off rather than netted, the reserve by both routes, the levy as work left, the budget at zero with the reserve as a deduction, every check holding, a moved figure printing its difference, the cash total following its balances, a broken journal failing the sheet, and a budget that no longer comes to zero) and 6 for /accounting (the sheet on the overview, the three bank balances and their total, the two counts of each fund with three zero differences, the two amountless checks, the screen furniture off the paper, and a month carried in leaving the sheet at the close).",
          "Printed and measured in Chrome: two Letter pages — the generic table { break-inside: avoid } rule had made the sheet one unbreakable block and produced three pages with the letterhead and the foot on pages of their own. The sheet is 176 mm wide and 1,231 px tall (325.7 mm of the 490.8 mm two pages hold), with .no-print measured as display: none.",
          "Frontend 674 passed across 70 files, Svelte check 0 errors / 0 warnings, translation audit 1,638 keys × 9 locales (25 new) across 35 route components, secret gate green, production build green."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "The offer asked for the credit union's balance beside the book's with every timing difference named. The sample books hold no unrecorded cheques or deposits in transit, so there is no timing difference to print and none was invented; what the sheet proves is that each fund reaches the same balance by two independent routes. A real bank reconciliation needs the deposit-in-transit and outstanding-cheque records the ledger does not carry yet."
        ]
      }
    ]
  },
  {
    "version": "0.3.55",
    "date": "2026-10-29",
    "groups": [
      {
        "label": "Added",
        "items": [
          "The cash statement with its chain (/accounting). The Journal tab now prints the operating account as its own page: the account named on the letterhead, the opening balance, every journal entry with its movement, running balance and hash, the closing balance, and the chain head. It is the book's own figure — $59,145.60 opening, $22,652.02 moved, $81,797.62 closing, which is the operating cash the overview and the Three funds tab report — so a reader can add the printed column up and land on the account's own cash.",
          "src/lib/cash-statement.ts (11 tests) holds the rules. The statement is one named bank account — 1010 operating — because a statement that ran on both bank accounts would answer a question nobody files; the reserve has its own five-year page. But every entry in the journal prints, including the five that did not move this account: a hash covers its entry and the hash above it, so removing a row would break every hash below and tell a reader the chain is unbroken while making it impossible to check. Those rows print a dash in the movement column and leave the balance alone. The opening balance is the closing less what the journal moved, so the column adds to the closing instead of trusting a typed opening. A stopped statement keeps the same opening and folds nothing back: a month carried in prints the entries posted by that day. And the check that the book has no forgotten account is arithmetic: the operating opening ($59,145.60) and the reserve opening ($599,642.40) add back to the journal's own combined opening, $658,788.00.",
          "src/lib/components/CashStatement.svelte. The letterhead and reference block (fiscal year, statement date, account code), three summary figures — opening, movement with 4 of 9 entries on this account, closing — a five-column table with the hash printed under each memo in mono, a closing row, the tie (or, for a stopped month, the note that it cannot tie to a close it has not reached), the basis (1020 reserve and the parkade levy are separate funds; 1080 war chest at cost is not cash), and the chain head printed from the genesis link.",
          "The paper is the sheet, not the screen. The Journal tab's intro, opening and closing lines, screen table and chain note carry no-print, the page header and period banner come off the paper on that tab as they do on the budget's, and the tab gains a print button with its hint. The drawer still opens on screen, and a ?tab=journal#entry-<hash> link still lands on its row."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "src/app.css adds .cash-doc to the 176 mm print rule and gives it a 4 mm gutter, like the arrears ladder: its last column is right-aligned, so the last glyph would otherwise sit on the sheet's edge.",
          "The queue is refreshed. A reconciliation sheet for the close (/accounting) takes the shipped slot beside a levy statement of its own, the budget in the reader's language and the Form K register in the package, so four offers are waiting. Recorded in docs/ROADMAP.md, /roadmap, static/llms.txt, WORKPLAN.md, docs/WORKPLAN.md, LATEST-UPDATE.md and .ai_docs/current-status.md."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "16 new tests: 11 for the statement's rules (one account, every entry printed, the balance untouched by a row that missed the account, the war chest and payroll movements, the account named per row, the journal's own hashes, the column adding to the closing, a stopped month, an empty period, the reserve from the same rules, and the two openings adding to the combined opening) and 5 for /accounting (the sheet on the page with its figures and tie, nine hashes with the head, the screen table and its drawer still on screen, the stopped month's note, and a month before the journal printing only its reason).",
          "Printed and measured in Chrome: one Letter page; the sheet is 665.19 px wide (176 mm) inside the page box, 695.52 px of the 927 px a Letter page holds, with .no-print measured as display: none, the nine entry hashes and the chain head in the printed DOM, and the body no taller than the sheet.",
          "Frontend 657 passed across 69 files, Svelte check 0 errors / 0 warnings, translation audit 1,612 keys × 9 locales (16 new) across 35 route components, secret gate green, production build green."
        ]
      }
    ]
  },
  {
    "version": "0.3.54",
    "date": "2026-10-29",
    "groups": [
      {
        "label": "Added",
        "items": [
          "The arrears ladder on paper (/accounting). The Receivables tab prints as one page for the table: the lots with money past due, each charge aged into the column it belongs in (current / 1–30 / 31–60 / 61–90 / 90+), the columns added up, the Form F flag, and one line that accounts for every other lot. The receipt is the books' own — $6,499.00 past due, the same figure the cards above carry, across 3 of 40 lots — and the sheet is rebuilt from every lot, so the screen's “past due only” toggle cannot move a printed total.",
          "src/lib/arrears-sheet.ts (10 tests) holds five rules. The ladder is the lots past due, not every lot that owes: 33 of the 40 lots owe only next month's fee, and printing 33 rows of a fee that is not late would bury the three that are. The page still accounts for the whole book — the other lots' $23,130.00 not yet due and the standing $31,636.00 are in the line beneath the table, so the paper reconciles to the ledger without a second sheet. The columns add to the printed total ($8,506.00, which is $6,499.00 past due plus $2,007.00 of the same lots' next fee) rather than to a second computation. A plan balance is a schedule and stays outside every bucket: lots 108 and 403 are named under the table with $1,800.00 and $2,700.00 standing. And a lot that owes nothing is counted, not printed as a row of dashes — 3 of 40 have nothing on the books at all.",
          "src/lib/components/ArrearsSheet.svelte. The council's letterhead, the statement date, three summary figures (past due, past due over 90 days at 65% of it, the 322-day levy on lot 207), the eight-column table with the owner under the lot and a dash in every empty cell, the plans list, the clear-lot count, the basis and the sample line."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The Receivables tab's screen half is no-print. The cards, the filter, the ladder, the plan block and the note stay on screen; the header and the period banner come off the paper on that tab exactly as they do on the budget's, so what prints is the sheet and nothing else.",
          "src/app.css: .arrears-doc joins the 176 mm print rule, and gets a 4 mm gutter. Its right-hand column is right-aligned — the letterhead's dates, the totals, the plan amounts — so without the gutter the last glyph sits on the sheet's edge; printing it showed a clipped “2026” and a clipped “payment plan”.",
          "The queue is refreshed. A cash statement with its chain (/accounting) takes the shipped slot beside a levy statement of its own, the budget in the reader's language and the Form K register in the package, so four offers are waiting. Recorded in docs/ROADMAP.md, /roadmap, static/llms.txt, WORKPLAN.md, docs/WORKPLAN.md, LATEST-UPDATE.md and .ai_docs/current-status.md."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "16 new tests: 10 for the sheet's rules (the past-due lots in age order, the other 34 and the standing total, every column adding to the footer, every lot counted once, the plans outside the ladder, a late lot's next fee in its own column, the oldest money and the 90-day share, the order it was handed, an empty book, a plan-only lot), 3 for the sheet component (the columns and the withheld flag, the footer and the book line, French) and 3 for /accounting (the sheet on the page, the cards and filter still on screen, the paper unchanged when the screen widens to every lot).",
          "Printed and measured in Chrome: one Letter page; the sheet is 176 mm wide inside the 187.9 mm page box, 537 px of the 927 px a Letter page holds, with no descendant past its right edge and no clipped cell. The April book (?period=2026-04) prints its single levy row on one page at 474 px.",
          "Frontend 641 passed across 67 files, Svelte check 0 errors / 0 warnings, translation audit 1,595 keys × 9 locales (12 new) across 35 route components, secret gate green, production build green."
        ]
      }
    ]
  },
  {
    "version": "0.3.53",
    "date": "2026-10-29",
    "groups": [
      {
        "label": "Added",
        "items": [
          "The AGM package in one print (/documents). The year's sheet, the meeting packet and the reserve plan were three separate print buttons on three pages; /documents now prints them as one stack — a contents page, then each sheet on its own page, in the order the contents page names. ?package=1 opens the stack, the package button prints it, and a document picked from the picker leaves the package mode because a pick is one document, not a set. The pack is assembled from the records the other pages read: the year's sheet is buildYearSheet(yearBook) with the same six health points the dashboard's trend drew, and the packet is the same component /meetings prints, so the package cannot disagree with the pages it replaces.",
          "src/lib/components/ReserveSheet.svelte is the reserve fund on paper. Five fiscal years with opening balance, the budget's contribution, the interest the credit union paid, the projects the depreciation report schedules and the closing balance, then the year that runs short and the four notes (the report, the rate, the contribution gap, the levy's exclusion). It reads reservePlan(reservePicture.input) — the same call the Reserve plan tab makes — so the sheet and the tab cannot drift.",
          "Filters that stay put (/units). The search box, the tone filters and the floor are kept on the device and restored when a reader comes back from a lot's sheet; one button clears all three and removes the record. src/lib/unit-filters.ts (10 tests) holds three rules: only a readable filter is restored, one part at a time (an unknown tone costs the reader their search only if it is the search that is unreadable, which it is not); nothing is stored when nothing is filtered, so a reader who never filtered leaves no trace; and a saved query is trimmed and bounded at 80 characters. A ?tone= link wins over the stored filter, because a dashboard activity that names the arrears means the arrears.",
          "The budget's reasons, beside the variance (/accounting). The printed sheet said how far each line sits from plan; it now prints why, in a phrase beside the amount: the concierge's 1 September start, the fire inspection on 8 October, the parkade gate motor. src/lib/budget-sheet.ts carries the phrase and holds the rule: a reason belongs to a variance that exists, so a line exactly on plan and the reserve contribution drop theirs rather than suggesting a move that did not happen."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "src/lib/demo/books.ts carries the reasons. A reason beside the existing note on each expense line, because the two answer different questions: the note explains the line to anyone reading the books, the reason is the phrase a printed budget puts beside the number. Eight lines carry one today, and a line with no story behind its variance has none — which is its own answer.",
          "The budget sheet is a little tighter to hold the reasons on one page. Rows are 7.2pt at 1.18 leading with half a pixel of cell padding, the reason prints at 6.2pt italic, and three rules and a padding step were trimmed; measured in print media the sheet is 905px inside the 927px a Letter page holds, so it is still one page. Printing all fifteen candidate reasons made it 1,075px and two pages, which is how the list was cut to the lines a council is actually asking about.",
          "The queue is refreshed with the three picks' replacements. The levy's own statement, the budget in the reader's language, the Form K register in the package and the arrears ladder on paper are waiting — four offers, none started. Recorded in docs/ROADMAP.md, /roadmap, static/llms.txt, WORKPLAN.md, docs/WORKPLAN.md, CHANGELOG.md and .ai_docs/current-status.md."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "28 new tests: 10 for the filter rules (one-part fallback, a floor from a string or refused off the building, a trimmed and bounded query, a round trip, forgetting the record, corrupt storage, storage that throws), 6 for /units (nothing kept, a restored search, a restored tone and floor, a filter saved as it is typed and forgotten when cleared, a tone link beating the device, an unreadable tone not hiding the building), 5 for /documents (the package as four pages in order, one contents page, one of each sheet, the contents naming what is inside, the controls off the paper), 5 for the budget's reasons (printed on a moved line, dropped on plan, dropped on the reserve, trimmed, never on a row without a verdict) and 2 for /accounting (the reason beside the variance, the note not mistaken for one).",
          "Printed and measured in Chrome: the budget sheet is 905px tall inside a 927px Letter page and comes out as one page with no clipped cell; the package comes out as four pages, with the year sheet at 875px, the packet at 893px, the reserve sheet at 526px and the contents page at 486px, and no descendant past the sheet's right edge on any of them.",
          "Frontend 625 passed across 66 files, Svelte check 0 errors / 0 warnings, translation audit 1,583 keys × 9 locales (7 new) across 35 route components, secret gate green, production build green."
        ]
      }
    ]
  },
  {
    "version": "0.3.52",
    "date": "2026-10-29",
    "groups": [
      {
        "label": "Added",
        "items": [
          "A budget that prints (/accounting). The Budget tab is now the page a council reviews at the table: every income and expense line with its annual budget, the year to date, what is left and the variance, then the reserve contribution and the result. The year's plan is $0.00 by design and balanced; six months in, the result is $15,878.32 against a plan of $0.00, so the sheet prints $15,878.32 over — the books' own surplus, not a second computation of it. The header, the tabs and the print control carry no-print on that tab only, so the reserve plan keeps printing with its header.",
          "src/lib/budget-sheet.ts (13 tests) holds four rules. The plan to date is the annual figure pro-rated to the six months the books cover — 50% of every line — because nine months of actuals against twelve months of plan would make every line look under, and a variance nobody can trust is worse than no column. Variance is always the year to date less the plan to date, so the sign means one thing on every row and only the verdict changes with the side of the page: spending over plan and income short of plan are unfavourable and print bold. The reserve contribution carries no verdict (na) — a fund ahead of its contribution is a council decision, not a slip. And the result is the three groups added rather than a fourth division, so a reader who adds the page up lands on the printed surplus.",
          "The year's deadlines on one page (/calendar). Twelve month rows of the fiscal year, each column a day of the month: the payroll window as a bar across each month's 1st to 15th, the EPR and SVT windows shaded, the T2 and T4 deadlines as dark cells, and an orange rule on each of the 18 dated items listed beneath. The fiscal year is 365 days, February 2027 has 28 cells, and the windows carry their own dates: EPR 1 Jan – 31 Dec 2026 (275 of 365 days inside this year), SVT 1 Jan – 31 Mar 2027 (90 days), T2 30 Sep 2026, T4 28 Feb 2027, payroll 12 windows of 15 days each.",
          "src/lib/year-calendar.ts (13 tests) holds the rest. A window keeps its true dates when the grid cannot hold it rather than being shortened to fit. The monthly rhythm is detected from the data — a title, or a category-and-day, repeating in six or more months — so the fee run, late fee, council meeting, reconciliation and remittance are left out and the one-off items are readable. And nothing dated is dropped: the AGM window (1 April – 31 May 2027, 61 days) is drawn on its own two-month strip below the year, with the six items after 31 March listed under it."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Two print defects were found by making the paper and measuring it. The budget sheet ran onto a second page at 8.4pt with 43 rows; the table is now 7.2pt with tighter rules and holds one Letter page at 176 mm. On a phone the five money columns clipped their own amounts, so the sheet scrolls its table inside itself at a 560px floor while the print rules restore full width — no page overflow and no clipped cell at 390, 620, 900 or 1280.",
          "src/app.css adds .budget-doc and .year-cal-doc to the 176 mm print rule.",
          "The queue is refreshed with the two picks' replacements. The budget's reasons beside the variance (/accounting) and a levy statement of its own (/accounting) take the two picked slots beside the AGM package and filters that stay put, so four are waiting. Recorded in docs/ROADMAP.md, /roadmap, static/llms.txt, WORKPLAN.md, docs/WORKPLAN.md and .ai_docs/current-status.md."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "37 new tests: 13 for the budget's rules (the pro-rated plan, a clamped month count, the verdicts, the groups adding up column by column, the result landing on the books' surplus, and the real lines — insurance on plan, hydro $720 over, the concierge $7,440 under, the reserve carrying no verdict), 13 for the year calendar (twelve real months, payroll's 12 windows of 15 days, the EPR's clipped 275 days, SVT's 90, the T2 and T4 on their own days, the AGM window outside the year, the rhythm detected and excluded, nothing dropped, the marks on the grid), 7 for the /calendar sheet and 4 for the /accounting budget tab.",
          "Both sheets printed to Letter PDFs in Chrome and read back at page size: one page each, the sheet held to 176 mm, no horizontal overflow, and the year sheet's item columns aligned.",
          "Frontend 597 passed (37 new), Svelte check 0 errors / 0 warnings, translation audit 1,576 keys × 9 locales (46 new) across 35 route components, contrast audit 218 pairs, secret gate green, production build green with the year sheet in build/calendar.html and v0.3.52 on the page."
        ]
      }
    ]
  },
  {
    "version": "0.3.51",
    "date": "2026-10-29",
    "groups": [
      {
        "label": "Added",
        "items": [
          "A receipt you can hand over (/pay). One printed page per payment, on the council's letterhead: the amount received, who paid, the lot, the rail, the reference, the transaction for a rail that has one, the rate a bitcoin payment locked at with the sats that rate bought, and the fee's own split between the two funds. Lot 305's September fee prints as $576.00, split $499.20 operating and $76.80 reserve, settled on Lightning at $135,820 a bitcoin for 424,091 sats. Every row in the tape carries a Receipt button, the newest payment is picked on arrival so a print button always yields a real page, and the paying sheet, the tape and the vendor panel carry no-print — what leaves the printer is the receipt alone.",
          "The rules live in src/lib/pay-receipt.ts (9 tests), and each one is a decision. The split is cross-multiplied from the amount in the fee's $3.90 / $0.60 a point ratio and the reserve takes the rounding remainder, so the two parts always add back to the amount — a receipt a cent out is one an owner will query. A transaction id belongs only to a rail that has one: a txid recorded against a cheque is dropped rather than printed. And a locked rate is quoted from the payment's own record and never recomputed, because a receipt that re-priced an old payment at today's rate would state a number nobody paid; a bitcoin payment with no recorded rate says so instead.",
          "The demo's bitcoin rows carry what settled them. Lot 305's Lightning payment and lot 410's on-chain payment now store the rate they locked at ($135,820) and their transaction, so the receipt prints the figures the payment actually had.",
          "Search that reaches the workspace (⌘K). The index grows from ten groups to thirteen: 40 lots, the journal's 9 entries and the tax desk's 13 sections, each result opening the row it names — /units/305 for a lot (by number or by owner), /tax#gst for a section, and /accounting?tab=journal#entry-<hash> for a journal entry.",
          "A journal link opens the entry, not the tab. /accounting now reads its tab and an #entry-<hash> from the URL and opens that drawer, so the row a result names is the row the reader lands on. The opening-cash subtraction moved into ledger-statement as OPENING_CASH, because the index and the page must chain the same hashes: a second copy of that arithmetic would have produced links to entries that do not exist.",
          "The lot pages are in the sitemap. The sitemap grew from 30 routes to 70, because /units/[lot] is a real page for all 40 lots and search now sends readers there."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The queue is refreshed with two picks' replacements. The AGM package in one print (/documents) and filters that stay put (/units) take the two picked slots beside the budget that prints and the year's deadlines on one page, so four are waiting. Recorded in docs/ROADMAP.md, /roadmap, static/llms.txt, WORKPLAN.md, docs/WORKPLAN.md and .ai_docs/current-status.md."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "25 new tests: 9 for the receipt's rules, 6 rendering the sheet (amount, split, transaction, locked rate and sats, the no-rate sentence, and French), 3 for the /pay route (the newest payment prints, a picked row fills the sheet, the print control stays on screen), 4 for the index (every lot, entry and tax section; a lot by owner; a journal link by that entry's hash; a tax section on itself), and 3 for the accounting link (the drawer a hash names, the last entry, a tab it cannot name).",
          "The receipt printed to a Letter PDF in Chrome and read back at page size: one page, the sheet held to 176 mm, no horizontal overflow, one .print-doc on the page, and the tape's heading gone under print media.",
          "Frontend 560 passed (25 new), Svelte check 0 errors / 0 warnings, translation audit 1,528 keys × 9 locales (15 new) across 35 route components, contrast audit 218 pairs, secret gate green, production build green with the receipt in build/pay.html and the 40 lot pages in the sitemap."
        ]
      }
    ]
  },
  {
    "version": "0.3.50",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Added",
        "items": [
          "A year on one page (/). The dashboard now ends in a printable annual summary for the AGM package: income and spend by category, each with its own total and its budget column; the three fund balances at the September 30 close and their total — $81,797.62 + $603,688.80 + $31,548.00 = $717,034.42; the compliance score from April 2026: 82 of 100 → September 2026: 56 of 100, down 26; and all 3 tracked items with their dates and day counts, 0 of them overdue. The button is the page's only print control, so what leaves the printer is the sheet and not the dashboard.",
          "The rules live in src/lib/year-sheet.ts (9 tests). Every figure is read from the books, not retyped. A ledger code no category claims is returned in unmatched and left out of the rows, so a new account code shows up as a defect instead of making the totals quietly disagree with /accounting. The operating surplus is income less spend and never nets the CRF contribution: a dollar moved to the reserve is still the owners' money, and counting it as an expense would make the year look poorer than it is. The reserve's balances appear in the funds block, where they belong.",
          "An open item is tracked and dated, and an overdue one is counted. A deadline stays on the sheet after its date passes, under an overdue count, because the page a council signs should not lose the item it missed.",
          "The score is passed in, not recomputed. The dashboard hands the sheet the same six points its trend drew, so a Form K recorded on a lot's sheet reaches both the paper and the gauge, and the sheet cannot print a score the page above it is not showing.",
          "The AGM packet (/meetings). One page carrying the notice, the agenda, the last minutes and the quorum maths: the council meets 20 October 2026, notice due 13 October — 7 days ahead of the meeting, inside the 7-day window — quorum 3 of 5, and the annual meeting that follows it on May 19, 2027 with 14 of 40.",
          "The arithmetic lives in src/lib/meeting-packet.ts (5 tests). The last lawful day is the meeting less the statutory window — 7 days for council, 14 for an AGM or special general meeting, the same windows documents.ts prints on the notice itself. A notice given inside the window is late, not rounded up: record the day it was actually given and the same function says whether it was enough. Quorum is a majority of the seats as a whole number of people — 3 of 5, and also 3 of 4 — because a floor of half plus one is the only reading that never asks for fewer people than a majority. Calendar maths runs at UTC midnight, as everywhere else here, so a daylight-saving change cannot move a deadline by a day."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "The annual sheet no longer prints a second, blank sheet. The @page box already carries the 14 mm margin, and the app kept its screen gutters on top of it, so one page of paper became two. The print block now zeroes the shell's width, margin and padding and the page's body padding, and the year page's controller sits outside the sheet.",
          "A sheet is not wider than the paper. Both one-page sheets are held to 176 mm inside the 14 mm side margins, but a table's min-content width is a floor: the two score tables side by side pushed past the sheet and the last column was clipped at the paper edge, which on screen would have scrolled and on paper is simply gone. minmax(0, 1fr), min-width: 0 and table-layout: fixed let the cells wrap instead, and long money strings break rather than bleed.",
          "Only the sheet prints. The host-connect row, the skip link, the install chip and the offline banner joined the no-print list; the dashboard's welcome row, task list, metrics, buildings and proof band carry it too, as does everything on /meetings above the packet."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The queue is refreshed with two new offers, per the standing rule. A budget that prints (/accounting) and the year's deadlines on one page (/calendar) take the two picked slots beside the receipt and workspace search, so four are waiting. Recorded in docs/ROADMAP.md, /roadmap, static/llms.txt, WORKPLAN.md, docs/WORKPLAN.md and .ai_docs/current-status.md."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Six tests render the two sheets: income and spend with their totals, the three fund figures and the total, the score's two ends and its −26, the tracked items with their dates, the packet's four pieces, and both sheets printing in French.",
          "Both pages printed to A4 PDF in Chrome and read back at page size: one sheet each, no second page, no clipped column, and the packet's notice deadline and quorum legible at 100%.",
          "Frontend 535 passed (27 new), Svelte check 0 errors / 0 warnings, translation audit 1,513 keys × 9 locales (52 new), contrast audit 218 pairs, secret gate green, production build green with the annual sheet in build/index.html and the packet in build/meetings.html."
        ]
      }
    ]
  },
  {
    "version": "0.3.49",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Added",
        "items": [
          "A Reserve plan tab on /accounting. The CRF five fiscal years forward: opening balance, the budget's contribution, the interest the credit union actually paid, the projects the depreciation report schedules, and the balance each 31 March ends on. Fiscal 2026–27 opens at $586,400.00 and closes at $627,675.52; the report's boiler, elevator and envelope are covered; the 2031 roof leaves the fund $133,291.62 short, and the page says so above the table rather than under it.",
          "The rules live in src/lib/reserve-plan.ts (9 tests). The contribution is the budget's $43,200, never the report's recommended $48,000 — the page states the $4,800-a-year gap instead of drawing a fund the building does not have. Interest is 0.74% a year, the rate the statements paid, on the average balance; a year ending below zero earns nothing. A project named for a calendar year is paid in the fiscal year that ends in it, so the report's 2029 elevator lands in 2028–29. The parkade membrane stays out: the levy collected and spent its $216,000 in its own trust.",
          "The page names its basis. The report (RJC, dated 12 June 2024, next due 12 June 2029), the rate and the six months it was measured over, the contribution gap, and the levy's exclusion are all printed under the table, so a reader can check the projection against the documents it came from."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The tab bar no longer prints. The seven tabs carried no no-print, so every printed tab of the books opened with a row of navigation buttons. Printing from the Reserve plan tab now yields the page header and the table alone.",
          "The queue is refreshed with the pick's replacement. A year on one page (/) takes the slot beside the receipt, workspace search and the AGM packet, so four offers are waiting. Recorded in docs/ROADMAP.md, /roadmap, static/llms.txt, WORKPLAN.md, docs/WORKPLAN.md and .ai_docs/current-status.md."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Four route tests render the new tab: the five fiscal rows and the fund's first closing, the roof year and its $133,291.62 shortfall, the levy's $216,000 exclusion beside the $43,200 / $48,000 funding gap, and the print controls carrying no-print with the tab bar.",
          "Frontend 508 passed (13 new), Svelte check 0 errors / 0 warnings, translation audit 1,461 keys × 9 locales (17 new), contrast audit 218 pairs, secret gate green, production build green. Chrome was not opened this session; the rendered text was read in jsdom."
        ]
      }
    ]
  },
  {
    "version": "0.3.48",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Added",
        "items": [
          "The Form K register, on one printable page. /units/register lists every tenanted lot with the day its two-week window closed, whether the form is on file, the days a missing one has been missing and the points it costs — 309 at 77 days, then 209 and 407 at 15, longest-open first. The summary states the gaps, the denominator and the charge: 3 of 8 tenanted lots have no Form K on file. The score charges 15 points for them: 5 a gap, capped at 15. Print and back are no-print; the table is what leaves the printer. /units links it beside the filters it narrows.",
          "The rules live in src/lib/form-k-register.ts (9 tests). The per-gap charge and the cap are imported from health.ts, and the register's total is the same formKPenalty the gauge adds, checked at four statement dates. The cap is spent on the oldest gaps, so a fourth gap prints no points instead of adding past 15.",
          "An open window is listed, not charged. At 10 September lots 209 and 407 have no gap — their tenants had not moved in — and a window still open prints its closing day and costs nothing.",
          "A filing closes its gap from its own day. A Form K recorded on /units/309 turns the register into 2 of 8, 10 points with the date beside the lot; at 31 August the same record still shows 47 days, so the month that already closed keeps the score it earned."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The queue is refreshed with the pick's replacement. The reserve fund's five-year picture (/accounting) takes the slot beside the receipt, workspace search and the AGM packet, so four offers are waiting. Recorded in docs/ROADMAP.md, /roadmap, static/llms.txt, WORKPLAN.md, docs/WORKPLAN.md and .ai_docs/current-status.md."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "The page reads the model, not a copy of it. Five route tests render it: eight rows and no owner-occupied lot, the 77-day gap first with its −5, the summary sentence, a device-local filing moving it to 2 of 8 and 10 points, and the print controls carrying no-print.",
          "Frontend 495 passed (14 new), Svelte check 0 errors / 0 warnings, translation audit 1,442 keys × 9 locales (19 new), contrast audit 218 pairs, secret gate green, production build green with 3 of 8 tenanted lots in build/units/register.html. Chrome was not opened this session; the rendered text was read in jsdom."
        ]
      }
    ]
  },
  {
    "version": "0.3.47",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Added",
        "items": [
          "The funds, month by month. The funds tab now carries the credit union's six month-end statements as a table — operating, reserve, parkade levy, the three added, and the change since the month before — closing on the figures the rest of the books report: $81,797.62 operating, $603,688.80 reserve and $31,548.00 in the levy trust, $717,034.42 in all. src/lib/demo/cash.ts holds the statements, and src/lib/fund-history.ts holds the arithmetic (6 tests).",
          "The funds tab follows the month. /accounting?period=2026-04 reads Cash at April 30, 2026 — $47,583.16 operating, $590,000.00 reserve, $177,948.00 levy — instead of printing September's cash under an April heading, and says which lines are still the September 30 close.",
          "A month the bank has not closed is said to be one. A hand-typed ?period=2026-10 falls back to the close under a sentence that names the range the statements cover, rather than interpolating a balance nobody signed.",
          "A Form K can be recorded from the lot's sheet. /units/309#forms takes the date the form arrived (default: the day the gap is counted to) and records it on this device. The card reads On file — recorded 2026-09-30 in this browser, says nothing is sent to a host, and offers to take the record back off. src/lib/form-k.ts (6 tests) holds it.",
          "The score reads the filing. Three Form K gaps become two and September's point goes 56 → 61, while August stays 72: isFiled counts a filing only from its own day, so a form recorded today cannot rewrite the month it was not there for. The trend's open month drops the lot from its list at the same rule."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "A filing reaches the rest of the page. The /units Form K filter and the plan's tones read the same record, so a lot whose form is on file stops being drawn as a gap.",
          "The page-level note is narrower and true. It now says the overview cards, the budget and the payables stay at the September 30 close, and that the funds tab follows the month because the statements do."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "The statements tie, account by account. Tests assert September's row is the funds tab's own cash for all three accounts and their total, that every row's total is its three columns, that each change is this close less the one before, that six changes add to the year's movement, and that the levy's 1 April balance is exactly what was collected.",
          "The filing moves what it claims to and nothing else. Tests assert the gap count at the statement date and at the two month ends before it, the whole trend (82, 82, 82, 74, 72, 61), the month detail's Form K list, and that arrears are untouched at $649,900. A route test submits the form on /units/309, reads the recorded date back, files a different day, and removes the record.",
          "Frontend 481 passed (23 new), Svelte check 0 errors / 0 warnings, translation audit 1,422 keys × 9 locales (12 new), contrast audit 218 pairs, secret gate green, production build green with Record the Form K in build/units/309.html."
        ]
      }
    ]
  },
  {
    "version": "0.3.46",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Health over time on the dashboard. The compliance-health panel charts six fiscal months of the score — 82, 82, 82, 74, 72, 56 — each point rebuilt at that month end from the calendar, the dated charges and the lot register, with the three inputs beside it showing what each costs now, what it cost in April and the month it moved. The card above prints 56 instead of a hard-coded 91: card, gauge and trend read one model (src/lib/health.ts, 22 tests), and the gauge's demo deadlines count days from their due dates instead of a stored 127.",
          "Every column opens. A clicked month lists the charges that were past due at that month end and the lots whose Form K window had closed, drawn from the same functions the score read — September shows 10 charges, $6,499.00, and 3 Form K gaps; April shows the parkade levy alone and says no window had closed yet.",
          "A month of the health trend opens the books. The open month's detail carries an “Open in the books” button, and it goes to /accounting?period=YYYY-MM: the receivables ladder aged at that month's end, with a banner saying so and a way back to today's. September lands on the figures the point scored — $6,499.00 past due, 322 days on lot 207's November 2025 levy — and April on $3,552.00, the levy alone.",
          "src/lib/period-link.ts, the link's rules as a pure module (4 tests): a YYYY-MM month only, its month end computed through dayIn so February 2028 lands on the 29th, and everything else — 2026-13, 2026-9, 2026-09-30 — rejected. A mistyped link opens today's ladder, which is true, instead of a partial month that would not be.",
          "A second cut of the open month. The charge list now offers two readings of one list — every charge still standing at that month end, or only those that carry a date inside the month — with the cut's own total. September: 5 of 10, $1,515.00 of $6,499.00. April: none, which is the answer — that balance was already owing before April opened.",
          "A Form K gap links to its dates. The trend's Form K rows point at /units/309#forms, and the forms card now prints the tenancy date, the day the 14-day window closed and how long the lot has been past it (2026-07-01, 2026-07-15, 77 days), so the gap is checkable rather than asserted.",
          "MonthDetail.datedInMonth and its total, cut from the same aged list the score reads, so the second list can never total more than the first."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The month is a page-level fact on /accounting. The banner moved above the tab strip, the journal stops at that day (entries dated on or before it, run from the fiscal year's opening cash), and the closing line names the date it closes on.",
          "The tabs that cannot follow the date say so. Fund balances, budget and payables have no month-by-month ledger behind them, so they stay at the September 30 close and the page states which figures moved and which did not."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "An earlier month no longer shows September's closing cash in the journal. With a period set, the statement ends on that day's cash and says so; when nothing had been posted by then it says that too, and names the day the sample journal does begin (September 1, 2026)."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "The link, the ladder and the point agree. /accounting?period=2026-09 renders $6,499.00 and 322 days, /accounting?period=2026-04 renders $3,552.00 and 169 days, and a test asserts the detail's own total is the arrears term at every month end.",
          "The cut is a cut. Tests assert the September cut is 5 charges and $1,515, that every row in it is one of the ten above, that April's cut is empty, and the rendered detail shows — rather than a figure when the cut is empty.",
          "The Form K anchor holds. A route test renders /units/309 and /units/209 and finds #forms, the closed window and the day count; a lot with its Form K on file carries no window claim.",
          "The journal and the note, rendered: the September journal closes on “operating and reserve cash at September 30, 2026”; the April one says no entry was posted by then and names September 1; the overview under an April date carries the sentence that fund balances, budget and payables stay at the close.",
          "Frontend 458 passed (12 new), Svelte check 0 errors / 0 warnings, translation audit 1,410 keys × 9 locales (8 new), contrast audit 218 pairs, production build green with no banner in build/accounting.html at rest and id=\"forms\" plus 14-day window closed 2026-07-15 in build/units/309.html."
        ]
      }
    ]
  },
  {
    "version": "0.3.45",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Aged arrears on /accounting. The receivables tab is an aging ladder: every charge aged from the day it fell due, in five columns — current, 1–30, 31–60, 61–90 and 90+ — oldest money first, with each row opening that lot’s own sheet. Three cards above it carry the whole book (what is past due, how much of it is over 90 days, and the lot where time has done the most damage), and the table’s footer totals only the rows on screen.",
          "A lot’s own sheet at /units/207. Every lot has a real page: the balance, the account behind it from April to September with each cleared month against its payment, the parkade levy at the resolution that created it, the forms on file, and what is dated next. Print drops the tenancy and the buttons; the page says so beside the button.",
          "src/lib/arrears.ts, the aging rules as a pure module: 19 tests covering day counts across a month and a leap day, the column boundaries (30/31, 60/61, 90/91), month stepping, a plan balance held out of every bucket, a not-yet-due charge counted in the total and not in the buckets, the sort order, and lot 104 and 207’s exact columns.",
          "src/lib/lot-sheet.ts, one lot read as a statement: 15 tests covering the fiscal months billed, a cleared month against its payment, a month inside the arrears window standing open, the running figure, the levy at its own date ahead of the fiscal year, and the calendar matcher that reads lot 207 and lots 201, 309, and 404 without catching $300.",
          "src/lib/demo/arrears.ts, the dated charges the lot records do not carry on their own — the rules the page already states (fees on the 1st, the late fee on the 5th) plus the fine posted September 16 and the levy passed 12 November 2025.",
          "Links into the sheet from where a reader already is. An arrears row opens its lot, and the lot panel on /units has a second button under the pay link."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "A page plan is a schedule, not overdue debt. Lots 108 and 403 are paying their levies down at $300 and $450 a month, so their balances sit outside the ladder, listed under it with the monthly figure. A ladder that ranked the owner keeping their word beside the one who stopped would be lying.",
          "“Current” means not yet due. On September 30 the October fee is real money owed and not one day late, so it is in the total and in the column that should be empty before the 1st — the same distinction the page already makes about Form F.",
          "The ladder’s footer now totals the rows on screen rather than the whole book, because a turned-on filter left a footer that added up to more than the reader could see.",
          "“Nothing past due” counts the building, not the rows. Three lots are fully prepaid and have no charges at all, so the denominator is the building’s 40 lots, not the 37 with something on the books.",
          "The sheet’s dates read forward. A future item was printing in −1 days; it now reads Tomorrow, in 5 days and the like."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "A future dated item printed a negative day count on the lot sheet — the day difference was measured the wrong way round.",
          "A lot with no charges was missing from “show every lot” on the ladder; the toggle now fills all 40 lots with a zero row rather than showing only the 37 that owe something."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "The ladder ties, lot by lot and column by column. Each lot’s charges add up to balance(unit).total (a test over all 40), and in the browser the table’s own rows sum to its footer — $2,007.00 current, $1,515.00, $716.00, $50.00, $4,218.00 over 90, $8,506.00 total — under both the past-due and the every-lot setting ($25,137.00 / $31,636.00 for all 40).",
          "Every row opens its lot: /units/207, /units/104, /units/309, and each of those pages renders its own balance, account and dated items.",
          "The sheet in Chrome: 207 reads $6,366.00 to clear, its account opens with the levy at Nov 12 ($3,552.00), runs April to September with the three months behind standing open and the late fees after the fees they followed, and closes on $5,700.00 — the fees, late fees and levy still standing, with October a dated item rather than a ledger line. 305 reads $576.00 to clear, all six months cleared, $0.00 still owing.",
          "Print, measured rather than assumed: with print media emulated, the tenancy card is display: none and the action row is gone.",
          "Geometry at 1440, 1100, 900, 620 and 390, both pages: no page overflow at any width; the ladder scrolls inside its own table (820px of content in a 390px window) and the sheet’s account does the same (520px).",
          "Contrast, measured on the rendered theme: the worst of the new ink is 5.48:1 light (the cleared figure) and 7.15:1 dark; the ladder’s 90+ column is 6.29:1 and 6.75:1, and the sheet’s balance 17.85:1 and 12.88:1.",
          "Frontend 408 passed, Svelte check 0 errors / 0 warnings, translation audit 1,383 keys × 9 locales (36 new), contrast audit 218 pairs, production build green with 40 lot pages and v0.3.45 in build/index.html."
        ]
      }
    ]
  },
  {
    "version": "0.3.44",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Added",
        "items": [
          "The floor plan on /units. The lot-button grid is gone. The building is drawn as it stands: four bands, top floor first, each with two rows of lots either side of a corridor and the lot numbers running up the row. Every lot is as wide as its square footage earns, and coloured by the tone rule the filters already use.",
          "The journal as a statement on /accounting. The September entries read in date order, each with its effect on cash and the cash balance after it, and every entry opens a drawer with its hash, who posted it and what evidence came with it. The hashes are chained, so an edited line changes every hash below it.",
          "src/lib/floor-plan.ts, the plan's rules as a pure module: 11 tests covering the north/south split (01–05 / 06–10), floors top down and lot numbers up, a dropped floor when a filter empties it, and the widths.",
          "src/lib/ledger-statement.ts, the statement's rules as a pure module: 11 tests covering date order (the written order survives inside a day), the cash effect, the running balance, and the chain."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "A row's widths add to exactly 100 after rounding. The drift goes to the widest lot, because a plan with a hairline gap at the right edge reads as a bug. A lot that would fall below 14% is held there while the rest of the row is shared among the wider lots, so a 548 sq ft studio still carries its own number beside a 1,540 sq ft two-bed.",
          "The plan reads the filter the list already had. No second control: a chip narrows the drawing, and the legend lists only the tones on screen.",
          "Cash means two named accounts. 1010 operating and 1020 reserve, not a 10xx prefix: the first draft's pattern swept the war chest at cost (1080) into the balance and moved it by $405 it never saw.",
          "The statement closes on the funds tab. Opening cash is the closing cash less what the journal moved, so the last line is $685,486.42 — operating $81,797.62 plus reserve $603,688.80 — rather than an opening figure a reader could not check.",
          "A grid item's min-width: auto was pushing a phone wide. The plan's 460px row took a 390px viewport to 502px; the plan column is min-w-0 and the band is the only thing that scrolls."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "The plan in Chrome at 390, 620, 900, 1100 and 1440: no page overflow at any width, no clipped tile, tiles 80–192px, a 20px corridor between the rows, and the band scrolling on its own at 390 (332px client against 460px content).",
          "The filters and the floor chips narrow the drawing, not the page. Fees behind leaves two lots on two floors (207 and 104) with no empty band, and Floor 4 leaves one band. Clicking a lot still fills the panel and the pay link.",
          "The statement in Chrome: nine rows in date order (09-01 twice, then 09-02, 09-05, 09-16, 09-28, 09-30 three times), cash effects —, $25,785.00, −$405.00, —, —, $1,863.00, −$904.58, —, $360.00, and the drawer reading Cam Taylor — treasurer, 9532c12784084eb7, and the exchange receipt.",
          "The tie, read back off both tabs: the statement's last line $685,486.42 is the Three funds tab's operating cash $81,797.62 plus reserve cash $603,688.80.",
          "Contrast, measured on the rendered theme: the worst tile is 9.3:1 and the drawer's copy 8.3:1, both against the 4.5 floor.",
          "Frontend 374 passed, Svelte check 0 errors / 0 warnings, translation audit 1,346 keys × 9 locales (14 new), production build green."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "The chain is a demo chain. The hashes are computed in the browser from the sample books; the host keeps the durable copy, and the drawer says so instead of implying a server checked it.",
          "The statement's opening cash is derived, not a stored ledger fact: it is the closing cash less the journal's movement, so the column ties to the funds tab by construction. A real ledger would carry the opening balance forward from the prior period."
        ]
      }
    ]
  },
  {
    "version": "0.3.43",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Added",
        "items": [
          "A release trail on /changelog. The page opens with where this build sits: You are running v0.3.43 — the newest release. A build that is behind says how far (— 2 releases and 19 changes since.), and each release on the timeline carries the step into it — since v0.3.42 · 12 changes — so the page reads as a trail rather than a list of versions.",
          "You are here marks the running release, in the newest-release card when this build is the newest and on its own timeline row when it is not.",
          "src/lib/release-trail.ts, the rules as a pure module: 11 tests covering version parsing and ordering, the running-build placement in all three states, the change counts, and the step between two releases."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Versions are compared as numbers, not strings. 0.3.9 is older than 0.3.10; a page that ordered them lexically would put a fix above the release that made it necessary. parseVersion also drops -rc.1 and +build.7, so a tagged build is placed by its core version."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "All three states, in a browser, by moving package.json. Newest: You are running v0.3.42 — the newest release. with the chip in the newest card. Behind: You are running v0.3.41 — 1 release and 12 changes since. with exactly one marked row, v0.3.41. Ahead: This build is v0.3.99, newer than the newest note here. and no marker — the page does not point at a release it has no notes for.",
          "Geometry at 1440 and 620 in both themes: no horizontal overflow on the trail, nothing narrower than its content. The new ink measures 5.47:1 light and 6.59:1 dark at its worst, against the 4.5 floor.",
          "French: Vous utilisez la v0.3.42 — la version la plus récente., Vous êtes ici, depuis la v0.3.41 · 12 changements.",
          "Frontend 352 passed, Svelte check 0 errors / 0 warnings, translation audit 1,331 keys × 9 locales, production build green."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "The trail says only what the notes say. A release with no bullet about a fix cannot claim it, and the count is bullets, not commits — which is the number a reader can check on the page.",
          "The running version is the one baked into the build. A tab left open across a deploy reports the build it loaded, not the newest one on the host; a reload corrects it."
        ]
      }
    ]
  },
  {
    "version": "0.3.42",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Added",
        "items": [
          "The last five demo routes are in the catalog. /units, /calendar, /tax, /meetings and /pay now read their own copy from src/lib/i18n.ts — ledes, kickers, page titles, filter chips, column headers, the tax checklist labels, the quorum cards and the pay sheet's rail rows. 149 keys in nine locales in this release; the catalog is 1,322 keys with fr es zh hi fil pl uk sw at parity, and the audit's hard-coded surface on those five routes is zero.",
          "A test that a translation cannot silently lose a figure. fill() leaves a slot with no value exactly as written, which is right for a missing value and wrong for a missing translation — a reader would see {amount}. The new test compares every locale's {slots} with the English source, across all ~11,900 translated strings."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Money follows the reader's locale. money(), moneyCompact() and satsLabel() in src/lib/demo/format.ts read the active locale at call time instead of formatting with en-CA, so a French page prints 904,58 $ where it used to print $904.58. Sats keep their unit name — the Lightning unit is not an English word — but group their digits the reader's way.",
          "Dates do too. The calendar's month name, its seven weekday heads, the selected-day heading and the receipt tape's date chips come from Intl (septembre 2026, mercredi 30 septembre, 1 sept.) rather than from hard-coded arrays, so they change with the language instead of beside it.",
          "The parity guard reads keys where a key can be. scripts/audit-i18n.mjs matched \\bword: ' anywhere, so French copy ending in : — unitsParking: 'Stationnement / rangement :' — reported rangement as a key in fr and missing in the other eight. Keys now have to sit after {, after a comma, or at the start of a line."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "formatDate() was a day early for everyone west of UTC. Its YYYY-MM-DD check was written with a doubled backslash, so it never matched and a bare calendar day went through new Date('2026-09-30') — UTC midnight, which renders as September 29 in Vancouver. Day strings are anchored at noon UTC now. The existing test missed it because it passed timeZone: 'UTC', which is not the path a page takes; a second test takes the page's path.",
          "The calendar's selected-day heading said 2026-09-30. It reads Wednesday, September 30 / mercredi 30 septembre now."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "The five routes in Chrome with the locale set to French: no unfilled {slot} anywhere, correct headlines (Impôts et ARC, Assemblées et votes, Payer un lot, Qui habite ici, Calendrier), and the same pages unchanged in English.",
          "Calendar formatting in fr, en and zh: septembre 2026 / September 2026 / 九月 2026, weekday heads D L M M J V S / S M T W T F S / 日 一 二 三 四 五 六, day heading mercredi 30 septembre (the 30th, not the 29th).",
          "Frontend 341 passed, Svelte check 0 errors / 0 warnings, translation audit 1,322 keys × 9 locales, contrast audit unchanged, production build green."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "Demo records stay English. Event titles, tax-section prose, bylaw steps and owner notes are sample data, not chrome, and are not in the catalog. The pages around them are.",
          "The calendar's category names (Fees, Council, CRA…) are now catalog keys, but the event titles they label are still English data. That is the same line the next-30-days strip drew."
        ]
      }
    ]
  },
  {
    "version": "0.3.41",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Added",
        "items": [
          "A next-30-days strip on /calendar and /tax. The window is src/lib/next30.ts — a pure module over the calendar the rest of the app already uses, so the strip cannot claim a date the month grid does not hold. It groups the sample's September 30 through October 30 into Today (3), This week (4) and Later this month (6), with the day count on each item and a link to the calendar.",
          "/tax gets the same window, narrowed. Filings, remittances and compliance dates only: four items, from the two returns due today to the October 15 CPP and EI remittance. Owner-tax declarations stay in the sections below, where they belong."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Five new dashboard-free views of one dataset, not a second list. The days-left label reads today rather than due today, so a title that already ends in \"due\" does not read *due due today*."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Window tested against the real calendar data: the 30-day edge is inclusive, the bucket boundaries hold, the day count is DST-safe (2026-10-25 → 2026-11-08 is 14 days, not 13 or 15), the category filter invents nothing, and a caller-supplied date moves the whole window.",
          "Geometry at 1440, 1279, 1181, 1100, 900 and 620 in both themes on both pages: 0 clipped, spilled or sub-200px findings. The strip's own text measures 5.2:1 in light and 6.58:1 in dark at its worst, against the 4.5 floor.",
          "Frontend 335 passed (322 + 9 window tests + 4 component tests), Svelte check 0 errors / 0 warnings, catalog 1,190 keys × 9 locales."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "The strip uses the sample's 2026-09-30 as today, deliberately. A live council passes its own date; nothing here reads the machine clock.",
          "Category names stay English on the calendar, so the strip shows a category dot rather than a label. Moving those names into the catalog belongs with the /calendar localization."
        ]
      }
    ]
  },
  {
    "version": "0.3.40",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Added",
        "items": [
          "A September close on /accounting. Five checks between the September books and a signed month: the three accounts tie, payroll and source deductions are posted, the reserve contribution and interest are billed, board approval is on the minutes, and the period locks. Three pass today; board approval is open and the lock waits on it. The checks read books.tie, the payroll entry and the reserve figures rather than a stored status, so the panel cannot drift from the cards above it. The close button is disabled while anything is open, and the blocking check is named both on screen and in the button's aria-describedby.",
          "The accounting page is in the translation catalog. 96 keys across nine locales — the lede, the six tab labels, every column header, the fund rows and the close panel — and a fill() helper for catalog strings that carry figures ({amount}, {date}). The page went from 47 hard-coded English strings to 0 on the i18n audit; the catalog is now 1,179 keys with parity enforced across fr es zh hi fil pl uk sw."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "The building card's meta line no longer cuts its own text. 4100 Cambie Street, Vancouver · 40 lots · 4 floors was a nowrap ellipsis that overflowed by 5px at 1440 and rendered as … 40 lots · 4 flo…. It wraps now — two lines at 1440 and at 1181, one line at 1100 — with no clipping at any width measured.",
          "A long owner name wraps instead of losing its second half. The /units lot cell is 108px at 1100, and Northwater Holdings Ltd. needed 137. The name takes two lines now, fully visible.",
          "The proof band's breakpoint was still too generous by 99px. Three columns above 1180px, but the dashboard sidebar is on screen from about 1181, which leaves the band 929px and each card 254px — a 156px column of copy in both themes. That is the defect the band was rebuilt to end, at a different window width. The two-up breakpoint is now 1279px."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The close panel's open-state chip uses --color-amber-50 on --warning-text instead of amber-700 over a translucent fill. The first version measured 4.37:1 in light and 2.32:1 in dark — a fixed amber stays dark on a dark tint. The token pair reads 6.15:1 and 6.63:1."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Geometry audit over /accounting (all six tabs), /units and / at 1440, 1279, 1181, 1100, 900 and 620, in both themes: 0 clipped, truncated, spilled or sub-200px findings.",
          "French rendering checked in the browser: the panel reads Clôture de septembre, the blocked line names Approbation du conseil au procès-verbal, and all six tabs translate.",
          "Frontend 322 passed, Svelte check 0 errors / 0 warnings, translation audit 1,179 keys × 9 locales with /accounting clean, contrast audit 218 pairs + 3 fill guards, secret gate green. Backend untouched at 0.3.28."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "The demo money() helper is not locale-aware, so figures in French read $904.58 rather than 904,58 $. formatCurrency in src/lib/i18n.ts does the right thing and is used where formatting matters; the demo statements keep the plain helper. Localizing money and dates across the demo pages is item 47 on the improvements list.",
          "/units, /pay, /tax, /calendar and /meetings still carry hard-coded copy. /accounting was the largest surface, not the last."
        ]
      }
    ]
  },
  {
    "version": "0.3.39",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Fixed",
        "items": [
          "The compliance-health panel was cutting its own evidence. The tracked-item list shared a row with the 112px gauge, which left each deadline title about 118px at 1440 and about 50px at 1100 — Energy Performance Report (EPR) filing rendered as Ener…, and at desktop Depreciation report renewal lost its last word. The gauge now sits in its own row with the formula note beneath it, and the items get the panel's full width: 250px at 1440 (all three titles on one line) and 182px at 1100 (the longest wraps to two). Titles clamp to two lines instead of truncating to one, so the text is always readable in full.",
          "The task list cut the longest title at 620px. Annual General Meeting (within 2 months of fiscal year end) lost 19px behind an ellipsis; row titles now clamp to two lines."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The compliance-health panel is taller by roughly one row, because the gauge, the formula and the items no longer share horizontal space."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Audited every dashboard panel at 1440, 1181, 1100, 900 and 620, in both themes: zero clipped, spilled or sub-200px text remains. The only overflow reported is content built to scroll — the payment strip and the tab rows on /units, /accounting, /calendar and /tax, all overflow-x: auto with their own thin scrollbars, so nothing is unreachable.",
          "Frontend 318 passed, Svelte check 0 errors / 0 warnings, contrast audit 218 pairs, i18n audit unchanged. Backend untouched at 0.3.28."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "Two single-line ellipses were found and left alone: the building card's meta line cuts 5px at 1440 (… 40 lots · 4 flo…), and the /units company column cuts long company names at 1100."
        ]
      }
    ]
  },
  {
    "version": "0.3.38",
    "date": "2026-10-28",
    "groups": [
      {
        "label": "Changed",
        "items": [
          "The band that closes the dashboard now lays out like a card, not a strip. Each card is a two-row grid: the icon and the copy sit side by side, and the link drops to its own baseline underneath them. The effect is the one the copy was missing — the first card's two sentences get the column's full width and set in two even lines instead of a narrow stack, and the three links line up because the cards share a height.",
          "The headline is 12.5px and the body 10.5px at 1.5 leading, up from 11.5px and 9.5px; the pastel marks, hairline border, radius and shadow are untouched, and the band still closes the page above the footer.",
          "The three-column layout is kept only while there is room for a readable measure. Between 620px and 1180px the band goes two-up with the third card spanning the row, and below 620px it is one card per row with the mark stepped down to 36px."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "The copy was capped at 28ch — about 145px at 9.5px type — while a nowrap link took the rest of the card and overflow: hidden hid the result. That cap is gone; the body column is the space the card actually has, and the link's padding is offset so its text sits on the same left edge as the copy above it."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Measured in Chrome on the running dashboard at 1440, 1181, 1100, 620 and 380 wide, in both themes: no card reports horizontal or vertical overflow, every mark, copy block and link stays inside its card bounds, and the cards in a row share an exact height. Copy lines: two at 1440 and at 1100 (two-up), one per card at full width, two at 380.",
          "Frontend 318 passed, Svelte check 0 errors / 0 warnings, contrast audit 218 pairs, i18n audit unchanged. No backend code touched; backend API version stays 0.3.28."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "The key that closes the first card still reads \"Compliance health on the dashboard.\" — the catalog supplies the phrase and the page appends the rest, so the sentence is assembled in two places. It reads correctly; it is not one string."
        ]
      }
    ]
  },
  {
    "version": "0.3.37",
    "date": "2026-10-26",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Durable ledger idempotency (migration 0007): a ledger Idempotency-Key is now a row — council, key, request fingerprint, 24-hour expiry and the committed ledger_entry id — written in the same transaction as the append. A retry arriving after a restart replays the original result instead of issuing a second write, a reused key with a different body still answers 409, and concurrent identical retries coalesce. The bounded in-memory adapter stays for tests and development and refuses new keys with 503 rather than evicting a live one.",
          "Migration checksums and a read-only preflight (migration 0008): _schema_version gains a checksum column, the runner serializes migrations behind an advisory lock, detects missing, orphaned and drifted migration files, and records a migration's checksum in the same transaction that applies it. npm run migrate:check reports all of that without writing anything.",
          "Liveness and readiness split: GET /health/live answers whether the process is up; GET /health/ready reports sanitized boolean dependency probes and returns 503 when a configured dependency is unavailable. The production entrypoint wires the Postgres probe only."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Treasury plan issuance and broadcast fail closed. Authorization is recomputed from council ledger balances rather than trusted from the request, a plan carries an immutable server-issued token, address, network, fee and input totals are validated, UTXOs are reserved while a plan is live, and replay is refused. Live broadcast and ledger debit remain refused pending real PSBT construction and signature verification; the plan cache and its reservations are process-local.",
          "Bitcoin address validation is tightened to network and checksum, and xpub test vectors use valid key serialization instead of placeholder text.",
          "Backend API version stays 0.3.27; site version is 0.3.37."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "A restarted process no longer risks a duplicate ledger write for a retry it has already seen; the last process-local assumption on the money path is gone, and the E2E smoke suite covers the second-instance case (it skips itself without DATABASE_URL, so that coverage did not execute in this environment).",
          "A migration and its version row commit together, so a failed migration cannot leave the version table claiming schema the database does not have."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Backend typecheck and build clean; full backend suite: 310 passed, 6 skipped. The six skipped are the Postgres E2E tests — DATABASE_URL is unset and Docker is unavailable here, so the durable path was not exercised. Frontend suite: 311 passed; Svelte check: 0 errors / 0 warnings; production build green; i18n audit 1075 keys × 9 locales; contrast audit 218 pairs."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "The first migration upgrade pins legacy checksums from the current migration files rather than verifying anything historical. Take a schema backup before running it.",
          "No live Bitcoin broadcast and no ledger debit from a plan: both endpoints refuse rather than pretend. Signature verification, PSBT/change construction, and durable plan and reservation storage are all still missing.",
          "The backend is not deployed. A green local suite is not a production check."
        ]
      }
    ]
  },
  {
    "version": "0.3.36",
    "date": "2026-10-17",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Read-only agent API: GET /api/v1/agent/manifest and GET /api/v1/agent/context require a member session. The context contains only aggregate occupancy/Form K counts, verified Operating/CRF balances and up to 50 deadlines. It omits contacts, payment references and transaction descriptions, and uses private, no-store + Vary: Authorization. The manifest lists only the dedicated context route and clarifies it does not grant access to other APIs.",
          "Safe ledger retry keys: Idempotency-Key is validated, bound to a request fingerprint, safe for concurrent identical retries, and rejects changed-body reuse with 409. Cache capacity is bounded; successful results are not evicted early, new keys receive 503 under full capacity, and the single-process / 24-hour scope is documented."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Fastify rejects unknown schema fields, limits request bodies to 256 KiB and requests to 30 seconds; auth identity fields and Rosa's question/facts now have explicit shape and length limits.",
          "Backend API version is independently bumped to 0.3.27; site version is 0.3.36."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "Form B/F and CRT HTML outputs escape council and request data and ship no-store, nosniff, and restrictive CSP headers.",
          "JSON agent context preserves council names as text; HTML escaping occurs only at HTML rendering boundaries. Form B/F HTML titles, unit IDs, statuses and disclosures are escaped, and responses use restrictive security/cache headers.",
          "The agent manifest advertises only the dedicated agent context route instead of implying that general API endpoints are part of its capabilities.",
          "The idempotency operation starts only after pending state is installed. Zero-capacity caches fail safely, and successful results are never evicted before expiry; a full cache refuses new keys."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Backend typecheck clean; full backend suite: 301 passed, 6 skipped. Frontend suite: 309 passed; Svelte check: 0 errors / 0 warnings; production build green; i18n audit 1065 keys × 9 locales and contrast audit 218 pairs pass."
        ]
      }
    ]
  },
  {
    "version": "0.3.35",
    "date": "2026-10-16",
    "groups": [
      {
        "label": "Added",
        "items": [
          "PUBLIC_API_BASE_URL=/ — one host serving both the site and the API. The value / (or the word same-origin) now means *the origin this page was served from*, so a single-host deployment needs no absolute address written down, keeps working when the host's address changes, and involves no CORS at all — a same-origin request never asks.",
          "A wiring table in SOURCE-OF-TRUTH.md and three documented shapes in .env.example / README.md / docs/DEPLOYMENT.md (one host · tailnet · public HTTPS behind a tunnel), each naming the two variables that have to agree."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "resolveApiBase() takes the origin as a third input and returns demo mode when there is none (SSR/prerender). The origin is only knowable once the page is running, so before hydration the widgets render demo data and then settle on live — the same shape the runtime override already had."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "A base value that is not a real origin is now ignored instead of used. fetch('//evil.example/api/v1/units') is a protocol-relative redirect to somebody else, so a mistyped — or hostile — PUBLIC_API_BASE_URL would have handed a council's bearer token to that host. A bare path (/api) and a javascript: URL are ignored the same way, and the site falls back to demo mode rather than pointing somewhere untrusted. A URL with a path (https://host/openstrata) is still accepted, for a reverse proxy in front of the API."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Chrome, built artifact, no runtime override of any kind (every openstrata-* key cleared): the site and the API were served from one origin (static build at the root, /api proxied to a memory-backed host) and the signed bill link rendered $921.00, LMS2847-305-202610 and 305 · Evergreen House.",
          "The bundle for PUBLIC_API_BASE_URL=/ inlines the same-origin rule; the CSP keeps its documented fallback (deriveOrigin('/') is not an origin, and connect-src 'self' already covers a same-origin call); static/_headers is unchanged in git.",
          "src/lib/api/config.test.ts — 15 tests covering the rules, the same-origin tokens, the SSR/prerender case, the override precedence, and the four values that must never become a base.",
          "check 0/0 · 303 frontend tests · audit:i18n 1065 keys × 9 locales · audit:contrast pass · 285 backend tests · build green."
        ]
      }
    ]
  },
  {
    "version": "0.3.34",
    "date": "2026-10-16",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Cross-origin access, opt-in and exact. The site is a static Cloudflare build and the API is the council's own host, so a browser blocked every /api/v1/* call before it left the tab — both documented exposure paths said live data works, and neither could from a browser. backend/src/api/cors.ts holds the rules as a pure module and CORS_ORIGINS turns them on.",
          "CORS_ORIGINS (comma-separated) documents both shapes in .env.example, backend/API.md, docs/DEPLOYMENT.md and backend/README.md, with the tailnet example spelled out end to end."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "A preflight is answered 204 in an onRequest hook, before any route runs, and the hook also runs on error responses — so a 401 from an allowed origin stays readable in the browser instead of arriving as an opaque CORS failure. The route still wants a body; the browser only asked whether it may send one.",
          "Vary: Origin rides on every response that carried an Origin, allowed or not, and merges with whatever the route already set."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "A promise the docs made and the code did not keep. docs/DEPLOYMENT.md described Option A (tailnet-only) as *“live data works for browsers on the tailnet”* and Option B as *“add the site origin to the backend's CORS allowlist”* — there was no allowlist to add to. Both now name CORS_ORIGINS in their commands."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "On the built server, with logger: false: no CORS header at all when CORS_ORIGINS is unset (a same-origin deployment is untouched); a preflight from an allowed origin answers 204 with the origin echoed, POST in the methods, and authorization in the allowed headers; a second origin (http://…ts.net:8080) is echoed for its own request; a lookalike host, a wrong scheme and a wrong port each get no permission header; an unauthenticated call from an allowed origin still returns 401 with the permission header; the real flow runs end to end cross-origin (register → authed /units); and CORS_ORIGINS=* grants nothing (Access-Control-Allow-Origin is absent, never *).",
          "npm test in backend/ — 285 tests (17 new) · tsc clean · frontend check 0/0 · 303 frontend tests · audit:i18n 1065 × 9 · build green."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "A council host is still not deployed, so no build has been pointed at a real one. The browser-level proof here is against a local host on the same machine; the tailnet and tunnel shapes need a running host and are recorded as open questions for Kimi in docs/KIMI-HANDOFF.md."
        ]
      }
    ]
  },
  {
    "version": "0.3.33",
    "date": "2026-10-16",
    "groups": [
      {
        "label": "Fixed",
        "items": [
          "PUBLIC_API_BASE_URL now actually reaches the browser. The variable was documented as the build-time way to point a static build at a council host, but src/lib/api/config.ts read it through import.meta.env, which Vite populates only for its own VITE_ prefix. The production bundle compiled to const i = {}, so the value was always undefined and only the runtime localStorage['openstrata-api-base'] override ever worked. Fixed by declaring envPrefix: ['PUBLIC_', 'VITE_'] in vite.config.ts — the documented PUBLIC_ namespace, with VITE_PUBLIC_SENTRY_DSN still exposed.",
          "The prebuild CSP had the other half of the same bug. scripts/generate-csp.mjs read process.env only, so an operator who followed the documented workflow and put the base in .env got a bundle pointed at their host but a connect-src that still allowed only https: — which the browser then blocks for a plain-http tailnet host. It now loads .env, .env.local, .env.production and .env.production.local in Vite’s precedence order (util.parseEnv), with an explicit shell variable still winning."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The precedence rule is a value, not a side effect. apiBaseUrl() now delegates to a pure resolveApiBase(stored, built): a stored override wins, an empty or absent value is demo mode, whitespace and trailing slashes are trimmed. Behaviour is unchanged; the rule is now testable without a browser."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "The build-time base, end to end, with no runtime override of any kind: PUBLIC_API_BASE_URL=http://127.0.0.1:4173 npm run build, then in Chrome every openstrata-* key cleared and localStorage['openstrata-api-base'] null — the signed bill link rendered $921.00, LMS2847-305-202610 and 305 · Evergreen House from the host. The same page on the previous build showed the *“this site is not connected to a council host”* card.",
          "The unset path still degrades safely: a build without the variable contains no baked origin (grep finds none in _app/immutable), compiles the read back to the undefined fallback, and serves the demo sheet as before.",
          "CSP both ways: with the base set (shell and .env), build/_headers pins connect-src to that origin; with none, it keeps the documented https: fallback, and static/_headers is unchanged in git.",
          "check 0/0 · 303 frontend tests (9 new in src/lib/api/config.test.ts) · audit:i18n 1065 keys × 9 locales · audit:contrast pass · build green."
        ]
      }
    ]
  },
  {
    "version": "0.3.32",
    "date": "2026-10-16",
    "groups": [
      {
        "label": "Added",
        "items": [
          "A signed bill link, so an owner can pay without a council login. A treasurer prints one link per bill (POST /api/v1/payments/link, treasurer+) and sends it; the owner opens /pay?unit=305&rail=etransfer&t=… on their phone and pays from their own bank. The link is the credential: ospl1.<payload>.<sig>, HMAC-SHA256 under a key derived from PAY_LINK_SECRET (or AUTH_SECRET when unset) with the label openstrata/pay-link/v1. It states one lot, one amount, one reference and one payee, until it expires — 30 days by default, clamped to 1..120, and a link that has expired is refused rather than re-signed.",
          "backend/src/rails/pay-link.ts — signing, verification and the bill a payer sees, with every reason a link can be unusable named (malformed, bad signature, expired, not yet valid, unknown version, incomplete claims). A link can never verify as a JWT and a JWT never as a link.",
          "POST /api/v1/payments/link/verify — public by design, because the token is the credential. It returns the bill and nothing else: no balances, no ledger entries, no other lots. The token travels in the body, not the path (a signed bill is longer than Fastify's 100-byte path parameter limit — found by the 414 the first version answered).",
          "The link works on both money routes: POST /api/v1/payments/interac/request with no Authorization header, and GET …/interac/request/:requestId?t=…. The amount, lot, reference and payee come from the link's claims, so the payer's page cannot change them; the status read is scoped to that one bill (404 for any other, 401 with no credential); both answers carry viaLink: true.",
          "/pay renders the council's bill when a link verifies: amount, reference, payee and expiry, the lot fixed (the council signed one lot), and none of the demo furniture — receipt tape, vendor card and lots list are hidden, because an anonymous payer has no business seeing other owners' rows. Five states (none | checking | valid | invalid | offline) and no amount is ever shown for a link that cannot be used."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The link survives the sheet. sheetSearch() carries the token through a rail or lot change, so a URL rewrite mid-payment cannot silently end it, and providerReturnHref() strips it from the address handed to the bank: the credential is remembered per request id in sessionStorage, not put in Interac's return URL.",
          "PAY_LINK_SECRET / PAY_LINK_TTL_DAYS documented in backend/.env.example, and the three new routes in backend/API.md."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "A refusal that looked like success. A host with no Interac provider answered 200 { ok: false }; the payer's page read that as a started request and showed a *Live request* badge on nothing. The route now answers 503, and startInteracRequest / interacRequestStatus refuse any body whose ok is not true before the dialog touches it.",
          "isTrustedGateway(undefined) threw instead of refusing — a host that answers without a gateway URL must send nobody away, and now does not crash.",
          "http://127.0.0.1 was refused while http://localhost was allowed. Loopback is loopback: both, and [::1], are allowed plain http; every other host still must be https."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Chrome, built artifact, memory-backed host on the same origin, no session on the page (localStorage['openstrata-token'] = null): the signed link renders $921.00 / LMS2847-305-202610 / fees@lms2847.invalid with the lot fixed and the receipt table gone; starting the request answers viaLink: true, amountBasis: 92100, request SIM-LMS2847-305-202610-0001, while the body it sent claimed amountBasis: 1 and unitRef: U-999 and was ignored; the payer reads that request back with the link (200), another bill's link gets 404, and no credential gets 401. A tampered token shows *\"This bill link cannot be used\"* with reason bad signature and no amount; switching to Bitcoin keeps the token in the URL and the council's amount on screen; a plain /pay visit is still the demo sheet.",
          "check 0/0 · 293 frontend tests · audit:i18n 1064 keys × 9 locales · 267 backend tests (17 new for the link, plus the refusal and loopback cases) · build green."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "The public demo still cannot start a real request: with no Interac merchant credential the host answers from the labelled rehearsal provider, so the payer sees *Simulation — nothing was sent*. The link path is live end to end up to that provider boundary.",
          "PUBLIC_API_BASE_URL is not applied at build time. src/lib/api/config.ts reads import.meta.env.PUBLIC_API_BASE_URL, which the production bundle compiles to an empty object, so only the runtime override (localStorage['openstrata-api-base']) actually points a build at a host. Found while verifying this release; fixed in v0.3.33 (envPrefix in vite.config.ts, plus .env loading in the prebuild CSP script)."
        ]
      }
    ]
  },
  {
    "version": "0.3.31",
    "date": "2026-10-16",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Interac e-Transfer as a real rail on the pay sheet. The e-transfer panel (still on /pay?unit=305, as asked) carries one button above the copy fallback: Open your bank and pay. It starts a Business Request Money request with the lot's amount and the sheet's reference already in it, hands the payer to Interac to choose *their own* financial institution and approve from their own banking app, and then takes the answer back with the request id in the URL.",
          "src/lib/interac.ts (+ interac.test.ts, 26 tests) — the rules, out of the component so they are testable without a browser: the provider status vocabulary (seven states; anything unrecognised is refused, never guessed), the institution list, the request builder (integer cents, one normalised shape per payer contact), the gateway allow-list, and the return contract.",
          "The institutional side, where it belongs: backend/src/rails/interac.ts (a labelled rehearsal provider and a live HTTP provider), three routes — POST /api/v1/payments/interac/request, GET …/:requestId, POST …/:requestId/reported (treasurer+) — INTERAC_* in .env.example, /api/v1/rails/status publishing interac: { configured, live }, and 21 backend tests. Frontend wiring in src/lib/api/interac.ts."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Honesty, in two places a payment page could lie. A status that arrives in a link is a claim: with no council host to confirm it, the card reads *\"Returned from your bank — waiting for the council to confirm\"* and never shows \"paid\" on a URL alone. And a request never moves backwards — a replayed or out-of-order report cannot un-deposit a completed transfer or resurrect a stopped one.",
          "A configured host that is unreachable is a failure, not a rehearsal. Demo mode (no host at all) runs the labelled simulation; a host that is configured and does not answer says *\"Your council's host could not be reached, so no request was started.\"* The rehearsal is never used to paper over a broken host.",
          "Interac's real onboarding rule is stated, not worked around. A business gets Business Request Money through a participating financial institution (BMO, CIBC, DC Bank, Peoples Trust, Scotiabank today), which is what issues the merchant credential — so the credential lives on the council's host and the button rehearses, clearly labelled, until one exists."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "The card moved to the answer the moment the payer acted, and one build did not. After a simulated approval nothing further happened on screen while the bank picker stayed up — a lie of omission found in the browser sweep, not by reasoning. The card now moves to the answer on approval and the deposit beat updates it in place.",
          "The dialog no longer prints \"approved and deposited\" on a link's word. The first version showed the URL's status in full; the headline is now the claim's own wording until a host confirms."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Chrome, on the built artifact: all 40 lots (the dialog's amount must equal the lot's own amount — 0 mismatches), the three zero-balance lots (no button at all — nothing owed, nothing to send), the decline and cancel paths (each lands on its own state and its own URL), four return links (deposited, approved, declined, an unknown status), Escape, keyboard entry (focus + Enter opens it), and 0 text below 4.5:1 inside the dialog at 1280px and 390px in both themes with no page overflow.",
          "The live branch against a local stand-in host (self-signed HTTPS, the real request shape): a trusted gateway shows Continue to Interac with no bank list (that list is Interac's page, not ours); an untrusted gateway is refused with nothing opened; an unreachable host produces the failure line, not a rehearsal.",
          "check 0/0 · 287 frontend tests · audit:i18n 1058 keys × 9 locales · audit:contrast 218 token pairs + 4 guards · build green · backend tsc clean · 250 backend tests."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "Nothing payable: every destination and QR payload on /pay is still a demo string, and the rehearsal provider is what answers on the public demo.",
          "A live request needs a council host and a signed-in owner (the API routes are council-scoped like every other /api/v1 route), so on the public demo the button always rehearses."
        ]
      }
    ]
  },
  {
    "version": "0.3.30",
    "date": "2026-10-16",
    "groups": [
      {
        "label": "Added",
        "items": [
          "The one-lot pay sheet (/pay) — the second of the four queued UI upgrades, picked by Cam. The page was a rail list plus a pay dock; it is one sheet now. One amount in the largest type on the page, its parts (fee, arrears, late fee, fine, levy) under a dashed rule and only the parts actually owed; three large choices as real input[type=radio]s under styled labels in a fieldset with a screen-reader legend, so keyboard, arrow keys and announcement stay the browser's; and the picked rail in full — destination, exact BTC and sats, the QR, and the steps. A lot picker and deep links (/pay?unit=108&rail=bitcoin) let a treasurer send a lot the exact rail they agreed on.",
          "PAD and cheque are tucked under the sheet in a native <details>: they are not what a treasurer sends from, and they must stay reachable.",
          "A zero-balance lot offers no destination at all — no rows, no QR, and \"Nothing to collect on this lot.\" rather than an artefact panel with nothing in it."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The rate lock is a stamp, not a control. It states how long the fiat amounts are good for and nothing else. When it expires the sheet says so in words *and* moves the BTC/sats row to the warning ink, because a stale rate that still looks live is the one dishonest thing this page could do. Both the note and the stamp's own icon re-price it.",
          "The sheet has exactly one writer per value. The chosen rail is owned by the component; ?rail= seeds it once on arrival and is an output after that."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "A rail/URL race that could show the wrong payment destination. Reseeding the chosen rail from ?rail= in an $effect looked harmless. A traced run showed the failure: the click wrote the rail and began the URL write, then the effect re-ran against the URL *as it still was* and put the old rail back, so the tick and the URL said e-Transfer while the panel, the rows and the QR showed Lightning's invoice. replaceState navigations also did not always deliver a page-store update, so making the URL the single source of truth would have stuck the same way. One writer per value; the rules (sheetRail() falls back to the first choice for a link naming pad, cheque or nothing) live in src/lib/pay-sheet.ts with 13 tests.",
          "The 15-minute clock can never print a negative remainder (lockClock clamps at 00:00), and a hostile time reads as expired rather than as a live rate."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Chrome on the built artefact: every choice in sequence, rapid-click sequences (three and four picks with ~30ms between), six deep links, all 40 lots (the shown amount must equal the option's own amount, with the URL intact), the zero-balance lots, the full expiry → re-price → re-expire flow (scratch build, LOCK_SECONDS = 3), and 0 text below 4.5:1 at 1280px and 390px in both themes with no page overflow. 261 frontend tests, 1017 i18n keys x 9 locales, audit:contrast pass (218 pairs + 4 guards)."
        ]
      }
    ]
  },
  {
    "version": "0.3.29",
    "date": "2026-10-16",
    "groups": [
      {
        "label": "Changed",
        "items": [
          "The dashboard chrome owns its ramp. The sidebar is navy in *both* themes, but its ink was still resolving to the shell's --muted / --faint / --orange-text, which flip at night. Read in light mode those are a dark slate (2.2:1 on navy) and a dark rust (2.2:1). .sidebar now re-points six shell tokens at a fixed --chrome-* ramp for its whole subtree, so a rule — or a component's own scoped style — inside the chrome cannot reach a flipping step by accident. Same treatment for the auth modal's navy brand panel (slab ramp), and the inverse surfaces now re-point the accent ink too, so a focus ring on navy stays legible.",
          "Card surfaces flip by construction. Nine fills in src/app.css were pinned #fff and re-declared in a separate .dark block; they use var(--paper) now and four redundant overrides are gone with them.",
          "Focus, selection and skips. The focus ring was a fixed 45%-alpha blue (~1.9:1 — a focus indicator below the 3:1 non-text floor); it rides the audited --brand-text now, which the chrome and slab scopes re-point on inverse surfaces. Text selection uses the brand tint with the page's own ink, and both shells gained a skip-to-content link (x9 locales).",
          "Ink that had to be measured against a glow, not a plate. The auth panel's 10px trust lines sat at 4.0:1 and 3.4:1 once the glow covering that corner was composited in; the glows were pulled back (.35/.22 → .16/.12) and the steps lifted, so the worst corner clears AA instead of only the middle.",
          "Print, legal and deck surfaces. PrintDoc's smallest ink moved from #7d8890 (3.62:1) to #5a6672; LegalDoc's table headers, blockquotes and code spans use the tint tokens instead of a pinned light wash; the pitch deck's two \"paper\" slides are mixed from --paper and the accent tints, so the plate and the ink move together; the roadmap's step numerals became brand chips and its completed-phase dot moved to emerald-700 (white on emerald-500 was 2.54:1).",
          "Removed 23 one-off i18n and codemod scripts (scripts/inject-*.mjs, scripts/wire-*.mjs, scripts/migrate-page-hero.mjs, the two *.py injectors). scripts/ is now seven live tools, all reachable from package.json or the changelog generator."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "var(--surface-3, …) and var(--shadow-sm, …) referenced tokens that do not exist. CSS does not warn: the declaration is dropped and the FALLBACK wins, so the auth modal painted a fixed near-white plate (light ink on it at night) and the start card used a stale shadow literal.",
          "The auth modal's password-strength verdict, step labels, step numbers and field labels were literal greys at 2.44:1–3.6:1; the strength verdict now rides the same three status tokens as every other verdict in the app.",
          "The dashboard / was the last route with failures: a 17px chevron, 8px footer notes and the panels' micro-labels."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Chrome, 28 routes × light and dark (56 loads, 10,976 text nodes): zero below 4.5:1. Plus the ⌘K search modal, the topbar menus and the auth modal in both themes at zero. The harness asserts the newest token resolved on every load, so a service-worker-cached sheet cannot be scored as a fresh build.",
          "The audit grew 194 → 218 token pairs and gained four structural guards (chrome scope, undefined var(), literal-white fills in the stylesheet outside print, and the existing fill-literal guards). Each new guard was reintroduced against its own fix and confirmed to exit 1."
        ]
      }
    ]
  },
  {
    "version": "0.3.28",
    "date": "2026-09-21",
    "groups": [
      {
        "label": "Fixed",
        "items": [
          "Month nav buttons in the deadline calendar use their real aria-labels (calPrevMonth / calNextMonth, x9 locales) instead of borrowing the task-list strings; the month-title button lost a dead ternary."
        ]
      }
    ]
  },
  {
    "version": "0.3.27",
    "date": "2026-09-21",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Deadline popover. Clicking a calendar day opens a small panel pinned under that cell: the day's deadlines in full, each with a one-tap link to the tools panel where the item is handled. The day cells became real buttons — keyboard reachable, aria-expanded on the open day, hover affordance gated behind @media (hover: hover). The popover clamps inside the grid on narrow phones and closes on ✕, Escape, outside click, or month navigation."
        ]
      }
    ]
  },
  {
    "version": "0.3.26",
    "date": "2026-09-21",
    "groups": [
      {
        "label": "Added",
        "items": [
          "E2E money-path suite. The real Fastify server boots over HTTP and walks the full council loop: register → units → billing run (late notice lands on the arrears unit) → Lightning quote with the per-site receive label → confirm posts to the unit's AR ledger → reconcile → hash-chain verification → deadline calendar → Form B issued while Form F is withheld on the debtor unit → another council sees nothing. 10 tests. CI now gates the *sequence* a real council runs, not just the parts.",
          "Guided first-month walkthrough. Five steps in treasurer order (bill → collect → reconcile → review → close) mounted at the top of the tools page, each linking to the real interactive panel where that step happens. Device-local progress (src/lib/first-month.ts, 6 tests) with reset, hide and restore — a nudge with a reset button, never a gate.",
          "Rosa quality gate. A golden set of 12 real BC questions with expected citations, scored by a pure eval harness (backend/src/rosa/eval.ts): hit@4 must be 1.0 and out-of-jurisdiction questions must be refused. The gate exposed a real gap — the keyword retriever answered an Alberta question from BC word overlap — so rosa.ts now fails closed on out-of-scope questions instead of guessing.",
          "Deadline calendar. The dashboard \"Upcoming\" list became a real month-view grid: due dates marked, statutory windows shaded (the window length is read from the deadline's own wording), today ringed, overdue red. src/lib/calendar.ts is pure and tested (4 tests); live deadlines when signed in, the honest demo set otherwise."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "The building modal lied. \"Reserve funds\" computed health × 2400 — demo math wearing a suit. The modal now shows health, open actions and the building's real issue, and says plainly where live detail lives.",
          "Fake buttons. Every dashboard button that only fired a toast now navigates to the real destination: plan-meeting and log-request to the tools demos, legal source to /legal, activity rows and building ••• to Strata Tools. A button either does the thing or it goes."
        ]
      }
    ]
  },
  {
    "version": "0.3.25",
    "date": "2026-09-21",
    "groups": [
      {
        "label": "Added",
        "items": [
          "The tour is reachable again. The first-run popup with the intro video was never deleted — fresh-browser checks on production proved the card works — but it only ever showed on the \"just looking\" path, and once dismissed it was unrecoverable. The dashboard welcome row now carries a replay pill (\"Watch the 60-second intro again\", all 9 locales) that reopens the full card on demand. Tour.svelte itself needed no changes.",
          "Saved searches. A pin button in the ⌘K results footer writes to openstrata-saved-searches (device-local, capped at 8, deduped case-insensitively; src/lib/saved-searches.ts, 6 tests). The dashboard renders the pins as one-tap /search?q= chips under the task list, × to unpin; pinning in the modal updates the strip live via a window event.",
          "Group counts in ⌘K chips. Each scoping chip shows its index size (\"Documents · 4\"), computed from the same index the search runs.",
          "Modal footer hints. \"↵ open · esc close\" under every modal state, aria-hidden, never in the tab order.",
          "Task list filters. All · Overdue · This week · Done chips. The week and overdue slices read the full list so a filter never misses rows parked behind the \"more\" button; Done shows ticked setup steps, untick to restore.",
          "Keyboard-first wizard. Number keys jump steps; skipped while typing in a field, and forward jumps across step 2 enforce the building-name rule exactly like the Next button.",
          "404 rescue. A dead URL's words become up to six /search?q= chips (stop-word filtered) instead of a dead end.",
          "Docs cross-link checker. Every markdown link in docs/ and llms.txt must resolve to a route walked from src/routes (dynamic [category].xml feeds count) or a file on disk. Its first run caught 4 broken ../diligence/ links — all fixed.",
          "Back-to-top. A floating arrow appears after ~900px of scroll on every long page, above the mobile dock, reduced-motion aware, hidden on print."
        ]
      }
    ]
  },
  {
    "version": "0.3.24",
    "date": "2026-09-20",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Recent searches in the ⌘K empty state. The modal now remembers the last five queries, device-local under openstrata-recent-searches (the same privacy posture as the wizard draft — no account, nothing leaves the browser). src/lib/recent-searches.ts is pure with 7 tests: queries cap at 80 characters, dedupe case-insensitively (\"form b\" == \"Form B\"), a new query moves up instead of duplicating, and one tap removes an entry. Corrupt storage degrades to an empty list.",
          "Scoping chips. Ten one-tap filters (Pages · Documents · Manual · Posts · FAQ · Templates · Legal · Sources · Tools · Tasks) sit above the results. Chips scope *before* ranking, so a query that missed the global top-12 cut still surfaces inside its group. Short chip labels come from searchGroupShort(t) — long names like \"Print-ready documents\" stay on the per-result eyebrows — and groupsInIndex() renders the chips from the index itself, so a future group cannot grow a chip that filters to nothing.",
          "Shareable search — /search?q=…. Every modal state links to the shareable page (results, and even no-results), pressing Enter with no row highlighted navigates there, and the page runs the *same* index so a shared link can never show different results than the modal did. Listed in the sitemap and llms.txt; the page sends noindex, follow because each query string is a soft-404 for a crawler while the route is not."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The last hard-coded copy went through the catalog. The thank-you page's flow prose (variant titles, the four step bodies) moved to src/lib/thankyou.ts as canonical English — the same rule as the manual and the custody page, because it is operational honesty about what just happened to someone's data — and its chrome (title, meta, buttons, \"No hidden steps\") went through the catalog in all 9 locales. Also catalogued: the home proof band (\"0% custody, always.\" / \"Statutory clocks that don't slip.\"), the design-page type specimens, the privacy/terms titles and metas, the wizard's \"What happens next →\", and the footer's Privacy/Terms links. The hard-coded-copy audit fell from 24 warnings to 0. Two keys (thanksNoHiddenSteps) end with an em dash instead of a colon — the audit's key regex reads a trailing :' as a phantom key, which surfaced as bogus parity errors.",
          "Help lands on the six-step guide. The dashboard sidebar's \"Need a hand?\" card and the HostConnect strip's help link now deep-link to /docs/manual/getting-started instead of the FAQ, and the hint copy says so (helpStartHere), because a person asking for help wants the walkthrough, not an index."
        ]
      },
      {
        "label": "Guarded",
        "items": [
          "Every indexed href must resolve to a canonical route (the sitemap's list, not the nav — pages like /custody deliberately live outside the bar). An index row pointing at a dead page now fails the suite.",
          "Short chip labels never collide within a locale, and the short/long label maps always cover the same ten groups.",
          "Share hrefs round-trip through URLSearchParams exactly."
        ]
      }
    ]
  },
  {
    "version": "0.3.23",
    "date": "2026-09-20",
    "groups": [
      {
        "label": "Fixed",
        "items": [
          "The ⌘K empty state names all ten groups, in every locale. The search modal's placeholder copy said “Search across pages, posts, FAQ, templates, and legal sources” — written when the index had five groups. v0.3.22 grew the index to ten and the copy lagged behind the product. The hint now names every group the index serves, in all nine locales, and a drift-guard test ties the canonical English hint to the group list out of buildSearchIndex: an eleventh group now fails the suite until the hint is rewritten."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "One home for the group labels. The modal's inline group-label map moved into search.ts as searchGroupLabels(t), so the per-result eyebrows, the empty-state hint and the index itself are derived from the same source.",
          "Two labels were quietly English-only. primarySources (“Primary and official sources”) and strataTool (“Strata Tool”) had no non-English catalog entries, so eight locales rendered them as English fallbacks. All eight now carry them; “Strata Tool” stays as the product name in every locale, matching the file's own convention (openStrataToolsCta)."
        ]
      }
    ]
  },
  {
    "version": "0.3.22",
    "date": "2026-09-19",
    "groups": [
      {
        "label": "Added",
        "items": [
          "“Continue where you left off” — the wizard keeps your draft. The 8-step Building Template Wizard held everything in component state: stop halfway — a phone call, lunch, a closed tab — and the whole building came back blank. It now persists a device-local draft (src/lib/resume.ts, localStorage, same convention as the setup ticks and the first-visit choice) on every step change, and the dashboard answers with one chip above the greeting: *Continue where you left off — Harbour House — 4 of 8 · in progress*. One click lands back on the exact step with every field as typed — name, address, unit count, banks, enabled sub-accounts, services, rails, bylaw choice — and the wizard confirms the restoration with a quiet “Draft restored” notice. Dismissing the chip discards the draft; generating the config clears it, because a finished build is not unfinished work. Parse degrades to “no draft” on corrupt or hostile storage, and a draft is only offered when it has a name and the visitor got past step 1. 8 tests.",
          "⌘K reaches the whole site. Site search now indexes the four print-ready documents — Form B and Form F are reachable by name for the first time, deep-linked to /documents?doc=… — the eight manual sections, and the dashboard's “What needs doing” task list. The index goes from seven groups to ten, so nothing a council can name is more than one keystroke away.",
          "An honest demo banner. On a sample-data dashboard (no host configured, no session) a banner now states plainly: *You are in demo mode — everything here is sample data, and nothing you type is saved to an account. Your building draft is kept on this device only.* One CTA — Save my building — goes straight to the wizard, whose draft now survives a refresh. It dismisses for a week (a day-stamp, not a forever flag) and the visibility rule (src/lib/demo-banner.ts, 7 tests) makes the important failure impossible: a signed-in council on their own host can never be told their real books are sample data."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "npm run check 0/0 · 214 tests (was 196: +8 resume, +7 banner, +3 search) · audit:i18n 921 keys × 9 locales · audit:contrast 116 pairs · build green."
        ]
      }
    ]
  },
  {
    "version": "0.3.21",
    "date": "2026-09-18",
    "groups": [
      {
        "label": "Changed",
        "items": [
          "The header is four things instead of six. Compliance and Docs left the bar and joined the Library menu, beside the legal sources, the templates and the printable documents — which is what they are. A council reads compliance material; it does not “go to compliance” the way it goes to its own dashboard. Nothing became unreachable: both are one click away, still in the footer, still in site search.",
          "The first visit is a question, not a wall. A brand-new visitor used to land on a full dashboard — four metric cards, a building list, an activity feed, four panels — for a building that is not theirs, with numbers that are not real. They now get one plain question with three ways in: look around, set a building up, or sign in. The dashboard appears the moment they choose, and the choice is remembered on the device only. - Visibility is decided before the first paint by the same class-before-paint trick the theme switch already uses, so there is no flash — and because it is CSS rather than a conditional render, the prerendered markup still contains the whole dashboard for a crawler. - The first-run tour now waits its turn. One first-run experience at a time; answering the question opens the tour over the dashboard the visitor just asked to see.",
          "Four panels became one list. The setup checklist, the statutory deadlines, the Forms tracker's windows and the month-end close each answered part of “what needs doing?” — and together they were a scavenger hunt. The dashboard now shows one ordered list: overdue, then urgent, then soon, then routine, then the setup steps last, because real work outranks finishing your profile. - A deadline inside two weeks is urgent whatever the API called it: the date is the fact, the severity label is an opinion. - Steps tick off in place, the list can be hidden, and it says how many rows are left in the full list. - SetupChecklist.svelte is deleted; the aggregation lives in src/lib/tasks.ts with 16 tests."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "Breadcrumbs mislabelled /documents as Docs. /documents.startsWith (/docs) is true, and the trail took the *first* match — so the printable documents page carried a crumb that linked to the wrong page. Resolution now happens on a segment boundary and prefers the deepest href, which also keeps /docs/manual landing on Docs."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "npm run check → 0 errors, 0 warnings. npm test → 196 passed (was 164). audit:i18n → 909 keys × 9 locales, parity green. audit:contrast → 116 pairs. Build green.",
          "Browser-verified on the production preview with the service worker unregistered: a first visit shows the question with the dashboard hidden and no tour overlay; choosing “just looking” reveals the dashboard in place, stores the choice, and opens the tour over it; the header renders four items with no Compliance link in the bar, while the Library menu holds Compliance, Docs, legal library, templates, print-ready documents, FAQ and changelog; the merged list renders six rows in urgency order (urgent Form B → EPR → AGM, then the setup steps) with its overflow count; the breadcrumb on /documents reads “Print-ready documents”; and there is 0 horizontal overflow at 390px and 1440px in light and dark.",
          "The urgency chip was rewritten from amber text on an amber tint to a neutral plate with a coloured dot. The tint pairing was not covered by audit:contrast, and “probably 4.5:1, on this machine” is not a measurement."
        ]
      }
    ]
  },
  {
    "version": "0.3.20",
    "date": "2026-09-18",
    "groups": [
      {
        "label": "Added",
        "items": [
          "A custody page anyone can read: /custody. 0% custody was four words inside a popup — the strongest promise the product makes, and the hardest one for a council to check. The page walks the money through three steps (an owner pays → the council holds it → OpenStrata writes it down), lists what the software cannot do as impossibilities, lists what a council can check as buttons, and says plainly what is not live yet. Linked from the home page's 0% custody proof card and the footer, listed in the sitemap, llms.txt and site search, with 11 tests — including a guard that every catalog key the page references exists, because a mistyped key renders as a blank line. - Body prose stays English in src/lib/custody.ts, the same rule the print-ready documents and the user manual follow. A machine translation of “we never hold your money” is a materially false statement.",
          "Per-site receive labels on every payment. A rail invoice was labelled with the rail's own name (Lightning Network) — a string identical in every Give A Bit project, so a node operator or a council could not tell whose money had arrived. Every quote now carries OST northgate U302 pay-9142: site code, council, unit, request. - backend/src/rails/receive-label.ts is pure and deterministic, derived from keys the payment request already persists — so no migration, and no drift between the wallet, the node and the stored row. 21 tests. An explicit family site-code table (OST / SATO / TAD / MOTO …) makes a collision a visible edit rather than a coincidence of spelling. assertReceiveLabelFor refuses a foreign label loudly at the rail seam. - The quote API returns receiveLabel and the checkout panel shows it beside the payment instructions, so the string a council writes on a transfer is the string the node records."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The pre-rebrand raster logo is gone. /pitch was the last page still shipping the old artwork; it now uses the same mark-on-navy plate as the favicon, the PWA icons and the printed letterhead.",
          "Link previews point at a new 1200×630 /og.png — the old 237×377 logo was upscaled and cropped by every crawler — and twitter:card is now summary_large_image. npm run icons emits it."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "static/icon.svg could not be rasterised. Its comment contained a double hyphen, which is a hard XML error, so the rasteriser refused the file. The mark had never actually been rendered from that source until og.png needed it.",
          "A malformed changelog front-matter line (project: openstrataversion_history:) had swallowed the project name."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "npm run check → 0 errors, 0 warnings. npm test → 164 passed (was 143). Backend: typecheck clean, 214 passed (was 191).",
          "audit:i18n → 886 keys × 9 locales, parity green. audit:contrast → 116 pairs, all at or above floor. Build green; /custody prerenders and the sitemap lists it.",
          "Browser-verified on the production preview with the service worker unregistered: /custody renders its 4 sections, 3 steps, 5 limits, 4 checks and 3 honesty lines with 0 overflow at 1440 and in dark mode; /pitch serves 0 raster logos and 4 vector marks on the navy plate (rgb(16,45,59)); /og.png returns 200 and /logo.png returns 404; the checkout's quote panel shows OST demo U101 demo with its label and hint in light and dark.",
          "Guarded by new tests: no shipping source may reference the retired logo, the in-app mark must match icon.svg path-for-path, og.png must be 1200×630, the manifest must point at rasters, and every catalog key the custody page and the checkout reference must exist."
        ]
      }
    ]
  },
  {
    "version": "0.3.19",
    "date": "2026-09-18",
    "groups": [
      {
        "label": "Changed",
        "items": [
          "The intro video's idle frame is a poster now. Kimi delivered a Cam-approved 1920×1080 thumbnail (static/video/openstrata-intro-poster.png, “Govern yourself.”) and the greeter popup's <video> points at it via poster=. Without it the player idled on a blank first frame, which reads as broken rather than paused."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "npm run check → 0 errors, 0 warnings. npm test → 143 passed.",
          "Build green; the poster is emitted to build/video/openstrata-intro-poster.png (852 kB) next to the video.",
          "Browser-verified against the production preview: the tour's video element resolves the poster URL and shows it before play."
        ]
      }
    ]
  },
  {
    "version": "0.3.18",
    "date": "2026-09-18",
    "groups": [
      {
        "label": "Added",
        "items": [
          "The new brush mark is the site's icon now. One master vector (static/icon.svg) plus a small-size rendition (static/favicon.svg), and scripts/generate-icons.mjs (npm run icons) rasterises the rest: favicon.ico, icon-192.png, icon-512.png and apple-touch-icon.png. The same mark is drawn inline by BrandMark.svelte in currentColor, so the header, the app sidebar, the footer, the auth card and the error page all carry the real logo instead of three CSS bars in an orange plate.",
          "/documents — print-ready documents. Meeting notice, meeting minutes, Form B (Information Certificate) and Form F (Certificate of Payment), each rendered as a white paper sheet with a letterhead, a reference code, a meta table, disclosure tables and signature lines. One printable document per page when the whole set is printed.",
          "src/lib/documents.ts — the document set and its pure helpers (docReference, addDays, daysBetween, applyNoticeParams), with 28 tests.",
          "scripts/inject-documents-i18n.mjs — 11 page-chrome keys × 9 locales."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "The header navigation is grouped. Twelve flat links needed ~1490px inside a 1232px bar, so the strip scrolled internally on every ordinary laptop and hid half the site behind an invisible scrollbar. Four inline destinations (Dashboard, Strata Tool, Compliance, Docs) plus two menus (Library, Company) bring the top level down to ~500px. src/lib/nav.ts is now the one authoring home: the flat list the footer and breadcrumbs read is derived from the grouped structure. The mobile drawer mirrors the same grouping.",
          "The desktop nav starts at 1280px, not 1024px. Between 1024 and 1280 the bar still could not fit six items alongside the actions cluster, so below xl the grouped drawer and the floating bottom dock carry navigation instead of a bar that clipped its own edges.",
          "The dashboard's notice builder no longer writes its own print page. It used to assemble inline HTML into a popup with its own fonts and colours; it now hands the council's date, time, place and agenda to /documents through the query string, so there is exactly one printable notice.",
          "static/sw.js cache name bumped to openstrata-v2 — which is what evicts the previous build's shell from an installed PWA."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "Dark mode's selected states were invisible. bg-brand-50 / bg-brand-100 are tints used ~25 times as a selected-state plate (chosen jurisdiction, chosen bylaw pack, active decision pill), normally paired with a brand or slate label. Neither step was ever remapped for dark mode, so the plate stayed near-white (#ecfeff) while its label stepped up to brand-200 (#a5f3fc) or slate-800 — about 1.2:1. Both steps now have dark values, and the green “brokerage” accent gets its own pair. audit:contrast gained a tint-pair section so this cannot come back.",
          ".marketing-mobile-nav was missing from the print hide list, so on a phone the floating bottom dock printed across the foot of every page.",
          "The printed sheet kept its screen styling. The print overrides lost to the component's scoped .print-doc.svelte-hash rules, leaving screen padding, a 14px radius and a drop shadow on paper.",
          "A hover-then-click on a grouped menu closed it. The pointer opened the menu and the click toggled it shut; a click on a hover-opened menu now pins it open, and the next click closes it.",
          "@page is now Letter with real margins, because the first market is BC."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "npm run check → 0 errors, 0 warnings. npm test → 143 passed (was 115).",
          "npm run audit:i18n → 872 keys across 9 locales. npm run audit:contrast → 116 pairs, all at or above floor.",
          "Build green; /documents prerenders, and sitemap.xml lists it.",
          "Browser-verified against the production preview with the service worker unregistered first: 114 page/theme/viewport combos (19 pages × 2 themes × 1440 / 1024 / 390) with 0 horizontal overflow and 0 text below floor on a brand tint. Nav measured at 1023 / 1024 / 1279 / 1280 / 1440 / 1920px — the grouped bar renders from 1280 with 0 strip overflow, and below that the grouped drawer opens with its headings and scrolls internally. Menu behaviour verified: hover opens, click pins, second click closes, Escape closes, outside-click closes. Print media emulation confirms the chrome is hidden and the sheet has no padding, radius or shadow. The full set prints 4 sheets with the right titles and refs, and the notice handoff renders Notice of Annual General Meeting with the council's own date, place and agenda."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "The backend is still not deployed. The website is live; the money-handling server has never run on a real host. That remains the gate on Phase 3.",
          "THOR's bitcoind has no wallet loaded (listwallets = []) — Cam has greenlit createwallet, but it has not been created yet.",
          "Ollama is deliberately not on THOR (RAM). Rosa answers on the keyword fallback until it runs somewhere else on the tailnet.",
          "static/logo.png (used by /pitch) is still the pre-rebrand artwork and was left untouched so the pitch deck's layout does not shift."
        ]
      }
    ]
  },
  {
    "version": "0.3.17",
    "date": "2026-09-18",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Frontend: per-tab hero artwork — src/lib/components/HeroArt.svelte draws one of six on-brand motifs (modules, chain, scales, ledger, network, signal) inside the shared .page-hero band, mounted on 14 pages via scripts/wire-hero-art.mjs. The motif is chosen by what the section *is*, not by rotation: /tools gets the module lattice, /roadmap and /spec get linked proof blocks, /compliance and /legal get statutes and a balance, /docs and /templates get rules documents, /about, /blog and /design get the community graph, /faq, /rss and /thank-you get answers radiating out. Drawn in currentColor only, so it inherits the band's brand tint and flips with the theme; decorative (aria-hidden), masked toward the edges, and hidden below 900px so it can never sit under a headline or add phone overflow.",
          "Frontend: in-app setup checklist on the dashboard (src/lib/components/SetupChecklist.svelte + src/lib/setup.ts). Four steps between a new workspace and a building that actually runs — add your units, open the two funds, load your bylaws, close your first month — each with a deep link, a progress meter, a dismiss control and a restore button. Progress is localStorage-only: the workspace is the record of truth, the panel is only a nudge. Corrupt, partial or hostile storage degrades to \"nothing done\" rather than throwing, and the dismissal is stored under its own key so an older build cannot resurrect a dismissed panel.",
          "Frontend: public /changelog page, generated from this file by scripts/generate-changelog.mjs → src/lib/changelog.generated.ts. Parses the markdown body (## [x.y.z] — date sections and their Added / Changed / Fixed / Verified / Known issues groups), carries the five releases that only ever existed in the front-matter version history through as summary-only entries rather than dropping or inventing them, and strips inline markdown (emphasis, code ticks and link targets) so the page never renders raw source syntax. Includes a change-type filter, per-release expand/collapse, a Newest-first timeline, and an RSS call to action. Wired into the nav, the dashboard footer, static/sitemap.xml and static/llms.txt.",
          "Frontend: src/lib/setup.test.ts (13 tests — hostile-storage parsing, canonical ordering, idempotent ticking, percent and completion) and src/lib/changelog.test.ts (7 tests — every CHANGELOG heading published, freshest-generation guard, newest-first ordering, no raw markdown).",
          "Tooling: npm run audit:contrast now checks 106 token pairs instead of 60, and an unresolvable token is a failure rather than a silent skip (the hole that hid all of the above)."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Frontend: light-mode state colours get the same split the orange already had. Text usages ride new documented steps — --success-text #0b6b49, --warning-text #8a5209, --danger-text #b3261e, --bitcoin-text #9a5700 — plus .text-* overrides for success, warning, danger, bitcoin, slate-400 and slate-500 in both themes, following the repo's established text-only-override convention so solid fills and tinted chips are untouched.",
          "Frontend: light-mode slate ramp is now stated in src/app.css instead of inherited from Tailwind's stock palette. The values are identical to stock, so nothing moves visually — but an undefined token cannot be audited, and these were exactly the steps the audit was silently skipping.",
          "Frontend: --color-danger-solid (#c92a2a, 5.46:1 with white) for solid danger buttons; decorative danger dots keep the bright --color-danger glow. A solid Bitcoin fill now takes dark ink via --on-bitcoin (6.96:1) instead of white on #f7931a (2.30:1) — the Bitcoin orange stays brand-bright, which is the point of the accent.",
          "Frontend: SetupChecklist sits directly under the dashboard welcome row; the first-run tour still comes first, and the checklist is behind it as intended.",
          "Version bump to v0.3.17 across root + backend package.json, both lockfiles, CHANGELOG.md, docs/MISSION.md, docs/EXECUTIVE-SUMMARY.md, docs/WORKPLAN.md, .ai_docs/current-status.md, LATEST-UPDATE.md."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "scripts/audit-contrast.mjs silently skipped any token with no value in src/app.css. Because the light-mode slate ramp and every semantic status step live in Tailwind's stock palette rather than ours, --color-slate-400 was never audited in light mode — where it was rendering meta text at 2.90:1 on paper (and --color-slate-500 at 4.04:1 on a surface-3 chip). Measured in a real browser, text-success chips sat at 2.18:1, text-warning at 1.99:1, text-danger at 3.76:1, text-bitcoin at 2.30:1, and white on a solid #f7931a Bitcoin fill at 2.30:1. All fixed above; the audit now fails loudly if a token cannot be resolved.",
          "Frontend: two bg-bitcoin text-white buttons (QR pay, 3-of-5 broadcast) and one bg-danger fine button were relying on that unreadable pairing — the Bitcoin fills now take dark ink and the danger button uses --color-danger-solid."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "npm run check → 0 errors, 0 warnings; npm test → 115 passed (14 files, +13 setup and +7 changelog tests); npm run audit:i18n → passed, 860 keys × 9 locales; npm run audit:contrast → passed, 106 token pairs; npm run build → green.",
          "Browser sweep (Chromium, production preview): 16 pages × light + dark = 32 combinations, 0 horizontal overflow and 0 contrast failures attributable to the changed tokens; hero art present on all 13 hero pages. Then 3 viewports × 2 themes × 4 pages = 24 combinations at 390×844, 768×900 and 1221×738 with 0 page overflow and 0 checklist overflow; the header artwork is display:none at 390 and 768 as designed and visible at 1221.",
          "Interaction-verified, not just rendered: /changelog filter narrows 74 entries to 17 and reports the active type, the latest release expands 74 → 77 entries and flips to \"Show less\", 5 summary-only earlier releases render, and the setup checklist ticks to 25%, writes {\"done\":[\"units\"],\"hidden\":false}, survives a reload at 25% with 1 ticked box, then dismisses to a restore button with openstrata-setup-hidden=1. One caveat found while testing: the site is a PWA, so a stale service worker serves the previous build — the sweep unregisters it and clears origin caches before measuring."
        ]
      }
    ]
  },
  {
    "version": "0.3.16",
    "date": "2026-09-18",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Frontend: branded page header band (.page-hero in src/app.css). Every top-level tab now renders the same header language — a brand wash, a fine drafting grid faded toward the edges, and a brand hairline along the top edge — mixed entirely from theme tokens. All 14 hand-rolled per-page gradients are replaced (scripts/migrate-page-hero.mjs). Five of them ended in to-white (from-brand-50 via-white, from-amber-50/50 to-white), which painted a bright band straight across dark mode; that class of bug is now impossible because the band cannot reference a fixed surface.",
          "Frontend: StartHere.svelte — a three-leg journey strip (Explore the modules → Configure your building → Register and go live) mounted under the header band on /tools, /tools/wizard, /thank-you and /docs/manual/getting-started. Visited legs tick off, the current leg is highlighted, and a progress meter shows the whole path. Progress is localStorage-only — no account, no network call.",
          "Frontend: src/lib/journey.ts — the pure progress logic behind the strip, with 10 unit tests (src/lib/journey.test.ts): malformed/partial/hostile storage degrades to \"nothing reached\" rather than throwing.",
          "Tooling: npm run audit:contrast (scripts/audit-contrast.mjs) — recomputes WCAG 2.2 contrast for 60 text-on-surface token pairs from src/app.css in light *and* dark, and fails on regression. It reads @theme, :root and .dark, resolves var() references, and honours the repo's .dark .text-<token> text-only override convention so a deliberate fix is not reported as a failure. Added to CI (frontend verify) and the deployment checklist."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Frontend: brand ramp steps 600/700/800 retuned from the stock cyan (#0891b2 / #0e7490 / #155e75) to #0f6d89 / #0b5a72 / #08485c. --color-brand-600 is used as a *fill* 72 times over, and white on the old #0891b2 measured only 3.68:1; it is now 5.88:1. --color-brand-500 and below stay stock — those are the accent/glow steps.",
          "Frontend: --muted #6d7a82 → #5e6b75 and --faint #9ca8ae → #7d8890 in light mode.",
          "Version bump to v0.3.16 across root + backend package.json, both lockfiles, CHANGELOG.md, docs/MISSION.md, docs/EXECUTIVE-SUMMARY.md, docs/WORKPLAN.md, .ai_docs/current-status.md, LATEST-UPDATE.md."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "Ten real contrast failures found by the new audit, all fixed. --faint measured 2.42:1 on white while driving 9–10px uppercase eyebrow labels → now 3.6:1 against a documented 3:1 floor for that decorative token. --muted was 4.41:1 on white and 3.9:1 on a surface-3 chip → now clears AA on canvas, paper and chips. text-brand-600 / text-brand-700 were 3.27–3.68:1 on light and 2.67–3.29:1 on dark → text usages now ride the ramp (brand-700/brand-800 light, brand-300/brand-200 dark) via new .text-brand-* rules, referencing palette variables so the green \"brokerage\" accent theme swaps with them. White on --orange measured 2.77:1 — the brand coral is a glow token, not a fill, so solid orange fills now use new --orange-solid / --orange-solid-deep (5.02:1 with white), and the coral is kept for icons, rails and dots. Applied across .primary-button, .signin-button, .mobile-nav .mobile-add, EmptyState, AuthModal and Tour.",
          "Frontend: two mid-page bg-gradient-to-b from-slate-50 to-white bands (/pitch, /about) also painted white in dark mode → to-transparent."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "npm run check → 0 errors, 0 warnings; npm test → 95 passed (12 files, +10 journey tests); npm run audit:i18n → passed, 820 keys; npm run audit:contrast → passed, 60 token pairs; npm run build → green.",
          "Browser sweep, 17 pages × light + dark = 34 combinations, 0 contrast failures and 0 horizontal overflow. Contrast was computed against the live DOM with a real WCAG composite (alpha-blended ancestor surfaces, oklab() and color(srgb …) parsed), probing h1/h2/p/links/buttons/table cells at their actual font sizes and boldness — not from the stylesheet alone. StartHere renders 3 legs on all four journey pages; .page-hero is present on all 14 migrated pages."
        ]
      }
    ]
  },
  {
    "version": "0.3.15",
    "date": "2026-09-18",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Frontend: the greeter popup on / now plays the delivered intro video. Step 1 of the first-run tour renders /video/openstrata-intro.mp4 (Kimi's HyperFrames render, 57s, 1920×1080, committed at static/video/openstrata-intro.mp4) in a real <video> element with inline controls; if the asset ever fails to load the card falls back to the honest placeholder copy instead of a broken frame.",
          "Frontend: “What you get” — four plain-language offer facts inside the popup (0% custody, BCFSA-aware compliance, a Bitcoin proof trail for every action, portable history) — and “Where to start” — a three-step instruction list. Both sit beside the video.",
          "i18n: 9 new catalog keys — tourFactsTitle, tourFact1–tourFact4, tourHowTitle, tourHow1–tourHow3 — translated across all 9 locales.",
          "Docs: scripts/inject-tour-offer-i18n.mjs (one-off catalog injector, same pattern as inject-recon-i18n.mjs)."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Frontend: step 1 of the tour is now a wider two-column card (video left; facts + start steps right) and steps 2–4 stay narrow. Previously the card was single-column and 934px tall, so a 738px viewport hid 255px of it — including the Next button. Now: 720×522 with zero hidden overflow at 768px+ and at 390px, verified in a real browser on all four steps.",
          "Frontend: the video section and the offer copy appear on step 1 only, so steps 2–4 stay lean.",
          "i18n: tourVideoFallback rewritten in all 9 locales — the old “Video coming soon — back in a few days.” line is no longer true.",
          "Version bump to v0.3.15 across root + backend package.json, both lockfiles, CHANGELOG.md, docs/MISSION.md, docs/EXECUTIVE-SUMMARY.md, docs/WORKPLAN.md, .ai_docs/current-status.md, LATEST-UPDATE.md."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "i18n: npm run audit:i18n was failing on main — the v0.3.14 commit added the four video keys to English, French, Spanish, Chinese, Hindi and Filipino but never to Polish, Ukrainian or Swahili, and the locale-parity guard checks every locale against French. The missing keys are now translated, so the audit passes at 813 keys × 9 locales. This would have failed the frontend verify CI job."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "npm run check → 0 errors, 0 warnings; npm test → 85 passed; npm run audit:i18n → passed, 813 keys; npm run build → green (the video is emitted to build/video/openstrata-intro.mp4).",
          "Browser-verified (Chromium, production preview): all 4 tour steps, 0 hidden overflow and 0 horizontal page overflow at 1221×738, 768×900 and 390×844; step 1 resolves /video/openstrata-intro.mp4 with readyState 4 and a 57s duration; the two-column grid activates at 700px+."
        ]
      }
    ]
  },
  {
    "version": "0.3.14",
    "date": "2026-09-17",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Frontend: first-run greeter popup card rebuilt with a video section (src/lib/components/Tour.svelte): greeting card (icon + scene art + eyebrow/title/body) + a video section inside the same card, so a new visitor gets hello + one-minute intro in one glance. Video section: a tease frame (play mark + short subhead + fallback hint + CTA) collapses to a single trigger line when not expanded; expanded it holds either a real <video> once the asset lands or an honest \"Video coming soon — back in a few days.\" placeholder.",
          "i18n: new video-section keys — tourVideoTitle, tourVideoSub, tourVideoCta, tourVideoFallback (English for now).",
          "Docs: Kimi video handoff — docs/KIMI-HANDOFF.md session section + docs/VIDEO-SPECS.md (specs + 1-minute intro script + delivery checklist). Kimi owns the recording + asset URL; the frontend just needs one src swapped in after she delivers."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Version bump to v0.3.14 across root + backend package.json, both lockfiles, CHANGELOG.md, docs/MISSION.md, docs/EXECUTIVE-SUMMARY.md, docs/WORKPLAN.md, .ai_docs/current-status.md, LATEST-UPDATE.md."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "npm run check clean; npm test green; popup renders on / for signed-out fresh visitors; video section inside the greeting card, inline, does not break the 4-step tour."
        ]
      }
    ]
  },
  {
    "version": "0.3.13",
    "date": "2026-09-16",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Backend: Ziggy PSBT workflow seam (broadcastPsbtWorkflow in backend/src/ziggy/node-broadcast.ts) — the BIP174 node path: walletprocesspsbt (sign) → finalizepsbt (extract when complete) → sendpsbt → txid. The signing coordinator's aggregated psbtB64 passes straight through; otherwise a deterministic BIP174-shaped skeleton is serialized from the plan (serializePsbtSkeleton: global unsigned-tx map + per-input partial-sig entries). Readiness guard: the seam refuses below-threshold plans before any RPC (same contract as broadcastPsbt).",
          "Backend: /treasury/psbt/broadcast tries the workflow seam first on the rail path; the raw-tx seam (sendrawtransaction, railEnabled: true) is the watch-only fallback. Both failing → txid: null + rail: 'unavailable' + placeholder: false — the broadcast-honesty tri-state is preserved."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "Pre-existing typecheck error in rosa/ingest-vector.ts (TS5076) and the stale broadcastRawTx throw test (both also fixed independently by the family; kept through the rebase)."
        ]
      },
      {
        "label": "Verified",
        "items": [
          "backend npm run typecheck clean; backend npm test 191 tests (was 182; bitcoin-modules 26), e2e smoke 6 skipped (no DB)."
        ]
      }
    ]
  },
  {
    "version": "0.3.10",
    "date": "2026-09-16",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Backend: Rosa corpus → pgvector indexer (backend/src/rosa/ingest-vector.ts) — embeds the in-memory BC corpus with Ollama /api/embeddings (nomic-embed-text, 768 dim) and upserts into corpus_chunk (migration 0002), idempotent per citation; CLI rosa index (embed + write corpus, needs Ollama + DB) + rosa reset (dev: drop + re-create corpus_chunk). Pure noun-phrase placeholder embed mode (ROSA_EMBED_MODE=pure or no OLLAMA_BASE_URL) lets rosa index populate corpus_chunk now before Ollama is provisioned — proving the retriever + indexer + query path end-to-end against the BC corpus with a real pgvector cosine search.",
          "Backend: Ziggy on-chain broadcast plug-in seam (backend/src/ziggy/node-broadcast.ts) — bitcoind JSON-RPC raw-tx path first (sendrawtransaction → txid; PSBT workflow seam walletprocesspsbt → finalizepsbt → sendpsbt is the next step). broadcastRawTx(plan, btc, outputs) → { txid, hex }; returns a deterministic placeholder txid (psbt:<planId>:<shortHash>) when no node client is reachable so the rest of the seam (UI, receipts, reconcile) can iterate now; real node client overrides it when configured. planSummary(plan) helper.",
          "Backend: /treasury/psbt/broadcast now calls broadcastRawTx when BITCOIN_RAIL_ENABLED=true + BITCOIN_NODE_URL + BITCOIN_RPC_USER/BITCOIN_RPC_PASS are set and returns the real txid; otherwise returns the placeholder txid.",
          "Backend CLI: rosa ingest (pure validate, unchanged), rosa index (new), rosa reset (new).",
          "Backend: BITCOIN_RPC_USER/BITCOIN_RPC_PASS in .env.example.",
          "Docs: docs/TAILSCALE-ONBOARDING.md — self-contained, read-only walkthrough any operator can follow to stand up the backend on their own host behind Tailscale (Path A: solo operator, one host, one tailnet; Path B: any user/team, each operator uses their own Tailscale). The onboarding agent sets .env, brings up compose, runs migrate + e2e smoke gate, prints the MagicDNS name + PUBLIC_API_BASE_URL value — never touches auth tokens, JWTs, or council data.",
          "Docs: backend/README.md CLI section (rosa ingest/rosa index/rosa reset/ziggy simulate) + Deployment model section; backend/API.md Rosa two-tier retrieval seam doc (with rosa index/rosa reset notes) + psbt/broadcast endpoint doc (raw-tx seam first, bitcoind RPC auth); docs/DEPLOYMENT.md links to TAILSCALE-ONBOARDING.md + after-host rosa index/rails steps; docs/ROADMAP.md + docs/WORKPLAN.md all Phase 3 items complete.",
          "Docs: .ai_docs/current-status.md, docs/KIMI-HANDOFF.md, LATEST-UPDATE.md refreshed with the full run (two batches) + decisions."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "broadcastRawTx returned null txid when no node client was reachable — now returns a deterministic placeholder txid so the rest of the seam can iterate."
        ]
      },
      {
        "label": "Known issues",
        "items": [
          "Phase 3 backend not yet deployed on a Tailscale host (the e2e smoke gate covers the Postgres adapters; a live host run is still pending).",
          "Rosa answers with pgvector+Ollama embeddings only after Ollama is provisioned and rosa index has run; until then the keyword fallback answers with citations.",
          "Ziggy PSBT broadcast returns a placeholder txid until a real bitcoind/LND node client is configured and enabled in .env.",
          "Sovereign rails prepared, not connected: no LND/Liquid/PayNym/Nostr relay running on a host; cadPerBtc needs a live rate feed.",
          "Form B/F PDF file output remains a browser-side print path (print-ready HTML), not a server-side PDF.",
          "Machine-drafted locale overrides need professional human review before being treated as reviewed."
        ]
      },
      {
        "label": "Added",
        "items": [
          "Reusable Card component (src/lib/components/Card.svelte) with content/compact/hero variants; migrated 47 content cards across 9 route pages (about, blog, docs, legal, templates, compliance, pitch, roadmap, spec, tools, rss). Structural cards (tables, accordion wrappers, the design page's raw-class demo) intentionally remain glass-card",
          "Marketing typography ramp: h1 36px / section h2 24px / sub-section h2 20px, card titles weight-800 (scoped .mesh-bg .glass-card) across all 13 marketing pages"
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Dashboard rail + marketing cards unified on one token set: .panel padding 17px→24px, weight-800 headings, shared --shadow-card; SatohashStatus third visual language eliminated",
          "Sidebar shell pinned to the viewport (top:0 + max-height:100dvh); HostConnect strip moved into the dashboard's main column so the nav footer button stays visible at every size",
          ":root { color; background } now wired to var(--ink)/var(--canvas) so dark-mode body text actually flips"
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "Site-wide Tailwind v4 cascade bug: unlayered element resets (a{color:inherit}, button{border:0;font:inherit}) were beating the layered .text-*/.border-* utilities, so every brand link rendered plain ink (invisible in dark mode) and buttons lost size/border. Moved the resets into @layer base so utilities win",
          "text-bc-blue on dark cards was ~2:1 (dark navy tuned for light surfaces); lightened dark-mode text usages only (solid bg-bc-blue badges keep the navy behind white text) to 6.9–9.0:1",
          "Pre-existing RSS mobile overflow: long <code> endpoint paths forced the page ~79px wide; added min-w-0 to grid columns + break-all to paths"
        ]
      },
      {
        "label": "Verified",
        "items": [
          "Real browser (Chrome + CDP): brand links teal #0891b2 in both modes, dark body #e2e8f0, bc-blue chips 6.9–9.0:1, zero horizontal overflow on all 13 pages × 3 sizes (light + dark). svelte-check 0/0, 85 tests, build clean"
        ]
      }
    ]
  },
  {
    "version": "0.3.9",
    "date": "2026-08-26",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Backend: Rosa pgvector/Ollama retriever (backend/src/rosa/vector-retriever.ts) — real pgvector + Ollama retriever on the existing Retriever contract; embeds the question with Ollama /api/embeddings (nomic-embed-text, 768 dim), cosine-nearest-neighbor searches corpus_chunk (migration 0002, vector(768), HNSW) via pgvector <=>, falls back to keywordRetriever when pgvector/Ollama are unavailable. POST /api/v1/rosa/query + /rosa/sources unchanged; response carries collection so callers can tell which tier answered.",
          "Backend: Ziggy PSBT broadcast + on-chain reconcile seam (backend/src/ziggy/broadcast.ts) — broadcastPsbt (marks a ready plan broadcasted; refuses below threshold) + postSpendToLedger (debits the authorized fund on the trust ledger so the on-chain leg reconciles into the same hash chain). Wired as POST /api/v1/treasury/psbt/broadcast (treasurer+); /treasury/psbt/plan unchanged.",
          "Backend: Tailscale-first, per-user-tailnet self-host deployment model — backend/README.md Deployment model section, .env.example Tailscale-host-metadata + per-user-tailnet notes, backend/API.md notes."
        ]
      },
      {
        "label": "Changed",
        "items": [
          "docs/ROADMAP.md + docs/WORKPLAN.md: Phase 3 items marked complete.",
          ".ai_docs/current-status.md, docs/KIMI-HANDOFF.md, LATEST-UPDATE.md: refreshed."
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "Tailwind v4 unlayered-reset cascade bug (already in 0.3.9 code, documented here for the release marker)."
        ]
      }
    ]
  },
  {
    "version": "0.3.5",
    "date": "2026-08-26",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Per-council DB-backed unit registry (migration 0005_council_units.sql, unit table keyed on (community_id, unit_ref))",
          "UnitStore interface + PostgresUnitStore + MemUnitStore (list/get/upsert/remove/seedDefault); register seeds each new council's building",
          "GET /api/v1/units/:unitRef unit detail — AR ledger balance (hash-chain verified) + payment requests (unit → payment → ledger traceability)",
          "POST /api/v1/units (treasurer+, canonicalized unitRefs) and DELETE /api/v1/units/:unitRef (admin)",
          "Frontend Form K hub: live unit-detail panel + add/remove unit controls when signed in"
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "PostgresPaymentRequestStore.markStatus wrote the referenceCode into status (status = $2 instead of $3) — the e2e re-quote assertion would have failed on a real Postgres",
          "Payment-quote unitRefs now canonicalize at the boundary (unit-302 → 302) so stored rows, referenceCodes, and unit detail agree",
          "Billing AR funds aligned to the canonical ar:unit-<n> account so unit-detail balances read real charges"
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Version markers synced to v0.3.5 (root + backend package.json); backend now 167 tests / 16 files, frontend 45 tests, i18n 565 keys × 9 locales"
        ]
      }
    ]
  },
  {
    "version": "0.3.4",
    "date": "2026-08-26",
    "groups": [
      {
        "label": "Added",
        "items": [
          "20-item upgrade push: auth rate limiting (#6), build-time CSP pinning (#2), monthly treasury series endpoint (#4), live CAD/BTC rate provider (#7), meetings quorum/voting UI (#8), transparent sub-accounts dashboard (#10), CSV bank-feed import (#12), war-chest DCA planner (#18), PSBT 3-of-5 orchestration seam (#15), Satohash stamp endpoint (#19), watch-only xpub import (#16), portable export (#20), CRT evidence bundle (#11), print-ready Form B/F (#9)"
        ]
      }
    ]
  },
  {
    "version": "0.3.3",
    "date": "2026-08-26",
    "groups": [
      {
        "label": "Fixed",
        "items": [
          "CSP in static/_headers was blocking the page's own assets (Google Fonts, Umami analytics, live-API connect-src); fonts now load once, unused Inter dropped"
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Landing shell tightened (1280px content, crisp 2-layer card shadows) per \"solid, tight\" pass"
        ]
      }
    ]
  },
  {
    "version": "0.3.2",
    "date": "2026-08-26",
    "groups": [
      {
        "label": "Added",
        "items": [
          "src/lib/api/ client (config/token/client/auth + typed ledger/units/rails helpers), AuthModal, Live/Demo pill, dashboard + tools + reconciler + pitch wired to /api/v1/* with demo fallback"
        ]
      }
    ]
  },
  {
    "version": "0.3.1",
    "date": "2026-08-26",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Zero-dependency JWT auth + multi-tenant council scoping (migration 0004), roles admin/treasurer/member, tenant-isolated payment store, Postgres e2e smoke suite + CI job"
        ]
      }
    ]
  },
  {
    "version": "0.2.6",
    "date": "2026-08-25",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Migrated remaining hard-coded interface copy across all 14 routes (dashboard footer, wizard, about, blog, templates, legal, roadmap, rss, spec, compliance, tools, docs, pitch) to the shared locale catalog — 458 keys total",
          "First reviewed locale overrides for French (fr-CA), covering all interface copy added in v0.2.6",
          "npm run audit:i18n now scans for hard-coded text nodes, placeholders, and meta content, so new English chrome can be caught before release"
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Version markers (layout, pitch, wizard config) derive from package.json v0.2.6"
        ]
      }
    ]
  },
  {
    "version": "0.2.5",
    "date": "2026-08-25",
    "groups": [
      {
        "label": "Fixed",
        "items": [
          "Centralized visible, metadata, pitch, and generated-config version markers on the package version",
          "Removed stale v0.2.0 and 0.1.0 release identifiers from active application surfaces"
        ]
      }
    ]
  },
  {
    "version": "0.2.4",
    "date": "2026-08-25",
    "groups": [
      {
        "label": "Fixed",
        "items": [
          "Synchronized package-lock.json with package.json so Cloudflare Pages can complete npm ci",
          "Added a versioned deployment repair release after stale production output was detected"
        ]
      }
    ]
  },
  {
    "version": "0.2.3",
    "date": "2026-08-25",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Locale-aware date, number, and CAD currency formatting for supported languages",
          "npm run audit:i18n translation completeness audit for route catalog usage"
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Dashboard, About, Pitch, Blog, and shared footer now respond to the active locale for visible formatted values"
        ]
      }
    ]
  },
  {
    "version": "0.2.2",
    "date": "2026-08-25",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Reusable /templates library for legal, governance, and finance workflows",
          "Source and professional-review notes on every starter template",
          "Shared locale keys for template descriptions and sources"
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Finished remaining visible wizard and compliance interface copy through the shared locale catalog",
          "Added /templates to the site navigation"
        ]
      }
    ]
  },
  {
    "version": "0.2.1",
    "date": "2026-08-25",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Shared locale coverage for the public blog interface",
          "Source-linked /legal library for BC legislation, regulations, official guidance, and tribunal information",
          "Legal-information notice separating workflow support from legal advice"
        ]
      }
    ]
  },
  {
    "version": "0.2.0",
    "date": "2026-08-25",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Responsive OpenStrata operations dashboard with desktop sidebar and mobile navigation",
          "Multilingual shell for English, French, Spanish, Chinese, Hindi, Filipino, Polish, Ukrainian, and Swahili",
          "Building health cards, activity feed, upcoming events, quick actions, and formation workspace modal",
          "Trust-oriented footer and visible product version marker"
        ]
      },
      {
        "label": "Changed",
        "items": [
          "Rebuilt the missing SvelteKit source foundation for the current GUI"
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "Added accessible interactive card and dialog semantics"
        ]
      }
    ]
  },
  {
    "version": "0.1.0",
    "date": "2026-06-22",
    "groups": [
      {
        "label": "Added",
        "items": [
          "Initial project scaffold",
          "Project documentation from canonical TEMPLATE (8 files)"
        ]
      },
      {
        "label": "Changed",
        "items": [
          "None"
        ]
      },
      {
        "label": "Fixed",
        "items": [
          "None"
        ]
      }
    ]
  }
];

/** Earlier releases recorded only in the changelog's version history. */
export const changelogEarlyReleases: Array<{ version: string; summary: string | null }> = [
  {
    "version": "0.3.12",
    "summary": "Fix the demo notice layout on phones: the flex-1 text column next to shrink-0 action buttons collapsed to a 13px-wide sliver at 390/430px (a 604px-tall notice), so the strip now uses its own flex classes with a real flex-basis and the buttons wrap to their own line. Text measure 268-338px at 360/390/430, no overlap; svelte-check 0/0, 85 tests, i18n audit clean."
  },
  {
    "version": "0.3.11",
    "summary": "Visitor-honest demo mode: the dashboard no longer greets the public with a build-configuration prompt. The demo notice now states plainly that every community, balance and action on screen is sample data, offers one obvious way to request access, and keeps the operator path as a quiet 'Running your own host?' link documented in README.md; 6 new catalog keys x 9 locales, i18n audit 0 missing keys / 0 hard-coded-copy warnings."
  },
  {
    "version": "0.3.8",
    "summary": "Next 20 shipped — live flows, governance, Bitcoin & trust: RosaChat citation-only compliance Q&A, register wizard, QR scan-to-pay + wallet deep links, Forms B/F 7-day tracker, MyUnit panel, BallotEngine + minutes export, CRT-ready bylaw case file, statutory meeting notices, compliance health score, mempool.space balances, war-chest DCA planner with Form B disclosure, live CAD/BTC sparkline, rails readiness checklist, ledger chain visualizer, PWA offline + install, a11y 0-warning, tour/empty-state illustrations, host-connect strip; browser-verified zero overflow 390→1280, 78 frontend tests, i18n 893 keys x 9 locales"
  },
  {
    "version": "0.3.7",
    "summary": "All 20 user-flow/GUI/Bitcoin improvements shipped: backend member registry (migration 0006) + /members, verified /ledger/entries, /deadlines; frontend CheckoutFlow pay-fees + receipts, MonthlyClose, BylawCase, MemberWorkspace, DeadlinesPanel, brand-accent theming + /design page, RailsStatus, SigningRoom, WalletPanel, LedgerExplorer, ExportCenter, MemberManager, NotificationsFeed, RateBadge, glossary + illustrations + print styles; mobile-verified zero overflow 390→1698"
  },
  {
    "version": "0.3.6",
    "summary": "GUI & user-flow push — all 20 improvements shipped: SVG icon system, real glass-card tokens (was undefined), typography ramp, designed empty states, breadcrumbs, tools sub-nav, scroll-spy TOC, tool modules in the Cmd-K palette, mobile dock on every page, view transitions, shimmer skeletons, dynamic time-of-day greeting, metric sparklines, micro-interactions, first-run tour, confirm dialogs, error toasts + inline validation, last-synced chrome, and hero-pattern CTAs. Tablet-width header overflow fixed (jurisdiction picker moves to lg+)."
  }
];
