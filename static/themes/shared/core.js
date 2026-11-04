/* =========================================
   TUARAI - ตัวช่วยกลางของธีมใหม่
   ปุ่มกดเปิด / เลื่อนแล้วรูปค่อยโผล่ / ดูรูปใหญ่ / จดหมายพิมพ์ทีละตัว / ตัวนับเวลา
   ไม่มีเสียงเพลง
   ========================================= */
(function () {
  'use strict';
  var CFG = window.SITE_CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };
  var body = document.body;

  var START = new Date((CFG.startDate || '') + 'T00:00:00');
  if (isNaN(START.getTime())) START = new Date();
  var TEXT = String(CFG.letterText || '').replace(/\r\n/g, '\n');
  var SIGN = CFG.letterSign || '';
  var TYPE_SPEED = 90;

  /* ---------- ปุ่มกดเปิด ---------- */
  var gate = document.querySelector('[data-gate]');
  var gateBox = $('gate');
  var opened = false;

  function openSite() {
    if (opened) return;
    opened = true;
    body.classList.add('opening');
    document.dispatchEvent(new CustomEvent('tu:opening'));
    var delay = gate ? Number(gate.getAttribute('data-delay')) || 1100
      : manual ? Number(manual.getAttribute('data-manual-gate')) || 900 : 0;
    setTimeout(function () {
      body.classList.add('opened');
      if (gateBox) gateBox.classList.add('gone');
      window.scrollTo(0, 0);
      watchReveal();
      document.dispatchEvent(new CustomEvent('tu:opened'));
    }, delay);
  }
  // ธีมที่เปิดด้วยวิธีพิเศษ (พิมพ์วันที่ / ขูด / ลากพระอาทิตย์) ใส่ data-manual-gate แล้วเรียก window.TU_OPEN()
  var manual = document.querySelector('[data-manual-gate]');
  window.TU_OPEN = openSite;
  if (gate) gate.addEventListener('click', openSite);
  else if (!manual) { body.classList.add('opened'); opened = true; }

  /* ---------- เลื่อนถึงแล้วค่อยโผล่ ---------- */
  var io = null;
  function watchReveal() {
    var els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
    }
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- overlay ---------- */
  var letterOv = $('letterOverlay');
  var lightbox = $('lightbox');

  function openOverlay(ov) { ov.classList.add('open'); body.classList.add('no-scroll'); }
  function closeOverlay(ov) {
    ov.classList.remove('open');
    if (!document.querySelector('.overlay.open')) body.classList.remove('no-scroll');
    if (ov === letterOv) { stopLetter(); if (window.TULetterFX) TULetterFX.reset(); }
  }
  document.querySelectorAll('.overlay').forEach(function (ov) {
    ov.addEventListener('click', function (e) {
      if (e.target === ov || e.target.closest('[data-close]')) closeOverlay(ov);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.querySelectorAll('.overlay.open').forEach(closeOverlay);
    if (lightbox.classList.contains('open')) {
      if (e.key === 'ArrowLeft') showPhoto(cur - 1);
      if (e.key === 'ArrowRight') showPhoto(cur + 1);
    }
  });

  /* ---------- จดหมาย + ตัวนับเวลา ---------- */
  var typed = $('letterTyped'), rest = $('letterRest'), signEl = $('letterSign'), counter = $('dayCounter');
  var typeTimer = null, counterTimer = null;
  var pad2 = function (n) { return String(n).padStart(2, '0'); };

  function ageCells() {
    var now = new Date(), y = now.getFullYear() - START.getFullYear(), m = now.getMonth() - START.getMonth(), d = now.getDate() - START.getDate();
    if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    var cell = function (n, l) { return '<div class="cell"><span class="num">' + n + '</span><span class="lab">' + l + '</span></div>'; };
    return cell(Math.max(0, y), 'Years') + cell(m, 'Months') + cell(d, 'Days') + cell(pad2(now.getHours()), 'Hours');
  }

  function updateCounter() {
    if (CFG.mode === 'age') { counter.innerHTML = ageCells(); return; }
    var total = Math.floor(Math.max(0, Date.now() - START.getTime()) / 1000);
    var d = Math.floor(total / 86400), h = Math.floor((total % 86400) / 3600);
    var m = Math.floor((total % 3600) / 60), s = total % 60;
    var cell = function (n, l) { return '<div class="cell"><span class="num">' + n + '</span><span class="lab">' + l + '</span></div>'; };
    counter.innerHTML = cell(d, 'Days') + cell(pad2(h), 'Hours') + cell(pad2(m), 'Min') + cell(pad2(s), 'Sec');
  }

  function startLetter() {
    stopLetter();
    updateCounter();
    counterTimer = setInterval(updateCounter, 1000);
    signEl.textContent = SIGN;
    signEl.classList.remove('show');
    typed.textContent = '';
    rest.textContent = TEXT;
    var n = 0;
    typeTimer = setTimeout(function tick() {
      n += 1;
      typed.textContent = TEXT.slice(0, n);
      rest.textContent = TEXT.slice(n);
      document.dispatchEvent(new CustomEvent('tu:type'));
      if (n >= TEXT.length) { typeTimer = null; signEl.classList.add('show'); document.dispatchEvent(new CustomEvent('tu:letterdone')); return; }
      typeTimer = setTimeout(tick, TYPE_SPEED);
    }, 600);
  }
  function stopLetter() {
    clearTimeout(typeTimer); clearInterval(counterTimer);
    typeTimer = null; counterTimer = null;
  }
  // แตะที่จดหมายระหว่างพิมพ์ = แสดงทั้งหมดทันที
  letterOv.querySelector('.letter-card').addEventListener('click', function (e) {
    if (e.target.closest('[data-close]') || !typeTimer) return;
    clearTimeout(typeTimer); typeTimer = null;
    typed.textContent = TEXT; rest.textContent = '';
    signEl.classList.add('show');
  });
  function showLetter() {
    openOverlay(letterOv);
    // ธีมที่มีฉากแตะก่อน (ซอง/กล่องของขวัญ ฯลฯ): ค่อยเริ่มจดหมายหลังผู้ใช้แตะ
    if (window.TULetterFX) {
      TULetterFX.intro(function () { startLetter(); document.dispatchEvent(new CustomEvent('tu:letter')); });
      return;
    }
    startLetter(); document.dispatchEvent(new CustomEvent('tu:letter'));
  }
  window.TUOverlay = { open: openOverlay, close: closeOverlay };
  document.querySelectorAll('[data-letter]').forEach(function (b) {
    b.addEventListener('click', function () {
      // ถ้าธีมมีเกม ให้เล่น (หรือข้าม) ก่อน แล้วค่อยเปิดจดหมาย
      if (window.TUGame && window.TUGame.shouldRun()) window.TUGame.run(showLetter);
      else showLetter();
    });
  });

  /* ---------- ดูรูปใหญ่ ---------- */
  var photos = [].slice.call(document.querySelectorAll('[data-photo]'));
  var lbImg = $('lbImg'), lbCount = $('lbCount');
  var cur = 0;
  var NOTES = CFG.captions || {};
  function noteFor(src) {
    if (NOTES[src]) return NOTES[src];
    try { var p = new URL(src, location.href).pathname; if (NOTES[p]) return NOTES[p]; } catch (e) {}
    return '';
  }
  function showPhoto(i) {
    cur = (i + photos.length) % photos.length;
    var img = photos[cur].querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbCount.textContent = (cur + 1) + ' / ' + photos.length;
    var note = noteFor(img.getAttribute('src') || img.src), nEl = $('lbNote');
    if (nEl) { nEl.textContent = note; nEl.classList.toggle('has', !!note); }
  }
  photos.forEach(function (p, i) {
    p.addEventListener('click', function () { showPhoto(i); openOverlay(lightbox); });
  });
  $('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); showPhoto(cur - 1); });
  $('lbNext').addEventListener('click', function (e) { e.stopPropagation(); showPhoto(cur + 1); });
  var tx = null;
  lightbox.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) showPhoto(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
