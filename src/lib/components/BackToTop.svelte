<script lang="ts">
	/**
	 * Back to top — a floating arrow for the long pages.
	 *
	 * The docs hub, the manual sections and the compliance reference are scrolls;
	 * a reader two or three screens down had to wind back by hand. One button,
	 * appearing after the first viewport of travel, scrolling smoothly to the
	 * top. Hidden on print, honoured `prefers-reduced-motion`, and it never
	 * renders on the server (there is no scroll on the server).
	 */
	import { browser } from '$app/environment';
	import { copy } from '$lib/i18n';
	import Icon from '$lib/components/Icon.svelte';

	let { threshold = 900 }: { threshold?: number } = $props();

	let visible = $state(false);

	$effect(() => {
		if (!browser) return;
		const onScroll = () => {
			visible = window.scrollY > threshold;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function toTop() {
		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
	}
</script>

{#if browser && visible}
	<button class="back-top" aria-label={$copy.backToTop} title={$copy.backToTop} onclick={toTop}>
		<Icon name="chevron-down" class="h-4 w-4 rotate-180" />
	</button>
{/if}

<style>
	.back-top {
		position: fixed;
		right: 18px;
		bottom: 84px; /* above the mobile dock */
		z-index: 70;
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border: 1px solid var(--line);
		border-radius: 12px;
		color: var(--muted);
		background: var(--paper);
		box-shadow: 0 8px 24px rgba(10, 27, 36, 0.16);
	}
	.back-top:hover {
		color: var(--ink);
		border-color: var(--orange-solid);
	}
	@media (min-width: 900px) {
		.back-top {
			bottom: 22px;
		}
	}
	@media print {
		.back-top {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.back-top {
			transition: none;
		}
	}
</style>
