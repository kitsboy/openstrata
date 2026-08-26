<script lang="ts">
  import { copy } from '$lib/i18n';
  import PageToc from '$lib/components/PageToc.svelte';
  import { jurisdictions } from '$lib/data';
  import { legalSources } from '$lib/legal';

  let sourceQuery = $state('');

  const sources = $derived(
    sourceQuery.trim()
      ? legalSources.filter((source) =>
          `${source.title} ${source.authority} ${source.kind} ${source.jurisdiction}`
            .toLowerCase()
            .includes(sourceQuery.trim().toLowerCase())
        )
      : legalSources
  );
</script>

<svelte:head>
  <title>{$copy.legalLibrary} — OpenStrata</title>	<meta name="description" content={$copy.legalMetaDescription} />
</svelte:head>

<section class="border-b border-border bg-gradient-to-br from-bc-blue/5 via-brand-50/30 to-transparent">
  <div class="mx-auto max-w-7xl px-6 py-16">
    <span class="inline-flex rounded-full bg-surface-2 border border-border px-4 py-1.5 text-xs font-bold text-bc-blue">{$copy.sourceLibrary}</span>
    <h1 class="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.legalLibrary}</h1>
    <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{$copy.legalLibraryIntro}</p>
  </div>
</section>

<div class="mx-auto max-w-7xl px-6 py-12">
  <PageToc />
  <div class="mb-10 rounded-2xl border-l-4 border-l-warning bg-warning/5 p-6">
    <h2 class="font-bold text-slate-800">{$copy.legalLibraryNoticeTitle}</h2>
    <p class="mt-2 text-sm leading-relaxed text-slate-600">{$copy.legalLibraryNotice}</p>
  </div>

  <section class="mb-14">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h2 class="text-2xl font-bold text-slate-900">{$copy.primarySources}</h2><p class="mt-1 text-slate-500">{$copy.primarySourcesHint}</p></div>
      <div class="flex items-center gap-3">
        <label class="relative">
          <span class="sr-only">{$copy.search}</span>
          <input
            type="search"
            bind:value={sourceQuery}
            placeholder={$copy.search}
            class="w-52 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </label>
        <span class="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">{sources.length} {$copy.sourceLinks}</span>
      </div>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      {#each sources as source}
        <article class="glass-card rounded-2xl p-6">
          <div class="flex items-start justify-between gap-3"><span class="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700">{source.kind}</span><span class="text-xs font-semibold text-slate-400">{source.jurisdiction}</span></div>
          <h3 class="mt-4 text-lg font-bold text-slate-800">{source.title}</h3>
          <p class="mt-1 text-sm text-slate-500">{source.authority}</p>
          <a class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 no-underline hover:text-brand-700" href={source.url} target="_blank" rel="noopener noreferrer">{$copy.openOriginalSource} ↗</a>
        </article>
      {/each}
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-slate-900">{$copy.jurisdictionCoverage}</h2>
    <p class="mt-1 text-slate-500">{$copy.jurisdictionCoverageHint}</p>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each jurisdictions as jurisdiction}
        <div class="rounded-2xl border border-border bg-surface-2 p-5 {jurisdiction.active ? 'border-brand-200' : 'opacity-65'}">
          <div class="flex items-center justify-between"><span class="text-2xl">{jurisdiction.flag}</span><span class="rounded-full px-2.5 py-1 text-[10px] font-bold {jurisdiction.active ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}">{jurisdiction.active ? $copy.liveStatus : $copy.soonStatus}</span></div>
          <h3 class="mt-3 font-bold text-slate-800">{jurisdiction.name}</h3>
          <p class="mt-1 text-xs text-slate-500">{jurisdiction.laws.join(' · ')}</p>
        </div>
      {/each}
    </div>
  </section>
</div>
