'use strict';
/** Money pages and service pages. */
const cfg = require('../config');
const S = require('../lib/sections');
const B = require('../lib/blocks');
const { pageHero, faqBlock, ctaBand, head, btn, linkArrow, icon, img, money, roundTo, hm, photoCard } = require('../lib/ui');
const { schemas, waLink } = require('../lib/layout');
const { preload } = require('../lib/img');
const { pick, byTag } = require('../data/faqs');
const { classes } = require('../data/fleet');
const { byCode } = require('../data/airports');
const { routes } = require('../data/routes');
const { estimate } = require('../lib/estimate');
const { emptyLegs } = require('../data/emptylegs');

const crumbs = (...items) => [{ name: 'Home', path: '/' }, ...items.map(([name, path]) => ({ name, path }))];
const quoteBtn = btn('~/instant-quote/', 'Get an instant quote');
const callBtn = `<a class="btn btn-ghost" href="tel:${cfg.phoneHref}">${icon('phone')}<span>${cfg.phone}</span></a>`;
const rate = (c) => `${money(c.rate[0])} to ${money(c.rate[1])}`;

function charter() {
  const faqs = pick('cost', 'how-fast', 'broker', 'airports', 'bags', 'cancel', 'intl');
  const path = '/private-jet-charter/';
  const rows = classes.map((c) => [`<a href="~/fleet/${c.slug}/">${c.name}</a>`, c.paxLabel, rate(c), `${c.range.toLocaleString('en-US')} mi`, c.best.split('.')[0]]);
  const body = [
    pageHero({
      kicker: 'On-demand charter',
      h1: 'Private jet charter, <em>on your schedule</em>',
      lede: 'Rent a private jet for a single flight, a multi-city trip or a weekend away. Choose the aircraft, see the price up front and fly from the airport closest to your destination.',
      photo: 'jetDoorOpen',
      crumbs: crumbs(['Private jet charter', path]),
      ctas: quoteBtn + callBtn,
      chips: ['FAA Part 135 carriers', 'Quotes in minutes', 'No deposit to enquire'],
      pos: '50% 55%',
    }),
    B.split({
      kicker: 'What it is',
      title: 'A whole aircraft, booked for just your group',
      paras: [
        'Private jet charter means hiring an entire aircraft and its crew for your trip. You decide when you leave and who comes with you, and you are not bound by airline schedules, hub airports or security queues.',
        'Because private aircraft can use thousands of smaller airports, you can often land within minutes of where you are really going, and you are usually on board within about fifteen minutes of arriving at the terminal.',
      ],
      list: ['Pay per flight with no commitment', 'Choose from six aircraft classes', 'Fly from private terminals, with no queues', 'Pets, skis, golf clubs and extra bags are normal'],
      photo: 'boardingSun',
      photo2: 'jetsDramatic',
      cta: quoteBtn,
      id: 'what-h',
    }),
    S.howSteps(),
    `<section class="section section--paper" data-waypoint="Aircraft" aria-labelledby="ac-h"><div class="container">
      ${head({ kicker: 'Aircraft', title: 'Pick the aircraft that fits the trip', lede: 'Typical 2026 market rates per flight hour. Your quote depends on the specific aircraft, the operator, the season and repositioning.', id: 'ac-h' })}
      ${S.fleetGrid()}
      <div data-reveal style="margin-top:2.5rem">${B.table(['Aircraft class', 'Seats', 'Hourly rate', 'Range', 'Best for'], rows)}</div>
    </div></section>`,
    `<section class="section section--ink est-section" data-waypoint="Estimate" aria-labelledby="est-h"><div class="container">
      ${head({ kicker: 'Instant estimate', title: 'Estimate your route before you ask', id: 'est-h' })}
      <div data-reveal>${S.estimator({ from: 'TEB', to: 'OPF' })}</div>
    </div></section>`,
    S.useCases(),
    S.safetyBlock(),
    faqBlock(faqs, { title: 'Private jet charter: your questions answered' }),
    ctaBand({}),
    S.skvData(),
  ].join('\n');
  return {
    path,
    title: 'Private Jet Charter: Book a Jet Anywhere in the US',
    description: 'Charter a private jet for one flight or many. See hourly rates by aircraft class, estimate your route and get a firm quote from a flight advisor in minutes.',
    body,
    ogPhoto: 'jetDoorOpen',
    headerMode: 'over',
    breadcrumbs: crumbs(['Private jet charter', path]),
    preload: [preload('jetDoorOpen')],
    schema: [schemas.serviceSchema({ name: 'Private jet charter', description: 'On-demand private jet charter across the United States.', path }), schemas.faqSchema(faqs)],
  };
}

function quote() {
  const path = '/instant-quote/';
  const faqs = pick('cost', 'how-fast', 'cancel', 'payment', 'fet');
  const body = [
    pageHero({
      kicker: 'Instant quote',
      h1: 'Get your private jet quote in minutes',
      lede: 'Three short steps: your trip, your aircraft, your details. See an indicative price as you go, then a flight advisor sends firm options.',
      photo: 'jetRunwayC',
      crumbs: crumbs(['Instant quote', path]),
      chips: ['No deposit', 'No obligation', 'Reply within minutes'],
    }),
    `<section class="section section--paper quote-section" data-waypoint="Your trip" aria-label="Quote request">
      <div class="container quote-grid">
        <div class="quote-main">${S.quoteForm()}</div>
        <aside class="quote-side">
          <div class="side-card" data-reveal>
            <h2>What happens next</h2>
            <ol class="mini-steps">
              <li><b>An advisor reviews your request</b><span>Usually within minutes, any hour of the day.</span></li>
              <li><b>You get two or three firm options</b><span>Operator, aircraft, itemised price and cabin photos.</span></li>
              <li><b>You choose and confirm</b><span>Pay by wire or card. We handle the rest.</span></li>
            </ol>
          </div>
          <div class="side-card" data-reveal>
            <h2>Prefer to talk?</h2>
            ${B.contactMethods()}
          </div>
          <div class="side-card side-card--note" data-reveal>
            <p>${icon('shield')} Every flight is operated by an FAA Part 135 carrier. <a href="~/broker-disclosure/">How we work</a></p>
          </div>
        </aside>
      </div>
    </section>`,
    `<section class="section section--ink est-section" data-waypoint="Estimate" aria-labelledby="est-h"><div class="container">
      ${head({ kicker: 'Just exploring?', title: 'Try the cost estimator', lede: 'Compare aircraft classes for any two airports without entering your details.', id: 'est-h' })}
      <div data-reveal>${S.estimator({ from: 'TEB', to: 'PBI' })}</div>
    </div></section>`,
    faqBlock(faqs, { title: 'Before you request a quote' }),
    S.skvData(),
  ].join('\n');
  return {
    path,
    title: 'Instant Private Jet Quote and Cost Estimator',
    description: 'Request a private jet quote in three steps and see an indicative price as you go. No deposit, no obligation, reply within minutes from a flight advisor.',
    body,
    ogPhoto: 'jetRunwayC',
    headerMode: 'over',
    breadcrumbs: crumbs(['Instant quote', path]),
    preload: [preload('jetRunwayC')],
    schema: [schemas.faqSchema(faqs)],
  };
}

function cost() {
  const path = '/private-jet-cost/';
  const faqs = pick('cost', 'fet', 'cancel', 'payment', 'bags');
  const examples = [
    ['TEB', 'PBI', 'light', 'New York to Palm Beach'],
    ['VNY', 'LAS', 'turboprop', 'Los Angeles to Las Vegas'],
    ['TEB', 'ASE', 'midsize', 'New York to Aspen'],
    ['TEB', 'VNY', 'super-midsize', 'New York to Los Angeles'],
  ].map(([a, b, cid, label]) => {
    const c = classes.find((x) => x.id === cid);
    const e = estimate(byCode[a], byCode[b], c);
    return [label, c.name.replace(/s$/, ''), `${e.miles.toLocaleString('en-US')} mi`, hm(e.hours), `${money(roundTo(e.low, 500))} to ${money(roundTo(e.high, 500))}`];
  });
  const body = [
    pageHero({
      kicker: 'Pricing guide',
      h1: 'How much does a private jet charter cost?',
      lede: 'Most charters cost between $2,200 and $15,000 per flight hour, depending on the aircraft. Here is how pricing works, what is included and how to estimate your own trip.',
      photo: 'jetRunwayA',
      crumbs: crumbs(['Private jet cost', path]),
      ctas: quoteBtn,
      chips: ['2026 market ranges', 'Worked examples', 'Free estimator'],
    }),
    `<section class="section section--paper" data-waypoint="Rates" aria-labelledby="rt-h"><div class="container">
      ${head({ kicker: 'Hourly rates', title: 'Price per flight hour by aircraft class', lede: 'Indicative 2026 market ranges. The final price depends on the aircraft, operator, season and positioning.', id: 'rt-h' })}
      <div data-reveal>${B.table(['Aircraft class', 'Seats', 'Hourly rate', 'Range', 'Typical use'], classes.map((c) => [`<a href="~/fleet/${c.slug}/">${c.name}</a>`, c.paxLabel, rate(c), `${c.range.toLocaleString('en-US')} mi`, c.best.split('.')[0]]))}</div>
      <p class="fine" data-reveal>Ranges summarise third-party 2026 market data and are not an offer. Replace with your own rate card before launch.</p>
    </div></section>`,
    B.features({
      kicker: 'What is in the price',
      title: 'Included, added and taxed',
      items: [
        ['plane', 'Usually included', 'The aircraft, two pilots, fuel, standard insurance and basic refreshments on many aircraft.'],
        ['tag', 'Usually added', 'Landing and parking, handling at the private terminal, de-icing, catering, ground transport, crew overnights and customs on international trips.'],
        ['scale', 'Taxes', 'Domestic charters generally carry a 7.5% federal excise tax on the transportation charge, plus per-passenger segment fees.'],
      ],
      tone: 'ink',
      id: 'inc-h',
    }),
    `<section class="section section--paper" data-waypoint="Examples" aria-labelledby="ex-h"><div class="container">
      ${head({ kicker: 'Worked examples', title: 'What real routes cost', lede: 'One-way estimates with an allowance for airport fees and federal excise tax. Catering and ground transport extra.', id: 'ex-h' })}
      <div data-reveal>${B.table(['Route', 'Aircraft', 'Distance', 'Flight time', 'Estimate, one way'], examples)}</div>
    </div></section>`,
    `<section class="section section--ink est-section" data-waypoint="Estimate" aria-labelledby="est-h"><div class="container">
      ${head({ kicker: 'Your route', title: 'Estimate your own trip', id: 'est-h' })}
      <div data-reveal>${S.estimator({ from: 'TEB', to: 'OPF' })}</div>
    </div></section>`,
    B.split({
      kicker: 'Spend less',
      title: 'Seven ways to lower the price of a charter',
      list: [
        'Be flexible by a day: <a href="~/empty-leg-flights/">empty legs</a> can be heavily discounted',
        'Choose the smallest cabin that fits people and bags',
        'Book round trips and avoid peak days',
        'Use the airport that is closest to your destination, not the biggest',
        'Fly a turboprop on short hops under 90 minutes',
        'Ask for flexible aircraft options, not one specific model',
        'If you fly often, compare a <a href="~/jet-card/">jet card</a> against on-demand rates',
      ],
      photo: 'jetRunwayB',
      tone: 'paper',
      cta: linkArrow('~/guides/how-much-does-it-cost-to-charter-a-private-jet/', 'Read the full cost guide'),
      id: 'save-h',
    }),
    faqBlock(faqs, { title: 'Private jet cost: common questions' }),
    ctaBand({}),
    S.skvData(),
  ].join('\n');
  return {
    path,
    title: 'Private Jet Charter Cost: 2026 Price Guide',
    description: 'Private jet charter cost by aircraft class, what is included, taxes and fees, worked route examples and a free estimator. Typical rates are $2,200 to $15,000 per hour.',
    body,
    ogPhoto: 'jetRunwayA',
    headerMode: 'over',
    breadcrumbs: crumbs(['Private jet cost', path]),
    preload: [preload('jetRunwayA')],
    schema: [schemas.faqSchema(faqs)],
  };
}

function emptyLegPage() {
  const path = '/empty-leg-flights/';
  const faqs = pick('empty-leg', 'cancel', 'how-fast', 'payment');
  const regions = ['All', ...new Set(emptyLegs.map((l) => l.region))];
  const cards = emptyLegs
    .map(
      (l) => `<article class="leg" data-region="${l.region}" data-day="${l.day}" data-reveal>
    <div class="leg-top"><span class="leg-tag">Sample listing</span><span class="leg-when" data-leg-date data-day="${l.day}">in ${l.day} day${l.day > 1 ? 's' : ''}</span></div>
    <div class="leg-route"><div><b>${l.a.code}</b><small>${l.a.city}</small></div><div class="leg-line">${icon('plane')}</div><div><b>${l.b.code}</b><small>${l.b.city}</small></div></div>
    <ul class="leg-facts"><li>${icon('clock')}${l.time} departure</li><li>${icon('users')}Up to ${l.seats} seats</li><li>${icon('plane')}${l.c.name.replace(/s$/, '')}</li><li>${icon('route')}${l.miles.toLocaleString('en-US')} mi · ${hm(l.hours)}</li></ul>
    <div class="leg-price"><div><small>Indicative from</small><b>${money(l.price)}</b><s>${money(l.was)}</s></div><a class="btn btn-gold btn-sm" href="~/instant-quote/?from=${l.from}&amp;to=${l.to}&amp;pax=4" data-evt="emptyleg">Request</a></div>
  </article>`
    )
    .join('');
  const body = [
    pageHero({
      kicker: 'Jet deals',
      h1: 'Empty leg flights: discounted private jet deals',
      lede: 'When an aircraft has to fly without passengers, operators often sell the seats at a reduced price. Flexible travellers can save substantially compared with a standard one-way charter.',
      photo: 'jetRunwayB',
      crumbs: crumbs(['Empty leg flights', path]),
      ctas: btn('#deals', 'See current deals', 'gold'),
      chips: ['Repositioning flights', 'Flexible dates win', 'Alerts by route'],
    }),
    `<section class="section section--paper" id="deals" data-waypoint="Deals" aria-labelledby="deals-h"><div class="container">
      ${head({ kicker: 'Sample listings', title: 'Example empty leg flights', lede: 'These sample listings show the format. Connect a live operator feed or update <code>tools/build/data/emptylegs.js</code> to publish real deals. Prices here are derived from the estimator, not real offers.', id: 'deals-h' })}
      <div class="filters" role="group" aria-label="Filter by region" data-filters>${regions.map((r, i) => `<button type="button" class="chip-btn${i === 0 ? ' is-active' : ''}" data-filter="${r}">${r}</button>`).join('')}</div>
      <div class="legs" data-legs data-stagger>${cards}</div>
    </div></section>`,
    `<section class="section section--ink" data-waypoint="Alerts" aria-labelledby="al-h"><div class="container container--narrow">
      ${head({ kicker: 'Never miss a deal', title: 'Get alerts for your routes', id: 'al-h', center: true })}
      <div data-reveal>${S.alertForm()}</div>
    </div></section>`,
    B.split({
      kicker: 'How empty legs work',
      title: 'Why the aircraft is flying empty, and why you can benefit',
      paras: [
        'Charters are often one way. A group flies from New York to Aspen and the aircraft returns empty, or repositions to its next pickup. That empty segment is the empty leg.',
        'The operator is flying it anyway, so selling the seats at a reduced price recovers part of the cost. The trade-off is flexibility: the route and the time are set by the aircraft.',
      ],
      list: ['Best for flexible dates and airports', 'Often posted one to three days ahead', 'Can change if the aircraft schedule changes', 'Same aircraft, crew and safety standards as any charter'],
      photo: 'jetRunwayC',
      tone: 'paper',
      cta: linkArrow('~/guides/what-is-an-empty-leg-flight/', 'Read the empty leg guide'),
      id: 'how-leg-h',
    }),
    faqBlock(faqs, { title: 'Empty leg flights: FAQ' }),
    ctaBand({ title: 'Want a specific route instead?' }),
  ].join('\n');
  return {
    path,
    title: 'Empty Leg Flights: Discounted Private Jet Deals',
    description: 'What empty leg flights are, how much you can save and how to catch one. Browse sample deals and set up alerts for the routes you fly most.',
    body,
    ogPhoto: 'jetRunwayB',
    headerMode: 'over',
    breadcrumbs: crumbs(['Empty leg flights', path]),
    preload: [preload('jetRunwayB')],
    schema: [schemas.faqSchema(faqs)],
  };
}

function jetCard() {
  const path = '/jet-card/';
  const faqs = pick('jet-card', 'frac', 'cost', 'cancel');
  const body = [
    pageHero({
      kicker: 'Jet card',
      h1: 'Jet card: prepaid hours, fixed rates, priority availability',
      lede: 'Buy a block of flight hours once and fly when you like, at rates agreed in advance. For travellers who fly roughly 25 hours a year or more, a card can beat paying market rates every time.',
      photo: 'cabinEmpty1',
      crumbs: crumbs(['Jet card', path]),
      ctas: btn('#enquire', 'Ask about a jet card') + callBtn,
      chips: ['Fixed hourly rates', 'Priority availability', 'No ownership'],
    }),
    B.features({
      kicker: 'Why a card',
      title: 'What a jet card gives you',
      items: [
        ['gauge', 'Locked-in rates', 'Hourly rates fixed by aircraft category, so a busy weekend does not change your price.'],
        ['clock', 'Priority availability', 'Guaranteed access within a notice window, so you are not hunting for an aircraft at peak times.'],
        ['repeat', 'Flexible categories', 'Choose a light, midsize or large-cabin category and step up or down when a trip needs it, subject to terms.'],
        ['users', 'Share with your team', 'Add family or colleagues as authorised flyers and keep one balance.'],
        ['doc', 'One simple invoice', 'Hours are drawn down per flight with an itemised statement, which suits corporate accounting.'],
        ['shield', 'Same safety standards', 'Flights are still operated only by screened FAA Part 135 carriers.'],
      ],
      id: 'why-card-h',
    }),
    `<section class="section section--ink" data-waypoint="Hours" aria-labelledby="hrs-h"><div class="container">
      ${head({ kicker: 'How many hours?', title: 'Find the right way to fly for your hours', lede: 'Drag the slider. These thresholds are industry rules of thumb, not rules, so compare real terms.', id: 'hrs-h' })}
      <div class="hours-calc" data-hours-calc data-reveal>
        <label for="hrs">Hours you expect to fly each year: <b data-hours-val>30</b></label>
        <input id="hrs" type="range" min="2" max="200" value="30" step="1" data-hours>
        <div class="hours-out">
          <div class="hours-opt" data-opt="charter"><h3>On-demand charter</h3><p>Best up to about 25 hours. No commitment, choose the best aircraft each time.</p></div>
          <div class="hours-opt" data-opt="card"><h3>Jet card</h3><p>Worth comparing from about 25 to 100 hours. Fixed rates and priority availability.</p></div>
          <div class="hours-opt" data-opt="fractional"><h3>Fractional or ownership</h3><p>Consider from about 100 hours a year with a steady, predictable need.</p></div>
        </div>
      </div>
    </div></section>`,
    B.process({
      kicker: 'What to check',
      title: 'Six terms to read before you buy any jet card',
      tone: 'paper',
      steps: [
        ['Hourly rates by category', 'Are they fixed, or do they float with fuel and peak days?'],
        ['Repositioning charges', 'Is the aircraft position time included or billed?'],
        ['Peak-day surcharges', 'Which days are blackout or premium, and how many?'],
        ['Unused balance', 'Is any remaining balance refundable, and on what terms?'],
        ['Notice period', 'How much notice guarantees an aircraft, and what happens inside it?'],
        ['Operator and safety', 'Which carriers fly for the programme, and what audits do they hold?'],
      ],
      id: 'chk-h',
    }),
    `<section class="section section--ink" id="enquire" data-waypoint="Enquire" aria-labelledby="enq-h"><div class="container container--narrow">
      ${head({ kicker: 'Enquire', title: 'Tell us how you fly', lede: 'A few questions about your flying so we can compare card options with on-demand pricing for you.', id: 'enq-h', center: true })}
      <div data-reveal>${B.leadForm({
        fields: [
          ['text', 'name', 'Full name', { required: true, auto: 'name' }],
          ['email', 'email', 'Email', { required: true, auto: 'email' }],
          ['tel', 'phone', 'Mobile', { auto: 'tel' }],
          ['select', 'hours', 'Hours you fly per year', { options: ['Under 25', '25 to 50', '50 to 100', '100 or more', 'Not sure'] }],
          ['select', 'current', 'How do you fly private today?', { options: ['I do not yet', 'On-demand charter', 'A jet card', 'Fractional share', 'My own aircraft'] }],
          ['text', 'routes', 'Typical routes', { ph: 'e.g. New York to Palm Beach', wide: true }],
        ],
        topic: 'Jet card enquiry',
        submit: 'Request jet card options',
        success: 'Thanks. An advisor will compare options and reply with next steps.',
      })}</div>
    </div></section>`,
    faqBlock(faqs, { title: 'Jet cards: frequently asked questions' }),
    ctaBand({}),
  ].join('\n');
  return {
    path,
    title: 'Private Jet Card: Prepaid Hours and Fixed Rates',
    description: 'How a private jet card works, who it suits and what to check before buying. Compare it with on-demand charter and fractional ownership for your annual hours.',
    body,
    ogPhoto: 'cabinEmpty1',
    headerMode: 'over',
    breadcrumbs: crumbs(['Jet card', path]),
    preload: [preload('cabinEmpty1')],
    schema: [schemas.serviceSchema({ name: 'Private jet card', description: 'Prepaid private jet flight hours with fixed rates and priority availability.', path, serviceType: 'Jet card programme' }), schemas.faqSchema(faqs)],
  };
}

function howItWorks() {
  const path = '/how-it-works/';
  const faqs = pick('how-fast', 'arrive', 'id', 'payment', 'weather');
  const body = [
    pageHero({
      kicker: 'How it works',
      h1: 'How to charter a private jet in four steps',
      lede: 'From a first message to stepping out at your destination. No hidden stages, no surprises.',
      photo: 'boardingSun',
      crumbs: crumbs(['How it works', path]),
      ctas: quoteBtn,
    }),
    S.howSteps(),
    B.process({
      kicker: 'On the day',
      title: 'What happens when you fly',
      tone: 'paper',
      steps: [
        ['Door to door', 'A chauffeured car can collect you, or you drive straight to the private terminal. Parking is steps from the door.'],
        ['Arrive about 15 minutes before', 'There is no queue. Your passenger names are on the manifest and your bags are loaded for you.'],
        ['Walk to the aircraft', 'Step across the ramp and board when you are ready. Your crew will brief you and take care of the cabin.'],
        ['Land close to where you are going', 'Private airports are usually minutes from your destination, and ground transport can be waiting at the aircraft.'],
      ],
      id: 'day-h',
    }),
    B.features({
      kicker: 'Good to know',
      title: 'Before you fly',
      tone: 'ink',
      items: [
        ['doc', 'Photo ID', 'Every passenger needs valid government photo ID. International trips need passports and any required visas.'],
        ['luggage', 'Bags', 'Baggage limits depend on the aircraft and its range. Tell us about skis, golf clubs and oversized items in advance.'],
        ['heart', 'Pets and children', 'Most operators welcome pets and children. Share details early so we can match the aircraft and operator.'],
        ['clock', 'Notice', 'Many flights can be arranged within hours. Complex or peak-season trips are best planned a day or two ahead.'],
        ['alert', 'Weather', 'The pilot-in-command makes the final safety decision. We keep you updated and rebook where needed.'],
        ['lock', 'Payment', 'Flights are paid before departure by wire or card, as set out in your charter agreement.'],
      ],
      id: 'know-h',
    }),
    faqBlock(faqs, { title: 'How chartering works: FAQ' }),
    ctaBand({}),
  ].join('\n');
  return {
    path,
    title: 'How to Charter a Private Jet: The 4-Step Process',
    description: 'How private jet charter works from quote to touchdown: request, compare aircraft, confirm and pay, then arrive at the private terminal and fly.',
    body,
    ogPhoto: 'boardingSun',
    headerMode: 'over',
    breadcrumbs: crumbs(['How it works', path]),
    preload: [preload('boardingSun')],
    schema: [schemas.faqSchema(faqs)],
  };
}

function safety() {
  const path = '/safety/';
  const faqs = pick('safety', 'broker', 'weather', 'cancel');
  const body = [
    pageHero({
      kicker: 'Safety',
      h1: 'Private jet charter safety: how we vet every operator',
      lede: 'Every flight we arrange is operated by an FAA Part 135 carrier. Here is what that means, which independent audits we use and the questions you should ask any charter company.',
      photo: 'pilotsBack',
      crumbs: crumbs(['Safety', path]),
      ctas: quoteBtn,
      chips: ['FAA Part 135', 'ARGUS', 'Wyvern', 'IS-BAO'],
    }),
    B.split({
      kicker: 'The legal minimum',
      title: 'FAA Part 135: what it means for your flight',
      paras: [
        'Part 135 of the Federal Aviation Regulations sets operating, training, maintenance and crew rules for on-demand charter. Only a carrier with a Part 135 air carrier certificate may legally operate a charter flight for hire.',
        `The certificate holder, the operator, is responsible for operational control of your flight. ${cfg.businessModel === 'broker' ? `${cfg.name} is a broker: we arrange the flight, we do not operate it. The operator and tail number are named on your quote and charter agreement.` : ''}`,
      ],
      list: ['Pilot qualification and recurrent training standards', 'Aircraft maintenance programmes and inspections', 'Duty and rest limits for crew', 'Operational control and dispatch procedures'],
      photo: 'pilotsCockpit',
      photo2: 'cockpitModern',
      id: 'p135-h',
    }),
    `<section class="section section--ink" data-waypoint="Audits" aria-labelledby="aud-h"><div class="container">
      ${head({ kicker: 'Beyond the minimum', title: 'Independent safety audits we use', lede: 'Many corporate flight departments will only fly operators that hold a third-party audit rating. We screen against the same programmes.', id: 'aud-h' })}
      <div class="grid grid-3 audits" data-stagger>
        <article class="audit"><h3>ARGUS</h3><p>Rates operators in tiers based on operational data, safety management and pilot experience. Platinum is the top tier. Ratings can be verified with ARGUS.</p></article>
        <article class="audit"><h3>Wyvern</h3><p>Audits operators against its own standards and publishes registered operator levels. Look for the operator on Wyvern's directory.</p></article>
        <article class="audit"><h3>IS-BAO</h3><p>A safety management standard for business aviation operators, developed by the International Business Aviation Council.</p></article>
      </div>
      <p class="fine" data-reveal>These programmes are described so you know what to ask for. Ratings belong to individual operators and are shown on your quote only where an operator holds them. Always verify with the audit provider.</p>
    </div></section>`,
    B.process({
      kicker: 'Our checks',
      title: 'What we check before an aircraft is offered to you',
      tone: 'paper',
      steps: [
        ['Certificate and authority', 'Active FAA Part 135 certificate, operations specifications and any restrictions.'],
        ['Audit rating', 'Current ARGUS, Wyvern or equivalent rating, and the date of the last audit.'],
        ['Crew', 'Minimum pilot hours, type experience and recurrent training records.'],
        ['Aircraft', 'Age, maintenance status and any open items for the specific tail number.'],
        ['Insurance', 'Liability cover limits and who is named on the policy.'],
        ['Substitution and control', 'How the operator approves any aircraft swap, so you are never moved onto an unvetted aircraft.'],
      ],
      id: 'chk-h',
    }),
    B.split({
      kicker: 'Ask any provider',
      title: 'Seven questions to ask any charter company',
      list: [
        'Who is the operator, and what is the Part 135 certificate number?',
        'What is the tail number of my aircraft?',
        'Which independent safety audits does the operator hold?',
        'What are the pilots’ minimum hours and training standards?',
        'What insurance covers the flight and passengers?',
        'Under what conditions can the aircraft be substituted?',
        'What are the cancellation and change terms?',
      ],
      photo: 'maintenance',
      tone: 'ink',
      reverse: true,
      cta: linkArrow('~/guides/private-jet-safety-argus-wyvern-explained/', 'Read the safety explainer'),
      id: 'ask-h',
    }),
    faqBlock(faqs, { title: 'Safety FAQ' }),
    ctaBand({}),
  ].join('\n');
  return {
    path,
    title: 'Private Jet Safety: Part 135, ARGUS and Wyvern',
    description: 'How private jet charter safety works: FAA Part 135 certification, ARGUS and Wyvern audits, and the checks we make on every operator before you fly.',
    body,
    ogPhoto: 'pilotsBack',
    headerMode: 'over',
    breadcrumbs: crumbs(['Safety', path]),
    preload: [preload('pilotsBack')],
    schema: [schemas.faqSchema(faqs)],
  };
}

function concierge() {
  const path = '/concierge/';
  const faqs = pick('catering', 'pets', 'wifi', 'bags');
  const services = [
    ['catering', 'dining', 'Catering', 'Menus from local restaurants and caterers, built around your tastes, allergies and the flight time.'],
    ['chauffeur', 'car', 'Ground transport', 'Chauffeured cars to the aircraft door, SUVs for large groups and bags, and pickup on arrival.'],
    ['helicopterInterior', 'helicopter', 'Helicopter transfers', 'Skip the last-mile traffic into city centres and resort towns where helipads are available.'],
    ['petTravel', 'heart', 'Pets', 'Most operators fly dogs and cats in the cabin. We match you with one that does, and note what documents you need.'],
    ['familyLuggage', 'users', 'Families and children', 'Car seats, snacks and entertainment, with schedules built around naps and mealtimes.'],
    ['cabinWorking', 'wifi', 'Work and connectivity', 'Wi-Fi, power and privacy for calls and documents, on aircraft that offer them.'],
    ['lounge', 'bed', 'Hotels and lounges', 'Rooms, villas and private lounges arranged at your destination, from a quick overnight to a long stay.'],
    ['stadium', 'trophy', 'Events and tickets', 'Support for big sporting and entertainment weekends, with ground transport timed to the event.'],
  ];
  const body = [
    pageHero({
      kicker: 'Concierge',
      h1: 'Private jet concierge: the details, handled',
      lede: 'Your advisor arranges the extras that turn a flight into a smooth door-to-door journey: food, cars, helicopters, hotels and pets.',
      photo: 'cabinChampagne',
      crumbs: crumbs(['Concierge', path]),
      ctas: quoteBtn,
    }),
    `<section class="section section--paper" data-waypoint="Services" aria-labelledby="svc-h"><div class="container">
      ${head({ kicker: 'Services', title: 'Everything around the flight', id: 'svc-h' })}
      <div class="grid grid-4 svc" data-stagger>
        ${services
          .map(
            ([p, i, t, d]) => `<article class="svc-card" data-tilt><div class="svc-media">${img(p, { sizes: '(min-width: 1000px) 25vw, (min-width: 600px) 50vw, 100vw', widths: [480, 800, 1200] })}</div><div class="svc-body"><span class="pillar-ico">${icon(i)}</span><h3>${t}</h3><p>${d}</p></div></article>`
          )
          .join('')}
      </div>
    </div></section>`,
    `<section class="section section--ink" data-waypoint="Onboard" aria-labelledby="ob-h"><div class="container">
      ${head({ kicker: 'The cabin', title: 'What the onboard experience looks like', lede: 'Cabins vary by aircraft class. Photos are representative of the kind of interiors on the market.', id: 'ob-h' })}
      <div class="gallery" data-stagger>
        ${['cabinEmpty1', 'cabinEmpty2', 'cabinService', 'cabinCouple', 'cabinToast', 'cabinEmpty3']
          .map((k) => `<figure class="gal-item" data-cursor="View"><div class="media">${img(k, { sizes: '(min-width: 1000px) 33vw, 50vw', widths: [480, 800, 1200] })}</div></figure>`)
          .join('')}
      </div>
    </div></section>`,
    faqBlock(faqs, { title: 'Concierge FAQ' }),
    ctaBand({}),
  ].join('\n');
  return {
    path,
    title: 'Private Jet Concierge: Catering, Cars, Pets and More',
    description: 'Private jet concierge services: gourmet catering, chauffeured cars, helicopter transfers, pet travel, hotels and events, arranged by your flight advisor.',
    body,
    ogPhoto: 'cabinChampagne',
    headerMode: 'over',
    breadcrumbs: crumbs(['Concierge', path]),
    preload: [preload('cabinChampagne')],
    schema: [schemas.faqSchema(faqs)],
  };
}

function events() {
  const path = '/events/';
  const cal = [
    ['January to March', 'Ski season', 'Aspen, Vail, Jackson Hole, Sun Valley', 'Peak holiday and President’s Day weeks sell out first.'],
    ['February', 'Championship football weekend', 'Host city varies each year', 'Book as soon as the host city is known.'],
    ['March to April', 'Spring golf and spring break', 'Palm Beach, Scottsdale, Georgia', 'Strong demand from the Northeast and Midwest.'],
    ['May', 'Race and derby weekends', 'Kentucky and Indiana', 'Airports near the venues fill up quickly.'],
    ['June to August', 'Summer escapes', 'The Hamptons, Nantucket, Mountain West', 'Friday departures and Sunday returns are the busiest legs.'],
    ['Late August to September', 'Tennis and football season', 'New York and college towns', 'Plan around match schedules and ground transport.'],
    ['December', 'Art and design weeks, holidays', 'Miami, Palm Beach, mountain resorts', 'Holiday weeks need the earliest planning of the year.'],
  ];
  const body = [
    pageHero({
      kicker: 'Events and seasons',
      h1: 'Private jet charter for events, seasons and big weekends',
      lede: 'The best-loved weekends of the year are also the busiest. Plan early, fly to the airport nearest the action and have ground transport waiting at the aircraft.',
      photo: 'stadium',
      crumbs: crumbs(['Events', path]),
      ctas: quoteBtn,
    }),
    `<section class="section section--paper" data-waypoint="Calendar" aria-labelledby="cal-h"><div class="container">
      ${head({ kicker: 'Seasonal demand', title: 'When and where private flying peaks', lede: 'A general guide to when aircraft are in highest demand. Specific dates and venues change each year.', id: 'cal-h' })}
      <div data-reveal>${B.table(['When', 'What', 'Where', 'Planning note'], cal)}</div>
    </div></section>`,
    B.features({
      kicker: 'Event travel',
      title: 'What we arrange for events',
      tone: 'ink',
      items: [
        ['plane', 'Aircraft matched to the group', 'From a light jet for four to heavy jets for a full party, with airliners for larger groups on request.'],
        ['car', 'Ground transport', 'Cars timed to the event, with drivers briefed on drop-off points and curfews.'],
        ['pin', 'The right airport', 'Often a smaller airport near the venue, with less congestion than the main airport.'],
        ['calendar', 'Flexible timing', 'Departure times that follow the event schedule, not an airline timetable.'],
        ['dining', 'Catering and hospitality', 'Welcome champagne, post-event meals and anything you want waiting on board.'],
        ['bell', 'Early alerts', 'Tell us your target weekend and we will flag availability and any empty leg opportunities.'],
      ],
      id: 'ev-h',
    }),
    S.popularRoutes(['new-york-to-aspen', 'los-angeles-to-las-vegas', 'new-york-to-palm-beach'], { title: 'Popular event and season routes', lede: 'Starting points for popular seasonal trips.', all: false }),
    ctaBand({ title: 'Planning a big weekend?' }),
  ].join('\n');
  return {
    path,
    title: 'Private Jet Charter for Events, Sports and Seasons',
    description: 'Charter a private jet for sporting events, ski season, festivals and holidays. A seasonal demand guide, event-ready ground transport and early availability alerts.',
    body,
    ogPhoto: 'stadium',
    headerMode: 'over',
    breadcrumbs: crumbs(['Events', path]),
    preload: [preload('stadium')],
    schema: [],
  };
}

function group() {
  const path = '/group-charter/';
  const faqs = pick('group', 'bags', 'cost', 'cancel');
  const body = [
    pageHero({
      kicker: 'Group charter',
      h1: 'Group private jet charter, from 4 to 400',
      lede: 'Jets for up to 16, airliners for larger groups. One manifest, one itinerary, one advisor, with baggage, equipment and catering planned in advance.',
      photo: 'cabinFriends',
      crumbs: crumbs(['Group charter', path]),
      ctas: quoteBtn + callBtn,
    }),
    `<section class="section section--paper" data-waypoint="Capacity" aria-labelledby="cap-h"><div class="container">
      ${head({ kicker: 'Capacity', title: 'Which aircraft for which group size', id: 'cap-h' })}
      <div data-reveal>${B.table(['Group size', 'Aircraft', 'Notes'], [
        ['Up to 6', '<a href="~/fleet/light-jets/">Light jet</a>', 'Most economical for short trips, limited baggage'],
        ['7 to 9', '<a href="~/fleet/midsize-jets/">Midsize</a> or <a href="~/fleet/super-midsize-jets/">super-midsize</a>', 'Stand-up cabin, good baggage space'],
        ['10 to 16', '<a href="~/fleet/heavy-jets/">Heavy</a> or <a href="~/fleet/ultra-long-range-jets/">ultra-long-range</a>', 'Cabin zones, large baggage hold, long range'],
        ['17 to 100+', 'VIP airliner (on request)', 'Sports teams, tour groups, large corporate movements'],
      ])}</div>
    </div></section>`,
    B.process({
      kicker: 'Planning a group',
      title: 'What we need to plan a group flight',
      steps: [
        ['Headcount and names', 'Final names must match photo ID. We can start with an estimate.'],
        ['Baggage and equipment', 'Weight and volume decide the aircraft: instruments, team gear, skis, golf clubs.'],
        ['Timing and flexibility', 'A flexible window opens more aircraft and often a better price.'],
        ['Ground and catering', 'Buses or SUVs, hotels and meal plans around the flight.'],
      ],
      tone: 'dark',
      id: 'grp-h',
    }),
    B.split({
      kicker: 'Who we fly',
      title: 'Teams, tours, weddings and celebrations',
      list: ['Sports teams and entertainment tours', 'Corporate retreats and road shows', 'Family reunions and destination weddings', 'Birthday and milestone trips'],
      photo: 'cabinGroup',
      tone: 'paper',
      cta: quoteBtn,
      id: 'who-h',
    }),
    faqBlock(faqs, { title: 'Group charter FAQ' }),
    ctaBand({}),
  ].join('\n');
  return {
    path,
    title: 'Group Private Jet Charter for Teams and Parties',
    description: 'Charter a private jet or VIP airliner for teams, tours, weddings and corporate groups. Capacity guide, planning checklist and one advisor from quote to landing.',
    body,
    ogPhoto: 'cabinFriends',
    headerMode: 'over',
    breadcrumbs: crumbs(['Group charter', path]),
    preload: [preload('cabinFriends')],
    schema: [schemas.faqSchema(faqs)],
  };
}

function corporate() {
  const path = '/corporate-charter/';
  const faqs = pick('broker', 'safety', 'payment', 'cancel');
  const body = [
    pageHero({
      kicker: 'Corporate charter',
      h1: 'Corporate jet charter for teams that value their time',
      lede: 'Be in two cities in one day. Corporate accounts bring a dedicated advisor, a single monthly invoice, travel-policy controls and safety screening that meets a flight department’s standards.',
      photo: 'boardroom',
      crumbs: crumbs(['Corporate charter', path]),
      ctas: btn('~/contact/', 'Open a corporate account') + callBtn,
    }),
    B.features({
      kicker: 'For companies',
      title: 'What a corporate account includes',
      items: [
        ['briefcase', 'Dedicated advisor', 'One named contact who knows your travellers, preferences and approvals.'],
        ['doc', 'Single invoice and reporting', 'Consolidated billing and trip reports for finance and travel managers.'],
        ['shield', 'Duty-of-care screening', 'Operators checked against Part 135 status, independent audits and insurance, with records on request.'],
        ['users', 'Authorised travellers', 'Approve who can request flights and set limits by trip or budget.'],
        ['lock', 'Confidential by design', 'Private terminals and discreet handling for sensitive trips and announcements.'],
        ['route', 'Road shows and multi-leg', 'Plan multi-city itineraries with crew duty and turn-times worked out for you.'],
      ],
      id: 'corp-h',
    }),
    `<section class="section section--ink" data-waypoint="Time value" aria-labelledby="roi-h"><div class="container">
      ${head({ kicker: 'The business case', title: 'What is an hour of your team’s time worth?', lede: 'A rough calculator for the time saved by flying private. Enter your own figures.', id: 'roi-h' })}
      <div class="roi" data-roi data-reveal>
        <div class="roi-inputs">
          <label class="field"><span>Travellers</span><input type="number" min="1" max="16" value="3" data-roi-n></label>
          <label class="field"><span>Average cost of one person’s hour (USD)</span><input type="number" min="10" max="2000" value="150" step="10" data-roi-rate></label>
          <label class="field"><span>Hours saved per round trip</span><input type="number" min="0" max="24" value="4" step="0.5" data-roi-hrs></label>
        </div>
        <div class="roi-out"><small>Value of time saved per round trip</small><b data-roi-out>$1,800</b><p>Compare this against the extra cost of flying private on your route. It ignores less tangible benefits such as privacy, flexibility and fewer disruptions.</p></div>
      </div>
    </div></section>`,
    B.split({
      kicker: 'Safety and compliance',
      title: 'Screened to the standard a flight department expects',
      paras: ['Every flight is operated by an FAA Part 135 carrier. We check audit ratings, insurance, pilot standards and substitution policy, and we can share the operator documentation your risk team needs.'],
      list: ['Operator and tail number named before you pay', 'Audit ratings you can verify directly', 'Written substitution and cancellation terms'],
      photo: 'pilotsFocus',
      tone: 'paper',
      cta: linkArrow('~/safety/', 'How we vet operators'),
      id: 'corp-safe-h',
    }),
    `<section class="section section--ink" data-waypoint="Account" aria-labelledby="acct-h"><div class="container container--narrow">
      ${head({ kicker: 'Corporate accounts', title: 'Tell us about your travel', id: 'acct-h', center: true })}
      <div data-reveal>${B.leadForm({
        fields: [
          ['text', 'name', 'Full name', { required: true, auto: 'name' }],
          ['email', 'email', 'Work email', { required: true, auto: 'email' }],
          ['text', 'company', 'Company', { required: true, auto: 'organization' }],
          ['tel', 'phone', 'Mobile', { auto: 'tel' }],
          ['select', 'volume', 'Expected flights per year', { options: ['1 to 5', '6 to 15', '16 to 40', '40 or more', 'Not sure'] }],
          ['textarea', 'notes', 'Typical routes and requirements', { wide: true }],
        ],
        topic: 'Corporate account enquiry',
        submit: 'Request a corporate account',
        success: 'Thanks. A dedicated advisor will contact you shortly.',
      })}</div>
    </div></section>`,
    faqBlock(faqs, { title: 'Corporate charter FAQ' }),
    ctaBand({}),
  ].join('\n');
  return {
    path,
    title: 'Corporate Jet Charter: Accounts for Business Travel',
    description: 'Corporate private jet charter with a dedicated advisor, consolidated billing, duty-of-care screening and confidential handling. Open an account in minutes.',
    body,
    ogPhoto: 'boardroom',
    headerMode: 'over',
    breadcrumbs: crumbs(['Corporate charter', path]),
    preload: [preload('boardroom')],
    schema: [schemas.serviceSchema({ name: 'Corporate private jet charter', description: 'Corporate accounts for private jet charter.', path, serviceType: 'Corporate air charter' }), schemas.faqSchema(faqs)],
  };
}

function compare() {
  const path = '/compare/';
  const faqs = pick('frac', 'jet-card', 'cost');
  const body = [
    pageHero({
      kicker: 'Compare',
      h1: 'Private jet charter vs jet card vs fractional ownership',
      lede: 'Three ways to fly private, three very different commitments. Compare cost, flexibility and who each is best for.',
      photo: 'cabinEmpty2',
      crumbs: crumbs(['Compare', path]),
    }),
    S.compareTable({ id: 'cmp-h' }),
    B.split({
      kicker: 'On-demand charter',
      title: 'Best when you fly occasionally or want choice',
      list: ['Pay per flight, no commitment', 'Pick the best aircraft each time', 'Compare quotes freely', 'Price moves with demand and season'],
      photo: 'jetRunwayA',
      tone: 'ink',
      cta: linkArrow('~/private-jet-charter/', 'How charter works'),
      id: 'c1-h',
    }),
    B.split({
      kicker: 'Jet card',
      title: 'Best when you fly regularly and value certainty',
      list: ['Prepaid hours at agreed rates', 'Priority availability', 'Check peak-day and repositioning terms', 'Usually no ownership or contract term'],
      photo: 'cabinEmpty1',
      tone: 'paper',
      reverse: true,
      cta: linkArrow('~/jet-card/', 'Explore jet cards'),
      id: 'c2-h',
    }),
    B.split({
      kicker: 'Fractional ownership',
      title: 'Best when you fly a lot and the schedule is predictable',
      list: ['Share of a specific aircraft', 'Multi-year commitment and monthly fee', 'Consistent aircraft and crew standards', 'Resale depends on the market'],
      paras: ['We do not sell fractional shares. We include them so you can compare honestly, and we will tell you when your flying points toward a card or a share.'],
      photo: 'jetGulfstream',
      tone: 'ink',
      id: 'c3-h',
    }),
    faqBlock(faqs, { title: 'Comparing ways to fly private' }),
    ctaBand({ title: 'Not sure which fits?', lede: 'Tell us how often you fly and where. We will give you an honest comparison, even if the answer is that charter is cheaper.' }),
  ].join('\n');
  return {
    path,
    title: 'Charter vs Jet Card vs Fractional: Compare',
    description: 'Compare on-demand private jet charter, jet cards and fractional ownership by cost, commitment and availability, with a clear guide to which suits your flying hours.',
    body,
    ogPhoto: 'cabinEmpty2',
    headerMode: 'over',
    breadcrumbs: crumbs(['Compare', path]),
    preload: [preload('cabinEmpty2')],
    schema: [schemas.faqSchema(faqs)],
  };
}

function destinations() {
  const path = '/destinations/';
  const dfaqs = pick('airports', 'weather', 'intl', 'bags');
  const dests = [
    ['aspen', 'Aspen, Colorado', 'ASE', 'Ski season and summer festivals at a high-elevation mountain airport. Eagle County (Vail) is the usual alternate.', ['new-york-to-aspen', 'los-angeles-to-aspen', 'chicago-to-aspen', 'dallas-to-aspen', 'houston-to-aspen']],
    ['jackson', 'Jackson Hole, Wyoming', 'JAC', 'The only commercial airport inside a US national park, with strict operating rules in peak weeks.', ['san-francisco-to-jackson-hole']],
    ['palmBeach', 'Palm Beach, Florida', 'PBI', 'Winter homes, golf and holidays, with private terminals on the airfield.', ['new-york-to-palm-beach', 'atlanta-to-palm-beach', 'washington-dc-to-palm-beach']],
    ['miami', 'Miami, Florida', 'OPF', 'Executive airports in north Miami-Dade put you close to the beach and the city.', ['new-york-to-miami', 'miami-to-nassau']],
    ['hamptons', 'The Hamptons, New York', 'HTO', 'Under an hour from New York in summer, with local access rules to check.', ['new-york-to-the-hamptons']],
    ['nantucket', 'Nantucket, Massachusetts', 'ACK', 'A busy summer island airport where early booking pays off.', ['boston-to-nantucket']],
    ['lasvegas', 'Las Vegas, Nevada', 'LAS', 'Weekend trips, conventions and events, close to the Strip.', ['los-angeles-to-las-vegas']],
    ['loscabos', 'Los Cabos, Mexico', 'SJD', 'International beach escape with customs clearance at both ends.', ['los-angeles-to-los-cabos']],
    ['nassau', 'Nassau, Bahamas', 'NAS', 'A quick international hop from South Florida.', ['miami-to-nassau']],
  ];
  const body = [
    pageHero({
      kicker: 'Destinations',
      h1: 'Private jet destinations: where our travellers go',
      lede: 'From mountain towns to island airports, the destinations that private aircraft reach best, and the routes that get you there.',
      photo: 'aspen',
      crumbs: crumbs(['Destinations', path]),
      ctas: btn('~/routes/', 'Browse all routes'),
    }),
    `<section class="section section--paper" data-waypoint="Destinations" aria-labelledby="dest-h"><div class="container">
      ${head({ kicker: 'Seasonal favourites', title: 'Popular private jet destinations', id: 'dest-h' })}
      <div class="dests" data-stagger>
        ${dests
          .map(([p, name, code, text, slugs]) => {
            const links = slugs
              .map((s) => routes.find((r) => r.slug === s))
              .filter(Boolean)
              .map((r) => `<a href="~/routes/${r.slug}/">${r.a.city} to ${r.b.city}</a>`)
              .join('');
            return `<article class="dest" id="${p.toLowerCase()}" data-tilt><div class="dest-media">${img(p, { sizes: '(min-width: 1000px) 33vw, (min-width: 600px) 50vw, 100vw', widths: [480, 800, 1200] })}<span class="pcard-tag">${code}</span></div><div class="dest-body"><h3>${name}</h3><p>${text}</p><div class="dest-links">${links}</div></div></article>`;
          })
          .join('')}
      </div>
    </div></section>`,
    `<section class="section section--ink" data-waypoint="When to go" aria-labelledby="cal-h"><div class="container">
      ${head({ kicker: 'Seasonal planning', title: 'When each destination is busiest', lede: 'Demand for private aircraft follows the seasons. Book early for the peak periods below, or travel just outside them for easier availability.', id: 'cal-h' })}
      <div data-reveal>${B.table(['Destination', 'Peak season', 'Quieter', 'Planning note'], [
        ['Aspen', 'Dec to Mar, July to Aug', 'Apr to May, Oct to Nov', 'High-elevation airport with weight and weather limits. Eagle County is the usual alternate.'],
        ['Jackson Hole', 'Dec to Mar, Jul to Aug', 'Apr to May, Oct', 'National-park airport with strict noise rules and limited peak slots.'],
        ['Palm Beach', 'Dec to Apr', 'Jun to Sep', 'Holiday weekends book out first. Busy Sunday-evening returns.'],
        ['Miami', 'Dec to Apr', 'Jun to Sep', 'Executive airports in north Miami-Dade save time over the main terminals.'],
        ['The Hamptons', 'Memorial Day to Labor Day', 'Oct to Apr', 'East Hampton has local access rules. Check before you book.'],
        ['Nantucket', 'Jun to Sep', 'Oct to May', 'Limited ramp space in summer, so parking and timing matter.'],
        ['Las Vegas', 'Fri to Sun, convention weeks', 'Midweek, Jul to Aug', 'Big events and fight weekends can sell out aircraft.'],
        ['Los Cabos and Nassau', 'Dec to Apr', 'Jun to Oct', 'International: passports and customs clearance at both ends.'],
      ])}</div>
    </div></section>`,
    faqBlock(dfaqs, { title: 'Planning a destination trip' }),
    ctaBand({}),
  ].join('\n');
  return {
    path,
    title: 'Private Jet Destinations: Aspen, Palm Beach, Hamptons',
    description: 'Popular private jet destinations including Aspen, Jackson Hole, Palm Beach, Miami, the Hamptons, Nantucket, Las Vegas and Los Cabos, with the routes that reach them.',
    body,
    ogPhoto: 'aspen',
    headerMode: 'over',
    breadcrumbs: crumbs(['Destinations', path]),
    preload: [preload('aspen')],
    schema: [schemas.itemListSchema('Private jet destinations', dests.map((d) => ({ name: d[1], path: `${path}#${d[0].toLowerCase()}` }))), schemas.faqSchema(dfaqs)],
  };
}

function operators() {
  const path = '/operators/';
  const faqs = pick('operator', 'broker', 'safety');
  const body = [
    pageHero({
      kicker: 'For operators',
      h1: 'List your aircraft and receive verified charter requests',
      lede: 'If you hold an FAA Part 135 certificate, join our operator network and fill empty flight hours with qualified, pre-screened requests.',
      photo: 'jetsDramatic',
      crumbs: crumbs(['For operators', path]),
      ctas: btn('#apply', 'Apply to list your aircraft'),
    }),
    B.features({
      kicker: 'Why list',
      title: 'What operators get',
      items: [
        ['users', 'Qualified demand', 'Requests with route, dates, passengers and budget already captured.'],
        ['repeat', 'Fill empty legs', 'Put repositioning flights in front of flexible travellers.'],
        ['doc', 'Clear paperwork', 'Standard quote and charter agreement, with your terms.'],
        ['shield', 'Respect for operational control', 'You retain operational control, crew decisions and safety authority.'],
      ],
      cols: 4,
      id: 'why-op-h',
    }),
    B.process({
      kicker: 'Requirements',
      title: 'What we need to list an aircraft',
      tone: 'dark',
      steps: [
        ['Part 135 certificate', 'Active air carrier certificate and operations specifications.'],
        ['Audit rating', 'Current ARGUS, Wyvern or equivalent rating, where held.'],
        ['Insurance', 'Certificates showing liability limits and named insureds.'],
        ['Aircraft details', 'Tail numbers, age, base, amenities, and your typical availability.'],
      ],
      id: 'req-h',
    }),
    `<section class="section section--paper" id="apply" data-waypoint="Apply" aria-labelledby="apply-h"><div class="container container--narrow">
      ${head({ kicker: 'Apply', title: 'Tell us about your fleet', id: 'apply-h', center: true })}
      <div data-reveal>${B.leadForm({
        fields: [
          ['text', 'company', 'Operator name', { required: true, auto: 'organization' }],
          ['text', 'name', 'Contact name', { required: true, auto: 'name' }],
          ['email', 'email', 'Email', { required: true, auto: 'email' }],
          ['tel', 'phone', 'Phone', { auto: 'tel' }],
          ['text', 'cert', 'Part 135 certificate number', { required: true }],
          ['text', 'fleet', 'Aircraft types and base airports', { wide: true }],
        ],
        topic: 'Operator application',
        submit: 'Submit application',
        success: 'Thanks. Our operations team will review your details and follow up.',
      })}</div>
    </div></section>`,
    faqBlock(faqs, { title: 'Operator FAQ' }),
  ].join('\n');
  return {
    path,
    title: 'List Your Jet for Charter: Operator Network',
    description: 'FAA Part 135 operators can list aircraft with us and receive verified charter requests. See the requirements and apply in minutes.',
    body,
    ogPhoto: 'jetsDramatic',
    headerMode: 'over',
    breadcrumbs: crumbs(['For operators', path]),
    preload: [preload('jetsDramatic')],
    schema: [schemas.faqSchema(faqs)],
  };
}

module.exports = () => [charter(), quote(), cost(), emptyLegPage(), jetCard(), howItWorks(), safety(), concierge(), events(), group(), corporate(), compare(), destinations(), operators()];
