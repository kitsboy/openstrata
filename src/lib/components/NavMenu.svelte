<script lang="ts">
  /**
   * One grouped header menu.
   *
   * Opens on hover (with a short close delay so a diagonal move toward the
   * panel does not dismiss it) and on click/Enter/Space/ArrowDown. Closes on
   * Escape, on a pointer press outside, and on navigation. Everything it
   * contains is a real `<a>`, so it works with a keyboard, a screen reader and
   * JavaScript-disabled link following like any other menu.
   */
  import { page } from '$app/stores';
  import Icon from './Icon.svelte';
  import type { NavLink } from '$lib/nav';

  let {
    label,
    items,
    align = 'left'
  }: { label: string; items: NavLink[]; align?: 'left' | 'right' } = $props();

  let open = $state(false);
  let root: HTMLElement | null = $state(null);
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let panel: HTMLElement | null = $state(null);
  // True while the menu is open because the pointer arrived, not because a
  // click or key press asked for it.
  let openedByHover = false;

  const current = $derived($page.url.pathname);
  const active = $derived(items.some((item) => item.href === current));

  function show() {
    clearTimeout(closeTimer);
    if (!open) {
      openedByHover = true;
      open = true;
    }
  }

  /**
   * A click on a menu the pointer already opened PINS it open instead of
   * toggling it shut — otherwise pointing at a menu and then clicking it closed
   * the very thing the click was meant to open. The next click closes it.
   * Keyboard activation never sets `openedByHover`, so Enter/Space still toggle
   * normally. The pending close timer is cancelled either way: a stray
   * mouseleave must not shut a menu the user just clicked.
   */
  function toggle() {
    clearTimeout(closeTimer);
    if (open && openedByHover) {
      openedByHover = false;
      return;
    }
    open = !open;
  }

  function hide(delay = 160) {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => (open = false), delay);
  }

  function onTriggerKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      clearTimeout(closeTimer);
      openedByHover = false;
      open = true;
      // The panel mounts on the next tick; focus its first link then.
      setTimeout(() => panel?.querySelector('a')?.focus(), 0);
    }
  }

  // Any navigation closes the menu — including a click on one of its own links.
  $effect(() => {
    void current;
    open = false;
  });

  $effect(() => {
    if (!open) return;
    function onPointerDown(event: Event) {
      if (root && !root.contains(event.target as Node)) open = false;
    }
    function onKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') open = false;
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeydown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeydown);
    };
  });
</script>

<!-- role="none": the wrapper exists only to catch hover intent across the
     trigger and its panel. The button and links inside stay exposed. -->
<div
  class="nav-menu"
  role="none"
  bind:this={root}
  onmouseenter={show}
  onmouseleave={() => hide()}
>
  <button
    type="button"
    class="nav-trigger"
    class:active
    aria-expanded={open}
    aria-haspopup="true"
    onclick={toggle}
    onkeydown={onTriggerKeydown}
  >
    {label}
    <span class="chev"><Icon name="chevron-down" class="h-3.5 w-3.5" /></span>
  </button>

  {#if open}
    <div class="nav-panel {align}" bind:this={panel}>
      {#each items as item (item.href)}
        <a href={item.href} onclick={() => (open = false)}>
          <span class="nav-panel-label">{item.label}</span>
          {#if item.hint}<span class="nav-panel-hint">{item.hint}</span>{/if}
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .nav-menu {
    position: relative;
    flex: 0 0 auto;
  }

  .nav-trigger {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 10px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--muted);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: color .15s ease, background .15s ease;
  }
  .nav-trigger:hover,
  .nav-trigger[aria-expanded='true'] { color: var(--color-brand-700); background: var(--canvas); }
  .nav-trigger.active { color: var(--color-brand-700); }
  .chev { display: inline-flex; opacity: .7; transition: transform .18s ease; }
  .nav-trigger[aria-expanded='true'] .chev { transform: rotate(180deg); }
  :global(.dark) .nav-trigger:hover,
  :global(.dark) .nav-trigger[aria-expanded='true'] { background: rgba(255, 255, 255, .06); }

  .nav-panel {
    position: absolute;
    top: calc(100% + 8px);
    z-index: 60;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 264px;
    padding: 8px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--paper);
    box-shadow: 0 18px 40px rgba(16, 45, 59, .14);
  }
  .nav-panel.left { left: 0; }
  .nav-panel.right { right: 0; }

  .nav-panel a {
    display: block;
    padding: 9px 11px;
    border-radius: 10px;
    text-decoration: none;
    transition: background .14s ease;
  }
  .nav-panel a:hover { background: var(--canvas); }
  .nav-panel-label {
    display: block;
    color: var(--ink);
    font-size: 13px;
    font-weight: 700;
  }
  .nav-panel-hint {
    display: block;
    margin-top: 2px;
    color: var(--faint);
    font-size: 11px;
    line-height: 1.35;
  }
</style>
