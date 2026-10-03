/* ==========================================================================
   10 SCENES: scroll-driven set pieces (hero take-off, fleet gallery, route map, steps, landing)
   ========================================================================== */
const DESKTOP = '(min-width: 901px)';
const mm = hasGSAP ? gsap.matchMedia() : null;

/* ---------------------------------------------------------------- hero: scroll to take off */
function sceneHero() {
  const hero = $('[data-hero]');
  if (!hero) return;
  const title = $('[data-hero-title]', hero);
  const ground = $('.hero-ground', hero);
  const sky = $('.hero-sky', hero);
  const inner = $('.hero-in', hero);
  const shade = $('.hero-shade', hero);
  const cue = $('.scroll-cue', hero);
  const altEl = $('[data-hud-alt]', hero);
  const spdEl = $('[data-hud-spd]', hero);
  const stEl = $('[data-hud-status]', hero);

  // intro: headline words rise, then the rest of the hero fades up
  if (title) {
    title.setAttribute('data-split', '');
    splitEl(title);
  }
  const go = () => {
    hero.classList.add('is-go');
    if (title) title.classList.add('is-in');
  };
  const groundImg = $('.hero-ground-img', hero);
  const ready = Promise.all([
    doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve(),
    groundImg && !groundImg.complete ? new Promise((r) => { groundImg.addEventListener('load', r, { once: true }); groundImg.addEventListener('error', r, { once: true }); }) : Promise.resolve(),
  ]);
  Promise.race([ready, new Promise((r) => setTimeout(r, 1800))]).then(() => requestAnimationFrame(go));

  const stages = [[0, 'Boarding'], [0.09, 'Taxiing'], [0.2, 'Take-off roll'], [0.34, 'Climbing'], [0.72, 'Cruising']];
  const setHud = (p) => {
    if (altEl) altEl.textContent = fmt(Math.round((35000 * easeInOut(clamp((p - 0.26) / 0.74, 0, 1))) / 100) * 100);
    if (spdEl) {
      const v = p < 0.09 ? 0 : p < 0.3 ? lerp(0, 160, (p - 0.09) / 0.21) : lerp(160, 480, (p - 0.3) / 0.7);
      spdEl.textContent = fmt(v);
    }
    if (stEl) {
      let label = stages[0][1];
      stages.forEach((s) => { if (p >= s[0]) label = s[1]; });
      if (stEl.textContent !== label) stEl.textContent = label;
    }
  };
  setHud(0);

  if (!mm || reduce) return;
  mm.add(DESKTOP, () => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=180%',
        pin: true,
        scrub: 0.55,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setHud(self.progress),
      },
    });
    tl.to(ground, { scale: 1.4, yPercent: 7, duration: 1 }, 0)
      .to(ground, { opacity: 0, duration: 0.55 }, 0.34)
      .fromTo(sky, { scale: 1.38 }, { scale: 1, duration: 1 }, 0)
      .to(inner, { yPercent: -24, opacity: 0, duration: 0.5 }, 0.08)
      .to(shade, { opacity: 0.6, duration: 1 }, 0);
    if (cue) tl.to(cue, { opacity: 0, duration: 0.15 }, 0);
    return () => setHud(0);
  });
  mm.add('(max-width: 900px)', () => {
    gsap.to(ground, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  });
}

/** Loads the hero video lazily on capable desktop connections, and pauses it when off-screen. */
function sceneVideo() {
  const v = $('.hero-video');
  if (!v || reduce) return;
  const conn = navigator.connection || {};
  if (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '') || window.innerWidth < 900) return;
  const start = () => {
    v.src = window.innerWidth > 1500 && v.dataset.srcHd ? v.dataset.srcHd : v.dataset.srcSd || v.dataset.srcHd;
    v.muted = true;
    const p = v.play();
    if (p && p.then) p.then(() => v.classList.add('is-playing')).catch(() => {});
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => {
        en.forEach((x) => (x.isIntersecting ? v.play().catch(() => {}) : v.pause()));
      }).observe(v.closest('.hero'));
    }
  };
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 900));
  if (doc.readyState === 'complete') idle(start);
  else window.addEventListener('load', () => idle(start), { once: true });
}

/* ---------------------------------------------------------------- fleet: horizontal scroll */
function sceneFleet() {
  const sec = $('[data-fleet-h]');
  if (!sec || !mm || reduce) return;
  const track = $('[data-fleet-track]', sec);
  const bar = $('[data-fleet-bar]', sec);
  const idx = $('[data-fleet-idx]', sec);
  const cards = $$('.fcard', track).filter((c) => !c.classList.contains('fcard--end'));
  mm.add(DESKTOP, () => {
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: sec,
        start: 'top top',
        end: () => '+=' + dist(),
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (bar) bar.style.transform = 'scaleX(' + Math.max(0.04, self.progress).toFixed(3) + ')';
          if (idx) {
            const i = clamp(Math.round(self.progress * (cards.length - 1)) + 1, 1, cards.length);
            const s = '0' + i;
            if (idx.textContent !== s) idx.textContent = s;
          }
        },
      },
    });
    cards.forEach((card) => {
      const im = $('.fcard-media .ph', card);
      if (!im) return;
      gsap.set(im, { scale: 1.2 });
      gsap.fromTo(
        im,
        { xPercent: -6 },
        { xPercent: 6, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } }
      );
    });
  });
}

/* ---------------------------------------------------------------- route map scene */
function sceneMap() {
  const sc = $('[data-mapscene]');
  if (!sc || !hasGSAP) return;
  const svg = $('.route-map-svg', sc);
  const sweep = $('.map-sweep', sc);
  const items = $$('[data-route-i]', sc);
  const live = $('[data-map-live]', sc);
  const groups = $$('.map-route', sc);
  if (!svg || !groups.length) return;
  if (reduce) {
    items.forEach((i) => i.classList.add('is-done'));
    if (live) live.textContent = groups.length;
    return;
  }
  const W = parseFloat(sweep.getAttribute('width')) || 1000;
  const arcs = groups.map((g) => {
    const path = $('.map-arc', g);
    return { path, plane: $('.map-plane', g), len: path.getTotalLength() };
  });
  const place = (a, p) => {
    const L = a.len * p;
    const pt = a.path.getPointAtLength(L);
    const pt2 = a.path.getPointAtLength(Math.min(a.len, L + 1));
    const deg = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
    a.plane.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ') rotate(' + deg.toFixed(1) + ')');
  };
  const N = arcs.length;
  const START = 1.1;
  const build = (tl) => {
    tl.fromTo(sweep, { attr: { width: 0 } }, { attr: { width: W }, ease: 'power1.inOut', duration: START });
    arcs.forEach((a, i) => {
      const t0 = START + i;
      const st = { p: 0 };
      tl.fromTo(a.path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', duration: 0.95 }, t0);
      tl.set(a.plane, { opacity: 1 }, t0);
      tl.to(st, { p: 1, ease: 'none', duration: 0.95, onUpdate: () => place(a, st.p) }, t0);
      tl.to(a.plane, { opacity: 0, duration: 0.12 }, t0 + 0.9);
    });
    tl.to({}, { duration: 0.6 });
    return tl;
  };
  const update = (tl) => {
    const i = clamp(Math.floor(tl.time() - START + 0.02), -1, N - 1);
    items.forEach((li, k) => {
      li.classList.toggle('is-active', k === i);
      li.classList.toggle('is-done', k < i);
    });
    if (live) live.textContent = String(Math.max(0, i + 1));
  };
  arcs.forEach((a) => place(a, 0));

  mm.add('(min-width: 1001px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: sc, start: 'top top', end: '+=330%', pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true },
      onUpdate: () => update(tl),
    });
    build(tl);
    return () => {
      items.forEach((li) => li.classList.remove('is-active', 'is-done'));
    };
  });
  mm.add('(max-width: 1000px)', () => {
    const tl = gsap.timeline({ paused: true, onUpdate: () => update(tl) });
    build(tl).timeScale(1.9);
    const st = ScrollTrigger.create({ trigger: sc, start: 'top 60%', once: true, onEnter: () => tl.play() });
    return () => st.kill();
  });
}

/* ---------------------------------------------------------------- how it works: sticky photo swaps with each step */
function sceneSteps() {
  const sec = $('[data-steps]');
  if (!sec) return;
  const steps = $$('[data-step]', sec);
  const imgs = $$('[data-steps-img]', sec);
  const num = $('[data-steps-n]', sec);
  let cur = -1;
  const set = (i) => {
    if (i === cur) return;
    cur = i;
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    imgs.forEach((m, k) => m.classList.toggle('is-active', k === i));
    if (num) num.textContent = '0' + (i + 1);
  };
  set(0);
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) set(steps.indexOf(en.target));
      });
    },
    { rootMargin: '-42% 0px -48% 0px', threshold: 0 }
  );
  steps.forEach((s) => io.observe(s));
}

/* ---------------------------------------------------------------- landing: descend, lights come on */
function sceneLanding() {
  const sec = $('[data-landing]');
  if (!sec) return;
  const altEl = $('[data-land-alt]', sec);
  const stEl = $('[data-land-status]', sec);
  const img = $('[data-landing-img]', sec);
  const lights = $$('.rw-light', sec);
  const line = $('.rw-line', sec);
  const stages = [[0, 'On approach'], [0.45, 'Final approach'], [0.8, 'Landing'], [0.97, 'Welcome']];
  const setAlt = (p) => {
    if (altEl) altEl.textContent = fmt(Math.round((3200 * (1 - easeInOut(clamp(p / 0.95, 0, 1)))) / 10) * 10);
    if (stEl) {
      let label = stages[0][1];
      stages.forEach((s) => { if (p >= s[0]) label = s[1]; });
      if (stEl.textContent !== label) stEl.textContent = label;
    }
    sec.classList.toggle('is-landed', p > 0.96);
  };
  setAlt(0);
  if (!hasGSAP || reduce) {
    setAlt(1);
    lights.forEach((l) => (l.style.opacity = 1));
    return;
  }
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: sec, start: 'top 85%', end: 'center 45%', scrub: 0.6, onUpdate: (self) => setAlt(self.progress) },
  });
  if (img) tl.fromTo(img, { scale: 1.4, yPercent: -4 }, { scale: 1, yPercent: 0, duration: 1 }, 0);
  if (lights.length) tl.fromTo(lights, { opacity: 0.12 }, { opacity: 1, stagger: { each: 0.045, from: 'end' }, duration: 0.2 }, 0.1);
  if (line) tl.fromTo(line, { backgroundPositionY: '0px' }, { backgroundPositionY: '320px', duration: 1 }, 0);
}
