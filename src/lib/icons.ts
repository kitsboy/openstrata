// Single icon system for the whole product. Brand/filled marks (github, x,
// bitcoin, lightning) keep their solid fills; every UI glyph uses the same
// 24×24 stroke language (stroke-width 1.8, round caps/joins, fill none) so the
// dashboard shell and marketing pages read as one product.

const stroke = (inner: string) =>
	`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

export const icons = {
	github: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,

	x: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,

	bitcoin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.53-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.133.63.486.615.766l-1.465 5.88c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.13.514 2.75 2.084z"/></svg>`,

	lightning: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></svg>`,

	mail: stroke('<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>'),

	rss: stroke('<path d="M4 11a9 9 0 019 9M4 4a16 16 0 0116 16M5 19a1 1 0 100-2 1 1 0 000 2z"/>'),

	building: stroke('<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/>'),

	home: stroke('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>'),

	shield: stroke('<path d="M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3z"/><path d="M12 8v4M12 15.5h.01"/>'),

	wrench: stroke('<path d="M14.7 6.3a4.5 4.5 0 00-6.1 5.6L3 17.5V21h3.5l5.6-5.6a4.5 4.5 0 005.6-6.1l-2.7 2.7-2.9-.9-.9-2.9 2.5-2.5z"/>'),

	coins: stroke('<circle cx="9" cy="9" r="5.5"/><path d="M14.5 5.3a5.5 5.5 0 11-9.2 9.2M9 14.5v2M5.5 9h-2.5"/>'),

	scale: stroke('<path d="M12 3v18"/><path d="M8 21h8"/><path d="M7 8l-4 1 2.5 5a2.4 2.4 0 003 0L11 9 7 8z"/><path d="M17 8l-4 1 2.5 5a2.4 2.4 0 003 0L21 9l-4-1z"/><path d="M7 8l5-3 5 3"/>'),

	chart: stroke('<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>'),

	search: stroke('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),

	bell: stroke('<path d="M18 8a6 6 0 00-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 21a2 2 0 01-3.4 0"/>'),

	settings: stroke('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V21a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1-1.55 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.55-1H3a2 2 0 110-4h.09a1.7 1.7 0 001.55-1 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34h0a1.7 1.7 0 001-1.55V3a2 2 0 114 0v.09a1.7 1.7 0 001 1.55h0a1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87v0a1.7 1.7 0 001.55 1H21a2 2 0 110 4h-.09a1.7 1.7 0 00-1.51 1z"/>'),

	plus: stroke('<path d="M12 5v14M5 12h14"/>'),

	check: stroke('<path d="M5 13l4 4L19 7"/>'),

	close: stroke('<path d="M6 6l12 12M18 6L6 18"/>'),

	'chevron-down': stroke('<path d="M6 9l6 6 6-6"/>'),

	'chevron-right': stroke('<path d="M9 6l6 6-6 6"/>'),

	'arrow-up-right': stroke('<path d="M7 17L17 7"/><path d="M8 7h9v9"/>'),

	alert: stroke('<path d="M10.3 3.9 1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),

	moon: stroke('<path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/>'),

	sun: stroke('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),

	globe: stroke('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14.5 14.5 0 010 18 14.5 14.5 0 010-18z"/>'),

	spark: stroke('<path d="M12 3l1.9 5.8 5.8 1.9-5.8 1.9L12 18.4l-1.9-5.8-5.8-1.9 5.8-1.9L12 3z"/>'),

	calendar: stroke('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>'),

	menu: stroke('<path d="M4 6h16M4 12h16M4 18h16"/>'),

	external: stroke('<path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>'),

	help: stroke('<circle cx="12" cy="12" r="9"/><path d="M9.2 9a2.8 2.8 0 015.5 1c0 1.8-2.7 2.4-2.7 3.7"/><path d="M12 17.2h.01"/>'),

	trash: stroke('<path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/>'),

	refresh: stroke('<path d="M21 12a9 9 0 11-2.6-6.4"/><path d="M21 3v6h-6"/>'),

	clock: stroke('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),

	dollar: stroke('<path d="M12 2v20"/><path d="M17 5.5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>'),

	lock: stroke('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>'),

	download: stroke('<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/>'),

	file: stroke('<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/>')
} as const;
