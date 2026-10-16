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
 *
 * Second gap this script used to have — and the reason `npm run audit:contrast`
 * was green while a reader could not see the pay rail at all. Every check above
 * is a token PAIR, so it only ever tested a token used the way its name
 * suggests. Dark mode flips the whole slate ramp (slate-900 becomes #f1f5f9) so
 * that `text-slate-900` stays legible on dark paper — but that same flip, read
 * as a FILL, turns `bg-slate-900` into a near-white slab, and `text-white` on
 * it measured 1.05:1. Then `bg-white` (a literal, never remapped) kept its
 * white fill while `text-slate-700` flipped to a light step — 1.3:1. Both were
 * invisible in dark mode on ~45 call sites, and the pair audit could not see
 * either of them because neither is a token pair.
 *
 * So the audit now also reads the SOURCE. See LITERAL_FILL_GUARDS below: a
 * literal fill that does not flip with the theme, or an opacity-modified white
 * that no pair check can reach, fails the run by file and line.
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

// ---------------------------------------------------------------------------
// Literal fills that do NOT flip with the theme.
//
// A token pair can only catch a colour the theme owns. These three shapes are
// literals: `bg-white` is emitted by Tailwind as `var(--color-white)` and
// nothing in src/app.css ever redefines that variable, so the fill stays a
// hard white in dark mode while the slate ink sitting on it steps up to a light
// colour. `bg-slate-900` goes the other way: the dark theme remaps the ramp, so
// the "near-black slab" becomes near-white under a `text-white` label.
// `text-white/45` and friends are colour-mixed with `transparent`, which moves
// them off the token entirely — `text-white/35` measures 3.1:1 at 10px.
//
// Each guard names the token that replaces it. The scan is deliberate about the
// `/` suffix: `bg-white/10` is a chip fill rather than a card, so it is left
// alone, and `hover:bg-white` is still a literal and still caught.
// ---------------------------------------------------------------------------
const LITERAL_FILL_GUARDS = [
  {
    token: 'bg-white',
    pattern: /(?<![\w-])bg-white(?![\w/-])/g,
    fix: 'use `bg-surface-2` for a card, or `.qr-plate` where the surface must stay light under a QR code'
  },
  {
    token: 'bg-slate-900',
    pattern: /(?<![\w-])bg-slate-900(?![\w/-])/g,
    fix: 'the slab role is `bg-slab` (with `text-slab-ink` / `text-slab-muted` / `text-slab-faint`)'
  },
  {
    token: 'text-white/<opacity>',
    pattern: /(?<![\w-])text-white\/\d+/g,
    fix: 'opacity-modified white cannot be audited; use `text-slab-muted` or `text-slab-faint`'
  }
];

function scanSources() {
  const root = path.join(process.cwd(), 'src');
  const hits = [];
  const walk = (directory) =>
    fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return walk(entryPath);
      return /\.[jt]s$|\.svelte$/.test(entry.name) ? [entryPath] : [];
    });

  // A comment is not a fill. Without this, a doc comment that NAMES the token
  // it is warning about (`use bg-slab, not bg-slate-900`) fails its own guard,
  // which would push the next person to delete the explanation instead of the
  // mistake. Commented-out markup is also skipped, which is right: it does not
  // render.
  const isCommentLine = (line) => /^\s*(\/\/|\/\*|\*|<!--)/.test(line);

  for (const file of walk(root)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      if (isCommentLine(line)) return;
      for (const guard of LITERAL_FILL_GUARDS) {
        guard.pattern.lastIndex = 0;
        if (!guard.pattern.test(line)) continue;
        hits.push({
          file: path.relative(process.cwd(), file),
          line: index + 1,
          token: guard.token,
          fix: guard.fix,
          source: line.trim().slice(0, 110)
        });
      }
    });
  }
  return hits;
}

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
  ['--color-bitcoin', 4.5, 'Bitcoin accent text, balances, donate links'],
  /* The third orange step. `--orange` is a glow (2.77:1 as text on paper) and
     `--orange-solid` is a fill; this is the one text usages ride, and it covers
     10px panel links, the active dock label and the "signed in" line. */
  ['--orange-text', 4.5, 'orange accent used as a text label'],
  /* The brand ramp as text inside SCOPED component styles, where a utility
     cannot reach: the active nav item, the start-card action, the demo-banner
     action, the resume chip, the day popover. These used `var(--color-brand-700)`
     raw, which is a dark teal in both themes — 2.08:1 on the dark topbar. */
  ['--brand-text', 4.5, 'brand accent used as a text label'],
  /* The shell's other two accents, split into glow vs text steps like the
     orange and the status colours already were. */
  ['--blue-text', 4.5, 'blue accent used as a text/icon label'],
  ['--purple-text', 4.5, 'purple accent used as a text/icon label'],
  /* These two carry the Form F verdict on /units at 14px. They are text, so
     they are audited as text and they need a dark step (see the .dark rules). */
  ['--color-emerald-700', 4.5, 'Form F "clear" verdict text'],
  ['--color-rose-700', 4.5, 'withheld / arrears verdict text']
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

// Text sitting on a BRAND TINT rather than a neutral surface — the
// selected-state plates (`bg-brand-50`, `bg-brand-100`) that appear ~25 times
// across the wizard, the tools page and the decision pills. These were never
// checked, and in dark mode they measured about 1.2:1 because the plate was a
// light tint while the label stepped up to brand-200. Background is read raw
// (a tint is a tint); foreground goes through the same text-override resolution
// as TEXT_TOKENS, because that is exactly how these labels behave.
const TINT_PAIRS = [
  ['--color-brand-50', '--color-brand-700', 4.5, 'selected plate: brand tint + brand label'],
  ['--color-brand-50', '--color-brand-800', 4.5, 'selected plate: brand tint + strong brand label'],
  ['--color-brand-50', '--color-slate-800', 4.5, 'selected wizard card: brand tint + heading'],
  ['--color-brand-50', '--color-slate-600', 4.5, 'selected plate: brand tint + body copy'],
  ['--color-brand-100', '--color-brand-700', 4.5, 'badge chip: brand-100 tint + brand label'],
  /* The status tints. These carry the lot tone on /units (`toneStyles`), the
     arrears and levy notes, the Form B reminder and the deadline chips. They
     were never remapped for dark mode, so every one of them stayed a near-white
     pastel plate; remapping the tint is only safe if the label moves with it,
     which is what these pairs hold in place. */
  ['--color-rose-50', '--color-rose-950', 4.5, 'status plate: rose tint + arrears label'],
  ['--color-rose-100', '--color-rose-800', 4.5, 'status chip: rose-100 tint + label'],
  ['--color-amber-50', '--color-amber-950', 4.5, 'status plate: amber tint + warning label'],
  ['--color-amber-100', '--color-amber-900', 4.5, 'status chip: amber-100 tint + label'],
  ['--color-fuchsia-50', '--color-fuchsia-950', 4.5, 'status plate: fuchsia tint + short-term label'],
  ['--color-fuchsia-100', '--color-fuchsia-900', 4.5, 'status chip: fuchsia-100 tint + label'],
  ['--color-orange-50', '--color-orange-950', 4.5, 'status plate: orange tint + levy label'],
  ['--color-orange-100', '--color-orange-900', 4.5, 'status chip: orange-100 tint + label'],
  ['--color-sky-50', '--color-sky-950', 4.5, 'status plate: sky tint + tenanted label'],
  ['--color-sky-100', '--color-sky-900', 4.5, 'status chip: sky-100 tint + label'],
  ['--color-emerald-50', '--color-emerald-950', 4.5, 'status plate: emerald tint + owner-occupied label'],
  ['--color-emerald-100', '--color-emerald-900', 4.5, 'status chip: emerald-100 tint + label']
];

// Text sitting on the INVERSE slab rather than on a neutral or tinted surface —
// the sticky pay dock, a primary CTA, the selected filter pill, a code block.
// The background is read raw (a slab is a fill) and the foreground goes through
// the same text-override resolution as everything else.
//
// This is the group that was missing when a reader reported they could not see
// the pay dock at all. The dock was `bg-slate-900 text-white`; the dark theme
// remaps slate-900 to #f1f5f9, so the "near-black bar" became near-white under a
// white label. Nothing here is a token pair, so no pair check could ever reach
// it — which is why the report was true while the audit was green.
const SLAB_PAIRS = [
  ['--color-slab', '--color-slab-ink', 4.5, 'slab: label on the inverse bar'],
  ['--color-slab', '--color-slab-muted', 4.5, 'slab: body copy on the inverse bar'],
  ['--color-slab', '--color-slab-faint', 4.5, 'slab: micro-label on the inverse bar'],
  ['--color-slab-raised', '--color-slab-ink', 4.5, 'slab chip: label on a raised row inside the bar'],
  ['--color-slab-raised', '--color-slab-muted', 4.5, 'slab chip: body copy on a raised row'],
  ['--color-slab-raised', '--color-slab-faint', 4.5, 'slab chip: micro-label on a raised row'],
  ['--color-slab', '--color-slab-accent', 4.5, 'slab accent: bitcoin/lightning mark on the inverse bar'],
  ['--color-slab-raised', '--color-slab-accent', 4.5, 'slab accent: bitcoin/lightning mark on a raised chip']
];

// The QR plate is pinned white in BOTH themes and the code itself carries dark
// modules, so the ink on it is checked once rather than per theme.
const QR_PAIRS = [
  ['--color-qr-plate', '--color-on-qr', 4.5, 'dark modules ink on the pinned QR plate']
];

const PLATE_PAIRS = [...TINT_PAIRS, ...SLAB_PAIRS, ...QR_PAIRS];

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
  for (const [bgToken, fgToken, floor, why] of PLATE_PAIRS) {
    const bg = resolve(themeVars, themeVars[bgToken]);
    const fg = themeValue(themeVars, fgToken, themeName);
    if (!bg || !fg) throw new Error(`${bgToken} / ${fgToken} has no value in the ${themeName} theme.`);
    const ratio = contrast(fg, bg);
    const pass = ratio >= floor;
    if (!pass) failures += 1;
    rows.push({
      theme: themeName,
      pair: `${fgToken.replace('--color-', '')} on ${bgToken.replace('--color-', '')}`,
      ratio,
      floor,
      pass,
      why
    });
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

const sourceHits = scanSources();

const fmt = (ratio) => `${ratio.toFixed(2)}:1`.padStart(8);
console.log('Contrast audit — src/app.css tokens (WCAG 2.2)\n');
for (const themeName of ['light', 'dark']) {
  console.log(`  ${themeName.toUpperCase()}`);
  for (const row of rows.filter((r) => r.theme === themeName)) {
    console.log(`    ${row.pass ? 'PASS' : 'FAIL'} ${fmt(row.ratio)}  (floor ${row.floor})  ${row.pair}`);
  }
  console.log('');
}

if (failures > 0 || sourceHits.length > 0) {
  if (failures > 0) {
    console.error(`Contrast audit failed: ${failures} pair${failures === 1 ? '' : 's'} below floor.\n`);
    for (const row of rows.filter((r) => !r.pass)) {
      console.error(`- [${row.theme}] ${row.pair} = ${row.ratio.toFixed(2)}:1, needs ${row.floor}:1 — ${row.why}`);
    }
  }
  if (sourceHits.length > 0) {
    console.error(
      `\nContrast audit failed: ${sourceHits.length} non-flipping fill literal${sourceHits.length === 1 ? '' : 's'} in src/.\n`
    );
    for (const hit of sourceHits) {
      console.error(`- ${hit.file}:${hit.line} \`${hit.token}\` — ${hit.fix}`);
      console.error(`    ${hit.source}`);
    }
  }
  process.exit(1);
}

console.log(
  `Contrast audit passed: ${rows.length} token pairs and ${LITERAL_FILL_GUARDS.length} source guards checked, all clear.`
);
