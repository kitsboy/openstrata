import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Brand-asset guards.
 *
 * The mark exists in four places at once — the inline `BrandMark.svelte`, the
 * vector `static/icon.svg` the icons are rendered from, the simplified
 * `static/favicon.svg`, and the raster set committed to `static/`. Three real
 * failures have already happened in this area: the in-app mark and the favicon
 * art could drift apart silently, the pre-rebrand `logo.png` kept shipping on
 * `/pitch` and as the link preview long after the rebrand, and an icon can go
 * missing from the head without anything failing.
 *
 * These tests fail on the drift instead of on a review.
 */

const root = process.cwd();
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');

/** Every `d="..."` in an SVG or Svelte file, in document order. */
const pathData = (source: string) =>
  [...source.matchAll(/\sd="([^"]+)"/g)].map((match) => match[1].replace(/\s+/g, ''));

const sourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(svelte|ts|js|html)$/.test(entry.name) ? [full] : [];
  });

describe('brand mark', () => {
  it('is the same artwork in the app as in the icon it renders from', () => {
    // The full mark, not the favicon rendition: the favicon is a deliberate
    // simplification for 16px, so only `icon.svg` must match the component.
    expect(pathData(read('src/lib/components/BrandMark.svelte'))).toEqual(
      pathData(read('static/icon.svg'))
    );
  });

  it('draws in currentColor so one component serves both themes', () => {
    const mark = read('src/lib/components/BrandMark.svelte');
    expect(mark).toContain('fill="currentColor"');
    expect(mark).not.toMatch(/fill="#/);
  });

  it('keeps the favicon a strictly simpler rendition of the full mark', () => {
    const favicon = pathData(read('static/favicon.svg'));
    const full = pathData(read('static/icon.svg'));
    expect(favicon.length).toBeGreaterThan(0);
    expect(favicon.length).toBeLessThan(full.length);
  });

  it('gives the favicon a square canvas so it never letterboxes in a tab', () => {
    // The full mark is 283x448 — very tall. Handed to a browser tab it renders
    // at about 10px wide and its strokes go sub-pixel. The favicon is square.
    const square = (svg: string) => /viewBox="0 0 ([\d.]+) (\d+)"/.exec(svg)?.slice(1, 3);
    const [fw, fh] = square(read('static/favicon.svg')) ?? [];
    expect(Number(fw)).toBe(Number(fh));
    const [iw, ih] = square(read('static/icon.svg')) ?? [];
    expect(Number(iw)).toBeLessThan(Number(ih));
  });
});

describe('the retired pre-rebrand logo', () => {
  it('no longer exists in either asset directory', () => {
    for (const candidate of ['static/logo.png', 'public/logo.png']) {
      expect(fs.existsSync(path.join(root, candidate)), candidate).toBe(false);
    }
  });

  it('is referenced by no shipping source file', () => {
    // `changelog.generated.ts` is a historical record of past releases and is
    // allowed to mention it; nothing the site renders may.
    const offenders = sourceFiles(path.join(root, 'src'))
      .filter((file) => !file.endsWith('changelog.generated.ts'))
      .filter((file) => !file.endsWith('brand-assets.test.ts'))
      .filter((file) => read(path.relative(root, file)).includes('logo.png'));
    expect(offenders.map((file) => path.relative(root, file))).toEqual([]);
  });
});

describe('icon set', () => {
  const required = [
    'favicon.ico',
    'favicon.svg',
    'icon.svg',
    'icon-192.png',
    'icon-512.png',
    'apple-touch-icon.png',
    'og.png'
  ];

  it('is present in static/', () => {
    const missing = required.filter((name) => !fs.existsSync(path.join(root, 'static', name)));
    expect(missing).toEqual([]);
  });

  it('declares the browser-facing icons and the preview card in app.html', () => {
    // `icon.svg` is deliberately not here: it is the source art the rasters are
    // rendered from, not something a browser is told to fetch.
    const head = read('src/app.html');
    const declared = [
      'favicon.ico',
      'favicon.svg',
      'icon-192.png',
      'apple-touch-icon.png',
      'og.png'
    ];
    for (const name of declared) expect(head, name).toContain(`/${name}`);
  });

  it('renders the link preview at the size crawlers expect', () => {
    // 1200x630 is the size Facebook, LinkedIn and X all crop against. The old
    // 237x377 logo was upscaled and cropped by every one of them.
    const png = fs.readFileSync(path.join(root, 'static', 'og.png'));
    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });

  it('keeps the manifest pointed at the raster icons', () => {
    const manifest = JSON.parse(read('static/manifest.webmanifest')) as {
      icons: Array<{ src: string }>;
    };
    const srcs = manifest.icons.map((icon) => icon.src);
    expect(srcs).toContain('/icon-192.png');
    expect(srcs).toContain('/icon-512.png');
    expect(srcs.some((src) => src.endsWith('.svg'))).toBe(false);
  });
});
