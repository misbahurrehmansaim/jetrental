#!/usr/bin/env node
'use strict';
/** Lists CSS classes used in the built HTML that have no rule in the stylesheet (and vice-versa with --unused). */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const dist = path.join(root, process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'dist');
const css = fs.readdirSync(path.join(root, 'assets/css/src')).filter((f) => f.endsWith('.css')).map((f) => fs.readFileSync(path.join(root, 'assets/css/src', f), 'utf8')).join('\n');
const defined = new Set([...css.replace(/url\([^)]*\)/g, '').matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
const used = new Map();
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith('.html')) {
      const h = fs.readFileSync(p, 'utf8');
      for (const m of h.matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).forEach((c) => c && !used.has(c) && used.set(c, path.relative(dist, p)));
    }
  }
})(dist);
const js = fs.existsSync(path.join(root, 'assets/js/app.js')) ? fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8') : '';
const missing = [...used.keys()].filter((c) => !defined.has(c));
console.log(`classes used in HTML: ${used.size}, defined in CSS: ${defined.size}`);
console.log('USED BUT NOT STYLED:', missing.length ? '\n  ' + missing.map((c) => `${c}  (${used.get(c)})`).join('\n  ') : 'none');
if (process.argv.includes('--unused')) {
  const unused = [...defined].filter((c) => !used.has(c) && !js.includes(c));
  console.log('STYLED BUT NEVER USED (html or js):', unused.join(' '));
}
