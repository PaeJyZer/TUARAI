(function () {
  'use strict';
  var P = window.TU_PHOTOS || [];
  var $ = function (id) { return document.getElementById(id); };
  var glass = $('glass'), claw = $('claw'), cable = $('cable'), hold = $('hold'), pile = $('pile'), tip = $('tip'), shRow = $('shRow');
  var prize = $('prize'), pzCard = $('pzCard'), pool = [].slice.call(document.querySelectorAll('.pool [data-photo]'));
  var NOTES = ['วันที่เราเจอกัน', 'รอยยิ้มที่ฉันชอบที่สุด', 'มื้อนี้อร่อยเพราะมีเธอ', 'วันที่ฝนตกแต่ใจอบอุ่น', 'ถ่ายรูปคู่กันครั้งแรก', 'เซอร์ไพรส์เล็กๆ ที่ไม่ลืม', 'วันธรรมดาที่พิเศษเพราะเธอ', 'ทริปที่อยากกลับไปอีก'];
  var COL = ['#f4a3b6', '#f7cf7a', '#9fd0e8', '#c4a8e6', '#9fd8bd', '#f8b48e'];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var sfx = function (n) { if (window.TUSfx) TUSfx.play(n); };
  function capSVG(c, half) {
    var top = '<path d="M4 30 A26 26 0 0 1 56 30 Z" fill="' + c + '"/><ellipse cx="22" cy="14" rx="6" ry="3.4" fill="#fff" opacity=".55" transform="rotate(-30 22 14)"/>';
    var bot = '<path d="M4 30 H56 A26 26 0 0 1 4 30 Z" fill="#fffaf2"/><path d="M4 30 H56" stroke="' + c + '" stroke-width="3"/>';
    if (half === 't') return '<svg viewBox="0 0 60 32" class="t">' + top + '</svg>';
    if (half === 'b') return '<svg viewBox="0 0 60 32" class="b">' + bot.replace('A26 26 0 0 1 4 30 Z', 'A26 26 0 0 1 4 30 Z') + '</svg>';
    return '<svg viewBox="0 0 60 60">' + top + '<path d="M4 30 H56 A26 26 0 0 1 4 60 Z" fill="none"/><path d="M4 30 A26 26 0 0 0 56 30 Z" fill="#fffaf2"/><path d="M4 30 H56" stroke="' + c + '" stroke-width="3"/></svg>';
  }
  var N = Math.ceil(P.length / 2), caps = [], got = 0;
  function cnt() { $('prCount').textContent = '(' + got + '/' + N + ')'; }
  cnt();
  shRow.innerHTML = '<span class="empty">ยังไม่มีของรางวัล เริ่มคีบเลย!</span>';
  for (var k = 0; k < N; k++) {
    var col = k % 6, row = Math.floor(k / 6);
    var x = 16 + ((k * 41) % 7) * 11.5 + (k % 3) * 2.2, y = 16 + ((k * 23) % 5) * 12 + (k % 2) * 8;
    var el = document.createElement('div'); el.className = 'cap'; el.style.cssText = 'left:' + Math.min(90, Math.max(12, x)).toFixed(1) + '%;top:' + Math.min(80, y).toFixed(1) + '%;--r:' + (((k * 37) % 41) - 20) + 'deg;z-index:' + (3 + (k % 3));
    el.innerHTML = capSVG(COL[k % 6]); pile.appendChild(el);
    caps.push({ el: el, x: parseFloat(el.style.left), c: COL[k % 6], k: k, gone: false });
  }
  /* ควบคุมก้ามคีบ */
  var cx = 50, dir = 0, busy = false, miss = 0, last = 0, started = false;
  claw.classList.add('sway', 'open');
  function near() {
    var best = null, th = miss >= 2 ? 16 : 9;
    caps.forEach(function (c) { if (c.gone) return; var d = Math.abs(c.x - cx); if (d < th && (!best || d < Math.abs(best.x - cx))) best = c; c.el.classList.remove('near'); });
    if (best) best.el.classList.add('near'); return best;
  }
  function loop(t) {
    var dt = Math.min(50, t - last); last = t;
    if (dir && !busy) { cx = Math.max(8, Math.min(92, cx + dir * dt * .045)); claw.style.left = cx + '%'; if ((t | 0) % 7 === 0) sfx('tick'); near(); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(function (t) { last = t; loop(t); });
  function hookBtn(id, d) {
    var b = $(id), on = function (e) { e.preventDefault(); dir = d; b.classList.add('on'); }, off = function () { dir = 0; b.classList.remove('on'); };
    b.addEventListener('pointerdown', on); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { b.addEventListener(n, off); });
  }
  hookBtn('bL', -1); hookBtn('bR', 1);
  document.addEventListener('keydown', function (e) { if (prize.classList.contains('open')) return; if (e.key === 'ArrowLeft') dir = -1; if (e.key === 'ArrowRight') dir = 1; if (e.key === ' ' && started) { e.preventDefault(); grab(); } });
  document.addEventListener('keyup', function (e) { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') dir = 0; });
  glass.addEventListener('click', function (e) { if (busy) return; var r = glass.getBoundingClientRect(); cx = Math.max(8, Math.min(92, (e.clientX - r.left) / r.width * 100)); claw.style.left = cx + '%'; near(); });
  document.addEventListener('tu:opened', function () { started = true; sfx('coin'); });
  setTimeout(function () { started = true; }, 0);
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  async function grab() {
    if (busy || !started) return; busy = true; dir = 0; tip.textContent = '';
    var H = glass.clientHeight, target = null;
    var tg = near();
    var depth = tg ? (parseFloat(tg.el.style.top) / 100 * (H * .4) + H * .6 - 32) : H * .72;
    claw.classList.remove('sway'); claw.classList.add('open'); sfx('whoosh');
    cable.style.setProperty('--cl', Math.max(60, depth) + 'px'); await wait(980);
    claw.classList.remove('open'); claw.classList.add('closed'); sfx('blip'); await wait(420);
    if (tg) {
      tg.gone = true; hold.appendChild(tg.el); tg.el.style.cssText = 'position:relative;left:0;top:0;width:100%;transform:none'; tg.el.classList.remove('near');
    }
    cable.style.setProperty('--cl', '22px'); await wait(980);
    if (!tg) { miss++; claw.classList.remove('closed'); claw.classList.add('open', 'sway'); tip.textContent = miss >= 2 ? 'เกือบแล้ว! ลองอีกครั้งนะ (ช่วยให้คีบง่ายขึ้นแล้ว)' : 'พลาดนิดเดียว! ลองอีกครั้ง'; busy = false; return; }
    claw.classList.add('travel', 'sway'); claw.style.left = '12%'; sfx('whoosh'); await wait(1150);
    claw.classList.remove('sway'); claw.classList.remove('closed'); claw.classList.add('open'); sfx('drop');
    var capEl = tg.el; capEl.style.transition = 'transform .7s cubic-bezier(.5,0,1,.6), opacity .3s .5s'; hold.style.zIndex = 9;
    capEl.style.transform = 'translateY(' + (glass.clientHeight * .55) + 'px)'; capEl.style.opacity = '0'; await wait(800);
    capEl.remove(); cx = 12; claw.classList.remove('travel'); claw.classList.add('sway');
    got++; cnt(); showPrize(tg); claw.style.left = '50%'; cx = 50; busy = false;
    tip.textContent = got >= N ? 'คีบครบทุกแคปซูลแล้ว!' : 'คีบอีกครั้งไหม';
  }
  $('bGo').addEventListener('click', grab);
  function showPrize(c) {
    var a = c.k * 2, ids = [a, a + 1].filter(function (i) { return P[i]; });
    pzCard.innerHTML = '<div class="cap-big shake" id="capBig">' + capSVG(c.c, 't') + capSVG(c.c, 'b') + '</div><div class="pz-ph" id="pzPh"></div><button class="pz-ok" id="pzOk" type="button">เก็บเข้ากระเป๋า</button>';
    prize.classList.add('open'); prize.setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll'); sfx('chime');
    setTimeout(function () {
      var cb = $('capBig'); if (!cb) return; cb.classList.remove('shake'); cb.classList.add('split'); sfx('pop'); if (window.TUFx) TUFx.confetti(innerWidth / 2, innerHeight * .35, 50);
      $('pzPh').innerHTML = ids.map(function (i, n) { return '<figure class="pol" data-i="' + i + '" style="--r:' + (n ? 2.5 : -2.5) + 'deg;--d:' + (n * .25) + 's"><div class="ph" style="background-image:url(\'' + esc(P[i].src) + '\')"></div><figcaption>' + esc(P[i].cap || NOTES[i % NOTES.length]) + '</figcaption></figure>'; }).join('');
    }, 1100);
    $('pzOk').onclick = function () {
      prize.classList.remove('open'); prize.setAttribute('aria-hidden', 'true'); document.body.classList.remove('no-scroll');
      var em = shRow.querySelector('.empty'); if (em) em.remove();
      ids.forEach(function (i, n) { var d = document.createElement('div'); d.className = 'it'; d.setAttribute('data-i', i); d.style.setProperty('--r', (n ? 3 : -3) + 'deg'); d.innerHTML = '<div class="ph" style="background-image:url(\'' + esc(P[i].src) + '\')"></div>'; shRow.appendChild(d); });
      if (got >= N) { sfx('win'); if (window.TUFx) TUFx.confetti(innerWidth / 2, innerHeight / 2, 120); }
    };
  }
  prize.addEventListener('click', function (e) { var f = e.target.closest('.pol'); if (f && pool[+f.getAttribute('data-i')]) pool[+f.getAttribute('data-i')].click(); });
  shRow.addEventListener('click', function (e) { var f = e.target.closest('.it'); if (f && pool[+f.getAttribute('data-i')]) pool[+f.getAttribute('data-i')].click(); });
})();
