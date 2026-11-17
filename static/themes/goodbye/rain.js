(function () {
  'use strict';
  var P = window.TU_PHOTOS || [], DLG = (window.TU_DIALOG || [])[0] || null, CFG = window.SITE_CONFIG || {};
  var NAME = CFG.partnerName || 'เธอ';
  var Q = CFG.quests || {};
  var $ = function (id) { return document.getElementById(id); };
  var rep = function (s) { return String(s || '').replace(/\{name\}/g, NAME); };
  var gb = $('gb'), panel = $('panel'), scene = $('scene');
  var DOLL = 0;
  var TONE = Q.tone || 'soft';
  var LOW = document.documentElement.classList.contains('lowfx') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- ตุ๊กตา 4 ตัว (วาดเอง) ---------- */
  function dollSVG(i, big) {
    if (i === 0) return '';
    var s = '', eye = '<circle cx="-7" cy="-2" r="2.2" fill="#2a1b12"/><circle cx="7" cy="-2" r="2.2" fill="#2a1b12"/>';
    var tear = '<path class="tear" d="M-8 3 q-2 4 0 5 q2 -1 0 -5z" fill="#9fd8ff"/>';
    if (i === 0) { /* หมีถือร่ม (ถือด้ามด้วยมือจริง) */
      var F = '#c99a68', F2 = '#b88458', B = '#f4dfc4';
      s = '<g class="bear">' +
        /* ขา/เท้า */
        '<ellipse cx="-9" cy="41" rx="8" ry="5.2" fill="' + F2 + '"/><ellipse cx="9" cy="41" rx="8" ry="5.2" fill="' + F2 + '"/><ellipse cx="-9" cy="42" rx="4" ry="2.6" fill="#f0b8a8"/><ellipse cx="9" cy="42" rx="4" ry="2.6" fill="#f0b8a8"/>' +
        /* ตัว */
        '<ellipse cx="0" cy="25" rx="16" ry="17.5" fill="' + F + '"/><ellipse cx="0" cy="28" rx="10" ry="12" fill="' + B + '"/>' +
        '<path d="M0 33 c-5-3.6-6.6-6.6-4.4-8.6 c1.8-1.6 3.6-.6 4.4.8 c.8-1.4 2.6-2.4 4.4-.8 c2.2 2 .6 5-4.4 8.6z" fill="#d94a55"/>' +
        /* แขนซ้ายห้อยลง */
        '<path d="M-13 17 Q-22 24 -19 32" stroke="' + F + '" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="-19" cy="33" r="4.6" fill="' + F2 + '"/>' +
        /* ผ้าพันคอ */
        '<path d="M-15 12 Q0 19 15 12 L16 18 Q0 25 -16 18z" fill="#c8343f"/><path d="M-12 14.6 Q0 20.4 12 14.6" stroke="#f6b4ba" stroke-width=".9" stroke-dasharray="2 1.6" fill="none"/><path d="M7 17 l7 .8 l-2 12 l-7.2-1z" fill="#b82a37"/><path d="M8.2 20 l4.6.6 M7.6 24 l4.6.6" stroke="#f6b4ba" stroke-width=".8" stroke-dasharray="1.6 1.4"/>' +
        /* ด้ามร่ม (ด้านหลังมือ) */
        '<path d="M19 -36 V16 q0 6 -5.2 6 q-3.4 0 -3.4 -3.4" stroke="#6a4a3a" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        /* แขนขวายกจับด้าม */
        '<path d="M13 17 Q19 17 19.5 9" stroke="' + F + '" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="19" cy="7.2" r="5.2" fill="' + F + '"/><path d="M15.8 5.4 h6.4 M15.8 8.6 h6.4" stroke="' + F2 + '" stroke-width="1" stroke-linecap="round"/>' +
        /* หัว */
        '<circle cx="-14" cy="-25" r="7.4" fill="' + F + '"/><circle cx="14" cy="-25" r="7.4" fill="' + F + '"/><circle cx="-14" cy="-24.6" r="4.2" fill="#f2b5ae"/><circle cx="14" cy="-24.6" r="4.2" fill="#f2b5ae"/>' +
        '<circle cx="0" cy="-8" r="20" fill="' + F + '"/><ellipse cx="0" cy="-2.6" rx="9.6" ry="7.4" fill="' + B + '"/>' +
        '<ellipse cx="0" cy="-5.6" rx="3" ry="2" fill="#5a3322"/><path d="M0 -3.6 v1.8 M-3.4 -1 q3.4 2.8 6.8 0" stroke="#5a3322" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
        '<circle cx="-8" cy="-11" r="2.9" fill="#2a1b12"/><circle cx="8" cy="-11" r="2.9" fill="#2a1b12"/><circle cx="-7.2" cy="-12" r="1" fill="#fff"/><circle cx="8.8" cy="-12" r="1" fill="#fff"/>' +
        '<path d="M-12 -16.6 q3 -1.6 6 .2 M12 -16.6 q-3 -1.6 -6 .2" stroke="#6a4630" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
        '<circle cx="-14" cy="-4" r="3.8" fill="#f08a8a" opacity=".55"/><circle cx="14" cy="-4" r="3.8" fill="#f08a8a" opacity=".55"/>' +
        '<path class="tear" d="M-9 -7.4 q-2.2 4 0 5 q2.2 -1 0 -5z" fill="#a8dcff"/></g>' +
        /* ร่ม */
        '<g><path d="M-26 -34 Q6 -66 38 -34 q-4.2 4.6 -8.4 0 q-4.2 4.6 -8.4 0 q-4.2 4.6 -8.4 0 q-4.2 4.6 -8.4 0 q-4.2 4.6 -8.4 0 q-4.2 4.6 -8.4 0z" fill="#e0707a"/>' +
        '<path d="M6 -50 Q-8 -42 -17.4 -34.6 M6 -50 Q-1 -42 -9 -34.6 M6 -50 V-34.6 M6 -50 Q13 -42 21 -34.6 M6 -50 Q20 -42 29.6 -34.6" stroke="#b9474f" stroke-width="1" fill="none" opacity=".7"/>' +
        '<path d="M-14 -44 Q-4 -54 6 -53" stroke="#ffd0d4" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/><circle cx="6" cy="-51" r="1.8" fill="#6a4a3a"/></g>';
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
  var BEAR = "<ellipse cx=\"100\" cy=\"207\" rx=\"56\" ry=\"4.5\" fill=\"#7a5222\" opacity=\".14\"/><g class=\"b-all\"><path d=\"M72.0 183.0 A5.6 5.6 0 0 1 82.0 184.3 A4.9 4.9 0 0 1 90.0 187.9 A3.8 3.8 0 0 1 94.4 193.1 A3.2 3.2 0 0 1 94.4 198.9 A3.8 3.8 0 0 1 90.0 204.1 A4.9 4.9 0 0 1 82.0 207.7 A5.6 5.6 0 0 1 72.0 209.0 A5.6 5.6 0 0 1 62.0 207.7 A4.9 4.9 0 0 1 54.0 204.1 A3.8 3.8 0 0 1 49.6 198.9 A3.2 3.2 0 0 1 49.6 193.1 A3.8 3.8 0 0 1 54.0 187.9 A4.9 4.9 0 0 1 62.0 184.3 A5.6 5.6 0 0 1 72.0 183.0Z\" fill=\"#d8b685\" /><path d=\"M128.0 183.0 A5.6 5.6 0 0 1 138.0 184.3 A4.9 4.9 0 0 1 146.0 187.9 A3.8 3.8 0 0 1 150.4 193.1 A3.2 3.2 0 0 1 150.4 198.9 A3.8 3.8 0 0 1 146.0 204.1 A4.9 4.9 0 0 1 138.0 207.7 A5.6 5.6 0 0 1 128.0 209.0 A5.6 5.6 0 0 1 118.0 207.7 A4.9 4.9 0 0 1 110.0 204.1 A3.8 3.8 0 0 1 105.6 198.9 A3.2 3.2 0 0 1 105.6 193.1 A3.8 3.8 0 0 1 110.0 187.9 A4.9 4.9 0 0 1 118.0 184.3 A5.6 5.6 0 0 1 128.0 183.0Z\" fill=\"#d8b685\" /><ellipse cx=\"72\" cy=\"198\" rx=\"9\" ry=\"6\" fill=\"#f4e3c3\"/><ellipse cx=\"128\" cy=\"198\" rx=\"9\" ry=\"6\" fill=\"#f4e3c3\"/><g class=\"arm-orig\" transform=\"rotate(24 44 150)\"><path d=\"M44.0 123.0 A3.9 3.9 0 0 1 50.5 125.7 A5.1 5.1 0 0 1 55.7 133.2 A6.3 6.3 0 0 1 58.6 144.0 A6.7 6.7 0 0 1 58.6 156.0 A6.3 6.3 0 0 1 55.7 166.8 A5.1 5.1 0 0 1 50.5 174.3 A3.9 3.9 0 0 1 44.0 177.0 A3.9 3.9 0 0 1 37.5 174.3 A5.1 5.1 0 0 1 32.3 166.8 A6.3 6.3 0 0 1 29.4 156.0 A6.7 6.7 0 0 1 29.4 144.0 A6.3 6.3 0 0 1 32.3 133.2 A5.1 5.1 0 0 1 37.5 125.7 A3.9 3.9 0 0 1 44.0 123.0Z\" fill=\"#d8b685\" /><path d=\"M38 154 q4 6 0 12\" stroke=\"#8c5b33\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" opacity=\".6\"/></g><g class=\"arm-orig\" transform=\"rotate(-42 154 124)\"><path d=\"M154.0 97.0 A3.9 3.9 0 0 1 160.5 99.7 A5.1 5.1 0 0 1 165.7 107.2 A6.3 6.3 0 0 1 168.6 118.0 A6.7 6.7 0 0 1 168.6 130.0 A6.3 6.3 0 0 1 165.7 140.8 A5.1 5.1 0 0 1 160.5 148.3 A3.9 3.9 0 0 1 154.0 151.0 A3.9 3.9 0 0 1 147.5 148.3 A5.1 5.1 0 0 1 142.3 140.8 A6.3 6.3 0 0 1 139.4 130.0 A6.7 6.7 0 0 1 139.4 118.0 A6.3 6.3 0 0 1 142.3 107.2 A5.1 5.1 0 0 1 147.5 99.7 A3.9 3.9 0 0 1 154.0 97.0Z\" fill=\"#d8b685\" /><path d=\"M148 128 q4 6 0 12\" stroke=\"#8c5b33\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" opacity=\".6\"/></g><path d=\"M100.0 102.0 A7.4 7.4 0 0 1 113.2 103.4 A7.3 7.3 0 0 1 125.6 107.5 A7.1 7.1 0 0 1 136.5 114.1 A6.9 6.9 0 0 1 145.3 122.7 A6.7 6.7 0 0 1 151.4 133.0 A6.5 6.5 0 0 1 154.6 144.2 A6.5 6.5 0 0 1 154.6 155.8 A6.5 6.5 0 0 1 151.4 167.0 A6.7 6.7 0 0 1 145.3 177.3 A6.9 6.9 0 0 1 136.5 185.9 A7.1 7.1 0 0 1 125.6 192.5 A7.3 7.3 0 0 1 113.2 196.6 A7.4 7.4 0 0 1 100.0 198.0 A7.4 7.4 0 0 1 86.8 196.6 A7.3 7.3 0 0 1 74.4 192.5 A7.1 7.1 0 0 1 63.5 185.9 A6.9 6.9 0 0 1 54.7 177.3 A6.7 6.7 0 0 1 48.6 167.0 A6.5 6.5 0 0 1 45.4 155.8 A6.5 6.5 0 0 1 45.4 144.2 A6.5 6.5 0 0 1 48.6 133.0 A6.7 6.7 0 0 1 54.7 122.7 A6.9 6.9 0 0 1 63.5 114.1 A7.1 7.1 0 0 1 74.4 107.5 A7.3 7.3 0 0 1 86.8 103.4 A7.4 7.4 0 0 1 100.0 102.0Z\" fill=\"#d8b685\" /><ellipse cx=\"100\" cy=\"160\" rx=\"31\" ry=\"28\" fill=\"#f4e3c3\"/><path transform=\"translate(100.0 170.0) scale(1.00)\" d=\"M0 7 C-12 -2 -7 -11 0 -5 C7 -11 12 -2 0 7Z\" fill=\"#c0392b\"/><path d=\"M72 150 q4 -4 8 0 M120 150 q4 -4 8 0\" stroke=\"#8c5b33\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" opacity=\".5\"/><path d=\"M53 122 Q100 148 147 122 Q153 130 149 139 Q100 165 51 139 Q47 130 53 122Z\" fill=\"#a3162f\"/><path d=\"M62 132 Q100 152 138 132\" stroke=\"#f3d7a8\" stroke-width=\"2.2\" fill=\"none\" stroke-dasharray=\"4 5\" stroke-linecap=\"round\" opacity=\".85\"/><path d=\"M112 148 l18 -3 l5 30 q-10 5 -20 1z\" fill=\"#8e1226\"/><path d=\"M114 168 h20\" stroke=\"#f3d7a8\" stroke-width=\"2\" stroke-dasharray=\"3 4\"/><g class=\"b-head\"><path d=\"M60.0 26.0 A5.2 5.2 0 0 1 69.0 28.4 A5.2 5.2 0 0 1 75.6 35.0 A5.2 5.2 0 0 1 78.0 44.0 A5.2 5.2 0 0 1 75.6 53.0 A5.2 5.2 0 0 1 69.0 59.6 A5.2 5.2 0 0 1 60.0 62.0 A5.2 5.2 0 0 1 51.0 59.6 A5.2 5.2 0 0 1 44.4 53.0 A5.2 5.2 0 0 1 42.0 44.0 A5.2 5.2 0 0 1 44.4 35.0 A5.2 5.2 0 0 1 51.0 28.4 A5.2 5.2 0 0 1 60.0 26.0Z\" fill=\"#d8b685\" /><circle cx=\"60\" cy=\"46\" r=\"8.5\" fill=\"#b98250\"/><path d=\"M140.0 26.0 A5.2 5.2 0 0 1 149.0 28.4 A5.2 5.2 0 0 1 155.6 35.0 A5.2 5.2 0 0 1 158.0 44.0 A5.2 5.2 0 0 1 155.6 53.0 A5.2 5.2 0 0 1 149.0 59.6 A5.2 5.2 0 0 1 140.0 62.0 A5.2 5.2 0 0 1 131.0 59.6 A5.2 5.2 0 0 1 124.4 53.0 A5.2 5.2 0 0 1 122.0 44.0 A5.2 5.2 0 0 1 124.4 35.0 A5.2 5.2 0 0 1 131.0 28.4 A5.2 5.2 0 0 1 140.0 26.0Z\" fill=\"#d8b685\" /><circle cx=\"140\" cy=\"46\" r=\"8.5\" fill=\"#b98250\"/><path d=\"M100.0 35.0 A7.7 7.7 0 0 1 113.6 36.4 A7.5 7.5 0 0 1 126.5 40.4 A7.3 7.3 0 0 1 137.8 46.8 A7.0 7.0 0 0 1 146.9 55.3 A6.7 6.7 0 0 1 153.3 65.3 A6.4 6.4 0 0 1 156.6 76.3 A6.3 6.3 0 0 1 156.6 87.7 A6.4 6.4 0 0 1 153.3 98.7 A6.7 6.7 0 0 1 146.9 108.7 A7.0 7.0 0 0 1 137.8 117.2 A7.3 7.3 0 0 1 126.5 123.6 A7.5 7.5 0 0 1 113.6 127.6 A7.7 7.7 0 0 1 100.0 129.0 A7.7 7.7 0 0 1 86.4 127.6 A7.5 7.5 0 0 1 73.5 123.6 A7.3 7.3 0 0 1 62.2 117.2 A7.0 7.0 0 0 1 53.1 108.7 A6.7 6.7 0 0 1 46.7 98.7 A6.4 6.4 0 0 1 43.4 87.7 A6.3 6.3 0 0 1 43.4 76.3 A6.4 6.4 0 0 1 46.7 65.3 A6.7 6.7 0 0 1 53.1 55.3 A7.0 7.0 0 0 1 62.2 46.8 A7.3 7.3 0 0 1 73.5 40.4 A7.5 7.5 0 0 1 86.4 36.4 A7.7 7.7 0 0 1 100.0 35.0Z\" fill=\"#d8b685\" /><path d=\"M92 40 q8 -7 16 0\" stroke=\"#8c5b33\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\" opacity=\".55\"/><ellipse cx=\"66\" cy=\"94\" rx=\"9\" ry=\"5.5\" fill=\"#f0a58c\" opacity=\".55\"/><ellipse cx=\"134\" cy=\"94\" rx=\"9\" ry=\"5.5\" fill=\"#f0a58c\" opacity=\".55\"/><ellipse cx=\"100\" cy=\"98\" rx=\"19\" ry=\"13.5\" fill=\"#f4e3c3\"/><path d=\"M94 91 q6 -4.5 12 0 q-1 5.5 -6 6.5 q-5 -1 -6 -6.5z\" fill=\"#4a3228\"/><g class=\"m-n\"><path d=\"M100 97.5 v3.5 M100 101 q-5 5.5 -10 1.5 M100 101 q5 5.5 10 1.5\" stroke=\"#4a3228\" stroke-width=\"2.2\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g><g class=\"eye-hh\"><path d=\"M74 83 q6 -9 12 0 M114 83 q6 -9 12 0\" stroke=\"#3b2a22\" stroke-width=\"3.2\" fill=\"none\" stroke-linecap=\"round\"/></g><g class=\"eye-n\"><g class=\"eyes\"><circle cx=\"80\" cy=\"80\" r=\"3.8\" fill=\"#3b2a22\"/><circle cx=\"120\" cy=\"80\" r=\"3.8\" fill=\"#3b2a22\"/></g></g></g><g class=\"umb\"><g transform=\"rotate(7 172 120)\"><rect x=\"169\" y=\"-12\" width=\"6\" height=\"170\" rx=\"3\" fill=\"#8a5a3a\"/><path d=\"M172 158 q0 10 -9 10 q-7 0 -7 -7\" stroke=\"#8a5a3a\" stroke-width=\"6\" fill=\"none\" stroke-linecap=\"round\"/></g></g><path class=\"arm-orig\" d=\"M166.0 111.0 A3.8 3.8 0 0 1 172.5 113.1 A3.8 3.8 0 0 1 176.5 118.6 A3.8 3.8 0 0 1 176.5 125.4 A3.8 3.8 0 0 1 172.5 130.9 A3.8 3.8 0 0 1 166.0 133.0 A3.8 3.8 0 0 1 159.5 130.9 A3.8 3.8 0 0 1 155.5 125.4 A3.8 3.8 0 0 1 155.5 118.6 A3.8 3.8 0 0 1 159.5 113.1 A3.8 3.8 0 0 1 166.0 111.0Z\" fill=\"#d8b685\" /></g><path class=\"tear\" d=\"M70 92 q-6 11 0 14 q6 -3 0 -14z\" fill=\"#a8dcff\" stroke=\"#6fb5e8\" stroke-width=\"1.2\"/><g class=\"umb\"><g transform=\"rotate(7 172 120) translate(6 0)\"><path d=\"M96 14 Q166 -50 236 14 q-10 10 -20 0 q-10 10 -20 0 q-10 10 -20 0 q-10 10 -20 0 q-10 10 -20 0 q-10 10 -20 0 q-10 10 -20 0z\" fill=\"#d94a55\"/><path d=\"M166 -17 Q126 0 104 12 M166 -17 Q146 0 132 13 M166 -17 V14 M166 -17 Q186 0 200 13 M166 -17 Q206 0 228 12\" stroke=\"#a3162f\" stroke-width=\"2.2\" fill=\"none\" opacity=\".6\"/><path d=\"M114 8 Q130 -6 156 -10\" stroke=\"#ffc9ce\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\" opacity=\".5\"/><circle cx=\"166\" cy=\"-19\" r=\"4\" fill=\"#8a5a3a\"/></g></g><g class=\"hug-arms\"><g transform=\"translate(55,125)\"><g class=\"hl\" style=\"transform-origin:0 0\"><g transform=\"translate(-55,-125)\"><g transform=\"rotate(24 44 150)\"><path d=\"M44.0 123.0 A3.9 3.9 0 0 1 50.5 125.7 A5.1 5.1 0 0 1 55.7 133.2 A6.3 6.3 0 0 1 58.6 144.0 A6.7 6.7 0 0 1 58.6 156.0 A6.3 6.3 0 0 1 55.7 166.8 A5.1 5.1 0 0 1 50.5 174.3 A3.9 3.9 0 0 1 44.0 177.0 A3.9 3.9 0 0 1 37.5 174.3 A5.1 5.1 0 0 1 32.3 166.8 A6.3 6.3 0 0 1 29.4 156.0 A6.7 6.7 0 0 1 29.4 144.0 A6.3 6.3 0 0 1 32.3 133.2 A5.1 5.1 0 0 1 37.5 125.7 A3.9 3.9 0 0 1 44.0 123.0Z\" fill=\"#d8b685\" /><path d=\"M38 154 q4 6 0 12\" stroke=\"#8c5b33\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" opacity=\".6\"/><g class=\"pad\" opacity=\"0\"><ellipse cx=\"44\" cy=\"165\" rx=\"7.6\" ry=\"6.4\" fill=\"#d9a877\"/><circle cx=\"36.8\" cy=\"157.2\" r=\"2.5\" fill=\"#d9a877\"/><circle cx=\"44\" cy=\"154.6\" r=\"2.5\" fill=\"#d9a877\"/><circle cx=\"51.2\" cy=\"157.2\" r=\"2.5\" fill=\"#d9a877\"/></g></g></g></g></g><g transform=\"translate(145,125)\"><g class=\"hr\" style=\"transform-origin:0 0\"><g transform=\"translate(-145,-125)\"><g transform=\"translate(200,0) scale(-1,1)\"><g transform=\"rotate(24 44 150)\"><path d=\"M44.0 123.0 A3.9 3.9 0 0 1 50.5 125.7 A5.1 5.1 0 0 1 55.7 133.2 A6.3 6.3 0 0 1 58.6 144.0 A6.7 6.7 0 0 1 58.6 156.0 A6.3 6.3 0 0 1 55.7 166.8 A5.1 5.1 0 0 1 50.5 174.3 A3.9 3.9 0 0 1 44.0 177.0 A3.9 3.9 0 0 1 37.5 174.3 A5.1 5.1 0 0 1 32.3 166.8 A6.3 6.3 0 0 1 29.4 156.0 A6.7 6.7 0 0 1 29.4 144.0 A6.3 6.3 0 0 1 32.3 133.2 A5.1 5.1 0 0 1 37.5 125.7 A3.9 3.9 0 0 1 44.0 123.0Z\" fill=\"#d8b685\" /><path d=\"M38 154 q4 6 0 12\" stroke=\"#8c5b33\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" opacity=\".6\"/><g class=\"pad\" opacity=\"0\"><ellipse cx=\"44\" cy=\"165\" rx=\"7.6\" ry=\"6.4\" fill=\"#d9a877\"/><circle cx=\"36.8\" cy=\"157.2\" r=\"2.5\" fill=\"#d9a877\"/><circle cx=\"44\" cy=\"154.6\" r=\"2.5\" fill=\"#d9a877\"/><circle cx=\"51.2\" cy=\"157.2\" r=\"2.5\" fill=\"#d9a877\"/></g></g></g></g></g></g></g>";
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
    /* ตัวถ่วงตุ๊กตาสำรองข้างราว (จดหมายพับ) */
    h += '<g transform="translate(300,392) rotate(-8)"><rect x="-16" y="-10" width="32" height="20" fill="#f1e6cf"/><path d="M-16 -10 l16 12 l16 -12" stroke="#c9b48a" fill="none" stroke-width="1.5"/></g>';
    h += '<g transform="translate(96,398)"><rect x="-12" y="-4" width="24" height="12" rx="2" fill="#2a1d18"/><ellipse cx="0" cy="-4" rx="12" ry="3" fill="#3b2a22"/><path d="M-2 -4 q-4 -16 -10 -14 M2 -4 q6 -18 12 -14" stroke="#2e5a3c" stroke-width="2" fill="none"/></g>';
    scene.innerHTML = h;
  })();
  var SKIN = ['#c99a68', '#f8f1f4', '#6b6478', '#ffe27f'];
  var stage = $('stage'), stIn = $('stIn'), fxl = $('fxl');
  var VB = DOLL === 0 ? '0 -50 240 262' : '-34 -58 68 110';
  if (DOLL === 0) stage.style.aspectRatio = '240 / 262';
  stIn.innerHTML = '<svg viewBox="' + VB + '" style="width:100%;height:100%;overflow:visible">' + (DOLL === 0 ? BEAR : dollSVG(DOLL)) + '</svg>';
  stage.style.setProperty('--skin', SKIN[DOLL]);
  var BYE = (Q.bye && typeof Q.bye === 'object') ? Q.bye : { final: true, anims: ['hug'] };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var gArt = $('gArt'); if (gArt) gArt.innerHTML = '<svg viewBox="' + (DOLL === 0 ? '0 -50 240 262' : '-34 -56 68 108') + '">' + (DOLL === 0 ? BEAR : dollSVG(DOLL)) + '</svg>';

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
    clearInterval(typing); say.textContent = ''; stage.classList.add('talk'); var i = 0, ch = Array.from(text), sp = Math.max(18, Math.min(55, 2600 / ch.length));
    var skip = function () { clearInterval(typing); stage.classList.remove('talk'); say.textContent = text; tbox.removeEventListener('click', skip); done && done(); };
    typing = setInterval(function () { say.textContent += ch[i++]; if (i >= ch.length) { clearInterval(typing); stage.classList.remove('talk'); tbox.removeEventListener('click', skip); done && done(); } }, sp);
    tbox.addEventListener('click', skip);
  }
  function btn(label, fn, cls) { var b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (cls) b.className = cls; b.addEventListener('click', fn); opts.appendChild(b); return b; }
  function clr() { opts.classList.remove('row'); opts.innerHTML = ''; items.hidden = true; items.innerHTML = ''; }

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
    if (!DLG || !DLG.options || !DLG.options.length) return farewell();
    who.textContent = CAPT[DOLL];
    type(rep(DLG.q), function () {
      DLG.options.forEach(function (o, i) {
        btn(rep(o), function () { reply(i); });
      });
    });
  }
  function reply(i) {
    hop(); clr(); who.textContent = CAPT[DOLL];
    var r = (DLG.replies && DLG.replies[i]) || DLG.reply || '';
    type(rep(r), function () { btn('ต่อ ›', function () { farewell(); }, 'go'); });
  }


  function sizeTb() { panel.style.setProperty('--tb', (tbox.offsetHeight + 58) + 'px'); }
  if (window.ResizeObserver) new ResizeObserver(sizeTb).observe(tbox); sizeTb();
  function hop() { stage.classList.remove('hop'); void stage.offsetWidth; stage.classList.add('hop'); setTimeout(function () { stage.classList.remove('hop'); }, 700); }
  function spawn(html, cls, ms, css) { var e = document.createElement('div'); e.className = 'fx ' + cls; e.innerHTML = html; if (css) e.style.cssText = css; fxl.appendChild(e); if (ms) setTimeout(function () { e.remove(); }, ms); return e; }
  var HEART = '<svg viewBox="0 0 24 22"><path d="M12 21C-6 8 4-2 12 6c8-8 18 2 0 15z" fill="#ff7a9a"/></svg>';
  var LIPS = '<svg viewBox="0 0 60 36"><path d="M2 18 Q14 0 30 9 Q46 0 58 18 Q46 36 30 33 Q14 36 2 18z" fill="#e8456b"/><path d="M4 18 Q30 24 56 18" stroke="#9c1f3f" stroke-width="2" fill="none"/><ellipse cx="22" cy="11" rx="7" ry="2.5" fill="#fff" opacity=".35"/></svg>';
  function hearts(n, ms) { for (var i = 0; i < n; i++) (function (i) { setTimeout(function () { spawn(HEART, 'hrt', 2600, 'left:' + (15 + Math.random() * 70) + '%;--dx:' + ((Math.random() - .5) * 120) + 'px;width:' + (22 + Math.random() * 26) + 'px'); }, i * (ms / n)); })(i); }
  function near(cls, scale) { stage.style.setProperty('--ns', scale); stage.classList.add('near', cls); }
  function away(cls) { stage.classList.remove('near', cls); }
  function cap(t) { var c = spawn(t, 'cap', 0); return c; }

  function armLocal(L) {
    var F = '#d8b685', D = '#bf9660', PAD = '#c98f55', n = 10, i, k, t, r, x, h = '', rim = '', fur = '', R = function (u) { return Math.round(u * 10) / 10; };
    var cs = [];
    for (i = 0; i <= n; i++) { t = i / n; cs.push([L * t * .96, L * (.3 + .06 * t)]); }
    cs.push([L, L * .4]);
    cs.forEach(function (c) {
      var m = Math.max(10, Math.round(c[1] / (L * .028)));
      for (k = 0; k < m; k++) { var an = k / m * 6.2832, px = c[0] + Math.cos(an) * c[1], py = Math.sin(an) * c[1], sr = L * .05;
        rim += '<circle cx="' + R(px) + '" cy="' + R(py) + '" r="' + R(sr + 3) + '"/>'; fur += '<circle cx="' + R(px) + '" cy="' + R(py) + '" r="' + R(sr) + '"/>'; }
      rim += '<circle cx="' + R(c[0]) + '" cy="0" r="' + R(c[1] + 2) + '"/>'; fur += '<circle cx="' + R(c[0]) + '" cy="0" r="' + R(c[1]) + '"/>';
    });
    h += '<g fill="' + D + '">' + rim + '</g><g fill="' + F + '">' + fur + '</g>';
    /* อุ้งมือหันเข้าหาจอ */
    h += '<g fill="' + PAD + '"><ellipse cx="' + (L * 1.03) + '" cy="' + (L * .1) + '" rx="' + (L * .2) + '" ry="' + (L * .165) + '"/>';
    [-64, -22, 22, 64].forEach(function (d) { var an = (d - 90) * Math.PI / 180, cx = L * 1.02 + Math.cos(an) * L * .29, cy = L * .02 + Math.sin(an) * L * .27; h += '<ellipse cx="' + R(cx) + '" cy="' + R(cy) + '" rx="' + R(L * .068) + '" ry="' + R(L * .085) + '" transform="rotate(' + d + ' ' + R(cx) + ' ' + R(cy) + ')"/>'; });
    return h + '</g>';
  }
  function hugArms(W, H) {
    var L = Math.min(.4 * H, Math.max(.3 * W, .3 * H)), sy = .93 * H, sxl = .34 * W, sxr = .66 * W;
    var el = spawn('<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" style="position:absolute;inset:0;overflow:visible">' +
      '<g class="sl"><g transform="translate(' + sxl + ',' + sy + ') scale(-1,1)"><g class="rot">' + armLocal(L) + '</g></g></g>' +
      '<g class="sr"><g transform="translate(' + sxr + ',' + sy + ')"><g class="rot">' + armLocal(L) + '</g></g></g></svg>', 'arms', 0);
    var q = function (s) { return el.querySelector(s); };
    return { el: el, W: W, rl: q('.sl .rot'), rr: q('.sr .rot'), sl: q('.sl'), sr: q('.sr') };
  }
  function anim(e, kf, ms, o) { return e.animate(kf, Object.assign({ duration: ms, easing: 'cubic-bezier(.3,.8,.3,1)', fill: 'forwards' }, o || {})); }
  var ANIM = {
    hug: async function () {
      var svg = stIn.querySelector('svg'), hl = svg.querySelector('.hl'), hr = svg.querySelector('.hr'), pads = svg.querySelectorAll('.pad');
      var T = function (a, s, tx, ty) { return 'translate(' + (tx || 0) + 'px,' + (ty || 0) + 'px) rotate(' + a + 'deg) scale(' + s + ')'; };
      var POSE = { rest: [0, 1], open: [96, 1.4], close: [-93, .88], sq: [-89, .84] };
      var set = function (el, side, p, tx, ty) { return T(side * p[0], p[1], tx, ty); };
      hl.style.transform = T(0, 1); hr.style.transform = T(-19, 1, -9, -21);
      stage.classList.add('hug', 'walking'); var wide = panel.clientWidth > panel.clientHeight; stage.style.setProperty('--ty', wide ? '34%' : '50%'); near('hug', wide ? 3 : 2.1);
      /* วางร่ม: แขนขวาที่ถือร่มลดลง */
      anim(hr, [{ transform: T(-19, 1, -9, -21) }, { transform: T(0, 1) }], 1000, { easing: 'ease-in-out' });
      await wait(1700); stage.classList.remove('walking');
      var go = function (el, side, from, to, ms, ease) { return anim(el, [{ transform: set(el, side, from) }, { transform: set(el, side, to) }], ms, { easing: ease || 'cubic-bezier(.4,0,.2,1)' }); };
      pads.forEach(function (p) { anim(p, [{ opacity: 0 }, { opacity: 1 }], 700); });
      go(hl, 1, POSE.rest, POSE.open, 1000); go(hr, -1, POSE.rest, POSE.open, 1000);
      await wait(1100); var c0 = cap('มานี่มา…'); await wait(1000); c0.remove();
      go(hl, 1, POSE.open, POSE.close, 1100, 'cubic-bezier(.5,0,.3,1)'); go(hr, -1, POSE.open, POSE.close, 1100, 'cubic-bezier(.5,0,.3,1)');
      await wait(1000); stage.classList.add('happy', 'squeeze'); stage.style.setProperty('--ns', wide ? 3.6 : 2.5); hearts(12, 3000);
      var sq = [[hl, 1], [hr, -1]].map(function (x) { return anim(x[0], [{ transform: set(x[0], x[1], POSE.close) }, { transform: set(x[0], x[1], POSE.sq) }], 650, { direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }); });
      var c = cap('กอดแน่น ๆ นะ'); await wait(3600); c.remove(); sq.forEach(function (x) { x.cancel(); });
      stage.classList.remove('squeeze', 'happy'); stage.style.setProperty('--ns', wide ? 3 : 2.1);
      go(hl, 1, POSE.close, POSE.open, 800); go(hr, -1, POSE.close, POSE.open, 800); await wait(850);
      go(hl, 1, POSE.open, POSE.rest, 800); go(hr, -1, POSE.open, POSE.rest, 800);
      pads.forEach(function (p) { anim(p, [{ opacity: 1 }, { opacity: 0 }], 700); });
      await wait(900); away('hug'); await wait(1200); stage.classList.remove('hug');
      [hl, hr].forEach(function (e) { e.getAnimations().forEach(function (x) { x.cancel(); }); }); pads.forEach(function (p) { p.getAnimations().forEach(function (x) { x.cancel(); }); });
    },
    kiss: async function () {
      near('kiss', 2.1); await wait(1300);
      spawn(LIPS, 'lips', 1800); await wait(1100);
      spawn(LIPS, 'lipmark', 3600); stage.classList.add('back'); flash(); await wait(900);
      stage.classList.remove('back'); away('kiss'); await wait(700);
      var c = cap('จุ๊บ… ฝากไว้ตรงนี้นะ'); hearts(12, 2400); await wait(3200); c.remove();
    },
    wave: async function () {
      near('wave', 1.7); await wait(1100); var c = cap('ไปก่อนนะ… ลาก่อน'); await wait(3600); c.remove(); away('wave'); await wait(1100);
    },
    pat: async function () {
      near('pat', 1.7); await wait(1200); var c = cap('โอ๋ ๆ ไม่เป็นไรนะ'); await wait(3400); c.remove();
      stage.classList.add('walk'); away('pat'); await wait(2800); stage.classList.remove('walk');
      stage.classList.add('gone'); await wait(1000); stage.classList.remove('gone'); await wait(300);
    }
  };
  function flash() { var f = $('flash'); f.style.background = '#ffe8ef'; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); setTimeout(function () { f.style.background = ''; }, 1200); }
  async function farewell() {
    clr(); tbox.hidden = true; who.textContent = '';
    var list = (BYE.anims || []).filter(function (k) { return ANIM[k]; });
    for (var i = 0; i < list.length; i++) { try { await ANIM[list[i]](); } catch (e) {} }
    tbox.hidden = false; sizeTb();
    if (BYE.final) finalAsk(); else ending();
  }
  function finalAsk() {
    clr(); who.textContent = CAPT[DOLL]; hop();
    type('เราต้องเลิกกันแล้วนะ', function () {
      opts.classList.add('row');
      var yes = btn('ตกลง', function () { if (no.parentNode) no.remove(); ending(); }, 'go');
      var no = btn('ไม่เอา', function (e) { e.preventDefault(); dodge(); }, 'nope');
      var words = ['ไม่เอา', 'ไม่เอาาา', 'ไม่ ๆ ๆ', 'ไม่ยอม!', 'กดไม่โดนหรอก', 'นะ… ไม่เอา'], wi = 0, fled = false, spacer = null, last = { x: 0, y: 0 };
      function dodge() {
        var pr = panel.getBoundingClientRect(), bw = no.offsetWidth, bh = no.offsetHeight;
        if (!fled) { fled = true; spacer = document.createElement('div'); spacer.style.height = bh + 'px'; spacer.style.flex = '1'; opts.insertBefore(spacer, no); panel.appendChild(no); no.classList.add('flee'); last = { x: pr.width / 2, y: pr.height / 2 }; }
        var yb = yes.getBoundingClientRect(), x, y, tries = 0;
        do {
          x = 8 + Math.random() * Math.max(10, pr.width - bw - 16); y = 70 + Math.random() * Math.max(10, pr.height - bh - 90); tries++;
          var ov = x + pr.left < yb.right + 10 && x + pr.left + bw > yb.left - 10 && y + pr.top < yb.bottom + 10 && y + pr.top + bh > yb.top - 10;
          var far = Math.hypot(x - last.x, y - last.y) > 110;
        } while ((ov || !far) && tries < 25);
        last = { x: x, y: y }; no.style.left = x + 'px'; no.style.top = y + 'px';
        wi = (wi + 1) % words.length; no.textContent = words[wi];
      }
      ['pointerdown', 'pointerenter', 'mouseover', 'focus', 'touchstart'].forEach(function (ev) { no.addEventListener(ev, function (e) { if (e.cancelable) e.preventDefault(); dodge(); }, { passive: false }); });
      panel.addEventListener('pointermove', function mv(e) {
        if (!no.parentNode) { panel.removeEventListener('pointermove', mv); return; }
        if (!fled) return; var r = no.getBoundingClientRect(); if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 90) dodge();
      });
      document.addEventListener('keydown', function kd(e) { if (!no.parentNode) return document.removeEventListener('keydown', kd); if (document.activeElement === no && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); dodge(); } });
    });
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
