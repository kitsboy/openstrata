#!/usr/bin/env node
/**
 * Rasterises the brand mark into every icon size the site needs.
 *
 * Source of truth is the hand-authored vector art:
 *   static/icon.svg     the full brush mark (used in-app and for PWA icons)
 *   static/favicon.svg  the bold three-layer rendition (used where 16px matters)
 *
 * Outputs (all committed — a build must never depend on this having run):
 *   static/favicon.ico         32x32, PNG payload in an ICO container
 *   static/icon-192.png        PWA / Android (maskable-safe: mark inside the safe zone)
 *   static/icon-512.png        PWA / store listing
 *   static/apple-touch-icon.png 180x180, fully opaque (iOS ignores transparency)
 *   static/og.png              1200x630 link-preview card (og:image / twitter:image)
 *
 * `og.png` replaces the retired `static/logo.png`, which was pre-rebrand art and
 * was still the link preview on every share. It has to be a raster file: social
 * crawlers will not render an SVG.
 *
 * Run with `npm run icons` after editing either SVG.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const staticDir = path.join(root, 'static');
const read = (name) => fs.readFileSync(path.join(staticDir, name));

const faviconSvg = read('favicon.svg');

/** Compose the bold mark, centred on a solid brand-navy plate at `size`. */
async function plated(size, { opaque = false } = {}) {
  const inner = Math.round(size * 0.78);
  const mark = await sharp(Buffer.from(faviconSvg)).resize(inner, inner).png().toBuffer();
  let image = sharp({ create: { width: size, height: size, channels: 4, background: '#102d3b' } })
    .composite([{ input: mark, gravity: 'centre' }]);
  if (opaque) image = image.flatten({ background: '#102d3b' });
  return image;
}

async function main() {
  // PWA icons: the bold rendition on the brand navy, mark scaled into the
  // maskable safe zone (inner 80%) so Android's circle crop never bites it.
  for (const size of [192, 512]) {
    await (await plated(size)).png({ compressionLevel: 9 }).toFile(path.join(staticDir, `icon-${size}.png`));
  }

  // Apple touch icon: 180x180, no transparency (iOS composites onto black).
  await (await plated(180, { opaque: true }))
    .png({ compressionLevel: 9 })
    .toFile(path.join(staticDir, 'apple-touch-icon.png'));

  // favicon.ico — a single 32x32 entry whose payload is a PNG (valid since
  // Windows Vista, and universally supported by modern browsers).
  {
    const png = await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toBuffer();
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // type: icon
    header.writeUInt16LE(1, 4); // image count
    const entry = Buffer.alloc(16);
    entry.writeUInt8(32, 0); // width
    entry.writeUInt8(32, 1); // height
    entry.writeUInt8(0, 2); // palette size
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(6 + 16, 12);
    fs.writeFileSync(path.join(staticDir, 'favicon.ico'), Buffer.concat([header, entry, png]));
  }

  // Link-preview card. Social crawlers want a raster image, so this is
  // rendered here rather than shipped as an SVG. Copy is drawn as text in the
  // SVG overlay: if a host has no font for it the card still reads as the mark
  // on the brand plate, which is why nothing essential lives in the text.
  {
    const MARK_HEIGHT = 250;
    const mark = await sharp(Buffer.from(read('icon.svg')))
      .resize({ height: MARK_HEIGHT })
      .png()
      .toBuffer();
    const markWidth = Math.round((MARK_HEIGHT * 283) / 448);
    const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
      <text x="600" y="404" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
            font-size="66" font-weight="bold" fill="#ffffff" letter-spacing="-1">OpenStrata</text>
      <text x="600" y="452" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
            font-size="26" fill="#9fd3e3">Community operations, beautifully organized</text>
      <rect x="480" y="492" width="240" height="3" rx="1.5" fill="#f0801a"/>
      <text x="600" y="546" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
            font-size="22" fill="#8fb4c2">openstrata.giveabit.io</text>
      <rect x="0" y="0" width="1200" height="6" fill="#f0801a"/>
    </svg>`);
    await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#102d3b' } })
      .composite([
        { input: mark, top: 74, left: Math.round((1200 - markWidth) / 2) },
        { input: overlay, top: 0, left: 0 }
      ])
      .png({ compressionLevel: 9 })
      .toFile(path.join(staticDir, 'og.png'));
  }

  const written = [
    'favicon.ico',
    'icon-192.png',
    'icon-512.png',
    'apple-touch-icon.png',
    'og.png'
  ];
  for (const name of written) {
    const { size } = fs.statSync(path.join(staticDir, name));
    console.log(`  ${name.padEnd(24)} ${(size / 1024).toFixed(1)} kB`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
