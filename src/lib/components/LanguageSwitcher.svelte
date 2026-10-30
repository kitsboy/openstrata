<script lang="ts">
  import { copy, locale, locales } from '$lib/i18n';
  let open = false;
  let trigger: HTMLButtonElement;
  let root: HTMLDivElement;

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open && root.contains(document.activeElement)) { open = false; trigger.focus(); }
  }
  function onFocusIn(event: FocusEvent) {
    if (open && !root.contains(event.target as Node | null)) open = false;
  }
  $: selected = locales.find((item) => item.code === $locale) ?? locales[0];

  function choose(code: (typeof locales)[number]['code']) {
    locale.set(code);
    open = false;
    trigger.focus();
  }
</script>

<svelte:window onkeydown={onKeydown} onfocusin={onFocusIn} />
<div class="language-wrap" bind:this={root}>
  <button bind:this={trigger} class="language-button" aria-expanded={open} aria-label={$copy.language} onclick={() => (open = !open)}>
    <span class="globe" aria-hidden="true">◎</span>
    <span class="language-current">{selected.nativeName}</span>
    <span class="chevron" aria-hidden="true">⌄</span>
  </button>
  {#if open}
    <div class="language-menu" role="group" aria-label={$copy.chooseLanguage}>
      <div class="menu-heading">{$copy.chooseLanguage}</div>
      {#each locales as item}
        <button class:chosen={item.code === $locale} aria-pressed={item.code === $locale} onclick={() => choose(item.code)}>
          <span>{item.nativeName}</span>
          {#if item.code === $locale}<b aria-hidden="true">✓</b>{/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
