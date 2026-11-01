/* ธีมกล่องดนตรี: ไขลาน -> เล่นโน้ตตามไฟ -> เลือกแผ่นเสียง */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* โน้ตลอยพื้นหลัง */
  var bg = $('notesBg');
  function floatNote() {
    if (reduce || document.hidden) return;
    var i = document.createElement('i');
    i.textContent = ['♪', '♫', '♩', '♬'][(Math.random() * 4) | 0];
    i.style.left = Math.random() * 100 + '%'; i.style.setProperty('--d', (7 + Math.random() * 6) + 's');
    i.style.setProperty('--x', (Math.random() * 120 - 60) + 'px'); i.style.setProperty('--s', (16 + Math.random() * 22) + 'px');
    bg.appendChild(i); setTimeout(function () { i.remove(); }, 14000);
  }
  setInterval(floatNote, 900);

  /* ไขลาน */
  var wound = 0, NEEDW = 4, key = $('windKey'), opened = false;
  key.addEventListener('click', function () {
    if (opened) return;
    wound++;
    key.classList.toggle('turn');
    TUSfx.play('ratchet'); setTimeout(function () { TUSfx.play('ratchet'); }, 90); setTimeout(function () { TUSfx.play('ratchet'); }, 180);
    $('windN').textContent = wound; $('windFill').style.width = (wound / NEEDW * 100) + '%';
    if (wound >= NEEDW) {
      opened = true; $('gateHint').textContent = '🎶 กล่องดนตรีเปิดแล้ว';
      setTimeout(function () {
        $('mbox').classList.add('open'); TUSfx.play('sparkle');
        setTimeout(function () { TUSfx.play('melody', 380, 10); }, 700);
      }, 350);
      setTimeout(function () { window.TU_OPEN(); }, 800);
    }
  });
  document.addEventListener('tu:opening', function () { $('mbox').classList.add('open'); });

  /* เครื่องเล่นแผ่นเสียง: เข็มลงเมื่อเข้าเว็บ */
  document.addEventListener('tu:opened', function () {
    var tt = document.querySelector('.turntable'); setTimeout(function () { tt.classList.add('playing'); TUSfx.play('vinyl'); }, 500);
  });

  /* เปียโน 8 คีย์ เล่นตามไฟ */
  var keys = $('keys'), btns = [], seq = [0, 2, 3, 5, 3, 2, 4, 2], pos = 0, names = ['โด', 'เร', 'มี', 'ซอล', 'ลา', 'โด', 'เร', 'มี'];
  // 8 คีย์ = สเกล 8 ตัว (index 0-7) ใช้ index 0,2,3,5,4 ตามทำนอง
  for (var i = 0; i < 8; i++) {
    (function (i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pkey'; b.textContent = names[i]; b.setAttribute('aria-label', 'โน้ต ' + names[i]);
      b.addEventListener('pointerdown', function () { b.classList.add('down'); });
      ['pointerup', 'pointerleave'].forEach(function (ev) { b.addEventListener(ev, function () { b.classList.remove('down'); }); });
      b.addEventListener('click', function () {
        TUSfx.play('note', i);
        if (pos < seq.length && i === seq[pos]) {
          b.classList.add('done'); pos++; $('noteCount').textContent = pos; mark();
          var r = b.getBoundingClientRect(); TUFx.float(r.left + r.width / 2, r.top, ['♪', '♫'][pos % 2]);
          if (pos === seq.length) {
            setTimeout(function () { TUSfx.play('melody', 330, 16); TUSteps.complete(2); TUFx.confetti(innerWidth / 2, innerHeight * .5, 70, ['#e8c27a', '#ffd166', '#ffb0c8', '#fff'], .9); }, 500);
          }
        }
      });
      keys.appendChild(b); btns.push(b);
    })(i);
  }
  function mark() { btns.forEach(function (b, i) { b.classList.toggle('next', pos < seq.length && i === seq[pos]); if (pos >= seq.length) b.classList.remove('next'); }); }
  mark();
  document.addEventListener('tu:skipped', function () { pos = seq.length; $('noteCount').textContent = 8; mark(); });
  document.addEventListener('tu:letter', function () { TUSfx.play('melody', 420, 16); });
})();
