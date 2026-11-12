/* TUARAI - ปรับความลื่นตามความแรงของเครื่อง
   - เครื่องเก่า/ประหยัดข้อมูล: เปิดโหมดประหยัด (class lowfx) ลดเอฟเฟกต์หนักๆ จำกัด 30 เฟรม และลดความละเอียดแคนวาส
   - ถ้าเครื่องดูเหมือนแรงแต่เฟรมตก: วัดเฟรมเรตจริงแล้วสลับเป็นโหมดประหยัดให้เอง (และจำไว้ใช้ครั้งถัดไป) */
(function () {
  'use strict';
  var d = document.documentElement, n = navigator, ua = n.userAgent || '', conn = n.connection || {};
  var KEY = 'tu_perf_level', store = {
    get: function () { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } },
    set: function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  };
  var level = 0; // 0 = เต็มที่, 1 = ประหยัด, 2 = ประหยัดมาก
  var weak = (n.deviceMemory && n.deviceMemory <= 2) || (n.hardwareConcurrency && n.hardwareConcurrency <= 4 && /Android|iPhone|iPad|Mobile/.test(ua)) ||
    conn.saveData || /Android [4-7][\.;]/.test(ua) || /OS (9|10|11|12)_/.test(ua) || /\b(SM-[AJ][0-9]{2,3}|Redmi [0-9]A?\b)/.test(ua);
  if (weak) level = 1;
  level = Math.max(level, store.get());

  var P = window.TUPerf = { level: level, get low() { return P.level >= 1; }, get lowest() { return P.level >= 2; } };

  /* ---- เมื่อเป็นโหมดประหยัด ---- */
  var CSS = 'html.lowfx *,html.lowfx *::before,html.lowfx *::after{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;mix-blend-mode:normal!important}' +
    'html.lowfx .pl-grain,html.lowfx .pl-vig,html.lowfx .pl-trail,html.lowfx .nebula{display:none!important}' +
    'html.lowfx .reveal{filter:none!important}' +
    'html.lowfx2 .rm-cv,html.lowfx2 .rm-grid .floor{display:none!important}' +
    'html.lowfx2 *,html.lowfx2 *::before,html.lowfx2 *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}';
  var styled = false, patched = false;
  function patchRaf() {
    if (patched) return; patched = true;
    var _raf = window.requestAnimationFrame.bind(window), _caf = window.cancelAnimationFrame.bind(window), seen = new WeakMap(), tbl = {}, nid = 1;
    window.requestAnimationFrame = function (cb) {
      var k = nid++;
      (function step() {
        tbl[k] = _raf(function (ts) {
          if (P.low) { var l = seen.get(cb); if (l !== undefined && ts - l < 27) { step(); return; } seen.set(cb, ts); }
          delete tbl[k]; cb(ts);
        });
      })();
      return k;
    };
    window.cancelAnimationFrame = function (k) { if (tbl[k] !== undefined) { _caf(tbl[k]); delete tbl[k]; } };
  }
  function apply() {
    if (P.level < 1) return;
    d.classList.add('lowfx'); if (P.level >= 2) d.classList.add('lowfx2');
    if (!styled) { styled = true; var s = document.createElement('style'); s.textContent = CSS; (document.head || d).appendChild(s); }
    patchRaf();
    try { document.dispatchEvent(new CustomEvent('tu:lowfx', { detail: { level: P.level } })); } catch (e) {}
  }
  if (level >= 1) {
    var real = window.devicePixelRatio || 1; // จำกัดความละเอียดแคนวาส
    try { Object.defineProperty(window, 'devicePixelRatio', { get: function () { return Math.min(real, 1.25); }, configurable: true }); } catch (e) {}
    apply();
  }

  /* ---- วัดเฟรมเรตจริง แล้วลดระดับอัตโนมัติ ---- */
  function probe() {
    if (document.hidden || P.level >= 2) return;
    var raf = window.requestAnimationFrame, t = [], last = 0, N = 50;
    (function tick(ts) {
      if (last) t.push(ts - last); last = ts;
      if (document.hidden) return;
      if (t.length < N) { raf(tick); return; }
      t.sort(function (a, b) { return a - b; });
      var med = t[N >> 1]; // ค่ากลางของเวลาต่อเฟรม (ms)
      var want = med > 55 ? 2 : med > 30 ? 1 : 0;
      if (want > P.level) { P.level = want; store.set(want); apply(); }
    })(performance.now());
  }
  var started = false;
  function arm() { if (started) return; started = true; setTimeout(probe, 1200); setTimeout(probe, 7000); }
  document.addEventListener('tu:opened', arm);
  window.addEventListener('load', function () { setTimeout(arm, 3500); });

  /* ---- ลดงานถอดรหัสรูปบนเธรดหลัก ---- */
  document.addEventListener('DOMContentLoaded', function () {
    [].forEach.call(document.images, function (im) { if (!im.hasAttribute('decoding')) im.decoding = 'async'; });
  });
})();
