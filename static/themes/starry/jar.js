(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD, sfx = function (n) { if (window.TUSfx) TUSfx.play(n); };
  var $ = function (id) { return document.getElementById(id); };
  $('gArt').innerHTML = '<svg class="doo" viewBox="0 0 100 110"><circle cx="50" cy="56" r="8" fill="#fff6b0"/><circle cx="50" cy="56" r="22" fill="#ffe27a" opacity=".3"/><circle cx="50" cy="56" r="38" fill="#ffd86b" opacity=".12"/></svg>';
  function jar(level) {
    var f = '';
    for (var i = 0; i < level; i++) f += '<circle cx="' + (40 + (i * 37) % 40) + '" cy="' + (112 - (i * 13) % 50) + '" r="4" fill="#fff6b0" opacity=".95"/><circle cx="' + (40 + (i * 37) % 40) + '" cy="' + (112 - (i * 13) % 50) + '" r="11" fill="#ffe27a" opacity=".3"/>';
    return '<svg class="doo" viewBox="0 0 120 150"><ellipse cx="60" cy="146" rx="40" ry="4" fill="#000" opacity=".3"/><rect x="38" y="6" width="44" height="16" rx="5" fill="#c9965a"/><path d="M34 22 h52 q8 10 8 22 v76 q0 22 -22 22 h-24 q-22 0 -22 -22 v-76 q0 -12 8 -22z" fill="#dff1ff" opacity=".22" stroke="#cfe6ff" stroke-width="2"/>' + f + '<path d="M44 40 q-4 30 0 60" stroke="#fff" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/></svg>';
  }
  var N = Math.ceil(P.length / 2), got = 0, sky = $('sky'), jarArt = $('jarArt');
  jarArt.innerHTML = jar(0);
  function cnt() { $('cnt').textContent = '(' + got + '/' + N + ')'; } cnt();
  for (var k = 0; k < N; k++) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ff'; b.setAttribute('data-k', k); b.setAttribute('aria-label', 'หิ่งห้อยตัวที่ ' + (k + 1));
    var r = function (a) { return ((Math.random() - .5) * a).toFixed(0) + 'px'; };
    b.style.cssText = 'left:' + (14 + Math.random() * 72).toFixed(1) + '%;top:' + (12 + Math.random() * 70).toFixed(1) + '%;--t:' + (10 + Math.random() * 8).toFixed(1) + 's;--dl:-' + (Math.random() * 10).toFixed(1) + 's;--x1:' + r(90) + ';--y1:' + r(70) + ';--x2:' + r(90) + ';--y2:' + r(70) + ';--x3:' + r(90) + ';--y3:' + r(70) + ';--x4:' + r(90) + ';--y4:' + r(70);
    b.innerHTML = '<i></i>'; sky.appendChild(b);
  }
  sky.addEventListener('click', function (e) {
    var f = e.target.closest('.ff'); if (!f || f.classList.contains('caught')) return;
    var k = +f.getAttribute('data-k'); sfx('chime');
    var jr = $('jarBtn').getBoundingClientRect(), sr = sky.getBoundingClientRect(), fr = f.getBoundingClientRect();
    f.style.transform = 'translate(' + 0 + 'px,' + 0 + 'px)'; f.classList.add('caught');
    f.style.left = ((jr.left + jr.width / 2 - sr.left) / sr.width * 100) + '%'; f.style.top = (jr.top + 40 - sr.top) + 'px';
    got++; cnt(); jarArt.innerHTML = jar(got);
    setTimeout(function () { TUMem.open([k * 2, k * 2 + 1], { title: 'หิ่งห้อยตัวที่ ' + (k + 1), ok: 'ปล่อยให้บินต่อในโหล' }); if (got >= N && window.TUToast) setTimeout(function () { TUToast('จับครบทุกตัวแล้ว โหลเรืองแสงเต็มที่!'); }, 600); }, 900);
  });
})();
