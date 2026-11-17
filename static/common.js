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


    // ตัวแก้ไขบทสนทนา (ธีมวิชวลโนเวล): คำถาม + ตัวเลือก 2-4 ข้อ + คำตอบของเรา
    function dialogEditor(root, items, opts) {
        opts = opts || {};
        var FREE = opts.free || 6, PRICE = opts.price || 29, ABS = opts.max || 6, MAXQ = opts.allowed || ABS, locked = false;
        var data = (items && items.length ? items : [{ q: '', options: ['', ''], replies: ['', ''], reply: '' }]).map(function (x) {
            return { q: x.q || '', options: (x.options || []).slice(), replies: (x.replies || []).slice(), reply: x.reply || '' };
        });
        var walkData = (opts.walk || []).slice(0, 5);
        function collectWalk() {
            var ins = root.querySelectorAll('.dlg-walk');
            if (ins.length) walkData = [].map.call(ins, function (i) { return i.value.trim(); });
            return walkData.some(Boolean) ? walkData : [];
        }
        function collect() {
            var out = [];
            root.querySelectorAll('.dlg-item:not(.dlg-walkbox)').forEach(function (el) {
                var opts = [], reps = [], ins = el.querySelectorAll('.dlg-opt'), rs = el.querySelectorAll('.dlg-orep');
                [].forEach.call(ins, function (inp, k) { var v = inp.value.trim(); if (v) { opts.push(v); reps.push(rs[k].value.trim()); } });
                out.push({ q: el.querySelector('.dlg-q').value.trim(), options: opts, replies: reps, reply: el.querySelector('.dlg-reply').value.trim() });
            });
            return out;
        }
        function render() {
            var h = '<p class="photo-hint">' + (opts.hint || 'ใส่ {name} ตรงไหนก็ได้ ระบบจะเปลี่ยนเป็นชื่อแฟนให้ (ตอบได้ 2-4 ตัวเลือกต่อคำถาม) ถ้าไม่กรอกอะไรเลย ระบบจะใช้บทสนทนาตัวอย่างให้') + '</p>' +
                '<p class="dlg-price" id="dlgPrice"></p>';
            if (opts.walk) {
                collectWalk();
                var WL = ['ตอนเริ่มเดิน', 'ป้ายที่ 1 (ร้านไอศกรีม)', 'ป้ายที่ 2 (ตู้เกม)', 'ป้ายที่ 3 (ร้านสติกเกอร์)', 'ตอนถึงหน้าร้านลุง'];
                h += '<div class="dlg-item dlg-walkbox"><div class="dlg-head"><b>💭 ข้อความตอนเดินจับมือไปร้าน</b></div><p class="photo-hint" style="margin:0 0 8px">พิมพ์เองได้ 5 จุด ช่องไหนเว้นว่างระบบใช้ข้อความตัวอย่างให้ (ใส่ {name} แทนชื่อแฟนได้)</p>';
                for (var w = 0; w < 5; w++) h += '<input type="text" class="dlg-walk" maxlength="160" placeholder="' + WL[w] + '" value="' + escapeHtml(walkData[w] || '') + '">';
                h += '</div>';
            }
            data.forEach(function (d, i) {
                h += '<div class="dlg-item"><div class="dlg-head"><b>คำถามที่ ' + (i + 1) + (i >= FREE && !opts.noPrice ? ' <span class="dlg-extra">+' + PRICE + ' ฿</span>' : '') + '</b>' +
                    '<button type="button" class="btn-small dlg-del" data-i="' + i + '">ลบ</button></div>' +
                    '<textarea class="dlg-q" rows="2" maxlength="160" placeholder="เช่น ถ้าไปเที่ยวด้วยกัน อยากไปไหน">' + escapeHtml(d.q) + '</textarea>';
                for (var k = 0; k < 4; k++) {
                    h += '<div class="dlg-pair"><input type="text" class="dlg-opt" maxlength="60" placeholder="ตัวเลือกที่ ' + (k + 1) + (k < 2 ? ' (จำเป็น)' : ' (ไม่ใส่ก็ได้)') + '" value="' + escapeHtml(d.options[k] || '') + '">' +
                        '<input type="text" class="dlg-orep" maxlength="160" placeholder="↳ ถ้าเขาเลือกข้อนี้ เราจะตอบว่า... (ไม่ใส่ก็ได้)" value="' + escapeHtml(d.replies[k] || '') + '"></div>';
                }
                h += '<input type="text" class="dlg-reply" maxlength="160" placeholder="คำตอบรวม ใช้กับตัวเลือกที่ไม่ได้ใส่คำตอบเฉพาะ (ไม่ใส่ก็ได้)" value="' + escapeHtml(d.reply) + '"></div>';
            });
            var atCap = data.length >= MAXQ, canBuy = atCap && MAXQ < ABS && opts.onBuy;
            h += '<button type="button" class="btn-small dlg-add' + (canBuy ? ' dlg-buy' : '') + '"' + (atCap && !canBuy ? ' disabled' : '') + '>' +
                (canBuy ? '🛒 ซื้อคำถามเพิ่ม ' + PRICE + ' ฿/ข้อ' : '+ เพิ่มคำถาม') + '</button>';
            root.innerHTML = h;
            root.querySelectorAll('input,textarea,button').forEach(function (el) { el.disabled = locked || (el.classList.contains('dlg-add') && atCap && !canBuy); });
            note();
        }
        function note() {
            var el = root.querySelector('#dlgPrice'); if (!el) return;
            if (opts.noPrice) { el.innerHTML = 'ใส่ได้สูงสุด <b>' + ABS + '</b> คำถาม (ฟรี ไม่มีค่าเพิ่ม)'; return; }
            var n = [].filter.call(root.querySelectorAll('.dlg-item'), function (it) { return it.querySelector('.dlg-q').value.trim(); }).length;
            if (opts.onBuy) { el.innerHTML = 'ใช้ได้ <b>' + MAXQ + '</b> คำถาม (ฟรี ' + FREE + ' ข้อ) · ซื้อเพิ่มข้อละ ' + PRICE + ' ฿ สูงสุด ' + ABS + ' ข้อ'; return; }
            el.innerHTML = 'ฟรี ' + FREE + ' คำถามแรก · ข้อที่ ' + (FREE + 1) + ' เป็นต้นไปข้อละ <b>' + PRICE + ' ฿</b> (สูงสุด ' + ABS + ' ข้อ)' +
                (n > FREE ? ' · ตอนนี้ ' + n + ' ข้อ ค่าเพิ่ม <b>' + ((n - FREE) * PRICE) + ' ฿</b>' : '');
        }
        root.addEventListener('input', note);
        root.addEventListener('click', function (e) {
            if (locked) return;
            if (e.target.closest('.dlg-buy')) { opts.onBuy(); return; }
            var del = e.target.closest('.dlg-del');
            if (del) { data = collect(); data.splice(+del.dataset.i, 1); render(); }
            if (e.target.closest('.dlg-add')) { data = collect(); if (data.length < MAXQ) data.push({ q: '', options: ['', ''], replies: ['', ''], reply: '' }); render(); }
        });
        render();
        return { getWalk: collectWalk, get: function () { return collect().filter(function (d) { return d.q && d.options.length >= 2; }); },
                 lock: function (v) { locked = !!v; data = collect(); render(); } };
    }


    // ตัวเลือกภารกิจ (ธีม Classic): เลือก 3 จาก 6 + กรอกคำถามเอง / ข้อความลับ
    var QUESTS = [
        { k: 'quiz', ic: '💭', t: 'ทายใจ', d: 'ถามเดือน/ปี/จำนวนวัน (สร้างจากวันที่ให้อัตโนมัติ)' },
        { k: 'puzzle', ic: '🧩', t: 'ต่อภาพ', d: 'เลื่อนชิ้นส่วนรูปปกให้เป็นรูปเต็ม' },
        { k: 'hunt', ic: '💗', t: 'หัวใจลับ', d: 'ตามหาหัวใจ 5 ดวงที่ซ่อนในรูป' },
        { k: 'match', ic: '🃏', t: 'จับคู่ความทรงจำ', d: 'พลิกการ์ดหาคู่รูปเดียวกัน (ใช้รูปของคุณ)' },
        { k: 'ask', ic: '✍️', t: 'คำถามของเรา', d: 'คุณตั้งคำถามเอง เขาเลือกตอบ' },
        { k: 'scratch', ic: '🎟', t: 'ขูดข้อความลับ', d: 'ขูดการ์ดเผยข้อความที่คุณเขียนซ่อนไว้' }
    ];
    function questEditor(root, init, opts) {
        opts = opts || {};
        init = init || {};
        var MAXP = 3, locked = false;
        var NOH = !!opts.noHunt, off = !!init.off;
        var pick = (init.pick && init.pick.length ? init.pick : (NOH ? ['quiz', 'puzzle', 'match'] : ['quiz', 'puzzle', 'hunt'])).filter(function (k) { return !(NOH && k === 'hunt'); }).slice(0, MAXP);
        if (!pick.length) pick = ['quiz', 'puzzle', 'match'];
        var qa = (init.qa || []).slice(0, 3), sec = (init.secret || []).slice(0, 3);
        while (qa.length < 3) qa.push({ q: '', a: '', w: ['', ''] });
        while (sec.length < 3) sec.push('');
        function v(x) { return escapeHtml(x || ''); }
        var h = '<label class="qe-off"><input type="checkbox" id="qeOff"' + (off ? ' checked' : '') + '> <b>ไม่เอาภารกิจ</b> <small>(เล่นธีมอย่างเดียว ผู้รับเปิดอ่านจดหมายได้เลย)</small></label><div id="qeBody"><p class="photo-hint">🎯 เลือกภารกิจที่จะให้เขา/เธอเล่นก่อนอ่านจดหมาย <b>ได้ ' + MAXP + ' ข้อ (ฟรี)</b> <span id="qeCnt"></span></p><div class="qe-grid">';
        QUESTS.forEach(function (q) {
            var dis = NOH && q.k === 'hunt';
            h += '<button type="button" class="qe-chip' + (dis ? ' dis' : '') + '" data-k="' + q.k + '"' + (dis ? ' disabled' : '') + '><span class="qe-ic">' + q.ic + '</span><b>' + q.t + '</b><small>' + (dis ? 'ธีมนี้เล่นหัวใจลับไม่ได้' : q.d) + '</small><i class="qe-tick">✓</i></button>';
        });
        h += '</div><div class="qe-panel" data-p="ask"><p class="field-label">✍️ คำถามของเรา (ใส่ได้ 1-3 ข้อ)</p>';
        qa.forEach(function (it, i) {
            var w = it.w || [];
            h += '<div class="qe-qa"><b>ข้อ ' + (i + 1) + '</b><input type="text" class="qe-q" maxlength="120" placeholder="คำถาม เช่น เรานัดเจอกันครั้งแรกที่ไหน" value="' + v(it.q) + '">' +
                '<input type="text" class="qe-a" maxlength="50" placeholder="✓ คำตอบที่ถูก" value="' + v(it.a) + '">' +
                '<input type="text" class="qe-w" maxlength="50" placeholder="✗ ตัวเลือกหลอกที่ 1" value="' + v(w[0]) + '">' +
                '<input type="text" class="qe-w" maxlength="50" placeholder="✗ ตัวเลือกหลอกที่ 2 (ไม่ใส่ก็ได้)" value="' + v(w[1]) + '"></div>';
        });
        h += '</div><div class="qe-panel" data-p="scratch"><p class="field-label">🎟 ข้อความลับที่ซ่อนใต้การ์ดขูด (ใส่ได้ 1-3 ข้อ)</p>';
        sec.forEach(function (t, i) {
            h += '<input type="text" class="qe-s" maxlength="120" placeholder="ข้อความลับที่ ' + (i + 1) + ' เช่น ขอบคุณที่อยู่ข้างกันเสมอ" value="' + v(t) + '">';
        });
        h += '</div></div>';
        root.innerHTML = h;
        function sync() {
            root.querySelectorAll('.qe-chip').forEach(function (c) { c.classList.toggle('on', pick.indexOf(c.dataset.k) >= 0); });
            root.querySelectorAll('.qe-panel').forEach(function (p) { p.style.display = pick.indexOf(p.dataset.p) >= 0 ? '' : 'none'; });
            root.querySelector('#qeBody').style.display = off ? 'none' : '';
            root.querySelector('#qeCnt').textContent = '(เลือกแล้ว ' + pick.length + '/' + MAXP + ')';
        }
        root.addEventListener('click', function (e) {
            if (e.target.id === 'qeOff') { if (!locked) { off = e.target.checked; sync(); } else e.target.checked = off; return; }
            var c = e.target.closest('.qe-chip'); if (!c || locked || c.classList.contains('dis')) return;
            var k = c.dataset.k, i = pick.indexOf(k);
            if (i >= 0) { if (pick.length <= 1) return; pick.splice(i, 1); }
            else {
                if (pick.length >= MAXP) { if (window.TU && TU.showAlert) TU.showAlert('เลือกได้สูงสุด ' + MAXP + ' ภารกิจ กดยกเลิกข้ออื่นก่อนนะ'); return; }
                pick.push(k);
            }
            sync();
        });
        function val(el) { return el.value.trim(); }
        function collect() {
            var qaOut = [];
            root.querySelectorAll('.qe-qa').forEach(function (el) {
                var ws = [].map.call(el.querySelectorAll('.qe-w'), val).filter(Boolean);
                qaOut.push({ q: val(el.querySelector('.qe-q')), a: val(el.querySelector('.qe-a')), w: ws });
            });
            return { off: off, pick: pick.slice(), qa: qaOut.filter(function (x) { return x.q && x.a && x.w.length; }),
                     secret: [].map.call(root.querySelectorAll('.qe-s'), val).filter(Boolean) };
        }
        sync();
        return {
            get: collect,
            validate: function () {
                var d = collect(); if (off) return '';
                if (pick.indexOf('ask') >= 0 && !d.qa.length) return 'ภารกิจ "คำถามของเรา": กรอกอย่างน้อย 1 ข้อ ให้ครบทั้งคำถาม คำตอบที่ถูก และตัวเลือกหลอก 1 ตัวเลือก';
                if (pick.indexOf('scratch') >= 0 && !d.secret.length) return 'ภารกิจ "ขูดข้อความลับ": กรอกข้อความลับอย่างน้อย 1 ข้อ';
                return '';
            },
            lock: function (x) { locked = !!x; root.querySelectorAll('input').forEach(function (el) { el.disabled = locked; }); }
        };
    }

    function money(n) {
        return Number(n).toLocaleString('th-TH', { maximumFractionDigits: 0 });
    }

    // ---------- ตัวเลือกรูปแบบมีพรีวิว (ใช้ในฟอร์มสั่งซื้อ) ----------
    // opts: { input, button, preview, counter, getMax() }
    /* ---------- ธีมบอกเลิก: เลือกตุ๊กตา/โทน, คำเตือนสติก่อนซื้อ, เตือนคำรุนแรง ---------- */
    var DOLLS = [['🧸', 'หมีถือร่ม'], ['🐰', 'กระต่ายตาบวม'], ['🐱', 'แมวหันหลัง'], ['🐥', 'ลูกเจี๊ยบถือกระเป๋า']];
    var TONES = [['soft', 'อ่อนโยน'], ['direct', 'ตรงไปตรงมา'], ['thanks', 'ขอบคุณและลาก่อน']];
    function dollPicker(root, init) {
        init = init || {}; var doll = 0, tone = 'soft', bye0 = init.bye || {}, fin = bye0.final !== false, an = Array.isArray(bye0.anims) ? (bye0.anims[0] || '') : 'hug';
        function draw() {
            root.innerHTML = '<div class="bye-opts"><b>ฉากหมีตอนท้าย (เลือกได้ 1 แบบ)</b>' +
                [['hug', '🤗 เข้ามากอดแนบจอ'], ['kiss', '😘 เข้ามาจุ๊บหน้าจอ แล้วทิ้งลอยจูบไว้'], ['wave', '👋 เข้ามาใกล้จอแล้วโบกมือลา'], ['pat', '🫶 เข้ามาโอ๋ ลูบหัว แล้วเดินจากไป'], ['', '— ไม่เอาฉากนี้']].map(function (x) { return '<label class="bye-ck"><input type="radio" name="byeAn" data-an="' + x[0] + '"' + (an === x[0] ? ' checked' : '') + '> <span>' + x[1] + '</span></label>'; }).join('') +
                '<label class="bye-ck"><input type="checkbox" data-fin' + (fin ? ' checked' : '') + '> <span>💔 คำบอกเลิกสุดท้าย "เราต้องเลิกกันแล้วนะ" (มีปุ่ม ตกลง / ไม่เอา — ปุ่มไม่เอากดไม่โดน)</span></label></div>';
        }
        draw();
        root.addEventListener('change', function (e) {
            var i = e.target; if (i.hasAttribute('data-fin')) fin = i.checked;
            else if (i.hasAttribute('data-an')) an = i.getAttribute('data-an');
        });
        root.addEventListener('click', function (e) {
            var d = e.target.closest('.doll-chip'), t = e.target.closest('.tone-chip');
            if (d) { doll = +d.getAttribute('data-d'); draw(); } else if (t) { tone = t.getAttribute('data-t'); draw(); }
        });
        return { get: function () { return { doll: doll, tone: tone, bye: { final: fin, anims: an ? [an] : [] } }; } };
    }
    function confirmGoodbye(onOk) {
        var old = document.getElementById('byeModal'); if (old) old.remove();
        document.body.insertAdjacentHTML('beforeend',
            '<div id="byeModal" class="modal-overlay" style="display:flex;z-index:3100;"><div class="modal-content bye-box">' +
            '<div class="bye-ic">🕊️</div><h3>แน่ใจแล้วเหรอคะ</h3>' +
            '<p class="bye-msg">ทบทวนความรู้สึกของตัวเองดีแล้วใช่ไหม ไม่อยากให้ตัดสินใจตอนที่อารมณ์กำลังร้อน แล้วต้องมาเสียใจทีหลังเลยนะ</p>' +
            '<label class="bye-ck"><input type="checkbox"> <span>เคยลองคุยกันแล้ว</span></label>' +
            '<label class="bye-ck"><input type="checkbox"> <span>ตัดสินใจแล้ว</span></label>' +
            '<label class="bye-ck"><input type="checkbox"> <span>ไม่ได้ทำตอนโกรธ</span></label>' +
            '<p class="bye-help">ถ้าตอนนี้รู้สึกแย่มากจนไม่ไหว โทรปรึกษาสายด่วนสุขภาพจิต <b>1323</b> ได้ตลอด 24 ชั่วโมง</p>' +
            '<div class="bye-act"><button type="button" class="bye-back">ย้อนกลับไปคิดอีกที</button><button type="button" class="bye-go" disabled>รออีก 10 วินาที</button></div></div></div>');
        var m = document.getElementById('byeModal'), cks = m.querySelectorAll('input'), go = m.querySelector('.bye-go'), left = 10;
        function upd() { var all = [].every.call(cks, function (c) { return c.checked; }); go.disabled = !(all && left <= 0); go.textContent = left > 0 ? 'รออีก ' + left + ' วินาที' : (all ? 'ยืนยัน ไปต่อ' : 'ติ๊กให้ครบทั้ง 3 ข้อ'); }
        var iv = setInterval(function () { left--; if (left <= 0) clearInterval(iv); upd(); }, 1000);
        m.addEventListener('change', upd);
        function close() { clearInterval(iv); m.remove(); }
        m.querySelector('.bye-back').addEventListener('click', close);
        go.addEventListener('click', function () { if (go.disabled) return; close(); onOk(); });
        upd();
    }
    var HARSH = ['โง่', 'ควาย', 'เลว', 'สัตว์', 'ไอ้', 'อีนี่', 'เกลียด', 'ตายไป', 'หน้าด้าน', 'ไร้ค่า', 'ขยะ', 'เหี้ย', 'ห่า', 'ส้นตีน', 'สันดาน', 'ชั่ว'];
    function softWords(text) { return HARSH.filter(function (w) { return text.indexOf(w) >= 0; }); }

    function uploadName(b, i) {
        var m = b && b.name && /\.(mp4|mov|webm|m4v)$/i.exec(b.name);
        return m ? 'clip' + (i + 1) + m[0].toLowerCase() : 'photo' + (i + 1) + '.jpg';
    }
    var isVidUrl = function (u) { return /\.(mp4|mov|webm)(\?|$)/i.test(u || ''); };

    function photoPicker(opts) {
        var items = [];  // { blob, url, video }

        function render() {
            opts.preview.innerHTML = '';
            items.forEach(function (p, i) {
                var box = document.createElement('div');
                box.className = 'photo-thumb';
                var img = document.createElement(p.video ? 'video' : 'img');
                img.src = p.url;
                if (p.video) { img.muted = true; img.setAttribute('playsinline', ''); img.preload = 'metadata'; } else img.alt = 'รูปที่ ' + (i + 1);
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
                if (opts.captions) {
                    box.classList.add('has-cap');
                    var ci = document.createElement('input');
                    ci.type = 'text'; ci.className = 'cap-in'; ci.maxLength = 40; ci.value = p.cap || '';
                    ci.placeholder = opts.required ? (i < 8 ? 'คำใต้รูป เช่น วันเกิด' : '(ไม่ต้องใส่)') : 'ข้อความใต้รูป (ไม่ใส่ก็ได้)';
                    ci.addEventListener('input', function () { p.cap = ci.value; });
                    box.appendChild(ci);
                }
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

            var notes = [], vids = [];
            if (opts.allowVideo && opts.allowVideo()) {
                vids = files.filter(function (f) { return (f.type || '').indexOf('video/') === 0 || /\.(mp4|mov|webm|m4v)$/i.test(f.name); });
                files = files.filter(function (f) { return vids.indexOf(f) < 0; });
            } else if (files.some(function (f) { return (f.type || '').indexOf('video/') === 0; })) {
                files = files.filter(function (f) { return (f.type || '').indexOf('video/') !== 0; });
                notes.push('ธีมนี้ใช้ได้เฉพาะรูปภาพ');
            }
            var room = opts.getMax() - items.length;
            var haveV = items.filter(function (p) { return p.video; }).length;
            vids = vids.filter(function (f) {
                if (f.size > 15 * 1024 * 1024) { notes.push('คลิป "' + escapeHtml(f.name) + '" ใหญ่เกิน 15MB (ตัดคลิปให้สั้นลงก่อน)'); return false; }
                return true;
            });
            if (haveV + vids.length > 2) { notes.push('ใส่คลิปได้สูงสุด 2 คลิป'); vids = vids.slice(0, Math.max(0, 2 - haveV)); }
            vids = vids.slice(0, Math.max(0, room)); room -= vids.length;
            vids.forEach(function (f) { items.push({ blob: f, url: URL.createObjectURL(f), video: true }); });
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
            captions: function () { return items.map(function (p) { return (p.cap || '').trim(); }); },
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
        dollPicker: dollPicker, confirmGoodbye: confirmGoodbye, softWords: softWords, money: money, uploadName: uploadName, isVidUrl: isVidUrl, photoPicker: photoPicker, dialogEditor: dialogEditor, questEditor: questEditor
    };
})();
