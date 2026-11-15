/* การ์ดโชว์ความทรงจำ 1-2 รูป ใช้ร่วมกันหลายธีม: TUMem.open(photoIndexes, {title, ok, onClose}) */
(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], pool = [].slice.call(document.querySelectorAll('.pool [data-photo]'));
  var NOTES = ['วันที่เราเจอกัน', 'รอยยิ้มที่ฉันชอบที่สุด', 'มื้อนี้อร่อยเพราะมีเธอ', 'วันที่ฝนตกแต่ใจอบอุ่น', 'ถ่ายรูปคู่กันครั้งแรก', 'เซอร์ไพรส์เล็กๆ ที่ไม่ลืม', 'วันธรรมดาที่พิเศษเพราะเธอ', 'ทริปที่อยากกลับไปอีก'];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ov = document.createElement('div'); ov.className = 'mc-ov'; ov.setAttribute('aria-hidden', 'true'); ov.innerHTML = '<div class="mc-card"></div>'; document.body.appendChild(ov);
  var card = ov.firstChild, cb = null;
  function close() { ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); document.body.classList.remove('no-scroll'); var f = cb; cb = null; if (f) f(); }
  ov.addEventListener('click', function (e) {
    if (e.target === ov || e.target.closest('.mc-x') || e.target.closest('.mc-ok')) { close(); return; }
    var f = e.target.closest('.mc-pol'); if (f && pool[+f.getAttribute('data-i')]) pool[+f.getAttribute('data-i')].click();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('open')) close(); });
  window.TUMem = {
    open: function (ids, o) {
      o = o || {}; ids = ids.filter(function (i) { return P[i]; }); cb = o.onClose || null;
      card.innerHTML = '<button class="mc-x" type="button" aria-label="ปิด">&times;</button>' + (o.title ? '<h3>' + esc(o.title) + '</h3>' : '') + '<div class="mc-row">' +
        ids.map(function (i, n) { return '<figure class="mc-pol" data-i="' + i + '" style="--r:' + (n ? 2.4 : -2.4) + 'deg;--d:' + (.1 + n * .28) + 's"><div class="mc-ph" style="background-image:url(\'' + esc(P[i].src) + '\')"></div><figcaption>' + esc(P[i].cap || NOTES[i % NOTES.length]) + '</figcaption></figure>'; }).join('') + '</div><button class="mc-ok" type="button">' + esc(o.ok || 'ปิด') + '</button>';
      ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll');
    },
    close: close
  };
})();
