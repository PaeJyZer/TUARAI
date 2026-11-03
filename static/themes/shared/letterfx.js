/* TUARAI - หน้าจดหมายแบบมีของให้แตะก่อน (ซอง/กล่องของขวัญ/ขวด/ม้วนกระดาษ/ตั๋ว/หน้าต่าง/ปกแผ่นเสียง)
   แต่ละธีมใช้รูปแบบไม่เหมือนกัน (ดูตาราง CFG) ไม่มีข้อความ มีแต่ลูกศรและวงแหวนชี้ให้กด */
(function () {
  'use strict';
  var body = document.body, ov = document.getElementById('letterOverlay');
  if (!ov) return;
  var CFG = {
    'theme-starry':   { shell: 'env', c: ['#1b2358', '#2b3690', '#ffd98a', '#ffd98a', '#1b2358', '✦'], enter: 'rise', order: 'b' },
    'theme-diary':    { shell: 'env', v: 'twine', c: ['#cfa66d', '#bb8f56', '#8a6a3d', '#a4472f', '#fff3d6', '♡'], enter: 'unfold', order: 'a' },
    'theme-garden':   { shell: 'env', c: ['#ffd3de', '#ffb3c8', '#e0678a', '#ff7aa2', '#fff', '🌷'], enter: 'bloom', order: 'c' },
    'theme-sunset':   { shell: 'bottle', enter: 'unroll', order: 'b' },
    'theme-envelope': { shell: 'env', v: 'air', c: ['#fffaf0', '#f2e6cc', '#c93c3c', '#c93c3c', '#fff', '❤'], enter: 'rise', order: 'a' },
    'theme-sakura':   { shell: 'env', c: ['#ffe3ec', '#ffc2d6', '#ee7fa0', '#ee7fa0', '#fff', '🌸'], enter: 'petal', order: 'b' },
    'theme-cinema':   { shell: 'ticket', enter: 'curtain', order: 'b' },
    'theme-y2k':      { shell: 'popup', enter: 'pop', order: 'c' },
    'theme-pixel':    { shell: 'env', v: 'px', c: ['#ffd35a', '#ff6ba8', '#1a1050', '#7fe3ff', '#1a1050', '★'], enter: 'steps', order: 'b' },
    'theme-cake':     { shell: 'gift', enter: 'pop', order: 'c' },
    'theme-arcade':   { shell: 'env', v: 'neon', c: ['#0b0f2e', '#16206e', '#00f0ff', '#ff2bd6', '#fff', '★'], enter: 'flicker', order: 'c' },
    'theme-space':    { shell: 'env', v: 'tech', c: ['#1c2548', '#2b3a6e', '#7fe3ff', '#7fe3ff', '#0b1030', '◎'], enter: 'scan', order: 'c' },
    'theme-musicbox': { shell: 'sleeve', enter: 'rise', order: 'b' },
    'theme-hanami':   { shell: 'scroll', v: 'white', enter: 'drop', order: 'b' },
    'theme-palace':   { shell: 'scroll', v: 'red', enter: 'unroll', order: 'a' },
    'theme-matchcat': { shell: 'env', v: 'gold', c: ['#d7263d', '#b01e31', '#ffd166', '#ffd166', '#8e1b22', '福'], enter: 'slide', order: 'c' }
  };
  var key = Object.keys(CFG).filter(function (k) { return body.classList.contains(k); })[0];
  var cfg = key ? CFG[key] : null;
  if (!cfg) return;
  body.classList.add('lx-on', 'lx-o-' + cfg.order);

  function shellHtml() {
    var c = cfg.c || [];
    switch (cfg.shell) {
      case 'env': return '<div class="env ' + (cfg.v || '') + '"><i class="back"></i><i class="paper"></i><i class="front"></i><i class="flap"></i><i class="ring"></i>' +
        (cfg.v === 'twine' ? '<i class="tw tw-h"></i><i class="tw tw-v"></i>' : '') + (cfg.v === 'air' ? '<i class="stamp">★</i>' : '') +
        '<i class="seal">' + c[5] + '</i></div>';
      case 'gift': return '<div class="gift"><i class="box"></i><i class="lid"></i><i class="bow b1"></i><i class="bow b2"></i></div>';
      case 'bottle': return '<div class="bottle"><i class="roll"></i><i class="belly"></i><i class="neck"></i><i class="cork"></i></div>';
      case 'scroll': return '<div class="scroll ' + cfg.v + '"><i class="roll"></i><i class="band"></i><i class="knot"></i></div>';
      case 'ticket': return '<div class="ticket"><i class="perf"></i><b>★</b></div>';
      case 'popup': return '<div class="popup"><div class="tb"><i></i><i></i><i></i></div><div class="pb"><span>✉</span><u></u></div></div>';
      case 'sleeve': return '<div class="sleeve"><i class="vinyl"><em></em></i><i class="cover"><b>♪</b></i></div>';
    }
    return '';
  }
  var stage = document.createElement('div');
  stage.className = 'lx-stage';
  if (cfg.c) stage.style.cssText = '--eb:' + cfg.c[0] + ';--ef:' + cfg.c[1] + ';--el:' + cfg.c[2] + ';--es:' + cfg.c[3] + ';--ei:' + cfg.c[4];
  stage.innerHTML = '<button type="button" class="lx-x" data-close aria-label="ปิด">&times;</button>' +
    '<button type="button" class="lx-shell" aria-label="แตะเพื่อเปิดจดหมาย">' + shellHtml() + '</button>' +
    '<div class="lx-hint" aria-hidden="true"><span class="lx-r r1"></span><span class="lx-r r2"></span>' +
    '<svg class="lx-arrow" viewBox="0 0 40 64"><path d="M20 4 L36 26 H25 V60 H15 V26 H4 Z" fill="currentColor" stroke="#000" stroke-opacity=".35" stroke-width="2" stroke-linejoin="round"/></svg></div>';
  ov.appendChild(stage);
  var card = ov.querySelector('.letter-card'), shell = stage.querySelector('.lx-shell'), cb = null, busy = false;
  card.setAttribute('data-enter', cfg.enter);

  function sfx(n, a) { try { if (window.TUSfx) TUSfx.play(n, a); } catch (e) {} }
  window.TULetterFX = {
    intro: function (done) {
      cb = done; busy = false; stage.classList.remove('go'); stage.querySelector('.lx-shell > *').classList.remove('open');
      ov.classList.add('lx-intro'); card.classList.remove('lx-in'); return true;
    },
    reset: function () { ov.classList.remove('lx-intro'); card.classList.remove('lx-in'); cb = null; busy = false; }
  };
  shell.addEventListener('click', function () {
    if (busy || !cb) return; busy = true;
    var f = cb; cb = null;
    stage.querySelector('.lx-shell > *').classList.add('open'); stage.classList.add('go');
    sfx('tap'); setTimeout(function () { sfx('chime', 4); }, 350);
    setTimeout(function () {
      ov.classList.remove('lx-intro'); void card.offsetWidth; card.classList.add('lx-in');
      f();
    }, cfg.shell === 'env' ? 900 : 850);
  });
})();
