/* Evofit Interiors – small enhancements (no dependencies).
   1. WhatsApp links      2. project filters + "show all"   3. project photo gallery (swipe, keys, dots)
   4. enquiry form helpers (service pre-select, WhatsApp message, anti-spam timer, sending state)
   5. menu highlight while scrolling   6. gentle reveal on scroll   7. header shadow */
(function () {
  'use strict';
  var C = window.EVOFIT || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var editor = document.body && document.body.classList.contains('elementor-editor-active');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pageStart = Date.now();

  /* ---------------- 1. WhatsApp links ---------------- */
  var wa = (C.whatsapp || '').replace(/\D/g, '');
  function waUrl(text) { return 'https://wa.me/' + wa + (text ? '?text=' + encodeURIComponent(text) : ''); }
  if (wa) {
    $$('.evofit-wa a, a.evofit-wa, a[href*="wa.me/91XXXXXXXXXX"]').forEach(function (a) {
      a.href = waUrl('Hello Evofit Interiors, I would like to discuss an interior fit-out project.');
      a.target = '_blank'; a.rel = 'noopener';
    });
  }

  /* ---------------- 2. project filters ---------------- */
  var grid = $('.evofit-projects');
  var chips = $$('.evofit-chip');
  var KEYS = ['all', 'office', 'hospitality', 'commercial', 'ongoing', 'completed'];
  function applyFilter(key, explicit) {
    if (!grid) return;
    if (KEYS.indexOf(key) < 0) key = 'all';
    $$('.evofit-card--project', grid).forEach(function (c) {
      var show = key === 'all' || c.classList.contains('evofit-cat-' + key);
      c.classList.toggle('is-hidden', !show);
    });
    /* first view shows the featured projects; choosing "All" / "View All Projects" on purpose reveals every project */
    grid.classList.toggle('is-expanded', key !== 'all' || !!explicit);
    chips.forEach(function (c) {
      var a = c.querySelector('a');
      var on = !!a && a.getAttribute('href') === '#projects-' + key;
      c.classList.toggle('is-active', on);
      if (a) a.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function fromHash() {
    var m = /^#projects-([a-z]+)$/.exec(location.hash);
    if (m) { applyFilter(m[1], true); var s = document.getElementById('projects'); if (s) s.scrollIntoView(); }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href*="#projects-"]') : null;
    if (!a) return;
    var m = /#projects-([a-z]+)$/.exec(a.getAttribute('href'));
    if (!m) return;
    var same = a.pathname === location.pathname || a.getAttribute('href').charAt(0) === '#';
    if (!same) return;              /* different page: let the browser navigate, hash is applied on load */
    e.preventDefault();
    applyFilter(m[1], true);
    history.replaceState(null, '', '#projects-' + m[1]);
    var s = document.getElementById('projects'); if (s) s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  window.addEventListener('hashchange', fromHash);
  if (grid) { applyFilter('all', false); fromHash(); }

  /* ---------------- 3. project gallery ---------------- */
  var lb, imgs = [], idx = 0, lastFocus = null, title = '', loc = '', touchX = null;
  function build() {
    lb = document.createElement('div');
    lb.className = 'evofit-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Project photographs');
    lb.innerHTML = '<button class="lb-close" aria-label="Close gallery">&times;</button><button class="lb-prev" aria-label="Previous photo">&#8249;</button>' +
      '<figure><img class="lb-main" alt=""><figcaption></figcaption><div class="lb-dots"></div></figure><button class="lb-next" aria-label="Next photo">&#8250;</button>';
    document.body.appendChild(lb);
    lb.querySelector('.lb-close').onclick = close;
    lb.querySelector('.lb-prev').onclick = function () { go(-1); };
    lb.querySelector('.lb-next').onclick = function () { go(1); };
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    var fig = lb.querySelector('figure');
    fig.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    fig.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    }, { passive: true });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'Home') { idx = 0; show(); }
      else if (e.key === 'End') { idx = imgs.length - 1; show(); }
      else if (e.key === 'Tab') { /* keep focus inside */
        var f = $$('button', lb).filter(function (b) { return b.offsetParent !== null; }), i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
  }
  function preload(i) { var im = new Image(); im.src = imgs[(i + imgs.length) % imgs.length]; }
  function show() {
    var im = lb.querySelector('.lb-main');
    im.classList.add('is-loading');
    im.onload = function () { im.classList.remove('is-loading'); };
    im.src = imgs[idx];
    if (im.complete) im.classList.remove('is-loading');
    im.alt = title + ' – photograph ' + (idx + 1) + ' of ' + imgs.length;
    lb.querySelector('figcaption').innerHTML = '<strong></strong><small></small>';
    lb.querySelector('strong').textContent = title;
    lb.querySelector('small').textContent = (loc ? loc + ' · ' : '') + (idx + 1) + ' / ' + imgs.length;
    var many = imgs.length > 1;
    lb.querySelector('.lb-prev').style.display = lb.querySelector('.lb-next').style.display = many ? '' : 'none';
    var dots = lb.querySelector('.lb-dots');
    if (dots.children.length !== imgs.length) {
      dots.innerHTML = '';
      imgs.forEach(function (_, i) {
        var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Photo ' + (i + 1));
        b.onclick = function () { idx = i; show(); }; dots.appendChild(b);
      });
    }
    $$('button', dots).forEach(function (b, i) { b.classList.toggle('is-on', i === idx); });
    dots.style.display = many ? '' : 'none';
    if (many) { preload(idx + 1); preload(idx - 1); }
  }
  function go(d) { idx = (idx + d + imgs.length) % imgs.length; show(); }
  function close() { lb.classList.remove('is-open'); document.documentElement.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null; if (!t) return;
    var a = t.closest('.evofit-view a');
    if (!a) {                                  /* clicking the project photo opens the gallery too */
      var pic = t.closest('.evofit-card--project .evofit-card-img');
      if (pic) a = pic.closest('.evofit-card').querySelector('.evofit-view a');
    }
    if (!a) return;
    var key = null, w = a.closest('.evofit-view');
    var mm = /evofit-proj-([a-z]+)/.exec(w.className); if (mm) key = mm[1];
    var list = C.gallery && C.gallery[key];
    if (!list || !list.length) return;           /* no gallery data: leave the normal link */
    e.preventDefault();
    if (!lb) build();
    var card = a.closest('.evofit-card');
    title = card ? (card.querySelector('.elementor-heading-title') || {}).textContent || '' : '';
    var l = card ? card.querySelector('.evofit-loc') : null; loc = l ? l.textContent : '';
    imgs = list.map(function (p) { return (C.base || '') + p; }); idx = 0;
    lb.querySelector('.lb-dots').innerHTML = '';
    lastFocus = a; show(); lb.classList.add('is-open'); document.documentElement.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  });

  /* ---------------- 4. enquiry form helpers ---------------- */
  var form = $('.evofit-form');
  var sel = form ? form.querySelector('select[name="project_type"]') : null;
  var svcMap = { office: 'Office interiors', residential: 'Residential interiors', commercial: 'Commercial interiors', retail: 'Retail store interiors',
                 cafe: 'Café / restaurant interiors', renovation: 'Renovation / refurbishment', civil: 'Civil, electrical & finishing works', finishing: 'Civil, electrical & finishing works' };
  function pickService(key) { if (sel && svcMap[key]) { sel.value = svcMap[key]; return true; } return false; }
  if (form) {
    var qs = /[?&]service=([a-z]+)/.exec(location.search);
    if (qs) pickService(qs[1]);

    /* "Explore Service" links: choose the service and scroll to the form without reloading the page */
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href*="?service="]') : null;
      if (!a) return;
      var m = /[?&]service=([a-z]+)/.exec(a.getAttribute('href'));
      if (!m || a.pathname !== location.pathname) return;
      e.preventDefault();
      pickService(m[1]);
      history.replaceState(null, '', location.pathname + '?service=' + m[1] + '#contact');
      var c = document.getElementById('contact'); if (c) c.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      var n = form.querySelector('[name="name"]'); if (n) setTimeout(function () { n.focus({ preventScroll: true }); }, reduce ? 0 : 600);
    });

    var btn = form.querySelector('.ef-wa');
    if (btn) btn.addEventListener('click', function () {
      if (!wa) { alert('WhatsApp number is not configured yet.'); return; }
      var g = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      var lines = ['Hello Evofit Interiors, I would like to discuss a project.', '',
        g('name') && 'Name: ' + g('name'), g('phone') && 'Phone: ' + g('phone'), g('email') && 'Email: ' + g('email'),
        g('project_type') && 'Project type: ' + g('project_type'), g('location') && 'Location: ' + g('location'),
        g('message') && 'Requirements: ' + g('message')].filter(function (x) { return x !== '' && x !== false; });
      window.open(waUrl(lines.join('\n')), '_blank', 'noopener');
    });

    form.addEventListener('submit', function () {
      var t = form.querySelector('[name="ef_t"]'); if (t) t.value = String(Date.now() - pageStart);   /* anti-spam: time on page */
      var b = form.querySelector('.ef-submit');
      if (b) { b.disabled = true; b.textContent = 'Sending…'; }                                       /* stop double submits */
    });
    window.addEventListener('pageshow', function (e) {                                                /* back button: re-enable */
      var b = form.querySelector('.ef-submit'); if (b && e.persisted) { b.disabled = false; b.textContent = 'Submit Enquiry'; }
    });
    if (/[?&]evofit=/.test(location.search)) { var m2 = $('.evofit-form-msg'); if (m2) { m2.setAttribute('tabindex', '-1'); m2.focus(); } }
  }

  /* ---------------- 5. menu highlight while scrolling ---------------- */
  var items = $$('.main-header-menu > .menu-item').map(function (li) {
    var a = li.querySelector(':scope > a'); var h = a ? /#([\w-]+)$/.exec(a.getAttribute('href') || '') : null;
    return h && h[1] && !li.classList.contains('evofit-cta-menu') ? { li: li, id: h[1] } : null;
  }).filter(Boolean);
  if (items.length && 'IntersectionObserver' in window && !editor) {
    var secs = {};
    items.forEach(function (it) { var el = document.getElementById(it.id); if (el) secs[it.id] = el; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        items.forEach(function (it) { it.li.classList.toggle('evofit-active', it.id === en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    Object.keys(secs).forEach(function (k) { spy.observe(secs[k]); });
    ['why', 'faq', 'hero'].forEach(function (k) {         /* sections without a menu item clear the highlight */
      var el = document.getElementById(k); if (!el) return;
      new IntersectionObserver(function (en) { if (en[0].isIntersecting) items.forEach(function (it) { it.li.classList.remove('evofit-active'); }); }, { rootMargin: '-45% 0px -50% 0px' }).observe(el);
    });
  }

  /* ---------------- 6. reveal on scroll ---------------- */
  if (!editor && !reduce && 'IntersectionObserver' in window && $('.evofit-section')) {
    try {
      var targets = $$('.evofit-head, .evofit-card, .evofit-pillar, .evofit-step, .evofit-why .elementor-widget-icon-box, .evofit-quote-wrap, .evofit-faq-item, .evofit-form-card, .evofit-map-wrap');
      document.documentElement.classList.add('evofit-js');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target; el.classList.add('is-in'); io.unobserve(el);
          setTimeout(function () { el.classList.remove('evofit-reveal', 'is-in'); el.style.transitionDelay = ''; }, 900 + (parseInt(el.style.transitionDelay, 10) || 0));   /* hand hover effects back to the theme CSS */
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      targets.forEach(function (el) {
        var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.transitionDelay = Math.min(sib, 5) * 70 + 'ms';
        el.classList.add('evofit-reveal'); io.observe(el);
      });
      setTimeout(function () { targets.forEach(function (el) { if (!el.classList.contains('is-in')) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight) el.classList.add('is-in'); } }); }, 2500);
    } catch (err) { document.documentElement.classList.remove('evofit-js'); }
  }

  /* ---------------- 7. header shadow once the page is scrolled ---------------- */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    window.requestAnimationFrame(function () { document.body.classList.toggle('evofit-scrolled', window.scrollY > 8); ticking = false; });
  }, { passive: true });
})();
