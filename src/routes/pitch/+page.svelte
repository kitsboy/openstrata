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
	import { copy, locale, formatCurrency, formatDate } from '$lib/i18n';
	import { auth } from '$lib/api/auth';
	import { fetchLedgerBalance, fetchLedgerSeries } from '$lib/api/ledger';
	import { fetchRailsStatus } from '$lib/api/rails';
	import { onMount } from 'svelte';

	const updatedAt = new Date().toISOString().slice(0, 10);

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

	// Live ledger series (item #4): when a session is live, the treasury chart
	// shows the real monthly income/expenses from /api/v1/ledger/series.
	const monthLabel = (month: string) => {
		const d = new Date(`${month}-01T00:00:00Z`);
		return d.toLocaleString('en', { month: 'short' });
	};
	let liveSeries = $state<Array<{ label: string; value: number; value2: number }> | null>(null);

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
	// Live mode: a signed-in session can read the council's real numbers.
	let live = $state(false);
	let liveCrf = $state<number | null>(null);
	let liveCadPerBtc = $state<number | null>(null);

	onMount(() => {
		const unsubscribe = auth.subscribe((session) => {
			live = session.status === 'signed-in';
			if (live) {
				// Real CRF balance from the hash-chained ledger + the host's CAD/BTC
				// rate from /rails/status. Best-effort: a failure keeps the demo numbers.
				fetchLedgerBalance('crf')
					.then((b) => (liveCrf = b.balanceBasis))
					.catch(() => {});
				fetchRailsStatus()
					.then((s) => (liveCadPerBtc = s.cadPerBtc > 0 ? s.cadPerBtc : null))
					.catch(() => {});
				fetchLedgerSeries('operating', 6)
					.then((points) =>
						(liveSeries = points.map((p) => ({
							label: monthLabel(p.month),
							value: Math.round(p.incomeBasis / 100),
							value2: Math.round(p.expenseBasis / 100)
						})))
					)
					.catch(() => {});
			} else {
				liveCrf = null;
				liveCadPerBtc = null;
				liveSeries = null;
			}
		});
		return unsubscribe;
	});

	$effect(() => {
		// The walk is a demo stand-in — never simulate over a live host value.
		if (live) return;
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
	<title>{$copy.pitchPageTitle}</title>
	<meta name="description" content={$copy.pitchMetaDescription} />
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
						{$copy.aboutHeroTitle}<br />
						<span class="bg-gradient-to-r from-brand-600 to-bitcoin bg-clip-text text-transparent">
							{$copy.aboutHeroAccent}
						</span>
					</h1>
					<p class="mt-6 text-xl text-slate-600 max-w-2xl leading-relaxed">
						{pitchMeta.oneLiner}
					</p>
					<div class="mt-8 flex flex-wrap gap-3">
						<span class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
							<span class="h-2 w-2 rounded-full bg-success live-dot"></span>
							{#if live}{$copy.liveLabel} {$copy.liveDataBadge}{:else}{$copy.demo}{/if} {formatDate(updatedAt, $locale, { year: 'numeric', month: 'long', day: 'numeric' })}
						</span>
						<span class="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-1.5 text-xs font-semibold text-slate-600">
							₿ {formatCurrency(liveCadPerBtc ?? btcCad, $locale, { maximumFractionDigits: 0 })}
						</span>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4 max-w-md lg:max-w-none">
					{#each competitiveAdvantages.slice(0, 4) as adv}
						<div class="glass-card rounded-2xl p-4 text-center">
							<p class="text-3xl font-bold text-brand-700">{adv.metric}</p>
							<p class="mt-1 text-xs font-semibold text-slate-700">{adv.label}</p>
							<p class="mt-1 text-[10px] text-slate-400">{$copy.vsLabel} {adv.vs}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Slide 2: Problem -->
	<section class="pitch-slide bg-surface-2/60 border-y border-border">
		<div class="mx-auto max-w-7xl px-6 py-16">
			<p class="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">{$copy.pitchProblem}</p>
			<h2 class="text-3xl font-bold text-slate-900 mb-8">
				{$copy.pitchProblemHeading}
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
					<h3 class="font-bold text-slate-800 mb-2">{$copy.feeFlowScenario}</h3>
					<p class="text-sm text-slate-500 mb-4">
						{costSavings.scenario.units} {$copy.units} × ${costSavings.scenario.monthlyFee}{$copy.perMonth}
					</p>
					<p class="text-4xl font-bold text-slate-900">
						{formatCurrency(costSavings.annualFeeFlow, $locale)}
						<span class="text-lg font-medium text-slate-400">{$copy.perYear}</span>
					</p>
					<p class="mt-4 text-sm text-slate-500">
						{$copy.rentalIndexLine}
					</p>
					<div class="mt-2">
						<LineChart data={rentalChart} height={100} color="#0d9488" />
					</div>
					<p class="mt-2 text-xs text-slate-400">
						{$copy.avg1brLabel}: ${rentalTrend[rentalTrend.length - 1].avg}{$copy.perMonth} · {$copy.vacancyLabel} {rentalTrend[rentalTrend.length - 1].vacancy}%
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Slide 3: Solution + charts -->
	<section class="pitch-slide">
		<div class="mx-auto max-w-7xl px-6 py-16">
			<p class="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">{$copy.pitchSolution}</p>
			<h2 class="text-3xl font-bold text-slate-900 mb-2">{$copy.sovereigntyStack}</h2>
			<p class="text-slate-500 mb-10 max-w-3xl">{$copy.pitchSolutionDescription}</p>

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
					<h3 class="font-bold text-slate-800 mb-1">{$copy.annualProcessingCost}</h3>
					<p class="text-xs text-slate-400 mb-4">{$copy.sourceLabel}: marketing.ts · {costSavings.scenario.units}{$copy.unitBuildingSuffix}</p>
					<BarChart data={paymentChart} height={200} barColor="#14b8a6" />
					<p class="mt-4 rounded-xl bg-success/10 px-4 py-3 text-sm text-success font-semibold">
						{$copy.openStrataSaves} {formatCurrency(annualSavings, $locale)}{$copy.savesSuffix}
					</p>
				</div>
				<div class="glass-card rounded-2xl p-6">
					<h3 class="font-bold text-slate-800 mb-1">{$copy.managerHoursTitle}</h3>
					<p class="text-xs text-slate-400 mb-4">{$copy.legendGrayTeal}</p>
					<BarChart
						data={managerChart}
						height={200}
						barColor="#94a3b8"
						secondaryColor="#14b8a6"
						showSecondary={true}
					/>
					<p class="mt-4 text-sm text-slate-500">
						<strong class="text-slate-800">{totalManagerHrsTraditional} {$copy.hrsTraditional}</strong> →
						<strong class="text-brand-700">{totalManagerHrsHermes.toFixed(1)} {$copy.hrsWithHermes}</strong>
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Slide 4: Live treasury + competitive -->
	<section class="pitch-slide bg-surface-2/60 border-y border-border">
		<div class="mx-auto max-w-7xl px-6 py-16">
			<p class="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">{$copy.liveOperations}</p>
			<h2 class="text-3xl font-bold text-slate-900 mb-8">{$copy.treasuryEdge}</h2>

			<div class="grid lg:grid-cols-3 gap-8">
				<div class="lg:col-span-2 glass-card rounded-2xl p-6">
					<div class="flex items-center justify-between mb-4">
						<h3 class="font-bold text-slate-800">{$copy.monthlyIncomeExpenses}</h3>
						<span class="text-xs font-semibold text-slate-400">{$copy.incomeExpensesLegend}</span>
					</div>
					<BarChart
						data={liveSeries ?? treasuryChart}
						height={180}
						barColor="#14b8a6"
						secondaryColor="#f7931a"
						showSecondary={true}
					/>
				</div>
				<div class="space-y-4">
					<div class="glass-card rounded-2xl p-6">
						<p class="text-xs font-bold uppercase tracking-widest text-slate-400">{$copy.crfBalanceLabel}</p>
						<p class="mt-2 text-3xl font-bold text-brand-700 stat-flash">
							{formatCurrency(liveCrf ?? crfBalance, $locale, { maximumFractionDigits: 0 })}
						</p>
						<p class="mt-1 text-xs text-slate-400">{#if live}{$copy.liveLabel} · {$copy.liveDataBadge}{:else}{$copy.simulatedLedger}{/if}</p>
					</div>
					<div class="glass-card rounded-2xl p-6">
						<p class="text-xs font-bold uppercase tracking-widest text-slate-400">{$copy.warChestLabel}</p>
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
							<p class="text-xs text-slate-400">{$copy.vsLabel} {adv.vs}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Slide 5: BCFSA paths -->
	<section class="pitch-slide">
		<div class="mx-auto max-w-7xl px-6 py-16">
			<p class="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">{$copy.goToMarket}</p>
			<h2 class="text-3xl font-bold text-slate-900 mb-2">{$copy.smartWithinLaw}</h2>
			<p class="text-slate-500 mb-8 max-w-3xl">
				{bcfsaFacts.regulator} {$copy.requiresLicensedBrokerages}
				<strong class="text-slate-700">{$copy.pitchSoftwareNotManagement}</strong>
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
					<p class="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">{$copy.revenueModel}</p>
					<h2 class="text-3xl font-bold text-slate-900 mb-6">{$copy.pricingTiers}</h2>
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
					<p class="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">{$copy.roadmap}</p>
					<h2 class="text-3xl font-bold text-slate-900 mb-6">{$copy.whatsNext}</h2>
					<div class="space-y-3">
						{#each roadmapSnapshot as item}
							<div class="flex gap-4 items-start rounded-xl border border-border bg-surface-2 p-4">
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
				{$copy.buildSovereign}
			</h2>
			<p class="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
				{$copy.pitchCtaDescription}
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
					class="inline-flex items-center gap-2 rounded-xl border-2 border-brand-200 bg-surface-2 px-8 py-3.5 text-sm font-bold text-brand-700 no-underline hover:bg-brand-50 transition-colors"
				>
					{$copy.tryWizard}
				</a>
				<button
					onclick={() => window.print()}
					class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-8 py-3.5 text-sm font-semibold text-slate-600 no-underline hover:border-brand-300 transition-colors print:hidden"
				>
					🖨 { $copy.printDeck }
				</button>
				<a
					href={pitchMeta.github}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-8 py-3.5 text-sm font-semibold text-slate-600 no-underline hover:border-brand-300 transition-colors"
				>
					<Icon name="github" class="h-4 w-4" />
					{$copy.githubLabel}
				</a>
			</div>
			<p class="mt-12 text-xs text-slate-400 max-w-lg mx-auto">
				{$copy.educationalDisclaimer}
				{$copy.pitchDataNote}
			</p>
		</div>
	</section>
</div>

<style>
	@media print {
		:global(header), :global(footer), :global(.search-backdrop) { display: none !important; }
		.pitch-deck { scroll-snap-type: none; }
		.pitch-deck > section { scroll-snap-align: none; min-height: auto !important; break-inside: avoid; }
	}

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