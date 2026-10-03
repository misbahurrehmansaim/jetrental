'use strict';
const cfg = require('../config');
const S = require('../lib/sections');
const { faqBlock, head } = require('../lib/ui');
const { schemas } = require('../lib/layout');
const { preload } = require('../lib/img');
const { byTag, pick } = require('../data/faqs');
const { routes } = require('../data/routes');

module.exports = () => {
  const faqs = pick('cost', 'how-fast', 'broker', 'safety', 'empty-leg', 'jet-card', 'airports', 'pets');
  const estimatorSection = `<section class="section section--ink est-section" data-waypoint="Estimate" aria-labelledby="est-h">
  <div class="container">
    ${head({ kicker: 'Instant estimate', title: 'See what your trip is likely to cost', lede: 'Pick two airports and the number of passengers. We suggest an aircraft and show a realistic range, before you speak to anyone.', id: 'est-h' })}
    <div data-reveal>${S.estimator({ from: 'TEB', to: 'PBI' })}</div>
  </div>
</section>`;
  const body = [
    S.heroHome(),
    S.trustStrip(),
    S.pillars(),
    S.waysToFly(),
    S.fleetGallery(),
    S.networkMap(),
    S.popularRoutes(['new-york-to-miami', 'new-york-to-palm-beach', 'new-york-to-aspen', 'los-angeles-to-las-vegas', 'new-york-to-the-hamptons', 'boston-to-nantucket']),
    S.howSteps(),
    estimatorSection,
    S.conciergeBento(),
    S.useCases(),
    S.safetyBlock(),
    S.compareTable(),
    S.numbers(),
    S.missions(),
    faqBlock(faqs, { title: 'Questions we hear every day' }),
    S.ctaLanding(),
    S.skvData(),
  ].join('\n');
  return {
    path: '/',
    title: `Private Jet Charter USA, Instant Quotes | ${cfg.name}`,
    description: 'Charter a private jet anywhere in the US. Instant estimates, transparent hourly pricing, FAA Part 135 operators and a 24/7 flight advisor. Get a quote in minutes.',
    body,
    ogPhoto: 'heroGround',
    headerMode: 'over',
    bodyClass: 'page-home',
    preload: [preload('heroGround')],
    schema: [
      schemas.serviceSchema({ name: 'Private jet charter', description: cfg.shortDescription, path: '/' }),
      schemas.faqSchema(faqs),
    ],
  };
};
