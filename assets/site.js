/* La Casa — static site behaviour: preloader, nav, reveals, language, menu book */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- preloader ---------- */
  var pre = d.getElementById('preloader');
  var bar = pre && pre.querySelector('.tricolor-bar i');
  var p = 0;
  var tick = setInterval(function () {
    p = Math.min(92, p + Math.random() * 16);
    if (bar) bar.style.width = p + '%';
  }, 180);
  function done() {
    clearInterval(tick);
    if (bar) bar.style.width = '100%';
    setTimeout(function () { if (pre) pre.classList.add('is-done'); }, 260);
  }
  window.addEventListener('load', function () { setTimeout(done, 350); });
  setTimeout(done, 4000);

  /* ---------- header on scroll ---------- */
  var nav = d.getElementById('nav');
  function onScroll() { nav.classList.toggle('is-solid', window.scrollY > 60); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- overlay nav (mobile) ---------- */
  var overlay = d.getElementById('overlay');
  var open = d.getElementById('navOpen');
  var close = d.getElementById('navClose');
  var links = overlay.querySelectorAll('.overlay__links a');
  Array.prototype.forEach.call(links, function (a, i) {
    a.style.transitionDelay = (0.08 + i * 0.055) + 's';
    a.addEventListener('click', hide);
  });
  function show() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    open.setAttribute('aria-expanded', 'true');
    d.body.style.overflow = 'hidden';
  }
  function hide() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    open.setAttribute('aria-expanded', 'false');
    d.body.style.overflow = '';
  }
  open.addEventListener('click', show);
  close.addEventListener('click', hide);
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });

  /* ---------- scroll reveals ---------- */
  var rv = d.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(rv, function (el) { io.observe(el); });
    setTimeout(function () { Array.prototype.forEach.call(rv, function (el) { el.classList.add('is-in'); }); }, 6000);
  } else {
    Array.prototype.forEach.call(rv, function (el) { el.classList.add('is-in'); });
  }

  /* ---------- image load / fail states ---------- */
  Array.prototype.forEach.call(d.querySelectorAll('.ph__img'), function (img) {
    function ok() { img.classList.add('is-in'); }
    function bad() { img.classList.add('is-missing'); }
    if (img.complete) { (img.naturalWidth ? ok : bad)(); }
    else { img.addEventListener('load', ok); img.addEventListener('error', bad); }
  });

  /* ---------- language ---------- */
  var lang = 'sr';
  var srBtn = d.getElementById('langSr');
  var enBtn = d.getElementById('langEn');
  function setLang(next) {
    lang = next;
    Array.prototype.forEach.call(d.querySelectorAll('[data-en]'), function (el) {
      if (!el.dataset.sr) el.dataset.sr = el.textContent;
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.sr;
    });
    srBtn.classList.toggle('is-on', lang === 'sr');
    enBtn.classList.toggle('is-on', lang === 'en');
    d.documentElement.lang = lang === 'en' ? 'en' : 'sr';
    try { localStorage.setItem('lp-lang', lang); } catch (e) {}
    renderBook();
    renderStatus();
  }
  srBtn.addEventListener('click', function () { setLang('sr'); });
  enBtn.addEventListener('click', function () { setLang('en'); });

  /* ---------- open / closed status (Europe/Belgrade) ---------- */
  /* Pon–Sub 08:00–00:00 · Nedelja 14:00–23:00 */
  var HOURS = [[14, 23], [8, 24], [8, 24], [8, 24], [8, 24], [8, 24], [8, 24]]; // 0 = nedelja
  function localNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Belgrade', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      var g = {};
      f.forEach(function (p) { g[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[g.weekday], min: parseInt(g.hour, 10) * 60 + parseInt(g.minute, 10) };
    } catch (e) {
      var n = new Date();
      return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() };
    }
  }
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function statusNow() {
    var t = localNow();
    var h = HOURS[t.day];
    var open = t.min >= h[0] * 60 && t.min < h[1] * 60;
    if (open) {
      return { open: true, closesAt: two(h[1] % 24) + ':00' };
    }
    // next opening: later today, or the following day
    if (t.min < h[0] * 60) return { open: false, opensAt: two(h[0]) + ':00', tomorrow: false };
    var nd = HOURS[(t.day + 1) % 7];
    return { open: false, opensAt: two(nd[0]) + ':00', tomorrow: true };
  }
  function renderStatus() {
    var s = statusNow();
    var en = lang === 'en';
    var main = s.open ? (en ? 'Open now' : 'Trenutno otvoreno') : (en ? 'Currently closed' : 'Trenutno zatvoreno');
    var note = s.open
      ? (en ? 'until ' + s.closesAt : 'do ' + s.closesAt)
      : (en ? (s.tomorrow ? 'opens tomorrow at ' + s.opensAt : 'opens at ' + s.opensAt)
            : (s.tomorrow ? 'otvaramo sutra u ' + s.opensAt : 'otvaramo u ' + s.opensAt));
    var wrap = d.getElementById('status');
    var txt = d.getElementById('statusText');
    var nt = d.getElementById('statusNote');
    if (wrap) wrap.classList.toggle('is-closed', !s.open);
    if (txt) txt.textContent = main;
    if (nt) nt.textContent = '· ' + note;
    var line = d.getElementById('statusLine');
    var lineTxt = d.getElementById('statusLineText');
    if (line) line.classList.toggle('is-closed', !s.open);
    if (lineTxt) lineTxt.textContent = main + ' · ' + note;
  }
  renderStatus();
  setInterval(renderStatus, 60000);

  /* ---------- mobile ticker (duplicate the set for a seamless loop) ---------- */
  var track = d.getElementById('stripTrack');
  if (track) {
    var mqStrip = window.matchMedia('(max-width: 700px)');
    var cloned = false;
    function syncTicker() {
      if (mqStrip.matches && !cloned) {
        var items = Array.prototype.slice.call(track.children);
        items.forEach(function (el) {
          var c = el.cloneNode(true);
          c.setAttribute('aria-hidden', 'true');
          c.removeAttribute('id');
          Array.prototype.forEach.call(c.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
          track.appendChild(c);
        });
        cloned = true;
      }
    }
    syncTicker();
    if (mqStrip.addEventListener) mqStrip.addEventListener('change', syncTicker);
    else mqStrip.addListener(syncTicker);
  }

  /* ---------- menu book ---------- */
  const PAGES = [
    { t: 'Doručak', n: { sr: 'Jutro', en: 'Morning' }, items: [
      { n: 'Omlet sa šunkaricom', p: '520', d: '3 jaja, šunkarica, ajvar, sir' },
      { n: 'Omlet sa sirom', p: '480', d: '3 jaja, sir, ajvar' },
      { n: 'Omlet sa šampinjonima', p: '480', d: '3 jaja, šampinjoni, pavlaka' },
      { n: 'Leskovačka kajgana', p: '520', d: '3 jaja, ajvar, slanina, feta sir, paradajz' },
      { n: 'Jaja na oko', p: '520', d: '3 jaja, šunkarica, ajvar, sir' }
    ]},
    { t: 'Doručak', n: { sr: 'Jutro', en: 'Morning' }, items: [
      { n: 'Jaja na oko sa kobasicom', p: '550', d: '2 jaja, 2 kobasica, ajvar, senf, sir' },
      { n: 'Uštipci', p: '510', d: 'Sir | kajmak | džem | krem' },
      { n: 'Palenta', p: '420', d: 'Kiselo mleko, jogurt' },
      { n: 'Punjene prženice', p: '480', d: 'Hleb, šunkarice, kačkavalj, feta sir' },
      { n: 'Zdravi start', p: '480', d: 'Celo jaje, 2 belanca, šampinjoni, rukola, čeri, feta sir' }
    ]},
    { t: 'Sendviči', n: { sr: 'Sa grila i tosta', en: 'Grilled and toasted' }, items: [
      { n: 'Sendvič sa kobasicom', p: '610', d: 'Roštilj kobasica, prilozi po želji' },
      { n: 'Sendvič piletina', p: '580', d: 'Piletina, tartar sos, zelena salata, paradajz' },
      { n: 'Klub sendvič', p: '600', d: 'Tost hleb, šunkarica, kačkavalj, zelena salata, paradajz, pomfrit, kečap' },
      { n: 'Sendvič La Casa', p: '540', d: 'Šunkarica | mortadela | slanina' }
    ]},
    { t: 'Pizza', n: { sr: 'Iz peći', en: 'From the oven' }, sizes: ['28cm', '32cm', '50cm'], items: [
      { n: 'Margarita', p3: ['730','790','1250'], d: 'Testo, kečap, sir' },
      { n: 'Vegetarijana', p3: ['780','820','1310'], d: 'Testo, kečap, sir, šampinjoni' },
      { n: 'Capricciosa', p3: ['840','910','1400'], d: 'Testo, kečap, sir, šampinjoni, šunka' },
      { n: 'Calcona preklopljena', p3: ['840','910','—'], d: 'Testo, kečap, sir, šampinjoni, šunka' },
      { n: 'Mađarica', p3: ['890','970','1480'], d: 'Testo, kečap, sir, šampinjoni, šunka, feferoni, kulen' },
      { n: 'Capo', p3: ['870','950','1490'], d: 'Testo, kečap, sir, šampinjoni, šunka, jaje' },
      { n: 'Fish', p3: ['880','960','1660'], d: 'Testo, kečap, sir, šampinjoni, tunjevina' }
    ]},
    { t: 'Pizza', n: { sr: 'Iz peći', en: 'From the oven' }, sizes: ['28cm', '32cm', '50cm'], items: [
      { n: 'Frutti di mare', p3: ['910','980','1730'], d: 'Testo, kečap, sir, šampinjoni, tunjevina, masline, dagnje' },
      { n: 'Pizza La Casa', p3: ['940','1000','1640'], d: 'Testo, kečap, sir, šampinjoni, šunka, pršuta, jaje, masline' },
      { n: 'Pršuto', p3: ['940','1000','1640'], d: 'Testo, kečap, sir, šampinjoni, pršuta, masline' },
      { n: 'Pršuto II', p3: ['1050','1120','1830'], d: 'Testo, kečap, sir, šampinjoni, suva pršuta, rukola, čeri' },
      { n: 'Naša zimska pizza', p3: ['—','1350','—'], d: 'Testo, pavlaka, sir, šampinjoni, kulen, ajvar, susam. U letnjoj sezoni nije u ponudi.' }
    ]},
    { t: 'Špagete, njoke, lazanje', n: { sr: 'Testenine', en: 'Pasta' }, items: [
      { n: 'Špagete bolonjeze', p: '890', d: 'Mleveno meso, kečap, origano' },
      { n: 'Špagete carbonara', p: '890', d: 'Pančeta, šampinjoni, pavlaka, crni luk' },
      { n: 'Špagete al amatricana', p: '890', d: 'Pančeta, paradajz, pelat, ljuta paprika' },
      { n: 'Špagete al Tonino', p: '890', d: 'Rigate, tunjevina, šampinjoni, senf' }
    ]},
    { t: 'Špagete, njoke, lazanje', n: { sr: 'Testenine', en: 'Pasta' }, items: [
      { n: 'Njoke bolonjeze', p: '890', d: 'Mleveno meso, kečap, origano' },
      { n: 'Njoke carbonara', p: '890', d: 'Pančeta, šampinjoni, pavlaka, crni luk' },
      { n: 'Njoke sa tri vrste sira', p: '890', d: 'Tri vrste sira, začin, parmezan' },
      { n: 'Lazanje bolonjeze', p: '990', d: 'Mleveno meso, bešamel, sir, paradajz' }
    ]},
    { t: 'Nešto malo drugačije…', n: { sr: 'Iz kuhinje', en: 'From the kitchen' }, items: [
      { n: 'Kolenica u sosu od rena', p: '1220' },
      { n: 'Kolenica u lepinji', p: '970' },
      { n: 'Piletina sa mlincima', p: '1020' },
      { n: 'Pohovani kačkavalj', p: '520' }
    ]},
    { t: 'Salate', n: { sr: 'Sveže i lagano', en: 'Fresh and light' }, items: [
      { n: 'Cezar salata', p: '850', d: 'Piletina, krastavac, paradajz, zelena salata, crni luk, tost, slanina, parmezan, cezar preliv' },
      { n: 'Pileća salata', p: '840', d: 'Belo meso, šampinjoni, zelena salata, majonez, susam' },
      { n: 'Grčka salata', p: '810', d: 'Paradajz, krastavac, masline, paprike, feta sir, origano' },
      { n: 'Vitaminska salata', p: '750', d: 'Krastavac, paradajz, šargarepa, luk, zelena salata, paprika, cezar preliv' },
      { n: 'Salata sa tunjevinom', p: '820' }
    ]},
    { t: 'Sufle, gomboce…', n: { sr: 'Iz rerne', en: 'From the oven' }, items: [
      { n: 'Sufle sa mlevenim mesom', p: '910', d: 'Mleveno meso, šampinjoni, kečap, origano' },
      { n: 'Sufle sa šunkom', p: '910', d: 'Šunka, šampinjoni, kečap, kačkavalj, pavlaka' },
      { n: 'Sufle La Casa', p: '1020', d: 'Piletina, sir, šampinjoni, preliv' },
      { n: 'Gomboce', p: '520', d: 'Knedle sa šljivama' }
    ]},
    { t: 'Slane palačinke', n: { sr: 'Pohovane i slane', en: 'Savoury crêpes' }, items: [
      { n: 'Pohovana palačinka sa sirom', p: '670' },
      { n: 'Pohovana palačinka sa šunkom i sirom', p: '740' },
      { n: 'Pohovana palačinka sa pršutom i sirom', p: '800' },
      { n: 'Slana palačinka sa tunjevinom', p: '620', d: 'Sir, tuna, pavlaka' }
    ]},
    { t: 'Slane palačinke', n: { sr: 'Pohovane i slane', en: 'Savoury crêpes' }, items: [
      { n: 'Slana palačinka vegeterijana', p: '590', d: 'Sir, šampinjoni, pavlaka' },
      { n: 'Slana palačinka Vojvođanka', p: '640', d: 'Slanina, kulen, sir' },
      { n: 'Slana palačinka La Casa', p: '660', d: 'Šunka, sir, kulen, šampinjoni' }
    ]},
    { t: 'Dezerti', n: { sr: 'Palačinke', en: 'Crêpes' }, items: [
      { n: 'Sa džemom', p: '420' },
      { n: 'Sa orasima i medom', p: '500' },
      { n: 'Sa eurokremom i plazmom', p: '510' },
      { n: 'Sa eurokremom, plazmom i bananom', p: '540' },
      { n: 'Sa nutelom i plazmom', p: '600' },
      { n: 'Sa nutelom, plazmom i bananom', p: '640' }
    ]},
    { t: 'Dezerti', n: { sr: 'Palačinke', en: 'Crêpes' }, items: [
      { n: 'Snikers', p: '590', d: 'Kikiriki, med, čokolada' },
      { n: 'Snickers II', p: '640' },
      { n: 'Kinder Bueno', p: '640' },
      { n: 'Oreo', p: '640' },
      { n: 'Raffaello', p: '640' },
      { n: 'Dubai', p: '910' },
      { n: 'Švarcvald', p: '640' }
    ]},
    { t: 'Dezerti', n: { sr: 'Iz vitrine', en: 'From the case' }, items: [
      { n: 'Voćna salata', p: '550' },
      { n: 'Sladoled', p: '420' },
      { n: 'Banana split', p: '550' }
    ]}
  ];

    // Mobile: one page per leaf at a FIXED height. Categories are merged back
    // together (desktop pre-splits them), then balanced across as many pages as
    // they need so no page is left with a lone item.
    function mCost(it) { return 1 + (it.d ? 1 : 0) + (it.sub ? it.sub.length : 0); }
    var MOB_BUDGET = 9;
    var MOBILE_PAGES = (function () {
      var cats = [], out = [];
      for (var i = 0; i < PAGES.length; i++) {
        var p = PAGES[i], last = cats[cats.length - 1];
        if (last && last.t === p.t) last.items = last.items.concat(p.items);
        else cats.push({ t: p.t, n: p.n, sizes: p.sizes, items: p.items.slice() });
      }
      for (var k = 0; k < cats.length; k++) {
        var cat = cats[k];
        var budget = cat.sizes ? MOB_BUDGET - 2 : MOB_BUDGET;
        var total = 0;
        for (var m = 0; m < cat.items.length; m++) total += mCost(cat.items[m]);
        var n = Math.max(1, Math.ceil(total / budget));
        var per = Math.ceil(cat.items.length / n);
        for (var q = 0; q < cat.items.length; q += per) {
          out.push({ t: cat.t, n: cat.n, sizes: cat.sizes, items: cat.items.slice(q, q + per) });
        }
      }
      return out;
    })();
    var MFONT = "'Playfair Display',Georgia,serif";
    function mPrice(v, mob) {
      return '<span style="font-family:Jost,sans-serif;font-weight:400;font-size:' + (mob ? '18px' : '18px') + ';font-variant-numeric:tabular-nums;white-space:nowrap">' + v + '</span>';
    }
    function mPrice3(arr, mob) {
      var out = '';
      for (var k = 0; k < arr.length; k++) {
        out += '<span style="font-family:Jost,sans-serif;font-weight:400;font-size:' + (mob ? '16px' : '17px') + ';font-variant-numeric:tabular-nums;min-width:' + (mob ? '46px' : '62px') + ';text-align:right">' + arr[k] + '</span>';
      }
      return out;
    }
    function mItem(it, mob, dense) {
      var nameSize = dense ? '21px' : '22px';
      var descSize = dense ? '12.5px' : (mob ? '14px' : '13.5px');
      var s = '<div style="padding:' + (dense ? '7px 0' : (mob ? '9px 0' : '8px 0')) + ';border-bottom:1px solid rgba(23,22,20,.1)">';
      s += '<div style="display:flex;align-items:baseline;gap:8px">';
      s += '<span style="font-family:' + MFONT + ';font-size:' + nameSize + ';line-height:1.15">' + it.n + '</span>';
      s += '<span style="flex:1;border-bottom:1px dotted rgba(23,22,20,.26);transform:translateY(-4px);min-width:12px"></span>';
      if (it.p3) s += mPrice3(it.p3, mob); else if (it.p) s += mPrice(it.p, mob);
      s += '</div>';
      if (it.d) s += '<div style="font-size:' + descSize + ';line-height:1.5;letter-spacing:.01em;color:rgba(23,22,20,.62);margin-top:2px;max-width:46ch">' + it.d + '</div>';
      if (it.sub) {
        for (var j = 0; j < it.sub.length; j++) {
          s += '<div style="display:flex;align-items:baseline;gap:8px;padding-top:4px">' +
            '<span style="font-size:' + (mob ? '15px' : '15px') + ';color:rgba(23,22,20,.7)">' + it.sub[j][0] + '</span>' +
            '<span style="flex:1;border-bottom:1px dotted rgba(23,22,20,.2);transform:translateY(-3px);min-width:12px"></span>' +
            mPrice(it.sub[j][1], mob) + '</div>';
        }
      }
      return s + '</div>';
    }
    function mPage(p, en, mob) {
      var head = '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px">' +
        '<span style="font-family:' + MFONT + ';font-size:' + (mob ? '31px' : 'clamp(27px,3vw,40px)') + ';line-height:1">' + p.t + '</span>' +
        '<span style="font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(23,22,20,.5)">' + (en ? p.n.en : p.n.sr) + '</span></div>' +
        '<div style="height:1px;background:rgba(23,22,20,.2)"></div>';
      if (p.sizes) {
        var sizes = Array.isArray(p.sizes) ? p.sizes : ['\u00d822', '\u00d826', '\u00d832'];
        var hdr = '';
        for (var h = 0; h < sizes.length; h++) {
          hdr += '<span style="font-family:Jost,sans-serif;font-size:' + (mob ? '10px' : '11.5px') + ';letter-spacing:.1em;color:rgba(23,22,20,.5);min-width:' +
            (mob ? '46px' : '62px') + ';text-align:right;white-space:nowrap">' + sizes[h] + '</span>';
        }
        head += '<div style="display:flex;align-items:baseline;gap:8px;padding-bottom:2px"><span style="flex:1"></span>' + hdr + '</div>';
      }
      var rows = '';
      var dense = p.items.length >= 6;
    for (var i = 0; i < p.items.length; i++) rows += mItem(p.items[i], mob, dense);
      var fine = '';
      return '<div style="height:100%;display:grid;align-content:start;gap:' + (mob ? '10px' : '9px') + '">' + head + '<div>' + rows + '</div>' + fine + '</div>';
    }
    function mCover(en) {
      return '<div style="height:100%;display:grid;align-content:center;justify-items:center;gap:18px;text-align:center">' +
        '<span style="font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:rgba(23,22,20,.45)">Vojvo\u0111anska 2, In\u0111ija</span>' +
        '<span style="font-family:' + MFONT + ';font-size:clamp(30px,4.4vw,58px);line-height:.95">Il Men\u00f9</span>' +
        '<span style="display:inline-flex;height:2px;width:52px;background:linear-gradient(90deg,#128a3e 0 33%,#d8d5cf 33% 66%,#e0121b 66% 100%)"></span>' +
        '<span style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(23,22,20,.5)">Caffe Pizzeria</span>' +
        '<span style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(23,22,20,.35)">' + (en ? 'Prices in RSD' : 'Cene u dinarima') + '</span></div>';
    }

  var book = d.getElementById('book');
  var spread = d.getElementById('spread');
  var pageL = d.getElementById('pageL');
  var pageR = d.getElementById('pageR');
  var leaf = d.getElementById('leaf');
  var leafFront = d.getElementById('leafFront');
  var leafBack = d.getElementById('leafBack');
  var label = d.getElementById('pageLabel');
  var index = 0, flipping = false, raf = null, timer = null;

  function single() { return window.matchMedia('(max-width: 700px)').matches; }
  function pageCount() { return (single() ? MOBILE_PAGES.length : PAGES.length) + 1; }
  function total() { return single() ? pageCount() : Math.ceil((pageCount() + 1) / 2); }

  function pageHTML(i) {
    var en = lang === 'en';
    var mob = single();
    if (i === 0) return mCover(en);
    var list = mob ? MOBILE_PAGES : PAGES;
    var p = list[i - 1];
    if (!p) return '';
    return mPage(p, en, mob);
  }

  function renderBook(idx) {
    var s = idx == null ? index : idx;
    if (single()) { pageL.innerHTML = ''; pageR.innerHTML = pageHTML(s); }
    else { pageL.innerHTML = s === 0 ? '' : pageHTML(s * 2 - 1); pageR.innerHTML = pageHTML(s * 2); }
    label.textContent = (lang === 'en' ? (single() ? 'Page ' : 'Spread ') : (single() ? 'Strana ' : 'List ')) +
      (s + 1) + ' / ' + total();
  }

  function turn(dir) {
    if (flipping) return;
    var next = index + dir;
    if (next < 0 || next > total() - 1) return;
    var mob = single();
    if (reduce) { index = next; renderBook(); return; }
    flipping = true;
    var a0 = dir > 0 ? 0 : -176, a1 = dir > 0 ? -176 : 0;
    leafFront.innerHTML = pageHTML(dir > 0 ? (mob ? index : index * 2) : (mob ? next : next * 2));
    leafBack.innerHTML = pageHTML(dir > 0 ? (mob ? next : next * 2 - 1) : (mob ? index : index * 2 - 1));
    leaf.style.willChange = 'transform';
    leaf.style.transform = 'rotateY(' + a0 + 'deg)';
    leaf.style.opacity = '1';
    void leaf.offsetWidth;
    var DUR = 720, t0 = null;
    function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function finish() {
      if (!flipping) return;
      flipping = false;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(timer);
      leaf.style.opacity = '0';
      leaf.style.willChange = 'auto';
      leaf.style.transform = 'rotateY(0deg)';
      index = next;
    }
    function step(ts) {
      if (!flipping) return;
      if (t0 === null) { t0 = ts; index = next; renderBook(next); }
      var q = Math.min(1, (ts - t0) / DUR);
      leaf.style.transform = 'rotateY(' + (a0 + (a1 - a0) * ease(q)) + 'deg)';
      if (q < 1) raf = requestAnimationFrame(step); else finish();
    }
    raf = requestAnimationFrame(step);
    timer = setTimeout(finish, DUR + 400);
  }

  d.getElementById('nextPage').addEventListener('click', function () { turn(1); });
  d.getElementById('prevPage').addEventListener('click', function () { turn(-1); });
  book.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft') turn(-1);
  });
  var mq = window.matchMedia('(max-width: 700px)');
  var onMq = function () { if (index > total() - 1) index = 0; renderBook(); };
  if (mq.addEventListener) mq.addEventListener('change', onMq); else mq.addListener(onMq);

  try {
    var saved = localStorage.getItem('lp-lang');
    if (saved === 'en') { setLang('en'); } else { renderBook(); }
  } catch (e) { renderBook(); }
})();
