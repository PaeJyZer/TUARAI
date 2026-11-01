/* ธีมจักรวาล: กดค้างจุดเครื่อง -> วาร์ป -> สแกนดาวเคราะห์ -> จอโฮโลแกรม */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var cv = $('stars'), cx = cv.getContext('2d'), W, H, warp = 0, targetWarp = 0;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N = (navigator.hardwareConcurrency || 8) <= 4 ? 120 : 220, st = [];
  function fit() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  fit(); addEventListener('resize', fit);
  for (var i = 0; i < N; i++) st.push({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() });
  function frame() {
    warp += (targetWarp - warp) * .06;
    cx.clearRect(0, 0, W, H);
    var cxm = W / 2, cym = H / 2, sp = .0015 + warp * .06;
    st.forEach(function (s) {
      var pz = s.z; s.z -= sp; if (s.z <= .02) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1; pz = 1; }
      var sx = cxm + s.x / s.z * cxm * .5, sy = cym + s.y / s.z * cym * .5;
      var px = cxm + s.x / pz * cxm * .5, py = cym + s.y / pz * cym * .5;
      var a = Math.min(1, (1 - s.z) * 1.4 + .15);
      cx.strokeStyle = 'rgba(190,230,255,' + a + ')'; cx.lineWidth = Math.max(.6, (1 - s.z) * (1.5 + warp * 2));
      cx.beginPath(); cx.moveTo(warp > .05 ? px : sx, warp > .05 ? py : sy); cx.lineTo(sx + .01, sy); cx.stroke();
    });
    if (!reduce) requestAnimationFrame(frame);
  }
  frame();
  if (reduce) { setInterval(frame, 120); }

  /* ---------- กดค้างจุดเครื่อง ---------- */
  var btn = $('launch'), fg = $('ringFg'), C = 339.3, HOLD = 1500, t0 = 0, raf = null, holding = false, launched = false;
  function upd() {
    if (!holding) return;
    var p = Math.min(1, (performance.now() - t0) / HOLD);
    fg.style.strokeDashoffset = C * (1 - p);
    TUSfx.play('engineSet', p); targetWarp = p * .25;
    if (p >= 1) return go();
    raf = requestAnimationFrame(upd);
  }
  function start(e) {
    if (launched || holding) return; if (e && e.preventDefault) e.preventDefault();
    holding = true; t0 = performance.now(); btn.classList.add('hold');
    TUSfx.play('engineStart'); raf = requestAnimationFrame(upd);
  }
  function stop() {
    if (!holding || launched) return;
    holding = false; cancelAnimationFrame(raf); btn.classList.remove('hold');
    fg.style.transition = 'stroke-dashoffset .4s'; fg.style.strokeDashoffset = C;
    setTimeout(function () { fg.style.transition = ''; }, 450);
    targetWarp = 0; TUSfx.play('engineStop');
    $('gateHint').textContent = 'กดค้างให้นานกว่านี้อีกนิด ลองใหม่นะ';
  }
  function go() {
    launched = true; holding = false; btn.classList.remove('hold'); btn.classList.add('go');
    document.body.classList.add('warp-on');
    $('gateHint').textContent = '🚀 วาร์ป!';
    targetWarp = 1; TUSfx.play('whoosh'); TUSfx.play('boom');
    setTimeout(function () { targetWarp = .12; TUSfx.play('engineStop'); window.TU_OPEN(); }, 1300);
  }
  btn.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { btn.addEventListener(ev, stop); });
  btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  btn.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
  btn.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') stop(); });

  /* ---------- นาฬิกาภารกิจ ---------- */
  var ts = Date.now();
  setInterval(function () {
    var s = Math.floor((Date.now() - ts) / 1000), m = Math.floor(s / 60); s %= 60;
    $('clock').textContent = 'T+' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }, 1000);

  /* ---------- สแกนดาวเคราะห์ ---------- */
  var radar = $('radar'), got = 0, NEED = 5;
  var pos = [[26, 30], [70, 24], [50, 52], [24, 72], [74, 70]], cols = ['#ff7eb6', '#ffd166', '#8ee3d0', '#b388ff', '#4cc9f0'];
  pos.forEach(function (p, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'planet'; b.setAttribute('aria-label', 'ดาวเคราะห์ ' + (i + 1));
    b.style.left = p[0] + '%'; b.style.top = p[1] + '%'; b.style.setProperty('--p', cols[i]); b.style.animationDelay = (-i * .6) + 's';
    b.addEventListener('click', function () {
      if (b.classList.contains('scanned')) return;
      b.classList.add('scanned'); got++;
      var r = radar.getBoundingClientRect(), br = b.getBoundingClientRect();
      var pl = document.createElement('i'); pl.className = 'pulse';
      pl.style.left = (br.left - r.left + br.width / 2) + 'px'; pl.style.top = (br.top - r.top + br.height / 2) + 'px';
      radar.appendChild(pl); setTimeout(function () { pl.remove(); }, 1100);
      TUSfx.play('ping'); TUSfx.play('chime', i + 2);
      TUFx.float(br.left + br.width / 2, br.top, '📡 พบสัญญาณรัก');
      $('sigCount').textContent = got;
      if (got >= NEED) { setTimeout(function () { TUSteps.complete(2); TUFx.confetti(innerWidth / 2, innerHeight * .4, 90, ['#5ee7ff', '#ff7eb6', '#ffd166', '#fff'], 1); }, 450); }
    });
    radar.appendChild(b);
  });
  document.addEventListener('tu:skipped', function () { $('sigCount').textContent = NEED; });
  document.addEventListener('tu:letter', function () { TUSfx.play('laser'); });
})();
