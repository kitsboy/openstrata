<script lang="ts">
  // Designed empty state — a small mark, a clear message, and a next step.
  // No bare placeholder text anywhere in the product.
  import Icon from '$lib/components/Icon.svelte';
  import Illustrations from '$lib/components/Illustrations.svelte';
  import { icons } from '$lib/icons';

  let {
    icon = 'search',
    scene,
    title,
    message,
    actionLabel,
    onAction
  }: {
    icon?: keyof typeof icons;
    scene?: 'empty' | 'ledger' | 'bitcoin' | 'building';
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
  } = $props();
</script>

<div class="empty-state" role="status">
  {#if scene}
    <span class="empty-scene" aria-hidden="true"><Illustrations scene={scene} class="h-16 w-16" /></span>
  {/if}
  <span class="empty-mark" aria-hidden="true"><Icon name={icon} class="h-4 w-4" /></span>
  <strong>{title}</strong>
  {#if message}<p>{message}</p>{/if}
  {#if actionLabel && onAction}
    <button class="empty-action" onclick={onAction}>{actionLabel} <Icon name="arrow-up-right" class="h-3 w-3" /></button>
  {/if}
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 26px 18px;
    border: 1px dashed var(--line);
    border-radius: 12px;
    color: var(--muted);
    background: var(--paper);
    text-align: center;
  }
  .empty-scene { margin-bottom: 8px; opacity: .85; }
  .empty-mark {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    margin-bottom: 4px;
    border-radius: 10px;
    color: var(--orange);
    background: color-mix(in srgb, var(--orange) 10%, transparent);
  }
  .empty-state strong { color: var(--ink); font-size: 12px; font-weight: 800; }
  .empty-state p { margin: 0; color: var(--muted); font-size: 11px; line-height: 1.55; }
  .empty-action {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 6px;
    padding: 7px 12px;
    border-radius: 8px;
    color: #fff;
    background: var(--orange);
    font-size: 10px;
    font-weight: 800;
    transition: background .2s ease;
  }
  .empty-action:hover { background: var(--orange-deep); }
</style>
