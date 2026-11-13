/* TUARAI - สไลด์หน้าแรก: ปุ่มซ้าย/ขวา แถบความคืบหน้า ลากด้วยเมาส์ได้ */
(function () {
  document.querySelectorAll('.rail-sec').forEach(function (sec) {
    var rail = sec.querySelector('[data-rail]'), prev = sec.querySelector('.prev'), next = sec.querySelector('.next'), bar = sec.querySelector('.rail-bar span');
    if (!rail) return;
    function step() { var c = rail.querySelector('.hc'); return c ? c.getBoundingClientRect().width + 26 : 320; }
    function upd() {
      var max = rail.scrollWidth - rail.clientWidth, p = max > 0 ? rail.scrollLeft / max : 0;
      if (bar) { var w = Math.max(.12, rail.clientWidth / rail.scrollWidth); bar.style.width = (w * 100) + '%'; bar.style.transform = 'translateX(' + (p * (1 / w - 1) * 100) + '%)'; }
      if (prev) prev.disabled = rail.scrollLeft < 8;
      if (next) next.disabled = rail.scrollLeft > max - 8;
    }
    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step() * 2, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: step() * 2, behavior: 'smooth' }); });
    rail.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd); upd();
    // ลากด้วยเมาส์
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.target.closest('a,button')) return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; rail.style.scrollSnapType = 'none'; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var d = e.clientX - sx; if (Math.abs(d) > 4) moved = true; rail.scrollLeft = sl - d; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; rail.style.scrollSnapType = ''; });
  });
})();

/* กองไพ่: แตะ/ปัดไพ่ใบหน้า = ไปท้ายกอง, ปุ่มลูกศรสลับไปมา */
(function () {
  document.querySelectorAll('[data-deck]').forEach(function (deck) {
    var col = deck.closest('.deck-col'), items = [].slice.call(deck.querySelectorAll('.hc')), n = items.length;
    var cnt = col.querySelector('.deck-count b'), orig = items.slice(), busy = false;
    function render() {
      items.forEach(function (el, i) { el.style.setProperty('--pos', i); el.setAttribute('data-pos', i); });
      if (cnt) cnt.textContent = orig.indexOf(items[0]) + 1;
    }
    function next() {
      if (busy || n < 2) return; busy = true;
      var f = items[0]; f.classList.add('fly');
      setTimeout(function () { items.push(items.shift()); render(); f.classList.remove('fly'); setTimeout(function () { busy = false; }, 380); }, 300);
    }
    function prev() {
      if (busy || n < 2) return; busy = true;
      var l = items.pop(); l.classList.add('jump'); items.unshift(l);
      void l.offsetWidth; l.classList.remove('jump');
      render(); setTimeout(function () { busy = false; }, 420);
    }
    function bring(el) { // เอาไพ่ใบที่แตะขึ้นมาหน้าสุด
      var k = items.indexOf(el); if (k < 1) return;
      var go = function () { if (items.indexOf(el) > 0) { next(); setTimeout(go, 330); } }; go();
    }
    render();
    col.querySelector('.dnext').addEventListener('click', next);
    col.querySelector('.dprev').addEventListener('click', prev);
    items.forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        if (el.__drag) { el.__drag = false; return; }
        if (items[0] === el) next(); else bring(el);
      });
    });
    // ปัดซ้าย/ขวาบนไพ่
    var sx = null;
    deck.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    deck.addEventListener('pointerup', function (e) {
      if (sx === null) return; var d = e.clientX - sx; sx = null;
      if (Math.abs(d) > 50) { items[0].__drag = true; d < 0 ? next() : prev(); }
    });
  });
})();

/* กลีบดอกไม้ร่วงในกรอบการ์ด */
(function () {
  try {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.steps3 li, .pkg-wrap .package-card').forEach(function (card) {
      for (var i = 0; i < 6; i++) {
        var s = document.createElement('span');
        s.className = 'fl-petal';
        s.style.setProperty('--x', (8 + Math.random() * 80).toFixed(0) + '%');
        s.style.setProperty('--sz', (8 + Math.random() * 7).toFixed(0) + 'px');
        s.style.setProperty('--sw', ((Math.random() - .5) * 60).toFixed(0) + 'px');
        s.style.setProperty('--dur', (6 + Math.random() * 5).toFixed(1) + 's');
        s.style.setProperty('--dl', (-Math.random() * 9).toFixed(1) + 's');
        card.insertBefore(s, card.firstChild);
      }
    });
  } catch (e) {}
})();
