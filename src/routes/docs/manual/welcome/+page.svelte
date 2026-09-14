<script lang="ts">
	import { copy } from '$lib/i18n';

const t = (key: string): string => copy[key] ?? key;
</script>

<section class="py-12">
	<div class="mx-auto max-w-3xl px-6">
		<div class="text-center mb-10">
			<h1 class="text-4xl font-bold text-slate-900 mb-4">Welcome to OpenStrata</h1>
			<p class="text-xl text-slate-600">
				Welcome! OpenStrata is a sovereign data portability platform for British Columbia strata.
			</p>
		</div>

		<div class="prose max-w-none text-slate-700 space-y-6">
			<h2>Who Can Use It?</h2>
			<ul>
				<li><strong>Building owners</strong> — manage lots, residents, and finances</li>
				<li><strong>Council members</strong> — vote on bylaws and approvals</li>
				<li><strong>Property managers</strong> — process payments and maintenance</li>
				<li><strong>Tech teams</strong> — developers and operators</li>
			</ul>

			<h2>Why It Matters</h2>
			<p>
				Traditional strata management costs <strong>$9,000+ per year</strong> and relies on paper records.
				OpenStrata replaces manual work with automated, auditable digital processes.
			</p>

			<h3>Key Benefits</h3>
			<ul>
				<li><strong>Cost savings</strong> — up to 80% less than traditional software</li>
				<li><strong>Transparency</strong> — full audit trail and blockchain integration</li>
				<li><strong>Compliance</strong> — built-in BCFSA regulatory support</li>
				<li><strong>Sovereignty</strong> — true data sovereignty for building associations</li>
			</ul>

			<h2>What You Can Do Here</h2>
			<p>
				This platform provides tools for:
			</p>
			<ul>
				<li>Manage unit ownership and occupancy</li>
				<li>Track AR funds and payments</li>
				<li>Run meetings and vote on bylaws</li>
				<li>Handle compliance documentation</li>
				<li>Export reports for external auditors</li>
			</ul>

			<h2>Getting Started</h2>
			<p>
				If you have an existing account, sign in to access your dashboard.
				If you're new, register to create a community and invite other owners.
			</p>
		</div>
	</div>
</section>

<!-- Quick navigation cards -->
<section class="py-8 bg-slate-50">
	<div class="mx-auto max-w-7xl px-6">
		<h2 class="text-2xl font-bold text-slate-900 mb-8 text-center">Quick Navigation</h2>
		<div class="grid md:grid-cols-3 gap-6">
			<a href="/" class="block p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
				<h3 class="font-semibold text-lg mb-2">Dashboard</h3>
				<p class="text-slate-600">Operations hub with live graphs and unit statistics.</p>
			</a>
			<a href="/tools" class="block p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
				<h3 class="font-semibold text-lg mb-2">Tools</h3>
				<p class="text-slate-600">30+ strata tool modules for reconciliation and management.</p>
			</a>
			<a href="/compliance" class="block p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
				<h3 class="font-semibold text-lg mb-2">Compliance</h3>
				<p class="text-slate-600">BC legal rules and requirements for strata management.</p>
			</a>
		</div>
	</div>
</section>
