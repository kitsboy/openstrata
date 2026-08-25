import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'openstrata-theme';

function stored(): Theme {
	if (!browser) return 'light';
	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved === 'dark' || saved === 'light') return saved;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(theme: Theme) {
	document.documentElement.classList.toggle('dark', theme === 'dark');
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
