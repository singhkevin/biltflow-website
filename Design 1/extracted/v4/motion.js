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
  function whenHydrated(fn, triesLeft) {
    if (triesLeft === undefined) triesLeft = 60; // ~6s ceiling
    if (document.querySelector('[data-nav="true"]')) { fn(); return; }
    if (triesLeft <= 0) { fn(); return; } // give up gracefully, still try once
    setTimeout(function () { whenHydrated(fn, triesLeft - 1); }, 100);
  }

  whenHydrated(function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* ---------- Lenis smooth scroll ---------- */
    var lenis = null;
    if (!reduce && typeof Lenis !== 'undefined') {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    /* ---------- Nav: transparent-over-hero -> solid on scroll ---------- */
    var nav = document.querySelector('[data-nav="true"]');
    if (nav) {
      var hero = document.getElementById('top');
      var stickAt = hero ? Math.max(hero.offsetHeight - 76, 40) : 200;
      ScrollTrigger.create({
        start: 0,
        onUpdate: function () {
          var stuck = (lenis ? lenis.scroll : window.scrollY) > stickAt;
          nav.classList.toggle('is-stuck', stuck);
        }
      });
    }
        /* ---------- data-reveal: fade-up once, on entry ---------- */
    document.querySelectorAll('[data-reveal="true"]').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () { el.classList.add('is-in'); }
      });
    });

        /* ---------- data-join-section: two half-clipped copies of one photo
       converge into the whole image as the scrim/text cross-fade in ---------- */
    var joinSection = document.querySelector('[data-join-section]');
    if (joinSection) {
      var left = joinSection.querySelector('[data-join-layer="left"]');
      var right = joinSection.querySelector('[data-join-layer="right"]');
      var scrim = joinSection.querySelector('[data-join-scrim]');
      var text = joinSection.querySelector('[data-join-text]');
      var tl = gsap.timeline({
        scrollTrigger: { trigger: joinSection, start: 'top top', end: 'bottom bottom', scrub: reduce ? false : 0.4 }
      });
      if (left) tl.to(left, { clipPath: 'inset(0% 50% 0% 0%)', y: 0, ease: 'none' }, 0);
      if (right) tl.to(right, { clipPath: 'inset(0% 0% 0% 50%)', y: 0, ease: 'none' }, 0);
      if (text) tl.to(text, { opacity: 1, y: 0, ease: 'none' }, 0.22);
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
        scrub: reduce ? false : 0.35, pin: !reduce,
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
  });
})();
