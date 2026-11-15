(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD;
  var rowsEl = document.getElementById('rows'), pool = [].slice.call(document.querySelectorAll('.pool [data-photo]'));
  var NOTES = ['วันที่เราเจอกัน', 'รอยยิ้มที่ฉันชอบที่สุด', 'มื้อนี้อร่อยเพราะมีเธอ', 'วันที่ฝนตกแต่ใจอบอุ่น', 'ถ่ายรูปคู่กันครั้งแรก', 'เซอร์ไพรส์เล็กๆ ที่ไม่ลืม', 'วันธรรมดาที่พิเศษเพราะเธอ', 'ทริปที่อยากกลับไปอีก'];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var COL = ['#f4a3b6', '#f7cf7a', '#9fd0e8', '#c4a8e6', '#9fd8bd', '#f8b48e'];
  function bunting(el) {
    var n = 14, s = '<svg viewBox="0 0 700 54" preserveAspectRatio="none"><path d="M0 6 Q350 30 700 6" stroke="#b79778" stroke-width="2" fill="none"/>';
    for (var i = 0; i < n; i++) { var x = 22 + i * 49, y = 6 + 24 * Math.sin(Math.PI * (x / 700)) * .98; s += '<path d="M' + (x - 16) + ' ' + (y - 1) + ' L' + (x + 16) + ' ' + (y - 1) + ' L' + x + ' ' + (y + 30) + 'Z" fill="' + COL[i % 6] + '"/>'; }
    el.innerHTML = s + '</svg>';
  }
  bunting(document.getElementById('bunt0')); bunting(document.getElementById('bunt1'));
  document.getElementById('gTrio').innerHTML = D.balloon(0) + D.balloon(1) + D.balloon(2);
  document.getElementById('cakeArt').innerHTML = '<svg class="doo" viewBox="0 0 200 170" aria-hidden="true">' +
    '<ellipse cx="100" cy="160" rx="84" ry="8" fill="#7a5222" opacity=".13"/>' +
    '<path d="' + D.scal(100, 132, 82, 28, 22) + '" fill="#f7b7c9"/><path d="M20 120 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 v-14 h-160z" fill="#fff6f0"/>' +
    '<path d="' + D.scal(100, 92, 60, 24, 18) + '" fill="#f9dc97"/><path d="M44 84 q8 12 16 0 q8 12 16 0 q8 12 16 0 q8 12 16 0 q8 12 16 0 q8 12 16 0 q8 12 16 0 v-12 h-112z" fill="#fff6f0"/>' +
    '<path d="' + D.scal(100, 58, 38, 20, 14) + '" fill="#b6e3d3"/><path d="M64 52 q6 10 12 0 q6 10 12 0 q6 10 12 0 q6 10 12 0 q6 10 12 0 v-10 h-60z" fill="#fff6f0"/>' +
    '<g transform="translate(100 28)"><path d="M0 8 C-12 -2 -7 -12 0 -5 C7 -12 12 -2 0 8Z" fill="#e8788c"/></g>' +
    '<circle cx="46" cy="136" r="4" fill="#fff"/><circle cx="76" cy="144" r="4" fill="#f9dc97"/><circle cx="124" cy="144" r="4" fill="#b6e3d3"/><circle cx="154" cy="136" r="4" fill="#fff"/></svg>';
  var N = Math.ceil(P.length / 2), per = window.innerWidth >= 900 ? 3 : 1, popped = 0;
  function cnt() { document.getElementById('bCount').textContent = '(' + popped + '/' + N + ')'; }
  cnt();
  for (var s = 0; s < N; s += per) {
    var row = document.createElement('div'); row.className = 'row';
    var bals = '<div class="bals">', line = '<div class="line">';
    for (var k = s; k < Math.min(N, s + per); k++) {
      var side = per === 1 ? (k % 2 ? 68 : 32) : null;
      bals += '<button class="bal" type="button" data-k="' + k + '" style="--dl:' + (-(k * 0.9)).toFixed(1) + 's' + (side ? ';margin-left:' + (side - 50) + '%' : '') + '" aria-label="ลูกโป่งลูกที่ ' + (k + 1) + '">' + D.balloon(k) + '<span class="hintd">แตะ</span></button>';
      [k * 2, k * 2 + 1].forEach(function (i, n) {
        if (!P[i]) return;
        var span = per === 1 ? [18, 58] : [0, 0];
        var left = per === 1 ? span[n] : ((k - s) * (100 / per) + (n ? 16 : 1));
        line += '<div class="slot" data-k="' + k + '" data-i="' + i + '" style="left:' + left + '%;--r:' + (n ? 3 : -3.5) + 'deg;--d:' + (n * .18) + 's"><span class="pg"></span><figure><div class="ph" style="background-image:url(\'' + esc(P[i].src) + '\')"></div><figcaption>' + esc(P[i].cap || NOTES[i % NOTES.length]) + '</figcaption></figure></div>';
      });
    }
    row.innerHTML = bals + '</div>' + line + '</div>'; rowsEl.appendChild(row);
  }
  function pop(b) {
    var k = +b.getAttribute('data-k'); if (b.classList.contains('pop')) return;
    b.classList.add('pop'); popped++; cnt();
    var r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .35;
    if (window.TUSfx) TUSfx.play('pop');
    if (window.TUFx) TUFx.confetti(cx, cy, 46, COL);
    if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
    setTimeout(function () { b.style.visibility = 'hidden'; }, 220);
    [].forEach.call(b.closest('.row').querySelectorAll('.slot[data-k="' + k + '"]'), function (sl) { setTimeout(function () { sl.classList.add('on'); if (window.TUSfx) TUSfx.play('drop'); }, 260); });
    if (popped >= N) setTimeout(allDone, 900);
  }
  function allDone() {
    document.getElementById('cakeArt').classList.add('lit');
    document.getElementById('cakeNote').textContent = 'ครบทุกลูกแล้ว! เค้กพร้อมให้ตัดแล้ว';
    if (window.TUToast) TUToast('แตกครบทุกลูกแล้ว!'); if (window.TUFx) TUFx.rain ? TUFx.rain(5) : 0;
  }
  rowsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.bal'); if (b) { pop(b); return; }
    var sl = e.target.closest('.slot.on'); if (sl && pool[+sl.getAttribute('data-i')]) pool[+sl.getAttribute('data-i')].click();
  });
})();
