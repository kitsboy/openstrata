<script lang="ts">
	import { jurisdictions } from '$lib/data';
	import { hermesPositioning } from '$lib/marketing';
	import { getToolStats } from '$lib/strata-tool';

	const stats = getToolStats();

	const phases = [
		{ id: 1, name: 'Foundation', when: 'Jul 2026', status: 'complete', items: ['Marketing site', 'Compliance KB', 'Strata Tool hub', 'Executive docs', 'About + Roadmap'] },
		{ id: 2, name: 'Supercharge', when: 'Jul–Aug 2026', status: 'current', items: ['Building template wizard', 'E-transfer prototype', 'Enhanced graphs', 'Kimi handoff'] },
		{ id: 3, name: 'Core Product', when: 'Q3 2026', status: 'planned', items: ['Docker stack (Rosa + Ziggy)', 'Trust ledger', 'Fee billing API', 'Form B/F generator', 'Bylaw state machine', 'PWA'] },
		{ id: 4, name: 'Sovereign Layer', when: 'Q4 2026', status: 'planned', items: ['Satohash integration', 'Lightning Dual Pay', 'Nostr unit identity', 'Multisig watch', 'CRT export', 'Sub-accounts'] },
		{ id: 5, name: 'Scale', when: '2027', status: 'planned', items: ['Brokerage multi-building', 'Bank feeds', 'War chest DCA', 'Agent payments', 'ON/AB law packs'] },
		{ id: 6, name: 'International', when: '2028', status: 'planned', items: ['US HOA (WA, FL, CA)', 'EU multi-language', 'OpenStrata protocol adoption'] }
	];

	const integrations = [
		{ name: 'Satohash', url: 'satohash.io', status: 'In progress', role: 'OTS proof stamping' },
		{ name: 'OpenStrata', url: 'openstrata', status: 'Spec phase', role: 'Portable identity' },
		{ name: 'Umbrel/Tailscale', url: '—', status: 'Ready', role: 'Local-first hosting' },
		{ name: 'BCFSA', url: 'bcfsa.ca', status: 'Regulator', role: 'Audit-ready exports' }
	];
</script>

<svelte:head>
	<title>Roadmap & Paths — Hermes Strata</title>
</svelte:head>

<section class="border-b border-border bg-gradient-to-b from-bc-blue/5 to-transparent">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">Roadmap & Paths</h1>
		<p class="mt-4 text-lg text-slate-600 max-w-3xl">
			Three go-to-market paths. Six development phases. Config-driven jurisdiction expansion.
		</p>
		<div class="mt-6 flex flex-wrap gap-4">
			<span class="rounded-full bg-success/10 px-4 py-1.5 text-sm font-bold text-success">{stats.live} modules live</span>
			<span class="rounded-full bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-700">{stats.beta} in beta</span>
			<span class="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-bold text-slate-600">{stats.planned} planned</span>
			<span class="rounded-full bg-bc-blue/10 px-4 py-1.5 text-sm font-bold text-bc-blue">{stats.bcfsaModules} BCFSA-relevant</span>
		</div>
	</div>
</section>

<!-- GTM Paths -->
<section class="mx-auto max-w-7xl px-6 py-14">
	<h2 class="text-2xl font-bold text-slate-900 mb-8">Go-To-Market Paths</h2>
	<div class="grid md:grid-cols-3 gap-6">
		{#each hermesPositioning.paths as path, i}
			<div class="glass-card rounded-2xl p-6 relative overflow-hidden">
				<div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-100 to-transparent rounded-bl-full"></div>
				<span class="text-4xl font-bold text-brand-200">{i + 1}</span>
				<h3 class="font-bold text-slate-800 text-lg mt-2">{path.title}</h3>
				<p class="mt-2 text-sm text-slate-600">{path.desc}</p>
				<span class="mt-4 inline-block text-xs font-bold text-brand-700">{path.legal}</span>
			</div>
		{/each}
	</div>
</section>

<!-- Timeline -->
<section class="border-y border-border bg-white">
	<div class="mx-auto max-w-7xl px-6 py-14">
		<h2 class="text-2xl font-bold text-slate-900 mb-10">Development Timeline</h2>
		<div class="space-y-6">
			{#each phases as phase}
				<div class="flex gap-6 items-start">
					<div class="flex flex-col items-center shrink-0">
						<div class="flex h-12 w-12 items-center justify-center rounded-full font-bold text-sm
							{phase.status === 'complete' ? 'bg-success text-white' :
							 phase.status === 'current' ? 'bg-brand-600 text-white ring-4 ring-brand-200' :
							 'bg-slate-200 text-slate-500'}">
							{phase.id}
						</div>
					</div>
					<div class="glass-card rounded-xl p-5 flex-1">
						<div class="flex flex-wrap items-center gap-3 mb-2">
							<h3 class="font-bold text-slate-800">{phase.name}</h3>
							<span class="text-sm text-slate-400">{phase.when}</span>
							<span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase
								{phase.status === 'complete' ? 'bg-success/10 text-success' :
								 phase.status === 'current' ? 'bg-brand-100 text-brand-700' :
								 'bg-slate-100 text-slate-500'}">
								{phase.status}
							</span>
						</div>
						<div class="flex flex-wrap gap-2">
							{#each phase.items as item}
								<span class="rounded-lg bg-slate-50 border border-border px-3 py-1 text-xs text-slate-600">{item}</span>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Jurisdictions -->
<section class="mx-auto max-w-7xl px-6 py-14">
	<h2 class="text-2xl font-bold text-slate-900 mb-8">Jurisdiction Expansion</h2>
	<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each jurisdictions as j, i}
			<div class="glass-card rounded-xl p-5 flex items-center justify-between {j.active ? 'border-brand-200' : 'opacity-70'}">
				<div class="flex items-center gap-3">
					<span class="text-2xl">{j.flag}</span>
					<div>
						<span class="font-semibold text-slate-800">{j.name}</span>
						<p class="text-xs text-slate-400">{j.laws.join(' · ')}</p>
					</div>
				</div>
				<span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold
					{j.active ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}">
					{j.active ? 'LIVE' : `Phase ${Math.min(i + 3, 6)}`}
				</span>
			</div>
		{/each}
	</div>
</section>

<!-- Integrations -->
<section class="border-t border-border bg-slate-50">
	<div class="mx-auto max-w-7xl px-6 py-14">
		<h2 class="text-2xl font-bold text-slate-900 mb-8">Ecosystem Integrations</h2>
		<div class="grid sm:grid-cols-2 gap-4">
			{#each integrations as int}
				<div class="glass-card rounded-xl p-5 flex items-center justify-between">
					<div>
						<span class="font-bold text-slate-800">{int.name}</span>
						<p class="text-sm text-slate-500">{int.role}</p>
					</div>
					<span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{int.status}</span>
				</div>
			{/each}
		</div>
	</div>
</section>