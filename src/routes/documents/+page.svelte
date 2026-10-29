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
   *
   * The third mode is the AGM package: a contents line, then the year's sheet,
   * the meeting packet and the reserve plan, each on its own page. A council that
   * used to print three pages from three tabs now prints one stack whose order is
   * the stack's own.
   */
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page as pageStore } from '$app/stores';
  import { copy, fill, formatDate, locale } from '$lib/i18n';
  import HeroArt from '$lib/components/HeroArt.svelte';
  import PrintDoc from '$lib/components/PrintDoc.svelte';
  import YearSheet from '$lib/components/YearSheet.svelte';
  import MeetingPacket from '$lib/components/MeetingPacket.svelte';
  import ReserveSheet from '$lib/components/ReserveSheet.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { building } from '$lib/demo/building';
  import { yearBook } from '$lib/demo/year';
  import { healthTrend } from '$lib/demo/health';
  import { readFiledForms, type FiledForms } from '$lib/form-k';
  import { buildYearSheet } from '$lib/year-sheet';
  import {
    applyNoticeParams,
    documentOrganization,
    findDocument,
    printDocuments,
    type PrintDocument
  } from '$lib/documents';

  let mode = $state<'single' | 'all' | 'package'>('single');

  // A Form K recorded on a lot's sheet is a filing, and the year's sheet reads the
  // same score the dashboard shows — so the package is assembled after mount, from
  // the filings this device knows about, rather than from the register alone.
  let filedForms = $state<FiledForms>({});
  onMount(() => {
    filedForms = readFiledForms();
  });

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

  /**
   * `?package=1` opens the stack (and the contents page with it); a pick from the
   * picker leaves it, because the picker chooses one document, not a set.
   */
  $effect(() => {
    if (params.has('doc')) {
      if (mode === 'package') mode = 'single';
      return;
    }
    if (params.get('package') === '1' && mode === 'single') mode = 'package';
  });

  const monthLabel = (period: string) =>
    formatDate(`${period}-01`, $locale, { month: 'long', year: 'numeric' });

  const healthMonths = $derived(healthTrend(undefined, 6, filedForms));
  const yearSheet = $derived(
    buildYearSheet({
      ...yearBook,
      health: {
        from: { label: monthLabel(healthMonths[0].period), score: healthMonths[0].score },
        to: {
          label: monthLabel(healthMonths.at(-1)!.period),
          score: healthMonths.at(-1)!.score
        }
      }
    })
  );

  /** The contents line names the three sheets, in the order they print. */
  const contents = $derived([
    { n: 1, title: $copy.yearSheetTitle, note: $copy.yearSheetLede },
    { n: 2, title: $copy.meetPacketHeading, note: $copy.meetPacketLede },
    { n: 3, title: $copy.accReserveTitle, note: $copy.accReserveLede }
  ]);

  const prepared = $derived(
    formatDate(building.asOf, $locale, { day: 'numeric', month: 'long', year: 'numeric' })
  );

  function print() {
    window.print();
  }

  function printAll() {
    mode = 'all';
    // Let Svelte flush the full set into the DOM before opening the dialog.
    requestAnimationFrame(() => requestAnimationFrame(print));
  }

  function printPackage() {
    mode = 'package';
    requestAnimationFrame(() => requestAnimationFrame(print));
  }

  // `?print=1` — the dashboard's builder opens this page already printing. Read
  // straight from the location: this runs once, on mount, in the browser only.
  onMount(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('print') === '1') {
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
            doc.slug && mode !== 'package'
              ? 'bg-brand-600 text-white'
              : 'border border-border bg-surface-2 text-slate-600 hover:bg-slate-50'}"
            aria-current={selected.slug === doc.slug && mode !== 'package' ? 'page' : undefined}
            >{doc.title}</a
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

  <!-- The whole set a council hands over, in one stack. The order is the stack's
       own, so nobody has to remember which tab printed first. -->
  <div class="mt-6 rounded-2xl border border-border bg-surface-2 p-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-base font-bold text-slate-900">{$copy.documentsPackageContents}</h2>
        <ol class="mt-2 space-y-1 text-sm text-slate-600">
          {#each contents as item (item.n)}
            <li class="flex gap-2">
              <span class="font-mono text-xs text-slate-400">{item.n}</span>
              <span><span class="font-semibold text-slate-800">{item.title}</span> — {item.note}</span>
            </li>
          {/each}
        </ol>
        <p class="mt-2 text-xs text-slate-500">{$copy.documentsPackageHint}</p>
      </div>
      <button
        class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slab px-4 py-2.5 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
        onclick={printPackage}
      >
        <Icon name="file" class="h-4 w-4" /> {$copy.documentsPackage}
      </button>
    </div>
  </div>
</div>

<div class="mx-auto max-w-7xl px-6 pb-20">
  {#if mode === 'package'}
    <!-- A contents page of its own, so a reader knows what is in the stack before
         they reach it. Every sheet below starts a fresh page. -->
    <div class="print-page mb-12">
      <article class="print-doc package-doc" aria-labelledby="package-title">
        <header class="package-letterhead">
          <div>
            <p class="package-org">{building.name}</p>
            <p class="package-org-line">{building.legalName}</p>
            <p class="package-org-line">{building.address}, {building.city}, {building.province} {building.postal}</p>
            <p class="package-org-line">Strata Plan {building.plan}</p>
          </div>
          <p class="package-prepared">{fill($copy.documentsPackagePrepared, { date: prepared })}</p>
        </header>

        <h1 id="package-title">{$copy.documentsPackageContents}</h1>
        <p class="package-subtitle">{building.fiscalLabel} · {building.asOfLabel}</p>

        <ol class="package-contents">
          {#each contents as item (item.n)}
            <li>
              <p class="package-item"><span class="package-n">{item.n}</span> {item.title}</p>
              <p class="package-note">{item.note}</p>
            </li>
          {/each}
        </ol>

        <p class="package-foot">{$copy.documentsPackageHint}</p>
      </article>
    </div>

    <div class="print-page mb-12">
      <YearSheet sheet={yearSheet} />
    </div>
    <div class="print-page mb-12">
      <MeetingPacket />
    </div>
    <div class="print-page mb-12">
      <ReserveSheet />
    </div>
  {:else if mode === 'all'}
    {#each printDocuments as doc (doc.slug)}
      <div class="print-page mb-12">
        <PrintDoc {doc} org={documentOrganization} />
      </div>
    {/each}
  {:else}
    <PrintDoc doc={selected} org={documentOrganization} />
  {/if}
</div>

<style>
  /* Paper values, not theme tokens: the contents page is part of the stack. */
  .package-doc {
    width: 100%;
    max-width: 52rem;
    margin: 0 auto;
    padding: 2.5rem 2.5rem 2rem;
    border: 1px solid #dfe4e8;
    border-radius: 14px;
    background: #ffffff;
    color: #14181c;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 10.5pt;
    line-height: 1.45;
    box-shadow: 0 24px 60px rgba(16, 45, 59, 0.16);
  }
  .package-letterhead {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 2rem;
    padding-bottom: 14px;
    border-bottom: 2px solid #dfe4e8;
  }
  .package-org {
    margin: 0;
    font-size: 15pt;
    font-weight: 700;
    line-height: 1.15;
  }
  .package-org-line {
    margin: 1px 0 0;
    color: #5a6672;
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 7.6pt;
    letter-spacing: 0.02em;
  }
  .package-prepared {
    margin: 0;
    color: #3f4a55;
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 8pt;
    text-align: right;
  }
  .package-doc h1 {
    margin: 22px 0 0;
    font-size: 19pt;
    font-weight: 700;
    letter-spacing: -0.015em;
    line-height: 1.1;
  }
  .package-subtitle {
    margin: 4px 0 0;
    color: #3f4a55;
    font-size: 10pt;
  }
  .package-contents {
    margin: 18px 0 0;
    padding: 0;
    list-style: none;
  }
  .package-contents li {
    padding: 10px 0;
    border-bottom: 1px solid #edf1f3;
    break-inside: avoid;
  }
  .package-item {
    margin: 0;
    font-size: 12pt;
    font-weight: 700;
  }
  .package-n {
    display: inline-block;
    min-width: 1.4rem;
    color: #f0801a;
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 9pt;
    font-weight: 500;
  }
  .package-note {
    margin: 2px 0 0 1.4rem;
    color: #5a6672;
    font-size: 9pt;
  }
  .package-foot {
    margin: 18px 0 0;
    padding: 7px 10px;
    border-left: 3px solid #f0801a;
    background: #fdf6ef;
    color: #3f4a55;
    font-size: 8.6pt;
  }

  @media (max-width: 640px) {
    .package-doc {
      padding: 1.5rem 1.25rem;
      border-radius: 10px;
      font-size: 10pt;
    }
    .package-letterhead {
      flex-direction: column;
      gap: 10px;
    }
    .package-prepared {
      text-align: left;
    }
  }
</style>
