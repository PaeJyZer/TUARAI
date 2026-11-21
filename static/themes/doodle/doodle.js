/* Hand-Drawn Birthday — ฉากลายเส้นวาดมือ (ผู้รับ) + ตัวจัดฉาก (ผู้ส่ง) */
(function () {
'use strict';
var C = window.DD || {}, B = C.board || { candle: { kind: 'plain', text: '', n: 4 }, L: [], P: null };
var PH = (C.photos || []).slice(), LT = C.letter || { name: '', text: '', sign: '' };
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var stage = $('#stage'), dim = $('#dim'), fx = $('#fx'), hint = $('#hint'), ui = $('#ui');
var DES = !!C.design;
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

/* ---------- เส้นสั่นเหมือนวาดมือทีละเฟรม ---------- */
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function jit(d, r, a) { return d.replace(/-?\d+(?:\.\d+)?/g, function (n) { return (+n + (r() - .5) * 2 * a).toFixed(1); }); }
function seedOf(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
function ci(cx, cy, r) { var k = .55 * r; return 'M' + (cx - r) + ' ' + cy + ' C' + (cx - r) + ' ' + (cy - k) + ' ' + (cx - k) + ' ' + (cy - r) + ' ' + cx + ' ' + (cy - r) + ' C' + (cx + k) + ' ' + (cy - r) + ' ' + (cx + r) + ' ' + (cy - k) + ' ' + (cx + r) + ' ' + cy + ' C' + (cx + r) + ' ' + (cy + k) + ' ' + (cx + k) + ' ' + (cy + r) + ' ' + cx + ' ' + (cy + r) + ' C' + (cx - k) + ' ' + (cy + r) + ' ' + (cx - r) + ' ' + (cy + k) + ' ' + (cx - r) + ' ' + cy; }
function P(c, arr) { return { c: c, p: arr }; }
var V100 = '0 0 100 100';
var ART = {
  heart: { vb: V100, parts: [P('', [['M50 84 C18 62 8 40 20 26 C31 14 46 19 50 31 C54 19 69 14 80 26 C92 40 82 62 50 84']])] },
  star: { vb: V100, parts: [P('', [['M50 8 L61 38 L93 39 L67 58 L77 91 L50 71 L23 91 L33 58 L7 39 L39 38 Z']])] },
  gift: { vb: V100, parts: [P('', [['M18 46 L82 47 L81 90 L19 89 Z', 'p'], ['M50 47 L50 89']]), P('lid', [['M12 32 L88 33 L87 47 L13 46 Z', 'p'], ['M50 32 L50 46'], ['M50 32 C38 12 20 18 30 30 C36 36 46 34 50 32 C54 34 64 36 70 30 C80 18 62 12 50 32']])] },
  balloon: { vb: V100, parts: [P('', [['M50 8 C76 8 84 30 76 52 C70 66 58 74 50 76 C42 74 30 66 24 52 C16 30 24 8 50 8', 'p'], ['M46 81 L50 75 L54 81 Z', 'i'], ['M50 81 C42 88 58 92 50 99'], ['M36 24 C34 30 34 34 36 38']])] },
  flower: { vb: V100, parts: [P('', [['M50 58 C47 72 53 84 50 99'], ['M50 80 C60 68 72 70 76 74 C70 84 58 86 50 80', 'p'], [ci(50, 21, 10), 'p'], [ci(62, 30, 10), 'p'], [ci(58, 44, 10), 'p'], [ci(42, 44, 10), 'p'], [ci(38, 30, 10), 'p'], [ci(50, 34, 6), 'p']])] },
  bear: { vb: V100, parts: [P('', [['M30 76 C26 96 74 96 70 76 C68 66 32 66 30 76', 'p'], ['M36 90 L34 98 M64 90 L66 98']]), P('bhead', [[ci(27, 26, 10), 'p'], [ci(73, 26, 10), 'p'], [ci(27, 26, 4.5)], [ci(73, 26, 4.5)], [ci(50, 46, 27), 'p'], [ci(50, 55, 9), 'p'], ['M47 50 L53 50 L50 54 Z', 'i'], ['M50 54 L50 58 M50 58 Q46 62 43 59 M50 58 Q54 62 57 59']]), P('bhead normal', [[ci(40, 42, 2.4), 'i'], [ci(60, 42, 2.4), 'i']]), P('bhead happy', [['M36 43 Q40 38 44 43 M56 43 Q60 38 64 43'], [ci(34, 50, 3)], [ci(66, 50, 3)]])] },
  cloud: { vb: V100, parts: [P('', [['M22 72 C6 72 4 50 22 48 C22 30 46 26 54 42 C64 28 86 36 82 52 C98 52 98 72 82 72 Z', 'p']])] },
  note: { vb: V100, parts: [P('', [['M26 76 C26 68 44 68 44 76 C44 84 26 84 26 76', 'i'], ['M43 75 L43 24'], ['M43 24 C58 28 66 38 62 52'], ['M70 18 L70 30 M64 24 L76 24']])] },
  bow: { vb: V100, parts: [P('', [['M50 50 C36 28 12 32 14 50 C12 68 36 72 50 50 C64 28 88 32 86 50 C88 68 64 72 50 50', 'p'], ['M47 56 L36 90 L46 83 L50 92'], ['M53 56 L64 90 L54 83 L50 92'], [ci(50, 50, 6), 'p']])] },
  sparkle: { vb: V100, parts: [P('', [['M50 4 C52 34 66 48 96 50 C66 52 52 66 50 96 C48 66 34 52 4 50 C34 48 48 34 50 4'], ['M82 12 L82 24 M76 18 L88 18']])] },
  cupcake: { vb: V100, parts: [P('', [['M24 56 L32 92 L68 92 L76 56 Z', 'p'], ['M40 60 L42 90 M52 60 L52 90 M62 60 L60 90'], ['M20 58 C14 42 28 40 30 34 C30 20 48 14 54 26 C66 22 82 34 72 44 C86 46 84 58 78 58 Z', 'p'], [ci(52, 12, 5), 'i']])] },
  hat: { vb: V100, parts: [P('', [['M50 10 L22 86 L78 86 Z', 'p'], ['M40 40 L60 50 M34 58 L68 66 M29 74 L73 80'], ['M16 88 C40 94 60 94 84 88'], [ci(50, 9, 5), 'p']])] },
  frame: { vb: '0 0 100 120', parts: [P('', [['M3 5 L97 3 L98 116 L2 118 Z', 'p'], ['M28 -1 L70 -4 L72 10 L26 11 Z', 'p']])] },
  envBack: { vb: '0 -30 100 106', parts: [P('', [['M4 14 L96 12 L98 68 L3 70 Z', 'p']]), P('fo', [['M4 14 L50 -24 L96 12 Z', 'p']])] },
  envFront: { vb: '0 -30 100 106', parts: [P('', [['M4 14 L50 42 L96 12 L98 68 L3 70 Z', 'p'], ['M3 70 L38 40 M98 68 L62 40']]), P('fc', [['M4 14 L50 44 L96 12 Z', 'p'], ['M50 47 C41 40 40 33 45 32 C48 31 50 34 50 35 C50 34 52 31 55 32 C60 33 59 40 50 47', 'p']])] }
};
var FILL = { p: ' class="fp"', i: ' class="fi"', f: ' class="ff"' };
function artSVG(type, still) {
  var A = ART[type], nf = still ? 1 : 3, h = '', f, r;
  for (f = 0; f < nf; f++) {
    r = rng(seedOf(type) + f * 131);
    h += '<g class="v v' + (f + 1) + '">' + A.parts.map(function (pt) {
      return '<g' + (pt.c ? ' class="' + pt.c + '"' : '') + '>' + pt.p.map(function (q) { return '<path d="' + jit(q[0], r, 1.3) + '"' + (q[1] ? FILL[q[1]] : '') + '/>'; }).join('') + '</g>';
    }).join('') + '</g>';
  }
  return '<svg viewBox="' + A.vb + '" aria-hidden="true">' + h + '</svg>';
}

/* ---------- เค้ก + เทียน ---------- */
var BITES = [[82, 84, 20], [64, 88, 19], [44, 88, 20], [22, 86, 20], [66, 62, 22], [38, 62, 22], [50, 72, 72]];
function cakeSVG(cd, still) {
  var nf = still ? 1 : 3, n = cd.n, kind = cd.kind, xs = [], k, f, r, plate = '', cb = '', cn = '', fl = '';
  var span = kind === 'plain' ? (n <= 3 ? 26 : n === 4 ? 32 : 38) : Math.min(46, 13 * n);
  for (k = 0; k < n; k++) xs.push(n === 1 ? 50 : 50 - span / 2 + span * k / (n - 1));
  var fs = kind === 'plain' ? 0 : (n <= 2 ? 34 : n === 3 ? 28 : n === 4 ? 23 : 19), flameY = kind === 'plain' ? 31 : 50 - fs * .74 - 3;
  for (f = 0; f < nf; f++) {
    r = rng(991 + f * 77);
    var J = function (d) { return jit(d, r, 1.2); };
    plate += '<g class="v v' + (f + 1) + '"><path d="' + J('M6 92 C28 100 72 100 94 92') + '"/><path d="' + J('M18 96 C36 101 64 101 82 96') + '"/></g>';
    cb += '<g class="v v' + (f + 1) + '">' +
      '<path class="fp" d="' + J('M14 74 L14 92 C40 98 60 98 86 92 L86 74 Z') + '"/>' +
      '<path class="fp" d="' + J('M26 52 L26 72 C42 76 58 76 74 72 L74 52 Z') + '"/>' +
      '<path class="fp" d="' + J('M10 72 C18 66 24 77 33 72 C41 67 48 78 56 72 C64 67 72 78 80 72 C85 69 90 73 90 76 C89 82 81 82 76 80 C68 85 59 80 50 82 C42 85 34 80 26 82 C18 85 10 80 10 76 C9 74 9 73 10 72 Z') + '"/>' +
      '<path class="fp" d="' + J('M22 50 C28 44 34 55 42 50 C49 45 55 56 62 50 C68 45 74 52 78 50 C81 55 77 60 72 58 C66 62 58 58 50 60 C42 62 34 58 28 60 C23 60 20 55 22 50 Z') + '"/>' +
      '<path d="' + J('M22 87 L24 89 M36 89 L37 92 M52 88 L54 90 M66 91 L67 88 M78 86 L80 88 M44 79 L45 81 M34 67 L36 69 M48 65 L49 68 M62 67 L64 69') + '"/></g>';
    var g = '';
    xs.forEach(function (x, i) {
      if (kind === 'plain') {
        g += '<path class="fp" d="' + J('M' + (x - 2.4) + ' 51 L' + (x - 2.5) + ' 33 L' + (x + 2.4) + ' 33 L' + (x + 2.5) + ' 51 Z') + '"/><path d="' + J('M' + (x - 2.4) + ' 47 L' + (x + 2.4) + ' 43 M' + (x - 2.4) + ' 41 L' + (x + 2.4) + ' 37') + '"/><path d="' + J('M' + x + ' 33 L' + x + ' 30.5') + '"/>';
      } else {
        var ch = (cd.text || '').charAt(i), dx = (r() - .5) * 1.4, dr = (r() - .5) * 5;
        g += '<g transform="translate(' + dx.toFixed(1) + ' 0) rotate(' + dr.toFixed(1) + ' ' + x.toFixed(1) + ' 48)"><text x="' + x.toFixed(1) + '" y="50" font-size="' + fs + '">' + esc(ch) + '</text></g><path d="' + J('M' + x + ' ' + (flameY + 3) + ' L' + x + ' ' + (flameY + 5.5)) + '"/>';
      }
    });
    cn += '<g class="v v' + (f + 1) + '">' + g + '</g>';
  }
  xs.forEach(function (x, i) {
    var fy = kind === 'plain' ? 30.5 : flameY + 3;
    fl += '<g transform="translate(' + x.toFixed(1) + ' ' + fy.toFixed(1) + ')"><g class="fl" style="animation-delay:' + (-i * .27).toFixed(2) + 's"><g class="gs" style="animation-delay:' + (-1.2 - i * 1.15).toFixed(2) + 's"><path d="M0 0 C-4.6 -3.6 -3.2 -9.6 0 -14.5 C3.2 -9.6 4.6 -3.6 0 0 Z"/></g></g></g>';
  });
  var bites = BITES.map(function (b, i) { return '<circle class="bite" data-i="' + i + '" cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '"/>'; }).join('');
  return '<svg class="cake-svg" viewBox="0 0 100 100" aria-hidden="true"><defs><mask id="bm" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><rect x="-30" y="-30" width="160" height="160" fill="#fff"/>' + bites + '</mask></defs>' +
    '<g class="plate">' + plate + '</g><g mask="url(#bm)"><g class="cb">' + cb + '</g></g><g class="candles">' + cn + '<g class="flames">' + fl + '</g></g><g class="smoke"></g></svg>';
}

/* ---------- สร้างชิ้นของ ---------- */
function bodyOf(it) {
  switch (it.t) {
    case 'text': return '<span>' + esc(it.tx) + '</span>';
    case 'photo': return '<div class="phf">' + artSVG('frame') + '<img alt="" src="' + esc(PH[it.ph] || '') + '"></div>';
    case 'cake': return cakeSVG(B.candle);
    case 'env': return '<div class="envbox">' + artSVG('envBack') + '<div class="pw"><div class="paper"></div></div>' + artSVG('envFront') + '</div>';
    default: return artSVG(it.t);
  }
}
function mkItem(it) {
  var d = document.createElement('div');
  d.className = 'it'; d.dataset.id = it.id; d.dataset.t = it.t;
  place(d, it);
  d.style.setProperty('--d', (-(Math.random() * 3.4)).toFixed(2) + 's');
  d.innerHTML = '<div class="idle"><div class="tp">' + bodyOf(it) + '</div></div>';
  return d;
}
function place(d, it) { d.style.left = it.x + '%'; d.style.top = it.y + '%'; d.style.setProperty('--s', it.s); d.style.setProperty('--r', it.r + 'deg'); }
var VIRT = { L: [1280, 720], P: [390, 780] };
function setU(W, H) { var u = Math.min(W, H) / 100; stage.style.setProperty('--u', u + 'px'); document.documentElement.style.setProperty('--u', u + 'px'); }
var cur = { orient: 'L', items: [] };
function pickOrient() { return (window.innerWidth < window.innerHeight && B.P) ? 'P' : 'L'; }
function layoutOf(o) { return B[o] || B.L; }
function renderStage() {
  stage.innerHTML = '';
  var arr = layoutOf(cur.orient);
  arr.forEach(function (it) { stage.appendChild(mkItem(it)); });
}

/* ---------- เสียง/เอฟเฟกต์เล็กๆ ---------- */
var AC = null;
function ac() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { AC = null; } return AC; }
function beep(f, t, v) { var a = ac(); if (!a) return; var o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.value = v || .05; o.connect(g); g.connect(a.destination); var n = a.currentTime; g.gain.setValueAtTime(v || .05, n); g.gain.exponentialRampToValueAtTime(.0001, n + (t || .25)); o.start(n); o.stop(n + (t || .25)); }
function puff() { var a = ac(); if (!a) return; var len = a.sampleRate * .35, b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2); var s = a.createBufferSource(); s.buffer = b; var f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; var g = a.createGain(); g.gain.value = .22; s.connect(f); f.connect(g); g.connect(a.destination); s.start(); }
var SYM = {
  heart: '<svg viewBox="0 0 100 100"><path class="f" d="M50 84 C18 62 8 40 20 26 C31 14 46 19 50 31 C54 19 69 14 80 26 C92 40 82 62 50 84"/></svg>',
  star: '<svg viewBox="0 0 100 100"><path d="M50 8 L61 38 L93 39 L67 58 L77 91 L50 71 L23 91 L33 58 L7 39 L39 38 Z"/></svg>',
  dot: '<svg viewBox="0 0 100 100"><path d="M30 50 L70 50 M50 30 L50 70"/></svg>'
};
function burst(x, y, kind, n, spread) {
  var i, e, a, dist, sz;
  for (i = 0; i < (n || 6); i++) {
    e = document.createElement('i'); e.innerHTML = SYM[kind === 'mix' ? (i % 2 ? 'star' : 'heart') : (kind || 'heart')];
    sz = 14 + Math.random() * 16; e.style.width = e.style.height = sz + 'px'; e.style.left = x + 'px'; e.style.top = y + 'px';
    fx.appendChild(e); a = -Math.PI / 2 + (Math.random() - .5) * (spread || 2.4); dist = 50 + Math.random() * 90;
    (function (el) {
      var an = el.animate([{ transform: 'translate(0,0) scale(.3) rotate(0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * dist + 'px,' + (Math.sin(a) * dist - 20) + 'px) scale(1) rotate(' + ((Math.random() - .5) * 90) + 'deg)', opacity: 1, offset: .7 }, { transform: 'translate(' + Math.cos(a) * dist * 1.1 + 'px,' + (Math.sin(a) * dist - 50) + 'px) scale(.8)', opacity: 0 }], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.3,1)' });
      an.onfinish = function () { el.remove(); };
    })(e);
  }
}
function crumbs(x, y) {
  for (var i = 0; i < 9; i++) {
    var e = document.createElement('i'), s = 5 + Math.random() * 7; e.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + s + 'px;height:' + s + 'px;border-radius:50%;background:#e8c9a0;border:1.6px solid #2b2723;margin:0';
    fx.appendChild(e); var dx = (Math.random() - .5) * 120, dy = 30 + Math.random() * 90;
    (function (el) { var an = el.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + (-30 - Math.random() * 30) + 'px)', opacity: 1, offset: .3 }, { transform: 'translate(' + dx * 1.2 + 'px,' + dy + 'px)', opacity: 0 }], { duration: 800 + Math.random() * 400, easing: 'ease-in' }); an.onfinish = function () { el.remove(); }; })(e);
  }
}
function tapAnim(el, cls) { var tp = $('.tp', el); if (!tp) return; tp.classList.remove('squish', 'spin', 'hop', 'shake'); void tp.offsetWidth; tp.classList.add(cls); setTimeout(function () { tp.classList.remove(cls); }, 900); }
function ctr(el) { var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }

/* ====================== ฝั่งผู้รับ: แตะของแล้วมีอนิเมชั่น ====================== */
var state = { blown: false, bites: 0, floating: null };
function setHint(t) { hint.textContent = t || ''; hint.classList.toggle('on', !!t); }

function blow(el) {
  if (state.blown) return;
  state.blown = true; el.classList.add('blown'); puff();
  var r = el.getBoundingClientRect(), sm = $('.smoke', el);
  $$('.flames > g', el).forEach(function (g, i) {
    var m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(g.getAttribute('transform') || ''); if (!m || !sm) return;
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', 'M' + m[1] + ' ' + m[2] + ' C' + (+m[1] - 4) + ' ' + (m[2] - 5) + ' ' + (+m[1] + 4) + ' ' + (m[2] - 9) + ' ' + m[1] + ' ' + (m[2] - 14));
    sm.appendChild(p);
    var a = p.animate([{ transform: 'translateY(0)', opacity: .9 }, { transform: 'translateY(-16px)', opacity: 0 }], { duration: 1300 + i * 120, easing: 'ease-out' }); a.onfinish = function () { p.remove(); };
  });
  burst(r.left + r.width / 2, r.top + r.height * .3, 'mix', 9);
  setHint('');
  setTimeout(function () { if (!state.floating) setHint('แตะเค้กเพื่อกินสิ'); }, 1500);
}
function eat(el) {
  var bs = $$('.bite', el); if (state.bites >= bs.length) return;
  var b = bs[state.bites], r = el.getBoundingClientRect();
  var cx = r.left + r.width * (+b.getAttribute('cx')) / 100, cy = r.top + r.height * (+b.getAttribute('cy')) / 100;
  if (state.bites === bs.length - 1) { cx = r.left + r.width / 2; cy = r.top + r.height * .7; }
  b.classList.add('on'); state.bites++; tapAnim(el, 'squish'); crumbs(cx, cy); beep(420 + state.bites * 40, .12, .04);
  if (state.bites >= bs.length) {
    setTimeout(function () { burst(cx, cy, 'mix', 12, 3.6); }, 350);
    setHint('สุขสันต์วันเกิดนะ ♡');
  } else setHint('');
}
function cakeTap(el, ev) {
  var r = el.getBoundingClientRect(), ry = (ev.clientY - r.top) / r.height;
  if (!state.blown) { if (ry < .56) blow(el); else { tapAnim(el, 'shake'); setHint('เป่าเทียนก่อนนะ — แตะที่เทียน'); } return; }
  eat(el);
}

function closeFloating() {
  var f = state.floating; if (!f) return;
  state.floating = null; dim.classList.remove('on'); f.ghost.classList.remove('in');
  f.ghost.style.transform = f.back;
  setTimeout(function () { f.ghost.remove(); if (f.el) f.el.style.visibility = ''; if (f.paper) f.paper.style.visibility = ''; if (f.timer) clearInterval(f.timer); }, 780);
}
function liftPhoto(el) {
  if (state.floating) return;
  var ph = $('.phf', el), w = ph.offsetWidth, h = ph.offsetHeight, c = ctr(el), vw = innerWidth, vh = innerHeight;
  var rot = parseFloat(el.style.getPropertyValue('--r')) || 0;
  var g = document.createElement('div'); g.className = 'ghost';
  g.style.cssText = 'left:' + (c[0] - w / 2) + 'px;top:' + (c[1] - h / 2) + 'px;width:' + w + 'px;height:' + h + 'px;transition:none;transform:rotate(' + rot + 'deg)';
  g.innerHTML = ph.outerHTML + '<div class="xmark">×</div>';
  var kk = Math.min(vw * .86 / w, vh * .82 / h); $('.xmark', g).style.transform = 'translate(50%,-50%) scale(' + (1 / kk) + ')';
  document.body.appendChild(g); el.style.visibility = 'hidden'; void g.offsetWidth;
  var k = Math.min(vw * .86 / w, vh * .82 / h), back = 'rotate(' + rot + 'deg)';
  g.style.transition = ''; g.style.transform = 'translate(' + (vw / 2 - c[0]) + 'px,' + (vh / 2 - c[1]) + 'px) scale(' + k + ') rotate(' + (rot * .12) + 'deg)';
  g.classList.add('in'); dim.classList.add('on'); setHint('');
  $('.xmark', g).addEventListener('click', function (e) { e.stopPropagation(); closeFloating(); });
  state.floating = { ghost: g, el: el, back: back };
}
function readLetter(box) {
  if (state.floating) return;
  var paper = $('.paper', box), a = paper.getBoundingClientRect(), b = $('.pw', box).getBoundingClientRect();
  var L = Math.max(a.left, b.left), T = Math.max(a.top, b.top), R = Math.min(a.right, b.right), Bt = Math.min(a.bottom, b.bottom);
  var vw = innerWidth, vh = innerHeight, W = Math.min(vw * .92, Math.max(300, vh * .76));
  var fs = Math.max(17, Math.min(25, W / 22)), lh = Math.round(fs * 1.55);
  var cpl = Math.max(8, (W * .8) / (fs * .56)), est = 3; String(LT.text || '').split('\n').forEach(function (ln) { est += Math.max(1, Math.ceil(ln.length / cpl)); });
  var H = Math.max(Math.min(vh * .88, W * 1.3), 0); H = Math.min(vh * .88, Math.max(W * .62, est * lh + 70));
  var g = document.createElement('div'); g.className = 'ghost';
  g.style.cssText = 'left:' + (vw - W) / 2 + 'px;top:' + (vh - H) / 2 + 'px;width:' + W + 'px;height:' + H + 'px;transition:none;transform:translate(' + ((L + R) / 2 - vw / 2) + 'px,' + ((T + Bt) / 2 - vh / 2) + 'px) scale(' + Math.max(.05, (R - L) / W) + ',' + Math.max(.05, (Bt - T) / H) + ') rotate(-1.5deg)';
  g.innerHTML = '<div class="bigpaper" style="--fs:' + fs + 'px;--lh:' + lh + 'px"><div class="to"></div><div class="bd"></div><div class="sg"></div></div><div class="xmark">×</div>';
  document.body.appendChild(g); paper.style.visibility = 'hidden'; void g.offsetWidth;
  g.style.transition = ''; g.style.transform = 'none'; g.classList.add('in'); dim.classList.add('on'); setHint('');
  $('.to', g).textContent = LT.name ? 'ถึง ' + LT.name : '';
  var bd = $('.bd', g), txt = String(LT.text || ''), spans = [], i = 0;
  txt.split('\n').forEach(function (ln, li) {
    if (li) bd.appendChild(document.createTextNode('\n'));
    for (i = 0; i < ln.length; i += 5) { var sp = document.createElement('span'); sp.textContent = ln.slice(i, i + 5); bd.appendChild(sp); spans.push(sp); }
  });
  var sg = $('.sg', g); sg.textContent = LT.sign || '';
  var n = 0, step = Math.max(14, Math.min(70, 4200 / Math.max(1, spans.length)));
  var f = { ghost: g, paper: paper, back: 'translate(' + ((L + R) / 2 - vw / 2) + 'px,' + ((T + Bt) / 2 - vh / 2) + 'px) scale(' + Math.max(.05, (R - L) / W) + ',' + Math.max(.05, (Bt - T) / H) + ') rotate(-1.5deg)' };
  f.timer = setTimeout(function tick() { if (state.floating !== f) return; if (n < spans.length) { spans[n++].classList.add('on'); f.timer = setTimeout(tick, step); } else sg.classList.add('on'); }, 650);
  state.floating = f;
  $('.xmark', g).addEventListener('click', function (e) { e.stopPropagation(); closeFloating(); });
  g.addEventListener('click', function (e) { e.stopPropagation(); spans.forEach(function (s) { s.classList.add('on'); }); sg.classList.add('on'); n = spans.length; });
}
function envTap(el, ev) {
  var box = $('.envbox', el);
  if (!box.classList.contains('open')) { box.classList.add('open'); beep(520, .12, .03); setHint('แตะกระดาษที่โผล่ออกมาเพื่ออ่านจดหมาย'); return; }
  if (ev.target.closest('.paper')) readLetter(box); else { box.classList.remove('open'); setHint(''); }
}
function onTap(ev) {
  if (DES) return;
  var el = ev.target.closest('.it'); if (!el || state.floating) return;
  var t = el.dataset.t, c = ctr(el);
  switch (t) {
    case 'cake': cakeTap(el, ev); break;
    case 'env': envTap(el, ev); break;
    case 'photo': liftPhoto(el); break;
    case 'heart': tapAnim(el, 'squish'); burst(c[0], c[1], 'heart', 6); break;
    case 'star': case 'sparkle': tapAnim(el, 'spin'); burst(c[0], c[1], 'star', 5); beep(880, .18, .03); break;
    case 'balloon': case 'cupcake': tapAnim(el, 'hop'); break;
    case 'gift': el.classList.add('pop'); setTimeout(function () { el.classList.remove('pop'); }, 900); tapAnim(el, 'squish'); burst(c[0], c[1] - 10, 'mix', 6); break;
    case 'bear': el.classList.add('pat'); tapAnim(el, 'squish'); burst(c[0], c[1] - 30, 'heart', 4); setTimeout(function () { el.classList.remove('pat'); }, 1200); break;
    case 'note': tapAnim(el, 'hop'); beep(660, .2, .04); setTimeout(function () { beep(784, .25, .04); }, 150); break;
    default: tapAnim(el, 'shake');
  }
}
stage.addEventListener('click', onTap);
dim.addEventListener('click', closeFloating);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeFloating(); });

/* ====================== เริ่มทำงาน ====================== */
function startView() {
  var o = pickOrient(); cur.orient = o; setU(innerWidth, innerHeight); renderStage();
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { setU(innerWidth, innerHeight); var n = pickOrient(); if (n !== cur.orient && !state.floating) { cur.orient = n; renderStage(); state.blown = false; state.bites = 0; } }, 150); });
  setTimeout(function () { if (!state.blown && !state.floating) setHint('แตะเทียนเพื่อเป่า · แตะซองเพื่อเปิดอ่าน'); }, 1600);
  var ob = C.owner;
  if (ob) {
    var bar = document.createElement('div'); bar.className = 'ownbar';
    bar.innerHTML = '<span class="note">ตัวอย่างก่อนชำระเงิน</span><a href="/design/' + encodeURIComponent(ob.slug) + '">✏️ จัดฉากต่อ</a><a href="/dashboard">Dashboard</a><button type="button" class="pay">ชำระเงิน ฿' + ob.price + ' (' + esc(ob.package) + ')</button>';
    document.body.appendChild(bar);
    $('.pay', bar).addEventListener('click', function () { payNow(ob.slug, this); });
  }
}
function payNow(slug, btn) {
  btn.disabled = true;
  fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: slug, kind: 'new' }) })
    .then(function (r) { return r.json().then(function (d) { return [r.ok, d]; }); })
    .then(function (x) { if (x[0]) location.href = x[1].pay_url; else { alert(x[1].message || 'เกิดข้อผิดพลาด'); btn.disabled = false; } })
    .catch(function () { alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'); btn.disabled = false; });
}

/* ====================== ฝั่งผู้ส่ง: ตัวจัดฉาก (แถบด้านขวา) ====================== */
var DEC = [['heart', 'หัวใจ'], ['star', 'ดาว'], ['gift', 'ของขวัญ'], ['balloon', 'ลูกโป่ง'], ['flower', 'ดอกไม้'], ['bear', 'หมี'], ['cloud', 'เมฆ'], ['note', 'โน้ต'], ['bow', 'โบว์'], ['sparkle', 'ประกาย'], ['cupcake', 'คัพเค้ก'], ['hat', 'หมวก']];
var DEF_S = { heart: 8, star: 7, gift: 12, balloon: 11, flower: 11, bear: 13, cloud: 14, note: 8, bow: 10, sparkle: 7, cupcake: 10, hat: 10, text: 12, photo: 22 };
var MAX_ITEMS = 60;
function initDesign() {
  var S = { sel: null, orient: pickOrient(), dirty: false, timer: null, saving: false };
  var mobile = function () { return innerWidth <= 820; };
  if (!B.P) { B.P = JSON.parse(JSON.stringify(B.L)); }
  var side = document.createElement('div'); side.className = 'side';
  side.innerHTML =
    '<div class="head" id="sh"><h3>🎂 จัดฉากการ์ดวันเกิด</h3><span class="st" id="st">บันทึกแล้ว ✓</span></div>' +
    '<div class="sc">' +
    '<div class="sec"><b>มุมมองที่กำลังจัด (ผู้รับจะเห็นตามขนาดจอของเขา)</b><div class="seg" id="ori"><button data-o="L">🖥 จอแนวนอน</button><button data-o="P">📱 จอแนวตั้ง</button></div><small>ทั้งสองแบบจัดแยกกันได้ จัดแนวตั้งไว้ให้คนที่เปิดในมือถือ</small></div>' +
    '<div class="sec"><b>🕯 เทียนบนเค้ก</b><div class="seg" id="ck"><button data-k="plain">เทียนธรรมดา</button><button data-k="num">เลขอายุ</button><button data-k="abc">ตัวอักษร</button></div><div id="cn" style="margin-top:8px"></div></div>' +
    '<div class="sec"><b>✨ ของตกแต่ง — แตะเพื่อเพิ่ม หรือลากไปวางในฉาก</b><div class="pal" id="pal"></div></div>' +
    '<div class="sec"><b>✏️ ข้อความ (เขียนอะไรก็ได้ ไม่จำกัด)</b><input id="tx" type="text" maxlength="100" placeholder="เช่น Happy Birthday"><button class="btn wide" id="addTx" type="button">+ เพิ่มข้อความลงฉาก</button></div>' +
    '<div class="sec"><b>🖼 รูปภาพ — แตะรูปเพื่อวางกรอบรูปลงฉาก</b><div class="pg" id="pg"></div><small id="pgn"></small></div>' +
    '<div class="sec"><b>💌 จดหมายในซอง</b><input id="nm" type="text" maxlength="60" placeholder="ชื่อผู้รับ"><textarea id="lt" maxlength="3000" placeholder="ข้อความที่อยากบอก" style="margin-top:6px"></textarea><input id="sg" type="text" maxlength="60" placeholder="ลงชื่อผู้ส่ง" style="margin-top:6px"></div>' +
    '</div><div class="foot"><button class="btn" id="vw" type="button">👁 ดูแบบที่ผู้รับเห็น</button>' +
    (C.design.draft ? '<button class="btn main" id="pay" type="button">ชำระเงิน ฿' + C.design.price + '</button>' : '<a class="btn" id="live" href="/dashboard">กลับ Dashboard</a>') +
    (C.design.draft ? '<a class="btn" href="/dashboard" style="text-align:center;text-decoration:none">กลับ Dashboard</a>' : '') + '</div>';
  document.body.appendChild(side);
  var tools = document.createElement('div'); tools.className = 'tools';
  tools.innerHTML = '<button data-a="sm" aria-label="เล็กลง">－</button><button data-a="lg" aria-label="ใหญ่ขึ้น">＋</button><button data-a="rl" aria-label="หมุนซ้าย">⟲</button><button data-a="rr" aria-label="หมุนขวา">⟳</button><button data-a="up" aria-label="นำมาไว้หน้า">▲</button><button data-a="dn" aria-label="ส่งไปไว้หลัง">▼</button><button data-a="ed" aria-label="แก้ไข">✎</button><button class="del" data-a="del" aria-label="ลบ">🗑</button>';
  document.body.appendChild(tools);

  function lay() { return B[S.orient]; }
  function find(id) { return lay().filter(function (i) { return i.id === id; })[0]; }
  function status(t, bad) { var s = $('#st'); s.textContent = t; s.className = 'st' + (bad ? ' bad' : ''); }
  function save() {
    S.dirty = true; status('กำลังบันทึก…'); clearTimeout(S.timer);
    S.timer = setTimeout(flush, 700);
  }
  function flush() {
    clearTimeout(S.timer);
    if (!S.dirty) return Promise.resolve(true);
    S.dirty = false;
    var body = { board: B, partner_name: $('#nm').value.trim(), letter_text: $('#lt').value.trim(), letter_sign: $('#sg').value.trim() };
    return fetch('/api/sites/' + encodeURIComponent(C.design.slug) + '/board', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (d) { return [r.ok, d]; }); })
      .then(function (x) { if (x[0]) { if (!S.dirty) status('บันทึกแล้ว ✓'); return true; } status(x[1].message || 'บันทึกไม่สำเร็จ', true); return false; })
      .catch(function () { S.dirty = true; status('เชื่อมต่อไม่ได้ ลองใหม่…', true); return false; });
  }
  window.addEventListener('pagehide', function () { if (S.dirty) { try { fetch('/api/sites/' + encodeURIComponent(C.design.slug) + '/board', { method: 'PUT', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ board: B, partner_name: $('#nm').value.trim(), letter_text: $('#lt').value.trim(), letter_sign: $('#sg').value.trim() }) }); } catch (e) {} } });

  /* --- วางสเตจ (ขนาดเสมือนจอผู้รับ ย่อให้พอดีพื้นที่ที่เหลือ) --- */
  var availW = 0;
  function fitStage() {
    var vw = VIRT[S.orient][0], vh = VIRT[S.orient][1], mob = mobile();
    var sideH = mob ? (side.classList.contains('min') ? 52 : Math.round(innerHeight * .46)) : 0;
    availW = mob ? innerWidth : innerWidth - 320; var availH = innerHeight - sideH;
    var k = Math.min(availW * .94 / vw, availH * .93 / vh);
    stage.style.width = vw + 'px'; stage.style.height = vh + 'px'; stage.style.transform = 'scale(' + k + ')';
    stage.style.left = (availW - vw * k) / 2 + 'px'; stage.style.top = (availH - vh * k) / 2 + 'px';
    setU(vw, vh); S.k = k;
    tools.style.left = availW / 2 + 'px'; tools.style.transform = 'translateX(-50%)';
    tools.classList.toggle('min', mob && side.classList.contains('min'));
  }
  function draw() { cur.orient = S.orient; stage.innerHTML = ''; lay().forEach(function (it) { stage.appendChild(mkItem(it)); }); fitStage(); select(null); }
  function elOf(id) { return $('.it[data-id="' + id + '"]', stage); }
  function rerender(it) { var o = elOf(it.id), n = mkItem(it); if (o) { n.className = o.className; o.replaceWith(n); } else stage.appendChild(n); }
  function select(id) {
    S.sel = id; $$('.it.sel', stage).forEach(function (e) { e.classList.remove('sel'); });
    if (!id) { tools.classList.remove('on'); return; }
    var e = elOf(id); if (e) e.classList.add('sel');
    var it = find(id); tools.classList.add('on');
    $('.del', tools).style.display = (it && (it.t === 'cake' || it.t === 'env')) ? 'none' : '';
    $('[data-a=ed]', tools).style.display = (it && (it.t === 'text' || it.t === 'photo')) ? '' : 'none';
  }
  function addItem(t, x, y, extra) {
    if (lay().length >= MAX_ITEMS) { alert('ใส่ของได้สูงสุด ' + MAX_ITEMS + ' ชิ้นต่อฉาก'); return; }
    var it = { id: t.slice(0, 3) + Math.random().toString(36).slice(2, 7), t: t, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, s: DEF_S[t] || 8, r: Math.round((Math.random() - .5) * 16) };
    for (var k in extra) it[k] = extra[k];
    lay().push(it); stage.appendChild(mkItem(it)); select(it.id); save();
  }
  function stagePos(cx, cy) { var r = stage.getBoundingClientRect(); return [(cx - r.left) / r.width * 100, (cy - r.top) / r.height * 100]; }

  /* --- ลาก/เลือกของบนสเตจ --- */
  var drag = null;
  stage.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('.it');
    if (!el) { select(null); return; }
    var it = find(el.dataset.id); if (!it) return;
    select(it.id); var p = stagePos(e.clientX, e.clientY);
    drag = { it: it, el: el, ox: it.x - p[0], oy: it.y - p[1], moved: false, id: e.pointerId };
    try { stage.setPointerCapture(e.pointerId); } catch (x) {}
    e.preventDefault();
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var p = stagePos(e.clientX, e.clientY);
    drag.it.x = Math.max(-5, Math.min(105, Math.round((p[0] + drag.ox) * 10) / 10)); drag.it.y = Math.max(-5, Math.min(105, Math.round((p[1] + drag.oy) * 10) / 10));
    drag.moved = true; drag.el.style.left = drag.it.x + '%'; drag.el.style.top = drag.it.y + '%';
  });
  function endDrag(e) { if (drag && e.pointerId === drag.id) { if (drag.moved) save(); drag = null; } }
  stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);

  /* --- แถบเครื่องมือของชิ้นที่เลือก --- */
  tools.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !S.sel) return;
    var it = find(S.sel); if (!it) return; var a = b.dataset.a, arr = lay(), i = arr.indexOf(it);
    if (a === 'sm') it.s = Math.max(3, Math.round(it.s / 1.12 * 100) / 100);
    else if (a === 'lg') it.s = Math.min(140, Math.round(it.s * 1.12 * 100) / 100);
    else if (a === 'rl') it.r = (it.r - 12 + 360) % 360 > 180 ? (it.r - 12 + 360) % 360 - 360 : (it.r - 12 + 360) % 360;
    else if (a === 'rr') it.r = (it.r + 12) > 180 ? it.r + 12 - 360 : it.r + 12;
    else if (a === 'up') { arr.splice(i, 1); arr.push(it); stage.appendChild(elOf(it.id)); }
    else if (a === 'dn') { arr.splice(i, 1); arr.unshift(it); stage.insertBefore(elOf(it.id), stage.firstChild); }
    else if (a === 'del') { if (it.t === 'cake' || it.t === 'env') return; arr.splice(i, 1); var el = elOf(it.id); if (el) el.remove(); select(null); save(); return; }
    else if (a === 'ed') {
      if (it.t === 'text') ask('แก้ไขข้อความ', it.tx, function (v) { if (v) { it.tx = v; rerender(it); select(it.id); save(); } });
      else if (it.t === 'photo' && PH.length > 1) { it.ph = (it.ph + 1) % PH.length; rerender(it); select(it.id); save(); }
      return;
    }
    var el2 = elOf(it.id); if (el2) { place(el2, it); } save();
  });
  document.addEventListener('keydown', function (e) {
    if (!S.sel || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    var it = find(S.sel); if (!it) return; var st = e.shiftKey ? 3 : 1, ch = true;
    if (e.key === 'ArrowLeft') it.x -= st; else if (e.key === 'ArrowRight') it.x += st; else if (e.key === 'ArrowUp') it.y -= st; else if (e.key === 'ArrowDown') it.y += st;
    else if ((e.key === 'Delete' || e.key === 'Backspace') && it.t !== 'cake' && it.t !== 'env') { lay().splice(lay().indexOf(it), 1); elOf(it.id).remove(); select(null); save(); e.preventDefault(); return; } else ch = false;
    if (ch) { e.preventDefault(); place(elOf(it.id), it); save(); }
  });
  function ask(title, val, cb) {
    var m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = '<div class="box"><h4>' + esc(title) + '</h4><textarea maxlength="200">' + esc(val || '') + '</textarea><div class="row"><button type="button" class="no">ยกเลิก</button><button type="button" class="ok">ตกลง</button></div></div>';
    document.body.appendChild(m); var ta = $('textarea', m); ta.focus();
    $('.no', m).onclick = function () { m.remove(); };
    $('.ok', m).onclick = function () { var v = ta.value.trim(); m.remove(); cb(v); };
  }

  /* --- แถบด้านขวา --- */
  var pal = $('#pal');
  pal.className += ' still'; pal.innerHTML = DEC.map(function (d) { return '<div class="tile" data-t="' + d[0] + '">' + artSVG(d[0], true) + '<span class="lb">' + d[1] + '</span></div>'; }).join('');
  var pd = null;
  pal.addEventListener('pointerdown', function (e) {
    var tile = e.target.closest('.tile'); if (!tile) return;
    pd = { t: tile.dataset.t, x: e.clientX, y: e.clientY, g: null, id: e.pointerId };
  });
  window.addEventListener('pointermove', function (e) {
    if (!pd || e.pointerId !== pd.id) return;
    if (!pd.g && Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 12) { pd.g = document.createElement('div'); pd.g.className = 'dragghost still'; pd.g.innerHTML = artSVG(pd.t, true); document.body.appendChild(pd.g); }
    if (pd.g) { pd.g.style.left = e.clientX + 'px'; pd.g.style.top = e.clientY + 'px'; }
  });
  function pdEnd(e) {
    if (!pd || e.pointerId !== pd.id) return;
    var d = pd; pd = null; if (d.g) d.g.remove();
    if (d.g && e.type === 'pointerup') { var r = stage.getBoundingClientRect(); if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) { var p = stagePos(e.clientX, e.clientY); addItem(d.t, p[0], p[1]); } }
    else if (!d.g && e.type === 'pointerup') addItem(d.t, 50 + (Math.random() - .5) * 20, 45 + (Math.random() - .5) * 20);
  }
  window.addEventListener('pointerup', pdEnd); window.addEventListener('pointercancel', function () { if (pd && pd.g) pd.g.remove(); pd = null; });

  $('#addTx').addEventListener('click', function () { var v = $('#tx').value.trim(); if (!v) { $('#tx').focus(); return; } addItem('text', 50, 50, { tx: v }); $('#tx').value = ''; });
  $('#tx').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#addTx').click(); });

  /* ปุ่มสลับแนวจอ */
  function refreshOri() { $$('#ori button').forEach(function (b) { b.classList.toggle('on', b.dataset.o === S.orient); }); }
  $('#ori').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.orient = b.dataset.o; refreshOri(); draw(); });

  /* เทียน */
  function refreshCandle() {
    var c = B.candle; $$('#ck button').forEach(function (b) { b.classList.toggle('on', b.dataset.k === c.kind); });
    var h = '';
    if (c.kind === 'plain') h = '<div class="seg" id="cnn">' + [3, 4, 5].map(function (n) { return '<button data-n="' + n + '" class="' + (c.n === n ? 'on' : '') + '">' + n + ' เล่ม</button>'; }).join('') + '</div>';
    else h = '<input id="cnt" type="text" maxlength="5" value="' + esc(c.text) + '" placeholder="' + (c.kind === 'num' ? 'พิมพ์ตัวเลข เช่น 25' : 'พิมพ์ตัวอักษร A-Z เช่น LOVE') + '"><small>ใส่ได้ 1–5 ตัว (' + (c.kind === 'num' ? 'ตัวเลข 0-9' : 'ภาษาอังกฤษ A-Z') + ')</small>';
    $('#cn').innerHTML = h;
  }
  function candleChanged() { var cs = lay().filter(function (i) { return i.t === 'cake'; })[0]; if (cs) { var wasSel = S.sel; rerender(cs); if (wasSel) select(wasSel); } save(); }
  $('#ck').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var k = b.dataset.k;
    B.candle.kind = k; if (k === 'plain') { B.candle.n = B.candle.n >= 3 && B.candle.n <= 5 ? B.candle.n : 4; B.candle.text = ''; } else { B.candle.text = k === 'num' ? '25' : 'LOVE'; B.candle.n = B.candle.text.length; }
    refreshCandle(); candleChanged();
  });
  $('#cn').addEventListener('click', function (e) { var b = e.target.closest('button[data-n]'); if (!b) return; B.candle.n = +b.dataset.n; refreshCandle(); candleChanged(); });
  $('#cn').addEventListener('input', function (e) {
    if (e.target.id !== 'cnt') return;
    var v = e.target.value; v = B.candle.kind === 'num' ? v.replace(/[^0-9]/g, '') : v.replace(/[^A-Za-z]/g, '').toUpperCase(); v = v.slice(0, 5); e.target.value = v;
    if (!v) return; B.candle.text = v; B.candle.n = v.length; candleChanged();
  });

  /* รูปภาพ */
  function refreshPhotos() {
    var h = PH.map(function (u, i) { return '<div class="th" data-i="' + i + '"><img src="' + esc(u) + '" alt=""><button class="rm" type="button" data-i="' + i + '" aria-label="ลบรูป">×</button></div>'; }).join('');
    if (PH.length < C.design.max_photos) h += '<div class="th add" id="phAdd">+</div>';
    $('#pg').innerHTML = h + '<input type="file" id="phFile" accept="image/*" multiple hidden>';
    $('#pgn').textContent = 'มีรูป ' + PH.length + '/' + C.design.max_photos + ' รูป (ใส่กรอบรูปซ้ำรูปเดิมได้)';
  }
  $('#pg').addEventListener('click', function (e) {
    var rm = e.target.closest('.rm');
    if (rm) { e.stopPropagation(); delPhoto(+rm.dataset.i); return; }
    if (e.target.closest('#phAdd')) { $('#phFile').click(); return; }
    var th = e.target.closest('.th[data-i]'); if (th) addItem('photo', 50 + (Math.random() - .5) * 16, 40 + (Math.random() - .5) * 16, { ph: +th.dataset.i });
  });
  $('#pg').addEventListener('change', function (e) {
    if (e.target.id !== 'phFile' || !e.target.files.length) return;
    var fd = new FormData(); Array.prototype.forEach.call(e.target.files, function (f) { fd.append('images', f); });
    status('กำลังอัปโหลดรูป…');
    fetch('/api/sites/' + encodeURIComponent(C.design.slug) + '/images', { method: 'POST', body: fd }).then(function (r) { return r.json().then(function (d) { return [r.ok, d]; }); })
      .then(function (x) { if (x[0]) { PH = x[1].images.slice(); refreshPhotos(); status('อัปโหลดแล้ว ✓'); } else { alert(x[1].message || 'อัปโหลดไม่สำเร็จ'); status('บันทึกแล้ว ✓'); } })
      .catch(function () { alert('เชื่อมต่อไม่ได้'); });
  });
  function delPhoto(i) {
    if (!confirm('ลบรูปนี้ออกจากเว็บ? กรอบรูปที่ใช้รูปนี้จะถูกเอาออกด้วย')) return;
    fetch('/api/sites/' + encodeURIComponent(C.design.slug) + '/images/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: PH[i] }) })
      .then(function (r) { return r.json().then(function (d) { return [r.ok, d]; }); })
      .then(function (x) {
        if (!x[0]) { alert(x[1].message || 'ลบไม่สำเร็จ'); return; }
        ['L', 'P'].forEach(function (o) { B[o] = (B[o] || []).filter(function (it) { return !(it.t === 'photo' && it.ph === i); }); B[o].forEach(function (it) { if (it.t === 'photo' && it.ph > i) it.ph--; }); });
        PH = x[1].images.slice(); refreshPhotos(); draw(); save();
      });
  }

  /* จดหมาย */
  $('#nm').value = LT.name || ''; $('#lt').value = LT.text || ''; $('#sg').value = LT.sign || '';
  ['#nm', '#lt', '#sg'].forEach(function (s) { $(s).addEventListener('input', function () { LT.name = $('#nm').value.trim(); LT.text = $('#lt').value; LT.sign = $('#sg').value.trim(); save(); }); });

  /* ปุ่มล่าง */
  $('#vw').addEventListener('click', function () { var b = this; b.disabled = true; flush().then(function (ok) { if (ok) location.href = '/preview/' + encodeURIComponent(C.design.slug); else b.disabled = false; }); });
  var pay = $('#pay'); if (pay) pay.addEventListener('click', function () { var b = this; b.disabled = true; flush().then(function (ok) { if (ok) payNow(C.design.slug, b); else b.disabled = false; }); });
  $('#sh').addEventListener('click', function () { if (mobile()) { side.classList.toggle('min'); fitStage(); } });
  window.addEventListener('resize', function () { fitStage(); });

  refreshOri(); refreshCandle(); refreshPhotos(); draw();
  if ((mobile() || 'ontouchstart' in window) && !sessionStorage.getItem('dd_m')) {
    var m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = '<div class="box"><h4>💻 ธีมนี้จัดบนคอมสะดวกที่สุด</h4><p style="margin:0 0 6px">จัดบนมือถือได้ แต่หน้าจอเล็ก ของแต่ละชิ้นจะเล็กและลากยากกว่า แนะนำให้หมุนจอเป็นแนวนอน หรือใช้คอมพิวเตอร์ตอนจัดฉาก ผู้รับเปิดดูบนมือถือได้ปกติ</p><div class="row"><button type="button" class="ok">เข้าใจแล้ว</button></div></div>';
    document.body.appendChild(m); $('.ok', m).onclick = function () { try { sessionStorage.setItem('dd_m', '1'); } catch (e) {} m.remove(); };
  }
}

if (DES) initDesign(); else startView();
})();
