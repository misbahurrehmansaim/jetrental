/* ==========================================================================
   99 INIT: start everything. Each piece is isolated so one failure never breaks the page.
   ========================================================================== */
function boot() {
  if (reduce) root.classList.add('no-anim');
  if (history.scrollRestoration && $('[data-hero]')) history.scrollRestoration = 'manual';

  safe('scroll', initScroll);
  safe('anchors', initAnchors);
  safe('reveal', initReveal);
  safe('header', initHeader);
  safe('accordion', initAccordion);
  safe('filters', initFilters);
  safe('steppers', initSteppers);
  safe('estimators', initEstimators);
  safe('route-search', initRouteSearch);
  safe('quote-form', initQuoteForm);
  safe('simple-forms', initSimpleForms);
  safe('calculators', initCalculators);
  safe('leg-dates', initLegDates);
  safe('counters', initCounters);
  safe('toc', initToc);
  safe('events', initEvents);

  if (hasGSAP) {
    safe('scene:hero', sceneHero);
    safe('scene:video', sceneVideo);
    safe('scene:fleet', sceneFleet);
    safe('scene:map', sceneMap);
    safe('scene:steps', sceneSteps);
    safe('scene:landing', sceneLanding);
    safe('scene:parallax', sceneParallax);
    safe('scroll:sort', () => ScrollTrigger.sort());
  } else {
    // no GSAP: still run the parts that do not need it so the hero text appears
    safe('scene:hero', sceneHero);
    safe('scene:steps', sceneSteps);
  }

  // these read layout, so they run after the pins exist
  safe('tracker', initTracker);
  safe('marquee', initMarquee);
  safe('cursor', initCursor);
  safe('tilt', initTilt);
  safe('magnetic', initMagnetic);
  safe('transitions', initTransitions);

  root.classList.add('is-ready');

  const refresh = () => {
    if (hasGSAP) ScrollTrigger.refresh();
    if (lenis) lenis.resize();
  };
  window.addEventListener('load', () => {
    refresh();
    // honour a #hash now that pinned sections have added their spacing
    if (location.hash && location.hash.length > 1) {
      const t = doc.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) {
        const hdr = parseInt(getComputedStyle(root).getPropertyValue('--hdr'), 10) || 76;
        setTimeout(() => (lenis ? lenis.scrollTo(t, { offset: -(hdr + 12), immediate: true }) : t.scrollIntoView()), 80);
      }
    }
  });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(refresh);
  let rt = 0;
  window.addEventListener('orientationchange', () => { clearTimeout(rt); rt = setTimeout(refresh, 300); });
}

if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
else boot();
