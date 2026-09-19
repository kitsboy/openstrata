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

  const written = ['favicon.ico', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
  for (const name of written) {
    const { size } = fs.statSync(path.join(staticDir, name));
    console.log(`  ${name.padEnd(24)} ${(size / 1024).toFixed(1)} kB`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
