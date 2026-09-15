<script lang="ts">
  import { page } from '$app/stores';
  import Card from '$lib/components/Card.svelte';
  import { manualSections } from '$lib/manual';

  const items = manualSections.map((s) => ({
    href: s.href,
    label: s.title,
    badge: s.label
  }));
</script>

<nav class="manual-nav" aria-label="Manual sections">
  <div class="manual-nav-label">In this manual</div>
  <ul class="manual-nav-list">
    {#each items as item}
      <li>
        <a
          href={item.href}
          class="manual-nav-item"
          class:manual-nav-item-active={$page.url.pathname === item.href || $page.url.pathname.startsWith(item.href + '/')}
        >
          <span class="manual-nav-text">{item.label}</span>
          {#if item.badge}
            <span class="manual-nav-badge">{item.badge}</span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
  <div class="manual-nav-foot">
    <a href="/docs" class="manual-nav-root">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
      All docs
    </a>
  </div>
</nav>

<style>
  .manual-nav {
    position: sticky;
    top: 88px;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    padding: 14px 0;
    border-right: var(--border-card);
  }
  @media (max-width: 1023px) {
    .manual-nav { display: none; }
  }

  .manual-nav-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 10px;
    padding-left: 2px;
  }

  .manual-nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .manual-nav-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    text-decoration: none;
    color: var(--muted);
    font-size: 13px;
    font-weight: 500;
    transition: color .15s ease, background .15s ease;
  }
  .manual-nav-item:hover {
    color: var(--ink);
    background: var(--surface-3);
  }
  .manual-nav-item-active {
    color: var(--brand);
    background: color-mix(in srgb, var(--brand) 8%, transparent);
    font-weight: 600;
  }

  .manual-nav-text {
    flex: 1;
    text-align: left;
  }

  .manual-nav-badge {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .06em;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--brand) 10%, transparent);
    color: var(--brand-700);
    font-weight: 600;
    white-space: nowrap;
  }

  .manual-nav-foot {
    margin-top: auto;
    padding-top: 14px;
    border-top: var(--border-card);
  }

  .manual-nav-root {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: var(--muted);
    text-decoration: none;
    padding: 4px 0;
    transition: color .15s ease;
  }
  .manual-nav-root:hover { color: var(--brand); }
</style>
