/* ธีมแมวกวักนำโชค: แตะแมวเปิดม่าน -> ลากเส้นจับคู่ข้อความกับรูป (ถูก=พลุ ผิด=แมวเศร้า) -> ผนังความทรงจำ -> จดหมาย */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var NAME = (window.SITE_CONFIG && SITE_CONFIG.partnerName) || '';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- พลุ ---------- */
  var cv = $('hanabi'), cx = cv.getContext('2d'), W, H, parts = [], rockets = [], running = false;
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var COLS = ['#ffd166', '#ff6b81', '#ff9f5c', '#fff6e8', '#9be7ff', '#ffb3c4', '#b8f27c'];
  function fit() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  fit(); addEventListener('resize', fit);
  function burst(x, y, n, size) {
    var c1 = pick(COLS), c2 = pick(COLS);
    for (var i = 0; i < n; i++) {
      var a = Math.PI * 2 * i / n + rnd(-.1, .1), v = rnd(1.2, 1) * (size || 4.5) * rnd(.7, 1.1);
      parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, d: rnd(.012, .022), c: i % 2 ? c1 : c2, s: rnd(1.6, 2.8) });
    }
    loop();
  }
  function rocket(tx, ty, big) {
    rockets.push({ x: tx + rnd(-30, 30), y: H + 10, tx: tx, ty: ty, big: big });
    TUSfx.play('hanabiUp'); loop();
  }
  function loop() {
    if (running || reduce) { if (reduce && parts.length === 0 && rockets.length) { var r = rockets.shift(); burst(r.tx, r.ty, 20, 3); } return; }
    running = true; requestAnimationFrame(tick);
  }
  function tick() {
    cx.clearRect(0, 0, W, H);
    for (var i = rockets.length - 1; i >= 0; i--) {
      var r = rockets[i]; r.y -= Math.max(5, (r.y - r.ty) * .06); r.x += (r.tx - r.x) * .05;
      cx.fillStyle = '#fff6e8'; cx.globalAlpha = .9; cx.fillRect(r.x - 1, r.y, 2, 9); cx.globalAlpha = 1;
      if (r.y <= r.ty + 4) { rockets.splice(i, 1); burst(r.x, r.y, r.big ? 70 : 44, r.big ? 5.4 : 4); TUSfx.play('hanabi'); }
    }
    for (var j = parts.length - 1; j >= 0; j--) {
      var p = parts[j]; p.vy += .045; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.l -= p.d;
      if (p.l <= 0) { parts.splice(j, 1); continue; }
      cx.globalAlpha = Math.max(0, p.l); cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, p.s * (.5 + p.l * .6), 0, 6.3); cx.fill();
    }
    cx.globalAlpha = 1;
    if (parts.length || rockets.length) requestAnimationFrame(tick); else { running = false; cx.clearRect(0, 0, W, H); }
  }
  function show(n, big) { for (var i = 0; i < n; i++) (function (k) { setTimeout(function () { rocket(rnd(W * .15, W * .85), rnd(H * .12, H * .42), big); }, k * 380); })(i); }

  /* ---------- แมว ---------- */
  var catMain = $('catMain'), say = $('catSay'), sayT = null, stT = null;
  var LINES = {
    ok: ['เมี๊ยว~ ถูกต้อง! เก่งมาก {n}', 'ใช่เลย! จำได้แม่นจัง 🎉', 'ว้าว ตรงเป๊ะ! ได้เหรียญไปเลย 🪙', 'นยา~ ความทรงจำดีจริงๆ'],
    bad: ['ฮึ่ม! ยังไม่ใช่นะ ลองใหม่ซิ', 'ผิดนะเมี๊ยว… คิดดีๆ นะ {n}', 'อุ๊ย เส้นขาดเลย โยงใหม่ได้นะ', 'ไม่ใช่คู่นี้นะ นึกอีกที~'],
    idle: ['เมี๊ยว! ทำไมนิ่งจัง รีบโยงเร็วๆ นะ', 'ฮึ่ม… ถ้าไม่โยงเดี๋ยวแมวเอาเหรียญไปนะ', 'แตะโคมไฟแล้วแตะรูปก็ได้นะ {n}'],
    round: ['ผ่านรอบนี้แล้ว! ไปรอบต่อไปกัน 🏮'],
    win: ['จับคู่ครบแล้ว! {n} เก่งที่สุดเลย 🎆']
  };
  function setCat(state, ms) {
    ['happy', 'sad', 'angry'].forEach(function (s) { catMain.classList.remove(s); });
    clearTimeout(stT); if (!state) return;
    void catMain.getBoundingClientRect(); catMain.classList.add(state);
    stT = setTimeout(function () { catMain.classList.remove(state); }, ms || 1800);
  }
  function speak(kind, ms) {
    var t = pick(LINES[kind]).replace(/\{n\}/g, NAME);
    say.textContent = t; say.hidden = false; say.style.animation = 'none'; void say.offsetWidth; say.style.animation = '';
    clearTimeout(sayT); sayT = setTimeout(function () { say.hidden = true; }, ms || 2600);
  }

  /* ---------- ประตูม่านโนเระ: แตะแมว 3 ครั้ง ---------- */
  var gate = $('gate'), taps = 0, opened = false;
  $('gateCat').addEventListener('click', function () {
    if (opened) return; taps++;
    [].forEach.call($('gateDots').children, function (d, i) { d.classList.toggle('on', i < taps); });
    var g = $('catGate'); g.classList.remove('happy'); void g.getBoundingClientRect(); g.classList.add('happy');
    TUSfx.play('meow'); TUSfx.play('koto', taps * 2);
    var r = this.getBoundingClientRect(); TUFx.float(r.left + r.width / 2, r.top + 20, '🪙');
    $('gateHint').textContent = taps < 3 ? 'อีก ' + (3 - taps) + ' ครั้ง!' : 'เปิดม่านแล้ว! 🎆';
    if (taps >= 3) {
      opened = true; gate.classList.add('open'); TUSfx.play('taiko'); setTimeout(function () { TUSfx.play('taiko'); }, 220);
      show(3, true); setTimeout(function () { window.TU_OPEN(); }, 900);
    }
  });
  document.addEventListener('tu:opened', function () {
    setTimeout(function () { setCat('happy', 1500); TUSfx.play('meow'); say.textContent = 'ยินดีต้อนรับสู่งานเทศกาลนะ ' + NAME + ' เมี๊ยว! ลากเส้นจับคู่ให้ครบเลย'; say.hidden = false; clearTimeout(sayT); sayT = setTimeout(function () { say.hidden = true; }, 4200); }, 500);
    armIdle();
  });

  /* ---------- เกมจับคู่ ---------- */
  var pairs = []; try { pairs = JSON.parse($('pairData').textContent) || []; } catch (e) { pairs = []; }
  var N = pairs.length, board = $('board'), wires = $('wires'), colL = $('colL'), colR = $('colR');
  var rounds = [], round = 0, doneCount = 0, mistakes = 0, locked = false, finished = false, wireList = [], sel = null, drag = null;
  var rc = N > 4 ? 2 : 1, per = Math.ceil(N / rc);
  for (var q = 0; q < rc; q++) rounds.push(pairs.slice(q * per, q * per + per).map(function (p, i) { return { id: q * per + i, url: p[0], cap: p[1] }; }));
  rounds = rounds.filter(function (r) { return r.length; });
  $('coinLbl').textContent = '0';

  function mk(tag, cls, html) { var e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; }
  function buildRound(r) {
    colL.innerHTML = ''; colR.innerHTML = ''; wires.innerHTML = ''; wireList = []; sel = null;
    var items = rounds[r], left = shuffle(items), right = shuffle(items), tries = 0;
    while (items.length > 1 && tries++ < 8 && right.every(function (x, i) { return x === left[i]; })) right = shuffle(items);
    left.forEach(function (it, i) {
      var li = mk('li', 'it lan enter'); li.dataset.id = it.id; li.dataset.side = 'l'; li.style.animationDelay = (i * .07) + 's';
      var s = mk('span', 'lt'); s.textContent = it.cap; li.appendChild(s); li.appendChild(mk('i', 'dot')); colL.appendChild(li);
    });
    right.forEach(function (it, i) {
      var li = mk('li', 'it pho enter'); li.dataset.id = it.id; li.dataset.side = 'r'; li.style.animationDelay = (i * .07 + .05) + 's';
      var im = new Image(); im.src = it.url; im.alt = 'รูปความทรงจำ'; im.draggable = false; li.appendChild(im); li.appendChild(mk('i', 'dot')); colR.appendChild(li);
    });
    $('roundLbl').textContent = 'รอบ ' + (r + 1) + '/' + rounds.length;
  }
  function anchor(el) {
    var b = board.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: (el.dataset.side === 'l' ? r.right : r.left) - b.left, y: r.top + r.height / 2 - b.top };
  }
  function curve(a, b) { var dx = Math.max(40, Math.abs(b.x - a.x) * .5), s = a.x <= b.x ? 1 : -1; return 'M' + a.x + ' ' + a.y + ' C' + (a.x + dx * s) + ' ' + a.y + ' ' + (b.x - dx * s) + ' ' + b.y + ' ' + b.x + ' ' + b.y; }
  function path(cls, a, b) { var p = document.createElementNS(NS, 'path'); p.setAttribute('class', 'w ' + cls); p.setAttribute('d', curve(a, b)); p.setAttribute('pathLength', '1'); wires.appendChild(p); return p; }
  addEventListener('resize', function () { wireList.forEach(function (w) { w.p.setAttribute('d', curve(anchor(w.l), anchor(w.r))); }); });

  function pt(e) { var b = board.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; }
  board.addEventListener('pointerdown', function (e) {
    var it = e.target.closest('.it');
    if (!it) { /* แตะพลาดใกล้ๆ โคม/รูป ให้ถือว่าเลือกอันที่ใกล้ที่สุด (รัศมี 26px) */
      var bd = 26, bx = null;
      [].forEach.call(board.querySelectorAll('.it:not(.done)'), function (x) {
        var r = x.getBoundingClientRect(), dd = Math.hypot(Math.max(r.left - e.clientX, 0, e.clientX - r.right), Math.max(r.top - e.clientY, 0, e.clientY - r.bottom));
        if (dd < bd) { bd = dd; bx = x; }
      });
      it = bx;
    }
    if (!it || it.classList.contains('done') || locked || finished) return;
    e.preventDefault(); lastAct = Date.now();
    drag = { it: it, sx: e.clientX, sy: e.clientY, moved: false, p: null };
    it.classList.add('hold'); TUSfx.play('soft');
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 9) { drag.moved = true; drag.p = path('w-drag', anchor(drag.it), pt(e)); }
    if (drag.moved) drag.p.setAttribute('d', curve(anchor(drag.it), pt(e)));
  });
  function endDrag(e) {
    if (!drag) return; var d = drag; drag = null; d.it.classList.remove('hold'); if (d.p) d.p.remove();
    if (d.moved) {
      var t = document.elementFromPoint(e.clientX, e.clientY), o = t && t.closest ? t.closest('.it') : null;
      if (sel) { sel.classList.remove('sel'); sel = null; }
      if (o && o !== d.it && o.dataset.side !== d.it.dataset.side && !o.classList.contains('done')) attempt(d.it, o);
      return;
    }
    /* แตะ: เลือกอันแรกแล้วแตะอันที่สอง */
    if (sel && sel !== d.it && sel.dataset.side !== d.it.dataset.side) { var s = sel; sel = null; s.classList.remove('sel'); attempt(s, d.it); }
    else if (sel === d.it) { sel.classList.remove('sel'); sel = null; }
    else { if (sel) sel.classList.remove('sel'); sel = d.it; sel.classList.add('sel'); }
  }
  document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', function () { if (drag) { drag.it.classList.remove('hold'); if (drag.p) drag.p.remove(); drag = null; } });

  function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
  function attempt(a, b) {
    var l = a.dataset.side === 'l' ? a : b, r = a.dataset.side === 'l' ? b : a;
    var A = anchor(l), B = anchor(r), m = mid(A, B), bb = board.getBoundingClientRect(), sx = bb.left + m.x, sy = bb.top + m.y;
    if (l.dataset.id === r.dataset.id) {
      var p = path('w-ok', A, B); wireList.push({ l: l, r: r, p: p });
      l.classList.add('done'); r.classList.add('done'); doneCount++; $('coinLbl').textContent = doneCount;
      TUSfx.play('chime', doneCount + 1); TUSfx.play('sparkle'); TUSfx.play('meow');
      TUFx.float(sx, sy, '🪙'); rocket(sx, Math.max(60, sy - 140), false); burst(sx, sy, 26, 3.4);
      setCat('happy', 1500); speak('ok');
      var all = [].every.call(board.querySelectorAll('.it'), function (x) { return x.classList.contains('done'); });
      if (all) setTimeout(roundDone, 900);
    } else {
      mistakes++;
      var bp = path('w-bad', A, B);
      var g = document.createElementNS(NS, 'g');
      [-10, 0, 10].forEach(function (o) { var ln = document.createElementNS(NS, 'line'); ln.setAttribute('class', 'claw'); ln.setAttribute('x1', m.x - 12 + o); ln.setAttribute('y1', m.y - 14); ln.setAttribute('x2', m.x + 6 + o); ln.setAttribute('y2', m.y + 14); g.appendChild(ln); });
      wires.appendChild(g); setTimeout(function () { bp.remove(); g.remove(); }, 950);
      [l, r].forEach(function (x) { x.classList.remove('shake'); void x.offsetWidth; x.classList.add('shake'); });
      TUSfx.play('sad'); setCat('angry', 700); setTimeout(function () { setCat('sad', 2000); }, 720); speak('bad', 3000);
    }
  }
  function roundDone() {
    if (round < rounds.length - 1) {
      locked = true; speak('round', 2200); show(2, false); TUSfx.play('taiko'); setCat('happy', 1500);
      setTimeout(function () { board.querySelectorAll('.it').forEach(function (x) { x.classList.add('out'); }); wires.style.opacity = 0; }, 900);
      setTimeout(function () { round++; wires.style.opacity = 1; buildRound(round); locked = false; }, 1600);
    } else finish(false);
  }
  function finish(quiet) {
    if (finished) return; finished = true; locked = true;
    if (!quiet) {
      show(8, true); TUSfx.play('fanfare'); setCat('happy', 5000); speak('win', 5000);
      TUToast(mistakes ? '🎉 จับคู่ครบ! ผิด ' + mistakes + ' ครั้ง' : '🎉 จับคู่ครบ ไม่ผิดเลยสักครั้ง!');
      TUFx.confetti(innerWidth / 2, innerHeight * .35, 70, ['#ffd166', '#ff6b81', '#fff6e8', '#9be7ff'], .9);
    }
    setTimeout(function () { TUSteps.complete(2); var w = $('wall'); if (w && !quiet) w.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }, quiet ? 0 : 2600);
  }

  /* ---------- แมวขี้บ่นเมื่อนิ่งนาน ---------- */
  var lastAct = Date.now(), idleT = null;
  function armIdle() {
    clearInterval(idleT);
    idleT = setInterval(function () {
      if (finished || locked || document.hidden) return;
      if (Date.now() - lastAct > 14000) { lastAct = Date.now(); setCat('angry', 800); TUSfx.play('meow'); speak('idle', 3200); }
    }, 3000);
  }

  document.addEventListener('tu:skipped', function () {
    if (finished) return; finished = true; locked = true; clearInterval(idleT);
    colL.innerHTML = ''; colR.innerHTML = ''; wires.innerHTML = '';
    $('coinLbl').textContent = N; $('roundLbl').textContent = 'ข้ามเกมแล้ว'; setCat('happy', 1500);
  });
  document.addEventListener('tu:letter', function () { show(4, true); setCat('happy', 3000); });

  if (N) buildRound(0); else { finished = true; setTimeout(function () { TUSteps.complete(2, true); }, 0); }
})();
