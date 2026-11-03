/* TUARAI - ช่วยให้กดง่ายขึ้น: ถ้าแตะพลาดใกล้ๆ ปุ่ม/ของที่กดได้ (ในรัศมีประมาณ 1 ปลายนิ้ว) ให้ถือว่ากดปุ่มนั้น */
(function () {
  'use strict';
  var SEL = 'button, a[href], [role="button"], [data-photo], [data-letter], [data-tree], .candle, .balloon, .lantern, .pkey, .planet, .hang-lantern, .branch, .moon-orb, .spirit, .pond, .stamp-btn, .cta';
  var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  var R = coarse ? 36 : 22;
  function usable(el) {
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function pointerish(el) {
    try { return getComputedStyle(el).cursor === 'pointer'; } catch (e) { return false; }
  }
  function dist(el, x, y) {
    var r = el.getBoundingClientRect();
    var dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom);
    return Math.hypot(dx, dy);
  }
  document.addEventListener('click', function (e) {
    if (!e.isTrusted || e.defaultPrevented) return;
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest(SEL + ', input, textarea, select, label') || pointerish(t)) return;
    var x = e.clientX, y = e.clientY;
    if (!x && !y) return;
    var best = null, bd = 1e9, seen = [];
    var offs = [[0, 0]];
    [R * .5, R].forEach(function (d) { for (var a = 0; a < 8; a++) offs.push([Math.cos(a * Math.PI / 4) * d, Math.sin(a * Math.PI / 4) * d]); });
    offs.forEach(function (o) {
      var list = document.elementsFromPoint(x + o[0], y + o[1]);
      for (var i = 0; i < list.length; i++) {
        var el = list[i].closest ? list[i].closest(SEL) : null;
        if (!el && pointerish(list[i])) el = list[i];
        if (el && seen.indexOf(el) < 0) { seen.push(el); }
        if (el) break;
      }
    });
    seen.forEach(function (el) { if (!usable(el)) return; var d = dist(el, x, y); if (d <= R && d < bd) { bd = d; best = el; } });
    if (best && !best.closest('.overlay:not(.open)')) { e.preventDefault(); e.stopPropagation(); best.click(); }
  }, true);
})();
