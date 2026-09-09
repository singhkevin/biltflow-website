/* Biltflow — thirteen-stages scroll link.
   The exported component registers this logic but it never fires: no row opacity is
   ever written and [data-marker] keeps an empty strokeDashoffset at every scroll
   position, so the ring marker never moves. This drives it directly.
   Active stage = the last row whose top has crossed 45% of the viewport. */
(function () {
  var SEG = 96.66;                      // one thirteenth of the ring path, from the source
  var rows, marker, labels, ticks, nums, active = -1, ticking = false;

  function collect() {
    marker = document.querySelector('[data-marker]');
    if (!marker) return false;
    // SCOPE: only the big lifecycle ring. There are 39 more [data-label]/[data-num]
    // elements in the three module dials further down; querying globally recoloured
    // those too and lit a stage in all three cards.
    var root = marker.closest('section') || document;
    rows   = [].slice.call(root.querySelectorAll('[data-stage]'));
    labels = [].slice.call(root.querySelectorAll('[data-label]'));
    ticks  = [].slice.call(root.querySelectorAll('[data-tick]'));
    nums   = [].slice.call(root.querySelectorAll('[data-num]'));

    // The module dials repeat all 13 stage names three times — 78 elements whose only
    // job is to be identical. Strip them so the lit arc is the one thing that differs.
    // Identify them STRUCTURALLY: only a section holding MORE THAN ONE labelled ring is a
    // set of dials. Keying off "has no [data-marker]" also caught the hero ring, which has
    // no marker of its own, and silently hid its 13 stage names.
    [].forEach.call(document.querySelectorAll('section'), function (sec) {
      var rings = [].filter.call(sec.querySelectorAll('svg'), function (sv) {
        return sv.querySelector('[data-label]');
      });
      if (rings.length < 2) return;                  // hero and lifecycle keep their labels
      rings.forEach(function (svg) {
        [].forEach.call(svg.querySelectorAll('[data-label],[data-num]'), function (el) {
          el.style.display = 'none';
        });
        svg.setAttribute('data-dial', '');
      });
    });

    return rows.length > 0;
  }

  function apply(best) {
    if (best === active) return;
    active = best;
    rows.forEach(function (r, i) {
      var on = i === best;
      r.style.opacity = on ? '1' : '0.32';
      r.setAttribute('data-active', on ? 'true' : 'false');
    });
    if (marker) marker.style.strokeDashoffset = (0.5 * SEG - best * SEG) + 'px';
    labels.forEach(function (l) {
      var on = +l.dataset.label === best;
      l.setAttribute('fill', on ? '#C43D00' : '#3D4650');
      l.setAttribute('font-weight', on ? '600' : '500');
    });
    ticks.forEach(function (t) {
      t.setAttribute('stroke', +t.dataset.tick === best ? '#FF5500' : '#12161B');
    });
    nums.forEach(function (n) {
      n.setAttribute('fill', +n.dataset.num === best ? '#C43D00' : '#9AA4AD');
    });
  }

  function measure() {
    ticking = false;
    if (!rows || !rows.length) return;
    var mid = innerHeight * 0.45, best = 0;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].getBoundingClientRect().top < mid) best = i;
    }
    apply(best);
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(measure); setTimeout(function(){ if (ticking) measure(); }, 120); }
  }

  var tries = 0;
  (function boot() {
    if (collect()) {
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll);
      measure();
      window.__biltflowStages = { rows: rows.length, driven: true, measure: measure, reset: function(){ ticking = false; } };
      return;
    }
    if (tries++ < 40) setTimeout(boot, 150);
  })();
})();
