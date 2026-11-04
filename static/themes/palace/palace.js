/* ธีมวังซากุระ: เข้าวัง -> คุยแบบวิชวลโนเวล (เลือกคำตอบ) -> ชมรูป -> จดหมาย */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var NAME = (window.SITE_CONFIG && SITE_CONFIG.partnerName) || '';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ผืนผ้าใบ: กลีบซากุระ + หิ่งห้อยตามนิ้ว ---------- */
  var cv = $('petals'), cx = cv.getContext('2d'), W, H, P = [], F = [], wind = 0;
  var MAX = (navigator.hardwareConcurrency || 8) <= 4 ? 28 : 46, dpr = Math.min(2, window.devicePixelRatio || 1);
  var COLORS = ['#ffc2d6', '#ffb0c8', '#ffd9e5', '#ff9ec0'];
  function fit() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  fit(); addEventListener('resize', fit);
  function petal(x, y, burst) {
    return { x: x == null ? Math.random() * W : x, y: y == null ? -20 : y, s: 6 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * .06,
      vx: burst ? (Math.random() - .5) * 5 : Math.random() * .5, vy: burst ? Math.random() * 1.5 : .5 + Math.random() * .9, ph: Math.random() * 6, c: COLORS[(Math.random() * 4) | 0], tmp: !!burst };
  }
  for (var i = 0; i < MAX; i++) P.push(petal(null, Math.random() * innerHeight));
  function frame() {
    cx.clearRect(0, 0, W, H); wind *= .965;
    for (var i = P.length - 1; i >= 0; i--) {
      var p = P[i]; p.ph += .03; p.vx += wind * .04; p.vx *= .985;
      p.x += p.vx + Math.sin(p.ph) * .5; p.y += p.vy; p.r += p.vr;
      if (p.y > H + 20 || p.x > W + 40 || p.x < -60) { if (p.tmp) { P.splice(i, 1); continue; } p.y = -20; p.x = Math.random() * W; p.vx = Math.random() * .5; }
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.globalAlpha = .85;
      cx.beginPath(); cx.ellipse(0, 0, p.s * .55, p.s, 0, 0, 6.3); cx.fill(); cx.restore();
    }
    for (var j = F.length - 1; j >= 0; j--) {
      var f = F[j]; f.l -= .02; f.x += f.vx; f.y += f.vy;
      if (f.l <= 0) { F.splice(j, 1); continue; }
      var g = cx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 9);
      g.addColorStop(0, 'rgba(255,236,170,' + f.l + ')'); g.addColorStop(1, 'rgba(255,236,170,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(f.x, f.y, 9, 0, 6.3); cx.fill();
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) frame();
  function burst(x, y, n) { for (var i = 0; i < n; i++) P.push(petal(x + Math.random() * 40 - 20, y + Math.random() * 30, true)); }
  var lastFly = 0;
  document.addEventListener('pointermove', function (e) {
    if (reduce || e.timeStamp - lastFly < 45) return; lastFly = e.timeStamp;
    if (F.length < 40) F.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * .5, vy: -.2 - Math.random() * .4, l: 1 });
  });

  /* ---------- ประตูวัง ---------- */
  var gate = $('gate'), opened = false;
  function openGate() {
    if (opened) return; opened = true;
    gate.classList.add('open'); TUSfx.play('page'); setTimeout(function () { TUSfx.play('koto', 0); TUSfx.play('koto', 4); }, 250);
    burst(W / 2, H / 2, 30); wind = 6;
    setTimeout(function () { window.TU_OPEN(); }, 700);
  }
  $('gateBtn').addEventListener('click', openGate);

  /* ---------- ลูกเล่นฉาก ---------- */
  var scale = 0;
  document.querySelectorAll('[data-tree]').forEach(function (t, k) {
    t.addEventListener('click', function (e) {
      t.classList.remove('sway'); void t.getBoundingClientRect(); t.classList.add('sway');
      burst(e.clientX, e.clientY, 22); wind += k ? -3 : 3; TUSfx.play('koto', scale++); TUSfx.play('sparkle');
    });
  });
  document.querySelectorAll('.hang-lantern').forEach(function (l) {
    l.addEventListener('click', function () {
      l.classList.toggle('lit'); TUSfx.play('koto', +l.dataset.n * 2 + 1);
      var r = l.getBoundingClientRect(); TUFx.float(r.left + r.width / 2, r.bottom, ['✨', '🌸', '💗', '🏮', '⭐'][+l.dataset.n]);
    });
  });
  $('moonOrb').addEventListener('click', function () {
    var m = $('moonOrb'); m.classList.add('glow'); setTimeout(function () { m.classList.remove('glow'); }, 1200);
    TUSfx.play('chime', 5); burst(W * .8, 80, 14);
  });
  var sp = $('spirit');
  sp.addEventListener('click', function (e) {
    e.stopPropagation(); sp.classList.remove('happy'); void sp.offsetWidth; sp.classList.add('happy');
    TUSfx.play('koto', (Math.random() * 8) | 0); var r = sp.getBoundingClientRect(); TUFx.float(r.left + r.width / 2, r.top + 20, '💗');
  });

  /* ---------- วิชวลโนเวล ---------- */
  var data = [];
  try { data = JSON.parse($('vnData').textContent) || []; } catch (e) { data = []; }
  function fmt(s) { return String(s || '').replace(/\{name\}/g, NAME); }
  var PAIRS = ['อื่ม เข้าใจแล้ว', 'ได้เลย จดไว้แล้วนะ', 'ขอบคุณที่ตอบนะ', 'ดีใจจังที่ได้ฟัง'];
  var script = [{ t: 'say', text: 'ยินดีต้อนรับสู่วังซากุระนะ ' + NAME + ' 🌸\nมีเรื่องอยากคุยด้วยนิดหน่อย ขอเวลาสักครู่นะ' }];
  data.forEach(function (d, i) {
    script.push({ t: 'ask', q: fmt(d.q), options: d.options.map(fmt), reply: fmt(d.reply), i: i });
  });
  script.push({ t: 'end', text: 'ขอบคุณที่ตอบทุกข้อเลยนะ ' + NAME + '\nเดี๋ยวสรุปที่เธอตอบให้ดูนะ 📜' });

  var box = $('vnBox'), txt = $('vnText'), nxt = $('vnNext'), chs = $('vnChoices'), dots = $('vnDots');
  var step = -1, typing = null, full = '', onDone = null, answers = [], started = false, finished = false, waitTap = null;
  dots.innerHTML = data.map(function () { return '<i></i>'; }).join('');
  function setDots(n) { [].forEach.call(dots.children, function (d, i) { d.className = i < n ? 'on' : (i === n ? 'cur' : ''); }); }
  function type(text, done) {
    clearInterval(typing); full = text; txt.textContent = ''; nxt.hidden = true; var k = 0;
    onDone = function () { clearInterval(typing); typing = null; txt.textContent = full; if (done) done(); };
    if (reduce) { onDone(); return; }
    typing = setInterval(function () {
      k++; txt.textContent = full.slice(0, k);
      if (k % 3 === 0) TUSfx.play('vn');
      if (k >= full.length) onDone();
    }, 28);
  }
  function waitNext(fn) { nxt.hidden = false; waitTap = fn; }
  box.addEventListener('click', function () {
    if (typing) { onDone(); return; }
    if (waitTap) { var f = waitTap; waitTap = null; nxt.hidden = true; TUSfx.play('soft'); f(); }
  });
  function show(i) {
    step = i; chs.innerHTML = ''; var s = script[i];
    if (!s) return;
    if (s.t === 'say') type(s.text, function () { waitNext(function () { show(i + 1); }); });
    else if (s.t === 'end') type(s.text, function () { waitNext(finish); });
    else {
      setDots(s.i);
      type(s.q, function () {
        s.options.forEach(function (o, k) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'vn-choice'; b.textContent = o; b.style.setProperty('--k', k);
          b.addEventListener('click', function (e) {
            e.stopPropagation(); if (b.classList.contains('picked') || chs.classList.contains('done')) return;
            chs.classList.add('done'); b.classList.add('picked'); TUSfx.play('pick');
            answers[s.i] = { q: s.q, a: o }; setDots(s.i + 1);
            var r = b.getBoundingClientRect(); TUFx.float(r.left + 40, r.top, '🌸'); burst(r.left + 40, r.top, 8);
            setTimeout(function () {
              chs.innerHTML = ''; chs.classList.remove('done'); sp.classList.add('happy'); setTimeout(function () { sp.classList.remove('happy'); }, 700);
              type(s.reply || PAIRS[s.i % PAIRS.length], function () { waitNext(function () { show(i + 1); }); });
            }, 450);
          });
          chs.appendChild(b);
        });
      });
    }
  }
  function renderSummary() {
    var done = answers.filter(Boolean);
    if (!done.length) return;
    $('vnList').innerHTML = '';
    done.forEach(function (a, i) {
      var li = document.createElement('li'), sm = document.createElement('small'), b = document.createElement('b');
      sm.textContent = (i + 1) + '. ' + a.q; b.textContent = '→ ' + a.a; li.appendChild(sm); li.appendChild(b); $('vnList').appendChild(li);
    });
    $('vnSummary').hidden = false; TUSfx.play('page'); setTimeout(function () { TUSfx.play('koto', 2); TUSfx.play('koto', 5); }, 300);
    setTimeout(function () { $('vnSummary').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }, 120);
  }
  function finish() {
    if (finished) return; finished = true; txt.textContent = 'ไว้เจอกันอีกนะ 🌸'; nxt.hidden = true;
    renderSummary(); burst(W / 2, 0, 40); TUFx.confetti(innerWidth / 2, innerHeight * .4, 50, ['#ffc2d6', '#e8c170', '#fff'], .9);
    setTimeout(function () { TUSteps.complete(2); }, 700);
  }
  function startVN() {
    if (started) return; started = true;
    if (!script.length) { finish(); return; }
    setTimeout(function () { show(0); }, 900);
  }
  document.addEventListener('tu:opened', function () {
    TUSfx.play('padStart'); startVN();
  });
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.sfx-btn') && !TUSfx.isMuted()) TUSfx.play('padStart'); });
  document.addEventListener('tu:skipped', function () {
    finished = true; clearInterval(typing); typing = null; waitTap = null; chs.innerHTML = '';
    txt.textContent = answers.filter(Boolean).length ? 'ไว้เจอกันอีกนะ 🌸' : '(ข้ามบทสนทนาแล้ว)'; nxt.hidden = true; setDots(data.length);
    renderSummary();
  });
  document.addEventListener('tu:letter', function () { burst(W / 2, 0, 30); });
  window.addEventListener('pagehide', function () { TUSfx.play('padStop'); });
})();
