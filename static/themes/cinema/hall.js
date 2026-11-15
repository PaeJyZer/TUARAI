(function () {
  'use strict';
  var CFG = window.SITE_CONFIG || {}, P = window.TU_PHOTOS || [], D = window.TUD;
  var root = document.documentElement;
  var A = document.getElementById('layA'), B = document.getElementById('layB'), fill = document.getElementById('tlFill'), cue = document.getElementById('cue'), scr = document.getElementById('scr');
  var endCard = document.getElementById('endCard'), endText = document.getElementById('endText'), endBtn = document.getElementById('endBtn'), skip = document.getElementById('skipBtn'), again = document.getElementById('againBtn');
  var isVid = function (u) { return /\.(mp4|webm|mov)(\?|$)/i.test(u); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var low = root.classList.contains('lowfx');

  /* ที่นั่ง + หมีดูหนัง (เงา) */
  var seats = document.getElementById('seats'), s = '';
  [[4, 22, .8], [18, 24, .85], [70, 22, .8], [86, 24, .85], [30, 12, 1.0], [60, 12, 1.0]].forEach(function (h, i) { s += '<span class="bh" style="left:' + h[0] + '%;width:' + (h[2] * 13) + '%;bottom:' + (-h[1] * .5) + '%;opacity:.9">' + D.bearHead(i < 4 ? '#2b1520' : '#1c0d15') + '</span>'; });
  s += '<span class="bh" style="left:39%;width:18%;bottom:-16%;transform:rotate(-6deg)">' + D.bearHead('#120810') + '</span><span class="bh" style="left:50%;width:17%;bottom:-18%;transform:rotate(7deg)">' + D.bearHead('#120810') + '</span>';
  seats.innerHTML = s;
  /* ฝุ่นในลำแสง */
  if (!low && !reduce) { var dust = document.getElementById('dust'), dh = ''; for (var i = 0; i < 16; i++) dh += '<i style="left:' + (30 + Math.random() * 40) + '%;top:' + (30 + Math.random() * 60) + '%;--dx:' + ((Math.random() - .5) * 60) + 'px;animation-duration:' + (5 + Math.random() * 6) + 's;animation-delay:-' + (Math.random() * 8) + 's"></i>'; dust.innerHTML = dh; }

  /* แสงกะพริบแบบฟิล์มเก่า (อ่อน-เข้ม-กระตุก) ภาพไม่หาย แค่ความสว่างเปลี่ยน */
  var fl = 1, flT = 1, lastF = 0;
  function flick(t) {
    if (t - lastF > 70) {
      lastF = t;
      var r = Math.random();
      flT = r < .06 ? .55 + Math.random() * .2 : r < .3 ? .78 + Math.random() * .15 : .92 + Math.random() * .08;
    }
    fl += (flT - fl) * .45;
    root.style.setProperty('--fl', fl.toFixed(3));
    requestAnimationFrame(flick);
  }
  if (!reduce) requestAnimationFrame(flick);
  /* เม็ดฟิล์ม */
  var cv = document.getElementById('grain'), cx = cv.getContext('2d'), img = cx.createImageData(320, 200), gt = 0;
  function grain(t) {
    if (t - gt > 80) { gt = t; var d = img.data; for (var k = 0; k < d.length; k += 4) { var v = (Math.random() * 255) | 0; d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255; } cx.putImageData(img, 0, 0); }
    requestAnimationFrame(grain);
  }
  if (!low && !reduce) requestAnimationFrame(grain);
  /* รอยขีดข่วนแนวตั้ง + จุดเปลี่ยนม้วน */
  setInterval(function () {
    if (reduce || low) return;
    if (Math.random() < .5) { var i = document.createElement('i'); i.style.left = (Math.random() * 100) + '%'; scr.appendChild(i); setTimeout(function () { i.remove(); }, 260); }
  }, 900);

  /* ฉาย */
  var cur = -1, layers = [A, B], li = 0, timer = null, started = false, ended = false;
  var SLIDE = 4800;
  function mk(src) {
    if (isVid(src)) return '<video src="' + src + '" playsinline preload="auto"></video>';
    var k = (Math.random() - .5) * 3.2;
    return '<div class="bgb" style="background-image:url(\'' + src + '\')"></div><img src="' + src + '" alt="" style="--kx:' + k.toFixed(1) + '%;--ky:' + ((Math.random() - .5) * 2.4).toFixed(1) + '%">';
  }
  function tl(i) { fill.style.width = Math.round(100 * Math.min(i + 1, P.length) / P.length) + '%'; }
  function show(i) {
    clearTimeout(timer);
    if (i >= P.length) { finish(); return; }
    cur = i; tl(i);
    var lay = layers[li]; li = 1 - li; var old = layers[li];
    lay.innerHTML = mk(P[i].src); lay.classList.add('on'); old.classList.remove('on');
    if (!reduce && i > 0) { cue.classList.remove('on'); void cue.offsetWidth; cue.classList.add('on'); }
    var v = lay.querySelector('video');
    if (v) {
      var go = function () { clearTimeout(timer); show(i + 1); };
      v.addEventListener('ended', go); v.addEventListener('error', function () { timer = setTimeout(go, 800); });
      v.play().catch(function () { v.muted = true; v.play().catch(go); });
      timer = setTimeout(go, 30000);
    } else timer = setTimeout(function () { show(i + 1); }, SLIDE);
    var nx = P[i + 1]; if (nx && !isVid(nx.src)) { var pre = new Image(); pre.src = nx.src; }
  }
  function typeEnd() {
    var name = CFG.partnerName || '', text = String(CFG.letterText || '').replace(/\r\n/g, '\n'), sign = CFG.letterSign || '';
    var start = new Date((CFG.startDate || '') + 'T00:00:00'), days = isNaN(start) ? 0 : Math.max(0, Math.floor((Date.now() - start) / 864e5));
    var esc = function (x) { return x.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };
    endText.innerHTML = '<h3>THE END</h3><div id="etBody"></div><span class="sg" id="etSg"></span>' + (days ? '<span class="dc">' + days.toLocaleString('en-US') + ' DAYS TOGETHER</span>' : '');
    var body = document.getElementById('etBody'), n = 0, spd = Math.max(20, Math.min(55, 14000 / Math.max(text.length, 1)));
    body.textContent = 'ถึง ' + name + '\n\n';
    var head = body.textContent;
    (function tick() { n++; body.textContent = head + text.slice(0, n); if (n < text.length) { setTimeout(tick, spd); } else document.getElementById('etSg').textContent = sign; })();
    endCard.onclick = function () { n = text.length; body.textContent = head + text; document.getElementById('etSg').textContent = sign; };
  }
  function ready() { return endBtn.classList.contains('is-ready') && !endBtn.classList.contains('is-locked'); }
  function revealEnd() { endBtn.hidden = true; endCard.classList.add('on'); typeEnd(); if (window.TUSfx) TUSfx.play('win'); again.hidden = false; }
  function finish() {
    if (ended) return; ended = true; skip.hidden = true; fill.style.width = '100%';
    if (ready()) { revealEnd(); return; }
    endBtn.hidden = false;
    var mo = new MutationObserver(function () { if (ready()) { mo.disconnect(); revealEnd(); } });
    mo.observe(endBtn, { attributes: true, attributeFilter: ['class'] });
    endBtn.addEventListener('click', function () { if (ready()) { mo.disconnect(); revealEnd(); } });
  }
  function start() { if (started) return; started = true; ended = false; endCard.classList.remove('on'); endBtn.hidden = true; again.hidden = true; skip.hidden = false; show(0); }
  skip.addEventListener('click', function () { clearTimeout(timer); var v = document.querySelector('.lay.on video'); if (v) v.pause(); cur = P.length; finish(); });
  again.addEventListener('click', function () { started = false; endCard.classList.remove('on'); start(); });
  document.addEventListener('tu:opened', start);
  if (document.body.classList.contains('opened')) start();
})();
