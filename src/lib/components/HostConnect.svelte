<script lang="ts">
  /** Demo / host status strip (#20) — the honest demo↔live line.
   *
   *  Visitor rule: a stranger is NEVER shown build-configuration instructions.
   *  When the site runs in demo mode (no API base configured for this build)
   *  the strip states plainly that the data on screen is sample data, and
   *  offers exactly one obvious way to ask for access. The operator path
   *  (pointing the site at your own OpenStrata host) is kept — the capability
   *  is unchanged — but it is demoted to a clearly developer-labelled link
   *  that has to be clicked deliberately, and documented in README.md.
   *
   *  When a base IS configured but there is no session, the strip invites
   *  sign-in instead. Dismissible per visit. */
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { API_BASE_KEY } from '$lib/api/config';
  import Icon from './Icon.svelte';

  let dismissed = $state(false);
  let session = $state<{ apiMode: 'demo' | 'configured'; status: string }>({
    apiMode: 'demo',
    status: 'booting'
  });

  onMount(() => {
    const unsubscribe = auth.subscribe((s) => (session = s));
    return unsubscribe;
  });

  const mode = $derived(
    session.apiMode === 'configured'
      ? session.status === 'signed-in' ? 'live' : 'configured'
      : 'demo'
  );

  const visible = $derived(!dismissed && mode !== 'live');

  const mailto = 'mailto:hello@giveabit.io?subject=OpenStrata%20access%20request';

  /** Operator-only path. Only ever reachable by deliberately clicking the
   *  developer link below — never rendered as the first thing a visitor sees. */
  function openHostSettings() {
    const current = localStorage.getItem(API_BASE_KEY) ?? '';
    const val = window.prompt($copy.devHostPrompt, current);
    if (val === null) return;
    const next = val.trim().replace(/\/+$/, '');
    if (next) localStorage.setItem(API_BASE_KEY, next);
    else localStorage.removeItem(API_BASE_KEY);
    location.reload();
  }
</script>

{#if visible}
  <div class="os-host-strip" role="note" data-mode={mode}>
    <Icon name="spark" class="h-4 w-4 shrink-0 text-brand-600" />
    <div class="min-w-0 flex-1">
      {#if mode === 'demo'}
        <p class="text-sm font-bold text-slate-800">{$copy.demoNoticeTitle}</p>
        <p class="mt-0.5 text-xs text-slate-500">
          {$copy.demoNoticeBody}
          <button type="button" class="os-dev-link" onclick={openHostSettings}>{$copy.devHostLabel}</button>
        </p>
      {:else}
        <p class="text-sm font-bold text-slate-800">{$copy.signIn}</p>
        <p class="mt-0.5 text-xs text-slate-500">
          {$copy.authIntro}
          <button type="button" class="os-dev-link" onclick={openHostSettings}>{$copy.devHostLabel}</button>
        </p>
      {/if}
    </div>
    <div class="flex shrink-0 items-center gap-2">
      {#if mode === 'demo'}
        <a class="os-strip-cta" href={mailto}>{$copy.demoNoticeCta}</a>
        <a class="os-strip-ghost" href="/about">{$copy.demoNoticeLearn}</a>
      {:else}
        <a class="os-strip-ghost" href="/faq">{$copy.needAHand}</a>
      {/if}
      <button
        class="os-strip-close"
        onclick={() => (dismissed = true)}
        aria-label={$copy.closeDialog}>×</button
      >
    </div>
  </div>
{/if}

<style>
  .os-host-strip {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 20px;
    padding: 12px 16px;
    border-radius: 14px;
    border: 1px solid var(--brand-200, #c7d2fe);
    background: linear-gradient(180deg, var(--brand-50, #eef2ff), var(--surface-2, #f1f5f9));
  }
  .os-strip-cta {
    border-radius: 10px;
    background: var(--brand-600, #4f46e5);
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    text-decoration: none;
    white-space: nowrap;
  }
  .os-strip-cta:hover {
    background: var(--brand-700, #4338ca);
  }
  .os-strip-ghost {
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface-2, #f1f5f9);
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    text-decoration: none;
    white-space: nowrap;
  }
  .os-strip-ghost:hover {
    color: var(--ink, #18232b);
  }
  /* Deliberately quiet: the operator path is not a visitor call to action. */
  .os-dev-link {
    border: 0;
    background: none;
    padding: 0;
    font: inherit;
    color: inherit;
    text-decoration: underline dotted;
    cursor: pointer;
  }
  .os-dev-link:hover {
    color: var(--ink, #18232b);
  }
  .os-strip-close {
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface-2, #f1f5f9);
    padding: 5px 9px;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
  }
  @media (max-width: 640px) {
    .os-host-strip {
      flex-wrap: wrap;
    }
  }
</style>
