// Restores ONLY the portfolio WebP files that are missing from public/.
//
// This is a targeted, non-destructive helper:
//   - It only creates pg_*.webp files that DO NOT already exist in public/.
//   - It does NOT touch files that are already present (byte-identical preserved).
//   - It does NOT rewrite src/data/portfolioImages.js (already references all 80).
//   - It does NOT modify LabPage.jsx, the Lab thumbnail system, or any source render.
//
// Conversion params are identical to select-renders.mjs:
//   sharp().resize(1440,1440,{fit:'inside',withoutEnlargement:true}).webp({quality:82})
//
// Each entry maps a public filename to its source folder (relative to G:\Renders)
// and the preferred source PNG (copied from SUBJECTS in select-renders.mjs).
// If preferredFilename is omitted, the largest PNG under the folder is used.
//
// Usage: node scripts/restore-missing.mjs

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT = 'G:\\Renders';
const PUBLIC_DIR = path.join(ROOT, 'public');
const MAX_DIM = 1440;
const QUALITY = 82;

// [publicFile, dirRel (relative to G:\Renders), preferredFilename?]
const MISSING = [
  ['pg_888.webp', 'Cs2skin\\01302026', '888.0000.png'],
  ['pg_akihabara.webp', 'Cs2skin\\11032026', 'akihabara.0000.png'],
  ['pg_amphibious.webp', 'Cs2skin\\04032026', 'amphibious.0000.png'],
  ['pg_apep_souvenir.webp', 'Cs2skin\\01162026\\ApepSouv', 'ApepSouv.png'],
  ['pg_awp_elite_build.webp', 'Cs2skin\\02092026', 'AwpelitebuildST.0000.png'],
  ['pg_bash.webp', 'Cs2skin\\08022026', 'Bash.0000.png'],
  ['pg_c9_dh14.webp', 'Krinkerstickertexture\\C9DH14', 'C91.0000.png'],
  ['pg_cards.webp', 'Cs2skin\\20042026', 'cards.0000.png'],
  ['pg_chill_outer.webp', 'Ch1llouter', 'RenderCraft4k.0000.png'],
  ['pg_christmas_santa.webp', 'Cs2skin\\Christmas', 'santa.0000.png'],
  ['pg_crimson_case.webp', 'Cs2skin\\01132026\\crimsoncase', 'crimsoncase.png'],
  ['pg_cyber_chicken.webp', 'Krinkerstickertexture\\Cyberchicken', 'Cyberchicken1.0000.png'],
  ['pg_donk.webp', 'Cs2skin\\01162026\\donk', 'donk.png'],
  ['pg_dragon_egg.webp', 'Cs2skin\\01122026\\dragon', 'egg.0000.png'],
  ['pg_flip_knives.webp', 'Cs2skin\\July26\\knives', 'flipmarble.0000.png'],
  ['pg_gavey_overlay.webp', 'GaveyOverlay', 'GAVEYScreenoverlay.0000.png'],
  ['pg_glove_case.webp', 'Cs2skin\\onlyglovecase', 'onlyglovecase.png'],
  ['pg_gold_giveaway.webp', 'Cs2skin\\01122026\\goldgiveaway', 'goldgiveaway.0000.png'],
  ['pg_golden_trophy.webp', 'Cs2skin\\July26\\Trophy', 'trophygolden.0000.png'],
  ['pg_gtd_indecase.webp', 'Cs2skin\\02142026', 'Gtindercase.0000.png'],
  ['pg_instruments.webp', 'Cs2skin\\06062026\\instruments', 'instrument1.0000.png'],
  ['pg_kato_vox.webp', 'Krinkerstickertexture\\Kato14Vox', 'vox1.FinalImageLayer1.0000.png'],
  ['pg_kato.webp', 'Krinkerstickertexture\\Kato14Reason', 'rea1.0000.png'],
  ['pg_kill_shot.webp', 'Cs2skin\\01122026\\KillShot', 'KillShot.0000.png'],
  ['pg_laser.webp', 'Cs2skin\\06062026\\laser', 'laser1.0000.png'],
  ['pg_monster_case.webp', 'Cs2skin\\01132026\\Monstercase', 'Monstercase.png'],
  ['pg_mystery_case.webp', 'Cs2skin\\New folder', 'case.0000.png'],
  ['pg_old_egypt.webp', 'Cs2skin\\01162026\\Oldegypt', 'Oldegypt.png'],
  ['pg_panorama.webp', 'Testpanorama', 'Panographic.0000.png'],
  ['pg_rabbit_vice.webp', 'Cs2skin\\Rabbit', 'Rabbitvice.png'],
  ['pg_record_player.webp', 'Cs2skin\\recordplater', 'Diskplayer.0000.png'],
  ['pg_rgb_case.webp', 'Cs2skin\\Cases01042026\\RGBcaseClone', 'RGBcaseClone.0000.png'],
  ['pg_roblox_butterfly.webp', 'Sucen\\Robloxrender'],
  ['pg_spectre.webp', 'Cs2skin\\July26\\spectre', 'spectre1.0000.png'],
  ['pg_test_backroom.webp', 'Testbackroom'],
  ['pg_titan_case.webp', 'Cs2skin\\cases112026\\Titancase', 'TitanCase.0000.png'],
  ['pg_train.webp', 'testAnimation', 'Train.png'],
  ['pg_troll.webp', 'Cs2skin\\06062026\\Troll', 'laughing.0000.png'],
  ['pg_usp_cortex.webp', 'Cs2skin\\01132026\\StUSPCORTEX', 'StUSPCORTEX.0000.png'],
  ['pg_voltzmann.webp', 'Cs2skin\\01132026\\Voltzmann', 'Voltzmann.png'],
];

function allPngsUnder(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries = [];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (e.isFile() && e.name.toLowerCase().endsWith('.png')) {
        const st = fs.statSync(full);
        out.push({ path: full, size: st.size, name: e.name });
      }
    }
  }
  return out;
}

function pickForSubject(dirRel, prefName) {
  const dir = path.join(SOURCE_ROOT, dirRel);
  if (!fs.existsSync(dir)) return null;
  const pngs = allPngsUnder(dir);
  if (!pngs.length) return null;
  if (prefName) {
    const match = pngs.find(p => p.name.toLowerCase() === prefName.toLowerCase());
    if (match) return match;
  }
  return pngs.reduce((a, b) => (b.size > a.size ? b : a));
}

// ---------- main ----------
let created = 0, skippedPresent = 0, failed = 0;
const failures = [];

for (const [publicFile, dirRel, pref] of MISSING) {
  const outPath = path.join(PUBLIC_DIR, publicFile);
  if (fs.existsSync(outPath)) {
    skippedPresent++;
    continue;
  }
  const pick = pickForSubject(dirRel, pref);
  if (!pick) {
    failed++;
    failures.push(`${publicFile}  <-  no source PNG under G:\\Renders\\${dirRel}${pref ? ` (wanted ${pref})` : ''}`);
    continue;
  }
  try {
    await sharp(pick.path)
      .resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outPath);
    created++;
    console.log(`  [created] ${publicFile}  <-  ${path.relative(SOURCE_ROOT, pick.path)}`);
  } catch (e) {
    failed++;
    failures.push(`${publicFile}  <-  convert fail: ${e.message.split('\n')[0]}`);
  }
}

console.log(`\nCreated: ${created}   Already present (skipped): ${skippedPresent}   Failed: ${failed}`);
if (failures.length) {
  console.log('\nFailures:');
  failures.forEach(f => console.log('  - ' + f));
}