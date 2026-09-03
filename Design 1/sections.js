/* ===== integrations ===== */
(function(){

window.BF_LOGO = {
  aconex: "__WORDMARK__aconex",
  procore: "__WORDMARK__procore",
  bluebeam: "__WORDMARK__bluebeam",
  procurepro: "__WORDMARK__procurepro",
  payapps: "__WORDMARK__payapps",
  buildsoft: "__WORDMARK__buildsoft",
  jobpac: "__WORDMARK__jobpac",
  costx: "__WORDMARK__costx",
  excel: "__WORDMARK__excel",
  outlook: "__WORDMARK__outlook",
  teams: "__WORDMARK__teams",
  whatsapp: "__WORDMARK__whatsapp"
};

(function(){
  /* ---------- data table: one row per system ---------- */
  /* h = render height for the logo file, tuned so 1:1 icons and 8:1 wordmarks
     sit on one optical line. icon:true = square mark, so the name is set beside it. */
  var V = [
    {s:'aconex',    n:'Aconex',     f:'Document control',   h:13, name:1,
     r:['RFIs and responses','Transmittals','Drawing revisions','Project correspondence']},
    {s:'procore',   n:'Procore',    f:'Project management', h:14,
     r:['Site diaries','Inspections and checklists','Defect lists','Task assignments']},
    {s:'bluebeam',  n:'Bluebeam',   f:'Drawing markup',     h:15,
     r:['Markups and revision clouds','Issued sets','Drawing comparisons','Sign-offs']},
    {s:'procurepro',n:'ProcurePro', f:'Procurement',        h:20,
     r:['Trade packages','Tender lists','Awards','Letters of intent']},
    {s:'payapps',   n:'Payapps',    f:'Progress claims',    h:13,
     r:['Progress claims','Assessments','Approvals','Retention balances']},
    {s:'buildsoft', n:'Buildsoft',  f:'Estimating',         h:22,
     r:['Estimates','Rate libraries','Bills of quantities','Trade breakdowns']},

    {s:'jobpac',    n:'Jobpac',     f:'ERP / finance',      h:13, name:1,
     r:['Cost codes','Commitments and orders','Cost forecasts','Subcontractor payments']},
    {s:'costx',     n:'CostX',      f:'Take-off',           h:18, name:1,
     r:['Take-off quantities','Measured drawings','Rate build-ups','Revision comparisons']},
    {s:'excel',     n:'Excel',      f:'Spreadsheets',       h:22, name:1,
     r:['Cost reports','Cashflow trackers','Ad-hoc registers','The one file nobody replaces']},
    {s:'outlook',   n:'Outlook',    f:'Email',              h:22, name:1,
     r:['Approvals buried in threads','Variation instructions','Attachments','Decision trails']},
    {s:'teams',     n:'Teams',      f:'Messaging',          h:22, name:1,
     r:['Decisions made in chat','Shared files','Meeting notes','Channel history']},
    {s:'whatsapp',  n:'WhatsApp',   f:'Site messaging',     h:20,
     r:['Site photos','Delay notices','Verbal instructions','After-hours calls']}
  ];

  var wire   = document.getElementById('wire'),
      lives  = document.querySelectorAll('#lives .live'),
      routes = document.querySelectorAll('#routes .route'),
      recIdx = document.getElementById('recIdx'),
      recNm  = document.getElementById('recName'),
      recCap = document.getElementById('recCap'),
      recLs  = document.getElementById('recList'),
      arrL   = document.getElementById('arrL'),
      arrR   = document.getElementById('arrR');

  /* querySelectorAll returns a static snapshot at THIS exact line. If the artboard
     runtime hadn't finished inserting the #routes/#lives <path> children yet at this
     instant (this script is a deferred <script>, and nothing here waits for that),
     `routes`/`lives` are permanently empty NodeLists -- measure() then silently
     iterates zero items and --l never gets set, and later code indexing into them
     (lives[i]) would throw. A synchronous retry can't help here (nothing yields to
     the event loop, so the DOM can't have changed between iterations); genuinely
     wait via setTimeout and re-run measure() on a fresh query if the first read was
     empty, re-binding these SAME closure variables so set()/clear() see the update. */
  function resyncIfEmpty(triesLeft){
    if(routes.length && lives.length) return;
    routes = document.querySelectorAll('#routes .route');
    lives  = document.querySelectorAll('#lives .live');
    if(routes.length && lives.length){ measure(routes, true); measure(lives, false); return; }
    if(triesLeft > 0) setTimeout(function(){ resyncIfEmpty(triesLeft - 1); }, 150);
  }

  var Y = [39,131,223,315,407,499];
  var REST = 'Twelve systems.<br>One record.';
  var nodes = [];

  /* ---------- build the nodes ---------- */
  V.forEach(function(v,i){
    var right = i > 5, row = i % 6;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'node ' + (right ? 'R' : 'L');
    b.style.top  = (Y[row] - 39) + 'px';
    b.style.left = right ? '940px' : '0px';
    b.setAttribute('aria-describedby','rec');

    var port = document.createElement('span'); port.className = 'port';

    var lock = document.createElement('span'); lock.className = 'lock';
    var word = document.createElement('span'); word.className = 'word'; word.textContent = v.n;
    lock.appendChild(word);

    var fn = document.createElement('span'); fn.className = 'fn';
    fn.innerHTML = '<b>' + (i < 9 ? '0' : '') + (i + 1) + '</b>' + v.f;

    b.appendChild(port); b.appendChild(lock); b.appendChild(fn);
    wire.appendChild(b);

    /* Logo mark. Sources are the real vendor files from ../logos/, inlined at the
       foot of this page so the demo opens standalone from anywhere. To load them
       from disk instead, replace the next line with:
           var src = '../logos/' + v.s + (v.s === 'buildsoft' || v.s === 'jobpac' ||
                     v.s === 'payapps' ? '.png' : '.svg');
       If a source is missing the Archivo wordmark simply stays. */
    var src = (window.BF_LOGO || {})[v.s];
    if(src){
      var img = new Image();
      img.alt = ''; img.setAttribute('aria-hidden','true');
      img.style.cssText = 'height:' + v.h + 'px;width:auto;display:block';
      img.onload = function(){
        lock.insertBefore(img, lock.firstChild);
        if(!v.name) word.style.display = 'none';   /* file is a full wordmark: drop the text */
      };
      img.src = src;
    }

    nodes.push({el:b, i:i, right:right});
  });

  /* ---------- path lengths for the draw ---------- */
  // Path length WITHOUT getTotalLength(). Every route/live path here is strictly
  // axis-aligned ("M x,y H x2 V y2 H x3" -- horizontal/vertical segments only), so
  // its length is exact, deterministic arithmetic on the d string -- no dependency
  // on the SVG having completed a layout pass. getTotalLength() is a DOM geometry
  // query that can throw (InvalidStateError) if called before first layout; since
  // measure() runs synchronously at the very top of this IIFE, before anything else
  // in it, an uncaught throw here silently aborted EVERYTHING after it in source
  // order -- including the nodes.forEach hover/focus/click binding loop and the
  // IntersectionObserver setup, both of which come later. Confirmed: on this build,
  // every route AND every live path had --l unset, and dispatching mouseenter/
  // focus/click on a card never moved #recName off its rest state -- exactly the
  // signature of measure() throwing on its first call and never returning.
  function pathLength(d){
    var nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
    var x = nums[0], y = nums[1], total = 0, i = 2;
    var cmds = d.match(/[HV]/g) || [];
    for(var c=0;c<cmds.length;c++){
      var v = nums[i++];
      if(cmds[c] === 'H'){ total += Math.abs(v - x); x = v; }
      else               { total += Math.abs(v - y); y = v; }
    }
    return total;
  }
  function measure(list, stagger){
    for(var i=0;i<list.length;i++){
      var d = list[i].getAttribute('d');
      var L;
      try{ L = Math.ceil(pathLength(d)); }
      catch(e){
        try{ L = Math.ceil(list[i].getTotalLength()); }   // fallback for a non-H/V path
        catch(e2){ L = 400; }                              // last resort: never let this throw
      }
      list[i].style.setProperty('--l', L);
      if(stagger) list[i].style.setProperty('--d', (i % 6) * 55 + (i > 5 ? 28 : 0) + 'ms');
    }
  }
  measure(routes, true);
  measure(lives, false);
  resyncIfEmpty(20);

  /* ---------- state ---------- */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var visible = false, active = -1;

  function liveAt(i){ return document.querySelectorAll('#lives .live')[i]; }
  function clear(){
    if(active < 0) return;
    var l = liveAt(active); if(l) l.classList.remove('on');
    nodes[active].el.classList.remove('act');
    arrL.classList.remove('on'); arrR.classList.remove('on');
    active = -1;
    recIdx.textContent = '—';
    recNm.innerHTML = REST;
    recCap.textContent = 'What lives there today';
    recLs.innerHTML = '<li class="hint">Hover a system to trace what it already holds — and see it land in one record.</li>';
  }

  function set(i){
    if(i === active) return;
    if(!visible){
      /* visible is only ever flipped true by the IntersectionObserver (or its
         fallback timer). A live user interaction is itself proof the diagram is
         on screen right now, so check directly rather than trust a flag that, in
         some embedding contexts, the observer never gets a chance to set. */
      var r = wire.getBoundingClientRect();
      if(r.top < innerHeight && r.bottom > 0){ visible = true; wire.classList.add('in'); }
      else return;
    }
    if(active >= 0){
      var prev = liveAt(active); if(prev) prev.classList.remove('on');
      nodes[active].el.classList.remove('act');
    }
    active = i;
    var v = V[i];
    var l = liveAt(i); if(l) l.classList.add('on');
    nodes[i].el.classList.add('act');
    arrL.classList.toggle('on', !nodes[i].right);
    arrR.classList.toggle('on', nodes[i].right);
    recIdx.textContent = (i < 9 ? '0' : '') + (i + 1) + '/12';
    recNm.textContent = v.n;
    recCap.textContent = 'What lives in ' + v.n + ' today';
    var h = '';
    for(var j=0;j<v.r.length;j++) h += '<li>' + v.r[j] + '</li>';
    recLs.innerHTML = h;
  }

  nodes.forEach(function(n){
    n.el.addEventListener('mouseenter', function(){ set(n.i); });
    n.el.addEventListener('focus',      function(){ set(n.i); });
    n.el.addEventListener('click',      function(){ set(n.i); });
  });
  wire.addEventListener('mouseleave', clear);
  wire.addEventListener('focusout', function(e){
    if(!wire.contains(e.relatedTarget)) clear();
  });

  /* ---------- off-screen: draw once on entry, rest when gone ---------- */
  if(reduce){
    wire.classList.add('in');
    visible = true;
    for(var q=0;q<routes.length;q++) routes[q].style.transition = 'none';
  } else if('IntersectionObserver' in window){
    /* threshold 0: the hover gate must open as soon as any part of the diagram is
       on screen, or a short viewport leaves the section inert. Same callback draws
       the routes once, then they rest for good. */
    var seenAny = false;
    new IntersectionObserver(function(es){
      es.forEach(function(e){
        seenAny = true;
        visible = e.isIntersecting;
        if(visible) wire.classList.add('in'); else clear();
      });
    }, {threshold:0}).observe(wire);
    /* Defensive fallback: if the observer never fires at all -- some embedding
       contexts don't reliably deliver IntersectionObserver callbacks -- fall back
       to a manual bounding-rect check after a beat, so the diagram is never
       permanently inert. Costs nothing when the observer works normally. */
    setTimeout(function(){
      if(seenAny) return;
      var r = wire.getBoundingClientRect();
      if(r.top < innerHeight && r.bottom > 0){
        visible = true;
        wire.classList.add('in');
      }
    }, 1200);
  } else {
    wire.classList.add('in');
    visible = true;
  }
})();

})();

/* ===== eve-provenance ===== */
(function(){

(function(){
  /* ---- content ---- */
  var DATA = [{"n": "ARCHITECTURAL DRAWING", "d": "The geometry every other document is measured against.", "r": [{"t": 1, "n": "STRUCTURAL DRAWING", "l": "COORDINATED"}, {"t": 2, "n": "COST PLAN", "l": "TAKEN OFF"}, {"t": 8, "n": "COMPLIANCE", "l": "CERTIFIED"}]}, {"n": "STRUCTURAL DRAWING", "d": "Frame, slab and core — the basis of quantity, and of what actually gets built.", "r": [{"t": 0, "n": "ARCHITECTURAL DRAWING", "l": "COORDINATED"}, {"t": 3, "n": "BILL OF QUANTITIES", "l": "QUANTIFIED"}, {"t": 7, "n": "SITE PROGRESS", "l": "BUILT TO"}]}, {"n": "COST PLAN", "d": "The budget, held against the drawing it was measured from.", "r": [{"t": 0, "n": "ARCHITECTURAL DRAWING", "l": "TAKEN OFF"}, {"t": 3, "n": "BILL OF QUANTITIES", "l": "PRICED INTO"}, {"t": 4, "n": "CONTRACT", "l": "SETS THE SUM"}]}, {"n": "BILL OF QUANTITIES", "d": "Every rate carries the cost-plan line it came from, and the package it was let under.", "r": [{"t": 2, "n": "COST PLAN", "l": "PRICED FROM"}, {"t": 4, "n": "CONTRACT", "l": "SCHEDULED"}, {"t": 6, "n": "PROCUREMENT PACKAGE", "l": "SPLIT INTO"}]}, {"n": "CONTRACT", "d": "The sum, the dates and the scope — bound back to the documents that set them.", "r": [{"t": 3, "n": "BILL OF QUANTITIES", "l": "PRICED BY"}, {"t": 5, "n": "PROGRAMME", "l": "DATED BY"}, {"t": 6, "n": "PROCUREMENT PACKAGE", "l": "AWARDS"}]}, {"n": "PROGRAMME", "d": "The sequence. It tells procurement when, and it tells site what it is behind.", "r": [{"t": 4, "n": "CONTRACT", "l": "DATES"}, {"t": 6, "n": "PROCUREMENT PACKAGE", "l": "SEQUENCES"}, {"t": 7, "n": "SITE PROGRESS", "l": "MEASURED BY"}]}, {"n": "PROCUREMENT PACKAGE", "d": "A slice of the BOQ, let under a contract, placed on the programme.", "r": [{"t": 3, "n": "BILL OF QUANTITIES", "l": "SCOPED FROM"}, {"t": 4, "n": "CONTRACT", "l": "AWARDED ON"}, {"t": 5, "n": "PROGRAMME", "l": "SEQUENCED"}]}, {"n": "SITE PROGRESS", "d": "What is actually built — the claim, and the evidence standing behind it.", "r": [{"t": 1, "n": "STRUCTURAL DRAWING", "l": "BUILT TO"}, {"t": 5, "n": "PROGRAMME", "l": "CLAIMED VS"}, {"t": 8, "n": "COMPLIANCE", "l": "EVIDENCES"}]}, {"n": "COMPLIANCE", "d": "Certification, tied back to the drawing approved and the work done.", "r": [{"t": 0, "n": "ARCHITECTURAL DRAWING", "l": "CERTIFIES"}, {"t": 4, "n": "CONTRACT", "l": "CONDITION OF"}, {"t": 7, "n": "SITE PROGRESS", "l": "EVIDENCED BY"}]}];
  var MODES = [
    'EVE drafts. A person approves every one, and the draft carries the document it was drawn from.',
    'EVE acts inside limits you set. Anything outside them stops and comes back to a person.',
    'EVE closes the routine loop on its own. Every action it takes still names its source document.'
  ];
  var REST = { t:'Nine document types.',
    d:'A building produces the same records in the same order, every time. Biltflow is built on those records — not on a general model taught to talk about buildings.' };

  /* ---- behaviour ---- */
  var Q = function(s,r){ return [].slice.call((r||document).querySelectorAll(s)); },
      $ = function(i){ return document.getElementById(i); },
      slow = matchMedia('(prefers-reduced-motion: reduce)').matches,
      map = $('map'), nodes = Q('.node',map), spokes = Q('.spoke',map),
      active = -1, pinned = -1;

  function render(i){
    var d = i < 0 ? null : DATA[i], rel = {};
    if (d) d.r.forEach(function(r){ rel[r.t] = r.l; });
    nodes.forEach(function(n,k){
      var s = !d ? '' : k === i ? ' is-source'
            : rel[k] !== undefined ? ' is-target' : ' is-mute';
      n.setAttribute('class','node'+s);
      spokes[k].setAttribute('class','spoke'+s);
      spokes[k].lastElementChild.textContent = (d && rel[k]) || '';
    });
    $('ro-idx').textContent   = d ? '0'+(i+1)+' / 09' : '— / 09';
    $('ro-title').textContent = d ? d.n : REST.t;
    $('ro-desc').textContent  = d ? d.d : REST.d;
    $('ro-cap').textContent   = d ? 'EVE relates this to' : 'Select a document';
    $('hub-state').textContent = d ? 'Resolving' : 'At rest';
    $('ro-rels').hidden = !d; $('ro-hint').hidden = !!d;
    if (d) $('ro-rels').innerHTML = d.r.map(function(r){
      return '<li><span class="dot"></span><span class="rn">'+r.n+
             '</span><span class="rl">'+r.l+'</span></li>'; }).join('');
    pulse(!!d);
  }
  function set(i){ if (i !== active){ active = i; render(i); } }

  nodes.forEach(function(n,i){
    n.addEventListener('mouseenter', function(){ if (pinned < 0) set(i); });
    n.addEventListener('focus',      function(){ if (pinned < 0) set(i); });
    n.addEventListener('blur',       function(){ if (pinned < 0) set(-1); });
    n.addEventListener('click',      function(){ pinned = pinned === i ? -1 : i; set(pinned); });
    n.addEventListener('keydown',    function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault();
        n.dispatchEvent(new MouseEvent('click')); } });
  });
  map.addEventListener('mouseleave', function(){ if (pinned < 0) set(-1); });

  /* ---- EVE waveform: always breathing at a low idle baseline, swells while a document is selected.
     wave is re-queried fresh every frame/call rather than cached -- the artboard runtime
     reconciles this templated subtree shortly after boot (same mechanism confirmed for the
     integrations riser's <path> elements) and silently swaps in a new node, orphaning any
     reference captured once at IIFE-init time. ---- */
  var N = 32, X0 = 322, ST = 3.7, YC = 398,
      FLAT = ($('wave') || {}).getAttribute && $('wave').getAttribute('points'),
      IDLE = 2, ACTIVE = 9.5,
      amp = 0, want = IDLE, t = 0, raf = null, vis = true;

  function frame(){
    var w = $('wave');
    t += 0.075; amp += (want - amp) * 0.13;
    if (w){
      for (var p='', i=0, u, y; i<N; i++){ u = i/(N-1);
        y = YC + amp * Math.sin(u*Math.PI) *
            (Math.sin(t*2.1 + u*9)*0.62 + Math.sin(t*3.4 + u*15)*0.38);
        p += (i?' ':'') + (X0 + i*ST).toFixed(1) + ',' + y.toFixed(1); }
      w.setAttribute('points', p);
    }
    raf = setTimeout(frame, 16);
  }
  function pulse(on){
    if (slow) return;
    want = on ? ACTIVE : IDLE;
    if (!raf && vis) raf = setTimeout(frame, 16);
  }
  new IntersectionObserver(function(e){
    vis = e[0].isIntersecting;
    if (!vis){ if (raf) clearTimeout(raf); raf = null; var w = $('wave'); if (w) w.setAttribute('points', FLAT); }
    else if (!raf) raf = setTimeout(frame, 16);
  }, {threshold:0}).observe(map);
  if (!slow) pulse(false);

  /* ---- copilot / autopilot ---- */
  var knob = $('knob'), stops = Q('#stops button');
  function setStop(s){
    knob.style.left = s*280 + 'px';
    $('mode-line').textContent = MODES[s];
    stops.forEach(function(b,k){ b.setAttribute('aria-pressed', k === s ? 'true' : 'false'); });
  }
  Q('#slider .detent').concat(stops).forEach(function(b){
    b.addEventListener('click', function(){ setStop(+b.dataset.stop); }); });
})();

})();

/* ===== compounding ===== */
(function(){

  /* Motion opt-in. If JS or IntersectionObserver is missing, or the reader asked
     for reduced motion, the drawing simply renders composed. */
  (function(){
    var ok = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
             && ('IntersectionObserver' in window);
    if (ok) document.documentElement.className += ' js';
  })();

(function(){
  if (document.documentElement.className.indexOf('js') === -1) return;
  var frame = document.getElementById('frame');
  if (!frame) return;

  var done = false;
  function deposit(){
    if (done) return;
    done = true;
    frame.className += ' is-in';
  }

  /* Runs once, only when the drawing is actually on screen, then rests. */
  var io = new IntersectionObserver(function(entries){
    for (var i = 0; i < entries.length; i++){
      if (entries[i].isIntersecting){ deposit(); io.disconnect(); }
    }
  }, { threshold: 0.25 });
  io.observe(frame);

  /* Failsafe: never leave the drawing half-built. */
  setTimeout(function(){ if (!done){ deposit(); io.disconnect(); } }, 2200);
})();

})();

/* ===== roles ===== */
(function(){

/* Biltflow — roles ruler. ~1.4 KB. No library. Rests between states. */
(function () {
  var sec = document.getElementById('roles');
  if (!sec) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cols  = [].slice.call(sec.querySelectorAll('[data-col]'));
  var cards = [].slice.call(sec.querySelectorAll('[data-role]'));
  var grid  = sec.querySelector('[data-grid]');
  var out   = sec.querySelector('[data-readout]');
  var rest  = out.textContent;
  var awake = false, cur;

  function paint(card) {
    if (card === cur) return;
    cur = card;
    var owns = card ? card.getAttribute('data-owns').split(',') : [];
    var need = card ? card.getAttribute('data-needs').split(',') : [];
    for (var i = 0; i < cols.length; i++) {
      var n = cols[i].getAttribute('data-col');
      cols[i].setAttribute('data-state',
        !card ? 'tally' : owns.indexOf(n) > -1 ? 'own' : need.indexOf(n) > -1 ? 'need' : 'off');
    }
    for (var j = 0; j < cards.length; j++) {
      cards[j].setAttribute('data-on', cards[j] === card ? 'true' : 'false');
    }
    out.textContent = card ? card.getAttribute('data-readout') : rest;
  }

  cards.forEach(function (k) {
    k.addEventListener('mouseenter', function () { if (awake) paint(k); });
    k.addEventListener('focus',      function () { if (awake) paint(k); });
  });
  grid.addEventListener('mouseleave', function () { if (awake) paint(null); });
  grid.addEventListener('focusout', function (e) {
    if (awake && !grid.contains(e.relatedTarget)) paint(null);
  });

  /* entrance: the thirteen columns fill once, left to right, then rest. */
  var drawn = false;
  function draw() {
    if (drawn) return;
    drawn = true;
    if (reduce) { sec.setAttribute('data-live', 'true'); return; }
    for (var i = 0; i < cols.length; i++) cols[i].style.transitionDelay = (i * 26) + 'ms';
    sec.setAttribute('data-live', 'true');
    setTimeout(function () {
      for (var i = 0; i < cols.length; i++) cols[i].style.transitionDelay = '';
    }, cols.length * 26 + 260);
  }

  if ('IntersectionObserver' in window) {
    sec.setAttribute('data-live', 'false');           /* only after JS is confirmed alive */
    new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) {
        if (es[i].isIntersecting) { awake = true; draw(); }
        else { awake = false; paint(null); }          /* off-screen: nothing listens, nothing moves */
      }
    }, { threshold: 0.2 }).observe(sec);
  } else {
    awake = true; drawn = true;
  }
})();

})();

/* ===== repurpose ===== */
(function(){

(function(){
  var reg = document.getElementById('reg');
  if (!reg) return;
  var rows = [].slice.call(reg.querySelectorAll('.row'));

  function setOpen(row, open){
    row.setAttribute('data-open', open ? 'true' : 'false');
    var btn = row.querySelector('.rowbtn');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  reg.addEventListener('click', function(e){
    var btn = e.target.closest && e.target.closest('.rowbtn');
    if (!btn) return;
    var row = btn.parentNode;
    var wasOpen = row.getAttribute('data-open') === 'true';
    rows.forEach(function(r){ setOpen(r, false); });   // one open at a time
    if (!wasOpen) setOpen(row, true);
  });

  // Transitions are opt-in: they only exist while the register is on screen and
  // motion is welcome. Off-screen state changes apply instantly, nothing loops.
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      reg.classList.toggle('is-live', en.isIntersecting);
    });
  }, { rootMargin: '80px' }).observe(reg);
})();

})();