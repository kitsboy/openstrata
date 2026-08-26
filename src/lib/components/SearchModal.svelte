<script lang="ts">
  import { copy, locale } from '$lib/i18n';
  import { buildSearchIndex, searchIndex, type SearchEntry, type SearchGroup } from '$lib/search';
  import Icon from '$lib/components/Icon.svelte';
  import { goto } from '$app/navigation';

  let { open = $bindable(false) }: { open: boolean } = $props();

  let query = $state('');
  let results = $state<SearchEntry[]>([]);
  let selected = $state(0);
  let inputEl: HTMLInputElement | undefined = $state();

  const index = $derived(buildSearchIndex($copy));

  const groupLabel = $derived.by(() => {
    const labels: Record<SearchGroup, string> = {
      pages: $copy.searchPages,
      posts: $copy.searchPosts,
      faq: $copy.searchFaq,
      templates: $copy.searchTemplates,
      legal: $copy.searchLegal,
      feeds: $copy.primarySources
    };
    return labels;
  });

  $effect(() => {
    if (open) {
      query = '';
      results = [];
      selected = 0;
      requestAnimationFrame(() => inputEl?.focus());
    }
  });

  function run(value: string) {
    query = value;
    results = searchIndex(index, query);
    selected = 0;
  }

  function choose(entry: SearchEntry) {
    goto(entry.href);
    open = false;
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selected = Math.min(selected + 1, results.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selected = Math.max(selected - 1, 0);
    } else if (event.key === 'Enter' && results[selected]) {
      event.preventDefault();
      choose(results[selected]);
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

      <div class="search-body">
        {#if !query}
          <p class="search-empty">{$copy.searchHint}</p>
        {:else if results.length === 0}
          <p class="search-empty">{$copy.searchNoResults} “{query}”</p>
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
  .search-body { max-height: 52vh; overflow-y: auto; padding: 10px; }
  .search-empty { padding: 26px 14px; color: var(--faint); font-size: 13px; text-align: center; }
  .search-results { margin: 0; padding: 0; list-style: none; }
  .search-result { display: flex; flex-direction: column; gap: 3px; width: 100%; padding: 11px 12px; border-radius: 10px; color: var(--ink); background: transparent; text-align: left; }
  .search-result:hover, .search-result.selected { background: var(--surface-3); }
  .search-result strong { font-size: 14px; font-weight: 700; }
  .search-result-desc { overflow: hidden; color: var(--muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
  .search-result-group { align-self: flex-start; margin-bottom: 2px; padding: 2px 7px; border-radius: 999px; color: var(--faint); background: var(--surface-3); font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: .06em; text-transform: uppercase; }
</style>
