<script lang="ts">
  /** Export center (#17): one place for portable JSON, CRT bundle, Form B/F
   *  certificates, and ledger CSV. Extends the existing EvidenceExport panel
   *  into a grid; ledger CSV delegates to the explorer's download. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { apiFetch } from '$lib/api/client';
  import { getToken } from '$lib/api/token';
  import { fetchLedgerEntries } from '$lib/api/ledger';
  import Icon from './Icon.svelte';

  let live = $state(false);

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      live = session.status === 'signed-in';
    });
    return unsubscribe;
  });

  function openUrl(path: string) {
    const base = (import.meta.env.PUBLIC_API_BASE_URL as string | undefined) ?? localStorage.getItem('openstrata-api-base') ?? '';
    if (!base) return;
    window.open(`${base}${path}`, '_blank');
  }

  async function downloadJson(path: string, filename: string) {
    const res = await apiFetch<unknown>(path, { token: getToken() });
    const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadLedgerCsv() {
    const entries = await fetchLedgerEntries('operating');
    if (!entries.length) return;
    const head = 'seq,kind,amountBasis,type,referenceCode,postedAt,tallyRoot';
    const rows = entries.map((e) => [e.seq, e.kind, e.amountBasis, `"${e.type}"`, `"${e.referenceCode}"`, e.postedAt, e.tallyRoot].join(','));
    const blob = new Blob([[head, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ledger-operating.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const EXPORTS = [
    { icon: 'download', label: $copy.portableExport, action: () => downloadJson('/api/v1/export/portable', 'openstrata-portable.json'), hint: 'openstrata-portable/v1' },
    { icon: 'scale', label: $copy.crtExport, action: () => openUrl('/api/v1/compliance/crt-export?fund=operating'), hint: 'print-ready HTML' },
    { icon: 'file', label: $copy.formBPrint, action: () => openUrl('/api/v1/forms/b/101'), hint: '7-day certificate' },
    { icon: 'file', label: $copy.formFPrint, action: () => openUrl('/api/v1/forms/f/101'), hint: 'payment certificate' },
    { icon: 'chart', label: $copy.ledgerCsv, action: () => downloadLedgerCsv(), hint: 'operating fund' }
  ] as const;
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="external" class="h-4 w-4 text-brand-600" /> {$copy.exportTitle}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.exportHint}</p>
    </div>
  </div>

  <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {#each EXPORTS as exp}
      <button
        class="rounded-xl border border-border bg-surface-2 p-4 text-left transition-all hover:border-brand-200 hover:bg-brand-50/40 disabled:opacity-40"
        onclick={exp.action}
        disabled={!live}
      >
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600"><Icon name={exp.icon} class="h-4 w-4" /></span>
        <p class="mt-2 text-sm font-bold text-slate-800">{exp.label}</p>
        <p class="mt-0.5 text-[10px] font-bold text-slate-400 uppercase">{exp.hint}</p>
      </button>
    {/each}
  </div>

  {#if !live}
    <p class="mt-3 text-xs font-semibold text-slate-400">{ $copy.evidenceDemo }</p>
  {/if}
</section>
