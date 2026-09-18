#!/usr/bin/env node
/**
 * Computed WCAG contrast audit for the shared design tokens.
 *
 * Why this exists: accessibility regressions in this project have twice been
 * found by eye in a browser and fixed by hand (`text-bc-blue` dropping to ~2:1
 * on dark cards; the `--faint` micro-label token sitting at 2.4:1 on white).
 * Both were real. Eyeballing does not scale, so this recomputes every
 * text-on-surface pair from `src/app.css` on each run and fails the build when
 * one regresses.
 *
 * How it reads the stylesheet:
 *   - `@theme { ... }`            → base token values
 *   - `:root { ... }`             → light-theme overrides
 *   - `.dark { ... }`             → dark-theme overrides
 *   - `.dark .text-<token> { color: #hex }` → the repo's established convention
 *     for lightening a *text* usage without touching the solid fill of the same
 *     token. When such a rule exists it is used as the dark-mode text colour, so
 *     a deliberate fix is not reported as a failure.
 *
 * Floors (WCAG 2.2, sRGB):
 *   - 4.5:1 — normal body/secondary text.
 *   - 3.0:1 — bold UI labels on solid brand fills, and the `--faint` micro-label
 *     token, which drives decorative 9–10px uppercase eyebrows only. Anything
 *     that carries meaning must clear 4.5.
 *
 * An unresolvable token is a FAILURE, not a skip. The first version of this
 * script silently skipped any token with no value in `src/app.css` — which hid
 * the whole light-mode slate ramp (those values come from Tailwind's stock
 * palette, not from us) and every semantic `success` / `warning` / `danger` /
 * `bitcoin` step. Measured in a browser, those were sitting at 1.99:1–3.76:1.
 * A missing value now says so out loud.
 */
import fs from 'node:fs';
import path from 'node:path';

const cssPath = path.join(process.cwd(), 'src', 'app.css');
const css = fs.readFileSync(cssPath, 'utf8');

function blockAfter(selector) {
  const index = css.indexOf(selector);
  if (index === -1) throw new Error(`Could not find \`${selector}\` in src/app.css`);
  const open = css.indexOf('{', index);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

function readVars(text) {
  const vars = {};
  for (const match of text.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    vars[match[1]] = match[2];
  }
  return vars;
}

const base = { ...readVars(blockAfter('@theme {')), ...readVars(blockAfter('\n:root {')) };
const dark = { ...base, ...readVars(blockAfter('\n.dark {')) };

// Text-only colour overrides — the repo's convention for lightening a *text*
// usage without touching the solid fill of the same token:
//   `.dark .text-bc-blue { color: #5fb4d9; }`
//   `.text-brand-600 { color: var(--color-brand-700); }`
// Values may be a hex or another token, which is resolved against the theme's
// own variable set so the green "brokerage" accent theme stays auditable.
const LIGHT_TEXT_OVERRIDE = {};
const DARK_TEXT_OVERRIDE = {};

for (const match of css.matchAll(/^(?<dark>\.dark\s+)?\.text-([\w-]+)\s*\{\s*color:\s*(#[0-9a-fA-F]{3,8}|var\(--[\w-]+\))\s*;\s*\}/gm)) {
  const target = match[1] ? DARK_TEXT_OVERRIDE : LIGHT_TEXT_OVERRIDE;
  target[match[2]] = match[3];
}

function toRgb(hex) {
  let value = hex.replace('#', '');
  if (value.length === 3) value = value.split('').map((c) => c + c).join('');
  if (value.length === 8) value = value.slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
}

function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const SURFACES = [
  ['canvas', '--canvas'],
  ['paper', '--paper'],
  ['surface-3', '--color-surface-3']
];

// token, floor, why
const TEXT_TOKENS = [
  ['--ink', 4.5, 'body text'],
  ['--muted', 4.5, 'secondary copy, labels, table cells'],
  ['--faint', 3.0, 'decorative micro-labels (9–10px uppercase eyebrows)'],
  ['--color-slate-400', 4.5, 'meta text, muted captions'],
  ['--color-slate-500', 4.5, 'meta text, chips'],
  ['--color-slate-600', 4.5, 'body copy'],
  ['--color-slate-700', 4.5, 'body copy'],
  ['--color-slate-800', 4.5, 'headings, strong copy'],
  ['--color-slate-900', 4.5, 'h1 / h2 ink'],
  ['--color-brand-600', 4.5, 'brand links, icons'],
  ['--color-brand-700', 4.5, 'brand links (darker step)'],
  ['--color-bc-blue', 4.5, 'BCFSA / regulator accents'],
  ['--color-success', 4.5, 'success text and status chips'],
  ['--color-warning', 4.5, 'warning text and deadline chips'],
  ['--color-danger', 4.5, 'danger text, arrears amounts, enforcement chips'],
  ['--color-bitcoin', 4.5, 'Bitcoin accent text, balances, donate links']
];

// White text on a solid brand fill — bold UI labels. Held to 4.5 as well, since
// a button label is text a user has to read; `--orange` is deliberately absent
// because it is an accent/glow token, not a fill (see --orange-solid).
const SOLID_FILL_TOKENS = [
  ['--color-brand-600', 4.5, 'white label on a solid brand button'],
  ['--color-bc-blue', 4.5, 'white label on a solid navy badge'],
  ['--orange-solid', 4.5, 'white label on a solid orange button'],
  ['--color-danger-solid', 4.5, 'white label on a solid danger button']
];

// Bright fills that carry DARK ink instead of white, because white on them is
// unreadable (white on #f7931a measures 2.3:1). The label colour is a token of
// its own, held to the same 4.5:1 floor.
const INK_LABEL_FILL_TOKENS = [
  ['--color-bitcoin', '--on-bitcoin', 4.5, 'dark ink label on a solid bitcoin fill']
];

function resolve(vars, value) {
  if (!value) return undefined;
  const reference = /^var\((--[\w-]+)\)$/.exec(value);
  return reference ? vars[reference[1]] : value;
}

function themeValue(themeVars, token, theme) {
  const key = token.replace(/^--color-/, '');
  const override = theme === 'dark' ? DARK_TEXT_OVERRIDE : LIGHT_TEXT_OVERRIDE;
  if (override[key]) return resolve(themeVars, override[key]);
  return themeVars[token];
}

const rows = [];
let failures = 0;

for (const [themeName, themeVars] of [
  ['light', base],
  ['dark', dark]
]) {
  for (const [token, floor, why] of TEXT_TOKENS) {      const fg = themeValue(themeVars, token, themeName);
    if (!fg) throw new Error(`${token} has no value in the ${themeName} theme — add it to src/app.css so it can be audited.`);
    for (const [surfaceName, surfaceToken] of SURFACES) {
      const bg = themeVars[surfaceToken];
      if (!bg) throw new Error(`${surfaceToken} has no value in the ${themeName} theme.`);
      const ratio = contrast(fg, bg);
      const pass = ratio >= floor;
      if (!pass) failures += 1;
      rows.push({ theme: themeName, pair: `${token.replace('--color-', '')} on ${surfaceName}`, ratio, floor, pass, why });
    }
  }
  for (const [token, floor, why] of SOLID_FILL_TOKENS) {
    const bg = resolve(themeVars, themeVars[token]);
    if (!bg) throw new Error(`${token} has no value in the ${themeName} theme.`);
    const ratio = contrast('#ffffff', bg);
    const pass = ratio >= floor;
    if (!pass) failures += 1;
    rows.push({ theme: themeName, pair: `#fff on ${token.replace('--color-', '')}`, ratio, floor, pass, why });
  }
  for (const [fillToken, inkToken, floor, why] of INK_LABEL_FILL_TOKENS) {
    const bg = resolve(themeVars, themeVars[fillToken]);
    const ink = resolve(themeVars, themeVars[inkToken]);
    if (!bg || !ink) throw new Error(`${fillToken} / ${inkToken} has no value in the ${themeName} theme.`);
    const ratio = contrast(ink, bg);
    const pass = ratio >= floor;
    if (!pass) failures += 1;
    rows.push({
      theme: themeName,
      pair: `${inkToken.replace(/^--/, '')} on ${fillToken.replace('--color-', '')}`,
      ratio,
      floor,
      pass,
      why
    });
  }
}

const fmt = (ratio) => `${ratio.toFixed(2)}:1`.padStart(8);
console.log('Contrast audit — src/app.css tokens (WCAG 2.2)\n');
for (const themeName of ['light', 'dark']) {
  console.log(`  ${themeName.toUpperCase()}`);
  for (const row of rows.filter((r) => r.theme === themeName)) {
    console.log(`    ${row.pass ? 'PASS' : 'FAIL'} ${fmt(row.ratio)}  (floor ${row.floor})  ${row.pair}`);
  }
  console.log('');
}

if (failures > 0) {
  console.error(`Contrast audit failed: ${failures} pair${failures === 1 ? '' : 's'} below floor.\n`);
  for (const row of rows.filter((r) => !r.pass)) {
    console.error(`- [${row.theme}] ${row.pair} = ${row.ratio.toFixed(2)}:1, needs ${row.floor}:1 — ${row.why}`);
  }
  process.exit(1);
}

console.log(`Contrast audit passed: ${rows.length} token pairs checked, all at or above floor.`);
