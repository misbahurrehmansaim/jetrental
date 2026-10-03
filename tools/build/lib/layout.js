'use strict';
/**
 * Page shell: <head> (SEO, social, fonts, JSON-LD), header with mega menus, footer, mobile bar.
 * Every internal URL is written as `~/path/` and rewritten to the right relative path per page,
 * so the site works from any folder, any domain and (with `npm run build:file`) straight from disk.
 */
const cfg = require('../config');
const { esc } = require('./util');
const { sprite, icon } = require('./icons');
const { img, url, remoteCrop } = require('./img');
const { classes } = require('../data/fleet');
const { routes } = require('../data/routes');
const { posts } = require('../data/posts');

const abs = (p) => cfg.url.replace(/\/$/, '') + p;

/* ---------------- structured data ---------------- */
const orgId = () => abs('/#organization');
function orgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': orgId(),
    name: cfg.name,
    legalName: cfg.legalName,
    url: abs('/'),
    logo: abs('/assets/img/icon-512.png'),
    description: cfg.shortDescription,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: cfg.phone,
        email: cfg.email,
        areaServed: 'US',
        availableLanguage: ['English'],
        hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
      },
    ],
  };
}
function websiteSchema() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': abs('/#website'), url: abs('/'), name: cfg.name, publisher: { '@id': orgId() }, inLanguage: 'en-US' };
}
function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
}
function faqSchema(list) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}
function serviceSchema({ name, description, path, serviceType = 'Private jet charter' }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType,
    url: abs(path),
    provider: { '@id': orgId() },
    areaServed: { '@type': 'Country', name: 'United States' },
  };
}
function articleSchema({ title, description, path, date, photo }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    mainEntityOfPage: abs(path),
    datePublished: date,
    dateModified: date,
    image: remoteCrop(photo, 1200, 630),
    author: { '@type': 'Organization', name: cfg.name, url: abs('/') },
    publisher: { '@id': orgId() },
  };
}
function itemListSchema(name, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.path) })),
  };
}

/* ---------------- navigation data ---------------- */
const waLink = (msg = '') => `https://wa.me/${cfg.whatsapp}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;

function megaCharter() {
  const items = [
    ['/private-jet-charter/', 'plane', 'Private jet charter', 'How on-demand charter works'],
    ['/instant-quote/', 'gauge', 'Instant quote', 'Estimate any route in a minute'],
    ['/empty-leg-flights/', 'tag', 'Empty leg flights', 'Discounted repositioning flights'],
    ['/group-charter/', 'users', 'Group charter', 'Teams, sports and large parties'],
    ['/corporate-charter/', 'briefcase', 'Corporate charter', 'Accounts, duty of care, reporting'],
    ['/concierge/', 'sparkle', 'Concierge', 'Catering, cars, helicopters, pets'],
    ['/events/', 'trophy', 'Events', 'Super Bowl, ski season, festivals'],
    ['/how-it-works/', 'route', 'How it works', 'From quote to touchdown'],
  ];
  return `<div class="mega-grid mega-grid--list">${items
    .map(([h, i, t, d]) => `<a class="mega-item" href="~${h}">${icon(i)}<span><b>${t}</b><small>${d}</small></span></a>`)
    .join('')}</div>
  <div class="mega-side">${img('cabinEmpty1', { sizes: '320px', widths: [480, 800] })}<div><b>Fly private from $2,200/hr</b><a class="link-arrow" href="~/private-jet-cost/">See transparent pricing ${icon('arrow-right')}</a></div></div>`;
}
function megaFleet() {
  return `<div class="mega-grid mega-grid--cards">${classes
    .map((c) => `<a class="mega-card" href="~/fleet/${c.slug}/">${img(c.photo, { sizes: '220px', widths: [480, 800] })}<span><b>${c.name}</b><small>${c.paxLabel} seats · from ${'$' + c.rate[0].toLocaleString('en-US')}/hr</small></span></a>`)
    .join('')}</div>`;
}
function megaRoutes() {
  const top = ['new-york-to-miami', 'new-york-to-palm-beach', 'los-angeles-to-las-vegas', 'new-york-to-aspen', 'new-york-to-the-hamptons', 'boston-to-nantucket', 'dallas-to-aspen', 'new-york-to-los-angeles']
    .map((s) => routes.find((r) => r.slug === s))
    .filter(Boolean);
  return `<div class="mega-grid mega-grid--routes">${top
    .map((r) => `<a class="mega-route" href="~/routes/${r.slug}/"><span>${r.a.city}</span>${icon('arrow-right')}<span>${r.b.city}</span><small>${r.miles.toLocaleString('en-US')} mi</small></a>`)
    .join('')}</div>
  <div class="mega-foot"><a class="link-arrow" href="~/routes/">All routes ${icon('arrow-right')}</a><a class="link-arrow" href="~/destinations/">Seasonal destinations ${icon('arrow-right')}</a></div>`;
}
function megaGuides() {
  const items = [
    ['/private-jet-cost/', 'Private jet cost guide'],
    ['/compare/', 'Charter vs jet card vs fractional'],
    ['/guides/how-to-charter-a-private-jet/', 'How to charter a private jet'],
    ['/guides/what-is-an-empty-leg-flight/', 'What is an empty leg flight?'],
    ['/guides/private-jet-safety-argus-wyvern-explained/', 'Safety: ARGUS and Wyvern explained'],
    ['/faq/', 'FAQ'],
  ];
  return `<div class="mega-grid mega-grid--list">${items.map(([h, t]) => `<a class="mega-item" href="~${h}">${icon('doc')}<span><b>${t}</b></span></a>`).join('')}</div>
  <div class="mega-foot"><a class="link-arrow" href="~/guides/">All guides ${icon('arrow-right')}</a></div>`;
}

const NAV = [
  { label: 'Charter', href: '/private-jet-charter/', mega: megaCharter },
  { label: 'Fleet', href: '/fleet/', mega: megaFleet },
  { label: 'Routes', href: '/routes/', mega: megaRoutes },
  { label: 'Empty legs', href: '/empty-leg-flights/' },
  { label: 'Jet card', href: '/jet-card/' },
  { label: 'Safety', href: '/safety/' },
  { label: 'Guides', href: '/guides/', mega: megaGuides },
];

function header(path, mode) {
  const navHtml = NAV.map((n, i) => {
    const current = path === n.href || (n.href !== '/' && path.startsWith(n.href)) ? ' aria-current="page"' : '';
    if (!n.mega) return `<li><a href="~${n.href}"${current}>${n.label}</a></li>`;
    return `<li class="has-mega"><a href="~${n.href}"${current}>${n.label}</a><button class="mega-toggle" type="button" aria-expanded="false" aria-controls="mega-${i}" aria-label="Open ${n.label} menu">${icon('chevron')}</button><div class="mega" id="mega-${i}"><div class="mega-in">${n.mega()}</div></div></li>`;
  }).join('');
  const mobile = `<div class="mmenu" id="mmenu" hidden>
    <div class="mmenu-in" data-lenis-prevent>
      <ul class="mmenu-list">
        <li><a href="~/private-jet-charter/">Private jet charter</a></li>
        <li><a href="~/instant-quote/">Instant quote</a></li>
        <li><a href="~/fleet/">Fleet</a></li>
        <li><a href="~/routes/">Routes</a></li>
        <li><a href="~/empty-leg-flights/">Empty legs</a></li>
        <li><a href="~/jet-card/">Jet card</a></li>
        <li><a href="~/safety/">Safety</a></li>
        <li><a href="~/guides/">Guides</a></li>
        <li><a href="~/contact/">Contact</a></li>
      </ul>
      <div class="mmenu-cta">
        <a class="btn btn-gold" href="~/instant-quote/">Get a quote ${icon('arrow-right')}</a>
        <a class="btn btn-ghost" href="tel:${cfg.phoneHref}">${icon('phone')} ${cfg.phone}</a>
        <a class="btn btn-ghost" href="${waLink('Hello, I would like a private jet quote.')}" rel="noopener" target="_blank">${icon('chat')} WhatsApp</a>
      </div>
    </div>
  </div>`;
  return `<header class="site-header site-header--${mode}" data-header>
  <div class="hdr-in">
    <a class="brand" href="~/" aria-label="${esc(cfg.name)} home"><svg class="brand-mark" aria-hidden="true"><use href="#logo-mark"/></svg><span class="brand-name">${esc(cfg.name)}</span></a>
    <nav class="nav" aria-label="Primary"><ul>${navHtml}</ul></nav>
    <div class="hdr-actions">
      <a class="hdr-phone" href="tel:${cfg.phoneHref}" aria-label="Call ${cfg.phone}">${icon('phone')}<span>${cfg.phone}</span></a>
      <a class="btn btn-gold btn-sm" href="~/instant-quote/" data-magnetic>Get a quote</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="mmenu" aria-label="Open menu"><span></span><span></span></button>
    </div>
  </div>
  ${mobile}
</header>`;
}

function footer() {
  const topRoutes = ['new-york-to-miami', 'new-york-to-palm-beach', 'los-angeles-to-las-vegas', 'new-york-to-aspen', 'new-york-to-los-angeles', 'chicago-to-aspen', 'dallas-to-aspen', 'boston-to-nantucket']
    .map((s) => routes.find((r) => r.slug === s))
    .filter(Boolean);
  const disclosure =
    cfg.businessModel === 'broker'
      ? `${esc(cfg.name)} is a private aviation broker. It arranges air charter on behalf of customers and does not operate aircraft. All flights are operated by independent air carriers certificated under FAA Part 135, and the operator is identified on every quote and charter agreement. <a href="~/broker-disclosure/">Broker disclosure</a>.`
      : `Flights are operated by ${esc(cfg.legalName)} under FAA Part 135 authority. <a href="~/broker-disclosure/">Operating information</a>.`;
  return `<footer class="site-footer" data-waypoint="Landing">
  <div class="container foot-grid">
    <div class="foot-brand">
      <a class="brand" href="~/" aria-label="${esc(cfg.name)} home"><svg class="brand-mark" aria-hidden="true"><use href="#logo-mark"/></svg><span class="brand-name">${esc(cfg.name)}</span></a>
      <p>${esc(cfg.shortDescription)}</p>
      <ul class="foot-contact">
        <li>${icon('phone')}<a href="tel:${cfg.phoneHref}">${cfg.phone}</a></li>
        <li>${icon('mail')}<a href="mailto:${cfg.email}">${cfg.email}</a></li>
        <li>${icon('clock')}<span>Flight desk open ${cfg.hours}</span></li>
      </ul>
    </div>
    <nav aria-label="Charter"><h2 class="foot-h">Charter</h2><ul>
      <li><a href="~/private-jet-charter/">Private jet charter</a></li>
      <li><a href="~/instant-quote/">Instant quote</a></li>
      <li><a href="~/private-jet-cost/">Private jet cost</a></li>
      <li><a href="~/empty-leg-flights/">Empty leg flights</a></li>
      <li><a href="~/jet-card/">Jet card</a></li>
      <li><a href="~/group-charter/">Group charter</a></li>
      <li><a href="~/corporate-charter/">Corporate charter</a></li>
      <li><a href="~/concierge/">Concierge</a></li>
    </ul></nav>
    <nav aria-label="Fleet"><h2 class="foot-h">Fleet</h2><ul>
      ${classes.map((c) => `<li><a href="~/fleet/${c.slug}/">${c.name}</a></li>`).join('')}
      <li><a href="~/fleet/">Compare all aircraft</a></li>
    </ul></nav>
    <nav aria-label="Popular routes"><h2 class="foot-h">Popular routes</h2><ul>
      ${topRoutes.map((r) => `<li><a href="~/routes/${r.slug}/">${r.a.city} to ${r.b.city}</a></li>`).join('')}
      <li><a href="~/routes/">All routes</a></li>
    </ul></nav>
    <nav aria-label="Company"><h2 class="foot-h">Company</h2><ul>
      <li><a href="~/about/">About</a></li>
      <li><a href="~/safety/">Safety</a></li>
      <li><a href="~/how-it-works/">How it works</a></li>
      <li><a href="~/guides/">Guides</a></li>
      <li><a href="~/faq/">FAQ</a></li>
      <li><a href="~/operators/">For operators</a></li>
      <li><a href="~/contact/">Contact</a></li>
    </ul></nav>
  </div>
  <div class="container foot-legal">
    <p class="foot-disclosure">${disclosure}</p>
    <div class="foot-bottom">
      <span>&copy; ${new Date().getFullYear()} ${esc(cfg.legalName)}. All rights reserved.</span>
      <ul>
        <li><a href="~/privacy/">Privacy</a></li>
        <li><a href="~/terms/">Terms</a></li>
        <li><a href="~/broker-disclosure/">Broker disclosure</a></li>
        <li><a href="~/sitemap/">Sitemap</a></li>
      </ul>
      <span class="foot-credit">Photography via <a href="https://www.pexels.com" rel="noopener" target="_blank">Pexels</a>. Images are representative.</span>
    </div>
  </div>
</footer>`;
}

function mobileBar() {
  return `<div class="mbar" role="complementary" aria-label="Quick actions">
  <a href="tel:${cfg.phoneHref}" data-evt="call">${icon('phone')}<span>Call</span></a>
  <a href="${waLink('Hello, I would like a private jet quote.')}" rel="noopener" target="_blank" data-evt="whatsapp">${icon('chat')}<span>WhatsApp</span></a>
  <a class="mbar-cta" href="~/instant-quote/" data-evt="quote">${icon('plane')}<span>Get a quote</span></a>
</div>`;
}

function tracker() {
  return `<aside class="tracker" aria-hidden="true">
  <div class="tracker-rail"><i class="tracker-fill"></i><svg class="tracker-plane"><use href="#plane-top"/></svg></div>
  <ol class="tracker-stops"></ol>
  <div class="tracker-alt"><span data-alt>0</span><small>ft</small></div>
</aside>
<div class="progress-top" aria-hidden="true"><i></i><svg class="progress-plane"><use href="#plane-top"/></svg></div>`;
}

/* ---------------- analytics ---------------- */
function analytics() {
  let s = '';
  if (cfg.analytics.ga4) {
    s += `<script async src="https://www.googletagmanager.com/gtag/js?id=${cfg.analytics.ga4}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${cfg.analytics.ga4}');</script>`;
  } else {
    s += `<script>window.dataLayer=window.dataLayer||[];</script>`;
  }
  if (cfg.analytics.metaPixel) {
    s += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${cfg.analytics.metaPixel}');fbq('track','PageView');</script>`;
  }
  return s;
}

/* ---------------- URL rewriting ---------------- */
function rewrite(html, path, { absolute = false } = {}) {
  const depth = path.split('/').filter(Boolean).length;
  const prefix = absolute ? '/' : '../'.repeat(depth);
  if (cfg.linkStyle === 'file') {
    html = html.replace(/(href|action)="~\/([^"#?]*)(#[^"]*)?"/g, (m, attr, p, hash = '') => {
      const last = p.split('/').pop();
      if (last.includes('.')) return m; // asset or file
      const np = p === '' ? 'index.html' : p.replace(/\/?$/, '/') + 'index.html';
      return `${attr}="~/${np}${hash}"`;
    });
  }
  html = html.replace(/~\//g, prefix);
  // `../` for depth 0 is '' : make bare root links work
  html = html.replace(/href=""/g, 'href="./"');
  return html;
}

/* ---------------- the page shell ---------------- */
function page(o) {
  const {
    path,
    title,
    description,
    body,
    ogPhoto = 'heroGround',
    breadcrumbs,
    schema = [],
    headerMode = 'solid',
    noindex = false,
    preload = [],
    bodyClass = '',
    absolute = false,
    ogType = 'website',
  } = o;
  const isHome = path === '/';
  // any page with an interactive form or tool needs the airport/fleet data the scripts read
  const needsData = /data-(estimator|quote-form|lead-form|alert-form|route-search)/.test(body) && !body.includes('id="skv-data"');
  const bodyHtml = needsData ? body + require('./sections').skvData() : body;
  const fullTitle = isHome ? title : `${title} | ${cfg.name}`;
  const canonical = abs(path);
  const og = remoteCrop(ogPhoto, 1200, 630);
  const ld = [orgSchema(), websiteSchema()];
  if (breadcrumbs && breadcrumbs.length > 1) ld.push(breadcrumbSchema(breadcrumbs));
  ld.push(...schema);

  const themeVars = Object.entries(cfg.theme)
    .map(([k, v]) => `--${k.replace(/([A-Z0-9])/g, '-$1').toLowerCase()}:${v}`)
    .join(';');

  const crumbs = breadcrumbs && breadcrumbs.length > 1 ? '' : '';

  const html = `<!doctype html>
<html lang="en-US" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="theme-color" content="${cfg.theme.navy}">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(cfg.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${og}">
<link rel="icon" href="~/assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="~/assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="~/assets/img/apple-touch-icon.png">
<link rel="manifest" href="~/manifest.webmanifest">
<link rel="preconnect" href="https://images.pexels.com">
<link rel="preload" href="~/assets/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="~/assets/fonts/cormorant-garamond-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
${preload.join('\n')}
<style>:root{${themeVars}}</style>
<link rel="stylesheet" href="~/assets/css/${cfg.__dev ? 'main.css' : 'main.min.css'}">
<script>var d=document.documentElement;d.className='js';try{if(sessionStorage.getItem('skv-t')){d.classList.add('is-arriving');sessionStorage.removeItem('skv-t')}}catch(e){}setTimeout(function(){if(!d.classList.contains('is-ready'))d.classList.add('no-anim')},4500);</script>
<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : ld)}</script>
${analytics()}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to main content</a>
${sprite()}
${header(path, headerMode)}
<main id="main">
${bodyHtml}
</main>
${footer()}
${mobileBar()}
${tracker()}
${cfg.__dev ? ['vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/lenis.min.js', 'app.js'].map((f) => `<script src="~/assets/${f.startsWith('vendor') ? f : 'js/' + f}" defer></script>`).join('\n') : '<script src="~/assets/js/bundle.min.js" defer></script>'}
</body>
</html>`;
  return rewrite(html, path, { absolute });
}

module.exports = {
  page,
  abs,
  waLink,
  schemas: { orgSchema, websiteSchema, breadcrumbSchema, faqSchema, serviceSchema, articleSchema, itemListSchema },
  rewrite,
};
