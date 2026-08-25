<script lang="ts">
  import { page } from '$app/stores';
  import { copy } from '$lib/i18n';
  import { browser } from '$app/environment';

  const status = $derived($page.status);
  const notFound = $derived(status === 404);
</script>

<svelte:head>
  <title>{notFound ? $copy.notFoundTitle : $copy.errorTitle} — OpenStrata</title>
  <meta name="description" content={notFound ? $copy.notFoundSubtitle : $copy.errorSubtitle} />
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
  <div class="brand-mark layout-brand-mark mb-8" aria-hidden="true"><span></span><span></span><span></span></div>
  <p class="mb-3 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-600">
    {status || 'Error'}
  </p>
  <h1 class="mb-4 text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
    {notFound ? $copy.notFoundTitle : $copy.errorTitle}
  </h1>
  <p class="mb-10 max-w-xl text-lg text-slate-500">
    {notFound ? $copy.notFoundSubtitle : $copy.errorSubtitle}
  </p>
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
  .layout-brand-mark { flex: 0 0 auto; }
</style>
