/* ==========================================================================
   00 CORE: helpers, smooth scroll engine, text splitting, scroll reveals
   (This file and its siblings are joined in order inside one IIFE by tools/build/build.js)
   ========================================================================== */
const doc = document;
const root = doc.documentElement;
const $ = (s, c) => (c || doc).querySelector(s);
const $$ = (s, c) => Array.prototype.slice.call((c || doc).querySelectorAll(s));
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const hasGSAP = !!(window.gsap && window.ScrollTrigger);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const money = (n) => '$' + fmt(n);
const roundTo = (n, step) => Math.round(n / step) * step;
const hm = (h) => {
  const t = Math.round(h * 60);
  const hh = Math.floor(t / 60);
  const mm = t % 60;
  if (!hh) return mm + ' min';
  return mm ? hh + ' hr ' + mm + ' min' : hh + ' hr';
};
const safe = (name, fn) => {
  try {
    fn();
  } catch (e) {
    if (window.console) console.error('[site] ' + name, e);
  }
};
const dataEl = $('#skv-data');
const DATA = dataEl ? JSON.parse(dataEl.textContent) : null;

/** Analytics helper: pushes to dataLayer, gtag and the Meta pixel when present. */
function evt(name, params) {
  const p = params || {};
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, p));
    if (typeof window.gtag === 'function') window.gtag('event', name, p);
    if (typeof window.fbq === 'function' && name === 'generate_lead') window.fbq('track', 'Lead');
  } catch (_) {}
}

/* ---------------------------------------------------------------- scroll engine */
let lenis = null;
const scrollers = [];
const onScroll = (fn) => scrollers.push(fn);
const runScrollers = (y) => {
  for (let i = 0; i < scrollers.length; i++) scrollers[i](y);
};
const getY = () => (lenis ? lenis.scroll : window.scrollY);

function initScroll() {
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }
  if (!reduce && window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    window.__lenis = lenis;
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => {
        lenis.raf(t);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
    lenis.on('scroll', (e) => runScrollers(e.scroll));
  } else {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          runScrollers(window.scrollY);
        });
      },
      { passive: true }
    );
  }
  runScrollers(window.scrollY);
}

/** Smooth in-page anchor links (works with and without Lenis). */
function initAnchors() {
  doc.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = doc.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const hdr = parseInt(getComputedStyle(root).getPropertyValue('--hdr'), 10) || 76;
    if (lenis) lenis.scrollTo(target, { offset: -(hdr + 12), duration: 1.4 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });
}

/* ---------------------------------------------------------------- text splitting */
function splitEl(el) {
  if (el.classList.contains('is-split')) return;
  let n = 0;
  const walk = (node) => {
    Array.prototype.slice.call(node.childNodes).forEach((ch) => {
      if (ch.nodeType === 3) {
        const parts = ch.textContent.split(/(\s+)/);
        const frag = doc.createDocumentFragment();
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) {
            frag.appendChild(doc.createTextNode(' '));
            return;
          }
          const w = doc.createElement('span');
          w.className = 'w';
          const wi = doc.createElement('span');
          wi.className = 'wi';
          wi.style.setProperty('--i', n++);
          wi.textContent = p;
          w.appendChild(wi);
          frag.appendChild(w);
        });
        node.replaceChild(frag, ch);
      } else if (ch.nodeType === 1 && !ch.classList.contains('w')) {
        walk(ch);
      }
    });
  };
  walk(el);
  el.classList.add('is-split');
}

/* ---------------------------------------------------------------- scroll reveals */
function initReveal() {
  $$('[data-split]').forEach(splitEl);
  // sequence siblings that reveal together
  const groups = new Map();
  $$('[data-reveal],[data-split]').forEach((el) => {
    const p = el.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(el);
  });
  groups.forEach((list) => {
    if (list.length > 1) list.forEach((el, i) => el.style.setProperty('--d', (i * 0.09).toFixed(2) + 's'));
  });
  $$('[data-stagger]').forEach((c) => {
    Array.prototype.forEach.call(c.children, (ch, i) => ch.style.setProperty('--i', Math.min(i, 10)));
  });
  const targets = $$('[data-reveal],[data-split],[data-stagger],[data-bars]');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('is-in', 'is-settled'));
    return;
  }
  // a clip-path reveal starts fully clipped, so the element itself never "intersects":
  // watch its parent instead and reveal the clipped children together
  const proxy = new Map();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        io.unobserve(el);
        const list = proxy.get(el) || [el];
        list.forEach((t) => {
          t.classList.add('is-in');
          if (t.hasAttribute('data-stagger')) {
            const n = Math.min(t.children.length, 11);
            setTimeout(() => t.classList.add('is-settled'), 1000 + n * 90);
          }
        });
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }
  );
  targets.forEach((t) => {
    if (t.getAttribute('data-reveal') === 'clip' && t.parentElement) {
      const p = t.parentElement;
      if (!proxy.has(p)) { proxy.set(p, []); io.observe(p); }
      proxy.get(p).push(t);
    } else io.observe(t);
  });
}

/** Pixel-accurate parallax for [data-parallax] layers. */
function sceneParallax() {
  if (!hasGSAP || reduce) return;
  $$('[data-parallax]').forEach((el) => {
    const s = parseFloat(el.getAttribute('data-parallax')) || 0.12;
    const parent = el.parentElement;
    const extra = s * 100 + 2;
    el.style.top = '-' + extra + '%';
    el.style.bottom = '-' + extra + '%';
    gsap.fromTo(
      el,
      { y: () => -parent.offsetHeight * s },
      {
        y: () => parent.offsetHeight * s,
        ease: 'none',
        scrollTrigger: { trigger: parent, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      }
    );
  });
}
