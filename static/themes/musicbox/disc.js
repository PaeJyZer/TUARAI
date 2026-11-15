(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], D = window.TUD, sfx = function (n) { if (window.TUSfx) TUSfx.play(n); };
  var $ = function (id) { return document.getElementById(id); };
  var NOTES = ['วันที่เราเจอกัน', 'รอยยิ้มที่ฉันชอบที่สุด', 'มื้อนี้อร่อยเพราะมีเธอ', 'วันที่ฝนตกแต่ใจอบอุ่น', 'ถ่ายรูปคู่กันครั้งแรก', 'เซอร์ไพรส์เล็กๆ ที่ไม่ลืม'];
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '%27' }[c]; }); };
  $('gArt').innerHTML = '<svg class="doo" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#161616"/><circle cx="50" cy="50" r="32" fill="none" stroke="#2a2a2a" stroke-width="2"/><circle cx="50" cy="50" r="17" fill="#ffb86b"/><circle cx="50" cy="50" r="3" fill="#161616"/><path d="M82 18 L70 44" stroke="#cfcfcf" stroke-width="5" stroke-linecap="round"/></svg>';
  var N = Math.ceil(P.length / 2), crate = $('crate'), cur = -1, side = 0, played = {}, np = 0;
  function cnt() { $('cnt').textContent = '(' + np + '/' + N + ')'; } cnt();
  for (var k = 0; k < N; k++) {
    var s = document.createElement('button'); s.type = 'button'; s.className = 'sl'; s.setAttribute('data-k', k); s.setAttribute('aria-label', 'แผ่นเสียงที่ ' + (k + 1));
    s.innerHTML = '<span class="cv" style="background-image:url(\'' + esc(P[k * 2].src) + '\')"></span><span class="tg">แผ่นที่ ' + (k + 1) + '</span>'; crate.appendChild(s);
  }
  function coverflow() {
    var cr = crate.getBoundingClientRect(), mid = cr.left + cr.width / 2;
    [].forEach.call(crate.children, function (s) { var r = s.getBoundingClientRect(), d = (r.left + r.width / 2 - mid) / 170; var a = Math.min(1.6, Math.abs(d)); s.style.setProperty('--s', (1 - a * .12).toFixed(3)); s.style.setProperty('--ry', (-Math.sign(d) * Math.min(48, a * 32)).toFixed(0) + 'deg'); s.style.setProperty('--z', 20 - Math.round(a * 4)); });
  }
  crate.addEventListener('scroll', function () { requestAnimationFrame(coverflow); }); coverflow(); window.addEventListener('resize', coverflow);
  function setLab() { var i = cur * 2 + side; $('lab').style.backgroundImage = 'url(\'' + esc((P[i] || P[cur * 2]).src) + '\')'; }
  function play(k) {
    cur = k; side = 0; $('arm').classList.remove('on'); $('plat').classList.remove('spin'); setLab(); sfx('drop');
    $('np').textContent = 'กำลังเล่น: แผ่นที่ ' + (k + 1) + ' ด้าน A'; $('flipBtn').disabled = !P[k * 2 + 1]; $('openBtn').disabled = false; $('flipBtn').textContent = 'พลิกเป็นด้าน B';
    setTimeout(function () { $('arm').classList.add('on'); $('plat').classList.add('spin'); sfx('chime'); }, 500);
    var el = crate.children[k]; el.classList.add('played'); if (!played[k]) { played[k] = 1; np++; cnt(); if (np >= N && window.TUToast) setTimeout(function () { TUToast('ฟังครบทุกแผ่นแล้ว!'); }, 900); }
    setTimeout(function () { TUMem.open([k * 2, k * 2 + 1], { title: 'แผ่นที่ ' + (k + 1) + ' · Side A/B', ok: 'ฟังต่อ' }); }, 1500);
  }
  crate.addEventListener('click', function (e) {
    var s = e.target.closest('.sl'); if (!s) return; var k = +s.getAttribute('data-k');
    var r = s.getBoundingClientRect(), cr = crate.getBoundingClientRect();
    if (Math.abs(r.left + r.width / 2 - (cr.left + cr.width / 2)) > 60) { s.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); return; }
    play(k);
  });
  $('flipBtn').addEventListener('click', function () { if (cur < 0 || !P[cur * 2 + 1]) return; side = 1 - side; var l = $('lab'); l.classList.toggle('flip'); setTimeout(setLab, 300); $('np').textContent = 'กำลังเล่น: แผ่นที่ ' + (cur + 1) + ' ด้าน ' + (side ? 'B' : 'A'); this.textContent = side ? 'พลิกเป็นด้าน A' : 'พลิกเป็นด้าน B'; sfx('tick'); });
  $('openBtn').addEventListener('click', function () { if (cur >= 0) TUMem.open([cur * 2, cur * 2 + 1], { title: 'แผ่นที่ ' + (cur + 1), ok: 'ปิด' }); });
})();
