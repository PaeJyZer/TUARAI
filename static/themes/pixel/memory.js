(function () {
  'use strict';
  var P = window.TU_PHOTOS || [];
  var $ = function (id) { return document.getElementById(id); };
  var sfx = function (n) { if (window.TUSfx) TUSfx.play(n); };
  var NOTES = ['วันที่เราเจอกัน', 'รอยยิ้มที่ฉันชอบที่สุด', 'มื้อนี้อร่อยเพราะมีเธอ', 'วันที่ฝนตกแต่ใจอบอุ่น', 'ถ่ายรูปคู่กันครั้งแรก', 'เซอร์ไพรส์เล็กๆ ที่ไม่ลืม', 'วันธรรมดาที่พิเศษเพราะเธอ', 'ทริปที่อยากกลับไปอีก'];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pool = [].slice.call(document.querySelectorAll('.pool [data-photo]'));
  /* สไปรต์พิกเซล 8x8 */
  var PAL = { r: '#ff4d6d', o: '#ff9f43', y: '#ffd23f', g: '#3ddc84', c: '#3de4ff', b: '#4d7cff', p: '#b57bff', w: '#ffffff', k: '#3a2a4a', n: '#9a6b3d', s: '#ffd8b0' };
  var SPR = [
    ['.rr.rr..', 'rrrrrrr.', 'rrrrrrr.', 'rrrrrrr.', '.rrrrr..', '..rrr...', '...r....', '........'],
    ['...y....', '...y....', 'yyyyyyy.', '.yyyyy..', '..yyy...', '.yy.yy..', '.y...y..', '........'],
    ['..rrrr..', '.rrwwrr.', 'rrwwrrrr', 'rrrrwwrr', '.rrrrrr.', '...ss...', '...ss...', '........'],
    ['..wwww..', '.wwwwww.', 'wkwwwkw.', 'wwwwwww.', 'wwwwwww.', 'wwwwwww.', 'w.w.w.w.', '........'],
    ['....g...', '...g....', '..rr.rr.', '.rrrrrrr', '.rrrrrrr', '..rrrrr.', '...rrr..', '........'],
    ['..cccc..', '.cwcccc.', 'cwccccbc', 'ccccccbc', '.cccccb.', '..cccb..', '...bb...', '........'],
    ['..p.p...', '.ppppp..', 'ppyyypp.', '.ppppp..', '..ppp...', '...g....', '..gg....', '........'],
    ['o.....o.', 'oo...oo.', 'ooooooo.', 'okoooko.', 'ooooooo.', '.ooroo..', '..ooo...', '........'],
    ['..yyy...', '.y...y..', '.y...y..', '..yyy...', '...y....', '...yy...', '...y....', '...yy...'],
    ['..bbb...', '.bbbwb..', 'bbbwbbb.', 'bbbbbbb.', 'bbbbbbb.', '.bbbbb..', '..bbb...', '........']
  ];
  function sprite(i) {
    var rows = SPR[i % SPR.length], r = '';
    rows.forEach(function (row, y) { for (var x = 0; x < 8; x++) { var c = row[x]; if (c !== '.' && PAL[c]) r += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + PAL[c] + '"/>'; } });
    return '<svg viewBox="0 0 8 8" shape-rendering="crispEdges">' + r + '</svg>';
  }
  $('gSprite').innerHTML = sprite(0);
  /* แบ่งด่าน ด่านละ 4 คู่ (เหลือ 1 คู่ให้รวมกับด่านก่อนหน้า) */
  var stages = [], i = 0, per = 4;
  while (i < P.length) { var left = P.length - i; var take = left === per + 1 ? per + 1 : Math.min(per, left); stages.push([i, i + take]); i += take; }
  if (!stages.length) stages.push([0, 0]);
  var si = 0, moves = 0, got = 0, first = null, lock = false, pairsLeft = 0;
  $('hStages').textContent = stages.length; $('hItems').textContent = P.length;
  function shuffle(a) { for (var k = a.length - 1; k > 0; k--) { var j = (Math.random() * (k + 1)) | 0, t = a[k]; a[k] = a[j]; a[j] = t; } return a; }
  function build() {
    var s = stages[si], ids = []; for (var k = s[0]; k < s[1]; k++) ids.push(k);
    var deck = shuffle(ids.concat(ids)); pairsLeft = ids.length; first = null; lock = false;
    var b = $('board'); b.style.gridTemplateColumns = 'repeat(' + (deck.length > 8 ? 5 : 4) + ', 1fr)'; b.innerHTML = '';
    deck.forEach(function (id, n) {
      var c = document.createElement('button'); c.type = 'button'; c.className = 'card'; c.setAttribute('data-id', id); c.setAttribute('aria-label', 'การ์ดที่ ' + (n + 1));
      c.innerHTML = '<span class="in"><span class="b"></span><span class="f">' + sprite(id - s[0] + stages.length * 0 + (id % 10)) + '</span></span>'; b.appendChild(c);
    });
    $('hStage').textContent = si + 1;
  }
  build();
  function reveal(id) {
    var p = P[id], note = p.cap || NOTES[id % NOTES.length], g = $('get'), card = $('getCard');
    card.innerHTML = '<h3>ITEM GET!</h3><canvas id="gcv" width="320" height="240"></canvas><p>' + esc(note) + '</p><button class="px-btn" id="gOk" type="button">OK</button>';
    g.classList.add('open'); g.setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll'); sfx('win');
    var cv = $('gcv'), cx = cv.getContext('2d'), im = new Image();
    im.onload = function () {
      var steps = [6, 12, 24, 48, 96, 320], n = 0;
      var iw = im.width, ih = im.height, sc = Math.max(320 / iw, 240 / ih), sw = 320 / sc, sh = 240 / sc, sx = (iw - sw) / 2, sy = (ih - sh) / 2;
      (function draw() {
        var w = steps[n], h = Math.round(w * .75), t = document.createElement('canvas'); t.width = w; t.height = h; t.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
        cx.imageSmoothingEnabled = n === steps.length - 1; cx.clearRect(0, 0, 320, 240); cx.drawImage(t, 0, 0, w, h, 0, 0, 320, 240);
        if (++n < steps.length) setTimeout(draw, 260); else sfx('chime');
      })();
    };
    im.src = p.src;
    cv.onclick = function () { if (pool[id]) pool[id].click(); };
    $('gOk').onclick = function () {
      g.classList.remove('open'); g.setAttribute('aria-hidden', 'true'); document.body.classList.remove('no-scroll');
      var em = document.querySelector('#bagRow .empty'); if (em) em.remove();
      var it = document.createElement('div'); it.className = 'it'; it.style.backgroundImage = 'url(\'' + p.src.replace(/'/g, '%27') + '\')'; it.onclick = function () { if (pool[id]) pool[id].click(); }; $('bagRow').appendChild(it);
      if (pairsLeft === 0) nextStage();
    };
  }
  function nextStage() {
    if (si < stages.length - 1) {
      si++; $('mSub').textContent = 'STAGE CLEAR! ไปด่านต่อไป'; sfx('unlock'); build();
    } else { $('mSub').textContent = 'ALL CLEAR! ผ่านครบทุกด่านแล้ว'; sfx('win'); if (window.TUFx) TUFx.confetti(innerWidth / 2, innerHeight / 2, 120); $('board').innerHTML = '<p style="grid-column:1/-1;font:400 12px/2 var(--px);color:#ffd23f;padding:30px 0">ALL CLEAR!</p>'; }
  }
  $('board').addEventListener('click', function (e) {
    var c = e.target.closest('.card'); if (!c || lock || c.classList.contains('up')) return;
    c.classList.add('up'); sfx('tap');
    if (!first) { first = c; return; }
    moves++; $('hMoves').textContent = moves; lock = true;
    if (first.getAttribute('data-id') === c.getAttribute('data-id')) {
      var a = first, id = +c.getAttribute('data-id'); first = null;
      setTimeout(function () { a.classList.add('done'); c.classList.add('done'); sfx('coin'); got++; pairsLeft--; $('hItem').textContent = got; lock = false; setTimeout(function () { reveal(id); }, 500); }, 450);
    } else {
      var a2 = first; first = null; setTimeout(function () { a2.classList.remove('up'); c.classList.remove('up'); lock = false; sfx('soft'); }, 800);
    }
  });
})();
