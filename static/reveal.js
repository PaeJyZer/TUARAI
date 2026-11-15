/* โผล่ตอนเลื่อนเข้าจอ และหายกลับตอนเลื่อนพ้นจอ ทั้งเข้าและออก (หน้าแรก) */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var G = [
    ['.hx-copy > *', 'up'], ['.hx-visual', 'zoom'],
    ['.decks-head > *', 'up'], ['.decks > .deck-col', 'zoom'],
    ['.steps3 .section-title, .steps3 .section-sub, .steps3 > h2, .steps3 > p', 'up'], ['.steps3 li', 'up'],
    ['.compare-section > h2, .compare-section > p, .compare-section .section-title', 'up'],
    ['.package-grid > .pkg-wrap:nth-child(odd)', 'left'], ['.package-grid > .pkg-wrap:nth-child(even)', 'right'],
    ['.faq2 > .rail-eyebrow, .faq2 > h2', 'up'], ['.faq2 details.fq:nth-of-type(odd)', 'left'], ['.faq2 details.fq:nth-of-type(even)', 'right'],
    ['.notice-box', 'up']
  ];
  var els = [];
  G.forEach(function (g) {
    var seen = new Map();
    document.querySelectorAll(g[0]).forEach(function (el) {
      if (el.classList.contains('rv')) return;
      var p = el.parentElement, i = seen.get(p) || 0; seen.set(p, i + 1);
      el.classList.add('rv'); el.style.setProperty('--i', Math.min(i, 5));
      if (g[1] !== 'up') el.setAttribute('data-rv', g[1]);
      els.push(el);
    });
  });
  var io = new IntersectionObserver(function (list) {
    list.forEach(function (e) {
      var el = e.target;
      if (e.isIntersecting) { el.style.setProperty('--ry', e.boundingClientRect.top > innerHeight * .4 ? '38px' : '-26px'); el.classList.remove('out'); el.classList.add('in'); }
      else if (el.classList.contains('in')) {
        var below = e.boundingClientRect.top > 0;
        el.style.setProperty('--ry', below ? '38px' : '-26px');
        el.classList.remove('in'); el.classList.add('out');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
