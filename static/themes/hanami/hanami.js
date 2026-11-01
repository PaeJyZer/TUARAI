/* ธีมฮานามิ: ลมพัดกลีบซากุระ -> จุดโคมไฟ -> ป้ายความทรงจำ -> โอมิคุจิ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var cv = $('petals'), cx = cv.getContext('2d'), W, H, P = [], wind = 0;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MAX = (navigator.hardwareConcurrency || 8) <= 4 ? 40 : 70;
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  function fit() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  fit(); addEventListener('resize', fit);
  function petal(x, y, burst) {
    return { x: x == null ? Math.random() * W : x, y: y == null ? -20 : y, s: 7 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .08,
      vx: burst ? (Math.random() - .3) * 7 : Math.random() * .6, vy: burst ? Math.random() * 2 : .6 + Math.random() * 1.1, ph: Math.random() * 6, c: ['#ffb7cf', '#ff9ec0', '#ffd3e1', '#ffc2d6'][(Math.random() * 4) | 0], life: burst ? 1 : 0 };
  }
  for (var i = 0; i < MAX; i++) P.push(petal(null, Math.random() * innerHeight));
  function frame() {
    cx.clearRect(0, 0, W, H);
    wind *= .96;
    for (var i = P.length - 1; i >= 0; i--) {
      var p = P[i];
      p.ph += .03; p.vx += (wind * .05); p.vx *= .985;
      p.x += p.vx + Math.sin(p.ph) * .6; p.y += p.vy + Math.abs(wind) * .05; p.r += p.vr + wind * .004;
      if (p.y > H + 20 || p.x > W + 40 || p.x < -60) {
        if (p.life) { P.splice(i, 1); continue; }
        p.y = -20; p.x = Math.random() * W; p.vx = Math.random() * .6;
      }
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.globalAlpha = .85;
      cx.beginPath(); cx.ellipse(0, 0, p.s * .55, p.s, 0, 0, 6.3); cx.fill();
      cx.beginPath(); cx.moveTo(0, -p.s); cx.lineTo(2, -p.s + 4); cx.lineTo(-2, -p.s + 4); cx.fill();
      cx.restore();
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) frame();
  function gust(v) { wind = Math.max(-14, Math.min(14, wind + v)); }
  function burst(x, y, n) { for (var i = 0; i < n; i++) P.push(petal(x + Math.random() * 40 - 20, y + Math.random() * 30, true)); }

  /* ลมตามนิ้ว/เมาส์ */
  var lx = null, lt = 0;
  document.addEventListener('pointermove', function (e) {
    if (lx !== null) { var dx = e.clientX - lx; gust(dx * .06); if (gating) feedWind(Math.abs(dx)); }
    lx = e.clientX; lt = e.timeStamp;
  });
  document.addEventListener('pointerup', function () { lx = null; });

  /* ---------- gate: พัดลมให้เต็ม ---------- */
  var gating = true, wp = 0, opened = false;
  function feedWind(d) {
    wp = Math.min(100, wp + d * .09); $('windFill').style.width = wp + '%';
    if (wp > 40 && Math.random() < .08) TUSfx.play('whoosh');
    if (wp >= 100) finishGate();
  }
  function finishGate() {
    if (opened) return; opened = true; gating = false;
    $('gateHint').textContent = '🌸 ลมพัดแล้ว';
    gust(12); burst(W / 2, H / 2, 40); TUSfx.play('whoosh'); TUSfx.play('sparkle');
    setTimeout(function () { TUSfx.play('chime', 4); }, 250);
    window.TU_OPEN();
  }
  $('moonBtn').addEventListener('click', function () { TUSfx.play('whoosh'); gust(8); feedWind(450); });

  /* ---------- เขย่ากิ่งซากุระ ---------- */
  var br = $('branch');
  function shake() {
    br.classList.remove('shake'); void br.offsetWidth; br.classList.add('shake');
    burst(W * .8, 70, 36); gust(6); TUSfx.play('chime', (Math.random() * 8) | 0); TUSfx.play('sparkle');
  }
  br.addEventListener('click', shake);
  br.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') shake(); });

  /* ---------- โคมไฟ ---------- */
  var lit = 0, NEED = 5;
  document.querySelectorAll('.lantern').forEach(function (l) {
    l.addEventListener('click', function () {
      if (l.classList.contains('lit')) { TUSfx.play('chime', +l.dataset.i); return; }
      l.classList.add('lit'); lit++; $('lanCount').textContent = lit;
      TUSfx.play('chime', +l.dataset.i * 1 + 1); TUSfx.play('sparkle');
      var r = l.getBoundingClientRect(); TUFx.float(r.left + r.width / 2, r.top, l.dataset.wish);
      burst(r.left + r.width / 2, r.top, 6);
      if (lit >= NEED) setTimeout(function () { TUSteps.complete(2); TUFx.confetti(innerWidth / 2, innerHeight * .4, 70, ['#ffb7cf', '#ffd3e1', '#ffb454', '#fff'], .9); gust(8); burst(W / 2, 0, 30); }, 500);
    });
  });
  document.addEventListener('tu:skipped', function () {
    document.querySelectorAll('.lantern').forEach(function (l) { l.classList.add('lit'); }); $('lanCount').textContent = NEED;
  });
  document.addEventListener('tu:letter', function () { gust(6); burst(W / 2, 0, 30); });
})();
