<script lang="ts">
  import { copy } from '$lib/i18n';
  import Card from '$lib/components/Card.svelte';
  import PageToc from '$lib/components/PageToc.svelte';
  import { quickStartPrereqs, quickStartSteps, quickStartFaq, quickStartPricing, quickStartTrouble } from '$lib/manual';
  import ManualNav from '$lib/components/ManualNav.svelte';

  let faqOpen = $state<number | null>(null);
  let troubleOpen = $state<number | null>(null);
</script>

<svelte:head>
  <title>{$copy.manualStartTitle} — OpenStrata</title>
</svelte:head>

<div class="manual-page">
  <div class="manual-page-content">

    <h1>{$copy.manualStartTitle}</h1>

    <p class="manual-lead">{$copy.manualStartIntro}</p>

    <PageToc />

    <!-- Prerequisites -->
    <section id="prereqs">
      <h2 class="manual-h2">{$copy.manualPrereqs}</h2>
      <div class="prereq-grid">
        {#each quickStartPrereqs as prereq}
          <label class="prereq-item">
            <input type="checkbox" class="prereq-check" />
            <span class="prereq-text">{prereq}</span>
          </label>
        {/each}
      </div>
    </section>

    <!-- The six steps -->
    <section id="steps" class="mb-10">
      <h2 class="manual-h2">{$copy.manualSixSteps}</h2>
      <ol class="steps-list">
        {#each quickStartSteps as step}
          <li class="step">
            <span class="step-num" aria-hidden="true">{step.step}</span>
            <div class="step-body">
              <h3 class="step-title">{step.title}</h3>
              <p class="step-text">{step.body}</p>
              {#if step.action}
                <a href={step.action.href} class="step-action">
                  {step.action.label}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
              {/if}
            </div>
          </li>
        {/each}
      </ol>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="mb-10">
      <h2 class="manual-h2">{$copy.manualCosts}</h2>
      <p class="manual-section-intro">{$copy.manualCostsIntro}</p>
      <div class="pricing-grid">
        {#each quickStartPricing as p}
          <Card variant="compact" hover>
            <div class="pricing-tier">{p.tier}</div>
            <div class="pricing-price">{p.price}</div>
            <div class="pricing-note">{p.note}</div>
            <div class="pricing-target">{p.target}</div>
          </Card>
        {/each}
      </div>
    </section>

    <!-- FAQ accordion -->
    <section id="faq" class="mb-10">
      <h2 class="manual-h2">{$copy.faqTitle}</h2>
      <p class="manual-section-intro">{$copy.faqIntro}</p>
      <div class="faq-list">
        {#each quickStartFaq as item, i}
          <div class="faq-item" class:faq-item-open={faqOpen === i}>
            <button
              class="faq-question"
              onclick={() => faqOpen = faqOpen === i ? null : i}
              aria-expanded={faqOpen === i}
            >
              <span>{item.q}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron" class:faq-chevron-open={faqOpen === i} aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {#if faqOpen === i}
              <div class="faq-answer">{item.a}</div>
            {/if}
          </div>
        {/each}
      </div>
    </section>

    <!-- Troubleshooting -->
    <section id="trouble" class="mb-10">
      <h2 class="manual-h2">{$copy.manualTrouble}</h2>
      <p class="manual-section-intro">{$copy.manualTroubleIntro}</p>
      <div class="trouble-list">
        {#each quickStartTrouble as item, i}
          <div class="trouble-item" class:trouble-item-open={troubleOpen === i}>
            <button
              class="trouble-question"
              onclick={() => troubleOpen = troubleOpen === i ? null : i}
              aria-expanded={troubleOpen === i}
            >
              <span>{item.symptom}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="trouble-chevron" class:trouble-chevron-open={troubleOpen === i} aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {#if troubleOpen === i}
              <div class="trouble-answer">{item.fix}</div>
            {/if}
          </div>
        {/each}
      </div>
    </section>

    <div class="manual-next">
      <a href="/docs/manual" class="manual-next-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        {$copy.manualBackToSections}
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

  .manual-h2 {
    font-size: 18px;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.01em;
    margin: 40px 0 16px;
    padding-bottom: 10px;
    border-bottom: var(--border-card);
  }

  .manual-section-intro {
    font-size: 14px;
    color: var(--muted);
    margin: 0 0 20px;
    max-width: 640px;
  }

  /* Prerequisites */
  .prereq-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
    margin-bottom: 8px;
  }
  .prereq-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    border: var(--border-card);
    background: var(--surface-2);
    cursor: default;
    transition: border-color .15s ease, background .15s ease;
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
  }
  .prereq-check {
    width: 16px;
    height: 16px;
    margin-top: 2px;
    accent-color: var(--brand);
    flex: 0 0 auto;
    cursor: default;
  }

  /* Steps */
  .steps-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .step {
    display: flex;
    gap: 16px;
    padding: 20px 0;
    border-bottom: 1px solid var(--border-card);
  }
  .step:last-child { border-bottom: none; }
  .step-num {
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--brand);
    color: white;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
  }
  .step-body { flex: 1; min-width: 0; }
  .step-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
    margin: 0 0 6px;
  }
  .step-text {
    font-size: 14px;
    line-height: 1.6;
    color: var(--muted);
    margin: 0 0 12px;
  }
  .step-action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--brand);
    text-decoration: none;
    padding: 5px 0;
    transition: gap .15s ease;
  }
  .step-action:hover { gap: 10px; }

  /* Pricing */
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
  }
  .pricing-tier {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .pricing-price {
    font-size: 22px;
    font-weight: 700;
    color: var(--ink);
    font-family: 'DM Mono', monospace;
    margin-bottom: 6px;
  }
  .pricing-note {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
    margin-bottom: 8px;
  }
  .pricing-target {
    font-size: 11px;
    color: var(--brand-700);
    font-weight: 600;
  }

  /* FAQ accordion */
  .faq-list {
    border: var(--border-card);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 32px;
  }
  .faq-item {
    border-bottom: var(--border-card);
  }
  .faq-item:last-child { border-bottom: none; }
  .faq-question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 16px 20px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    transition: background .15s ease;
  }
  .faq-question:hover { background: var(--surface-2); }
  .faq-chevron {
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    color: var(--muted);
    transition: transform .2s ease;
  }
  .faq-chevron-open { transform: rotate(180deg); }
  .faq-answer {
    padding: 0 20px 16px;
    font-size: 14px;
    line-height: 1.65;
    color: var(--muted);
  }

  /* Troubleshooting */
  .trouble-list {
    border: var(--border-card);
    border-radius: 12px;
    overflow: hidden;
  }
  .trouble-item {
    border-bottom: var(--border-card);
  }
  .trouble-item:last-child { border-bottom: none; }
  .trouble-question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 14px 20px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: var(--orange-700);
    transition: background .15s ease;
  }
  .trouble-question:hover { background: color-mix(in srgb, var(--orange) 4%, transparent); }
  .trouble-chevron {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    color: var(--orange-600);
    transition: transform .2s ease;
  }
  .trouble-chevron-open { transform: rotate(180deg); }
  .trouble-answer {
    padding: 0 20px 14px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--muted);
    background: color-mix(in srgb, var(--orange) 5%, transparent);
    border-left: 3px solid var(--orange-400);
    padding-left: 14px;
    margin-left: -4px;
  }

  .manual-next {
    margin-top: 32px;
    padding-top: 20px;
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
