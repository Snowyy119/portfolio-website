// Selects 80 unique, colorful/special renders from G:\Renders,
// converts them to optimized WebP in public/, and emits a data module.
//
// - One image per "subject" (folder) => guarantees distinct renders.
// - Hasler-Susstrunk colorfulness metric => "colorful" ones rank higher.
// - Dedupe by source file => never two identical images.
// - Keeps top 80, writes public/pg_<slug>.webp + src/data/portfolioImages.js
//
// Usage: node scripts/select-renders.mjs [TARGET_COUNT]   (default 80)

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT = 'G:\\Renders';

const TARGET = parseInt(process.argv[2] || '80', 10);
const FINAL_MAX_DIM = 1440;   // max side for the public WebP
const FINAL_QUALITY = 82;
const SCORE_DIM = 256;        // small size used only to compute colorfulness

// [dirRel, title, category, preferredFilename?]
// dirRel is relative to G:\Renders. If preferredFilename is given and found
// anywhere under dirRel it is used; otherwise the largest PNG in the subtree.
const SUBJECTS = [
  // ---- Characters ----
  ['Jiggo', 'Palacio', 'Character', 'palacio.0000.png'],
  ['Sucen\\Robloxrender', 'Roblox Butterfly', 'Character'],
  ['GaveyOverlay', 'Gavey Overlay', 'Character', 'GAVEYScreenoverlay.0000.png'],
  ['krinker', 'Krinker', 'Character', 'krinkerrendertest.0000.png'],
  ['krinkerMuseum', 'Krinker Museum', 'Character', 'krinkerMuseum.0000.png'],
  ['AaronForestTiger', 'Jungle Tiger', 'Character', 'REnderjungle2.0000.png'],
  ['VJC', 'Stone Island', 'Character', 'RenderVJCStoneisland.0000.png'],
  ['KrankyWinter', 'Kranky Winter', 'Character', 'krankyWinter.0000.png'],
  ['EliasAnubis', 'Elias Anubis', 'Character', 'Eliasrenderanubis.0001.png'],
  ['EliasRender', 'Elias Collection', 'Character', 'RenderEliascollection4k.0000.png'],
  ['Eliasrender2', 'Elias Render II', 'Character', 'EliasRENDER2.0000.png'],
  ['HarryGlockNeonoir', 'Harry Glock NeoNoir', 'Character', 'renderharry.0000.png'],
  ['HarryInferno', 'Harry Inferno', 'Character', 'RenderHarry2-4k.0000.png'],
  ['Ch1llouter', 'Chill Outer', 'Character', 'RenderCraft4k.0000.png'],
  ['Bordrender', 'Bord Render', 'Character', 'gungirbord4k.0000.png'],
  ['Goggle\\Rose', 'Rose Goggle', 'Character', 'Rose.0000.png'],
  ['Goggle\\SallyRose', 'Sally Rose', 'Character', 'RoseItaly2K.0000.png'],
  ['BodeRender', 'Bode Render', 'Character', 'boderendercompleted4k-2.0000.png'],
  ['DK', 'DK Render', 'Character', 'RenderDK4096.0000.png'],
  ['Teff', 'Teff Graphite', 'Character', 'graphite.0000.png'],
  ['StickerSlab', 'Sticker Slab', 'Character', 'stickergraded.0000.png'],
  ['Krinkerstickertexture\\Cyberchicken', 'Cyber Chicken', 'Character', 'Cyberchicken1.0000.png'],
  ['Krinkerstickertexture\\Kato14Vox', 'Kato Vox', 'Character', 'vox1.FinalImageLayer1.0000.png'],
  ['Krinkerstickertexture\\Kato14Reason', 'Kato', 'Character', 'rea1.0000.png'],
  ['Krinkerstickertexture\\C9DH14', 'C9 DH14', 'Character', 'C91.0000.png'],
  ['Test', 'Krinkerton', 'Character', 'Krinkertonrender.0000.png'],
  // ---- Environments ----
  ['Backrooms', 'Backrooms', 'Environment'],
  ['Testbackroom', 'Test Backroom', 'Environment'],
  ['Miniature\\Dust2', 'Mini Dust2', 'Environment', 'minidust2B.0000.png'],
  ['Miniature\\Inferno', 'Mini Inferno', 'Environment', 'MiniInfernoA.0000.png'],
  ['Miniature\\Nuke', 'Mini Nuke', 'Environment', 'dragonT.0000.png'],
  ['Miniature\\Cache', 'Mini Cache', 'Environment', 'Minicache.0000.png'],
  ['Minecraft1', 'Minecraft Afternoon', 'Environment', 'Afternoon.0000.png'],
  ['Testpanorama', 'Panorama', 'Environment', 'Panographic.0000.png'],
  ['de_backoffice', 'Backoffice Anomaly', 'Environment', 'anomaly.0000.png'],
  ['Cs2skin\\dust2', 'Dust2', 'Environment', 'renderdust2A.0000.png'],
  ['Cs2skin\\Mirage', 'Mirage', 'Environment', 'Mirage1.0000.png'],
  // ---- Seasonal ----
  ['Cs2skin\\Christmas', 'Christmas Santa', 'Seasonal', 'santa.0000.png'],
  // ---- Pop Culture ----
  ['Cs2skin\\Runescape', 'RuneScape', 'Pop Culture', 'sasRunescape2.0000.png'],
  // ---- Art / Abstract / 3D ----
  ['KuwaharaTest', 'Kuwahara', 'Art', 'kuwaharatext.0000.png'],
  ['Voxel', 'Voxel', '3D Render', 'voxel.png'],
  ['Cs2skin\\recordplater', 'Record Player', '3D Render', 'Diskplayer.0000.png'],
  ['Dynamiccardrender', 'Dynamic Card MP7', '3D Render', 'cardrendermp7fade.0000.png'],
  ['Dynamiccardrender\\gif2', 'Dynamic MP9', '3D Render', 'RenderDynamicmp9.0000.png'],
  ['DynamicRender1', 'MP9 Starlight', 'Weapon Render', 'mp9starlight2.0000.png'],
  ['ILrenders\\Tournament', 'Tournament', '3D Render', 'IL_1.0000.png'],
  ['testAnimation', 'Train', '3D Render', 'Train.png'],
  // ---- Weapon Renders / Skins (colorful + special) ----
  ['Stromy', 'Tec9 Brass', 'Weapon Render', 'Tec9BrassRender4.0000.png'],
  ['Toyboxed', 'Toybox Glock', 'Weapon Render', 'GlockToyboxlight.0000.png'],
  ['Cs2skin\\01132026\\CandyRush', 'Candy Rush', 'Weapon Render', 'CandyRush.0000.png'],
  ['Cs2skin\\Cases01042026\\BabyDragon', 'Baby Dragon', 'Weapon Render', 'BabyDragon.0000.png'],
  ['Cs2skin\\Rabbit', 'Rabbit Vice', 'Weapon Render', 'Rabbitvice.png'],
  ['Cs2skin\\penguin', 'Penguin Mountain', 'Weapon Render', 'mountain.0000.png'],
  ['Cs2skin\\01132026\\Futuristic', 'Futuristic', 'Weapon Render', 'Futuristic.0000.png'],
  ['Cs2skin\\Cases01042026\\RGBcaseClone', 'RGB Case', 'Weapon Render', 'RGBcaseClone.0000.png'],
  ['Cs2skin\\01132026\\Awpmanowar', 'AWP Manowar', 'Weapon Render', 'Awpmanowar.0000.png'],
  ['Cs2skin\\01132026\\TalonBlackpearl', 'Talon Blackpearl', 'Weapon Render', 'TalonBlackpearl.0000.png'],
  ['Cs2skin\\01132026\\AtomicAlloy', 'Atomic Alloy', 'Weapon Render', 'AtomicAlloy.0000.png'],
  ['Cs2skin\\01132026\\Voltzmann', 'Voltzmann', 'Weapon Render', 'Voltzmann.png'],
  ['Cs2skin\\01132026\\Monstercase', 'Monster Case', 'Weapon Render', 'Monstercase.png'],
  ['Cs2skin\\01132026\\Royalcase', 'Royal Case', 'Weapon Render', 'Royalcase.png'],
  ['Cs2skin\\01132026\\dirtymoneycase', 'Dirty Money', 'Weapon Render', 'dirtymoneycase.png'],
  ['Cs2skin\\01132026\\crimsoncase', 'Crimson Case', 'Weapon Render', 'crimsoncase.png'],
  ['Cs2skin\\01132026\\Enforcer', 'Enforcer', 'Weapon Render', 'Enforcer.png'],
  ['Cs2skin\\01132026\\StDeaglePrintStream', 'Deagle Print Stream', 'Weapon Render', 'StDeaglePrintStream.0000.png'],
  ['Cs2skin\\01132026\\StUSPCORTEX', 'USP Cortex', 'Weapon Render', 'StUSPCORTEX.0000.png'],
  ['Cs2skin\\01132026\\NormalGlove', 'Normal Glove', 'Weapon Render', 'NormalGlove.png'],
  ['Cs2skin\\01132026\\BrokenfangUnhinged', 'Broken Fang', 'Weapon Render', 'BrokenfangUnhinged.png'],
  ['Cs2skin\\01122026\\KillShot', 'Kill Shot', 'Weapon Render', 'KillShot.0000.png'],
  ['Cs2skin\\01122026\\goldgiveaway', 'Gold Giveaway', 'Weapon Render', 'goldgiveaway.0000.png'],
  ['Cs2skin\\01122026\\dragon', 'Dragon Egg', 'Weapon Render', 'egg.0000.png'],
  ['Cs2skin\\06062026\\Rust', 'Punishment Mask', 'Weapon Render', 'Punishmentmask.0000.png'],
  ['Cs2skin\\06062026\\Troll', 'Troll', 'Weapon Render', 'laughing.0000.png'],
  ['Cs2skin\\06062026\\laser', 'Laser', 'Weapon Render', 'laser1.0000.png'],
  ['Cs2skin\\06062026\\instruments', 'Instruments', 'Weapon Render', 'instrument1.0000.png'],
  ['Cs2skin\\06062026', 'AWP Prince', 'Weapon Render', 'awpprince.0000.png'],
  ['Cs2skin\\01162026\\donk', 'Donk', 'Weapon Render', 'donk.png'],
  ['Cs2skin\\01162026\\flashback', 'Flashback', 'Weapon Render', 'flashback.png'],
  ['Cs2skin\\01162026\\Oldegypt', 'Old Egypt', 'Weapon Render', 'Oldegypt.png'],
  ['Cs2skin\\01162026\\watchdog', 'Watchdog', 'Weapon Render', 'watchdog.png'],
  ['Cs2skin\\01162026\\youcandoit', 'You Can Do It', 'Weapon Render', 'youcandoit.png'],
  ['Cs2skin\\01162026\\ApepSouv', 'Apep Souvenir', 'Weapon Render', 'ApepSouv.png'],
  ['Cs2skin\\01162026\\Casevscase', 'Case vs Case', 'Weapon Render', 'Casevscase.png'],
  ['Cs2skin\\01162026\\karamcasehardened', 'Karam Case Hardened', 'Weapon Render', 'karamcasehardened.png'],
  ['Cs2skin\\onlyglovecase', 'Glove Case', 'Weapon Render', 'onlyglovecase.png'],
  ['Cs2skin\\Talonultra', 'Talon Ultra', 'Weapon Render', 'talonultra.0000.png'],
  ['Cs2skin\\M9', 'M9 Case', 'Weapon Render', 'Rendercasecs2.0000.png'],
  ['Cs2skin\\cases112026\\Titancase', 'Titan Case', 'Weapon Render', 'TitanCase.0000.png'],
  ['Cs2skin\\cases112026\\Bluecase', 'Blue Case', 'Weapon Render', 'Blue.0000.png'],
  ['Cs2skin\\cases112026\\DesertCase', 'Desert Case', 'Weapon Render', 'DesertCase.0000.png'],
  ['Cs2skin\\July26\\spectre', 'Spectre', 'Weapon Render', 'spectre1.0000.png'],
  ['Cs2skin\\July26\\knives', 'Flip Knives', 'Weapon Render', 'flipmarble.0000.png'],
  ['Cs2skin\\July26\\Trophy', 'Golden Trophy', 'Weapon Render', 'trophygolden.0000.png'],
  ['Cs2skin\\July26\\Anomaly', 'Anomaly', 'Weapon Render', 'anomaly2.0000.png'],
  ['Cs2skin\\July26\\Trophy2', 'Trophy Crown', 'Weapon Render', 'crown.0000.png'],
  ['Cs2skin\\July26\\weaponcases', 'Weapon Cases', 'Weapon Render', 'ak_4.0000.png'],
  ['Cs2skin\\July26', 'Aquamarine Revenge', 'Weapon Render', 'AquamarineRevenge.0000.png'],
  ['Cs2skin\\Jackpot', 'Jackpot AK', 'Weapon Render', 'Agentbanner_AK.0000.png'],
  ['Cs2skin\\Jackpot\\JackpotBackgrounddust', 'Jackpot Dust', 'Weapon Render', 'Agents_all.0000.png'],
  ['Cs2skin\\02142026', 'GTD Indecase', 'Weapon Render', 'Gtindercase.0000.png'],
  ['Cs2skin\\04032026', 'Amphibious', 'Weapon Render', 'amphibious.0000.png'],
  ['Cs2skin\\11032026', 'Akihabara', 'Weapon Render', 'akihabara.0000.png'],
  ['Cs2skin\\22042026', 'Crisis Management', 'Weapon Render', 'Crisismanagement1.0000.png'],
  ['Cs2skin\\08022026', 'Bash', 'Weapon Render', 'Bash.0000.png'],
  ['Cs2skin\\20042026', 'Cards', 'Weapon Render', 'cards.0000.png'],
  ['Cs2skin\\August26', 'AK Front Misty', 'Weapon Render', 'AKFrontsideMisty.0000.png'],
  ['Cs2skin\\02092026', 'AWP Elite Build', 'Weapon Render', 'AwpelitebuildST.0000.png'],
  ['Cs2skin\\01302026', '888', 'Weapon Render', '888.0000.png'],
  ['Cs2skin\\01302026\\gungnir', 'Gungnir', 'Weapon Render'],
  ['Cs2skin\\27022026', 'Frosted M9', 'Weapon Render', 'frosted m9.0000.png'],
  ['Cs2skin\\New folder', 'Mystery Case', 'Weapon Render', 'case.0000.png'],
  ['CSfloat', 'CS Float', 'Weapon Render', 'floatcsintro4.0174.png'],
  ['Goggle\\Field', 'AK Field Rose', 'Weapon Render', 'Akrenderrose2-2k.0000.png'],
];

// ---------- helpers ----------
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

// Hasler-Susstrunk colorfulness (approx). Higher = more colorful.
async function colorfulness(file) {
  const { data, info } = await sharp(file)
    .resize(SCORE_DIM, SCORE_DIM, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const rg = new Float64Array(n);
  const yb = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    rg[i] = r - g;
    yb[i] = 0.5 * (r + g) - b;
  }
  let mrg = 0, myb = 0;
  for (let i = 0; i < n; i++) { mrg += rg[i]; myb += yb[i]; }
  mrg /= n; myb /= n;
  let srg2 = 0, syb2 = 0;
  for (let i = 0; i < n; i++) { srg2 += (rg[i] - mrg) ** 2; syb2 += (yb[i] - myb) ** 2; }
  const stdRg = Math.sqrt(srg2 / n), stdYb = Math.sqrt(syb2 / n);
  return Math.sqrt(stdRg ** 2 + stdYb ** 2) + 0.3 * Math.sqrt(mrg ** 2 + myb ** 2);
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// ---------- main ----------
const t0 = Date.now();
console.log(`Scoring ${SUBJECTS.length} subjects...`);

const scored = [];
let skipped = 0;
for (const [dirRel, title, category, pref] of SUBJECTS) {
  const pick = pickForSubject(dirRel, pref);
  if (!pick) { console.log(`  [skip no png] ${dirRel}`); skipped++; continue; }
  let score = 0;
  try { score = await colorfulness(pick.path); } catch (e) { skipped++; continue; }
  scored.push({ dirRel, title, category, srcPath: pick.path, colorfulness: score });
}

// sort by colorfulness desc, dedupe by source file, keep TARGET
scored.sort((a, b) => b.colorfulness - a.colorfulness);
const seenSrc = new Set();
const selected = [];
for (const s of scored) {
  if (seenSrc.has(s.srcPath)) continue;
  seenSrc.add(s.srcPath);
  selected.push(s);
  if (selected.length >= TARGET) break;
}

console.log(`Selected ${selected.length} (skipped ${skipped} subjects, deduped by source).`);

// write outputs
const publicDir = path.join(ROOT, 'public');
const dataDir = path.join(ROOT, 'src', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const outEntries = [];
const usedNames = new Set();
for (let i = 0; i < selected.length; i++) {
  const s = selected[i];
  let base = slug(s.title);
  let name = base;
  let k = 2;
  while (usedNames.has(name)) { name = `${base}_${k++}`; }
  usedNames.add(name);
  const outName = `pg_${name}.webp`;
  const outPath = path.join(publicDir, outName);
  try {
    await sharp(s.srcPath)
      .resize(FINAL_MAX_DIM, FINAL_MAX_DIM, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: FINAL_QUALITY })
      .toFile(outPath);
  } catch (e) {
    console.log(`  [convert fail] ${s.title}: ${e.message.split('\n')[0]}`);
    continue;
  }
  outEntries.push({ src: `/${outName}`, title: s.title, category: s.category });
}

// sort final entries by category then title for a tidy grid, but keep a colorful mix
// (group by category so filters look organized)
const catOrder = ['Character','3D Render','Weapon Render','Environment','Pop Culture','Seasonal','Art','Abstract'];
outEntries.sort((a, b) => {
  const ca = catOrder.indexOf(a.category), cb = catOrder.indexOf(b.category);
  if (ca !== cb) return (ca === -1 ? 99 : ca) - (cb === -1 ? 99 : cb);
  return a.title.localeCompare(b.title);
});

const js = 'export const portfolioImages = [\n' +
  outEntries.map(e => `  { src: '${e.src}', category: '${e.category}', title: '${e.title.replace(/'/g, "\\'")}' },`).join('\n') +
  '\n];\n';
fs.writeFileSync(path.join(dataDir, 'portfolioImages.js'), js);
fs.writeFileSync(path.join(ROOT, 'scripts', 'selected-renders.json'), JSON.stringify(outEntries, null, 2));

console.log(`\nWrote ${outEntries.length} WebP files to public/ and src/data/portfolioImages.js`);
console.log(`Top by colorfulness: ${selected.slice(0, 12).map(s => `${s.title}(${Math.round(s.colorfulness)})`).join(', ')}`);
console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);