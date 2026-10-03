/* ==========================================================================
   30 FORMS: airport resolver, estimator, route search, quote wizard, lead forms, calculators
   The estimator formula below mirrors tools/build/lib/estimate.js. Keep the two in sync.
   ========================================================================== */
const APTS = DATA ? DATA.airports : [];
const CLASSES = DATA ? DATA.classes : [];
const byCode = {};
APTS.forEach((a) => { byCode[a.c] = a; });
const classById = {};
CLASSES.forEach((c) => { classById[c.id] = c; });
const CLASS_ORDER = ['turboprop', 'light', 'midsize', 'super-midsize', 'heavy', 'ultra-long-range'];
const CLASS_FLOOR = { ASE: 'midsize', JAC: 'midsize', SJD: 'midsize' }; // mountain and resort airports: never suggest a light jet
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const label = (a) => a.city + ' (' + a.c + ')';
const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

/** "TEB", "New York (TEB)", "new york", "Teterboro" -> airport record or null. */
function resolveAirport(q) {
  q = String(q || '').trim();
  if (!q) return null;
  const m = q.match(/\(([A-Za-z]{3,4})\)\s*$/);
  if (m && byCode[m[1].toUpperCase()]) return byCode[m[1].toUpperCase()];
  if (byCode[q.toUpperCase()]) return byCode[q.toUpperCase()];
  const n = norm(q);
  if (!n) return null;
  let hit = APTS.find((a) => norm(a.city) === n) || APTS.find((a) => norm(a.n) === n);
  if (hit) return hit;
  hit = APTS.find((a) => norm(a.city).indexOf(n) === 0) || APTS.find((a) => norm(a.n).indexOf(n) !== -1);
  return hit || null;
}

function haversine(a, b) {
  const R = 3958.8;
  const rad = Math.PI / 180;
  const dLat = (b.la - a.la) * rad;
  const dLon = (b.lo - a.lo) * rad;
  const s = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.la * rad) * Math.cos(b.la * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(s));
}

function estimateTrip(a, b, cls) {
  const miles = haversine(a, b);
  const intl = !!(a.i || b.i);
  const flight = miles / cls.speed + DATA.taxi;
  const hours = Math.max(1, flight);
  const tax = intl ? 0 : DATA.fet;
  return {
    miles: Math.round(miles),
    hours: flight,
    low: (hours * cls.rate[0] + DATA.fees[0]) * (1 + tax),
    high: (hours * cls.rate[1] + DATA.fees[1]) * (1 + tax),
    fuelStop: miles > cls.range * 0.9,
    intl,
  };
}

function recommendClass(a, b, pax) {
  const miles = haversine(a, b);
  const ranked = CLASS_ORDER.map((id) => classById[id]).filter(Boolean);
  const floor = Math.max(CLASS_ORDER.indexOf(CLASS_FLOOR[a.c] || ''), CLASS_ORDER.indexOf(CLASS_FLOOR[b.c] || ''));
  for (let i = 0; i < ranked.length; i++) {
    const c = ranked[i];
    if (CLASS_ORDER.indexOf(c.id) < floor) continue;
    if (c.id === 'turboprop' && (miles > 450 || pax > 7)) continue;
    if (pax <= c.pax[1] && miles <= c.range * 0.9) return c;
  }
  return classById['ultra-long-range'] || ranked[ranked.length - 1];
}

const priceRange = (e, mult) => money(roundTo(e.low * mult, 500)) + ' to ' + money(roundTo(e.high * mult, 500));

/** Tween a number into an element (keeps its own state on the element). */
function tweenNumber(el, to, render) {
  const from = typeof el._n === 'number' ? el._n : to;
  el._n = to;
  if (reduce || from === to) { el.textContent = render(to); return; }
  const id = (el._tw = (el._tw || 0) + 1);
  const t0 = performance.now();
  const tick = (t) => {
    if (el._tw !== id) return;
    const k = clamp((t - t0) / 650, 0, 1);
    el.textContent = render(from + (to - from) * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------------------------------------------------------------- steppers */
function initSteppers() {
  doc.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-stepper] [data-dec],[data-stepper] [data-inc]');
    if (!b) return;
    const wrap = b.closest('[data-stepper]');
    const input = $('input', wrap);
    if (!input) return;
    const min = parseInt(input.min, 10) || 1;
    const max = parseInt(input.max, 10) || 99;
    const cur = parseInt(input.value, 10) || min;
    const next = clamp(cur + (b.hasAttribute('data-inc') ? 1 : -1), min, max);
    if (next === cur) return;
    input.value = next;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

/* ---------------------------------------------------------------- range sliders */
function paintRange(r) {
  const min = parseFloat(r.min) || 0;
  const max = parseFloat(r.max) || 100;
  r.style.setProperty('--fill', (((parseFloat(r.value) - min) / (max - min)) * 100).toFixed(1) + '%');
}

/* ---------------------------------------------------------------- estimator */
function initEstimators() {
  if (!DATA) return;
  $$('[data-estimator]').forEach((est) => {
    const form = $('form', est);
    if (!form) return;
    const f = form.elements;
    const out = {
      cls: $('[data-est-class]', est),
      price: $('[data-est-price]', est),
      miles: $('[data-est-miles]', est),
      time: $('[data-est-time]', est),
      range: $('[data-est-range]', est),
      note: $('[data-est-note]', est),
      cta: $('[data-est-cta]', est),
      photo: $('[data-est-photo]', est),
    };
    const ctaBase = out.cta ? out.cta.getAttribute('href') : '';
    let lastClass = '';

    const showPhoto = (cls) => {
      if (!out.photo || lastClass === cls.id) return;
      lastClass = cls.id;
      let img = $('img[data-cls="' + cls.id + '"]', out.photo);
      if (!img) {
        img = doc.createElement('img');
        img.setAttribute('data-cls', cls.id);
        img.alt = '';
        img.decoding = 'async';
        img.src = cls.photo;
        out.photo.appendChild(img);
      }
      $$('img', out.photo).forEach((i) => i.classList.toggle('is-on', i === img));
      void img.offsetWidth;
      img.classList.add('is-on');
    };

    const run = () => {
      const a = byCode[f.from.value];
      const b = byCode[f.to.value];
      const pax = clamp(parseInt(f.pax.value, 10) || 1, 1, 16);
      const round = f.trip && f.trip.value === 'round';
      if (!a || !b) return;
      if (a === b) {
        if (out.note) out.note.textContent = 'Choose two different airports to see an estimate.';
        return;
      }
      const cls = recommendClass(a, b, pax);
      const e = estimateTrip(a, b, cls);
      const mult = round ? 2 : 1;
      if (out.cls) out.cls.textContent = cls.name;
      if (out.price) {
        // tween both ends of the range; the final text is always exact
        const final = priceRange(e, mult);
        const lo = roundTo(e.low * mult, 500);
        const hi = roundTo(e.high * mult, 500);
        const from = typeof out.price._lo === 'number' ? out.price._lo : lo;
        const fromHi = typeof out.price._hi === 'number' ? out.price._hi : hi;
        out.price._lo = lo;
        out.price._hi = hi;
        const id = (out.price._id = (out.price._id || 0) + 1);
        if (reduce || (from === lo && fromHi === hi)) out.price.textContent = final;
        else {
          const t0 = performance.now();
          const tick = (t) => {
            if (out.price._id !== id) return;
            const k = clamp((t - t0) / 650, 0, 1);
            const ease = 1 - Math.pow(1 - k, 3);
            out.price.textContent = money(roundTo(lerp(from, lo, ease), 100)) + ' to ' + money(roundTo(lerp(fromHi, hi, ease), 100));
            if (k < 1) requestAnimationFrame(tick);
            else out.price.textContent = final;
          };
          requestAnimationFrame(tick);
        }
      }
      if (out.miles) out.miles.textContent = fmt(e.miles * mult) + ' mi' + (round ? ' round trip' : '');
      if (out.time) out.time.textContent = hm(e.hours) + (round ? ' each way' : '');
      if (out.range) out.range.textContent = fmt(cls.range) + ' mi';
      if (out.note) {
        const bits = [];
        bits.push(cls.name.replace(/s$/, '') + ' seat ' + cls.pax[0] + ' to ' + cls.pax[1] + ' passengers. ' + cls.bags + '.');
        if (e.fuelStop) bits.push('This trip is close to the aircraft’s range, so a fuel stop is likely.');
        if (e.intl) bits.push('International trips have no 7.5% federal excise tax but add customs, handling and permit costs.');
        if (round) bits.push('Round trips are estimated as two legs. Overnight stays add crew costs.');
        out.note.textContent = bits.join(' ');
      }
      showPhoto(cls);
      if (out.cta && ctaBase) {
        const q = 'from=' + a.c + '&to=' + b.c + '&pax=' + pax + (round ? '&trip=round' : '');
        out.cta.setAttribute('href', ctaBase + (ctaBase.indexOf('?') === -1 ? '?' : '&') + q);
      }
    };

    let timer = 0;
    form.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 60); });
    form.addEventListener('change', run);
    form.addEventListener('submit', (e) => e.preventDefault());
    if (out.cta) out.cta.addEventListener('click', () => evt('estimator_cta', { from: f.from.value, to: f.to.value }));
    run();
  });
}

/* ---------------------------------------------------------------- hero route search */
function initRouteSearch() {
  $$('[data-route-search]').forEach((form) => {
    const from = form.elements.from;
    const to = form.elements.to;
    const date = form.elements.date;
    const swap = $('[data-swap]', form);
    if (date) date.min = todayISO();
    if (swap) {
      swap.addEventListener('click', () => {
        const t = from.value;
        from.value = to.value;
        to.value = t;
        if (swap.animate && !reduce) swap.animate({ transform: ['rotate(0deg)', 'rotate(180deg)'] }, { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    }
    const tidy = (input) => {
      const a = resolveAirport(input.value);
      if (a) input.value = label(a);
      input.setCustomValidity('');
    };
    [from, to].forEach((i) => {
      i.addEventListener('change', () => tidy(i));
      i.addEventListener('input', () => i.setCustomValidity(''));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const a = resolveAirport(from.value);
      const b = resolveAirport(to.value);
      if (!from.value.trim()) { from.setCustomValidity('Where are you flying from?'); from.reportValidity(); return; }
      if (!to.value.trim()) { to.setCustomValidity('Where are you flying to?'); to.reportValidity(); return; }
      const params = new URLSearchParams();
      params.set('from', a ? a.c : from.value.trim());
      params.set('to', b ? b.c : to.value.trim());
      if (date && date.value) params.set('date', date.value);
      params.set('pax', form.elements.pax.value);
      evt('route_search', { from: params.get('from'), to: params.get('to') });
      navigateTo(form.getAttribute('action') + '?' + params.toString());
    });
  });
}

/* ---------------------------------------------------------------- sending helpers (endpoint or WhatsApp / email fallback) */
function payloadText(title, p) {
  const lines = [title];
  Object.keys(p).forEach((k) => {
    if (p[k] === '' || p[k] == null || k === 'website' || k === 'consent') return;
    const v = Array.isArray(p[k]) ? p[k].join(', ') : p[k];
    lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ': ' + v);
  });
  return lines.join('\n');
}

function fallbackLinks(title, p) {
  const text = payloadText(title, p);
  const wrap = doc.createElement('div');
  wrap.className = 'cta-row';
  const wa = doc.createElement('a');
  wa.className = 'btn btn-gold';
  wa.target = '_blank';
  wa.rel = 'noopener';
  wa.href = 'https://wa.me/' + DATA.wa + '?text=' + encodeURIComponent(text);
  wa.innerHTML = '<span>Send on WhatsApp</span>';
  wa.addEventListener('click', () => evt('generate_lead', { method: 'whatsapp', form: title }));
  const mail = doc.createElement('a');
  mail.className = 'btn btn-ghost';
  mail.href = 'mailto:' + DATA.email + '?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(text);
  mail.innerHTML = '<span>Send by email</span>';
  mail.addEventListener('click', () => evt('generate_lead', { method: 'email', form: title }));
  wrap.appendChild(wa);
  wrap.appendChild(mail);
  return wrap;
}

/** Resolves true when delivered to the endpoint, false when there is none (fallback), rejects on failure. */
function sendPayload(p) {
  if (!DATA || !DATA.endpoint) return Promise.resolve(false);
  return fetch(DATA.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(p),
  }).then((r) => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return true;
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const validField = (input) => {
  const v = input.value.trim();
  if (input.type === 'checkbox') return input.checked;
  if (input.required && !v) return false;
  if (input.type === 'email' && v && !EMAIL_RE.test(v)) return false;
  if (input.type === 'tel' && v && v.replace(/\D/g, '').length < 7) return false;
  return true;
};
const markField = (input, ok) => {
  const f = input.closest('.field') || input.closest('.check');
  if (f) f.classList.toggle('is-invalid', !ok);
  input.setAttribute('aria-invalid', ok ? 'false' : 'true');
};

/* ---------------------------------------------------------------- quote wizard */
function initQuoteForm() {
  const form = $('[data-quote-form]');
  if (!form || !DATA) return;
  const panes = $$('.qf-pane', form);
  const stepLis = $$('.qf-steps li', form);
  const bar = $('[data-qf-bar]', form);
  const prev = $('[data-prev]', form);
  const next = $('[data-next]', form);
  const submit = $('[data-submit]', form);
  const err = $('[data-qf-error]', form);
  const live = $('[data-qf-live]', form);
  const livePrice = $('[data-qf-live-price]', form);
  const liveNote = $('[data-qf-live-note]', form);
  const done = $('[data-qf-done]', form);
  const doneText = $('[data-qf-done-text]', form);
  const ret = $('[data-return]', form);
  const f = form.elements;
  let step = 0;
  let started = false;

  f.date.min = todayISO();
  if (f.return) f.return.min = todayISO();

  // prefill from ?from=&to=&pax=&date=&trip=
  try {
    const q = new URLSearchParams(location.search);
    const setAirport = (input, v) => {
      if (!v) return;
      const a = resolveAirport(v);
      input.value = a ? label(a) : v;
    };
    setAirport(f.from, q.get('from'));
    setAirport(f.to, q.get('to'));
    if (q.get('pax')) f.pax.value = clamp(parseInt(q.get('pax'), 10) || 4, 1, 16);
    if (q.get('date') && /^\d{4}-\d{2}-\d{2}$/.test(q.get('date'))) f.date.value = q.get('date');
    const trip = (q.get('trip') || '').toLowerCase();
    if (trip) {
      const want = trip === 'round' ? 'Round trip' : trip === 'multi' ? 'Multi-city' : 'One way';
      $$('input[name="trip"]', form).forEach((r) => { r.checked = r.value === want; });
    }
  } catch (_) {}

  const tripValue = () => ($$('input[name="trip"]', form).filter((r) => r.checked)[0] || {}).value || 'One way';

  const syncReturn = () => {
    if (ret) ret.hidden = tripValue() !== 'Round trip';
  };

  const updateLive = () => {
    if (!live) return;
    const a = resolveAirport(f.from.value);
    const b = resolveAirport(f.to.value);
    if (!a || !b || a === b) { live.hidden = true; return; }
    const pax = clamp(parseInt(f.pax.value, 10) || 1, 1, 16);
    const cls = recommendClass(a, b, pax);
    const e = estimateTrip(a, b, cls);
    const mult = tripValue() === 'Round trip' ? 2 : 1;
    live.hidden = false;
    livePrice.textContent = priceRange(e, mult);
    liveNote.textContent = cls.name + ' · ' + fmt(e.miles) + ' mi · about ' + hm(e.hours) + (mult === 2 ? ' each way' : '') + '. Indicative only. A firm quote follows.';
  };

  const showError = (msg) => {
    if (!err) return;
    err.textContent = msg || '';
    err.hidden = !msg;
  };

  const validateStep = (n) => {
    let ok = true;
    let msg = '';
    const check = (input, cond, text) => {
      const good = cond === undefined ? validField(input) : cond;
      markField(input, good);
      if (!good) { ok = false; if (!msg) msg = text; }
    };
    if (n === 0) {
      check(f.from, f.from.value.trim().length > 1, 'Tell us where you are flying from.');
      check(f.to, f.to.value.trim().length > 1, 'Tell us where you are flying to.');
      const a = resolveAirport(f.from.value);
      const b = resolveAirport(f.to.value);
      if (ok && a && b && a === b) { markField(f.to, false); ok = false; msg = 'Departure and arrival airports are the same.'; }
      check(f.date, !!f.date.value && f.date.value >= todayISO(), 'Choose a departure date that is today or later.');
      const pax = parseInt(f.pax.value, 10);
      check(f.pax, pax >= 1 && pax <= 16, 'We can seat between 1 and 16 passengers.');
      if (tripValue() === 'Round trip' && f.return) check(f.return, !!f.return.value && f.return.value >= f.date.value, 'Choose a return date on or after your departure.');
    }
    if (n === 2) {
      check(f.name, f.name.value.trim().length > 1, 'Please add your name.');
      check(f.email, EMAIL_RE.test(f.email.value.trim()), 'Enter a valid email address.');
      check(f.phone, f.phone.value.replace(/\D/g, '').length >= 7, 'Enter a mobile number so we can reach you about the flight.');
      check(f.consent, f.consent.checked, 'Please agree to be contacted so we can reply to your request.');
    }
    showError(ok ? '' : msg);
    return ok;
  };

  const go = (n) => {
    step = clamp(n, 0, panes.length - 1);
    panes.forEach((p, i) => {
      const on = i === step;
      p.hidden = !on;
      p.classList.toggle('is-active', on);
    });
    stepLis.forEach((li, i) => {
      li.classList.toggle('is-active', i === step);
      li.classList.toggle('is-done', i < step);
    });
    if (bar) bar.style.transform = 'scaleX(' + ((step + 1) / panes.length).toFixed(3) + ')';
    prev.hidden = step === 0;
    next.hidden = step === panes.length - 1;
    submit.hidden = step !== panes.length - 1;
    showError('');
    const h = $('.qf-h', panes[step]);
    if (h) { h.setAttribute('tabindex', '-1'); if (started) h.focus({ preventScroll: true }); }
    if (started) {
      const top = form.getBoundingClientRect().top;
      if (top < 80) {
        const hdr = parseInt(getComputedStyle(root).getPropertyValue('--hdr'), 10) || 76;
        if (lenis) lenis.scrollTo(form, { offset: -(hdr + 20), duration: 0.9 });
        else window.scrollTo({ top: window.scrollY + top - hdr - 20, behavior: reduce ? 'auto' : 'smooth' });
      }
      evt('quote_step', { step: step + 1 });
    }
    started = true;
  };

  next.addEventListener('click', () => {
    if (validateStep(step)) go(step + 1);
  });
  prev.addEventListener('click', () => go(step - 1));
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t && t.closest && t.closest('.is-invalid')) {
      if (validField(t)) markField(t, true);
    }
    if (['from', 'to', 'pax', 'trip'].indexOf(t.name) !== -1) updateLive();
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'trip') { syncReturn(); updateLive(); }
    if (e.target.name === 'from' || e.target.name === 'to') {
      const a = resolveAirport(e.target.value);
      if (a) e.target.value = label(a);
      updateLive();
    }
  });
  // Enter advances the wizard instead of submitting early
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON' && step < panes.length - 1) {
      e.preventDefault();
      next.click();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (step < panes.length - 1) { next.click(); return; }
    if (!validateStep(0)) { go(0); validateStep(0); return; }
    if (!validateStep(2)) return;
    const a = resolveAirport(f.from.value);
    const b = resolveAirport(f.to.value);
    const extras = $$('input[name="extras"]', form).filter((c) => c.checked).map((c) => c.value);
    const aircraft = ($$('input[name="aircraft"]', form).filter((r) => r.checked)[0] || {}).value || 'Best fit';
    const payload = {
      type: 'Quote request',
      trip: tripValue(),
      from: a ? label(a) : f.from.value.trim(),
      to: b ? label(b) : f.to.value.trim(),
      date: f.date.value + (f.time && f.time.value ? ' ' + f.time.value : ''),
      return: tripValue() === 'Round trip' && f.return ? f.return.value : '',
      passengers: f.pax.value,
      aircraft,
      extras,
      name: f.name.value.trim(),
      email: f.email.value.trim(),
      phone: f.phone.value.trim(),
      company: f.company.value.trim(),
      notes: f.notes.value.trim(),
      estimate: live && !live.hidden ? livePrice.textContent : '',
      page: location.href,
      sent: new Date().toISOString(),
    };
    if (f.website.value) { finishQuote(false, payload, true); return; } // honeypot: pretend success, send nothing
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    sendPayload(payload)
      .then((delivered) => finishQuote(delivered, payload, false))
      .catch(() => {
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
        showError('We could not send your request just now. Please try again, or use the buttons on the next screen.');
        finishQuote(false, payload, false, true);
      });
  });

  function finishQuote(delivered, payload, silent, failed) {
    $$('.qf-pane,.qf-steps,.qf-bar,.qf-nav', form).forEach((n) => { n.hidden = true; });
    showError('');
    done.hidden = false;
    const old = $('.cta-row[data-fallback]', done);
    if (old) old.remove();
    if (delivered || silent) {
      doneText.textContent = 'Thank you, ' + (payload.name.split(' ')[0] || 'and welcome aboard') + '. An advisor will reply to ' + payload.email + ' with firm options, usually within minutes.';
      if (!silent) evt('generate_lead', { form: 'quote', method: 'endpoint', route: payload.from + ' > ' + payload.to });
    } else {
      doneText.textContent = (failed ? 'Our form could not be reached. ' : 'Your request is ready. ') + 'Send it to the flight desk in one tap and an advisor will reply right away.';
      const links = fallbackLinks('Quote request: ' + payload.from + ' to ' + payload.to, payload);
      links.setAttribute('data-fallback', '');
      done.insertBefore(links, $('.cta-row', done));
    }
    done.focus({ preventScroll: true });
    const top = form.getBoundingClientRect().top;
    if (top < 0) {
      if (lenis) lenis.scrollTo(form, { offset: -100, duration: 0.8 });
      else form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  syncReturn();
  go(0);
  updateLive();
  // if the page was opened with a full route already filled in, say so
  if (f.from.value && f.to.value && !live.hidden) evt('quote_prefilled', { from: f.from.value, to: f.to.value });
}

/* ---------------------------------------------------------------- lead and alert forms */
function initSimpleForms() {
  if (!DATA) return;
  const bind = (form, cfg) => {
    const msg = $(cfg.msg, form);
    const btn = $('button[type="submit"]', form);
    const setMsg = (text, kind) => {
      if (!msg) return;
      msg.textContent = text || '';
      msg.classList.toggle('is-ok', kind === 'ok');
      msg.classList.toggle('is-error', kind === 'error');
      msg.hidden = !text;
    };
    form.addEventListener('input', (e) => {
      const t = e.target;
      if (t && t.closest && t.closest('.is-invalid') && validField(t)) markField(t, true);
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      let first = null;
      $$('input,select,textarea', form).forEach((inp) => {
        if (inp.name === 'website' || inp.type === 'hidden' || inp.type === 'submit') return;
        const good = validField(inp);
        if (inp.required || inp.value) markField(inp, good);
        if (!good) { ok = false; if (!first) first = inp; }
      });
      if (!ok) {
        setMsg(first && first.type === 'checkbox' ? 'Please agree to be contacted so we can reply.' : first && first.type === 'email' ? 'Enter a valid email address.' : 'Please complete the highlighted fields.', 'error');
        if (first && first.focus) first.focus();
        return;
      }
      const payload = { type: cfg.title(form), page: location.href, sent: new Date().toISOString() };
      $$('input,select,textarea', form).forEach((inp) => {
        if (!inp.name || inp.type === 'checkbox') return;
        payload[inp.name] = inp.value.trim();
      });
      if (payload.website) { form.reset(); setMsg(cfg.success(form), 'ok'); return; } // honeypot
      delete payload.website;
      if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }
      sendPayload(payload)
        .then((delivered) => {
          if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
          if (delivered) {
            form.reset();
            setMsg(cfg.success(form), 'ok');
            evt('generate_lead', { form: payload.type, method: 'endpoint' });
          } else {
            setMsg('', '');
            msg.hidden = false;
            msg.classList.add('is-ok');
            msg.textContent = 'Almost done. Send your details to the flight desk in one tap:';
            const old = $('.cta-row[data-fallback]', form);
            if (old) old.remove();
            const links = fallbackLinks(payload.type, payload);
            links.setAttribute('data-fallback', '');
            links.style.marginTop = '14px';
            msg.insertAdjacentElement('afterend', links);
          }
        })
        .catch(() => {
          if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
          setMsg('Sorry, that did not send. Please try again or call ' + DATA.phone + '.', 'error');
        });
    });
  };
  $$('[data-lead-form]').forEach((form) =>
    bind(form, {
      msg: '[data-lead-msg]',
      title: (fm) => fm.getAttribute('data-topic') || 'Website enquiry',
      success: (fm) => fm.getAttribute('data-success') || 'Thank you. We will be in touch shortly.',
    })
  );
  $$('[data-alert-form]').forEach((form) =>
    bind(form, {
      msg: '[data-alert-msg]',
      title: () => 'Empty leg alert signup',
      success: () => 'You are on the list. We will email deals that match your routes.',
    })
  );
}

/* ---------------------------------------------------------------- calculators */
function initCalculators() {
  $$('input[type="range"]').forEach((r) => {
    paintRange(r);
    r.addEventListener('input', () => paintRange(r));
  });

  $$('[data-hours-calc]').forEach((box) => {
    const range = $('[data-hours]', box);
    const val = $('[data-hours-val]', box);
    const opts = $$('[data-opt]', box);
    if (!range) return;
    const update = () => {
      const h = parseInt(range.value, 10) || 0;
      if (val) val.textContent = h;
      const best = h <= 25 ? 'charter' : h <= 100 ? 'card' : 'fractional';
      opts.forEach((o) => o.classList.toggle('is-best', o.getAttribute('data-opt') === best));
    };
    range.addEventListener('input', update);
    update();
  });

  $$('[data-roi]').forEach((box) => {
    const n = $('[data-roi-n]', box);
    const rate = $('[data-roi-rate]', box);
    const hrs = $('[data-roi-hrs]', box);
    const out = $('[data-roi-out]', box);
    if (!n || !rate || !hrs || !out) return;
    const update = () => {
      const total = Math.max(0, parseFloat(n.value) || 0) * Math.max(0, parseFloat(rate.value) || 0) * Math.max(0, parseFloat(hrs.value) || 0);
      tweenNumber(out, total, (v) => money(v));
    };
    [n, rate, hrs].forEach((i) => i.addEventListener('input', update));
    update();
  });
}
