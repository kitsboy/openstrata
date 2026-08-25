<script lang="ts">
  import { copy } from '$lib/i18n';

  const templates = [
    { title: 'formBTemplate', descriptionKey: 'formBDescription', sourceKey: 'formBSource', category: 'templateCategoryLegal', icon: '📄' },
    { title: 'formFTemplate', descriptionKey: 'formFDescription', sourceKey: 'formFSource', category: 'templateCategoryLegal', icon: '🟢' },
    { title: 'complaintNoticeTemplate', descriptionKey: 'complaintNoticeDescription', sourceKey: 'complaintNoticeSource', category: 'templateCategoryGovernance', icon: '⚖️' },
    { title: 'meetingAgendaTemplate', descriptionKey: 'meetingAgendaDescription', sourceKey: 'meetingAgendaSource', category: 'templateCategoryGovernance', icon: '🗳️' },
    { title: 'meetingMinutesTemplate', descriptionKey: 'meetingMinutesDescription', sourceKey: 'meetingMinutesSource', category: 'templateCategoryGovernance', icon: '📝' },
    { title: 'budgetTemplate', descriptionKey: 'budgetDescription', sourceKey: 'budgetSource', category: 'templateCategoryFinance', icon: '💰' }
  ];
</script>

<svelte:head>
  <title>{$copy.templatesTitle} — OpenStrata</title>
  <meta name="description" content="OpenStrata strata governance, finance, conveyancing, and workflow templates." />
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
    <h2 class="font-bold text-slate-800">{$copy.templateNoticeTitle}</h2>
    <p class="mt-2 text-sm leading-relaxed text-slate-600">{$copy.templateNotice}</p>
  </div>

  <section>
    <div class="mb-6"><h2 class="text-2xl font-bold text-slate-900">{$copy.templateLibrary}</h2><p class="mt-1 text-slate-500">{$copy.templateLibraryHint}</p></div>
    <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {#each templates as template}
        <article class="glass-card rounded-2xl p-6">
          <div class="flex items-start justify-between gap-3"><span class="text-3xl">{template.icon}</span><span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{$copy[template.category]}</span></div>
          <h3 class="mt-5 text-lg font-bold text-slate-800">{$copy[template.title]}</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-500">{$copy[template.descriptionKey]}</p>
          <div class="mt-5 border-t border-border pt-4"><p class="text-xs text-slate-400"><strong>{$copy.sourceAndReview}:</strong> {$copy[template.sourceKey]}</p><span class="mt-3 inline-block rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-bold text-warning">{$copy.reviewRequired}</span></div>
          <button class="mt-5 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700" onclick={() => alert($copy.reviewRequired)}>{$copy.useTemplate}</button>
        </article>
      {/each}
    </div>
  </section>
</div>
