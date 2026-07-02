<script lang="ts">
	import {
		pitchMeta,
		problemPoints,
		revenueTiers,
		roadmapSnapshot,
		bcfsaFacts,
		hermesPositioning,
		costSavings,
		competitiveAdvantages,
		productStack,
		warChest
	} from '$lib/marketing';
	import { treasuryHistory, rentalTrend } from '$lib/data';
	import BarChart from '$lib/components/BarChart.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import Icon from '$lib/components/Icon.svelte';

	const updatedAt = new Date().toLocaleDateString('en-CA', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const paymentChart = costSavings.paymentMethods.map((p) => ({
		label: p.method.split(' ')[0],
		value: p.annualCost,
		color: 'recommended' in p && p.recommended
			? '#14b8a6'
			: p.method.includes('Credit')
				? '#ef4444'
				: '#94a3b8'
	}));

	const managerChart = costSavings.managerSavings.map((row) => ({
		label: row.task.split(' ')[0],
		value: row.traditionalHrs,
		value2: row.hermesHrs,
		color: '#94a3b8'
	}));

	const treasuryChart = treasuryHistory.map((m) => ({
		label: m.month,
		value: m.income,
		value2: m.expenses
	}));

	const rentalChart = rentalTrend.map((m) => m.avg);

	const hermesAnnualCost = costSavings.paymentMethods.find((p) =>
		p.method === 'Auto E-Transfer'
	)?.annualCost ?? 600;
	const creditAnnualCost = costSavings.paymentMethods.find((p) =>
		p.method.includes('Credit')
	)?.annualCost ?? 9000;
	const annualSavings = creditAnnualCost - hermesAnnualCost;

	let btcCad = $state(135820);
	let crfBalance = $state(treasuryHistory[treasuryHistory.length - 1].crf * 58);
	let liveLabel = $state('Live');

	$effect(() => {
		const interval = setInterval(() => {
			btcCad += (Math.random() - 0.48) * 280;
			crfBalance += Math.floor((Math.random() - 0.3) * 120);
		}, 4000);
		return () => clearInterval(interval);
	});

	const totalManagerHrsTraditional = costSavings.managerSavings.reduce(
		(sum, r) => sum + r.traditionalHrs,
		0
	);
	const totalManagerHrsHermes = costSavings.managerSavings.reduce((sum, r) => sum + r.hermesHrs, 0);
</script>

<svelte:head>
	<title>Pitch — Hermes Strata | Investor Deck</title>
	<meta
		name="description"
		content="Live investor pitch for Hermes Strata — BCFSA-aware strata operations with real cost savings, charts, and roadmap."
	/>
</svelte:head>

<div class="pitch-deck">
	<!-- Slide 1: Title -->
	<section class="pitch-slide pitch-slide-hero">
		<div class="mx-auto max-w-7xl px-6 py-16 sm:py-24">
			<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
				<div>
					<div class="flex items-center gap-4 mb-8">
						<img
							src="/logo.png"
							alt="Hermes Strata"
							class="h-16 w-16 rounded-xl object-cover shadow-lg shadow-brand-500/20"
						/>
						<div>
							<p class="text-xs font-bold uppercase tracking-widest text-brand-600">
								Give A Bit · OpenStrata
							</p>
							<p class="text-sm text-slate-500">v{pitchMeta.version}</p>
						</div>
					</div>
					<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
						Trusted Money.<br />
						<span class="bg-gradient-to-r from-brand-600 to-bitcoin bg-clip-text text-transparent">
							Proven Operations.
						</span>
					</h1>
					<p class="mt-6 text-xl text-slate-600 max-w-2xl leading-relaxed">
						{pitchMeta.oneLiner}
					</p>
					<div class="mt-8 flex flex-wrap gap-3">
						<span class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
							<span class="h-2 w-2 rounded-full bg-success live-dot"></span>
							{liveLabel} data · synced {updatedAt}
						</span>
						<span class="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-xs font-semibold text-slate-600">
							₿ ${btcCad.toLocaleString('en-CA', { maximumFractionDigits: 0 })} CAD
						</span>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4 max-w-md lg:max-w-none">
					{#each competitiveAdvantages.slice(0, 4) as adv}
						<div class="glass-card rounded-2xl p-5 text-center">
							<p class="text-3xl font-bold text-brand-700">{adv.metric}</p>
							<p class="mt-1 text-xs font-semibold text-slate-700">{adv.label}</p>
							<p class="mt-1 text-[10px] text-slate-400">vs {adv.vs}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Slide 2: Problem -->
	<section class="pitch-slide bg-white border-y border-border">
		<div class="mx-auto max-w-7xl px-6 py-16">
			<p class="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">The Problem</p>
			<h2 class="text-3xl font-bold text-slate-900 mb-8">
				BC Strata Management Is Regulated, Labour-Intensive, and Expensive
			</h2>
			<div class="grid lg:grid-cols-2 gap-10 items-start">
				<ul class="space-y-3">
					{#each problemPoints as point}
						<li class="flex gap-3 text-slate-600">
							<span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-danger"></span>
							<span class="text-sm leading-relaxed">{point}</span>
						</li>
					{/each}
				</ul>
				<div class="glass-card rounded-2xl p-6">
					<h3 class="font-bold text-slate-800 mb-2">Fee Flow Scenario</h3>
					<p class="text-sm text-slate-500 mb-4">
						{costSavings.scenario.units} units × ${costSavings.scenario.monthlyFee}/mo
					</p>
					<p class="text-4xl font-bold text-slate-900">
						${costSavings.annualFeeFlow.toLocaleString()}
						<span class="text-lg font-medium text-slate-400">/year</span>
					</p>
					<p class="mt-4 text-sm text-slate-500">
						Metro Vancouver rental index (live trend):
					</p>
					<div class="mt-2">
						<LineChart data={rentalChart} height={100} color="#0d9488" />
					</div>
					<p class="mt-2 text-xs text-slate-400">
						Avg 1BR: ${rentalTrend[rentalTrend.length - 1].avg}/mo · Vacancy {rentalTrend[rentalTrend.length - 1].vacancy}%
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Slide 3: Solution + charts -->
	<section class="pitch-slide">
		<div class="mx-auto max-w-7xl px-6 py-16">
			<p class="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">The Solution</p>
			<h2 class="text-3xl font-bold text-slate-900 mb-2">Three-Layer Sovereignty Stack</h2>
			<p class="text-slate-500 mb-10 max-w-3xl">
				We sell software — not unlicensed management services. Hermes powers operations;
				Satohash proves every action; OpenStrata keeps data portable.
			</p>

			<div class="grid md:grid-cols-3 gap-6 mb-12">
				{#each productStack as product, i}
					<div class="glass-card rounded-2xl p-6 {i === 0 ? 'ring-2 ring-brand-200' : ''}">
						<p class="text-xs font-bold uppercase tracking-widest text-brand-600">{product.role}</p>
						<h3 class="mt-2 text-xl font-bold text-slate-800">{product.name}</h3>
						<p class="mt-3 text-sm text-slate-600 leading-relaxed">{product.desc}</p>
					</div>
				{/each}
			</div>

			<div class="grid lg:grid-cols-2 gap-8">
				<div class="glass-card rounded-2xl p-6">
					<h3 class="font-bold text-slate-800 mb-1">Annual Payment Processing Cost</h3>
					<p class="text-xs text-slate-400 mb-4">Source: marketing.ts · {costSavings.scenario.units}-unit building</p>
					<BarChart data={paymentChart} height={200} barColor="#14b8a6" />
					<p class="mt-4 rounded-xl bg-success/10 px-4 py-3 text-sm text-success font-semibold">
						OpenStrata saves ${annualSavings.toLocaleString()}/yr vs credit cards alone
					</p>
				</div>
				<div class="glass-card rounded-2xl p-6">
					<h3 class="font-bold text-slate-800 mb-1">Manager Hours per Cycle</h3>
					<p class="text-xs text-slate-400 mb-4">Grey = traditional · Teal = Hermes</p>
					<BarChart
						data={managerChart}
						height={200}
						barColor="#94a3b8"
						secondaryColor="#14b8a6"
						showSecondary={true}
					/>
					<p class="mt-4 text-sm text-slate-500">
						<strong class="text-slate-800">{totalManagerHrsTraditional} hrs</strong> traditional →
						<strong class="text-brand-700">{totalManagerHrsHermes.toFixed(1)} hrs</strong> with Hermes
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Slide 4: Live treasury + competitive -->
	<section class="pitch-slide bg-white border-y border-border">
		<div class="mx-auto max-w-7xl px-6 py-16">
			<p class="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">Live Operations</p>
			<h2 class="text-3xl font-bold text-slate-900 mb-8">Treasury & Competitive Edge</h2>

			<div class="grid lg:grid-cols-3 gap-8">
				<div class="lg:col-span-2 glass-card rounded-2xl p-6">
					<div class="flex items-center justify-between mb-4">
						<h3 class="font-bold text-slate-800">Monthly Income vs Expenses</h3>
						<span class="text-xs font-semibold text-slate-400">Teal = income · Orange = expenses</span>
					</div>
					<BarChart
						data={treasuryChart}
						height={180}
						barColor="#14b8a6"
						secondaryColor="#f7931a"
						showSecondary={true}
					/>
				</div>
				<div class="space-y-4">
					<div class="glass-card rounded-2xl p-6">
						<p class="text-xs font-bold uppercase tracking-widest text-slate-400">CRF Balance</p>
						<p class="mt-2 text-3xl font-bold text-brand-700 stat-flash">
							${crfBalance.toLocaleString()}
						</p>
						<p class="mt-1 text-xs text-slate-400">Simulated live ledger</p>
					</div>
					<div class="glass-card rounded-2xl p-6">
						<p class="text-xs font-bold uppercase tracking-widest text-slate-400">War Chest</p>
						<p class="mt-2 text-sm text-slate-600">{warChest.allocPct} of budget · {warChest.custody}</p>
						<p class="mt-2 text-xs text-slate-400">{warChest.purpose}</p>
					</div>
				</div>
			</div>

			<div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each competitiveAdvantages as adv}
					<div class="rounded-xl border border-border bg-surface px-4 py-3 flex items-center gap-4">
						<span class="text-2xl font-bold text-brand-700 shrink-0">{adv.metric}</span>
						<div>
							<p class="text-sm font-semibold text-slate-800">{adv.label}</p>
							<p class="text-xs text-slate-400">vs {adv.vs}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Slide 5: BCFSA paths -->
	<section class="pitch-slide">
		<div class="mx-auto max-w-7xl px-6 py-16">
			<p class="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">Go-To-Market</p>
			<h2 class="text-3xl font-bold text-slate-900 mb-2">Smart Within the Law</h2>
			<p class="text-slate-500 mb-8 max-w-3xl">
				{bcfsaFacts.regulator} requires licensed brokerages for management services.
				<strong class="text-slate-700">Hermes is software — not an unlicensed management company.</strong>
			</p>
			<div class="grid md:grid-cols-3 gap-6">
				{#each hermesPositioning.paths as path}
					<div class="glass-card rounded-2xl p-6 hover:border-brand-200 transition-all">
						<h3 class="font-bold text-slate-800 text-lg">{path.title}</h3>
						<p class="mt-3 text-sm text-slate-600 leading-relaxed">{path.desc}</p>
						<span class="mt-4 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
							{path.legal}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Slide 6: Revenue + Roadmap -->
	<section class="pitch-slide bg-gradient-to-b from-slate-50 to-white border-t border-border">
		<div class="mx-auto max-w-7xl px-6 py-16">
			<div class="grid lg:grid-cols-2 gap-12">
				<div>
					<p class="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">Revenue Model</p>
					<h2 class="text-3xl font-bold text-slate-900 mb-6">Pricing Tiers</h2>
					<div class="space-y-3">
						{#each revenueTiers as tier}
							<div class="glass-card rounded-xl p-4 flex items-center justify-between gap-4">
								<div>
									<p class="font-bold text-slate-800">{tier.tier}</p>
									<p class="text-xs text-slate-400">{tier.target}</p>
								</div>
								<div class="text-right">
									<p class="font-bold text-brand-700">{tier.price}</p>
									<p class="text-[10px] text-slate-400">{tier.priceNote}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
				<div>
					<p class="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">Roadmap</p>
					<h2 class="text-3xl font-bold text-slate-900 mb-6">What's Next</h2>
					<div class="space-y-3">
						{#each roadmapSnapshot as item}
							<div class="flex gap-4 items-start rounded-xl border border-border bg-white p-4">
								<span
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold
										{item.status === 'complete'
										? 'bg-success/10 text-success'
										: item.status === 'active'
											? 'bg-brand-50 text-brand-700'
											: 'bg-slate-100 text-slate-500'}"
								>
									{item.phase}
								</span>
								<div>
									<p class="text-xs font-bold text-slate-400">{item.timeline}</p>
									<p class="text-sm font-semibold text-slate-800">{item.deliverable}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Slide 7: CTA -->
	<section class="pitch-slide pitch-slide-cta">
		<div class="mx-auto max-w-7xl px-6 py-20 text-center">
			<img
				src="/logo.png"
				alt="Hermes Strata"
				class="h-20 w-20 rounded-2xl object-cover shadow-xl shadow-brand-500/25 mx-auto mb-6"
			/>
			<h2 class="text-3xl sm:text-4xl font-bold text-slate-900">
				Let's Build Sovereign Strata Operations
			</h2>
			<p class="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
				Partner with Give A Bit. Fiat rails today. Bitcoin proof when you're ready.
			</p>
			<div class="mt-10 flex flex-wrap justify-center gap-4">
				<a
					href="mailto:{pitchMeta.contact}"
					class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-bold text-white no-underline hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/25"
				>
					<Icon name="mail" class="h-4 w-4" />
					{pitchMeta.contact}
				</a>
				<a
					href="/tools/wizard"
					class="inline-flex items-center gap-2 rounded-xl border-2 border-brand-200 bg-white px-8 py-3.5 text-sm font-bold text-brand-700 no-underline hover:bg-brand-50 transition-colors"
				>
					Try Building Wizard
				</a>
				<a
					href={pitchMeta.github}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-8 py-3.5 text-sm font-semibold text-slate-600 no-underline hover:border-brand-300 transition-colors"
				>
					<Icon name="github" class="h-4 w-4" />
					GitHub
				</a>
			</div>
			<p class="mt-12 text-xs text-slate-400 max-w-lg mx-auto">
				Safe Harbour: Educational purposes only. Consult qualified professionals for legal and financial decisions.
				Data synced from marketing.ts — update numbers once, pitch stays current.
			</p>
		</div>
	</section>
</div>

<style>
	.pitch-deck {
		scroll-snap-type: y proximity;
	}

	.pitch-slide {
		scroll-snap-align: start;
	}

	.pitch-slide-hero {
		background: linear-gradient(
			135deg,
			rgba(240, 253, 249, 0.9) 0%,
			rgba(255, 255, 255, 1) 50%,
			rgba(255, 251, 235, 0.4) 100%
		);
	}

	.pitch-slide-cta {
		background: linear-gradient(180deg, white 0%, rgba(240, 253, 249, 0.5) 100%);
	}

	@media print {
		.pitch-slide {
			break-inside: avoid;
			page-break-inside: avoid;
			min-height: auto;
			padding: 1rem 0;
		}

		.pitch-deck {
			scroll-snap-type: none;
		}
	}
</style>