(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD, sfx = function (n) { if (window.TUSfx) TUSfx.play(n); };
  var $ = function (id) { return document.getElementById(id); };
  var STAR = '<svg class="doo" viewBox="0 0 100 100"><path d="M50 6 L61 38 L94 38 L67 58 L77 92 L50 72 L23 92 L33 58 L6 38 L39 38Z" fill="#ffe9a0" stroke="#ffe9a0" stroke-width="6" stroke-linejoin="round"/></svg>';
  $('gArt').innerHTML = STAR; $('polArt').innerHTML = STAR;
  /* รูปแบบกลุ่มดาว (พิกัดเปอร์เซ็นต์) */
  var SHAPES = [
    [[18, 62], [34, 42], [52, 50], [68, 30], [84, 52]], [[20, 30], [42, 24], [60, 44], [40, 66], [74, 70]],
    [[50, 18], [30, 40], [70, 40], [38, 72], [62, 72]], [[16, 54], [32, 36], [50, 56], [66, 36], [84, 56], [50, 78]],
    [[24, 24], [50, 34], [74, 24], [62, 56], [38, 56], [50, 78]], [[14, 70], [30, 48], [46, 60], [58, 30], [78, 44], [88, 70]]
  ];
  var N = Math.ceil(P.length / 2), done = 0, maps = $('maps');
  function cnt() { $('cnt').textContent = '(' + done + '/' + N + ')'; } cnt();
  for (var k = 0; k < N; k++) {
    var sh = SHAPES[k % SHAPES.length], mp = document.createElement('div'); mp.className = 'map'; mp.setAttribute('data-k', k); mp.setAttribute('data-n', 0);
    var h = '<h3>กลุ่มดาวที่ ' + (k + 1) + '</h3><svg class="lines" viewBox="0 0 100 75" preserveAspectRatio="none"></svg>';
    sh.forEach(function (p, i) { h += '<button type="button" class="pt' + (i === 0 ? ' next' : '') + '" data-i="' + i + '" style="left:' + p[0] + '%;top:' + p[1] + '%" aria-label="ดาวดวงที่ ' + (i + 1) + '"><i></i><b>' + (i + 1) + '</b></button>'; });
    mp.innerHTML = h + '<span class="tap">แตะเพื่อดูความทรงจำ</span>'; maps.appendChild(mp);
  }
  maps.addEventListener('click', function (e) {
    var mp = e.target.closest('.map'); if (!mp) return; var k = +mp.getAttribute('data-k'), sh = SHAPES[k % SHAPES.length];
    var pt = e.target.closest('.pt');
    if (mp.classList.contains('done')) { TUMem.open([k * 2, k * 2 + 1], { title: 'กลุ่มดาวที่ ' + (k + 1), ok: 'ปิด' }); return; }
    if (!pt) return; var i = +pt.getAttribute('data-i'), n = +mp.getAttribute('data-n');
    if (i !== n) { pt.classList.remove('wrong'); void pt.offsetWidth; pt.classList.add('wrong'); sfx('soft'); return; }
    pt.classList.remove('next'); pt.classList.add('on'); sfx('tick'); mp.setAttribute('data-n', n + 1);
    if (n > 0) { var a = sh[n - 1], b = sh[n]; mp.querySelector('.lines').insertAdjacentHTML('beforeend', '<line class="ln" x1="' + a[0] + '" y1="' + (a[1] * .75) + '" x2="' + b[0] + '" y2="' + (b[1] * .75) + '" vector-effect="non-scaling-stroke" style="stroke-width:1.6"/>'); }
    var nx = mp.querySelector('.pt[data-i="' + (n + 1) + '"]'); if (nx) nx.classList.add('next');
    else { mp.classList.add('done'); done++; cnt(); sfx('chime'); if (window.TUFx) { var r = mp.getBoundingClientRect(); TUFx.confetti(r.left + r.width / 2, r.top + r.height / 2, 40, ['#ffe9a0', '#8fd0ff', '#fff']); } setTimeout(function () { TUMem.open([k * 2, k * 2 + 1], { title: 'กลุ่มดาวที่ ' + (k + 1), ok: 'ต่อกลุ่มดาวต่อไป' }); }, 700); }
  });
})();
