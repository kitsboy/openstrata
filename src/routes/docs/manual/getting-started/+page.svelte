<script lang="ts">
import Card from '$lib/components/Card.svelte';
</script>

<div class="max-w-2xl mx-auto p-6">
	<h1 class="text-2xl font-bold text-slate-900 mb-6">Getting Started with OpenStrata</h1>
	
	<p class="text-slate-600 mb-8 prose">
		Follow these steps to set up OpenStrata for your strata corporation. Whether you're a council member, licensed manager, or self-managing your community, this guide will walk you through the prerequisites, first-time configuration, and common questions.
	</p>
	
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
		<div class="rounded-xl bg-brand-50 border border-brand-200 p-6">
			<h3 class="font-bold text-slate-800 mb-4">Prerequisites</h3>
			<ul class="list-disc list-inside text-slate-600 space-y-2">
				<li>BC strata corporation — ensure your strata is registered under the BC Strata Property Act</li>
				<li>Access to OpenStrata software — obtain credentials or set up a demo account</li>
				<li>Basic understanding of strata management — familiarity with bylaws, financial reporting, and meeting procedures</li>
				<li>Administrative access — ability to configure unit records, financial accounts, and voting settings</li>
			</ul>
		</div>
		
		<div class="rounded-xl bg-brand-50 border border-brand-200 p-6">
			<h3 class="font-bold text-slate-800 mb-4">First Steps</h3>
			<ol class="list-decimal list-inside text-slate-600 space-y-2">
				<li>Register your strata corporation in the system — enter your corporation's legal name, address, and governing documents</li>
				<li>Configure your financial accounts and trust funds — set up amana accounts, CRF allocations, and trust accounting parameters</li>
				<li>Set up bylaw enforcement and voting workflows — define kura procedures, quorum requirements, and voting thresholds for your council</li>
				<li>Integrate Satohash for Bitcoin sovereignty — enable on-chain timestamping and verification for official records</li>
			</ol>
		</div>
	</div>
	
	<div class="mt-8 pt-8 border-t border-border">
		<h3 class="font-bold text-slate-800 mb-4">FAQ</h3>
		<div class="space-y-4 text-slate-600">
			<div class="flex justify-between items-start">
				<span class="font-medium">What are the system requirements?</span>
				<span>OpenStrata runs on modern web browsers (Chrome, Firefox, Safari, Edge) and requires minimal local setup. No coding experience is needed for day-to-day use.</span>
			</div>
			<div class="flex justify-between items-start">
				<span class="font-medium">Do I need coding experience?</span>
				<span>No - OpenStrata is designed with a user-friendly interface. Customization is possible through the open source codebase for those who wish to extend the platform.</span>
			</div>
			<div class="flex justify-between items-start">
				<span class="font-medium">Can I customize the platform?</span>
				<span>Yes - being open source, you can modify and extend the platform to suit your strata's unique needs. The code is available on GitHub for forking and adaptation.</span>
			</div>
			<div class="flex justify-between items-start">
				<span class="font-medium">How do I reset my password?</span>
				<span>Use the "Forgot password" link on the sign-in page, or contact your strata council administrator to regain access.</span>
			</div>
			<div class="flex justify-between items-start">
				<span class="font-medium">What if my strata doesn't have a licensed manager?</span>
				<span>OpenStrata works for self-managed councils too. The platform provides all the tools needed for council members to manage bylaws, finances, and voting without external licensing.</span>
			</div>
		</div>
	</div>
</div>