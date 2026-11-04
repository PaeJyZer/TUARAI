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
