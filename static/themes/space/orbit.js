(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD, sfx = function (n) { if (window.TUSfx) TUSfx.play(n); };
  var $ = function (id) { return document.getElementById(id); };
  var COL = [['#ff9a8a', '#d4584e'], ['#ffd27a', '#d49a2e'], ['#9fd8ff', '#4a8ed4'], ['#c8a8ff', '#7a52d0'], ['#9fe8c0', '#3fa874'], ['#ffb0d4', '#d45a96']];
  function planet(k) {
    var c = COL[k % 6], ring = (k % 3 === 1) ? '<ellipse cx="50" cy="52" rx="48" ry="12" fill="none" stroke="' + c[0] + '" stroke-width="4" opacity=".8" transform="rotate(-20 50 52)"/>' : '';
    return '<svg class="doo" viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="' + c[0] + '"/><path d="M26 40 q24 8 48 -2 M22 56 q28 10 56 0" stroke="' + c[1] + '" stroke-width="4" fill="none" opacity=".4" stroke-linecap="round"/><ellipse cx="40" cy="38" rx="9" ry="5" fill="#fff" opacity=".4" transform="rotate(-30 40 38)"/><circle cx="42" cy="54" r="2.4" fill="#3b2a4a"/><circle cx="58" cy="54" r="2.4" fill="#3b2a4a"/><path d="M45 61 q5 5 10 0" stroke="#3b2a4a" stroke-width="2" fill="none" stroke-linecap="round"/>' + ring + '</svg>';
  }
  var SUN = '<svg class="doo" viewBox="0 0 100 100"><path d="' + D.scal(50, 50, 40, 40, 18) + '" fill="#ffd25e"/><circle cx="50" cy="50" r="26" fill="#ffe9a0"/><circle cx="42" cy="48" r="3" fill="#7a4a1a"/><circle cx="58" cy="48" r="3" fill="#7a4a1a"/><path d="M44 58 q6 6 12 0" stroke="#7a4a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>';
  $('gArt').innerHTML = planet(2); $('sunArt').innerHTML = SUN;
  var N = Math.ceil(P.length / 2), sys = $('sys'), done = 0;
  function cnt() { $('cnt').textContent = '(' + done + '/' + N + ')'; } cnt();
  var rings = N > 8 ? 3 : N > 3 ? 2 : 1, radii = [78, 56, 34].slice(3 - rings).reverse().reverse(), per = Math.ceil(N / rings), k = 0;
  radii = rings === 3 ? [86, 62, 40] : rings === 2 ? [80, 52] : [70];
  radii.forEach(function (R, ri) {
    var orb = document.createElement('div'); orb.className = 'orb'; orb.style.cssText = 'width:' + R + '%;height:' + R + '%;--sp:' + (34 + ri * 16) + 's' + (ri % 2 ? ';animation-direction:reverse' : '');
    var cntRing = Math.min(per, N - k);
    for (var i = 0; i < cntRing; i++, k++) {
      var a = (i / cntRing) * 2 * Math.PI + ri, b = document.createElement('button'); b.type = 'button'; b.className = 'pl'; b.setAttribute('data-k', k); b.setAttribute('aria-label', 'ดาวเคราะห์ที่ ' + (k + 1));
      b.style.cssText = 'left:' + (50 + 50 * Math.cos(a)) + '%;top:' + (50 + 50 * Math.sin(a)) + '%;--sp:' + (34 + ri * 16) + 's' + (ri % 2 ? ';animation-direction:normal' : ';animation-direction:reverse');
      b.innerHTML = planet(k); orb.appendChild(b);
    }
    sys.appendChild(orb);
  });
  var land = document.createElement('div'); land.className = 'land'; document.body.appendChild(land);
  sys.addEventListener('click', function (e) {
    var p = e.target.closest('.pl'); if (!p) return; var kk = +p.getAttribute('data-k');
    land.innerHTML = '<div class="big">' + planet(kk) + '</div><p>กำลังลงจอดบนดาวดวงที่ ' + (kk + 1) + '…</p>'; land.classList.add('on'); sfx('whoosh');
    setTimeout(function () {
      land.classList.remove('on'); if (!p.classList.contains('visited')) { p.classList.add('visited'); done++; cnt(); }
      TUMem.open([kk * 2, kk * 2 + 1], { title: 'ดาวเคราะห์ดวงที่ ' + (kk + 1), ok: 'กลับขึ้นยาน' }); sfx('chime');
      if (done >= N && window.TUToast) setTimeout(function () { TUToast('สำรวจครบทุกดวงแล้ว!'); }, 800);
    }, 1500);
  });
})();
