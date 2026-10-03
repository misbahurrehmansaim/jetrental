'use strict';
/**
 * SITE CONFIG: this is the file you edit to white-label the site for a client.
 * Change the values, run `npm run build`, and every page, the sitemap, the
 * structured data and the footer update.
 *
 * Everything marked PLACEHOLDER must be replaced with real client data before launch.
 */
module.exports = {
  // ---- Brand --------------------------------------------------------------
  name: 'Skyvelle', // PLACEHOLDER brand name
  legalName: 'Skyvelle Private Aviation LLC', // PLACEHOLDER
  tagline: 'Private jet charter, quoted in minutes',
  shortDescription:
    'Private jet charter across the United States with transparent hourly pricing, safety-audited operators and a 24/7 flight advisor.',
  foundedNote: '', // e.g. 'Serving travellers since 2012' (leave blank if unknown)

  // ---- Domain (used for canonical URLs, sitemap, Open Graph) ---------------
  url: process.env.SITE_URL || 'https://www.example.com', // PLACEHOLDER domain, no trailing slash

  // ---- Contact (PLACEHOLDERS: 555-01xx numbers are reserved for fiction) ----
  phone: '+1 (555) 010-0199',
  phoneHref: '+15550100199',
  whatsapp: '15550100199', // digits only, with country code
  email: 'charter@example.com',
  hours: '24 hours a day, 7 days a week',
  address: '', // PLACEHOLDER: registered business address (shown in the contact page and legal pages when set)
  governingLaw: 'the laws of the State of Delaware', // PLACEHOLDER: have your attorney confirm

  // ---- Colours (written into :root at build time) --------------------------
  theme: {
    ink: '#070b14',
    navy: '#0b1426',
    navy2: '#111d36',
    gold: '#c8a45c',
    gold2: '#e8cf93',
    ivory: '#f6f2ea',
    paper: '#fbf9f4',
  },

  // ---- Integrations (leave blank to disable) -------------------------------
  analytics: {
    ga4: '', // e.g. 'G-XXXXXXXXXX'
    metaPixel: '', // e.g. '1234567890'
  },
  forms: {
    // POST endpoint for quote requests and alerts (Formspree, Basin, Netlify function, your CRM webhook...).
    // If blank, the form falls back to opening WhatsApp / the email app with the details filled in.
    endpoint: '',
  },

  // ---- Compliance wording --------------------------------------------------
  // Set to 'broker' if flights are arranged with third-party carriers (most common),
  // or 'operator' ONLY if the company holds its own FAA Part 135 certificate.
  businessModel: 'broker',

  // ---- Build -----------------------------------------------------------------
  buildDate: new Date().toISOString().slice(0, 10),
  locale: 'en-US',
  // 'dir' => /fleet/light-jets/   (clean URLs, works on every host and Live Server)
  // 'file' => /fleet/light-jets/index.html (use `npm run build:file` to open pages straight from disk)
  linkStyle: process.env.FILE_LINKS ? 'file' : 'dir',
};
