<script lang="ts">
import Card from '$lib/components/Card.svelte';
</script>

<div class="max-w-3xl mx-auto p-6">
	<h1 class="text-2xl font-bold text-slate-900 mb-6">OpenStrata Manual</h1>
	
	<p class="text-slate-600 mb-8 prose">
		This self-evolving guide walks you through OpenStrata, a strata management platform built for British Columbia regulations. Use the sections below to find your starting point, explore key features, or begin your first setup.
	</p>
	
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		<Card class="glass-card rounded-2xl p-6">
			<h3 class="font-bold text-slate-800 mb-2">Welcome to OpenStrata</h3>
			<p class="text-slate-600 prose">
				OpenStrata helps strata councils, licensed management companies, and self-managed communities handle bylaw enforcement, financial tracking, and voting workflows with transparency and ease. This manual is your roadmap.
			</p>
			<a href="/docs/manual/welcome" class="text-brand-600 font-medium hover:underline">Read More →</a>
		</Card>
		
		<Card class="glass-card rounded-2xl p-6">
			<h3 class="font-bold text-slate-800 mb-2">Getting Started</h3>
			<p class="text-slate-600 prose">
				Learn the prerequisites, first steps, and system requirements to get OpenStrata running for your strata corporation. Follow the guide to register your building, configure financial accounts, and set up compliance workflows.
			</p>
			<a href="/docs/manual/getting-started" class="text-brand-600 font-medium hover:underline">Read More →</a>
		</Card>
		
		<Card class="glass-card rounded-2xl p-6">
			<h3 class="font-bold text-slate-800 mb-2">FAQ</h3>
			<p class="text-slate-600 prose">
				Got questions? Find answers about system requirements, customization, coding experience, and more. Our frequently asked questions cover the most common topics from strata council members and developers alike.
			</p>
			<a href="/docs/manual/getting-started" class="text-brand-600 font-medium hover:underline">View Getting Started Guide →</a>
		</Card>
	</div>
</div>