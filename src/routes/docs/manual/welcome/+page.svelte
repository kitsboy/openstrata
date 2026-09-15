<script lang="ts">
import Card from '$lib/components/Card.svelte';
</script>

<div class="max-w-2xl mx-auto p-6">
	<h1 class="text-2xl font-bold text-slate-900 mb-6">Welcome to OpenStrata</h1>
	
	<div class="prose max-w-none text-slate-600 mb-8">
		OpenStrata is a self-evolving strata management platform designed for British Columbia strata corporations. This manual provides comprehensive guidance for users, administrators, and stakeholders, covering everything from bylaw enforcement and financial management to voting workflows and Bitcoin sovereignty integration.
	</div>
	
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
		<div class="rounded-xl bg-brand-50 border border-brand-200 p-6">
			<h3 class="font-bold text-slate-800 mb-4">Key Features</h3>
			<ul class="list-disc list-inside text-slate-600 space-y-2">
				<li>BCFSA-compliant strata operations — follow British Columbia's Strata Property Act with confidence</li>
				<li>Financial management and trust accounting — transparent handling of strata funds, CRF management, and trust accounting</li>
				<li>By-law enforcement and voting workflows — structured kura voting, quorum tracking, and resolution management</li>
				<li>CRF (Contingency Reserve Fund) management — budget planning, reserve allocations, and fine cap controls</li>
				<li>Integration with Satohash for Bitcoin sovereignty — timestamped records, on-chain verification, and immutable audit trails</li>
			</ul>
		</div>
		
		<div class="rounded-xl bg-brand-50 border border-brand-200 p-6">
			<h3 class="font-bold text-slate-800 mb-4">Who Can Use This</h3>
			<ul class="list-disc list-inside text-slate-600 space-y-2">
				<li>Strata council members — elected officials managing day-to-day operations and long-term planning</li>
				<li>Licensed strata management companies — professional firms providing compliance and administrative support</li>
				<li>Developers and self-managed councils — technology-enabled communities handling their own governance</li>
			</ul>
		</div>
	</div>
	
	<div class="mt-8 pt-8 border-t border-border">
		<h3 class="font-bold text-slate-800 mb-4">Getting Started</h3>
		<p class="text-slate-600">This section provides the information you need to begin using OpenStrata.</p>
		<a href="/docs/manual/getting-started" class="text-brand-600 font-medium hover:underline">View Getting Started Guide →</a>
	</div>
</div>