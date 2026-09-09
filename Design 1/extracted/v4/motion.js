/* v4 motion layer — Lenis smooth scroll + GSAP ScrollTrigger, driving the data-* hooks
   already authored into this page's markup (join-section, hscroll-section x3, parallax x3,
   reveal x2, trace timeline). Nothing here invents new structure; it powers what the static
   HTML already scaffolded but never had a script to run it. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* support.js hydrates the static pre-render asynchronously and replaces the whole <x-dc>
     subtree once it's done (confirmed: <x-dc> itself is gone afterward). Querying for our
     data-* hooks before that lands finds nothing, silently, since every block below is
     wrapped in an "if the element exists" guard. Poll for a hydration marker instead of
     trusting DOMContentLoaded/readyState — same fix pattern used elsewhere in this codebase
     (sections.js, v3.js) for the identical race. */
  function marker() { return document.querySelector('[data-nav="true"]'); }

  /* Presence isn't enough: support.js swaps the whole subtree out again ~150ms after the
     markup first appears. Anything wired to the first copy is quietly dropped — GSAP culls
     triggers whose elements have left the document during refresh(), without calling kill(),
     which is why nothing shows up in a kill trace. Wait for the SAME node to survive several
     consecutive checks before wiring anything to it. */
  function whenSettled(fn, stableNeeded, triesLeft, lastNode, stableCount) {
    if (stableNeeded === undefined) stableNeeded = 4;      // ~480ms unchanged
    if (triesLeft === undefined) triesLeft = 80;           // ~10s ceiling
    if (stableCount === undefined) stableCount = 0;
    var node = marker();
    if (node && node === lastNode) stableCount++; else stableCount = 0;
    if (node && stableCount >= stableNeeded) { fn(); return; }
    if (triesLeft <= 0) { if (node) fn(); return; }
    setTimeout(function () {
      whenSettled(fn, stableNeeded, triesLeft - 1, node, stableCount);
    }, 120);
  }

  /* Even settled, a late reflow can cull everything. Re-arm if the registry empties out. */
  function armWatchdog(setup) {
    var rearms = 0;
    setInterval(function () {
      if (rearms >= 3) return;
      if (typeof ScrollTrigger === 'undefined') return;
      if (ScrollTrigger.getAll().length === 0 && marker()) {
        rearms++;
        setup();
      }
    }, 1500);
  }

  function whenHydrated(fn) {
    whenSettled(function () {
      fn();
      armWatchdog(fn);
    });
  }

  whenHydrated(function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    try {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.getAll().forEach(function (t) { t.kill(); });

    /* ---------- Lenis smooth scroll ---------- */
    var lenis = null;
    if (!reduce && typeof Lenis !== 'undefined') {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    /* ---------- Nav: docked to the viewport floor over the hero -> rises to the top ----------
       The hero is a 16/9 block, so it is usually SHORTER than the viewport. Anchoring the bar
       to the hero's own bottom edge left it floating mid-screen. Both states are position:fixed
       (see .bf-nav in the stylesheet); this only decides when to swap the transform. */
    var nav = document.querySelector('[data-nav="true"]');
    if (nav) {
      var hero = document.getElementById('top');
      var vh = 0, riseAt = 0;
      var recalc = function () {
        vh = window.innerHeight;
        /* rise once the hero's bottom edge has climbed past 65% of the viewport */
        riseAt = Math.max(120, (hero ? hero.offsetHeight : 200) - vh * 0.65);
      };
      recalc();
      var applyNav = function () {
        if (window.innerHeight !== vh) recalc();
        /* window.scrollY, not lenis.scroll — Lenis drives native scroll, and its own
           value reads 0 until its first frame, which left the bar docked if the reader
           scrolled before hydration settled. */
        nav.classList.toggle('is-stuck', window.scrollY > riseAt);
      };
      /* end:'max' matters — a trigger-less ScrollTrigger with only start:0 has a
         zero-length range, so onUpdate never fires at all. */
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: applyNav, onRefresh: applyNav });
      applyNav();
    }
        /* ---------- data-reveal: fade-up once, on entry ---------- */
    document.querySelectorAll('[data-reveal="true"]').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () { el.classList.add('is-in'); }
      });
    });

        /* ---------- data-join-section: two half-clipped copies of one photo
       converge into the whole image as a dark radial scrim + text cross-fade in.
       NOTE: the old [data-join-scrim] (white wash) is force-hidden via display:none in the
       HTML — the dead-but-hydrated component's own paintJoin() still writes to its opacity
       on every scroll tick (a second, independent scroll handler this page ships with), so
       don't reuse that element for anything visible. [data-join-dark-scrim] is a fresh node
       that script never touches. ---------- */
    var joinSection = document.querySelector('[data-join-section]');
    if (joinSection) {
      var left = joinSection.querySelector('[data-join-layer="left"]');
      var right = joinSection.querySelector('[data-join-layer="right"]');
        var text = joinSection.querySelector('[data-join-text]');
      /* Timing matches the page's own original (never-wired) design exactly: the two
         halves finish joining into one continuous photo at the 70% mark, and only then
         does the scrim/text snap in, quickly, over the following 8% — so nothing dark or
         textual ever appears while the photo is still split, and the overlay only ever
         sits on top of what is by then a single, fully-joined image, not a gap. The
         resolved state then holds for the remaining 22% of scroll before the section
         un-pins, giving the reader time to actually read it.

         GSAP timeline positions are literal, not automatically scaled to scroll progress —
         a scrubbed timeline maps scroll 0..1 to timeline-time 0..totalDuration, so every
         tween below needs an EXPLICIT duration and the timeline padded to exactly 1 total,
         or these fractions silently mean something else. */
      var tl = gsap.timeline({
        scrollTrigger: { trigger: joinSection, start: 'top top', end: 'bottom bottom', scrub: reduce ? false : 0.4 }
      });
      if (left) tl.to(left, { clipPath: 'inset(0% 50% 0% 0%)', y: 0, ease: 'none', duration: 0.70 }, 0);
      if (right) tl.to(right, { clipPath: 'inset(0% 0% 0% 50%)', y: 0, ease: 'none', duration: 0.70 }, 0);
      if (text) tl.to(text, { opacity: 1, y: 0, ease: 'none', duration: 0.08 }, 0.70);
      tl.to({}, { duration: 0.22 }, 0.78); // hold the resolved state through the remaining scroll
    }

        /* ---------- data-parallax: gentle vertical drift on oversized (112%) background images ---------- */
    if (!reduce) {
      document.querySelectorAll('[data-parallax="true"]').forEach(function (img) {
        var section = img.closest('section') || img.parentElement;
        gsap.fromTo(img, { yPercent: -6 }, {
          yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    }

        /* ---------- data-hscroll-section (x3): pin, drag the track horizontally with
       vertical scroll, drive the progress bar and (where present) the counter ---------- */
    document.querySelectorAll('[data-hscroll-section="true"]').forEach(function (sec) {
      var track = sec.querySelector('[data-hscroll-track="true"]');
      if (!track) return;
      var progress = sec.querySelector('[data-hscroll-progress="true"]');
      var counter = sec.querySelector('[data-hscroll-counter="true"]');
      var cards = Array.prototype.slice.call(track.children);
      var total = cards.length;

      function distance() {
        return Math.max(0, track.scrollWidth - window.innerWidth);
      }

      var st = ScrollTrigger.create({
        trigger: sec, start: 'top top', end: 'bottom bottom',
        scrub: reduce ? false : 0.35, pin: false, // inner [data-hscroll] is position:sticky already
        onUpdate: function (self) {
          var p = self.progress;
          if (!reduce) track.style.transform = 'translateX(-' + (p * distance()) + 'px)';
          if (progress) progress.style.width = (p * 100) + '%';
          if (counter && total) {
            var idx = Math.min(total, Math.max(1, Math.round(p * (total - 1)) + 1));
            counter.textContent = (idx < 10 ? '0' : '') + idx + ' / ' + (total < 10 ? '0' : '') + total;
          }
        }
      });

      // scrollWidth isn't known until images have laid out — refresh once real sizes exist.
      Array.prototype.slice.call(track.querySelectorAll('img')).forEach(function (im) {
        if (im.complete) return;
        im.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });
      });
    });

        /* ---------- data-classlist-section: Coronation "Practice"-style vertical list.
       Pins, walks an active index through the list as you scroll, crossfades the matching
       full-bleed background, and parallaxes whichever background is showing. Replaces the
       horizontal card carousel that used to live here. ---------- */
    document.querySelectorAll('[data-classlist-section="true"]').forEach(function (sec) {
      var sticky = sec.querySelector('[data-classlist-sticky="true"]');
      var bgs = Array.prototype.slice.call(sec.querySelectorAll('[data-classlist-bg]'));
      var items = Array.prototype.slice.call(sec.querySelectorAll('[data-classlist-item]'));
      var copies = Array.prototype.slice.call(sec.querySelectorAll('[data-classlist-copy]'));
      var counter = sec.querySelector('[data-classlist-counter="true"]');
      var bar = sec.querySelector('[data-classlist-progress="true"]');
      var n = items.length;
      if (!n) return;
      var current = -1;

      function setActive(i) {
        if (i === current) return;
        current = i;
        items.forEach(function (el, k) { el.style.opacity = (k === i) ? '1' : '0.45'; });
        copies.forEach(function (el, k) { el.style.opacity = (k === i) ? '1' : '0'; });
        bgs.forEach(function (el, k) { el.style.opacity = (k === i) ? '1' : '0'; });
        if (counter) counter.textContent = '0' + (i + 1) + ' / 0' + n;
        if (bar) bar.style.width = (((i + 1) / n) * 100) + '%';
      }
      setActive(0);

      ScrollTrigger.create({
        trigger: sec, start: 'top top', end: 'bottom bottom',
        // [data-classlist-sticky] is position:sticky already — no GSAP pin, no spacer
        scrub: reduce ? false : 0.3,
        onUpdate: function (self) {
          var idx = Math.min(n - 1, Math.floor(self.progress * n));
          setActive(idx);
          if (!reduce) {
            // parallax the visible background across the section's own scroll span
            var drift = (self.progress - 0.5) * 7; // -3.5% .. +3.5%
            bgs.forEach(function (el) { el.style.transform = 'translateY(' + drift + '%)'; });
          }
        }
      });

      // clicking a list item jumps the page to that item's share of the section
      items.forEach(function (el, i) {
        el.addEventListener('click', function (ev) {
          ev.preventDefault();
          var top = sec.offsetTop + (sec.offsetHeight - window.innerHeight) * ((i + 0.5) / n);
          if (lenis) lenis.scrollTo(top, { duration: 0.9 });
          else window.scrollTo({ top: top, behavior: 'smooth' });
        });
      });
    });

        /* ---------- data-trace-section: spine draws in, each step lights up as it's reached ---------- */
    var traceTimeline = document.querySelector('[data-trace-timeline="true"]');
    var spine = document.querySelector('[data-trace-spine="true"]');
    if (traceTimeline && spine) {
      ScrollTrigger.create({
        trigger: traceTimeline, start: 'top 75%', end: 'bottom 60%',
        scrub: reduce ? false : 0.35,
        onUpdate: function (self) { spine.style.height = (self.progress * 100) + '%'; }
      });
    }
    var traceColors = ['#FF3B30', '#FF3B30', '#8A6EF0', '#6B72FF', '#6B72FF', '#3E7BFA', '#19C26B', '#19C26B'];
    document.querySelectorAll('[data-trace-step]').forEach(function (step) {
      var idx = parseInt(step.getAttribute('data-trace-step'), 10) || 0;
      var node = document.querySelector('[data-trace-node="' + idx + '"]');
      ScrollTrigger.create({
        trigger: step, start: 'top 78%', end: 'bottom 55%',
        onEnter: function () { step.classList.add('is-in'); if (node) { node.style.background = traceColors[idx] || '#6B72FF'; node.style.borderColor = traceColors[idx] || '#6B72FF'; } },
        onLeaveBack: function () { step.classList.remove('is-in'); if (node) { node.style.background = '#F7F9FA'; node.style.borderColor = '#DFE4E9'; } }
      });
    });

    ScrollTrigger.refresh();
    window.__motionOk = true;
    window.__tcLog = [{t: 0, n: ScrollTrigger.getAll().length}];
    [50, 200, 500, 1000, 2000, 3000].forEach(function (ms) {
      setTimeout(function () { window.__tcLog.push({t: ms, n: ScrollTrigger.getAll().length}); }, ms);
    });
    } catch (e) {
      window.__motionErr = e.message + ' @ ' + (e.stack || '').split('\n').slice(0,3).join(' | ');
    }
  });
})();
