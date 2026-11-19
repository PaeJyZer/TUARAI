(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD;
  var rowsEl = document.getElementById('rows'), pool = [].slice.call(document.querySelectorAll('.pool [data-photo]'));
  var NOTES = ['วันที่เราเจอกัน', 'รอยยิ้มที่ฉันชอบที่สุด', 'มื้อนี้อร่อยเพราะมีเธอ', 'วันที่ฝนตกแต่ใจอบอุ่น', 'ถ่ายรูปคู่กันครั้งแรก', 'เซอร์ไพรส์เล็กๆ ที่ไม่ลืม', 'วันธรรมดาที่พิเศษเพราะเธอ', 'ทริปที่อยากกลับไปอีก'];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var COL = ['#f4a3b6', '#f7cf7a', '#9fd0e8', '#c4a8e6', '#9fd8bd', '#f8b48e'];
  function bunting(el) {
    var n = 14, s = '<svg viewBox="0 0 700 54" preserveAspectRatio="none"><path d="M0 6 Q350 30 700 6" stroke="#b79778" stroke-width="2" fill="none"/>';
    for (var i = 0; i < n; i++) { var x = 22 + i * 49, y = 6 + 24 * Math.sin(Math.PI * (x / 700)) * .98; s += '<path d="M' + (x - 16) + ' ' + (y - 1) + ' L' + (x + 16) + ' ' + (y - 1) + ' L' + x + ' ' + (y + 30) + 'Z" fill="' + COL[i % 6] + '"/>'; }
    el.innerHTML = s + '</svg>';
  }
  bunting(document.getElementById('bunt0')); bunting(document.getElementById('bunt1'));
  document.getElementById('gTrio').innerHTML = D.balloon(0) + D.balloon(1) + D.balloon(2);
  document.getElementById('cakeArt').innerHTML = '<svg class="doo" viewBox="0 0 200 170" aria-hidden="true">' +
    '<ellipse cx="100" cy="160" rx="84" ry="8" fill="#7a5222" opacity=".13"/>' +
    '<path d="' + D.scal(100, 132, 82, 28, 22) + '" fill="#f7b7c9"/><path d="M20 120 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 v-14 h-160z" fill="#fff6f0"/>' +
    '<path d="' + D.scal(100, 92, 60, 24, 18) + '" fill="#f9dc97"/><path d="M44 84 q8 12 16 0 q8 12 16 0 q8 12 16 0 q8 12 16 0 q8 12 16 0 q8 12 16 0 q8 12 16 0 v-12 h-112z" fill="#fff6f0"/>' +
    '<path d="' + D.scal(100, 58, 38, 20, 14) + '" fill="#b6e3d3"/><path d="M64 52 q6 10 12 0 q6 10 12 0 q6 10 12 0 q6 10 12 0 q6 10 12 0 v-10 h-60z" fill="#fff6f0"/>' +
    '<g transform="translate(100 28)"><path d="M0 8 C-12 -2 -7 -12 0 -5 C7 -12 12 -2 0 8Z" fill="#e8788c"/></g>' +
    '<circle cx="46" cy="136" r="4" fill="#fff"/><circle cx="76" cy="144" r="4" fill="#f9dc97"/><circle cx="124" cy="144" r="4" fill="#b6e3d3"/><circle cx="154" cy="136" r="4" fill="#fff"/></svg>';
  var N = Math.ceil(P.length / 2), per = window.innerWidth >= 900 ? 3 : 1, popped = 0;
  function cnt() { document.getElementById('bCount').textContent = '(' + popped + '/' + N + ')'; }
  cnt();
  for (var s = 0; s < N; s += per) {
    var row = document.createElement('div'); row.className = 'row';
    var bals = '<div class="bals">', line = '<div class="line">';
    for (var k = s; k < Math.min(N, s + per); k++) {
      var side = per === 1 ? (k % 2 ? 68 : 32) : null;
      bals += '<button class="bal" type="button" data-k="' + k + '" style="--dl:' + (-(k * 0.9)).toFixed(1) + 's' + (side ? ';margin-left:' + (side - 50) + '%' : '') + '" aria-label="ลูกโป่งลูกที่ ' + (k + 1) + '">' + D.balloon(k) + '<span class="hintd">แตะ</span></button>';
      [k * 2, k * 2 + 1].forEach(function (i, n) {
        if (!P[i]) return;
        var span = per === 1 ? [18, 58] : [0, 0];
        var left = per === 1 ? span[n] : ((k - s) * (100 / per) + (n ? 16 : 1));
        line += '<div class="slot" data-k="' + k + '" data-i="' + i + '" style="left:' + left + '%;--r:' + (n ? 3 : -3.5) + 'deg;--d:' + (n * .18) + 's"><span class="pg"></span><figure><div class="ph" style="background-image:url(\'' + esc(P[i].src) + '\')"></div><figcaption>' + esc(P[i].cap || NOTES[i % NOTES.length]) + '</figcaption></figure></div>';
      });
    }
    row.innerHTML = bals + '</div>' + line + '</div>'; rowsEl.appendChild(row);
  }

  /* ---------- ของตกแต่งปาร์ตี้ ---------- */
  var PAL = [['#f4a3b6', '#e8788c'], ['#f7cf7a', '#e8a93a'], ['#9fd0e8', '#6fb0d4'], ['#c4a8e6', '#9c78cf'], ['#9fd8bd', '#5fb596'], ['#f8b48e', '#e8875a']];
  function gift(i) { var c = PAL[i % 6], r = PAL[(i + 3) % 6][1];
    return '<svg viewBox="0 0 60 60" class="doo"><ellipse cx="30" cy="57" rx="24" ry="3" fill="#7a5222" opacity=".13"/><rect x="7" y="25" width="46" height="31" rx="3" fill="' + c[0] + '"/><rect x="4" y="18" width="52" height="12" rx="3" fill="' + c[1] + '"/><rect x="26.5" y="18" width="7" height="38" fill="' + r + '"/>' +
      '<ellipse cx="21" cy="14" rx="9" ry="6" fill="' + r + '" transform="rotate(-25 21 14)"/><ellipse cx="39" cy="14" rx="9" ry="6" fill="' + r + '" transform="rotate(25 39 14)"/><circle cx="30" cy="16" r="4" fill="' + r + '"/><circle cx="14" cy="38" r="2" fill="#fff" opacity=".6"/><circle cx="44" cy="47" r="2" fill="#fff" opacity=".6"/></svg>'; }
  function hat(i) { var c = PAL[i % 6];
    return '<svg viewBox="0 0 60 64" class="doo"><ellipse cx="30" cy="61" rx="22" ry="3" fill="#7a5222" opacity=".13"/><path d="M30 6 L9 58 Q30 64 51 58Z" fill="' + c[0] + '"/><path d="M21 33 L39 28 L43 38 L16 45Z" fill="' + c[1] + '" opacity=".9"/><path d="M14 49 L47 41 L51 58 Q30 64 9 58Z" fill="' + c[1] + '" opacity=".9"/><circle cx="24" cy="22" r="2.2" fill="#fff" opacity=".7"/><circle cx="36" cy="46" r="2.2" fill="#fff" opacity=".7"/><circle cx="30" cy="6" r="6" fill="#fff6dc"/><circle cx="28" cy="4" r="1.6" fill="#fff"/></svg>'; }
  function cupcake(i) { var c = PAL[i % 6];
    return '<svg viewBox="0 0 60 64" class="doo"><ellipse cx="30" cy="60" rx="20" ry="3" fill="#7a5222" opacity=".13"/><path d="M11 33 H49 L44 58 Q30 62 16 58Z" fill="#f2c39a"/><path d="M19 34 L21 58 M27 34 V60 M35 34 V60 M41 34 L39 58" stroke="#e0a874" stroke-width="2"/>' +
      '<path d="M8 34 Q6 22 18 22 Q16 12 30 12 Q44 12 42 22 Q54 22 52 34Z" fill="' + c[0] + '"/><path d="M14 30 Q30 38 46 30" stroke="' + c[1] + '" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="30" cy="9" r="5" fill="#e0475c"/><path d="M30 5 q3 -5 7 -5" stroke="#6a9a58" stroke-width="2" fill="none"/><circle cx="20" cy="24" r="1.8" fill="#fff"/><circle cx="38" cy="26" r="1.8" fill="#fff"/><circle cx="30" cy="22" r="1.8" fill="#f7cf7a"/></svg>'; }
  function star(c) { return '<svg viewBox="0 0 24 24" class="doo"><path d="M12 1l3 7.4 8 .6-6.1 5.2 1.9 7.8L12 17.6 5.2 22l1.9-7.8L1 9l8-.6z" fill="' + c + '"/></svg>'; }
  var PROPS = [[gift, 0, hat, 2], [cupcake, 3, gift, 4], [hat, 1, cupcake, 5], [gift, 5, hat, 3]];
  var party = document.querySelector('.party');
  /* ริบบิ้นสายรุ้งสองข้าง + ไฟประดับ + คอนเฟตตีลอย */
  party.insertAdjacentHTML('afterbegin', '<div class="deco" aria-hidden="true"><div class="strm sl"></div><div class="strm sr"></div><div class="conf" id="confL"></div></div>');
  var lights = '<svg viewBox="0 0 700 60" preserveAspectRatio="none" class="lights" aria-hidden="true"><path d="M0 12 Q175 52 350 18 Q525 -14 700 20" stroke="#8a6a4a" stroke-width="2" fill="none"/>';
  for (var li = 0; li < 17; li++) { var lx = 20 + li * 41, ly = 12 + 22 * Math.sin(li * .8) + (li % 2 ? 6 : 0); lights += '<g class="bulb" style="animation-delay:' + (li * .23).toFixed(2) + 's"><path d="M' + lx + ' ' + (ly - 4) + ' v5" stroke="#8a6a4a" stroke-width="2"/><ellipse cx="' + lx + '" cy="' + (ly + 9) + '" rx="5" ry="7" fill="' + PAL[li % 6][0] + '"/></g>'; }
  party.insertAdjacentHTML('afterbegin', lights + '</svg>');
  var cl = document.getElementById('confL'), shapes = ['', 'sq', 'tri', 'st'];
  for (var ci = 0; ci < 38; ci++) {
    var e = document.createElement('i'); e.className = 'cf ' + shapes[ci % 4];
    e.style.cssText = 'left:' + (Math.random() * 98).toFixed(1) + '%;top:' + (Math.random() * 100).toFixed(1) + '%;background:' + (shapes[ci % 4] === 'tri' ? 'transparent' : COL[ci % 6]) + ';--c:' + COL[ci % 6] + ';animation-duration:' + (7 + Math.random() * 8).toFixed(1) + 's;animation-delay:' + (-Math.random() * 10).toFixed(1) + 's;width:' + (7 + Math.random() * 7).toFixed(0) + 'px;height:' + (7 + Math.random() * 7).toFixed(0) + 'px';
    cl.appendChild(e);
  }
  /* ประดับหัวข้อ */
  var ph = document.querySelector('.p-head h1');
  if (ph) { ph.insertAdjacentHTML('beforebegin', '<span class="sp s1">' + star('#f7cf7a') + '</span><span class="sp s2">' + star('#f4a3b6') + '</span><span class="sp s3">' + star('#9fd0e8') + '</span>'); }
  /* ของประดับแต่ละแถว */
  [].forEach.call(rowsEl.querySelectorAll('.row'), function (rw, ri) {
    var pr = PROPS[ri % 4];
    rw.insertAdjacentHTML('afterbegin', '<div class="props" aria-hidden="true"><span class="pp pl">' + pr[0](pr[1]) + '</span><span class="pp pr">' + pr[2](pr[3]) + '</span></div>');
  });
  /* โต๊ะเค้ก: ป้ายธง ของขวัญ คัพเค้ก ลูกโป่งช่อ */
  var tb = document.querySelector('.table'), occ = (document.querySelector('.p-head .eyebrow') || {}).textContent || 'Happy Anniversary';
  var ban = '<svg viewBox="0 0 320 70" class="doo t-ban" aria-hidden="true"><path d="M0 8 Q160 66 320 8" stroke="#b79778" stroke-width="2" fill="none"/>';
  var word = String(occ).toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 18).split('');
  var wl = word.length; for (var wi = 0; wi < wl; wi++) { var t = (wi + .5) / wl, bx = 12 + t * 296, by = 8 + 50 * 4 * t * (1 - t) * .96; if (word[wi] === ' ') continue; ban += '<path d="M' + (bx - 10) + ' ' + by + ' L' + (bx + 10) + ' ' + by + ' L' + bx + ' ' + (by + 26) + 'Z" fill="' + COL[wi % 6] + '"/><text x="' + bx + '" y="' + (by + 13) + '" font-size="11" font-weight="700" text-anchor="middle" fill="#fff" font-family="sans-serif">' + word[wi] + '</text>'; }
  tb.insertAdjacentHTML('afterbegin', '<div class="t-deco" aria-hidden="true"><div class="tbl">' + ban + '</div><span class="tg g1">' + gift(0) + '</span><span class="tg g2">' + gift(3) + '</span><span class="tg g3">' + hat(2) + '</span><span class="tg g4">' + cupcake(1) + '</span><span class="tg g5">' + cupcake(4) + '</span><span class="tb1">' + D.balloon(0) + '</span><span class="tb2">' + D.balloon(2) + '</span><span class="tb3">' + D.balloon(4) + '</span></div>');
  function pop(b) {
    var k = +b.getAttribute('data-k'); if (b.classList.contains('pop')) return;
    b.classList.add('pop'); popped++; cnt();
    var r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .35;
    if (window.TUSfx) TUSfx.play('pop');
    if (window.TUFx) TUFx.confetti(cx, cy, 46, COL);
    if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
    setTimeout(function () { b.style.visibility = 'hidden'; }, 220);
    [].forEach.call(b.closest('.row').querySelectorAll('.slot[data-k="' + k + '"]'), function (sl) { setTimeout(function () { sl.classList.add('on'); if (window.TUSfx) TUSfx.play('drop'); }, 260); });
    if (popped >= N) setTimeout(allDone, 900);
  }
  function allDone() {
    document.getElementById('cakeArt').classList.add('lit');
    document.getElementById('cakeNote').textContent = 'ครบทุกลูกแล้ว! เค้กพร้อมให้ตัดแล้ว';
    if (window.TUToast) TUToast('แตกครบทุกลูกแล้ว!'); if (window.TUFx) TUFx.rain ? TUFx.rain(5) : 0;
  }
  rowsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.bal'); if (b) { pop(b); return; }
    var sl = e.target.closest('.slot.on'); if (sl && pool[+sl.getAttribute('data-i')]) pool[+sl.getAttribute('data-i')].click();
  });
})();
