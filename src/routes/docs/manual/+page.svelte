<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { copy } from '$lib/i18n';

// Manual sections for navigation
const sections = [
	{
		title: 'Welcome to OpenStrata',
		desc: 'What is OpenStrata and who can use it?',
		href: '/docs/manual/welcome'
	},
	{
		title: 'Getting Started',
		desc: 'Quick steps to start using the platform',
		href: '/docs/manual/getting-started'
	},
	{
		title: 'Platform Overview',
		desc: 'Explore the main features and tools',
		href: '/docs/manual/overview'
	},
	{
		title: 'How It Helps',
		desc: 'Benefits for building owners and managers',
		href: '/docs/manual/benefits'
	},
	{
		title: 'Monthly Review',
		desc: 'Track your progress and preferences',
		href: '/docs/manual/monthly-review'
	}
];

const t = (key: string): string => copy[key] ?? key;
</script>

<section class="py-12">
	<div class="mx-auto max-w-7xl px-6">
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-slate-900 mb-4">OpenStrata User Manual</h1>
			<p class="text-xl text-slate-600 max-w-3xl mx-auto">
				A quick, friendly guide to help you make the most of the OpenStrata platform.
			</p>
		</div>

		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each sections as section}
				<Card hover class="h-full">
					<h3 class="text-lg font-semibold text-slate-800 mb-2">{section.title}</h3>
					<p class="text-slate-600 mb-4">{section.desc}</p>
					<a href={section.href} class="inline-flex items-center gap-1 text-brand-600 font-medium hover:text-brand-700">
						Read more
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
					</a>
				</Card>
			{/each}
		</div>
	</div>
</section>
