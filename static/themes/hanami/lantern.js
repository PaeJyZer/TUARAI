(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD, sfx = function (n) { if (window.TUSfx) TUSfx.play(n); };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function stars(el, n) { var h = ''; for (var i = 0; i < n; i++) h += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 100).toFixed(1) + '%;animation-delay:-' + (Math.random() * 3).toFixed(1) + 's;opacity:' + (.4 + Math.random() * .6).toFixed(2) + '"></i>'; el.innerHTML = h; }
  stars($('gStars'), 50); stars($('stars'), 60);
  var C = ['#e8545a', '#f2a444', '#e8707a', '#f7c06a'];
  function lan(i) {
    var c = C[i % 4];
    return '<span class="body"><svg class="doo" viewBox="0 0 80 110"><path d="M40 0 v12" stroke="#caa05a" stroke-width="2.5"/><rect x="26" y="10" width="28" height="7" rx="3" fill="#caa05a"/><path d="' + D.scal(40, 52, 32, 38, 18) + '" fill="' + c + '"/><path d="M12 40 q28 12 56 0 M10 56 q30 12 60 0 M16 72 q24 10 48 0" stroke="#fff" stroke-width="2" fill="none" opacity=".45"/><ellipse cx="28" cy="34" rx="5" ry="10" fill="#fff" opacity=".35" transform="rotate(20 28 34)"/><rect x="26" y="88" width="28" height="7" rx="3" fill="#caa05a"/><path d="M40 95 v12" stroke="#f2b84b" stroke-width="3" stroke-linecap="round"/></svg></span>';
  }
  $('gLan').innerHTML = lan(0).replace('class="body"', 'class="body" style="filter:none"'); $('bigArt').innerHTML = lan(1).replace('class="body"', 'class="body" style="filter:none"');
  var N = Math.ceil(P.length / 2), field = $('field'), lit = {}, nl = 0, cols = 3;
  var skyRows = Math.ceil(N / cols), rowH = 100, skyH = skyRows * rowH + 20, W = Math.min(560, window.innerWidth);
  field.style.height = (skyH + 60 + Math.ceil(N / 6) * 52 + 90) + 'px';
  function cnt() { $('lCount').textContent = '(' + nl + '/' + N + ')'; } cnt();
  for (var k = 0; k < N; k++) {
    var el = document.createElement('button'); el.type = 'button'; el.className = 'lan'; el.setAttribute('data-k', k); el.setAttribute('aria-label', 'โคมดวงที่ ' + (k + 1));
    var r = Math.floor(k / cols), c = k % cols;
    el.setAttribute('data-ty', 6 + r * rowH + (c % 2 ? 36 : 0)); el.setAttribute('data-tx', ((c + .5 + (r % 2 ? .2 : -.12)) / cols * 100 + ((k * 31) % 7) - 3).toFixed(1));
    el.style.left = (10 + (k % 6) * 15) + '%'; el.style.top = (skyH + 40 + Math.floor(k / 6) * 52 + ((k * 17) % 3) * 6) + 'px';
    el.innerHTML = '<span class="glow"></span>' + lan(k) + '<span class="ph" style="background-image:url(\'' + esc(P[k * 2].src) + '\')"></span>';
    field.appendChild(el);
  }
  field.addEventListener('click', function (e) {
    var l = e.target.closest('.lan'); if (!l) return; var k = +l.getAttribute('data-k');
    if (l.classList.contains('up')) { TUMem.open([k * 2, k * 2 + 1], { title: 'โคมดวงที่ ' + (k + 1), ok: 'ปิด' }); return; }
    if (l.classList.contains('lit')) return;
    l.classList.add('lit'); sfx('chime');
    setTimeout(function () {
      sfx('whoosh'); l.style.left = l.getAttribute('data-tx') + '%'; l.style.top = l.getAttribute('data-ty') + 'px'; l.classList.add('up');
      if (!lit[k]) { lit[k] = 1; nl++; cnt(); }
      setTimeout(function () { TUMem.open([k * 2, k * 2 + 1], { title: 'โคมดวงที่ ' + (k + 1), ok: 'ปล่อยโคมต่อ' }); if (nl >= N && window.TUToast) setTimeout(function () { TUToast('ปล่อยครบทุกดวงแล้ว!'); }, 800); }, 1900);
    }, 650);
  });
})();
