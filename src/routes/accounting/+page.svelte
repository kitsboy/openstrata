<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import BarChart from '$lib/components/BarChart.svelte';
	import BudgetSheet from '$lib/components/BudgetSheet.svelte';
	import ArrearsSheet from '$lib/components/ArrearsSheet.svelte';
	import CashStatement from '$lib/components/CashStatement.svelte';
	import CloseReconciliation from '$lib/components/CloseReconciliation.svelte';
	import LevySheet from '$lib/components/LevySheet.svelte';
	import SeptemberClose from '$lib/components/SeptemberClose.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { books } from '$lib/demo/books';
	import { OPENING_CASH, statement } from '$lib/ledger-statement';
	import { OPERATING_ACCOUNT, OPERATING_OPENING, cashStatement } from '$lib/cash-statement';
	import { BOOK_RECONCILIATION } from '$lib/close-reconciliation';
	import { BOOK_LEVY_SHEET } from '$lib/levy-sheet';
	import { printedLine } from '$lib/budget-copy';
	import { age, summarise } from '$lib/arrears';
	import { arrearsSheet } from '$lib/arrears-sheet';
	import { charges, LEVY_PLAN_CENTS } from '$lib/demo/arrears';
	import { building, depreciation, formF, units } from '$lib/demo/building';
	import { PERIOD_PARAM, parsePeriod, type PeriodPoint } from '$lib/period-link';
	import { cashAt, cashRows } from '$lib/fund-history';
	import { reservePlan } from '$lib/reserve-plan';
	import { reservePicture } from '$lib/demo/reserve';
	import { budgetSheet } from '$lib/budget-sheet';

	type TabId =
		| 'overview'
		| 'budget'
		| 'receivables'
		| 'payables'
		| 'funds'
		| 'levy'
		| 'reserve'
		| 'journal';
	const TAB_IDS: readonly TabId[] = [
		'overview',
		'budget',
		'receivables',
		'payables',
		'funds',
		'levy',
		'reserve',
		'journal'
	];
	let tab = $state<TabId>('overview');
	/** The tabs that print a sheet of their own, so the page's furniture comes off the paper. */
	const printsOwnSheet = $derived(
		tab === 'overview' ||
			tab === 'budget' ||
			tab === 'receivables' ||
			tab === 'journal' ||
			tab === 'levy'
	);

	/**
	 * A month carried in from the compliance-health trend: `?period=2026-09` opens
	 * the receivables tab aged at 30 September, which is the book that point scored.
	 * Read in an effect because `$page.url.searchParams` is not available while the
	 * page is prerendered, and only ever set from a valid month: a bad link leaves
	 * the reader on today's books rather than on a half-filtered page.
	 *
	 * The same effect reads a search result's link. `?tab=journal#entry-<hash>`
	 * opens the journal and the drawer for that entry, so the row a result names is
	 * the row the reader lands on — the hash is the entry's own, not a memo match.
	 */
	let period = $state<PeriodPoint | null>(null);
	$effect(() => {
		const url = $page.url;
		const next = parsePeriod(url.searchParams.get(PERIOD_PARAM));
		period = next;
		if (next) tab = 'receivables';

		const named = url.searchParams.get('tab');
		if (named && (TAB_IDS as readonly string[]).includes(named) && !next) {
			tab = named as TabId;
		}

		const hash = url.hash.replace(/^#/, '');
		if (hash.startsWith('entry-')) {
			tab = 'journal';
			openEntry = hash.slice('entry-'.length);
		}
	});

	/** Bring a linked entry into view once its drawer exists. */
	$effect(() => {
		if (!openEntry) return;
		const id = `entry-${openEntry}`;
		requestAnimationFrame(() =>
			document.getElementById(id)?.scrollIntoView({ block: 'center' })
		);
	});
	/** The date every age is counted to: the linked month end, or today's statement. */
	const asOf = $derived(period?.asOf ?? building.asOf);
	/** The same day written out for the reader, in their language. */
	const longDate = $derived(formatDate(asOf, $locale, { day: 'numeric', month: 'long', year: 'numeric' }));
	/** The close the rest of the books are written at, for the lines that cannot move. */
	const closeDate = formatDate(building.asOf, $locale, { day: 'numeric', month: 'long', year: 'numeric' });
	// The month's own statement, where the statements reach. `null` on today's
	// books, and null for a month the bank has not closed either — a month with no
	// statement is said to be one, not given an interpolated balance.
	const monthCash = $derived(cashAt(period?.period));
	const cashMonths = cashRows();
	// The ladder opens on what is actually late. A book where every lot is current
	// still has a total, and the toggle brings the other 36 lots back into view.
	let onlyPastDue = $state(true);
	let openEntry = $state<string | null>(null);

	const chart = books.monthly.map((month) => ({
		label: month.label,
		value: month.fees / 100,
		value2: month.expenses / 100
	}));

	// Receivables are aged from the day each charge fell due, not from a status
	// field. `demo/arrears` supplies the dates; `lib/arrears` owns the counting.
	const aged = $derived(
		age(charges(), asOf).map((row) => {
			const unit = units.find((candidate) => candidate.id === row.unitId)!;
			return { ...row, unit, withheld: formF(unit) === 'withheld' };
		})
	);
	const summary = $derived(summarise(aged));

	/**
	 * The ladder as paper. Built from every lot, never from the filtered `ladder`
	 * below: a control on screen must not change the total on the sheet.
	 */
	const arrearsPrint = $derived(
		arrearsSheet({
			lots: aged.map((row) => ({
				unitId: row.unitId,
				owner: row.unit.owner,
				buckets: row.buckets,
				total: row.total,
				pastDue: row.pastDue,
				planned: row.planned,
				oldest: row.oldest,
				oldestDays: row.oldestDays,
				withheld: row.withheld
			})),
			asOf,
			totalLots: units.length
		})
	);

	// A lot with nothing on the books has no charges, so the ladder has no row for
	// it. "Show every lot" still owes a row: the building has 40, not the 37 that
	// happen to owe something.
	const agedById = $derived(new Map(aged.map((row) => [row.unitId, row])));
	const everyLot = $derived(units.map(
		(unit) =>
			agedById.get(unit.id) ?? {
				unitId: unit.id,
				buckets: { current: 0, age30: 0, age60: 0, age90: 0, over90: 0 },
				total: 0,
				pastDue: 0,
				planned: 0,
				oldest: null,
				oldestDays: 0,
				unit
			}
	));
	const ladder = $derived(onlyPastDue ? aged.filter((row) => row.pastDue > 0) : everyLot);
	const planned = $derived(aged.filter((row) => row.planned > 0));

	// The cards above are the whole book; the table's own total is only the rows on
	// screen, so a turned-on filter cannot leave a footer that adds up to more than
	// the reader can see.
	const shownTotals = $derived.by(() => {
		const buckets = { current: 0, age30: 0, age60: 0, age90: 0, over90: 0 };
		let total = 0;
		for (const row of ladder) {
			buckets.current += row.buckets.current;
			buckets.age30 += row.buckets.age30;
			buckets.age60 += row.buckets.age60;
			buckets.age90 += row.buckets.age90;
			buckets.over90 += row.buckets.over90;
			total += row.total;
		}
		return { buckets, total };
	});

	// The statement closes on the cash the Three funds tab reports, so the opening
	// balance is the closing cash less everything the journal moved. Both figures
	// are on the page: a reader can add the column up and land on the funds tab.
	// The subtraction lives in `ledger-statement`, because the search index needs
	// the same opening balance to produce the same entry hashes.
	const openingCash = OPENING_CASH;
	// A journal is dated entries, so a month carried in is the same book stopped
	// short: everything posted on or before that day, run from the fiscal year's
	// opening cash. Nothing is estimated — an entry that had not been posted by
	// then simply is not in the statement.
	const journalEntries = $derived(
		period ? books.journal.filter((entry) => entry.date <= asOf) : books.journal
	);
	const journalRows = $derived(statement(journalEntries, openingCash));
	/**
	 * The same entries as the operating account's own statement. The sheet is one
	 * bank account, so its column is not the page's combined-cash column: it runs
	 * from the operating opening, prints every entry in the chain (an entry that
	 * missed the account prints a dash and leaves the balance alone), and closes
	 * on the operating cash the funds tab reports.
	 */
	const cashSheet = $derived(cashStatement(journalEntries, OPERATING_ACCOUNT, OPERATING_OPENING));
	/** The first day the sample journal has anything on it. */
	const journalFirst =
		books.journal
			.map((entry) => entry.date)
			.sort()
			.at(0) ?? building.asOf;

	/** A month's movement: money in is green and signed, money out carries the minus. */
	function changeLabel(cents: number): string {
		if (cents === 0) return '—';
		return cents > 0 ? `+${money(cents)}` : `−${money(-cents)}`;
	}

	/** A journal reads debit-positive; money out carries the minus and shows in red. */
	function signed(cents: number): string {
		if (cents === 0) return '—';
		return cents > 0 ? money(cents) : `−${money(-cents)}`;
	}

	function cashTone(cents: number): string {
		if (cents === 0) return 'text-slate-400';
		return cents > 0 ? 'text-emerald-700' : 'text-rose-700';
	}

	/**
	 * The budget on paper: the fee run, the other income codes, every expense line
	 * and the reserve contribution, read from the books. The sheet's own rules —
	 * the pro-rated plan, the variance's direction, the reserve's missing verdict —
	 * live in `budget-sheet` so the printed page and its tests cannot disagree.
	 *
	 * The names and the reasons are translated by account code (`budget-copy`), so
	 * the sheet a French reader is handed is French, while every row keeps the code
	 * the auditor looks for.
	 */
	const budget = $derived(
		budgetSheet({
			monthsElapsed: books.monthsElapsed,
			income: [
				printedLine(
					{
						code: '4000',
						name: 'Strata fees',
						annualCents: books.feeAnnual,
						ytdCents: books.feesOperating + books.feesCrf
					},
					$copy
				),
				...books.incomeLines.map((line) => printedLine(line, $copy))
			],
			expense: books.expenses.map((line) => printedLine(line, $copy)),
			reserve: printedLine(
				{
					code: '3500',
					name: 'CRF contribution',
					annualCents: books.crfContributionAnnual,
					ytdCents: books.feesCrf
				},
				$copy
			)
		})
	);

	// Tab labels come from the catalog, so they translate with the rest of the page
	// rather than sitting in English in every locale.
	const tabs = $derived([
		{ id: 'overview', label: $copy.accTabOverview },
		{ id: 'budget', label: $copy.accTabBudget },
		{ id: 'receivables', label: $copy.accTabReceivables },
		{ id: 'payables', label: $copy.accTabPayables },
		{ id: 'funds', label: $copy.accTabFunds },
		{ id: 'levy', label: $copy.accTabLevy },
		{ id: 'reserve', label: $copy.accTabReserve },
		{ id: 'journal', label: $copy.accTabJournal }
	] as const);

	/**
	 * The reserve fund five years out, from the budget's contribution and the
	 * report's schedule. `firstShortfall` is the year the plan runs past the fund,
	 * which is the one line the table exists to answer.
	 */
	const reserve = $derived(reservePlan(reservePicture.input));
	const reserveLast = $derived(reserve.rows.at(-1)!);
	/** The rate the statements actually paid, as a percentage the reader can check. */
	const reserveRate = $derived(
		formatNumber(reservePicture.input.annualRateBps / 100, $locale, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})
	);
</script>

<svelte:head>
	<title>{$copy.accPageTitle}</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 print:px-0 print:py-0">
	<!-- The budget prints as one sheet, so the page's own furniture comes off the
	     paper on that tab and stays on it everywhere else (the reserve plan prints
	     with its header, which is how it shipped). -->
	<div class={printsOwnSheet ? 'no-print' : ''}>
		<PageHeader
			kicker={fill($copy.accKicker, { year: building.fiscalLabel })}
			title={$copy.accTitle}
			lede={$copy.accLede}
		/>
	</div>

	<!-- The date belongs to the page, not to one tab: it opens here and stays in
	     view while the reader moves between the ladder and the journal. -->
	{#if period}
		<div class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 {printsOwnSheet ? 'no-print' : ''}">
			<p class="min-w-0 flex-1 text-sm text-amber-950">
				{fill($copy.accPeriodBanner, { date: longDate })}
			</p>
			<button class="shrink-0 rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-950 hover:bg-amber-100" onclick={() => goto('/accounting')}>
				{$copy.accPeriodBack}
			</button>
		</div>
	{/if}

	<!-- The tabs are navigation, not part of any printed report. -->
	<div class="mb-6 flex gap-1 overflow-x-auto no-print">
		{#each tabs as item (item.id)}
			<button
				class="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold {tab === item.id ? 'bg-slab text-slab-ink' : 'border border-border bg-surface-2 text-slate-600'}"
				onclick={() => (tab = item.id)}
			>{item.label}</button>
		{/each}
	</div>

	<!-- The ladder and the journal follow the date; the funds tab follows it too,
	     from its own statements. The rest say they do not. -->
	{#if period && tab !== 'receivables' && tab !== 'journal' && tab !== 'funds' && tab !== 'reserve'}
		<p class="mb-4 max-w-3xl rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm leading-relaxed text-slate-600 {printsOwnSheet ? 'no-print' : ''}">
			{fill($copy.accPeriodCloseNote, { date: longDate, close: closeDate })}
		</p>
	{/if}

	{#if tab === 'overview'}
		<div class="mb-4 flex flex-wrap items-end justify-between gap-3 no-print">
			<p class="min-w-0 flex-1 basis-[24rem] text-sm leading-relaxed text-slate-600">
				{$copy.accReconLede}
			</p>
			<div class="flex flex-wrap items-center gap-2">
				<button
					class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
					onclick={() => window.print()}>{$copy.accReconPrint}</button
				>
				<span class="text-xs text-slate-500">{$copy.accReconPrintNote}</span>
			</div>
		</div>
		<!-- The overview is the close, so its paper is the reconciliation sheet:
		     the cards, the chart and the close checklist stay on screen. -->
		<div class="no-print">
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<div class="rounded-2xl border border-border bg-surface-2 p-5">
				<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{$copy.accOperatingCash}</p>
				<p class="mt-2 text-2xl font-bold tabular-nums">{money(books.operating.cash)}</p>
				<p class="mt-1 text-xs text-slate-500">{fill($copy.accUnrestrictedEquity, { amount: money(books.operating.unrestricted) })}</p>
			</div>
			<div class="rounded-2xl border border-border bg-surface-2 p-5">
				<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{$copy.accReserve}</p>
				<p class="mt-2 text-2xl font-bold tabular-nums">{money(books.crf.equity)}</p>
				<p class="mt-1 text-xs text-slate-500">{fill($copy.accCash, { amount: money(books.crf.cash) })}</p>
			</div>
			<div class="rounded-2xl border border-border bg-surface-2 p-5">
				<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{$copy.accLevyTrust}</p>
				<p class="mt-2 text-2xl font-bold tabular-nums">{money(books.levy.cash)}</p>
				<p class="mt-1 text-xs text-slate-500">{fill($copy.accOfWorkLeft, { amount: money(books.levy.remaining) })}</p>
			</div>
			<div class="rounded-2xl border border-border bg-surface-2 p-5">
				<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{$copy.accWarChestAtCost}</p>
				<p class="mt-2 text-2xl font-bold tabular-nums">{money(books.warChestCost)}</p>
				<p class="mt-1 text-xs text-slate-500">{fill($copy.accWarChestValue, { value: money(books.warChestValue), gain: money(books.warChestGain) })}</p>
			</div>
		</div>
		<p class="mt-3 text-sm {books.tie.ok ? 'text-emerald-700' : 'text-rose-700'}">
			{books.tie.ok ? $copy.accTieOk : fill($copy.accTieBad, { cents: books.tie.equityDelta })}
		</p>

		<SeptemberClose />

		<div class="mt-6 rounded-2xl border border-border bg-surface-2 p-5">
			<h2 class="font-bold text-slate-900">{$copy.accChartTitle}</h2>
			<p class="text-sm text-slate-500">{$copy.accChartSub}</p>
			<div class="mt-4">
				<BarChart data={chart} height={200} showSecondary={true} />
			</div>
			<p class="mt-2 text-xs text-slate-400">{$copy.accChartLegend}</p>
		</div>

		<div class="mt-6 grid gap-4 lg:grid-cols-2">
			<div class="rounded-2xl border border-border bg-surface-2 p-5 text-sm leading-relaxed text-slate-600">
				<h2 class="font-bold text-slate-900">{$copy.accYtdTitle}</h2>
				<p class="mt-2">{fill($copy.accYtdFees, { amount: money(books.feesOperating) })}</p>
				<p>{fill($copy.accYtdOther, { amount: money(books.otherIncome) })}</p>
				<p>{fill($copy.accYtdExpenses, { amount: money(books.expenseTotal) })}</p>
				<p class="font-semibold text-slate-800">{fill($copy.accYtdSurplus, { amount: money(books.surplusYtd) })}</p>
				<p class="mt-2">{fill($copy.accYtdWarChest, { amount: money(books.warChestYtd) })}</p>
			</div>
			<div class="rounded-2xl border border-border bg-surface-2 p-5 text-sm leading-relaxed text-slate-600">
				<h2 class="font-bold text-slate-900">{$copy.accInsuranceTitle}</h2>
				<p class="mt-2">{fill($copy.accInsuranceBody, {
					broker: building.insurance.broker,
					policy: building.insurance.policy,
					term: building.insurance.term,
					premium: money(building.insurance.premiumCents),
					water: money(building.insurance.waterDeductibleCents),
					quake: building.insurance.quakeDeductible
				})}</p>
				<p class="mt-2">{fill($copy.accDepreciationBody, {
					firm: depreciation.firm,
					dated: depreciation.dated,
					recommended: money(depreciation.recommendedAnnualCents),
					funded: money(depreciation.fundedAnnualCents),
					next: depreciation.nextDue
				})}</p>
			</div>
			</div>
		</div>

		<CloseReconciliation sheet={BOOK_RECONCILIATION} />
	{/if}

	{#if tab === 'budget'}
		<div class="mb-4 flex flex-wrap items-end justify-between gap-3 no-print">
			<p class="min-w-0 flex-1 basis-[24rem] text-sm leading-relaxed text-slate-600">
				{$copy.budgetSheetLede}
			</p>
			<div class="flex flex-wrap items-center gap-2">
				<button
					class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
					onclick={() => window.print()}>{$copy.budgetSheetPrint}</button
				>
				<span class="text-xs text-slate-500">{$copy.budgetSheetPrintNote}</span>
			</div>
		</div>
		<BudgetSheet sheet={budget} />
	{/if}

	{#if tab === 'receivables'}
		<div class="mb-4 flex flex-wrap items-center gap-2 no-print">
			<button
				class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
				onclick={() => window.print()}>{$copy.accArrearsSheetPrint}</button
			>
			<span class="text-xs text-slate-500">{$copy.accArrearsSheetPrintNote}</span>
		</div>

		<div class="mb-4 grid gap-3 sm:grid-cols-3 no-print">
			<div class="rounded-2xl border border-border bg-surface-2 p-4">
				<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{$copy.accAgePastDue}</p>
				<p class="mt-1 text-2xl font-bold tabular-nums text-rose-700">{money(summary.pastDue)}</p>
				<p class="mt-1 text-xs text-slate-500">{fill($copy.accAgePastDueLots, { lots: summary.pastDueLots, all: units.length })}</p>
			</div>
			<div class="rounded-2xl border border-border bg-surface-2 p-4">
				<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{$copy.accAgeOver90Label}</p>
				<p class="mt-1 text-2xl font-bold tabular-nums">{money(summary.buckets.over90)}</p>
				<p class="mt-1 text-xs text-slate-500">{fill($copy.accAgeShare, { share: formatNumber(summary.over90Share, $locale, { style: 'percent', maximumFractionDigits: 0 }) })}</p>
			</div>
			<div class="rounded-2xl border border-border bg-surface-2 p-4">
				<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{$copy.accAgeOldestLabel}</p>
				{#if summary.oldest}
					<p class="mt-1 text-2xl font-bold tabular-nums">{summary.oldest.unitId}</p>
					<p class="mt-1 text-xs text-slate-500">{fill($copy.accAgeOldestDays, { days: summary.oldest.oldestDays })}</p>
				{:else}
					<p class="mt-1 text-2xl font-bold text-emerald-700">—</p>
				{/if}
			</div>
		</div>

		<div class="mb-3 flex flex-wrap items-center justify-between gap-3 no-print">
			<p class="min-w-0 flex-1 basis-[24rem] text-sm text-slate-500">{$copy.accAgeHint}</p>
			<button class="shrink-0 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold" onclick={() => (onlyPastDue = !onlyPastDue)}>
				{onlyPastDue ? $copy.accShowEveryLot : $copy.accPastDueOnly}
			</button>
		</div>
		<div class="overflow-x-auto rounded-2xl border border-border bg-surface-2 no-print">
			<table class="w-full min-w-[820px] text-sm">
				<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
					<tr class="border-b border-border">
						<th class="px-3 py-3">{$copy.payLot}</th>
						<th class="px-3 py-3">{$copy.accColOwner}</th>
						<th class="px-3 py-3 text-right">{$copy.accAgeCurrent}</th>
						<th class="px-3 py-3 text-right">{fill($copy.accAgeBucketDays, { n: $copy.accAge30 })}</th>
						<th class="px-3 py-3 text-right">{fill($copy.accAgeBucketDays, { n: $copy.accAge60 })}</th>
						<th class="px-3 py-3 text-right">{fill($copy.accAgeBucketDays, { n: $copy.accAge90 })}</th>
						<th class="px-3 py-3 text-right">{$copy.accAgeOver90}</th>
						<th class="px-3 py-3 text-right">{$copy.accColTotal}</th>
						<th class="px-3 py-3">{$copy.accColFormF}</th>
					</tr>
				</thead>
				<tbody>
					{#each ladder as row (row.unitId)}
						<tr class="border-b border-border">
							<td class="px-3 py-2 font-semibold"><a class="text-brand-700 no-underline" href="/units/{row.unitId}">{row.unitId}</a></td>
							<td class="px-3 py-2">{row.unit.owner}</td>
							<td class="px-3 py-2 text-right tabular-nums text-slate-500">{row.buckets.current ? money(row.buckets.current) : '—'}</td>
							<td class="px-3 py-2 text-right tabular-nums">{row.buckets.age30 ? money(row.buckets.age30) : '—'}</td>
							<td class="px-3 py-2 text-right tabular-nums">{row.buckets.age60 ? money(row.buckets.age60) : '—'}</td>
							<td class="px-3 py-2 text-right tabular-nums">{row.buckets.age90 ? money(row.buckets.age90) : '—'}</td>
							<td class="px-3 py-2 text-right font-semibold tabular-nums {row.buckets.over90 ? 'text-rose-700' : 'text-slate-400'}">{row.buckets.over90 ? money(row.buckets.over90) : '—'}</td>
							<td class="px-3 py-2 text-right font-semibold tabular-nums">{money(row.total)}</td>
							<td class="px-3 py-2 {formF(row.unit) === 'withheld' ? 'text-rose-700 font-semibold' : 'text-slate-500'}">{formF(row.unit)}</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr class="border-t border-border bg-slate-50">
						<td class="px-3 py-2 font-bold" colspan="2">{$copy.accColTotal}</td>
						<td class="px-3 py-2 text-right font-bold tabular-nums text-slate-500">{money(shownTotals.buckets.current)}</td>
						<td class="px-3 py-2 text-right font-bold tabular-nums">{money(shownTotals.buckets.age30)}</td>
						<td class="px-3 py-2 text-right font-bold tabular-nums">{money(shownTotals.buckets.age60)}</td>
						<td class="px-3 py-2 text-right font-bold tabular-nums">{money(shownTotals.buckets.age90)}</td>
						<td class="px-3 py-2 text-right font-bold tabular-nums text-rose-700">{money(shownTotals.buckets.over90)}</td>
						<td class="px-3 py-2 text-right font-bold tabular-nums">{money(shownTotals.total)}</td>
						<td class="px-3 py-2"></td>
					</tr>
				</tfoot>
			</table>
		</div>

		<p class="mt-3 text-sm text-slate-500 no-print">{fill($copy.accAgeClear, { clear: units.length - summary.pastDueLots, all: units.length })}</p>

		{#if planned.length > 0}
			<div class="mt-4 rounded-2xl border border-border bg-surface-2 p-4 no-print">
				<h3 class="text-sm font-bold text-slate-900">{$copy.accAgePlanTitle}</h3>
				<ul class="mt-2 space-y-1 text-sm text-slate-600">
					{#each planned as row (row.unitId)}
						<li class="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-1 last:border-0 last:pb-0">
							<a class="font-semibold text-brand-700 no-underline" href="/units/{row.unitId}">{row.unitId} · {row.unit.owner}</a>
							<span class="tabular-nums">{money(row.planned)} · {fill($copy.accAgePlanLine, { amount: money(LEVY_PLAN_CENTS[row.unitId] ?? 0) })}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<p class="mt-3 text-sm text-slate-500 no-print">{$copy.accReceivablesNote}</p>

		<!-- The paper: the past-due ladder, its columns added up, and one line for
		     every lot that owes only the next fee. Built from every lot, so the
		     screen's filter cannot change what the sheet totals. -->
		<ArrearsSheet sheet={arrearsPrint} />
	{/if}

	{#if tab === 'payables'}
		<div class="overflow-x-auto rounded-2xl border border-border bg-surface-2">
			<table class="w-full min-w-[640px] text-sm">
				<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
					<tr class="border-b border-border">
						<th class="px-4 py-3">{$copy.accColWho}</th>
						<th class="px-4 py-3">{$copy.accColFor}</th>
						<th class="px-4 py-3">{$copy.accColDue}</th>
						<th class="px-4 py-3 text-right">{$copy.accColAmount}</th>
					</tr>
				</thead>
				<tbody>
					{#each books.ap as bill}
						<tr class="border-b border-border">
							<td class="px-4 py-3 font-semibold">{bill.vendor}</td>
							<td class="px-4 py-3">{bill.memo}</td>
							<td class="px-4 py-3">{bill.due}</td>
							<td class="px-4 py-3 text-right tabular-nums">{money(bill.cents)}</td>
						</tr>
					{/each}
					<tr class="border-b border-border">
						<td class="px-4 py-3 font-semibold">{$copy.accPayableCra}</td>
						<td class="px-4 py-3">{$copy.accPayableCraMemo}</td>
						<td class="px-4 py-3">2026-10-15</td>
						<td class="px-4 py-3 text-right tabular-nums">{money(books.payroll.remittance)}</td>
					</tr>
					<tr>
						<td class="px-4 py-3 font-bold" colspan="3">{$copy.accStateOpen}</td>
						<td class="px-4 py-3 text-right font-bold tabular-nums">{money(books.apTotal + books.payroll.remittance)}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="mt-6 grid gap-3 md:grid-cols-2">
			{#each books.contracts as contract}
				<div class="rounded-2xl border border-border bg-surface-2 p-4">
					<p class="font-semibold text-slate-900">{contract.vendor}</p>
					<p class="text-sm text-slate-600">{contract.service}</p>
					<p class="mt-1 text-xs text-slate-400">{fill($copy.accContractRenewal, { date: contract.renewal })}</p>
					<p class="mt-2 text-sm text-slate-600">{contract.note}</p>
				</div>
			{/each}
		</div>
	{/if}

	{#if tab === 'funds'}
		<div class="grid gap-4 lg:grid-cols-3">
			<article class="rounded-2xl border border-border bg-surface-2 p-5">
				<h2 class="font-bold text-slate-900">{$copy.accFundOperating}</h2>
				<p class="text-xs text-slate-400">{building.banks.operating.name} · {building.banks.operating.account}</p>
				<ul class="mt-3 space-y-1 text-sm text-slate-600">
					<li class="flex justify-between gap-3">
						<span>{monthCash ? fill($copy.accCashAt, { date: longDate }) : $copy.accCashLabel}</span>
						<span class="tabular-nums">{money(monthCash?.operating ?? books.operating.cash)}</span>
					</li>
					<li class="flex justify-between gap-3"><span>{$copy.accFundReceivables}</span><span class="tabular-nums">{money(books.operating.ar)}</span></li>
					<li class="flex justify-between gap-3"><span>{$copy.accPrepaidInsurance}</span><span class="tabular-nums">{money(books.operating.prepaidInsurance)}</span></li>
					<li class="flex justify-between gap-3"><span>{$copy.accWarChestAtCost}</span><span class="tabular-nums">{money(books.operating.warChest)}</span></li>
					<li class="flex justify-between gap-3"><span>{$copy.accBillsPayroll}</span><span class="tabular-nums">{money(books.operating.ap + books.operating.payrollPayable)}</span></li>
					<li class="flex justify-between gap-3"><span>{$copy.accPrepaidFees}</span><span class="tabular-nums">{money(books.operating.prepaidFees)}</span></li>
					<li class="flex justify-between gap-3 font-semibold text-slate-900"><span>{$copy.accFundBalance}</span><span class="tabular-nums">{money(books.operating.equity)}</span></li>
				</ul>
			</article>
			<article class="rounded-2xl border border-border bg-surface-2 p-5">
				<h2 class="font-bold text-slate-900">{$copy.accContingencyReserve}</h2>
				<p class="text-xs text-slate-400">{building.banks.crf.name} · {building.banks.crf.account}</p>
				<ul class="mt-3 space-y-1 text-sm text-slate-600">
					<li class="flex justify-between gap-3"><span>{$copy.accCrfOpening}</span><span class="tabular-nums">{money(books.crf.opening)}</span></li>
					<li class="flex justify-between gap-3"><span>{$copy.accCrfContributions}</span><span class="tabular-nums">{money(books.crf.contributions)}</span></li>
					<li class="flex justify-between gap-3"><span>{$copy.accCrfInterest}</span><span class="tabular-nums">{money(books.crf.interest)}</span></li>
					<li class="flex justify-between gap-3"><span>{books.crf.study}</span><span class="tabular-nums">−{money(books.crf.spent)}</span></li>
					<li class="flex justify-between gap-3">
						<span>{monthCash ? fill($copy.accCashAt, { date: longDate }) : $copy.accCashLabel}</span>
						<span class="tabular-nums">{money(monthCash?.crf ?? books.crf.cash)}</span>
					</li>
					<li class="flex justify-between gap-3 font-semibold text-slate-900"><span>{$copy.accFundBalance}</span><span class="tabular-nums">{money(books.crf.equity)}</span></li>
				</ul>
				<p class="mt-3 text-xs leading-relaxed text-slate-500">{$copy.accCrfNote}</p>
			</article>
			<article class="rounded-2xl border border-border bg-surface-2 p-5">
				<h2 class="font-bold text-slate-900">{$copy.accParkadeLevy}</h2>
				<p class="text-xs text-slate-400">{building.banks.levy.name} · {building.banks.levy.account}</p>
				<ul class="mt-3 space-y-1 text-sm text-slate-600">
					<li class="flex justify-between gap-3"><span>{fill($copy.accLevyAssessed, { date: books.levy.approved })}</span><span class="tabular-nums">{money(books.levy.assessed)}</span></li>
					<li class="flex justify-between gap-3"><span>{$copy.accLevyCollected}</span><span class="tabular-nums">{money(books.levy.collected)}</span></li>
					<li class="flex justify-between gap-3"><span>{$copy.accStillOwing}</span><span class="tabular-nums">{money(books.levy.owing)}</span></li>
					<li class="flex justify-between gap-3"><span>{$copy.accLevySpent}</span><span class="tabular-nums">{money(books.levy.spent)}</span></li>
					<li class="flex justify-between gap-3">
						<span>{monthCash ? fill($copy.accCashAt, { date: longDate }) : $copy.accCashLabel}</span>
						<span class="tabular-nums">{money(monthCash?.levy ?? books.levy.cash)}</span>
					</li>
					<li class="flex justify-between gap-3 font-semibold text-slate-900"><span>{$copy.accLevyRemaining}</span><span class="tabular-nums">{money(books.levy.remaining)}</span></li>
				</ul>
				<p class="mt-3 text-xs leading-relaxed text-slate-500">{fill($copy.accLevyNote, { project: books.levy.project })}</p>
			</article>
		</div>

		<!-- The month-by-month record the funds tab did not have. Six statement
		     closes, each against the one before it, and September landing on the
		     cards above. -->
		<div class="mt-4 rounded-2xl border border-border bg-surface-2 p-5">
			<h2 class="font-bold text-slate-900">{$copy.accCashByMonth}</h2>
			<p class="mt-1 text-sm text-slate-500">{$copy.accCashByMonthHint}</p>
			<div class="mt-3 overflow-x-auto">
				<table class="w-full min-w-[560px] text-sm">
					<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
						<tr class="border-b border-border">
							<th class="px-3 py-2">{$copy.accColMonthEnd}</th>
							<th class="px-3 py-2 text-right">{$copy.accFundOperating}</th>
							<th class="px-3 py-2 text-right">{$copy.accContingencyReserve}</th>
							<th class="px-3 py-2 text-right">{$copy.accParkadeLevy}</th>
							<th class="px-3 py-2 text-right">{$copy.accColTotal}</th>
							<th class="px-3 py-2 text-right">{$copy.accColChange}</th>
						</tr>
					</thead>
					<tbody>
						{#each cashMonths as row (row.period)}
							<tr
								class="border-b border-border last:border-0 {row.period === period?.period
									? 'bg-amber-50 font-semibold'
									: ''}"
								aria-current={row.period === period?.period ? 'true' : undefined}
							>
								<td class="px-3 py-2 tabular-nums">{formatDate(row.asOf, $locale, { dateStyle: 'medium' })}</td>
								<td class="px-3 py-2 text-right tabular-nums">{money(row.operating)}</td>
								<td class="px-3 py-2 text-right tabular-nums">{money(row.crf)}</td>
								<td class="px-3 py-2 text-right tabular-nums">{money(row.levy)}</td>
								<td class="px-3 py-2 text-right tabular-nums">{money(row.total)}</td>
								<td class="px-3 py-2 text-right tabular-nums {row.change < 0 ? 'text-rose-700' : 'text-emerald-700'}"
									>{changeLabel(row.change)}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{#if period}
				<p class="mt-3 max-w-3xl text-xs leading-relaxed text-slate-500">
					{fill(monthCash ? $copy.accCashCloseNote : $copy.accCashNoStatement, {
						date: longDate,
						close: closeDate
					})}
				</p>
			{/if}
		</div>
	{/if}

	{#if tab === 'levy'}
		<div class="mb-4 flex flex-wrap items-end justify-between gap-3 no-print">
			<p class="min-w-0 flex-1 basis-[24rem] text-sm leading-relaxed text-slate-600">
				{$copy.accLevySheetLede}
			</p>
			<div class="flex flex-wrap items-center gap-2">
				<button
					class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
					onclick={() => window.print()}>{$copy.accLevySheetPrint}</button
				>
				<span class="text-xs text-slate-500">{$copy.accLevySheetPrintNote}</span>
			</div>
		</div>
		<LevySheet sheet={BOOK_LEVY_SHEET} />
	{/if}

	{#if tab === 'reserve'}
		<div class="mb-4 flex flex-wrap items-center gap-2 no-print">
			<button
				class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
				onclick={() => window.print()}>{$copy.accReservePrint}</button
			>
			<span class="text-xs text-slate-500">{$copy.accReservePrintNote}</span>
		</div>

		<section class="rounded-2xl border border-border bg-surface-2 p-5">
			<h2 class="font-bold text-slate-900">{$copy.accReserveTitle}</h2>
			<p class="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{$copy.accReserveLede}</p>

			<div class="mt-4 overflow-x-auto">
				<table class="w-full min-w-[720px] text-sm">
					<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
						<tr class="border-b border-border">
							<th class="px-3 py-2">{$copy.accReserveColYear}</th>
							<th class="px-3 py-2 text-right">{$copy.accReserveColOpening}</th>
							<th class="px-3 py-2 text-right">{$copy.accReserveColContribution}</th>
							<th class="px-3 py-2 text-right">{$copy.accReserveColInterest}</th>
							<th class="px-3 py-2">{$copy.accReserveColScheduled}</th>
							<th class="px-3 py-2 text-right">{$copy.accReserveColClosing}</th>
						</tr>
					</thead>
					<tbody>
						{#each reserve.rows as row (row.label)}
							<tr class="border-b border-border last:border-0">
								<th scope="row" class="px-3 py-2 text-left font-semibold tabular-nums">{row.label}</th>
								<td class="px-3 py-2 text-right tabular-nums">{money(row.openingCents)}</td>
								<td class="px-3 py-2 text-right tabular-nums">{money(row.contributionCents)}</td>
								<td class="px-3 py-2 text-right tabular-nums">{money(row.interestCents)}</td>
								<td class="px-3 py-2 text-slate-600">
									{#if row.projects.length > 0}
										{#each row.projects as project (project.label)}
											<span class="block"
												>{project.label} · <span class="tabular-nums">{money(project.cents)}</span></span
											>
										{/each}
									{:else}
										<span class="text-slate-400">—</span>
									{/if}
								</td>
								<td
									class="px-3 py-2 text-right font-semibold tabular-nums {row.short
										? 'text-rose-700'
										: 'text-slate-900'}">{money(row.closingCents)}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<p class="mt-3 text-sm font-semibold {reserve.firstShortfall ? 'text-rose-700' : 'text-emerald-700'}">
				{#if reserve.firstShortfall}
					{fill($copy.accReserveShortfall, {
						year: reserve.firstShortfall.label,
						amount: money(-reserve.firstShortfall.closingCents)
					})}
				{:else}
					{fill($copy.accReserveCovers, {
						year: reserveLast.label,
						amount: money(reserveLast.closingCents)
					})}
				{/if}
			</p>

			<p class="mt-2 max-w-3xl text-xs leading-relaxed text-slate-500">
				{fill($copy.accReserveReport, {
					firm: reservePicture.report.firm,
					dated: reservePicture.report.dated,
					due: reservePicture.report.nextDue
				})}
			</p>
			<p class="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">
				{fill($copy.accReserveRate, {
					rate: reserveRate,
					date: formatDate(reservePicture.statementDate, $locale, { dateStyle: 'long' })
				})}
			</p>
			<p class="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">
				{fill($copy.accReserveFunding, {
					funded: money(reservePicture.input.annualContributionCents),
					recommended: money(reservePicture.recommendedAnnualCents)
				})}
			</p>
			<p class="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">
				{fill($copy.accReserveLevy, {
					project: reservePicture.levy.label,
					amount: money(reservePicture.levy.cents)
				})}
			</p>
		</section>
	{/if}

	{#if tab === 'journal'}
		<div class="mb-3 flex flex-wrap items-center gap-2 no-print">
			<button
				class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
				onclick={() => window.print()}>{$copy.accCashStatementPrint}</button
			>
			<span class="text-xs text-slate-500">{$copy.accCashStatementPrintNote}</span>
		</div>
		<p class="mb-2 max-w-3xl text-sm text-slate-600 no-print">{$copy.accJournalIntro}</p>
		<p class="mb-4 text-sm text-slate-600 no-print">
			{period
				? fill($copy.accStatementOpeningAt, {
						date: formatDate(building.fiscalStart, $locale, { day: 'numeric', month: 'long', year: 'numeric' }),
						amount: money(openingCash)
					})
				: fill($copy.accStatementOpening, { amount: money(openingCash) })}
		</p>
		{#if period && journalRows.length === 0}
			<p class="mb-4 text-sm text-slate-600 no-print">
				{fill($copy.accStatementNone, {
					date: longDate,
					first: formatDate(journalFirst, $locale, { dateStyle: 'long' })
				})}
			</p>
		{/if}
		<div class="overflow-x-auto rounded-2xl border border-border bg-surface-2 no-print">
			<table class="w-full min-w-[720px] text-sm">
				<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
					<tr class="border-b border-border">
						<th class="px-3 py-3">{$copy.payColDate}</th>
						<th class="px-3 py-3">{$copy.accColEntry}</th>
						<th class="px-3 py-3 text-right">{$copy.accStatementCash}</th>
						<th class="px-3 py-3 text-right">{$copy.accColRunning}</th>
						<th class="px-3 py-3"><span class="sr-only">{$copy.accStatementDetails}</span></th>
					</tr>
				</thead>
				{#each journalRows as row (row.hash)}
					<tbody class="border-b border-border last:border-0">
						<tr class={openEntry === row.hash ? 'bg-slate-50' : ''}>
							<td class="whitespace-nowrap px-3 py-2 align-top text-xs tabular-nums text-slate-500"
								>{row.entry.date}</td
							>
							<td class="px-3 py-2 align-top font-medium text-slate-900">{row.entry.memo}</td>
							<td class="px-3 py-2 text-right align-top tabular-nums {cashTone(row.cash)}"
								>{signed(row.cash)}</td
							>
							<td class="px-3 py-2 text-right align-top font-semibold tabular-nums">{money(row.balance)}</td>
							<td class="px-3 py-2 text-right align-top">
								<button
									class="rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-slate-600 hover:bg-surface"
									aria-expanded={openEntry === row.hash}
									aria-controls="entry-{row.hash}"
									onclick={() => (openEntry = openEntry === row.hash ? null : row.hash)}
								>
									{openEntry === row.hash ? '−' : '+'}
									<span class="sr-only">{$copy.accStatementDetails}</span>
								</button>
							</td>
						</tr>
						{#if openEntry === row.hash}
							<tr id="entry-{row.hash}">
								<td colspan="5" class="bg-slate-50 px-3 pb-4 pt-2">
									<dl class="grid gap-3 text-xs sm:grid-cols-3">
										<div>
											<dt class="font-bold uppercase tracking-wide text-slate-400">{$copy.accStatementPostedBy}</dt>
											<dd class="mt-1 text-slate-700">{row.entry.postedBy}</dd>
										</div>
										<div>
											<dt class="font-bold uppercase tracking-wide text-slate-400">{$copy.accStatementHash}</dt>
											<dd class="mt-1 break-all font-mono text-[11px] text-slate-700">{row.hash}</dd>
										</div>
										<div>
											<dt class="font-bold uppercase tracking-wide text-slate-400">{$copy.accStatementEvidence}</dt>
											<dd class="mt-1 text-slate-700">{row.entry.evidence}</dd>
										</div>
									</dl>
									<ul class="mt-3 space-y-1 border-t border-border pt-3">
										{#each row.entry.lines as line}
											<li class="flex items-baseline justify-between gap-4">
												<span class="text-slate-600">{line.account}</span>
												<span class="tabular-nums {line.debit ? 'text-slate-800' : 'text-slate-500'}"
													>{line.debit ? `+${money(line.debit)}` : `−${money(line.credit ?? 0)}`}</span
												>
											</li>
										{/each}
									</ul>
								</td>
							</tr>
						{/if}
					</tbody>
				{/each}
			</table>
		</div>
		<p class="mt-3 text-sm text-slate-600 no-print">
			{period
				? fill($copy.accStatementClosingAt, {
						amount: money(journalRows.at(-1)?.balance ?? openingCash),
						date: longDate
					})
				: fill($copy.accStatementClosing, {
						amount: money(journalRows.at(-1)?.balance ?? openingCash)
					})}
		</p>
		<p class="mt-2 max-w-3xl text-xs leading-relaxed text-slate-500 no-print">{$copy.accStatementChain}</p>

		<!-- The paper: the operating account's statement, from the journal's own
		     order and hashes, every entry printed so the chain can be followed on
		     the page. -->
		<CashStatement sheet={cashSheet} asOf={asOf} openingDate={journalFirst} ties={!period} />
	{/if}
</div>
