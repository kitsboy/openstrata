<script lang="ts">
  import { copy } from '$lib/i18n';
  import Card from '$lib/components/Card.svelte';
  import { welcomeAudiences, welcomeCapabilities, welcomeLimits } from '$lib/manual';
  import ManualNav from '$lib/components/ManualNav.svelte';
</script>

<svelte:head>
  <title>{$copy.manualWelcomeTitle} — OpenStrata</title>
</svelte:head>

<div class="manual-page">
  <div class="manual-page-content">

    <!-- Start-here flag — small green light, not overpowering -->
    <div class="start-flag" aria-label="Start here">
      <span class="start-flag-dot" aria-hidden="true"></span>
      <span class="start-flag-label">{$copy.manualStartHere}</span>
    </div>

    <h1>{$copy.manualWelcomeTitle}</h1>

    <p class="manual-lead">{$copy.manualWelcomeIntro}</p>

    <div class="manual-grid">

      <!-- Capabilities -->
      <Card variant="content">
        <h2 class="manual-section-title">{$copy.manualWhatItDoes}</h2>
        <ul class="manual-cap-list">
          {#each welcomeCapabilities as cap}
            <li class="manual-cap">
              <span class="manual-cap-title">{cap.title}</span>
              <p class="manual-cap-body">{cap.body}</p>
            </li>
          {/each}
        </ul>
      </Card>

      <!-- Who it's for + what it's not -->
      <div class="manual-split">

        <Card variant="content">
          <h2 class="manual-section-title">{$copy.manualWhoFor}</h2>
          <ul class="manual-audience-list">
            {#each welcomeAudiences as aud}
              <li class="manual-audience">
                <span class="manual-audience-title">{aud.title}</span>
                <p class="manual-audience-body">{aud.body}</p>
              </li>
            {/each}
          </ul>
        </Card>

        <Card variant="content">
          <h2 class="manual-section-title manual-section-title-warn">{$copy.manualWhatNot}</h2>
          <ul class="manual-limit-list">
            {#each welcomeLimits as lim}
              <li class="manual-limit">
                <span class="manual-limit-title">{lim.title}</span>
                <p class="manual-limit-body">{lim.body}</p>
              </li>
            {/each}
          </ul>
        </Card>

      </div>

    </div>

    <div class="manual-next">
      <a href="/docs/manual/getting-started" class="manual-next-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        {$copy.manualNextStep}
      </a>
    </div>

  </div>

  <aside class="manual-page-sidebar">
    <ManualNav />
  </aside>
</div>

<style>
  .manual-page {
    display: grid;
    grid-template-columns: 1fr 220px;
    gap: 40px;
    max-width: 1100px;
    margin: 0 auto;
    padding: 48px 24px 64px;
  }
  @media (max-width: 1023px) {
    .manual-page { grid-template-columns: 1fr; padding: 28px 16px 48px; }
  }

  .manual-page-content { min-width: 0; }

  .start-flag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
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
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .04em;
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
    margin: 0 0 12px;
  }
  @media (min-width: 768px) {
    h1 { font-size: 32px; }
  }

  .manual-lead {
    font-size: 16px;
    line-height: 1.65;
    color: var(--muted);
    max-width: 680px;
    margin: 0 0 36px;
  }

  .manual-grid {
    display: grid;
    gap: 20px;
  }
  @media (min-width: 768px) {
    .manual-grid { grid-template-columns: 1fr 1fr; }
  }

  .manual-split {
    display: grid;
    gap: 20px;
  }

  .manual-section-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.01em;
    margin: 0 0 14px;
    padding-bottom: 10px;
    border-bottom: var(--border-card);
  }
  .manual-section-title-warn {
    color: var(--orange-700);
  }

  .manual-cap-list,
  .manual-audience-list,
  .manual-limit-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .manual-cap-title,
  .manual-audience-title,
  .manual-limit-title {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 3px;
  }

  .manual-cap-body,
  .manual-audience-body,
  .manual-limit-body {
    font-size: 14px;
    line-height: 1.6;
    color: var(--muted);
    margin: 0;
  }

  .manual-limit-body {
    color: var(--orange-800);
  }

  .manual-next {
    margin-top: 40px;
    padding-top: 24px;
    border-top: var(--border-card);
  }

  .manual-next-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--brand);
    text-decoration: none;
    padding: 10px 16px;
    border-radius: 10px;
    background: var(--brand-50);
    border: 1px solid var(--brand-200);
    transition: background .15s ease, border-color .15s ease, transform .1s ease;
  }
  .manual-next-link:hover {
    background: var(--brand-100);
    border-color: var(--brand-300);
    transform: translateY(-1px);
  }

  .manual-page-sidebar {
    grid-column: 2;
  }
</style>
