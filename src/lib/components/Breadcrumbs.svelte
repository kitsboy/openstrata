<script lang="ts">
  // Consistent breadcrumb/eyebrow trail on every marketing page — one voice
  // with the dashboard's own topbar breadcrumbs.
  import { page } from '$app/stores';
  import { navItems } from '$lib/nav';
  import { copy, type Translation } from '$lib/i18n';
  import Icon from '$lib/components/Icon.svelte';

  // Nested routes resolve to their parent nav item + a leaf label.
  const leafLabels: Partial<Record<string, keyof Translation>> = {
    '/tools/wizard': 'wizardTitle'
  };

  const trail = $derived.by(() => {
    const pathname = $page.url.pathname;
    const crumbs: Array<{ href?: string; label: string }> = [{ href: '/', label: $copy.overview }];
    const parent = navItems.find((item) => item.href !== '/' && pathname.startsWith(item.href));
    if (parent) crumbs.push({ href: parent.href, label: parent.label });
    const leafKey = Object.keys(leafLabels).find((route) => pathname === route);
    if (leafKey) crumbs.push({ label: $copy[leafLabels[leafKey]!] });
    return crumbs;
  });
</script>

<nav class="page-breadcrumbs" aria-label="Breadcrumb">
  {#each trail as crumb, i}
    {#if i > 0}<Icon name="chevron-right" class="crumb-sep h-3 w-3" />{/if}
    {#if crumb.href}
      <a href={crumb.href} class="crumb-link no-underline">{crumb.label}</a>
    {:else}
      <span class="crumb-current">{crumb.label}</span>
    {/if}
  {/each}
</nav>

<style>
  .page-breadcrumbs {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 0 auto;
    padding: 14px 24px 0;
    max-width: 80rem;
    color: var(--faint);
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .crumb-link { color: var(--faint); transition: color .15s ease; }
  .crumb-link:hover { color: var(--orange); }
  .crumb-current { color: var(--ink); font-weight: 700; }
</style>
