'use strict';
/** Fleet hub and one page per aircraft class. */
const cfg = require('../config');
const S = require('../lib/sections');
const B = require('../lib/blocks');
const { pageHero, faqBlock, ctaBand, head, btn, linkArrow, icon, img, money, roundTo, hm, esc } = require('../lib/ui');
const { schemas } = require('../lib/layout');
const { preload } = require('../lib/img');
const { pick } = require('../data/faqs');
const { classes } = require('../data/fleet');
const { routes } = require('../data/routes');
const { estimate } = require('../lib/estimate');

const crumbs = (...items) => [{ name: 'Home', path: '/' }, ...items.map(([name, path]) => ({ name, path }))];
const quoteBtn = btn('~/instant-quote/', 'Get an instant quote');
const callBtn = `<a class="btn btn-ghost" href="tel:${cfg.phoneHref}">${icon('phone')}<span>${cfg.phone}</span></a>`;
const rate = (c) => `${money(c.rate[0])} to ${money(c.rate[1])}`;
const mi = (n) => `${n.toLocaleString('en-US')} mi`;
const singular = (c) => c.name.replace(/s$/, '');

/** Editorial copy that is unique to each class (kept short, factual and non-promissory). */
const DETAIL = {
  light: {
    h1: 'Light jet charter: 4 to 7 seats, from $3,500 an hour',
    title: 'Light Jet Charter: Seats, Range and Hourly Rates',
    desc: 'Light jets seat four to seven, cruise at about 440 mph and cost roughly $3,500 to $5,000 per flight hour. See range, cabin size, example models and sample prices.',
    paras: [
      'Light jets are the entry point to private jet charter, and for trips of up to about three hours they are usually the most economical way to fly with up to six people. Cabins are compact, with club seating rather than standing room, but the aircraft are quick, efficient and able to use short runways that larger jets cannot.',
      'That runway access is the real advantage. A light jet can often land at a small airport ten minutes from your destination while a larger jet would have to use a bigger field an hour away by road.',
    ],
    missions: ['Weekend trips under three hours', 'Same-day business round trips', 'Regional airports with shorter runways', 'Small groups travelling light'],
    know: ['Baggage space is limited, so soft bags travel better than hard cases.', 'Most light jets have a basic or no enclosed lavatory. Ask if that matters for your flight time.', 'Non-stop range is around 2,000 miles, so coast to coast needs a larger aircraft.'],
  },
  midsize: {
    h1: 'Midsize jet charter: 6 to 9 seats, from $4,500 an hour',
    title: 'Midsize Jet Charter: Seats, Range and Hourly Rates',
    desc: 'Midsize jets seat six to nine with a stand-up cabin on most models and cost roughly $4,500 to $6,500 per flight hour. See range, example models and sample prices.',
    paras: [
      'Midsize jets are the most common choice for domestic charter. Most models have a stand-up cabin, a proper lavatory and enough space for a team or a family to spread out, and they can reach most US city pairs non-stop.',
      'They sit in a useful middle ground on cost. You pay more per hour than a light jet, but for a flight of two to four hours the extra room and range are usually worth it, and the hourly rate is well below the heavy-jet class.',
    ],
    missions: ['Business teams of six to eight', 'Family trips with luggage and ski gear', 'Flights of two to four hours', 'Mountain destinations such as Aspen and Jackson Hole'],
    know: ['Some coast-to-coast trips need a fuel stop, which adds time.', 'High-elevation airports can limit weight, so tell your advisor about passengers and bags.', 'Cabin height and layout vary a lot between models, so ask for the specific aircraft.'],
  },
  'super-midsize': {
    h1: 'Super-midsize jet charter: 8 to 10 seats, from $6,000 an hour',
    title: 'Super-Midsize Jet Charter: Seats, Range, Rates',
    desc: 'Super-midsize jets offer a wide cabin and true coast-to-coast range for eight to ten passengers, at roughly $6,000 to $8,500 per flight hour. See models and prices.',
    paras: [
      'Super-midsize jets have wider and taller cabins than midsize aircraft, a full galley on most models and enough range to fly most transcontinental routes without stopping. For executive teams that want to work on board, this is often the sweet spot.',
      'They cost noticeably more per hour than a midsize jet, so they make most sense for longer flights, larger groups or trips where cabin comfort is part of the point.',
    ],
    missions: ['Coast-to-coast flights', 'Executive teams that work on board', 'Groups of eight to ten', 'Longer flights where cabin width matters'],
    know: ['They need longer runways than light and midsize jets, so some small airports are out.', 'A full galley is common but not universal, so ask about catering when you book.', 'For a short hop of an hour or less, a smaller aircraft is usually better value.'],
  },
  heavy: {
    h1: 'Heavy jet charter: 10 to 16 seats, from $8,500 an hour',
    title: 'Heavy Jet Charter: Seats, Range and Hourly Rates',
    desc: 'Heavy jets seat ten to sixteen with distinct cabin zones and long range, at roughly $8,500 to $12,000 per flight hour. See range, example models and sample prices.',
    paras: [
      'Heavy jets are built for larger groups and longer flights. Cabins are divided into zones for working, dining and resting, and many have a crew rest area and a large baggage hold that takes skis, golf bags and oversized items.',
      'The range is enough to cross the country, and with a stop to reach Europe, which makes heavy jets a practical choice for teams that need to arrive ready to work.',
    ],
    missions: ['Corporate groups of ten or more', 'Sports teams and touring parties', 'Long domestic flights and short international trips', 'Trips that need a sleeping or meeting area'],
    know: ['Hourly rates are high, so check whether a super-midsize cabin would do the job.', 'Fewer heavy jets are available at short notice, especially in peak weeks.', 'Some mountain and island airports cannot take larger aircraft.'],
  },
  'ultra-long-range': {
    h1: 'Ultra-long-range jet charter: from $11,000 an hour',
    title: 'Ultra-Long-Range Jet Charter: Seats, Range, Rates',
    desc: 'Ultra-long-range jets fly 7,000 miles non-stop with flagship cabins for ten to sixteen, at roughly $11,000 to $15,000 per flight hour. See models and sample prices.',
    paras: [
      'Ultra-long-range jets are the flagships of private aviation. They can fly non-stop across the Atlantic and many Pacific routes, with the largest, quietest cabins, multiple living areas and sleeping layouts.',
      'They are more aircraft than most domestic trips need, but for an intercontinental flight, where a fuel stop or a cramped cabin would add hours, the premium can be justified. There are fewer of these aircraft, so book early.',
    ],
    missions: ['Transatlantic and transpacific flights', 'Overnight flights where you need to sleep', 'Executive travel where cabin quality matters most', 'Long non-stop flights from the US to Europe, Asia or the Middle East'],
    know: ['Customs, overflight permits and international handling add lead time, so start early.', 'Pricing swings widely between operators and aircraft age.', 'Availability is tight in peak seasons, so flexibility on dates helps.'],
  },
  turboprop: {
    h1: 'Turboprop charter: the economical short-hop aircraft',
    title: 'Turboprop Charter: Seats, Range and Hourly Rates',
    desc: 'Turboprops seat four to nine, use short runways and cost roughly $2,200 to $3,200 per flight hour, the lowest of any class. See models and sample prices.',
    paras: [
      'Turboprops are the economical choice for short trips. Single-engine models such as the Pilatus PC-12 and twin-engine King Airs can use short runways and remote airfields, and for a flight of under about ninety minutes the lower speed costs you little time.',
      'Cabins are often roomier than a light jet for the money, and a large rear baggage compartment is common. Turboprops are popular for island and mountain hops and for regional business travel.',
    ],
    missions: ['Island hops such as Boston to Nantucket', 'Short regional business trips', 'Short-runway and mountain airfields', 'Lowest-cost private option under ninety minutes'],
    know: ['Cruise speed is around 300 mph, so longer flights take noticeably more time.', 'Range is limited to about 1,700 miles.', 'Cabin noise and ride feel are different from a jet, which some passengers notice.'],
  },
};

function specs(c) {
  const items = [
    ['users', 'Passengers', c.paxLabel],
    ['route', 'Typical range', mi(c.range)],
    ['gauge', 'Cruise speed', `${c.speed} mph`],
    ['tag', 'Hourly rate', rate(c)],
    ['luggage', 'Baggage', c.bags],
    ['sparkle', 'Cabin', c.cabin],
  ];
  return `<section class="section section--ink specs-section" data-waypoint="Specs" aria-labelledby="sp-h"><div class="container">
    ${head({ kicker: 'At a glance', title: `${c.name}: key specifications`, lede: 'Typical figures for the class. Individual aircraft vary, and your quote names the exact model.', id: 'sp-h' })}
    <dl class="specs" data-stagger>${items.map(([i, k, v]) => `<div class="spec">${icon(i)}<dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
  </div></section>`;
}

function sampleRoutes(c) {
  const rows = routes
    .map((r) => ({ r, e: estimate(r.a, r.b, c) }))
    .filter(({ e }) => !e.fuelStop && e.miles > 150)
    .slice(0, 6)
    .map(({ r, e }) => [`<a href="~/routes/${r.slug}/">${r.a.city} to ${r.b.city}</a>`, mi(e.miles), hm(e.hours), `${money(roundTo(e.low, 500))} to ${money(roundTo(e.high, 500))}`]);
  if (!rows.length) return '';
  return `<section class="section section--paper" data-waypoint="Prices" aria-labelledby="pr-h"><div class="container container--narrow">
    ${head({ kicker: 'Sample prices', title: `Example one-way prices in a ${singular(c).toLowerCase()}`, lede: 'Calculated with the same estimator as our instant quote. Includes an allowance for airport fees and federal excise tax on domestic flights.', id: 'pr-h' })}
    <div data-reveal>${B.table(['Route', 'Distance', 'Flight time', 'Estimated price'], rows)}</div>
    <p class="fine" data-reveal>Market ranges for planning, not an offer. Real quotes depend on the operator, aircraft, date and positioning.</p>
  </div></section>`;
}

function proscons(c) {
  return `<section class="section section--paper section--tight" data-waypoint="Pros and cons" aria-labelledby="pc-h"><div class="container">
    ${head({ kicker: 'Honest view', title: `Pros and cons of a ${singular(c).toLowerCase()}`, id: 'pc-h' })}
    <div class="proscons" data-stagger>
      <div class="pc pc--pro"><h3>${icon('check')} Strengths</h3><ul>${c.pros.map((p) => `<li>${p}</li>`).join('')}</ul></div>
      <div class="pc pc--con"><h3>${icon('alert')} Trade-offs</h3><ul>${c.cons.map((p) => `<li>${p}</li>`).join('')}</ul></div>
    </div>
  </div></section>`;
}

function neighbours(c) {
  const i = classes.indexOf(c);
  const prev = classes[(i + classes.length - 1) % classes.length];
  const next = classes[(i + 1) % classes.length];
  const card = (x, dir) => `<a class="pcard" href="~/fleet/${x.slug}/" data-tilt><div class="pcard-media">${img(x.photo, { sizes: '(min-width: 800px) 40vw, 100vw', widths: [480, 800, 1200] })}<span class="pcard-tag">${dir}</span></div><div class="pcard-body"><h3>${x.name}</h3><p>${x.blurb}</p><ul class="pcard-meta"><li>${x.paxLabel} seats</li><li>${mi(x.range)}</li><li>from ${money(x.rate[0])}/hr</li></ul><span class="pcard-go">${icon('arrow-up-right')}</span></div></a>`;
  return `<section class="section section--ink" data-waypoint="Compare" aria-labelledby="nb-h"><div class="container">
    ${head({ kicker: 'Keep comparing', title: 'Other aircraft classes', id: 'nb-h' })}
    <div class="grid grid-2" data-stagger>${card(prev, 'Smaller or larger')}${card(next, 'Next class')}</div>
    <div class="sec-foot" data-reveal>${linkArrow('~/fleet/', 'Compare all six classes')}</div>
  </div></section>`;
}

function classPage(c) {
  const d = DETAIL[c.id];
  const path = `/fleet/${c.slug}/`;
  const faqs = pick('cost', 'how-fast', 'airports', 'bags', 'pets', 'wifi').slice(0, 5);
  const body = [
    pageHero({
      kicker: `Aircraft class · ${c.paxLabel} seats`,
      h1: d.h1,
      lede: c.blurb + ' ' + c.best,
      photo: c.photo,
      crumbs: crumbs(['Fleet', '/fleet/'], [c.name, path]),
      ctas: quoteBtn + callBtn,
      chips: [`${c.paxLabel} seats`, `${mi(c.range)} range`, `${c.speed} mph cruise`],
    }),
    specs(c),
    B.split({
      kicker: 'Overview',
      title: `What to expect from a ${singular(c).toLowerCase()}`,
      paras: d.paras,
      list: d.missions,
      photo: c.cabinPhoto,
      photo2: c.photo,
      cta: quoteBtn,
      id: 'ov-h',
      waypoint: 'Overview',
    }),
    proscons(c),
    `<section class="section section--ink" data-waypoint="Models" aria-labelledby="md-h"><div class="container container--narrow">
      ${head({ kicker: 'Example models', title: `Aircraft you might fly in this class`, lede: 'Models change with market availability. These are typical examples, not a promise that a specific tail number is free on your date.', id: 'md-h' })}
      <ul class="models" data-stagger>${c.examples.map((m) => `<li><span class="models-ico">${icon('plane')}</span><b>${m}</b></li>`).join('')}</ul>
      <h3 class="know-h" data-reveal>Good to know</h3>
      <ul class="check-list" data-stagger>${d.know.map((k) => `<li>${icon('check')}<span>${k}</span></li>`).join('')}</ul>
    </div></section>`,
    sampleRoutes(c),
    `<section class="section section--ink est-section" data-waypoint="Estimate" aria-labelledby="est-h"><div class="container">
      ${head({ kicker: 'Instant estimate', title: 'Price your own trip', id: 'est-h' })}
      <div data-reveal>${S.estimator({ from: 'TEB', to: 'PBI' })}</div>
    </div></section>`,
    neighbours(c),
    faqBlock(faqs, { title: `${c.name}: common questions` }),
    ctaBand({ photo: 'jetRunwayA' }),
    S.skvData(),
  ].join('\n');
  return {
    path,
    title: d.title,
    description: d.desc,
    body,
    ogPhoto: c.photo,
    headerMode: 'over',
    breadcrumbs: crumbs(['Fleet', '/fleet/'], [c.name, path]),
    preload: [preload(c.photo)],
    schema: [
      schemas.serviceSchema({ name: `${c.name} charter`, description: d.desc, path, serviceType: 'Private jet charter' }),
      schemas.faqSchema(faqs),
    ],
  };
}

function hub() {
  const path = '/fleet/';
  const faqs = pick('cost', 'airports', 'bags', 'wifi', 'catering');
  const max = Math.max(...classes.map((c) => c.range));
  const bars = classes
    .map(
      (c) => `<li><a href="~/fleet/${c.slug}/"><span class="bar-l">${c.name}</span><span class="bar-t"><i data-bar style="--w:${Math.round((c.range / max) * 100)}%"></i></span><b>${mi(c.range)}</b></a></li>`
    )
    .join('');
  const rows = classes.map((c) => [`<a href="~/fleet/${c.slug}/">${c.name}</a>`, c.paxLabel, mi(c.range), `${c.speed} mph`, rate(c), c.bags]);
  const body = [
    pageHero({
      kicker: 'The fleet',
      h1: 'Private jet fleet: compare every aircraft class',
      lede: 'Six classes of aircraft, from turboprops that use short mountain runways to ultra-long-range jets that cross oceans. Compare seats, range, speed and hourly rates side by side.',
      photo: 'jetsDramatic',
      crumbs: crumbs(['Fleet', path]),
      ctas: quoteBtn + callBtn,
      chips: ['6 aircraft classes', 'Typical 2026 rates', 'Real cabin photos on every quote'],
    }),
    `<section class="section section--paper" data-waypoint="Classes" aria-labelledby="cl-h"><div class="container">
      ${head({ kicker: 'Choose a class', title: 'Which aircraft is right for your trip?', lede: 'Rule of thumb: pick the smallest class that fits your passengers, bags and distance. Bigger cabins cost more per hour.', id: 'cl-h' })}
      ${S.fleetGrid()}
    </div></section>`,
    `<section class="section section--ink" data-waypoint="Range" aria-labelledby="rg-h"><div class="container container--narrow">
      ${head({ kicker: 'Range at a glance', title: 'How far each class can fly non-stop', lede: 'Typical maximum range. Plan for about 90 percent of this on a real trip, with reserves and weather.', id: 'rg-h' })}
      <ul class="bars" data-bars>${bars}</ul>
    </div></section>`,
    `<section class="section section--paper" data-waypoint="Compare" aria-labelledby="tb-h"><div class="container">
      ${head({ kicker: 'Side by side', title: 'Fleet comparison table', id: 'tb-h' })}
      <div data-reveal>${B.table(['Class', 'Seats', 'Range', 'Cruise', 'Hourly rate', 'Baggage'], rows)}</div>
      <p class="fine" data-reveal>Indicative 2026 market figures. Individual aircraft and operators vary.</p>
    </div></section>`,
    B.features({
      kicker: 'How to choose',
      title: 'Four questions that pick the aircraft',
      items: [
        ['users', 'How many people?', 'Count passengers honestly, including children. Add one size up if people want to spread out and work.'],
        ['route', 'How far is the flight?', 'Under three hours, light and midsize jets are usually best. Coast to coast, look at super-midsize and larger.'],
        ['luggage', 'What are you bringing?', 'Skis, golf bags, pets and event gear all affect which aircraft fits, and weight limits matter at mountain airports.'],
        ['pin', 'Where are you landing?', 'Short runways and high-elevation airports rule out some aircraft. Your advisor checks this for you.'],
      ],
      cols: 4,
      tone: 'ink',
      id: 'ch-h',
    }),
    faqBlock(faqs, { title: 'Fleet questions' }),
    ctaBand({ photo: 'jetRunwayC' }),
    S.skvData(),
  ].join('\n');
  return {
    path,
    title: 'Private Jet Fleet: Compare Aircraft, Range and Rates',
    description: 'Compare six private jet classes by seats, range, speed and hourly rate, from turboprops to ultra-long-range jets. Find the right aircraft for your trip.',
    body,
    ogPhoto: 'jetsDramatic',
    headerMode: 'over',
    breadcrumbs: crumbs(['Fleet', path]),
    preload: [preload('jetsDramatic')],
    schema: [
      schemas.itemListSchema('Private jet aircraft classes', classes.map((c) => ({ name: c.name, path: `/fleet/${c.slug}/` }))),
      schemas.faqSchema(faqs),
    ],
  };
}

module.exports = () => [hub(), ...classes.map(classPage)];
