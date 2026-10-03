'use strict';
/** About, contact, FAQ, guides hub and guide articles. */
const cfg = require('../config');
const S = require('../lib/sections');
const B = require('../lib/blocks');
const { pageHero, faqBlock, ctaBand, head, btn, linkArrow, icon, img, esc, photoCard } = require('../lib/ui');
const { schemas, abs } = require('../lib/layout');
const { preload } = require('../lib/img');
const { faqs, pick } = require('../data/faqs');
const { posts, bySlug } = require('../data/posts');

const crumbs = (...items) => [{ name: 'Home', path: '/' }, ...items.map(([name, path]) => ({ name, path }))];
const quoteBtn = btn('~/instant-quote/', 'Get an instant quote');
const callBtn = `<a class="btn btn-ghost" href="tel:${cfg.phoneHref}">${icon('phone')}<span>${cfg.phone}</span></a>`;

/* ------------------------------------------------------------------ about */
function about() {
  const path = '/about/';
  const broker = cfg.businessModel === 'broker';
  const body = [
    pageHero({
      kicker: `About ${cfg.name}`,
      h1: 'Private aviation, made straightforward',
      lede: `${cfg.name} helps people book private jet charter without the guesswork: clear pricing, vetted operators and a real person who answers at any hour.`,
      photo: 'supportTeam',
      crumbs: crumbs(['About', path]),
      ctas: quoteBtn + callBtn,
      chips: ['Transparent pricing', 'Safety first', 'Human flight desk'],
      pos: '50% 40%',
    }),
    B.split({
      kicker: 'What we do',
      title: 'We turn a complicated market into one clear quote',
      paras: [
        broker
          ? `Private jet charter is a fragmented market of hundreds of independent operators, each with their own aircraft, prices and terms. ${esc(cfg.name)} searches that market for you, checks the operators and presents a short list of firm options.`
          : `${esc(cfg.name)} operates its own fleet under FAA Part 135 authority and arranges additional aircraft when your trip needs them.`,
        'You see the aircraft, the operator, the itemised price and the terms before you pay, and one advisor looks after the trip from the first message to the moment you land.',
      ],
      list: ['Firm, itemised quotes with no hidden line items', 'Operators screened against independent safety audits', 'Concierge arrangements: catering, cars, helicopters and pets', 'A 24/7 flight desk for changes, delays and questions'],
      photo: 'support',
      photo2: 'lounge',
      cta: btn('~/how-it-works/', 'See how it works', 'ghost'),
      id: 'wd-h',
      waypoint: 'What we do',
    }),
    B.features({
      kicker: 'Principles',
      title: 'What you can expect from us',
      items: [
        ['shield', 'Safety before price', 'An aircraft is only offered once its operator clears our checks. We would rather lose a booking than compromise on this.'],
        ['tag', 'Prices you can read', 'Quotes show the hourly rate, fees and taxes separately, so you can compare like with like.'],
        ['headset', 'A person on the other end', 'Calls, texts and WhatsApp are answered by an advisor, not a chatbot, including at night and on weekends.'],
        ['doc', 'Honest about how we operate', 'We say clearly who operates your flight, what is estimated and what is firm. No surprises on the charter agreement.'],
      ],
      cols: 4,
      tone: 'ink',
      id: 'pr-h',
    }),
    B.process({
      kicker: 'Our process',
      title: 'How every trip is handled',
      lede: 'The same careful steps, whether it is a one-hour hop or an intercontinental flight.',
      steps: [
        ['Understand the trip', 'Route, dates, passengers, bags, pets and special requests, so the aircraft is sized properly.'],
        ['Search the market', 'We check aircraft across vetted operators, including repositioning flights that may lower your price.'],
        ['Vet and quote', 'Safety, insurance and aircraft details are checked, then you receive firm, itemised options.'],
        ['Fly and support', 'Your advisor confirms the details, stays reachable during the trip and handles anything that changes.'],
      ],
      tone: 'dark',
      id: 'pc-h',
    }),
    S.safetyBlock(),
    ctaBand({ title: 'Let us plan your next flight', photo: 'nightCity' }),
  ].join('\n');
  return {
    path,
    title: `About ${cfg.name}: Private Jet Charter, Made Simple`,
    description: `${cfg.name} arranges private jet charter across the US with clear pricing, vetted operators and a 24/7 flight advisor. Learn how we work and what to expect.`,
    body,
    ogPhoto: 'supportTeam',
    headerMode: 'over',
    breadcrumbs: crumbs(['About', path]),
    preload: [preload('supportTeam')],
    schema: [],
  };
}

/* ------------------------------------------------------------------ contact */
function contact() {
  const path = '/contact/';
  const faqs = pick('how-fast', 'cost', 'broker');
  const body = [
    pageHero({
      kicker: 'Contact',
      h1: 'Talk to a flight advisor',
      lede: 'Call, message or write. A real person replies, usually within minutes, at any hour of the day.',
      photo: 'supportTeam',
      crumbs: crumbs(['Contact', path]),
      chips: ['24/7 flight desk', 'Phone · WhatsApp · Email'],
      pos: '50% 30%',
    }),
    `<section class="section section--paper quote-section" data-waypoint="Contact" aria-label="Contact options">
      <div class="container quote-grid">
        <div class="quote-main" data-reveal>
          ${B.leadForm({
            title: 'Send us a message',
            intro: 'For a priced trip, the <a href="~/instant-quote/">instant quote</a> is quicker. Use this form for anything else.',
            fields: [
              ['text', 'name', 'Full name', { required: true, auto: 'name' }],
              ['email', 'email', 'Email', { required: true, auto: 'email' }],
              ['tel', 'phone', 'Phone', { auto: 'tel' }],
              ['select', 'topic', 'Topic', { options: ['Charter quote', 'Empty leg flights', 'Jet card', 'Corporate account', 'Partnership or press', 'Something else'] }],
              ['textarea', 'message', 'How can we help?', { required: true, wide: true, rows: 5 }],
            ],
            topic: 'Contact form',
            submit: 'Send message',
            success: 'Thank you. An advisor will reply shortly.',
          })}
        </div>
        <aside class="quote-side">
          <div class="side-card" data-reveal><h2>Reach us directly</h2>${B.contactMethods()}</div>
          <div class="side-card" data-reveal>
            <h2>Flight desk hours</h2>
            <p>Open ${cfg.hours}. Urgent change to a booked flight? Call, do not email.</p>
            ${cfg.address ? `<p class="fine">${esc(cfg.address)}</p>` : ''}
          </div>
          <div class="side-card side-card--note" data-reveal><p>${icon('briefcase')} Operator with an aircraft to list? <a href="~/operators/">Apply here</a>.</p></div>
        </aside>
      </div>
    </section>`,
    faqBlock(faqs, { title: 'Quick answers' }),
    S.skvData(),
  ].join('\n');
  return {
    path,
    title: 'Contact: Talk to a Private Jet Advisor 24/7',
    description: `Call ${cfg.phone}, WhatsApp or email a flight advisor for a private jet quote, empty leg deals or a corporate account. A person replies, any hour.`,
    body,
    ogPhoto: 'supportTeam',
    headerMode: 'over',
    breadcrumbs: crumbs(['Contact', path]),
    preload: [preload('supportTeam')],
    schema: [{ '@context': 'https://schema.org', '@type': 'ContactPage', name: `Contact ${cfg.name}`, url: abs(path) }, schemas.faqSchema(faqs)],
  };
}

/* ------------------------------------------------------------------ faq */
const FAQ_GROUPS = [
  ['pricing', 'Pricing and booking', ['cost', 'how-fast', 'payment', 'fet', 'cancel', 'empty-leg']],
  ['safety', 'Safety and operators', ['broker', 'safety', 'operator', 'weather']],
  ['flying', 'Flying day and onboard', ['airports', 'arrive', 'id', 'bags', 'pets', 'wifi', 'catering', 'group', 'intl']],
  ['programs', 'Jet cards and ownership', ['jet-card', 'frac']],
];
function faqPage() {
  const path = '/faq/';
  const used = new Set(FAQ_GROUPS.flatMap((g) => g[2]));
  const leftovers = faqs.filter((f) => !used.has(f.id)).map((f) => f.id);
  const groups = FAQ_GROUPS.map((g) => [g[0], g[1], [...g[2], ...(g[0] === 'flying' ? leftovers : [])]]);
  const all = groups.flatMap((g) => pick(...g[2]));
  const sections = groups
    .map(([id, title, ids], gi) => {
      const list = pick(...ids);
      return `<section class="faq-group" id="${id}" aria-labelledby="${id}-h"><h2 class="h3" id="${id}-h" data-reveal>${title}</h2>
      <div class="acc" data-accordion data-stagger>${list.map((f) => `<details class="acc-item"><summary><span>${esc(f.q)}</span>${icon('plus')}</summary><div class="acc-body"><p>${esc(f.a)}</p></div></details>`).join('')}</div></section>`;
    })
    .join('');
  const body = [
    pageHero({
      kicker: 'FAQ',
      h1: 'Private jet charter FAQ',
      lede: `${all.length} straight answers on pricing, safety, airports, baggage, pets and how booking works.`,
      photo: 'cabinWindow',
      crumbs: crumbs(['FAQ', path]),
      chips: groups.map((g) => g[1]),
    }),
    `<section class="section section--paper" data-waypoint="Questions" aria-label="Questions and answers"><div class="container faq-page">
      <nav class="faq-nav" aria-label="FAQ topics"><p class="eyebrow">Topics</p><ul>${groups.map(([id, title]) => `<li><a href="#${id}">${title}</a></li>`).join('')}</ul>
        <div class="side-card side-card--note"><p>Not here? <a href="~/contact/">Ask an advisor</a> or call <a href="tel:${cfg.phoneHref}">${cfg.phone}</a>.</p></div></nav>
      <div class="faq-groups">${sections}</div>
    </div></section>`,
    ctaBand({ photo: 'jetRunwayB' }),
  ].join('\n');
  return {
    path,
    title: 'Private Jet Charter FAQ: Cost, Safety, Booking',
    description: 'Answers to the most common private jet charter questions: cost, safety, airports, baggage, pets, empty legs, jet cards and how booking works.',
    body,
    ogPhoto: 'cabinWindow',
    headerMode: 'over',
    breadcrumbs: crumbs(['FAQ', path]),
    preload: [preload('cabinWindow')],
    schema: [schemas.faqSchema(all)],
  };
}

/* ------------------------------------------------------------------ guides */
function guidesHub() {
  const path = '/guides/';
  const [first, ...rest] = posts;
  const cats = ['All guides', ...Array.from(new Set(posts.map((p) => p.cat)))];
  const card = (p) => `<div class="filter-item" data-region="${p.cat}">${photoCard({ href: `~/guides/${p.slug}/`, photo: p.photo, title: p.title, sub: p.description, meta: [p.cat, `${p.mins} min read`], tag: p.cat })}</div>`;
  const body = [
    pageHero({
      kicker: 'Guides',
      h1: 'Private jet charter guides',
      lede: 'Plain-English answers on cost, empty legs, jet cards, safety and how to book. Written to help you decide, not to sell.',
      photo: 'cabinChampagne',
      crumbs: crumbs(['Guides', path]),
      chips: [`${posts.length} guides`, 'Updated for 2026'],
    }),
    `<section class="section section--paper" data-waypoint="Featured" aria-labelledby="ft-h"><div class="container">
      ${head({ kicker: 'Start here', title: 'The most useful guide first', id: 'ft-h' })}
      <a class="feature-post" href="~/guides/${first.slug}/" data-cursor="Read">
        <div class="feature-post-media">${img(first.photo, { sizes: '(min-width: 900px) 55vw, 100vw', widths: [800, 1200, 1800] })}</div>
        <div class="feature-post-body"><p class="eyebrow">${first.cat} · ${first.mins} min read</p><h3>${first.title}</h3><p>${first.description}</p><span class="link-arrow">Read the guide ${icon('arrow-right')}</span></div>
      </a>
    </div></section>`,
    `<section class="section section--ink" data-waypoint="All guides" aria-labelledby="ag-h"><div class="container">
      ${head({ kicker: 'All guides', title: 'Browse by topic', id: 'ag-h' })}
      <div class="filters" role="group" aria-label="Filter guides" data-filters>${cats.map((t, i) => `<button type="button" class="chip-btn${i === 0 ? ' is-active' : ''}" data-filter="${i === 0 ? 'All' : t}">${t}</button>`).join('')}</div>
      <div class="grid grid-3 filter-grid" data-filter-grid>${rest.map(card).join('')}</div>
    </div></section>`,
    ctaBand({ photo: 'jetRunwayC' }),
  ].join('\n');
  return {
    path,
    title: 'Private Jet Charter Guides: Cost, Empty Legs, Safety',
    description: 'Plain-English private jet guides: what charter costs, how empty legs work, jet card vs fractional, safety audits, flying with pets and how to choose a provider.',
    body,
    ogPhoto: 'cabinChampagne',
    headerMode: 'over',
    breadcrumbs: crumbs(['Guides', path]),
    preload: [preload('cabinChampagne')],
    schema: [schemas.itemListSchema('Private jet charter guides', posts.map((p) => ({ name: p.title, path: `/guides/${p.slug}/` })))],
  };
}

/** Add ids to h2s and build a table of contents. */
function withToc(html) {
  const toc = [];
  const used = new Set();
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (m, inner) => {
    const text = inner.replace(/<[^>]+>/g, '');
    let id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'section';
    while (used.has(id)) id += '-2';
    used.add(id);
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

function postPage(p) {
  const path = `/guides/${p.slug}/`;
  const faqList = pick(...(p.faq || []));
  const { html, toc } = withToc(p.body());
  const rel = (p.related || []).map((s) => bySlug[s]).filter(Boolean);
  const body = [
    pageHero({
      kicker: `${p.cat} · ${p.mins} min read`,
      h1: p.h1,
      lede: p.description,
      photo: p.photo,
      crumbs: crumbs(['Guides', '/guides/'], [p.h1, path]),
    }),
    `<section class="section section--paper article-section" data-waypoint="Guide" aria-label="Article">
      <div class="container article-grid">
        <aside class="toc" aria-label="On this page">
          <p class="eyebrow">On this page</p>
          <ol>${toc.map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ol>
          <div class="side-card side-card--note"><p>${icon('gauge')} <a href="~/instant-quote/">Price your own trip</a> in a minute.</p></div>
        </aside>
        <article class="prose article">
          <p class="byline">By the ${esc(cfg.name)} flight desk · Updated ${cfg.buildDate}</p>
          ${html}
          <aside class="inline-cta" data-reveal><h2>Ready to price your trip?</h2><p>Tell us the route and dates. A flight advisor replies with firm options, usually within minutes.</p><div class="cta-row">${quoteBtn}${callBtn}</div></aside>
        </article>
      </div>
    </section>`,
    faqList.length ? faqBlock(faqList, { title: 'Related questions' }) : '',
    rel.length
      ? `<section class="section section--ink" data-waypoint="Keep reading" aria-labelledby="kr-h"><div class="container">
      ${head({ kicker: 'Keep reading', title: 'More guides', id: 'kr-h' })}
      <div class="grid grid-3" data-stagger>${rel.map((x) => photoCard({ href: `~/guides/${x.slug}/`, photo: x.photo, title: x.title, sub: x.description, meta: [x.cat, `${x.mins} min read`], tag: x.cat })).join('')}</div>
    </div></section>`
      : '',
    ctaBand({ photo: 'nightCity' }),
  ].join('\n');
  return {
    path,
    title: p.title,
    description: p.description,
    body,
    ogPhoto: p.photo,
    ogType: 'article',
    headerMode: 'over',
    breadcrumbs: crumbs(['Guides', '/guides/'], [p.h1, path]),
    preload: [preload(p.photo)],
    schema: [schemas.articleSchema({ title: p.h1, description: p.description, path, date: cfg.buildDate, photo: p.photo }), ...(faqList.length ? [schemas.faqSchema(faqList)] : [])],
  };
}

module.exports = () => [about(), contact(), faqPage(), guidesHub(), ...posts.map(postPage)];
