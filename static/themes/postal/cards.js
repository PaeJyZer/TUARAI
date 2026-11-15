(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD, sfx = function (n) { if (window.TUSfx) TUSfx.play(n); };
  var $ = function (id) { return document.getElementById(id); };
  var NOTES = ['คิดถึงเธอเสมอเลยนะ', 'วันนั้นเป็นวันที่ดีที่สุด', 'ขอบคุณที่อยู่ด้วยกันเสมอ', 'ยิ้มของเธอทำให้ใจฉันฟู', 'อยากย้อนกลับไปวันนั้นอีกครั้ง', 'เก็บไว้ในใจตลอดไป'];
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '%27' }[c]; }); };
  var ENV = '<svg class="doo" viewBox="0 0 120 90"><rect x="6" y="14" width="108" height="70" rx="6" fill="#fff6e0"/><path d="M6 20 L60 58 L114 20" fill="none" stroke="#c0503a" stroke-width="3" stroke-linejoin="round"/><path d="M6 84 L48 46 M114 84 L72 46" stroke="#e8c9a0" stroke-width="2.5" fill="none"/><path d="M60 44 C48 36 52 28 60 34 C68 28 72 36 60 44Z" fill="#e8545a"/></svg>';
  $('gArt').innerHTML = ENV; $('envArt').innerHTML = ENV;
  var N = P.length, stage = $('stage'), idx = 0, busy = false;
  function cnt() { $('cnt').textContent = '(' + Math.min(idx + 1, N) + '/' + N + ')'; }
  var cards = P.map(function (p, i) {
    var c = document.createElement('div'); c.className = 'pc'; c.setAttribute('data-i', i);
    var nxt = P[i + 1] ? P[i + 1].src : P[i].src, pm = ['BKK', 'CNX', 'HKT', 'KKC'][i % 4] + '<br>' + (2020 + i % 6);
    c.innerHTML = '<div class="fc"><div class="ph" style="background-image:url(\'' + esc(p.src) + '\')"></div><span class="lb">' + esc(p.cap || '') + '</span></div><div class="bk"><div class="msg">' + esc(p.cap || NOTES[i % NOTES.length]) + '<br><br>ด้วยรัก</div><div class="adr"><span class="stp" style="background-image:url(\'' + esc(nxt) + '\')"></span><span class="pm">' + pm + '</span>ถึง: {{TO}}<br>จาก: ใจของฉัน<br>ที่อยู่: ในความทรงจำของเรา</div></div>';
    c.querySelector('.adr').innerHTML = c.querySelector('.adr').innerHTML.replace('{{TO}}', esc((window.SITE_CONFIG || {}).partnerName || ''));
    stage.appendChild(c); return c;
  });
  function layout() {
    cards.forEach(function (c, i) {
      c.classList.remove('gone', 'ahead', 'ahead2', 'hide', 'flipped'); c.style.zIndex = N - i;
      if (i < idx) c.classList.add('gone'); else if (i === idx + 1) c.classList.add('ahead'); else if (i === idx + 2) c.classList.add('ahead2'); else if (i > idx + 2) c.classList.add('hide');
    });
    $('pPrev').disabled = idx <= 0; $('pNext').disabled = idx >= N - 1; cnt();
  }
  layout();
  function go(d) { if (busy) return; var n = idx + d; if (n < 0 || n >= N) return; busy = true; sfx('whoosh'); idx = n; layout(); setTimeout(function () { busy = false; }, 600); }
  $('pPrev').addEventListener('click', function () { go(-1); }); $('pNext').addEventListener('click', function () { go(1); });
  var sx = null; stage.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  stage.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) { go(dx < 0 ? 1 : -1); stage._m = 1; setTimeout(function () { stage._m = 0; }, 50); } });
  stage.addEventListener('click', function (e) {
    if (stage._m) return; var c = e.target.closest('.pc'); if (!c || +c.getAttribute('data-i') !== idx) return;
    c.classList.toggle('flipped'); sfx('tick'); if (window.TUMem && e.target.closest('.ph') && false) TUMem.open([idx], {});
  });
  var tip = false; stage.addEventListener('click', function () { if (!tip) { tip = true; } });
})();
