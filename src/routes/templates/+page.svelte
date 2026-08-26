<script lang="ts">
  import { copy } from '$lib/i18n';
  import { templates } from '$lib/templates';
  import Card from '$lib/components/Card.svelte';
  import { goto } from '$app/navigation';

  const categories = ['all', 'templateCategoryLegal', 'templateCategoryGovernance', 'templateCategoryFinance'] as const;
  let filter = $state<(typeof categories)[number]>('all');

  const visible = $derived(
    filter === 'all' ? templates : templates.filter((tpl) => tpl.category === filter)
  );

  function useTemplate(name: string) {
    // Prefill the wizard and jump to it.
    localStorage.setItem('openstrata-wizard-prefill', JSON.stringify({ name }));
    goto('/tools/wizard');
  }
</script>

<svelte:head>
  <title>{$copy.templatesTitle} — OpenStrata</title>	<meta name="description" content={$copy.templatesMetaDescription} />
</svelte:head>

<section class="border-b border-border bg-gradient-to-br from-brand-50/50 via-white to-bc-blue/5">
  <div class="mx-auto max-w-7xl px-6 py-16">
    <span class="inline-flex rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-700">{$copy.templates}</span>
    <h1 class="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.templatesTitle}</h1>
    <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{$copy.templatesIntro}</p>
  </div>
</section>

<div class="mx-auto max-w-7xl px-6 py-12">
  <div class="mb-10 rounded-2xl border-l-4 border-l-warning bg-warning/5 p-6">
    <h2 class="text-xl font-bold text-slate-800">{$copy.templateNoticeTitle}</h2>
    <p class="mt-2 text-sm leading-relaxed text-slate-600">{$copy.templateNotice}</p>
  </div>

  <section>
    <div class="mb-6">
      <div class="flex flex-wrap items-end justify-between gap-4"><h2 class="text-2xl font-bold text-slate-900">{$copy.templateLibrary}</h2><p class="mt-1 text-slate-500">{$copy.templateLibraryHint}</p></div>
      <div class="mt-4 flex flex-wrap gap-2">
        {#each categories as category}
          <button
            class="rounded-full px-4 py-1.5 text-xs font-bold transition-colors {filter === category ? 'bg-brand-600 text-white' : 'bg-surface-2 border border-border text-slate-600 hover:bg-slate-50'}"
            onclick={() => (filter = category)}
          >
            {category === 'all' ? $copy.allLabel : $copy[category]}
          </button>
        {/each}
      </div>
    </div>
    <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {#each visible as template}
        <Card as="article">
          <div class="flex items-start justify-between gap-3"><span class="text-3xl">{template.icon}</span><span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{$copy[template.category]}</span></div>
          <h3 class="mt-5 text-lg font-bold text-slate-800">{$copy[template.title]}</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-500">{$copy[template.descriptionKey]}</p>
          <div class="mt-5 border-t border-border pt-4"><p class="text-xs text-slate-400"><strong>{$copy.sourceAndReview}:</strong> {$copy[template.sourceKey]}</p><span class="mt-3 inline-block rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-bold text-warning">{$copy.reviewRequired}</span></div>
          <button class="mt-5 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700" onclick={() => useTemplate($copy[template.title])}>{$copy.useTemplate}</button>
        </Card>
      {/each}
    </div>
  </section>
</div>
