<script lang="ts">
	import { jurisdictions } from '$lib/data';
	import Icon from '$lib/components/Icon.svelte';
	import { copy } from '$lib/i18n';
	import packageJson from '../../../../package.json';

	// State
	let step = $state(0);
	let completed = $state(false);
	let configJson = $state('');

	// Step 1 — Jurisdiction
	let jurisdiction = $state('BC');

	// Step 2 — Entity & Address
	let corpName = $state('');
	let address = $state('');
	let fiscalYearStart = $state('January');
	let bcfsaLicense = $state('');
	let isSelfManaged = $state(true);

	// Step 3 — Physical
	let unitCount = $state(10);
	let units = $state<Array<{ id: string; sqft: number; parking: boolean; storage: boolean; ev: boolean }>>([]);
	let defaultSqft = $state(900);

	const regenerateUnits = () => {
		units = Array.from({ length: unitCount }, (_, i) => ({
			id: String(i + 101),
			sqft: defaultSqft + Math.floor(Math.random() * 400) - 200,
			parking: i < Math.ceil(unitCount * 0.8),
			storage: i < Math.ceil(unitCount * 0.6),
			ev: i < Math.ceil(unitCount * 0.15)
		}));
	};

	$effect(() => { regenerateUnits(); });

	const removeUnit = (id: string) => {
		units = units.filter(u => u.id !== id);
		unitCount = units.length;
	};

	const addUnit = () => {
		const nextNum = units.length + 101;
		units = [...units, { id: String(nextNum), sqft: defaultSqft, parking: true, storage: Math.random() > 0.5, ev: false }];
		unitCount = units.length;
	};

	// Step 4 — Funds
	let operatingBank = $state('Vancouver Credit Union');
	let crfBank = $state('Vancouver Credit Union \u2014 CRF Trust');
	let crfPct = $state(10);
	let subAccounts = $state<Array<{ name: string; enabled: boolean; icon: string }>>([
		{ name: 'Pool Maintenance', enabled: false, icon: '\u{1F3CA}' },
		{ name: 'Garden Committee', enabled: false, icon: '\u{1F33F}' },
		{ name: 'EV Charger Fund', enabled: false, icon: '\u{1F50C}' },
		{ name: 'BTC War Chest', enabled: false, icon: '\u20BF' },
		{ name: 'Snow Removal', enabled: false, icon: '\u2744\uFE0F' },
		{ name: 'Security & Gate', enabled: false, icon: '\u{1F6E1}\uFE0F' }
	]);

	const enabledSubAccounts = $derived(subAccounts.filter(s => s.enabled));

	// Step 5 — Services
	const availableServices = [
		{ id: 'landscaping', label: 'Landscaping & Grounds', icon: '\u{1F333}' },
		{ id: 'cleaning', label: 'Common Area Cleaning', icon: '\u{1F9F9}' },
		{ id: 'insurance', label: 'Strata Insurance', icon: '\u{1F6E1}\uFE0F' },
		{ id: 'depreciation', label: 'Depreciation Reports', icon: '\u{1F4CA}' },
		{ id: 'snow', label: 'Snow Removal', icon: '\u2744\uFE0F' },
		{ id: 'security', label: 'Security & Access', icon: '\u{1F510}' },
		{ id: 'waste', label: 'Waste Management', icon: '\u267B\uFE0F' },
		{ id: 'elevator', label: 'Elevator Maintenance', icon: '\u{1F6D7}' },
		{ id: 'fire', label: 'Fire Safety & Inspections', icon: '\u{1F525}' },
		{ id: 'epr', label: 'EPR 2026 Compliance', icon: '\u26A1' }
	];
	let selectedServices = $state<string[]>(['insurance', 'depreciation', 'fire']);

	const toggleService = (id: string) => {
		if (selectedServices.includes(id)) {
			selectedServices = selectedServices.filter(s => s !== id);
		} else {
			selectedServices = [...selectedServices, id];
		}
	};

	// Step 6 — Payment Rails
	let paymentRails = $state<Array<{ id: string; label: string; icon: string; enabled: boolean; desc: string }>>([
		{ id: 'etransfer', label: 'E-Transfer', icon: '\u{1F4B8}', enabled: true, desc: 'Auto-reconciliation with reference codes' },
		{ id: 'pad', label: 'Pre-Authorized Debit', icon: '\u{1F3E6}', enabled: true, desc: 'Monthly PAD from owner bank accounts' },
		{ id: 'cheque', label: 'Manual Cheque Entry', icon: '\u{1F4DD}', enabled: true, desc: 'Legacy cheque tracking with photo upload' },
		{ id: 'lightning', label: 'Lightning Instant Pay', icon: '\u26A1', enabled: false, desc: 'LNURL QR with 15-min CAD rate lock' },
		{ id: 'onchain', label: 'On-Chain BTC', icon: '\u20BF', enabled: false, desc: 'L1 for large CRF moves \u2014 advanced' }
	]);

	const enabledRails = $derived(paymentRails.filter(r => r.enabled));

	// Step 7 — Bylaws
	let bylawChoice = $state<'standard' | 'import'>('standard');

	// Step 8 — Review & Generate
	const generateConfig = () => {
		const config = {
			meta: { generated: new Date().toISOString(), version: packageJson.version },
			jurisdiction,
			entity: {
				name: corpName || 'Unnamed Strata Corporation',
				fiscalYearStart,
				...(isSelfManaged ? {} : { bcfsaLicense }),
				governance: isSelfManaged ? 'self-managed' : 'brokerage-managed'
			},
			physical: { address, units: units.map(u => ({ id: u.id, sqft: u.sqft, parking: u.parking, storage: u.storage, ev: u.ev })), totalUnits: units.length },
			funds: { operating: { bank: operatingBank }, crf: { bank: crfBank, mandatoryPct: crfPct }, subAccounts: enabledSubAccounts.map(s => ({ name: s.name })) },
			services: selectedServices,
			payment: { rails: enabledRails.map(r => ({ id: r.id, label: r.label })), monthlyFees: { suggested: defaultSqft * 0.6 } },
			bylaws: bylawChoice === 'standard' ? { source: 'BC Standard Bylaws' } : { source: 'imported (pending upload)' },
			compliance: { spaRegistration: true, bcfsaAware: true, trustIsolation: { operating: operatingBank, crf: crfBank }, recordRetention: true, formKRequired: true }
		};
		configJson = JSON.stringify(config, null, 2);
		completed = true;
	};

	const totalSteps = 8;
	const stepLabels = ['jurisdiction', 'entityAddress', 'configureUnits', 'configureFunds', 'toggleServices', 'paymentRails', 'bylaws', 'reviewGenerate'];
	const stepIcons = ['\u{1F30D}', '\u{1F3E2}', '\u{1F3E0}', '\u{1F4B0}', '\u{1F527}', '\u{1F4B3}', '\u2696\uFE0F', '\u2705'];

	const nextStep = () => { if (step < totalSteps - 1) step++; };
	const prevStep = () => { if (step > 0) step--; };
	const goToStep = (s: number) => { if (s >= 0 && s < totalSteps) step = s; };

	const progress = $derived(((step + 1) / totalSteps) * 100);
</script>

<svelte:head>
	<title>{$copy.wizardPageTitle}</title>
</svelte:head>

<section class="border-b border-border bg-gradient-to-br from-brand-50/80 via-white to-amber-50/30">
	<div class="mx-auto max-w-4xl px-6 py-12">
		<p class="text-sm font-bold text-brand-600 uppercase tracking-wide mb-2">{$copy.onboardingPhase}</p>
		<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.wizardTitle}</h1>
		<p class="mt-3 text-slate-600 max-w-2xl">
			{$copy.wizardIntro}
		</p>
		{#if !completed}
			<div class="mt-8">
				<div class="flex items-center gap-0.5 mb-3">
					{#each stepLabels as label, i}
						<button
							class="flex-1 text-center py-2 rounded-lg text-xs font-semibold transition-all {i === step ? 'bg-brand-600 text-white' : i < step ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}"
							onclick={() => goToStep(i)} disabled={i > step}
						>{stepIcons[i]} {$copy[label]}</button>
					{/each}
				</div>
				<div class="h-2 rounded-full bg-slate-100 overflow-hidden">
					<div class="h-full rounded-full bg-gradient-to-r from-brand-500 to-success transition-all duration-500" style="width: {progress}%"></div>
				</div>
			</div>
		{/if}
	</div>
</section>

<div class="mx-auto max-w-4xl px-6 py-10">
	{#if completed}
		<div class="glass-card rounded-2xl p-8 text-center mb-8">
			<div class="text-6xl mb-4">{'\u{1F389}'}</div>
			<h2 class="text-2xl font-bold text-slate-900">{$copy.generatedTitle}</h2>
			<p class="mt-2 text-slate-500">{$copy.generatedDescription}</p>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<button class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-all"
					onclick={() => { completed = false; step = 0; }}>{$copy.startNew}</button>
			</div>
		</div>
		<div class="glass-card rounded-2xl p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-bold text-slate-800">{$copy.configJson}</h3>
				<button class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all"
					onclick={() => navigator.clipboard.writeText(configJson)}>{'\u{1F4CB}'} {$copy.copyConfig}</button>
			</div>
			<pre class="text-xs font-mono text-slate-700 bg-slate-50 rounded-xl p-4 overflow-x-auto max-h-96 border border-border leading-relaxed">{configJson}</pre>
		</div>
	{:else}
		<div class="glass-card rounded-2xl p-8">
			{#if step === 0}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u{1F30D}'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">{$copy.pickJurisdiction}</h2><p class="text-sm text-slate-500">{$copy.jurisdictionDescription}</p></div>
					</div>
					<div class="grid sm:grid-cols-2 gap-4">
						{#each jurisdictions as j}
							<button
								class="rounded-2xl border-2 p-5 text-left transition-all {jurisdiction === j.code ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-brand-200'} {!j.active ? 'opacity-40 cursor-not-allowed' : ''}"
								onclick={() => { if (j.active) jurisdiction = j.code; }} disabled={!j.active}
							>
								<span class="text-2xl">{j.flag}</span>
								<h3 class="mt-2 font-bold text-slate-800">{j.name}</h3>
								<div class="mt-1 flex flex-wrap gap-1.5">
									{#each j.laws as law}<span class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{law}</span>{/each}
								</div>
								{#if j.active}
									<span class="mt-2 inline-block rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveStatus}</span>
								{:else}
									<span class="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase">{$copy.soonStatus}</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{:else if step === 1}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u{1F3E2}'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">{$copy.entityAddress}</h2><p class="text-sm text-slate-500">{$copy.entityDescription}</p></div>
					</div>
					<div class="space-y-5">
						<div>
							<label for="corp-name" class="block text-sm font-semibold text-slate-700 mb-1.5">{$copy.corporationName}</label>
							<input id="corp-name" type="text" bind:value={corpName} placeholder={$copy.corpNamePlaceholder} class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-surface-2" />
						</div>
						<div>
							<label for="building-address" class="block text-sm font-semibold text-slate-700 mb-1.5">{$copy.buildingAddress}</label>
							<input id="building-address" type="text" bind:value={address} placeholder={$copy.addressPlaceholder} class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-surface-2" />
						</div>
						<div class="grid sm:grid-cols-2 gap-4">
							<div>
								<label for="fiscal-year" class="block text-sm font-semibold text-slate-700 mb-1.5">{$copy.fiscalYearStart}</label>
								<select id="fiscal-year" bind:value={fiscalYearStart} class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-surface-2">
									{#each ['January','February','March','April','May','June','July','August','September','October','November','December'] as m}
										<option value={m}>{m}</option>
									{/each}
								</select>
							</div>
							<div class="flex items-end pb-3">
								<label class="flex items-center gap-3 cursor-pointer">
									<div class="relative">
										<input type="checkbox" bind:checked={isSelfManaged} class="sr-only peer" />
										<div class="h-7 w-14 rounded-full bg-slate-200 peer-checked:bg-success transition-colors"></div>
										<div class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-surface-2 shadow peer-checked:translate-x-7 transition-transform"></div>
									</div>
									<div class="text-sm"><span class="font-semibold text-slate-700">{$copy.selfManaged}</span><br /><span class="text-slate-400 text-xs">{$copy.selfManagedHint}</span></div>
								</label>
							</div>
						</div>
						{#if !isSelfManaged}
							<div>
								<label for="bcfsa-license" class="block text-sm font-semibold text-slate-700 mb-1.5">{$copy.bcLicenseLabel}</label>
								<input id="bcfsa-license" type="text" bind:value={bcfsaLicense} placeholder={$copy.bcfsaLicensePlaceholder} class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-surface-2" />
							</div>
						{/if}
					</div>
				</div>
			{:else if step === 2}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u{1F3E0}'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">{$copy.configureUnits}</h2><p class="text-sm text-slate-500">{$copy.unitsDescription}</p></div>
					</div>
					<div class="grid sm:grid-cols-3 gap-4 mb-6">
						<div>
							<label for="unit-count" class="block text-xs font-semibold text-slate-600 mb-1">{$copy.numberOfUnits}</label>
							<input id="unit-count" type="number" bind:value={unitCount} min="1" max="500" class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-surface-2" />
						</div>
						<div>
							<label for="average-sqft" class="block text-xs font-semibold text-slate-600 mb-1">{$copy.averageSqFt}</label>
							<input id="average-sqft" type="number" bind:value={defaultSqft} min="300" max="5000" step="50" class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-surface-2" />
						</div>
						<div class="flex items-end">
							<button class="rounded-xl bg-brand-100 px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-200 transition-all w-full" onclick={addUnit}>+ {$copy.addUnit}</button>
						</div>
					</div>
					<div class="max-h-72 overflow-y-auto space-y-2 pr-2" style="scrollbar-width:thin">
						{#each units as unit, i}
							<div class="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-brand-200 transition-all {i % 2 === 0 ? 'bg-surface-2' : 'bg-surface-3'}">
								<span class="font-bold text-slate-700 w-14">#{unit.id}</span>
								<span class="text-sm text-slate-500 w-20">{unit.sqft} sqft</span>
								<div class="flex gap-3 flex-1">
									<label class="flex items-center gap-1 text-xs text-slate-600"><input type="checkbox" bind:checked={unit.parking} class="rounded text-brand-500" /> {$copy.parking}</label>
									<label class="flex items-center gap-1 text-xs text-slate-600"><input type="checkbox" bind:checked={unit.storage} class="rounded text-brand-500" /> {$copy.storage}</label>
									<label class="flex items-center gap-1 text-xs text-slate-600"><input type="checkbox" bind:checked={unit.ev} class="rounded text-brand-500" /> {$copy.evReady}</label>
								</div>
								<button class="text-xs text-danger hover:bg-danger/5 rounded-lg px-2 py-1 transition-all" onclick={() => removeUnit(unit.id)}>{'\u2715'}</button>
							</div>
						{/each}
					</div>
					<p class="mt-3 text-xs text-slate-400">{units.length} {$copy.units} {$copy.configured}</p>
				</div>
			{:else if step === 3}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u{1F4B0}'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">{$copy.configureFunds}</h2><p class="text-sm text-slate-500">{$copy.fundsDescription}</p></div>
					</div>
					<div class="space-y-5">
						<div class="grid sm:grid-cols-2 gap-4">
							<div>
								<label for="operating-bank" class="block text-sm font-semibold text-slate-700 mb-1.5">{$copy.operatingFundBank}</label>
								<select id="operating-bank" bind:value={operatingBank} class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-surface-2">
									<option>Vancouver Credit Union</option><option>Royal Bank of Canada</option><option>TD Canada Trust</option><option>Coast Capital Savings</option><option>Vancity</option>
								</select>
							</div>
							<div>
								<label for="crf-bank" class="block text-sm font-semibold text-slate-700 mb-1.5">{$copy.crfTrustBank}</label>
								<select id="crf-bank" bind:value={crfBank} class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-surface-2">
									<option>Vancouver Credit Union \u2014 CRF Trust</option><option>Royal Bank of Canada \u2014 CRF</option><option>TD Canada Trust \u2014 Reserve</option>
								</select>
							</div>
						</div>
						<div>
							<label for="crf-allocation" class="block text-sm font-semibold text-slate-700 mb-1.5">{$copy.crfAllocation}: <span class="text-brand-600">{crfPct}%</span> ({$copy.crfMinimum})</label>
							<input id="crf-allocation" type="range" bind:value={crfPct} min="10" max="25" class="w-full accent-brand-600" />
							<div class="flex justify-between text-xs text-slate-400 mt-1"><span>{$copy.crfMinimum}</span><span>{$copy.maxLabel}</span></div>
						</div>
						<div>
							<div class="block text-sm font-semibold text-slate-700 mb-3">{$copy.subAccounts} <span class="text-slate-400 font-normal">({$copy.optional})</span></div>
							<div class="grid sm:grid-cols-2 gap-2">
								{#each subAccounts as sa}
									<label class="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer hover:border-brand-200 transition-all {sa.enabled ? 'bg-brand-50 border-brand-200' : 'bg-surface-2'}">
										<input type="checkbox" bind:checked={sa.enabled} class="rounded text-brand-500" />
										<span>{sa.icon}</span><span class="text-sm text-slate-700">{sa.name}</span>
									</label>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{:else if step === 4}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u{1F527}'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">{$copy.toggleServices}</h2><p class="text-sm text-slate-500">{$copy.servicesDescription}</p></div>
					</div>
					<div class="grid sm:grid-cols-2 gap-3">
						{#each availableServices as svc}
							<button class="flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all {selectedServices.includes(svc.id) ? 'border-brand-500 bg-brand-50' : 'border-border bg-surface-2 hover:border-brand-200'}" onclick={() => toggleService(svc.id)}>
								<span class="text-2xl">{svc.icon}</span>
								<div><span class="text-sm font-semibold text-slate-800">{svc.label}</span><span class="block text-[10px] text-slate-400">{selectedServices.includes(svc.id) ? $copy.active : $copy.clickToEnable}</span></div>
							</button>
						{/each}
					</div>
				</div>
			{:else if step === 5}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u{1F4B3}'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">{$copy.paymentRails}</h2><p class="text-sm text-slate-500">{$copy.paymentDescription}</p></div>
					</div>
					<div class="space-y-3">
						{#each paymentRails as rail}
							<label class="flex items-center gap-4 rounded-2xl border-2 p-5 cursor-pointer transition-all {rail.enabled ? 'border-brand-500 bg-brand-50' : 'border-border bg-surface-2 hover:border-brand-200'}">
								<input type="checkbox" bind:checked={rail.enabled} class="rounded text-brand-500 h-5 w-5" />
								<span class="text-2xl">{rail.icon}</span>
								<div class="flex-1"><span class="font-bold text-slate-800">{rail.label}</span><p class="text-xs text-slate-500 mt-0.5">{rail.desc}</p></div>
								{#if rail.id === 'etransfer'}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.defaultLabel}</span>{/if}
							</label>
						{/each}
					</div>
					{#if paymentRails.find(r => r.id === 'lightning')?.enabled}
						<div class="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
							<p class="text-sm font-semibold text-amber-800">{'\u26A1'} {$copy.sovereignPay}</p>
							<p class="text-xs text-amber-700 mt-1">{$copy.sovereignPayDescription}</p>
						</div>
					{/if}
				</div>
			{:else if step === 6}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u2696\uFE0F'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">{$copy.bylaws}</h2><p class="text-sm text-slate-500">{$copy.bylawsDescription}</p></div>
					</div>
					<div class="grid sm:grid-cols-2 gap-4">
						<button class="rounded-2xl border-2 p-6 text-left transition-all {bylawChoice === 'standard' ? 'border-brand-500 bg-brand-50' : 'border-border bg-surface-2 hover:border-brand-200'}" onclick={() => (bylawChoice = 'standard')}>
							<span class="text-3xl">{'\u{1F4DC}'}</span>
							<h3 class="mt-3 font-bold text-slate-800">{$copy.standardBylawsPack}</h3>
							<p class="mt-1 text-sm text-slate-500">{$copy.standardBylawsDescription}</p>
							<div class="mt-3 flex gap-1.5"><span class="rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">SPA s.124\u2013128</span><span class="rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">CRT-proof</span></div>
						</button>
						<button class="rounded-2xl border-2 p-6 text-left transition-all {bylawChoice === 'import' ? 'border-brand-500 bg-brand-50' : 'border-border bg-surface-2 hover:border-brand-200'}" onclick={() => (bylawChoice = 'import')}>
							<span class="text-3xl">{'\u{1F4C1}'}</span>
							<h3 class="mt-3 font-bold text-slate-800">{$copy.importExistingBylaws}</h3>
							<p class="mt-1 text-sm text-slate-500">{$copy.importBylawsDescription}</p>
							<div class="mt-3 rounded-xl bg-slate-100 p-3 text-center text-xs text-slate-500 border-2 border-dashed border-slate-300">{$copy.uploadPhase3}</div>
						</button>
					</div>
				</div>
			{:else if step === 7}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u2705'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">{$copy.reviewGenerate}</h2><p class="text-sm text-slate-500">{$copy.reviewDescription}</p></div>
					</div>
					<div class="space-y-4">
						<div class="rounded-xl bg-slate-50 border border-border p-4">
							<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">{$copy.jurisdiction}</span>
							<p class="text-sm text-slate-800 mt-1">{jurisdictions.find(j => j.code === jurisdiction)?.flag} {jurisdictions.find(j => j.code === jurisdiction)?.name}</p>
						</div>
						<div class="rounded-xl bg-slate-50 border border-border p-4">
							<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">{$copy.entitySummary}</span>
							<p class="text-sm text-slate-800 mt-1 font-semibold">{corpName || $copy.unnamedStrata}</p>
							<p class="text-xs text-slate-500">{address || $copy.noAddress} \u00b7 {isSelfManaged ? $copy.selfManaged : $copy.brokerageManaged}</p>
						</div>
						<div class="rounded-xl bg-slate-50 border border-border p-4">
							<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">{$copy.unitsSummary}</span>
							<p class="text-sm text-slate-800 mt-1">{units.length} {$copy.units} \u00b7 {units.filter(u => u.parking).length} {$copy.parkingSummary} \u00b7 {units.filter(u => u.ev).length} {$copy.evSummary}</p>
						</div>
						<div class="rounded-xl bg-slate-50 border border-border p-4">
							<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">{$copy.fundsSummary}</span>
							<p class="text-sm text-slate-800 mt-1">{operatingBank} · {$copy.crfLabel}: {crfPct}% · {enabledSubAccounts.length} {$copy.subAccountsCount}</p>
						</div>
						<div class="grid sm:grid-cols-2 gap-4">
							<div class="rounded-xl bg-slate-50 border border-border p-4">
								<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">{$copy.servicesSummary} ({selectedServices.length})</span>
								<div class="mt-1 flex flex-wrap gap-1">
									{#each selectedServices as s}<span class="rounded-md bg-brand-50 text-brand-700 px-2 py-0.5 text-[10px] font-semibold">{availableServices.find(a => a.id === s)?.label}</span>{/each}
								</div>
							</div>
							<div class="rounded-xl bg-slate-50 border border-border p-4">
								<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">{$copy.paymentSummary} ({enabledRails.length})</span>
								<div class="mt-1 flex flex-wrap gap-1">
									{#each enabledRails as r}<span class="rounded-md bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-semibold">{r.icon} {r.label}</span>{/each}
								</div>
							</div>
						</div>
						<div class="rounded-xl bg-slate-50 border border-border p-4">
							<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">{$copy.bylaws}</span>
							<p class="text-sm text-slate-800 mt-1">{bylawChoice === 'standard' ? $copy.standardBylawsPack : $copy.importedBylawsPending}</p>
						</div>
						<div class="rounded-xl bg-success/5 border border-success/20 p-4">
							<p class="text-sm font-semibold text-success">{'\u2705'} {$copy.complianceConfig}</p>
							<p class="text-xs text-slate-600 mt-1">{$copy.trustIsolationSummary}</p>
						</div>
					</div>
					<button class="mt-8 w-full rounded-xl bg-brand-600 px-6 py-4 text-base font-bold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/25" onclick={generateConfig}>
						{$copy.generateConfig}
					</button>
				</div>
			{/if}
		</div>
		<div class="mt-6 flex items-center justify-between">
			<button class="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all {step === 0 ? 'invisible' : ''}" onclick={prevStep}>{'\u2190'} {$copy.back}</button>
			{#if step < totalSteps - 1}
				<button class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20" onclick={nextStep}>{$copy.continue} {'\u2192'}</button>
			{/if}
		</div>
	{/if}
</div>
