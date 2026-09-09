/* Biltflow motion governor — ~1 KB.
   Pauses any looping animation whose element is off-screen, resumes on re-entry.
   Without this, bfTravel (10s) and bfPulse (7s) keep the compositor working
   for the whole 13,000px page even when the ring is nowhere near the viewport. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window) || !document.getAnimations) return;

  function govern() {
    var byTarget = new Map();
    document.getAnimations().forEach(function (a) {
      var t = a.effect && a.effect.target;
      if (!t) return;
      // only bother with looping animations; one-shots finish on their own
      var it = a.effect.getTiming().iterations;
      if (it !== Infinity) return;
      if (!byTarget.has(t)) byTarget.set(t, []);
      byTarget.get(t).push(a);
    });
    if (!byTarget.size) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var list = byTarget.get(e.target) || [];
        list.forEach(function (a) {
          try { e.isIntersecting ? a.play() : a.pause(); } catch (_) {}
        });
      });
    }, { rootMargin: '120px' });

    byTarget.forEach(function (_, t) {
      // observe the nearest laid-out ancestor — SVG children report empty rects in some engines
      var o = t;
      while (o && !o.getBoundingClientRect().height) o = o.parentElement;
      io.observe(o || t);
      if (o && o !== t) { byTarget.set(o, byTarget.get(t)); }
    });
    window.__biltflowMotion = { observed: byTarget.size };
  }

  // The artboard is client-rendered by support.js, so the animations do not exist
  // yet at load. Retry until they appear, then stop.
  var tries = 0;
  (function attempt() {
    tries++;
    var looping = document.getAnimations().some(function (a) {
      return a.effect && a.effect.getTiming().iterations === Infinity;
    });
    if (looping) { govern(); return; }
    if (tries < 40) setTimeout(attempt, 150);           // give up after ~6s
    else window.__biltflowMotion = { observed: 0, note: 'no looping animations found' };
  })();
})();
