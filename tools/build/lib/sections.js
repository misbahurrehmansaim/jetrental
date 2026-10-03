'use strict';
/** Home-page sections and shared interactive blocks (estimator, quote form, route map, fleet gallery...). */
const { head, btn, linkArrow, faqBlock, ctaBand, photoCard, fromPrice, hm, money, roundTo, esc, icon, img, cfg, waLink } = require('./ui');
const { url: photoUrl } = require('./img');
const { classes } = require('../data/fleet');
const { airports, byCode } = require('../data/airports');
const { routes } = require('../data/routes');
const { estimate } = require('./estimate');
const { routeMapSvg, cabinPlan } = require('./art');
const { heroVideo } = require('../data/media');
const { FEES, FET, TAXI_HOURS } = require('./estimate');

/* ---------------------------------------------------------------- data for JS */
function skvData() {
  const data = {
    airports: airports.map((a) => ({ c: a.code, city: a.city, n: a.name, la: a.lat, lo: a.lon, i: a.intl ? 1 : 0 })),
    classes: classes.map((c) => ({ id: c.id, name: c.name, slug: c.slug, pax: c.pax, range: c.range, speed: c.speed, rate: c.rate, photo: photoUrl(c.photo, 800), bags: c.bags })),
    fees: FEES,
    fet: FET,
    taxi: TAXI_HOURS,
    wa: cfg.whatsapp,
    email: cfg.email,
    endpoint: cfg.forms.endpoint || '',
    phone: cfg.phone,
  };
  return `<script type="application/json" id="skv-data">${JSON.stringify(data)}</script>`;
}

/** <option> list for airport selects. */
const airportOptions = (selected) =>
  airports
    .map((a) => `<option value="${a.code}"${a.code === selected ? ' selected' : ''}>${esc(a.city)} (${a.code}) · ${esc(a.name)}</option>`)
    .join('');
/** <datalist> for free-text route search. */
const airportDatalist = (id = 'apts') =>
  `<datalist id="${id}">${airports.map((a) => `<option value="${esc(a.city)} (${a.code})" label="${esc(a.name)}"></option>`).join('')}</datalist>`;

/* ---------------------------------------------------------------- home hero */
function heroHome() {
  return `<section class="hero" data-hero data-waypoint="Departure" aria-labelledby="hero-h1">
  <div class="hero-media" aria-hidden="true">
    <div class="hero-layer hero-sky">
      ${img('heroSky', { sizes: '100vw', widths: [800, 1200, 1800, 2400], cls: 'hero-sky-img' })}
      <video class="hero-video" muted loop playsinline preload="none" data-src-hd="${heroVideo.hd}" data-src-sd="${heroVideo.sd}" tabindex="-1"></video>
    </div>
    <div class="hero-layer hero-ground">
      ${img('heroGround', { eager: true, fetchpriority: 'high', sizes: '100vw', widths: [800, 1200, 1800, 2400], cls: 'hero-ground-img' })}
    </div>
    <div class="hero-shade"></div>
    <div class="hero-grain"></div>
  </div>

  <div class="hero-in container">
    <p class="eyebrow hero-eyebrow">Private jet charter · United States</p>
    <h1 class="hero-title" id="hero-h1" data-hero-title>Private jet charter, <em>quoted in minutes</em></h1>
    <p class="hero-lede">Search any US route, see honest hourly pricing by aircraft class and fly with a dedicated advisor on call ${cfg.hours.replace('24 hours a day, 7 days a week', '24/7')}.</p>
    <div class="hero-ctas">
      ${btn('~/instant-quote/', 'Get an instant quote')}
      <a class="btn btn-ghost" href="tel:${cfg.phoneHref}">${icon('phone')}<span>${cfg.phone}</span></a>
    </div>
  </div>

  <form class="route-search" action="~/instant-quote/" method="get" data-route-search autocomplete="off" aria-label="Search a private jet route">
    <label class="rs-field rs-from"><span>From</span><input name="from" type="text" list="apts" placeholder="City or airport" required aria-label="Departure city or airport"></label>
    <button class="rs-swap" type="button" aria-label="Swap departure and arrival" data-swap>${icon('repeat')}</button>
    <label class="rs-field rs-to"><span>To</span><input name="to" type="text" list="apts" placeholder="City or airport" required aria-label="Arrival city or airport"></label>
    <label class="rs-field rs-date"><span>Date</span><input name="date" type="date" aria-label="Departure date"></label>
    <label class="rs-field rs-pax"><span>Passengers</span><select name="pax" aria-label="Number of passengers">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16].map((n) => `<option value="${n}"${n === 4 ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
    <button class="btn btn-gold rs-go" type="submit"><span>Get my quote</span>${icon('arrow-right')}</button>
    ${airportDatalist('apts')}
  </form>

  <div class="hud" aria-hidden="true">
    <div class="hud-item"><small>Altitude</small><b><span data-hud-alt>0</span> ft</b></div>
    <div class="hud-item"><small>Speed</small><b><span data-hud-spd>0</span> kts</b></div>
    <div class="hud-item hud-status"><small>Status</small><b data-hud-status>Boarding</b></div>
  </div>
  <a class="scroll-cue" href="#why" aria-label="Scroll to take off"><span>Scroll to take off</span><i></i></a>
</section>`;
}

/* ---------------------------------------------------------------- trust strip */
function trustStrip() {
  const items = [
    ['shield', 'FAA Part 135 operators only'],
    ['gauge', 'ARGUS and Wyvern audit screening'],
    ['headset', 'Flight desk open 24/7'],
    ['doc', 'Itemised, all-in quotes'],
    ['lock', 'No deposit to get a quote'],
    ['globe', '5,000+ US airports within reach'],
  ];
  const li = items.map(([i, t]) => `<li>${icon(i)}<span>${t}</span></li>`).join('');
  return `<section class="trust" aria-label="Why travellers trust us" data-nowp>
  <div class="trust-track" data-marquee><ul>${li}</ul><ul aria-hidden="true">${li}</ul><ul aria-hidden="true">${li}</ul></div>
</section>`;
}

/* ---------------------------------------------------------------- pillars */
function pillars() {
  const items = [
    ['scale', 'Honest pricing', 'See hourly ranges for every aircraft class and a live estimate for your route before you speak to anyone.', '~/private-jet-cost/', 'Pricing guide'],
    ['shield', 'Safety first', 'Only FAA Part 135 carriers, screened against independent audits, insurance and pilot standards.', '~/safety/', 'How we vet operators'],
    ['headset', 'One advisor, around the clock', 'A single point of contact from first quote to touchdown, reachable by call, text or WhatsApp.', '~/contact/', 'Reach the flight desk'],
    ['pin', 'Door to door', 'Private terminals, chauffeured cars, helicopter transfers, catering and pets: all arranged for you.', '~/concierge/', 'Concierge services'],
  ];
  return `<section class="section section--paper" id="why" data-waypoint="Why us" aria-labelledby="why-h">
  <div class="container">
    ${head({ kicker: 'Why fly with us', title: 'Everything the airline experience is not', lede: 'No terminals, no queues, no guesswork. Just the right aircraft, a clear price and people who answer the phone.', id: 'why-h' })}
    <div class="grid grid-4 pillars" data-stagger>
      ${items
        .map(
          ([i, t, d, h, l]) => `<article class="pillar" data-tilt>
        <span class="pillar-ico">${icon(i)}</span>
        <h3>${t}</h3>
        <p>${d}</p>
        ${linkArrow(h, l)}
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- ways to fly */
function waysToFly() {
  const ways = [
    ['jetDoorOpen', 'On-demand charter', 'Any aircraft, any route, from a single hour to multi-city itineraries. Quoted in minutes.', '~/private-jet-charter/', 'From $2,200 / hr'],
    ['jetRunwayB', 'Empty leg flights', 'Discounted repositioning flights when an aircraft is already heading your way.', '~/empty-leg-flights/', 'Save on one-way trips'],
    ['cabinEmpty1', 'Jet card', 'Prepaid flight hours with fixed rates and priority availability for frequent flyers.', '~/jet-card/', 'From 25 hours'],
    ['cabinFriends', 'Group and corporate', 'Teams, events and VIP airliners, with accounts, reporting and duty of care.', '~/group-charter/', 'Up to 16 on a jet'],
  ];
  return `<section class="section section--ink" data-waypoint="Ways to fly" aria-labelledby="ways-h">
  <div class="container">
    ${head({ kicker: 'Ways to fly', title: 'Choose how you want to fly private', id: 'ways-h' })}
    <div class="ways" data-stagger>
      ${ways
        .map(
          ([p, t, d, h, tag], i) => `<a class="way" href="${h}" data-cursor="Explore">
        <div class="way-media">${img(p, { sizes: '(min-width: 1000px) 25vw, (min-width: 600px) 50vw, 100vw', widths: [480, 800, 1200] })}</div>
        <div class="way-body"><span class="way-n">0${i + 1}</span><h3>${t}</h3><p>${d}</p><span class="way-tag">${tag}</span></div>
        <span class="way-go">${icon('arrow-up-right')}</span>
      </a>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- fleet */
function fleetCard(c) {
  return `<article class="fcard" data-cursor="Explore">
    <a class="fcard-media" href="~/fleet/${c.slug}/" tabindex="-1" aria-hidden="true">${img(c.photo, { sizes: '(min-width: 900px) 640px, 90vw', widths: [800, 1200, 1800] })}</a>
    <div class="fcard-body">
      <p class="fcard-n">${c.short}</p>
      <h3><a href="~/fleet/${c.slug}/">${c.name}</a></h3>
      <dl class="fcard-specs">
        <div><dt>Seats</dt><dd>${c.paxLabel}</dd></div>
        <div><dt>Range</dt><dd>${c.range.toLocaleString('en-US')} mi</dd></div>
        <div><dt>Cruise</dt><dd>${c.speed} mph</dd></div>
      </dl>
      <p class="fcard-ex">${c.examples.join(' · ')}</p>
      <div class="fcard-foot"><b>From ${money(c.rate[0])}<small>/hr</small></b>${linkArrow('~/fleet/' + c.slug + '/', 'Explore')}</div>
    </div>
  </article>`;
}

function fleetGallery() {
  return `<section class="fleet-h" data-fleet-h data-waypoint="Fleet" aria-labelledby="fleet-h">
  <div class="fleet-h-pin">
    <div class="container fleet-h-head">
      ${head({ kicker: 'The fleet', title: 'Six classes of aircraft. One is right for your trip.', lede: 'From turboprops that use short mountain runways to ultra-long-range jets that cross oceans. Scroll to browse.', id: 'fleet-h' })}
      <div class="fleet-h-count"><span data-fleet-idx>01</span><i></i><span>06</span></div>
    </div>
    <div class="fleet-h-track" data-fleet-track>
      ${classes.map(fleetCard).join('')}
      <div class="fcard fcard--end"><div><h3>Not sure which to choose?</h3><p>Tell us your passengers, bags and route and we will match the aircraft.</p>${btn('~/fleet/', 'Compare all aircraft')}</div></div>
    </div>
    <div class="fleet-h-progress" aria-hidden="true"><i data-fleet-bar></i></div>
  </div>
</section>`;
}

function fleetGrid() {
  return `<div class="grid grid-3 fleet-grid" data-stagger>${classes
    .map(
      (c) => `<article class="gcard" data-tilt data-cursor="Explore">
      <a class="gcard-media" href="~/fleet/${c.slug}/" aria-label="${esc(c.name)}">${img(c.photo, { sizes: '(min-width: 1000px) 33vw, (min-width: 600px) 50vw, 100vw', widths: [480, 800, 1200] })}<span class="pcard-tag">${c.paxLabel} seats</span></a>
      <div class="gcard-body">
        <h3><a href="~/fleet/${c.slug}/">${c.name}</a></h3>
        <p>${c.blurb}</p>
        <ul class="pcard-meta"><li>${c.range.toLocaleString('en-US')} mi range</li><li>${c.speed} mph</li><li>${money(c.rate[0])} to ${money(c.rate[1])}/hr</li></ul>
      </div>
    </article>`
    )
    .join('')}</div>`;
}

/* ---------------------------------------------------------------- route map */
const MAP_PAIRS = [
  ['TEB', 'OPF'], ['TEB', 'ASE'], ['VNY', 'LAS'], ['PWK', 'DAL'], ['BED', 'PDK'], ['SFO', 'VNY'], ['DAL', 'ASE'], ['PDK', 'PBI'],
];
function networkMap() {
  const list = MAP_PAIRS.map(([a, b], i) => {
    const A = byCode[a], B = byCode[b];
    const r = routes.find((x) => (x.from === a && x.to === b) || (x.from === b && x.to === a));
    const est = estimate(A, B, classes[1]);
    return `<li data-route-i="${i}"><span class="rl-n">${String(i + 1).padStart(2, '0')}</span><span class="rl-cities"><b>${A.city}</b>${icon('arrow-right')}<b>${B.city}</b></span><span class="rl-meta">${est.miles.toLocaleString('en-US')} mi · ${hm(est.hours)}</span>${r ? `<a href="~/routes/${r.slug}/" class="rl-link" aria-label="${A.city} to ${B.city} details">${icon('arrow-up-right')}</a>` : ''}</li>`;
  }).join('');
  return `<section class="mapscene" data-mapscene data-waypoint="Network" aria-labelledby="map-h">
  <div class="mapscene-pin">
    <div class="container mapscene-grid">
      <div class="mapscene-copy">
        ${head({ kicker: 'The network', title: 'Reach the airport that is closest to where you are going', lede: 'Private jets can use thousands of airports that airlines never serve. Watch the routes light up.', id: 'map-h' })}
        <ol class="route-list" data-route-list>${list}</ol>
        <div class="mapscene-note"><b data-map-live>0</b> routes shown. <a href="~/routes/">Browse all routes</a></div>
      </div>
      <div class="mapscene-map">${routeMapSvg(MAP_PAIRS, 'home')}</div>
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- routes */
function routeCard(r, cls = '') {
  const e = r.recEst;
  return photoCard({
    href: `~/routes/${r.slug}/`,
    photo: r.photo,
    title: `${r.a.city} <span class="to">to</span> ${r.b.city}`,
    sub: `${r.a.code} to ${r.b.code}`,
    meta: [`${r.miles.toLocaleString('en-US')} mi`, hm(e.hours), `${fromPrice(e)}`],
    tag: r.rec.short,
    cls,
  });
}
function popularRoutes(slugs, { title = 'Popular routes with indicative pricing', kicker = 'Popular routes', lede = 'Estimates are one-way, include airport fees and federal excise tax, and use the aircraft class we would typically suggest for the route.', all = true } = {}) {
  const list = slugs.map((s) => routes.find((r) => r.slug === s)).filter(Boolean);
  return `<section class="section section--paper" data-waypoint="Routes" aria-labelledby="routes-h">
  <div class="container">
    ${head({ kicker, title, lede, id: 'routes-h' })}
    <div class="grid grid-3" data-stagger>${list.map((r) => routeCard(r)).join('')}</div>
    ${all ? `<div class="sec-foot" data-reveal>${btn('~/routes/', 'See all 20 routes', 'dark')}</div>` : ''}
  </div>
</section>`;
}

/* ---------------------------------------------------------------- how it works */
function howSteps({ dark = true } = {}) {
  const steps = [
    ['support', 'Tell us the trip', 'Share your route, dates and passengers. It takes about a minute, with no deposit and no obligation.', '1 minute'],
    ['cabinEmpty2', 'Compare your aircraft', 'An advisor sends two or three matching aircraft with firm, itemised prices, operator details and cabin photos.', 'Minutes'],
    ['handshake', 'Confirm and pay', 'Review the charter agreement, confirm the operator and tail number, then pay by wire or card.', 'Same day'],
    ['boarding', 'Arrive and fly', 'Pull up to the private terminal about 15 minutes before departure. Bags are loaded, you walk straight on.', 'Wheels up'],
  ];
  return `<section class="steps${dark ? ' section--dark' : ''}" data-steps data-waypoint="How it works" aria-labelledby="steps-h">
  <div class="container steps-grid">
    <div class="steps-media" aria-hidden="true">
      <div class="steps-frame">
        ${steps.map(([p], i) => `<div class="steps-img${i === 0 ? ' is-active' : ''}" data-steps-img="${i}">${img(p, { sizes: '(min-width: 1000px) 45vw, 100vw', widths: [800, 1200, 1800] })}</div>`).join('')}
        <div class="steps-count"><b data-steps-n>01</b><span>/ 04</span></div>
      </div>
    </div>
    <div class="steps-copy">
      ${head({ kicker: 'How it works', title: 'From first message to wheels up', id: 'steps-h' })}
      <ol class="steps-list">
        ${steps
          .map(
            ([, t, d, tag], i) => `<li class="step${i === 0 ? ' is-active' : ''}" data-step="${i}"><span class="step-n">0${i + 1}</span><div><h3>${t}</h3><p>${d}</p><span class="step-tag">${tag}</span></div></li>`
          )
          .join('')}
      </ol>
      <div class="steps-cta" data-reveal>${btn('~/how-it-works/', 'See the full process', 'ghost')}</div>
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- estimator */
function estimator({ from = 'TEB', to = 'OPF', compact = false, title = 'Estimate your trip' } = {}) {
  return `<div class="est${compact ? ' est--compact' : ''}" data-estimator>
  <form class="est-form" novalidate>
    <h3 class="est-title">${title}</h3>
    <div class="est-grid">
      <label class="field"><span>From</span><select name="from" aria-label="Departure airport">${airportOptions(from)}</select></label>
      <label class="field"><span>To</span><select name="to" aria-label="Arrival airport">${airportOptions(to)}</select></label>
      <label class="field"><span>Passengers</span>
        <div class="stepper" data-stepper><button type="button" aria-label="Fewer passengers" data-dec>${icon('minus')}</button><input name="pax" type="number" min="1" max="16" value="4" inputmode="numeric" aria-label="Number of passengers"><button type="button" aria-label="More passengers" data-inc>${icon('plus')}</button></div>
      </label>
      <fieldset class="field field--seg"><legend>Trip</legend>
        <label><input type="radio" name="trip" value="one" checked><span>One way</span></label>
        <label><input type="radio" name="trip" value="round"><span>Round trip</span></label>
      </fieldset>
    </div>
  </form>
  <div class="est-out" aria-live="polite">
    <div class="est-photo" data-est-photo></div>
    <div class="est-res">
      <p class="est-kicker">Suggested aircraft</p>
      <h4 class="est-class" data-est-class>Midsize jets</h4>
      <p class="est-price" data-est-price>$0</p>
      <ul class="est-facts"><li><span>Distance</span><b data-est-miles>0 mi</b></li><li><span>Flight time</span><b data-est-time>0 hr</b></li><li><span>Range of aircraft</span><b data-est-range>0 mi</b></li></ul>
      <p class="est-note" data-est-note></p>
      <div class="est-cta">${btn('~/instant-quote/', 'Get a firm quote', 'gold', 'data-est-cta')}</div>
      <p class="est-fine">Indicative market range for planning, not a quote. Includes an allowance for airport fees (${money(FEES[0])} to ${money(FEES[1])}) and the 7.5% federal excise tax on domestic flights. Catering and ground transport are extra.</p>
    </div>
  </div>
</div>`;
}

/* ---------------------------------------------------------------- concierge bento */
function conciergeBento() {
  const tiles = [
    ['catering', 'dining', 'Catering from local chefs', 'Menus built around your tastes, dietary needs and the length of the flight.', 'tile-a'],
    ['chauffeur', 'car', 'Chauffeured to the aircraft door', 'A car at either end, straight to the terminal or the ramp.', 'tile-b'],
    ['helicopterInterior', 'helicopter', 'Helicopter transfers', 'Skip the last-mile traffic into city centres and resort towns where available.', 'tile-c'],
    ['petTravel', 'heart', 'Pets welcome', 'Most operators fly dogs and cats in the cabin. We match you with one that does.', 'tile-d'],
    ['cabinWorking', 'wifi', 'A cabin to work in', 'Wi-Fi, power and privacy for calls, on aircraft that have them.', 'tile-e'],
    ['familyChild', 'users', 'Families and groups', 'Car seats, snacks and schedules that fit around naps, not airport queues.', 'tile-f'],
  ];
  return `<section class="section section--dark" data-waypoint="Onboard" aria-labelledby="conc-h">
  <div class="container">
    ${head({ kicker: 'Onboard and beyond', title: 'The flight is the easy part. We handle the rest.', lede: 'Your advisor arranges the details so the trip feels effortless from your front door to your destination.', id: 'conc-h' })}
    <div class="bento" data-stagger>
      ${tiles
        .map(
          ([p, i, t, d, c]) => `<article class="tile ${c}" data-tilt>
        <div class="tile-media">${img(p, { sizes: '(min-width: 1000px) 33vw, 100vw', widths: [480, 800, 1200] })}</div>
        <div class="tile-body"><span class="tile-ico">${icon(i)}</span><h3>${t}</h3><p>${d}</p></div>
      </article>`
        )
        .join('')}
    </div>
    <div class="sec-foot" data-reveal>${btn('~/concierge/', 'Explore concierge services', 'ghost')}</div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- use cases */
function useCases() {
  const items = [
    ['boardroom', 'briefcase', 'Business and corporate', 'Be in two cities in a day. Work on board, bring the team, keep things confidential.', '~/corporate-charter/'],
    ['stadium', 'trophy', 'Sports and entertainment', 'Teams, tours and fans heading for the big game, the festival or the fight weekend.', '~/events/'],
    ['ski', 'mountain', 'Ski, golf and getaways', 'Straight to Aspen, Jackson Hole and Palm Beach with your gear on board.', '~/destinations/'],
    ['familyChild', 'users', 'Family and friends', 'Celebrations and holidays, with the whole group and the dog on the same flight.', '~/group-charter/'],
  ];
  return `<section class="section section--paper" data-waypoint="Who flies" aria-labelledby="uc-h">
  <div class="container">
    ${head({ kicker: 'Who flies private', title: 'Built for the way you travel', id: 'uc-h' })}
    <div class="uc" data-stagger>
      ${items
        .map(
          ([p, i, t, d, h]) => `<a class="uc-card" href="${h}" data-cursor="Explore">
        <div class="uc-media">${img(p, { sizes: '(min-width: 1000px) 25vw, (min-width: 600px) 50vw, 100vw', widths: [480, 800, 1200] })}</div>
        <div class="uc-body"><span class="uc-ico">${icon(i)}</span><h3>${t}</h3><p>${d}</p><span class="uc-go">${icon('arrow-up-right')}</span></div>
      </a>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- safety */
function safetyBlock({ dark = false } = {}) {
  const items = [
    ['FAA Part 135 only', 'Every flight is operated by a carrier holding an FAA air carrier certificate, the legal minimum for on-demand charter. The operator and tail number are on every quote.'],
    ['Independent audits', 'We screen operators against third-party safety audits such as ARGUS and Wyvern, which look at how a carrier actually runs its flights, beyond the legal minimum.'],
    ['Pilots and aircraft', 'We check pilot experience and training standards, aircraft age and maintenance records before an aircraft is offered to you.'],
    ['Insurance and substitution', 'We confirm liability cover and ask how substitutions are approved, so the aircraft you booked is the aircraft that arrives.'],
  ];
  return `<section class="section${dark ? ' section--dark' : ' section--ink'} safety" data-waypoint="Safety" aria-labelledby="safe-h">
  <div class="container safety-grid">
    <div class="safety-media" data-reveal="clip">
      <div class="split-frame"><div class="media" data-parallax="0.12">${img('pilotsBack', { sizes: '(min-width: 1000px) 45vw, 100vw', widths: [800, 1200, 1800] })}</div></div>
      <div class="safety-photo2">${img('maintenance', { sizes: '260px', widths: [480, 800] })}</div>
    </div>
    <div class="safety-copy">
      ${head({ kicker: 'Safety', title: 'Safety is the first question, not the last', lede: 'Price and cabin matter, but only after an operator clears the checks below.', id: 'safe-h' })}
      <div class="acc acc--dark" data-accordion>
        ${items.map(([t, d], i) => `<details class="acc-item"${i === 0 ? ' open' : ''}><summary><span>${t}</span>${icon('plus')}</summary><div class="acc-body"><p>${d}</p></div></details>`).join('')}
      </div>
      <ul class="chip-row chip-row--gold"><li class="chip">FAA Part 135</li><li class="chip">ARGUS</li><li class="chip">Wyvern</li><li class="chip">IS-BAO</li></ul>
      <p class="fine">Audit programmes are listed for explanation. Ratings apply to individual operators and are shown on your quote only where an operator holds them.</p>
      <div data-reveal>${btn('~/safety/', 'Read how we vet operators', 'ghost')}</div>
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- comparison */
function compareTable({ id = 'cmp-h' } = {}) {
  const rows = [
    ['How you pay', 'Per flight', 'Prepaid block of hours', 'Share purchase + monthly fee + hourly cost'],
    ['Commitment', 'None', 'Prepay, programme terms apply', 'Multi-year contract'],
    ['Pricing', 'Market rate, moves with demand', 'Often fixed hourly rates', 'Fixed operating cost per hour'],
    ['Availability', 'Whatever is free', 'Priority, notice period applies', 'Guaranteed within notice terms'],
    ['Aircraft choice', 'Any on the market', 'A category or fleet', 'A specific aircraft type'],
    ['Best fit', 'Up to about 25 hrs a year', 'About 25 to 100 hrs a year', '100+ hrs a year, steady need'],
  ];
  return `<section class="section section--paper" data-waypoint="Compare" aria-labelledby="${id}">
  <div class="container">
    ${head({ kicker: 'Compare your options', title: 'Charter, jet card or fractional?', lede: 'The right model depends mostly on how many hours you fly a year. Hour thresholds are industry rules of thumb, so always compare the actual terms.', id })}
    <div class="table-wrap" data-reveal>
      <table class="data-table data-table--cmp">
        <thead><tr><th></th><th class="is-us">On-demand charter</th><th>Jet card</th><th>Fractional share</th></tr></thead>
        <tbody>${rows.map(([a, b, c, d]) => `<tr><th scope="row">${a}</th><td class="is-us">${b}</td><td>${c}</td><td>${d}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <div class="sec-foot" data-reveal>${linkArrow('~/compare/', 'Read the full comparison')} ${linkArrow('~/jet-card/', 'Explore the jet card')}</div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- numbers */
function numbers() {
  const stats = [
    ['5000', '+', 'US airports a private jet can use', 'versus roughly 500 with airline service'],
    ['24', '/7', 'Flight desk', 'Calls, texts and WhatsApp answered by a person'],
    ['6', '', 'Aircraft classes', 'From turboprops to ultra-long-range jets'],
    ['15', ' min', 'Typical quote response', 'Placeholder: replace with your real average'],
  ];
  return `<section class="numbers" data-waypoint="By the numbers" aria-label="Key numbers">
  <div class="numbers-media" aria-hidden="true"><div data-parallax="0.2">${img('nightCity', { sizes: '100vw', widths: [800, 1200, 1800] })}</div></div>
  <div class="numbers-shade" aria-hidden="true"></div>
  <div class="container numbers-in">
    <div class="grid grid-4" data-stagger>
      ${stats
        .map(([n, s, t, d]) => `<div class="stat"><b class="stat-n"><span data-count="${n}">${Number(n).toLocaleString('en-US')}</span>${s}</b><h3>${t}</h3><p>${d}</p></div>`)
        .join('')}
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- example missions */
function missions() {
  const defs = [
    { photo: 'nantucket', tag: 'Family', title: 'Fourth of July on Nantucket', from: 'BED', to: 'ACK', cls: 'turboprop', pax: 5, text: 'A family of five and their golden retriever fly out of Boston on the Friday before the holiday, skipping the ferry queue.' },
    { photo: 'aspen', tag: 'Ski', title: 'Powder week in Aspen', from: 'TEB', to: 'ASE', cls: 'midsize', pax: 7, text: 'Seven friends, ski bags and boot cases. A midsize jet with a stand-up cabin, with Eagle County lined up as a weather alternate.' },
    { photo: 'losangeles', tag: 'Corporate', title: 'Coast-to-coast board meeting', from: 'TEB', to: 'VNY', cls: 'super-midsize', pax: 8, text: 'An executive team works through the flight on a super-midsize jet and lands within a short drive of the Los Angeles meeting.' },
  ];
  return `<section class="section section--dark" data-waypoint="Example trips" aria-labelledby="mis-h">
  <div class="container">
    ${head({ kicker: 'Example missions', title: 'How trips like yours come together', lede: 'These are illustrative scenarios, not customer testimonials. Prices come from the same estimator you can use above.', id: 'mis-h' })}
    <div class="grid grid-3" data-stagger>
      ${defs
        .map((d) => {
          const c = classes.find((x) => x.id === d.cls);
          const e = estimate(byCode[d.from], byCode[d.to], c);
          return `<article class="mission">
          <div class="mission-media">${img(d.photo, { sizes: '(min-width: 1000px) 33vw, 100vw', widths: [480, 800, 1200] })}<span class="pcard-tag">${d.tag} · Example</span></div>
          <div class="mission-body">
            <h3>${d.title}</h3>
            <p>${d.text}</p>
            <ul class="mission-facts"><li><span>Route</span><b>${byCode[d.from].city} to ${byCode[d.to].city}</b></li><li><span>Aircraft</span><b>${c.name.replace(/s$/, '')}</b></li><li><span>Passengers</span><b>${d.pax}</b></li><li><span>Estimate, one way</span><b>${money(roundTo(e.low, 500))} to ${money(roundTo(e.high, 500))}</b></li></ul>
          </div>
        </article>`;
        })
        .join('')}
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- landing CTA */
function ctaLanding() {
  return `<section class="landing" data-landing data-waypoint="Arrival" aria-labelledby="land-h">
  <div class="landing-media" aria-hidden="true"><div class="landing-img" data-landing-img>${img('nightCity', { sizes: '100vw', widths: [800, 1200, 1800, 2400] })}</div></div>
  <div class="landing-shade" aria-hidden="true"></div>
  <div class="landing-runway" aria-hidden="true"><i class="rw-line"></i>${'<b class="rw-light"></b>'.repeat(14)}</div>
  <div class="container landing-in">
    <p class="eyebrow" data-reveal>Cleared to land</p>
    <h2 class="h1" id="land-h" data-split>Your next flight starts with one message</h2>
    <p class="lede" data-reveal>Tell us where and when. A flight advisor replies with firm options, usually within minutes, at any hour.</p>
    <div class="cta-row" data-reveal>
      ${btn('~/instant-quote/', 'Get an instant quote')}
      <a class="btn btn-ghost" href="tel:${cfg.phoneHref}">${icon('phone')}<span>${cfg.phone}</span></a>
      <a class="btn btn-ghost" href="${waLink('Hello, I would like a private jet quote.')}" target="_blank" rel="noopener">${icon('chat')}<span>WhatsApp</span></a>
    </div>
    <div class="landing-hud" aria-hidden="true"><span>Altitude <b data-land-alt>0</b> ft</span><span class="landing-status" data-land-status>On approach</span></div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- quote form */
function quoteForm() {
  const classCards = [
    ['best', 'Best fit', 'We recommend the right aircraft for your trip.', null],
    ...classes.filter((c) => c.id !== 'turboprop').map((c) => [c.id, c.name, `${c.paxLabel} seats · from ${money(c.rate[0])}/hr`, c.photo]),
    ['turboprop', 'Turboprops', `${classes.find((c) => c.id === 'turboprop').paxLabel} seats · from ${money(classes.find((c) => c.id === 'turboprop').rate[0])}/hr`, 'turboprop'],
  ];
  return `<form class="qf" data-quote-form novalidate action="${cfg.forms.endpoint || '#'}" method="post">
  <ol class="qf-steps" aria-label="Quote progress"><li class="is-active"><b>1</b><span>Trip</span></li><li><b>2</b><span>Aircraft</span></li><li><b>3</b><span>You</span></li></ol>
  <div class="qf-bar" aria-hidden="true"><i data-qf-bar></i></div>

  <section class="qf-pane is-active" data-pane="0" aria-labelledby="qf0">
    <h2 class="qf-h" id="qf0">Where are you flying?</h2>
    <fieldset class="field field--seg"><legend>Trip type</legend>
      <label><input type="radio" name="trip" value="One way" checked><span>One way</span></label>
      <label><input type="radio" name="trip" value="Round trip"><span>Round trip</span></label>
      <label><input type="radio" name="trip" value="Multi-city"><span>Multi-city</span></label>
    </fieldset>
    <div class="qf-grid">
      <label class="field"><span>From</span><input name="from" type="text" list="qf-apts" placeholder="City or airport" required autocomplete="off"></label>
      <label class="field"><span>To</span><input name="to" type="text" list="qf-apts" placeholder="City or airport" required autocomplete="off"></label>
      <label class="field"><span>Departure date</span><input name="date" type="date" required></label>
      <label class="field"><span>Departure time</span><input name="time" type="time"></label>
      <label class="field" data-return hidden><span>Return date</span><input name="return" type="date"></label>
      <label class="field"><span>Passengers</span><div class="stepper" data-stepper><button type="button" aria-label="Fewer passengers" data-dec>${icon('minus')}</button><input name="pax" type="number" min="1" max="16" value="4" inputmode="numeric"><button type="button" aria-label="More passengers" data-inc>${icon('plus')}</button></div></label>
    </div>
    ${airportDatalist('qf-apts')}
    <div class="qf-live" data-qf-live hidden><span class="qf-live-label">Indicative estimate</span><b data-qf-live-price></b><small data-qf-live-note></small></div>
  </section>

  <section class="qf-pane" data-pane="1" aria-labelledby="qf1" hidden>
    <h2 class="qf-h" id="qf1">Which aircraft suits you?</h2>
    <div class="qf-classes" role="radiogroup" aria-label="Aircraft class">
      ${classCards
        .map(
          ([id, name, sub, ph], i) => `<label class="qf-class"><input type="radio" name="aircraft" value="${name}"${i === 0 ? ' checked' : ''}><span class="qf-class-in">${ph ? `<span class="qf-class-media">${img(ph, { sizes: '260px', widths: [480, 800] })}</span>` : `<span class="qf-class-media qf-class-media--ico">${icon('sparkle')}</span>`}<b>${name}</b><small>${sub}</small></span></label>`
        )
        .join('')}
    </div>
    <fieldset class="field"><legend>Extras</legend>
      <div class="qf-checks">
        ${['Pets on board', 'Catering', 'Ground transport', 'Wi-Fi needed', 'Skis or golf bags', 'Helicopter transfer']
          .map((x) => `<label class="check"><input type="checkbox" name="extras" value="${x}"><span>${x}</span></label>`)
          .join('')}
      </div>
    </fieldset>
  </section>

  <section class="qf-pane" data-pane="2" aria-labelledby="qf2" hidden>
    <h2 class="qf-h" id="qf2">Where should we send your quote?</h2>
    <div class="qf-grid">
      <label class="field"><span>Full name</span><input name="name" type="text" required autocomplete="name"></label>
      <label class="field"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
      <label class="field"><span>Mobile (for urgent updates)</span><input name="phone" type="tel" required autocomplete="tel"></label>
      <label class="field"><span>Company (optional)</span><input name="company" type="text" autocomplete="organization"></label>
      <label class="field field--wide"><span>Anything else we should know?</span><textarea name="notes" rows="3" placeholder="Flexible dates, special requests, baggage..."></textarea></label>
    </div>
    <label class="check check--consent"><input type="checkbox" name="consent" required><span>I agree to be contacted about this request. See the <a href="~/privacy/">privacy policy</a>.</span></label>
    <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  </section>

  <div class="qf-nav">
    <button class="btn btn-ghost" type="button" data-prev hidden>${icon('arrow-left')}<span>Back</span></button>
    <button class="btn btn-gold" type="button" data-next><span>Continue</span>${icon('arrow-right')}</button>
    <button class="btn btn-gold" type="submit" data-submit hidden><span>Send my request</span>${icon('arrow-right')}</button>
  </div>
  <p class="qf-error" role="alert" data-qf-error hidden></p>

  <div class="qf-done" data-qf-done hidden tabindex="-1">
    <span class="qf-done-ico">${icon('check')}</span>
    <h2>Request received</h2>
    <p data-qf-done-text>An advisor will reply with firm options shortly.</p>
    <div class="cta-row">
      ${btn('~/', 'Back to home', 'ghost')}
      <a class="btn btn-gold" href="tel:${cfg.phoneHref}">${icon('phone')}<span>Call ${cfg.phone}</span></a>
    </div>
  </div>
</form>`;
}

/* ---------------------------------------------------------------- empty leg alerts */
function alertForm() {
  return `<form class="alert-form" data-alert-form novalidate>
  <h3>Get empty leg alerts</h3>
  <p>Tell us the routes you fly and we will email deals as they appear.</p>
  <div class="alert-grid">
    <label class="field"><span>Email</span><input type="email" name="email" required autocomplete="email" placeholder="you@example.com"></label>
    <label class="field"><span>Routes you fly</span><input type="text" name="routes" placeholder="e.g. New York to Palm Beach"></label>
    <button class="btn btn-gold" type="submit"><span>Alert me</span>${icon('bell')}</button>
  </div>
  <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <p class="alert-msg" data-alert-msg role="status" hidden></p>
</form>`;
}

module.exports = {
  skvData, airportOptions, airportDatalist, heroHome, trustStrip, pillars, waysToFly, fleetCard, fleetGallery, fleetGrid,
  networkMap, routeCard, popularRoutes, howSteps, estimator, conciergeBento, useCases, safetyBlock, compareTable, numbers,
  missions, ctaLanding, quoteForm, alertForm, MAP_PAIRS,
};
