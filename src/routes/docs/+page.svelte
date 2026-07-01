<script lang="ts">
	import { jurisdictions, currencies, faqItems } from '$lib/data';

	const installSteps = [
		{ step: 1, title: 'Bootstrap', code: 'docker compose up -d', desc: 'Ollama isolated, vector DB on M4 SSD, API, web. Tailscale on. Umbrel BTC link.' },
		{ step: 2, title: 'Seed Rosa', code: 'rosa ingest --corpus bc-spa-rta-crt', desc: 'Ingest BC SPA, RTA, EPR rules, bylaws, minutes → local vector DB. Validate 3 test queries.' },
		{ step: 3, title: 'Pipeline', code: 'watch-folder /inbox → ocr → rosa-buffer', desc: 'Watch folder + email webhook → file lock → local OCR → clean text → Rosa buffer.' },
		{ step: 4, title: 'Treasury Validation', code: 'ziggy simulate --invoice sample.pdf', desc: 'Invoice → Ziggy parse + CRF 10% block check → PSBT → mock 3-sig → broadcast + reconcile.' },
		{ step: 5, title: 'UI Deploy', code: 'npm run build && docker compose restart web', desc: 'Responsive components. Mobile touch flow + desktop hover test. Enable PWA install prompt.' }
	];

	const uxPrinciples = [
		'Bottom sheets for every action (pay, upload, approve). 48px+ touch targets.',
		'Instant Lightning QR modals with copy/share/haptic feedback.',
		'Premium animated toggles — Sovereign Pay with smooth flip + color shift.',
		'Status pills, progress rings, micro-animations (lift, pop, fade).',
		'Light premium theme with Bitcoin orange accents and subtle glassmorphism.',
		'Progressive disclosure: multisig/JSON behind one "Sovereign Mode" toggle.',
		'PWA: manifest.json + service worker for offline + Add to Home Screen.',
		'Trust: inline citations, real-time badges, audit drawer.',
		'Desktop: hover expands cards. Same components, responsive.'
	];
</script>

<svelte:head>
	<title>Hermes Docs — Sovereign Strata Framework v2</title>
</svelte:head>

<section class="border-b border-border bg-gradient-to-b from-brand-50/50 to-transparent">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<p class="text-sm font-semibold text-brand-600 uppercase tracking-wide mb-2">Project Hermes · Framework v2</p>
		<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">Sovereign Strata App Framework</h1>
		<p class="mt-4 text-lg text-slate-600 max-w-3xl leading-relaxed">
			BC-first MVP, extensible to provinces, states, and EU via config.
			Target: M4 Docker + Umbrel + Local Ollama. Philosophy: institutional backend power, mobile-sexy PWA frontend.
		</p>
		<div class="mt-6 flex flex-wrap gap-3">
			<span class="rounded-full bg-white border border-border px-4 py-1.5 text-xs font-semibold text-slate-600">🇨🇦 BC-First</span>
			<span class="rounded-full bg-white border border-border px-4 py-1.5 text-xs font-semibold text-slate-600">Local-First Sovereignty</span>
			<span class="rounded-full bg-bitcoin/10 border border-bitcoin/20 px-4 py-1.5 text-xs font-semibold text-bitcoin">Bitcoin + Lightning</span>
			<span class="rounded-full bg-white border border-border px-4 py-1.5 text-xs font-semibold text-slate-600">Progressive Disclosure</span>
		</div>
		<div class="mt-6">
			<a href="/compliance" class="inline-flex items-center gap-2 rounded-xl bg-bc-blue/5 border border-bc-blue/20 px-5 py-3 text-sm font-semibold text-bc-blue no-underline hover:bg-bc-blue/10 transition-colors">
				📚 Full BC Strata Compliance Knowledge Base →
			</a>
		</div>
	</div>
</section>

<div class="mx-auto max-w-7xl px-6 py-12">
	<!-- Architecture -->
	<section class="mb-16">
		<h2 class="text-2xl font-bold text-slate-900 mb-6">Architecture</h2>
		<div class="glass-card rounded-2xl p-8">
			<p class="text-slate-600 mb-6">Local-first sovereignty. Data never leaves the stack.</p>
			<div class="space-y-4 font-mono text-sm">
				<div class="rounded-xl bg-brand-50 border border-brand-200 p-4 text-center text-brand-800 font-semibold">
					Mobile PWA (Sexy) / Desktop Console
				</div>
				<div class="text-center text-slate-400">↓ Tailscale Secure Gateway</div>
				<div class="rounded-xl bg-slate-100 border border-border p-4 text-center text-slate-700 font-semibold">
					Hermes Core — Rosa: Compliance RAG · Ziggy: Treasury State Machine
				</div>
				<div class="text-center text-slate-400">↓</div>
				<div class="grid sm:grid-cols-2 gap-4">
					<div class="rounded-xl bg-bc-blue/5 border border-bc-blue/20 p-4 text-center">
						<span class="font-semibold text-bc-blue">Fiat Rail</span>
						<p class="mt-1 text-xs text-slate-500 font-sans">CAD Ledger + Mandatory 10% CRF</p>
					</div>
					<div class="rounded-xl bg-bitcoin/5 border border-bitcoin/20 p-4 text-center">
						<span class="font-semibold text-bitcoin">Bitcoin Rail</span>
						<p class="mt-1 text-xs text-slate-500 font-sans">3-of-5 PSBT Multisig + LNURL CAD-pegged Instant Pay</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Kimi Agents -->
	<section class="mb-16">
		<h2 class="text-2xl font-bold text-slate-900 mb-6">Kimi Agents</h2>
		<div class="grid sm:grid-cols-2 gap-6">
			<div class="glass-card rounded-2xl p-6 border-l-4 border-l-brand-500">
				<h3 class="text-xl font-bold text-slate-800">Rosa</h3>
				<p class="text-sm text-brand-600 font-semibold mt-1">Compliance RAG Engine</p>
				<ul class="mt-4 space-y-2 text-sm text-slate-600">
					<li>Ingest → strict RAG on BC SPA/RTA/CRT/bylaws</li>
					<li>Extract timelines, flag risks</li>
					<li>Auto-remind loops (14-day Form K, EPR deadlines)</li>
					<li>High threshold — source citations only</li>
				</ul>
			</div>
			<div class="glass-card rounded-2xl p-6 border-l-4 border-l-bitcoin">
				<h3 class="text-xl font-bold text-slate-800">Ziggy</h3>
				<p class="text-sm text-bitcoin font-semibold mt-1">Treasury State Machine</p>
				<ul class="mt-4 space-y-2 text-sm text-slate-600">
					<li>Parse invoices → enforce CRF cap</li>
					<li>Generate PSBT for council approval</li>
					<li>Coordinate 3-of-5 multisig quorum</li>
					<li>Reconcile ledger on broadcast</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Install SOP -->
	<section class="mb-16">
		<h2 class="text-2xl font-bold text-slate-900 mb-6">Install & Digest SOP</h2>
		<div class="space-y-4">
			{#each installSteps as s}
				<div class="glass-card rounded-xl p-5 flex gap-5">
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-sm">
						{s.step}
					</div>
					<div class="flex-1">
						<h3 class="font-bold text-slate-800">{s.title}</h3>
						<code class="mt-2 block rounded-lg bg-slate-900 text-brand-300 px-4 py-2 text-sm font-mono">{s.code}</code>
						<p class="mt-2 text-sm text-slate-500">{s.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- UI/UX -->
	<section class="mb-16">
		<h2 class="text-2xl font-bold text-slate-900 mb-6">UI/UX Principles</h2>
		<p class="text-slate-600 mb-4">Stack: Next.js/SvelteKit + Tailwind + shadcn/ui. Mobile-first. PWA now → Tauri/Capacitor native later.</p>
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
			{#each uxPrinciples as principle}
				<div class="rounded-xl bg-white border border-border p-4 text-sm text-slate-600">
					{principle}
				</div>
			{/each}
		</div>
	</section>

	<!-- Extensibility -->
	<section class="mb-16">
		<h2 class="text-2xl font-bold text-slate-900 mb-6">Extensibility</h2>
		<div class="grid lg:grid-cols-2 gap-8">
			<div>
				<h3 class="font-bold text-slate-800 mb-3">config.yaml</h3>
				<pre class="rounded-xl bg-slate-900 text-slate-100 p-5 text-sm font-mono leading-relaxed overflow-x-auto"><code>jurisdiction: BC
law_packs: [spa, rta, epr]
bitcoin: true
currencies: [CAD, BTC, USD, EUR]
languages: [en, fr]
feeds:
  - url: https://www2.gov.bc.ca/.../rss
    category: Regulation
  - twitter_list: strata-bc</code></pre>
				<p class="mt-3 text-sm text-slate-500">Kimi swaps RAG corpus for ON/AB/WA/EU later. One codebase.</p>
			</div>
			<div>
				<h3 class="font-bold text-slate-800 mb-3">Jurisdictions</h3>
				<div class="space-y-2">
					{#each jurisdictions as j}
						<div class="flex items-center justify-between rounded-xl border border-border p-3 {j.active ? 'bg-brand-50/50' : 'bg-slate-50 opacity-60'}">
							<div class="flex items-center gap-2">
								<span>{j.flag}</span>
								<span class="font-semibold text-sm text-slate-700">{j.name}</span>
							</div>
							<span class="text-xs text-slate-400">{j.laws.join(' · ')}</span>
						</div>
					{/each}
				</div>
				<h3 class="font-bold text-slate-800 mt-6 mb-3">Currencies</h3>
				<div class="flex flex-wrap gap-2">
					{#each currencies as c}
						<span class="rounded-full px-3 py-1 text-sm font-semibold {c.primary ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'}">
							{c.symbol} {c.code}
						</span>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- FAQ -->
	<section>
		<h2 class="text-2xl font-bold text-slate-900 mb-6">Embedded FAQ</h2>
		<div class="grid sm:grid-cols-2 gap-4">
			{#each faqItems as item}
				<div class="glass-card rounded-xl p-5">
					<span class="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">{item.category}</span>
					<h3 class="mt-2 font-semibold text-slate-800 text-sm">{item.q}</h3>
					<p class="mt-2 text-sm text-slate-500">{item.a}</p>
				</div>
			{/each}
		</div>
		<p class="mt-8 text-sm text-slate-400 text-center">
			Contact: <a href="mailto:hello@giveabit.io" class="text-brand-600 hover:underline">hello@giveabit.io</a>
			· Kimi: enforce clean structure, local-only, strict RAG, CRF hard blocks, mobile UX priority.
		</p>
	</section>
</div>