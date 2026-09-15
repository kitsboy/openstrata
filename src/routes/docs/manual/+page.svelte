<script lang="ts">
import Card from '$lib/components/Card.svelte';
</script>

<div class="max-w-3xl mx-auto p-6">
	<h1 class="text-2xl font-bold text-slate-900 mb-6">OpenStrata Manual</h1>
	
	<p class="text-slate-600 mb-8">A comprehensive guide to using OpenStrata for strata management.</p>
	
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		<Card class="glass-card rounded-2xl p-6">
			<h3 class="font-bold text-slate-800 mb-2">Welcome</h3>
			<p class="text-slate-600">This manual provides documentation for OpenStrata, a self-evolving strata management platform. Find your starting point below.</p>
			<a href="/docs/manual/welcome" class="text-brand-600 font-medium hover:underline">Read More →</a>
		</Card>
		
		<Card class="glass-card rounded-2xl p-6">
			<h3 class="font-bold text-slate-800 mb-2">Getting Started</h3>
			<p class="text-slate-600">Learn the prerequisites and first steps to get OpenStrata up and running.</p>
			<a href="/docs/manual/getting-started" class="text-brand-600 font-medium hover:underline">Read More →</a>
		</Card>
	</div>
</div>