<script lang="ts">
  /** Host connect strip (#20) — the honest demo↔live line. When the site runs
   *  in demo mode (no API base configured) this banner explains how to point
   *  it at an OpenStrata host; when a base is configured but no session, it
   *  invites sign-in. Dismissible per visit. */
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
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

  function openSettings() {
    const val = window.prompt('OpenStrata API base URL (e.g. https://host:8787)', '');
    if (val === null) return;
    if (val.trim()) {
      localStorage.setItem('openstrata-api-base', val.trim().replace(/\/+$/, ''));
      location.reload();
    } else {
      localStorage.removeItem('openstrata-api-base');
      location.reload();
    }
  }
</script>

{#if visible}
  <div class="os-host-strip" role="note">
    <Icon name="wrench" class="h-4 w-4 shrink-0 text-brand-600" />
    <div class="min-w-0 flex-1">
      <p class="text-sm font-bold text-slate-800">
        {mode === 'demo' ? $copy.connectTitle : $copy.signIn}
      </p>
      <p class="mt-0.5 text-xs text-slate-500">{mode === 'demo' ? $copy.connectSteps : $copy.authIntro}</p>
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <button class="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700" onclick={openSettings}>
        {mode === 'demo' ? $copy.connectTitle : $copy.signIn}
      </button>
      <button class="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-bold text-slate-500" onclick={() => (dismissed = true)} aria-label={$copy.closeDialog}>×</button>
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
</style>
