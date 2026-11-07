/* TUARAI - เอฟเฟกต์เพิ่มความโรแมนติก แยกตามสายธีม (ทำงานเฉพาะธีมที่ระบุ ไม่กระทบธีมอื่น)
   vintage : diary, envelope          กลีบกุหลาบ/หัวใจโปร่งแสงโปรยตอนเลื่อน + พิมพ์ดีดมีเสียง + กรอบจดหมายเรืองนีออนอ่อน
   game    : pixel, arcade            โทนไซเบอร์ชมพูม่วง + ป๊อปอัปข้อความซึ้งเมื่อเคลียร์ด่าน
   nature  : starry, sunset, hanami, sakura, garden   แสงระยิบแบบสุ่ม + ฟ้าไล่เฉดตามการเลื่อน + แตะแล้วมีระลอกแสง/ละอองตามนิ้ว */
(function () {
  'use strict';
  var body = document.body, cls = body.className;
  var theme = (cls.match(/theme-(diary|envelope|pixel|arcade|starry|sunset|hanami|sakura|garden)\b/) || [])[1];
  if (!theme) return;
  var G = /^(diary|envelope)$/.test(theme) ? 'vintage' : /^(pixel|arcade)$/.test(theme) ? 'game' : 'nature';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PAL = {
    vintage: ['#e8657f', '#f29bb0', '#c9344f', '#ffc2cf'], game: ['#ff4fd8', '#00f0ff', '#b04bff', '#ffe14a'],
    starry: ['#fff3c4', '#ffd98a', '#cfe0ff'], sunset: ['#fff1c9', '#ffd08a', '#ffb3a0'], hanami: ['#ffd9e6', '#ffe9b0', '#ffffff'],
    sakura: ['#ffffff', '#ffd0df', '#ffe9a8'], garden: ['#ffffff', '#ffe0ec', '#fff3b0']
  };
  var pal = G === 'nature' ? PAL[theme] : PAL[G];
  var sfx = function (n, a) { try { if (window.TUSfx) TUSfx.play(n, a); } catch (e) {} };
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function opened() { return body.classList.contains('opened'); }

  /* ================= แคนวาสกลาง ================= */
  var cv = document.createElement('canvas'); cv.className = 'rm-cv'; cv.setAttribute('aria-hidden', 'true');
  var cx = cv.getContext('2d'), W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  var P = [], raf = null, boost = 0, t0 = Date.now(), frame = 0;
  function fit() { W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; cx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  function dusk() { // 0..1 ความมืดของฟ้า (เฉพาะธีมพระอาทิตย์ตก)
    var h = document.documentElement.scrollHeight - H, prog = h > 0 ? Math.min(1, scrollY / h) : 0;
    return Math.min(1, prog * .75 + Math.min((Date.now() - t0) / 150000, 1) * .25);
  }
  function heartPath(s) {
    cx.beginPath(); cx.moveTo(0, s * .35);
    cx.bezierCurveTo(-s * 1.1, -s * .35, -s * .55, -s * 1.05, 0, -s * .45);
    cx.bezierCurveTo(s * .55, -s * 1.05, s * 1.1, -s * .35, 0, s * .35); cx.closePath();
  }
  function petalPath(s) {
    cx.beginPath(); cx.moveTo(0, -s);
    cx.bezierCurveTo(s * .95, -s * .6, s * .8, s * .55, 0, s);
    cx.bezierCurveTo(-s * .8, s * .55, -s * .95, -s * .6, 0, -s); cx.closePath();
  }
  function spark(s) { cx.beginPath(); cx.moveTo(0, -s); cx.quadraticCurveTo(0, 0, s, 0); cx.quadraticCurveTo(0, 0, 0, s); cx.quadraticCurveTo(0, 0, -s, 0); cx.quadraticCurveTo(0, 0, 0, -s); cx.closePath(); }

  function draw(p) {
    var k = p.life / p.max;
    switch (p.k) {
      case 'petal':
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.scale(1, .55 + .45 * Math.cos(p.fl)); cx.globalAlpha = p.a * Math.min(1, (p.max - p.life) / 20);
        cx.fillStyle = p.c; if (p.heart) heartPath(p.s); else petalPath(p.s); cx.fill(); cx.restore(); break;
      case 'spark':
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.globalAlpha = Math.sin(Math.PI * (1 - k)) * p.a;
        cx.fillStyle = p.c; cx.shadowColor = p.c; cx.shadowBlur = 8; spark(p.s * (.6 + .4 * Math.sin(Math.PI * (1 - k)))); cx.fill(); cx.restore(); break;
      case 'ring':
        cx.save(); cx.globalAlpha = k * .75; cx.strokeStyle = p.c; cx.lineWidth = 2 * k + .5; cx.shadowColor = p.c; cx.shadowBlur = 10;
        cx.beginPath(); if (G === 'game') { var q = p.s * (1 - k) + 8; cx.rect(p.x - q, p.y - q, q * 2, q * 2); } else cx.arc(p.x, p.y, p.s * (1 - k) + 6, 0, 6.3); cx.stroke(); cx.restore(); break;
      case 'dot':
        cx.save(); cx.globalAlpha = k; cx.fillStyle = p.c; cx.shadowColor = p.c; cx.shadowBlur = 6; cx.translate(p.x, p.y); cx.rotate(p.r);
        if (G === 'game') cx.fillRect(-p.s, -p.s, p.s * 2, p.s * 2); else if (p.heart) { heartPath(p.s * 1.6); cx.fill(); } else { cx.beginPath(); cx.arc(0, 0, p.s * k + .6, 0, 6.3); cx.fill(); }
        cx.restore(); break;
    }
  }
  function step() {
    frame++;
    cx.clearRect(0, 0, W, H);
    // ---- สร้างอนุภาคพื้นหลัง ----
    var on = opened() && !document.hidden && !reduce;
    if (on && G === 'vintage' && P.length < 80 && Math.random() < .025 + boost * .06) {
      var hr = Math.random() < .22;
      P.push({ k: 'petal', x: rnd(-20, W + 20), y: -20, vy: rnd(.5, 1.2) + boost * .25, sw: rnd(.4, 1.1), ph: rnd(0, 6.3), r: rnd(0, 6.3), vr: rnd(-.03, .03), fl: rnd(0, 6.3),
        s: hr ? rnd(5, 8) : rnd(6, 11), a: rnd(.45, .8), c: pick(pal), heart: hr, life: 9999, max: 9999 });
    }
    if (on && G === 'nature' && P.length < 40 && Math.random() < (theme === 'sakura' || theme === 'garden' ? .06 : .11)) {
      var d = theme === 'sunset' ? dusk() : 1, y = rnd(0, H), c = pick(pal);
      if (theme === 'sunset') { // กลางวัน: ประกายบนผิวน้ำ / ค่ำลง: ดาวบนฟ้า
        if (Math.random() < .55) y = H * rnd(.72, .98); else { y = H * rnd(0, .45); if (Math.random() > d * 1.1) y = -1; }
      }
      if (y >= 0) { var m = rnd(70, 150); P.push({ k: 'spark', x: rnd(0, W), y: y, s: rnd(2.5, theme === 'starry' ? 7.5 : 6), r: rnd(0, 1.5), a: rnd(.55, 1), c: c, life: m, max: m }); }
    }
    boost *= .93;
    // ---- วาด/อัปเดต ----
    for (var i = P.length - 1; i >= 0; i--) {
      var p = P[i];
      if (p.k === 'petal') {
        p.ph += .03; p.x += Math.sin(p.ph) * p.sw; p.y += p.vy + boost * .2; p.r += p.vr; p.fl += .04;
        if (p.y > H + 24) { P.splice(i, 1); continue; }
      } else {
        p.life -= 1;
        if (p.life <= 0) { P.splice(i, 1); continue; }
        if (p.k === 'dot') { p.x += p.vx; p.y += p.vy; p.vy += p.g || 0; p.vx *= .985; p.r += p.vr || 0; }
        if (p.k === 'spark') p.r += .004;
      }
      draw(p);
    }
    raf = (P.length || (on && (G !== 'game'))) && !document.hidden ? requestAnimationFrame(step) : null;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(step); }
  function add(p) { P.push(p); if (P.length > 160) P.splice(0, P.length - 160); kick(); }

  /* ---------- แตะ: ระลอกแสง + ละออง / เลื่อนนิ้ว: ละอองวิ่งตาม ---------- */
  var down = false, lx = 0, ly = 0;
  function ripple(x, y) {
    var c1 = pal[0], c2 = pal[1] || pal[0];
    add({ k: 'ring', x: x, y: y, s: 58, c: c1, life: 34, max: 34 });
    add({ k: 'ring', x: x, y: y, s: 34, c: c2, life: 24, max: 24 });
    var n = G === 'vintage' ? 5 : 9;
    for (var i = 0; i < n; i++) {
      var a = rnd(0, 6.3), v = rnd(.8, 2.6);
      add({ k: 'dot', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (G === 'vintage' ? .9 : .2), g: G === 'vintage' ? -.015 : .03, s: G === 'game' ? rnd(2, 3.5) : rnd(1.8, 3.4), r: rnd(0, 3), vr: rnd(-.1, .1), c: pick(pal), heart: G === 'vintage' || (G === 'nature' && Math.random() < .25), life: 38, max: 38 });
    }
  }
  function trail(x, y) {
    for (var i = 0; i < 2; i++) add({ k: 'dot', x: x + rnd(-4, 4), y: y + rnd(-4, 4), vx: rnd(-.5, .5), vy: rnd(-.7, .1), g: .012, s: rnd(1.6, 3), r: 0, c: pick(pal), life: 30, max: 30 });
  }
  if (!reduce) {
    addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      down = true; lx = e.clientX; ly = e.clientY; ripple(lx, ly);
    }, { passive: true });
    addEventListener('pointermove', function (e) {
      if (!down || e.pointerType !== 'touch') return;
      if (Math.hypot(e.clientX - lx, e.clientY - ly) < 16) return;
      lx = e.clientX; ly = e.clientY; trail(lx, ly);
    }, { passive: true });
    ['pointerup', 'pointercancel'].forEach(function (n) { addEventListener(n, function () { down = false; }, { passive: true }); });
    var sy = scrollY;
    addEventListener('scroll', function () {
      var d = Math.abs(scrollY - sy); sy = scrollY; boost = Math.min(boost + d / 40, 6); if (opened()) kick();
    }, { passive: true });
  }

  /* ================= สาย VINTAGE: พิมพ์ดีด + นีออนอ่อน ================= */
  function vintage() {
    var card = document.querySelector('#letterOverlay .letter-card'), lastClack = 0, n = 0, typing = false;
    function clack(ch) {
      var S = window.TUSfx; if (!S || !S.noise) return;
      var t = Date.now(); if (t - lastClack < 38) return; lastClack = t;
      if (ch === ' ') { S.noise({ f: 900, to: 500, d: .05, v: .05, ft: 'lowpass', q: .5 }); return; }
      S.noise({ f: 2600 + Math.random() * 1200, d: .03, v: .09, q: 3 });          // ก๊อก เสียงแป้นกระทบ
      S.tone({ f: 150 + Math.random() * 40, to: 90, d: .05, v: .06, type: 'triangle' }); // ตุ้บ ก้านพิมพ์
    }
    document.addEventListener('tu:letter', function () { n = 0; typing = true; if (card) card.classList.add('rm-typing'); });
    document.addEventListener('tu:type', function () {
      if (!typing) return; n++;
      var el = document.getElementById('letterTyped'), ch = el ? el.textContent.slice(-1) : '';
      clack(ch);
      if (n % 34 === 0) { // ขึ้นบรรทัดใหม่ ติ๊ง!
        var S = window.TUSfx; if (S) { S.tone({ f: 2349, d: .5, v: .05, a: .003 }); S.tone({ f: 3136, t: .02, d: .35, v: .02, a: .003 }); }
      }
    });
    document.addEventListener('tu:letterdone', function () { typing = false; if (card) card.classList.remove('rm-typing'); });
    document.getElementById('letterOverlay') && new MutationObserver(function () {
      var ov = document.getElementById('letterOverlay');
      if (!ov.classList.contains('open')) { typing = false; if (card) card.classList.remove('rm-typing'); }
    }).observe(document.getElementById('letterOverlay'), { attributes: true, attributeFilter: ['class'] });
  }

  /* ================= สาย GAME: ไซเบอร์เลิฟ + ป๊อปอัปเคลียร์ด่าน ================= */
  function game() {
    var grid = document.createElement('div'); grid.className = 'rm-grid'; grid.setAttribute('aria-hidden', 'true');
    grid.innerHTML = '<i class="sun"></i><i class="floor"></i>'; document.body.insertBefore(grid, document.body.firstChild);
    var name = (window.SITE_CONFIG && SITE_CONFIG.partnerName) || '';
    var shown = false, skipped = false, pop = null;
    function build() {
      pop = document.createElement('div'); pop.className = 'rm-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'true');
      pop.innerHTML = '<div class="rm-box"><div class="rm-bar"><i></i><i></i><i></i><span>SYSTEM_MESSAGE.exe</span></div>' +
        '<div class="rm-in"><p class="rm-ach">★ ACHIEVEMENT UNLOCKED ★</p>' +
        '<h3 class="rm-t">ผ่านทุกด่านแล้ว!</h3>' +
        '<p class="rm-l l1"></p><p class="rm-l l2"></p><p class="rm-l l3"></p>' +
        '<button type="button" class="rm-ok">▶ CONTINUE</button></div></div>';
      pop.querySelector('.l1').textContent = (name ? name + ' ' : '') + 'เธอเคลียร์ทุกด่านได้แล้วนะ';
      pop.querySelector('.l2').textContent = 'แต่ด่านที่ฉันแพ้ราบคาบตั้งแต่ต้น';
      pop.querySelector('.l3').textContent = 'คือด่านที่ได้เจอเธอ 💗 และฉันไม่คิดจะขอเล่นใหม่เลย';
      document.body.appendChild(pop);
      pop.querySelector('.rm-ok').addEventListener('click', function () { sfx('tap'); pop.classList.remove('show'); setTimeout(function () { pop.hidden = true; }, 300); });
    }
    function show() {
      if (shown || skipped) return; shown = true;
      if (!pop) build();
      pop.hidden = false; void pop.offsetWidth; pop.classList.add('show');
      sfx('unlock'); setTimeout(function () { sfx('sparkle'); }, 300);
      var r = pop.querySelector('.rm-box').getBoundingClientRect();
      for (var i = 0; i < 4; i++) setTimeout(function () { ripple(r.left + Math.random() * r.width, r.top + Math.random() * r.height); }, i * 220);
      // พิมพ์ทีละบรรทัด
      [].forEach.call(pop.querySelectorAll('.rm-l'), function (l, i) { l.style.animationDelay = (.5 + i * .9) + 's'; });
    }
    document.addEventListener('tu:skipped', function () { skipped = true; });
    document.addEventListener('tu:gamewin', function () { setTimeout(show, 350); });            // pixel: มินิเกมหัวใจ
    document.addEventListener('tu:step', function (e) {                                          // arcade: เก็บหัวใจครบ
      if (theme === 'arcade' && e.detail && e.detail.n === 2) setTimeout(function () { if (!skipped) show(); }, 700);
    });
  }

  /* ================= สาย NATURE: ฟ้าไล่เฉดตะวันตกดิน ================= */
  function nature() {
    if (theme !== 'sunset') return;
    var d = document.createElement('div'); d.className = 'rm-dusk'; d.setAttribute('aria-hidden', 'true'); document.body.insertBefore(d, document.body.firstChild);
    function upd() { d.style.opacity = dusk().toFixed(3); }
    upd(); setInterval(upd, 2000); addEventListener('scroll', upd, { passive: true });
  }

  function init() {
    document.body.appendChild(cv); fit(); addEventListener('resize', fit);
    if (G === 'vintage') vintage(); else if (G === 'game') game(); else nature();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    document.addEventListener('tu:opened', kick); kick();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
