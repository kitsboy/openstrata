<script lang="ts">
  /** Card — the shared card surface. Encodes the platform card chrome
   *  (glass-card · 13px radius · 2-layer shadow · hairline border) plus the
   *  three padding tiers the dashboard and marketing pages agree on:
   *  content (24px) · compact (16px) · hero (32px).
   *
   *  Prefer this over hand-rolling `glass-card rounded-2xl p-6` so every page
   *  inherits the same chrome and the tiers stay consistent.
   *
   *  Props:
   *    variant — 'content' | 'compact' | 'hero' (default 'content')
   *    hover   — adds the interactive hover chrome (border shift + lift)
   *    as      — semantic element to render ('div' | 'section' | 'article' | 'table')
   *    class   — extra utility classes forwarded to the root
   */
  import type { Snippet } from 'svelte';

  let {
    variant = 'content',
    hover = false,
    as = 'div',
    class: klass = '',
    children,
    ...rest
  }: {
    variant?: 'content' | 'compact' | 'hero';
    hover?: boolean;
    as?: 'div' | 'section' | 'article' | 'table';
    class?: string;
    children: Snippet;
  } & Record<string, unknown> = $props();

  const pad = $derived({
    content: 'p-6',
    compact: 'p-4',
    hero: 'p-8'
  }[variant]);
</script>

<svelte:element
  this={as}
  class="glass-card rounded-2xl {pad} {hover ? 'hover:border-brand-200 transition-all' : ''} {klass}"
  {...rest}
>
  {@render children()}
</svelte:element>
