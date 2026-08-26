<script lang="ts">
  /**
   * Watch-only xpub import (item #16). Keys never leave council hardware
   * wallets — this registers the *public* extended key so the backend derives
   * deterministic per-unit BIP32 receive paths. Live when signed in; the demo
   * shows the format the endpoint expects.
   */
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { apiFetch } from '$lib/api/client';
  import { getToken } from '$lib/api/token';
  import { onMount } from 'svelte';

  interface Derived {
    unitId: string;
    path: string;
    index: number;
  }

  let live = $state(false);
  let xpub = $state('');
  let registered = $state(false);
  let addresses = $state<Derived[] | null>(null);
  let error = $state('');
  let busy = $state(false);

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      live = session.status === 'signed-in';
      if (live) refresh();
    });
    return unsubscribe;
  });

  async function refresh() {
    try {
      const res = await apiFetch<{ ok: boolean; registered: boolean; addresses?: Derived[] }>('/api/v1/rails/xpub', {
        token: getToken()
      });
      registered = res.registered;
      addresses = res.addresses ?? null;
    } catch {
      /* not reachable — stay in demo state */
    }
  }

  async function register() {
    error = '';
    busy = true;
    try {
      const res = await apiFetch<{ ok: boolean; reason?: string }>('/api/v1/rails/xpub', {
        method: 'POST',
        token: getToken(),
        body: { xpub }
      });
      if (!res.ok) error = res.reason ?? $copy.xpubInvalid;
      else await refresh();
    } catch (err) {
      error = err instanceof Error ? err.message : $copy.xpubInvalid;
    } finally {
      busy = false;
    }
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-bold text-slate-800">🔐 {$copy.xpubTitle}</h3>
    {#if live && registered}
      <span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.xpubRegistered}</span>
    {/if}
  </div>
  <p class="text-sm text-slate-500">{$copy.xpubIntro}</p>

  {#if live}
    <div class="mt-4 flex flex-wrap items-center gap-2">
      <input
        bind:value={xpub}
        placeholder="xpub… / zpub…"
        class="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm"
        oninput={() => (error = '')}
      />
      <button class="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" disabled={busy} onclick={register}>
        {$copy.xpubRegister}
      </button>
    </div>
    {#if error}<p class="mt-2 text-sm text-danger" role="alert">{error}</p>{/if}

    {#if addresses}
      <div class="mt-5">
        <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{$copy.xpubPerUnit}</p>
        <div class="max-h-64 overflow-auto rounded-lg border border-border">
          {#each addresses as addr}
            <div class="flex items-center justify-between border-b border-border px-3 py-2 font-mono text-xs last:border-0">
              <span class="text-slate-700">{$copy.unitLabel} {addr.unitId}</span>
              <span class="text-slate-400">{addr.path}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {:else}
    <p class="mt-3 rounded-xl bg-surface-3 px-4 py-3 font-mono text-xs text-slate-500">{$copy.xpubDemo}</p>
  {/if}
</section>
