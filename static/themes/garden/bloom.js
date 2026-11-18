(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD, sfx = function (n) { if (window.TUSfx) TUSfx.play(n); };
  var PET = [['#f4a3b6', '#e8788c'], ['#f7cf7a', '#e8a93a'], ['#c4a8e6', '#9c78cf'], ['#9fd0e8', '#6fb0d4'], ['#f8b48e', '#e8875a'], ['#fff3f6', '#f4c4d0']];
  function flower(k, bloom, src, src2) {
    var c = PET[k % 6], pet = '', n = 8, i;
    for (i = 0; i < n; i++) { var a = i * 360 / n; pet += '<g transform="rotate(' + a + ' 50 50)"><path d="' + D.scal(50, 20, 12, 18, 10) + '" fill="' + (i % 2 ? c[0] : c[1]) + '" opacity="' + (i % 2 ? 1 : .92) + '"/></g>'; }
    var stem = '<path d="M50 66 C46 100 54 120 50 150" stroke="#7fb877" stroke-width="5" fill="none" stroke-linecap="round"/><path d="' + D.scal(34, 118, 15, 8, 10) + '" fill="#9ccf8e" transform="rotate(-30 34 118)"/><path d="' + D.scal(68, 130, 15, 8, 10) + '" fill="#8ec580" transform="rotate(25 68 130)"/>';
    var head;
    if (bloom) {
      var id = 'cl' + k, leaf = function (x, y, r, sc, col) { return '<path d="M0 0 C6 -9 17 -9 22 0 C17 9 6 9 0 0Z" fill="' + col + '" transform="translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + sc + ')"/>'; };
      var fr = function (n, x, y, rot, im) { return '<g class="ph ph' + n + '" transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"><defs><clipPath id="' + id + n + '"><rect x="-19" y="-24" width="38" height="40" rx="2"/></clipPath></defs><rect x="-22" y="-27" width="44" height="54" rx="3" fill="#fffaf0" stroke="#e9d6c0" stroke-width="1"/><image href="' + im + '" x="-19" y="-24" width="38" height="40" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + id + n + ')"/></g>'; };
      head = '<g class="head burst-in">' +
        leaf(24, 62, 200, 1, '#8ec580') + leaf(76, 60, -20, 1, '#9ccf8e') + leaf(18, 28, 215, .8, '#9ccf8e') + leaf(82, 26, -35, .8, '#8ec580') + leaf(50, 74, 90, .8, '#7fb877') + leaf(50, 6, -90, .7, '#9ccf8e') +
        fr(1, 31, 42, -9, src) + fr(2, 69, 44, 8, src2 || src) +
        '<circle cx="50" cy="58" r="4" fill="' + c[1] + '"/></g>';
    } else {
      head = '<g class="head"><path d="' + D.scal(50, 54, 17, 26, 12) + '" fill="' + c[1] + '"/><path d="M50 30 C42 44 42 64 50 78 C58 64 58 44 50 30Z" fill="' + c[0] + '"/><path d="M40 70 q10 12 20 0" stroke="#7fb877" stroke-width="5" fill="none" stroke-linecap="round"/></g>';
    }
    return '<svg class="doo stem" viewBox="0 0 100 156">' + stem + head + '</svg>';
  }
  document.getElementById('gFl').innerHTML = flower(0, false) ;
  document.getElementById('mbArt').innerHTML = '<svg class="doo" viewBox="0 0 120 120"><rect x="54" y="70" width="12" height="46" fill="#a9764b"/><path d="' + D.scal(60, 52, 42, 26, 16) + '" fill="#e8788c"/><rect x="38" y="46" width="44" height="6" rx="3" fill="#fff" opacity=".5"/><rect x="82" y="30" width="5" height="26" fill="#a9764b"/><path d="M87 30 h18 v10 h-18z" fill="#f7cf7a"/><ellipse cx="60" cy="116" rx="30" ry="4" fill="#000" opacity=".12"/></svg>';
  var N = Math.ceil(P.length / 2), per = 3, beds = document.getElementById('beds'), bloomed = {}, nb = 0, nBeds = Math.ceil(N / per);
  var HOLD = 900;
  function cnt() { document.getElementById('fCount').textContent = '(' + nb + '/' + N + ')'; } cnt();
  for (var b = 0; b < nBeds; b++) {
    var bed = document.createElement('div'); bed.className = 'bed' + (b ? ' locked' : ''); bed.setAttribute('data-b', b);
    var h = '<span class="bed-tag">แปลงที่ ' + (b + 1) + '</span><div class="bed-row">';
    for (var k = b * per; k < Math.min(N, b * per + per); k++) h += '<button type="button" class="fl bud" data-k="' + k + '" aria-label="ดอกไม้ดอกที่ ' + (k + 1) + '">' + flower(k, false) + '<span class="ring"><svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="23"/></svg></span><span class="drops"></span><span class="lbl">กดค้างเพื่อรดน้ำ</span></button>';
    bed.innerHTML = h + '</div>'; beds.appendChild(bed);
  }
  function bloom(btn) {
    var k = +btn.getAttribute('data-k'); if (bloomed[k]) return; bloomed[k] = 1; nb++; cnt();
    btn.classList.remove('bud', 'water'); btn.classList.add('bloom');
    var st = btn.querySelector('.stem'); btn.classList.add('bursting'); setTimeout(function () { st.outerHTML = flower(k, true, P[k * 2].src.replace(/"/g, '%22'), (P[k * 2 + 1] || P[k * 2]).src.replace(/"/g, '%22')); btn.classList.remove('bursting'); }, 380); btn.querySelector('.lbl').textContent = 'แตะเพื่อดูรูป';
    sfx('chime'); if (window.TUFx) { var r = btn.getBoundingClientRect(); TUFx.confetti(r.left + r.width / 2, r.top + r.height * .3, 30, ['#f4a3b6', '#f7cf7a', '#fff3f6']); }
    var bedEl = btn.closest('.bed'); var all = bedEl.querySelectorAll('.fl'); var ok = [].every.call(all, function (f) { return bloomed[+f.getAttribute('data-k')]; });
    if (ok) { var nx = beds.querySelector('[data-b="' + (+bedEl.getAttribute('data-b') + 1) + '"]'); if (nx) { nx.classList.remove('locked'); sfx('unlock'); if (window.TUToast) TUToast('ปลดล็อกแปลงใหม่แล้ว!'); setTimeout(function () { nx.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 700); } }
    if (nb >= N && window.TUToast) setTimeout(function () { TUToast('สวนบานครบทุกดอกแล้ว!'); }, 600);
  }
  var timer = null, cur = null;
  function start(btn) { if (!btn.classList.contains('bud')) return; cur = btn; btn.classList.add('water'); btn.style.setProperty('--hold', HOLD + 'ms'); sfx('drop'); timer = setTimeout(function () { var x = cur; cur = null; if (x) bloom(x); }, HOLD); }
  function stop() { clearTimeout(timer); if (cur) { cur.classList.remove('water'); cur = null; } }
  beds.addEventListener('pointerdown', function (e) { var f = e.target.closest('.fl'); if (f) start(f); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { beds.addEventListener(n, stop); });
  beds.addEventListener('click', function (e) {
    var f = e.target.closest('.fl'); if (!f) return;
    if (f.classList.contains('bloom')) { var k = +f.getAttribute('data-k'); TUMem.open([k * 2, k * 2 + 1], { title: 'ดอกไม้ดอกที่ ' + (k + 1), ok: 'ปิด' }); }
    else if (f.classList.contains('bud') && !f.classList.contains('water')) { if (window.TUToast) TUToast('กดค้างไว้เพื่อรดน้ำ'); }
  });
  beds.addEventListener('contextmenu', function (e) { e.preventDefault(); });
})();
