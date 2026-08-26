<script lang="ts">
  /** Education + micro-copy (#10/#15): a small "?" popover that explains a
   *  domain term (CRF, multisig, LNURL, OTS, DCA) in plain language. */
  import { copy } from '$lib/i18n';
  import Icon from './Icon.svelte';

  interface Entry { title: string; text: string }
  const ENTRIES: Record<string, Entry> = {
    crf: { title: $copy.eduCrf, text: $copy.eduCrfText },
    multisig: { title: $copy.eduMultisig, text: $copy.eduMultisigText },
    lnurl: { title: $copy.eduLnurl, text: $copy.eduLnurlText },
    ots: { title: $copy.eduOts, text: $copy.eduOtsText },
    dca: { title: $copy.eduDca, text: $copy.eduDcaText }
  };

  let { term = 'crf' }: { term?: string } = $props();
  let open = $state(false);

  const entry = $derived(ENTRIES[term] ?? ENTRIES.crf!);
</script>

<span class="relative inline-flex">
  <button
    type="button"
    class="glossary-trigger"
    aria-expanded={open}
    aria-label={`${$copy.eduCrf}: ${entry.title}`}
    onclick={(e) => { e.stopPropagation(); open = !open; }}
  >?</button>
  {#if open}
    <span class="glossary-popover" role="tooltip">
      <span class="glossary-title"><Icon name="help" class="h-3 w-3" /> {entry.title}</span>
      <span class="glossary-text">{entry.text}</span>
    </span>
  {/if}
</span>
