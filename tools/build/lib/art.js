'use strict';
/**
 * Generated vector graphics: cabin plans and the dotted US route map.
 * (Photography lives in data/photos.js; icons live in lib/icons.js.)
 */
const { airports, byCode } = require('../data/airports');
const { albers } = require('./util');

const f = (n) => (Math.round(n * 10) / 10).toString();

/* ------------------------------------------------------------------ */
/* Cabin plan (top view), purely illustrative                          */
/* ------------------------------------------------------------------ */
function cabinPlan(maxPax, label = 'Illustrative cabin layout') {
  const seats = Math.max(4, maxPax);
  const rows = Math.ceil(seats / 2);
  const W = 120 + rows * 34;
  const H = 96;
  let out = '';
  // two-abreast club seating, alternating facing
  for (let r = 0; r < rows; r++) {
    const x = 78 + r * 34;
    const count = r === rows - 1 && seats % 2 === 1 ? 1 : 2;
    for (let s = 0; s < count; s++) {
      const y = s === 0 ? 24 : 54;
      out += `<rect x="${x}" y="${y}" width="22" height="18" rx="6" fill="currentColor" fill-opacity=".85"/><rect x="${x + (r % 2 ? 0 : 14)}" y="${y + 2}" width="6" height="14" rx="3" fill="currentColor"/>`;
    }
  }
  return `<svg class="cabin-plan" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">
    <rect x="2" y="12" width="${W - 4}" height="${H - 24}" rx="34" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="1.5"/>
    <rect x="22" y="30" width="40" height="36" rx="6" fill="currentColor" fill-opacity=".18"/>
    <path d="M${W - 34},34 q22,14 0,28" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="1.5"/>
    ${out}
  </svg>`;
}

/* ------------------------------------------------------------------ */
/* Dotted US map                                                       */
/* ------------------------------------------------------------------ */
// Hand-traced outline of the contiguous US, clockwise from Cape Flattery. [lon, lat]
const US_OUTLINE = [
  [-124.7, 48.4], [-123.2, 48.2], [-122.8, 49.0], [-95.15, 49.0], [-95.15, 49.38], [-94.8, 49.3], [-94.6, 48.7],
  [-93.0, 48.6], [-91.5, 48.1], [-89.6, 48.0], [-90.5, 47.65], [-91.67, 47.02], [-92.1, 46.78], [-91.2, 46.85],
  [-90.8, 46.9], [-90.4, 46.55], [-89.0, 46.85], [-88.4, 47.3], [-87.6, 46.9], [-87.4, 46.5], [-86.5, 46.5],
  [-85.0, 46.75], [-84.5, 46.45], [-83.95, 46.0], [-84.7, 45.87], [-85.5, 46.05], [-86.3, 45.9], [-87.0, 45.7],
  [-87.6, 45.1], [-88.0, 44.55], [-87.0, 45.25], [-87.5, 44.5], [-87.9, 43.0], [-87.6, 41.85], [-87.2, 41.65],
  [-86.5, 42.1], [-86.25, 43.0], [-86.5, 44.0], [-86.2, 44.7], [-85.6, 45.15], [-85.0, 45.4], [-84.73, 45.78],
  [-83.5, 45.3], [-83.3, 44.3], [-83.9, 43.7], [-82.9, 44.05], [-82.45, 43.0], [-82.6, 42.6], [-83.1, 42.3],
  [-83.45, 41.7], [-82.7, 41.5], [-81.7, 41.5], [-80.5, 41.97], [-78.9, 42.85], [-79.0, 43.25], [-77.5, 43.3],
  [-76.2, 43.55], [-76.3, 44.1], [-75.3, 44.85], [-74.7, 45.0], [-71.5, 45.0], [-70.8, 45.4], [-70.4, 45.9],
  [-70.0, 46.7], [-69.2, 47.45], [-68.3, 47.35], [-67.8, 47.07], [-67.8, 45.7], [-67.4, 45.15], [-67.0, 44.8],
  [-68.2, 44.3], [-69.0, 44.0], [-70.2, 43.6], [-70.7, 43.0], [-70.6, 42.65], [-71.0, 42.35], [-70.6, 41.95],
  [-70.0, 42.05], [-69.95, 41.7], [-70.5, 41.55], [-71.2, 41.5], [-71.5, 41.3], [-72.0, 41.3], [-72.9, 41.25],
  [-71.9, 41.07], [-73.9, 40.58], [-74.0, 40.4], [-74.1, 39.75], [-74.9, 38.95], [-75.1, 38.8], [-75.05, 38.45],
  [-75.35, 37.9], [-75.95, 37.15], [-76.0, 36.95], [-75.75, 36.0], [-75.5, 35.25], [-76.5, 34.7], [-77.9, 33.9],
  [-79.0, 33.4], [-79.9, 32.7], [-80.9, 32.0], [-81.4, 30.7], [-81.4, 30.0], [-80.6, 28.5], [-80.05, 26.8],
  [-80.15, 25.8], [-80.4, 25.2], [-81.1, 25.15], [-81.8, 26.1], [-82.65, 27.5], [-82.75, 27.8], [-82.7, 28.9],
  [-83.7, 29.9], [-84.3, 29.9], [-85.3, 29.65], [-86.5, 30.4], [-87.5, 30.3], [-88.0, 30.25], [-89.3, 30.3],
  [-89.4, 29.2], [-90.2, 29.1], [-91.3, 29.3], [-92.3, 29.55], [-93.8, 29.7], [-94.7, 29.35], [-95.9, 28.6],
  [-97.2, 27.6], [-97.15, 25.95], [-99.1, 26.4], [-99.5, 27.5], [-100.3, 28.3], [-100.7, 29.1], [-101.4, 29.77],
  [-102.3, 29.88], [-102.7, 29.7], [-103.1, 28.98], [-104.5, 29.6], [-104.9, 30.6], [-106.5, 31.78],
  [-108.2, 31.78], [-108.2, 31.33], [-111.07, 31.33], [-114.8, 32.5], [-117.12, 32.53], [-117.3, 33.1],
  [-118.3, 33.7], [-118.5, 34.03], [-119.2, 34.15], [-120.5, 34.45], [-120.65, 35.15], [-121.9, 36.6],
  [-122.5, 37.8], [-123.0, 38.0], [-123.7, 38.95], [-124.35, 40.3], [-124.1, 41.0], [-124.2, 42.0],
  [-124.5, 42.8], [-124.1, 44.0], [-123.95, 46.2], [-124.1, 46.9],
];

function pointInPoly(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

let _map = null;
function usMap() {
  if (_map) return _map;
  const proj = US_OUTLINE.map(([lo, la]) => albers(lo, la));
  const xs = proj.map((p) => p[0]);
  const ys = proj.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const W = 1000;
  const pad = 22;
  const scale = (W - pad * 2) / (maxX - minX);
  const H = Math.round((maxY - minY) * scale + pad * 2);
  const toXY = ([x, y]) => [pad + (x - minX) * scale, pad + (maxY - y) * scale];

  const poly = proj.map(toXY);
  const step = 12.4;
  let d = '';
  let count = 0;
  for (let y = pad; y <= H - pad; y += step) {
    for (let x = pad; x <= W - pad; x += step) {
      // offset alternate rows for a honeycomb feel
      const xx = x + (Math.round((y - pad) / step) % 2 ? step / 2 : 0);
      if (pointInPoly([xx, y], poly)) {
        d += `M${f(xx)} ${f(y)}h0`;
        count++;
      }
    }
  }
  const outline = 'M' + poly.map((p) => `${f(p[0])} ${f(p[1])}`).join('L') + 'Z';
  const pt = (code) => {
    const a = byCode[code];
    return toXY(albers(a.lon, a.lat));
  };
  _map = { W, H, d, count, outline, pt };
  return _map;
}

/** Quadratic arc path between two airports in map space. */
function arc(a, b, lift = 0.2) {
  const m = usMap();
  const [x1, y1] = m.pt(a);
  const [x2, y2] = m.pt(b);
  const dist = Math.hypot(x2 - x1, y2 - y1);
  let px = (y2 - y1) / dist;
  let py = -(x2 - x1) / dist;
  if (py > 0 || (Math.abs(py) < 0.2 && px < 0)) { px = -px; py = -py; }
  const cx = (x1 + x2) / 2 + px * dist * lift;
  const cy = (y1 + y2) / 2 + py * dist * lift;
  return { d: `M${f(x1)} ${f(y1)}Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)}`, x1, y1, x2, y2 };
}

/** The full animated route-map SVG used on the home page and routes hub. */
function routeMapSvg(pairs, idPrefix = 'map') {
  const m = usMap();
  const pins = new Set();
  pairs.forEach(([a, b]) => { pins.add(a); pins.add(b); });
  const arcs = pairs
    .map(([a, b], i) => {
      const r = arc(a, b, 0.16 + (i % 3) * 0.04);
      return `<g class="map-route" data-from="${a}" data-to="${b}">
        <path class="map-arc-bg" d="${r.d}"/>
        <path class="map-arc" d="${r.d}" pathLength="1"/>
        <use class="map-plane" href="#plane-top" width="22" height="22" x="-11" y="-11"/>
      </g>`;
    })
    .join('');
  const pinEls = [...pins]
    .map((code) => {
      const [x, y] = m.pt(code);
      const a = byCode[code];
      const right = x < 800;
      return `<g class="map-pin" transform="translate(${f(x)} ${f(y)})">
        <circle class="map-pin-pulse" r="6"/>
        <circle class="map-pin-dot" r="4"/>
        <text class="map-pin-label" x="${right ? 11 : -11}" y="4" text-anchor="${right ? 'start' : 'end'}">${code}<tspan class="map-pin-city" dx="6">${a.city}</tspan></text>
      </g>`;
    })
    .join('');
  return `<svg class="route-map-svg" viewBox="0 0 ${m.W} ${m.H}" role="img" aria-label="Map of the contiguous United States with example private jet routes between major business-aviation airports">
    <defs>
      <clipPath id="${idPrefix}-sweep"><rect class="map-sweep" x="0" y="0" width="${m.W}" height="${m.H}"/></clipPath>
      <linearGradient id="${idPrefix}-arcg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8cf93"/><stop offset="1" stop-color="#c8a45c"/></linearGradient>
    </defs>
    <g clip-path="url(#${idPrefix}-sweep)"><path class="map-dots" d="${m.d}"/></g>
    ${arcs}
    ${pinEls}
  </svg>`;
}

module.exports = { cabinPlan, usMap, routeMapSvg, arc };
