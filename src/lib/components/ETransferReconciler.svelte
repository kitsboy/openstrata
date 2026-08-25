<script lang="ts">
  import { copy, formatCurrency } from '$lib/i18n';
  import { reconcileTransfers, type ETransfer } from '$lib/reconcile';
  import { demoUnits, unitsToUnitRefs } from '$lib/units';

  // ---- Simulated inbound e-transfer notifications (bank format) ----
  const INITIAL_TRANSFERS: ETransfer[] = [
    { id: 'ET-1042', from: 'Marie Chen', message: 'Unit 302 May fees', amount: 486.5, date: '2026-08-01' },
    { id: 'ET-1043', from: 'J. Williams', message: '302', amount: 486.5, date: '2026-08-01' },
    { id: 'ET-1044', from: 'Aisha Patel', message: '202 strata fees', amount: 512.0, date: '2026-08-02' },
    { id: 'ET-1045', from: 'Sean OBrien', message: 'Unit 301', amount: 512.0, date: '2026-08-02' },
    { id: 'ET-1046', from: 'Unknown', message: 'For the pool fund thanks', amount: 90.0, date: '2026-08-03' },
    { id: 'ET-1047', from: 'Marie Chen', message: '302 overpayment to CRF', amount: 200.0, date: '2026-08-03' }
  ];

  // Match against the single canonical building (mirrors backend units).
  const UNITS = unitsToUnitRefs(demoUnits);

  let transfers = $state<ETransfer[]>([...INITIAL_TRANSFERS]);
  // Manual override: transferId -> chosen unitId (resolves unmatched/ambiguous).
  let manual = $state<Record<string, string>>({});
  let mode = $state<'brief' | 'full'>('brief');

  const unitIds = $derived(UNITS.map((u) => u.id));
  // Last automatic pass, before manual overrides.
  const autoBucket = $derived(reconcileTransfers(transfers, UNITS, { mode }));

  // Effective per-transfer view: manual assignment wins, else auto result.
  const rows = $derived(
    transfers.map((tx) => {
      const auto = [...autoBucket.auto, ...autoBucket.ambiguous, ...autoBucket.unmatched].find(
        (r) => r.transferId === tx.id
      );
      const chosen = manual[tx.id];
      return {
        tx,
        kind: chosen ? ('manual' as const) : (auto?.kind ?? 'unmatched'),
        unitId: chosen ?? auto?.unitId ?? null,
        reason: auto?.reason ?? ''
      };
    })
  );

  const autoCount = $derived(rows.filter((r) => r.kind === 'auto').length);
  const totalReceived = $derived(transfers.reduce((s, t) => s + t.amount, 0));
  const resolvedReceived = $derived(
    rows.filter((r) => r.unitId).reduce((s, r) => s + r.tx.amount, 0)
  );

  function assign(tx: ETransfer, unitId: string) {
    manual = { ...manual, [tx.id]: unitId };
  }

  function kindClass(kind: string): string {
    if (kind === 'auto') return 'bg-success/10 text-success';
    if (kind === 'manual') return 'bg-bc-blue/10 text-bc-blue';
    if (kind === 'ambiguous') return 'bg-amber-100 text-amber-700';
    return 'bg-danger/10 text-danger';
  }

  const kindLabel = (kind: string) =>
    kind === 'auto'
      ? $copy.reconAuto
      : kind === 'manual'
        ? $copy.reconManual
        : kind === 'ambiguous'
          ? $copy.reconAmbiguous
          : $copy.reconUnmatched;

</script>

<section class="glass-card rounded-2xl p-8">
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h3 class="text-lg font-bold text-slate-800">💸 {$copy.etransferTitle}</h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.etransferIntro}</p>
    </div>
    <div class="flex items-center gap-2">
      <button
        class="rounded-lg px-3 py-1.5 text-xs font-semibold {mode === 'brief' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}"
        onclick={() => (mode = 'brief')}
      >{$copy.etransferMatchBrief}</button>
      <button
        class="rounded-lg px-3 py-1.5 text-xs font-semibold {mode === 'full' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}"
        onclick={() => (mode = 'full')}
      >{$copy.etransferMatchFull}</button>
    </div>
  </div>

  <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div class="rounded-xl bg-surface-2 border border-border px-4 py-3">
      <div class="text-xl font-bold text-slate-800">{formatCurrency(totalReceived, 'en', { maximumFractionDigits: 2 })}</div>
      <div class="text-[10px] font-bold text-slate-400 uppercase">{$copy.reconTotalReceived}</div>
    </div>
    <div class="rounded-xl bg-surface-2 border border-border px-4 py-3">
      <div class="text-xl font-bold text-slate-800">{formatCurrency(resolvedReceived, 'en', { maximumFractionDigits: 2 })}</div>
      <div class="text-[10px] font-bold text-slate-400 uppercase">{$copy.reconResolved}</div>
    </div>
    <div class="rounded-xl bg-surface-2 border border-border px-4 py-3">
      <div class="text-xl font-bold text-success">{autoCount}</div>
      <div class="text-[10px] font-bold text-slate-400 uppercase">{$copy.reconAuto}</div>
    </div>
    <div class="rounded-xl bg-surface-2 border border-border px-4 py-3">
      <div class="text-xl font-bold text-amber-600">{rows.filter((r) => r.kind !== 'auto' && !r.unitId).length}</div>
      <div class="text-[10px] font-bold text-slate-400 uppercase">{$copy.reconNeedsReview}</div>
    </div>
  </div>

  <!-- Inbound transfer queue -->
  <div class="mt-6">
    <div class="hidden sm:grid grid-cols-[1fr_auto_auto] gap-2 pb-2 text-[10px] font-bold text-slate-400 uppercase">
      <span>{$copy.etransferInbound}</span>
      <span>{$copy.reconAssignTo}</span>
      <span class="text-right">{$copy.reconAmount}</span>
    </div>
    {#each rows as row}
      <div class="flex flex-wrap items-center gap-2 border-t border-border py-3 text-sm">
        <span class={`rounded-full px-2 py-0.5 text-[10px] font-bold ${kindClass(row.kind)}`}>
          {kindLabel(row.kind)}
          {#if row.unitId} · {$copy.unitLabel} {row.unitId}{/if}
        </span>
        <span class="text-slate-600">{row.tx.from}</span>
        <code class="text-xs text-slate-500">“{row.tx.message}”</code>
        <span class="text-xs text-slate-400">{row.tx.date}</span>
        <span class="ml-auto font-mono text-slate-800">{formatCurrency(row.tx.amount, 'en', { maximumFractionDigits: 2 })}</span>
      </div>
      {#if !row.unitId}
        <div class="flex items-center gap-2 pl-0 sm:pl-[44px] pb-3">
          <select
            class="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs text-slate-600"
            onchange={(e) => assign(row.tx, (e.currentTarget as HTMLSelectElement).value)}
            aria-label="{$copy.reconAssignTo} {row.tx.id}"
          >
            <option value="">{$copy.reconSelectUnit}…</option>
            {#each unitIds as uid}<option value={uid}>{$copy.unitLabel} {uid}</option>{/each}
          </select>
        </div>
      {/if}
    {/each}
  </div>

  <p class="mt-4 text-xs text-slate-400">{$copy.etransferFootnote}</p>
</section>