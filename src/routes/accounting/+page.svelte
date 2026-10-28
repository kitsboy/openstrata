<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import BarChart from '$lib/components/BarChart.svelte';
	import SeptemberClose from '$lib/components/SeptemberClose.svelte';
	import { copy, fill } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { books } from '$lib/demo/books';
	import { balance, building, depreciation, formF, units } from '$lib/demo/building';

	let tab = $state<'overview' | 'budget' | 'receivables' | 'payables' | 'funds' | 'journal'>('overview');
	let onlyPastDue = $state(false);

	const chart = books.monthly.map((month) => ({
		label: month.label,
		value: month.fees / 100,
		value2: month.expenses / 100
	}));

	const rows = units
		.map((unit) => {
			const due = balance(unit);
			const past = due.arrears + due.late + due.fine + due.levy;
			return { unit, due, past };
		})
		.sort((a, b) => b.past - a.past || a.unit.lot - b.unit.lot);

	const shown = $derived(onlyPastDue ? rows.filter((row) => row.past > 0) : rows);

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

	<div class="mb-6 flex gap-1 overflow-x-auto">
		{#each tabs as item (item.id)}
			<button
				class="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold {tab === item.id ? 'bg-slab text-slab-ink' : 'border border-border bg-surface-2 text-slate-600'}"
				onclick={() => (tab = item.id)}
			>{item.label}</button>
		{/each}
	</div>

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
		<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
			<p class="min-w-0 flex-1 basis-[24rem] text-sm text-slate-500">{$copy.accReceivablesHint}</p>
			<button class="shrink-0 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold" onclick={() => (onlyPastDue = !onlyPastDue)}>
				{onlyPastDue ? $copy.accShowEveryLot : $copy.accPastDueOnly}
			</button>
		</div>
		<div class="overflow-x-auto rounded-2xl border border-border bg-surface-2">
			<table class="w-full min-w-[760px] text-sm">
				<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
					<tr class="border-b border-border">
						<th class="px-3 py-3">{$copy.payLot}</th>
						<th class="px-3 py-3">{$copy.accColOwner}</th>
						<th class="px-3 py-3 text-right">{$copy.accColOctober}</th>
						<th class="px-3 py-3 text-right">{$copy.accColBehind}</th>
						<th class="px-3 py-3 text-right">{$copy.accColLate}</th>
						<th class="px-3 py-3 text-right">{$copy.accColFine}</th>
						<th class="px-3 py-3 text-right">{$copy.accColLevy}</th>
						<th class="px-3 py-3 text-right">{$copy.accColTotal}</th>
						<th class="px-3 py-3">{$copy.accColFormF}</th>
					</tr>
				</thead>
				<tbody>
					{#each shown as row}
						<tr class="border-b border-border">
							<td class="px-3 py-2 font-semibold"><a class="text-brand-700 no-underline" href="/units?lot={row.unit.id}">{row.unit.id}</a></td>
							<td class="px-3 py-2">{row.unit.owner}</td>
							<td class="px-3 py-2 text-right tabular-nums">{money(row.due.october)}</td>
							<td class="px-3 py-2 text-right tabular-nums">{money(row.due.arrears)}</td>
							<td class="px-3 py-2 text-right tabular-nums">{money(row.due.late)}</td>
							<td class="px-3 py-2 text-right tabular-nums">{money(row.due.fine)}</td>
							<td class="px-3 py-2 text-right tabular-nums">{money(row.due.levy)}</td>
							<td class="px-3 py-2 text-right font-semibold tabular-nums">{money(row.due.total)}</td>
							<td class="px-3 py-2 {formF(row.unit) === 'withheld' ? 'text-rose-700 font-semibold' : 'text-slate-500'}">{formF(row.unit)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
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
		<p class="mb-4 text-sm text-slate-600">{$copy.accJournalIntro}</p>
		<div class="space-y-4">
			{#each books.journal as entry}
				<article class="rounded-2xl border border-border bg-surface-2 p-4">
					<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{entry.date}</p>
					<h2 class="font-semibold text-slate-900">{entry.memo}</h2>
					<table class="mt-2 w-full text-sm">
						<tbody>
							{#each entry.lines as line}
								<tr>
									<td class="py-1">{line.account}</td>
									<td class="py-1 text-right tabular-nums text-slate-700">{line.debit ? money(line.debit) : ''}</td>
									<td class="py-1 text-right tabular-nums text-slate-500">{line.credit ? money(line.credit) : ''}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</article>
			{/each}
		</div>
	{/if}
</div>
