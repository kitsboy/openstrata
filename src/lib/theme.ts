import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';
/** Brand accent: brand-orange (default) or BC-green "brokerage". */
export type Accent = 'orange' | 'green';

const STORAGE_KEY = 'openstrata-theme';
const ACCENT_KEY = 'openstrata-accent';

function stored(): Theme {
	if (!browser) return 'light';
	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved === 'dark' || saved === 'light') return saved;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function storedAccent(): Accent {
	if (!browser) return 'orange';
	const saved = localStorage.getItem(ACCENT_KEY);
	return saved === 'green' ? 'green' : 'orange';
}

function apply(theme: Theme) {
	document.documentElement.classList.toggle('dark', theme === 'dark');
}

function applyAccent(accent: Accent) {
	document.documentElement.dataset.accent = accent;
}

export const theme = writable<Theme>(stored());

theme.subscribe((value) => {
	if (!browser) return;
	apply(value);
	localStorage.setItem(STORAGE_KEY, value);
});

export function toggleTheme() {
	theme.update((value) => (value === 'dark' ? 'light' : 'dark'));
}

/** Brand accent theme (brand-orange ↔ BC-green brokerage). */
export const accent = writable<Accent>(storedAccent());

accent.subscribe((value) => {
	if (!browser) return;
	applyAccent(value);
	localStorage.setItem(ACCENT_KEY, value);
});

export function cycleAccent() {
	accent.update((value) => (value === 'orange' ? 'green' : 'orange'));
}

// Apply once on load (before any subscription in the layout fires).
if (browser) {
	applyAccent(storedAccent());
}
