(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], DLG = window.TU_DIALOG || [], CFG = window.SITE_CONFIG || {};
  var NAME = CFG.partnerName || 'เธอ';
  var $ = function (id) { return document.getElementById(id); };
  var sfx = function (n) { try { if (window.TUSfx) TUSfx.play(n); } catch (e) {} };
  var rep = function (s) { return String(s || '').replace(/\{name\}/g, NAME); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var cv = $('cv'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  ctx.imageSmoothingEnabled = false;
  $('gArt').innerHTML = '<svg class="doo" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#e6f4ff" stroke="#b9a8ff" stroke-width="4"/><circle cx="50" cy="50" r="30" fill="none" stroke="#ffc4ec" stroke-width="6"/><circle cx="50" cy="50" r="9" fill="#fff" stroke="#b9a8ff" stroke-width="3"/><path d="M50 74 C20 52 28 30 42 34 C46 36 50 40 50 40 C50 40 54 36 58 34 C72 30 80 52 50 74Z" fill="#ff7eb8" opacity=".85"/></svg>';
  $('cardArt').innerHTML = '<svg class="doo" viewBox="0 0 120 90"><rect x="6" y="8" width="108" height="74" rx="6" fill="#fff" stroke="#b9a8ff" stroke-width="3"/><rect x="6" y="8" width="108" height="16" rx="6" fill="#ffc4ec"/><circle cx="18" cy="16" r="3" fill="#fff"/><circle cx="28" cy="16" r="3" fill="#fff"/><path d="M60 70 C34 52 40 36 52 40 C56 41 60 46 60 46 C60 46 64 41 68 40 C80 36 86 52 60 70Z" fill="#ff7eb8"/></svg>';

  /* ---------- พื้นผิวพิกเซล ---------- */
  function mk(fn) { var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g); return c; }
  function R(g, col, x, y, w, h) { g.fillStyle = col; g.fillRect(x, y, w, h); }
  function txt(g, s, x, y, col, size) { g.fillStyle = col; g.font = 'bold ' + (size || 11) + 'px monospace'; g.textAlign = 'center'; g.fillText(s, x, y); }
  function bricks(g, base, line) { R(g, base, 0, 0, 64, 64); for (var y = 0; y < 64; y += 8) { R(g, line, 0, y, 64, 1); for (var x = (y / 8) % 2 ? 0 : 8; x < 64; x += 16) R(g, line, x, y, 1, 8); } }
  function win(g, x, y, w, h) { R(g, '#fff', x - 2, y - 2, w + 4, h + 4); R(g, '#bfe9ff', x, y, w, h); R(g, '#e8f8ff', x + 3, y + 3, 6, 3); R(g, '#e8f8ff', x + 3, y + 7, 3, 3); R(g, '#9fd6f2', x + w / 2, y, 1, h); }
  function awn(g, c1, c2) { for (var x = 0; x < 64; x += 8) R(g, (x / 8) % 2 ? c1 : c2, x, 0, 8, 12); R(g, 'rgba(0,0,0,.12)', 0, 12, 64, 2); }
  var T = [null];
  T[1] = mk(function (g) { bricks(g, '#ffc4e4', '#f7a6cf'); awn(g, '#fff', '#ff7eb8'); win(g, 10, 20, 44, 26); txt(g, 'ICE♡', 32, 60, '#d4408c', 11); });
  T[2] = mk(function (g) { R(g, '#3a2a6e', 0, 0, 64, 64); g.strokeStyle = '#ff6ad5'; g.lineWidth = 2; g.strokeRect(4, 6, 56, 52); g.strokeStyle = '#7dfcff'; g.strokeRect(9, 11, 46, 42); txt(g, 'GAME', 32, 36, '#7dfcff', 13); R(g, '#ffe94a', 10, 14, 2, 2); R(g, '#fff', 50, 46, 2, 2); R(g, '#ff6ad5', 14, 46, 3, 3); txt(g, '♥ ♥ ♥', 32, 50, '#ff6ad5', 7); });
  T[3] = mk(function (g) { R(g, '#a8e8ff', 0, 0, 64, 64); for (var x = 0; x < 64; x += 8) R(g, 'rgba(255,255,255,.5)', x, 0, 4, 64); awn(g, '#fff', '#5fc4ee'); win(g, 8, 20, 48, 24); g.fillStyle = '#fff'; g.fillRect(24, 28, 14, 10); R(g, '#c58a5c', 26, 30, 10, 6); g.strokeStyle = '#fff'; g.strokeRect(38, 30, 4, 5); txt(g, 'CAFE', 32, 59, '#2c7da8', 11); });
  T[4] = mk(function (g) { R(g, '#d9b8ff', 0, 0, 64, 64); R(g, '#b98cf0', 0, 0, 64, 4); R(g, '#fff', 12, 14, 40, 26); R(g, '#555', 14, 16, 36, 22); R(g, '#f6d6ff', 14, 16, 36, 4); g.fillStyle = '#9fd6f2'; g.beginPath(); g.arc(32, 28, 8, 0, 7); g.fill(); R(g, '#fff', 28, 24, 4, 3); R(g, '#ff7eb8', 44, 14, 6, 3); txt(g, 'PHOTO', 32, 58, '#6a3aa8', 11); });
  T[5] = mk(function (g) { R(g, '#e8e0ff', 0, 0, 64, 64); for (var y = 6; y < 60; y += 16) for (var x = 6; x < 60; x += 16) { R(g, '#fff', x - 1, y - 1, 12, 12); R(g, (x + y) % 32 ? '#fff3a8' : '#bfe9ff', x, y, 10, 10); } R(g, '#cfc4f5', 0, 60, 64, 4); });
  T[6] = mk(function (g) { R(g, '#d9b8ff', 0, 0, 64, 64); R(g, '#6a3aa8', 6, 4, 52, 12); txt(g, 'PHOTO STUDIO', 32, 13, '#fff', 8); R(g, '#fff', 12, 18, 40, 46); R(g, '#ff9ec9', 14, 20, 17, 44); R(g, '#ff9ec9', 33, 20, 17, 44); R(g, '#bfe9ff', 17, 24, 11, 22); R(g, '#bfe9ff', 36, 24, 11, 22); R(g, '#ffe94a', 27, 42, 3, 3); R(g, '#ffe94a', 34, 42, 3, 3); R(g, '#ffe94a', 8, 6, 3, 3); R(g, '#ffe94a', 53, 6, 3, 3); });
  T[7] = mk(function (g) { R(g, '#ffd6ee', 0, 0, 64, 64); for (var y = 6; y < 44; y += 14) for (var x = (y / 14) % 2 ? 6 : 14; x < 64; x += 16) txt(g, '✦', x, y + 8, '#ff9ec9', 9); R(g, '#ff9ec9', 0, 46, 64, 18); R(g, '#fff', 0, 46, 64, 2); });
  T[8] = mk(function (g) { R(g, '#e8d4ff', 0, 0, 64, 64); for (var y = 14; y <= 54; y += 20) { R(g, '#a07ad8', 2, y, 60, 3); for (var x = 6; x < 56; x += 14) { R(g, (x + y) % 3 ? '#555' : '#fff', x, y - 9, 10, 9); R(g, '#bfe9ff', x + 3, y - 7, 4, 4); } } });
  T[9] = mk(function (g) { R(g, '#cfeeff', 0, 0, 64, 64); for (var y = 6; y < 44; y += 14) for (var x = (y / 14) % 2 ? 6 : 14; x < 64; x += 16) txt(g, '♡', x, y + 8, '#7ac7ee', 9); R(g, '#7ac7ee', 0, 46, 64, 18); R(g, '#fff', 0, 46, 64, 2); });

  /* ---------- แผนที่ ---------- */
  var SM = [];
  for (var y = 0; y <= 34; y++) { var L = 1 + (Math.floor(y / 3)) % 5, Rr = 1 + (Math.floor((y + 2) / 3) + 2) % 5; SM.push([L, 0, 0, 0, 0, 0, Rr]); }
  SM[0] = [4, 4, 4, 6, 4, 4, 4]; SM[34] = [5, 5, 5, 5, 5, 5, 5];
  var IM = [[8, 8, 8, 8, 8, 8, 8], [7, 0, 0, 0, 0, 0, 9], [7, 0, 0, 0, 0, 0, 9], [7, 0, 0, 0, 0, 0, 9], [7, 0, 0, 0, 0, 0, 9], [7, 7, 7, 9, 9, 9, 9]];
  var skyC = document.createElement('canvas'); skyC.width = W; skyC.height = H; (function () {
    var g = skyC.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, H / 2); gr.addColorStop(0, '#9fd0ff'); gr.addColorStop(.7, '#ffd0ec'); gr.addColorStop(1, '#fff0c8'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (var i = 0; i < 26; i++) R(g, 'rgba(255,255,255,.9)', (i * 53) % W, (i * 37) % 40, 1, 1);
    R(g, '#fff', 30, 24, 30, 6); R(g, '#fff', 38, 19, 16, 6); R(g, '#fff', 160, 14, 36, 6); R(g, '#fff', 170, 9, 18, 6);
  })();

  /* ---------- สถานะ ---------- */
  var mode = 'street', pov = null, posX = 3.5, posY = 31.5, walking = false, tm = 0, dirty = true, talking = false, camUp = false, spark = [];
  var sleeve = { me: '#7aa8ff', pt: '#ff8ec4' };
  var WK = { street: 1.35, shop: 2.2 };

  function ray(map, wallK) {
    var hz = Math.round(H / 2 + (walking ? Math.sin(tm * 9) * 1.6 : 0));
    if (mode === 'street') ctx.drawImage(skyC, 0, 0); else { var g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, '#fff6fc'); g.addColorStop(1, '#ffe3f4'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    var f1 = mode === 'street' ? '#f3e6ff' : '#fff0c8', f2 = mode === 'street' ? '#e2cffa' : '#ffd9ec';
    for (var y = hz; y < H; y++) { var d = H * wallK / (2 * Math.max(.5, y - hz)); var z = posY - d; ctx.fillStyle = (Math.floor(z * 1.4) & 1) ? f1 : f2; ctx.fillRect(0, y, W, 1); }
    var plane = .85, dirY = -1;
    for (var x = 0; x < W; x++) {
      var cx = 2 * x / W - 1, rdx = plane * cx, rdy = dirY, mx = Math.floor(posX), my = Math.floor(posY), ddx = Math.abs(1 / (rdx || 1e-6)), ddy = Math.abs(1 / rdy), sx, sy, sdx, sdy, side = 0, hit = 0, tries = 0;
      if (rdx < 0) { sx = -1; sdx = (posX - mx) * ddx; } else { sx = 1; sdx = (mx + 1 - posX) * ddx; }
      sy = -1; sdy = (posY - my) * ddy;
      while (!hit && tries++ < 80) { if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; } if (my < 0 || my >= map.length || mx < 0 || mx > 6) { hit = 5; break; } hit = map[my][mx]; }
      var pd = side === 0 ? sdx - ddx : sdy - ddy; if (pd < .05) pd = .05;
      var wx = side === 0 ? posY + pd * rdy : posX + pd * rdx; wx -= Math.floor(wx);
      var tx = Math.floor(wx * 64); if (side === 0 && rdx < 0) tx = 63 - tx;
      var lh = Math.floor(H * wallK / pd), st = Math.floor(hz - lh / 2);
      ctx.drawImage(T[hit] || T[5], tx, 0, 1, 64, x, st, 1, lh);
      if (side === 0) { ctx.fillStyle = 'rgba(110,70,170,.16)'; ctx.fillRect(x, st, 1, lh); }
      var fa = Math.min(.8, Math.max(0, (pd - 3) / 15)); if (fa > 0) { ctx.fillStyle = 'rgba(255,226,246,' + fa.toFixed(2) + ')'; ctx.fillRect(x, st, 1, lh); }
    }
  }
  function line(x0, y0, x1, y1, w, col) { var n = 44; ctx.fillStyle = col; for (var i = 0; i <= n; i++) { var t = i / n; ctx.fillRect(Math.round(x0 + (x1 - x0) * t - w / 2), Math.round(y0 + (y1 - y0) * t - 4), w, 9); } }
  function hands() {
    if (!pov) return; var b = walking ? Math.sin(tm * 9) * 2 : Math.sin(tm * 2) * .6, cx = W / 2, by = H + 2, hy = H - 34 + b;
    line(cx - 76, by, cx - 10, hy + 8, 26, sleeve.me); line(cx + 76, by, cx + 10, hy + 8, 26, sleeve.pt);
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(cx - 30, hy + 20, 60, 3);
    ctx.fillStyle = '#ffd9bf'; ctx.fillRect(cx - 16, hy - 2, 32, 16); ctx.fillStyle = '#ffc7a3'; ctx.fillRect(cx - 4, hy - 2, 20, 16);
    ctx.fillStyle = '#e8a37f'; for (var i = 0; i < 4; i++) { ctx.fillRect(cx - 14 + i * 7, hy + 12, 1, 5); }
    ctx.fillStyle = '#ff7eb8'; ctx.fillRect(cx - 14, hy + 15, 3, 2); ctx.fillRect(cx + 5, hy + 15, 3, 2);
    ctx.fillStyle = '#fff'; ctx.fillRect(cx - 17, hy + 4, 2, 2);
  }
  function oldMan() {
    var u = 2.4, ox = Math.round(W / 2 - 15 * u), oy = 34 + (talking ? Math.round(Math.sin(tm * 14) * .8) : 0);
    function r(c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(Math.round(ox + x * u), Math.round(oy + y * u), Math.ceil(w * u), Math.ceil(h * u)); }
    r('#fff7e0', 5, 21, 20, 22); r('#ffa6cf', 8, 24, 14, 20); r('#ff7eb8', 9, 31, 12, 4); r('#fff', 11, 35, 8, 5);
    r('#f2c9a0', 8, 9, 14, 12); r('#f2c9a0', 7, 13, 1, 4); r('#f2c9a0', 22, 13, 1, 4);
    r('#eee', 7, 10, 1.4, 6); r('#eee', 21.6, 10, 1.4, 6); r('#eee', 9, 8, 12, 1.4);
    r('#4a5fa8', 6, 2, 18, 6); r('#33437f', 4, 7, 22, 2); r('#ffe94a', 14, 4, 2, 2);
    r('#333', 9, 12, 6, 1); r('#333', 9, 16, 6, 1); r('#333', 9, 12, 1, 5); r('#333', 14, 12, 1, 5); r('#333', 16, 12, 6, 1); r('#333', 16, 16, 6, 1); r('#333', 16, 12, 1, 5); r('#333', 21, 12, 1, 5);
    r('#cfe9ff', 10, 13, 4, 3); r('#cfe9ff', 17, 13, 4, 3); r('#222', 11.5, 14, 1.2, 1.5); r('#222', 18.5, 14, 1.2, 1.5);
    r('#e3a98a', 14, 15, 3, 3); r('#fff', 10, 17.5, 11, 2.4); r('#fff', 9, 18.5, 2, 2); r('#fff', 20, 18.5, 2, 2);
    r('#ff9aa8', 9, 16, 2, 1); r('#ff9aa8', 20, 16, 2, 1);
    if (talking && Math.sin(tm * 14) > 0) r('#a33', 13, 20, 5, 1.6); else r('#a55', 13, 20, 5, .8);
    if (camUp) { r('#222', 6, 8, 18, 12); r('#555', 8, 10, 14, 8); r('#9fd6f2', 12, 11, 6, 6); r('#fff', 13, 12, 2, 2); r('#ff3b6b', 22, 9, 1.5, 1.5); }
  }
  function counter() {
    var y0 = 108; ctx.fillStyle = '#fff'; ctx.fillRect(18, y0, W - 36, 4); ctx.fillStyle = '#ffb3dc'; ctx.fillRect(14, y0 + 4, W - 28, 30);
    ctx.fillStyle = '#ff7eb8'; for (var x = 20; x < W - 20; x += 16) ctx.fillRect(x, y0 + 10, 8, 2);
    ctx.fillStyle = 'rgba(0,0,0,.1)'; ctx.fillRect(14, y0 + 30, W - 28, 4);
    ctx.fillStyle = '#f2c9a0'; ctx.fillRect(W / 2 - 40, y0 - 3, 8, 4); ctx.fillRect(W / 2 + 32, y0 - 3, 8, 4);
    ctx.fillStyle = '#ffe94a'; ctx.fillRect(W / 2 + 56, y0 - 7, 10, 7); ctx.fillStyle = '#333'; ctx.fillRect(W / 2 + 58, y0 - 5, 6, 1);
  }
  function sparkles() { spark.forEach(function (s) { ctx.fillStyle = s.c; ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2); }); }
  function draw() {
    if (mode === 'street') ray(SM, WK.street); else { ray(IM, WK.shop); oldMan(); counter(); }
    hands(); sparkles();
  }
  var last = 0, lastT = performance.now();
  function frame(now) {
    var dt = Math.min(.05, (now - lastT) / 1000); lastT = now; tm += dt;
    spark = spark.filter(function (s) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; return s.life > 0; });
    if (dirty || walking || talking || spark.length || now - last > 140) { last = now; draw(); dirty = false; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  function burst(n) { var cs = ['#fff', '#ffe94a', '#ff7eb8', '#7dfcff']; for (var i = 0; i < n; i++) spark.push({ x: W / 2, y: H / 2, vx: (Math.random() - .5) * 140, vy: (Math.random() - .7) * 120, life: .8 + Math.random() * .6, c: cs[i % 4] }); }

  /* ---------- กล่องข้อความ ---------- */
  var dlg = $('dlg'), say = $('say'), opts = $('opts'), who = $('who'), walkBtn = $('walk'), typer = null, full = '', onDone = null;
  function stopType() { if (typer) { clearInterval(typer); typer = null; } talking = false; }
  function speak(whoName, text, cb) {
    stopType(); dlg.hidden = false; who.textContent = whoName; opts.innerHTML = ''; full = rep(text); say.textContent = ''; var i = 0; onDone = cb; talking = whoName.indexOf('ลุง') >= 0;
    typer = setInterval(function () { i++; say.textContent = full.slice(0, i); if (i % 3 === 0) sfx('blip'); if (i >= full.length) { stopType(); var f = onDone; onDone = null; if (f) f(); } }, 30);
  }
  dlg.addEventListener('click', function (e) { if (typer && !e.target.closest('button')) { var cbk = onDone; onDone = null; stopType(); say.textContent = full; if (cbk) cbk(); } });
  function choices(list) { opts.innerHTML = ''; list.forEach(function (o) { var b = document.createElement('button'); b.type = 'button'; b.textContent = rep(o.t); b.addEventListener('click', function () { sfx('tap'); opts.innerHTML = ''; o.fn(); }); opts.appendChild(b); }); }
  function more(label, fn) { choices([{ t: label || 'ต่อไป ▸', fn: fn }]); }

  /* ---------- เนื้อเรื่อง ---------- */
  var STOPS = [
    { y: 25, t: 'ร้านไอศกรีมสีพาสเทลเปิดใหม่ มือของเราจับกันแน่นๆ ตลอดทางเลย' },
    { y: 18.5, t: 'ตู้เกมเสียงดังติ๊ดๆ {name}ยิ้มจนตาหยีเลย' },
    { y: 12, t: 'ร้านสติกเกอร์หัวใจกับกิ๊บติดผมสีลูกกวาด ซื้อคู่กันไหมนะ…' },
    { y: 6, t: 'นั่นไง! ร้านถ่ายรูป PHOTO STUDIO ของลุงช่างภาพประจำซอย เข้าไปกัน!' }
  ];
  var si = -1, tgt = 0;
  function glide(toY, sec, done) {
    walking = true; walkBtn.disabled = true; var from = posY, t0 = performance.now(), a = sec * 1000;
    (function step(now) { var k = Math.min(1, (now - t0) / a), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; posY = from + (toY - from) * e; dirty = true; if (Math.floor(now / 330) !== Math.floor((now - 16) / 330)) sfx('tick'); if (k < 1) requestAnimationFrame(step); else { walking = false; walkBtn.disabled = false; done && done(); } })(t0);
  }
  $('pick').addEventListener('click', function (e) {
    var b = e.target.closest('[data-pov]'); if (!b) return; pov = b.getAttribute('data-pov'); sfx('pop');
    sleeve = pov === 'm' ? { me: '#7aa8ff', pt: '#ff8ec4' } : { me: '#ff8ec4', pt: '#7aa8ff' };
    $('pick').hidden = true; $('sub').textContent = 'แตะ "เดินต่อ" เพื่อเดินเดทไปด้วยกัน'; dirty = true; burst(18);
    speak('💭', 'วันนี้เราสองคนจะไปเดินเล่นกันในเมือง จับมือกันไว้แน่นๆ นะ', function () { walkBtn.hidden = false; walkBtn.textContent = 'เดินต่อ ▶'; });
  });
  walkBtn.addEventListener('click', function () {
    if (mode !== 'street' || walkBtn.disabled) return;
    if (si < STOPS.length - 1) {
      si++; var s = STOPS[si]; dlg.hidden = true; glide(s.y, 2.2, function () { speak('💭', s.t, function () { if (si === STOPS.length - 1) walkBtn.textContent = 'เข้าร้าน ▶'; }); });
    } else {
      walkBtn.hidden = true; dlg.hidden = true; glide(2.2, 1.8, enterShop);
    }
  });
  function fadeFlash(cb) { var f = $('flash'); f.classList.add('on'); setTimeout(function () { cb && cb(); setTimeout(function () { f.classList.remove('on'); }, 120); }, 330); }
  function enterShop() {
    sfx('chime'); fadeFlash(function () { mode = 'shop'; posX = 3.5; posY = 5.2; walking = false; dirty = true; $('sub').textContent = 'ลุงเจ้าของร้านกำลังรอคุณอยู่…'; ask(-1); });
  }
  function ask(i) {
    if (i === -1) { speak('ลุงช่างภาพ', 'ยินดีต้อนรับจ้ะหนุ่มสาว! ลุงเป็นช่างภาพประจำซอยนี้ ก่อนถ่ายรูปคู่ ลุงขอถามอะไรนิดหน่อยนะ', function () { more('ได้เลยค่ะ/ครับ ▸', function () { ask(0); }); }); return; }
    if (i >= DLG.length) { lastQ(); return; }
    var d = DLG[i];
    speak('ลุงช่างภาพ', d.q, function () {
      choices(d.options.map(function (o, k) { return { t: o, fn: function () { var r = (d.replies && d.replies[k]) || d.reply || 'น่ารักจริงๆ เลยจ้ะ'; speak('ลุงช่างภาพ', r, function () { more('ต่อไป ▸', function () { ask(i + 1); }); }); } }; }));
    });
  }
  function lastQ(again) {
    speak('ลุงช่างภาพ', again ? 'ไม่ต้องรีบจ้ะ ใจเย็นๆ ลุงรอได้ แล้วพร้อมเมื่อไหร่ก็บอกลุงนะ' + ' พร้อมถ่ายรูปคู่กันรึยังจ๊ะ' : 'พร้อมถ่ายรูปคู่กันรึยังจ๊ะ', function () {
      choices([{ t: 'พร้อมแล้ว! 📸', fn: function () { shoot(0); } }, { t: 'เดี๋ยวก่อน…', fn: function () { lastQ(true); } }]);
    });
  }
  /* ---------- ถ่ายรูป ---------- */
  var N = P.length, SH = Math.max(1, Math.min(5, N)), shown = 0, COM = ['สวยจริงๆ! ใบนี้ลุงขอเก็บไว้ด้วยนะ', 'ยิ้มสดใสเหมือนปี 2000 เลยจ้ะ', 'อีกใบเลย! ท่านี้เข้าที', 'น่ารักจนกล้องจะละลาย', 'ใบสุดท้ายแล้วจ้ะ ยิ้มกว้างๆ'];
  function group(s) { var a = Math.floor(s * N / SH), b = Math.floor((s + 1) * N / SH), o = []; for (var i = a; i < b; i++) o.push(i); return o; }
  function shoot(s) {
    if (s >= SH) { done(); return; }
    camUp = true; dirty = true; $('sub').textContent = 'ภาพที่ ' + (s + 1) + ' / ' + SH;
    speak('ลุงช่างภาพ', s ? 'มาๆ ใบต่อไป เข้ามาชิดกันอีกนิดจ้ะ' : 'เข้ามาชิดๆ กันหน่อยจ้ะ ลุงจะนับ 3 2 1 แล้วกดชัตเตอร์นะ', function () {
      choices([{ t: 'ถ่ายเลย 📸', fn: function () { countdown(s); } }]);
    });
  }
  function countdown(s) {
    var vf = $('vf'), n = $('vfN'), c = 3; vf.hidden = false; dlg.hidden = true;
    (function tick() { if (c > 0) { n.textContent = c; sfx('tick'); c--; setTimeout(tick, 650); } else { n.textContent = ''; var f = $('flash'); f.classList.add('on'); sfx('whoosh'); sfx('chime'); burst(26); setTimeout(function () { vf.hidden = true; addPol(s); f.classList.remove('on'); camUp = false; dirty = true; dlg.hidden = false; speak('ลุงช่างภาพ', COM[s % COM.length], function () { more(s + 1 < SH ? 'ถ่ายใบต่อไป ▸' : 'ดูรูปที่ได้ ▸', function () { shoot(s + 1); }); }); }, 170); } })();
  }
  function addPol(s) {
    var wall = $('wall'), pls = $('pls'); wall.hidden = false;
    group(s).forEach(function (i, k) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pl dev'; b.setAttribute('data-i', i); b.style.setProperty('--r', (((i * 37) % 9) - 4) + 'deg'); b.setAttribute('aria-label', 'รูปที่ ' + (i + 1));
      b.innerHTML = '<span class="tp"></span><span class="ph" style="background-image:url(\'' + esc(P[i].src) + '\')"></span><em>' + esc(P[i].cap || '♡') + '</em>';
      pls.appendChild(b); shown++; setTimeout(function () { b.classList.remove('dev'); }, 2600 + k * 300);
    });
    $('cnt').textContent = '(' + shown + '/' + N + ')';
  }
  $('pls').addEventListener('click', function (e) { var b = e.target.closest('.pl'); if (!b || b.classList.contains('dev')) return; var f = document.querySelectorAll('.pool [data-photo]')[+b.getAttribute('data-i')]; if (f) { sfx('soft'); f.click(); } });
  function done() {
    $('sub').textContent = 'ถ่ายครบแล้ว!'; sfx('win'); burst(40);
    speak('ลุงช่างภาพ', 'เสร็จเรียบร้อยจ้ะ! รูปอยู่ข้างล่างโน้น แถมการ์ดพิเศษจากใจของเขา/เธอให้ด้วยนะ ขอให้รักกันนานๆ จ้ะ', function () {
      $('ltr').hidden = false; setTimeout(function () { var w = $('wall'); try { w.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { w.scrollIntoView(); } }, 400);
    });
  }
  dirty = true;
})();
