'use strict';
/**
 * Indicative charter estimate. The SAME formula lives in assets/js/app.js (estimator),
 * keep the two in sync. All numbers are market ranges, not quotes.
 */
const { haversine } = require('./util');

const FEES = [450, 1600]; // landing, handling, FBO (catering and ground transport extra)
const FET = 0.075; // federal excise tax on domestic charter transportation (generally)
const TAXI_HOURS = 0.35; // taxi, climb and descent allowance

function estimate(a, b, cls) {
  const miles = haversine(a, b);
  const intl = !!(a.intl || b.intl);
  const hours = Math.max(1, miles / cls.speed + TAXI_HOURS);
  const tax = intl ? 0 : FET;
  const low = (hours * cls.rate[0] + FEES[0]) * (1 + tax);
  const high = (hours * cls.rate[1] + FEES[1]) * (1 + tax);
  const flightHours = miles / cls.speed + TAXI_HOURS;
  return {
    miles: Math.round(miles),
    hours: flightHours,
    low,
    high,
    fuelStop: miles > cls.range * 0.9,
    intl,
  };
}

/** Smallest class that fits passengers and (comfortably) the distance. */
function recommend(classes, miles, pax) {
  const order = ['turboprop', 'light', 'midsize', 'super-midsize', 'heavy', 'ultra-long-range'];
  const ranked = order.map((id) => classes.find((c) => c.id === id));
  // prefer jets over turboprop unless very short
  for (const c of ranked) {
    if (c.id === 'turboprop' && (miles > 450 || pax > 7)) continue;
    if (pax <= c.pax[1] && miles <= c.range * 0.9) return c;
  }
  return classes.find((c) => c.id === 'ultra-long-range');
}

module.exports = { estimate, recommend, FEES, FET, TAXI_HOURS };
