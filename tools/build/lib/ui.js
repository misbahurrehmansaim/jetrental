'use strict';
/** Small reusable UI building blocks used by every page. */
const cfg = require('../config');
const { esc, money, roundTo, hm } = require('./util');
const { icon } = require('./icons');
const { img } = require('./img');
const { waLink } = require('./layout');

/** Section heading block. */
function head({ kicker, title, lede, center = false, dark = false, tag = 'h2', id } = {}) {
  return `<header class="sec-head${center ? ' sec-head--center' : ''}">
    ${kicker ? `<p class="eyebrow" data-reveal>${kicker}</p>` : ''}
    <${tag} class="h2" data-split${id ? ` id="${id}"` : ''}>${title}</${tag}>
    ${lede ? `<p class="lede" data-reveal>${lede}</p>` : ''}
  </header>`;
}

const btn = (href, label, kind = 'gold', extra = '') =>
  `<a class="btn btn-${kind}" href="${href}"${extra ? ' ' + extra : ''}><span>${label}</span>${icon('arrow-right')}</a>`;

const linkArrow = (href, label) => `<a class="link-arrow" href="${href}">${label} ${icon('arrow-right')}</a>`;

/** Visible breadcrumb trail. */
function crumbsHtml(crumbs) {
  if (!crumbs || crumbs.length < 2) return '';
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="~${c.path}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** Inner-page hero with photo, gradient and parallax. */
function pageHero({ kicker, h1, lede, photo, crumbs, ctas, chips, tall = false, pos }) {
  return `<section class="phero${tall ? ' phero--tall' : ''}" data-hero-inner data-waypoint="Takeoff">
  <div class="phero-media" aria-hidden="true"><div class="phero-img" data-parallax="0.18">${img(photo, { eager: true, fetchpriority: 'high', sizes: '100vw', widths: [800, 1200, 1800, 2400], pos })}</div></div>
  <div class="phero-shade" aria-hidden="true"></div>
  <div class="container phero-in">
    ${crumbsHtml(crumbs)}
    ${kicker ? `<p class="eyebrow" data-reveal>${kicker}</p>` : ''}
    <h1 class="h1" data-split>${h1}</h1>
    ${lede ? `<p class="phero-lede" data-reveal>${lede}</p>` : ''}
    ${ctas ? `<div class="phero-ctas" data-reveal>${ctas}</div>` : ''}
    ${chips ? `<ul class="chip-row" data-reveal>${chips.map((c) => `<li class="chip">${c}</li>`).join('')}</ul>` : ''}
  </div>
</section>`;
}

/** Accordion of FAQs (details/summary, animated by JS). Pass the list; schema is added by the page. */
function faqBlock(list, { title = 'Frequently asked questions', kicker = 'FAQ', lede, dark = false } = {}) {
  return `<section class="section${dark ? ' section--dark' : ''} faq" aria-labelledby="faq-h" data-waypoint="FAQ">
  <div class="container faq-grid">
    <div class="faq-intro">
      <p class="eyebrow" data-reveal>${kicker}</p>
      <h2 class="h2" id="faq-h" data-split>${title}</h2>
      ${lede ? `<p class="lede" data-reveal>${lede}</p>` : ''}
      <p class="faq-help" data-reveal>Still have a question? <a href="~/contact/">Talk to a flight advisor</a> or call <a href="tel:${cfg.phoneHref}">${cfg.phone}</a>.</p>
    </div>
    <div class="acc" data-accordion data-stagger>
      ${list
        .map(
          (f, i) => `<details class="acc-item"${i === 0 ? '' : ''}><summary><span>${esc(f.q)}</span>${icon('plus')}</summary><div class="acc-body"><p>${esc(f.a)}</p></div></details>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

/** Closing call-to-action band (non-home pages). */
function ctaBand({ title = 'Ready to fly?', lede = 'Tell us your route and dates. A flight advisor replies with firm options, usually within minutes.', photo = 'nightCity' } = {}) {
  return `<section class="cta-band" data-waypoint="Arrival" aria-label="Get a quote">
  <div class="cta-band-media" aria-hidden="true"><div data-parallax="0.15">${img(photo, { sizes: '100vw', widths: [800, 1200, 1800] })}</div></div>
  <div class="cta-band-shade" aria-hidden="true"></div>
  <div class="container cta-band-in">
    <h2 class="h2" data-split>${title}</h2>
    <p class="lede" data-reveal>${lede}</p>
    <div class="cta-row" data-reveal>
      ${btn('~/instant-quote/', 'Get an instant quote')}
      <a class="btn btn-ghost" href="tel:${cfg.phoneHref}">${icon('phone')}<span>${cfg.phone}</span></a>
      <a class="btn btn-ghost" href="${waLink('Hello, I would like a private jet quote.')}" target="_blank" rel="noopener">${icon('chat')}<span>WhatsApp</span></a>
    </div>
  </div>
</section>`;
}

/** Route (or any) card with photo. */
function photoCard({ href, photo, title, sub, meta = [], tag, cls = '' }) {
  return `<a class="pcard ${cls}" href="${href}" data-tilt data-cursor="View">
    <div class="pcard-media">${img(photo, { sizes: '(min-width: 1000px) 33vw, (min-width: 600px) 50vw, 100vw', widths: [480, 800, 1200] })}${tag ? `<span class="pcard-tag">${tag}</span>` : ''}</div>
    <div class="pcard-body">
      <h3>${title}</h3>
      ${sub ? `<p>${sub}</p>` : ''}
      ${meta.length ? `<ul class="pcard-meta">${meta.map((m) => `<li>${m}</li>`).join('')}</ul>` : ''}
      <span class="pcard-go">${icon('arrow-up-right')}</span>
    </div>
  </a>`;
}

/** Route price phrase from the estimator. */
const fromPrice = (est) => `from ${money(roundTo(est.low, 100))}`;

module.exports = { head, btn, linkArrow, crumbsHtml, pageHero, faqBlock, ctaBand, photoCard, fromPrice, hm, money, roundTo, esc, icon, img, cfg, waLink };
