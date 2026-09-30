<script lang="ts">
  /** Rails readiness (#15) — the honest status of each sovereign daemon: what
   *  is configured, what is connected, and what the env var is to flip it on.
   *  Live: /rails/status when signed in (per-rail enabled flags); the host
   *  connection itself is the standing prerequisite and shown as such. */
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchRailsStatus } from '$lib/api/rails';
  import Icon from './Icon.svelte';

  interface RailDef {
    id: string;
    label: string;
    icon: 'bitcoin' | 'lightning' | 'coins';
    env: string;
  }

  const RAILS: RailDef[] = [
    { id: 'onchain', label: 'Bitcoin on-chain (LND)', icon: 'bitcoin', env: 'LND_*' },
    { id: 'lightning', label: 'Lightning (LNBits)', icon: 'lightning', env: 'LNBITS_*' },
    { id: 'liquid', label: 'Liquid', icon: 'coins', env: 'LIQUID_*' },
    { id: 'paynym_bip47', label: 'PayNym (BIP-47)', icon: 'coins', env: 'PAYNYM_*' },
    { id: 'nostr', label: 'Nostr relay', icon: 'coins', env: 'NOSTR_RELAY_*' },
    { id: 'fiat', label: 'Fiat / Interac', icon: 'coins', env: 'FIAT_*' }
  ];

  let live = $state(false);
  let enabled = $state<Record<string, { enabled?: boolean }>>({});
  let loaded = $state(false);

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      live = session.status === 'signed-in';
      if (live) {
        fetchRailsStatus()
          .then((s) => { enabled = s.rails ?? {}; })
          .catch(() => {})
          .finally(() => { loaded = true; });
      } else {
        loaded = true;
      }
    });
    return unsubscribe;
  });

  const connectedCount = $derived(
    RAILS.filter((r) => enabled[r.id]?.enabled === true).length
  );
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="shield" class="h-4 w-4 text-brand-600" /> {$copy.readinessTitle}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.readinessHint}</p>
    </div>
    {#if live && loaded}
      <span class="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-bold text-slate-500">{connectedCount}/{RAILS.length} {$copy.readinessConnected}</span>
    {/if}
  </div>

  <ul class="mt-4 divide-y divide-border/60 rounded-xl border border-border">
    {#each RAILS as r}
      <li class="flex flex-wrap items-center gap-2 px-3.5 py-2.5 text-sm">
        <Icon name={r.icon} class="h-4 w-4 {r.id === 'onchain' || r.id === 'lightning' ? 'text-bitcoin' : 'text-slate-400'}" />
        <span class="font-semibold text-slate-800">{r.label}</span>
        <code class="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-slate-500">{r.env}</code>
        <span class="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold {
          enabled[r.id]?.enabled === true ? 'bg-success/10 text-success'
          : live && loaded ? 'bg-amber-100 text-amber-700'
          : 'bg-slate-100 text-slate-400'
        }">
          {enabled[r.id]?.enabled === true ? $copy.readinessConnected
            : live && loaded ? $copy.readinessConfigured
            : $copy.readinessPending}
        </span>
      </li>
    {/each}
  </ul>

  {#if !live || !loaded}
    <p class="mt-3 flex items-center gap-1.5 rounded-lg bg-surface-2/60 px-3 py-2 text-[11px] text-slate-400">
      <Icon name="clock" class="h-3 w-3 shrink-0" /> {$copy.readinessPending} — {$copy.connectHint}
    </p>
  {/if}
</section>
