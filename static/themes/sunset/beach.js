(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD, CFG = window.SITE_CONFIG || {};
  var shells = document.getElementById('shells'), ov = document.getElementById('shOv'), card = document.getElementById('shCard');
  var pool = [].slice.call(document.querySelectorAll('.pool [data-photo]'));
  var NOTES = ['วันที่เราเจอกัน', 'รอยยิ้มที่ฉันชอบที่สุด', 'มื้อนี้อร่อยเพราะมีเธอ', 'วันที่ฝนตกแต่ใจอบอุ่น', 'ถ่ายรูปคู่กันครั้งแรก', 'เซอร์ไพรส์เล็กๆ ที่ไม่ลืม', 'วันธรรมดาที่พิเศษเพราะเธอ', 'ทริปที่อยากกลับไปอีก'];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  document.getElementById('gCrab').innerHTML = D.crab();
  document.getElementById('crabWalk').innerHTML = D.crab();
  document.querySelector('.bl-art').innerHTML = D.bottle();
  var N = Math.ceil(P.length / 2), cols = window.innerWidth >= 760 ? 4 : 2, opened = {}, nOpen = 0;
  var rowH = window.innerWidth >= 760 ? 175 : 138, rows = Math.ceil(N / cols);
  shells.style.height = (rows * rowH + 40) + 'px';
  for (var k = 0; k < N; k++) {
    var r = Math.floor(k / cols), c = k % cols, odd = r % 2;
    var x = (c + .5 + (odd ? .25 : -.1)) / cols * 100 + ((k * 37) % 9 - 4) * .5, y = r * rowH + ((k * 53) % 21) - 4 + (c % 2 ? 22 : 0);
    var b = document.createElement('button'); b.type = 'button'; b.className = 'sh hint'; b.setAttribute('data-k', k);
    b.style.cssText = 'left:' + Math.min(88, Math.max(12, x)).toFixed(1) + '%;top:' + y + 'px;--r:' + (((k * 29) % 31) - 15) + 'deg';
    b.setAttribute('aria-label', 'เปลือกหอยที่ ' + (k + 1));
    b.innerHTML = D.seaitem(k) + '<span class="num">ความทรงจำ ' + (k + 1) + '</span>';
    shells.appendChild(b);
  }
  function count() { document.getElementById('shCount').textContent = '(' + nOpen + '/' + N + ')'; }
  count();
  function close() { ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); document.body.classList.remove('no-scroll'); }
  function open(k) {
    var a = k * 2, ids = [a, a + 1].filter(function (i) { return P[i]; });
    card.innerHTML = '<button class="x" type="button" aria-label="ปิด">&times;</button><div class="sh-top">' + D.seaitem(k) + '</div><h3>ความทรงจำที่ ' + (k + 1) + '</h3><div class="ph-row">' +
      ids.map(function (i, n) { var p = P[i]; return '<figure class="pol" data-i="' + i + '" style="--r:' + (n ? 2.2 : -2.2) + 'deg;--d:' + (.15 + n * .3) + 's"><div class="ph" style="background-image:url(\'' + esc(p.src) + '\')"></div><figcaption>' + esc(p.cap || NOTES[i % NOTES.length]) + '</figcaption></figure>'; }).join('') + '</div>';
    ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll');
    var sh = shells.querySelector('[data-k="' + k + '"]');
    if (!opened[k]) { opened[k] = 1; nOpen++; count(); sh.classList.add('opened'); }
    sh.classList.remove('hint');
  }
  shells.addEventListener('click', function (e) { var s = e.target.closest('.sh'); if (s) open(+s.getAttribute('data-k')); });
  ov.addEventListener('click', function (e) {
    if (e.target === ov || e.target.closest('.x')) { close(); return; }
    var f = e.target.closest('.pol'); if (f && pool[+f.getAttribute('data-i')]) pool[+f.getAttribute('data-i')].click();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  var cw = document.getElementById('crabWalk');
  cw.addEventListener('click', function () { cw.classList.remove('hop'); void cw.offsetWidth; cw.classList.add('hop'); if (window.TUToast) TUToast('แคร็บ ๆ ~'); });
})();
