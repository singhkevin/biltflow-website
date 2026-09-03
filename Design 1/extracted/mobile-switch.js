/* Desktop → mobile hand-off. Real phones (narrow AND touch) get the mobile design;
   a narrow desktop window keeps the desktop page. */
(function () {
  if (/mobile\.dc\.html$/.test(location.pathname)) return;
  if (matchMedia('(max-width: 767px) and (pointer: coarse)').matches) {
    location.replace('./mobile.dc.html' + location.hash);
  }
})();
