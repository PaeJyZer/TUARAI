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
  function bigMeteor() {
    var x = rnd(FW * .7, FW * 1.02), y = rnd(-10, FH * .12), ang = rnd(2.55, 2.7), sp = 9;
    meteors.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, l: 1.6, len: 320, big: true });
    runFx();
  }
  /* ละอองดาวเล็กๆ พุ่งจากจุดที่นิ้วแตะ */
  function sparkle(x, y) {
    var n = reduce ? 6 : 16;
    for (var i = 0; i < n; i++) {
      var a = rnd(0, 6.283), v = rnd(.8, 3.2);
      parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - rnd(.4, 1.4), l: 1, d: rnd(.022, .04), c: pick(COLS), s: rnd(1, 2.2), star: Math.random() < .5 });
    }
    rings.push({ x: x, y: y, r: 4, l: .8 });
    runFx();
  }
  function kring() { [2093, 2637, 3136, 3951].forEach(function (f, i) { TUSfx.tone({ f: f, t: i * .055, d: .3, v: .035, type: 'sine' }); }); }
  function runFx() { if (!fxRun) { fxRun = true; requestAnimationFrame(tickFx); } }
  function tickFx() {
    fc.clearRect(0, 0, FW, FH);
    for (var i = meteors.length - 1; i >= 0; i--) {
      var m = meteors[i]; m.x += m.vx; m.y += m.vy; m.l -= m.big ? .009 : .018;
      if (m.l <= 0 || m.x < -250 || m.x > FW + 250 || m.y > FH + 250) { meteors.splice(i, 1); continue; }
      var tx = m.x - m.vx / Math.hypot(m.vx, m.vy) * m.len, ty = m.y - m.vy / Math.hypot(m.vx, m.vy) * m.len;
      var g = fc.createLinearGradient(m.x, m.y, tx, ty); var al = Math.min(1, m.l); g.addColorStop(0, 'rgba(255,255,255,' + al + ')'); g.addColorStop(.25, 'rgba(255,225,170,' + (al * .6) + ')'); g.addColorStop(1, 'rgba(160,190,255,0)');
      fc.strokeStyle = g; fc.lineWidth = m.big ? 3.6 : 2.2; fc.lineCap = 'round'; fc.beginPath(); fc.moveTo(m.x, m.y); fc.lineTo(tx, ty); fc.stroke();
      fc.fillStyle = 'rgba(255,255,255,' + al + ')'; fc.beginPath(); fc.arc(m.x, m.y, m.big ? 3.4 : 2.2, 0, 6.3); fc.fill();
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
  var N = DATA.length, lit = {}, litN = 0, cur = -1, allLit = false;
  var starsEl = $('stars'), linesEl = $('lines'), glow = null, glowLen = 1;
  function heart(t) { return { x: 50 + 16 * Math.pow(Math.sin(t), 3) * 2.78, y: 50 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2.5) * 2.55 }; }
  /* จุดเรียงเท่ากันตามความยาวเส้น (ไม่กระจุกตรงปลายและรอยหยักของหัวใจ) */
  function dense(scale) {
    var out = [], K = 480, c = { x: 50, y: 46 };
    for (var i = 0; i < K; i++) { var p = heart(Math.PI * 2 * i / K); out.push({ x: c.x + (p.x - c.x) * scale, y: c.y + (p.y - c.y) * scale }); }
    return out;
  }
  function evenly(pts, n, off) {
    var len = [0], i; for (i = 1; i <= pts.length; i++) { var a = pts[i - 1], b = pts[i % pts.length]; len.push(len[i - 1] + Math.hypot(b.x - a.x, b.y - a.y)); }
    var total = len[pts.length], res = [], j = 0;
    for (i = 0; i < n; i++) {
      var t = ((i + (off || 0)) / n) * total; while (j < pts.length - 1 && len[j + 1] < t) j++;
      var seg = len[j + 1] - len[j] || 1, f = (t - len[j]) / seg, p0 = pts[j], p1 = pts[(j + 1) % pts.length];
      res.push({ x: p0.x + (p1.x - p0.x) * f, y: p0.y + (p1.y - p0.y) * f });
    }
    return res;
  }
  /* เรียงดาวตามขอบหัวใจ แล้วดันดาวที่อยู่ใกล้กันในระยะเชิงพื้นที่ (เช่นตรงรอยหยักกลางและปลายล่าง) ให้ห่างออกไปตามเส้น */
  function spread(outline, n, fixedPt) {
    var len = [0], i, k; for (i = 1; i <= outline.length; i++) { var a = outline[i - 1], b = outline[i % outline.length]; len.push(len[i - 1] + Math.hypot(b.x - a.x, b.y - a.y)); }
    var total = len[outline.length];
    function at(u) { u = ((u % total) + total) % total; var j = 0; while (j < outline.length - 1 && len[j + 1] < u) j++; var f = (u - len[j]) / ((len[j + 1] - len[j]) || 1), p0 = outline[j], p1 = outline[(j + 1) % outline.length]; return { x: p0.x + (p1.x - p0.x) * f, y: p0.y + (p1.y - p0.y) * f }; }
    var us = [], MIN = 17, step = total / n * .08;
    for (i = 0; i < n; i++) us.push(((i + .5) / n) * total);
    for (var it = 0; it < 160; it++) {
      for (i = 0; i < n; i++) {
        var me = at(us[i]), push = 0;
        var others = []; for (k = 0; k < n; k++) if (k !== i) others.push(at(us[k])); others.push(fixedPt);
        var near = others.filter(function (q) { return Math.hypot(q.x - me.x, q.y - me.y) < MIN; });
        if (!near.length) continue;
        function score(u) { var pp = at(u); return near.reduce(function (m, q) { return Math.min(m, Math.hypot(q.x - pp.x, q.y - pp.y)); }, 99); }
        us[i] += score(us[i] + step) >= score(us[i] - step) ? step : -step;
      }
    }
    return us.map(at);
  }
  /* วางดาว n ดวงบนเส้นหัวใจ ดวงที่ 0 ล็อกที่ปลายล่าง ดวงอื่นดันห่างกันตามเส้นถ้าชิดกันเกินไป (ตรงรอยหยักและปลายแหลม) */
  function onLine(outline, n) {
    var len = [0], i, k; for (i = 1; i <= outline.length; i++) { var a = outline[i - 1], b = outline[i % outline.length]; len.push(len[i - 1] + Math.hypot(b.x - a.x, b.y - a.y)); }
    var total = len[outline.length];
    function at(u) { u = ((u % total) + total) % total; var j = 0; while (j < outline.length - 1 && len[j + 1] < u) j++; var f = (u - len[j]) / ((len[j + 1] - len[j]) || 1), p0 = outline[j], p1 = outline[(j + 1) % outline.length]; return { x: p0.x + (p1.x - p0.x) * f, y: p0.y + (p1.y - p0.y) * f }; }
    var us = [], base = total / 2, MIN = Math.min(17, total / n * .8), step = total / n * .06;
    for (i = 0; i < n; i++) us.push(base + (i / n) * total);
    for (var it = 0; it < 220 && n > 1; it++) {
      for (i = 1; i < n; i++) {
        var me = at(us[i]), near = [];
        for (k = 0; k < n; k++) if (k !== i) { var q = at(us[k]); if (Math.hypot(q.x - me.x, q.y - me.y) < MIN) near.push(q); }
        if (!near.length) continue;
        var sc = function (u) { var pp = at(u); return near.reduce(function (m, q) { return Math.min(m, Math.hypot(q.x - pp.x, q.y - pp.y)); }, 99); };
        us[i] += sc(us[i] + step) >= sc(us[i] - step) ? step : -step;
      }
    }
    return us.map(at);
  }
  /* ขยับดาววงใน ให้ห่างจากดาวอื่นพอกดถนัด และอยู่ในกรอบหัวใจ */
  function relax(inner, fixed, outline) {
    var c = { x: 50, y: 44 }, MIN = 19, it, i, j;
    function limit(p) {
      var th = Math.atan2(p.y - c.y, p.x - c.x), best = 1e9, rr = 30;
      for (var k = 0; k < outline.length; k += 3) { var q = outline[k], a = Math.atan2(q.y - c.y, q.x - c.x), dd = Math.abs(Math.atan2(Math.sin(a - th), Math.cos(a - th))); if (dd < best) { best = dd; rr = Math.hypot(q.x - c.x, q.y - c.y); } }
      var r = Math.hypot(p.x - c.x, p.y - c.y), mx = rr * .7;
      if (r > mx) { p.x = c.x + (p.x - c.x) * mx / r; p.y = c.y + (p.y - c.y) * mx / r; }
    }
    for (it = 0; it < 120; it++) {
      for (i = 0; i < inner.length; i++) {
        var all = fixed.concat(inner.filter(function (_, k) { return k !== i; }));
        for (j = 0; j < all.length; j++) {
          var dx = inner[i].x - all[j].x, dy = inner[i].y - all[j].y, d = Math.hypot(dx, dy) || .01;
          if (d < MIN) { var f = (MIN - d) / d * .25; inner[i].x += dx * f; inner[i].y += dy * f; }
        }
        limit(inner[i]);
      }
    }
    return inner;
  }
  function build() {
    var i, outline = dense(1);
    var d = 'M' + outline.filter(function (_, k) { return k % 8 === 0; }).map(function (p) { return p.x.toFixed(2) + ' ' + p.y.toFixed(2); }).join(' L') + ' Z';
    var base = document.createElementNS(NS, 'path'); base.setAttribute('d', d); base.setAttribute('class', 'base'); linesEl.appendChild(base);
    glow = document.createElementNS(NS, 'path'); glow.setAttribute('d', d); glow.setAttribute('class', 'glow'); glow.setAttribute('pathLength', '100'); linesEl.appendChild(glow);
    glow.style.strokeDasharray = '100'; glow.style.strokeDashoffset = '100';
    // ดาวประดับตามเส้นหัวใจ (กดไม่ได้ เล็กๆ)
    evenly(outline, 30, .5).forEach(function (p) { var dm = document.createElement('i'); dm.className = 'dim'; dm.style.left = p.x + '%'; dm.style.top = p.y + '%'; dm.style.setProperty('--d', rnd(0, 3) + 's'); starsEl.appendChild(dm); });
    // ดาวความทรงจำทุกดวงอยู่บนเส้นหัวใจ: ดวงแรก (รูปปก) อยู่ที่ปลายล่าง ที่เหลือเรียงรอบเส้นห่างเท่าๆ กัน
    var pos = onLine(outline, N);
    for (i = 0; i < N; i++) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'st' + (i === 0 ? ' cover' : ''); b.dataset.i = i;
      b.style.left = pos[i].x + '%'; b.style.top = pos[i].y + '%'; b.style.setProperty('--d', rnd(0, 2.2) + 's');
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
  starsEl.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.st'); if (!b) return;
    var c = starCenter(b), x = e.clientX || c.x, y = e.clientY || c.y;
    sparkle(x, y); kring();
    if (navigator.vibrate) { try { navigator.vibrate(12); } catch (err) {} }
  });
  starsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.st'); if (!b) return;
    openStar(+b.dataset.i, b);
  });
  function closeMem() {
    if (mem.hidden) return;
    mem.hidden = true; document.body.classList.remove('no-scroll');
    if (allLit && !TUSteps.isDone(2)) {
      TUSteps.complete(2);
      setTimeout(function () { var w = $('wish'); if (w) w.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }, 1100);
    }
  }
  $('memClose').addEventListener('click', closeMem);
  mem.addEventListener('click', function (e) { if (e.target === mem) closeMem(); });
  document.addEventListener('keydown', function (e) { if (mem.hidden) return; if (e.key === 'Escape') closeMem(); });

  /* ---------- ปลดล็อก: กล่องเรืองแสงทอง/ชมพู + ดาวตก 1 ดวง ---------- */
  function glowUnlock(sel) {
    document.querySelectorAll(sel).forEach(function (el) { el.classList.remove('glow-unlock'); void el.offsetWidth; el.classList.add('glow-unlock'); });
  }
  document.addEventListener('tu:step', function (e) {
    var n = e.detail && e.detail.n;
    if (n === 2) {
      glowUnlock('.wish-form textarea, .wish-send, .wish-sky');
      bigMeteor(); TUSfx.play('unlock'); setTimeout(function () { TUSfx.play('sparkle'); }, 500);
      setTimeout(function () { TUToast('💗 ปลดล็อกกล่องอธิษฐานแล้ว'); }, 1300);
    } else if (n === 3) {
      glowUnlock('.cta'); bigMeteor();
      setTimeout(function () { TUToast('💌 เย้! คุณปลดล็อกหัวใจฉันสำเร็จแล้ว'); TUSfx.play('sparkle'); }, 900);
    }
  });

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
