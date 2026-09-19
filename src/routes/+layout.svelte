<script lang="ts">
  import '../app.css';
  import { navGroups, navItems, socialLinks, isNavGroup } from '$lib/nav';
  import { page } from '$app/stores';
  import { jurisdictions } from '$lib/data';
  import Icon from '$lib/components/Icon.svelte';
  import BrandMark from '$lib/components/BrandMark.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import JobsDropdown from '$lib/components/JobsDropdown.svelte';
  import DonateModal from '$lib/components/DonateModal.svelte';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import SearchModal from '$lib/components/SearchModal.svelte';
  import NavMenu from '$lib/components/NavMenu.svelte';
  import PwaChrome from '$lib/components/PwaChrome.svelte';
  import { copy } from '$lib/i18n';
  import { theme, toggleTheme } from '$lib/theme';
  import { browser } from '$app/environment';
  import { bootstrap } from '$lib/api/auth';
  import { onMount } from 'svelte';
  import { onNavigate } from '$app/navigation';
  import packageJson from '../../package.json';

  let { children } = $props();

  // Register the PWA service worker. `browser` keeps this out of SSR/prerender:
  // Node 20 (Cloudflare Pages) has no global `navigator`, so an unguarded check
  // crashes the production build during prerendering.
  if (browser && import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline caching is progressive enhancement */
    });
  }
  // Restore the backend session once, client-side. When no API base URL is
  // configured (or the host is unreachable), the auth store settles into demo
  // mode and every widget keeps showing curated sample data.
  onMount(() => {
    bootstrap();
  });

  // Route view transitions: fade + 4px slide between pages when the browser
  // supports the View Transitions API and the user hasn't opted out of motion.
  onNavigate((navigation) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduced || navigation.type === 'popstate') return;
    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  const currentYear = new Date().getFullYear();
  const appVersion = packageJson.version;

  /** Active state for a top-level link, including its nested routes. */
  function isCurrent(href: string) {
    const path = $page.url.pathname;
    return href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
  }
  let donateOpen = $state(false);
  let mobileNavOpen = $state(false);
  let selectedJurisdiction = $state('BC');
  let searchOpen = $state(false);

  // Cmd/Ctrl+K opens the site search from anywhere.
  $effect(() => {
    function onKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchOpen = true;
      }
      if (event.key === 'Escape') searchOpen = false;
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });
</script>

<svelte:head>
  <meta name="openstrata-version" content={appVersion} />    <meta name="description" content={`OpenStrata v${appVersion} — modern operations for strata and condominium communities.`} />
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="OpenStrata" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</svelte:head>

<PwaChrome />

{#if $page.url.pathname === '/'}
  {@render children()}
{:else}
<div class="flex min-h-screen flex-col mesh-bg">
  <header class="no-print sticky top-0 z-50 border-b border-border bg-surface-2/80 backdrop-blur-md">
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
      <a href="/" class="flex items-center gap-3 no-underline group shrink-0">
        <BrandMark size={28} />
        <div>
          <span class="block text-lg font-bold tracking-tight text-slate-800 group-hover:text-brand-700 transition-colors">OpenStrata</span>
          <span class="block text-[10px] font-medium uppercase tracking-widest text-brand-600/70">Community operations · v{appVersion}</span>
        </div>
      </a>

      <!-- Four inline destinations plus two grouped menus. Twelve flat links
           plus the actions cluster need ~1490px inside a 1232px bar, so the
           strip scrolled internally on every ordinary laptop and hid half the
           site behind a scrollbar nobody notices. Grouping brings the six
           top-level items down to ~500px; the strip starts at `xl` (1280px),
           below which the grouped drawer and the floating bottom dock carry
           navigation instead of a bar that clips its own edges. -->
      <div class="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-0.5">
        {#each navGroups as entry (isNavGroup(entry) ? entry.label : entry.href)}
          {#if isNavGroup(entry)}
            <NavMenu label={entry.label} items={entry.items} align={entry.align ?? 'left'} />
          {:else}
            <a href={entry.href} class="rounded-lg px-2.5 py-2 text-[13px] font-semibold no-underline whitespace-nowrap transition-colors {isCurrent(entry.href) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'}">{entry.label}</a>
          {/if}
        {/each}
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <button class="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors" onclick={() => (searchOpen = true)} aria-label={$copy.search} title={$copy.search}>
          <Icon name="search" class="h-3.5 w-3.5" /> <kbd class="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-slate-400">⌘K</kbd>
        </button>
        <button class="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors" onclick={toggleTheme} aria-label={$copy.toggleTheme} title={$copy.toggleTheme}>
          {#if $theme === 'dark'}<Icon name="sun" class="h-4 w-4" />{:else}<Icon name="moon" class="h-4 w-4" />{/if}
        </button>
        <select bind:value={selectedJurisdiction} class="hidden xl:block rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-300" aria-label={$copy.jurisdiction}>
          {#each jurisdictions as j}
            <option value={j.code} disabled={!j.active}>{j.flag} {j.code}{!j.active ? ' (soon)' : ''}</option>
          {/each}
        </select>
        <LanguageSwitcher />
        <button class="hidden sm:flex items-center gap-1.5 rounded-lg bg-bitcoin/10 px-3.5 py-2 text-sm font-semibold text-bitcoin hover:bg-bitcoin/20 transition-colors" onclick={() => (donateOpen = true)}>
          <Icon name="lightning" class="h-4 w-4" /> {$copy.donate}
        </button>
        <button class="xl:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100" onclick={() => (mobileNavOpen = !mobileNavOpen)} aria-label={$copy.menu}>
          {#if mobileNavOpen}<Icon name="close" class="h-4 w-4" />{:else}<Icon name="menu" class="h-4 w-4" />{/if}
        </button>
      </div>
    </nav>

    {#if mobileNavOpen}
      <!-- Mirrors the desktop grouping so the two never teach different
           structures, and scrolls internally because it is now taller than a
           short phone viewport. -->
      <div class="xl:hidden max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-border bg-surface-2 px-6 py-4 space-y-1">
        {#each navGroups as entry (isNavGroup(entry) ? entry.label : entry.href)}
          {#if isNavGroup(entry)}
            <p class="pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{entry.label}</p>
            {#each entry.items as item (item.href)}
              <a href={item.href} class="block rounded-lg px-4 py-2.5 text-sm font-medium no-underline {isCurrent(item.href) ? 'bg-brand-50 text-brand-700' : 'text-slate-600'}" onclick={() => (mobileNavOpen = false)}>{item.label}</a>
            {/each}
          {:else}
            <a href={entry.href} class="block rounded-lg px-4 py-2.5 text-sm font-medium no-underline {isCurrent(entry.href) ? 'bg-brand-50 text-brand-700' : 'text-slate-600'}" onclick={() => (mobileNavOpen = false)}>{entry.label}</a>
          {/if}
        {/each}
        <div class="mt-4"><LanguageSwitcher /></div>
        <button class="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-bitcoin/10 px-4 py-2.5 text-sm font-semibold text-bitcoin" onclick={() => { donateOpen = true; mobileNavOpen = false; }}><Icon name="lightning" class="h-4 w-4" /> {$copy.donate} BTC/LN</button>
      </div>
    {/if}
  </header>

  <main class="flex-1">
    <Breadcrumbs />
    {@render children()}
  </main>

  <!-- Mobile bottom nav — the dashboard's floating dock, reused on every page
       so the marketing site never dead-ends on phones. -->
  <nav class="marketing-mobile-nav" aria-label={$copy.mobileNavigation}>
    <a href="/" class:active={String($page.url.pathname) === '/'} class="no-underline"><Icon name="home" class="h-4 w-4" /><span>{$copy.overview}</span></a>
    <a href="/tools" class:active={$page.url.pathname === '/tools'} class="no-underline"><Icon name="building" class="h-4 w-4" /><span>{$copy.buildings}</span></a>
    <a href="/legal" class:active={$page.url.pathname === '/legal'} class="no-underline"><Icon name="scale" class="h-4 w-4" /><span>{$copy.legal}</span></a>
    <button onclick={() => (mobileNavOpen = !mobileNavOpen)} aria-label={$copy.menu}><Icon name="menu" class="h-4 w-4" /><span>{$copy.menu}</span></button>
  </nav>

  <footer class="no-print border-t border-border bg-surface-2">
    <div class="mx-auto max-w-7xl px-6 py-14">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div class="lg:col-span-1">
          <div class="flex items-center gap-3 mb-4"><BrandMark size={24} /><span class="font-bold text-slate-800">OpenStrata</span></div>
          <p class="text-sm text-slate-500 leading-relaxed">{$copy.footerTag}</p>
          <div class="mt-5 flex items-center gap-3">{#each socialLinks as link}<a href={link.href} class="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-slate-500 no-underline hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all" target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined} aria-label={link.label} title={link.label}><Icon name={link.icon} class="h-4 w-4" /></a>{/each}</div>
        </div>
        <div><h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">{$copy.product}</h3><ul class="space-y-2.5">{#each navItems as item}<li><a href={item.href} class="text-sm text-slate-500 no-underline hover:text-brand-600 transition-colors">{item.label}</a></li>{/each}</ul></div>
        <div><h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">{$copy.jurisdiction}</h3><ul class="space-y-2.5">{#each jurisdictions as j}<li class="flex items-center gap-2 text-sm {j.active ? 'text-slate-600' : 'text-slate-400'}"><span>{j.flag}</span><span>{j.name}</span>{#if j.active}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveStatus}</span>{:else}<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase">{$copy.soonStatus}</span>{/if}</li>{/each}</ul></div>
        <div><h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">{$copy.resources}</h3><div class="space-y-4"><JobsDropdown /><button class="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-bitcoin/30 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 text-sm font-semibold text-bitcoin hover:border-bitcoin/50 transition-all" onclick={() => (donateOpen = true)}><Icon name="bitcoin" class="h-4 w-4" /><Icon name="lightning" class="h-4 w-4" /> {$copy.donate} BTC/LN</button><a href="mailto:hello@giveabit.io" class="flex items-center gap-2 text-sm text-slate-500 no-underline hover:text-brand-600 transition-colors"><Icon name="mail" class="h-4 w-4" /> hello@giveabit.io</a></div></div>
      </div>
      <div class="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4"><p class="text-xs text-slate-400">&copy; {currentYear} Give A Bit · OpenStrata v{appVersion} · <a href="/privacy" class="no-underline hover:text-brand-600 transition-colors">Privacy</a> · <a href="/terms" class="no-underline hover:text-brand-600 transition-colors">Terms</a><br /><span class="text-slate-400">No cookies. We use self-hosted, cookie-less analytics. Nothing to consent to.</span></p><p class="text-xs text-slate-400 text-center sm:text-right max-w-md">BC-first MVP. Config-driven expansion to ON, AB, US states, and EU markets. {$copy.legalDisclaimer}</p></div>
    </div>
  </footer>
</div>
{/if}

<DonateModal bind:open={donateOpen} />
<SearchModal bind:open={searchOpen} />

