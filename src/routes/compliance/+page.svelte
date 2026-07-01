<script lang="ts">
	import {
		regulatoryFramework,
		functionalDomains,
		bylawEnforcementWorkflow,
		conveyancingWorkflow,
		quorumRules,
		votingThresholds,
		tieBreakerRule,
		recordRetention,
		localizationMap,
		architectureMandates,
		moduleDomainMap
	} from '$lib/compliance';

	let activeSection = $state('pillars');
	let expandedDomain = $state<string | null>('financial');

	const sections = [
		{ id: 'pillars', label: 'Five Pillars', icon: '🏛️' },
		{ id: 'bylaw', label: 'Bylaw Flow', icon: '⚖️' },
		{ id: 'conveyancing', label: 'Forms B & F', icon: '📄' },
		{ id: 'meetings', label: 'Quorum & Voting', icon: '🗳️' },
		{ id: 'retention', label: 'Record Retention', icon: '📁' },
		{ id: 'localization', label: 'BC → US Map', icon: '🌐' },
		{ id: 'architecture', label: 'Build Mandates', icon: '🔧' }
	] as const;
</script>

<svelte:head>
	<title>BC Strata Compliance — Hermes Knowledge Base</title>
	<meta name="description" content="SPA + BCFSA compliance reference: trust accounting, bylaw enforcement workflows, quorum rules, Forms B/F, CRT export, and Canada-to-US localization mapping." />
</svelte:head>

<!-- Header -->
<section class="border-b border-border bg-gradient-to-b from-bc-blue/5 via-brand-50/30 to-transparent">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<div class="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-1.5 text-xs font-bold text-bc-blue mb-4">
			<span class="h-2 w-2 rounded-full bg-success live-dot"></span>
			KNOWLEDGE BASE — RETAIN & DO NOT FORGET
		</div>
		<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">BC Strata Compliance Reference</h1>
		<p class="mt-4 text-lg text-slate-600 max-w-3xl leading-relaxed">
			End-to-end breakdown of BC strata operations under the <strong>Strata Property Act (SPA)</strong> and
			<strong>BCFSA</strong> licensing. Architecture blueprints, workflow triggers, governance logic, and
			Canada-to-US localization — preserved for Hermes, Rosa, and Kimi.
		</p>
		<div class="mt-6 flex flex-wrap gap-3 text-sm">
			<span class="rounded-full bg-white border border-border px-3 py-1 font-semibold text-slate-600">
				{regulatoryFramework.primaryActs[0]}
			</span>
			<span class="rounded-full bg-white border border-border px-3 py-1 font-semibold text-slate-600">
				{regulatoryFramework.regulator}
			</span>
			<span class="rounded-full bg-white border border-border px-3 py-1 font-semibold text-slate-600">
				Disputes: {regulatoryFramework.disputeBody}
			</span>
		</div>
	</div>
</section>

<!-- Section nav -->
<div class="sticky top-[65px] z-40 border-b border-border bg-white/90 backdrop-blur-md">
	<div class="mx-auto max-w-7xl px-6 py-3 overflow-x-auto">
		<div class="flex gap-2 min-w-max">
			{#each sections as sec}
				<button
					class="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all
						{activeSection === sec.id
							? 'bg-brand-600 text-white shadow-md'
							: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
					onclick={() => (activeSection = sec.id)}
				>
					<span>{sec.icon}</span>
					{sec.label}
				</button>
			{/each}
		</div>
	</div>
</div>

<div class="mx-auto max-w-7xl px-6 py-12">
	<!-- Agent role callout -->
	<div class="glass-card rounded-2xl p-6 mb-10 border-l-4 border-l-bc-blue">
		<p class="text-sm text-slate-700 leading-relaxed">
			<strong>Agent model:</strong> {regulatoryFramework.agentRole}.
			Hermes modules below map to statutory requirements — Rosa cites sources; Ziggy enforces fund isolation and CRF caps.
			Questions: <a href="mailto:hello@giveabit.io" class="text-brand-600 hover:underline">hello@giveabit.io</a>
		</p>
	</div>

	{#if activeSection === 'pillars'}
		<h2 class="text-2xl font-bold text-slate-900 mb-2">Five Functional Domains</h2>
		<p class="text-slate-500 mb-8">Every Hermes module must cover one of these pillars. Click to expand.</p>

		<div class="space-y-4">
			{#each functionalDomains as domain}
				<div class="glass-card rounded-2xl overflow-hidden">
					<button
						class="w-full flex items-start gap-4 p-6 text-left hover:bg-brand-50/30 transition-colors"
						onclick={() => (expandedDomain = expandedDomain === domain.id ? null : domain.id)}
					>
						<span class="text-3xl">{domain.icon}</span>
						<div class="flex-1">
							<h3 class="text-lg font-bold text-slate-800">{domain.title}</h3>
							<p class="text-sm text-slate-500 mt-1">{domain.summary}</p>
						</div>
						<span class="text-slate-400 transition-transform {expandedDomain === domain.id ? 'rotate-180' : ''}">▼</span>
					</button>

					{#if expandedDomain === domain.id}
						<div class="px-6 pb-6 border-t border-border pt-5 animate-slide-up">
							{#if domain.funds.length > 0}
								<h4 class="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Trust Funds (isolated)</h4>
								<div class="grid sm:grid-cols-2 gap-3 mb-5">
									{#each domain.funds as fund}
										<div class="rounded-xl bg-slate-50 border border-border p-4">
											<div class="flex items-center justify-between">
												<span class="font-semibold text-slate-800 text-sm">{fund.name}</span>
												<code class="text-[10px] text-brand-600 font-mono">{fund.dbKey}</code>
											</div>
											<p class="text-xs text-slate-500 mt-1">{fund.purpose}</p>
											{#if 'mandatoryPct' in fund && fund.mandatoryPct}
												<span class="mt-2 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
													{fund.mandatoryPct}% minimum allocation
												</span>
											{/if}
										</div>
									{/each}
								</div>
							{/if}

							<h4 class="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">App Features</h4>
							<ul class="space-y-2 mb-5">
								{#each domain.features as feature}
									<li class="flex items-start gap-2 text-sm text-slate-600">
										<span class="text-brand-500 mt-0.5">✓</span>
										{feature}
									</li>
								{/each}
							</ul>

							<div class="flex flex-wrap gap-2">
								{#each domain.statutoryRefs as ref}
									<span class="rounded-full bg-bc-blue/5 border border-bc-blue/10 px-3 py-1 text-xs font-mono text-bc-blue">{ref}</span>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Module mapping -->
		<div class="mt-12">
			<h3 class="text-xl font-bold text-slate-800 mb-4">Hermes Module → Domain Map</h3>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border text-left">
							<th class="pb-3 pr-4 font-bold text-slate-600">Module</th>
							<th class="pb-3 pr-4 font-bold text-slate-600">Domain</th>
							<th class="pb-3 font-bold text-slate-600">Workflow Trigger</th>
						</tr>
					</thead>
					<tbody>
						{#each moduleDomainMap as row}
							<tr class="border-b border-border-soft">
								<td class="py-3 pr-4 font-semibold text-slate-800">{row.module}</td>
								<td class="py-3 pr-4">
									<span class="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">{row.domain}</span>
								</td>
								<td class="py-3 text-slate-500 font-mono text-xs">{row.trigger}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	{#if activeSection === 'bylaw'}
		<h2 class="text-2xl font-bold text-slate-900 mb-2">Bylaw Enforcement Flow</h2>
		<p class="text-slate-500 mb-8">
			Precise statutory order — skipping steps risks CRT overturn. Backend must enforce locks.
		</p>

		<div class="relative">
			{#each bylawEnforcementWorkflow as step, i}
				<div class="flex gap-6 mb-6 last:mb-0">
					<div class="flex flex-col items-center">
						<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-lg shadow-md">
							{step.step}
						</div>
						{#if i < bylawEnforcementWorkflow.length - 1}
							<div class="w-0.5 flex-1 bg-brand-200 my-2 min-h-[2rem]"></div>
						{/if}
					</div>
					<div class="glass-card rounded-xl p-5 flex-1 mb-2">
						<div class="flex flex-wrap items-center gap-2 mb-2">
							<span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{step.day}</span>
							{#if step.systemLock}
								<span class="rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-bold text-danger font-mono">
									🔒 {step.systemLock}
								</span>
							{/if}
						</div>
						<h3 class="font-bold text-slate-800">{step.title}</h3>
						<p class="mt-2 text-sm text-slate-600 leading-relaxed">{step.action}</p>
						<p class="mt-3 text-xs text-warning font-semibold">CRT risk: {step.crtRisk}</p>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-8 grid sm:grid-cols-2 gap-4">
			<div class="rounded-xl bg-slate-50 border border-border p-5">
				<h4 class="font-bold text-slate-800">Standard Fine Cap</h4>
				<p class="text-3xl font-bold text-slate-800 mt-2">$200</p>
				<p class="text-sm text-slate-500">Per standard bylaw infraction</p>
			</div>
			<div class="rounded-xl bg-amber-50 border border-amber-200 p-5">
				<h4 class="font-bold text-slate-800">Short-Term Rental Cap</h4>
				<p class="text-3xl font-bold text-amber-700 mt-2">$1,000</p>
				<p class="text-sm text-slate-500">Airbnb / STR violations in BC</p>
			</div>
		</div>
	{/if}

	{#if activeSection === 'conveyancing'}
		<h2 class="text-2xl font-bold text-slate-900 mb-2">Real Estate Conveyancing — Forms B & F</h2>
		<p class="text-slate-500 mb-8">When an owner sells, their lawyer requests documents. Balance due blocks the sale.</p>

		<div class="space-y-6">
			{#each conveyancingWorkflow as step}
				<div class="glass-card rounded-2xl p-6 flex gap-5">
					<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold
						{step.blocking ? 'bg-danger/10 text-danger' : 'bg-brand-50 text-brand-700'}">
						{step.step}
					</div>
					<div class="flex-1">
						<div class="flex flex-wrap items-center gap-2 mb-2">
							{#if step.form}
								<span class="rounded-full bg-bc-blue text-white px-3 py-0.5 text-xs font-bold">{step.form}</span>
							{/if}
							{#if step.blocking}
								<span class="rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-bold text-danger">SALE BLOCKING</span>
							{/if}
							{#if step.deadline}
								<span class="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-bold text-warning">⏱ {step.deadline}</span>
							{/if}
						</div>
						<h3 class="font-bold text-slate-800 text-lg">{step.title}</h3>
						<p class="mt-2 text-slate-600 leading-relaxed">{step.action}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if activeSection === 'meetings'}
		<h2 class="text-2xl font-bold text-slate-900 mb-2">Governance — Quorum & Voting</h2>
		<p class="text-slate-500 mb-8">Hardcoded thresholds. Abstentions excluded from all calculations.</p>

		<h3 class="text-lg font-bold text-slate-800 mb-4">Quorum Rules</h3>
		<div class="grid gap-4 mb-10">
			{#each quorumRules as rule}
				<div class="glass-card rounded-xl p-5">
					<div class="flex flex-wrap items-center gap-2 mb-3">
						<h4 class="font-bold text-slate-800">{rule.meetingType}</h4>
						<code class="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-brand-700">{rule.spaRef}</code>
					</div>
					<p class="text-sm text-slate-700"><strong>Requirement:</strong> {rule.requirement}</p>
					<p class="text-sm text-slate-500 mt-1 font-mono">Formula: {rule.formula}</p>
					<p class="text-sm text-slate-500 mt-2">{rule.conditions}</p>
					{#if rule.delayRule}
						<div class="mt-3 rounded-lg bg-warning/5 border border-warning/20 p-3 text-sm text-amber-800">
							<strong>30-Minute Rule:</strong> {rule.delayRule}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<h3 class="text-lg font-bold text-slate-800 mb-4">Voting Threshold Matrix</h3>
		<div class="overflow-x-auto mb-8">
			<table class="w-full text-sm glass-card rounded-2xl overflow-hidden">
				<thead class="bg-slate-50">
					<tr class="text-left">
						<th class="p-4 font-bold text-slate-600">Type</th>
						<th class="p-4 font-bold text-slate-600">Threshold</th>
						<th class="p-4 font-bold text-slate-600">Denominator</th>
						<th class="p-4 font-bold text-slate-600">Used For</th>
						<th class="p-4 font-bold text-slate-600">Formula</th>
					</tr>
				</thead>
				<tbody>
					{#each votingThresholds as vote}
						<tr class="border-t border-border">
							<td class="p-4 font-bold text-slate-800">{vote.name}</td>
							<td class="p-4"><span class="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">{vote.threshold}</span></td>
							<td class="p-4 text-slate-500 text-xs">{vote.denominator}</td>
							<td class="p-4 text-slate-500 text-xs">{vote.usedFor.join(', ')}</td>
							<td class="p-4 font-mono text-xs text-brand-600">{vote.formula}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="glass-card rounded-xl p-5 border-l-4 border-l-brand-500">
			<h4 class="font-bold text-slate-800">Tie-Breaker</h4>
			<p class="text-sm text-slate-600 mt-1">{tieBreakerRule.description}</p>
			<p class="text-xs text-slate-400 mt-2">Exception: {tieBreakerRule.exception} · Source: {tieBreakerRule.source}</p>
		</div>
	{/if}

	{#if activeSection === 'retention'}
		<h2 class="text-2xl font-bold text-slate-900 mb-2">SPA s.35 Record Retention</h2>
		<p class="text-slate-500 mb-8">Archive module must enforce these timelines. Rosa flags premature deletion.</p>

		<div class="grid sm:grid-cols-2 gap-3">
			{#each recordRetention as record}
				<div class="glass-card rounded-xl p-4 flex items-center justify-between gap-4">
					<div>
						<p class="font-semibold text-slate-800 text-sm">{record.document}</p>
						<code class="text-[10px] text-slate-400 font-mono">{record.spaRef}</code>
					</div>
					<span class="shrink-0 rounded-full px-3 py-1 text-xs font-bold
						{record.retention === 'Permanent' ? 'bg-bc-blue/10 text-bc-blue' : 'bg-slate-100 text-slate-600'}">
						{record.retention}
					</span>
				</div>
			{/each}
		</div>
	{/if}

	{#if activeSection === 'localization'}
		<h2 class="text-2xl font-bold text-slate-900 mb-2">Localization Engine — BC → US</h2>
		<p class="text-slate-500 mb-8">
			Decouple core code from regional terminology day one. Database uses neutral keys; UI maps via config.
		</p>

		<div class="overflow-x-auto">
			<table class="w-full text-sm glass-card rounded-2xl overflow-hidden">
				<thead class="bg-slate-50">
					<tr class="text-left">
						<th class="p-4 font-bold text-slate-600">🇨🇦 BC Concept</th>
						<th class="p-4 font-bold text-slate-600">🇺🇸 US Equivalent</th>
						<th class="p-4 font-bold text-slate-600">Database Element</th>
					</tr>
				</thead>
				<tbody>
					{#each localizationMap as row}
						<tr class="border-t border-border hover:bg-brand-50/30 transition-colors">
							<td class="p-4 font-semibold text-slate-800">{row.bc}</td>
							<td class="p-4 text-slate-600">{row.us}</td>
							<td class="p-4"><code class="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-brand-700">{row.dbElement}</code></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if activeSection === 'architecture'}
		<h2 class="text-2xl font-bold text-slate-900 mb-2">Architecture Mandates</h2>
		<p class="text-slate-500 mb-8">Non-negotiable design requirements from compliance review.</p>

		<div class="grid gap-5 sm:grid-cols-2">
			{#each architectureMandates as mandate}
				<div class="glass-card rounded-2xl p-6 hover:border-brand-200 transition-all">
					<code class="text-[10px] font-mono text-brand-600">{mandate.id}</code>
					<h3 class="font-bold text-slate-800 mt-1">{mandate.title}</h3>
					<p class="mt-3 text-sm text-slate-600 leading-relaxed">{mandate.desc}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Footer CTA -->
<section class="border-t border-border bg-white">
	<div class="mx-auto max-w-7xl px-6 py-12 text-center">
		<p class="text-sm text-slate-500">
			This knowledge base is the source of truth for Hermes architecture.
			Also stored in <code class="text-xs bg-slate-100 px-1.5 py-0.5 rounded">docs/BC-STRATA-COMPLIANCE.md</code> and
			<code class="text-xs bg-slate-100 px-1.5 py-0.5 rounded">src/lib/compliance.ts</code>
		</p>
		<div class="mt-6 flex flex-wrap justify-center gap-4">
			<a href="/tools" class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-brand-500 transition-colors">
				Open Strata Tools →
			</a>
			<a href="/docs" class="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-slate-700 no-underline hover:border-brand-300 transition-colors">
				Hermes Framework Docs
			</a>
		</div>
	</div>
</section>