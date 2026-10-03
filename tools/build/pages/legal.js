'use strict';
/**
 * Legal pages, HTML sitemap and the 404.
 * The legal text is a sensible STARTING TEMPLATE for a charter broker. It is not legal advice:
 * have an aviation attorney review it and replace the bracketed facts in config.js before launch.
 */
const cfg = require('../config');
const { pageHero, head, btn, icon, esc } = require('../lib/ui');
const { classes } = require('../data/fleet');
const { routes } = require('../data/routes');
const { posts } = require('../data/posts');
const { preload } = require('../lib/img');

const crumbs = (...items) => [{ name: 'Home', path: '/' }, ...items.map(([name, path]) => ({ name, path }))];
const broker = cfg.businessModel === 'broker';

function legalPage({ path, title, description, h1, intro, html }) {
  const body = `<section class="legal-head" data-waypoint="Legal">
    <div class="container container--narrow">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="~/">Home</a></li><li aria-current="page">${esc(h1)}</li></ol></nav>
      <h1 class="h1">${h1}</h1>
      <p class="lede">${intro}</p>
      <p class="fine">Last updated ${cfg.buildDate}</p>
    </div>
  </section>
  <section class="section section--paper" data-waypoint="Policy"><div class="container container--narrow prose prose--legal">${html}</div></section>`;
  return {
    path,
    title,
    description,
    body,
    headerMode: 'solid',
    breadcrumbs: crumbs([h1, path]),
    ogPhoto: 'jetRunwayA',
    schema: [],
  };
}

function privacy() {
  return legalPage({
    path: '/privacy/',
    title: 'Privacy Policy',
    h1: 'Privacy policy',
    description: `How ${cfg.name} collects, uses and protects your personal information when you request a quote, contact us or browse this website.`,
    intro: `This policy explains what personal information ${esc(cfg.name)} collects, why, and the choices you have.`,
    html: `
<h2>Who we are</h2>
<p>${esc(cfg.legalName)} ("${esc(cfg.name)}", "we", "us") operates this website. You can reach us at <a href="mailto:${cfg.email}">${cfg.email}</a>${cfg.address ? ` or at ${esc(cfg.address)}` : ''}.</p>
<h2>Information we collect</h2>
<ul>
<li><strong>Information you give us:</strong> name, email, phone number, company, trip details (airports, dates, passengers, special requests) and anything you write in a message. For a booked flight we also need passenger names and, for international trips, passport details, which are collected securely and only for that flight.</li>
<li><strong>Technical information:</strong> IP address, browser type, device, pages viewed and referring pages, collected through cookies and similar technologies.</li>
<li><strong>Communications:</strong> records of calls, messages and emails with our flight desk, kept to handle your request and improve service.</li>
</ul>
<h2>How we use it</h2>
<ul>
<li>To prepare quotes, arrange charter flights and communicate about your trip.</li>
<li>To share the details an operator needs to quote and fly your trip (see below).</li>
<li>To meet legal, security, accounting and regulatory requirements, including airline passenger-manifest and customs rules.</li>
<li>To understand how the website is used and to improve it.</li>
<li>To send you information you asked for. You can opt out of marketing messages at any time.</li>
</ul>
<h2>Who we share it with</h2>
<p>We share trip and passenger details with the air carriers, ground handlers, caterers and transport providers needed to deliver your trip, and with government authorities where required. We use service providers for hosting, analytics, payments and communication, and they may process data only on our instructions. We do not sell your personal information.</p>
<h2>Cookies and analytics</h2>
<p>We use essential cookies to make the site work and, where enabled, analytics and advertising tags to understand traffic and measure campaigns. You can block or delete cookies in your browser settings, and you can use the tools offered by analytics providers to opt out.</p>
<h2>How long we keep it</h2>
<p>We keep enquiry data for as long as needed to respond and for a reasonable period afterwards. Booking and financial records are kept for the period required by law. When data is no longer needed we delete or anonymise it.</p>
<h2>Security</h2>
<p>We use reasonable technical and organisational measures to protect your information, including encrypted connections to this website. No method of transmission over the internet is completely secure.</p>
<h2>Your choices and rights</h2>
<p>Depending on where you live, including California and other US states with privacy laws, you may have the right to ask what personal information we hold, to correct or delete it, to opt out of its sale or sharing for targeted advertising (we do not sell it), and not to be treated unfairly for exercising these rights. To make a request, email <a href="mailto:${cfg.email}">${cfg.email}</a>. We may need to verify your identity first.</p>
<h2>Children</h2>
<p>This website is not directed at children under 13, and we do not knowingly collect their personal information. Children may travel as passengers on a booking made by an adult.</p>
<h2>Changes to this policy</h2>
<p>We may update this policy from time to time. The date at the top shows when it last changed.</p>
<h2>Contact</h2>
<p>Questions about privacy? Email <a href="mailto:${cfg.email}">${cfg.email}</a> or call <a href="tel:${cfg.phoneHref}">${cfg.phone}</a>.</p>`,
  });
}

function terms() {
  return legalPage({
    path: '/terms/',
    title: 'Terms of Use',
    h1: 'Terms of use',
    description: `The terms that apply when you use the ${cfg.name} website and request quotes for private jet charter.`,
    intro: 'Please read these terms before you use this website or request a quote.',
    html: `
<h2>About this website</h2>
<p>This website is operated by ${esc(cfg.legalName)}. By using it you agree to these terms. If you do not agree, please do not use the site.</p>
<h2>Quotes, prices and estimates</h2>
<p>Prices, flight times and distances shown on this website, including those from the instant estimator, route pages and guides, are indicative market ranges for planning. They are not offers, and they are not binding. A binding price is only given in a written quote, and it is confirmed when you accept the charter agreement and pay.</p>
<h2>${broker ? 'Our role as a broker' : 'Operating carrier'}</h2>
${
  broker
    ? `<p>${esc(cfg.name)} arranges air transportation. We do not own or operate aircraft and we are not an air carrier. Each flight is operated by an independent air carrier holding an FAA Part 135 air carrier certificate, identified in your quote and charter agreement. The carrier has operational control of the flight and the pilot in command has final authority over its safe operation, including decisions to delay, divert or cancel for safety. See our <a href="~/broker-disclosure/">broker disclosure</a>.</p>`
    : `<p>Flights are operated by ${esc(cfg.legalName)} under FAA Part 135 authority, or by another certificated Part 135 carrier that we identify in your quote and charter agreement. The pilot in command has final authority over the safe operation of each flight.</p>`
}
<h2>Booking, payment and cancellation</h2>
<p>A booking is confirmed only when you have accepted the charter agreement and made the required payment. Payment, change, cancellation and refund terms are set out in your charter agreement and can vary by operator. Empty-leg and one-way offers can be time-limited and are subject to availability and operational changes.</p>
<h2>Taxes and fees</h2>
<p>Domestic charter flights are generally subject to federal excise tax and segment fees, and international flights carry other charges. Airport, handling, catering, ground transport, de-icing and similar costs may be extra. Your quote itemises what applies to your trip.</p>
<h2>Using this website</h2>
<ul>
<li>You will give accurate information when you submit forms, and you will not submit anything unlawful, misleading or harmful.</li>
<li>You will not attempt to disrupt the site, scrape it at scale, or access it other than through normal browsing.</li>
<li>All content, design and software on this site belongs to us or our licensors. Photography is credited to its creators and is representative of the aircraft and destinations shown.</li>
</ul>
<h2>Disclaimers</h2>
<p>This website and its content, including the guides, are for general information and are provided "as is". Schedules, availability and conditions at airports change, and nothing here is legal, tax or financial advice. To the maximum extent permitted by law we exclude warranties that are not stated in a charter agreement.</p>
<h2>Limitation of liability</h2>
<p>To the maximum extent permitted by law, ${esc(cfg.legalName)} is not liable for indirect or consequential loss arising from your use of this website. Liability for flights is governed by your charter agreement and applicable law. Nothing in these terms limits liability that cannot be limited by law.</p>
<h2>Governing law</h2>
<p>These terms are governed by ${esc(cfg.governingLaw)}, without regard to conflict-of-law rules. Courts located there have jurisdiction, unless the law gives you the right to bring a claim elsewhere.</p>
<h2>Changes</h2>
<p>We may change these terms by updating this page. Continued use of the website after a change means you accept the new terms.</p>
<h2>Contact</h2>
<p>Email <a href="mailto:${cfg.email}">${cfg.email}</a> or call <a href="tel:${cfg.phoneHref}">${cfg.phone}</a>.</p>`,
  });
}

function disclosure() {
  return legalPage({
    path: '/broker-disclosure/',
    title: broker ? 'Broker Disclosure: Who Operates Your Flight' : 'Operating Information: Who Operates Your Flight',
    h1: broker ? 'Broker disclosure' : 'Operating information',
    description: broker
      ? `${cfg.name} is a private aviation broker. Flights are operated by independent FAA Part 135 carriers named on every quote. Read how that works.`
      : `Flights are operated under FAA Part 135 authority. Read how we identify the operator and the aircraft on every quote.`,
    intro: broker ? 'A plain explanation of what we do, what the operator does and who is responsible for what.' : 'How we identify the operating carrier and aircraft for your flight.',
    html: broker
      ? `
<h2>What we are</h2>
<p>${esc(cfg.legalName)} is a private aviation broker. We arrange air charter on behalf of our customers. We do not own, lease or operate aircraft, we do not employ pilots, and we are not an air carrier.</p>
<h2>Who operates your flight</h2>
<p>Every flight is operated by an independent air carrier that holds an FAA Part 135 air carrier certificate. The operator, the aircraft type and, once confirmed, the tail number are named on your quote and in your charter agreement.</p>
<ul>
<li>The operating carrier has operational control of the flight.</li>
<li>The pilot in command has final authority over the safe operation of the aircraft, including the decision to delay, divert or cancel.</li>
<li>The operator is responsible for maintenance, crew qualifications, training and compliance with FAA regulations.</li>
</ul>
<h2>Your charter agreement</h2>
<p>Depending on the arrangement, your charter agreement is with the operating carrier or with us as the carrier's agent. Either way, it states the parties, price, payment and cancellation terms, passenger liability and the identity of the operator before you pay.</p>
<h2>Safety screening</h2>
<p>Before an operator is offered, we check that its certificate is current, review its safety record and insurance, and look at third-party audit ratings such as ARGUS and Wyvern where available. These checks supplement, and do not replace, the operator's own legal responsibilities. Audit status applies to individual operators and is shown on your quote only where the operator holds it.</p>
<h2>Aircraft substitutions</h2>
<p>Operational reasons, such as maintenance or weather, can require a substitute aircraft. We ask operators to tell us before a substitution and to propose aircraft of equal or better class. We tell you when a substitution is proposed.</p>
<h2>How we are paid</h2>
<p>We earn a fee that is included in the price we quote you. The total price is the price you are asked to pay, and itemised taxes and fees are shown separately.</p>
<h2>Questions</h2>
<p>If you would like details about the operator or the aircraft for a specific quote, ask your advisor, email <a href="mailto:${cfg.email}">${cfg.email}</a> or call <a href="tel:${cfg.phoneHref}">${cfg.phone}</a>.</p>`
      : `
<h2>Who operates your flight</h2>
<p>Flights are operated by ${esc(cfg.legalName)} under its FAA Part 135 air carrier certificate, or by another certificated Part 135 carrier that we name on your quote and charter agreement when we arrange additional aircraft.</p>
<ul>
<li>The operating carrier has operational control of the flight.</li>
<li>The pilot in command has final authority over the safe operation of the aircraft.</li>
</ul>
<h2>Questions</h2>
<p>Ask your advisor, email <a href="mailto:${cfg.email}">${cfg.email}</a> or call <a href="tel:${cfg.phoneHref}">${cfg.phone}</a>.</p>`,
  });
}

function htmlSitemap() {
  const path = '/sitemap/';
  const main = [
    ['Home', '/'], ['Private jet charter', '/private-jet-charter/'], ['Instant quote', '/instant-quote/'], ['Private jet cost', '/private-jet-cost/'],
    ['Empty leg flights', '/empty-leg-flights/'], ['Jet card', '/jet-card/'], ['Group charter', '/group-charter/'], ['Corporate charter', '/corporate-charter/'],
    ['Concierge', '/concierge/'], ['Events', '/events/'], ['Destinations', '/destinations/'], ['How it works', '/how-it-works/'],
    ['Safety', '/safety/'], ['Compare charter, jet card and fractional', '/compare/'],
  ];
  const co = [['About', '/about/'], ['Contact', '/contact/'], ['FAQ', '/faq/'], ['Guides', '/guides/'], ['For operators', '/operators/'], ['Privacy policy', '/privacy/'], ['Terms of use', '/terms/'], ['Broker disclosure', '/broker-disclosure/']];
  const ul = (items) => `<ul class="sitemap-list">${items.map(([t, h]) => `<li><a href="~${h}">${t}</a></li>`).join('')}</ul>`;
  const body = `<section class="legal-head" data-waypoint="Sitemap"><div class="container container--narrow"><nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="~/">Home</a></li><li aria-current="page">Sitemap</li></ol></nav><h1 class="h1">Sitemap</h1><p class="lede">Every page on ${esc(cfg.name)}, in one place.</p></div></section>
  <section class="section section--paper" data-waypoint="Pages"><div class="container sitemap">
    <div><h2 class="h3">Charter</h2>${ul(main)}</div>
    <div><h2 class="h3">Fleet</h2>${ul([['All aircraft', '/fleet/'], ...classes.map((c) => [c.name, `/fleet/${c.slug}/`])])}</div>
    <div><h2 class="h3">Routes</h2>${ul([['All routes', '/routes/'], ...routes.map((r) => [`${r.a.city} to ${r.b.city}`, `/routes/${r.slug}/`])])}</div>
    <div><h2 class="h3">Guides</h2>${ul(posts.map((p) => [p.title, `/guides/${p.slug}/`]))}<h2 class="h3">Company</h2>${ul(co)}</div>
  </div></section>`;
  return {
    path,
    title: 'HTML Sitemap: Every Page on the Site',
    description: `All pages on ${cfg.name}: charter services, aircraft, routes, guides and company information.`,
    body,
    headerMode: 'solid',
    breadcrumbs: crumbs(['Sitemap', path]),
    ogPhoto: 'jetRunwayA',
    schema: [],
  };
}

function notFound() {
  const body = `<section class="nf" data-waypoint="404">
    <div class="nf-media" aria-hidden="true"></div>
    <div class="container nf-in">
      <p class="eyebrow">Error 404</p>
      <h1 class="h1">We could not find that page</h1>
      <p class="lede">The link may be old or mistyped. Here is where most people want to go.</p>
      <div class="cta-row">
        ${btn('~/instant-quote/', 'Get an instant quote')}
        ${btn('~/routes/', 'Browse routes', 'ghost')}
        ${btn('~/fleet/', 'See the fleet', 'ghost')}
        ${btn('~/contact/', 'Contact us', 'ghost')}
      </div>
    </div>
  </section>`;
  return {
    path: '/404/',
    file: '404.html',
    absolute: true,
    noindex: true,
    title: 'Page Not Found',
    description: 'The page you were looking for could not be found. Try our instant quote, route guides or fleet pages, or contact a flight advisor.',
    body,
    headerMode: 'solid',
    bodyClass: 'page-404',
    ogPhoto: 'jetRunwayA',
    schema: [],
  };
}

module.exports = () => [privacy(), terms(), disclosure(), htmlSitemap(), notFound()];
