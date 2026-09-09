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
  /* Only four of the twelve marks are BOTH legally clear and visually viable:
     - excel / outlook / teams : gradient product icons. Microsoft permits wordmarks
       only for nominative use; product icons need an express licence. Flattening
       them to monochrome also turns them into black blobs.
     - whatsapp : Meta forbids recolouring the mark.
     - aconex / jobpac / costx : the fetched files are the ORACLE, VIEWPOINT and RIB
       corporate marks, not the product wordmarks. Showing them misnames the product.
     - buildsoft : palette PNG with no alpha, so a monochrome flatten gives a black box.
     Everything not on this list keeps its text wordmark, which is the correct
     nominative-use treatment anyway. */
  var CLEARED = ['procore','procurepro','bluebeam','payapps'];

  function slug(t){ return (t||'').toLowerCase().replace(/[^a-z]/g,''); }

  function swap(card, name) {
    var key = MAP[slug(name)];
    if (!key || CLEARED.indexOf(key) === -1) return;   // keep the wordmark
    var i = 0;
    var img = new Image();
    img.alt = name;
    // normalise on HEIGHT so twelve different lockups sit on one optical line
    img.style.cssText = 'height:22px;width:auto;max-width:140px;' +
      'object-fit:contain;object-position:left center;display:block;' +
      'opacity:.9';
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
