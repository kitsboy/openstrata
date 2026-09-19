<script lang="ts">
  /**
   * How your money is held — the custody page.
   *
   * `0% custody` was four words inside a popup, which is the strongest single
   * promise this product makes and the hardest one for a council to check. This
   * page answers the question behind it: at each step, where does the money
   * physically sit, and what can we do with it?
   *
   * Chrome (headings, labels, call to action) comes from the i18n catalog so a
   * reader is oriented in their own language; the body prose comes from
   * `$lib/custody`, which follows the same rule the print-ready documents and
   * the manual follow — see the note at the top of that file for why custody
   * wording in particular is not machine-translated.
   */
  import { copy } from '$lib/i18n';
  import Card from '$lib/components/Card.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import HeroArt from '$lib/components/HeroArt.svelte';
  import { custodyChecks, custodyLimits, custodySteps, custodyToday } from '$lib/custody';
</script>

<svelte:head>
  <title>{$copy.custodyPageTitle}</title>
  <meta name="description" content={$copy.custodyMetaDescription} />
</svelte:head>

<section class="page-hero">
  <HeroArt variant="chain" />
  <div class="mx-auto max-w-7xl px-6 py-16">
    <span class="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-700">
      <Icon name="lock" class="h-3 w-3" /> {$copy.custodyBadge}
    </span>
    <h1 class="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.custodyTitle}</h1>
    <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{$copy.custodyIntro}</p>
  </div>
</section>

<!-- 1. Where the money sits -->
<section class="mx-auto max-w-7xl px-6 py-14">
  <h2 class="text-2xl font-bold text-slate-900">{$copy.custodyFlowTitle}</h2>
  <ol class="mt-8 grid gap-4 md:grid-cols-3">
    {#each custodySteps as step, index}
      <Card as="article" class="h-full">
        <div class="flex items-center gap-3">
          <span class="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">{index + 1}</span>
          <Icon name={step.icon} class="h-5 w-5 text-brand-600" />
        </div>
        <h3 class="mt-4 font-bold text-slate-800">{step.title}</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
      </Card>
    {/each}
  </ol>
</section>

<!-- 2. What we cannot do -->
<section class="border-y border-border bg-surface-2">
  <div class="mx-auto max-w-7xl px-6 py-14">
    <h2 class="text-2xl font-bold text-slate-900">{$copy.custodyCantTitle}</h2>
    <ul class="mt-8 grid gap-3 sm:grid-cols-2">
      {#each custodyLimits as limit}
        <li class="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
          <Icon name="close" class="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <span class="text-sm font-semibold leading-relaxed text-slate-700">{limit}</span>
        </li>
      {/each}
    </ul>
  </div>
</section>

<!-- 3. What a council can check -->
<section class="mx-auto max-w-7xl px-6 py-14">
  <h2 class="text-2xl font-bold text-slate-900">{$copy.custodyCheckTitle}</h2>
  <ul class="mt-8 grid gap-3 sm:grid-cols-2">
    {#each custodyChecks as check}
      <li class="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-4">
        <Icon name="check" class="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <span class="text-sm font-semibold leading-relaxed text-slate-700">{check}</span>
      </li>
    {/each}
  </ul>
  <div class="mt-6 flex flex-wrap gap-3">
    <a href="/docs" class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-5 py-2.5 text-sm font-bold text-slate-700 no-underline hover:border-brand-300">
      <Icon name="shield" class="h-4 w-4 text-brand-600" /> {$copy.status}
    </a>
    <a href="/spec" class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-5 py-2.5 text-sm font-bold text-slate-700 no-underline hover:border-brand-300">
      <Icon name="file" class="h-4 w-4 text-brand-600" /> {$copy.specTitle}
    </a>
  </div>
</section>

<!-- 4. Where this stands today -->
<section class="border-t border-border bg-surface-2">
  <div class="mx-auto max-w-7xl px-6 py-14">
    <h2 class="text-2xl font-bold text-slate-900">{$copy.custodyTodayTitle}</h2>
    <ul class="mt-6 space-y-2">
      {#each custodyToday as line}
        <li class="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
          <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"></span>
          <span>{line}</span>
        </li>
      {/each}
    </ul>
    <div class="mt-8 flex flex-wrap items-center gap-3">
      <a href="mailto:hello@giveabit.io" class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white no-underline hover:bg-brand-700">
        <Icon name="mail" class="h-4 w-4" /> {$copy.custodyCta}
      </a>
      <span class="text-xs font-semibold text-slate-500">{$copy.custodyCtaNote}</span>
    </div>
  </div>
</section>
