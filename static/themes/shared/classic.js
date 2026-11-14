/* =========================================
   TUARAI Classic - ลูกเล่นเพิ่มสำหรับธีม Classic Deck
   1) ล็อกรหัสวันครบรอบ (วงล้อตัวเลข 4 หลัก DDMM) ก่อนเข้าเว็บ
   2) ป้ายนับวัน + นับถอยหลังถึงวันครบรอบถัดไป
   3) ภารกิจก่อนอ่านจดหมาย 3 ข้อ: ทายใจ / ต่อภาพ / หัวใจลับ (ไม่มีแพ้ ข้ามได้เสมอ)
   ทุกอย่างสร้างจากวันที่ที่ผู้ซื้อกรอกไว้ ไม่ต้องกรอกข้อมูลเพิ่ม
   ========================================= */
(function () {
  'use strict';
  var body = document.body;
  if (document.querySelector('[data-steps]')) return;      // ธีมพรีเมียมมีระบบของตัวเองแล้ว
  var CFG = window.SITE_CONFIG || {};
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(CFG.startDate || ''));
  if (!m) return;                                           // ไม่มีวันที่ = ไม่ใส่ล็อก/ภารกิจ
  var Y = +m[1], MO = +m[2], D = +m[3];
  var AGE = CFG.mode === 'age';
  var NAME = CFG.partnerName || '';
  var CODE = ('0' + D).slice(-2) + ('0' + MO).slice(-2);
  var DEMO = /^\/(demo|preview)\//.test(location.pathname);
  var MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var sfx = function (n, a) { if (window.TUSfx) TUSfx.play(n, a); };
  var toast = function (t) { if (window.TUToast) TUToast(t); };
  var store = {
    get: function (k) { try { return sessionStorage.getItem('cl_' + CODE + Y + '_' + k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem('cl_' + CODE + Y + '_' + k, v); } catch (e) {} }
  };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var STAGE = !document.getElementById('main');             // ธีมเวที (Lady Gaga) ไม่มี main/ส่วนท้ายให้แทรก
  var LET = '[data-letter], #letterBtn';
  var PH = function () { return [].slice.call(document.querySelectorAll('[data-photo], .scatter-item')); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ชื่อสกินตามธีม */
  var SK = {
    'theme-starry':   { ic: '✦', t: 'ประตูดวงดาว', s: 'ใส่รหัสวันครบรอบเพื่อเปิดจักรวาลของเรา', q: 'เส้นทางดาว' },
    'theme-diary':    { ic: '🔒', t: 'ไดอารี่ล็อกอยู่', s: 'ใส่รหัสวันครบรอบเพื่อปลดกุญแจสมุดเล่มนี้', q: 'หน้าลับในสมุด' },
    'theme-garden':   { ic: '🌷', t: 'ประตูสวนลับ', s: 'ใส่รหัสวันครบรอบเพื่อเปิดประตูเข้าสวน', q: 'ภารกิจในสวน' },
    'theme-sunset':   { ic: '🍾', t: 'ขวดจดหมายผนึกไว้', s: 'ใส่รหัสวันครบรอบเพื่อเปิดจุกขวด', q: 'ภารกิจริมหาด' },
    'theme-envelope': { ic: '✉', t: 'ซองผนึกด้วยรหัส', s: 'ใส่รหัสวันครบรอบเพื่อแกะตราประทับ', q: 'ภารกิจไปรษณีย์' },
    'theme-sakura':   { ic: '🌸', t: 'กล่องกุญแจซากุระ', s: 'ใส่รหัสวันครบรอบเพื่อเปิดกล่อง', q: 'ภารกิจใต้ต้นซากุระ' },
    'theme-cinema':   { ic: '🎟', t: 'รหัสเข้าโรงฉาย', s: 'ใส่รหัสวันครบรอบเพื่อเข้าโรงส่วนตัว', q: 'ภารกิจหลังจอ' },
    'theme-y2k':      { ic: '💾', t: 'PASSWORD REQUIRED', s: 'ใส่รหัสวันครบรอบเพื่อเข้าสู่ระบบ', q: 'MISSION.exe' },
    'theme-gaga':     { ic: '🔒', t: 'ปลดล็อกความทรงจำ', s: 'ใส่รหัสวันครบรอบเพื่อเข้าเวทีของเรา', q: 'ภารกิจหลังเวที' },
    'theme-pixel':    { ic: '🗝', t: 'ENTER CODE', s: 'ใส่รหัสวันครบรอบเพื่อเริ่มเกม', q: 'SIDE QUEST' }
  };
  var theme = (body.className.match(/theme-[a-z0-9]+/) || [''])[0];
  var sk = SK[theme] || { ic: '🔒', t: 'ใส่รหัสผ่าน', s: 'ใส่รหัสวันครบรอบเพื่อเข้าเว็บ', q: 'ภารกิจ' };
  if (AGE) sk = { ic: sk.ic, t: sk.t, s: sk.s.replace('วันครบรอบ', 'วันเกิด'), q: sk.q };
  var WORD = AGE ? 'วันเกิด' : 'วันครบรอบ';
  var EMO = { 'theme-starry': '✦', 'theme-diary': '♡', 'theme-garden': '🌷', 'theme-sunset': '🐚', 'theme-envelope': '💌', 'theme-sakura': '🌸', 'theme-cinema': '🎬', 'theme-y2k': '✨', 'theme-gaga': '💗', 'theme-pixel': '❤️' }[theme] || '💗';

  /* =====================================================
     1) ล็อกรหัส — วงล้อตัวเลข
     ===================================================== */
  var locked = false;
  function mountLock() {
    if (store.get('unlocked') === '1') return;
    locked = true;
    body.classList.add('cl-locked');
    var vals = [0, 0, 0, 0], wrong = 0;
    var ov = el('div', 'cl-lock');
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', sk.t);
    ov.innerHTML =
      '<div class="cl-lock-card">' +
        '<div class="cl-emblem"><span class="cl-shackle"></span><span class="cl-body"><i>' + sk.ic + '</i></span></div>' +
        '<h2 class="cl-lock-title">' + sk.t + '</h2>' +
        '<p class="cl-lock-sub">' + sk.s + '</p>' +
        '<div class="cl-dials" role="group" aria-label="รหัส 4 หลัก วัน-เดือน">' +
          [0, 1, 2, 3].map(function (i) {
            return (i === 2 ? '<span class="cl-sep">/</span>' : '') +
              '<div class="cl-dial" data-i="' + i + '" tabindex="0" role="spinbutton" aria-valuemin="0" aria-valuemax="9" aria-valuenow="0" aria-label="หลักที่ ' + (i + 1) + '">' +
                '<button type="button" class="cl-up" tabindex="-1" aria-label="เพิ่ม">▲</button>' +
                '<span class="cl-win"><b>0</b></span>' +
                '<button type="button" class="cl-dn" tabindex="-1" aria-label="ลด">▼</button></div>';
          }).join('') +
        '</div>' +
        '<p class="cl-fmt">วัน / เดือน &nbsp;เช่น 1402 = 14 ก.พ.</p>' +
        '<p class="cl-hint" aria-live="polite"></p>' +
        '<button type="button" class="cl-go">ปลดล็อก</button>' +
        '<button type="button" class="cl-skipcode" hidden>ลืมรหัส? ข้ามไปก่อน →</button>' +
        (DEMO ? '<p class="cl-demo">โหมดตัวอย่าง: รหัสคือ <b>' + CODE + '</b></p>' : '') +
      '</div>';
    document.body.appendChild(ov);
    var dials = [].slice.call(ov.querySelectorAll('.cl-dial'));
    function paint(i, dir) {
      var b = dials[i].querySelector('b');
      b.textContent = vals[i];
      dials[i].setAttribute('aria-valuenow', vals[i]);
      if (dir) { b.classList.remove('up', 'dn'); void b.offsetWidth; b.classList.add(dir > 0 ? 'up' : 'dn'); }
    }
    function step(i, d) { vals[i] = (vals[i] + d + 10) % 10; paint(i, d); sfx('tick'); if (navigator.vibrate) { try { navigator.vibrate(6); } catch (e) {} } }
    dials.forEach(function (d, i) {
      d.querySelector('.cl-up').addEventListener('click', function () { step(i, 1); });
      d.querySelector('.cl-dn').addEventListener('click', function () { step(i, -1); });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp') { step(i, 1); e.preventDefault(); }
        else if (e.key === 'ArrowDown') { step(i, -1); e.preventDefault(); }
        else if (/^\d$/.test(e.key)) { vals[i] = +e.key; paint(i, 1); sfx('tick'); if (dials[i + 1]) dials[i + 1].focus(); }
        else if (e.key === 'Enter') go();
      });
      // ลากนิ้วขึ้น-ลงบนวงล้อ
      var y0 = null, acc = 0;
      d.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; y0 = e.clientY; acc = 0; try { d.setPointerCapture(e.pointerId); } catch (x) {} });
      d.addEventListener('pointermove', function (e) {
        if (y0 == null) return; acc += y0 - e.clientY; y0 = e.clientY;
        while (acc >= 22) { step(i, 1); acc -= 22; }
        while (acc <= -22) { step(i, -1); acc += 22; }
      });
      ['pointerup', 'pointercancel'].forEach(function (n) { d.addEventListener(n, function () { y0 = null; }); });
    });
    var hint = ov.querySelector('.cl-hint'), skip = ov.querySelector('.cl-skipcode'), card = ov.querySelector('.cl-lock-card');
    function open(quiet) {
      store.set('unlocked', '1'); locked = false;
      ov.classList.add('ok');
      if (!quiet) { sfx('unlock'); sfx('sparkle'); if (window.TUFx) TUFx.confetti(innerWidth / 2, innerHeight * .42, 80); }
      setTimeout(function () { ov.classList.add('gone'); body.classList.remove('cl-locked'); setTimeout(function () { ov.remove(); }, 700); }, quiet ? 80 : 900);
    }
    function go() {
      if (vals.join('') === CODE) { open(false); return; }
      wrong++; sfx('tap');
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      if (navigator.vibrate) { try { navigator.vibrate([40, 40, 40]); } catch (e) {} }
      if (wrong === 1) hint.textContent = 'ยังไม่ใช่นะ ลองนึกวันสำคัญของเราดู 💭';
      else if (wrong === 2) hint.textContent = 'ใบ้: เดือน' + MONTHS[MO - 1];
      else if (wrong === 3) hint.textContent = 'ใบ้: วันที่ขึ้นต้นด้วยเลข ' + CODE.charAt(0);
      else hint.textContent = 'ใบ้: ตัวเลขสองหลักแรกคือ ' + CODE.slice(0, 2);
      if (wrong >= 4) skip.hidden = false;
    }
    ov.querySelector('.cl-go').addEventListener('click', go);
    skip.addEventListener('click', function () { toast('ข้ามด่านรหัสแล้ว'); open(true); });
    setTimeout(function () { try { dials[0].focus({ preventScroll: true }); } catch (e) {} }, 300);
  }

  /* =====================================================
     2) ป้ายนับวัน
     ===================================================== */
  function mountChip() {
    var host = $('.hero-sub') || $('.hero .eyebrow') || $('.title-page .eyebrow');
    if (!host) return;
    var now = new Date(), start = new Date(Y, MO - 1, D);
    var days = Math.max(0, Math.floor((now - start) / 864e5));
    var next = new Date(now.getFullYear(), MO - 1, D);
    if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next = new Date(now.getFullYear() + 1, MO - 1, D);
    var left = Math.round((next - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
    var yrs = next.getFullYear() - Y;
    var txt;
    if (left === 0) txt = (AGE ? '🎂 วันนี้วันเกิดของ ' : '🎉 วันนี้ครบรอบ ') + (AGE ? NAME : yrs + ' ปีของเรา') + '!';
    else if (AGE) txt = EMO + ' อายุ ' + (yrs - 1) + ' ปี · อีก ' + left + ' วันถึงวันเกิด';
    else txt = EMO + ' ' + days.toLocaleString('th-TH') + ' วันที่อยู่ด้วยกัน · อีก ' + left + ' วันครบ ' + yrs + ' ปี';
    var chip = el('p', 'cl-chip', '<span>' + txt + '</span>');
    host.parentNode.insertBefore(chip, host.nextSibling);
    if (left === 0) document.addEventListener('tu:opened', function () { setTimeout(function () { if (window.TUFx) TUFx.rain(5); }, 600); });
  }

  /* =====================================================
     3) ภารกิจ
     ===================================================== */
  var done = { quiz: store.get('quiz') === '1', puzzle: store.get('puzzle') === '1', hunt: store.get('hunt') === '1' };
  var quest = null, modal = null, sheet = null, letterOpen = store.get('letter') === '1';
  function allDone() { return done.quiz && done.puzzle && done.hunt; }
  function setLetters() {
    var lock = !(allDone() || letterOpen);
    document.querySelectorAll(LET).forEach(function (b) {
      b.classList.toggle('is-locked', lock);
      b.setAttribute('aria-disabled', lock ? 'true' : 'false');
      if (!lock) b.classList.add('is-ready');
    });
  }
  function refresh() {
    if (!quest) return;
    var n = 0;
    ['quiz', 'puzzle', 'hunt'].forEach(function (k) {
      var c = quest.querySelector('[data-q="' + k + '"]');
      c.classList.toggle('done', !!done[k]);
      c.querySelector('.cl-st').textContent = done[k] ? '✓ เสร็จแล้ว' : 'เริ่มเลย';
      if (done[k]) n++;
    });
    quest.querySelector('.cl-bar i').style.width = (n / 3 * 100) + '%';
    quest.querySelector('.cl-cnt').textContent = n + ' / 3';
    var fn = document.querySelector('.cl-fabn'); if (fn) fn.textContent = n + '/3';
    quest.classList.toggle('all', n === 3);
    var sk2 = quest.querySelector('.cl-skipq'); if (sk2) sk2.hidden = n === 3;
    setLetters();
  }
  function finish(k) {
    if (done[k]) return;
    done[k] = true; store.set(k, '1'); sfx('unlock'); refresh();
    if (allDone()) { setTimeout(function () { toast('🎉 ปลดล็อกจดหมายแล้ว!'); if (window.TUFx) TUFx.rain(6); sfx('win'); closeModal(); }, 500); }
    else toast('🔓 ภารกิจสำเร็จ!');
  }
  function openModal(title, node, onClose) {
    if (!modal) {
      modal = el('div', 'cl-modal');
      modal.innerHTML = '<div class="cl-sheet" role="dialog" aria-modal="true"><button type="button" class="cl-x" aria-label="ปิด">&times;</button><h3 class="cl-sh"></h3><div class="cl-body2"></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.cl-x')) closeModal(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    }
    sheet = { onClose: onClose };
    modal.querySelector('.cl-sh').textContent = title;
    var b = modal.querySelector('.cl-body2'); b.innerHTML = ''; b.appendChild(node);
    modal.classList.add('open'); body.classList.add('no-scroll');
  }
  function closeModal() {
    if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open'); body.classList.remove('no-scroll');
    var cb = sheet && sheet.onClose; sheet = null;
    if (cb) cb();
  }
  function questModal() {
    if (!quest) return;
    quest.classList.remove('reveal'); quest.classList.add('in', 'in-modal');
    openModal('ภารกิจก่อนอ่านจดหมาย', quest, null);
  }

  /* --- ทายใจ (คำถามสร้างจากวันที่) --- */
  function stageBack() { if (STAGE && !allDone() && !letterOpen) setTimeout(questModal, 60); }
  function quiz() {
    var now = new Date(), days = Math.max(1, Math.floor((now - new Date(Y, MO - 1, D)) / 864e5));
    var qs = [];
    var mOpts = [MO - 1]; while (mOpts.length < 4) { var r = (Math.random() * 12) | 0; if (mOpts.indexOf(r) < 0) mOpts.push(r); }
    qs.push({ q: AGE ? 'วันเกิดของ ' + NAME + ' อยู่เดือนอะไร?' : 'เรื่องของเราเริ่มต้นขึ้นในเดือนอะไร?', o: mOpts.map(function (i) { return MONTHS[i]; }), a: MONTHS[MO - 1] });
    var cy = now.getFullYear(), yOpts = [Y], k = 1;
    while (yOpts.length < 4) { var c1 = Y + (k % 2 ? -Math.ceil(k / 2) : Math.ceil(k / 2)); if (c1 <= cy && yOpts.indexOf(c1) < 0) yOpts.push(c1); k++; if (k > 12) break; }
    while (yOpts.length < 4) yOpts.push(Y - yOpts.length - 2);
    qs.push({ q: AGE ? 'ปีเกิดคือปีอะไร?' : 'ปีไหนที่เรื่องของเราเริ่มต้นขึ้น?', o: yOpts.map(String), a: String(Y) });
    if (AGE) {
      var age = Math.max(0, cy - Y - ((now.getMonth() + 1 < MO || (now.getMonth() + 1 === MO && now.getDate() < D)) ? 1 : 0));
      var aO = [age]; [1, 2, 3, -1, -2].forEach(function (d) { if (aO.length < 4 && age + d > 0) aO.push(age + d); });
      qs.push({ q: 'ตอนนี้อายุกี่ปีแล้ว?', o: aO.map(function (v) { return v + ' ปี'; }), a: age + ' ปี' });
    } else {
      var rd = days > 100 ? Math.round(days / 10) * 10 : days;
      var dO = [rd]; [.78, 1.22, 1.45, .6].forEach(function (f) { var v = Math.max(1, days > 100 ? Math.round(days * f / 10) * 10 : Math.round(days * f)); if (dO.indexOf(v) < 0 && dO.length < 4) dO.push(v); });
      qs.push({ q: 'จนถึงวันนี้ เราอยู่ด้วยกันมากี่วันแล้ว? (ประมาณ)', o: dO.map(function (v) { return (days > 100 ? 'ราว ' : '') + v.toLocaleString('th-TH') + ' วัน'; }), a: (days > 100 ? 'ราว ' : '') + rd.toLocaleString('th-TH') + ' วัน' });
    }
    var i = 0, box = el('div', 'cl-quiz');
    function render() {
      var q = qs[i];
      box.innerHTML = '<p class="cl-qn">ข้อ ' + (i + 1) + ' / ' + qs.length + '</p><p class="cl-q">' + q.q + '</p><div class="cl-opts"></div><p class="cl-fb" aria-live="polite"></p>';
      var wrap = box.querySelector('.cl-opts');
      shuffle(q.o.slice()).forEach(function (t) {
        var b = el('button', 'cl-opt'); b.type = 'button'; b.textContent = t;
        b.addEventListener('click', function () {
          if (t === q.a) {
            b.classList.add('right'); sfx('coin'); wrap.classList.add('lock');
            if (window.TUFx) { var r = b.getBoundingClientRect(); TUFx.confetti(r.left + r.width / 2, r.top, 26, null, .5); }
            setTimeout(function () { i++; if (i < qs.length) render(); else { box.innerHTML = '<div class="cl-win2"><span>' + EMO + '</span><p>ตอบถูกครบทุกข้อ!</p><small>รู้ใจกันสุดๆ</small></div>'; finish('quiz'); setTimeout(closeModal, 1400); } }, 650);
          } else { b.classList.add('wrong'); b.disabled = true; sfx('tap'); box.querySelector('.cl-fb').textContent = 'ยังไม่ใช่นะ ลองอีกที 💭'; }
        });
        wrap.appendChild(b);
      });
    }
    render();
    openModal('ทายใจ', box, stageBack);
  }

  /* --- ต่อภาพ (สไลด์พัซเซิล 3x3 จากรูปปก) --- */
  function puzzle() {
    var img = $('[data-photo] img') || $('.interactive-photo');
    var box = el('div', 'cl-pz');
    var N = 3, order = [], blank = N * N - 1, tiles = [], won = false, moves = 0;
    box.innerHTML = '<p class="cl-pzh">แตะชิ้นที่อยู่ข้างช่องว่างเพื่อเลื่อน ต่อให้ครบเป็นรูปเดียว</p><div class="cl-board"></div><div class="cl-pzbar"><span class="cl-mv">0 ครั้ง</span><button type="button" class="cl-help">ช่วยเรียงให้ ✨</button></div>';
    var board = box.querySelector('.cl-board'), mv = box.querySelector('.cl-mv');
    function build(src) {
      for (var i = 0; i < N * N; i++) {
        var t = el('button', 'cl-tile'); t.type = 'button'; t.setAttribute('aria-label', 'ชิ้นที่ ' + (i + 1));
        var r = (i / N) | 0, c = i % N;
        t.style.backgroundImage = src ? 'url("' + src + '")' : 'none';
        t.style.backgroundSize = (N * 100) + '% ' + (N * 100) + '%';
        t.style.backgroundPosition = (c * 100 / (N - 1)) + '% ' + (r * 100 / (N - 1)) + '%';
        t.dataset.n = i; if (!src) t.textContent = i + 1;
        t.addEventListener('click', function () { tap(+this.dataset.n); });
        tiles.push(t);
      }
      order = []; for (var j = 0; j < N * N; j++) order.push(j);
      var last = -1;
      for (var s = 0; s < 22; s++) {                       // สลับด้วยการเดินจริง = แก้ได้แน่นอน
        var nb = neighbors(order.indexOf(blank)).filter(function (p) { return p !== last; });
        var pick = nb[(Math.random() * nb.length) | 0], bp = order.indexOf(blank);
        order[bp] = order[pick]; order[pick] = blank; last = bp;
      }
      if (order.every(function (v, k) { return v === k; })) { var a = order[0]; order[0] = order[1]; order[1] = a; if (!solvable()) { a = order[2]; order[2] = order[3]; order[3] = a; } }
      layout();
    }
    function solvable() { var inv = 0, a = order.filter(function (v) { return v !== blank; }); for (var i = 0; i < a.length; i++) for (var j = i + 1; j < a.length; j++) if (a[i] > a[j]) inv++; return inv % 2 === 0; }
    function neighbors(p) { var r = (p / N) | 0, c = p % N, o = []; if (r > 0) o.push(p - N); if (r < N - 1) o.push(p + N); if (c > 0) o.push(p - 1); if (c < N - 1) o.push(p + 1); return o; }
    function layout() {
      board.innerHTML = '';
      order.forEach(function (n, pos) {
        var t = tiles[n]; t.style.gridRow = ((pos / N) | 0) + 1; t.style.gridColumn = (pos % N) + 1;
        t.classList.toggle('empty', n === blank && !won); t.classList.toggle('ok', n === pos);
        board.appendChild(t);
      });
    }
    function tap(n) {
      if (won || n === blank) return;
      var p = order.indexOf(n), bp = order.indexOf(blank);
      if (neighbors(p).indexOf(bp) < 0) { sfx('tap'); return; }
      order[bp] = n; order[p] = blank; moves++; mv.textContent = moves + ' ครั้ง'; sfx('tick'); layout(); check();
    }
    function check() {
      if (!order.every(function (v, k) { return v === k; })) return;
      won = true; layout(); board.classList.add('solved'); sfx('win');
      if (window.TUFx) TUFx.confetti(innerWidth / 2, innerHeight * .45, 90);
      finish('puzzle'); setTimeout(closeModal, 1800);
    }
    box.querySelector('.cl-help').addEventListener('click', function () { order = order.map(function (_, k) { return k; }); layout(); check(); });
    // ครอปเป็นสี่เหลี่ยมจัตุรัสกลางภาพ
    function withSrc() {
      var src = img && img.currentSrc || img && img.src || '';
      if (!src) { build(''); return; }
      var im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = function () {
        try {
          var s = Math.min(im.naturalWidth, im.naturalHeight), cv = document.createElement('canvas'); cv.width = cv.height = 540;
          cv.getContext('2d').drawImage(im, (im.naturalWidth - s) / 2, (im.naturalHeight - s) / 2, s, s, 0, 0, 540, 540);
          build(cv.toDataURL('image/jpeg', .85));
        } catch (e) { build(src); }
      };
      im.onerror = function () { build(src); };
      im.src = src;
    }
    withSrc();
    openModal('ต่อภาพของเรา', box, stageBack);
  }

  /* --- หัวใจลับ 5 ดวง ซ่อนอยู่ในรูป --- */
  var huntOn = false, found = 0, huntTotal = 5;
  function plantHearts() {
    if (huntOn || done.hunt) return; huntOn = true;
    var figs = PH().filter(function (f) { return !f.closest('.hero, .title-page, .poster, .top'); });
    if (figs.length < 3) figs = PH();
    huntTotal = Math.min(5, figs.length); if (huntTotal < 1) { finish('hunt'); return; }
    shuffle(figs).slice(0, huntTotal).forEach(function (f) {
      var b = el('button', 'cl-heart', EMO); b.type = 'button'; b.setAttribute('aria-label', 'หัวใจลับ');
      b.style.setProperty('--hx', (8 + Math.random() * 70) + '%'); b.style.setProperty('--hy', (8 + Math.random() * 70) + '%');
      b.addEventListener('click', function (e) {
        e.stopPropagation(); e.preventDefault();
        if (b.classList.contains('got')) return;
        b.classList.add('got'); found++; sfx('coin');
        var r = b.getBoundingClientRect(); if (window.TUFx) { TUFx.float(r.left + r.width / 2, r.top, '💗'); TUFx.confetti(r.left + r.width / 2, r.top, 16, null, .4); }
        updateHuntLabel();
        if (found >= huntTotal) finish('hunt');
      });
      if (getComputedStyle(f).position === 'static') f.style.position = 'relative';
      f.appendChild(b);
    });
    updateHuntLabel();
  }
  function updateHuntLabel() {
    var c = quest && quest.querySelector('[data-q="hunt"] small');
    if (c) c.textContent = done.hunt ? 'เจอครบแล้ว' : 'เจอแล้ว ' + found + ' / ' + huntTotal;
  }
  function hunt() {
    var box = el('div', 'cl-hunt', '<div class="cl-hbig">' + EMO + '</div><p>มีหัวใจลับ <b>' + huntTotal + ' ดวง</b> ซ่อนอยู่ตามมุมรูปความทรงจำ<br>เลื่อนขึ้นไปดูรูปแล้วแตะหาให้ครบนะ</p><button type="button" class="cl-go2">ไปตามหากัน</button>');
    box.querySelector('button').addEventListener('click', function () {
      closeModal();
      var g = $('[data-photo]:not(.hero [data-photo])') ; var t = document.querySelectorAll('.cl-heart:not(.got)')[0] || g;
      if (t) { var par = t.closest('[data-photo]') || t; par.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
    });
    if (done.hunt) { box.innerHTML = '<div class="cl-win2"><span>' + EMO + '</span><p>เจอหัวใจลับครบแล้ว</p></div>'; }
    openModal('หัวใจลับ', box, stageBack);
  }

  function mountQuest() {
    var foot = $('.foot'); var main = $('#main'); if (!main && !STAGE) return;
    quest = el('section', 'cl-quest reveal');
    quest.innerHTML =
      '<header class="cl-qh"><p class="cl-kick">' + sk.q + '</p><h2 class="cl-qt">ภารกิจก่อนอ่านจดหมาย</h2>' +
      '<p class="cl-qs">ทำครบ 3 ข้อเพื่อปลดล็อกจดหมาย ไม่มีแพ้ ลองกี่ครั้งก็ได้</p>' +
      '<div class="cl-prog"><div class="cl-bar"><i></i></div><span class="cl-cnt">0 / 3</span></div></header>' +
      '<ol class="cl-cards">' +
        '<li><button type="button" class="cl-card" data-q="quiz"><span class="cl-no">01</span><span class="cl-ic">💭</span><b>ทายใจ</b><small>ตอบ 3 ข้อ</small><i class="cl-st">เริ่มเลย</i></button></li>' +
        '<li><button type="button" class="cl-card" data-q="puzzle"><span class="cl-no">02</span><span class="cl-ic">🧩</span><b>ต่อภาพ</b><small>ต่อรูปคู่ของเรา</small><i class="cl-st">เริ่มเลย</i></button></li>' +
        '<li><button type="button" class="cl-card" data-q="hunt"><span class="cl-no">03</span><span class="cl-ic">' + EMO + '</span><b>หัวใจลับ</b><small>ซ่อนอยู่ในรูป</small><i class="cl-st">เริ่มเลย</i></button></li>' +
      '</ol><button type="button" class="cl-skipq">ข้ามภารกิจ →</button>';
    if (STAGE) {
      var fab = el('button', 'cl-fab', '<span>' + EMO + '</span> ภารกิจ <b class="cl-fabn">0/3</b>'); fab.type = 'button';
      fab.addEventListener('click', function () { sfx('tap'); questModal(); });
      document.body.appendChild(fab);
    } else if (foot) foot.parentNode.insertBefore(quest, foot); else main.appendChild(quest);
    quest.querySelector('[data-q="quiz"]').addEventListener('click', function () { sfx('tap'); quiz(); });
    quest.querySelector('[data-q="puzzle"]').addEventListener('click', function () { sfx('tap'); puzzle(); });
    quest.querySelector('[data-q="hunt"]').addEventListener('click', function () { sfx('tap'); hunt(); });
    quest.querySelector('.cl-skipq').addEventListener('click', function () { ['quiz', 'puzzle', 'hunt'].forEach(function (k) { done[k] = true; store.set(k, '1'); }); letterOpen = true; store.set('letter', '1'); refresh(); toast('ข้ามภารกิจแล้ว'); document.querySelectorAll('.cl-heart').forEach(function (h) { h.remove(); }); });
    if (window.IntersectionObserver === undefined || STAGE) quest.classList.add('in');
    refresh(); updateHuntLabel();
    plantHearts();
  }

  // ปุ่มจดหมายที่ยังล็อก: กดแล้วพาไปที่ภารกิจ
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest(LET);
    if (!b || !quest || allDone() || letterOpen) return;
    e.stopImmediatePropagation(); e.preventDefault();
    sfx('tap'); toast('ไขภารกิจให้ครบ 3 ข้อก่อนนะ 🔒');
    if (STAGE) { questModal(); return; }
    quest.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    quest.classList.remove('nudge'); void quest.offsetWidth; quest.classList.add('nudge');
  }, true);

  function init() {
    mountLock(); mountChip(); mountQuest(); setLetters();
    if (STAGE) { var t0 = setInterval(function () { if (!huntOn && !done.hunt && document.querySelector('.scatter-item')) { plantHearts(); } if (huntOn) clearInterval(t0); }, 600); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
