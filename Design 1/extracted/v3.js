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
                 orangeDowngraded: 0, darkBandFixed: 0,
                 ringMark: 0, videoSlot: 0,
                 guideRemoved: 0, scatterRemoved: 0, marksRemoved: 0 };

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
      // SVG <text> is diagram annotation, not copy: it is sized and positioned to fit
      // the geometry. Snapping it to the body scale overflowed and collided labels.
      var inSvg = el.ownerSVGElement || el.tagName === 'text' || el.closest('svg');
      var hasText = el.children.length === 0 && el.textContent && el.textContent.trim() && !inSvg;

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


  /* ---------- requested changes ---------- */
  function enhance(root) {
    // 1. Biltflow mark at the centre of EVERY full lifecycle ring, replacing the
    //    crosshair. The centre is derived from each ring's own viewBox — the hero
    //    ring is 640x640 (centre 320,320) and the lifecycle ring 560x560
    //    (centre 280,280). Hardcoding 280,280 silently skipped the hero one.
    [].slice.call(root.querySelectorAll('svg')).forEach(function (ring) {
      if (ring.querySelectorAll('[data-label]').length !== 13) return;   // not a full ring
      if (ring.hasAttribute('data-dial')) return;                        // not a module dial
      if (ring.querySelector('[data-bf-mark]')) return;                  // already done

      var vb = (ring.getAttribute('viewBox') || '').split(/\s+/).map(Number);
      if (vb.length !== 4) return;
      var cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2;

      // radius, so the mark scales with the ring rather than sitting at a fixed size
      var r = 0;
      [].slice.call(ring.querySelectorAll('circle')).forEach(function (c) {
        r = Math.max(r, parseFloat(c.getAttribute('r')) || 0);
      });
      if (!r) r = vb[2] * 0.35;

      // the crosshair is two short lines through the centre
      [].slice.call(ring.querySelectorAll('line')).forEach(function (l) {
        var mx = (parseFloat(l.getAttribute('x1')) + parseFloat(l.getAttribute('x2'))) / 2;
        var my = (parseFloat(l.getAttribute('y1')) + parseFloat(l.getAttribute('y2'))) / 2;
        if (Math.hypot(mx - cx, my - cy) < 20) l.remove();
      });

      var W = r * 0.66, H = W * (30 / 114);          // logo is 114x30
      var img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      img.setAttribute('data-bf-mark', '');
      img.setAttribute('href', './assets/biltflow-logo-black.svg');
      img.setAttribute('x', cx - W / 2); img.setAttribute('y', cy - H / 2);
      img.setAttribute('width', W); img.setAttribute('height', H);
      img.setAttribute('opacity', '.9');
      ring.appendChild(img);
      report.ringMark++;
    });

    // 2. Video slot in the noise band — the film's NOISE beat plays here.
    var noise = null;
    [].slice.call(root.querySelectorAll('section')).forEach(function (sec) {
      if (/More software\. More data/.test(sec.textContent)) noise = sec;
    });
    if (noise && !noise.querySelector('[data-bf-video]')) {
      var kids = [].slice.call(noise.children);
      var stage = kids.sort(function (a, b) { return b.offsetHeight - a.offsetHeight; })[0];
      if (stage && stage.offsetHeight > 300) {
        var slot = document.createElement('div');
        slot.setAttribute('data-bf-video', '');
        slot.style.cssText = 'max-width:900px;margin:0 auto;';
        slot.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:baseline;' +
            'font:500 12px/1 \'IBM Plex Mono\',ui-monospace,monospace;letter-spacing:.16em;' +
            'text-transform:uppercase;color:#9AA4AD;margin-bottom:14px">' +
            '<span>Film &middot; noise sequence</span><span>16:9</span></div>' +
          '<div style="position:relative;aspect-ratio:16/9;border:1px solid #3D4650;background:#0C0E11">' +
            '<span style="position:absolute;top:-1px;left:-1px;width:14px;height:14px;' +
              'border-top:1px solid #FF5500;border-left:1px solid #FF5500"></span>' +
            '<span style="position:absolute;bottom:-1px;right:-1px;width:14px;height:14px;' +
              'border-bottom:1px solid #FF5500;border-right:1px solid #FF5500"></span>' +
            '<div style="position:absolute;inset:0;display:flex;flex-direction:column;' +
              'align-items:center;justify-content:center;gap:18px">' +
              '<svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">' +
                '<circle cx="23" cy="23" r="22" stroke="#59636E"/>' +
                '<path d="M19 15.5 L31 23 L19 30.5 Z" stroke="#F9FAFB" stroke-width="1.2" ' +
                  'stroke-linejoin="round" fill="none"/></svg>' +
              '<span style="font:500 12px/1 \'IBM Plex Mono\',ui-monospace,monospace;' +
                'letter-spacing:.16em;text-transform:uppercase;color:#9AA4AD">' +
                '[ Video &mdash; to be placed ]</span>' +
            '</div>' +
          '</div>';
        stage.replaceWith(slot);
        report.videoSlot = 1;
      }
    }

    // 3. Remove the cursor-tracking guide overlay: the full-page crosshair, the
    //    "X 0000 · Y 0000 · GRID D/10" readout and the ruler strip. Same class of
    //    thing as the cursor field — drawing-set chrome that tracks the pointer
    //    and competes with the content underneath.
    [].slice.call(root.querySelectorAll('div,span')).forEach(function (el) {
      var st = el.getAttribute('style') || '';
      if (/mix-blend-mode\s*:\s*difference/.test(st) && /position\s*:\s*fixed/.test(st)) {
        el.remove(); report.guideRemoved++;
      }
    });
    // the coordinate readout itself, wherever it ended up
    [].slice.call(root.querySelectorAll('*')).forEach(function (el) {
      if (el.children.length) return;
      var t = (el.textContent || '').trim();
      if (/^X \d+\s*·\s*Y \d+/.test(t) || /^GRID [A-Z]\/\d+$/.test(t)) {
        el.remove(); report.guideRemoved++;
      }
    });

    // 4. The noise band was showing the video slot AND the original card scatter.
    //    They argue the same beat twice; the video is what plays there.
    if (noise) {
      [].slice.call(noise.children).forEach(function (c) {
        if (c.hasAttribute('data-bf-video')) return;
        if (/Aconex/.test(c.textContent) && /Procore/.test(c.textContent) && c.offsetHeight > 400) {
          c.remove(); report.scatterRemoved++;
        }
      });
    }

    // 5. The closing lockup repeated the Biltflow mark 13 times (one per lifecycle
    //    stage) as a decorative strip. One reads as a sign-off; thirteen reads as
    //    a loading bar. Keep the first, drop the rest, and size it to be deliberate.
    var strip = null;
    [].slice.call(root.querySelectorAll('img')).forEach(function (im) {
      if (!/biltflow-mark/.test(im.getAttribute('src') || '')) return;
      var p = im.parentElement;
      if (p && p.children.length > 3) strip = p;
    });
    if (strip) {
      var keep = strip.firstElementChild;
      while (strip.children.length > 1) strip.lastElementChild.remove();
      strip.style.justifyContent = 'center';
      strip.style.opacity = '0.5';
      if (keep) { keep.style.height = '26px'; keep.style.width = 'auto'; }
      report.marksRemoved = 12;
    }
  }

  var tries = 0;
  (function boot() {
    var root = document.getElementById('dc-root');
    if (root && root.querySelectorAll('section').length > 3) {
      run(root);
      enhance(root);
      report.runs++;
      window.__v3 = report;
      return;
    }
    if (tries++ < 60) setTimeout(boot, 150);
  })();
})();
