/* =========================================
   TUARAI - สคริปต์หลักของหน้าร้าน (ล็อกอิน / เลือกซื้อ / Dashboard / ส่งมอบ QR)
   ต้องโหลด common.js ก่อนไฟล์นี้เสมอ
   ========================================= */
document.addEventListener('DOMContentLoaded', async () => {
    const TU = window.TU;
    const esc = TU.escapeHtml;

    // ----------------- 1. Session + Modal ล็อกอิน/สมัครสมาชิก -----------------
    const navAuthBtn = document.getElementById('navAuthBtn');
    let isUserLoggedIn = false;

    try {
        const s = await TU.api('/api/check-session');
        if (s.data && s.data.logged_in) {
            isUserLoggedIn = true;
            if (navAuthBtn) {
                navAuthBtn.textContent = `ยินดีต้อนรับ, ${s.data.user.username}`;
                navAuthBtn.dataset.loggedIn = 'true';
            }
        }
    } catch (e) { /* ใช้งานต่อได้แม้เช็ก session ไม่สำเร็จ */ }

    let authModal = null;
    function openAuthModal(tab) {
        if (!authModal) return;
        authModal.style.display = 'flex';
        document.getElementById(tab === 'register' ? 'tabRegister' : 'tabLogin').click();
    }

    if (navAuthBtn) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="authModal" class="modal-overlay" style="display: none;">
                <div class="modal-content">
                    <span class="close-modal" id="closeAuth">&times;</span>
                    <div class="modal-tabs">
                        <button class="tab-btn active" id="tabLogin" type="button">เข้าสู่ระบบ</button>
                        <button class="tab-btn" id="tabRegister" type="button">สมัครสมาชิก</button>
                    </div>
                    <form id="formLogin" class="auth-form">
                        <h3>เข้าสู่ระบบ TUARAI</h3>
                        <input type="text" id="loginUsername" placeholder="ชื่อผู้ใช้ (Username)" required>
                        <input type="password" id="loginPassword" placeholder="รหัสผ่าน" required>
                        <button type="submit" class="btn-submit">เข้าสู่ระบบ</button>
                    </form>
                    <form id="formRegister" class="auth-form" style="display: none;">
                        <h3>สมัครสมาชิกใหม่</h3>
                        <input type="text" id="regUsername" placeholder="ชื่อผู้ใช้ (Username)" required>
                        <input type="email" id="regEmail" placeholder="อีเมล" required>
                        <input type="password" id="regPassword" placeholder="รหัสผ่าน" required>
                        <p class="photo-hint">การสมัครสมาชิกถือว่าคุณได้อ่านและยอมรับ <a href="/terms" target="_blank" rel="noopener" style="color:var(--accent-red)">ข้อตกลงการใช้งาน</a> และ <a href="/privacy" target="_blank" rel="noopener" style="color:var(--accent-red)">นโยบายความเป็นส่วนตัว</a></p>
                        <button type="submit" class="btn-submit">สมัครสมาชิก</button>
                    </form>
                </div>
            </div>`);

        authModal = document.getElementById('authModal');
        const tabLogin = document.getElementById('tabLogin');
        const tabRegister = document.getElementById('tabRegister');
        const formLogin = document.getElementById('formLogin');
        const formRegister = document.getElementById('formRegister');

        navAuthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (navAuthBtn.dataset.loggedIn === 'true') {
                window.location.href = '/dashboard';
            } else {
                openAuthModal('login');
            }
        });

        document.getElementById('closeAuth').addEventListener('click', () => { authModal.style.display = 'none'; });
        authModal.addEventListener('click', (e) => { if (e.target === authModal) authModal.style.display = 'none'; });

        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            formLogin.style.display = 'block';
            formRegister.style.display = 'none';
        });
        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            formRegister.style.display = 'block';
            formLogin.style.display = 'none';
        });

        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            const r = await TU.postJson('/api/register', {
                username: document.getElementById('regUsername').value,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value
            });
            TU.showAlert(esc(r.data.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์'), () => {
                if (r.ok) tabLogin.click();
            });
        });

        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const r = await TU.postJson('/api/login', {
                username: document.getElementById('loginUsername').value,
                password: document.getElementById('loginPassword').value
            });
            TU.showAlert(esc(r.data.message || 'เกิดข้อผิดพลาดในการล็อกอิน'), () => {
                if (r.ok) window.location.reload();
            });
        });
    }

    // ปุ่มออกจากระบบ (หน้า Dashboard / แก้ไข / ชำระเงิน)
    const logoutBtn = document.getElementById('dashboardLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await TU.postJson('/api/logout', {});
            window.location.href = '/';
        });
    }

    // ----------------- 2. หน้าแรก: เลือกซื้อเว็บ -> เลือกแพ็กเกจ -> สร้างตัวอย่าง -----------------
    const DATA = window.TUARAI_DATA;
    if (DATA) {
        document.querySelectorAll('.btn-choose').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (!isUserLoggedIn) {
                    TU.showAlert('กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนเลือกซื้อเว็บ', () => openAuthModal('login'));
                    return;
                }
                const theme = DATA.themes.find((t) => String(t.id) === btn.dataset.themeId);
                if (theme) openBuyModal(theme);
            });
        });
    }

    function openBuyModal(theme) {
        const old = document.getElementById('buyModal');
        if (old) old.remove();

        const pk = DATA.packages;
        const feats = DATA.features;
        const cardHtml = (key, checked) => `
            <label class="pkg-option ${checked ? 'selected' : ''}" data-pkg="${key}">
                <input type="radio" name="buyPkg" value="${key}" ${checked ? 'checked' : ''}>
                <span class="pkg-option-head">
                    <strong>${esc(pk[key].label)}</strong>
                    <span class="pkg-option-price">${TU.money(theme.prices[key])} ฿</span>
                </span>
                <ul class="pkg-features small">${feats[key].map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
                ${key === 'pro' ? '<span class="pkg-badge">คุ้มที่สุด</span>' : ''}
            </label>`;

        document.body.insertAdjacentHTML('beforeend', `
            <div id="buyModal" class="modal-overlay" style="display: flex;">
                <div class="modal-content buy-modal">
                    <span class="close-modal" id="buyClose">&times;</span>
                    <h3 class="buy-title">🛒 ${esc(theme.name)}</h3>
                    <p class="photo-hint">ซื้อ 1 ครั้งได้ 1 เว็บ เลือกแพ็กเกจของเว็บนี้ แล้วกรอกข้อมูล ระบบจะสร้างตัวอย่างให้ดูก่อน ยังไม่ต้องจ่ายเงินตอนนี้</p>

                    <div class="pkg-choice">${cardHtml('basic', false)}${cardHtml('pro', true)}</div>

                    <form id="buyForm" class="auth-form">
                        <label class="field-label">โอกาสที่จะมอบให้</label>
                        <select id="buyOccasion">
                            <option value="anniversary">💞 วันครบรอบ</option>
                            <option value="birthday">🎂 วันเกิด</option>
                        </select>

                        <label class="field-label">ชื่อแฟน / คนพิเศษ</label>
                        <input type="text" id="buyName" maxlength="60" placeholder="พิมพ์ชื่อ" required>

                        <label class="field-label" id="buyDateLabel">วันที่เริ่มคบกัน (หรือวันพิเศษ)</label>
                        <input type="date" id="buyDate" required>

                        <label class="field-label">ข้อความจดหมายบอกรัก</label>
                        <textarea id="buyLetter" rows="4" maxlength="3000" placeholder="เขียนความในใจถึงแฟน..." required></textarea>

                        <label class="field-label">ลงชื่อผู้ส่ง (ของคุณ)</label>
                        <input type="text" id="buySign" maxlength="60" placeholder="เช่น จากพี่เอง" required>

                        ${theme.has_dialog ? `<label class="field-label">💬 บทสนทนาวิชวลโนเวล (ให้แฟนเลือกตอบ)</label><div id="buyDialog" class="dlg-box"></div>` : ''}

                        <label class="field-label">รูปภาพความทรงจำ</label>
                        <input type="file" id="buyPhotos" accept="image/*" multiple hidden>
                        <div class="photo-pick-row">
                            <button type="button" id="buyPhotoBtn" class="btn-small">+ เลือกรูปจากเครื่อง</button>
                            <span id="buyPhotoCount" class="photo-hint"></span>
                        </div>
                        <div id="buyPhotoPreview" class="photo-grid"></div>
                        <p class="photo-hint" id="buyPhotoRule"></p>
                        <p class="photo-hint" id="buyPhotoHintCap" style="display:none">🐱 เกมจับคู่: พิมพ์ "คำใต้รูป" ให้ครบทุกรูป (ใช้ 8 รูปแรกเป็นโจทย์) เช่น วันเกิด, ทะเล, วันแรกที่เจอ แต่ละรูปควรใช้คำไม่ซ้ำกัน แฟนจะต้องลากเส้นโยงคำให้ตรงกับรูป</p>

                        <button type="submit" class="btn-submit" id="buySubmit">สร้างตัวอย่างเว็บให้ดูก่อน</button>
                    </form>
                </div>
            </div>`);

        const modal = document.getElementById('buyModal');
        const close = () => modal.remove();
        document.getElementById('buyClose').addEventListener('click', close);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

        const selectedPkg = () => modal.querySelector('input[name="buyPkg"]:checked').value;
        const ruleEl = document.getElementById('buyPhotoRule');

        const picker = TU.photoPicker({
            input: document.getElementById('buyPhotos'),
            button: document.getElementById('buyPhotoBtn'),
            preview: document.getElementById('buyPhotoPreview'),
            counter: document.getElementById('buyPhotoCount'),
            getMax: () => pk[selectedPkg()].max_photos,
            captions: true,
            required: !!theme.has_captions
        });
        document.getElementById('buyPhotoPreview').classList.add('with-cap');
        if (theme.has_captions) document.getElementById('buyPhotoHintCap').style.display = '';

        function refreshRule() {
            const p = pk[selectedPkg()];
            ruleEl.textContent = `แพ็กเกจ ${p.label}: เลือกรูปได้ ${DATA.minPhotos}-${p.max_photos} รูป รูปแรกจะเป็นรูปปกและรูปใหญ่ตรงกลาง ลบแล้วเลือกใหม่ได้`;
            picker.refresh();
        }

        modal.querySelectorAll('input[name="buyPkg"]').forEach((radio) => {
            radio.addEventListener('change', () => {
                modal.querySelectorAll('.pkg-option').forEach((o) => {
                    o.classList.toggle('selected', o.dataset.pkg === selectedPkg());
                });
                const max = pk[selectedPkg()].max_photos;
                if (picker.count() > max) {
                    const extra = picker.count() - max;
                    picker.trim();
                    TU.showAlert(`แพ็กเกจ ${esc(pk[selectedPkg()].label)} ใส่รูปได้สูงสุด ${max} รูป ระบบตัดรูปท้ายสุดออกให้ ${extra} รูป`);
                }
                refreshRule();
            });
        });
        refreshRule();

        const dlgEd = theme.has_dialog ? TU.dialogEditor(document.getElementById('buyDialog'), [], { free: DATA.qFree, price: DATA.qPrice, max: DATA.qMax, allowed: DATA.qMax }) : null;
        const occSel = document.getElementById('buyOccasion');
        const occLabels = { anniversary: 'วันที่เริ่มคบกัน (หรือวันพิเศษ)', birthday: 'วันเกิดของเขา/เธอ' };
        occSel.addEventListener('change', () => {
            document.getElementById('buyDateLabel').textContent = occLabels[occSel.value] || occLabels.anniversary;
        });

        document.getElementById('buyForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const pkgKey = selectedPkg();
            const max = pk[pkgKey].max_photos;
            if (picker.count() < DATA.minPhotos) {
                TU.showAlert(`กรุณาเลือกรูปอย่างน้อย ${DATA.minPhotos} รูป (ตอนนี้เลือกไว้ ${picker.count()} รูป)`);
                return;
            }
            if (picker.count() > max) {
                TU.showAlert(`แพ็กเกจ ${esc(pk[pkgKey].label)} ใส่รูปได้สูงสุด ${max} รูป`);
                return;
            }

            if (theme.has_captions) {
                const caps = picker.captions().slice(0, 8);
                if (caps.some((x) => !x)) { TU.showAlert('กรุณาพิมพ์คำใต้รูปให้ครบ (ช่องใต้รูปแต่ละรูป ใช้ 8 รูปแรกเป็นโจทย์เกม)'); return; }
                if (new Set(caps.map((x) => x.toLowerCase())).size !== caps.length) { TU.showAlert('มีคำใต้รูปซ้ำกัน กรุณาใช้คำที่ไม่ซ้ำกัน เพื่อให้เกมจับคู่ได้ชัดเจน'); return; }
            }

            const btn = document.getElementById('buySubmit');
            const label = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'กำลังอัปโหลดและสร้างตัวอย่าง...';

            const fd = new FormData();
            fd.append('theme_id', theme.id);
            fd.append('package', pkgKey);
            fd.append('occasion', document.getElementById('buyOccasion').value);
            fd.append('partner_name', document.getElementById('buyName').value);
            fd.append('start_date', document.getElementById('buyDate').value);
            fd.append('letter_text', document.getElementById('buyLetter').value);
            fd.append('letter_sign', document.getElementById('buySign').value);
            if (dlgEd) fd.append('dialog', JSON.stringify(dlgEd.get()));
            fd.append('captions', JSON.stringify(picker.captions()));
            picker.blobs().forEach((b, i) => fd.append('images', b, `photo${i + 1}.jpg`));

            const r = await TU.api('/api/drafts', { method: 'POST', body: fd });
            if (r.ok) {
                window.location.href = r.data.preview_url;
                return;
            }
            btn.disabled = false;
            btn.textContent = label;
            if (r.status === 401) {
                TU.showAlert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', () => window.location.reload());
            } else {
                TU.showAlert(esc(r.data.message || 'เกิดข้อผิดพลาดในการสร้างตัวอย่าง'));
            }
        });
    }

    // ----------------- 3. หน้า Dashboard -----------------
    if (document.getElementById('dashUsername')) {
        loadDashboard();
    }

    const ORDER_STATUS = {
        completed: ['ชำระแล้ว', '#00ff88'],
        pending: ['รอชำระเงิน', '#ffaa00'],
        review: ['รอตรวจสอบสลิป', '#5ab0ff'],
        rejected: ['สลิปไม่ผ่าน', '#ff5a5a'],
        cancelled: ['ยกเลิก', '#888888']
    };
    const KIND_LABEL = { new: 'สร้างเว็บใหม่', upgrade: 'อัปเกรดเป็น Pro', renew: 'ต่ออายุ 1 ปี', extra_q: 'เพิ่มคำถามบทสนทนา' };

    async function loadDashboard() {
        const r = await TU.api('/api/user-profile');
        if (!r.ok) {
            window.location.href = '/';
            return;
        }
        const data = r.data;
        const user = data.user;

        document.getElementById('dashUsername').textContent = user.username;
        document.getElementById('dashEmail').textContent = user.email;
        document.getElementById('dashStatus').textContent = `สมาชิกตั้งแต่: ${String(user.created_at || '').split(' ')[0]}`;
        document.getElementById('statSitesCount').textContent = `${data.sites.length} หน้า`;

        renderSites(data);
        renderOrders(data);

        // หลังชำระเงินเสร็จ ระบบพามาที่นี่พร้อมเปิดหน้าส่งมอบ QR ให้อัตโนมัติ
        const deliver = new URLSearchParams(window.location.search).get('deliver');
        if (deliver) {
            const site = data.sites.find((s) => s.slug === deliver);
            window.history.replaceState({}, '', '/dashboard');
            if (site && site.status === 'active') openQrModal(site, data);
        }
    }

    function statusCell(s) {
        const lines = [];
        if (s.status === 'draft') {
            lines.push('<span class="st st-draft">ฉบับร่าง (ยังไม่ชำระเงิน)</span>');
        } else if (s.status === 'expired') {
            lines.push('<span class="st st-expired">หมดอายุแล้ว</span>');
        } else {
            lines.push('<span class="st st-active">ใช้งานอยู่</span>');
        }
        if (s.status === 'active') {
            if (s.expires_ts) {
                lines.push(`<small>หมดอายุ ${TU.fmtDate(s.expires_ts)} (เหลือ ${s.days_left} วัน)</small>`);
            } else {
                lines.push('<small>ไม่มีวันหมดอายุ</small>');
            }
            if (s.package === 'basic') {
                const remain = s.edit_until_ts && s.can_edit ? TU.fmtRemain(s.edit_until_ts) : '';
                lines.push(remain ? `<small>แก้ไขได้อีก ${remain}</small>` : '<small>หมดเวลาแก้ไขแล้ว</small>');
            } else {
                lines.push('<small>แก้ไขได้ไม่จำกัด</small>');
            }
        } else if (s.status === 'expired') {
            lines.push(`<small>หมดอายุเมื่อ ${TU.fmtDate(s.expires_ts)}</small>`);
        }
        if (s.open_order) {
            const o = ORDER_STATUS[s.open_order.status] || ['', '#888'];
            lines.push(`<small style="color:${o[1]}">ออเดอร์ #${s.open_order.id}: ${o[0]}</small>`);
        }
        return lines.join('<br>');
    }

    function actionButtons(s) {
        const b = [];
        const slug = esc(s.slug);
        if (s.status === 'draft') {
            b.push(`<a class="btn-small" href="/preview/${slug}">ดูตัวอย่าง &amp; ชำระเงิน</a>`);
            if (s.open_order && s.open_order.kind === 'new') {
                b.push(`<a class="btn-small" href="/pay/${s.open_order.id}">ไปหน้าชำระเงิน</a>`);
            }
            b.push(`<a class="btn-small" href="/edit/${slug}">แก้ไข</a>`);
            b.push(`<button class="btn-small danger" data-act="delete" data-slug="${slug}">ลบ</button>`);
            return b.join(' ');
        }
        if (s.status === 'active') {
            b.push(`<button class="btn-small primary" data-act="qr" data-slug="${slug}">QR / ส่งมอบ</button>`);
            b.push(`<a class="btn-small" href="/s/${slug}" target="_blank" rel="noopener">เปิดดูเว็บ</a>`);
            if (s.can_edit) b.push(`<a class="btn-small" href="/edit/${slug}">แก้ไข</a>`);
        }
        if (s.package === 'basic') {
            b.push(`<button class="btn-small" data-act="upgrade" data-slug="${slug}">อัปเกรด Pro ${TU.money(s.upgrade_price)} ฿</button>`);
            if (s.status === 'expired' || (s.days_left !== null && s.days_left <= 60)) {
                b.push(`<button class="btn-small" data-act="renew" data-slug="${slug}">ต่ออายุ ${TU.money(s.renew_price)} ฿</button>`);
            }
        }
        if (s.open_order && s.open_order.kind !== 'new') {
            b.push(`<a class="btn-small" href="/pay/${s.open_order.id}">ไปหน้าชำระเงิน #${s.open_order.id}</a>`);
        }
        return b.join(' ');
    }

    function renderSites(data) {
        const body = document.getElementById('sitesTableBody');
        if (data.sites.length === 0) {
            body.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">ยังไม่มีเว็บเซอร์ไพรส์ ไปที่หน้าแรกเพื่อเลือกซื้อเว็บที่ชอบได้เลย!</td></tr>';
            return;
        }
        body.innerHTML = data.sites.map((s) => `
            <tr>
                <td><strong>${esc(s.partner_name) || '-'}</strong><br><small class="muted">${esc(s.theme_name)} · ${s.image_count} รูป</small></td>
                <td><span class="pkg-tag pkg-${esc(s.package)}">${esc(s.package_label)}</span></td>
                <td>${statusCell(s)}</td>
                <td class="actions-cell">${actionButtons(s)}</td>
            </tr>`).join('');

        body.querySelectorAll('[data-act]').forEach((btn) => {
            btn.addEventListener('click', () => onSiteAction(btn, data));
        });
    }

    async function onSiteAction(btn, data) {
        const slug = btn.dataset.slug;
        const site = data.sites.find((s) => s.slug === slug);
        const act = btn.dataset.act;
        if (!site) return;

        if (act === 'qr') {
            openQrModal(site, data);
        } else if (act === 'delete') {
            if (!window.confirm('ลบตัวอย่างเว็บนี้ทิ้งใช่ไหม? รูปที่อัปโหลดไว้จะถูกลบด้วย')) return;
            const r = await TU.api(`/api/sites/${slug}`, { method: 'DELETE' });
            if (r.ok) window.location.reload();
            else TU.showAlert(esc(r.data.message || 'ลบไม่สำเร็จ'));
        } else if (act === 'upgrade' || act === 'renew') {
            btn.disabled = true;
            const r = await TU.postJson('/api/orders', { slug, kind: act });
            if (r.ok) {
                window.location.href = r.data.pay_url;
            } else {
                btn.disabled = false;
                TU.showAlert(esc(r.data.message || 'สร้างออเดอร์ไม่สำเร็จ'));
            }
        }
    }

    function renderOrders(data) {
        const body = document.getElementById('ordersTableBody');
        if (data.orders.length === 0) {
            body.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">ยังไม่มีประวัติการสั่งซื้อ</td></tr>';
            return;
        }
        body.innerHTML = data.orders.map((o) => {
            const st = ORDER_STATUS[o.status] || [o.status, '#888'];
            const pay = (o.status === 'pending' || o.status === 'review' || o.status === 'rejected')
                ? ` <a href="/pay/${o.id}" style="color: var(--accent-red);">ชำระเงิน</a>` : '';
            return `
                <tr>
                    <td>#ORD-${o.id}</td>
                    <td>${esc(KIND_LABEL[o.kind] || o.kind || '-')}</td>
                    <td>${esc(String(o.package_type || '').toUpperCase())}</td>
                    <td>${TU.money(o.amount)} ฿</td>
                    <td><span style="color: ${st[1]}">${esc(st[0])}</span>${pay}</td>
                    <td>${esc(o.created_at || '')}</td>
                </tr>`;
        }).join('');
    }

    // ----------------- 4. หน้าส่งมอบ QR (เลือกสไตล์ / ดาวน์โหลด / คัดลอกลิงก์) -----------------
    function openQrModal(site, data) {
        const old = document.getElementById('qrModal');
        if (old) old.remove();

        const isPro = site.package === 'pro';
        const allowed = new Set(site.qr_styles_allowed || ['plain']);
        let current = allowed.has(site.qr_style) ? site.qr_style : 'plain';

        const styleBtns = data.qr_style_order.map((key) => {
            const meta = data.qr_styles[key];
            const locked = !allowed.has(key);
            return `
                <button type="button" class="qr-style ${key === current ? 'selected' : ''} ${locked ? 'locked' : ''}" data-style="${esc(key)}">
                    <img src="/api/qr-sample.png?style=${encodeURIComponent(key)}" alt="${esc(meta.label)}" loading="lazy">
                    <span>${esc(meta.label)}${locked ? ' 🔒' : ''}</span>
                </button>`;
        }).join('');

        document.body.insertAdjacentHTML('beforeend', `
            <div id="qrModal" class="modal-overlay" style="display: flex;">
                <div class="modal-content qr-modal">
                    <span class="close-modal" id="qrClose">&times;</span>
                    <h3 class="buy-title">🎁 ส่งมอบให้ ${esc(site.partner_name)}</h3>
                    <p class="photo-hint">เว็บเปิดใช้งานแล้ว! ดาวน์โหลด QR ไปพิมพ์ใส่การ์ดหรือกล่องของขวัญ แฟนสแกนด้วยกล้องมือถือแล้วเปิดเว็บได้เลย</p>

                    <div class="qr-main"><img id="qrBig" alt="QR Code ของเว็บ"></div>

                    <div class="qr-actions">
                        <a class="btn-submit" id="qrDownload" href="#" download>⬇ ดาวน์โหลด QR (พิมพ์ได้)</a>
                        <button type="button" class="btn-small" id="qrCopy">คัดลอกลิงก์</button>
                        <a class="btn-small" href="/s/${esc(site.slug)}" target="_blank" rel="noopener">เปิดดูเว็บ</a>
                    </div>
                    <p class="photo-hint" id="qrLinkNote"></p>

                    <h4 style="margin-top: 18px;">สไตล์ QR ${isPro ? '' : '<span class="photo-hint">(แพ็กเกจ Pro เลือกสไตล์ตกแต่งได้)</span>'}</h4>
                    <div class="qr-styles">${styleBtns}</div>
                </div>
            </div>`);

        const modal = document.getElementById('qrModal');
        const big = document.getElementById('qrBig');
        const dl = document.getElementById('qrDownload');

        function applyStyle() {
            big.src = `/api/sites/${site.slug}/qr.png?style=${encodeURIComponent(current)}&size=640&t=${Date.now()}`;
            dl.href = `/api/sites/${site.slug}/qr.png?style=${encodeURIComponent(current)}&download=1`;
            modal.querySelectorAll('.qr-style').forEach((b) => b.classList.toggle('selected', b.dataset.style === current));
        }
        applyStyle();

        document.getElementById('qrLinkNote').textContent = 'ลิงก์สำรองไว้ส่งทางแชท: ' + site.public_url;
        document.getElementById('qrClose').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        document.getElementById('qrCopy').addEventListener('click', async () => {
            const ok = await TU.copyText(site.public_url);
            TU.showAlert(ok ? 'คัดลอกลิงก์แล้ว ส่งให้แฟนเปิดได้เลย' : 'คัดลอกอัตโนมัติไม่ได้ กดค้างที่ลิงก์ด้านล่างเพื่อคัดลอกเอง')
            ;
        });

        modal.querySelectorAll('.qr-style').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const key = btn.dataset.style;
                if (!allowed.has(key)) {
                    const price = site.upgrade_price ? TU.money(site.upgrade_price) : '';
                    TU.showAlert(`สไตล์ QR ตกแต่งใช้ได้เฉพาะแพ็กเกจ Pro<br>อัปเกรดเว็บนี้จ่ายส่วนต่างแค่ ${price} ฿ ที่ปุ่ม "อัปเกรด Pro" ในตารางเว็บของคุณ`);
                    return;
                }
                const r = await TU.postJson(`/api/sites/${site.slug}/qr-style`, { style: key });
                if (r.ok) {
                    current = key;
                    site.qr_style = key;
                    applyStyle();
                } else {
                    TU.showAlert(esc(r.data.message || 'เปลี่ยนสไตล์ไม่สำเร็จ'));
                }
            });
        });
    }
});
