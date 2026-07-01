<script lang="ts">
	const layers = [
		{ name: 'Identity Layer', protocol: 'NIP-05 + OpenStrata Key', desc: 'Single sovereign keypair bridges Bitcoin, Lightning, and Nostr identity.' },
		{ name: 'Data Layer', protocol: 'Signed Nostr Events', desc: 'Portable strata records, bylaws hashes, and council decisions as verifiable events.' },
		{ name: 'Payment Layer', protocol: 'BOLT-12 + LNURL + PSBT', desc: 'Lightning offers for recurring fees. Multisig on-chain for treasury operations.' },
		{ name: 'Proof Layer', protocol: 'OTS + Bitcoin Anchoring', desc: 'Timestamped, signed claims anchored to Bitcoin. Anyone can verify.' },
		{ name: 'Compliance Layer', protocol: 'Rosa RAG Corpus', desc: 'Jurisdiction-specific law packs with strict citation requirements.' }
	];

	const primitives = [
		{ icon: '🔗', title: 'Cross-Protocol Identity', desc: 'Bridge identity across Bitcoin, Lightning, and Nostr with a single sovereign key.' },
		{ icon: '📦', title: 'Portable Data Layers', desc: 'Data follows you — migrate between providers without losing your graph or reputation.' },
		{ icon: '⚡', title: 'Lightning-Native', desc: 'BOLT-12 offers, LNURL, Lightning Address. Settle without intermediaries.' },
		{ icon: '🛡️', title: 'Verifiable Claims', desc: 'Timestamped, signed, anchored to Bitcoin. No trusted third party for proof.' },
		{ icon: '🌍', title: 'Protocol Agnostic', desc: 'Any Nostr relay, Lightning node, Bitcoin wallet. Open standard, no lock-in.' },
		{ icon: '🏢', title: 'Strata-Native', desc: 'Form K, EPR, CRF, CRT compliance primitives built into the data model.' }
	];
</script>

<svelte:head>
	<title>OpenStrata Spec — Sovereign Data Portability</title>
</svelte:head>

<section class="border-b border-border bg-gradient-to-b from-slate-50 to-transparent">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">OpenStrata Specification</h1>
		<p class="mt-4 text-lg text-slate-600 max-w-3xl">
			An open standard for sovereign data portability across Bitcoin, Lightning, and Nostr —
			extended for strata corporation governance, treasury, and compliance.
		</p>
	</div>
</section>

<div class="mx-auto max-w-7xl px-6 py-12">
	<section class="mb-16">
		<h2 class="text-2xl font-bold text-slate-900 mb-6">Protocol Layers</h2>
		<div class="space-y-4">
			{#each layers as layer, i}
				<div class="glass-card rounded-xl p-5 flex gap-5 items-start">
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
						{i + 1}
					</div>
					<div>
						<div class="flex items-center gap-3 flex-wrap">
							<h3 class="font-bold text-slate-800">{layer.name}</h3>
							<code class="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-brand-700">{layer.protocol}</code>
						</div>
						<p class="mt-1 text-sm text-slate-500">{layer.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section class="mb-16">
		<h2 class="text-2xl font-bold text-slate-900 mb-6">Core Primitives</h2>
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each primitives as p}
				<div class="glass-card rounded-xl p-6 hover:border-brand-200 transition-all">
					<div class="text-3xl mb-3">{p.icon}</div>
					<h3 class="font-bold text-slate-800">{p.title}</h3>
					<p class="mt-2 text-sm text-slate-500 leading-relaxed">{p.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="mb-16">
		<h2 class="text-2xl font-bold text-slate-900 mb-6">How It Works</h2>
		<div class="grid sm:grid-cols-3 gap-6">
			{#each [
				{ n: 1, title: 'Generate Your Key', desc: 'One sovereign keypair becomes your identity across all protocols. Self-custodied.' },
				{ n: 2, title: 'Claim Your Strata', desc: 'Publish identity, data, and permissions as signed Nostr events. Verifiable and portable.' },
				{ n: 3, title: 'Move Freely', desc: 'Any platform speaking the standard imports your strata. Switch providers. Keep everything.' }
			] as step}
				<div class="text-center glass-card rounded-xl p-6">
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white mb-4">
						{step.n}
					</div>
					<h3 class="font-bold text-slate-800">{step.title}</h3>
					<p class="mt-2 text-sm text-slate-500">{step.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<div class="glass-card rounded-2xl p-8 text-center">
			<div class="text-4xl mb-4">📜</div>
			<h2 class="text-xl font-bold text-slate-800">Full Wire Protocol — Coming Soon</h2>
			<p class="mt-2 text-slate-500 max-w-lg mx-auto">
				Identity layers, data formats, verification rules, and wire protocols.
				Watch the repo for updates.
			</p>
			<a href="https://github.com/kitsboy/openstrata" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-brand-500 transition-colors" target="_blank" rel="noopener noreferrer">
				Watch on GitHub →
			</a>
		</div>
	</section>
</div>