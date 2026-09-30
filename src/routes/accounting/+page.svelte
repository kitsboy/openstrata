<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import BarChart from '$lib/components/BarChart.svelte';
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

	const tabs = [
		['overview', 'Overview'],
		['budget', 'Budget'],
		['receivables', 'Who owes'],
		['payables', 'Who we owe'],
		['funds', 'Three funds'],
		['journal', 'September journal']
	] as const;
</script>

<svelte:head>
	<title>Accounting — Evergreen House</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<PageHeader
		kicker="Fiscal year {building.fiscalLabel}"
		title="The books"
		lede="Three bank accounts, because the Strata Property Act does not let you mix them. Operating runs the building. The contingency reserve is for repairs the depreciation report already named. The parkade levy is a trust that closes when the membrane is done."
	/>

	<div class="mb-6 flex gap-1 overflow-x-auto">
		{#each tabs as [id, label]}
			<button
				class="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold {tab === id ? 'bg-slate-900 text-white' : 'border border-border bg-white text-slate-600'}"
				onclick={() => (tab = id)}
			>{label}</button>
		{/each}
	</div>

	{#if tab === 'overview'}
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<div class="rounded-2xl border border-border bg-white p-5">
				<p class="text-xs font-bold uppercase tracking-wide text-slate-400">Operating cash</p>
				<p class="mt-2 text-2xl font-bold tabular-nums">{money(books.operating.cash)}</p>
				<p class="mt-1 text-xs text-slate-500">Unrestricted equity {money(books.operating.unrestricted)}</p>
			</div>
			<div class="rounded-2xl border border-border bg-white p-5">
				<p class="text-xs font-bold uppercase tracking-wide text-slate-400">Reserve</p>
				<p class="mt-2 text-2xl font-bold tabular-nums">{money(books.crf.equity)}</p>
				<p class="mt-1 text-xs text-slate-500">Cash {money(books.crf.cash)}</p>
			</div>
			<div class="rounded-2xl border border-border bg-white p-5">
				<p class="text-xs font-bold uppercase tracking-wide text-slate-400">Levy trust</p>
				<p class="mt-2 text-2xl font-bold tabular-nums">{money(books.levy.cash)}</p>
				<p class="mt-1 text-xs text-slate-500">{money(books.levy.remaining)} of work left</p>
			</div>
			<div class="rounded-2xl border border-border bg-white p-5">
				<p class="text-xs font-bold uppercase tracking-wide text-slate-400">War chest at cost</p>
				<p class="mt-2 text-2xl font-bold tabular-nums">{money(books.warChestCost)}</p>
				<p class="mt-1 text-xs text-slate-500">Fair value {money(books.warChestValue)} · {money(books.warChestGain)} unrealized</p>
			</div>
		</div>
		<p class="mt-3 text-sm {books.tie.ok ? 'text-emerald-700' : 'text-rose-700'}">
			{books.tie.ok
				? 'The operating fund, the reserve, and the levy each tie. Budgeted fees plus other income equal operating expenses plus the reserve contribution.'
				: `Out of balance by ${books.tie.equityDelta} operating cents. Do not treat this package as closed.`}
		</p>

		<div class="mt-6 rounded-2xl border border-border bg-white p-5">
			<h2 class="font-bold text-slate-900">Fees billed vs operating expenses</h2>
			<p class="text-sm text-slate-500">April through September. Fees are flat. Expenses move with summer grounds work and the September payroll start.</p>
			<div class="mt-4">
				<BarChart data={chart} height={200} showSecondary={true} />
			</div>
			<p class="mt-2 text-xs text-slate-400">Teal is fees billed. Orange is operating expenses. The reserve contribution is not in the orange bars — it is not an operating expense.</p>
		</div>

		<div class="mt-6 grid gap-4 lg:grid-cols-2">
			<div class="rounded-2xl border border-border bg-white p-5 text-sm leading-relaxed text-slate-600">
				<h2 class="font-bold text-slate-900">Year to date, operating fund</h2>
				<p class="mt-2">Fee income that belongs to operating: {money(books.feesOperating)}.</p>
				<p>Other income: {money(books.otherIncome)}.</p>
				<p>Operating expenses: {money(books.expenseTotal)}.</p>
				<p class="font-semibold text-slate-800">Surplus before the war-chest allocation: {money(books.surplusYtd)}.</p>
				<p class="mt-2">The war chest took {money(books.warChestYtd)} of that surplus. It is a transfer inside the fund, not an expense, and it is not a CRF withdrawal.</p>
			</div>
			<div class="rounded-2xl border border-border bg-white p-5 text-sm leading-relaxed text-slate-600">
				<h2 class="font-bold text-slate-900">Insurance and the long repair list</h2>
				<p class="mt-2">{building.insurance.broker}. Policy {building.insurance.policy}, {building.insurance.term}. Premium {money(building.insurance.premiumCents)} was prepaid and is expensed monthly. Water deductible {money(building.insurance.waterDeductibleCents)}. Quake: {building.insurance.quakeDeductible}.</p>
				<p class="mt-2">{depreciation.firm} report dated {depreciation.dated}. Recommended reserve contribution {money(depreciation.recommendedAnnualCents)}. AGM funded {money(depreciation.fundedAnnualCents)}. Next report {depreciation.nextDue}.</p>
			</div>
		</div>
	{/if}

	{#if tab === 'budget'}
		<div class="overflow-x-auto rounded-2xl border border-border bg-white">
			<table class="w-full min-w-[640px] text-sm">
				<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
					<tr class="border-b border-border">
						<th class="px-4 py-3">Account</th>
						<th class="px-4 py-3 text-right">Annual budget</th>
						<th class="px-4 py-3 text-right">Year to date</th>
						<th class="px-4 py-3 text-right">Left</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-border bg-slate-50 font-semibold">
						<td class="px-4 py-3">4010 / 4020 Strata fees</td>
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
						<td class="px-4 py-3 font-semibold">CRF contribution (separate fund)</td>
						<td class="px-4 py-3 text-right font-semibold tabular-nums">{money(books.crfContributionAnnual)}</td>
						<td class="px-4 py-3 text-right tabular-nums">{money(books.feesCrf)}</td>
						<td class="px-4 py-3 text-right tabular-nums">{money(books.crfContributionAnnual - books.feesCrf)}</td>
					</tr>
					<tr>
						<td class="px-4 py-3 font-bold">Budget result (fees + other income − expenses − reserve)</td>
						<td class="px-4 py-3 text-right font-bold tabular-nums">{money(budgetResult)}</td>
						<td class="px-4 py-3"></td>
						<td class="px-4 py-3"></td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="mt-3 text-sm text-slate-500">A zero result means the fee was set to fund the year, not to build a hidden cushion. The operating surplus you already have is a separate, older balance.</p>
	{/if}

	{#if tab === 'receivables'}
		<div class="mb-3 flex items-center justify-between gap-3">
			<p class="text-sm text-slate-500">October is due tomorrow, so almost every lot shows an October number. “Past due only” hides lots whose only item is that upcoming fee.</p>
			<button class="shrink-0 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold" onclick={() => (onlyPastDue = !onlyPastDue)}>
				{onlyPastDue ? 'Show every lot' : 'Past due only'}
			</button>
		</div>
		<div class="overflow-x-auto rounded-2xl border border-border bg-white">
			<table class="w-full min-w-[760px] text-sm">
				<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
					<tr class="border-b border-border">
						<th class="px-3 py-3">Lot</th>
						<th class="px-3 py-3">Owner</th>
						<th class="px-3 py-3 text-right">October</th>
						<th class="px-3 py-3 text-right">Behind</th>
						<th class="px-3 py-3 text-right">Late</th>
						<th class="px-3 py-3 text-right">Fine</th>
						<th class="px-3 py-3 text-right">Levy</th>
						<th class="px-3 py-3 text-right">Total</th>
						<th class="px-3 py-3">Form F</th>
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
		<p class="mt-3 text-sm text-slate-500">Form F is withheld when something is already due: fees, late fees, fines, or levy. October, on September 30, is not yet due, so a current lot can still get a clear Form F.</p>
	{/if}

	{#if tab === 'payables'}
		<div class="overflow-x-auto rounded-2xl border border-border bg-white">
			<table class="w-full min-w-[640px] text-sm">
				<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
					<tr class="border-b border-border">
						<th class="px-4 py-3">Who</th>
						<th class="px-4 py-3">For</th>
						<th class="px-4 py-3">Due</th>
						<th class="px-4 py-3 text-right">Amount</th>
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
						<td class="px-4 py-3 font-semibold">CRA — source deductions</td>
						<td class="px-4 py-3">September payroll. Confirm monthly vs quarterly on the RP letter.</td>
						<td class="px-4 py-3">2026-10-15</td>
						<td class="px-4 py-3 text-right tabular-nums">{money(books.payroll.remittance)}</td>
					</tr>
					<tr>
						<td class="px-4 py-3 font-bold" colspan="3">Open</td>
						<td class="px-4 py-3 text-right font-bold tabular-nums">{money(books.apTotal + books.payroll.remittance)}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="mt-6 grid gap-3 md:grid-cols-2">
			{#each books.contracts as contract}
				<div class="rounded-2xl border border-border bg-white p-4">
					<p class="font-semibold text-slate-900">{contract.vendor}</p>
					<p class="text-sm text-slate-600">{contract.service}</p>
					<p class="mt-1 text-xs text-slate-400">Renews or ends {contract.renewal}</p>
					<p class="mt-2 text-sm text-slate-600">{contract.note}</p>
				</div>
			{/each}
		</div>
	{/if}

	{#if tab === 'funds'}
		<div class="grid gap-4 lg:grid-cols-3">
			<article class="rounded-2xl border border-border bg-white p-5">
				<h2 class="font-bold text-slate-900">Operating</h2>
				<p class="text-xs text-slate-400">{building.banks.operating.name} · {building.banks.operating.account}</p>
				<ul class="mt-3 space-y-1 text-sm text-slate-600">
					<li class="flex justify-between gap-3"><span>Cash</span><span class="tabular-nums">{money(books.operating.cash)}</span></li>
					<li class="flex justify-between gap-3"><span>Receivables</span><span class="tabular-nums">{money(books.operating.ar)}</span></li>
					<li class="flex justify-between gap-3"><span>Prepaid insurance</span><span class="tabular-nums">{money(books.operating.prepaidInsurance)}</span></li>
					<li class="flex justify-between gap-3"><span>War chest at cost</span><span class="tabular-nums">{money(books.operating.warChest)}</span></li>
					<li class="flex justify-between gap-3"><span>Bills and payroll</span><span class="tabular-nums">{money(books.operating.ap + books.operating.payrollPayable)}</span></li>
					<li class="flex justify-between gap-3"><span>Prepaid October fees</span><span class="tabular-nums">{money(books.operating.prepaidFees)}</span></li>
					<li class="flex justify-between gap-3 font-semibold text-slate-900"><span>Fund balance</span><span class="tabular-nums">{money(books.operating.equity)}</span></li>
				</ul>
			</article>
			<article class="rounded-2xl border border-border bg-white p-5">
				<h2 class="font-bold text-slate-900">Contingency reserve</h2>
				<p class="text-xs text-slate-400">{building.banks.crf.name} · {building.banks.crf.account}</p>
				<ul class="mt-3 space-y-1 text-sm text-slate-600">
					<li class="flex justify-between gap-3"><span>Opening, April 1</span><span class="tabular-nums">{money(books.crf.opening)}</span></li>
					<li class="flex justify-between gap-3"><span>Contributions billed</span><span class="tabular-nums">{money(books.crf.contributions)}</span></li>
					<li class="flex justify-between gap-3"><span>Interest</span><span class="tabular-nums">{money(books.crf.interest)}</span></li>
					<li class="flex justify-between gap-3"><span>{books.crf.study}</span><span class="tabular-nums">−{money(books.crf.spent)}</span></li>
					<li class="flex justify-between gap-3"><span>Cash</span><span class="tabular-nums">{money(books.crf.cash)}</span></li>
					<li class="flex justify-between gap-3 font-semibold text-slate-900"><span>Fund balance</span><span class="tabular-nums">{money(books.crf.equity)}</span></li>
				</ul>
				<p class="mt-3 text-xs leading-relaxed text-slate-500">Spend from this account has to be a repair or replacement the report supports. Bitcoin is not that. The war chest is funded from operating surplus by a 3/4 vote.</p>
			</article>
			<article class="rounded-2xl border border-border bg-white p-5">
				<h2 class="font-bold text-slate-900">Parkade levy</h2>
				<p class="text-xs text-slate-400">{building.banks.levy.name} · {building.banks.levy.account}</p>
				<ul class="mt-3 space-y-1 text-sm text-slate-600">
					<li class="flex justify-between gap-3"><span>Assessed ({books.levy.approved})</span><span class="tabular-nums">{money(books.levy.assessed)}</span></li>
					<li class="flex justify-between gap-3"><span>Collected</span><span class="tabular-nums">{money(books.levy.collected)}</span></li>
					<li class="flex justify-between gap-3"><span>Still owing</span><span class="tabular-nums">{money(books.levy.owing)}</span></li>
					<li class="flex justify-between gap-3"><span>Spent on the membrane</span><span class="tabular-nums">{money(books.levy.spent)}</span></li>
					<li class="flex justify-between gap-3"><span>Cash</span><span class="tabular-nums">{money(books.levy.cash)}</span></li>
					<li class="flex justify-between gap-3 font-semibold text-slate-900"><span>Work remaining</span><span class="tabular-nums">{money(books.levy.remaining)}</span></li>
				</ul>
				<p class="mt-3 text-xs leading-relaxed text-slate-500">{books.levy.project}. $36 per entitlement point. Cash plus what owners still owe equals the work that is left.</p>
			</article>
		</div>
	{/if}

	{#if tab === 'journal'}
		<p class="mb-4 text-sm text-slate-600">These are the September control entries a treasurer would read before signing the month. They are not a dump of every hydro bill. The year-to-date totals live on the Budget tab. Each entry balances.</p>
		<div class="space-y-4">
			{#each books.journal as entry}
				<article class="rounded-2xl border border-border bg-white p-4">
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
