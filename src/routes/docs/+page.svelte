<script lang="ts">
	import { jurisdictions, currencies } from '$lib/data';
	import { getToolStats } from '$lib/strata-tool';

	const stats = getToolStats();

	const docIndex = [
		{ file: 'EXECUTIVE-SUMMARY.md', title: 'Executive Summary', desc: 'One-page pitch, problem, solution, revenue, roadmap snapshot', href: '/about' },
		{ file: 'PRODUCT-PLAN.md', title: 'Product Plan', desc: 'Building templates, payment rails, war chest, Satohash integration', href: '/tools' },
		{ file: 'WORKPLAN.md', title: 'Workplan', desc: 'Phase tracker, file map, build commands', href: '/roadmap' },
		{ file: 'BCFSA-STRATEGY.md', title: 'BCFSA Strategy', desc: 'Competitive positioning within licensing law — three GTM paths', href: '/about' },
		{ file: 'BC-STRATA-COMPLIANCE.md', title: 'BC Compliance KB', desc: 'SPA workflows, quorum, voting, retention, localization', href: '/compliance' },
		{ file: 'ROADMAP.md', title: 'Roadmap', desc: 'Timeline, jurisdictions, integrations', href: '/roadmap' }
	];

	const installSteps = [
		{ step: 1, title: 'Bootstrap', code: 'docker compose up -d', desc: 'Ollama, vector DB, API, web. Tailscale + Umbrel BTC link.' },
		{ step: 2, title: 'Seed Rosa', code: 'rosa ingest --corpus bc-spa-rta-crt', desc: 'BC SPA, RTA, EPR, bylaws → vector DB. Validate 3 queries.' },
		{ step: 3, title: 'Pipeline', code: 'watch-folder /inbox → ocr → rosa-buffer', desc: 'Email webhook → OCR → Rosa buffer.' },
		{ step: 4, title: 'Treasury', code: 'ziggy simulate --invoice sample.pdf', desc: 'CRF 10% check → PSBT → 3-sig → reconcile.' },
		{ step: 5, title: 'Deploy UI', code: 'npm run build && docker compose restart web', desc: 'PWA + mobile touch flow.' }
	];
</script>

<svelte:head>
	<title>Docs — Hermes Strata</title>
</svelte:head>

<section class="border-b border-border bg-gradient-to-b from-brand-50/50 to-transparent">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">Documentation Hub</h1>
		<p class="mt-4 text-lg text-slate-600 max-w-3xl">
			BC-first MVP. {stats.total} Strata Tool modules. All docs in <code class="text-sm bg-slate-100 px-1.5 py-0.5 rounded">docs/</code> folder.
		</p>
		<div class="mt-6 flex flex-wrap gap-3">
			<a href="/compliance" class="rounded-xl bg-bc-blue/5 border border-bc-blue/20 px-5 py-3 text-sm font-semibold text-bc-blue no-underline hover:bg-bc-blue/10">Compliance KB →</a>
			<a href="/tools" class="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white no-underline hover:bg-brand-500">Strata Tool →</a>
		</div>
	</div>
</section>

<div class="mx-auto max-w-7xl px-6 py-12">
	<!-- Doc index -->
	<section class="mb-16">
		<h2 class="text-xl font-bold text-slate-900 mb-6">Document Index</h2>
		<div class="grid sm:grid-cols-2 gap-4">
			{#each docIndex as doc}
				<div class="glass-card rounded-xl p-5">
					<code class="text-[10px] font-mono text-slate-400">docs/{doc.file}</code>
					<h3 class="font-bold text-slate-800 mt-1">{doc.title}</h3>
					<p class="text-sm text-slate-500 mt-1">{doc.desc}</p>
					{#if doc.href}
						<a href={doc.href} class="mt-3 inline-block text-sm font-semibold text-brand-600 no-underline hover:text-brand-700">View on site →</a>
					{/if}
				</div>
			{/each}
		</div>
		<p class="mt-4 text-sm text-slate-400">Also: <code class="text-xs bg-slate-100 px-1 rounded">SOURCE-OF-TRUTH.md</code> at project root.</p>
	</section>

	<!-- Architecture -->
	<section class="mb-16">
		<h2 class="text-xl font-bold text-slate-900 mb-6">Architecture</h2>
		<div class="glass-card rounded-2xl p-8 font-mono text-sm space-y-3">
			<div class="rounded-xl bg-brand-50 border border-brand-200 p-4 text-center text-brand-800 font-semibold">Mobile PWA / Desktop Console</div>
			<div class="text-center text-slate-400">↓ Tailscale Secure Gateway</div>
			<div class="rounded-xl bg-slate-100 p-4 text-center font-semibold">Hermes Core — Rosa (Compliance RAG) · Ziggy (Treasury)</div>
			<div class="text-center text-slate-400">↓</div>
			<div class="grid sm:grid-cols-2 gap-4">
				<div class="rounded-xl bg-bc-blue/5 border p-4 text-center"><strong>Fiat Rail</strong><p class="text-xs text-slate-500 mt-1 font-sans">CAD + 10% CRF</p></div>
				<div class="rounded-xl bg-bitcoin/5 border p-4 text-center"><strong>Bitcoin Rail</strong><p class="text-xs text-slate-500 mt-1 font-sans">3-of-5 PSBT + Lightning</p></div>
			</div>
		</div>
	</section>

	<!-- Install SOP -->
	<section class="mb-16">
		<h2 class="text-xl font-bold text-slate-900 mb-6">Install SOP</h2>
		<div class="space-y-4">
			{#each installSteps as s}
				<div class="glass-card rounded-xl p-5 flex gap-4">
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-sm">{s.step}</div>
					<div>
						<h3 class="font-bold text-slate-800">{s.title}</h3>
						<code class="mt-1 block text-sm font-mono text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg">{s.code}</code>
						<p class="mt-2 text-sm text-slate-500">{s.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Jurisdictions -->
	<section>
		<h2 class="text-xl font-bold text-slate-900 mb-6">Jurisdictions & Currencies</h2>
		<div class="grid lg:grid-cols-2 gap-8">
			<div class="space-y-2">
				{#each jurisdictions as j}
					<div class="flex items-center justify-between rounded-xl border p-3 {j.active ? 'bg-brand-50/50 border-brand-200' : 'opacity-60'}">
						<span class="font-semibold text-sm">{j.flag} {j.name}</span>
						<span class="text-xs text-slate-400">{j.laws.join(' · ')}</span>
					</div>
				{/each}
			</div>
			<div class="flex flex-wrap gap-2">
				{#each currencies as c}
					<span class="rounded-full px-4 py-2 text-sm font-semibold {c.primary ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'}">{c.symbol} {c.code}</span>
				{/each}
			</div>
		</div>
		<p class="mt-8 text-center text-sm text-slate-400">
			<a href="mailto:hello@giveabit.io" class="text-brand-600 hover:underline">hello@giveabit.io</a>
		</p>
	</section>
</div>