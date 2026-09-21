<script lang="ts">
  import { copy } from '$lib/i18n';
  import {
    buildSearchIndex,
    searchIndex,
    searchGroupLabels,
    searchGroupShort,
    groupsInIndex,
    scopeIndex,
    searchShareHref,
    type SearchEntry,
    type SearchGroup
  } from '$lib/search';
  import { readRecentSearches, recordSearch, removeSearch, writeRecentSearches } from '$lib/recent-searches';
  import Icon from '$lib/components/Icon.svelte';
  import { goto } from '$app/navigation';

  let { open = $bindable(false) }: { open: boolean } = $props();

  let query = $state('');
  let results = $state<SearchEntry[]>([]);
  let selected = $state(0);
  let inputEl: HTMLInputElement | undefined = $state();
  let recents = $state<string[]>([]);
  let scope = $state<SearchGroup | null>(null);

  const index = $derived(buildSearchIndex($copy));

  const groupLabel = $derived(searchGroupLabels($copy));
  const groupShort = $derived(searchGroupShort($copy));
  const availableGroups = $derived(groupsInIndex(index));

  $effect(() => {
    if (open) {
      query = '';
      results = [];
      selected = 0;
      scope = null;
      recents = readRecentSearches();
      requestAnimationFrame(() => inputEl?.focus());
    }
  });

  function runSearch(value: string, activeScope: SearchGroup | null = scope) {
    query = value;
    results = activeScope ? scopeIndex(index, value, activeScope) : searchIndex(index, value);
    selected = 0;
  }

  function run(value: string) {
    runSearch(value);
  }

  function setScope(group: SearchGroup) {
    scope = scope === group ? null : group;
    runSearch(query, scope);
    requestAnimationFrame(() => inputEl?.focus());
  }

  function remember() {
    const trimmed = query.trim();
    if (!trimmed) return;
    recents = recordSearch(recents, trimmed);
    writeRecentSearches(recents);
  }

  function choose(entry: SearchEntry) {
    remember();
    goto(entry.href);
    open = false;
  }

  /** Enter with no highlighted row — the query itself is the destination. */
  function searchEverywhere() {
    remember();
    goto(searchShareHref(query));
    open = false;
  }

  function pickRecent(value: string) {
    runSearch(value);
    requestAnimationFrame(() => inputEl?.focus());
  }

  function dropRecent(value: string) {
    recents = removeSearch(recents, value);
    writeRecentSearches(recents);
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selected = Math.min(selected + 1, results.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selected = Math.max(selected - 1, 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (results[selected]) choose(results[selected]);
      else if (query.trim()) searchEverywhere();
    } else if (event.key === 'Escape') {
      open = false;
    }
  }
</script>

{#if open}
  <div
    class="search-backdrop"
    role="presentation"
    onclick={(e) => e.target === e.currentTarget && (open = false)}
  >
    <div
      class="search-modal"
      role="dialog"
      aria-modal="true"
      aria-label={$copy.search}
      tabindex="-1"
      onkeydown={onKeydown}
    >
      <div class="search-input-row">
        <Icon name="search" class="h-4 w-4 search-glyph" />
        <input
          bind:this={inputEl}
          bind:value={query}
          oninput={(e) => run((e.currentTarget as HTMLInputElement).value)}
          placeholder={$copy.search}
          aria-label={$copy.search}
        />
        <button class="search-close" aria-label={$copy.closeDialog} onclick={() => (open = false)}><Icon name="close" class="h-3.5 w-3.5" /></button>
      </div>

      <div class="search-chips" role="group" aria-label={$copy.search}>
        {#each availableGroups as group (group)}
          <button
            class="search-chip {scope === group ? 'on' : ''}"
            aria-pressed={scope === group}
            title={groupLabel[group]}
            onclick={() => setScope(group)}
          >{groupShort[group]}</button>
        {/each}
      </div>

      <div class="search-body">
        {#if !query}
          {#if recents.length > 0}
            <div class="search-recents">
              <p class="search-recents-title">{$copy.searchRecents}</p>
              <ul class="search-recent-list">
                {#each recents as recent (recent)}
                  <li>
                    <button class="search-recent" onclick={() => pickRecent(recent)}>
                      <Icon name="search" class="h-3.5 w-3.5" />
                      <span>{recent}</span>
                    </button>
                    <button
                      class="search-recent-drop"
                      aria-label="{$copy.closeDialog}: {recent}"
                      onclick={() => dropRecent(recent)}
                    ><Icon name="close" class="h-3 w-3" /></button>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
          <p class="search-empty">{$copy.searchHint}</p>
        {:else if results.length === 0}
          <p class="search-empty">{$copy.searchNoResults} “{query}”</p>
          <a class="search-share" href={searchShareHref(query)} onclick={() => remember()}
            >{$copy.searchShare} “{query}” →</a
          >
        {:else}
          <ul class="search-results">
            {#each results as result, i}
              <li>
                <button
                  class="search-result {i === selected ? 'selected' : ''}"
                  onmouseenter={() => (selected = i)}
                  onclick={() => choose(result)}
                >
                  <span class="search-result-group">{groupLabel[result.group]}</span>
                  <strong>{result.title}</strong>
                  <span class="search-result-desc">{result.description}</span>
                </button>
              </li>
            {/each}
          </ul>
          <a class="search-share" href={searchShareHref(query)} onclick={() => remember()}
            >{$copy.searchShare} “{query}” →</a
          >
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .search-backdrop { position: fixed; inset: 0; z-index: 90; display: grid; place-items: start center; padding: 12vh 20px 20px; background: rgba(10, 27, 36, .5); backdrop-filter: blur(3px); }
  .search-modal { width: min(100%, 620px); overflow: hidden; border: 1px solid var(--line); border-radius: 16px; background: var(--paper); box-shadow: 0 30px 90px rgba(10, 27, 36, .3); }
  .search-input-row { display: flex; align-items: center; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--line); }
  .search-input-row input { min-width: 0; flex: 1; border: 0; outline: 0; color: var(--ink); background: transparent; font-size: 15px; }
  .search-input-row input::placeholder { color: var(--faint); }
  .search-close { width: 30px; height: 30px; border-radius: 8px; color: var(--muted); background: var(--surface-3); font-size: 18px; line-height: 1; }
  .search-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 14px 0; }
  .search-chip { padding: 3px 10px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); background: transparent; font-size: 11px; font-weight: 600; }
  .search-chip:hover { color: var(--ink); background: var(--surface-3); }
  .search-chip.on { color: var(--paper); background: var(--ink); border-color: var(--ink); }
  .search-body { max-height: 52vh; overflow-y: auto; padding: 10px; }
  .search-empty { padding: 18px 14px; color: var(--faint); font-size: 13px; text-align: center; }
  .search-recents { padding: 4px 4px 0; }
  .search-recents-title { margin: 4px 8px 6px; color: var(--faint); font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: .08em; text-transform: uppercase; }
  .search-recent-list { margin: 0; padding: 0; list-style: none; }
  .search-recent-list li { display: flex; align-items: center; gap: 4px; }
  .search-recent { display: flex; flex: 1; align-items: center; gap: 8px; min-width: 0; padding: 8px 10px; border-radius: 8px; color: var(--ink); background: transparent; font-size: 13px; text-align: left; }
  .search-recent:hover { background: var(--surface-3); }
  .search-recent span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .search-recent-drop { width: 24px; height: 24px; flex-shrink: 0; border-radius: 6px; color: var(--faint); background: transparent; font-size: 14px; line-height: 1; }
  .search-recent-drop:hover { color: var(--ink); background: var(--surface-3); }
  .search-share { display: block; margin: 6px 6px 8px; padding: 8px 10px; border-radius: 8px; color: var(--muted); background: var(--surface-3); font-size: 12px; font-weight: 600; text-align: center; text-decoration: none; }
  .search-share:hover { color: var(--ink); }
  .search-results { margin: 0; padding: 0; list-style: none; }
  .search-result { display: flex; flex-direction: column; gap: 3px; width: 100%; padding: 11px 12px; border-radius: 10px; color: var(--ink); background: transparent; text-align: left; }
  .search-result:hover, .search-result.selected { background: var(--surface-3); }
  .search-result strong { font-size: 14px; font-weight: 700; }
  .search-result-desc { overflow: hidden; color: var(--muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
  .search-result-group { align-self: flex-start; margin-bottom: 2px; padding: 2px 7px; border-radius: 999px; color: var(--faint); background: var(--surface-3); font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: .06em; text-transform: uppercase; }
</style>
