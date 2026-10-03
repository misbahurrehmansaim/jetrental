#!/usr/bin/env node
'use strict';
/**
 * Downloads every photo used on the site from Pexels and writes optimised local copies
 * (JPEG + WebP + AVIF at five widths) to assets/img/photos/, plus the hero video.
 * After running it, `npm run build` automatically prefers the local files, so the site
 * no longer depends on the Pexels CDN (faster and works offline).
 *
 *   npm install          (installs sharp)
 *   npm run images
 *   npm run images -- --no-video      skip the hero video
 *   npm run images -- --only=heroGround,heroSky
 *
 * Photos are free to use commercially without attribution under the Pexels licence
 * (https://www.pexels.com/license/). Replace them with your client's own photography when you have it.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets/img/photos');
const VID = path.join(ROOT, 'assets/video');
const { P, keys } = require('./build/data/photos');
const { remoteHeroVideo } = require('./build/data/media');
const WIDTHS = [480, 800, 1200, 1600, 2400];

let sharp;
try { sharp = require('sharp'); } catch (e) {
  console.error('\n  sharp is not installed. Run:  npm install\n');
  process.exit(1);
}
const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const skipVideo = args.includes('--no-video');

function get(url, dest) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (site image localiser)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return resolve(get(res.headers.location, dest));
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode + ' for ' + url)); }
      if (dest) {
        const f = fs.createWriteStream(dest);
        res.pipe(f);
        f.on('finish', () => f.close(resolve));
        f.on('error', reject);
      } else {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }
    });
    req.on('error', reject);
    req.setTimeout(60000, () => req.destroy(new Error('timeout ' + url)));
  });
}

async function photo(key) {
  const p = P[key];
  const done = WIDTHS.every((w) => ['jpg', 'webp', 'avif'].every((e) => fs.existsSync(path.join(OUT, `${key}-${w}.${e}`))));
  if (done) return 'skip';
  // original is large; ask the CDN for 2400 px wide (never upscaled)
  const src = await get(`https://images.pexels.com/photos/${p.id}/pexels-photo-${p.id}.jpeg?auto=compress&cs=tinysrgb&w=2400`);
  const img = sharp(src, { failOn: 'none' }).rotate();
  const meta = await img.metadata();
  for (const w of WIDTHS) {
    const width = Math.min(w, meta.width);
    const base = img.clone().resize({ width, withoutEnlargement: true });
    await base.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${key}-${w}.jpg`));
    await base.clone().webp({ quality: 74 }).toFile(path.join(OUT, `${key}-${w}.webp`));
    await base.clone().avif({ quality: 52, effort: 4 }).toFile(path.join(OUT, `${key}-${w}.avif`));
  }
  return 'ok';
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const list = keys.filter((k) => !only.length || only.includes(k));
  console.log(`\n  Localising ${list.length} photos to assets/img/photos ...\n`);
  let ok = 0, skip = 0, fail = 0;
  const queue = list.slice();
  const worker = async () => {
    while (queue.length) {
      const k = queue.shift();
      try {
        const r = await photo(k);
        if (r === 'skip') skip++; else ok++;
        process.stdout.write(`  ${r === 'skip' ? '=' : '+'} ${k}\n`);
      } catch (e) {
        fail++;
        process.stdout.write(`  ! ${k}: ${e.message}\n`);
      }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  console.log(`\n  Photos: ${ok} downloaded, ${skip} already present, ${fail} failed.`);

  if (!skipVideo) {
    fs.mkdirSync(VID, { recursive: true });
    for (const [url, name] of [[remoteHeroVideo.hd, 'hero-720.mp4'], [remoteHeroVideo.sd, 'hero-540.mp4']]) {
      const dest = path.join(VID, name);
      if (fs.existsSync(dest)) { console.log('  = ' + name); continue; }
      try { await get(url, dest); console.log('  + ' + name); } catch (e) { console.log('  ! ' + name + ': ' + e.message); try { fs.unlinkSync(dest); } catch (_) {} }
    }
  }
  console.log('\n  Done. Now run:  npm run build   (it will use the local files)\n');
  if (fail) process.exitCode = 1;
})();
