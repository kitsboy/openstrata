<script lang="ts">
  import { copy } from '$lib/i18n';
  import Card from '$lib/components/Card.svelte';
  import { manualSections } from '$lib/manual';
</script>

<svelte:head>
  <title>{$copy.manualTitle} — OpenStrata</title>
</svelte:head>

<div class="manual-hub">
  <div class="manual-hub-header">
    <div class="start-flag" aria-label="Start here">
      <span class="start-flag-dot" aria-hidden="true"></span>
      <span class="start-flag-label">{$copy.manualStartHere}</span>
    </div>
    <h1>{$copy.manualTitle}</h1>
    <p class="manual-hub-intro">{$copy.manualIntro}</p>
  </div>

  <div class="manual-grid">
    {#each manualSections as guide}
      <Card variant="content" hover>
        <div class="manual-card-top">
          <code class="manual-card-label">{guide.label}</code>
          <a href={guide.href} class="manual-card-cta" aria-label={$copy.manualReadMore}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
        <h3 class="manual-card-title">{guide.title}</h3>
        <p class="manual-card-desc">{guide.desc}</p>
      </Card>
    {/each}
  </div>
</div>

<style>
  .manual-hub {
    max-width: 980px;
    margin: 0 auto;
    padding: 56px 24px 64px;
  }

  .manual-hub-header {
    margin-bottom: 40px;
    border-bottom: var(--border-card);
    padding-bottom: 28px;
  }

  .start-flag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 18px;
  }
  .start-flag-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--green-500);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--green-500) 22%, transparent);
    flex: 0 0 auto;
    animation: pulse-green 2.4s ease-in-out infinite;
  }
  @keyframes pulse-green {
    0%, 100% { box-shadow: 0 0 0 3px color-mix(in srgb, var(--green-500) 22%, transparent); }
    50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--green-500) 10%, transparent); }
  }
  .start-flag-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .05em;
    text-transform: uppercase;
    color: var(--green-700);
    background: color-mix(in srgb, var(--green-500) 10%, transparent);
    padding: 3px 8px;
    border-radius: 4px;
  }

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin: 0 0 10px;
  }
  @media (min-width: 768px) {
    h1 { font-size: 34px; }
  }

  .manual-hub-intro {
    font-size: 15px;
    line-height: 1.65;
    color: var(--muted);
    max-width: 600px;
    margin: 0;
  }

  .manual-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }
  @media (min-width: 640px) {
    .manual-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1024px) {
    .manual-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .manual-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .manual-card-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--faint);
    background: var(--surface-2);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .manual-card-cta {
    color: var(--muted);
    transition: color .15s ease, transform .1s ease;
    display: flex;
    align-items: center;
  }
  .manual-card-cta:hover {
    color: var(--brand);
    transform: translateX(2px);
  }

  .manual-card-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
    margin: 0 0 6px;
    letter-spacing: -0.01em;
  }

  .manual-card-desc {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.55;
    margin: 0;
  }
</style>
