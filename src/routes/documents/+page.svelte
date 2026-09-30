<script lang="ts">
  /**
   * Print-ready documents.
   *
   * Everything on this page exists so a council can hand paper to a person: a
   * real letterhead, real page furniture, and a page that prints as a document
   * rather than as a screenshot of a website. The picker and the controls are
   * `no-print`; the sheet is not.
   *
   * It is also the print target for the dashboard's notice builder, which hands
   * its date, place and agenda over in the query string (`?doc=notice&print=1…`)
   * so there is exactly one printable notice in the codebase.
   */
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page as pageStore } from '$app/stores';
  import { copy } from '$lib/i18n';
  import HeroArt from '$lib/components/HeroArt.svelte';
  import PrintDoc from '$lib/components/PrintDoc.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import {
    applyNoticeParams,
    documentOrganization,
    findDocument,
    printDocuments,
    type PrintDocument
  } from '$lib/documents';

  let mode = $state<'single' | 'all'>('single');

  // `$page.url.searchParams` throws during prerendering, so the query string is
  // held as plain state and only ever read in the browser. It stays reactive, so
  // the picker links (which are real navigations) still switch documents.
  let search = $state('');
  $effect(() => {
    const next = $pageStore.url.search;
    if (browser) search = next;
  });

  const params = $derived(new URLSearchParams(search));

  /** The chosen document, with any council-supplied notice details applied. */
  const selected = $derived.by<PrintDocument>(() => {
    const base = findDocument(params.get('doc') ?? '') ?? printDocuments[0]!;
    if (base.slug !== 'notice') return base;
    return applyNoticeParams(base, {
      type: params.get('type') ?? undefined,
      when: params.get('when') ?? undefined,
      time: params.get('time') ?? undefined,
      where: params.get('where') ?? undefined,
      agenda: params.get('agenda') ?? undefined
    });
  });

  function print() {
    window.print();
  }

  function printAll() {
    mode = 'all';
    // Let Svelte flush the full set into the DOM before opening the dialog.
    requestAnimationFrame(() => requestAnimationFrame(print));
  }

  // `?print=1` — the dashboard's builder opens this page already printing. Read
  // straight from the location: this runs once, on mount, in the browser only.
  onMount(() => {
    if (new URLSearchParams(window.location.search).get('print') === '1') {
      requestAnimationFrame(() => requestAnimationFrame(print));
    }
  });
</script>

<svelte:head>
  <title>{$copy.documentsPageTitle}</title>
  <meta name="description" content={$copy.documentsMetaDescription} />
</svelte:head>

<section class="page-hero no-print">
  <HeroArt variant="ledger" />
  <div class="mx-auto max-w-7xl px-6 py-16">
    <span class="inline-flex rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-700"
      >{$copy.documentsBadge}</span
    >
    <h1 class="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.documentsTitle}</h1>
    <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{$copy.documentsIntro}</p>
  </div>
</section>

<div class="mx-auto max-w-7xl px-6 py-10 no-print">
  <div class="rounded-2xl border-l-4 border-l-warning bg-warning/5 p-5">
    <h2 class="text-base font-bold text-slate-800">{$copy.documentsSampleTitle}</h2>
    <p class="mt-1.5 text-sm leading-relaxed text-slate-600">{$copy.documentsSampleNote}</p>
  </div>

  <div class="mt-8 flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-0">
      <h2 class="text-lg font-bold text-slate-900">{$copy.documentsPick}</h2>
      <div class="mt-3 flex flex-wrap gap-2">
        {#each printDocuments as doc (doc.slug)}
          <a
            href={`/documents?doc=${doc.slug}`}
            class="rounded-full px-4 py-1.5 text-xs font-bold no-underline transition-colors {selected.slug ===
            doc.slug
              ? 'bg-brand-600 text-white'
              : 'border border-border bg-surface-2 text-slate-600 hover:bg-slate-50'}"
            aria-current={selected.slug === doc.slug ? 'page' : undefined}>{doc.title}</a
          >
        {/each}
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <button
        class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        onclick={printAll}
      >
        <Icon name="file" class="h-4 w-4" /> {$copy.documentsPrintAll}
      </button>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        onclick={print}
      >
        <Icon name="download" class="h-4 w-4" /> {$copy.documentsPrint}
      </button>
    </div>
  </div>

  <p class="mt-3 text-xs text-slate-500">{$copy.documentsPrintHint}</p>
</div>

<div class="mx-auto max-w-7xl px-6 pb-20">
  {#if mode === 'all'}
    {#each printDocuments as doc (doc.slug)}
      <div class="print-page mb-12">
        <PrintDoc {doc} org={documentOrganization} />
      </div>
    {/each}
  {:else}
    <PrintDoc doc={selected} org={documentOrganization} />
  {/if}
</div>
