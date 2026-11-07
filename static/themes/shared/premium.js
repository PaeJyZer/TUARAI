/* =========================================
   TUARAI Premium - เสียงเอฟเฟกต์ (สังเคราะห์ด้วย WebAudio ไม่ใช้ไฟล์เสียง/เพลงของใคร)
   + ระบบปลดล็อกทีละขั้น + พลุ/คอนเฟตติ + ข้อความแจ้งเตือน
   ========================================= */
(function () {
  'use strict';
  if (window.TUSfx) return;   // โหลดซ้ำ (ธีมพรีเมียมโหลดเองด้วย) ให้ข้าม
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, muted = false, nbuf = null;
  try { muted = localStorage.getItem('tu_mute') === '1'; } catch (e) {}

  function ensure() {
    if (!AC) return null;
    if (!ctx) {
      try { ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : .85; master.connect(ctx.destination); }
      catch (e) { ctx = null; return null; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function () { ensure(); }, { passive: true });
  });

  function tone(o) {
    var c = ensure(); if (!c || muted) return;
    var t0 = c.currentTime + (o.t || 0), d = o.d || .15, a = o.a || .005, v = o.v == null ? .2 : o.v;
    var osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + d);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + d + .05);
  }
  function noise(o) {
    var c = ensure(); if (!c || muted) return;
    if (!nbuf) {
      nbuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      var ch = nbuf.getChannelData(0);
      for (var i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    }
    var t0 = c.currentTime + (o.t || 0), d = o.d || .2, v = o.v == null ? .25 : o.v;
    var src = c.createBufferSource(); src.buffer = nbuf; src.loop = true;
    var f = c.createBiquadFilter(); f.type = o.ft || 'bandpass'; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.f || 1000, t0);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + d);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + (o.a || .01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + d + .05);
  }

  // โน้ตสเกลเพนทาโทนิก (ทำนองที่ใช้เป็นของ TUARAI เอง ไม่ใช่เพลงของใคร)
  var SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];
  var TUNE = [0, 2, 3, 5, 3, 2, 4, 2, 0, 1, 2, 3, 2, 1, 0, 0];

  var S = {
    tap: function () { tone({ f: 720, to: 460, d: .08, type: 'triangle', v: .16 }); },
    tick: function () { noise({ f: 3600 + Math.random() * 900, d: .02, v: .07, q: 2.5 }); tone({ f: 800 + Math.random() * 500, to: 450, d: .035, type: 'triangle', v: .05 }); },
    pop: function () { noise({ f: 2200, to: 500, d: .1, v: .4, q: .6 }); tone({ f: 320, to: 70, d: .11, v: .25 }); },
    coin: function () { tone({ f: 988, d: .07, type: 'square', v: .1 }); tone({ f: 1319, t: .07, d: .35, type: 'square', v: .1 }); },
    blip: function () { tone({ f: 880, to: 1320, d: .07, type: 'square', v: .09 }); },
    chime: function (i) {
      var f = SCALE[(i || 0) % SCALE.length];
      tone({ f: f, d: 1.1, v: .2 }); tone({ f: f * 2, d: .6, v: .06 }); tone({ f: f * 3, d: .3, v: .025 });
    },
    note: function (i) { // เสียงกล่องดนตรี
      var f = SCALE[(i || 0) % SCALE.length];
      tone({ f: f, d: 1.4, v: .17, a: .002 }); tone({ f: f * 4, d: .35, v: .05, a: .002 }); tone({ f: f * 2.01, d: .7, v: .06 });
    },
    sparkle: function () {
      for (var i = 0; i < 5; i++) tone({ f: 1800 + Math.random() * 2400, t: i * .05, d: .22, v: .06 });
    },
    whoosh: function () { noise({ f: 300, to: 2600, d: .7, v: .28, q: .8 }); },
    blow: function () { noise({ f: 1100, to: 250, d: .9, v: .35, q: .5, a: .08 }); },
    ratchet: function () { noise({ f: 3000, d: .03, v: .22, q: 3 }); tone({ f: 1900, d: .025, type: 'square', v: .05 }); },
    ping: function () { tone({ f: 1250, to: 950, d: .9, v: .16 }); tone({ f: 2500, d: .4, v: .04 }); },
    laser: function () { tone({ f: 1700, to: 180, d: .22, type: 'sawtooth', v: .09 }); },
    boom: function () { noise({ f: 400, to: 40, d: .6, v: .5, ft: 'lowpass', q: .5 }); tone({ f: 110, to: 35, d: .5, v: .35 }); },
    unlock: function () { tone({ f: 523, d: .12, type: 'triangle', v: .16 }); tone({ f: 784, t: .09, d: .12, type: 'triangle', v: .16 }); tone({ f: 1047, t: .18, d: .45, type: 'triangle', v: .18 }); },
    win: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone({ f: f, t: i * .11, d: .25, type: 'triangle', v: .17 }); });
      tone({ f: 1047, t: .5, d: .9, type: 'triangle', v: .15 }); tone({ f: 1319, t: .5, d: .9, type: 'sine', v: .1 });
    },
    fanfare: function () {
      var seq = [[523, 0], [523, .14], [523, .28], [659, .42], [784, .62], [659, .8], [784, 1.0], [1047, 1.2]];
      seq.forEach(function (n) { tone({ f: n[0], t: n[1], d: .3, type: 'square', v: .08 }); tone({ f: n[0] / 2, t: n[1], d: .3, type: 'triangle', v: .12 }); });
      tone({ f: 1047, t: 1.2, d: 1.1, type: 'square', v: .06 });
    },
    letter: function () { S.chime(2); setTimeout(function () { S.chime(5); }, 140); },
    vinyl: function () { noise({ f: 5000, d: .5, v: .06, q: .4, ft: 'highpass' }); },
    /* เสียงนุ่มๆ สำหรับธีมวัง/วิชวลโนเวล */
    koto: function (i) { var f = SCALE[((i || 0) % 8 + 8) % 8] / 2; tone({ f: f, d: 1.3, v: .13, a: .003 }); tone({ f: f * 2.003, d: .5, v: .035, a: .003 }); },
    vn: function () { tone({ f: 880, d: .03, v: .018, a: .003 }); },
    pick: function () { tone({ f: 523, d: .25, v: .1, a: .004 }); tone({ f: 784, t: .08, d: .5, v: .1, a: .004 }); },
    drop: function () { tone({ f: 900, to: 420, d: .22, v: .1, a: .004 }); tone({ f: 1350, to: 630, t: .06, d: .2, v: .04, a: .004 }); },
    soft: function () { tone({ f: 660, to: 520, d: .14, v: .07, a: .004 }); },
    /* เสียงงานเทศกาล / แมวกวัก (นุ่มๆ) */
    meow: function () { tone({ f: 520, to: 880, d: .17, v: .08, a: .02 }); tone({ f: 880, to: 430, t: .16, d: .3, v: .08, a: .01 }); tone({ f: 1040, to: 860, t: .05, d: .25, v: .02 }); },
    sad: function () { tone({ f: 392, to: 330, d: .4, type: 'triangle', v: .09, a: .02 }); tone({ f: 330, to: 247, t: .32, d: .6, type: 'triangle', v: .09, a: .02 }); },
    taiko: function () { tone({ f: 150, to: 52, d: .4, v: .26, a: .003 }); noise({ f: 300, d: .12, v: .08, ft: 'lowpass', q: .5 }); },
    hanabiUp: function () { tone({ f: 480, to: 1500, d: .55, v: .035, a: .05 }); },
    hanabi: function () {
      noise({ f: 900, to: 120, d: .55, v: .2, ft: 'lowpass', q: .6, a: .005 }); tone({ f: 120, to: 50, d: .35, v: .12 });
      for (var i = 0; i < 7; i++) tone({ f: 2200 + Math.random() * 2600, t: .08 + i * .06, d: .08, v: .03, a: .002 });
    },
    page: function () { noise({ f: 1400, to: 500, d: .35, v: .05, ft: 'lowpass', q: .3, a: .08 }); }
  };
  var pad = null;
  S.padStart = function () {
    var c = ensure(); if (!c || pad) return;
    var g = c.createGain(); g.gain.value = 0.0001; g.gain.setTargetAtTime(.035, c.currentTime, 2.5); g.connect(master);
    var oscs = [130.8, 196, 261.6, 329.6].map(function (f, i) {
      var o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.detune.value = (i - 1.5) * 4; o.connect(g); o.start(); return o;
    });
    pad = { g: g, o: oscs };
  };
  S.padStop = function () {
    if (!pad || !ctx) { pad = null; return; }
    var p = pad; pad = null; p.g.gain.setTargetAtTime(.0001, ctx.currentTime, .4);
    setTimeout(function () { p.o.forEach(function (o) { try { o.stop(); } catch (e) {} }); }, 2000);
  };

  /* เสียงเครื่องยนต์ (ยานอวกาศ) */
  var eng = null;
  S.engineStart = function () { // ฮัมเบาๆ นุ่มๆ (ไซน์/สามเหลี่ยม ผ่านโลว์พาส) ไม่แสบหู
    var c = ensure(); if (!c || muted || eng) return;
    var o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'sine'; o2.type = 'triangle'; f.type = 'lowpass'; f.frequency.value = 360; f.Q.value = .4;
    o.frequency.value = 70; o2.frequency.value = 105;
    g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(.035, c.currentTime + .6);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(master); o.start(); o2.start();
    eng = { o: o, o2: o2, g: g, f: f };
  };
  S.engineSet = function (p) { // p 0..1
    if (!eng || !ctx) return;
    var t = ctx.currentTime;
    eng.o.frequency.setTargetAtTime(70 + p * 110, t, .25);
    eng.o2.frequency.setTargetAtTime(105 + p * 170, t, .25);
    eng.f.frequency.setTargetAtTime(360 + p * 500, t, .25);
    eng.g.gain.setTargetAtTime(.035 + p * .035, t, .25);
  };
  S.engineStop = function () {
    if (!eng || !ctx) { eng = null; return; }
    var e = eng; eng = null;
    var t = ctx.currentTime;
    e.g.gain.setTargetAtTime(.0001, t, .3);
    setTimeout(function () { try { e.o.stop(); e.o2.stop(); } catch (er) {} }, 1500);
  };

  /* เล่นทำนองกล่องดนตรี */
  var melTimer = null;
  S.melody = function (gap, count) {
    S.melodyStop();
    var i = 0, n = count || TUNE.length;
    (function next() {
      if (i >= n) { melTimer = null; return; }
      S.note(TUNE[i % TUNE.length]); i++;
      melTimer = setTimeout(next, gap || 360);
    })();
  };
  S.melodyStop = function () { clearTimeout(melTimer); melTimer = null; };

  window.TUSfx = {
    play: function (name, a, b) { try { if (S[name]) S[name](a, b); } catch (e) {} },
    tone: tone, noise: noise, scale: SCALE, tune: TUNE,
    isMuted: function () { return muted; },
    setMuted: function (m) {
      muted = !!m;
      try { localStorage.setItem('tu_mute', muted ? '1' : '0'); } catch (e) {}
      if (master) master.gain.value = muted ? 0 : .85;
      if (muted) { S.melodyStop(); S.engineStop(); S.padStop(); }
      var b = document.querySelector('.sfx-btn'); if (b) { b.textContent = muted ? '🔇' : '🔊'; b.setAttribute('aria-pressed', muted); }
    }
  };

  /* ---------- ปุ่มเปิด/ปิดเสียง ---------- */
  function mountMute() {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'sfx-btn'; b.setAttribute('aria-label', 'เปิด/ปิดเสียงเอฟเฟกต์');
    b.textContent = muted ? '🔇' : '🔊';
    b.addEventListener('click', function () { ensure(); TUSfx.setMuted(!muted); if (!muted) S.tap(); });
    document.body.appendChild(b);
  }

  /* ---------- ข้อความแจ้งเตือน ---------- */
  var toastEl = null, toastT = null;
  window.TUToast = function (msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'tu-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  };

  /* ---------- คอนเฟตติ / อีโมจิลอยขึ้น ---------- */
  var cv = null, cx = null, parts = [], raf = null;
  function loop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += p.vr; p.life--;
      if (p.life <= 0 || p.y > cv.height + 30) { parts.splice(i, 1); continue; }
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.globalAlpha = Math.min(1, p.life / 25);
      cx.fillStyle = p.c;
      if (p.s === 0) cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      else { cx.beginPath(); cx.arc(0, 0, p.w / 2, 0, 6.3); cx.fill(); }
      cx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(loop);
    else { raf = null; cx.clearRect(0, 0, cv.width, cv.height); }
  }
  function fit() { if (!cv) return; cv.width = innerWidth; cv.height = innerHeight; }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.TUFx = {
    confetti: function (x, y, n, colors, spread) {
      if (reduce) return;
      if (!cv) {
        cv = document.createElement('canvas'); cv.className = 'fx-canvas'; document.body.appendChild(cv);
        cx = cv.getContext('2d'); fit(); addEventListener('resize', fit);
      }
      colors = colors || ['#ff5d8f', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#ff9f43'];
      n = n || 90; spread = spread || 1;
      var low = (navigator.hardwareConcurrency || 8) <= 4; if (low) n = Math.round(n * .6);
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, sp = (3 + Math.random() * 9) * spread;
        parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 5, g: .22, r: Math.random() * 6, vr: (Math.random() - .5) * .4,
          w: 6 + Math.random() * 7, h: 4 + Math.random() * 6, s: Math.random() < .3 ? 1 : 0,
          c: colors[(Math.random() * colors.length) | 0], life: 70 + Math.random() * 60 });
      }
      if (!raf) raf = requestAnimationFrame(loop);
    },
    rain: function (n, colors) { // คอนเฟตติตกจากด้านบนทั้งจอ
      for (var i = 0; i < (n || 6); i++) setTimeout(function () { TUFx.confetti(Math.random() * innerWidth, -10, 18, colors, .5); }, i * 140);
    },
    float: function (x, y, text) {
      var s = document.createElement('span'); s.className = 'fx-float'; s.textContent = text;
      s.style.left = x + 'px'; s.style.top = y + 'px'; document.body.appendChild(s);
      setTimeout(function () { s.remove(); }, 1500);
    }
  };

  /* ---------- ปลดล็อกทีละขั้น ---------- */
  var body = document.body;
  var stepsEl = null, labels = [], hints = [], done = { 1: false, 2: false, 3: false };
  function renderSteps() {
    if (!stepsEl) return;
    var cur = done[1] ? (done[2] ? (done[3] ? 4 : 3) : 2) : 1;
    var html = '<ol class="steps-list">';
    for (var i = 1; i <= 3; i++) {
      var st = done[i] ? 'done' : (i === cur ? 'now' : 'wait');
      html += '<li class="' + st + '"><span class="dot">' + (done[i] ? '✓' : i) + '</span><span class="lab">' + (labels[i - 1] || '') + '</span></li>';
    }
    html += '</ol><p class="steps-hint">' + (hints[Math.min(cur, 4) - 1] || '') + '</p>';
    if (cur < 4) html += '<button type="button" class="steps-skip">ข้ามทุกขั้นตอน →</button>';
    stepsEl.innerHTML = html;
    var sk = stepsEl.querySelector('.steps-skip');
    if (sk) sk.addEventListener('click', function () { TUSteps.skipAll(); });
  }
  function lockLetters(lock) {
    document.querySelectorAll('[data-letter]').forEach(function (b) {
      if (lock) { b.setAttribute('disabled', ''); b.classList.add('is-locked'); }
      else { b.removeAttribute('disabled'); b.classList.remove('is-locked'); b.classList.add('is-ready'); }
    });
  }
  window.TUSteps = {
    complete: function (n, quiet) {
      if (done[n]) return;
      if (n > 1 && !done[n - 1]) return;
      done[n] = true; body.classList.add('s' + n);
      if (n === 3) lockLetters(false);
      renderSteps();
      if (!quiet) { TUSfx.play('unlock'); TUToast(n === 3 ? '🎉 ปลดล็อกจดหมายแล้ว!' : '🔓 ปลดล็อกขั้นที่ ' + n + ' แล้ว!'); }
      document.dispatchEvent(new CustomEvent('tu:step', { detail: { n: n } }));
    },
    skipAll: function () {
      var was = done[3];
      [1, 2, 3].forEach(function (n) { TUSteps.complete(n, true); });
      if (!was) { TUSfx.play('unlock'); TUToast('ปลดล็อกทั้งหมดแล้ว'); }
      document.dispatchEvent(new CustomEvent('tu:skipped'));
    },
    isDone: function (n) { return !!done[n]; }
  };

  function init() {
    mountMute();
    stepsEl = document.querySelector('[data-steps]');
    if (stepsEl) {
      labels = (stepsEl.getAttribute('data-labels') || '').split('|');
      hints = (stepsEl.getAttribute('data-hints') || '').split('|');
      lockLetters(true); renderSteps();
    }
    // เปิดเว็บแล้ว = ผ่านขั้นที่ 1
    document.addEventListener('tu:opened', function () { TUSteps.complete(1, true); });
    // ขั้นที่ 3 = เปิดดูรูปขึ้นมาดู 1 รูปหลังปลดล็อกขั้นที่ 2
    document.addEventListener('click', function (e) {
      if (done[2] && !done[3] && e.target.closest && e.target.closest('[data-photo]')) { TUSteps.complete(3); S.sparkle(); }
    });
    // เสียงเอฟเฟกต์กลางๆ
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-photo]') : null;
      if (t && done[2]) S.tap();
      else if (e.target.closest && e.target.closest('.lb-nav')) S.tap();
    });
    document.addEventListener('tu:letter', function () { S.letter(); });
    document.addEventListener('tu:letterdone', function () { S.win(); if (window.TUFx) TUFx.rain(5); });
    var n = 0;
    document.addEventListener('tu:type', function () { n++; if (n % 2 === 0) S.tick(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
