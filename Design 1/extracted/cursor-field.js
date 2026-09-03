/* biltflow cursor field — ~3 KB, no dependencies, canvas 2D.
   A dot grid; dots near the eased cursor swell, tilt and push outward.
   Sleeps when nothing is moving, when off-screen, and when the tab is hidden. */
(function (global) {
  function CursorField(canvas, opts) {
    opts = opts || {};
    var o = {
      step:        opts.step        || 26,        // grid pitch, px
      radius:      opts.radius      || 190,       // influence radius, px
      ease:        opts.ease        || 0.12,      // cursor lerp per frame
      push:        opts.push        || 26,        // max outward displacement, px
      dot:         opts.dot         || 1.0,       // resting dot radius
      grow:        opts.grow        || 1.3,       // extra radius at peak
      len:         opts.len         || 1.4,       // dash elongation at peak
      rest:        opts.rest        || '#C9D0D7',
      hot:         opts.hot         || '#C43D00', // mid stop
      hot2:        opts.hot2        || opts.hot || '#FF5500', // peak stop
      dash:        opts.dash !== false,           // tilt dots into dashes near the ring
      idleMs:      opts.idleMs      || 1200       // sleep after this long with no movement
    };
    var ctx = canvas.getContext('2d', { alpha: true });
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var W = 0, H = 0, cols = 0, rows = 0, ox = 0, oy = 0;
    var tx = -1e5, ty = -1e5, cx = -1e5, cy = -1e5;   // target and eased cursor
    var raf = 0, running = false, lastMove = 0, visible = true, onScreen = true;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / o.step) + 1; rows = Math.ceil(H / o.step) + 1;
      ox = (W - (cols - 1) * o.step) / 2; oy = (H - (rows - 1) * o.step) / 2;
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var R = o.radius, R2 = R * R;
      var inner = R * 0.42;                  // ring peak sits here
      for (var j = 0; j < rows; j++) {
        var py = oy + j * o.step;
        var dy = py - cy;
        if (dy * dy > R2) {                  // whole row out of range — cheap path
          ctx.fillStyle = o.rest;
          for (var i2 = 0; i2 < cols; i2++) {
            ctx.beginPath(); ctx.arc(ox + i2 * o.step, py, o.dot, 0, 6.2832); ctx.fill();
          }
          continue;
        }
        for (var i = 0; i < cols; i++) {
          var px = ox + i * o.step, dx = px - cx;
          var d2 = dx * dx + dy * dy;
          if (d2 > R2) {
            ctx.fillStyle = o.rest;
            ctx.beginPath(); ctx.arc(px, py, o.dot, 0, 6.2832); ctx.fill();
            continue;
          }
          var d = Math.sqrt(d2) || 0.0001;
          // ring band: peaks at `inner`, falls to 0 at the centre and at R
          var t = 1 - Math.abs(d - inner) / (R - inner);
          if (t < 0) t = 0;
          t = t * t * (3 - 2 * t);                       // smoothstep
          var ux = dx / d, uy = dy / d;
          var X = px + ux * o.push * t, Y = py + uy * o.push * t;
          var rad = o.dot + o.grow * t;
          ctx.fillStyle = t > 0.04 ? ramp(t) : o.rest;
          if (o.dash && t > 0.25) {                       // tilt into a dash facing the ring
            var a = Math.atan2(uy, ux);
            ctx.save(); ctx.translate(X, Y); ctx.rotate(a);
            var len = rad * (1 + t * o.len);
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(-len, -rad * 0.45, len * 2, rad * 0.9, rad * 0.45);
            else ctx.rect(-len, -rad * 0.45, len * 2, rad * 0.9);
            ctx.fill(); ctx.restore();
          } else {
            ctx.beginPath(); ctx.arc(X, Y, rad, 0, 6.2832); ctx.fill();
          }
        }
      }
    }

    // rest -> hot -> hot2, so the field has depth without leaving the palette
    function ramp(t) {
      return t < 0.6 ? mix(o.rest, o.hot, t / 0.6)
                     : mix(o.hot, o.hot2, (t - 0.6) / 0.4);
    }
    var cache = {};
    function mix(a, b, t) {
      var k = a + b + ((t * 20) | 0);
      if (cache[k]) return cache[k];
      var A = hex(a), B = hex(b);
      var c = 'rgb(' + ((A[0] + (B[0] - A[0]) * t) | 0) + ',' +
                       ((A[1] + (B[1] - A[1]) * t) | 0) + ',' +
                       ((A[2] + (B[2] - A[2]) * t) | 0) + ')';
      return (cache[k] = c);
    }
    function hex(h) {
      var n = parseInt(h.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function tick() {
      var dx = tx - cx, dy = ty - cy;
      cx += dx * o.ease; cy += dy * o.ease;
      draw();
      var settled = Math.abs(dx) < 0.35 && Math.abs(dy) < 0.35;
      var idle = performance.now() - lastMove > o.idleMs;
      if (settled && idle) { running = false; return; }   // <- sleep
      raf = requestAnimationFrame(tick);
    }
    function wake() {
      lastMove = performance.now();
      if (!running && visible && onScreen && !reduced) { running = true; raf = requestAnimationFrame(tick); }
    }

    function onMove(e) { tx = e.clientX - canvas.getBoundingClientRect().left;
                         ty = e.clientY - canvas.getBoundingClientRect().top; wake(); }
    function onLeave() { tx = -1e5; ty = -1e5; wake(); }

    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerleave', onLeave, { passive: true });
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden; if (visible) wake(); else { running = false; cancelAnimationFrame(raf); }
    });
    if (global.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        onScreen = es[0].isIntersecting;
        if (onScreen) wake(); else { running = false; cancelAnimationFrame(raf); }
      }).observe(canvas);
    }

    resize();
    this.destroy = function () {
      cancelAnimationFrame(raf); running = false;
      removeEventListener('pointermove', onMove); removeEventListener('pointerleave', onLeave);
      removeEventListener('resize', resize);
    };
    this.isRunning = function () { return running; };
    this.draw = draw;
    this.jump = function (x, y) { tx = cx = x; ty = cy = y; draw(); };
    this.setCursor = function (x, y) { tx = x; ty = y; wake(); };
    this.opts = o;
  }
  global.CursorField = CursorField;
})(window);
