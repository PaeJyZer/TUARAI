/* =========================================
   TUARAI - หน้าแก้ไขเว็บ (ข้อความ / รูป / ธีม)
   ========================================= */
document.addEventListener('DOMContentLoaded', async () => {
    const TU = window.TU;
    const esc = TU.escapeHtml;
    const root = document.getElementById('editRoot');
    if (!root) return;

    const slug = root.dataset.slug;
    const notice = document.getElementById('editNotice');
    const form = document.getElementById('editForm');
    const grid = document.getElementById('edPhotoGrid');
    const photoCount = document.getElementById('edPhotoCount');
    const addBtn = document.getElementById('edPhotoAdd');
    const photoInput = document.getElementById('edPhotoInput');
    let site = null;

    let dlgEd = null;
    function setEditable(on) {
        if (dlgEd) dlgEd.lock(!on);
        form.querySelectorAll('input, textarea, select, button').forEach((el) => { el.disabled = !on; });
        addBtn.disabled = !on;
    }

    function renderNotice() {
        let html = '';
        if (site.status === 'draft') {
            html = `<div class="notice-inline">นี่คือฉบับร่าง ยังไม่ได้ชำระเงิน แก้ไขได้ตามใจ พอพอใจแล้วไปชำระเงินเพื่อเปิดใช้งานเว็บ
                <button type="button" class="btn-small primary" id="edPay">ไปชำระเงิน</button></div>`;
        } else if (site.status === 'expired') {
            html = '<div class="notice-inline warn">เว็บนี้หมดอายุแล้ว แก้ไขไม่ได้จนกว่าจะต่ออายุ (ที่ Dashboard)</div>';
        } else if (site.package === 'pro') {
            html = '<div class="notice-inline">แพ็กเกจ Pro: แก้ไขข้อความและรูปได้ไม่จำกัด</div>';
        } else if (site.can_edit) {
            html = `<div class="notice-inline">แพ็กเกจ Basic: แก้ไขได้อีก <strong>${esc(TU.fmtRemain(site.edit_until_ts) || 'ไม่ถึงนาที')}</strong>
                หลังจากนั้นจะล็อก (อัปเกรดเป็น Pro เพื่อแก้ไขได้ไม่จำกัด)</div>`;
        } else {
            html = '<div class="notice-inline warn">หมดเวลาแก้ไขของแพ็กเกจ Basic แล้ว ถ้าต้องการแก้ไขให้อัปเกรดเป็น Pro ที่ Dashboard (จ่ายเฉพาะส่วนต่าง)</div>';
        }
        notice.innerHTML = html;

        const payBtn = document.getElementById('edPay');
        if (payBtn) {
            payBtn.addEventListener('click', async () => {
                payBtn.disabled = true;
                const r = await TU.postJson('/api/orders', { slug, kind: 'new' });
                if (r.ok) window.location.href = r.data.pay_url;
                else { payBtn.disabled = false; TU.showAlert(esc(r.data.message || 'เกิดข้อผิดพลาด')); }
            });
        }
    }

    const caps = {};   // url -> คำใต้รูป (เฉพาะธีมจับคู่)
    function renderPhotos() {
        grid.innerHTML = '';
        grid.classList.toggle('with-cap', !!site.has_captions);
        site.images.forEach((url, i) => {
            const box = document.createElement('div');
            box.className = 'photo-thumb';
            const img = document.createElement('img');
            img.src = url;
            img.alt = `รูปที่ ${i + 1}`;
            img.loading = 'lazy';
            box.appendChild(img);
            if (site.has_captions) {
                if (!(url in caps)) caps[url] = (site.captions || {})[url] || '';
                box.classList.add('has-cap');
                const ci = document.createElement('input');
                ci.type = 'text'; ci.className = 'cap-in'; ci.maxLength = 40; ci.value = caps[url];
                ci.placeholder = i < 8 ? 'คำใต้รูป เช่น วันเกิด' : '(ไม่ต้องใส่)';
                ci.disabled = !site.can_edit;
                ci.addEventListener('input', () => { caps[url] = ci.value; });
                box.appendChild(ci);
            }

            if (site.can_edit) {
                const del = document.createElement('button');
                del.type = 'button';
                del.textContent = '×';
                del.title = 'ลบรูปนี้';
                del.addEventListener('click', () => deletePhoto(url));
                box.appendChild(del);

                if (i > 0) {
                    const star = document.createElement('button');
                    star.type = 'button';
                    star.className = 'cover-btn';
                    star.textContent = '★';
                    star.title = 'ตั้งเป็นรูปปก';
                    star.addEventListener('click', () => setCover(url));
                    box.appendChild(star);
                }
            }
            if (i === 0) {
                const tag = document.createElement('span');
                tag.className = 'cover-tag';
                tag.textContent = 'รูปปก';
                box.appendChild(tag);
            }
            grid.appendChild(box);
        });
        photoCount.textContent = `(${site.images.length}/${site.max_photos} รูป · ขั้นต่ำ ${site.min_photos})`;
    }

    const OCC_LABELS = { anniversary: 'วันที่เริ่มคบกัน (หรือวันพิเศษ)', birthday: 'วันเกิดของเขา/เธอ' };
    function syncDateLabel() {
        const v = document.getElementById('edOccasion').value;
        document.getElementById('edDateLabel').textContent = OCC_LABELS[v] || OCC_LABELS.anniversary;
    }
    document.getElementById('edOccasion').addEventListener('change', syncDateLabel);

    function fill() {
        document.getElementById('edName').value = site.partner_name;
        document.getElementById('edDate').value = site.start_date;
        document.getElementById('edOccasion').value = site.occasion || 'anniversary';
        syncDateLabel();
        document.getElementById('edLetter').value = site.letter_text;
        document.getElementById('edSign').value = site.letter_sign;
        document.getElementById('edPreview').href = site.preview_url;
        document.getElementById('edDialogWrap').style.display = site.has_dialog ? '' : 'none';
        if (site.has_dialog && !dlgEd) dlgEd = TU.dialogEditor(document.getElementById('edDialog'), site.dialog);

        renderNotice();
        renderPhotos();
        setEditable(site.can_edit);
    }

    async function load() {
        const r = await TU.api(`/api/sites/${slug}`);
        if (r.status === 401) { window.location.href = '/'; return; }
        if (!r.ok) {
            notice.innerHTML = `<div class="notice-inline warn">${esc(r.data.message || 'ไม่พบเว็บนี้')}</div>`;
            form.style.display = 'none';
            return;
        }
        site = r.data.site;
        document.getElementById('editTitle').textContent = `✏️ แก้ไขเว็บของ ${site.partner_name}`;
        fill();
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let capOut;
        if (site.has_captions) {
            capOut = {};
            site.images.forEach((u) => { capOut[u] = (caps[u] || '').trim(); });
            const first = site.images.slice(0, 8).map((u) => capOut[u]);
            if (first.some((x) => !x)) { TU.showAlert('กรุณาพิมพ์คำใต้รูปให้ครบ (8 รูปแรกเป็นโจทย์เกม)'); return; }
            if (new Set(first.map((x) => x.toLowerCase())).size !== first.length) { TU.showAlert('มีคำใต้รูปซ้ำกัน กรุณาใช้คำที่ไม่ซ้ำกัน'); return; }
        }
        const btn = document.getElementById('edSave');
        btn.disabled = true;
        const r = await TU.api(`/api/sites/${slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                partner_name: document.getElementById('edName').value,
                start_date: document.getElementById('edDate').value,
                occasion: document.getElementById('edOccasion').value,
                letter_text: document.getElementById('edLetter').value,
                letter_sign: document.getElementById('edSign').value,
                dialog: dlgEd ? dlgEd.get() : [],
                captions: capOut
            })
        });
        btn.disabled = false;
        if (r.ok) {
            TU.showAlert('บันทึกการแก้ไขเรียบร้อยแล้ว', load);
        } else {
            TU.showAlert(esc(r.data.message || 'บันทึกไม่สำเร็จ'), r.status === 403 ? load : null);
        }
    });

    addBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', async () => {
        const files = Array.from(photoInput.files || []);
        photoInput.value = '';
        if (!files.length) return;

        const room = site.max_photos - site.images.length;
        const notes = [];
        if (room <= 0) {
            TU.showAlert(`เว็บนี้มีรูปครบ ${site.max_photos} รูปแล้ว ลบบางรูปก่อนจึงเพิ่มได้`);
            return;
        }
        if (files.length > room) notes.push(`เพิ่มได้อีกแค่ ${room} รูป ระบบจะใช้ ${room} รูปแรกที่เลือก`);

        addBtn.disabled = true;
        addBtn.textContent = 'กำลังอัปโหลด...';
        const out = await TU.shrinkMany(files.slice(0, room));
        if (out.failed.length) notes.push('เปิดไฟล์เหล่านี้ไม่ได้: ' + out.failed.map(esc).join(', '));

        if (out.blobs.length) {
            const fd = new FormData();
            out.blobs.forEach((b, i) => fd.append('images', b, `photo${i + 1}.jpg`));
            const r = await TU.api(`/api/sites/${slug}/images`, { method: 'POST', body: fd });
            if (r.ok) { site.images = r.data.images; site.image_count = site.images.length; renderPhotos(); }
            else notes.push(esc(r.data.message || 'อัปโหลดไม่สำเร็จ'));
        }
        addBtn.disabled = !site.can_edit;
        addBtn.textContent = '+ เพิ่มรูป';
        if (notes.length) TU.showAlert(notes.join('<br>'));
    });

    async function deletePhoto(url) {
        if (!window.confirm('ลบรูปนี้ออกจากเว็บใช่ไหม?')) return;
        const r = await TU.postJson(`/api/sites/${slug}/images/delete`, { url });
        if (r.ok) { site.images = r.data.images; renderPhotos(); }
        else TU.showAlert(esc(r.data.message || 'ลบรูปไม่สำเร็จ'));
    }

    async function setCover(url) {
        const r = await TU.postJson(`/api/sites/${slug}/images/cover`, { url });
        if (r.ok) { site.images = r.data.images; renderPhotos(); }
        else TU.showAlert(esc(r.data.message || 'ตั้งรูปปกไม่สำเร็จ'));
    }

    load();
});
