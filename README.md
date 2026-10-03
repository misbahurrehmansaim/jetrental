# Skyvelle: private jet charter website (US market)

A complete, production-ready, fully animated website for a private jet charter business.
60 static pages, no framework, no database. It is white-label: change one config file and every page,
the sitemap, the structured data and the footer update.

**Demo brand:** "Skyvelle" (a placeholder). **Business model:** written as a charter *broker* by default,
which is how most US charter sellers legally operate (see "Before you launch" below).

---

## 1. Run it (pick one)

### A. Just look at it (no install)
Open **`dist-offline/index.html`** by double-clicking it. Everything works from disk, links included.

### B. Develop in VS Code (recommended)
Requires [Node.js 18+](https://nodejs.org).

```bash
npm install        # installs esbuild (minifier) and sharp (image tool)
npm start          # builds and serves http://localhost:3000, rebuilds when you save a file
```

Open the folder in VS Code, run the commands in its terminal, edit, save, refresh the browser.
(Or use the Live Server extension on the `dist/` folder after `npm run build`.)

### C. Build for hosting
```bash
npm run build                                   # -> dist/  (minified, cache-busted)
SITE_URL=https://www.yourdomain.com npm run build   # sets canonical URLs, sitemap and Open Graph
npm run build:staging                           # noindex + Disallow:all, for client demos
npm run build:file                              # -> dist-offline/ (opens from disk)
```
On Windows PowerShell use `$env:SITE_URL="https://www.yourdomain.com"; npm run build`.

Upload the contents of `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, cPanel/Apache, S3).
`dist/` already contains `_headers` (Netlify/Cloudflare), `vercel.json` and `.htaccess` with caching and security headers.

---

## 2. Make the photos local (do this before showing a client)

By default every photo loads from the Pexels CDN (real photography, free for commercial use, no attribution required).
Run this once on a machine with internet access to download them and create optimised AVIF, WebP and JPEG copies, plus the hero video:

```bash
npm run images        # downloads ~100 photos (5 sizes x 3 formats) and the hero video
npm run build         # the build now prefers the local files automatically
```

After that the site has no dependency on Pexels, loads faster and works offline.
Replace stock images with the client's own aircraft and team photography when they have it: drop files into
`assets/img/photos/` named `<key>-<width>.jpg` (keys are listed in `tools/build/data/photos.js`).
The stock photos are *representative*, never present them as the client's own aircraft. The footer says so.

---

## 3. White-label it for a client

Everything a client-specific edit needs is in `tools/build/`:

| File | What it controls |
|---|---|
| `config.js` | Brand name, legal name, domain, phone, WhatsApp, email, address, colours, analytics IDs, form endpoint, broker/operator wording |
| `data/fleet.js` | The six aircraft classes: seats, range, speed, hourly rate range, copy |
| `data/routes.js` | The 20 route pages (add a route = add an object; the page, sitemap entry and prices generate themselves) |
| `data/airports.js` | Airports used by search, estimator and map |
| `data/faqs.js`, `data/posts.js` | FAQ answers and the guides/blog articles |
| `data/emptylegs.js` | Sample empty-leg listings (replace with a live feed) |
| `data/photos.js` | Photo catalogue with alt text |
| `lib/estimate.js` | Price estimator formula (mirrored in `assets/js/src/30-forms.js`: change both) |

Colours are in `config.js` (`theme`). Fonts are self-hosted (Cormorant Garamond and Manrope).

---

## 4. Before you launch: replace every placeholder

This is a template with **placeholder business data**. Search for `PLACEHOLDER` in `tools/build/config.js` and fix:

- [ ] Brand name, legal entity, domain
- [ ] Phone and WhatsApp (the `555-01xx` numbers are reserved for fiction), email, address
- [ ] `governingLaw` in `config.js`
- [ ] The "15 min typical quote response" stat (`lib/sections.js`, `numbers()`): use the client's real average or remove it
- [ ] Hourly rate ranges in `data/fleet.js`: use the client's rate card
- [ ] **Privacy policy, Terms and Broker disclosure**: these are templates, **not legal advice**. Have an aviation attorney review them
- [ ] Operator model: `businessModel: 'broker'` unless the client holds its own FAA Part 135 certificate
- [ ] Empty-leg listings are samples. Connect a live operator feed or remove the section
- [ ] No reviews, awards or customer logos are included on purpose. Add only real ones (and keep review schema honest)
- [ ] Safety wording (ARGUS, Wyvern, IS-BAO) must reflect what the client's operators actually hold
- [ ] Verify the compliance notes in `docs/COMPETITOR-ANALYSIS.md` section 9 (broker disclosure, federal excise tax wording, "indicative prices")

---

## 5. Forms and tracking

**Forms** (quote wizard, contact, operators, jet card, empty-leg alerts):
set `forms.endpoint` in `config.js` to any HTTPS endpoint that accepts a JSON POST (Formspree, Basin, Make/Zapier webhook, Netlify/Vercel function, your CRM).
The payload is JSON with every field. With no endpoint set, the form still works: it shows **Send on WhatsApp** and **Send by email** buttons pre-filled with the request,
so no lead is lost during a demo. Spam is blocked with a hidden honeypot field.

**Analytics:** put your GA4 ID (`G-XXXX`) and/or Meta Pixel ID in `config.js`. Events pushed to `dataLayer` (also usable from Google Tag Manager):
`route_search`, `quote_step`, `quote_prefilled`, `generate_lead`, `estimator_cta`, `call`, `whatsapp`, `quote`, `emptyleg`.
Mark `generate_lead` as a conversion.

---

## 6. What is in it

**Pages (60):** Home, Private jet charter, Instant quote (3-step wizard with live estimate), Private jet cost, Empty leg flights, Jet card, Group charter,
Corporate charter, Concierge, Events, Destinations, Safety, How it works, Compare (charter vs jet card vs fractional), Fleet hub plus 6 aircraft class pages,
Routes hub plus 20 route pages, Guides hub plus articles, FAQ, About, Contact, For operators, Privacy, Terms, Broker disclosure, HTML sitemap, 404.

**Animation (smooth scroll with Lenis, GSAP ScrollTrigger):**
- Home hero: scroll to take off. The plane lifts away, altitude and speed readout climb, status goes Boarding, Taxiing, Take-off roll, Climbing, Cruising
- Pinned horizontal fleet gallery with parallax photos
- Route map that draws great-circle arcs with a plane flying along each one
- "How it works" with sticky photo swapping, text reveals, parallax photography, 3D tilt cards, magnetic buttons, custom cursor
- Footer landing scene: altitude counts down to 0 with runway lights
- Flight-tracker progress rail on the right (a progress bar on phones), page transitions with an ink curtain
- Respects `prefers-reduced-motion`; if scripts fail, a failsafe shows all content after 4.5 s; with JavaScript off the page is fully readable

**Technical SEO:** one H1 per page, unique titles and descriptions, canonical URLs, Open Graph and Twitter cards,
JSON-LD (Organization, WebSite, BreadcrumbList, FAQPage, Service, Article, ItemList, ContactPage), XML and HTML sitemaps, robots.txt, llms.txt, web manifest,
semantic landmarks, descriptive image alt text, internal linking between routes, fleet and guides. The build prints a warning for missing or over-long titles and descriptions, duplicate H1s or ids, missing image alt text, thin pages and broken internal links (it currently reports none).

**Performance:** no framework, about 65 KB gzipped JavaScript (GSAP, ScrollTrigger and Lenis included), about 19 KB gzipped CSS, self-hosted fonts with preload,
responsive images (`srcset`, AVIF/WebP after `npm run images`), lazy loading, hero video loads only on desktop and not on slow connections, hashed asset URLs.
Run Lighthouse on the deployed site and quote your real numbers.

**Accessibility:** skip link, keyboard-operable menus and accordions, visible focus, labelled forms with inline errors, ARIA states.

---

## 7. Project layout

```
tools/build/        site generator: config, data, page modules, build.js
assets/css/src/     CSS partials (joined in order, 00-base ... 50-pages)
assets/js/src/      JS partials (00-core, 10-scenes, 20-ui, 30-forms, 99-init)
assets/vendor/      GSAP, ScrollTrigger, Lenis (self-hosted)
assets/fonts/       self-hosted fonts
public/             copied to the site root (headers, .htaccess, vercel.json)
docs/               competitor analysis, SEO plan, CRO playbook, how to pitch it
dist/               production build (upload this)
dist-offline/       build you can open from disk
```

## 8. Scripts

| Command | What it does |
|---|---|
| `npm start` | Dev server with auto-rebuild on http://localhost:3000 |
| `npm run build` | Production build into `dist/` |
| `npm run build:dev` | Unminified build (easier to debug) |
| `npm run build:file` | Build whose links work from disk, into `dist-offline/` |
| `npm run build:staging` | Production build with noindex, for client demos |
| `npm run images` | Download and optimise all photos and the hero video locally |
| `npm run check` | List CSS classes used in the HTML that have no CSS rule |

## 9. Credits

Photography and video: [Pexels](https://www.pexels.com) (free to use commercially, no attribution required; see the Pexels licence).
Animation: [GSAP](https://gsap.com) and [Lenis](https://lenis.darkroom.engineering). Fonts: Cormorant Garamond and Manrope (SIL Open Font Licence).
