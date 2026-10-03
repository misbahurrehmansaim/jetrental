/* ==========================================================================
   20 UI: header, menus, flight tracker, accordion, filters, cursor, tilt, counters, transitions
   ========================================================================== */

/* ---------------------------------------------------------------- header */
function initHeader() {
  const header = $('[data-header]');
  if (!header) return;
  const burger = $('.burger', header);
  const menu = $('#mmenu');
  let lastY = 0;
  let menuOpen = false;
  let closeTimer = 0;

  // stuck + hide on scroll down, show on scroll up
  onScroll((y) => {
    header.classList.toggle('is-stuck', y > 28);
    if (menuOpen) return;
    const dy = y - lastY;
    if (y < 200) header.classList.remove('is-hidden');
    else if (dy > 6) {
      if (!header.querySelector('.has-mega.is-open')) header.classList.add('is-hidden');
    } else if (dy < -6) header.classList.remove('is-hidden');
    if (Math.abs(dy) > 6) lastY = y;
  });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  // mega menus (hover is pure CSS; the chevron button makes it work for touch and keyboard)
  const megas = $$('.has-mega', header);
  const closeMegas = (except) => {
    megas.forEach((m) => {
      if (m === except) return;
      m.classList.remove('is-open');
      const t = $('.mega-toggle', m);
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  };
  megas.forEach((m) => {
    const t = $('.mega-toggle', m);
    if (!t) return;
    t.addEventListener('click', (e) => {
      e.preventDefault();
      const open = !m.classList.contains('is-open');
      closeMegas(m);
      m.classList.toggle('is-open', open);
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    m.addEventListener('mouseenter', () => closeMegas(m));
  });
  doc.addEventListener('click', (e) => {
    if (!e.target.closest || !e.target.closest('.has-mega')) closeMegas();
  });

  // mobile menu
  const setMenu = (open) => {
    if (!menu || !burger || open === menuOpen) return;
    menuOpen = open;
    clearTimeout(closeTimer);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    root.classList.toggle('menu-open', open);
    if (open) {
      header.classList.remove('is-hidden');
      menu.hidden = false;
      void menu.offsetWidth; // let the browser register the closed state first
      menu.classList.add('is-open');
      if (lenis) lenis.stop();
      root.style.overflow = 'hidden';
    } else {
      menu.classList.remove('is-open');
      if (lenis) lenis.start();
      root.style.overflow = '';
      closeTimer = setTimeout(() => {
        if (!menuOpen) menu.hidden = true;
      }, 520);
    }
  };
  if (burger) burger.addEventListener('click', () => setMenu(!menuOpen));
  if (menu) menu.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a')) setMenu(false); });
  doc.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (menuOpen) { setMenu(false); if (burger) burger.focus(); }
    closeMegas();
  });
  const wide = window.matchMedia('(min-width: 1081px)');
  const onWide = () => { if (wide.matches) setMenu(false); };
  if (wide.addEventListener) wide.addEventListener('change', onWide);
}

/* ---------------------------------------------------------------- flight tracker + progress bar */
function initTracker() {
  const tracker = $('.tracker');
  const bar = $('.progress-top');
  if (!tracker && !bar) return;
  const stopsEl = $('.tracker-stops', tracker || doc);
  const altEl = $('[data-alt]', tracker || doc);
  let stops = []; // { top, p, label, li }
  let total = 1;
  let active = -1;
  let lastP = -1;

  const docTop = (el) => {
    let y = 0;
    let n = el;
    while (n) {
      y += n.offsetTop || 0;
      n = n.offsetParent;
    }
    return y;
  };

  const measure = () => {
    total = Math.max(1, root.scrollHeight - window.innerHeight);
    const hero = $('[data-hero]');
    const sp = hero && hero.parentElement;
    heroPin = sp && sp.classList.contains('pin-spacer') ? Math.max(0, sp.offsetHeight - hero.offsetHeight) : 0;
    const found = [];
    $$('[data-waypoint]').forEach((el) => {
      if (el.hasAttribute('data-nowp')) return;
      // a pinned element is position:fixed while pinned, so measure its pin-spacer instead
      const host = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
      found.push({ label: el.getAttribute('data-waypoint'), top: docTop(host), el });
    });
    found.sort((a, b) => a.top - b.top);
    const keep = [];
    found.forEach((f, i) => {
      f.p = clamp(f.top / total, 0, 1);
      const prev = keep[keep.length - 1];
      const isLast = i === found.length - 1;
      if (prev && (prev.label === f.label || f.p - prev.p < 0.055)) {
        if (isLast) keep[keep.length - 1] = f; // always keep the final stop (the footer)
        return;
      }
      keep.push(f);
    });
    return keep;
  };

  const build = () => {
    const keep = measure();
    // rebuild the DOM only when the set of stops changes; otherwise just move them
    const same = keep.length === stops.length && keep.every((k, i) => k.label === stops[i].label);
    if (same) {
      keep.forEach((k, i) => {
        stops[i].top = k.top;
        stops[i].p = k.p;
        if (stops[i].li) stops[i].li.style.setProperty('--y', k.p.toFixed(4));
      });
    } else {
      stops = keep;
      if (stopsEl) {
        stopsEl.innerHTML = '';
        stops.forEach((s) => {
          const li = doc.createElement('li');
          li.style.setProperty('--y', s.p.toFixed(4));
          li.innerHTML = '<i></i><span></span>';
          li.lastChild.textContent = s.label;
          stopsEl.appendChild(li);
          s.li = li;
        });
      }
      active = -1;
    }
    update(getY(), true);
  };

  let heroPin = 0; // pixels the home hero stays pinned for; its HUD and this readout use one curve
  const altitude = (p, y) => {
    // climb out, cruise with a gentle drift, then descend into the footer
    let a;
    if (heroPin > 0 && y < heroPin) a = 35000 * easeInOut(clamp(((y / heroPin) - 0.26) / 0.74, 0, 1));
    else if (heroPin > 0 && p < 0.86) a = 35000 + Math.sin(p * 22) * 600;
    else if (p < 0.1) a = 35000 * easeInOut(p / 0.1);
    else if (p < 0.86) a = 35000 + Math.sin(p * 22) * 600;
    else a = 35000 * (1 - easeInOut((p - 0.86) / 0.14));
    return Math.max(0, Math.round(a / 100) * 100);
  };

  function update(y, force) {
    const p = clamp(y / total, 0, 1);
    if (!force && Math.abs(p - lastP) < 0.0004) return;
    lastP = p;
    const v = p.toFixed(4);
    if (tracker) {
      tracker.style.setProperty('--p', v);
      tracker.classList.toggle('is-visible', y > 260);
      if (altEl) altEl.textContent = fmt(altitude(p, y));
    }
    if (bar) bar.style.setProperty('--p', v);
    if (!stops.length) return;
    const line = y + window.innerHeight * 0.45;
    let idx = -1;
    for (let i = 0; i < stops.length; i++) if (stops[i].top <= line) idx = i;
    if (y >= total - 4) idx = stops.length - 1;
    if (idx !== active) {
      active = idx;
      stops.forEach((s, i) => {
        if (!s.li) return;
        s.li.classList.toggle('is-active', i === idx);
        s.li.classList.toggle('is-passed', i < idx);
      });
    }
  }

  onScroll((y) => update(y));
  build();
  if (hasGSAP) ScrollTrigger.addEventListener('refresh', build);
  let t = 0;
  const later = () => {
    clearTimeout(t);
    t = setTimeout(build, 280);
  };
  window.addEventListener('resize', later);
  window.addEventListener('load', later);
  if ('ResizeObserver' in window) new ResizeObserver(later).observe(doc.body);
}

/* ---------------------------------------------------------------- accordion (Web Animations, one open at a time) */
function initAccordion() {
  $$('[data-accordion]').forEach((acc) => {
    const items = $$('details', acc);
    const state = new Map();
    const finish = (d) => {
      const s = state.get(d);
      if (s && s.anim) s.anim.cancel();
    };
    const closeItem = (d) => {
      const body = $('.acc-body', d);
      finish(d);
      if (!body || reduce || !body.animate) {
        d.removeAttribute('open');
        return;
      }
      const h = body.offsetHeight;
      const anim = body.animate({ height: [h + 'px', '0px'], opacity: [1, 0] }, { duration: 460, easing: 'cubic-bezier(.22,1,.36,1)' });
      state.set(d, { anim });
      anim.onfinish = anim.oncancel = () => {
        d.removeAttribute('open');
        state.set(d, {});
        if (hasGSAP) ScrollTrigger.refresh();
      };
    };
    const openItem = (d) => {
      const body = $('.acc-body', d);
      finish(d);
      d.setAttribute('open', '');
      if (!body || reduce || !body.animate) return;
      const h = body.offsetHeight;
      const anim = body.animate({ height: ['0px', h + 'px'], opacity: [0, 1] }, { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)' });
      state.set(d, { anim });
      anim.onfinish = anim.oncancel = () => {
        state.set(d, {});
        if (hasGSAP) ScrollTrigger.refresh();
      };
    };
    items.forEach((d) => {
      const sum = $('summary', d);
      if (!sum) return;
      sum.addEventListener('click', (e) => {
        e.preventDefault();
        if (d.open) closeItem(d);
        else {
          items.forEach((o) => { if (o !== d && o.open) closeItem(o); });
          openItem(d);
        }
      });
    });
  });
}

/* ---------------------------------------------------------------- filters (routes, guides, empty legs) */
function initFilters() {
  $$('[data-filters]').forEach((bar) => {
    const scope = bar.parentElement;
    const grid = $('[data-filter-grid],[data-legs]', scope);
    if (!grid) return;
    const items = $$('[data-region]', grid);
    const buttons = $$('[data-filter]', bar);
    buttons.forEach((b) => b.setAttribute('aria-pressed', b.classList.contains('is-active') ? 'true' : 'false'));
    buttons.forEach((b) => {
      b.addEventListener('click', () => {
        const val = b.getAttribute('data-filter');
        buttons.forEach((x) => {
          const on = x === b;
          x.classList.toggle('is-active', on);
          x.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        let shown = 0;
        items.forEach((it) => {
          const show = val === 'All' || it.getAttribute('data-region') === val;
          const was = !it.hidden;
          it.hidden = !show;
          if (show) {
            // content that was filtered out before it ever revealed must not stay invisible
            it.classList.add('is-in');
            if (!was && !reduce && it.animate) {
              it.animate({ opacity: [0, 1], translate: ['0 22px', '0 0'] }, { duration: 700, delay: Math.min(shown, 8) * 55, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
            }
            shown++;
          }
        });
        grid.classList.add('is-in', 'is-settled');
        $$('[data-stagger] > *', grid).forEach((c) => c.classList.add('is-in'));
        if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 60);
      });
    });
  });
}

/* ---------------------------------------------------------------- misc small behaviours */
function initLegDates() {
  const dayMs = 86400000;
  $$('[data-leg-date]').forEach((el) => {
    const n = parseInt(el.getAttribute('data-day'), 10);
    if (!n) return;
    const d = new Date(Date.now() + n * dayMs);
    const when = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    el.textContent = when + ' · ' + (n === 1 ? 'tomorrow' : 'in ' + n + ' days');
  });
}

function initCounters() {
  const els = $$('[data-count]');
  if (!els.length) return;
  const final = (el) => {
    el.textContent = fmt(parseFloat(el.getAttribute('data-count')) || 0);
  };
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(final);
    return;
  }
  els.forEach((el) => (el.textContent = '0'));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        io.unobserve(el);
        const target = parseFloat(el.getAttribute('data-count')) || 0;
        const dur = 1900;
        const t0 = performance.now();
        const tick = (t) => {
          const k = clamp((t - t0) / dur, 0, 1);
          el.textContent = fmt(target * (1 - Math.pow(1 - k, 4)));
          if (k < 1) requestAnimationFrame(tick);
          else final(el);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => io.observe(el));
}

/** The trust marquee speeds up with scroll velocity. */
function initMarquee() {
  const track = $('[data-marquee]');
  if (!track || reduce || !track.getAnimations) return;
  let lastY = getY();
  let rate = 1;
  let target = 1;
  onScroll((y) => {
    target = 1 + Math.min(Math.abs(y - lastY) * 0.35, 7);
    lastY = y;
  });
  const loop = () => {
    rate = lerp(rate, target, 0.08);
    target = lerp(target, 1, 0.06);
    const a = track.getAnimations()[0];
    if (a) a.playbackRate = rate;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/** Highlights the current heading in an article's table of contents. */
function initToc() {
  const links = $$('.toc a[href^="#"]');
  if (!links.length) return;
  const heads = links
    .map((a) => doc.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);
  if (!heads.length) return;
  let tops = [];
  const measure = () => {
    const y = window.scrollY;
    tops = heads.map((h) => h.getBoundingClientRect().top + y);
  };
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  let cur = -1;
  onScroll((y) => {
    const line = y + 170;
    let idx = -1;
    for (let i = 0; i < tops.length; i++) if (tops[i] <= line) idx = i;
    if (idx === cur) return;
    cur = idx;
    links.forEach((a, i) => a.classList.toggle('is-active', i === idx));
  });
}

/** Analytics for tagged links. */
function initEvents() {
  doc.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('[data-evt]');
    if (!el) return;
    evt(el.getAttribute('data-evt'), { link_url: el.getAttribute('href') || '', page: location.pathname });
  });
}

/* ---------------------------------------------------------------- pointer effects */
function initCursor() {
  if (!finePointer || reduce || window.innerWidth < 1000) return;
  const c = doc.createElement('div');
  c.className = 'cursor';
  c.setAttribute('aria-hidden', 'true');
  c.innerHTML = '<span></span>';
  doc.body.appendChild(c);
  const label = c.firstChild;
  let x = -100, y = -100, tx = -100, ty = -100;
  let on = false;
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      if (!on) {
        on = true;
        x = tx;
        y = ty;
        c.classList.add('is-on');
      }
    },
    { passive: true }
  );
  doc.addEventListener('mouseleave', () => { on = false; c.classList.remove('is-on'); });
  doc.addEventListener('mouseover', (e) => {
    const t = e.target;
    if (!t || !t.closest) return;
    const lab = t.closest('[data-cursor]');
    if (lab) {
      label.textContent = lab.getAttribute('data-cursor');
      c.classList.add('is-label');
      c.classList.remove('is-link');
      return;
    }
    c.classList.remove('is-label');
    c.classList.toggle('is-link', !!t.closest('a,button,summary,label,input,select,textarea,[role="button"]'));
  });
  const loop = () => {
    x = lerp(x, tx, 0.22);
    y = lerp(y, ty, 0.22);
    c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function initTilt() {
  if (!finePointer || reduce) return;
  $$('[data-tilt]').forEach((el) => {
    let raf = 0;
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--ry', (px * 7).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg');
      });
    });
    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--rx', '0deg');
    });
  });
}

function initMagnetic() {
  if (!finePointer || reduce) return;
  $$('[data-magnetic]').forEach((el) => {
    let tx = 0, ty = 0, x = 0, y = 0, run = false;
    const loop = () => {
      x = lerp(x, tx, 0.16);
      y = lerp(y, ty, 0.16);
      el.style.translate = x.toFixed(2) + 'px ' + y.toFixed(2) + 'px';
      if (Math.abs(x - tx) > 0.05 || Math.abs(y - ty) > 0.05) requestAnimationFrame(loop);
      else { run = false; if (!tx && !ty) el.style.translate = ''; }
    };
    const kick = () => { if (!run) { run = true; requestAnimationFrame(loop); } };
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * 0.28;
      ty = (e.clientY - (r.top + r.height / 2)) * 0.4;
      kick();
    });
    el.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  });
}

/* ---------------------------------------------------------------- page transitions */
let curtainEl = null;

/** Navigate with the ink-curtain wipe (falls back to a plain navigation). */
function navigateTo(url) {
  let went = false;
  const go = () => {
    if (went) return;
    went = true;
    location.href = url;
  };
  if (!curtainEl || !curtainEl.animate) return go();
  try { sessionStorage.setItem('skv-t', '1'); } catch (_) {}
  if (lenis) lenis.stop();
  curtainEl.classList.add('is-on');
  const an = curtainEl.animate({ transform: ['translateY(102%)', 'translateY(0%)'] }, { duration: 620, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
  an.onfinish = go;
  setTimeout(go, 900);
}

function initTransitions() {
  if (reduce) return;
  curtainEl = doc.createElement('div');
  curtainEl.className = 'curtain';
  curtainEl.setAttribute('aria-hidden', 'true');
  curtainEl.innerHTML = '<svg viewBox="0 0 24 24"><use href="#logo-mark"/></svg>';
  doc.body.appendChild(curtainEl);
  setTimeout(() => root.classList.remove('is-arriving'), 1500);

  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    curtainEl.style.transform = '';
    curtainEl.getAnimations().forEach((a) => a.cancel());
    curtainEl.classList.remove('is-on');
    root.classList.remove('is-arriving');
    if (lenis) lenis.start();
  });

  doc.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|sms:|javascript:)/i.test(href)) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    if (a.protocol !== location.protocol || a.host !== location.host) return;
    if (a.pathname === location.pathname && a.search === location.search) return; // same page (maybe a hash)
    e.preventDefault();
    navigateTo(a.href);
  });
}
