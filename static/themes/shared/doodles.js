/* TUARAI doodles - วาดของน่ารักลายเส้นแบบน้องหมี (ขอบฟู ไม่มีเส้นขอบทึบ) ใช้ในธีมต่างๆ */
(function () {
  'use strict';
  var LINE = '#8c5b33';
  function scal(cx, cy, rx, ry, n, k, rot) {
    k = k || .56; rot = rot || 0; var p = [], i, d;
    for (i = 0; i < n; i++) { var t = 2 * Math.PI * i / n - Math.PI / 2 + rot; p.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); }
    d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (i = 0; i < n; i++) { var a = p[i], b = p[(i + 1) % n], r = Math.hypot(b[0] - a[0], b[1] - a[1]) * k; d += ' A' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 0 1 ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1); }
    return d + 'Z';
  }
  function fz(cx, cy, rx, ry, n, fill, extra) { return '<path d="' + scal(cx, cy, rx, ry, n) + '" fill="' + fill + '" ' + (extra || '') + '/>'; }
  function svg(vb, inner, cls) { return '<svg class="doo ' + (cls || '') + '" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + inner + '</svg>'; }
  var st = function (w, o) { return 'stroke="' + LINE + '" stroke-width="' + w + '" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="' + (o || .55) + '"'; };
  var D = {};
  D.scal = scal;

  /* เปลือกหอยพัด (scallop) – สลับสีตามลำดับ */
  var SH = [['#f7c6b8', '#efa593'], ['#f6dfa6', '#e8c36f'], ['#cfe0ee', '#a9c6df'], ['#e3cdee', '#c8a8dd'], ['#bfe3d3', '#8fcab2']];
  D.shell = function (i) {
    var c = SH[i % SH.length], r = '';
    for (var k = 0; k < 7; k++) { var a = (-72 + k * 24) * Math.PI / 180; r += '<path d="M50 78 L' + (50 + 44 * Math.cos(a)).toFixed(1) + ' ' + (78 + 44 * Math.sin(a)).toFixed(1) + '" ' + st(2.2, .5) + '/>'; }
    return svg('0 0 100 100',
      '<ellipse cx="50" cy="93" rx="30" ry="4.5" fill="#7a5222" opacity=".13"/>' +
      '<path d="M50 80 C14 78 6 50 14 38 q4 -4 8 -2 q4 -8 11 -6 q5 -9 13 -6 q8 -3 13 6 q7 -2 11 6 q4 -2 8 2 C94 50 86 78 50 80Z" fill="' + c[0] + '"/>' +
      '<path d="M50 80 C30 78 24 56 30 44 q10 -14 20 -14 q10 0 20 14 C76 56 70 78 50 80Z" fill="' + c[1] + '" opacity=".35"/>' + r +
      '<path d="M36 80 q14 12 28 0 q-4 -6 -14 -6 q-10 0 -14 6z" fill="' + c[1] + '"/><ellipse cx="50" cy="78" rx="8" ry="3.6" fill="#fff" opacity=".45"/>', 'shell');
  };
  D.starfish = function (i) {
    var c = ['#f4a99a', '#f7c778'][i % 2], pts = [], k;
    for (k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 15 : 42; pts.push([50 + rr * Math.cos(a), 52 + rr * Math.sin(a)]); }
    var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') + 'Z', dots = '';
    for (k = 0; k < 5; k++) { var b = -Math.PI / 2 + k * 2 * Math.PI / 5; for (var j = 1; j < 4; j++) dots += '<circle cx="' + (50 + 10 * j * Math.cos(b)).toFixed(1) + '" cy="' + (52 + 10 * j * Math.sin(b)).toFixed(1) + '" r="' + (2.3 - j * .35).toFixed(1) + '" fill="#fff" opacity=".6"/>'; }
    return svg('0 0 100 100', '<ellipse cx="50" cy="94" rx="30" ry="4" fill="#7a5222" opacity=".12"/><path d="' + d + '" fill="' + c + '" stroke="' + c + '" stroke-width="9" stroke-linejoin="round"/>' + dots, 'shell');
  };
  D.conch = function (i) {
    var c = ['#f8d3b0', '#d8cdf0', '#c9e6e0'][i % 3];
    return svg('0 0 100 100', '<ellipse cx="50" cy="93" rx="30" ry="4.5" fill="#7a5222" opacity=".13"/>' +
      '<path d="M24 66 C16 44 34 22 58 24 C80 26 90 46 80 64 C74 76 58 82 44 80 C32 78 26 74 24 66Z" fill="' + c + '"/>' +
      '<path d="M58 24 C70 30 72 46 62 52 C54 58 44 52 46 44 C48 36 58 36 60 42" ' + st(2.6, .5) + '/>' +
      '<path d="M30 60 q14 6 30 -2 M34 70 q16 6 32 -4" ' + st(2.2, .4) + '/>' +
      '<path d="M24 66 q-10 6 -6 14 q10 2 20 -6z" fill="#f4b9a8"/>', 'shell');
  };
  D.seaitem = function (i) { return [D.shell, D.starfish, D.conch][i % 3](Math.floor(i / 3)); };

  D.crab = function () {
    var R = '#f08e7a', R2 = '#e07663';
    var claw = function (x, m) { return '<g transform="translate(' + x + ' 0) scale(' + m + ' 1)"><path d="M0 62 q-14 -6 -14 -22" ' + st(4, .0) + '/><path d="M0 60 C-10 54 -14 46 -14 38" stroke="' + R2 + '" stroke-width="5" fill="none" stroke-linecap="round"/>' + fz(-16, 26, 13, 13, 11, R) + '<path d="M-16 26 L-16 14" ' + st(2, .5) + '/></g>'; };
    var legs = ''; for (var k = 0; k < 3; k++) { legs += '<path d="M' + (30 + k * 6) + ' ' + (76 + k * 2) + ' q-16 ' + (2 + k * 4) + ' -22 ' + (14 + k * 2) + '" stroke="' + R2 + '" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M' + (90 - k * 6) + ' ' + (76 + k * 2) + ' q16 ' + (2 + k * 4) + ' 22 ' + (14 + k * 2) + '" stroke="' + R2 + '" stroke-width="4" fill="none" stroke-linecap="round"/>'; }
    return svg('0 0 120 110',
      '<ellipse cx="60" cy="102" rx="38" ry="4.5" fill="#7a5222" opacity=".13"/>' + legs +
      '<g class="claw l">' + claw(22, 1) + '</g><g class="claw r">' + claw(98, -1) + '</g>' +
      '<path d="M48 54 v-12 M72 54 v-12" stroke="' + R2 + '" stroke-width="3.5" stroke-linecap="round"/><circle cx="48" cy="38" r="6.5" fill="#fff"/><circle cx="72" cy="38" r="6.5" fill="#fff"/><circle class="pup" cx="48" cy="38" r="3.2" fill="#3b2a22"/><circle class="pup" cx="72" cy="38" r="3.2" fill="#3b2a22"/>' +
      fz(60, 74, 38, 26, 20, R) + '<ellipse cx="60" cy="82" rx="22" ry="11" fill="#f9b8a8" opacity=".6"/>' +
      '<path d="M52 72 q8 8 16 0" ' + st(2.6, .7) + '/><ellipse cx="36" cy="76" rx="6" ry="3.6" fill="#f6a090" opacity=".7"/><ellipse cx="84" cy="76" rx="6" ry="3.6" fill="#f6a090" opacity=".7"/>', 'crab');
  };

  D.bottle = function () {
    return svg('0 0 60 120', '<ellipse cx="30" cy="114" rx="20" ry="3.6" fill="#7a5222" opacity=".13"/>' +
      '<path d="M22 30 h16 v14 c10 6 14 16 14 28 v28 q0 12 -12 12 h-20 q-12 0 -12 -12 v-28 c0 -12 4 -22 14 -28z" fill="#cfe9ef" opacity=".85"/>' +
      '<rect x="22" y="16" width="16" height="16" rx="3" fill="#d6a574"/><rect x="24" y="8" width="12" height="10" rx="3" fill="#c28e5b"/>' +
      '<rect x="20" y="62" width="20" height="34" rx="4" fill="#fff6dc" transform="rotate(-6 30 80)"/><path d="M24 70 h12 M24 76 h12 M24 82 h8" ' + st(1.8, .5) + ' transform="rotate(-6 30 80)"/>' +
      '<path d="M14 70 q-2 16 2 30" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>', 'bottle');
  };

  var BAL = ['#f4a3b6', '#f7cf7a', '#9fd0e8', '#c4a8e6', '#9fd8bd', '#f8b48e'];
  D.balloon = function (i) {
    var c = BAL[i % BAL.length];
    return svg('0 0 80 130', '<path d="M40 100 q-6 10 2 18 q6 8 -2 14" stroke="#9a8466" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7" class="bstr"/>' +
      '<path d="M40 8 C16 8 6 30 8 48 C10 70 28 92 40 98 C52 92 70 70 72 48 C74 30 64 8 40 8Z" fill="' + c + '"/>' +
      '<path d="M32 98 l8 -4 l8 4 l-4 6 h-8z" fill="' + c + '"/><path d="M32 98 l8 -4 l8 4" stroke="#fff" stroke-width="0" fill="none"/>' +
      '<ellipse cx="26" cy="32" rx="6" ry="12" fill="#fff" opacity=".45" transform="rotate(22 26 32)"/>' +
      '<path d="M40 22 v-4" ' + st(0, 0) + '/><g class="bface"><circle cx="31" cy="54" r="2.6" fill="#3b2a22"/><circle cx="49" cy="54" r="2.6" fill="#3b2a22"/><path d="M36 60 q4 4.5 8 0" stroke="#3b2a22" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="25" cy="60" rx="4.4" ry="2.6" fill="#fff" opacity=".4"/><ellipse cx="55" cy="60" rx="4.4" ry="2.6" fill="#fff" opacity=".4"/></g>', 'balloon');
  };

  D.gift = function (i) {
    var c = BAL[i % BAL.length];
    return svg('0 0 80 80', '<ellipse cx="40" cy="74" rx="28" ry="4" fill="#7a5222" opacity=".13"/><rect x="12" y="34" width="56" height="38" rx="7" fill="' + c + '"/><rect x="8" y="26" width="64" height="14" rx="6" fill="' + c + '"/><rect x="8" y="26" width="64" height="14" rx="6" fill="#fff" opacity=".25"/><rect x="35" y="26" width="10" height="46" fill="#fff8e6"/><path d="M40 26 q-16 -20 -20 -8 q4 12 20 8z M40 26 q16 -20 20 -8 q-4 12 -20 8z" fill="#fff8e6"/>', 'gift');
  };

  /* หัวหมีดูหนัง (เงา) */
  D.bearHead = function (fill, big) {
    return svg('0 0 120 100', fz(28, 24, 17, 17, 12, fill) + fz(92, 24, 17, 17, 12, fill) + fz(60, 58, 50, 40, 22, fill) + '<ellipse cx="60" cy="86" rx="40" ry="14" fill="' + fill + '"/>', 'bhead');
  };

  /* ดาวเล็ก ๆ/หัวใจ/ปากกาสำหรับแต่งหน้ากระดาษ */
  D.heart = function (c) { return svg('0 0 40 36', '<path d="M20 33 C-6 16 6 -4 20 10 C34 -4 46 16 20 33Z" fill="' + (c || '#e8788c') + '"/><ellipse cx="12" cy="11" rx="3.4" ry="2.2" fill="#fff" opacity=".5" transform="rotate(-30 12 11)"/>', 'heart'); };
  D.star = function (c) { return svg('0 0 40 40', '<path d="M20 3 l5 11 l12 1.5 l-9 8 l2.8 12 l-10.8 -6.4 l-10.8 6.4 l2.8 -12 l-9 -8 l12 -1.5z" fill="' + (c || '#f4c95d') + '" stroke="' + (c || '#f4c95d') + '" stroke-width="3" stroke-linejoin="round"/>', 'star'); };
  D.paw = function (c) { c = c || '#d8b685'; return svg('0 0 48 48', fz(24, 32, 13, 11, 12, c) + fz(9, 20, 5.5, 6.5, 8, c) + fz(19, 10, 5.5, 6.5, 8, c) + fz(30, 10, 5.5, 6.5, 8, c) + fz(40, 20, 5.5, 6.5, 8, c), 'paw'); };
  D.tape = function (c) { return '<span class="tapebit" style="--tc:' + (c || '#f2d58a') + '"></span>'; };
  D.bearBig = function (k) { return ''; };
  window.TUD = D;
})();
