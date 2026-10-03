'use strict';
/**
 * SAMPLE empty-leg listings. Replace with a live feed (CRM, operator API or a JSON file you update).
 * Dates are expressed as day offsets from "today" and resolved in the browser, so the sample never looks stale.
 * Prices are derived from the indicative estimator with a sample discount, they are not real offers.
 */
const { byCode } = require('./airports');
const { classById } = require('./fleet');
const { estimate } = require('../lib/estimate');
const { roundTo } = require('../lib/util');

const raw = [
  { from: 'TEB', to: 'PBI', cls: 'light', day: 1, time: '09:30', seats: 6, off: 0.45, region: 'East' },
  { from: 'OPF', to: 'TEB', cls: 'midsize', day: 2, time: '14:00', seats: 8, off: 0.4, region: 'East' },
  { from: 'VNY', to: 'LAS', cls: 'light', day: 1, time: '18:15', seats: 6, off: 0.5, region: 'West' },
  { from: 'ASE', to: 'DAL', cls: 'super-midsize', day: 3, time: '11:00', seats: 9, off: 0.4, region: 'Mountain' },
  { from: 'PWK', to: 'APF', cls: 'midsize', day: 3, time: '08:45', seats: 7, off: 0.45, region: 'Midwest' },
  { from: 'BED', to: 'ACK', cls: 'turboprop', day: 2, time: '16:30', seats: 6, off: 0.35, region: 'East' },
  { from: 'SFO', to: 'VNY', cls: 'light', day: 2, time: '07:30', seats: 5, off: 0.5, region: 'West' },
  { from: 'HOU', to: 'ASE', cls: 'super-midsize', day: 4, time: '10:20', seats: 9, off: 0.4, region: 'Mountain' },
];

const emptyLegs = raw.map((r) => {
  const a = byCode[r.from], b = byCode[r.to], c = classById[r.cls];
  const est = estimate(a, b, c);
  return { ...r, a, b, c, miles: est.miles, hours: est.hours, price: roundTo(est.low * (1 - r.off), 100), was: roundTo(est.low, 100) };
});

module.exports = { emptyLegs };
