(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], DLG = (window.TU_DIALOG || [])[0] || null, CFG = window.SITE_CONFIG || {};
  var NAME = CFG.partnerName || 'เธอ';
  var Q = CFG.quests || {};
  var $ = function (id) { return document.getElementById(id); };
  var rep = function (s) { return String(s || '').replace(/\{name\}/g, NAME); };
  var gb = $('gb'), panel = $('panel'), scene = $('scene');
  var DOLL = Math.max(0, Math.min(3, parseInt(Q.doll, 10) || 0));
  var TONE = Q.tone || 'soft';
  var LOW = document.documentElement.classList.contains('lowfx') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- ตุ๊กตา 4 ตัว (วาดเอง) ---------- */
  function dollSVG(i, big) {
    var s = '', eye = '<circle cx="-7" cy="-2" r="2.2" fill="#2a1b12"/><circle cx="7" cy="-2" r="2.2" fill="#2a1b12"/>';
    var tear = '<path class="tear" d="M-8 3 q-2 4 0 5 q2 -1 0 -5z" fill="#9fd8ff"/>';
    if (i === 0) { /* หมีถือร่ม */
      s = '<g><path d="M-26 -34 q26 -26 52 0z" fill="#e0707a"/><path d="M0 -34 v38" stroke="#6b4a3a" stroke-width="2"/><path d="M-26 -34 q6 6 13 0 q6 6 13 0 q6 6 13 0 q6 6 13 0" fill="#e0707a"/></g>' +
        '<g transform="translate(0,14)"><ellipse cx="0" cy="18" rx="15" ry="17" fill="#b98657"/><circle cx="-13" cy="-12" r="6" fill="#b98657"/><circle cx="13" cy="-12" r="6" fill="#b98657"/><circle cx="0" cy="0" r="16" fill="#c99565"/><ellipse cx="0" cy="5" rx="7" ry="5" fill="#ecd2b0"/><circle cx="0" cy="3" r="2" fill="#2a1b12"/>' + eye + tear + '</g>';
    } else if (i === 1) { /* กระต่ายตาบวม */
      s = '<g transform="translate(0,10)"><ellipse cx="-8" cy="-26" rx="5" ry="16" fill="#f3e9ee"/><ellipse cx="8" cy="-24" rx="5" ry="16" transform="rotate(14 8 -24)" fill="#f3e9ee"/><ellipse cx="-8" cy="-26" rx="2.5" ry="11" fill="#f2b8c8"/><ellipse cx="0" cy="22" rx="14" ry="16" fill="#f3e9ee"/><circle cx="0" cy="2" r="16" fill="#f8f1f4"/>' +
        '<circle cx="-7" cy="-1" r="4" fill="#f0a5b5" opacity=".7"/><circle cx="7" cy="-1" r="4" fill="#f0a5b5" opacity=".7"/>' + eye + '<path d="M-2 6 l2 2 l2 -2" stroke="#c46a82" stroke-width="1.6" fill="none"/>' + tear + '</g>';
    } else if (i === 2) { /* แมวหันหลัง */
      s = '<g transform="translate(0,12)"><path d="M-14 -14 l4 -14 l9 8z M14 -14 l-4 -14 l-9 8z" fill="#5c5668"/><ellipse cx="0" cy="22" rx="16" ry="17" fill="#6b6478"/><circle cx="0" cy="0" r="17" fill="#6b6478"/><path d="M14 30 q22 -6 14 -28" stroke="#6b6478" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M-6 -4 q2 8 0 14 M6 -4 q-2 8 0 14" stroke="#575062" stroke-width="2" fill="none"/></g>';
    } else { /* ลูกเจี๊ยบถือกระเป๋า */
      s = '<g transform="translate(0,16)"><ellipse cx="0" cy="14" rx="17" ry="17" fill="#ffd96a"/><circle cx="0" cy="-4" r="15" fill="#ffe27f"/><path d="M-3 0 l3 5 l3 -5z" fill="#f08a3c"/>' + eye +
        '<path class="arm" d="M14 14 q10 4 14 -2" stroke="#ffd96a" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="22" y="12" width="16" height="13" rx="3" fill="#a66a4a"/><path d="M26 12 v-3 h8 v3" stroke="#7a4a30" stroke-width="2" fill="none"/>' + tear + '</g>';
    }
    return s;
  }
  var CAPT = ['หมีถือร่ม', 'กระต่ายตาบวม', 'แมวหันหลัง', 'ลูกเจี๊ยบถือกระเป๋า'];

  /* ---------- ฉากระเบียงฝนตก (ต้นฉบับวาดเอง) ---------- */
  (function () {
    var h = '<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1b20"/><stop offset=".55" stop-color="#1b3a40"/><stop offset="1" stop-color="#27494c"/></linearGradient>' +
      '<radialGradient id="gl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".9"/><stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="bm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c8" stop-opacity=".8"/><stop offset="1" stop-color="#fff2c8" stop-opacity="0"/></linearGradient></defs>' +
      '<rect x="-1000" width="2400" height="700" fill="url(#sk)"/>';
    /* ตึกไกล ๆ */
    h += '<g fill="#12282d" opacity=".9"><rect x="10" y="300" width="70" height="200"/><rect x="95" y="260" width="60" height="240"/><rect x="250" y="320" width="80" height="180"/><rect x="340" y="280" width="60" height="220"/></g>';
    var w = ''; for (var i = 0; i < 16; i++) { var x = 18 + (i * 53) % 360, y = 290 + (i * 37) % 160; w += '<rect x="' + x + '" y="' + y + '" width="6" height="8" fill="#ffcf8a" opacity="' + (i % 3 ? .35 : .7) + '"/>'; }
    h += w;
    h += '<g fill="#12282d" opacity=".9"><rect x="-480" y="290" width="90" height="210"/><rect x="-380" y="330" width="70" height="170"/><rect x="-280" y="250" width="80" height="250"/><rect x="-160" y="310" width="110" height="190"/><rect x="430" y="300" width="80" height="200"/><rect x="540" y="260" width="90" height="240"/><rect x="660" y="320" width="70" height="180"/><rect x="760" y="280" width="120" height="220"/></g>';
    /* ใบไม้ซ้าย-ขวา */
    function leaf(x, y, r, c, cls) { return '<g class="sway ' + (cls || '') + '"><ellipse cx="' + x + '" cy="' + y + '" rx="' + r + '" ry="' + (r * .42) + '" transform="rotate(' + (x < 200 ? -30 : 30) + ' ' + x + ' ' + y + ')" fill="' + c + '"/></g>'; }
    h += leaf(-250, 350, 80, '#0e2a26') + leaf(-120, 420, 70, '#123a31', 'r') + leaf(560, 380, 80, '#0e2a26', 'r') + leaf(700, 430, 75, '#123a31') + leaf(30, 330, 60, '#0e2a26') + leaf(60, 380, 70, '#123a31', 'r') + leaf(15, 440, 55, '#0b231f') + leaf(380, 340, 62, '#0e2a26', 'r') + leaf(350, 400, 68, '#133b32') + leaf(392, 460, 54, '#0b231f', 'r');
    /* หลังคาสังกะสีด้านบน */
    h += '<path d="M-1000 0 H1400 V90 H-1000z" fill="#1a2c30"/>';
    for (var k = -34; k < 48; k++) h += '<path d="M' + (k * 30) + ' 0 V92" stroke="#0e1c20" stroke-width="3"/>';
    h += '<rect x="-1000" y="88" width="2400" height="8" fill="#0a1519"/>';
    /* หยดน้ำจากชายคา */
    for (var d = -23; d < 33; d++) h += '<rect x="' + (20 + d * 44) + '" y="98" width="1.6" height="26" fill="#bfe3df" opacity=".35"/>';
    /* ไฟระเบียง */
    h += '<g class="lampg"><circle cx="200" cy="120" r="70" fill="url(#gl)"/><circle cx="200" cy="108" r="6" fill="#ffe3b0"/><path d="M200 96 v-8" stroke="#0a1519" stroke-width="2"/></g>';
    /* ลำแสงตอนฝนหาย */
    h += '<path id="beam" d="M170 0 L230 0 L470 560 L-70 560z" fill="url(#bm)"/>';
    /* พื้นระเบียง + ราวระเบียง */
    h += '<rect x="-1000" y="520" width="2400" height="180" fill="#0a171b"/><rect x="-1000" y="508" width="2400" height="14" fill="#223a3e"/>';
    h += '<rect x="-1000" y="526" width="2400" height="3" fill="#35575b" opacity=".6"/>';
    for (var b = -40; b < 56; b++) h += '<rect x="' + (b * 25 - 2) + '" y="420" width="9" height="90" rx="3" fill="#1e3438"/><rect x="' + (b * 25 + 4) + '" y="420" width="2" height="90" fill="#35575b" opacity=".5"/>';
    h += '<rect x="-1000" y="410" width="2400" height="12" rx="4" fill="#2c4a4e"/><rect x="-1000" y="410" width="2400" height="3" fill="#4d7276" opacity=".7"/>';
    /* ตุ๊กตาบนราว */
    h += '<g transform="translate(200,372) scale(1.5)"><g class="dollg">' + dollSVG(DOLL) + '</g></g>';
    /* ตัวถ่วงตุ๊กตาสำรองข้างราว (จดหมายพับ) */
    h += '<g transform="translate(300,392) rotate(-8)"><rect x="-16" y="-10" width="32" height="20" fill="#f1e6cf"/><path d="M-16 -10 l16 12 l16 -12" stroke="#c9b48a" fill="none" stroke-width="1.5"/></g>';
    h += '<g transform="translate(96,398)"><rect x="-12" y="-4" width="24" height="12" rx="2" fill="#2a1d18"/><ellipse cx="0" cy="-4" rx="12" ry="3" fill="#3b2a22"/><path d="M-2 -4 q-4 -16 -10 -14 M2 -4 q6 -18 12 -14" stroke="#2e5a3c" stroke-width="2" fill="none"/></g>';
    scene.innerHTML = h;
  })();
  var gArt = $('gArt'); if (gArt) gArt.innerHTML = '<svg viewBox="-34 -56 68 108">' + dollSVG(DOLL) + '</svg>';

  /* ---------- ฝน ---------- */
  var cv = $('rainc'), g = cv.getContext('2d'), drops = [], DPR = Math.min(window.devicePixelRatio || 1, 2), rain = 1, raf = 0;
  function fit() { cv.width = panel.clientWidth * DPR; cv.height = panel.clientHeight * DPR; }
  fit(); window.addEventListener('resize', fit);
  var N = LOW ? 60 : 170;
  for (var i = 0; i < N; i++) drops.push({ x: Math.random(), y: Math.random(), l: .03 + Math.random() * .05, s: .012 + Math.random() * .014, a: .3 + Math.random() * .45 });
  function tick() {
    if (cv.width !== panel.clientWidth * DPR || cv.height !== panel.clientHeight * DPR) fit();
    g.clearRect(0, 0, cv.width, cv.height);
    if (rain > .02) {
      g.lineWidth = 1.4 * DPR; g.lineCap = 'round';
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i]; d.y += d.s * (.6 + rain * .6); d.x -= d.s * .22;
        if (d.y > 1) { d.y = -.05; d.x = Math.random() * 1.2; } if (d.x < -.05) d.x = 1.05;
        g.strokeStyle = 'rgba(200,232,230,' + (d.a * rain) + ')';
        g.beginPath(); g.moveTo(d.x * cv.width, d.y * cv.height); g.lineTo((d.x - d.l * .22) * cv.width, (d.y + d.l) * cv.height); g.stroke();
      }
    }
    raf = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) cancelAnimationFrame(raf); else { cancelAnimationFrame(raf); tick(); } });
  tick();

  /* ---------- เสียงฝน/ฟ้าร้อง (สร้างเอง ไม่ใช้ไฟล์) ---------- */
  var AC = null, rainGain = null, soundOn = true;
  function startAudio() {
    if (AC || !soundOn) return;
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      var len = AC.sampleRate * 2, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0), last = 0;
      for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; last = (last + .04 * w) / 1.04; d[i] = last * 3.5; }
      var src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
      var f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1800;
      rainGain = AC.createGain(); rainGain.gain.value = .35;
      src.connect(f); f.connect(rainGain); rainGain.connect(AC.destination); src.start();
    } catch (e) { AC = null; }
  }
  function rumble() {
    if (!AC || !soundOn) return;
    try {
      var o = AC.createBufferSource(), n = AC.sampleRate * 1.6, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0), last = 0;
      for (var i = 0; i < n; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 8 * Math.pow(1 - i / n, 2); }
      o.buffer = b; var gn = AC.createGain(); gn.gain.value = .7; o.connect(gn); gn.connect(AC.destination); o.start();
    } catch (e) {}
  }
  function setRain(v, ms) {
    var s = rain, t0 = performance.now();
    (function st(t) { var k = Math.min(1, (t - t0) / ms); rain = s + (v - s) * k; if (rainGain) rainGain.gain.value = .35 * rain; if (k < 1) requestAnimationFrame(st); })(t0);
  }
  var snd = $('snd');
  snd.addEventListener('click', function () {
    soundOn = !soundOn; snd.textContent = soundOn ? '🔊' : '🔇';
    if (soundOn) { if (!AC) startAudio(); else AC.resume && AC.resume(); } else if (AC && AC.suspend) AC.suspend();
  });
  function thunder() {
    var f = $('flash'); if (!LOW) { f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
    setTimeout(rumble, 500);
  }

  /* ---------- ข้อความ ---------- */
  var raw = String(CFG.letterText || '').replace(/\r/g, '').trim();
  var pages = raw.split(/\n\s*\n/).map(function (s) { return rep(s.trim()); }).filter(Boolean);
  if (!pages.length) pages = [rep('ฉันมีเรื่องจะบอก {name}...')];
  if (pages.length > 8) { var head = pages.slice(0, 7); head.push(pages.slice(7).join('\n\n')); pages = head; }
  var sign = CFG.letterSign ? String(CFG.letterSign) : '';
  var lampsEl = $('lamps'), lampN = pages.length;
  for (var li = 0; li < lampN; li++) lampsEl.appendChild(document.createElement('i'));
  function lampsTo(n) { var L = lampsEl.children; for (var i = 0; i < L.length; i++) L[i].classList.toggle('off', i < n); }

  var who = $('who'), say = $('say'), opts = $('opts'), items = $('items'), tbox = $('tbox');
  var typing = 0;
  function type(text, done) {
    clearInterval(typing); say.textContent = ''; var i = 0, ch = Array.from(text), sp = Math.max(18, Math.min(55, 2600 / ch.length));
    var skip = function () { clearInterval(typing); say.textContent = text; tbox.removeEventListener('click', skip); done && done(); };
    typing = setInterval(function () { say.textContent += ch[i++]; if (i >= ch.length) { clearInterval(typing); tbox.removeEventListener('click', skip); done && done(); } }, sp);
    tbox.addEventListener('click', skip);
  }
  function btn(label, fn, cls) { var b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (cls) b.className = cls; b.addEventListener('click', fn); opts.appendChild(b); return b; }
  function clr() { opts.innerHTML = ''; items.hidden = true; items.innerHTML = ''; }

  var pg = 0;
  function showPage() {
    clr(); who.textContent = (sign || 'ฉัน') + ' · ' + (pg + 1) + '/' + pages.length;
    lampsTo(pg);
    if (pg === 3 || pg === 6) thunder();
    type(pages[pg], function () {
      if (pg < pages.length - 1) btn('ต่อไป ›', function () { pg++; showPage(); }, 'go');
      else btn(P.length ? 'เปิดกล่องความทรงจำ' : 'ฉันอ่านจบแล้ว', P.length ? memories : afterRead, 'go');
    });
  }

  /* ---------- กล่องรูปความทรงจำ ---------- */
  var seen = {};
  function memories() {
    clr(); who.textContent = 'กล่องความทรงจำ';
    say.textContent = 'ของที่เราเคยมีด้วยกัน… แตะดูทีละใบนะ';
    items.hidden = false;
    var n = Math.min(P.length, 9), left = n;
    for (var i = 0; i < n; i++) (function (i) {
      var b = document.createElement('button'); b.type = 'button'; b.style.setProperty('--r', ((i % 5) - 2) * 3 + 'deg');
      var sp = document.createElement('span'); sp.style.backgroundImage = 'url("' + P[i].src.replace(/"/g, '%22') + '")'; b.appendChild(sp);
      b.addEventListener('click', function () {
        var first = !seen[i]; seen[i] = 1; b.classList.add('seen');
        var done = function () { if (first) { left--; } if (left <= 0) showContinue(); };
        if (window.TUMem) TUMem.open([i], { title: P[i].cap || '', ok: 'เก็บไว้', onClose: done }); else done();
      });
      items.appendChild(b);
    })(i);
    function showContinue() { if (opts.firstChild) return; btn('ฉันดูครบแล้ว ›', afterRead, 'go'); }
    btn('ข้ามไปก่อน', afterRead);
  }

  /* ---------- ผู้รับเลือก ---------- */
  function afterRead() {
    clr(); lampsTo(lampN);
    if (!DLG || !DLG.options || !DLG.options.length) return ending(null);
    who.textContent = CAPT[DOLL];
    type(rep(DLG.q), function () {
      DLG.options.forEach(function (o, i) {
        btn(rep(o), function () { reply(i); });
      });
    });
  }
  function reply(i) {
    clr(); who.textContent = CAPT[DOLL];
    var r = (DLG.replies && DLG.replies[i]) || DLG.reply || '';
    type(rep(r), function () { btn('ต่อ ›', function () { ending(); }, 'go'); });
  }

  /* ---------- ฉากจบ ฝนหยุด ---------- */
  function ending() {
    clr(); who.textContent = '';
    panel.classList.add('clear'); setRain(0, 5000);
    var endT = TONE === 'thanks' ? 'ขอบคุณสำหรับทุกวันที่ผ่านมา\nดูแลตัวเองดี ๆ นะ' : TONE === 'direct' ? 'ขอให้เธอเจอแต่เรื่องดี ๆ\nดูแลตัวเองด้วยนะ' : 'ฝนหยุดแล้วนะ\nขอให้วันพรุ่งนี้ของ ' + NAME + ' อบอุ่นกว่านี้';
    type(endT, function () {
      var sg = document.createElement('div'); sg.style.cssText = 'margin-top:8px;text-align:right;color:#ffcf8a;font-size:14px'; sg.textContent = sign ? '— ' + sign : ''; opts.appendChild(sg);
      btn('อ่านใหม่อีกครั้ง', function () { pg = 0; panel.classList.remove('clear'); setRain(1, 1500); showPage(); });
    });
  }

  /* ---------- เริ่มหลังกดผ่านหน้า warning ---------- */
  var started = false;
  function begin() { if (started) return; started = true; startAudio(); setTimeout(thunder, 1200); showPage(); }
  document.addEventListener('tu:opened', begin);
  document.addEventListener('tu:opening', function () { startAudio(); });
  if (document.body.classList.contains('opened')) begin();
})();
