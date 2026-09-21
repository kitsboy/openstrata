<script lang="ts">
  import { page } from '$app/stores';
  import { copy } from '$lib/i18n';
  import { browser } from '$app/environment';
  import BrandMark from '$lib/components/BrandMark.svelte';

  const status = $derived($page.status);
  const notFound = $derived(status === 404);

  /**
   * The dead URL, read as search words. A mistyped path is usually a page name
   * — "form-b" or "template_print" — so the same words run through the site
   * search instead of leaving the visitor at a dead end. Structure words are
   * dropped; what is left becomes one `/search?q=` link per word.
   */
  const rescueWords = $derived(
    notFound
      ? decodeURIComponent($page.url.pathname)
          .split(/[^a-z0-9\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF\u4E00-\u9FFF]+/i)
          .filter((word) => word.length >= 2 && !STOP_WORDS.has(word.toLowerCase()))
          .slice(0, 6)
      : []
  );
  const STOP_WORDS = new Set(['www', 'com', 'html', 'php', 'index', 'en', 'the', 'and', 'page']);
</script>

<svelte:head>
  <title>{notFound ? $copy.notFoundTitle : $copy.errorTitle} — OpenStrata</title>
  <meta name="description" content={notFound ? $copy.notFoundSubtitle : $copy.errorSubtitle} />
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
  <BrandMark size={40} class="mb-8" />
  <p class="mb-3 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-600">
    {status || 'Error'}
  </p>
  <h1 class="mb-4 text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
    {notFound ? $copy.notFoundTitle : $copy.errorTitle}
  </h1>
  <p class="mb-6 max-w-xl text-lg text-slate-500">
    {notFound ? $copy.notFoundSubtitle : $copy.errorSubtitle}
  </p>
  {#if rescueWords.length > 0}
    <div class="mb-10 flex flex-col items-center gap-3">
      <p class="text-sm font-bold text-slate-500">{$copy.errorSearchTitle}</p>
      <div class="flex flex-wrap items-center justify-center gap-2">
        {#each rescueWords as word (word)}
          <a
            href={`/search?q=${encodeURIComponent(word)}`}
            class="rounded-full border border-border bg-surface-2 px-4 py-1.5 text-sm font-semibold text-brand-700 no-underline transition-colors hover:bg-slate-50"
          >
            {word}
          </a>
        {/each}
      </div>
    </div>
  {:else}
    <div class="mb-10"></div>
  {/if}
  <div class="flex flex-wrap items-center justify-center gap-4">
    <a
      href="/"
      class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-brand-700"
    >
      {$copy.backHome}
    </a>
    {#if notFound && browser}
      <button
        class="rounded-xl border border-border bg-surface-2 px-6 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        onclick={() => history.back()}
      >
        {$copy.goBack}
      </button>
    {/if}
  </div>
</div>

<style>
</style>
