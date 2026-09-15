<script lang="ts">
import Card from '$lib/components/Card.svelte';
</script>

<div class="max-w-2xl mx-auto p-6">
	<h1 class="text-2xl font-bold text-slate-900 mb-6">Getting Started with OpenStrata</h1>
	
	<p class="text-slate-600 mb-8">Follow these steps to set up OpenStrata for your strata corporation.</p>
	
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
		<div class="rounded-xl bg-brand-50 border border-brand-200 p-6">
			<h3 class="font-bold text-slate-800 mb-4">Prerequisites</h3>
			<ul class="list-disc list-inside text-slate-600 space-y-2">
				<li>BC strata corporation</li>
				<li>Access to OpenStrata software</li>
				<li>Basic understanding of strata management</li>
			</ul>
		</div>
		
		<div class="rounded-xl bg-brand-50 border border-brand-200 p-6">
			<h3 class="font-bold text-slate-800 mb-4">First Steps</h3>
			<ol class="list-decimal list-inside text-slate-600 space-y-2">
				<li>Register your strata corporation in the system</li>
				<li>Configure your financial accounts and trust funds</li>
				<li>Set up bylaw enforcement and voting workflows</li>
			</ol>
		</div>
	</div>
	
	<div class="mt-8 pt-8 border-t border-border">
		<h3 class="font-bold text-slate-800 mb-4">FAQ</h3>
		<div class="space-y-4 text-slate-600">
			<div class="flex justify-between items-start">
				<span class="font-medium">What are the system requirements?</span>
				<span>OpenStrata runs on modern web browsers and requires minimal local setup.</span>
			</div>
			<div class="flex justify-between items-start">
				<span class="font-medium">Do I need coding experience?</span>
				<span>No - OpenStrata is designed with a user-friendly interface.</span>
			</div>
			<div class="flex justify-between items-start">
				<span class="font-medium">Can I customize the platform?</span>
				<span>Yes - being open source, you can modify and extend the platform.</span>
			</div>
		</div>
	</div>
</div>