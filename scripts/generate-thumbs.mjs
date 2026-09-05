#!/usr/bin/env node
//
// generate-thumbs.mjs
// Generates 512x512 centered-crop WebP (quality 78) thumbnails for the unique
// PNG images referenced by the /lab page, into public/thumbs/.
//
// - Originals in public/ are NEVER modified (read-only).
// - Safe to re-run: always regenerates from the original PNG (never from an
//   existing WebP), and de-duplicates repeated image references.
//
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const thumbsDir = path.join(publicDir, 'thumbs');
const labPage = path.join(root, 'src', 'pages', 'LabPage.jsx');

const SIZE = 512;      // output width & height (square)
const QUALITY = 78;    // WebP quality

// 1. Extract the unique image paths actually used by the Lab page.
//    LabPage.jsx references them as:  image: '/foo.png'  and  src={project.image}
const labSource = fs.readFileSync(labPage, 'utf8');
const matches = labSource.match(/image:\s*'([^']+\.(?:png|jpg|jpeg|webp))'/gi) || [];
const rawPaths = [...new Set(matches.map(m => {
  const p = m.match(/image:\s*'([^']+)'/i)[1];
  return p.startsWith('/') ? p.slice(1) : p;
}))];

if (rawPaths.length === 0) {
  console.error('No Lab images found in LabPage.jsx — aborting (nothing to do).');
  process.exit(1);
}

// 2. Ensure the output directory exists.
fs.mkdirSync(thumbsDir, { recursive: true });

// 3. Generate a thumbnail for each unique Lab image.
//    Freshness check: skip an existing, non-empty thumbnail that is not older
//    than its source PNG (mtime-based). Regenerate only missing / zero-byte /
//    outdated thumbnails. Originals are never modified.
const generated = [];
const skipped = [];
for (const relPath of rawPaths) {
  const srcPath = path.join(publicDir, relPath);
  if (!fs.existsSync(srcPath)) {
    console.warn(`  [skip] missing source: ${relPath}`);
    continue;
  }
  // Output filename: keep the original basename, swap extension for .webp
  const base = path.basename(relPath, path.extname(relPath));
  const outName = `${base}.webp`;
  const outPath = path.join(thumbsDir, outName);

  const srcStat = fs.statSync(srcPath);
  const thumbExists = fs.existsSync(outPath) && fs.statSync(outPath).size > 0;
  const upToDate = thumbExists && fs.statSync(outPath).mtimeMs >= srcStat.mtimeMs;
  if (upToDate) {
    skipped.push({ base, outName });
    continue;
  }

  await sharp(srcPath)
    .resize(SIZE, SIZE, {
      fit: 'cover',        // fill the square, preserving aspect ratio
      position: 'centre',  // centered crop
      withoutEnlargement: true, // don't upscale tiny sources (all are >= 2048 anyway)
    })
    .webp({ quality: QUALITY, alphaQuality: QUALITY }) // keeps alpha if present
    .toFile(outPath);

  const st = fs.statSync(outPath);
  generated.push({ base, outName, bytes: st.size });
}

// 4. Report.
const total = generated.reduce((s, r) => s + r.bytes, 0);
const avg = generated.length ? total / generated.length : 0;
const KB = x => `${(x / 1024).toFixed(1)} KB`;
const MB = x => `${(x / 1048576).toFixed(2)} MB`;
const sorted = [...generated].sort((a, b) => b.bytes - a.bytes);

console.log('=== Lab thumbnail generation ===');
console.log(`Unique Lab PNGs found:   ${rawPaths.length}`);
console.log(`Generated (new/updated): ${generated.length}`);
console.log(`Skipped (unchanged):     ${skipped.length}`);
console.log(`Total generated size:    ${MB(total)}`);
console.log(`Avg generated size:      ${KB(avg)}`);
if (generated.length) {
  console.log(`Largest generated:       ${sorted[0].outName}  ${KB(sorted[0].bytes)}`);
  console.log(`Smallest generated:      ${sorted[sorted.length - 1].outName}  ${KB(sorted[sorted.length - 1].bytes)}`);
}
console.log(`Output dir:              ${thumbsDir}`);
console.log('Originals in public/ were NOT modified (read-only sources).');
