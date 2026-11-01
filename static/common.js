/* =========================================
   TUARAI - ตัวช่วยกลาง (ใช้ร่วมกันทุกหน้า) โหลดก่อน script.js เสมอ
   ========================================= */
window.TU = (function () {

    function escapeHtml(str) {
        return String(str === null || str === undefined ? '' : str).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // กล่องแจ้งเตือน (message เป็น HTML ได้ ต้อง escape ข้อมูลผู้ใช้เองก่อนส่งเข้ามา)
    function showAlert(message, callback) {
        var old = document.getElementById('customAlertModal');
        if (old) old.remove();

        document.body.insertAdjacentHTML('beforeend',
            '<div id="customAlertModal" class="modal-overlay" style="display: flex; z-index: 3000;">' +
            '<div class="modal-content" style="text-align: center; max-width: 380px;">' +
            '<span class="close-modal" id="closeCustomAlert">&times;</span>' +
            '<h3 style="margin: 20px 0 15px; color: var(--text-main);">แจ้งเตือนระบบ</h3>' +
            '<p style="color: var(--text-muted); margin-bottom: 25px; font-size: 1.05rem; line-height: 1.5;">' + message + '</p>' +
            '<button id="alertOkBtn" class="btn-submit">ตกลง</button></div></div>');

        var modal = document.getElementById('customAlertModal');
        function close() {
            modal.remove();
            if (callback) callback();
        }
        document.getElementById('closeCustomAlert').addEventListener('click', close);
        document.getElementById('alertOkBtn').addEventListener('click', close);
        modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    }

    // เรียก API แล้วคืน { ok, status, data } ไม่ throw เมื่อเซิร์ฟเวอร์ตอบ error
    async function api(url, options) {
        try {
            var res = await fetch(url, options);
            var data = null;
            try { data = await res.json(); } catch (e) { data = {}; }
            return { ok: res.ok, status: res.status, data: data };
        } catch (e) {
            return { ok: false, status: 0, data: { message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' } };
        }
    }

    function postJson(url, body) {
        return api(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body || {})
        });
    }

    // ---------- รูปภาพ: ย่อในเครื่องลูกค้าก่อนอัปโหลด ----------
    function loadImage(file) {
        return new Promise(function (resolve, reject) {
            var url = URL.createObjectURL(file);
            var img = new Image();
            img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
            img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('โหลดรูปไม่ได้')); };
            img.src = url;
        });
    }

    async function shrinkImage(file, maxSide, quality) {
        maxSide = maxSide || 1600;
        quality = quality || 0.82;
        var img = await loadImage(file);
        var scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.max(1, Math.round(img.naturalWidth * scale));
        var h = Math.max(1, Math.round(img.naturalHeight * scale));
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        return new Promise(function (resolve, reject) {
            canvas.toBlob(function (b) { b ? resolve(b) : reject(new Error('แปลงรูปไม่สำเร็จ')); }, 'image/jpeg', quality);
        });
    }

    // คืน { blobs: [...], failed: [ชื่อไฟล์ที่เปิดไม่ได้] }
    async function shrinkMany(files) {
        var blobs = [], failed = [];
        for (var i = 0; i < files.length; i++) {
            try { blobs.push(await shrinkImage(files[i])); }
            catch (e) { failed.push(files[i].name); }
        }
        return { blobs: blobs, failed: failed };
    }

    // ---------- คัดลอกข้อความ (clipboard API ใช้ได้เฉพาะ https/localhost จึงมีวิธีสำรอง) ----------
    async function copyText(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (e) { /* ลองวิธีสำรอง */ }
        try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            var ok = document.execCommand('copy');
            ta.remove();
            return ok;
        } catch (e) {
            return false;
        }
    }

    // ---------- วันที่/เวลา ----------
    function fmtDate(ts) {
        if (!ts) return '-';
        return new Date(ts * 1000).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function fmtRemain(ts) {
        var sec = ts - Math.floor(Date.now() / 1000);
        if (sec <= 0) return '';
        var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
        return h > 0 ? h + ' ชม. ' + m + ' นาที' : m + ' นาที';
    }

    function money(n) {
        return Number(n).toLocaleString('th-TH', { maximumFractionDigits: 0 });
    }

    // ---------- ตัวเลือกรูปแบบมีพรีวิว (ใช้ในฟอร์มสั่งซื้อ) ----------
    // opts: { input, button, preview, counter, getMax() }
    function photoPicker(opts) {
        var items = [];  // { blob, url }

        function render() {
            opts.preview.innerHTML = '';
            items.forEach(function (p, i) {
                var box = document.createElement('div');
                box.className = 'photo-thumb';
                var img = document.createElement('img');
                img.src = p.url;
                img.alt = 'รูปที่ ' + (i + 1);
                var del = document.createElement('button');
                del.type = 'button';
                del.textContent = '×';
                del.title = 'ลบรูปนี้';
                del.addEventListener('click', function () {
                    URL.revokeObjectURL(p.url);
                    items.splice(i, 1);
                    render();
                });
                box.appendChild(img);
                box.appendChild(del);
                if (i === 0) {
                    var tag = document.createElement('span');
                    tag.className = 'cover-tag';
                    tag.textContent = 'รูปปก';
                    box.appendChild(tag);
                }
                opts.preview.appendChild(box);
            });
            opts.counter.textContent = 'เลือกแล้ว ' + items.length + '/' + opts.getMax() + ' รูป';
        }

        opts.button.addEventListener('click', function () { opts.input.click(); });

        opts.input.addEventListener('change', async function () {
            var files = Array.prototype.slice.call(opts.input.files || []);
            opts.input.value = '';
            if (!files.length) return;

            var room = opts.getMax() - items.length;
            var notes = [];
            if (files.length > room) {
                notes.push('แพ็กเกจนี้เลือกรูปได้สูงสุด ' + opts.getMax() + ' รูป ตอนนี้เพิ่มได้อีก ' + Math.max(room, 0) + ' รูป');
            }
            opts.button.disabled = true;
            var oldText = opts.button.textContent;
            opts.button.textContent = 'กำลังเตรียมรูป...';

            var out = await shrinkMany(files.slice(0, Math.max(room, 0)));
            out.blobs.forEach(function (b) { items.push({ blob: b, url: URL.createObjectURL(b) }); });
            render();

            opts.button.disabled = false;
            opts.button.textContent = oldText;
            if (out.failed.length) {
                notes.push('เปิดไฟล์เหล่านี้ไม่ได้ (ใช้ JPG, PNG หรือ WEBP): ' + out.failed.map(escapeHtml).join(', '));
            }
            if (notes.length) showAlert(notes.join('<br>'));
        });

        render();
        return {
            blobs: function () { return items.map(function (p) { return p.blob; }); },
            count: function () { return items.length; },
            trim: function () {           // ตัดรูปส่วนเกินเมื่อเปลี่ยนแพ็กเกจเป็นแบบที่รูปน้อยกว่า
                var max = opts.getMax();
                while (items.length > max) URL.revokeObjectURL(items.pop().url);
                render();
            },
            refresh: render
        };
    }

    return {
        escapeHtml: escapeHtml, showAlert: showAlert, api: api, postJson: postJson,
        shrinkMany: shrinkMany, copyText: copyText, fmtDate: fmtDate, fmtRemain: fmtRemain,
        money: money, photoPicker: photoPicker
    };
})();
