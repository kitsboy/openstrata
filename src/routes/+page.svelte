<script lang="ts">
	import {
		units,
		treasuryHistory,
		rentalTrend,
		faqItems,
		rssItems
	} from '$lib/data';
	import { competitiveAdvantages, costSavings, hermesPositioning } from '$lib/marketing';
	import { getToolStats } from '$lib/strata-tool';
	import Icon from '$lib/components/Icon.svelte';
	import BarChart from '$lib/components/BarChart.svelte';
	import LineChart from '$lib/components/LineChart.svelte';

	const toolStats = getToolStats();
	const savingsChart = costSavings.paymentMethods.map((p) => ({
		label: p.method.split(' ')[0],
		value: p.annualCost,
		color: p.method.includes('Hermes') ? '#14b8a6' : p.method.includes('Credit') ? '#ef4444' : '#94a3b8'
	}));

	let btcCad = $state(135820);
	let occupancyRate = $state(83.3);
	let crfBalance = $state(248500);
	let eprProgress = $state(67);
	let pendingInvoices = $state(3);
	let lightningPayments = $state(12);
	let tick = $state(0);

	const treasuryChart = $derived(
		treasuryHistory.map((m) => ({
			label: m.month,
			value: m.income,
			value2: m.expenses
		}))
	);

	const rentalChart = $derived(rentalTrend.map((m) => m.avg));

	const occupiedUnits = $derived(units.filter((u) => u.status === 'occupied').length);
	const alertUnits = $derived(units.filter((u) => u.formK === 'missing' || !u.eht).length);

	$effect(() => {
		const interval = setInterval(() => {
			tick++;
			btcCad += (Math.random() - 0.48) * 280;
			occupancyRate = Math.min(100, Math.max(75, occupancyRate + (Math.random() - 0.5) * 0.3));
			crfBalance += Math.floor((Math.random() - 0.3) * 200);
			if (Math.random() > 0.85) lightningPayments++;
		}, 4000);
		return () => clearInterval(interval);
	});

	const modules = $derived([
		{
			id: 'form-k',
			icon: '📋',
			title: 'Form K Hub',
			law: 'SPA §146',
			desc: 'Signed/Missing toggle, CSV occupants, evacuation manifest, bylaw received checkbox. Rosa 14-day auto-reminder.',
			status: '2 missing',
			statusColor: 'warning'
		},
		{
			id: 'epr',
			icon: '⚡',
			title: 'EPR 2026 Monitor',
			law: 'Metro Van mandatory',
			desc: 'Pro credentials dropdown, kW capacity, visual progress to Dec 31 2026, EV % cap with breach alerts.',
			status: `${eprProgress}% complete`,
			statusColor: 'brand'
		},
		{
			id: 'tax',
			icon: '🏠',
			title: 'Tax / Occupancy Matrix',
			law: 'EHT · SVT',
			desc: 'Unit cards with Vancouver EHT and BC SVT auto-flags. Auto declaration reminders. Verified / Alert states.',
			status: `${alertUnits} alerts`,
			statusColor: alertUnits > 0 ? 'danger' : 'success'
		},
		{
			id: 'dual-pay',
			icon: '💳',
			title: 'Dual Pay Treasury',
			law: 'Fiat + Bitcoin',
			desc: 'E-transfer upload or Sovereign Instant Lightning QR with 15-min CAD rate lock. 3-of-5 PSBT multisig council approval.',
			status: `${lightningPayments} LN payments`,
			statusColor: 'bitcoin'
		},
		{
			id: 'bylaw',
			icon: '⚖️',
			title: 'Bylaw Enforcement Engine',
			law: 'SPA s.124–128',
			desc: 'Written complaint → Notice → 14-day lock → Council vote → Fine. CRT-proof workflow with BLOCK_FINE_ACTIONS.',
			status: '14-day lock active',
			statusColor: 'warning'
		},
		{
			id: 'forms',
			icon: '📄',
			title: 'Forms B & F',
			law: 'Conveyancing',
			desc: 'Form F blocks sale on arrears. Form B within 7 days — fees, CRT cases, CRF balance, EPR disclosure.',
			status: '1 WITHHELD',
			statusColor: 'danger'
		},
		{
			id: 'meetings',
			icon: '🗳️',
			title: 'Meetings & Voting',
			law: 'SPA s.48–51',
			desc: 'Quorum calculator, 30-min reschedule rule, hybrid AGM voting. Majority / 3-4 / 80% / unanimous engine.',
			status: 'AGM in 42 days',
			statusColor: 'brand'
		},
		{
			id: 'depreciation',
			icon: '📊',
			title: 'Depreciation Reports',
			law: 'SPA s.94',
			desc: '5-year renewal cycle, 30-year capital projection. Link line items to CRF budget. Vendor WCB compliance.',
			status: 'Due 2027',
			statusColor: 'brand'
		}
	]);

	const agents = [
		{ name: 'Rosa', role: 'Compliance RAG', desc: 'BC SPA/RTA/CRT/bylaws strict RAG. Source citations only. Auto-remind loops.', color: 'brand' },
		{ name: 'Ziggy', role: 'Treasury State Machine', desc: 'Invoice parse → CRF 10% cap → PSBT → 3-sig quorum → reconcile.', color: 'bitcoin' }
	];
</script>

<svelte:head>
	<title>Hermes Strata — Sovereign Strata Corporation Dashboard</title>
</svelte:head>

<!-- Hero -->
<section class="relative overflow-hidden border-b border-border">
	<div class="absolute inset-0 bg-gradient-to-br from-brand-50/80 via-transparent to-amber-50/40 pointer-events-none"></div>
	<div class="mx-auto max-w-7xl px-6 py-16 sm:py-24 relative">
		<div class="grid lg:grid-cols-2 gap-12 items-center">
			<div>
				<div class="mb-5 flex flex-wrap gap-2">
					<span class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
						<span class="h-2 w-2 rounded-full bg-success live-dot"></span>
						BC-First · BCFSA-Aware Software
					</span>
					<span class="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-xs font-semibold text-slate-600">
						{toolStats.total} Strata Tool modules · {toolStats.live} live
					</span>
				</div>
				<h1 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] leading-[1.1]">
					Everything a Management<br />
					<span class="bg-gradient-to-r from-brand-600 to-bc-blue bg-clip-text text-transparent">Company Does — Better.</span>
				</h1>
				<p class="mt-6 text-lg leading-relaxed text-slate-600 max-w-xl">
					Cheaper, faster, fewer errors. Trust accounting, compliance, payments, governance —
					for licensed brokerages, self-managed councils, or hybrid. Fiat today. Bitcoin sovereignty optional.
				</p>
				<div class="mt-8 flex flex-wrap gap-3">
					<a href="/tools" class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white no-underline shadow-lg shadow-brand-500/25 hover:bg-brand-500 hover:shadow-xl transition-all">
						Strata Tool →
					</a>
					<a href="/about" class="inline-flex items-center gap-2 rounded-xl border border-bitcoin/30 bg-amber-50 px-6 py-3.5 text-sm font-semibold text-bitcoin no-underline hover:border-bitcoin/50 transition-all">
						Why Trusted Money
					</a>
					<a href="/roadmap" class="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 no-underline hover:border-brand-300 transition-all">
						Roadmap
					</a>
				</div>
			</div>

			<!-- Live stats grid -->
			<div class="grid grid-cols-2 gap-4">
				<div class="glass-card rounded-2xl p-5 col-span-2">
					<div class="flex items-center justify-between mb-3">
						<span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Treasury Balance</span>
						<span class="live-dot flex items-center gap-1 text-[10px] font-bold text-success uppercase">
							<span class="h-1.5 w-1.5 rounded-full bg-success"></span> Live
						</span>
					</div>
					<div class="text-3xl font-bold text-slate-800 stat-flash" key={tick}>
						${(crfBalance * 4.2).toLocaleString('en-CA')}
						<span class="text-base font-normal text-slate-400">CAD</span>
					</div>
					<div class="mt-1 flex items-center gap-3 text-sm">
						<span class="text-bitcoin font-semibold">₿{(crfBalance * 4.2 / btcCad).toFixed(4)}</span>
						<span class="text-slate-400">CRF: ${crfBalance.toLocaleString()} (10%)</span>
					</div>
				</div>

				<div class="glass-card rounded-2xl p-5">
					<span class="text-xs font-semibold uppercase tracking-wide text-slate-400">BTC/CAD</span>
					<div class="mt-2 text-2xl font-bold text-bitcoin stat-flash" key={tick}>
						${btcCad.toLocaleString('en-CA', { maximumFractionDigits: 0 })}
					</div>
				</div>

				<div class="glass-card rounded-2xl p-5">
					<span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Occupancy</span>
					<div class="mt-2 text-2xl font-bold text-bc-green stat-flash" key={tick}>
						{occupancyRate.toFixed(1)}%
					</div>
					<div class="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
						<div class="h-full rounded-full bg-gradient-to-r from-bc-green to-brand-400 transition-all duration-700" style="width: {occupancyRate}%"></div>
					</div>
				</div>

				<div class="glass-card rounded-2xl p-5">
					<span class="text-xs font-semibold uppercase tracking-wide text-slate-400">EPR 2026</span>
					<div class="mt-2 text-2xl font-bold text-brand-700">{eprProgress}%</div>
					<div class="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
						<div class="h-full rounded-full bg-brand-500 transition-all" style="width: {eprProgress}%"></div>
					</div>
					<p class="mt-1.5 text-[10px] text-slate-400">Deadline: Dec 31, 2026</p>
				</div>

				<div class="glass-card rounded-2xl p-5">
					<span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Pending</span>
					<div class="mt-2 text-2xl font-bold text-warning">{pendingInvoices}</div>
					<p class="text-xs text-slate-400">Invoices awaiting sig</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Competitive advantages + savings -->
<section class="border-b border-border bg-white">
	<div class="mx-auto max-w-7xl px-6 py-14">
		<div class="grid lg:grid-cols-2 gap-10 items-center">
			<div>
				<h2 class="text-2xl font-bold text-slate-900">Save $9,000+/Year Per Building</h2>
				<p class="mt-2 text-slate-500">50 units × $500/mo — credit cards vs Hermes e-transfer/Lightning</p>
				<BarChart data={savingsChart} height={180} barColor="#14b8a6" />
			</div>
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
				{#each competitiveAdvantages as adv}
					<div class="rounded-xl border border-border bg-slate-50 p-4 text-center hover:border-brand-200 transition-colors">
						<div class="text-xl font-bold text-brand-600">{adv.metric}</div>
						<div class="text-xs font-semibold text-slate-700 mt-1">{adv.label}</div>
					</div>
				{/each}
			</div>
		</div>
		<div class="mt-10 grid md:grid-cols-3 gap-4">
			{#each hermesPositioning.paths as path}
				<div class="rounded-xl border border-border p-4 text-center">
					<span class="text-sm font-bold text-slate-800">{path.title}</span>
					<p class="text-xs text-slate-500 mt-1">{path.legal}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Architecture strip -->
<section class="border-b border-border bg-slate-50">
	<div class="mx-auto max-w-7xl px-6 py-8">
		<div class="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm">
			<div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-border">
				<span class="text-lg">📱</span>
				<span class="font-medium text-slate-700">Mobile PWA</span>
			</div>
			<span class="text-slate-300 hidden sm:block">→</span>
			<div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 border border-brand-200">
				<span class="text-lg">🔒</span>
				<span class="font-medium text-brand-700">Tailscale Gateway</span>
			</div>
			<span class="text-slate-300 hidden sm:block">→</span>
			<div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-border">
				<span class="font-medium text-slate-700">Rosa + Ziggy</span>
			</div>
			<span class="text-slate-300 hidden sm:block">→</span>
			<div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200">
				<Icon name="bitcoin" class="h-4 w-4 text-bitcoin" />
				<span class="font-medium text-bitcoin">BTC + Lightning</span>
			</div>
		</div>
	</div>
</section>

<!-- Charts + Units -->
<section class="border-b border-border">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<div class="grid lg:grid-cols-3 gap-8">
			<div class="lg:col-span-2 glass-card rounded-2xl p-6">
				<div class="flex items-center justify-between mb-6">
					<div>
						<h2 class="text-lg font-bold text-slate-800">Treasury Flow</h2>
						<p class="text-sm text-slate-500">Monthly income vs expenses · CRF 10% auto-allocated</p>
					</div>
					<div class="flex gap-4 text-xs">
						<span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-brand-500"></span> Income</span>
						<span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-bitcoin"></span> Expenses</span>
					</div>
				</div>
				<BarChart data={treasuryChart} height={200} showSecondary={true} />
			</div>

			<div class="glass-card rounded-2xl p-6">
				<h2 class="text-lg font-bold text-slate-800">Rental Market</h2>
				<p class="text-sm text-slate-500 mb-4">Metro Vancouver avg 1BR · Vacancy {rentalTrend[rentalTrend.length - 1].vacancy}%</p>
				<LineChart data={rentalChart} height={140} color="#2d6a4f" fillColor="rgba(45, 106, 79, 0.08)" />
				<div class="mt-4 grid grid-cols-2 gap-3">
					<div class="rounded-xl bg-bc-green/5 p-3 text-center">
						<div class="text-xl font-bold text-bc-green">${rentalTrend[rentalTrend.length - 1].avg}</div>
						<div class="text-[10px] text-slate-400 uppercase">Avg Rent/mo</div>
					</div>
					<div class="rounded-xl bg-brand-50 p-3 text-center">
						<div class="text-xl font-bold text-brand-700">{occupiedUnits}/{units.length}</div>
						<div class="text-[10px] text-slate-400 uppercase">Units Occupied</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Unit cards -->
		<div class="mt-10">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-bold text-slate-800">Unit Matrix</h2>
				<a href="/tools" class="text-sm font-semibold text-brand-600 no-underline hover:text-brand-700">View all tools →</a>
			</div>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each units as unit}
					<div class="glass-card rounded-2xl p-5 hover:border-brand-200 transition-all group cursor-pointer">
						<div class="flex items-start justify-between">
							<div>
								<span class="text-2xl font-bold text-slate-800">#{unit.id}</span>
								<span class="ml-2 text-sm text-slate-400">Floor {unit.floor} · {unit.sqft} sqft</span>
							</div>
							<span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase
								{unit.status === 'occupied' ? 'bg-success/10 text-success' :
								 unit.status === 'vacant' ? 'bg-warning/10 text-warning' :
								 'bg-purple-100 text-purple-600'}">
								{unit.status}
							</span>
						</div>
						{#if unit.tenant}
							<p class="mt-2 text-sm text-slate-600">{unit.tenant}</p>
						{/if}
						<div class="mt-3 text-lg font-semibold text-slate-800">${unit.rent.toLocaleString()}<span class="text-sm font-normal text-slate-400">/mo</span></div>
						<div class="mt-3 flex flex-wrap gap-1.5">
							<span class="rounded-md px-2 py-0.5 text-[10px] font-semibold {unit.formK === 'signed' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}">
								Form K: {unit.formK}
							</span>
							<span class="rounded-md px-2 py-0.5 text-[10px] font-semibold {unit.eht ? 'bg-brand-50 text-brand-700' : 'bg-danger/10 text-danger'}">
								EHT: {unit.eht ? 'verified' : 'alert'}
							</span>
							{#if unit.evCharger}
								<span class="rounded-md px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700">EV Charger</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- Core Modules -->
<section class="border-b border-border bg-white">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<div class="text-center mb-12">
			<h2 class="text-2xl font-bold text-slate-900 sm:text-3xl">Core Modules</h2>
			<p class="mt-3 text-slate-500 max-w-2xl mx-auto">BC MVP modules — config-driven expansion to provinces, states, and EU markets</p>
		</div>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each modules as mod}
				<div class="glass-card rounded-2xl p-6 group hover:border-brand-200 transition-all">
					<div class="flex items-start gap-4">
						<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-2xl group-hover:scale-105 transition-transform">
							{mod.icon}
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<h3 class="text-lg font-bold text-slate-800">{mod.title}</h3>
								<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{mod.law}</span>
							</div>
							<p class="mt-2 text-sm text-slate-500 leading-relaxed">{mod.desc}</p>
							<div class="mt-3">
								<span class="inline-flex rounded-full px-3 py-1 text-xs font-bold
									{mod.statusColor === 'warning' ? 'bg-warning/10 text-warning' :
									 mod.statusColor === 'danger' ? 'bg-danger/10 text-danger' :
									 mod.statusColor === 'bitcoin' ? 'bg-bitcoin/10 text-bitcoin' :
									 mod.statusColor === 'success' ? 'bg-success/10 text-success' :
									 'bg-brand-50 text-brand-700'}">
									{mod.status}
								</span>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Kimi Agents -->
<section class="border-b border-border">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<h2 class="text-2xl font-bold text-slate-900 text-center mb-10">Kimi Agents</h2>
		<div class="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
			{#each agents as agent}
				<div class="glass-card rounded-2xl p-8 text-center">
					<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white mb-4
						{agent.color === 'bitcoin' ? 'bg-gradient-to-br from-bitcoin to-amber-600' : 'bg-gradient-to-br from-brand-500 to-brand-700'}">
						{agent.name[0]}
					</div>
					<h3 class="text-xl font-bold text-slate-800">{agent.name}</h3>
					<p class="text-sm font-semibold text-brand-600 mt-1">{agent.role}</p>
					<p class="mt-3 text-sm text-slate-500 leading-relaxed">{agent.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- RSS preview + FAQ -->
<section class="border-b border-border bg-white">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<div class="grid lg:grid-cols-2 gap-12">
			<div>
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-bold text-slate-800">Latest Feeds</h2>
					<a href="/rss" class="text-sm font-semibold text-brand-600 no-underline">All feeds →</a>
				</div>
				<div class="space-y-4">
					{#each rssItems.slice(0, 4) as item}
						<article class="glass-card rounded-xl p-4 hover:border-brand-200 transition-all">
							<div class="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
								<Icon name="rss" class="h-3 w-3" />
								{item.date}
							</div>
							<h3 class="font-semibold text-slate-800 text-sm leading-snug">{item.title}</h3>
							<p class="mt-1.5 text-xs text-slate-500 line-clamp-2">{item.excerpt}</p>
						</article>
					{/each}
				</div>
			</div>

			<div>
				<h2 class="text-xl font-bold text-slate-800 mb-6">Strata FAQ</h2>
				<div class="space-y-3">
					{#each faqItems as item}
						<details class="glass-card rounded-xl group">
							<summary class="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-700 list-none flex items-center justify-between">
								<span>{item.q}</span>
								<span class="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
							</summary>
							<div class="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-border pt-3">
								<span class="inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 mb-2">{item.category}</span>
								<p>{item.a}</p>
							</div>
						</details>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section>
	<div class="mx-auto max-w-7xl px-6 py-20 text-center">
		<h2 class="text-2xl font-bold text-slate-900 sm:text-3xl">
			Built on Bitcoin. Powered by Open Standards.
		</h2>
		<p class="mx-auto mt-4 max-w-xl text-slate-500">
			Hermes Strata is a Give A Bit project. Local-first sovereignty. No platform fees. No KYC.
			Progressive disclosure — 3 taps max to any task.
		</p>
		<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
			<a href="https://github.com/kitsboy/openstrata" class="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-slate-700 no-underline hover:border-brand-300 transition-all" target="_blank" rel="noopener noreferrer">
				<Icon name="github" class="h-5 w-5" />
				GitHub
			</a>
			<a href="https://x.com/giveabit" class="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-slate-700 no-underline hover:border-brand-300 transition-all" target="_blank" rel="noopener noreferrer">
				<Icon name="x" class="h-5 w-5" />
				Follow on X
			</a>
			<a href="mailto:hello@giveabit.io" class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-brand-500 transition-all">
				<Icon name="mail" class="h-4 w-4" />
				hello@giveabit.io
			</a>
		</div>
	</div>
</section>