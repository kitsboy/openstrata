<script lang="ts">
	import { units } from '$lib/data';
	import { bylawEnforcementWorkflow, conveyancingWorkflow } from '$lib/compliance';
	import Icon from '$lib/components/Icon.svelte';

	let sovereignMode = $state(false);
	let formKFilter = $state<'all' | 'signed' | 'missing'>('all');
	let eprKw = $state(450);
	let evCap = $state(35);
	let selectedUnit = $state<string | null>(null);

	const filteredUnits = $derived(
		formKFilter === 'all'
			? units
			: units.filter((u) => u.formK === formKFilter)
	);

	const eprDaysLeft = $derived(Math.ceil((new Date('2026-12-31').getTime() - Date.now()) / 86400000));
	const eprProgress = $derived(Math.min(100, Math.round(((450 - eprKw) / 450) * 100 + 40)));
	const evBreach = $derived(evCap > 40);
</script>

<svelte:head>
	<title>Strata Tools — Hermes Strata</title>
</svelte:head>

<section class="border-b border-border bg-gradient-to-b from-bc-green/5 to-transparent">
	<div class="mx-auto max-w-7xl px-6 py-14">
		<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">Strata Tools</h1>
		<p class="mt-3 text-lg text-slate-600">BC MVP modules — tap any unit for the bottom-sheet action flow</p>

		<div class="mt-6 flex items-center gap-4">
			<label class="flex items-center gap-3 cursor-pointer">
				<div class="relative">
					<input type="checkbox" bind:checked={sovereignMode} class="sr-only peer" />
					<div class="h-7 w-14 rounded-full bg-slate-200 peer-checked:bg-bitcoin transition-colors"></div>
					<div class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow peer-checked:translate-x-7 transition-transform"></div>
				</div>
				<span class="text-sm font-semibold text-slate-700">
					Sovereign Mode
					<span class="font-normal text-slate-400">— reveal multisig / JSON</span>
				</span>
			</label>
		</div>
	</div>
</section>

<div class="mx-auto max-w-7xl px-6 py-12 space-y-12">
	<!-- Form K Hub -->
	<section class="glass-card rounded-2xl p-8">
		<div class="flex items-start justify-between flex-wrap gap-4 mb-6">
			<div>
				<h2 class="text-xl font-bold text-slate-800">📋 Form K Hub</h2>
				<p class="text-sm text-slate-500">SPA §146 — Signed/Missing toggle, CSV occupants, evacuation manifest</p>
			</div>
			<div class="flex gap-2">
				{#each ['all', 'signed', 'missing'] as f}
					<button
						class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all
							{formKFilter === f ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}"
						onclick={() => (formKFilter = f as typeof formKFilter)}
					>
						{f}
					</button>
				{/each}
			</div>
		</div>

		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
			{#each filteredUnits as unit}
				<button
					class="rounded-xl border p-4 text-left transition-all hover:border-brand-300 hover:shadow-md
						{selectedUnit === unit.id ? 'border-brand-500 bg-brand-50' : 'border-border bg-white'}"
					onclick={() => (selectedUnit = selectedUnit === unit.id ? null : unit.id)}
				>
					<div class="flex justify-between items-center">
						<span class="font-bold text-slate-800">Unit {unit.id}</span>
						<span class="rounded-full px-2 py-0.5 text-[10px] font-bold
							{unit.formK === 'signed' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}">
							{unit.formK}
						</span>
					</div>
					{#if unit.tenant}
						<p class="text-xs text-slate-500 mt-1">{unit.tenant}</p>
					{/if}
				</button>
			{/each}
		</div>

		{#if selectedUnit}
			<div class="mt-6 rounded-xl bg-slate-50 border border-border p-5 animate-slide-up">
				<h3 class="font-semibold text-slate-800">Unit {selectedUnit} — Actions</h3>
				<div class="mt-3 flex flex-wrap gap-2">
					<button class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Toggle Form K</button>
					<button class="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700">Rosa 14-day Remind</button>
					<button class="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700">Export CSV</button>
				</div>
				{#if sovereignMode}
					<pre class="mt-4 rounded-lg bg-slate-900 text-xs text-brand-300 p-3 font-mono overflow-x-auto">{JSON.stringify(units.find(u => u.id === selectedUnit), null, 2)}</pre>
				{/if}
			</div>
		{/if}
	</section>

	<!-- EPR 2026 Monitor -->
	<section class="glass-card rounded-2xl p-8">
		<h2 class="text-xl font-bold text-slate-800 mb-1">⚡ EPR 2026 Monitor</h2>
		<p class="text-sm text-slate-500 mb-6">Metro Vancouver mandatory · Deadline Dec 31, 2026 · {eprDaysLeft} days remaining</p>

		<div class="grid lg:grid-cols-2 gap-8">
			<div class="space-y-5">
				<div>
					<label class="text-sm font-semibold text-slate-700">Professional Credentials</label>
					<select class="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm">
						<option>PEng — Professional Engineer</option>
						<option>Technologist</option>
						<option>Technician</option>
					</select>
				</div>
				<div>
					<label class="text-sm font-semibold text-slate-700">kW Capacity: {eprKw}</label>
					<input type="range" min="100" max="800" bind:value={eprKw} class="mt-2 w-full accent-brand-600" />
				</div>
				<div>
					<label class="text-sm font-semibold text-slate-700">EV Charger Load %: {evCap}%</label>
					<input type="range" min="0" max="60" bind:value={evCap} class="mt-2 w-full accent-amber-500" />
					{#if evBreach}
						<p class="mt-2 text-sm text-danger font-semibold">⚠ Breach alert — load-share suggestion available</p>
					{/if}
				</div>
			</div>

			<div class="flex flex-col items-center justify-center">
				<div class="relative h-40 w-40">
					<svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
						<circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" stroke-width="8"/>
						<circle cx="50" cy="50" r="42" fill="none" stroke="#14b8a6" stroke-width="8"
							stroke-dasharray="{eprProgress * 2.64} 264"
							stroke-linecap="round"
							class="transition-all duration-700"
						/>
					</svg>
					<div class="absolute inset-0 flex flex-col items-center justify-center">
						<span class="text-3xl font-bold text-slate-800">{eprProgress}%</span>
						<span class="text-xs text-slate-400">Complete</span>
					</div>
				</div>
				<p class="mt-4 text-sm text-slate-500 text-center">Visual progress to 2026-12-31 deadline</p>
			</div>
		</div>
	</section>

	<!-- Dual Pay -->
	<section class="glass-card rounded-2xl p-8">
		<h2 class="text-xl font-bold text-slate-800 mb-1">💳 Dual Pay Treasury</h2>
		<p class="text-sm text-slate-500 mb-6">E-transfer upload OR Sovereign Instant Lightning · 15-min CAD rate lock</p>

		<div class="grid sm:grid-cols-2 gap-6">
			<div class="rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-brand-300 transition-colors cursor-pointer">
				<div class="text-3xl mb-3">🏦</div>
				<h3 class="font-semibold text-slate-800">Fiat — E-Transfer</h3>
				<p class="text-sm text-slate-500 mt-1">Upload proof · Council approve · CAD ledger</p>
			</div>
			<div class="rounded-xl border-2 border-bitcoin/30 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center hover:border-bitcoin/50 transition-colors cursor-pointer">
				<div class="flex justify-center gap-2 mb-3">
					<Icon name="bitcoin" class="h-8 w-8 text-bitcoin" />
					<Icon name="lightning" class="h-8 w-8 text-lightning" />
				</div>
				<h3 class="font-semibold text-slate-800">Sovereign Instant</h3>
				<p class="text-sm text-slate-500 mt-1">Lightning QR · LNURL · 15-min rate lock</p>
			</div>
		</div>

		{#if sovereignMode}
			<div class="mt-6 rounded-xl bg-slate-900 p-5 text-sm font-mono text-slate-300">
				<p class="text-bitcoin font-bold mb-2">PSBT Workflow (3-of-5 Multisig)</p>
				<p>1. Ziggy parses invoice → CRF 10% cap check</p>
				<p>2. Generate PSBT → notify council via Matrix</p>
				<p>3. Collect 3 signatures → broadcast → auto reconcile</p>
			</div>
		{/if}
	</section>

	<!-- Bylaw Enforcement -->
	<section class="glass-card rounded-2xl p-8">
		<div class="flex items-start justify-between flex-wrap gap-4 mb-6">
			<div>
				<h2 class="text-xl font-bold text-slate-800">⚖️ Bylaw Enforcement Engine</h2>
				<p class="text-sm text-slate-500">CRT-proof workflow — system locks fine actions for 14 days minimum</p>
			</div>
			<a href="/compliance" class="text-sm font-semibold text-brand-600 no-underline hover:text-brand-700">Full reference →</a>
		</div>
		<div class="grid sm:grid-cols-5 gap-3">
			{#each bylawEnforcementWorkflow as step}
				<div class="rounded-xl border p-4 text-center {step.systemLock ? 'border-danger/30 bg-danger/5' : 'border-border bg-white'}">
					<div class="text-lg font-bold text-brand-600">{step.step}</div>
					<p class="text-[10px] font-bold text-slate-400 mt-1">{step.day}</p>
					<p class="text-xs font-semibold text-slate-700 mt-2 leading-snug">{step.title}</p>
					{#if step.systemLock}
						<span class="mt-2 inline-block rounded-full bg-danger/10 px-2 py-0.5 text-[9px] font-bold text-danger">🔒 LOCK</span>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<!-- Forms B & F -->
	<section class="glass-card rounded-2xl p-8">
		<h2 class="text-xl font-bold text-slate-800 mb-1">📄 Forms B & F — Conveyancing</h2>
		<p class="text-sm text-slate-500 mb-6">Sale blocked when unit balance &gt; $0. Form B due within 7 days of request.</p>
		<div class="space-y-4">
			{#each conveyancingWorkflow as step}
				<div class="flex items-center gap-4 rounded-xl border border-border p-4 {step.blocking ? 'bg-danger/5 border-danger/20' : 'bg-white'}">
					<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bc-blue/10 text-bc-blue font-bold">{step.step}</span>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							{#if step.form}<span class="rounded-full bg-bc-blue text-white px-2 py-0.5 text-[10px] font-bold">{step.form}</span>{/if}
							<span class="font-semibold text-slate-800 text-sm">{step.title}</span>
						</div>
						<p class="text-xs text-slate-500 mt-1">{step.action}</p>
					</div>
					{#if step.deadline}
						<span class="shrink-0 text-[10px] font-bold text-warning">⏱ 7 days</span>
					{/if}
				</div>
			{/each}
		</div>
	</section>
</div>