/* กลีบซากุระร่วง (เริ่มตั้งแต่หน้าแรก) */
(function () {
  'use strict';
  var box = document.getElementById('petalField');
  if (!box) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var low = (navigator.hardwareConcurrency || 8) <= 4, n = low ? 14 : 28;
  var colors = ['#ffc9d9', '#ffb3c9', '#ffd9e5', '#ffe4ec', '#f9b8cd'];
  for (var i = 0; i < n; i++) {
    var p = document.createElement('i');
    p.className = 'fall';
    p.style.left = Math.random() * 100 + '%';
    p.style.setProperty('--c', colors[i % colors.length]);
    p.style.setProperty('--d', (10 + Math.random() * 10) + 's');
    p.style.setProperty('--w', (-Math.random() * 16) + 's');
    p.style.setProperty('--x', (Math.random() * 140 - 50) + 'px');
    var s = .6 + Math.random() * .9;
    p.style.width = 14 * s + 'px'; p.style.height = 18 * s + 'px';
    box.appendChild(p);
  }
})();
