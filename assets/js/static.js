/* Applies config.js (contact details, social links, floating buttons), mobile menu, footer year. Runs before evofit.js. */
(function () {
  'use strict';
  var c = window.EVOFIT_CONFIG || {};
  var wa = (c.whatsapp || '').replace(/\D/g, '');
  window.EVOFIT.whatsapp = wa;
  var tel = (c.phone || '').replace(/[^\d+]/g, '');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }

  /* contact list + footer */
  var list = $('.evofit-contact-list');
  if (list) {
    if (c.phone) list.insertAdjacentHTML('beforeend', '<li><strong>Phone</strong><span><a href="tel:' + esc(tel) + '">' + esc(c.phone) + '</a></span></li>');
    if (c.email) list.insertAdjacentHTML('beforeend', '<li><strong>Email</strong><span><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></span></li>');
  }
  var fp = $('.evofit-footer-col:nth-child(4) .evofit-footer-text p');
  if (fp) {
    if (c.phone) fp.insertAdjacentHTML('beforeend', '<br>Phone: <a href="tel:' + esc(tel) + '">' + esc(c.phone) + '</a>');
    if (c.email) fp.insertAdjacentHTML('beforeend', '<br>Email: <a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a>');
  }
  var soc = [['Instagram', c.instagram], ['LinkedIn', c.linkedin], ['Facebook', c.facebook], ['Google Maps', c.mapsLink]].filter(function (x) { return safeUrl(x[1]); });
  var sh = $('[data-social]');
  if (sh && soc.length) sh.outerHTML = '<ul class="evofit-social">' + soc.map(function (x) { return '<li><a href="' + esc(safeUrl(x[1])) + '" target="_blank" rel="noopener">' + x[0] + '</a></li>'; }).join('') + '</ul>';
  var dir = $('[data-directions]'); if (dir && safeUrl(c.mapsLink)) dir.href = safeUrl(c.mapsLink);
  var yr = $('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();

  /* floating buttons (only when details are filled in) */
  var fl = $('#evofit-float'), h = '';
  if (tel) h += '<a class="evofit-call-float" href="tel:' + esc(tel) + '" aria-label="Call Evofit Interiors"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"/></svg><span>Call</span></a>';
  if (wa) h += '<a class="evofit-wa-float evofit-wa" href="https://wa.me/' + wa + '" target="_blank" rel="noopener" aria-label="Chat with Evofit Interiors on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.3z"/></svg><span>WhatsApp</span></a>';
  if (fl) fl.innerHTML = h;

  /* mobile menu */
  var hd = $('.site-header'), tg = $('.nav-toggle');
  if (hd && tg) {
    tg.addEventListener('click', function () {
      var o = hd.classList.toggle('is-open');
      tg.setAttribute('aria-expanded', o ? 'true' : 'false'); tg.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    });
    hd.addEventListener('click', function (e) {
      if (e.target.closest('nav a') && hd.classList.contains('is-open')) { hd.classList.remove('is-open'); tg.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hd.classList.contains('is-open')) { hd.classList.remove('is-open'); tg.setAttribute('aria-expanded', 'false'); tg.focus(); } });
  }
})();
