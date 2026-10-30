import { afterEach, describe, expect, it, vi } from 'vitest';
import { focusModal } from './focus-modal';

afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });

describe('focusModal', () => {
  it('focuses the first control, wraps Tab, handles Escape and restores the opener', () => {
    const opener = document.createElement('button');
    const modal = document.createElement('div');
    modal.tabIndex = -1;
    modal.innerHTML = '<button>Cancel</button><button>Confirm</button>';
    document.body.append(opener, modal);
    opener.focus();
    const buttons = [...modal.querySelectorAll('button')];
    buttons.forEach((button) => vi.spyOn(button, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList));
    let frame: FrameRequestCallback | undefined;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { frame = callback; return 1; });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const close = vi.fn();
    const action = focusModal(modal, close);
    frame?.(0);
    expect(document.activeElement).toBe(buttons[0]);
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(buttons[1]);
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(buttons[0]);
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(close).toHaveBeenCalledOnce();
    action.destroy();
    expect(document.activeElement).toBe(opener);
  });
});
