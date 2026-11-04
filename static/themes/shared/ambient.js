/* TUARAI - เสียงประกอบกลางสำหรับทุกธีม (สังเคราะห์ด้วย WebAudio ไม่ใช้ไฟล์เสียง/เพลงของใคร)
   เปิดเว็บ / เลื่อนหน้า / ของโผล่ / กดรูป / เปิดปิดหน้าต่าง / กดปุ่ม  ธีมพรีเมียมมีเสียงของตัวเองอยู่แล้ว จึงข้ามส่วนทั่วไป */
(function () {
  'use strict';
  function init() {
    var S = window.TUSfx; if (!S) return;
    var premium = document.querySelectorAll('script[src*="premium.js"]').length > 1;
    if (premium) return;
    var cls = document.body.className;
    var TAP = /theme-(pixel|y2k)/.test(cls) ? 'blip' : /theme-cinema/.test(cls) ? 'ratchet' : /theme-(diary|envelope)/.test(cls) ? 'soft' : 'tap';
    var last = {};
    function ok(k, gap) { var t = Date.now(); if (last[k] && t - last[k] < gap) return false; last[k] = t; return true; }
    function play(n, a, k, gap) { if (ok(k || n, gap || 0)) S.play(n, a); }

    document.addEventListener('tu:opening', function () { play('whoosh'); });
    document.addEventListener('tu:opened', function () { play('unlock'); setTimeout(function () { play('sparkle'); }, 260); });

    // เลื่อนหน้า = เสียงลมกระดาษเบาๆ ตามความเร็ว
    var sy = window.scrollY, st = 0;
    window.addEventListener('scroll', function () {
      var d = Math.abs(window.scrollY - sy); sy = window.scrollY;
      if (d < 36 || document.body.classList.contains('no-scroll') || !document.body.classList.contains('opened')) return;
      if (!ok('scroll', 420)) return;
      S.noise({ f: 700 + Math.min(d, 400) * 5, to: 380, d: .28, v: Math.min(.05, .018 + d / 9000), ft: 'lowpass', q: .3, a: .06 });
    }, { passive: true });

    // ของที่ค่อยๆ โผล่ตอนเลื่อนถึง = เสียงเม็ดเล็กๆ
    var mo = new MutationObserver(function (list) {
      list.forEach(function (m) {
        var el = m.target;
        if (m.attributeName !== 'class' || !el.classList) return;
        var had = (m.oldValue || '').split(/\s+/).indexOf('in') >= 0;
        if (el.classList.contains('reveal') && el.classList.contains('in') && !had) {
          if (ok('rev', 140)) S.tone({ f: 660 + Math.random() * 520, d: .16, v: .05, a: .004, type: 'sine' });
        }
        if (el.classList.contains('overlay')) {
          var was = m.oldValue ? m.oldValue.split(' ').indexOf('open') >= 0 : false, now = el.classList.contains('open');
          if (now && !was && el.id !== 'letterOverlay') play('page', 0, 'ov', 200);
          if (!now && was) play('soft', 0, 'ovc', 200);
        }
      });
    });
    mo.observe(document.body, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['class'] });

    // กดอะไรก็มีเสียง
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target : null; if (!t) return;
      if (t.closest('.sfx-btn')) return;
      if (t.closest('[data-photo]')) { play('drop', 0, 'ph', 120); return; }
      if (t.closest('.lb-nav')) { play('page', 0, 'nav', 100); return; }
      if (t.closest('[data-close]')) return;
      if (t.closest('button, a[href], [role="button"], [data-letter]')) play(TAP, 0, 'btn', 80);
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
