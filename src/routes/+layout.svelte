<script lang="ts">
	import '../app.css';
	import { navItems, socialLinks } from '$lib/nav';
	import { page } from '$app/stores';

	let { children } = $props();
	const currentYear = new Date().getFullYear();
</script>

<div class="flex min-h-screen flex-col">
	<!-- Header -->
	<header class="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
		<nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href="/" class="flex items-center gap-2 text-lg font-bold tracking-tight no-underline text-white hover:text-brand-400 transition-colors">
				<span class="text-2xl">🌐</span>
				<span>OpenStrata</span>
			</a>
			<div class="flex items-center gap-6">
				{#each navItems as item}
					<a
						href={item.href}
						class="text-sm font-medium transition-colors no-underline hover:text-brand-400
							{$page.url.pathname === item.href ? 'text-brand-400' : 'text-zinc-400'}"
					>
						{item.label}
					</a>
				{/each}
			</div>
		</nav>
	</header>

	<!-- Main -->
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t border-border bg-surface-2">
		<div class="mx-auto max-w-6xl px-6 py-12">
			<div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
				<div class="flex items-center gap-2 text-sm text-zinc-500">
					<span class="text-lg">🌐</span>
					<span>OpenStrata — Sovereign Data Portability</span>
				</div>
				<div class="flex items-center gap-4">
					{#each socialLinks as link}
						<a
							href={link.href}
							class="text-sm text-zinc-500 no-underline hover:text-brand-400 transition-colors"
							target="_blank"
							rel="noopener noreferrer"
						>
							{link.icon} {link.label}
						</a>
					{/each}
				</div>
			</div>
			<div class="mt-6 text-center text-xs text-zinc-600">
				&copy; {currentYear} Give A Bit — Bitcoin Sovereignty First
			</div>
		</div>
	</footer>
</div>
