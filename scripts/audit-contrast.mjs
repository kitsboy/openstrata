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
 *   - 4.5:1 — normal body/secondary text, and now every text token including
 *     the micro-label step. The old 3.0 carve-out for `--faint` is gone: an
 *     audit of the rendered pages showed it driving captions, placeholders and
 *     empty-state copy, so the carve-out was protecting the wrong thing.
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

/**
 * Literal white fills in the STYLESHEET, outside `@media print`.
 *
 * The `.svelte` fill guards below only ever read component sources, so nine
 * `background: #fff` cards in src/app.css went unnoticed — each one "fixed" by a
 * hand-written `.dark .card { background: var(--paper); }` a thousand lines
 * further down. That is the same shape as the bug that started this: a fill that
 * does not follow the theme, one missing override away from white-on-white. The
 * cards now use `var(--paper)` and flip by construction, and this guard keeps a
 * literal from creeping back. Print is excluded on purpose — paper is white. A
 * surface that must stay light under a QR code uses `.qr-plate`.
 */
function stripPrintBlocks(source) {
  let inPrint = false;
  let depth = 0;
  return source
    .split('\n')
    .map((line) => {
      const opens = (line.match(/\{/g) || []).length;
      const closes = (line.match(/\}/g) || []).length;
      if (inPrint) {
        depth += opens - closes;
        if (depth <= 0) inPrint = false;
        return '';
      }
      if (/@media\s+print/.test(line)) {
        depth = opens - closes;
        if (depth > 0) inPrint = true;
        return '';
      }
      return line;
    })
    .join('\n');
}

function scanStylesheetFills() {
  const problems = [];
  stripPrintBlocks(css)
    .split('\n')
    .forEach((line, index) => {
      if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;
      const match = line.match(/(?<![-\w])background(?:-color)?\s*:\s*(#fff\b|#ffffff\b|white\b)/i);
      if (!match) return;
      problems.push(
        `src/app.css:${index + 1}: \`${match[0].trim()}\` is a pinned white fill. It does not follow the theme, so any ink that flips on it breaks at night — use \`var(--paper)\` for a card, \`var(--color-surface-2)\` for a chip, or \`.qr-plate\` where the surface must stay light.`
      );
    });
  return problems;
}

/**
 * `var(--token)` where `--token` is not defined anywhere in `src/`.
 *
 * Generated files are skipped: `src/lib/changelog.generated.ts` is a copy of
 * CHANGELOG.md's prose, so it quotes this very bug (`var(--surface-3, …)`) while
 * explaining it, and a prose mention is not a use. The first run of this guard
 * failed on exactly that line, which is the right failure for the wrong reason.
 *
 * This is the quietest failure in CSS and the one that caused two live bugs:
 * an unknown custom property does not warn, it makes the declaration invalid at
 * computed-value time, so the browser uses the FALLBACK. `var(--surface-3,
 * #eef2f2)` in the auth modal was reaching for a token this repo spells
 * `--color-surface-3`, and silently painting a fixed near-white plate, which in
 * dark mode is a light plate under light ink. The guard also accepts tokens a
 * component injects at runtime (`style="--mark-size: 30px"`, `setProperty`) and
 * Tailwind's own `--color-*` namespace, so it has no false positives left: after
 * the fixes above it reports zero, and it reported the real two when it was
 * written.
 */
function scanTokenReferences() {
  const root = path.join(process.cwd(), 'src');
  const walk = (directory) =>
    fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return walk(entryPath);
      if (/\.generated\.(ts|js)$/.test(entry.name)) return [];
      return /\.(svelte|css|ts|js|html)$/.test(entry.name) ? [entryPath] : [];
    });

  const files = walk(root);
  const defined = new Set();
  const runtime = new Set();
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/(^|[\s;{('"])--[\w-]+\s*:/g)) {
      defined.add(match[0].trim().replace(/:$/, ''));
    }
    for (const match of text.matchAll(/(?:style="[^"]*|setProperty\(\s*['"])(--[\w-]+)/g)) {
      runtime.add(match[1]);
    }
    for (const match of text.matchAll(/(--[\w-]+)\s*=\s*\{/g)) runtime.add(match[1]);
  }

  const problems = [];
  for (const file of files) {
    fs.readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (/^\s*(\/\/|\/\*|\*|<!--)/.test(line)) return;
        for (const match of line.matchAll(/var\(\s*(--[\w-]+)\s*[,)]/g)) {
          const token = match[1];
          if (token.startsWith('--color-')) continue; // Tailwind's namespace
          if (defined.has(token) || runtime.has(token)) continue;
          problems.push(
            `${path.relative(process.cwd(), file)}:${index + 1} references \`${token}\`, which is defined nowhere in src/. CSS will fall back silently — a spelling like \`--surface-3\` for \`--color-surface-3\` paints a literal that does not flip with the theme. Rename it, or inject it at runtime.`
          );
        }
      });
  }
  return problems;
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
  /* Raised from 3.0. `--faint` was carrying real sentences, placeholders and a
     task's own status label, not just decorative eyebrows — see the token note
     in src/app.css. 43 call sites made reclassifying them one by one the wrong
     fix, so the token moved up and the floor moved with it. */
  ['--faint', 4.5, 'micro-labels, captions and empty-state copy'],
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
  /* The completed-phase marker on /roadmap: a numbered green circle with a
     white label. `bg-success` was the fill, and white on emerald-500 measures
     2.54:1 — the same mistake as white on the bitcoin orange, so the fill moved
     to the darker step and this pair holds it there. */
  ['--color-emerald-700', 4.5, 'white label on a completed-phase marker'],
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
  /* `::selection`. The plate is the brand tint and the ink is left alone — the
     pair that has to hold is the page's own ink on that tint, in both themes. */
  ['--color-brand-100', '--ink', 4.5, 'selected text: brand tint + page ink'],
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

// The dashboard chrome (`aside.sidebar`). It is neither a neutral surface nor
// the slab: it is a navy surface in BOTH themes whose ink is the fixed
// `--chrome-*` ramp, and it had never been audited as a surface at all. A
// browser pass found the workspace eyebrow and the nav group label at 2.2:1, the
// sidebar footer at 4.1:1 and the sidebar's own `strata` wordmark at 2.2:1 — all
// of them a shell token (`--muted`, `--faint`, `--orange-text`) read on navy,
// which no pair in this file covers because the pair it looks like is
// "token on canvas", and that one passes.
//
// The chrome is checked against the two planes it can actually produce: bare
// `--navy`, and the 6% white workspace card, which is the lightest thing on it.
const CHROME_INK_TOKENS = [
  ['--chrome-ink', 'chrome: brand wordmark, card titles, hovered nav item'],
  ['--chrome-muted', 'chrome: body copy, nav labels, inactive nav items'],
  ['--chrome-faint', 'chrome: micro-labels, sidebar help and status lines'],
  ['--chrome-accent', 'chrome: orange accent (the wordmark, the active nav icon)'],
  ['--chrome-link', 'chrome: brand accent used as a link']
];

// The shell tokens `.sidebar` must re-point for its subtree. This is the part
// that cannot be left to a colour pair: the bug is that a *token name* resolves
// to a flipping step, so the guard is structural. Drop one of these six from the
// scope block and every rule inside the chrome silently goes back to the light
// ramp — which is exactly how the panel shipped at 2.2:1 the first time.
const CHROME_SCOPE_TOKENS = ['--ink', '--muted', '--faint', '--line', '--orange-text', '--brand-text'];

const PLATE_PAIRS = [...TINT_PAIRS, ...SLAB_PAIRS, ...QR_PAIRS];

/** Composite `alpha` white over `hex`, for a translucent card on a fixed fill. */
function whiteOver(hex, alpha) {
  return '#' + toRgb(hex)
    .map((channel) => Math.round(alpha * 255 + (1 - alpha) * channel)
      .toString(16)
      .padStart(2, '0'))
    .join('');
}

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
  const navy = themeVars['--navy'];
  if (!navy) throw new Error(`--navy has no value in the ${themeName} theme — the chrome cannot be audited.`);
  for (const [plane, planeName] of [[navy, 'navy'], [whiteOver(navy, 0.06), 'navy + 6% white card']]) {
    for (const [token, why] of CHROME_INK_TOKENS) {
      const fg = themeVars[token];
      if (!fg) throw new Error(`${token} has no value in src/app.css — declare the chrome ramp in :root.`);
      const ratio = contrast(fg, plane);
      const pass = ratio >= 4.5;
      if (!pass) failures += 1;
      rows.push({ theme: themeName, pair: `${token.replace('--', '')} on ${planeName}`, ratio, floor: 4.5, pass, why });
    }
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

/**
 * Structural guard for the chrome ramp scope on `.sidebar`.
 *
 * The chrome is a fixed navy surface, so the tokens its subtree resolves must
 * be the fixed chrome ramp rather than the shell's flipping steps. A colour
 * pair cannot express that: `--muted` is legitimately a dark slate (it is
 * audited, and it passes) and it is also the wrong colour 252px to the left.
 * What can be checked is the wiring — the scope block exists and re-points all
 * six shell tokens, and the chrome ramp itself is declared once in `:root` and
 * is NOT remapped by `.dark` (a chrome token that flips would undo the fix).
 */
function checkChromeScope() {
  const problems = [];
  const scopes = [...css.matchAll(/\.sidebar\s*\{([^}]*)\}/g)].map((match) => match[1]);
  const scope = scopes.find((body) => body.includes('--chrome-ink'));
  if (!scope) {
    problems.push(
      '`.sidebar { … }` no longer scopes the chrome ramp (no `--ink: var(--chrome-ink)` block in src/app.css). The sidebar is navy in both themes; without this its labels resolve to the light-theme ramp and measure 2.2:1.'
    );
  } else {
    for (const token of CHROME_SCOPE_TOKENS) {
      if (!new RegExp(`${token}\\s*:\\s*var\\(--chrome-`).test(scope)) {
        problems.push(
          `\`.sidebar\` chrome scope is missing \`${token}\` — every rule inside the chrome that reaches for ${token} will silently go back to the light-theme step.`
        );
      }
    }
  }
  const darkBlock = blockAfter('\n.dark {');
  for (const [token] of CHROME_INK_TOKENS) {
    if (!base[token]) {
      problems.push(`\`${token}\` is not declared in :root — the chrome ramp must be declared once.`);
    }
    if (new RegExp(`^\\s*${token}\\s*:`, 'm').test(darkBlock)) {
      problems.push(`\`${token}\` is remapped in the dark theme. The chrome is navy in BOTH themes, so a flipping chrome token reintroduces the bug.`);
    }
  }
  return problems;
}

const sourceHits = scanSources();
const structureProblems = [
  ...checkChromeScope(),
  ...scanTokenReferences(),
  ...scanStylesheetFills()
];

const fmt = (ratio) => `${ratio.toFixed(2)}:1`.padStart(8);
console.log('Contrast audit — src/app.css tokens (WCAG 2.2)\n');
for (const themeName of ['light', 'dark']) {
  console.log(`  ${themeName.toUpperCase()}`);
  for (const row of rows.filter((r) => r.theme === themeName)) {
    console.log(`    ${row.pass ? 'PASS' : 'FAIL'} ${fmt(row.ratio)}  (floor ${row.floor})  ${row.pair}`);
  }
  console.log('');
}

if (failures > 0 || sourceHits.length > 0 || structureProblems.length > 0) {
  if (structureProblems.length > 0) {
    console.error(`Contrast audit failed: the chrome ramp scope is broken.\n`);
    for (const problem of structureProblems) console.error(`- ${problem}`);
    console.error('');
  }
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
  `Contrast audit passed: ${rows.length} token pairs, ${LITERAL_FILL_GUARDS.length} fill guards, every var() reference resolving and the ${CHROME_SCOPE_TOKENS.length}-token chrome scope checked, all clear.`
);
