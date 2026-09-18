<script lang="ts">
  // Public changelog.
  //
  // The project ships several times a week and writes an honest changelog every
  // time — this publishes it. It is generated from CHANGELOG.md by
  // scripts/generate-changelog.mjs (src/lib/changelog.test.ts fails if the
  // generated module drifts), so there is exactly one place to write a release.
  //
  // Two honesty rules carry over from the changelog itself:
  //   - Nothing is reworded for marketing. Bullets are shown as written.
  //   - The "Verified" group is shown, not hidden: how a release was checked is
  //     part of the claim.
  import { changelogEarlyReleases, changelogReleases } from '$lib/changelog.generated';
  import Icon from '$lib/components/Icon.svelte';
  import Card from '$lib/components/Card.svelte';
  import HeroArt from '$lib/components/HeroArt.svelte';
  import { copy, locale, formatDate, formatNumber } from '$lib/i18n';

  // Groups the page knows how to label; anything else renders its raw markdown
  // heading. Tones reuse badge classes already proven readable elsewhere on the
  // site (`bg-*/10 text-*` chips) rather than inventing a fifth palette.
  const PILL = 'inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide';
  const groups = $derived<Record<string, { label: string; tone: string }>>({
    Added: { label: $copy.changelogGroupAdded, tone: 'bg-success/10 text-success' },
    Changed: { label: $copy.changelogGroupChanged, tone: 'bg-bc-blue/10 text-bc-blue' },
    Fixed: { label: $copy.changelogGroupFixed, tone: 'bg-brand-50 text-brand-700' },
    Verified: { label: $copy.changelogGroupVerified, tone: 'bg-surface-3 text-slate-600' },
    'Known issues': { label: $copy.changelogGroupKnown, tone: 'bg-danger/10 text-danger' }
  });

  const filters = ['all', 'Added', 'Changed', 'Fixed', 'Verified'] as const;
  type Filter = (typeof filters)[number];

  let filter = $state<Filter>('all');
  let expanded = $state<string[]>([]);

  const latest = changelogReleases[0];
  const rest = changelogReleases.slice(1);

  const totalItems = changelogReleases.reduce(
    (total, release) => total + release.groups.reduce((n, group) => n + group.items.length, 0),
    0
  );

  const filterLabel = (id: Filter) =>
    id === 'all'
      ? $copy.changelogFilterAll
      : (groups[id]?.label ?? id);

  const groupLabel = (label: string) => groups[label]?.label ?? label;
  const groupTone = (label: string) => groups[label]?.tone ?? 'bg-surface-3 text-slate-600';

  function isExpanded(version: string) {
    return expanded.includes(version);
  }

  function toggleExpanded(version: string) {
    expanded = isExpanded(version)
      ? expanded.filter((entry) => entry !== version)
      : [...expanded, version];
  }

  /** Visible groups for one release, honouring the active group filter. */
  function visibleGroups(release: (typeof changelogReleases)[number]) {
    return filter === 'all'
      ? release.groups
      : release.groups.filter((group) => group.label === filter);
  }

  /** Items shown for a group before the "show all" toggle, per release. */
  function visibleItems(release: (typeof changelogReleases)[number], group: { items: string[] }) {
    return isExpanded(release.version) ? group.items : group.items.slice(0, 2);
  }
</script>

<svelte:head>
  <title>{$copy.changelogPageTitle}</title>
  <meta name="description" content={$copy.changelogMetaDescription} />
</svelte:head>

<section class="page-hero">
  <HeroArt variant="chain" />
  <div class="mx-auto max-w-7xl px-6 py-16">
    <div class="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p class="text-sm font-bold text-brand-600 uppercase tracking-wide mb-2">{$copy.changelogBadge}</p>
        <h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.changelogTitle}</h1>
        <p class="mt-3 text-lg text-slate-600 max-w-2xl">{$copy.changelogIntro}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <div class="rounded-xl bg-surface-2 border border-border px-4 py-3 text-center shadow-sm">
          <div class="text-2xl font-bold text-success">{latest.version}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase">{$copy.changelogLatest}</div>
        </div>
        <div class="rounded-xl bg-surface-2 border border-border px-4 py-3 text-center shadow-sm">
          <div class="text-2xl font-bold text-slate-500">{formatNumber(changelogReleases.length, $locale)}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase">{$copy.changelogReleasesLabel}</div>
        </div>
        <div class="rounded-xl bg-surface-2 border border-border px-4 py-3 text-center shadow-sm">
          <div class="text-2xl font-bold text-bc-blue">{formatNumber(totalItems, $locale)}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase">{$copy.changelogChangesLabel}</div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="mx-auto max-w-5xl px-6 py-12">
  <!-- Group filter -->
  <div class="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label={$copy.changelogFilterLabel}>
    {#each filters as id}
      <button
        class="rounded-xl px-4 py-2 text-sm font-semibold transition-colors {filter === id
          ? 'bg-brand-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-surface-3'}"
        aria-pressed={filter === id}
        onclick={() => (filter = id)}
      >
        {filterLabel(id)}
      </button>
    {/each}
  </div>

  <!-- Latest release, given room to breathe -->
  <Card variant="hero" class="mb-10">
    <div class="flex flex-wrap items-center gap-3">
      <span class="rounded-full bg-success/10 px-3 py-0.5 text-xs font-bold text-success">{$copy.changelogLatest}</span>
      <span class="font-mono text-lg font-bold text-slate-900">v{latest.version}</span>
      {#if latest.date}
        <time class="text-xs text-slate-400" datetime={latest.date}>
          {formatDate(latest.date, $locale, { year: 'numeric', month: 'long', day: 'numeric' })}
        </time>
      {/if}
    </div>
    <div class="mt-5 space-y-5">
      {#each visibleGroups(latest) as group}
        <div>
          <div class="flex items-center gap-2">
            <span class="{PILL} {groupTone(group.label)}">{groupLabel(group.label)}</span>
            <span class="text-[10px] font-bold text-slate-400">{group.items.length}</span>
          </div>
          <ul class="mt-2 space-y-2">
            {#each visibleItems(latest, group) as item}
              <li class="entry">{item}</li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
    {#if filter === 'all' && latest.groups.some((group) => group.items.length > 2)}
      <button class="toggle" type="button" onclick={() => toggleExpanded(latest.version)}>
        {isExpanded(latest.version) ? $copy.changelogShowLess : $copy.changelogShowAll}
      </button>
    {/if}
  </Card>

  <!-- Older releases as a timeline -->
  <ul class="timeline">
    {#each rest as release}
      {@const shown = visibleGroups(release)}
      {#if shown.length > 0}
        <li class="release">
          <div class="release-head">
            <span class="release-node" aria-hidden="true"></span>
            <span class="font-mono text-sm font-bold text-slate-900">v{release.version}</span>
            {#if release.date}
              <time class="text-xs text-slate-400" datetime={release.date}>
                {formatDate(release.date, $locale, { year: 'numeric', month: 'short', day: 'numeric' })}
              </time>
            {/if}
            {#if shown.reduce((n, group) => n + group.items.length, 0) > 2}
              <button class="toggle inline" type="button" onclick={() => toggleExpanded(release.version)}>
                {isExpanded(release.version) ? $copy.changelogShowLess : $copy.changelogShowAll}
              </button>
            {/if}
          </div>
          <div class="release-body">
            {#each shown as group}
              <div>
                <span class="{PILL} {groupTone(group.label)}">{groupLabel(group.label)}</span>
                <ul class="mt-2 space-y-2">
                  {#each visibleItems(release, group) as item}
                    <li class="entry">{item}</li>
                  {/each}
                </ul>
              </div>
            {/each}
          </div>
        </li>
      {/if}
    {/each}
  </ul>

  {#if filter !== 'all'}
    <p class="mt-6 text-center text-xs text-slate-400">{$copy.changelogFilterHint}</p>
  {/if}

  <!-- Summary-only earlier releases -->
  {#if changelogEarlyReleases.length > 0}
    <Card class="mt-12">
      <h2 class="text-lg font-bold text-slate-800">{$copy.changelogEarlier}</h2>
      <p class="mt-1 text-sm text-slate-500">{$copy.changelogEarlierHint}</p>
      <ul class="mt-5 space-y-4">
        {#each changelogEarlyReleases as release}
          <li class="flex flex-wrap items-baseline gap-3">
            <span class="font-mono text-xs font-bold text-slate-900">v{release.version}</span>
            {#if release.summary}
              <span class="flex-1 basis-64 text-sm text-slate-500 leading-relaxed">{release.summary}</span>
            {:else}
              <span class="flex-1 basis-64 text-sm text-slate-400">{$copy.changelogNotesUnavailable}</span>
            {/if}
          </li>
        {/each}
      </ul>
    </Card>
  {/if}

  <!-- Follow every release -->
  <Card variant="hero" class="mt-8 text-center border-dashed">
    <Icon name="rss" class="mx-auto mb-3 h-8 w-8 text-brand-500" />
    <h2 class="text-xl font-bold text-slate-800">{$copy.changelogSubscribe}</h2>
    <p class="mt-2 text-sm text-slate-500">{$copy.changelogSubscribeHint}</p>
    <a
      href="/rss"
      class="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-brand-500 transition-colors"
    >
      {$copy.changelogViewRss} →
    </a>
  </Card>
</div>

<style>
  .entry {
    position: relative;
    padding-left: 16px;
    color: var(--muted);
    font-size: 13.5px;
    line-height: 1.6;
  }
  .entry::before {
    content: '';
    position: absolute;
    top: 9px;
    left: 2px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--line) 90%, var(--muted));
  }

  .toggle {
    margin-top: 12px;
    color: var(--color-brand-700);
    font-size: 12px;
    font-weight: 700;
    background: transparent;
  }
  .toggle.inline { margin: 0 0 0 auto; }
  .toggle:hover { text-decoration: underline; }

  /* Timeline rail: one hairline through the version nodes. */
  .timeline {
    position: relative;
    margin: 0;
    padding: 0 0 0 22px;
    list-style: none;
  }
  .timeline::before {
    content: '';
    position: absolute;
    top: 6px;
    bottom: 6px;
    left: 5px;
    width: 1px;
    background: var(--line);
  }
  .release { position: relative; padding-bottom: 26px; }
  .release-node {
    position: absolute;
    top: 6px;
    left: -22px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 2px solid var(--paper);
    background: var(--color-brand-500);
  }
  .release-head { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
  .release-body { margin-top: 10px; display: grid; gap: 14px; }

  @media (prefers-reduced-motion: reduce) {
    .toggle { transition: none; }
  }
</style>
