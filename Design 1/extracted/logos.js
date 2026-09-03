/* Swap the integration wordmarks for real vendor logos.
   Any vendor whose asset is missing keeps its text wordmark, so the strip never
   shows a broken image. Logos render monochrome so twelve brand palettes don't
   turn the section into confetti — drop the filter for full colour. */
(function () {
  var MAP = {
    'aconex':'aconex', 'procore':'procore', 'jobpac':'jobpac', 'procurepro':'procurepro',
    'payapps':'payapps', 'buildsoft':'buildsoft', 'bluebeam':'bluebeam', 'costx':'costx',
    'excel':'excel', 'outlook':'outlook', 'teams':'teams', 'whatsapp':'whatsapp'
  };
  var EXT = ['svg','png'];

  function slug(t){ return (t||'').toLowerCase().replace(/[^a-z]/g,''); }

  function swap(card, name) {
    var key = MAP[slug(name)];
    if (!key) return;
    var i = 0;
    var img = new Image();
    img.alt = name;
    // normalise on HEIGHT so twelve different lockups sit on one optical line
    img.style.cssText = 'height:22px;width:auto;max-width:140px;' +
      'object-fit:contain;object-position:left center;display:block;' +
      'filter:grayscale(1) brightness(0);opacity:.78';
    img.onerror = function () {
      if (++i < EXT.length) { img.src = './logos/' + key + '.' + EXT[i]; return; }
      img.remove();                       // no asset — the wordmark stays
    };
    img.onload = function () {
      var span = card.querySelector('span');
      if (span) span.style.display = 'none';
      card.insertBefore(img, card.firstChild);
      card.style.justifyContent = 'space-between';
      card.setAttribute('data-logo', key);
    };
    img.src = './logos/' + key + '.' + EXT[0];
  }

  var tries = 0;
  (function boot() {
    var sec = [].slice.call(document.querySelectorAll('section'))
      .filter(function (s) { return /existing stack/.test(s.textContent); })[0];
    if (sec) {
      var cards = [].slice.call(sec.querySelectorAll('div')).filter(function (d) {
        return d.children.length === 2 && d.children[0].tagName === 'SPAN' &&
               d.children[1].tagName === 'SPAN' && d.offsetHeight > 60;
      });
      cards.forEach(function (c) { swap(c, c.children[0].textContent.trim()); });
      window.__biltflowLogos = { cards: cards.length };
      return;
    }
    if (tries++ < 40) setTimeout(boot, 150);
  })();
})();
