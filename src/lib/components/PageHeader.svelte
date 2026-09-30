<script lang="ts">
	let { kicker, title, lede }: { kicker: string; title: string; lede: string } = $props();
</script>

<header class="mb-8">
	<p class="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">{kicker}</p>
	<h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
	<p class="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">{lede}</p>
</header>
