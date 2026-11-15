(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD;
  var $ = function (id) { return document.getElementById(id); };
  var sfx = function (n) { if (window.TUSfx) TUSfx.play(n); };
  var pool = [].slice.call(document.querySelectorAll('.pool [data-photo]'));
  var NOTES = ['วันที่เราเจอกัน', 'รอยยิ้มที่ฉันชอบที่สุด', 'มื้อนี้อร่อยเพราะมีเธอ', 'วันที่ฝนตกแต่ใจอบอุ่น', 'ถ่ายรูปคู่กันครั้งแรก', 'เซอร์ไพรส์เล็กๆ ที่ไม่ลืม', 'วันธรรมดาที่พิเศษเพราะเธอ', 'ทริปที่อยากกลับไปอีก'];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  /* แมวกวักนำโชค ลายเส้นหมี */
  function cat(paw) {
    var W = '#fff6e8', F = function (cx, cy, rx, ry, n, f) { return '<path d="' + D.scal(cx, cy, rx, ry, n) + '" fill="' + f + '"/>'; };
    return '<svg class="doo" viewBox="0 0 160 170" aria-hidden="true"><ellipse cx="80" cy="164" rx="48" ry="5" fill="#000" opacity=".2"/>' +
      F(80, 128, 44, 36, 20, W) + '<g class="pw" style="transform-origin:120px 96px;' + (paw ? 'animation:beck 1s ease-in-out infinite' : '') + '">' + F(120, 84, 14, 22, 10, W) + '<ellipse cx="120" cy="76" rx="5" ry="4" fill="#f4a3b6"/></g>' +
      F(46, 46, 14, 16, 10, W) + '<path d="M42 44 q4 -8 10 -2 q-2 8 -10 2z" fill="#f4a3b6"/>' + F(114, 46, 14, 16, 10, W) + '<path d="M108 42 q6 -6 10 2 q-8 6 -10 -2z" fill="#f4a3b6"/>' + F(80, 70, 44, 36, 22, W) +
      '<circle cx="64" cy="70" r="3.4" fill="#3b2a22"/><circle cx="96" cy="70" r="3.4" fill="#3b2a22"/><path d="M76 80 q4 4 8 0 M80 78 v3 M80 82 q-5 6 -10 1 M80 82 q5 6 10 1" stroke="#7a4a3a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="54" cy="82" rx="7" ry="4" fill="#f4a3b6" opacity=".6"/><ellipse cx="106" cy="82" rx="7" ry="4" fill="#f4a3b6" opacity=".6"/>' +
      '<path d="M52 100 Q80 114 108 100 L106 108 Q80 124 54 108Z" fill="#d8453b"/><circle cx="80" cy="116" r="8" fill="#f2b84b"/><path d="M80 111 v10" stroke="#b8841f" stroke-width="2"/></svg>';
  }
  var st = document.createElement('style'); st.textContent = '@keyframes beck{50%{transform:rotate(-24deg)}}'; document.head.appendChild(st);
  $('gCat').innerHTML = cat(true); $('catSit').innerHTML = cat(false);
  function lanterns(el) { var h = ''; for (var i = 0; i < 6; i++) { var c = ['#e8545a', '#f2b84b', '#e8545a', '#f4a3b6', '#f2b84b', '#e8545a'][i]; h += '<svg class="lantern" viewBox="0 0 44 76"><path d="M22 0 v10" stroke="#caa05a" stroke-width="2"/><path d="' + D.scal(22, 38, 18, 24, 16) + '" fill="' + c + '"/><path d="M8 30 q14 6 28 0 M8 46 q14 6 28 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".5"/><rect x="14" y="62" width="16" height="6" rx="2" fill="#caa05a"/><path d="M22 68 v8" stroke="#f2b84b" stroke-width="3"/></svg>'; } el.innerHTML = h; }
  lanterns($('lRow')); lanterns($('lRow2'));
  $('catSit').addEventListener('click', function () { var c = $('catSit'); c.classList.remove('meow'); void c.offsetWidth; c.classList.add('meow'); sfx('meow'); hint(); });
  var N = P.length || 1, idx = 0, R = 3, C = 3, tiles = [], blank, solved = false, moves = 0;
  var zb = $('zb');
  function cnt() { $('zCount').textContent = '(' + Math.min(idx, N) + '/' + N + ')'; }
  var paws = $('paws'); for (var i = 0; i < Math.min(N, 20); i++) paws.innerHTML += '<i><svg viewBox="0 0 48 48" class="doo">' + '<path d="' + D.scal(24, 32, 13, 11, 12) + '" fill="#f2b84b"/><path d="' + D.scal(9, 20, 5.5, 6.5, 8) + '" fill="#f2b84b"/><path d="' + D.scal(19, 10, 5.5, 6.5, 8) + '" fill="#f2b84b"/><path d="' + D.scal(30, 10, 5.5, 6.5, 8) + '" fill="#f2b84b"/><path d="' + D.scal(40, 20, 5.5, 6.5, 8) + '" fill="#f2b84b"/></svg></i>';
  function nbrs(p) { var r = (p / C) | 0, c = p % C, o = []; if (r > 0) o.push(p - C); if (r < R - 1) o.push(p + C); if (c > 0) o.push(p - 1); if (c < C - 1) o.push(p + 1); return o; }
  function setup() {
    solved = false; zb.classList.remove('solved'); moves = 0; cnt();
    R = 3; C = 3;
    var src = P[idx].src; zb.style.setProperty('--r', R); zb.style.setProperty('--c', C); zb.innerHTML = '';
    blank = R * C - 1; var pos = []; for (var k = 0; k < R * C; k++) pos.push(k); // pos[tile]=cell
    var occ = pos.slice(), b = blank, last = -1;
    for (var s = 0; s < 40; s++) { var ns = nbrs(b).filter(function (x) { return x !== last; }); var m = ns[(Math.random() * ns.length) | 0]; occ[b] = occ[m]; occ[m] = blank; last = b; b = m; }
    // occ[cell] = tile id ; blank tile = R*C-1
    tiles = occ; blank = b;
    tiles.forEach(function (t, cell) {
      if (t === R * C - 1) return;
      var d = document.createElement('div'); d.className = 'tile'; d.setAttribute('data-t', t);
      d.style.cssText = '--x:' + (cell % C) + ';--y:' + ((cell / C) | 0) + ';--tx:' + (t % C) + ';--ty:' + ((t / C) | 0);
      d.innerHTML = '<div class="t" style="background-image:url(\'' + src.replace(/'/g, '%27') + '\')"></div>'; zb.appendChild(d);
    });
    $('zMsg').textContent = 'แตะกระเบื้องที่อยู่ข้างช่องว่างเพื่อเลื่อน';
  }
  function cellOf(t) { return tiles.indexOf(t); }
  function move(t) {
    if (solved) return;
    var cell = cellOf(t); if (nbrs(cell).indexOf(blank) < 0) return false;
    tiles[blank] = t; tiles[cell] = R * C - 1; var d = zb.querySelector('[data-t="' + t + '"]');
    d.style.setProperty('--x', blank % C); d.style.setProperty('--y', (blank / C) | 0); blank = cell; moves++; sfx('tick');
    if (tiles.every(function (v, c) { return v === c; })) setTimeout(win, 250);
    return true;
  }
  zb.addEventListener('click', function (e) { var d = e.target.closest('.tile'); if (d) move(+d.getAttribute('data-t')); });
  function hint() {
    if (solved) return; var cands = nbrs(blank).map(function (c) { return tiles[c]; });
    var best = cands.filter(function (t) { return cellOf(t) !== t; })[0]; if (best == null) best = cands[0];
    var d = zb.querySelector('[data-t="' + best + '"]'); if (!d) return; d.classList.remove('hint'); void d.offsetWidth; d.classList.add('hint');
    $('zMsg').textContent = 'แมวชี้ว่าให้ลองเลื่อนกระเบื้องที่กะพริบ';
  }
  $('hintBtn').addEventListener('click', hint);
  $('solveBtn').addEventListener('click', function () {
    if (solved) return; var all = zb.querySelectorAll('.tile');
    for (var c = 0; c < R * C; c++) tiles[c] = c; blank = R * C - 1;
    all.forEach(function (d) { var t = +d.getAttribute('data-t'); d.style.setProperty('--x', t % C); d.style.setProperty('--y', (t / C) | 0); });
    setTimeout(win, 400);
  });
  function win() {
    if (solved) return; solved = true; zb.classList.add('solved'); sfx('win'); if (window.TUFx) TUFx.confetti(innerWidth / 2, innerHeight * .4, 70);
    var p = P[idx], id = idx, ov = $('doneOv'), card = $('doneCard'); paws.children[id] && paws.children[id].classList.add('on');
    var last = idx >= N - 1;
    card.innerHTML = '<h3>' + (last ? 'ต่อครบทุกรูปแล้ว!' : 'ต่อสำเร็จ!') + '</h3><figure class="pol" data-i="' + id + '"><div class="ph" style="background-image:url(\'' + esc(p.src) + '\')"></div><figcaption>' + esc(p.cap || NOTES[id % NOTES.length]) + '</figcaption></figure><button class="z-btn" id="dnOk" type="button">' + (last ? 'เก็บเข้าอัลบั้ม' : 'ไปรูปถัดไป') + '</button>';
    setTimeout(function () { ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll'); }, 500);
    $('dnOk').onclick = function () {
      ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); document.body.classList.remove('no-scroll');
      var em = document.querySelector('#alRow .empty'); if (em) em.remove();
      var it = document.createElement('div'); it.className = 'it'; it.setAttribute('data-i', id); it.style.setProperty('--r', ((id % 3) - 1) * 3 + 'deg'); it.innerHTML = '<div class="ph" style="background-image:url(\'' + esc(p.src) + '\')"></div>'; $('alRow').appendChild(it);
      idx++; cnt();
      if (idx < N) setup(); else { $('zMsg').textContent = 'ต่อครบทุกรูปแล้ว! แมวนำโชคมีจดหมายให้'; zb.style.opacity = .6; }
    };
  }
  card_click();
  function card_click() {
    $('doneCard').addEventListener('click', function (e) { var f = e.target.closest('.pol'); if (f && pool[+f.getAttribute('data-i')]) pool[+f.getAttribute('data-i')].click(); });
    $('alRow').addEventListener('click', function (e) { var f = e.target.closest('.it'); if (f && pool[+f.getAttribute('data-i')]) pool[+f.getAttribute('data-i')].click(); });
  }
  if (P.length) setup();
})();
