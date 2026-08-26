<script lang="ts">
  // "On this page" scroll-spy TOC for long content pages. Scans `main h2`
  // headings, assigns stable ids, and highlights the section in view.
  import { copy } from '$lib/i18n';

  let entries = $state<Array<{ id: string; text: string }>>([]);
  let active = $state<string | null>(null);
  let shown = $state(false);

  $effect(() => {
    const headings = Array.from(document.querySelectorAll('main h2[id], main h2'));
    if (headings.length < 2) return;
    const found = headings.map((heading, i) => {
      if (!heading.id) {
        const text = (heading.textContent ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        heading.id = `toc-${i}-${text || 'section'}`;
      }
      return { id: heading.id, text: (heading.textContent ?? '').trim() };
    });
    entries = found;
    shown = true;

    const observer = new IntersectionObserver(
      (intersections) => {
        const visible = intersections
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) active = (visible[0].target as HTMLElement).id;
      },
      { rootMargin: '-96px 0px -68% 0px', threshold: 0 }
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  });

  function jump(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

{#if shown}
  <aside class="toc" aria-label={$copy.onThisPage}>
    <p class="toc-label">{$copy.onThisPage}</p>
    <ul>
      {#each entries as entry}
        <li>
          <button
            class:toc-active={active === entry.id}
            onclick={() => jump(entry.id)}
          >{entry.text}</button>
        </li>
      {/each}
    </ul>
  </aside>
{/if}

<style>
  .toc {
    float: right;
    position: sticky;
    top: 92px;
    width: 210px;
    max-height: calc(100vh - 120px);
    margin: 4px 0 28px 28px;
    padding: 14px 14px 12px;
    overflow-y: auto;
    border: var(--border-card);
    border-radius: 12px;
    background: var(--paper);
    box-shadow: var(--shadow-card);
  }
  .toc-label {
    margin: 0 0 9px;
    color: var(--faint);
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .toc ul { margin: 0; padding: 0; list-style: none; }
  .toc li { margin: 1px 0; }
  .toc button {
    display: block;
    width: 100%;
    padding: 6px 8px;
    border-radius: 7px;
    color: var(--muted);
    background: transparent;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.35;
    text-align: left;
    transition: color .15s ease, background .15s ease;
  }
  .toc button:hover { color: var(--ink); background: var(--surface-3); }
  .toc button.toc-active { color: var(--orange); background: color-mix(in srgb, var(--orange) 9%, transparent); }
  @media (max-width: 1024px) { .toc { display: none; } }
</style>
