<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import BarChart from '$lib/components/BarChart.svelte';
	import SeptemberClose from '$lib/components/SeptemberClose.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { books } from '$lib/demo/books';
	import { cashEffect, statement } from '$lib/ledger-statement';
	import { age, summarise } from '$lib/arrears';
	import { charges, LEVY_PLAN_CENTS } from '$lib/demo/arrears';
	import { building, depreciation, formF, units } from '$lib/demo/building';
	import { PERIOD_PARAM, parsePeriod, type PeriodPoint } from '$lib/period-link';

	let tab = $state<'overview' | 'budget' | 'receivables' | 'payables' | 'funds' | 'journal'>('overview');

	/**
	 * A month carried in from the compliance-health trend: `?period=2026-09` opens
	 * the receivables tab aged at 30 September, which is the book that point scored.
	 * Read in an effect because `$page.url.searchParams` is not available while the
	 * page is prerendered, and only ever set from a valid month: a bad link leaves
	 * the reader on today's books rather than on a half-filtered page.
	 */
	let period = $state<PeriodPoint | null>(null);
	$effect(() => {
		const next = parsePeriod($page.url.searchParams.get(PERIOD_PARAM));
		period = next;
		if (next) tab = 'receivables';
	});
	/** The date every age is counted to: the linked month end, or today's statement. */
	const asOf = $derived(period?.asOf ?? building.asOf);
	/** The same day written out for the reader, in their language. */
	const longDate = $derived(formatDate(asOf, $locale, { day: 'numeric', month: 'long', year: 'numeric' }));
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
		age(charges(), asOf).map((row) => ({
			...row,
			unit: units.find((candidate) => candidate.id === row.unitId)!
		}))
	);
	const summary = $derived(summarise(aged));

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
	const closingCash = books.operating.cash + books.crf.cash;
	const cashMoved = books.journal.reduce((sum, entry) => sum + cashEffect(entry), 0);
	const openingCash = closingCash - cashMoved;
	// A journal is dated entries, so a month carried in is the same book stopped
	// short: everything posted on or before that day, run from the fiscal year's
	// opening cash. Nothing is estimated — an entry that had not been posted by
	// then simply is not in the statement.
	const journalEntries = $derived(
		period ? books.journal.filter((entry) => entry.date <= asOf) : books.journal
	);
	const journalRows = $derived(statement(journalEntries, openingCash));
	/** The first day the sample journal has anything on it. */
	const journalFirst =
		books.journal
			.map((entry) => entry.date)
			.sort()
			.at(0) ?? building.asOf;

	/** A journal reads debit-positive; money out carries the minus and shows in red. */
	function signed(cents: number): string {
		if (cents === 0) return '—';
		return cents > 0 ? money(cents) : `−${money(-cents)}`;
	}

	function cashTone(cents: number): string {
		if (cents === 0) return 'text-slate-400';
		return cents > 0 ? 'text-emerald-700' : 'text-rose-700';
	}

	const feeIncomeAnnual = books.feeAnnual;
	const budgetResult = books.feeAnnual + books.otherIncomeAnnual - books.expenseAnnual - books.crfContributionAnnual;

	// Tab labels come from the catalog, so they translate with the rest of the page
	// rather than sitting in English in every locale.
	const tabs = $derived([
		{ id: 'overview', label: $copy.accTabOverview },
		{ id: 'budget', label: $copy.accTabBudget },
		{ id: 'receivables', label: $copy.accTabReceivables },
		{ id: 'payables', label: $copy.accTabPayables },
		{ id: 'funds', label: $copy.accTabFunds },
		{ id: 'journal', label: $copy.accTabJournal }
	] as const);
</script>

<svelte:head>
	<title>{$copy.accPageTitle}</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<PageHeader
		kicker={fill($copy.accKicker, { year: building.fiscalLabel })}
		title={$copy.accTitle}
		lede={$copy.accLede}
	/>

	<!-- The date belongs to the page, not to one tab: it opens here and stays in
	     view while the reader moves between the ladder and the journal. -->
	{#if period}
		<div class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
			<p class="min-w-0 flex-1 text-sm text-amber-950">
				{fill($copy.accPeriodBanner, { date: longDate })}
			</p>
			<button class="shrink-0 rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-950 hover:bg-amber-100" onclick={() => goto('/accounting')}>
				{$copy.accPeriodBack}
			</button>
		</div>
	{/if}

	<div class="mb-6 flex gap-1 overflow-x-auto">
		{#each tabs as item (item.id)}
			<button
				class="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold {tab === item.id ? 'bg-slab text-slab-ink' : 'border border-border bg-surface-2 text-slate-600'}"
				onclick={() => (tab = item.id)}
			>{item.label}</button>
		{/each}
	</div>

	{#if period && tab !== 'receivables' && tab !== 'journal'}
		<p class="mb-4 max-w-3xl rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm leading-relaxed text-slate-600">
			{fill($copy.accPeriodCloseNote, { date: longDate, close: formatDate(building.asOf, $locale, { day: 'numeric', month: 'long', year: 'numeric' }) })}
		</p>
	{/if}

	{#if tab === 'overview'}
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
	{/if}

	{#if tab === 'budget'}
		<div class="overflow-x-auto rounded-2xl border border-border bg-surface-2">
			<table class="w-full min-w-[640px] text-sm">
				<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
					<tr class="border-b border-border">
						<th class="px-4 py-3">{$copy.accColAccount}</th>
						<th class="px-4 py-3 text-right">{$copy.accColAnnualBudget}</th>
						<th class="px-4 py-3 text-right">{$copy.yearToDate}</th>
						<th class="px-4 py-3 text-right">{$copy.accColLeft}</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-border bg-slate-50 font-semibold">
						<td class="px-4 py-3">{$copy.accRowStrataFees}</td>
						<td class="px-4 py-3 text-right tabular-nums">{money(feeIncomeAnnual)}</td>
						<td class="px-4 py-3 text-right tabular-nums">{money(books.feesOperating + books.feesCrf)}</td>
						<td class="px-4 py-3 text-right tabular-nums">{money(feeIncomeAnnual - books.feesOperating - books.feesCrf)}</td>
					</tr>
					{#each books.incomeLines as line}
						<tr class="border-b border-border">
							<td class="px-4 py-3">{line.code} {line.name}</td>
							<td class="px-4 py-3 text-right tabular-nums">{money(line.annualCents)}</td>
							<td class="px-4 py-3 text-right tabular-nums">{money(line.ytdCents)}</td>
							<td class="px-4 py-3 text-right tabular-nums">{money(line.annualCents - line.ytdCents)}</td>
						</tr>
					{/each}
					{#each books.expenses as line}
						<tr class="border-b border-border">
							<td class="px-4 py-3">
								{line.code} {line.name}
								{#if line.note}<span class="mt-0.5 block text-xs font-normal text-slate-400">{line.note}</span>{/if}
							</td>
							<td class="px-4 py-3 text-right tabular-nums">{money(line.annualCents)}</td>
							<td class="px-4 py-3 text-right tabular-nums">{money(line.ytdCents)}</td>
							<td class="px-4 py-3 text-right tabular-nums">{money(line.annualCents - line.ytdCents)}</td>
						</tr>
					{/each}
					<tr class="border-b border-border bg-slate-50">
						<td class="px-4 py-3 font-semibold">{$copy.accRowCrfContribution}</td>
						<td class="px-4 py-3 text-right font-semibold tabular-nums">{money(books.crfContributionAnnual)}</td>
						<td class="px-4 py-3 text-right tabular-nums">{money(books.feesCrf)}</td>
						<td class="px-4 py-3 text-right tabular-nums">{money(books.crfContributionAnnual - books.feesCrf)}</td>
					</tr>
					<tr>
						<td class="px-4 py-3 font-bold">{$copy.accRowBudgetResult}</td>
						<td class="px-4 py-3 text-right font-bold tabular-nums">{money(budgetResult)}</td>
						<td class="px-4 py-3"></td>
						<td class="px-4 py-3"></td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="mt-3 text-sm text-slate-500">{$copy.accBudgetNote}</p>
	{/if}

	{#if tab === 'receivables'}
		<div class="mb-4 grid gap-3 sm:grid-cols-3">
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

		<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
			<p class="min-w-0 flex-1 basis-[24rem] text-sm text-slate-500">{$copy.accAgeHint}</p>
			<button class="shrink-0 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold" onclick={() => (onlyPastDue = !onlyPastDue)}>
				{onlyPastDue ? $copy.accShowEveryLot : $copy.accPastDueOnly}
			</button>
		</div>
		<div class="overflow-x-auto rounded-2xl border border-border bg-surface-2">
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

		<p class="mt-3 text-sm text-slate-500">{fill($copy.accAgeClear, { clear: units.length - summary.pastDueLots, all: units.length })}</p>

		{#if planned.length > 0}
			<div class="mt-4 rounded-2xl border border-border bg-surface-2 p-4">
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

		<p class="mt-3 text-sm text-slate-500">{$copy.accReceivablesNote}</p>
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
					<li class="flex justify-between gap-3"><span>{$copy.accCashLabel}</span><span class="tabular-nums">{money(books.operating.cash)}</span></li>
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
					<li class="flex justify-between gap-3"><span>{$copy.accCashLabel}</span><span class="tabular-nums">{money(books.crf.cash)}</span></li>
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
					<li class="flex justify-between gap-3"><span>{$copy.accCashLabel}</span><span class="tabular-nums">{money(books.levy.cash)}</span></li>
					<li class="flex justify-between gap-3 font-semibold text-slate-900"><span>{$copy.accLevyRemaining}</span><span class="tabular-nums">{money(books.levy.remaining)}</span></li>
				</ul>
				<p class="mt-3 text-xs leading-relaxed text-slate-500">{fill($copy.accLevyNote, { project: books.levy.project })}</p>
			</article>
		</div>
	{/if}

	{#if tab === 'journal'}
		<p class="mb-2 max-w-3xl text-sm text-slate-600">{$copy.accJournalIntro}</p>
		<p class="mb-4 text-sm text-slate-600">
			{period
				? fill($copy.accStatementOpeningAt, {
						date: formatDate(building.fiscalStart, $locale, { day: 'numeric', month: 'long', year: 'numeric' }),
						amount: money(openingCash)
					})
				: fill($copy.accStatementOpening, { amount: money(openingCash) })}
		</p>
		{#if period && journalRows.length === 0}
			<p class="mb-4 text-sm text-slate-600">
				{fill($copy.accStatementNone, {
					date: longDate,
					first: formatDate(journalFirst, $locale, { dateStyle: 'long' })
				})}
			</p>
		{/if}
		<div class="overflow-x-auto rounded-2xl border border-border bg-surface-2">
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
		<p class="mt-3 text-sm text-slate-600">
			{period
				? fill($copy.accStatementClosingAt, {
						amount: money(journalRows.at(-1)?.balance ?? openingCash),
						date: longDate
					})
				: fill($copy.accStatementClosing, {
						amount: money(journalRows.at(-1)?.balance ?? openingCash)
					})}
		</p>
		<p class="mt-2 max-w-3xl text-xs leading-relaxed text-slate-500">{$copy.accStatementChain}</p>
	{/if}
</div>
