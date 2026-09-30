<script lang="ts">
  /**
   * Shareable search — `/search?q=…`.
   *
   * The ⌘K modal is ephemeral: close it and the query is gone. A council member
   * who finds "Form B" often needs to send that finding to a neighbour — a link
   * they can bookmark or text is the honest answer. The modal links here with
   * the query in the URL; this page runs the same index, so the results can
   * never disagree with what the modal showed.
   */
  import { browser } from '$app/environment';
  import { page as pageStore } from '$app/stores';
  import { copy } from '$lib/i18n';
  import HeroArt from '$lib/components/HeroArt.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { buildSearchIndex, searchIndex, searchGroupLabels, type SearchEntry } from '$lib/search';

  let search = $state('');
  $effect(() => {
    const next = $pageStore.url.search;
    if (browser) search = next;
  });

  const query = $derived(new URLSearchParams(search).get('q') ?? '');
  const index = $derived(buildSearchIndex($copy));
  const groupLabel = $derived(searchGroupLabels($copy));
  const results = $derived(query ? searchIndex(index, query, 24) : []);
</script>

<svelte:head>
  <title>{$copy.searchPageTitle}</title>
  <meta name="description" content={$copy.searchMetaDescription} />
  <meta name="robots" content="noindex, follow" />
</svelte:head>

<section class="page-hero">
  <HeroArt variant="signal" />
  <div class="mx-auto max-w-7xl px-6 py-16">
    <span class="inline-flex rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-700"
      >{$copy.search}</span
    >
    <h1 class="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
      {query ? `“${query}”` : $copy.search}
    </h1>
    <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{$copy.searchHint}</p>
  </div>
</section>

<div class="mx-auto max-w-4xl px-6 pb-20">
  {#if !query}
    <form
      class="flex gap-3"
      onsubmit={(event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget as HTMLFormElement).get('q');
        if (value) window.location.search = `?q=${encodeURIComponent(String(value))}`;
      }}
    >
      <input
        name="q"
        class="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-slate-800 outline-none focus:border-brand-400"
        placeholder={$copy.search}
        aria-label={$copy.search}
      />
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
      >
        <Icon name="search" class="h-4 w-4" /> {$copy.search}
      </button>
    </form>
    <p class="mt-4 text-sm text-slate-500">{$copy.searchPageIntro}</p>
  {:else if results.length === 0}
    <p class="glass-card rounded-2xl p-6 text-slate-600">{$copy.searchNoResults} “{query}”</p>
  {:else}
    <p class="text-xs font-bold uppercase tracking-widest text-slate-400">
      {results.length} {$copy.searchResultsCount}
    </p>
    <ul class="mt-4 space-y-3">
      {#each results as result (result.href + result.title)}
        <li>
          <a
            href={result.href}
            class="glass-card block rounded-2xl p-5 no-underline transition-colors hover:border-brand-300"
          >
            <span
              class="inline-block rounded-full bg-surface-3 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-500"
              >{groupLabel[result.group]}</span
            >
            <strong class="mt-2 block text-slate-900">{result.title}</strong>
            <span class="mt-1 block text-sm text-slate-600">{result.description}</span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>
