<script lang="ts">
  import { copy } from '$lib/i18n';
  import { jurisdictions } from '$lib/data';

  const sources = [
    { title: 'BC Strata Property Act', authority: 'BC Laws', jurisdiction: 'BC', url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/98043_00', kind: 'Primary legislation' },
    { title: 'BC Strata Property Regulation', authority: 'BC Laws', jurisdiction: 'BC', url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/12_43_2000', kind: 'Regulation' },
    { title: 'BC Strata legislation and changes', authority: 'Government of British Columbia', jurisdiction: 'BC', url: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/strata-housing/legislation-and-changes/strata-legislation', kind: 'Official guidance' },
    { title: 'Information and record keeping', authority: 'Government of British Columbia', jurisdiction: 'BC', url: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/strata-housing/operating-a-strata/information-and-record-keeping', kind: 'Official guidance' },
    { title: 'Civil Resolution Tribunal — strata disputes', authority: 'Civil Resolution Tribunal', jurisdiction: 'BC', url: 'https://civilresolutionbc.ca/how-the-crt-works/strata-property-disputes/', kind: 'Tribunal information' },
    { title: 'BC Personal Information Protection Act', authority: 'BC Laws', jurisdiction: 'BC', url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/03063_01', kind: 'Privacy legislation' },
    { title: 'BC Electronic Transactions Act', authority: 'BC Laws', jurisdiction: 'BC', url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/01010_01', kind: 'Electronic records legislation' },
    { title: 'BC Human Rights Code', authority: 'BC Laws', jurisdiction: 'BC', url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/00_96210_01', kind: 'Human rights legislation' }
  ];
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
  <div class="mb-10 rounded-2xl border-l-4 border-l-warning bg-warning/5 p-6">
    <h2 class="font-bold text-slate-800">{$copy.legalLibraryNoticeTitle}</h2>
    <p class="mt-2 text-sm leading-relaxed text-slate-600">{$copy.legalLibraryNotice}</p>
  </div>

  <section class="mb-14">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h2 class="text-2xl font-bold text-slate-900">{$copy.primarySources}</h2><p class="mt-1 text-slate-500">{$copy.primarySourcesHint}</p></div>
      <span class="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">{sources.length} {$copy.sourceLinks}</span>
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
