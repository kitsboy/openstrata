<script lang="ts">
	import { jurisdictions } from '$lib/data';
	import Icon from '$lib/components/Icon.svelte';

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
			meta: { generated: new Date().toISOString(), version: '0.1.0' },
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
	const stepLabels = ['Jurisdiction', 'Entity', 'Units', 'Funds', 'Services', 'Rails', 'Bylaws', 'Review'];
	const stepIcons = ['\u{1F30D}', '\u{1F3E2}', '\u{1F3E0}', '\u{1F4B0}', '\u{1F527}', '\u{1F4B3}', '\u2696\uFE0F', '\u2705'];

	const nextStep = () => { if (step < totalSteps - 1) step++; };
	const prevStep = () => { if (step > 0) step--; };
	const goToStep = (s: number) => { if (s >= 0 && s < totalSteps) step = s; };

	const progress = $derived(((step + 1) / totalSteps) * 100);
</script>

<svelte:head>
	<title>Building Template Wizard \u2014 Hermes Strata</title>
</svelte:head>

<section class="border-b border-border bg-gradient-to-br from-brand-50/80 via-white to-amber-50/30">
	<div class="mx-auto max-w-4xl px-6 py-12">
		<p class="text-sm font-bold text-brand-600 uppercase tracking-wide mb-2">Phase 2 \u2014 Onboarding</p>
		<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">Building Template Wizard</h1>
		<p class="mt-3 text-slate-600 max-w-2xl">
			Configure a new strata corporation in 8 steps. Every setting is jurisdiction-aware
			and BCFSA-compliant by default. Generate a portable building JSON config.
		</p>
		{#if !completed}
			<div class="mt-8">
				<div class="flex items-center gap-0.5 mb-3">
					{#each stepLabels as label, i}
						<button
							class="flex-1 text-center py-2 rounded-lg text-xs font-semibold transition-all {i === step ? 'bg-brand-600 text-white' : i < step ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}"
							onclick={() => goToStep(i)} disabled={i > step}
						>{stepIcons[i]} {label}</button>
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
			<h2 class="text-2xl font-bold text-slate-900">Building Template Generated</h2>
			<p class="mt-2 text-slate-500">Your strata configuration is ready. This JSON can be imported into any Hermes Strata instance.</p>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<button class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-all"
					onclick={() => { completed = false; step = 0; }}>Start New</button>
			</div>
		</div>
		<div class="glass-card rounded-2xl p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-bold text-slate-800">Building Config JSON</h3>
				<button class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all"
					onclick={() => navigator.clipboard.writeText(configJson)}>{'\u{1F4CB}'} Copy</button>
			</div>
			<pre class="text-xs font-mono text-slate-700 bg-slate-50 rounded-xl p-4 overflow-x-auto max-h-96 border border-border leading-relaxed">{configJson}</pre>
		</div>
	{:else}
		<div class="glass-card rounded-2xl p-8">
			{#if step === 0}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u{1F30D}'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">Pick Jurisdiction</h2><p class="text-sm text-slate-500">Your strata\u2019s legal framework. BC is fully supported; others coming soon.</p></div>
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
									<span class="mt-2 inline-block rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">Live</span>
								{:else}
									<span class="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase">Soon</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{:else if step === 1}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u{1F3E2}'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">Entity & Address</h2><p class="text-sm text-slate-500">Legal name, location, and governance model.</p></div>
					</div>
					<div class="space-y-5">
						<div>
							<label class="block text-sm font-semibold text-slate-700 mb-1.5">Strata Corporation Name</label>
							<input type="text" bind:value={corpName} placeholder="e.g. The Towers Strata Corporation" class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white" />
						</div>
						<div>
							<label class="block text-sm font-semibold text-slate-700 mb-1.5">Building Address</label>
							<input type="text" bind:value={address} placeholder="e.g. 1234 Maple Street, Vancouver BC" class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white" />
						</div>
						<div class="grid sm:grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-semibold text-slate-700 mb-1.5">Fiscal Year Start</label>
								<select bind:value={fiscalYearStart} class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white">
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
										<div class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow peer-checked:translate-x-7 transition-transform"></div>
									</div>
									<div class="text-sm"><span class="font-semibold text-slate-700">Self-Managed</span><br /><span class="text-slate-400 text-xs">SPA-permitted self-management</span></div>
								</label>
							</div>
						</div>
						{#if !isSelfManaged}
							<div>
								<label class="block text-sm font-semibold text-slate-700 mb-1.5">BCFSA License #</label>
								<input type="text" bind:value={bcfsaLicense} placeholder="e.g. BCFSA-STR-2026-XXXX" class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white" />
							</div>
						{/if}
					</div>
				</div>
			{:else if step === 2}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u{1F3E0}'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">Configure Units</h2><p class="text-sm text-slate-500">Set unit count, square footage, and toggle features.</p></div>
					</div>
					<div class="grid sm:grid-cols-3 gap-4 mb-6">
						<div>
							<label class="block text-xs font-semibold text-slate-600 mb-1">Number of Units</label>
							<input type="number" bind:value={unitCount} min="1" max="500" class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white" />
						</div>
						<div>
							<label class="block text-xs font-semibold text-slate-600 mb-1">Avg Sq Ft</label>
							<input type="number" bind:value={defaultSqft} min="300" max="5000" step="50" class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white" />
						</div>
						<div class="flex items-end">
							<button class="rounded-xl bg-brand-100 px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-200 transition-all w-full" onclick={addUnit}>+ Add Unit</button>
						</div>
					</div>
					<div class="max-h-72 overflow-y-auto space-y-2 pr-2" style="scrollbar-width:thin">
						{#each units as unit, i}
							<div class="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-brand-200 transition-all {i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
								<span class="font-bold text-slate-700 w-14">#{unit.id}</span>
								<span class="text-sm text-slate-500 w-20">{unit.sqft} sqft</span>
								<div class="flex gap-3 flex-1">
									<label class="flex items-center gap-1 text-xs text-slate-600"><input type="checkbox" bind:checked={unit.parking} class="rounded text-brand-500" /> Parking</label>
									<label class="flex items-center gap-1 text-xs text-slate-600"><input type="checkbox" bind:checked={unit.storage} class="rounded text-brand-500" /> Storage</label>
									<label class="flex items-center gap-1 text-xs text-slate-600"><input type="checkbox" bind:checked={unit.ev} class="rounded text-brand-500" /> EV Ready</label>
								</div>
								<button class="text-xs text-danger hover:bg-danger/5 rounded-lg px-2 py-1 transition-all" onclick={() => removeUnit(unit.id)}>{'\u2715'}</button>
							</div>
						{/each}
					</div>
					<p class="mt-3 text-xs text-slate-400">{units.length} unit{units.length !== 1 ? 's' : ''} configured</p>
				</div>
			{:else if step === 3}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u{1F4B0}'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">Configure Funds</h2><p class="text-sm text-slate-500">Trust accounts per SPA s.92\u201396. Operating and CRF are mandatory.</p></div>
					</div>
					<div class="space-y-5">
						<div class="grid sm:grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-semibold text-slate-700 mb-1.5">Operating Fund Bank</label>
								<select bind:value={operatingBank} class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white">
									<option>Vancouver Credit Union</option><option>Royal Bank of Canada</option><option>TD Canada Trust</option><option>Coast Capital Savings</option><option>Vancity</option>
								</select>
							</div>
							<div>
								<label class="block text-sm font-semibold text-slate-700 mb-1.5">CRF Trust Bank</label>
								<select bind:value={crfBank} class="w-full rounded-xl border border-border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white">
									<option>Vancouver Credit Union \u2014 CRF Trust</option><option>Royal Bank of Canada \u2014 CRF</option><option>TD Canada Trust \u2014 Reserve</option>
								</select>
							</div>
						</div>
						<div>
							<label class="block text-sm font-semibold text-slate-700 mb-1.5">CRF Allocation: <span class="text-brand-600">{crfPct}%</span> (SPA minimum 10%)</label>
							<input type="range" bind:value={crfPct} min="10" max="25" class="w-full accent-brand-600" />
							<div class="flex justify-between text-xs text-slate-400 mt-1"><span>SPA minimum: 10%</span><span>Max: 25%</span></div>
						</div>
						<div>
							<label class="block text-sm font-semibold text-slate-700 mb-3">Sub-Accounts <span class="text-slate-400 font-normal">(optional)</span></label>
							<div class="grid sm:grid-cols-2 gap-2">
								{#each subAccounts as sa}
									<label class="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer hover:border-brand-200 transition-all {sa.enabled ? 'bg-brand-50 border-brand-200' : 'bg-white'}">
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
						<div><h2 class="text-xl font-bold text-slate-900">Toggle Services</h2><p class="text-sm text-slate-500">Select the services your strata manages.</p></div>
					</div>
					<div class="grid sm:grid-cols-2 gap-3">
						{#each availableServices as svc}
							<button class="flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all {selectedServices.includes(svc.id) ? 'border-brand-500 bg-brand-50' : 'border-border bg-white hover:border-brand-200'}" onclick={() => toggleService(svc.id)}>
								<span class="text-2xl">{svc.icon}</span>
								<div><span class="text-sm font-semibold text-slate-800">{svc.label}</span><span class="block text-[10px] text-slate-400">{selectedServices.includes(svc.id) ? 'Active' : 'Click to enable'}</span></div>
							</button>
						{/each}
					</div>
				</div>
			{:else if step === 5}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u{1F4B3}'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">Payment Rails</h2><p class="text-sm text-slate-500">Fiat primary. Bitcoin additive. Never custody.</p></div>
					</div>
					<div class="space-y-3">
						{#each paymentRails as rail}
							<label class="flex items-center gap-4 rounded-2xl border-2 p-5 cursor-pointer transition-all {rail.enabled ? 'border-brand-500 bg-brand-50' : 'border-border bg-white hover:border-brand-200'}">
								<input type="checkbox" bind:checked={rail.enabled} class="rounded text-brand-500 h-5 w-5" />
								<span class="text-2xl">{rail.icon}</span>
								<div class="flex-1"><span class="font-bold text-slate-800">{rail.label}</span><p class="text-xs text-slate-500 mt-0.5">{rail.desc}</p></div>
								{#if rail.id === 'etransfer'}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">Default</span>{/if}
							</label>
						{/each}
					</div>
					{#if paymentRails.find(r => r.id === 'lightning')?.enabled}
						<div class="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
							<p class="text-sm font-semibold text-amber-800">{'\u26A1'} Sovereign Instant Pay Enabled</p>
							<p class="text-xs text-amber-700 mt-1">LNURL QR codes with 15-min CAD rate lock. Satohash stamp on every receipt.</p>
						</div>
					{/if}
				</div>
			{:else if step === 6}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u2696\uFE0F'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">Bylaws</h2><p class="text-sm text-slate-500">Use the BC Standard Bylaws pack or import your existing document.</p></div>
					</div>
					<div class="grid sm:grid-cols-2 gap-4">
						<button class="rounded-2xl border-2 p-6 text-left transition-all {bylawChoice === 'standard' ? 'border-brand-500 bg-brand-50' : 'border-border bg-white hover:border-brand-200'}" onclick={() => (bylawChoice = 'standard')}>
							<span class="text-3xl">{'\u{1F4DC}'}</span>
							<h3 class="mt-3 font-bold text-slate-800">BC Standard Bylaws</h3>
							<p class="mt-1 text-sm text-slate-500">Pre-loaded standard pack. CRT-tested. SPA-compliant.</p>
							<div class="mt-3 flex gap-1.5"><span class="rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">SPA s.124\u2013128</span><span class="rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">CRT-proof</span></div>
						</button>
						<button class="rounded-2xl border-2 p-6 text-left transition-all {bylawChoice === 'import' ? 'border-brand-500 bg-brand-50' : 'border-border bg-white hover:border-brand-200'}" onclick={() => (bylawChoice = 'import')}>
							<span class="text-3xl">{'\u{1F4C1}'}</span>
							<h3 class="mt-3 font-bold text-slate-800">Import Existing Bylaws</h3>
							<p class="mt-1 text-sm text-slate-500">Upload existing registered bylaws. Hermes maps them to the compliance engine.</p>
							<div class="mt-3 rounded-xl bg-slate-100 p-3 text-center text-xs text-slate-500 border-2 border-dashed border-slate-300">PDF / DOCX upload (Phase 3)</div>
						</button>
					</div>
				</div>
			{:else if step === 7}
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-3xl">{'\u2705'}</span>
						<div><h2 class="text-xl font-bold text-slate-900">Review & Generate</h2><p class="text-sm text-slate-500">Verify everything looks correct.</p></div>
					</div>
					<div class="space-y-4">
						<div class="rounded-xl bg-slate-50 border border-border p-4">
							<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Jurisdiction</span>
							<p class="text-sm text-slate-800 mt-1">{jurisdictions.find(j => j.code === jurisdiction)?.flag} {jurisdictions.find(j => j.code === jurisdiction)?.name}</p>
						</div>
						<div class="rounded-xl bg-slate-50 border border-border p-4">
							<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Entity</span>
							<p class="text-sm text-slate-800 mt-1 font-semibold">{corpName || 'Unnamed Strata Corporation'}</p>
							<p class="text-xs text-slate-500">{address || 'No address set'} \u00b7 {isSelfManaged ? 'Self-Managed' : 'Brokerage-Managed'}</p>
						</div>
						<div class="rounded-xl bg-slate-50 border border-border p-4">
							<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Units</span>
							<p class="text-sm text-slate-800 mt-1">{units.length} units \u00b7 {units.filter(u => u.parking).length} parking \u00b7 {units.filter(u => u.ev).length} EV ready</p>
						</div>
						<div class="rounded-xl bg-slate-50 border border-border p-4">
							<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Funds</span>
							<p class="text-sm text-slate-800 mt-1">{operatingBank} \u00b7 CRF: {crfPct}% \u00b7 {enabledSubAccounts.length} sub-accounts</p>
						</div>
						<div class="grid sm:grid-cols-2 gap-4">
							<div class="rounded-xl bg-slate-50 border border-border p-4">
								<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Services ({selectedServices.length})</span>
								<div class="mt-1 flex flex-wrap gap-1">
									{#each selectedServices as s}<span class="rounded-md bg-brand-50 text-brand-700 px-2 py-0.5 text-[10px] font-semibold">{availableServices.find(a => a.id === s)?.label}</span>{/each}
								</div>
							</div>
							<div class="rounded-xl bg-slate-50 border border-border p-4">
								<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Payment Rails ({enabledRails.length})</span>
								<div class="mt-1 flex flex-wrap gap-1">
									{#each enabledRails as r}<span class="rounded-md bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-semibold">{r.icon} {r.label}</span>{/each}
								</div>
							</div>
						</div>
						<div class="rounded-xl bg-slate-50 border border-border p-4">
							<span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Bylaws</span>
							<p class="text-sm text-slate-800 mt-1">{bylawChoice === 'standard' ? 'BC Standard Bylaws Pack' : 'Imported Bylaws (pending upload)'}</p>
						</div>
						<div class="rounded-xl bg-success/5 border border-success/20 p-4">
							<p class="text-sm font-semibold text-success">{'\u2705'} BCFSA-Aware Configuration</p>
							<p class="text-xs text-slate-600 mt-1">Trust fund isolation \u00b7 SPA s.35 retention \u00b7 CRT-proof bylaw workflow \u00b7 Forms B/F ready</p>
						</div>
					</div>
					<button class="mt-8 w-full rounded-xl bg-brand-600 px-6 py-4 text-base font-bold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/25" onclick={generateConfig}>
						Generate Building Config JSON
					</button>
				</div>
			{/if}
		</div>
		<div class="mt-6 flex items-center justify-between">
			<button class="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all {step === 0 ? 'invisible' : ''}" onclick={prevStep}>{'\u2190'} Back</button>
			{#if step < totalSteps - 1}
				<button class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20" onclick={nextStep}>Continue {'\u2192'}</button>
			{/if}
		</div>
	{/if}
</div>
