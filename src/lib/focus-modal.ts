/** Svelte action for conditionally mounted modal surfaces. */
export function focusModal(node: HTMLElement, onEscape?: () => void) {
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const selector = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])';
  const controls = () => [...node.querySelectorAll<HTMLElement>(selector)].filter((el) =>
    !el.closest('[inert], [hidden], [aria-hidden="true"]') && getComputedStyle(el).visibility !== 'hidden' && el.getClientRects().length > 0
  );
  const frame = requestAnimationFrame(() => (controls()[0] ?? node).focus());
  function keydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault();
      event.stopPropagation();
      onEscape();
    } else if (event.key === 'Tab') {
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) { event.preventDefault(); node.focus(); }
      else if (event.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !node.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
  }
  node.addEventListener('keydown', keydown);
  return {
    update(next?: () => void) { onEscape = next; },
    destroy() {
      cancelAnimationFrame(frame);
      node.removeEventListener('keydown', keydown);
      if (previous?.isConnected) previous.focus();
    }
  };
}
