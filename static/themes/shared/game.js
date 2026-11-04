/* =========================================
   TUARAI - เกมเล็กๆ ก่อนเปิดจดหมาย
   เล่นไม่มีแพ้ ไม่มีเวลาจำกัด และมีปุ่มข้ามเสมอ
   เลือกชนิดเกมจาก <body data-game="scratch|hearts"> (ไม่ใส่ = ไม่มีเกม)
   ========================================= */
(function () {
  'use strict';
  var body = document.body;
  var kind = body.getAttribute('data-game');
  var done = false;
  var $ = function (id) { return document.getElementById(id); };
  var attr = function (k, d) { return body.getAttribute('data-' + k) || d; };

  var overlay = $('gameOverlay');
  var stage = $('gameStage'), fill = $('gameBarFill'), statusEl = $('gameStatus');
  var onDone = null, cleanup = null, finished = false;
  var sfx = function (n, a) { if (window.TUSfx) TUSfx.play(n, a); };
  var lastScr = 0;
  function scratchSound() {
    var t = Date.now(); if (t - lastScr < 60 || !window.TUSfx) return; lastScr = t;
    TUSfx.noise({ f: 2400 + Math.random() * 2200, d: .09, v: .1, q: 1.4, a: .006 });
  }

  function pickPhoto() {
    var imgs = [].slice.call(document.querySelectorAll('[data-photo] img'));
    if (!imgs.length) return '';
    var im = imgs[Math.min(1, imgs.length - 1)];
    return im.currentSrc || im.src;
  }

  function finish(skipped) {
    if (finished) return;
    finished = true; done = true;
    if (cleanup) { cleanup(); cleanup = null; }
    var go = function () {
      window.TUOverlay.close(overlay);
      stage.innerHTML = '';
      if (onDone) onDone();
    };
    if (skipped) go();
    else {
      sfx('win');
      statusEl.textContent = attr('game-win', 'ปลดล็อกแล้ว! 💌');
      fill.style.width = '100%';
      setTimeout(go, 1000);
    }
  }

  /* ---------- ขูดบัตรเผยรูป ---------- */
  function scratch() {
    var img = document.createElement('img');
    img.src = pickPhoto(); img.alt = '';
    var cv = document.createElement('canvas');
    stage.appendChild(img); stage.appendChild(cv);
    var w = stage.clientWidth || 340, h = stage.clientHeight || 425;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = w * dpr; cv.height = h * dpr;
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, attr('cover-a', '#c9c9d6')); g.addColorStop(.5, attr('cover-b', '#8f8fa8')); g.addColorStop(1, attr('cover-a', '#c9c9d6'));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = .25;
    for (var i = 0; i < 260; i++) {                       // ลายเม็ดทราย/กากเพชร
      ctx.fillStyle = Math.random() < .5 ? '#fff' : '#000';
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = attr('cover-ink', 'rgba(255,255,255,.9)');
    ctx.font = '600 22px "IBM Plex Sans Thai", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(attr('cover-text', 'ขูดตรงนี้เลย!'), w / 2, h / 2);
    ctx.font = '40px sans-serif'; ctx.fillText(attr('cover-icon', '✨'), w / 2, h / 2 - 44);

    ctx.globalCompositeOperation = 'destination-out';
    var down = false, last = null, ticking = false, R = 28;
    function pos(e) {
      var r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
      return { x: (t.clientX - r.left) * (w / r.width), y: (t.clientY - r.top) * (h / r.height) };
    }
    function scratchTo(p) {
      ctx.lineWidth = R * 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      if (last) { ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); }
      else { ctx.arc(p.x, p.y, R, 0, 6.283); ctx.fill(); }
      last = p; scratchSound();
      if (!ticking) { ticking = true; setTimeout(measure, 120); }
    }
    function measure() {
      ticking = false;
      var data = ctx.getImageData(0, 0, cv.width, cv.height).data, clear = 0, total = 0;
      for (var i = 3; i < data.length; i += 4 * 23) { total++; if (data[i] < 20) clear++; }
      var pct = Math.min(100, Math.round(clear / total * 100 / .5));   // ขูด 50% = เต็มหลอด
      fill.style.width = Math.min(100, pct) + '%';
      statusEl.textContent = 'ขูดแล้ว ' + Math.min(100, pct) + '%';
      if (clear / total > .5) { cv.classList.add('gone'); finish(false); }
    }
    var start = function (e) { down = true; last = null; scratchTo(pos(e)); e.preventDefault(); };
    var move = function (e) { if (down) { scratchTo(pos(e)); e.preventDefault(); } };
    var end = function () { down = false; last = null; };
    cv.addEventListener('mousedown', start); window.addEventListener('mousemove', move); window.addEventListener('mouseup', end);
    cv.addEventListener('touchstart', start, { passive: false }); cv.addEventListener('touchmove', move, { passive: false }); cv.addEventListener('touchend', end);
    cleanup = function () { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end); };
  }

  /* ---------- แตะหัวใจที่ซ่อนไว้ ---------- */
  function hearts() {
    var n = Number(attr('game-count', 3)) || 3, ch = attr('game-item', '💗');
    var img = document.createElement('img'); img.src = pickPhoto(); img.alt = '';
    var dim = document.createElement('div'); dim.className = 'dim';
    stage.appendChild(img); stage.appendChild(dim);
    var pts = [];
    while (pts.length < n) {                               // สุ่มตำแหน่ง ห่างกันพอสมควร ไม่ชิดขอบ
      var p = { x: 12 + Math.random() * 76, y: 10 + Math.random() * 80 };
      if (pts.every(function (q) { return Math.hypot(q.x - p.x, q.y - p.y) > 26; })) pts.push(p);
    }
    var found = 0, items = [];
    pts.forEach(function (p) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'hid'; b.textContent = ch;
      b.setAttribute('aria-label', 'หัวใจที่ซ่อนอยู่');
      b.style.left = p.x + '%'; b.style.top = p.y + '%';
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (b.classList.contains('found')) return;
        b.classList.add('found'); found++; update(); sfx('chime', found + 1);
        if (found >= n) finish(false);
      });
      stage.appendChild(b); items.push(b);
    });
    function update() {
      fill.style.width = (found / n * 100) + '%';
      statusEl.textContent = found >= n ? '' : 'เจอแล้ว ' + found + ' / ' + n + ' ดวง';
    }
    update();
    var hintTimer = setTimeout(function () {               // 12 วินาทีแล้วยังไม่เจอ ให้กะพริบบอกใบ้
      items.forEach(function (b) { if (!b.classList.contains('found')) b.classList.add('hint'); });
    }, 12000);
    cleanup = function () { clearTimeout(hintTimer); };
  }

  window.TUGame = {
    shouldRun: function () { return !!kind && !done && !!overlay; },
    run: function (cb) {
      onDone = cb; finished = false;
      stage.innerHTML = ''; fill.style.width = '0'; statusEl.textContent = '';
      $('gameEyebrow').textContent = attr('game-eyebrow', 'Mini game');
      $('gameTitle').textContent = attr('game-title', kind === 'scratch' ? 'ขูดเพื่อเผยรูป' : 'หาหัวใจที่ซ่อนอยู่');
      $('gameHint').textContent = attr('game-hint', kind === 'scratch' ? 'ใช้นิ้ว (หรือเมาส์) ขูดเบาๆ ให้เห็นรูปข้างใต้' : 'แตะหัวใจที่ซ่อนอยู่ในภาพให้ครบ');
      window.TUOverlay.open(overlay);
      if (kind === 'scratch') scratch(); else hearts();
    }
  };
  var skip = $('gameSkip');
  if (skip) skip.addEventListener('click', function () { finish(true); });
  // ปิดด้วย × หรือแตะพื้นหลัง = ยังไม่เปิดจดหมาย แต่ล้างเกมให้เริ่มใหม่ได้
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.closest('[data-close]')) { if (cleanup) { cleanup(); cleanup = null; } stage.innerHTML = ''; finished = true; }
  });
})();
