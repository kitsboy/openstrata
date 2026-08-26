<script lang="ts">
  /** Forms B/F tracker (#4) — issue a statutory certificate and track the
   *  7-day delivery window. Live: POST /forms returns the certificate with its
   *  due date + status, and the printable document links to GET /forms/b|f.
   *  Demo: same math locally so the countdown is honest without a host. */
  import { onMount } from 'svelte';
  import { copy, formatDate, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchUnits, type ApiUnit } from '$lib/api/units';
  import { issueForm, formUrl, formDeliverBy, daysUntil, type FormCertificate } from '$lib/api/forms';
  import Icon from './Icon.svelte';
  import Illustrations from './Illustrations.svelte';

  interface TrackerRow {
    kind: 'B' | 'F';
    unitId: string;
    requestedAt: string;
    deliverBy: string;
    daysLeft: number;
    cert: FormCertificate | null;
    url: string;
  }

  let liveUnits = $state<ApiUnit[] | null>(null);
  let rows = $state<TrackerRow[]>([]);
  let unitRef = $state('101');
  let busy = $state(false);
  let error = $state('');
  let live = $state(false);

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      live = session.status === 'signed-in';
      if (live) {
        fetchUnits().then((u) => {
          liveUnits = u;
          if (u.length) unitRef = u[0]!.unitRef;
        }).catch(() => {});
      } else {
        liveUnits = null;
      }
    });
    return unsubscribe;
  });

  const unitList = $derived(liveUnits ?? [
    { unitRef: '101' }, { unitRef: '102' }, { unitRef: '201' }, { unitRef: '202' }
  ] as ApiUnit[]);

  async function issue(kind: 'B' | 'F') {
    if (busy) return;
    error = '';
    busy = true;
    const requestedAt = new Date().toISOString().slice(0, 10);
    const deliverBy = formDeliverBy(requestedAt);
    let cert: FormCertificate | null = null;

    if (live) {
      try {
        cert = await issueForm({
          kind,
          unitId: unitRef,
          requestedAt,
          balanceBasis: Math.round((Math.random() * 800 + 200) * 100)
        });
      } catch {
        error = 'Form issuance failed — check the host.';
      }
    } else {
      // Demo certificate mirrors backend generateForm (state = issued for B,
      // withheld when balance > 0 for F).
      const balanceBasis = Math.round((Math.random() * 800 + 200) * 100);
      cert = {
        kind,
        unitId: unitRef,
        state: kind === 'F' && balanceBasis > 0 ? 'withheld' : 'issued',
        dueDate: kind === 'B' ? deliverBy : '',
        status: 'ok',
        balanceBasis,
        issuedAt: requestedAt,
        disclosures: [`Balance: $${(balanceBasis / 100).toFixed(2)}`]
      };
    }

    rows = [{
      kind,
      unitId: unitRef,
      requestedAt,
      deliverBy,
      daysLeft: daysUntil(deliverBy),
      cert,
      url: formUrl(kind, unitRef)
    }, ...rows].slice(0, 8);
    busy = false;
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="file" class="h-4 w-4 text-brand-600" /> {$copy.formsTrackerTitle}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.formsTrackerHint}</p>
    </div>
  </div>

  <div class="mt-4 flex flex-wrap items-end gap-3">
    <label class="block min-w-32 flex-1">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.unitLabel}</span>
      <select bind:value={unitRef} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800">
        {#each unitList as u}<option value={u.unitRef}>{$copy.unitLabel} {u.unitRef}</option>{/each}
      </select>
    </label>
    <div class="flex gap-2">
      <button class="rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50" onclick={() => issue('B')} disabled={busy}>{$copy.formsIssueB}</button>
      <button class="rounded-xl bg-bitcoin px-3 py-2 text-xs font-bold text-white hover:bg-bitcoin/90 disabled:opacity-50" onclick={() => issue('F')} disabled={busy}>{$copy.formsIssueF}</button>
    </div>
  </div>

  {#if error}<p class="mt-3 text-xs font-semibold text-danger" role="alert"><Icon name="alert" class="h-3 w-3 inline" /> {error}</p>{/if}

  {#if rows.length}
    <ul class="mt-4 divide-y divide-border/60 rounded-xl border border-border bg-surface-2/60">
      {#each rows as r}
        <li class="flex flex-wrap items-center gap-2 px-3.5 py-2.5 text-sm">
          <span class="rounded-md bg-bc-blue/10 px-1.5 py-0.5 text-[10px] font-black text-bc-blue">Form {r.kind}</span>
          <span class="font-bold text-slate-800">{$copy.unitLabel} {r.unitId}</span>
          <span class="text-xs text-slate-500">{formatDate(r.requestedAt, $locale)}</span>
          <span class="flex items-center gap-1 text-xs text-slate-500">
            <Icon name="clock" class="h-3 w-3" /> {$copy.formsDeliverBy} {formatDate(r.deliverBy, $locale)}
          </span>
          {#if r.kind === 'B'}
            <span class="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold {r.daysLeft < 0 ? 'bg-danger/10 text-danger' : r.daysLeft <= 2 ? 'bg-amber-100 text-amber-700' : 'bg-success/10 text-success'}">
              {r.daysLeft < 0 ? 'overdue' : `${r.daysLeft} ${$copy.formsDaysLeft}`}
            </span>
          {:else if r.cert?.state === 'withheld'}
            <span class="ml-auto rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-bold text-danger">withheld</span>
          {/if}
          {#if r.cert}
            <a class="flex items-center gap-1 text-xs font-bold text-brand-700 no-underline" href={r.url} target="_blank" rel="noopener noreferrer">
              <Icon name="external" class="h-3 w-3" /> {r.cert.state === 'issued' ? 'view' : 'details'}
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  {:else}
    <div class="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface-2/40 px-4 py-6 text-center">
      <Illustrations scene="ledger" class="h-16 w-16 text-slate-300" />
      <p class="text-sm text-slate-400">{live ? 'No certificates yet — issue the first Form B or F above.' : $copy.evidenceDemo}</p>
    </div>
  {/if}
</section>
