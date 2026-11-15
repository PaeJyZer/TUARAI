(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD, sfx = function (n) { if (window.TUSfx) TUSfx.play(n); };
  var $ = function (id) { return document.getElementById(id); };
  var NC = ['#ff4fa0', '#5ff0ff', '#b57bff', '#ffd23f', '#6dff9c', '#ff8a4f'];
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '%27' }[c]; }); };
  /* หลอดนีออนลายเส้น 6 แบบ */
  var TUBE = [
    '<path d="M50 84 C10 56 8 24 30 18 C42 16 50 26 50 30 C50 26 58 16 70 18 C92 24 90 56 50 84Z"/>',
    '<path d="M50 8 L61 38 L92 40 L68 58 L77 90 L50 72 L23 90 L32 58 L8 40 L39 38Z"/>',
    '<path d="M28 10 H72 C72 40 62 54 50 56 C38 54 28 40 28 10Z M50 56 V86 M34 90 H66"/>',
    '<path d="M70 12 C40 14 22 36 30 62 C38 84 66 90 84 76 C60 74 50 52 70 12Z"/>',
    '<circle cx="50" cy="50" r="12"/><path d="M50 38 C38 22 56 10 50 38 M62 50 C78 38 90 56 62 50 M50 62 C62 78 44 90 50 62 M38 50 C22 62 10 44 38 50"/>',
    '<path d="M22 40 L30 14 L44 34 H56 L70 14 L78 40 C86 52 78 80 50 82 C22 80 14 52 22 40Z M40 56 h2 M58 56 h2 M46 68 q4 4 8 0"/>'
  ];
  function tube(k) { return '<svg class="tube" viewBox="0 0 100 100">' + TUBE[k % 6] + '</svg>'; }
  $('gArt').innerHTML = '<svg class="doo" viewBox="0 0 100 100" style="filter:drop-shadow(0 0 8px #ff4fa0)"><g fill="none" stroke="#ff4fa0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">' + TUBE[0] + '</g></svg>';
  var N = Math.ceil(P.length / 2), wall = $('wall'), on = 0;
  function cnt() { $('cnt').textContent = '(' + on + '/' + N + ')'; } cnt();
  for (var k = 0; k < N; k++) {
    var s = document.createElement('div'); s.className = 'sg'; s.setAttribute('data-k', k); s.style.setProperty('--nc', NC[k % 6]);
    s.style.marginLeft = (k % 2 ? 'auto' : '0');
    s.innerHTML = '<span class="cable"></span><div class="frame"><div class="ph" style="background-image:url(\'' + esc(P[k * 2].src) + '\')"></div>' + tube(k) + '</div><div class="cap">ความทรงจำที่ ' + (k + 1) + '</div><button type="button" class="sw" aria-label="เปิดป้ายไฟที่ ' + (k + 1) + '"></button>';
    wall.appendChild(s);
  }
  wall.addEventListener('click', function (e) {
    var s = e.target.closest('.sg'); if (!s) return; var k = +s.getAttribute('data-k');
    if (e.target.closest('.sw')) {
      if (s.classList.contains('on')) { s.classList.remove('on'); on--; cnt(); sfx('tick'); return; }
      s.classList.add('on'); on++; cnt(); sfx('chime'); setTimeout(function () { TUMem.open([k * 2, k * 2 + 1], { title: 'ป้ายไฟที่ ' + (k + 1), ok: 'ปิด' }); if (on >= N && window.TUToast) setTimeout(function () { TUToast('ไฟติดครบทั้งซอยแล้ว!'); }, 800); }, 700);
      return;
    }
    if (e.target.closest('.frame') && s.classList.contains('on')) TUMem.open([k * 2, k * 2 + 1], { title: 'ป้ายไฟที่ ' + (k + 1), ok: 'ปิด' });
  });
})();
