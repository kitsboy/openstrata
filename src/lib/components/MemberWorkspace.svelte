<script lang="ts">
  /** Member workspace (#4): the owner/occupant layer per lot. Live via
   *  /api/v1/members when signed in; demo roster otherwise. Each member row
   *  links the unit → AR → payments traceability spine to a person. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchMembers, createMember, deleteMember, type MemberWire } from '$lib/api/members';
  import Icon from './Icon.svelte';
  import Skeleton from './Skeleton.svelte';
  import EmptyState from './EmptyState.svelte';

  let members = $state<MemberWire[] | null>(null);
  let loading = $state(false);
  let showAdd = $state(false);
  let email = $state('');
  let displayName = $state('');
  let unitRef = $state('101');
  let roleLabel = $state<'owner' | 'tenant' | 'both'>('owner');
  let error = $state('');

  const DEMO: MemberWire[] = [
    { id: 1, email: 'm.chen@example.com', displayName: 'M. Chen', phone: null, unitRef: '101', roleLabel: 'owner', createdAt: '2026-06-01' },
    { id: 2, email: 'j.williams@example.com', displayName: 'J. Williams', phone: null, unitRef: '102', roleLabel: 'owner', createdAt: '2026-06-01' },
    { id: 3, email: 'a.patel@example.com', displayName: 'A. Patel', phone: null, unitRef: '202', roleLabel: 'owner', createdAt: '2026-06-01' },
    { id: 4, email: "s.obrien@example.com", displayName: "S. O'Brien", phone: null, unitRef: '301', roleLabel: 'owner', createdAt: '2026-06-01' }
  ];

  const LIVE_MODE = true;

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      if (session.status === 'signed-in') {
        loading = true;
        fetchMembers()
          .then((m) => (members = m))
          .catch(() => { members = null; })
          .finally(() => (loading = false));
      } else {
        members = null;
      }
    });
    return unsubscribe;
  });

  const display = $derived(members ?? DEMO);
  const live = $derived(members !== null);

  async function addMember() {
    error = '';
    try {
      const m = await createMember({ email: email.trim(), displayName: displayName.trim() || undefined, unitRef, roleLabel });
      members = [m, ...(members ?? [])];
      email = '';
      displayName = '';
      showAdd = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Request failed';
    }
  }

  async function removeMember(id: number) {
    try {
      await deleteMember(id);
      members = (members ?? []).filter((m) => m.id !== id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Request failed';
    }
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="home" class="h-4 w-4 text-brand-600" /> {$copy.membersTitle}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.membersHint}</p>
    </div>
    {#if live}
      <button class="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white" onclick={() => (showAdd = !showAdd)}>+ {$copy.membersAdd}</button>
    {/if}
  </div>

  {#if showAdd}
    <div class="mt-4 grid gap-3 rounded-xl border border-border bg-surface-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <input bind:value={displayName} placeholder={$copy.yourName} class="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm" />
      <input bind:value={email} placeholder={$copy.email} class="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm" />
      <select bind:value={unitRef} class="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm">
        {#each ['101', '102', '201', '202', '301', '302'] as u}<option>{u}</option>{/each}
      </select>
      <select bind:value={roleLabel} class="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm">
        <option value="owner">owner</option><option value="tenant">tenant</option><option value="both">both</option>
      </select>
      <button class="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white sm:col-span-2 lg:col-span-4" onclick={addMember}>{$copy.membersAdd}</button>
      {#if error}<p class="text-xs font-semibold text-danger sm:col-span-2 lg:col-span-4" role="alert">{error}</p>{/if}
    </div>
  {/if}

  <div class="mt-4">
    {#if loading}
      <div class="space-y-2"><Skeleton height="52px" /><Skeleton height="52px" /><Skeleton height="52px" /></div>
    {:else if display.length === 0}
      <EmptyState icon="home" title={$copy.membersEmpty} />
    {:else}
      <div class="grid gap-2 sm:grid-cols-2">
        {#each display as m}
          <div class="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-xs font-bold text-brand-700">
              {m.displayName.split(/\s+/).map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase()}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-slate-800">{m.displayName}</p>
              <p class="truncate text-xs text-slate-400">{m.email}</p>
            </div>
            <div class="text-right">
              <span class="rounded-full bg-bc-blue/10 px-2 py-0.5 text-[10px] font-bold text-bc-blue">{$copy.unitLabel} {m.unitRef}</span>
              <p class="mt-1 text-[10px] font-bold text-slate-400 uppercase">{m.roleLabel}</p>
            </div>
            {#if live}
              <button class="text-slate-400 hover:text-danger" aria-label={`remove ${m.displayName}`} onclick={() => removeMember(m.id)}><Icon name="trash" class="h-3.5 w-3.5" /></button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>
