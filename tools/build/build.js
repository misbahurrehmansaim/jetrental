#!/usr/bin/env node
'use strict';
/**
 * Static site generator.
 *   node tools/build/build.js            production build  -> dist/
 *   node tools/build/build.js --dev      unminified assets  -> dist/
 *   node tools/build/build.js --file     file:// friendly links (open index.html from disk) -> dist-offline/
 *   STAGING=1 node tools/build/build.js  noindex + Disallow:all (for client demos)
 *   SITE_URL=https://yourdomain.com node tools/build/build.js
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
if (flag('file')) process.env.FILE_LINKS = '1';

const ROOT = path.resolve(__dirname, '../..');
const cfg = require('./config');
const DEV = flag('dev');
cfg.__dev = DEV;
const STAGING = !!process.env.STAGING;
const OUT = path.resolve(ROOT, (argv.find((a) => a.startsWith('--out=')) || '').slice(6) || (flag('file') ? 'dist-offline' : 'dist'));

const { page, abs } = require('./lib/layout');

/* ---------------------------------------------------------------- helpers */
const log = (...a) => console.log(...a);
const warnings = [];
const warn = (m) => warnings.push(m);

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}
function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}
function copyDir(src, dest, filter = () => true) {
  if (!fs.existsSync(src)) return;
  mkdirp(dest);
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (!filter(s)) continue;
    if (e.isDirectory()) copyDir(s, d, filter);
    else fs.copyFileSync(s, d);
  }
}
const hash = (buf) => crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);

let esbuild = null;
try {
  esbuild = require('esbuild');
} catch (_) {
  /* optional: falls back to a conservative minifier */
}

function minCss(css) {
  if (esbuild) return esbuild.transformSync(css, { loader: 'css', minify: true }).code;
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}
function minJs(js) {
  if (esbuild) return esbuild.transformSync(js, { loader: 'js', minify: true, target: 'es2019' }).code;
  return js;
}

/* ---------------------------------------------------------------- collect pages */
function collect() {
  const mods = [
    ['home', require('./pages/home')],
    ['core', require('./pages/core')],
    ['fleet', require('./pages/fleet')],
    ['routes', require('./pages/routes')],
    ['content', require('./pages/content')],
    ['legal', require('./pages/legal')],
  ];
  const pages = [];
  for (const [name, fn] of mods) {
    let res;
    try {
      res = fn();
    } catch (e) {
      console.error(`\nERROR while building "${name}" pages:\n`, e.stack || e);
      process.exit(1);
    }
    pages.push(...(Array.isArray(res) ? res : [res]));
  }
  return pages;
}

/* ---------------------------------------------------------------- checks */
function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function checkPage(o, html) {
  const id = o.path;
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) warn(`${id}: ${h1} <h1> tags (want exactly 1)`);
  const full = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const decoded = full.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  if (decoded.length > 68) warn(`${id}: title is ${decoded.length} chars: "${decoded}"`);
  if (decoded.length < 20) warn(`${id}: title is short (${decoded.length})`);
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (desc.length > 170) warn(`${id}: meta description is ${desc.length} chars`);
  if (desc.length < 70) warn(`${id}: meta description is short (${desc.length})`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  ids.forEach((x) => {
    if (seen.has(x)) warn(`${id}: duplicate id "${x}"`);
    seen.add(x);
  });
  const words = textOf(html.replace(/<header[\s\S]*?<\/header>/, '').replace(/<footer[\s\S]*?<\/footer>/, '')).split(' ').length;
  if (words < 350 && !o.noindex && !/^\/(sitemap|404|privacy|terms)/.test(id)) warn(`${id}: thin content (${words} words)`);
  const noAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/g) || []).length;
  if (noAlt) warn(`${id}: ${noAlt} <img> without alt`);
  return words;
}

function checkLinks(written) {
  // written: Map(outFile -> html)
  const files = new Set([...written.keys()].map((f) => path.relative(OUT, f).split(path.sep).join('/')));
  const assetExists = (rel) => fs.existsSync(path.join(OUT, rel));
  let broken = 0;
  for (const [file, html] of written) {
    const dir = path.dirname(path.relative(OUT, file)).split(path.sep).join('/');
    for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      let u = m[1];
      if (/^(https?:|mailto:|tel:|data:|javascript:|#|\/\/)/.test(u)) continue;
      u = u.split('#')[0].split('?')[0];
      if (!u) continue;
      let target;
      if (u.startsWith('/')) target = u.slice(1);
      else target = path.posix.normalize(path.posix.join(dir === '.' ? '' : dir, u));
      target = target.replace(/^\.\//, '');
      if (target === '' || target.endsWith('/')) target += 'index.html';
      if (files.has(target) || assetExists(target)) continue;
      if (files.has(path.posix.join(target, 'index.html'))) continue;
      broken++;
      warn(`broken link in ${path.relative(OUT, file)}: ${m[1]}`);
    }
  }
  return broken;
}

/* ---------------------------------------------------------------- seo files */
function sitemapXml(pages) {
  const items = pages
    .filter((p) => !p.noindex && !p.file)
    .map((p) => {
      const pri = p.path === '/' ? '1.0' : /^\/(instant-quote|private-jet-charter|private-jet-cost|fleet|routes)\/$/.test(p.path) ? '0.9' : /^\/(routes|fleet|guides)\//.test(p.path) ? '0.7' : '0.6';
      return `  <url><loc>${abs(p.path)}</loc><lastmod>${cfg.buildDate}</lastmod><priority>${pri}</priority></url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}
function robotsTxt() {
  if (STAGING) return 'User-agent: *\nDisallow: /\n';
  return `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`;
}
function llmsTxt(pages) {
  const { classes } = require('./data/fleet');
  const { routes } = require('./data/routes');
  const { posts } = require('./data/posts');
  const l = (t, p, d) => `- [${t}](${abs(p)})${d ? ': ' + d : ''}`;
  return `# ${cfg.name}

> ${cfg.shortDescription}

${cfg.name} ${cfg.businessModel === 'broker' ? 'is a private aviation broker. Flights are operated by independent FAA Part 135 carriers named on every quote.' : 'operates private jet charter under FAA Part 135 authority.'} Prices on this site are indicative market ranges, not quotes.

## Key pages
${l('Private jet charter', '/private-jet-charter/', 'how on-demand charter works')}
${l('Instant quote', '/instant-quote/', 'request a quote and see an estimate')}
${l('Private jet cost', '/private-jet-cost/', 'hourly rates by aircraft class and worked examples')}
${l('Empty leg flights', '/empty-leg-flights/')}
${l('Jet card', '/jet-card/')}
${l('Safety', '/safety/', 'how operators are vetted')}
${l('FAQ', '/faq/')}

## Fleet
${classes.map((c) => l(c.name, `/fleet/${c.slug}/`, `${c.paxLabel} seats, ${c.range.toLocaleString('en-US')} mile range`)).join('\n')}

## Routes
${routes.map((r) => l(`${r.a.city} to ${r.b.city}`, `/routes/${r.slug}/`)).join('\n')}

## Guides
${posts.map((p) => l(p.title, `/guides/${p.slug}/`)).join('\n')}
`;
}
function manifest() {
  return JSON.stringify(
    {
      name: cfg.name,
      short_name: cfg.name,
      description: cfg.shortDescription,
      start_url: '/',
      display: 'standalone',
      background_color: cfg.theme.navy,
      theme_color: cfg.theme.navy,
      icons: [
        { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    null,
    2
  );
}

/* ---------------------------------------------------------------- main */
function build() {
  const t0 = Date.now();
  const pages = collect();

  // duplicate path guard
  const seen = new Set();
  pages.forEach((p) => {
    if (seen.has(p.path)) warn(`duplicate page path ${p.path}`);
    seen.add(p.path);
  });

  rmrf(OUT);
  mkdirp(OUT);

  // ---- assets
  const srcAssets = path.join(ROOT, 'assets');
  copyDir(srcAssets, path.join(OUT, 'assets'), (s) => {
    const rel = path.relative(srcAssets, s).split(path.sep).join('/');
    if (rel.startsWith('css/src') || rel.startsWith('js/src') || rel.endsWith('.map')) return false;
    if (!DEV && (rel === 'vendor' || rel.startsWith('vendor/'))) return false;
    return true;
  });
  copyDir(path.join(ROOT, 'public'), OUT);

  // CSS is authored as partials in assets/css/src/NN-name.css and joined in order.
  const cssDir = path.join(srcAssets, 'css/src');
  const cssAll = fs
    .readdirSync(cssDir)
    .filter((f) => f.endsWith('.css'))
    .sort()
    .map((f) => fs.readFileSync(path.join(cssDir, f), 'utf8'))
    .join('\n');
  mkdirp(path.join(OUT, 'assets/css'));
  // JS is authored as partials in assets/js/src/NN-name.js, joined in order inside one IIFE.
  const jsDir = path.join(srcAssets, 'js/src');
  const appJs =
    "(function(){'use strict';\n" +
    fs
      .readdirSync(jsDir)
      .filter((f) => f.endsWith('.js'))
      .sort()
      .map((f) => fs.readFileSync(path.join(jsDir, f), 'utf8'))
      .join('\n') +
    '\n})();\n';
  let cssV = '';
  let jsV = '';
  if (DEV) {
    fs.writeFileSync(path.join(OUT, 'assets/css/main.css'), cssAll);
    mkdirp(path.join(OUT, 'assets/js'));
    fs.writeFileSync(path.join(OUT, 'assets/js/app.js'), appJs);
  } else {
    const css = minCss(cssAll);
    fs.writeFileSync(path.join(OUT, 'assets/css/main.min.css'), css);
    cssV = hash(css);
    const vend = ['gsap.min.js', 'ScrollTrigger.min.js', 'lenis.min.js'].map((f) => fs.readFileSync(path.join(srcAssets, 'vendor', f), 'utf8').replace(/\/\/# sourceMappingURL=.*$/gm, ''));
    const app = minJs(appJs);
    const bundle = [...vend, app].join(';\n');
    mkdirp(path.join(OUT, 'assets/js'));
    fs.writeFileSync(path.join(OUT, 'assets/js/bundle.min.js'), bundle);
    jsV = hash(bundle);
  }

  // ---- pages
  const written = new Map();
  let totalWords = 0;
  for (const o of pages) {
    let html;
    try {
      html = page({ ...o, noindex: o.noindex || STAGING });
    } catch (e) {
      console.error(`\nERROR rendering ${o.path}:\n`, e.stack || e);
      process.exit(1);
    }
    if (!DEV) {
      html = html.replace(/main\.min\.css"/g, `main.min.css?v=${cssV}"`).replace(/bundle\.min\.js"/g, `bundle.min.js?v=${jsV}"`);
    }
    totalWords += checkPage(o, html);
    const file = o.file ? path.join(OUT, o.file) : path.join(OUT, o.path.replace(/^\//, ''), 'index.html');
    mkdirp(path.dirname(file));
    fs.writeFileSync(file, html);
    written.set(file, html);
  }

  // ---- seo files (skip sitemap in file mode: it is for deployment)
  if (!flag('file')) {
    fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemapXml(pages));
    fs.writeFileSync(path.join(OUT, 'robots.txt'), robotsTxt());
    fs.writeFileSync(path.join(OUT, 'llms.txt'), llmsTxt(pages));
  }
  fs.writeFileSync(path.join(OUT, 'manifest.webmanifest'), manifest());

  const broken = checkLinks(written);

  log(`\n  ${cfg.name}: built ${pages.length} pages (${totalWords.toLocaleString('en-US')} words) -> ${path.relative(process.cwd(), OUT) || '.'} in ${Date.now() - t0} ms`);
  log(`  mode: ${DEV ? 'dev (unminified)' : 'production'}${flag('file') ? ', file:// links' : ''}${STAGING ? ', STAGING noindex' : ''}${esbuild ? '' : ', (esbuild not installed: basic minifier used)'}`);
  if (warnings.length) {
    log(`\n  ${warnings.length} warning(s):`);
    warnings.slice(0, 60).forEach((w) => log('   - ' + w));
    if (warnings.length > 60) log(`   ... and ${warnings.length - 60} more`);
  } else {
    log('  all checks passed (titles, descriptions, h1, ids, alt text, internal links)');
  }
  log('');
  return { pages, warnings, broken };
}

if (require.main === module) {
  const r = build();
  if (flag('strict') && r.warnings.length) process.exit(1);
}
module.exports = { build };
