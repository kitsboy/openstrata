<script lang="ts">
  import { copy, locale, locales } from '$lib/i18n';
  import { get } from 'svelte/store';

  let open = false;
  $: selected = locales.find((item) => item.code === $locale) ?? locales[0];

  function choose(code: (typeof locales)[number]['code']) {
    locale.set(code);
    open = false;
  }
</script>

<div class="language-wrap">
  <button class="language-button" aria-expanded={open} aria-haspopup="listbox" aria-label={$copy.language} onclick={() => (open = !open)}>
    <span class="globe" aria-hidden="true">◎</span>
    <span class="language-current">{selected.nativeName}</span>
    <span class="chevron" aria-hidden="true">⌄</span>
  </button>
  {#if open}
    <div class="language-menu" role="listbox" aria-label={$copy.chooseLanguage}>
      <div class="menu-heading">{$copy.chooseLanguage}</div>
      {#each locales as item}
        <button class:chosen={item.code === $locale} role="option" aria-selected={item.code === $locale} onclick={() => choose(item.code)}>
          <span>{item.nativeName}</span>
          {#if item.code === $locale}<b aria-hidden="true">✓</b>{/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
