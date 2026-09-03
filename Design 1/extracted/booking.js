/* Book a demo — four-step panel. Opens from any "Book a demo" control.
   Not connected to a backend; the final step says so rather than implying a
   booking was made. Options are drawn from the page's own content (the six
   roles, four asset classes and twelve systems), not invented. */
(function () {
  var ROLES = ['Developer','Construction Director','Project Manager','Contracts Manager',
               'Design Manager','Site Manager','CFO / Finance','Head of Digital','Other'];
  var CLASSES = ['High-density residential','Build-to-rent','Hotels & serviced apartments','Mixed-use'];
  var SYSTEMS = ['Aconex','Procore','Jobpac','ProcurePro','Payapps','Buildsoft',
                 'Bluebeam','CostX','Excel','Outlook','Teams','WhatsApp'];
  var SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30',
               '13:00','13:30','14:00','14:30','15:00','15:30'];
  var MONTHS = ['January','February','March','April','May','June','July','August',
                'September','October','November','December'];

  var state = { step: 0, name:'', email:'', company:'', role:'', klass:'', projects:'',
                systems: [], date: null, time: '', notes: '' };
  var view = new Date(); view.setDate(1);
  var today = new Date(); today.setHours(0,0,0,0);
  // Earliest bookable day is the next business day — offering "today at 10:00"
  // when it is already the afternoon is the classic booking-form bug.
  var earliest = new Date(today);
  do { earliest.setDate(earliest.getDate() + 1); }
  while (earliest.getDay() === 0 || earliest.getDay() === 6);
  var root, lastFocus;

  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function fmtDate(d){ return d ? d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear() : ''; }
  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  /* ---------- steps ---------- */
  function stepOne(){
    return '<h2>Book a demo</h2>' +
      '<p class="lede">Thirty minutes, screen-shared, on a project like yours. We will ask what you run today so the demo is not generic.</p>' +
      '<div class="grid2">' +
        field('name','Your name','text', state.name) +
        field('email','Work email','email', state.email) +
      '</div>' +
      '<div class="grid2">' +
        field('company','Company', 'text', state.company) +
        '<label><span class="mono">Your role</span><select id="bf-role">' +
          '<option value="">Select…</option>' +
          ROLES.map(function(r){ return '<option'+(state.role===r?' selected':'')+'>'+esc(r)+'</option>'; }).join('') +
        '</select></label>' +
      '</div>';
  }
  function field(id,label,type,val){
    return '<label><span class="mono">'+esc(label)+'</span>' +
      '<input id="bf-'+id+'" type="'+type+'" value="'+esc(val)+'" autocomplete="'+
      (type==='email'?'email':id==='name'?'name':'organization')+'">' +
      '<span class="err" id="bf-'+id+'-err">Required</span></label>';
  }
  function stepTwo(){
    return '<h2>What are you running?</h2>' +
      '<p class="lede">So the demo shows your workflow, not a sample project.</p>' +
      '<span class="mono" style="display:block;margin-bottom:10px">Asset class</span>' +
      '<div class="chips">' + CLASSES.map(function(c){
        return '<button type="button" class="chip" data-klass="'+esc(c)+'" aria-pressed="'+(state.klass===c)+'">'+esc(c)+'</button>'; }).join('') + '</div>' +
      '<label style="max-width:280px"><span class="mono">Active projects</span>' +
        '<select id="bf-projects"><option value="">Select…</option>' +
        ['1–2','3–5','6–10','More than 10'].map(function(o){
          return '<option'+(state.projects===o?' selected':'')+'>'+o+'</option>'; }).join('') +
        '</select></label>' +
      '<span class="mono" style="display:block;margin:6px 0 10px">Systems you use today — select any</span>' +
      '<div class="chips">' + SYSTEMS.map(function(s){
        return '<button type="button" class="chip" data-sys="'+esc(s)+'" aria-pressed="'+
          (state.systems.indexOf(s)>-1)+'">'+esc(s)+'</button>'; }).join('') + '</div>';
  }
  function stepThree(){
    return '<h2>Pick a time</h2>' +
      '<p class="lede">Weekdays, Australian Eastern Time. Thirty minutes.</p>' +
      '<div class="cal">' + calendar() + '</div>' +
      (state.date ? '<span class="mono" style="display:block;margin:22px 0 10px">' +
        'Times on '+esc(fmtDate(state.date))+' — AEST</span><div class="slots">' +
        SLOTS.map(function(t){ return '<button type="button" data-slot="'+t+'" aria-pressed="'+
          (state.time===t)+'">'+t+'</button>'; }).join('') + '</div>' : '');
  }
  function calendar(){
    var y = view.getFullYear(), m = view.getMonth();
    var first = new Date(y,m,1), start = (first.getDay()+6)%7;      // Monday-first
    var days = new Date(y,m+1,0).getDate();
    var prevOk = new Date(y,m,1) > earliest;
    var html = '<div class="calhead"><button type="button" data-nav="-1" aria-label="Previous month"'+
      (prevOk?'':' disabled')+'>&lsaquo;</button>' +
      '<span class="mono">'+MONTHS[m]+' '+y+'</span>' +
      '<button type="button" data-nav="1" aria-label="Next month">&rsaquo;</button></div>' +
      '<div class="dow">'+['M','T','W','T','F','S','S'].map(function(d){return '<span>'+d+'</span>';}).join('')+'</div>' +
      '<div class="days">';
    for (var i=0;i<start;i++) html += '<span></span>';
    for (var d=1; d<=days; d++){
      var dt = new Date(y,m,d), dow = dt.getDay();
      var off = dt < earliest || dow===0 || dow===6;        // next business day onward, weekdays only
      var on = state.date && dt.getTime()===state.date.getTime();
      html += '<button type="button" data-day="'+d+'"'+(off?' disabled':'')+
        ' aria-pressed="'+(!!on)+'">'+d+'</button>';
    }
    return html + '</div>';
  }
  function stepFour(){
    var rows = [['Name',state.name],['Email',state.email],['Company',state.company],
      ['Role',state.role],['Asset class',state.klass||'—'],['Active projects',state.projects||'—'],
      ['Systems today', state.systems.length ? state.systems.join(', ') : '—'],
      ['Date', fmtDate(state.date)],['Time', state.time ? state.time+' AEST' : '—']];
    return '<h2>Check and confirm</h2>' +
      '<p class="lede">Nothing is sent until you confirm.</p>' +
      '<div class="review">' + rows.map(function(r){
        return '<div><span class="mono">'+esc(r[0])+'</span><span>'+esc(r[1])+'</span></div>'; }).join('') + '</div>' +
      '<label style="margin-top:22px"><span class="mono">Anything specific you want to see?</span>' +
      '<textarea id="bf-notes" rows="3">'+esc(state.notes)+'</textarea></label>' +
      '<div class="note"><span class="mono">[ Prototype — not connected ]</span>' +
      '<p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:#59636E">' +
      'This form is a design prototype. Confirming will not send anything or book a slot ' +
      'until it is wired to a calendar and an inbox.</p></div>';
  }
  function done(){
    return '<h2>That is everything</h2>' +
      '<p class="lede">In a live build this would land with the Biltflow team and hold ' +
      esc(fmtDate(state.date)) + ' at ' + esc(state.time) + ' AEST.</p>' +
      '<div class="note"><span class="mono">[ Prototype — nothing was sent ]</span>' +
      '<p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:#59636E">' +
      'No request has been submitted and no time has been reserved.</p></div>';
  }

  var STEPS = [stepOne, stepTwo, stepThree, stepFour];

  /* ---------- render ---------- */
  function render(){
    var body = root.querySelector('.body');
    body.innerHTML = state.step < 4 ? STEPS[state.step]() : done();
    root.querySelector('.stepno').textContent = state.step < 4
      ? 'Step 0'+(state.step+1)+' / 04' : 'Complete';
    [].forEach.call(root.querySelectorAll('.steps i'), function(el,i){
      if (i <= state.step && state.step < 4) el.setAttribute('data-on',''); 
      else if (state.step >= 4) el.setAttribute('data-on','');
      else el.removeAttribute('data-on');
    });
    var back = root.querySelector('.back'), next = root.querySelector('.next');
    back.style.visibility = (state.step === 0 || state.step >= 4) ? 'hidden' : 'visible';
    next.textContent = state.step === 3 ? 'Confirm' : state.step >= 4 ? 'Close' : 'Continue';
    body.scrollTop = 0;
    var f = body.querySelector('input,select,button');
    if (f) f.focus();
  }

  function collect(){
    var g = function(id){ var e = root.querySelector('#bf-'+id); return e ? e.value.trim() : ''; };
    if (state.step === 0){ state.name=g('name'); state.email=g('email');
      state.company=g('company'); state.role=g('role'); }
    if (state.step === 1){ state.projects=g('projects'); }
    if (state.step === 3){ state.notes=g('notes'); }
  }
  function validate(){
    if (state.step !== 0) return true;
    var ok = true;
    [['name', state.name.length>1],['email', validEmail(state.email)],['company', state.company.length>1]]
      .forEach(function(p){
        var input = root.querySelector('#bf-'+p[0]), err = root.querySelector('#bf-'+p[0]+'-err');
        if (!input) return;
        input.setAttribute('aria-invalid', String(!p[1]));
        if (err){ if (p[1]) err.removeAttribute('data-show'); else err.setAttribute('data-show',''); 
          err.textContent = p[0]==='email' ? 'Enter a valid work email' : 'Required'; }
        if (!p[1] && ok){ input.focus(); ok = false; }
      });
    return ok;
  }

  /* ---------- events ---------- */
  function onClick(e){
    var t = e.target.closest('button'); if (!t) return;
    if (t.classList.contains('x') || t.classList.contains('scrim')) return close();
    if (t.classList.contains('back')){ state.step--; return render(); }
    if (t.classList.contains('next')){
      if (state.step >= 4) return close();
      collect(); if (!validate()) return;
      state.step++; return render();
    }
    if (t.dataset.klass){ state.klass = t.dataset.klass; return render(); }
    if (t.dataset.sys){
      var i = state.systems.indexOf(t.dataset.sys);
      if (i>-1) state.systems.splice(i,1); else state.systems.push(t.dataset.sys);
      t.setAttribute('aria-pressed', String(i===-1)); return;
    }
    if (t.dataset.nav){ view.setMonth(view.getMonth()+ +t.dataset.nav); return render(); }
    if (t.dataset.day){
      state.date = new Date(view.getFullYear(), view.getMonth(), +t.dataset.day);
      state.time = ''; return render();
    }
    if (t.dataset.slot){ state.time = t.dataset.slot; return render(); }
  }
  function onKey(e){
    if (e.key === 'Escape') close();
    if (e.key !== 'Tab') return;
    var f = root.querySelectorAll('button:not([disabled]),input,select,textarea');
    if (!f.length) return;
    var first = f[0], last = f[f.length-1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
  function open(){
    lastFocus = document.activeElement;
    state.step = 0; render();
    root.setAttribute('data-open',''); document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
  }
  function close(){
    root.removeAttribute('data-open'); document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function build(){
    // The Design runtime re-executes this script on every artboard re-render, so
    // build() can run more than once. Drop any panel a previous run left behind —
    // otherwise querySelector('#bf-book') finds the dead one and the live one is
    // invisible to everything outside this closure.
    var stale = document.getElementById('bf-book');
    if (stale) stale.remove();
    root = document.createElement('div');
    root.id = 'bf-book';
    root.setAttribute('role','dialog');
    root.setAttribute('aria-modal','true');
    root.setAttribute('aria-label','Book a demo');
    root.innerHTML =
      '<div class="scrim"></div>' +
      '<div class="panel">' +
        '<div class="bar"><span class="mono stepno">Step 01 / 04</span>' +
          '<button type="button" class="x" aria-label="Close">&times;</button></div>' +
        '<div class="steps"><i></i><i></i><i></i><i></i></div>' +
        '<div class="body"></div>' +
        '<div class="foot"><button type="button" class="ghost back">Back</button>' +
          '<button type="button" class="primary next">Continue</button></div>' +
      '</div>';
    document.body.appendChild(root);
    root.addEventListener('click', onClick);
    root.querySelector('.scrim').addEventListener('click', close);
  }

  var tries = 0;
  (function boot(){
    var ctas = [].filter.call(document.querySelectorAll('a,button'), function(el){
      return /^\s*book a demo\s*$/i.test(el.textContent || '');
    });
    if (ctas.length){
      build();
      ctas.forEach(function(el){
        if (el.hasAttribute('data-bf-bound')) return;   // never bind the same node twice
        el.setAttribute('data-bf-bound', '');
        el.addEventListener('click', function(ev){ ev.preventDefault(); open(); });
      });
      window.__bfBook = { triggers: ctas.length, open: open };
      return;
    }
    if (tries++ < 40) setTimeout(boot, 150);
  })();
})();
