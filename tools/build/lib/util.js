'use strict';
/* Small shared helpers used by the page generator. No dependencies. */

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
const roundTo = (n, step = 100) => Math.round(n / step) * step;

/** Great-circle distance in statute miles. */
function haversine(a, b) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** 2h 45m style label from hours. */
function hm(hours) {
  const total = Math.round(hours * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/** Albers equal-area conic centred on the contiguous US. Returns [x,y] in radians-space. */
function albers(lon, lat) {
  const rad = Math.PI / 180;
  const phi1 = 29.5 * rad;
  const phi2 = 45.5 * rad;
  const phi0 = 37.5 * rad;
  const lam0 = -96 * rad;
  const n = (Math.sin(phi1) + Math.sin(phi2)) / 2;
  const C = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
  const rho0 = Math.sqrt(C - 2 * n * Math.sin(phi0)) / n;
  const phi = lat * rad;
  const lam = lon * rad;
  const rho = Math.sqrt(C - 2 * n * Math.sin(phi)) / n;
  const theta = n * (lam - lam0);
  return [rho * Math.sin(theta), rho0 - rho * Math.cos(theta)];
}

module.exports = { esc, slug, money, roundTo, haversine, hm, albers };
