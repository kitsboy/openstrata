<script lang="ts">
	const features = [
		{
			icon: '🔗',
			title: 'Cross-Protocol Identity',
			desc: 'Bridge your identity across Bitcoin, Lightning, and Nostr with a single sovereign key. No silos, no walled gardens.'
		},
		{
			icon: '📦',
			title: 'Portable Data Layers',
			desc: 'Your data follows you — not the platform. Migrate between providers without losing your graph, content, or reputation.'
		},
		{
			icon: '⚡',
			title: 'Lightning-Native',
			desc: 'Built on BOLT-12 offers, LNURL, and Lightning Address. Settle, authenticate, and prove authority without intermediaries.'
		},
		{
			icon: '🛡️',
			title: 'Verifiable Claims',
			desc: 'Timestamped, signed, and anchored to Bitcoin. Anyone can verify. No trusted third party required for proof.'
		},
		{
			icon: '🌍',
			title: 'Protocol Agnostic',
			desc: 'Works with any Nostr relay, any Lightning node, any Bitcoin wallet. Open standard, no vendor lock-in.'
		}
	];
</script>

<!-- Hero -->
<section class="relative overflow-hidden border-b border-border bg-surface">
	<div class="absolute inset-0 bg-gradient-to-b from-brand-950/20 via-transparent to-surface pointer-events-none"></div>
	<div class="mx-auto max-w-6xl px-6 py-24 sm:py-32 relative">
		<div class="mx-auto max-w-3xl text-center">
			<div class="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-800/40 bg-brand-950/40 px-4 py-1.5 text-xs font-medium text-brand-300">
				<span class="h-2 w-2 rounded-full bg-brand-400 animate-pulse"></span>
				Open Standard · Sovereign Data · Permissionless
			</div>
			<h1 class="text-4xl font-bold tracking-tight text-white sm:text-6xl">
				Your Data,<br />
				<span class="text-brand-400">Your Sovereignty</span>
			</h1>
			<p class="mt-6 text-lg leading-relaxed text-zinc-400 sm:text-xl">
				OpenStrata is an open standard for sovereign data portability across
				Bitcoin, Lightning, and Nostr protocols. Own your identity. Move your
				data. Verify everything.
			</p>
			<div class="mt-10 flex items-center justify-center gap-4">
				<a
					href="/spec"
					class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white no-underline transition-all hover:bg-brand-500 hover:scale-105"
				>
					Read the Spec
					<span>→</span>
				</a>
				<a
					href="/docs"
					class="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-6 py-3 text-sm font-semibold text-zinc-300 no-underline transition-all hover:border-brand-700 hover:text-brand-300"
				>
					Get Started
				</a>
			</div>
		</div>
	</div>
</section>

<!-- What is OpenStrata -->
<section class="border-b border-border bg-surface-2">
	<div class="mx-auto max-w-6xl px-6 py-20">
		<div class="mx-auto max-w-3xl">
			<h2 class="text-2xl font-bold text-white sm:text-3xl">What is OpenStrata?</h2>
			<p class="mt-4 text-base leading-relaxed text-zinc-400">
				The internet was built on protocols you own. Email (SMTP), the web (HTTP),
				even money (TCP/IP). Then came platforms that locked your identity, your
				relationships, and your data inside walled gardens.
			</p>
			<p class="mt-4 text-base leading-relaxed text-zinc-400">
				<strong class="text-white">OpenStrata</strong> brings that back. It defines a
				standard way to carry your identity, social graph, content, and reputation
				across any platform that speaks Bitcoin, Lightning, or Nostr.
			</p>
			<div class="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
				<div class="rounded-lg border border-border bg-surface p-4">
					<div class="text-2xl font-bold text-brand-400">NIP-05</div>
					<div class="mt-1 text-zinc-500">Nostr Identity</div>
				</div>
				<div class="rounded-lg border border-border bg-surface p-4">
					<div class="text-2xl font-bold text-accent">BOLT-12</div>
					<div class="mt-1 text-zinc-500">Lightning Offers</div>
				</div>
				<div class="rounded-lg border border-border bg-surface p-4">
					<div class="text-2xl font-bold text-bitcoin">OTS</div>
					<div class="mt-1 text-zinc-500">Bitcoin Proof</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Features -->
<section class="border-b border-border bg-surface">
	<div class="mx-auto max-w-6xl px-6 py-20">
		<h2 class="text-center text-2xl font-bold text-white sm:text-3xl">Core Capabilities</h2>
		<p class="mx-auto mt-4 max-w-2xl text-center text-zinc-400">
			Five primitives that compose into any portability scenario you can imagine.
		</p>
		<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature}
				<div
					class="group rounded-xl border border-border bg-surface-2 p-6 transition-all hover:border-brand-800 hover:shadow-lg hover:shadow-brand-950/20"
				>
					<div class="mb-4 text-3xl">{feature.icon}</div>
					<h3 class="text-lg font-semibold text-white group-hover:text-brand-300 transition-colors">
						{feature.title}
					</h3>
					<p class="mt-2 text-sm leading-relaxed text-zinc-500">
						{feature.desc}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- How it Works -->
<section class="border-b border-border bg-surface-2">
	<div class="mx-auto max-w-6xl px-6 py-20">
		<h2 class="text-center text-2xl font-bold text-white sm:text-3xl">How It Works</h2>
		<div class="mt-12 grid gap-8 sm:grid-cols-3">
			<div class="text-center">
				<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
					1
				</div>
				<h3 class="mt-4 text-lg font-semibold text-white">Generate Your Key</h3>
				<p class="mt-2 text-sm text-zinc-500">
					One sovereign keypair becomes your identity across all protocols.
					Self-custodied. No platform owns it.
				</p>
			</div>
			<div class="text-center">
				<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
					2
				</div>
				<h3 class="mt-4 text-lg font-semibold text-white">Claim Your Strata</h3>
				<p class="mt-2 text-sm text-zinc-500">
					Publish your identity, data, and permissions as signed Nostr events.
					Your strata is verifiable and portable.
				</p>
			</div>
			<div class="text-center">
				<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
					3
				</div>
				<h3 class="mt-4 text-lg font-semibold text-white">Move Freely</h3>
				<p class="mt-2 text-sm text-zinc-500">
					Any platform that speaks the standard can import your strata. Switch
					providers. Keep your graph. Keep your reputation.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="bg-surface">
	<div class="mx-auto max-w-6xl px-6 py-24 text-center">
		<h2 class="text-2xl font-bold text-white sm:text-3xl">
			Built on Bitcoin. Powered by Open Standards.
		</h2>
		<p class="mx-auto mt-4 max-w-xl text-zinc-400">
			OpenStrata is a Give A Bit project. No platform fees. No KYC. No
			permission needed.
		</p>
		<div class="mt-8 flex items-center justify-center gap-4">
			<a
				href="https://github.com/kitsboy/openstrata"
				class="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-6 py-3 text-sm font-semibold text-zinc-300 no-underline transition-all hover:border-brand-700 hover:text-brand-300"
				target="_blank"
				rel="noopener noreferrer"
			>
				<span>🐙</span>
				GitHub
			</a>
			<a
				href="https://giveabit.io"
				class="text-sm text-zinc-500 underline-offset-4 hover:text-brand-400 hover:underline transition-colors"
				target="_blank"
				rel="noopener noreferrer"
			>
				Give A Bit →
			</a>
		</div>
	</div>
</section>
