'use strict';
/** Routes hub and one programmatic-but-unique page per route. */
const cfg = require('../config');
const S = require('../lib/sections');
const B = require('../lib/blocks');
const { pageHero, faqBlock, ctaBand, head, btn, linkArrow, icon, img, money, roundTo, hm, esc, photoCard } = require('../lib/ui');
const { schemas } = require('../lib/layout');
const { preload } = require('../lib/img');
const { pick } = require('../data/faqs');
const { classes } = require('../data/fleet');
const { routes } = require('../data/routes');
const { airports } = require('../data/airports');
const { estimate } = require('../lib/estimate');

const crumbs = (...items) => [{ name: 'Home', path: '/' }, ...items.map(([name, path]) => ({ name, path }))];
const mi = (n) => `${n.toLocaleString('en-US')} mi`;
const singular = (c) => c.name.replace(/s$/, '');
const range = (e, to = 500) => `${money(roundTo(e.low, to))} to ${money(roundTo(e.high, to))}`;
const order = ['turboprop', 'light', 'midsize', 'super-midsize', 'heavy', 'ultra-long-range'];

/** Theme used for the filter chips on the hub. */
function theme(r) {
  if (['ASE', 'JAC', 'EGE', 'SUN'].includes(r.to) || ['ASE', 'JAC'].includes(r.from)) return 'Ski and mountain';
  if (['OPF', 'PBI', 'NAS', 'SJD', 'ACK', 'HTO', 'LAS'].includes(r.to)) return 'Beach, islands and getaways';
  return 'Business corridors';
}

function routeFaqs(r) {
  const e = r.recEst;
  const c = r.rec;
  const list = [
    {
      q: `How long is a private jet flight from ${r.a.city} to ${r.b.city}?`,
      a: `The ${r.a.code} to ${r.b.code} distance is about ${mi(r.miles)}. In a ${singular(c).toLowerCase()} that is roughly ${hm(e.hours)} of flight time including taxi, climb and descent. Headwinds, routing and air traffic can add or remove a few minutes.`,
    },
    {
      q: `How much does it cost to charter a private jet from ${r.a.city} to ${r.b.city}?`,
      a: `As a planning guide, a one-way charter in a ${singular(c).toLowerCase()} typically costs about ${range(e)}, including an allowance for airport fees${e.intl ? '' : ' and the 7.5% federal excise tax'}. Prices move with demand, the operator, the date and whether the aircraft has to reposition, so ask for a firm quote.`,
    },
    {
      q: `Which airports does a ${r.a.city} to ${r.b.city} charter use?`,
      a: `This route is priced between ${r.a.name} (${r.a.code}) and ${r.b.name} (${r.b.code}). Private jets can often use nearby alternatives, and your advisor can compare them for ground time and runway fit.`,
    },
  ];
  if (e.intl) {
    list.push({
      q: `Do I need a passport to fly from ${r.a.city} to ${r.b.city}?`,
      a: 'Yes. This is an international flight, so every passenger needs a valid passport and any required entry documents. Your advisor collects passenger details ahead of time so customs and immigration go smoothly on both ends.',
    });
  }
  return [...list, ...pick('airports', 'cancel')];
}

function classTable(r) {
  const rows = r.byClass.map((x) => {
    const c = x.cls;
    const tooSmall = r.typicalPax > c.pax[1];
    const tooFar = x.miles > c.range * 0.9;
    const rec = c.id === r.rec.id;
    let note = 'Fits comfortably';
    if (tooSmall) note = `Seats up to ${c.pax[1]}`;
    else if (tooFar) note = 'Likely needs a fuel stop';
    else if (rec) note = 'Suggested for this route';
    return { c, x, rec, ok: !tooSmall && !tooFar, row: [`<a href="~/fleet/${c.slug}/">${c.name}</a>`, c.paxLabel, hm(x.hours), range(x), note] };
  });
  return `<div class="table-wrap" data-reveal><table class="data-table data-table--classes"><thead><tr><th>Aircraft class</th><th>Seats</th><th>Flight time</th><th>Estimated one way</th><th>Notes</th></tr></thead><tbody>${rows
    .map(({ rec, ok, row }) => `<tr class="${rec ? 'is-rec' : ''}${ok ? '' : ' is-dim'}">${row.map((cell, i) => (i === 0 ? `<th scope="row">${cell}</th>` : `<td>${cell}</td>`)).join('')}</tr>`)
    .join('')}</tbody></table></div>`;
}

function airportCards(r) {
  const card = (a, role) => `<article class="apt" data-tilt><span class="apt-code">${a.code}</span><div><p class="apt-role">${role}</p><h3>${esc(a.name)}</h3><p>${esc(a.city)}${a.region ? ', ' + esc(a.region) : ''}</p></div></article>`;
  return `<div class="apts" data-stagger>${card(r.a, 'Departure airport')}<span class="apts-arrow" aria-hidden="true">${icon('plane')}</span>${card(r.b, 'Arrival airport')}</div>`;
}

function related(r) {
  const rel = routes
    .filter((x) => x.slug !== r.slug)
    .map((x) => ({ x, s: (x.from === r.from ? 3 : 0) + (x.to === r.to ? 3 : 0) + (x.to === r.from || x.from === r.to ? 2 : 0) + (x.b.city === r.b.city ? 2 : 0) + (x.photo === r.photo ? 0 : 0) }))
    .sort((p, q) => q.s - p.s)
    .slice(0, 3)
    .map((o) => o.x);
  return `<section class="section section--paper" data-waypoint="More routes" aria-labelledby="rl-h"><div class="container">
    ${head({ kicker: 'More routes', title: 'Related private jet routes', id: 'rl-h' })}
    <div class="grid grid-3" data-stagger>${rel.map((x) => S.routeCard(x)).join('')}</div>
    <div class="sec-foot" data-reveal>${linkArrow('~/routes/', 'See all routes')}</div>
  </div></section>`;
}

function routePage(r) {
  const path = `/routes/${r.slug}/`;
  const e = r.recEst;
  const c = r.rec;
  const faqs = routeFaqs(r);
  const quoteHref = `~/instant-quote/?from=${r.from}&to=${r.to}&pax=${r.typicalPax}`;
  const h1 = `${r.a.city} to ${r.b.city} private jet charter`;
  const lede = `${mi(r.miles)}, about ${hm(e.hours)} in the air. A one-way charter in a ${singular(c).toLowerCase()} typically costs ${range(e)}.`;
  const facts = [
    ['route', 'Distance', mi(r.miles)],
    ['clock', 'Flight time', hm(e.hours)],
    ['plane', 'Suggested aircraft', singular(c)],
    ['tag', 'Estimated one way', range(e)],
  ];
  const body = [
    pageHero({
      kicker: `${r.a.code} to ${r.b.code}`,
      h1,
      lede,
      photo: r.photo,
      crumbs: crumbs(['Routes', '/routes/'], [`${r.a.city} to ${r.b.city}`, path]),
      ctas: btn(quoteHref, `Quote ${r.a.city} to ${r.b.city}`) + `<a class="btn btn-ghost" href="tel:${cfg.phoneHref}">${icon('phone')}<span>${cfg.phone}</span></a>`,
      chips: [mi(r.miles), hm(e.hours), `From ${money(roundTo(e.low, 100))}`],
    }),
    `<section class="section section--ink specs-section" data-waypoint="Route facts" aria-label="Route facts"><div class="container">
      <dl class="specs specs--4" data-stagger>${facts.map(([i, k, v]) => `<div class="spec">${icon(i)}<dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      <p class="fine" data-reveal>Distances are great-circle miles between the two airports. Flight time includes ${Math.round(0.35 * 60)} minutes for taxi, climb and descent. Prices are market-range estimates, not a quote.</p>
    </div></section>`,
    B.split({
      kicker: 'About this route',
      title: `Flying private from ${r.a.city} to ${r.b.city}`,
      paras: [r.note, `<strong>Best for:</strong> ${r.bestFor}`, `<strong>When it is busiest:</strong> ${r.season}`],
      photo: r.photoFrom,
      photo2: r.photo,
      cta: btn(quoteHref, 'Get a firm quote'),
      id: 'ab-h',
      waypoint: 'About',
    }),
    `<section class="section section--ink" data-waypoint="Airports" aria-labelledby="ap-h"><div class="container container--narrow">
      ${head({ kicker: 'Airports', title: 'Where you take off and land', lede: 'Private jets use business-aviation terminals, so you can usually be on board a few minutes after you arrive.', id: 'ap-h' })}
      ${airportCards(r)}
    </div></section>`,
    `<section class="section section--paper" data-waypoint="Prices" aria-labelledby="pt-h"><div class="container">
      ${head({ kicker: 'Price by aircraft', title: `${r.a.city} to ${r.b.city} charter prices by aircraft class`, lede: `Planning range for ${r.typicalPax} passengers, one way. Round trips usually cost about twice as much, less if the aircraft can wait, and empty legs can cut the price.`, id: 'pt-h' })}
      ${classTable(r)}
      <p class="fine" data-reveal>Includes an allowance for airport fees (${money(450)} to ${money(1600)})${e.intl ? '' : ' and the 7.5% federal excise tax'}. Catering, ground transport and de-icing are extra.</p>
    </div></section>`,
    B.features({
      kicker: 'Planning tips',
      title: `Tips for ${r.a.city} to ${r.b.city}`,
      items: [
        ...r.tips.map((t, i) => [i === 0 ? 'sparkle' : 'bell', i === 0 ? 'Good to know' : 'Plan ahead', t]),
        ['clock', 'Timing', 'Arrive about 15 minutes before departure. Your advisor confirms the exact terminal and tail number the day before.'],
      ],
      tone: 'ink',
      id: 'tp-h',
    }),
    `<section class="section section--paper est-section" data-waypoint="Estimate" aria-labelledby="est-h"><div class="container">
      ${head({ kicker: 'Instant estimate', title: 'Change the passengers or aircraft', lede: 'Adjust the trip and see the planning price update.', id: 'est-h' })}
      <div data-reveal>${S.estimator({ from: r.from, to: r.to })}</div>
    </div></section>`,
    related(r),
    faqBlock(faqs, { title: `${r.a.city} to ${r.b.city}: your questions answered` }),
    ctaBand({ title: `Fly ${r.a.city} to ${r.b.city}`, photo: r.photoFrom }),
    S.skvData(),
  ].join('\n');
  return {
    path,
    title: (() => {
      const full = `${r.a.city} to ${r.b.city} Private Jet Charter: Price, Time`;
      return full.length + cfg.name.length + 3 <= 66 ? full : `${r.a.city} to ${r.b.city} Private Jet Charter`;
    })(),
    description: `Charter a private jet from ${r.a.city} to ${r.b.city}: ${mi(r.miles)}, about ${hm(e.hours)}, from ${money(roundTo(e.low, 100))} one way in a ${singular(c).toLowerCase()}. See prices by aircraft and get a quote.`.slice(0, 300),
    body,
    ogPhoto: r.photo,
    headerMode: 'over',
    breadcrumbs: crumbs(['Routes', '/routes/'], [`${r.a.city} to ${r.b.city}`, path]),
    preload: [preload(r.photo)],
    schema: [
      schemas.serviceSchema({ name: `${r.a.city} to ${r.b.city} private jet charter`, description: `${r.note}`, path }),
      schemas.faqSchema(faqs),
    ],
  };
}

function hub() {
  const path = '/routes/';
  const faqs = pick('cost', 'airports', 'how-fast', 'empty-leg', 'intl');
  const themes = ['All routes', 'Business corridors', 'Beach, islands and getaways', 'Ski and mountain'];
  const cards = routes.map((r) => `<div class="filter-item" data-region="${theme(r)}">${S.routeCard(r)}</div>`).join('');
  const aptRows = airports.map((a) => [`<b>${a.code}</b>`, esc(a.city), esc(a.name), a.region || '', a.intl ? 'International' : 'Domestic']);
  const body = [
    pageHero({
      kicker: 'Routes',
      h1: 'Private jet routes across the US: prices and flight times',
      lede: `${routes.length} popular city pairs with distance, flight time and indicative pricing, plus the freedom to fly between any two of thousands of US airports.`,
      photo: 'jetInFlight',
      crumbs: crumbs(['Routes', path]),
      ctas: btn('~/instant-quote/', 'Quote any route') + `<a class="btn btn-ghost" href="tel:${cfg.phoneHref}">${icon('phone')}<span>${cfg.phone}</span></a>`,
      chips: [`${routes.length} route guides`, `${airports.length} airports`, 'Any route on request'],
    }),
    `<section class="section section--paper" id="all-routes" data-waypoint="All routes" aria-labelledby="ar-h"><div class="container">
      ${head({ kicker: 'Route guides', title: 'Browse routes and see typical prices', lede: 'Each page shows distance, flight time, a price for every aircraft class, the airports and tips for the route. If your trip is not here, we can quote it in minutes.', id: 'ar-h' })}
      <div class="filters" role="group" aria-label="Filter routes" data-filters>${themes.map((t, i) => `<button type="button" class="chip-btn${i === 0 ? ' is-active' : ''}" data-filter="${i === 0 ? 'All' : t}">${t}</button>`).join('')}</div>
      <div class="grid grid-3 filter-grid" data-filter-grid>${cards}</div>
    </div></section>`,
    S.networkMap(),
    `<section class="section section--ink est-section" data-waypoint="Estimate" aria-labelledby="est-h"><div class="container">
      ${head({ kicker: 'Any route', title: 'Not listed? Price any two airports', id: 'est-h' })}
      <div data-reveal>${S.estimator({ from: 'TEB', to: 'PBI' })}</div>
    </div></section>`,
    `<section class="section section--paper" data-waypoint="Airports" aria-labelledby="ap-h"><div class="container">
      ${head({ kicker: 'Airports', title: 'Airports in our route estimator', lede: 'These are the business-aviation airports used for the instant estimate. Private jets can use thousands more, so ask for any airport you need.', id: 'ap-h' })}
      <div data-reveal>${B.table(['Code', 'City', 'Airport', 'State', 'Type'], aptRows)}</div>
    </div></section>`,
    faqBlock(faqs, { title: 'Route questions' }),
    ctaBand({ photo: 'nightCity' }),
    S.skvData(),
  ].join('\n');
  return {
    path,
    title: 'Private Jet Routes: Prices and Flight Times in the US',
    description: `Browse ${routes.length} popular private jet routes with distance, flight time and indicative price by aircraft class. Or price any two US airports instantly.`,
    body,
    ogPhoto: 'jetInFlight',
    headerMode: 'over',
    breadcrumbs: crumbs(['Routes', path]),
    preload: [preload('jetInFlight')],
    schema: [
      schemas.itemListSchema('Private jet routes', routes.map((r) => ({ name: `${r.a.city} to ${r.b.city}`, path: `/routes/${r.slug}/` }))),
      schemas.faqSchema(faqs),
    ],
  };
}

module.exports = () => [hub(), ...routes.map(routePage)];
