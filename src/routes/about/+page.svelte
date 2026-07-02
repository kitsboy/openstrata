<script lang="ts">
	import {
		bcfsaFacts,
		hermesPositioning,
		costSavings,
		competitiveAdvantages,
		productStack,
		warChest
	} from '$lib/marketing';
	import BarChart from '$lib/components/BarChart.svelte';
	import Icon from '$lib/components/Icon.svelte';

	const paymentChart = costSavings.paymentMethods.map((p) => ({
		label: p.method.split(' ')[0],
		value: p.annualCost,
		color: 'recommended' in p && p.recommended
			? '#14b8a6'
			: p.method.includes('Credit')
				? '#ef4444'
				: '#94a3b8'
	}));
</script>

<svelte:head>
	<title>About — Opens Strata | Trusted Money for BC Strata</title>
</svelte:head>

<section class="border-b border-border bg-gradient-to-br from-brand-50 via-white to-amber-50/30">
	<div class="mx-auto max-w-7xl px-6 py-20">
		<h1 class="text-4xl font-bold text-slate-900 sm:text-5xl tracking-tight">
			Trusted Money.<br />
			<span class="bg-gradient-to-r from-brand-600 to-bitcoin bg-clip-text text-transparent">Proven Operations.</span>
		</h1>
		<p class="mt-6 text-xl text-slate-600 max-w-3xl leading-relaxed">
			Opens Strata is BCFSA-aware software that does everything a management company does —
			cheaper, faster, with fewer errors. Fiat rails today. Bitcoin sovereignty when you're ready.
			Every payment provable on Bitcoin via Satohash.
		</p>
	</div>
</section>

<!-- Cost savings -->
<section class="mx-auto max-w-7xl px-6 py-16">
	<h2 class="text-2xl font-bold text-slate-900 mb-2">The Cost of How Strata Pays Today</h2>
	<p class="text-slate-500 mb-8">
		{costSavings.scenario.units} units × ${costSavings.scenario.monthlyFee}/mo =
		<strong class="text-slate-800">${costSavings.annualFeeFlow.toLocaleString()}/year</strong> in fee flow
	</p>

	<div class="grid lg:grid-cols-2 gap-10">
		<div class="glass-card rounded-2xl p-6">
			<h3 class="font-bold text-slate-800 mb-4">Annual Payment Processing Cost</h3>
			<BarChart data={paymentChart} height={220} barColor="#14b8a6" />
			<p class="mt-4 text-sm text-slate-500">
				Credit cards alone cost <strong class="text-danger">$9,000+/year</strong> per building.
				That's CRF money going to Visa, not your roof.
			</p>
		</div>
		<div class="space-y-4">
			{#each costSavings.paymentMethods as pm}
				<div class="flex items-center justify-between rounded-xl border border-border p-4 {'recommended' in pm && pm.recommended ? 'bg-brand-50 border-brand-200' : ''}">
					<div>
						<span class="font-semibold text-slate-800">{pm.method}</span>
						<p class="text-xs text-slate-400">{pm.label}</p>
					</div>
					<span class="text-lg font-bold {pm.annualCost > 5000 ? 'text-danger' : pm.annualCost < 2000 ? 'text-success' : 'text-slate-600'}">
						${pm.annualCost.toLocaleString()}/yr
					</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Manager time savings -->
<section class="border-y border-border bg-white">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<h2 class="text-2xl font-bold text-slate-900 mb-8">Manager Time Savings</h2>
		<div class="overflow-x-auto">
			<table class="w-full text-sm glass-card rounded-2xl overflow-hidden">
				<thead class="bg-slate-50">
					<tr class="text-left">
						<th class="p-4 font-bold text-slate-600">Task</th>
						<th class="p-4 font-bold text-slate-600">Traditional</th>
						<th class="p-4 font-bold text-slate-600">OpenStrata</th>
						<th class="p-4 font-bold text-slate-600">Saving</th>
					</tr>
				</thead>
				<tbody>
					{#each costSavings.managerSavings as row}
						<tr class="border-t border-border">
							<td class="p-4 font-medium text-slate-800">{row.task}</td>
							<td class="p-4 text-slate-500">{row.traditional}</td>
							<td class="p-4 text-brand-700 font-semibold">{row.hermes}</td>
							<td class="p-4"><span class="rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">{row.saving}</span></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>

<!-- BCFSA positioning -->
<section class="mx-auto max-w-7xl px-6 py-16">
	<h2 class="text-2xl font-bold text-slate-900 mb-2">Smart Within the Law</h2>
	<p class="text-slate-500 mb-8 max-w-3xl">
		{bcfsaFacts.regulator} requires licensed brokerages for management services.
		<strong class="text-slate-700">OpenStrata is software — not an unlicensed management company.</strong>
		Three compliant paths:
	</p>
	<div class="grid md:grid-cols-3 gap-6">
		{#each hermesPositioning.paths as path}
			<div class="glass-card rounded-2xl p-6 hover:border-brand-200 transition-all">
				<h3 class="font-bold text-slate-800 text-lg">{path.title}</h3>
				<p class="mt-3 text-sm text-slate-600 leading-relaxed">{path.desc.replace(/\bHermes\b/g, 'OpenStrata')}</p>
				<span class="mt-4 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{path.legal}</span>
			</div>
		{/each}
	</div>
</section>

<!-- Product stack -->
<section class="border-t border-border bg-gradient-to-b from-slate-50 to-white">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<h2 class="text-2xl font-bold text-slate-900 mb-8 text-center">Three Layers of Trust</h2>
		<div class="grid md:grid-cols-3 gap-6">
			{#each productStack as product, i}
				<div class="glass-card rounded-2xl p-8 text-center relative">
					<div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white mb-4
						{i === 0 ? 'bg-brand-600' : i === 1 ? 'bg-bitcoin' : 'bg-bc-blue'}">
						{i + 1}
					</div>
					<h3 class="font-bold text-slate-800 text-lg">{product.name === 'Hermes Strata' ? 'OpenStrata' : product.name}</h3>
					<p class="text-sm font-semibold text-brand-600 mt-1">{product.role}</p>
					<p class="mt-3 text-sm text-slate-500">{product.desc}</p>
				</div>
			{/each}
		</div>
		<p class="mt-8 text-center text-slate-600 max-w-2xl mx-auto">
			<strong>OpenStrata runs your building. Satohash proves it happened. The protocol lets you take your history with you.</strong>
		</p>
	</div>
</section>

<!-- War chest + advantages -->
<section class="mx-auto max-w-7xl px-6 py-16">
	<div class="grid lg:grid-cols-2 gap-10">
		<div class="glass-card rounded-2xl p-8 border-l-4 border-l-bitcoin">
			<h3 class="text-xl font-bold text-slate-800">BTC War Chest</h3>
			<p class="mt-3 text-slate-600 leading-relaxed">
				Council votes to allocate <strong>{warChest.allocPct}</strong> of annual budget into a multisig treasury hedge.
				Keys stay on council hardware wallets. OpenStrata watches — never custodies.
				Disclosed on Form B. Purpose: {warChest.purpose}.
			</p>
		</div>
		<div>
			<h3 class="text-xl font-bold text-slate-800 mb-4">By the Numbers</h3>
			<div class="grid grid-cols-2 gap-3">
				{#each competitiveAdvantages as adv}
					<div class="rounded-xl bg-white border border-border p-4 text-center">
						<div class="text-2xl font-bold text-brand-600">{adv.metric}</div>
						<div class="text-xs font-semibold text-slate-700 mt-1">{adv.label}</div>
						<div class="text-[10px] text-slate-400">vs {adv.vs}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<section class="border-t border-border bg-brand-600">
	<div class="mx-auto max-w-7xl px-6 py-14 text-center text-white">
		<h2 class="text-2xl font-bold">Ready to run smarter?</h2>
		<div class="mt-6 flex flex-wrap justify-center gap-4">
			<a href="/tools" class="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-brand-700 no-underline hover:bg-brand-50 transition-colors">
				Explore Strata Tool →
			</a>
			<a href="/roadmap" class="rounded-xl border border-white/30 px-8 py-3.5 text-sm font-bold text-white no-underline hover:bg-white/10 transition-colors">
				See Roadmap
			</a>
			<a href="mailto:hello@giveabit.io" class="rounded-xl border border-white/30 px-8 py-3.5 text-sm font-bold text-white no-underline hover:bg-white/10 transition-colors inline-flex items-center gap-2">
				<Icon name="mail" class="h-4 w-4" />
				hello@giveabit.io
			</a>
		</div>
	</div>
</section>