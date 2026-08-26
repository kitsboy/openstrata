<script lang="ts">
  /** Rosa — compliance assistant (#1). Ask BC strata law questions; Rosa answers
   *  with citations only and refuses to guess. Live via POST /rosa/query when
   *  signed in; an honest demo Q&A runs the same strict composition locally. */
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { rosaQuery, type RosaAnswer } from '$lib/api/rosa';
  import Icon from './Icon.svelte';

  interface ChatMessage {
    role: 'user' | 'rosa';
    text: string;
    cited?: string[];
    uncertain?: boolean;
    demo?: boolean;
  }

  let messages = $state<ChatMessage[]>([
    {
      role: 'rosa',
      text: $copy.rosaIntro,
      demo: true
    }
  ]);
  let input = $state('');
  let busy = $state(false);
  let live = $state(false);

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      live = session.status === 'signed-in';
    });
    return unsubscribe;
  });

  /** Demo corpus — mirrors backend/src/rosa's strict composition. */
  const DEMO_PAIRS: Array<{ q: RegExp; a: string; cited: string[]; uncertain?: boolean }> = [
    {
      q: /short.?term|rental|airbnb|vacation/i,
      a: 'Under SPA s.141 (bylaw 5.2), short-term rentals of less than one month are prohibited unless the strata has adopted an opt-in bylaw under s.141(2). A contravention lets the strata issue fines under s.133 after a 14-day notice window.',
      cited: ['SPA s.141', 'SPA s.133']
    },
    {
      q: /fine|penalty|charge/i,
      a: 'Under SPA s.133, the strata may impose fines of up to $200 per contravention (or per day for a continuing contravention) after giving the owner a 14-day written notice and a reasonable opportunity to respond.',
      cited: ['SPA s.133'],
      uncertain: true
    },
    {
      q: /reserve|crf|contingency/i,
      a: 'Under SPA s.92 and the CRF Regulation, the contingency reserve fund must receive at least 10% of the total annual contributions, and the depreciation report must be updated at least every 3 years under s.94.',
      cited: ['SPA s.92', 'SPA s.94']
    },
    {
      q: /rental|bylaw|amend/i,
      a: 'Rental-restriction bylaws (SPA s.141) can only be changed by a 3/4 vote of owners, and any bylaw restricting rentals cannot apply to strata lots that were rented before the bylaw was passed.',
      cited: ['SPA s.141']
    }
  ];

  async function ask() {
    const question = input.trim();
    if (!question || busy) return;
    input = '';
    messages = [...messages, { role: 'user', text: question }];
    busy = true;

    if (live) {
      try {
        const res: RosaAnswer = await rosaQuery({ question, facts: {} });
        messages = [
          ...messages,
          { role: 'rosa', text: res.answer, cited: res.cited, uncertain: res.uncertain }
        ];
      } catch {
        messages = [
          ...messages,
          {
            role: 'rosa',
            text: 'Rosa could not reach the compliance corpus. Try again, or sign in with a connected host.',
            uncertain: true,
            demo: true
          }
        ];
      }
    } else {
      // Demo: same fail-closed behavior — no match → explicit refusal.
      const hit = DEMO_PAIRS.find((p) => p.q.test(question));
      if (hit) {
        messages = [
          ...messages,
          { role: 'rosa', text: hit.a, cited: hit.cited, uncertain: hit.uncertain, demo: true }
        ];
      } else {
        messages = [
          ...messages,
          {
            role: 'rosa',
            text: $copy.rosaNoMatch,
            uncertain: true,
            demo: true
          }
        ];
      }
    }
    busy = false;
  }
</script>

<section class="glass-card rounded-2xl p-6 flex flex-col">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <span class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[10px] font-black text-white">R</span>
        {$copy.rosaTitle}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.rosaIntro}</p>
    </div>
  </div>

  <div class="mt-4 flex max-h-72 min-h-40 flex-col gap-2 overflow-y-auto pr-1">
    {#each messages as m}
      <div class="flex {m.role === 'user' ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm {m.role === 'user'
          ? 'rounded-br-sm bg-brand-600 text-white'
          : 'rounded-bl-sm bg-surface-2 text-slate-700'}">
          <p>{m.text}</p>
          {#if m.cited?.length}
            <div class="mt-1.5 flex flex-wrap gap-1">
              {#each m.cited as c}
                <span class="rounded-md bg-bc-blue/10 px-1.5 py-0.5 text-[10px] font-bold text-bc-blue">{c}</span>
              {/each}
            </div>
          {/if}
          {#if m.uncertain}
            <p class="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-amber-600">
              <Icon name="alert" class="h-3 w-3 inline" /> {$copy.rosaUncertain}
            </p>
          {/if}
          {#if m.demo}<p class="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">{$copy.demoLabel}</p>{/if}
        </div>
      </div>
    {/each}
    {#if busy}
      <div class="flex justify-start">
        <div class="rounded-2xl rounded-bl-sm bg-surface-2 px-3.5 py-2.5">
          <span class="inline-flex gap-1">
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></span>
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]"></span>
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]"></span>
          </span>
        </div>
      </div>
    {/if}
  </div>

  <form class="mt-3 flex gap-2" onsubmit={(e) => { e.preventDefault(); ask(); }}>
    <input
      bind:value={input}
      placeholder={$copy.rosaPlaceholder}
      class="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none"
    />
    <button
      class="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-700 disabled:opacity-50"
      disabled={busy || !input.trim()}
    >{$copy.rosaSend}</button>
  </form>
</section>
