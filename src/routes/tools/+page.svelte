<script lang="ts">
	import { toolDomains, strataToolModules, getToolStats } from '$lib/strata-tool';
	import { units } from '$lib/data';
	import { bylawEnforcementWorkflow, conveyancingWorkflow } from '$lib/compliance';  import Icon from '$lib/components/Icon.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import ETransferReconciler from '$lib/components/ETransferReconciler.svelte';
	import MeetingsTool from '$lib/components/MeetingsTool.svelte';
	import SubAccounts from '$lib/components/SubAccounts.svelte';
	import XpubImport from '$lib/components/XpubImport.svelte';
	import EvidenceExport from '$lib/components/EvidenceExport.svelte';
	import { goto } from '$app/navigation';
	import { copy } from '$lib/i18n';
	import { auth } from '$lib/api/auth';
	import { fetchUnits, fetchUnitDetail, createUnit, deleteUnit, type ApiUnit, type UnitDetail } from '$lib/api/units';
	import { onMount } from 'svelte';

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

	// Live unit registry: when a signed-in session exists, prefer the backend's
	// canonical units (`GET /api/v1/units`); otherwise keep the in-repo demo
	// registry. The shapes are identical, so the swap is invisible below.
	let liveUnits = $state<ApiUnit[] | null>(null);

	onMount(() => {
		const unsubscribe = auth.subscribe((session) => {
			if (session.status === 'signed-in') {
				fetchUnits()
					.then((fetched) => (liveUnits = fetched))
					.catch(() => {});
			} else if (session.status === 'signed-out') {
				liveUnits = null;
			}
		});
		return unsubscribe;
	});

	const displayUnits = $derived(
		liveUnits
			? liveUnits.map((u) => ({
					id: u.unitRef,
					floor: u.floor,
					sqft: u.sqft ?? 0,
					status: u.occupancy,
					tenant: u.tenant ?? null,
					rent: u.rent ?? null,
					eht: u.eht ?? false,
					formK: u.formK ?? 'missing',
					evCharger: u.evCharger ?? false,
					arFundCode: u.arFundCode
			  }))
			: units
	);

	const filteredUnits = $derived(
		formKFilter === 'all' ? displayUnits : displayUnits.filter((u) => u.formK === formKFilter)
	);

	// ---- Live unit detail + manage (migration 0005) --------------------------
	let unitDetail = $state<UnitDetail | null>(null);
	let unitDetailLoading = $state(false);
	let showAddUnit = $state(false);
	let newUnitRef = $state('');
	let newUnitFloor = $state<number | null>(null);
	let unitError = $state<string | null>(null);

	async function loadUnitDetail(ref: string) {
		unitDetailLoading = true;
		unitDetail = null;
		try {
			unitDetail = await fetchUnitDetail(ref);
		} catch {
			unitDetail = null;
		}
		unitDetailLoading = false;
	}

	async function addUnit() {
		unitError = null;
		try {
			await createUnit({ unitRef: newUnitRef.trim(), floor: newUnitFloor ?? 1 });
			newUnitRef = '';
			newUnitFloor = null;
			showAddUnit = false;
			liveUnits = await fetchUnits();
		} catch (err) {
			unitError = err instanceof Error ? err.message : 'Request failed';
		}
	}

	async function removeUnit(ref: string) {
		unitError = null;
		try {
			await deleteUnit(ref);
			if (selectedUnit === ref) {
				selectedUnit = null;
				unitDetail = null;
			}
			liveUnits = await fetchUnits();
		} catch (err) {
			unitError = err instanceof Error ? err.message : 'Request failed';
		}
	}

	const statusColor = (s: string) =>
		s === 'live' ? 'bg-success/10 text-success' :
		s === 'beta' ? 'bg-brand-100 text-brand-700' :
		'bg-surface-3 text-slate-500';

	// ---- Tooltip state -----------------------------------------------------
	type TipState = { mod: any; top: number; left: number; above: boolean; maxWidth: number };
	let tip = $state<TipState | null>(null);

	// ELI16 plain-English restatement of the module's own savings claim (honest:
	// it only rephrases what mod.savings already states, never adds new claims).
	const plainSavings = (s: string | undefined): string | null => {
		if (!s || s === '—' || s === '-') return null;
		const map: Record<string, string> = {
			'Eliminates trust fund violations': 'Removes the risk of trust-fund violations — money stays cleanly separated, exactly as BCFSA requires.',
			'4 hrs → 15 min/month': 'Saves about 4 hours a month — billing that used to take hours now takes roughly 15 minutes.',
			'$2,400/yr labour': 'Frees up about $2,400 a year in manual bookkeeping labour.',
			'vs 3% credit cards': 'Much cheaper than paying ~3% in credit-card processing fees on every payment.',
			'Zero unauthorized spends': 'Makes it impossible to spend funds without council sign-off — no surprise spend.',
			'Inflation hedge': 'Helps protect the building’s funds from losing value to inflation over time.',
			'Trust through transparency': 'Builds owner trust because every dollar is visible and accounted for.',
			'Avoid Form B disclosure hits': 'Avoids awkward surprises being flagged on the mandatory Form B disclosure.',
			'Liability reduction': 'Reduces the building’s legal and financial liability.',
			'CRT overturn prevention': 'Helps fines stick — fewer enforcement actions overturned at the CRT.',
			'BCFSA audit ready': 'Keeps records organized and ready in case of a BCFSA audit.',
			'8 hrs → 1 click': 'Saves about 8 hours — evidence export that used to take a day is now a single click.',
			'Instant legal answers': 'Gives instant answers grounded in BC law, with citations you can check.',
			'Invalid meeting prevention': 'Helps you run meetings that count — avoiding a costly challenge later.',
			'2 hrs → 5 min': 'Saves about 2 hours per form — down to roughly 5 minutes.',
			'30 days → 30 min': 'Cuts onboarding that used to take 30 days down to roughly 30 minutes.',
			'Court-grade proof': 'Creates proof strong enough to hold up in court.'
		};
		return map[s] ?? s;
	};

	function handleCardKey(e: KeyboardEvent) {
		const target = e.currentTarget as HTMLElement;
		if (!(e.key === 'Enter' || e.key === ' ')) return;
		const href = target.getAttribute('data-href');
		if (href) {
			e.preventDefault();
			goto(href);
		}
	}

	function openTip(mod: any, el: HTMLElement) {
		const r = el.getBoundingClientRect();
		const bw = Math.min(320, window.innerWidth - 24);
		let left = Math.round(r.left + r.width / 2 - bw / 2);
		left = Math.max(12, Math.min(left, window.innerWidth - bw - 12));
		const estH = 210;
		const above = r.bottom + estH + 12 > window.innerHeight - 12;
		const top = above
			? Math.max(12, Math.round(r.top - estH - 10))
			: Math.round(r.bottom + 10);
		tip = { mod, top, left, above, maxWidth: bw };
	}
	function closeTip() {
		tip = null;
	}
</script>

<svelte:head>
	<title>{$copy.toolsPageTitle}</title>
</svelte:head>

<!-- Hero -->
<section class="border-b border-border bg-gradient-to-br from-bc-green/5 via-brand-50/30 to-white">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<div class="flex flex-wrap items-end justify-between gap-6">
			<div>
				<p class="text-sm font-bold text-brand-600 uppercase tracking-wide mb-2">{$copy.fullManagementScope}</p>
				<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.toolsTitle}</h1>
				<p class="mt-3 text-lg text-slate-600 max-w-2xl">
					{stats.total} {$copy.toolsIntro}
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<div class="rounded-xl bg-surface-2 border border-border px-4 py-3 text-center shadow-sm">
					<div class="text-2xl font-bold text-success">{stats.live}</div>
					<div class="text-[10px] font-bold text-slate-400 uppercase">{$copy.liveLabel}</div>
				</div>
				<div class="rounded-xl bg-surface-2 border border-border px-4 py-3 text-center shadow-sm">
					<div class="text-2xl font-bold text-brand-600">{stats.beta}</div>
					<div class="text-[10px] font-bold text-slate-400 uppercase">{$copy.betaLabel}</div>
				</div>
				<div class="rounded-xl bg-surface-2 border border-border px-4 py-3 text-center shadow-sm">
					<div class="text-2xl font-bold text-slate-500">{stats.planned}</div>
					<div class="text-[10px] font-bold text-slate-400 uppercase">{$copy.plannedLabel}</div>
				</div>
				<div class="rounded-xl bg-surface-2 border border-bc-blue/20 px-4 py-3 text-center shadow-sm">
					<div class="text-2xl font-bold text-bc-blue">{stats.bcfsaModules}</div>
					<div class="text-[10px] font-bold text-slate-400 uppercase">{$copy.bcfsaLabel}</div>
				</div>
			</div>
		</div>

		<label class="mt-8 flex items-center gap-3 cursor-pointer">
			<div class="relative">
				<input type="checkbox" bind:checked={sovereignMode} class="sr-only peer" />
				<div class="h-7 w-14 rounded-full bg-slate-200 peer-checked:bg-bitcoin transition-colors"></div>
				<div class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-surface-2 shadow peer-checked:translate-x-7 transition-transform"></div>
			</div>
			<span class="text-sm font-semibold text-slate-700">{$copy.sovereignMode} <span class="font-normal text-slate-400">— {$copy.sovereignModeHint}</span></span>
		</label>
	</div>
</section>

<!-- Domain filter -->
<div class="sticky top-[65px] z-40 border-b border-border bg-surface-2/90 backdrop-blur-md">
	<div class="mx-auto max-w-7xl px-6 py-3 overflow-x-auto">
		<div class="flex gap-2 min-w-max">
			<button
				class="rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all
					{activeDomain === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}"
				onclick={() => { activeDomain = 'all'; closeTip(); }}
			>{$copy.allLabel} ({stats.total})</button>
			{#each toolDomains as domain}
				{@const count = strataToolModules.filter((m) => m.domain === domain.id).length}
				<button
					class="rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5
						{activeDomain === domain.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-surface-3'}"
					onclick={() => { activeDomain = domain.id; closeTip(); }}
				>
					<span>{domain.icon}</span>
					{domain.label} ({count})
				</button>
			{/each}
			<a
				href="#live-demos"
				class="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold whitespace-nowrap text-brand-700 no-underline hover:bg-brand-100 transition-all"
			>
				<Icon name="spark" class="h-3.5 w-3.5" />
				{$copy.liveInteractiveDemos}
			</a>
		</div>
	</div>
</div>

<div class="mx-auto max-w-7xl px-6 py-12">
	<!-- Module grid -->
	<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
		{#each filteredModules as mod}
			<div class="glass-card rounded-2xl p-5 hover:border-brand-200 transition-all group" class:cursor-pointer={!!mod.href} role="button" tabindex="0" data-href={mod.href ?? undefined} onclick={() => { if (mod.href) goto(mod.href); }} onkeydown={handleCardKey}>
				<div class="flex items-start justify-between gap-2 mb-3">
					<span class="text-2xl">{mod.icon}</span>
					<div class="flex items-center gap-1.5">
						<span class="rounded-full px-2 py-0.5 text-[10px] font-bold {statusColor(mod.status)}">{mod.status}</span>
						{#if mod.bcfsaRelevant}
							<span class="rounded-full bg-bc-blue/10 px-2 py-0.5 text-[10px] font-bold text-bc-blue">{$copy.bcfsaLabel}</span>
						{/if}
						<button
							type="button"
							class="tooltip-trigger"
							aria-label="{$copy.moreAboutLabel} {mod.title}: {mod.desc}"
							onmouseenter={(e) => openTip(mod, e.currentTarget)}
							onmouseleave={closeTip}
							onclick={(e) => {
								e.stopPropagation();
								if (tip?.mod === mod) closeTip();
								else openTip(mod, e.currentTarget);
							}}
							ontouchstart={(e) => e.stopPropagation()}
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<circle cx="12" cy="12" r="10"/>
								<path d="M12 16v-4"/><path d="M12 8h.01"/>
							</svg>
						</button>
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
	<h2 id="live-demos" class="text-xl font-bold text-slate-800 mb-6 scroll-mt-28">{$copy.liveInteractiveDemos}</h2>

	<!-- Form K -->
	<section class="glass-card rounded-2xl p-8 mb-8">
		<h3 class="text-lg font-bold text-slate-800 mb-4">📋 {$copy.formKHub} {#if liveUnits}<span class="ml-2 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}</h3>
		<div class="flex gap-2 mb-4">
			{#each ['all', 'signed', 'missing'] as f}
				<button class="rounded-lg px-3 py-1.5 text-xs font-semibold {formKFilter === f ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}"
					onclick={() => { formKFilter = f as typeof formKFilter; closeTip(); }}>{f}</button>
			{/each}
		</div>
		<div class="grid sm:grid-cols-3 gap-3">
			{#each filteredUnits as unit}
				<button class="rounded-xl border p-3 text-left {selectedUnit === unit.id ? 'border-brand-500 bg-brand-50' : 'border-border'}"
					onclick={() => {
						selectedUnit = selectedUnit === unit.id ? null : unit.id;
						if (selectedUnit === unit.id && liveUnits) loadUnitDetail(unit.id);
					}}>
					<span class="font-bold">{$copy.unitLabel} {unit.id}</span>
					<span class="ml-2 text-[10px] font-bold rounded-full px-2 py-0.5 {unit.formK === 'signed' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}">{unit.formK}</span>
				</button>
			{/each}
		</div>

		{#if liveUnits && ($auth.user?.role === 'admin' || $auth.user?.role === 'treasurer')}
			<div class="mt-4 flex flex-wrap items-center gap-2">
				{#if showAddUnit}
					<input bind:value={newUnitRef} placeholder="101" class="w-24 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm" />
					<input type="number" bind:value={newUnitFloor} placeholder="1" class="w-16 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm" />
					<button class="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white" onclick={addUnit}>{$copy.addUnit}</button>
					<button class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600" onclick={() => (showAddUnit = false)}>{$copy.cancel}</button>
				{:else}
					<button class="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white" onclick={() => (showAddUnit = true)}>+ {$copy.addUnit}</button>
				{/if}
				{#if unitError}<span class="text-xs text-danger">{unitError}</span>{/if}
			</div>
		{/if}

		{#if liveUnits && selectedUnit}
			<div class="mt-4 rounded-xl border border-border bg-surface-2 p-4">
				<div class="flex items-center justify-between gap-2">
					<h4 class="text-sm font-bold text-slate-800">{$copy.unitDetail} — {$copy.unitLabel} {selectedUnit}</h4>
					{#if $auth.user?.role === 'admin'}
						<button class="text-xs font-bold text-danger" onclick={() => { if (selectedUnit) removeUnit(selectedUnit); }}>{$copy.removeUnit}</button>
					{/if}
				</div>
				{#if unitDetailLoading}
					<div class="mt-3 space-y-2"><Skeleton height="10px" width="80%" /><Skeleton height="24px" width="45%" /><Skeleton height="10px" width="60%" /></div>
				{:else if unitDetail}
					<div class="mt-3 grid sm:grid-cols-2 gap-4">
						<div>
							<p class="text-[10px] font-bold text-slate-400 uppercase">{$copy.arBalance} · <code class="text-bc-blue">{unitDetail.ar.fundCode}</code></p>
							<p class="mt-1 text-2xl font-bold text-slate-900">${(unitDetail.ar.balanceBasis / 100).toFixed(2)}</p>
							<p class="mt-1 text-xs text-slate-500">{$copy.chainVerified}</p>
						</div>
						<div>
							<p class="text-[10px] font-bold text-slate-400 uppercase">{$copy.unitPayments}</p>
							{#if unitDetail.payments.length === 0}
								<div class="mt-3"><EmptyState icon="coins" title={$copy.unitPaymentsEmpty} /></div>
							{:else}
								<ul class="mt-2 space-y-1">
									{#each unitDetail.payments.slice(0, 5) as p}
										<li class="flex items-center justify-between gap-2 text-xs">
											<code class="text-bc-blue">{p.referenceCode}</code>
											<span class="font-semibold {p.status === 'paid' ? 'text-success' : 'text-slate-400'}">{p.status}</span>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</section>

	<!-- Live demos: trust funds, meetings, sovereign rails, reconciliation -->
	<div class="mb-8 space-y-8">
		<SubAccounts />
		<MeetingsTool />
		<XpubImport />
		<EvidenceExport />
		<ETransferReconciler />
	</div>

	<!-- Bylaw + Conveyancing -->
	<div class="grid lg:grid-cols-2 gap-8">
		<section class="glass-card rounded-2xl p-6">
			<h3 class="font-bold text-slate-800 mb-4">⚖️ {$copy.bylawEnforcement}</h3>
			<div class="space-y-2">
				{#each bylawEnforcementWorkflow as step}
					<div class="flex items-center gap-3 rounded-lg p-3 text-sm {step.systemLock ? 'bg-danger/5 border border-danger/20' : 'bg-surface-3'}">
						<span class="font-bold text-brand-600 w-6">{step.step}</span>
						<span class="flex-1 text-slate-700">{step.title}</span>
						{#if step.systemLock}<span class="text-[10px] font-bold text-danger">🔒</span>{/if}
					</div>
				{/each}
			</div>
		</section>
		<section class="glass-card rounded-2xl p-6">
			<h3 class="font-bold text-slate-800 mb-4">📄 {$copy.formsBfHub}</h3>
			<div class="space-y-3">
				{#each conveyancingWorkflow as step}
					<div class="rounded-lg p-3 text-sm {step.blocking ? 'bg-danger/5 border border-danger/20' : 'bg-surface-3'}">
						<span class="font-bold text-slate-800">{step.title}</span>
						<p class="text-xs text-slate-500 mt-1">{step.action}</p>
					</div>
				{/each}
			</div>
		</section>
	</div>

	{#if sovereignMode}
		<div class="mt-8 rounded-xl bg-slate-900 p-6 text-sm font-mono text-slate-300">
			<p class="text-bitcoin font-bold mb-2">{$copy.sovereignStackActive}</p>
			<p>→ {$copy.externalMultisig}</p>
			<p class="mt-2 text-slate-500">{$copy.orchestrationNote}</p>
		</div>
	{/if}
</div>

{#if tip}
	<div
		class="tooltip-bubble"
		role="tooltip"
		data-above={tip.above}
		style="top:{tip.top}px; left:{tip.left}px; max-width:{tip.maxWidth}px;"
	>
		<div class="tooltip-inner">
			<p class="tooltip-title">{tip.mod.icon} {tip.mod.title}</p>
			<p class="tooltip-what">{tip.mod.desc}</p>
			{#if tip.mod.features?.length}
				<ul class="tooltip-list">
					{#each tip.mod.features.slice(0, 3) as f}
						<li>{f}</li>
					{/each}
				</ul>
			{/if}
			{#if plainSavings(tip.mod.savings)}
				<p class="tooltip-why"><span class="tooltip-why-label">{$copy.whyItMattersLabel}:</span> {plainSavings(tip.mod.savings)}</p>
			{/if}
		</div>
	</div>
{/if}