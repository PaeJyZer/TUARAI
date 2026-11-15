/* สมุดไดอารี่พลิกหน้า: หน้าละ 2 รูป จอกว้างเห็น 2 หน้า จอแคบเห็นทีละหน้า */
(function () {
  'use strict';
  var CFG = window.SITE_CONFIG || {}, P = window.TU_PHOTOS || [], D = window.TUD;
  var bk = document.getElementById('bk'), cnt = document.getElementById('bkCount'), prev = document.getElementById('bkPrev'), next = document.getElementById('bkNext');
  var pool = [].slice.call(document.querySelectorAll('.pool [data-photo]'));
  var NOTES = ['วันที่เราเจอกัน', 'รอยยิ้มที่ฉันชอบที่สุด', 'มื้อนี้อร่อยเพราะมีเธอ', 'วันที่ฝนตกแต่ใจอบอุ่น', 'ถ่ายรูปคู่กันครั้งแรก', 'เซอร์ไพรส์เล็กๆ ที่ไม่ลืม', 'วันธรรมดาที่พิเศษเพราะเธอ', 'ทริปที่อยากกลับไปอีก'];
  var TILT = ['-2.2deg', '1.8deg', '-1.2deg', '2.4deg'];
  var TAPE = ['#f2d58a', '#f4b9c4', '#b8dcc8', '#bcd3ec'];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };

  function daysTogether() {
    var d = new Date((CFG.startDate || '') + 'T00:00:00'); if (isNaN(d)) return 0;
    return Math.max(0, Math.floor((Date.now() - d.getTime()) / 864e5));
  }
  function snap(idx, n) {
    var p = P[idx], cap = p.cap || NOTES[idx % NOTES.length];
    return '<figure class="snap" data-i="' + idx + '" style="--r:' + TILT[n % 4] + '">' + D.tape(TAPE[idx % 4]) +
      '<div class="ph" style="background-image:url(\'' + esc(p.src) + '\')"></div><figcaption>' + esc(cap) + '</figcaption></figure>';
  }
  function dood(kind, style) { return '<span class="dd" style="' + style + '">' + D[kind]() + '</span>'; }

  /* ---------- สร้างรายการหน้า ---------- */
  var pages = [];
  var name = esc(CFG.partnerName || '');
  var days = daysTogether();
  pages.push('<div class="in intro"><p class="pg-no"><span>Our diary</span><span>vol. 01</span></p>' +
    dood('heart', 'left:12%;top:10%;width:11%;transform:rotate(-14deg)') + dood('star', 'right:14%;top:14%;width:8%') +
    '<div style="width:34%;margin:6% auto 0">' + D.paw() + '</div>' +
    '<div class="big">ถึง ' + name + '</div><p class="sub">ฉันเก็บทุกวันของเราไว้ในสมุดเล่มนี้' + (days ? '<br>รวมกันแล้ว ' + days.toLocaleString('th-TH') + ' วัน' : '') + '</p>' +
    (CFG.startDate ? '<span class="date">' + esc(CFG.startDate) + '</span>' : '') + '</div>');
  var pairs = 0;
  for (var i = 0; i < P.length; i += 2) {
    pairs++;
    var body = snap(i, 0) + (P[i + 1] ? snap(i + 1, 1) : '<p class="note">เก็บที่ว่างไว้ให้ความทรงจำใหม่ ๆ ของเรา…</p>');
    pages.push('<div class="in"><p class="pg-no"><span>Page ' + pad2(pairs) + '</span><span>♡</span></p>' + body +
      dood(pairs % 2 ? 'heart' : 'star', (pairs % 2 ? 'right:6%;bottom:5%;width:9%;transform:rotate(12deg)' : 'left:6%;bottom:5%;width:8%')) + '</div>');
  }
  var endPage = '<div class="in intro end"><p class="pg-no"><span>The end?</span><span>♡</span></p>' +
    '<div style="width:30%;margin:8% auto 0">' + D.paw('#e8a98e') + '</div><div class="big">ยังมีอีกหนึ่งหน้า</div><p class="sub">ที่ฉันอยากเขียนถึงเธอ<br>เป็นหน้าสุดท้ายของเล่มนี้</p>' +
    '<button type="button" class="pg-btn" data-open-letter>✉ เปิดจดหมาย</button>' + dood('heart', 'left:10%;bottom:8%;width:10%') + dood('heart', 'right:12%;bottom:12%;width:7%;transform:rotate(14deg)') + '</div>';
  pages.push(endPage);

  /* ---------- แสดงผล ---------- */
  var wide, arr, idx = 0, busy = false, step;
  function mkPage(cls, html) { var d = document.createElement('div'); d.className = 'pg ' + cls; d.innerHTML = html || ''; if (!html) d.classList.add('E'); return d; }
  function setup() {
    wide = window.innerWidth >= 760;
    step = wide ? 2 : 1;
    arr = pages.slice();
    if (wide) { arr.unshift(''); if (arr.length % 2) arr.splice(arr.length - 1, 0, ''); }
    bk.className = 'bk' + (wide ? '' : ' single');
    if (idx >= arr.length) idx = arr.length - step;
    if (wide && idx % 2) idx--;
    draw();
  }
  function draw() {
    bk.innerHTML = '';
    if (wide) { bk.appendChild(mkPage('L', arr[idx])); bk.appendChild(mkPage('R', arr[idx + 1])); }
    else bk.appendChild(mkPage('R', arr[idx]));
    upd();
  }
  function upd() {
    prev.disabled = idx <= 0; next.disabled = idx + step >= arr.length;
    var total = pages.length, cur = wide ? Math.max(1, idx) : idx + 1;
    cnt.textContent = wide ? (idx === 0 ? 'COVER' : (idx + 1) + '–' + Math.min(idx + 2, total + 1) + ' / ' + total) : (idx + 1) + ' / ' + total;
  }
  function leaf(side, front, back) {
    var f = document.createElement('div'); f.className = 'flip ' + side;
    f.innerHTML = '<div class="face front pg ' + (front ? '' : 'E') + '"><div class="in">' + '</div></div><div class="face back pg ' + (back ? '' : 'E') + '"></div><div class="shade"></div>';
    f.querySelector('.front').innerHTML = front || ''; f.querySelector('.back').innerHTML = back || '';
    if (front) f.querySelector('.front').classList.remove('E'); else f.querySelector('.front').classList.add('E');
    if (back) f.querySelector('.back').classList.remove('E'); else f.querySelector('.back').classList.add('E');
    return f;
  }
  function go(dir) {
    if (busy) return;
    var ni = idx + dir * step;
    if (ni < 0 || ni >= arr.length) return;
    busy = true;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var f, done = function () { idx = ni; draw(); busy = false; };
    if (reduce) { done(); return; }
    if (wide) {
      if (dir > 0) {
        bk.querySelector('.pg.R').innerHTML = arr[idx + 3] || ''; if (!arr[idx + 3]) bk.querySelector('.pg.R').classList.add('E'); else bk.querySelector('.pg.R').classList.remove('E');
        f = leaf('fr', arr[idx + 1], arr[idx + 2]); bk.appendChild(f); void f.offsetWidth;
        f.classList.add('go'); f.style.transform = 'rotateY(-180deg)';
      } else {
        bk.querySelector('.pg.L').innerHTML = arr[idx - 2] || ''; if (!arr[idx - 2]) bk.querySelector('.pg.L').classList.add('E'); else bk.querySelector('.pg.L').classList.remove('E');
        f = leaf('fl', arr[idx], arr[idx - 1]); bk.appendChild(f); void f.offsetWidth;
        f.classList.add('go'); f.style.transform = 'rotateY(180deg)';
      }
    } else {
      if (dir > 0) {
        var u = bk.querySelector('.pg.R'); u.innerHTML = arr[ni]; u.classList.remove('E');
        f = leaf('fr', arr[idx], ''); bk.appendChild(f); void f.offsetWidth;
        f.classList.add('go'); f.style.transform = 'rotateY(-125deg)'; f.style.opacity = '0';
        f.style.transition = 'transform .8s cubic-bezier(.45,.05,.25,1), opacity .8s .1s';
      } else {
        f = leaf('fr', arr[ni], ''); f.style.transform = 'rotateY(-125deg)'; f.style.opacity = '0';
        bk.appendChild(f); void f.offsetWidth;
        f.style.transition = 'transform .8s cubic-bezier(.45,.05,.25,1), opacity .5s'; f.classList.add('go'); f.style.transform = 'rotateY(0deg)'; f.style.opacity = '1';
      }
    }
    setTimeout(done, 920);
  }
  prev.addEventListener('click', function () { go(-1); });
  next.addEventListener('click', function () { go(1); });
  document.addEventListener('keydown', function (e) { if (document.querySelector('.overlay.open, .cl-modal.open, .cl-lock')) return; if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });

  /* แตะรูป = ดูภาพใหญ่ / ปุ่มในหน้า = เปิดจดหมาย / ปัดเพื่อพลิก */
  var sx = null, sy = null, moved = false;
  bk.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; moved = false; });
  bk.addEventListener('pointermove', function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 12) moved = true; });
  bk.addEventListener('pointerup', function (e) {
    if (sx === null) return; var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? 1 : -1);
  });
  bk.addEventListener('click', function (e) {
    if (moved) { moved = false; return; }
    var s = e.target.closest('.snap'); if (s && pool[+s.getAttribute('data-i')]) { pool[+s.getAttribute('data-i')].click(); return; }
    if (e.target.closest('[data-open-letter]')) document.getElementById('bkLetter').click();
  });
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if ((window.innerWidth >= 760) !== wide && !busy) setup(); }, 200); });
  setup();
})();
