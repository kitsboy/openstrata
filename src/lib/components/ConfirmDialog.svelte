<script lang="ts">
  // Destructive-action confirmation — one explicit confirm step before anything
  // irreversible (remove unit, sign out, remove xpub).
  import { copy } from '$lib/i18n';
  import Icon from '$lib/components/Icon.svelte';

  let {
    title,
    message,
    confirmLabel = $copy.removeUnit,
    open = $bindable(true),
    onConfirm
  }: {
    title: string;
    message: string;
    confirmLabel?: string;
    open?: boolean;
    onConfirm: () => void;
  } = $props();
</script>

{#if open}
  <div class="confirm-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && (open = false)}>
    <dialog open class="confirm-modal" aria-labelledby="confirm-title">
      <div class="confirm-mark" aria-hidden="true"><Icon name="alert" class="h-5 w-5" /></div>
      <h2 id="confirm-title">{title}</h2>
      <p>{message}</p>
      <div class="confirm-actions">
        <button class="confirm-cancel" onclick={() => (open = false)}>{$copy.cancel}</button>
        <button class="confirm-danger" onclick={() => { open = false; onConfirm(); }}>{confirmLabel}</button>
      </div>
    </dialog>
  </div>
{/if}

<style>
  .confirm-backdrop { position: fixed; inset: 0; z-index: 75; display: grid; place-items: center; padding: 20px; background: rgba(10, 27, 36, .5); backdrop-filter: blur(3px); }
  .confirm-modal { position: relative; width: min(100%, 400px); padding: 30px 28px 24px; border: 1px solid var(--line); border-radius: 16px; background: var(--paper); box-shadow: 0 30px 90px rgba(10, 27, 36, .25); text-align: center; }
  .confirm-mark { display: grid; place-items: center; width: 44px; height: 44px; margin: 0 auto 14px; border-radius: 12px; color: var(--red); background: color-mix(in srgb, var(--red) 12%, transparent); }
  .confirm-modal h2 { margin: 0 0 8px; color: var(--ink); font-size: 18px; font-weight: 800; letter-spacing: -.4px; }
  .confirm-modal p { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.6; }
  .confirm-actions { display: flex; justify-content: center; gap: 10px; margin-top: 22px; }
  .confirm-cancel, .confirm-danger { min-height: 38px; padding: 0 16px; border-radius: 9px; font-size: 11px; font-weight: 800; }
  .confirm-cancel { border: 1px solid var(--line); color: var(--muted); background: var(--paper); }
  .confirm-cancel:hover { background: var(--surface-3); }
  .confirm-danger { color: #fff; background: var(--red); }
  .confirm-danger:hover { background: color-mix(in srgb, var(--red) 85%, #000); }
</style>
