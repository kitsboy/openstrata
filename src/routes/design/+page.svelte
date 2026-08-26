<script lang="ts">
  /** Living design system (#9): renders the tokens + core components so every
   *  future change stays on-language. Includes the brand-accent switcher. */
  import { copy } from '$lib/i18n';
  import { accent, cycleAccent } from '$lib/theme';
  import Icon from '$lib/components/Icon.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import Sparkline from '$lib/components/Sparkline.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import Glossary from '$lib/components/Glossary.svelte';
  import Illustrations from '$lib/components/Illustrations.svelte';

  const palette = [
    ['brand-50', 'var(--color-brand-50)'], ['brand-100', 'var(--color-brand-100)'],
    ['brand-200', 'var(--color-brand-200)'], ['brand-300', 'var(--color-brand-300)'],
    ['brand-400', 'var(--color-brand-400)'], ['brand-500', 'var(--color-brand-500)'],
    ['brand-600', 'var(--color-brand-600)'], ['brand-700', 'var(--color-brand-700)'],
    ['brand-800', 'var(--color-brand-800)'], ['brand-900', 'var(--color-brand-900)']
  ];
  const swatches = [
    ['bitcoin', 'var(--color-bitcoin)'], ['success', 'var(--color-success)'],
    ['warning', 'var(--color-warning)'], ['danger', 'var(--color-danger)'],
    ['bc-blue', 'var(--color-bc-blue)'], ['bc-green', 'var(--color-bc-green)']
  ];
</script>

<svelte:head>
  <title>{$copy.designTitle} — OpenStrata</title>
</svelte:head>

<section class="border-b border-border bg-gradient-to-br from-brand-50/40 via-surface-2 to-white">
  <div class="mx-auto max-w-5xl px-6 py-14">
    <p class="text-sm font-bold text-brand-600 uppercase tracking-wide mb-2">{$copy.themeBrand}</p>
    <h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.designTitle}</h1>
    <p class="mt-3 max-w-2xl text-lg text-slate-600">{$copy.designIntro}</p>
    <div class="mt-6 flex flex-wrap items-center gap-3">
      <button class="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white" onclick={cycleAccent}>
        {$copy.themeBrokerage}: {$accent === 'orange' ? 'orange' : 'green'} ↔
      </button>
      <span class="text-xs font-semibold text-slate-400">{$copy.themeBrand} · {`[data-accent="${$accent}"]`}</span>
    </div>
  </div>
</section>

<div class="mx-auto max-w-5xl px-6 py-12 space-y-12">
  <section>
    <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">Color</h2>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {#each palette as [name, value]}
        <div class="rounded-xl border border-border p-3">
          <div class="h-12 rounded-lg" style={`background:${value}`}></div>
          <p class="mt-2 text-xs font-bold text-slate-700">{name}</p>
        </div>
      {/each}
    </div>
    <div class="mt-4 flex flex-wrap gap-3">
      {#each swatches as [name, value]}
        <span class="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold text-slate-600">
          <span class="h-3 w-3 rounded-full" style={`background:${value}`}></span>{name}
        </span>
      {/each}
    </div>
  </section>

  <section>
    <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">Type</h2>
    <div class="rounded-2xl border border-border bg-surface-2 p-6">
      <p class="text-3xl font-bold text-slate-900">Manrope — headings</p>
      <p class="mt-3 text-lg text-slate-600">Body copy reads clean at 16–18px with relaxed leading.</p>
      <p class="mt-3 font-mono text-sm text-bc-blue">DM Mono — labels, codes, tallies</p>
      <p class="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eyebrow — tiny caps</p>
    </div>
  </section>

  <section>
    <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">Components</h2>
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-2xl border border-border bg-surface-2 p-6">
        <p class="text-[10px] font-bold text-slate-400 uppercase mb-4">Buttons</p>
        <div class="flex flex-wrap items-center gap-3">
          <button class="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white">Primary</button>
          <button class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-bold text-slate-700">Secondary</button>
          <button class="rounded-xl bg-bitcoin px-4 py-2 text-sm font-bold text-white">Bitcoin</button>
          <button class="rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white">Danger</button>
        </div>
      </div>
      <div class="rounded-2xl border border-border bg-surface-2 p-6">
        <p class="text-[10px] font-bold text-slate-400 uppercase mb-4">Cards</p>
        <div class="glass-card rounded-2xl p-5">
          <p class="font-bold text-slate-800">glass-card</p>
          <p class="mt-1 text-sm text-slate-500">Radius 16 · 2-layer shadow · hairline border.</p>
        </div>
      </div>
      <div class="rounded-2xl border border-border bg-surface-2 p-6">
        <p class="text-[10px] font-bold text-slate-400 uppercase mb-4">Data</p>
        <Sparkline values={[34, 36, 35, 39, 41, 40]} tone="orange" />
        <div class="mt-4 space-y-2"><Skeleton height="12px" width="80%" /><Skeleton height="24px" width="45%" /></div>
      </div>
      <div class="rounded-2xl border border-border bg-surface-2 p-6">
        <p class="text-[10px] font-bold text-slate-400 uppercase mb-4">States & icons</p>
        <EmptyState icon="search" title="Empty state" message="A mark, a next step, a CTA." actionLabel={$copy.newStrata} />
        <div class="mt-4 flex items-center gap-3 text-slate-500">
          <Icon name="home" class="h-4 w-4" /><Icon name="shield" class="h-4 w-4" /><Icon name="coins" class="h-4 w-4" /><Icon name="bitcoin" class="h-4 w-4 text-bitcoin" /><Icon name="lightning" class="h-4 w-4 text-lightning" /><Glossary term="crf" />
        </div>
      </div>
      <div class="rounded-2xl border border-border bg-surface-2 p-6 lg:col-span-2">
        <p class="text-[10px] font-bold text-slate-400 uppercase mb-4">Illustrations</p>
        <div class="flex flex-wrap items-center gap-6 text-slate-400">
          <Illustrations scene="ledger" /><Illustrations scene="bitcoin" /><Illustrations scene="building" /><Illustrations scene="empty" />
        </div>
      </div>
    </div>
  </section>
</div>
