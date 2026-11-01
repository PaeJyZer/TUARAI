/* ธีมเค้ก/ปาร์ตี้: จุดเทียน -> เป่า -> ป๊อปบอลลูน */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var candles = [].slice.call(document.querySelectorAll('.candle'));
  var lit = 0, blown = false;
  var blowBtn = $('blowBtn'), hint = $('gateHint');

  candles.forEach(function (c, i) {
    c.addEventListener('click', function () {
      if (c.classList.contains('lit') || blown) return;
      c.classList.add('lit'); lit++;
      TUSfx.play('chime', i + 1); TUSfx.play('sparkle');
      $('litCount').textContent = lit;
      if (lit === candles.length) {
        hint.innerHTML = 'จุดครบแล้ว! ขอพรในใจ แล้วเป่าเลย ✨';
        blowBtn.hidden = false;
      }
    });
  });

  function blow() {
    if (blown || lit < candles.length) return;
    blown = true; blowBtn.hidden = true;
    TUSfx.play('blow');
    var smoke = $('smoke');
    candles.forEach(function (c, i) {
      setTimeout(function () {
        c.classList.remove('lit'); c.classList.add('out');
        var r = c.getBoundingClientRect(), w = smoke.getBoundingClientRect();
        for (var k = 0; k < 3; k++) {
          var s = document.createElement('i');
          s.style.left = (r.left - w.left + r.width / 2 - 7) + 'px'; s.style.top = (r.top - w.top + 4) + 'px';
          s.style.setProperty('--dx', (Math.random() * 40 - 20) + 'px'); s.style.animationDelay = (k * .15) + 's';
          smoke.appendChild(s);
        }
      }, i * 140);
    });
    hint.textContent = '🎉 ขอให้พรเป็นจริงนะ!';
    setTimeout(function () {
      TUSfx.play('fanfare'); TUSfx.play('boom');
      TUFx.confetti(innerWidth / 2, innerHeight * .45, 140, null, 1.2);
      TUFx.rain(5);
      setTimeout(function () { window.TU_OPEN(); }, 900);
    }, 650);
  }
  blowBtn.addEventListener('click', blow);

  /* ---------- บอลลูน ---------- */
  var arena = $('arena'), popped = 0, NEED = 5;
  var COLORS = ['#ff5d8f', '#4cc9f0', '#ffd166', '#8ee3d0', '#b388ff', '#ff9f43'];
  var WORDS = ['รักนะ', 'คิดถึง', 'ขอบคุณ', 'สุขสันต์', 'ตลอดไป', 'น่ารัก', 'ยิ้มนะ', 'เก่งมาก'];
  var n = 0;
  function spawn(x) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'balloon'; b.setAttribute('aria-label', 'บอลลูน');
    b.style.left = (x != null ? x : 8 + Math.random() * 84) + '%';
    b.style.bottom = (10 + Math.random() * 60) + '%';
    b.style.setProperty('--c', COLORS[n % COLORS.length]);
    b.style.setProperty('--t', (2.6 + Math.random() * 2) + 's');
    b.style.animationDelay = (-Math.random() * 3) + 's';
    n++;
    b.addEventListener('click', function (e) {
      var r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      b.remove();
      TUSfx.play('pop');
      TUFx.confetti(cx, cy, 36, [getComputedStyle(b).getPropertyValue('--c') || '#ff5d8f', '#fff', '#ffd166'], .6);
      TUFx.float(cx, cy, WORDS[(Math.random() * WORDS.length) | 0]);
      popped++;
      $('popCount').textContent = Math.min(popped, NEED);
      if (popped === NEED) { TUSteps.complete(2); TUFx.rain(3); }
      setTimeout(function () { spawn(); }, popped >= NEED ? 700 : 250);
    });
    arena.appendChild(b);
  }
  [12, 30, 48, 66, 84].forEach(function (x) { spawn(x); });
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // ปล่อยลมให้บอลลูนลอยสูงขึ้นลงเอง
    setInterval(function () {
      arena.querySelectorAll('.balloon').forEach(function (b) { b.style.bottom = (8 + Math.random() * 62) + '%'; });
    }, 3200);
  }
  // ถ้าผู้ใช้กดข้ามทุกขั้น ให้นับเป็นผ่านเลย
  document.addEventListener('tu:skipped', function () { $('popCount').textContent = NEED; });
})();
