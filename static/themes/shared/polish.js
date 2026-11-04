/* TUARAI - เอฟเฟกต์เสริมงานดีไซน์: ฟิล์มเกรน แสงขอบจอ แถบความคืบหน้าการเลื่อน ประกายตามเมาส์ (เฉพาะคอม) */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function add(cls) { var d = document.createElement('div'); d.className = cls; d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d); return d; }
  function init() {
    if (!reduce) add('pl-grain');
    add('pl-vig');
    var bar = add('pl-prog'), ticking = false;
    function upd() {
      ticking = false;
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });

    // ใส่ลำดับให้ของที่โผล่ในกลุ่มเดียวกัน เพื่อให้ไล่ทีละชิ้น
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.style.getPropertyValue('--i')) return;
      var sibs = [].filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
      el.style.setProperty('--i', sibs.indexOf(el));
    });

    // ประกายตามเมาส์ (เฉพาะคอมที่มีเมาส์จริง)
    if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var cv = document.createElement('canvas'); cv.className = 'pl-trail'; document.body.appendChild(cv);
    var cx = cv.getContext('2d'), parts = [], raf = null, col = '#ffd479';
    function fit() { cv.width = innerWidth; cv.height = innerHeight; }
    fit(); addEventListener('resize', fit);
    function loop() {
      cx.clearRect(0, 0, cv.width, cv.height);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i]; p.life -= 1; p.x += p.vx; p.y += p.vy; p.vy += .02;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        cx.globalAlpha = p.life / p.max * .8; cx.fillStyle = col;
        cx.beginPath(); cx.arc(p.x, p.y, p.r * (p.life / p.max), 0, 6.3); cx.fill();
      }
      raf = parts.length ? requestAnimationFrame(loop) : null;
      if (!raf) cx.clearRect(0, 0, cv.width, cv.height);
    }
    var lx = 0, ly = 0;
    addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch' || document.body.classList.contains('no-scroll')) return;
      if (Math.hypot(e.clientX - lx, e.clientY - ly) < 14) return;
      lx = e.clientX; ly = e.clientY;
      col = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || col;
      for (var k = 0; k < 2; k++) parts.push({ x: lx, y: ly, vx: (Math.random() - .5) * .8, vy: (Math.random() - .5) * .8 - .2, r: 1.2 + Math.random() * 2.2, life: 34, max: 34 });
      if (parts.length > 70) parts.splice(0, parts.length - 70);
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
