/* กลีบดอกไม้ร่วง (หลังเปิดเว็บ) */
(function () {
  'use strict';
  var box = document.getElementById('petalField');
  if (!box) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var low = (navigator.hardwareConcurrency || 8) <= 4;
  var colors = ['#ffb3c6', '#ff8fb0', '#ffd0dc', '#f9a8d4', '#fbcfe8', '#ffe0a8'];
  function make(n) {
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      p.className = 'fall';
      p.style.left = Math.random() * 100 + '%';
      p.style.setProperty('--c', colors[i % colors.length]);
      p.style.setProperty('--d', (9 + Math.random() * 9) + 's');
      p.style.setProperty('--w', (-Math.random() * 14) + 's');
      p.style.setProperty('--x', (Math.random() * 120 - 40) + 'px');
      var s = .6 + Math.random() * .9;
      p.style.width = 14 * s + 'px'; p.style.height = 18 * s + 'px';
      box.appendChild(p);
    }
  }
  if (reduce) return;
  document.addEventListener('tu:opening', function () { make(low ? 12 : 24); });
})();
