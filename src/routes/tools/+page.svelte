<script lang="ts">
	import { toolDomains, strataToolModules, getToolStats } from '$lib/strata-tool';
	import { units } from '$lib/data';
	import { bylawEnforcementWorkflow, conveyancingWorkflow } from '$lib/compliance';
	import Icon from '$lib/components/Icon.svelte';
	import { goto } from '$app/navigation';

	let activeDomain = $state('all');
	let sovereignMode = $state(false);
	let formKFilter = $state<'all' | 'signed' | 'missing'>('all');
	let selectedUnit = $state<string | null>(null);

	const stats = getToolStats();

	const filteredModules = $derived(
		activeDomain === 'all'
			? strataToolModules
			: strataToolModules.filter((m) => m.domain === activeDomain)
	);

	const filteredUnits = $derived(
		formKFilter === 'all' ? units : units.filter((u) => u.formK === formKFilter)
	);

	const statusColor = (s: string) =>
		s === 'live' ? 'bg-success/10 text-success' :
		s === 'beta' ? 'bg-brand-100 text-brand-700' :
		'bg-slate-100 text-slate-500';
</script>

<svelte:head>
	<title>Strata Tool — Hermes Strata | 30+ Modules</title>
</svelte:head>

<!-- Hero -->
<section class="border-b border-border bg-gradient-to-br from-bc-green/5 via-brand-50/30 to-white">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<div class="flex flex-wrap items-end justify-between gap-6">
			<div>
				<p class="text-sm font-bold text-brand-600 uppercase tracking-wide mb-2">Full Management Company Scope</p>
				<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">Hermes Strata Tool</h1>
				<p class="mt-3 text-lg text-slate-600 max-w-2xl">
					{stats.total} modules covering everything a BCFSA-licensed management company does —
					cheaper, faster, fewer errors. BCFSA trust rules built-in.
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<div class="rounded-xl bg-white border border-border px-4 py-3 text-center shadow-sm">
					<div class="text-2xl font-bold text-success">{stats.live}</div>
					<div class="text-[10px] font-bold text-slate-400 uppercase">Live</div>
				</div>
				<div class="rounded-xl bg-white border border-border px-4 py-3 text-center shadow-sm">
					<div class="text-2xl font-bold text-brand-600">{stats.beta}</div>
					<div class="text-[10px] font-bold text-slate-400 uppercase">Beta</div>
				</div>
				<div class="rounded-xl bg-white border border-border px-4 py-3 text-center shadow-sm">
					<div class="text-2xl font-bold text-slate-500">{stats.planned}</div>
					<div class="text-[10px] font-bold text-slate-400 uppercase">Planned</div>
				</div>
				<div class="rounded-xl bg-white border border-bc-blue/20 px-4 py-3 text-center shadow-sm">
					<div class="text-2xl font-bold text-bc-blue">{stats.bcfsaModules}</div>
					<div class="text-[10px] font-bold text-slate-400 uppercase">BCFSA</div>
				</div>
			</div>
		</div>

		<label class="mt-8 flex items-center gap-3 cursor-pointer">
			<div class="relative">
				<input type="checkbox" bind:checked={sovereignMode} class="sr-only peer" />
				<div class="h-7 w-14 rounded-full bg-slate-200 peer-checked:bg-bitcoin transition-colors"></div>
				<div class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow peer-checked:translate-x-7 transition-transform"></div>
			</div>
			<span class="text-sm font-semibold text-slate-700">Sovereign Mode <span class="font-normal text-slate-400">— multisig / JSON / advanced rails</span></span>
		</label>
	</div>
</section>

<!-- Domain filter -->
<div class="sticky top-[65px] z-40 border-b border-border bg-white/90 backdrop-blur-md">
	<div class="mx-auto max-w-7xl px-6 py-3 overflow-x-auto">
		<div class="flex gap-2 min-w-max">
			<button
				class="rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all
					{activeDomain === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}"
				onclick={() => (activeDomain = 'all')}
			>All ({stats.total})</button>
			{#each toolDomains as domain}
				{@const count = strataToolModules.filter((m) => m.domain === domain.id).length}
				<button
					class="rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5
						{activeDomain === domain.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
					onclick={() => (activeDomain = domain.id)}
				>
					<span>{domain.icon}</span>
					{domain.label} ({count})
				</button>
			{/each}
		</div>
	</div>
</div>

<div class="mx-auto max-w-7xl px-6 py-12">
	<!-- Module grid -->
	<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
		{#each filteredModules as mod}
			<div class="glass-card rounded-2xl p-5 hover:border-brand-200 transition-all group" class:cursor-pointer={!!mod.href} onclick={() => { if (mod.href) goto(mod.href); }}>
				<div class="flex items-start justify-between gap-2 mb-3">
					<span class="text-2xl">{mod.icon}</span>
					<div class="flex gap-1.5">
						<span class="rounded-full px-2 py-0.5 text-[10px] font-bold {statusColor(mod.status)}">{mod.status}</span>
						{#if mod.bcfsaRelevant}
							<span class="rounded-full bg-bc-blue/10 px-2 py-0.5 text-[10px] font-bold text-bc-blue">BCFSA</span>
						{/if}
					</div>
				</div>
				<h3 class="font-bold text-slate-800 group-hover:text-brand-700 transition-colors">{mod.title}</h3>
				<p class="mt-1.5 text-sm text-slate-500 leading-relaxed line-clamp-2">{mod.desc}</p>
				{#if mod.spaRef}
					<code class="mt-2 inline-block text-[10px] font-mono text-bc-blue bg-bc-blue/5 px-2 py-0.5 rounded">{mod.spaRef}</code>
				{/if}
				<ul class="mt-3 space-y-1">
					{#each mod.features.slice(0, 3) as f}
						<li class="text-xs text-slate-500 flex items-center gap-1.5"><span class="text-brand-400">✓</span>{f}</li>
					{/each}
				</ul>
				{#if mod.savings}
					<p class="mt-3 text-xs font-bold text-success">{mod.savings}</p>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Live interactive demos -->
	<h2 class="text-xl font-bold text-slate-800 mb-6">Live Interactive Demos</h2>

	<!-- Form K -->
	<section class="glass-card rounded-2xl p-8 mb-8">
		<h3 class="text-lg font-bold text-slate-800 mb-4">📋 Form K Hub</h3>
		<div class="flex gap-2 mb-4">
			{#each ['all', 'signed', 'missing'] as f}
				<button class="rounded-lg px-3 py-1.5 text-xs font-semibold {formKFilter === f ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}"
					onclick={() => (formKFilter = f as typeof formKFilter)}>{f}</button>
			{/each}
		</div>
		<div class="grid sm:grid-cols-3 gap-3">
			{#each filteredUnits as unit}
				<button class="rounded-xl border p-3 text-left {selectedUnit === unit.id ? 'border-brand-500 bg-brand-50' : 'border-border'}"
					onclick={() => (selectedUnit = selectedUnit === unit.id ? null : unit.id)}>
					<span class="font-bold">Unit {unit.id}</span>
					<span class="ml-2 text-[10px] font-bold rounded-full px-2 py-0.5 {unit.formK === 'signed' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}">{unit.formK}</span>
				</button>
			{/each}
		</div>
	</section>

	<!-- Bylaw + Conveyancing -->
	<div class="grid lg:grid-cols-2 gap-8">
		<section class="glass-card rounded-2xl p-6">
			<h3 class="font-bold text-slate-800 mb-4">⚖️ Bylaw Enforcement</h3>
			<div class="space-y-2">
				{#each bylawEnforcementWorkflow as step}
					<div class="flex items-center gap-3 rounded-lg p-3 text-sm {step.systemLock ? 'bg-danger/5 border border-danger/20' : 'bg-slate-50'}">
						<span class="font-bold text-brand-600 w-6">{step.step}</span>
						<span class="flex-1 text-slate-700">{step.title}</span>
						{#if step.systemLock}<span class="text-[10px] font-bold text-danger">🔒</span>{/if}
					</div>
				{/each}
			</div>
		</section>
		<section class="glass-card rounded-2xl p-6">
			<h3 class="font-bold text-slate-800 mb-4">📄 Forms B & F</h3>
			<div class="space-y-3">
				{#each conveyancingWorkflow as step}
					<div class="rounded-lg p-3 text-sm {step.blocking ? 'bg-danger/5 border border-danger/20' : 'bg-slate-50'}">
						<span class="font-bold text-slate-800">{step.title}</span>
						<p class="text-xs text-slate-500 mt-1">{step.action}</p>
					</div>
				{/each}
			</div>
		</section>
	</div>

	{#if sovereignMode}
		<div class="mt-8 rounded-xl bg-slate-900 p-6 text-sm font-mono text-slate-300">
			<p class="text-bitcoin font-bold mb-2">Sovereign Stack Active</p>
			<p>→ External multisig (3-of-5 PSBT) · Lightning LNURL · Satohash OTS · Nostr npub per unit</p>
			<p class="mt-2 text-slate-500">Hermes orchestrates. Never custodies. Keys on council hardware wallets.</p>
		</div>
	{/if}
</div>