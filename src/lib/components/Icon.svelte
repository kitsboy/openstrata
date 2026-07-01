<script lang="ts">
	import { icons } from '$lib/icons';

	let { name, class: className = 'h-5 w-5' }: { name: keyof typeof icons; class?: string } = $props();
</script>

<span class="inline-flex shrink-0 {className}" aria-hidden="true">
	{@html icons[name]}
</span>