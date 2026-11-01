/* ธีมอาร์เคด: หยอดเหรียญ -> START -> เกมรับหัวใจ -> ฉากรูป -> บอสจดหมาย */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var score = 0, shown = {};
  function setScore(v) { score = v; $('score').textContent = String(v).padStart(6, '0'); }

  /* ---------- gate ---------- */
  var credited = false;
  $('coinBtn').addEventListener('click', function () {
    if (credited) return; credited = true;
    this.classList.add('dropped');
    TUSfx.play('coin');
    $('credit').textContent = 'CREDIT 01'; $('scrMsg').textContent = 'PRESS START';
    $('gateHint').textContent = 'กดปุ่มแดง START 🔴';
    $('startBtn').disabled = false;
  });
  $('startBtn').addEventListener('click', function () {
    if (!credited) return;
    this.disabled = true;
    [523, 659, 784, 1047, 1319].forEach(function (f, i) { TUSfx.tone({ f: f, t: i * .09, d: .15, type: 'square', v: .08 }); });
    TUSfx.play('whoosh');
    $('scrMsg').textContent = 'GO!!';
    setTimeout(function () { window.TU_OPEN(); }, 600);
  });

  /* ---------- เกมรับหัวใจ ---------- */
  var cv = $('game'), cx = cv.getContext('2d');
  var W = 340, H = 425, dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr; cx.scale(dpr, dpr);
  var NEED = 10, caught = 0, running = false, hearts = [], px = W / 2, tick = 0, raf = null, cleared = false;
  var stars = []; for (var i = 0; i < 40; i++) stars.push([Math.random() * W, Math.random() * H, Math.random() * 1.6 + .4]);

  function movePaddle(clientX) { var r = cv.getBoundingClientRect(); px = Math.max(30, Math.min(W - 30, (clientX - r.left) / r.width * W)); }
  cv.addEventListener('pointermove', function (e) { movePaddle(e.clientX); });
  cv.addEventListener('pointerdown', function (e) { movePaddle(e.clientX); });
  cv.addEventListener('touchmove', function (e) { if (e.touches[0]) movePaddle(e.touches[0].clientX); e.preventDefault(); }, { passive: false });
  document.addEventListener('keydown', function (e) {
    if (!running) return;
    if (e.key === 'ArrowLeft') px = Math.max(30, px - 28);
    if (e.key === 'ArrowRight') px = Math.min(W - 30, px + 28);
  });

  function spawn() {
    var gold = Math.random() < .12;
    hearts.push({ x: 20 + Math.random() * (W - 40), y: -20, v: 1.5 + Math.random() * 1.4 + caught * .06, gold: gold, s: 24 + Math.random() * 8, a: 1 });
  }
  function draw() {
    cx.clearRect(0, 0, W, H);
    cx.fillStyle = '#04020a'; cx.fillRect(0, 0, W, H);
    stars.forEach(function (s) { s[1] = (s[1] + s[2] * .4) % H; cx.fillStyle = 'rgba(255,255,255,' + (.3 + s[2] / 3) + ')'; cx.fillRect(s[0], s[1], s[2], s[2]); });
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    hearts.forEach(function (h) {
      cx.globalAlpha = h.a; cx.font = h.s + 'px sans-serif'; cx.fillText(h.gold ? '💛' : '💖', h.x, h.y);
    });
    cx.globalAlpha = 1;
    // ผู้เล่น
    var py = H - 42;
    cx.fillStyle = '#00f0ff'; cx.fillRect(px - 32, py, 64, 12);
    cx.fillStyle = '#ff2bd6'; cx.fillRect(px - 32, py + 12, 64, 6);
    cx.fillStyle = '#fff'; cx.fillRect(px - 20, py - 8, 40, 8);
    cx.font = '18px sans-serif'; cx.fillText('🧺', px, py - 16);
  }
  function step() {
    tick++;
    if (tick % Math.max(28, 55 - caught * 2) === 0) spawn();
    var py = H - 42;
    for (var i = hearts.length - 1; i >= 0; i--) {
      var h = hearts[i];
      h.y += h.v;
      if (h.caught) { hearts.splice(i, 1); continue; }
      if (h.y > py - 14 && h.y < py + 16 && Math.abs(h.x - px) < 38) {
        hearts.splice(i, 1);
        var gain = h.gold ? 3 : 1;
        caught = Math.min(NEED, caught + gain); setScore(score + (h.gold ? 500 : 100));
        TUSfx.play(h.gold ? 'win' : 'blip');
        $('heartCount').textContent = caught;
        var r = cv.getBoundingClientRect();
        TUFx.float(r.left + h.x / W * r.width, r.top + py / H * r.height - 30, h.gold ? '+500 ⭐' : '+100');
        if (caught >= NEED) return finish();
      } else if (h.y > H + 30) { hearts.splice(i, 1); }
    }
    draw();
    raf = requestAnimationFrame(step);
  }
  function finish() {
    running = false; cleared = true; cancelAnimationFrame(raf);
    draw();
    $('gameMsg').innerHTML = '★ STAGE CLEAR ★<br>ปลดล็อกฉากรูปแล้ว!';
    $('gameStart').textContent = '↻ เล่นอีกรอบ';
    $('gameOver').classList.remove('off');
    $('hiTable').hidden = false;
    TUSfx.play('fanfare');
    TUFx.confetti(innerWidth / 2, innerHeight * .4, 120, ['#00f0ff', '#ff2bd6', '#ffe14a', '#fff'], 1.1);
    TUSteps.complete(2);
  }
  $('gameStart').addEventListener('click', function () {
    hearts = []; caught = 0; tick = 0; $('heartCount').textContent = 0;
    $('gameOver').classList.add('off'); running = true;
    TUSfx.play('coin');
    cancelAnimationFrame(raf); raf = requestAnimationFrame(step);
  });
  draw();
  // หยุดเกมเมื่อเลื่อนพ้นจอ (ประหยัดแบต)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      if (!running) return;
      if (en[0].isIntersecting) { cancelAnimationFrame(raf); raf = requestAnimationFrame(step); } else cancelAnimationFrame(raf);
    }).observe($('gameWrap'));
  }
  document.addEventListener('tu:skipped', function () {
    if (!cleared) { $('hiTable').hidden = false; $('heartCount').textContent = NEED; $('gameMsg').textContent = 'ข้ามด่านแล้ว (เล่นต่อได้ถ้าอยาก)'; }
  });

  /* ---------- ฉากรูป: ดูฉากใหม่ได้โบนัส ---------- */
  document.addEventListener('click', function (e) {
    var p = e.target.closest && e.target.closest('.cart');
    if (!p || !TUSteps.isDone(2) || shown[p.textContent]) return;
    shown[p.textContent] = 1; setScore(score + 500);
    $('hp').style.width = Math.max(8, 100 - Object.keys(shown).length * 14) + '%';
  });
  document.addEventListener('tu:letter', function () { $('hp').style.width = '0%'; TUSfx.play('boom'); });
})();
