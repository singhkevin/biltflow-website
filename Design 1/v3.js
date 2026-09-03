/* ============================================================
   v3 — measured normalisation pass.
   Runs once after the runtime mounts. Every step below fixes a
   defect that was measured in v2; counts are reported on
   window.__v3 so the result can be audited, not taken on trust.
   ============================================================ */
(function () {
  var SCALE = [12, 15, 17, 22, 34, 44, 76];   // v2 had 20 distinct sizes
  // The Design runtime re-renders the artboard and re-executes this script, so the
  // tally must accumulate across runs or each pass overwrites the last one's total.
  var report = window.__v3 || { runs: 0, sizesSnapped: 0, coloursFixed: 0, pointersCleared: 0,
                 innerBordersDropped: 0, copyFixed: 0, tinyRaised: 0,
                 orangeDowngraded: 0, darkBandFixed: 0 };

  // luminance of the nearest painted background behind an element
  function onDark(el) {
    var e = el;
    while (e) {
      var b = getComputedStyle(e).backgroundColor;
      if (b && b !== 'rgba(0, 0, 0, 0)') {
        var m = b.match(/\d+/g);
        if (m) {
          var L = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
          return L < 0.5;
        }
      }
      e = e.parentElement;
    }
    return false;
  }

  function snap(px) {
    var best = SCALE[0], d = Infinity;
    for (var i = 0; i < SCALE.length; i++) {
      var t = Math.abs(SCALE[i] - px);
      if (t < d) { d = t; best = SCALE[i]; }
    }
    return best;
  }

  function run(root) {
    var all = root.querySelectorAll('*');

    for (var i = 0; i < all.length; i++) {
      var el = all[i], cs = getComputedStyle(el);
      var hasText = el.children.length === 0 && el.textContent && el.textContent.trim();

      if (hasText) {
        // --- type scale: 20 sizes -> 7 ---
        var fs = parseFloat(cs.fontSize);
        var to = snap(fs);
        if (to !== fs) { el.style.setProperty('font-size', to + 'px', 'important'); report.sizesSnapped++; }
        if (fs < 12) report.tinyRaised++;

        // --- contrast: #9AA4AD is a RULE colour, never text.
        //     Direction depends on the ground: on light it must go DARKER
        //     (#59636E, 4.6:1); on the black band it must go LIGHTER
        //     (#C9D0D7). A blanket darken drops the dark band to 3.16:1. ---
        if (cs.color === 'rgb(154, 164, 173)') {
          el.style.setProperty('color', onDark(el) ? '#C9D0D7' : '#59636E', 'important');
          report.coloursFixed++;
        }
        // Safety Orange is a large-type colour only; below 24px use #C43D00.
        if (cs.color === 'rgb(255, 85, 0)' && parseFloat(cs.fontSize) < 24 && !onDark(el)) {
          el.style.setProperty('color', '#C43D00', 'important');
          report.orangeDowngraded++;
        }
        // #59636E is unreadable on the black band — lift it.
        if (cs.color === 'rgb(89, 99, 110)' && onDark(el)) {
          el.style.setProperty('color', '#C9D0D7', 'important');
          report.darkBandFixed++;
        }
      }

      // --- affordance: 150 elements claimed cursor:pointer, 48 were controls ---
      if (cs.cursor === 'pointer') {
        var real = el.closest('a[href],button,[role="button"],[tabindex],label,summary');
        if (!real) { el.style.setProperty('cursor', 'default', 'important'); report.pointersCleared++; }
      }

      // --- density: drop the inner frame when a box is framed inside a framed box ---
      if (parseFloat(cs.borderTopWidth) > 0) {
        var p = el.parentElement;
        if (p && parseFloat(getComputedStyle(p).borderTopWidth) > 0 &&
            p.children.length === 1 && el.querySelector('[data-bf]') === null) {
          el.setAttribute('data-v3-inner', '');
          report.innerBordersDropped++;
        }
      }
    }

    // --- honesty: the page said "eleven systems" in one section and
    //     "Twelve systems" in another. The integrations strip lists twelve. ---
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = walker.nextNode())) {
      if (/\beleven systems\b/i.test(n.nodeValue)) {
        n.nodeValue = n.nodeValue.replace(/\beleven systems\b/gi, 'twelve systems');
        report.copyFixed++;
      }
    }
  }

  var tries = 0;
  (function boot() {
    var root = document.getElementById('dc-root');
    if (root && root.querySelectorAll('section').length > 3) {
      run(root);
      report.runs++;
      window.__v3 = report;
      return;
    }
    if (tries++ < 60) setTimeout(boot, 150);
  })();
})();
