<script lang="ts">
	import { copy } from '$lib/i18n';
	import Card from '$lib/components/Card.svelte';

const t = (key: string): string => copy[key] ?? key;
</script>

<section class="py-12">
	<div class="mx-auto max-w-3xl px-6">
		<div class="text-center mb-10">
			<h1 class="text-4xl font-bold text-slate-900 mb-4">Getting Started</h1>
			<p class="text-xl text-slate-600">
				Quick steps to start using the OpenStrata platform effectively.
			</p>
		</div>

		<div class="grid md:grid-cols-2 gap-8">
			<div class="bg-white rounded-xl p-8 shadow-lg">
				<h2 class="text-2xl font-bold text-slate-900 mb-6">Prerequisites</h2>
				<ul class="space-y-3 text-slate-700">
					<li>• Computer with internet access</li>
					<li>• Web browser (Chrome, Firefox, Safari, Edge)</li>
					<li>• Account access (create if needed)</li>
				</ul>
			</div>

			<div class="bg-white rounded-xl p-8 shadow-lg">
				<h2 class="text-2xl font-bold text-slate-900 mb-6">First Steps</h2>
				<ol class="space-y-3 text-slate-700">
					<li>1. Register for an account</li>
					<li>2. Log in and explore the dashboard</li>
					<li>3. Set up your community/profile</li>
					<li>4. Add units and residents</li>
					<li>5. Start using tools for reconciliation</li>
				</ol>
			</div>
		</div>

		<div class="mt-12 bg-brand-50 rounded-xl p-8">
			<h2 class="text-2xl font-bold text-slate-900 mb-6">Quick Tutorial Video</h2>
			<div class="aspect-video bg-slate-200 rounded-lg flex items-center justify-center">
				<p class="text-slate-500">Video placeholder - Setup tutorial would go here</p>
			</div>
		</div>
	</div>
</section>

<!-- FAQ Section -->
<section class="py-12 bg-slate-50">
	<div class="mx-auto max-w-3xl px-6">
		<h2 class="text-3xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
		<div class="space-y-6">
			<div class="bg-white rounded-lg p-6 shadow">
				<h3 class="font-semibold text-lg mb-2">How much does OpenStrata cost?</h3>
				<p class="text-slate-600">OpenStrata offers affordable pricing starting at $0/month for essential features. Premium plans are available for advanced functionality and support.</p>
			</div>
			<div class="bg-white rounded-lg p-6 shadow">
				<h3 class="font-semibold text-lg mb-2">Do I need technical experience?</h3>
				<p class="text-slate-600">No technical experience required! The platform is designed for building owners and managers of all technical levels. We provide step-by-step guides and support.</p>
			</div>
			<div class="bg-white rounded-lg p-6 shadow">
				<h3 class="font-semibold text-lg mb-2">Is my data secure?</h3>
				<p class="text-slate-600">Yes. OpenStrata uses enterprise-grade security including encryption, secure backups, and compliance with BC privacy laws. Your data is protected with multiple layers of security.</p>
			</div>
		</div>
	</div>
</section>
