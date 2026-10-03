'use strict';
/**
 * Responsive <img> builder.
 * - By default images load from the Pexels CDN (resized on the fly, so no huge downloads).
 * - After `npm run images`, local optimised copies in assets/img/photos/ are used instead (AVIF/WebP/JPEG).
 * Paths use the `~/` prefix which the layout rewrites to the correct relative path for each page.
 */
const fs = require('fs');
const path = require('path');
const { P } = require('../data/photos');
const { esc } = require('./util');

const ROOT = path.resolve(__dirname, '../../..');
const PHOTO_DIR = path.join(ROOT, 'assets/img/photos');
const LOCAL_WIDTHS = [480, 800, 1200, 1600, 2400];

const localCache = {};
function localSet(key) {
  if (localCache[key] !== undefined) return localCache[key];
  const has = (w, ext) => fs.existsSync(path.join(PHOTO_DIR, `${key}-${w}.${ext}`));
  const widths = LOCAL_WIDTHS.filter((w) => has(w, 'jpg'));
  localCache[key] = widths.length
    ? { widths, avif: widths.every((w) => has(w, 'avif')), webp: widths.every((w) => has(w, 'webp')) }
    : null;
  return localCache[key];
}

function remoteUrl(key, w) {
  const p = P[key];
  return `https://images.pexels.com/photos/${p.id}/pexels-photo-${p.id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}
/** Cropped remote URL (used for Open Graph, 1200x630). */
function remoteCrop(key, w, h) {
  const p = P[key];
  return `https://images.pexels.com/photos/${p.id}/pexels-photo-${p.id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;
}

function srcsetFor(key, widths, ext) {
  const local = localSet(key);
  if (local) {
    const ws = local.widths;
    return ws.map((w) => `~/assets/img/photos/${key}-${w}.${ext} ${w}w`).join(', ');
  }
  return widths.map((w) => `${remoteUrl(key, w)} ${w}w`).join(', ');
}

/**
 * img('heroGround', { sizes, widths, eager, cls, alt, pos, fetchpriority })
 */
function img(key, o = {}) {
  const p = P[key];
  if (!p) throw new Error(`Unknown photo key: ${key}`);
  const {
    sizes = '(min-width: 1100px) 50vw, 100vw',
    widths = [480, 800, 1200, 1800],
    eager = false,
    cls = '',
    alt = p.alt,
    pos = p.pos,
    fetchpriority,
    attrs = '',
  } = o;
  const local = localSet(key);
  const baseW = 1200;
  const baseH = Math.round(baseW / p.r);
  const defSrc = local ? `~/assets/img/photos/${key}-${local.widths.includes(1200) ? 1200 : local.widths[local.widths.length - 1]}.jpg` : remoteUrl(key, 1200);
  const style = `background-color:${p.c}${pos ? `;object-position:${pos}` : ''}`;
  const tag = `<img class="ph${cls ? ' ' + cls : ''}" src="${defSrc}" srcset="${srcsetFor(key, widths, 'jpg')}" sizes="${sizes}" width="${baseW}" height="${baseH}" alt="${esc(alt)}" ${eager ? 'loading="eager"' : 'loading="lazy"'} decoding="async"${fetchpriority ? ` fetchpriority="${fetchpriority}"` : ''} style="${style}" data-ph${attrs ? ' ' + attrs : ''}>`;
  if (local && (local.avif || local.webp)) {
    return `<picture>${local.avif ? `<source type="image/avif" srcset="${srcsetFor(key, widths, 'avif')}" sizes="${sizes}">` : ''}${local.webp ? `<source type="image/webp" srcset="${srcsetFor(key, widths, 'webp')}" sizes="${sizes}">` : ''}${tag}</picture>`;
  }
  return tag;
}

/** Plain URL for a photo at a width (for og:image, preload, CSS). */
function url(key, w = 1200) {
  const local = localSet(key);
  if (local) {
    const best = local.widths.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a));
    return `~/assets/img/photos/${key}-${best}.jpg`;
  }
  return remoteUrl(key, w);
}

/** <link rel=preload> tag for the LCP image. */
function preload(key, widths = [800, 1200, 1800, 2400], sizes = '100vw') {
  return `<link rel="preload" as="image" imagesrcset="${srcsetFor(key, widths, 'jpg')}" imagesizes="${sizes}" fetchpriority="high">`;
}

module.exports = { img, url, preload, remoteUrl, remoteCrop, P };
