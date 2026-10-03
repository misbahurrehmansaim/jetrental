#!/usr/bin/env node
'use strict';
/**
 * Local dev server with rebuild-on-save. Zero dependencies.
 *   npm start            -> http://localhost:3000   (unminified assets, rebuilds when you save)
 *   PORT=4000 npm start  -> another port
 * Source files you edit: tools/build/** (content and pages), assets/css/src/**, assets/js/src/**
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = parseInt(process.env.PORT, 10) || 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon',
};

let building = false;
let queued = false;
function build(cb) {
  if (building) { queued = true; return; }
  building = true;
  const p = spawn(process.execPath, [path.join(ROOT, 'tools/build/build.js'), '--dev'], { cwd: ROOT, stdio: 'inherit' });
  p.on('close', () => {
    building = false;
    if (cb) cb();
    if (queued) { queued = false; build(); }
  });
}

function serve() {
  http
    .createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      let f = path.normalize(path.join(DIST, p));
      if (!f.startsWith(DIST)) { res.statusCode = 403; return res.end('Forbidden'); }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (!fs.existsSync(f)) {
        res.statusCode = 404;
        f = path.join(DIST, '404.html');
      }
      const ext = path.extname(f).toLowerCase();
      res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-store');
      // support video range requests so the hero video can seek
      const stat = fs.statSync(f);
      const range = req.headers.range;
      if (range && ext === '.mp4') {
        const [s, e] = range.replace(/bytes=/, '').split('-');
        const start = parseInt(s, 10);
        const end = e ? parseInt(e, 10) : stat.size - 1;
        res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Content-Type': 'video/mp4' });
        return fs.createReadStream(f, { start, end }).pipe(res);
      }
      res.setHeader('Content-Length', stat.size);
      fs.createReadStream(f).pipe(res);
    })
    .listen(PORT, () => {
      console.log(`\n  Dev server: http://localhost:${PORT}\n  Edit files and save. The site rebuilds automatically. Refresh the browser to see changes.\n`);
    });
}

build(serve);

// rebuild when sources change (debounced)
let timer = 0;
const onChange = (_evt, file) => {
  if (file && /(^|[\\/])(\.|node_modules)/.test(file)) return;
  clearTimeout(timer);
  timer = setTimeout(() => build(), 150);
};
['tools/build', 'assets/css/src', 'assets/js/src', 'public'].forEach((d) => {
  const dir = path.join(ROOT, d);
  if (!fs.existsSync(dir)) return;
  try {
    fs.watch(dir, { recursive: true }, onChange);
  } catch (_) {
    // recursive watch is not available on every Linux Node version: fall back to a poll
    let last = 0;
    setInterval(() => {
      let m = 0;
      (function walk(p) {
        for (const n of fs.readdirSync(p)) {
          const q = path.join(p, n);
          const s = fs.statSync(q);
          if (s.isDirectory()) walk(q);
          else m = Math.max(m, s.mtimeMs);
        }
      })(dir);
      if (last && m > last) onChange();
      last = m;
    }, 1000);
  }
});
