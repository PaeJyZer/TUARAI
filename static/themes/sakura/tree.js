(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD, sfx = function (n) { if (window.TUSfx) TUSfx.play(n); };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  document.getElementById('gPetal').innerHTML = '<svg class="doo" viewBox="0 0 100 100"><path d="M50 8 C70 18 84 40 50 92 C16 40 30 18 50 8Z" fill="#f7a1b8"/><path d="M50 8 L50 70" stroke="#fff" stroke-width="2" opacity=".5"/></svg>';
  /* ต้นซากุระลายเส้นหมี */
  var blobs = [[50, 30, 34, 24], [24, 38, 20, 17], [76, 38, 20, 17], [38, 20, 20, 15], [64, 20, 20, 15], [50, 44, 24, 14], [14, 48, 12, 11], [88, 48, 12, 11]];
  var tr = '<svg class="doo" viewBox="0 0 100 100" aria-hidden="true"><path d="M47 100 C48 80 46 62 40 48 C36 40 30 36 24 34 M47 80 C54 66 60 56 70 48 C76 44 80 40 82 36 M46 58 C50 46 50 38 50 30" stroke="#9a6b4f" stroke-width="5.5" fill="none" stroke-linecap="round"/>';
  blobs.forEach(function (b, i) { tr += '<path d="' + D.scal(b[0], b[1], b[2], b[3], 14) + '" fill="' + ['#f9c0d0', '#f7a8be', '#fbd3df'][i % 3] + '"/>'; });
  for (var i = 0; i < 26; i++) { var a = (i * 137) % 360, r = 8 + (i * 11) % 36; tr += '<circle cx="' + (50 + r * Math.cos(a) * 1.05).toFixed(1) + '" cy="' + (32 + r * Math.sin(a) * .55).toFixed(1) + '" r="1.8" fill="#fff" opacity=".7"/>'; }
  $('tree').innerHTML = tr + '</svg>';
  var N = Math.ceil(P.length / 2), caught = 0, released = 0, active = 0;
  var fall = $('fall'), scene = $('scene');
  function sub() { $('kSub').textContent = caught >= N ? 'เก็บกลีบทองครบแล้ว! ปูผ้าปิกนิกเต็มไปด้วยความทรงจำ' : 'เขย่าต้นเพื่อให้กลีบทองร่วง แล้วแตะจับให้ทัน (' + caught + '/' + N + ')'; }
  sub();
  function petals(n, gold) {
    var W = scene.clientWidth, H = scene.clientHeight - 150;
    for (var k = 0; k < n; k++) {
      var p = document.createElement('div'); p.className = 'pt';
      var x = 12 + Math.random() * 76; p.style.left = x + '%'; p.style.top = (8 + Math.random() * 30) + '%';
      p.style.setProperty('--dx', ((Math.random() - .4) * 90).toFixed(0) + 'px'); p.style.setProperty('--h', Math.round(H * .8 + Math.random() * H * .2) + 'px');
      p.style.setProperty('--t', (4 + Math.random() * 4).toFixed(1) + 's'); p.style.setProperty('--rot', ((Math.random() - .5) * 720).toFixed(0) + 'deg'); p.style.animationDelay = (Math.random() * .6).toFixed(2) + 's';
      p.innerHTML = '<i></i>'; fall.appendChild(p);
      (function (p) { setTimeout(function () { p.remove(); }, 9500); })(p);
    }
  }
  function gold() {
    var p = document.createElement('div'); p.className = 'pt gold'; var H = scene.clientHeight - 150;
    p.style.left = (22 + Math.random() * 56) + '%'; p.style.top = '16%'; p.style.setProperty('--dx', ((Math.random() - .5) * 60).toFixed(0) + 'px'); p.style.setProperty('--h', Math.round(H * .78) + 'px'); p.style.setProperty('--t', '6.5s'); p.style.setProperty('--rot', ((Math.random() - .5) * 200).toFixed(0) + 'deg');
    p.innerHTML = '<i></i>'; p.setAttribute('data-k', released++); fall.appendChild(p); active++;
    p.addEventListener('animationend', function () { p.classList.add('landed'); });
  }
  function shake() {
    var t = $('tree'); t.classList.remove('shake'); void t.offsetWidth; t.classList.add('shake'); sfx('whoosh'); petals(14);
    if (released < N && active < 3) setTimeout(gold, 450);
    else if (released >= N && caught < N) { var g = fall.querySelector('.gold:not(.got)'); if (!g && window.TUToast) TUToast('ไม่มีกลีบทองเหลือแล้ว'); }
  }
  $('tree').addEventListener('click', shake); $('shakeBtn').addEventListener('click', shake);
  $('tree').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shake(); } });
  fall.addEventListener('click', function (e) {
    var g = e.target.closest('.gold'); if (!g || g.classList.contains('got')) return;
    g.classList.add('got'); active--; var k = +g.getAttribute('data-k'); sfx('chime');
    if (window.TUFx) { var r = g.getBoundingClientRect(); TUFx.confetti(r.left + 17, r.top + 17, 26, ['#ffe08a', '#f7a1b8', '#fff']); }
    g.style.display = 'none';
    TUMem.open([k * 2, k * 2 + 1], { title: 'กลีบทองกลีบที่ ' + (k + 1), ok: 'วางบนผ้าปิกนิก', onClose: function () {
      caught++; sub(); var b = $('blanket'), ids = [k * 2, k * 2 + 1].filter(function (i) { return P[i]; });
      ids.forEach(function (i, n) { var d = document.createElement('div'); d.className = 'it'; d.style.setProperty('--r', (((i * 7) % 14) - 7) + 'deg'); d.innerHTML = '<div class="ph" style="background-image:url(\'' + esc(P[i].src) + '\')"></div>'; d.addEventListener('click', function () { TUMem.open([i], { ok: 'ปิด' }); }); b.appendChild(d); });
      if (caught >= N && window.TUToast) TUToast('เก็บครบทุกกลีบแล้ว!');
      if (caught < N && released > caught + active) { /* กลีบที่ร่วงแล้วยังเก็บได้ */ }
    } });
  });
  setTimeout(function () { if (window.TUToast) TUToast('แตะต้นซากุระเพื่อเขย่า'); }, 1200);
  /* ลมพัดกลีบเบา ๆ */
  setInterval(function () { if (!document.hidden) petals(2); }, 5000);
})();
