/* Constellation of Us: แตะดาวในกลุ่มดาวหัวใจ -> ความทรงจำระเบิดแสง -> ดาวตกเมื่อเลื่อนจอ -> เขียนคำอธิษฐานลอยบนฟ้า */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- ท้องฟ้าพื้นหลัง (ดาวระยิบ + เลื่อนตามการสกอลล์) ---------- */
  var sky = $('sky'), sx = sky.getContext('2d'), SW, SH, field = [], scrollY = 0, wishStars = [];
  function fitSky() {
    SW = innerWidth; SH = innerHeight; sky.width = SW * dpr; sky.height = SH * dpr; sx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(260, SW * SH / 5200)); field = [];
    for (var i = 0; i < n; i++) field.push({ x: Math.random(), y: Math.random(), r: rnd(.4, 1.6), z: rnd(.15, 1), p: rnd(0, 6.3), s: rnd(.6, 2.2), c: pick(['#ffffff', '#cfdcff', '#ffe9c4', '#ffd0e6']) });
  }
  fitSky(); addEventListener('resize', fitSky);
  addEventListener('scroll', function () { scrollY = window.pageYOffset || 0; }, { passive: true });
  function drawSky(t) {
    sx.clearRect(0, 0, SW, SH);
    for (var i = 0; i < field.length; i++) {
      var s = field[i], tw = reduce ? .8 : .45 + .55 * Math.abs(Math.sin(t / 1000 * s.s + s.p));
      var y = ((s.y * SH - scrollY * s.z * .25) % SH + SH) % SH;
      sx.globalAlpha = tw * (.35 + s.z * .65); sx.fillStyle = s.c;
      sx.beginPath(); sx.arc(s.x * SW, y, s.r * (.7 + s.z * .5), 0, 6.3); sx.fill();
    }
    for (var k = 0; k < wishStars.length; k++) {
      var w = wishStars[k], a = .55 + .45 * Math.sin(t / 700 + w.p), wy = ((w.y * SH - scrollY * .08) % SH + SH) % SH;
      sx.globalAlpha = a; sx.fillStyle = '#ffe3a3'; sx.shadowColor = '#ffd98a'; sx.shadowBlur = 14;
      sx.beginPath(); sx.arc(w.x * SW, wy, 2.4, 0, 6.3); sx.fill(); sx.shadowBlur = 0;
    }
    sx.globalAlpha = 1;
  }

  /* ---------- เอฟเฟกต์: ระเบิดแสง + ดาวตก ---------- */
  var fx = $('fx'), fc = fx.getContext('2d'), FW, FH, parts = [], meteors = [], rings = [], fxRun = false;
  function fitFx() { FW = innerWidth; FH = innerHeight; fx.width = FW * dpr; fx.height = FH * dpr; fc.setTransform(dpr, 0, 0, dpr, 0, 0); }
  fitFx(); addEventListener('resize', fitFx);
  var COLS = ['#fff6d8', '#ffd98a', '#ff9ec7', '#9fbcff', '#ffffff'];
  function burst(x, y, n, power) {
    if (reduce) n = Math.min(n, 12);
    for (var i = 0; i < n; i++) {
      var a = Math.PI * 2 * i / n + rnd(-.15, .15), v = rnd(1.2, 4.6) * (power || 1);
      parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, d: rnd(.012, .026), c: pick(COLS), s: rnd(1.3, 3), star: Math.random() < .35 });
    }
    rings.push({ x: x, y: y, r: 6, l: 1 });
    runFx();
  }
  function meteor() {
    var fromRight = Math.random() < .75, x = fromRight ? rnd(FW * .45, FW * 1.05) : rnd(-FW * .05, FW * .5), y = rnd(-20, FH * .45);
    var sp = rnd(11, 17), ang = fromRight ? rnd(2.45, 2.75) : rnd(.4, .7);
    meteors.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, l: 1, len: rnd(110, 200) });
    runFx();
  }
  function runFx() { if (!fxRun) { fxRun = true; requestAnimationFrame(tickFx); } }
  function tickFx() {
    fc.clearRect(0, 0, FW, FH);
    for (var i = meteors.length - 1; i >= 0; i--) {
      var m = meteors[i]; m.x += m.vx; m.y += m.vy; m.l -= .018;
      if (m.l <= 0 || m.x < -250 || m.x > FW + 250 || m.y > FH + 250) { meteors.splice(i, 1); continue; }
      var tx = m.x - m.vx / Math.hypot(m.vx, m.vy) * m.len, ty = m.y - m.vy / Math.hypot(m.vx, m.vy) * m.len;
      var g = fc.createLinearGradient(m.x, m.y, tx, ty); g.addColorStop(0, 'rgba(255,255,255,' + m.l + ')'); g.addColorStop(.25, 'rgba(255,225,170,' + (m.l * .6) + ')'); g.addColorStop(1, 'rgba(160,190,255,0)');
      fc.strokeStyle = g; fc.lineWidth = 2.2; fc.lineCap = 'round'; fc.beginPath(); fc.moveTo(m.x, m.y); fc.lineTo(tx, ty); fc.stroke();
      fc.fillStyle = 'rgba(255,255,255,' + m.l + ')'; fc.beginPath(); fc.arc(m.x, m.y, 2.2, 0, 6.3); fc.fill();
    }
    for (var r = rings.length - 1; r >= 0; r--) {
      var g2 = rings[r]; g2.r += 5.5; g2.l -= .035;
      if (g2.l <= 0) { rings.splice(r, 1); continue; }
      fc.strokeStyle = 'rgba(255,230,170,' + g2.l + ')'; fc.lineWidth = 2; fc.beginPath(); fc.arc(g2.x, g2.y, g2.r, 0, 6.3); fc.stroke();
    }
    for (var j = parts.length - 1; j >= 0; j--) {
      var p = parts[j]; p.vy += .035; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.l -= p.d;
      if (p.l <= 0) { parts.splice(j, 1); continue; }
      fc.globalAlpha = Math.max(0, p.l); fc.fillStyle = p.c;
      if (p.star) { fc.save(); fc.translate(p.x, p.y); fc.rotate(p.l * 6); fc.fillRect(-p.s * 1.6, -.6, p.s * 3.2, 1.2); fc.fillRect(-.6, -p.s * 1.6, 1.2, p.s * 3.2); fc.restore(); }
      else { fc.beginPath(); fc.arc(p.x, p.y, p.s * (.4 + p.l * .7), 0, 6.3); fc.fill(); }
    }
    fc.globalAlpha = 1;
    if (parts.length || meteors.length || rings.length) requestAnimationFrame(tickFx); else { fxRun = false; fc.clearRect(0, 0, FW, FH); }
  }
  (function loopSky() { drawSky(performance.now()); if (!reduce) requestAnimationFrame(loopSky); })();
  if (reduce) { drawSky(0); addEventListener('resize', function () { drawSky(0); }); }

  /* ดาวตกทุกครั้งที่เลื่อนหน้าจอ (หน่วงไว้ไม่ให้ถี่เกินไป) */
  var lastMet = 0, lastY = 0;
  function maybeMeteor() {
    if (!document.body.classList.contains('opened')) return;
    var now = Date.now(); if (now - lastMet < 900) return;
    lastMet = now; meteor(); if (Math.random() < .4) setTimeout(meteor, 180);
  }
  addEventListener('scroll', function () { var y = window.pageYOffset || 0; if (Math.abs(y - lastY) > 40) { lastY = y; maybeMeteor(); } }, { passive: true });
  addEventListener('wheel', maybeMeteor, { passive: true });
  addEventListener('touchmove', maybeMeteor, { passive: true });

  /* ---------- หน้าปิด ---------- */
  document.addEventListener('tu:opening', function () { TUSfx.play('whoosh'); setTimeout(function () { TUSfx.play('sparkle'); }, 700); });
  document.addEventListener('tu:opened', function () { for (var i = 0; i < 3; i++) setTimeout(meteor, i * 260); });

  /* ---------- กลุ่มดาวหัวใจ ---------- */
  var DATA = [];
  try { DATA = JSON.parse($('starData').textContent) || []; } catch (e) {}
  var N = DATA.length, M = 26, lit = {}, litN = 0, cur = -1, allLit = false;
  var starsEl = $('stars'), linesEl = $('lines'), glow = null, glowLen = 1;
  function heart(t) { return { x: 50 + 16 * Math.pow(Math.sin(t), 3) * 2.78, y: 50 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2.5) * 2.55 }; }
  function build() {
    var pts = [], i;
    for (i = 0; i < M; i++) pts.push(heart(Math.PI * 2 * i / M));
    var d = 'M' + pts.map(function (p) { return p.x.toFixed(2) + ' ' + p.y.toFixed(2); }).join(' L') + ' Z';
    var base = document.createElementNS(NS, 'path'); base.setAttribute('d', d); base.setAttribute('class', 'base'); linesEl.appendChild(base);
    glow = document.createElementNS(NS, 'path'); glow.setAttribute('d', d); glow.setAttribute('class', 'glow'); glow.setAttribute('pathLength', '100'); linesEl.appendChild(glow);
    glow.style.strokeDasharray = '100'; glow.style.strokeDashoffset = '100';
    // ดาวประดับตามเส้นหัวใจ
    for (i = 0; i < M; i++) { var dm = document.createElement('i'); dm.className = 'dim'; dm.style.left = pts[i].x + '%'; dm.style.top = pts[i].y + '%'; dm.style.setProperty('--d', rnd(0, 3) + 's'); starsEl.appendChild(dm); }
    // ดาวความทรงจำ: ดวงแรก (รูปปก) อยู่กลาง ที่เหลือกระจายตามขอบหัวใจ
    var rest = N - 1, idx = [];
    for (i = 0; i < rest; i++) idx.push(Math.round(i * M / Math.max(rest, 1) + M * .5 / Math.max(rest, 1)) % M);
    var c = heart(0), cy = 46;
    for (i = 0; i < N; i++) {
      var pos = i === 0 ? { x: 50, y: cy } : pts[idx[i - 1]];
      var b = document.createElement('button'); b.type = 'button'; b.className = 'st' + (i === 0 ? ' cover' : ''); b.dataset.i = i;
      b.style.left = pos.x + '%'; b.style.top = pos.y + '%'; b.style.setProperty('--d', rnd(0, 2.2) + 's');
      b.setAttribute('aria-label', 'ดวงที่ ' + (i + 1) + ' ความทรงจำ'); b.innerHTML = '<i></i>';
      starsEl.appendChild(b);
    }
  }
  build();
  function setGlow() { glow.style.strokeDashoffset = String(100 - Math.round(100 * litN / Math.max(N, 1))); $('litCount').textContent = litN; }

  /* ---------- การ์ดความทรงจำ ---------- */
  var mem = $('mem'), memCard = $('memCard');
  function fill(i) {
    var d = DATA[i]; cur = i;
    $('memImg').src = d.src; $('memImg').alt = d.cap || ('ความทรงจำที่ ' + (i + 1));
    $('memNo').textContent = 'ดวงที่ ' + (i + 1) + ' / ' + N;
    $('memCap').textContent = d.cap || 'ความทรงจำที่ ' + (i + 1);
  }
  function light(i, el) {
    if (!lit[i]) {
      lit[i] = true; litN++; (el || starsEl.querySelector('.st[data-i="' + i + '"]')).classList.add('lit'); setGlow();
      if (litN >= N) allLit = true;
    }
  }
  function starCenter(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function openStar(i, el) {
    el = el || starsEl.querySelector('.st[data-i="' + i + '"]');
    var c = starCenter(el), wasLit = !!lit[i];
    TUSfx.play('chime', i * 2); TUSfx.play('sparkle');
    burst(c.x, c.y, wasLit ? 18 : 46, wasLit ? .8 : 1.2);
    light(i, el);
    setTimeout(function () {
      fill(i);
      var r = memCard.getBoundingClientRect();
      memCard.style.setProperty('--ox', (c.x - (innerWidth / 2 - 210)) + 'px'); memCard.style.setProperty('--oy', (c.y - (innerHeight / 2 - 250)) + 'px');
      mem.hidden = false; document.body.classList.add('no-scroll');
      memCard.style.animation = 'none'; void memCard.offsetWidth; memCard.style.animation = '';
    }, reduce ? 0 : 320);
  }
  function closeMem() {
    if (mem.hidden) return;
    mem.hidden = true; document.body.classList.remove('no-scroll');
    if (allLit && !TUSteps.isDone(2)) {
      TUSteps.complete(2);
      var c = { x: innerWidth / 2, y: innerHeight * .4 };
      for (var k = 0; k < 4; k++) setTimeout(function () { burst(rnd(innerWidth * .2, innerWidth * .8), rnd(innerHeight * .15, innerHeight * .5), 34, 1.1); TUSfx.play('sparkle'); }, k * 260);
      for (var m = 0; m < 4; m++) setTimeout(meteor, m * 200);
      setTimeout(function () { var w = $('wish'); if (w) w.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }, 1300);
    }
  }
  starsEl.addEventListener('click', function (e) { var b = e.target.closest('.st'); if (b) openStar(+b.dataset.i, b); });
  $('memClose').addEventListener('click', closeMem);
  mem.addEventListener('click', function (e) { if (e.target === mem) closeMem(); });
  document.addEventListener('keydown', function (e) { if (mem.hidden) return; if (e.key === 'Escape') closeMem(); });

  /* ---------- คำอธิษฐาน ---------- */
  var form = $('wishForm'), txt = $('wishText'), wsky = $('wishSky'), sent = 0, MAXW = 6;
  function finishWish() { if (!TUSteps.isDone(3)) TUSteps.complete(3); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = (txt.value || '').trim(); if (!v) { txt.focus(); return; }
    if (sent >= MAXW) { TUToast('ส่งคำอธิษฐานได้สูงสุด ' + MAXW + ' ข้อต่อครั้งนะ'); return; }
    sent++; txt.value = '';
    var empty = $('wsEmpty'); if (empty) empty.remove();
    var w = document.createElement('div'); w.className = 'wsk'; w.textContent = v;
    var h = wsky.clientHeight; w.style.setProperty('--x', rnd(6, 52) + '%'); w.style.setProperty('--up', Math.round(rnd(h * .35, h - 54)) + 'px');
    wsky.appendChild(w);
    var r = $('wishSend').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 30, 1);
    TUSfx.play('whoosh'); setTimeout(function () { TUSfx.play('chime', 4 + sent); TUSfx.play('sparkle'); }, 450);
    wishStars.push({ x: rnd(.08, .92), y: rnd(.06, .5), p: rnd(0, 6) }); meteor();
    var cs = wsky.querySelectorAll('.wsk'); if (cs.length > 8) cs[0].remove();
    finishWish();
  });
  $('wishSkip').addEventListener('click', function () { finishWish(); if (TUSteps.isDone(3)) { var c = document.querySelector('.cta'); if (c) c.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); } });
})();
