/* พื้นหลังดาวระยิบ + ดาวตก (canvas) */
(function () {
  'use strict';
  var cv = document.getElementById('skyCanvas');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var low = (navigator.hardwareConcurrency || 8) <= 4;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, stars = [], shoots = [], dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(W * H / (low ? 9000 : 5500));
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + .25,
        p: Math.random() * 6.28, s: Math.random() * .02 + .005, warm: Math.random() < .25 });
    }
  }
  function spawnShoot() {
    var x = Math.random() * W * .8 + W * .15, y = Math.random() * H * .35;
    shoots.push({ x: x, y: y, vx: -(6 + Math.random() * 4), vy: 3 + Math.random() * 2, life: 0 });
  }
  var last = 0;
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.p += s.s;
      var a = .35 + .65 * Math.abs(Math.sin(s.p));
      ctx.globalAlpha = a;
      ctx.fillStyle = s.warm ? '#ffe9b8' : '#dfe6ff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduce && t - last > 3800 + Math.random() * 3000) { spawnShoot(); last = t; }
    for (var j = shoots.length - 1; j >= 0; j--) {
      var sh = shoots[j];
      sh.x += sh.vx; sh.y += sh.vy; sh.life++;
      var g = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 9, sh.y - sh.vy * 9);
      g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(sh.x - sh.vx * 9, sh.y - sh.vy * 9); ctx.stroke();
      if (sh.life > 70 || sh.x < -50 || sh.y > H + 50) shoots.splice(j, 1);
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(frame);
  if (reduce) frame(0);
})();
