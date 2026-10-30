<script lang="ts">
  import { locales } from '$lib/i18n';

  // No current-catalog reviews have been signed off. Update these records only
  // from documented reviewer sign-off; never infer approval from key coverage.
  const reviews: Partial<Record<(typeof locales)[number]['code'], { scope: string; date: string; revision: string }>> = {};
</script>

<svelte:head>
  <title>Translation review status · OpenStrata</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-5xl px-6 py-12">
  <a href="/docs" class="text-sm font-semibold text-brand-700">← Documentation</a>
  <h1 class="mt-4 text-3xl font-bold text-slate-900">Translation review status</h1>
  <p class="mt-3 max-w-3xl text-slate-600">Human review of the current catalog is outstanding. Automated coverage does not certify accuracy. Legal and financial content also requires separate qualified BC review.</p>
  <div class="mt-6 overflow-x-auto rounded-xl border border-border bg-surface-2">
    <table class="w-full min-w-[600px] text-left text-sm">
      <thead><tr class="border-b border-border"><th class="p-4">Language</th><th class="p-4">Status</th><th class="p-4">Review scope</th><th class="p-4">Date / revision</th></tr></thead>
      <tbody>
        {#each locales as language}
          {@const review = reviews[language.code]}
          <tr class="border-b border-border last:border-0">
            <th class="p-4 font-semibold">{language.name} ({language.code})</th>
            <td class="p-4">{review ? 'Recorded review' : 'Not reviewed'}</td>
            <td class="p-4">{review?.scope ?? '—'}</td>
            <td class="p-4">{review ? `${review.date} / ${review.revision}` : '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="mt-4 text-sm text-slate-600">A recorded review applies only to its stated scope and revision, not later changes. Reviewer identities and completed sheets should be kept securely, not published here.</p>
</section>
