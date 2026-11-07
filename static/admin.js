/* =========================================
   TUARAI - หลังบ้านแอดมิน: ตัวเลขรายได้ + ตรวจสลิป อนุมัติ/ปฏิเสธ
   ========================================= */
document.addEventListener('DOMContentLoaded', async () => {
    const TU = window.TU;
    const esc = TU.escapeHtml;
    const root = document.getElementById('adminRoot');
    if (!root) return;

    const $ = (id) => document.getElementById(id);
    const disabledBox = $('adminDisabled'), loginBox = $('adminLogin'), mainBox = $('adminMain');
    const logoutBtn = $('adminLogout'), tbody = $('adminOrders');
    let timer = null, orders = [], filter = 'review', lastReview = null;
    const baseTitle = document.title;

    const STATUS = {
        completed: ['ชำระแล้ว', '#00ff88'], pending: ['รอชำระ', '#ffaa00'], review: ['รอตรวจสลิป', '#5ab0ff'],
        rejected: ['ไม่ผ่าน', '#ff5a5a'], cancelled: ['ยกเลิก', '#888888']
    };
    const baht = (n) => TU.money(Math.round(n || 0)) + ' ฿';
    const fmtTime = (s) => {
        if (!s) return '-';
        const d = new Date(String(s).replace(' ', 'T') + 'Z');
        if (isNaN(d)) return esc(s);
        return d.toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    function showLogin() {
        loginBox.style.display = 'block'; mainBox.style.display = 'none'; logoutBtn.style.display = 'none';
        clearInterval(timer);
    }

    /* ---------- สถิติ ---------- */
    function delta(cur, prev) {
        if (!prev) return cur ? '<small class="up">ใหม่</small>' : '';
        const p = (cur - prev) / prev * 100;
        return `<small class="${p >= 0 ? 'up' : 'down'}">${p >= 0 ? '▲' : '▼'} ${Math.abs(p).toFixed(0)}%</small>`;
    }
    function bars(el, items, fmt) {
        const max = Math.max(1, ...items.map((i) => i.value));
        el.innerHTML = items.length ? items.map((i) => `
            <div class="ad-bar" ${i.key ? `data-${i.key[0]}="${esc(i.key[1])}"` : ''}><span class="n">${esc(i.label)}</span>
            <span class="b"><i style="width:${Math.max(3, i.value / max * 100)}%"></i></span>
            <span class="v">${fmt(i)}</span></div>`).join('') : '<p class="muted">ยังไม่มีข้อมูล</p>';
    }
    function chart(days) {
        const W = 720, H = 190, P = 24, max = Math.max(1, ...days.map((d) => d.amount));
        const bw = (W - P * 2) / days.length;
        const bars = days.map((d, i) => {
            const h = d.amount / max * (H - 50), x = P + i * bw;
            return `<g data-day="${d.date}" style="cursor:pointer"><title>${d.date}: ${baht(d.amount)} (${d.orders} ออเดอร์)</title>
                <rect x="${x + 2}" y="${H - 26 - h}" width="${Math.max(2, bw - 4)}" height="${Math.max(h, d.amount ? 2 : 0)}" rx="3" fill="url(#adg)" opacity="${d.amount ? 1 : .15}"/></g>`;
        }).join('');
        const lab = days.filter((_, i) => i % 5 === 0 || i === days.length - 1).map((d) => {
            const i = days.indexOf(d);
            return `<text x="${P + i * bw + bw / 2}" y="${H - 8}" text-anchor="middle" fill="#888" font-size="10">${d.date.slice(8)}/${d.date.slice(5, 7)}</text>`;
        }).join('');
        $('adChart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="กราฟรายได้รายวัน">
            <defs><linearGradient id="adg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5d6c"/><stop offset="1" stop-color="#8b0000"/></linearGradient></defs>
            <text x="${P}" y="14" fill="#888" font-size="10">สูงสุด ${baht(max)}</text>
            <line x1="${P}" x2="${W - P}" y1="${H - 26}" y2="${H - 26}" stroke="#333"/>${bars}${lab}</svg>`;
    }
    // การ์ด "รอตรวจสลิป" คำนวณจากรายการออเดอร์จริงที่โหลดมา (ตรงกับตารางเสมอ)
    function updateReviewCard() {
        const el = $('adReviewCard'); if (!el) return;
        const list = orders.filter((o) => o.status === 'review');
        el.innerHTML = `<span>รอตรวจสลิป</span><b>${list.length} <em>ออเดอร์</em></b><small>${list.length ? baht(list.reduce((a, o) => a + o.amount, 0)) + ' · กดเพื่อตรวจ' : 'ไม่มีสลิปค้างตรวจ'}</small>`;
        el.classList.toggle('alert', list.length > 0);
    }
    async function loadStats() {
        const r = await TU.api('/api/admin/stats');
        if (!r.ok) return;
        const s = r.data.stats;
        $('adCards').innerHTML = `
            <div class="ad-card hot" data-d="review" id="adReviewCard"></div>
            <div class="ad-card" data-d="today"><span>รายได้วันนี้</span><b>${baht(s.today.amount)}</b>${delta(s.today.amount, s.today.vs_yesterday)} <small>${s.today.orders} ออเดอร์</small></div>
            <div class="ad-card" data-d="month"><span>รายได้เดือนนี้</span><b>${baht(s.month.amount)}</b>${delta(s.month.amount, s.month.vs_last)} <small>${s.month.orders} ออเดอร์</small></div>
            <div class="ad-card" data-d="total"><span>รายได้ทั้งหมด (อนุมัติแล้ว)</span><b>${baht(s.total.amount)}</b><small>${s.total.orders} ออเดอร์</small></div>
            <div class="ad-card" data-d="sites"><span>เว็บที่ใช้งานอยู่</span><b>${s.sites.active}</b><small>${s.sites.expiring7 ? `<i class="down">ใกล้หมดอายุ 7 วัน: ${s.sites.expiring7}</i>` : 'ไม่มีเว็บใกล้หมดอายุ'}</small></div>
            <div class="ad-card" data-d="users"><span>สมาชิก</span><b>${s.users}</b><small>รอชำระ ${s.pending} ออเดอร์</small></div>`;
        updateReviewCard();
        chart(s.daily);
        $('adChartTotal').textContent = 'รวม ' + baht(s.daily.reduce((a, d) => a + d.amount, 0));
        bars($('adMonths'), s.months.map((m) => ({ label: m.month, value: m.amount, key: ['month', m.month] })), (i) => baht(i.value));
        bars($('adThemes'), s.by_theme.slice(0, 6).map((t) => ({ label: t.name, value: t.amount, n: t.orders, key: ['theme', t.name] })), (i) => `${baht(i.value)} · ${i.n}`);
        bars($('adKinds'), s.by_kind.concat(s.by_package).map((t) => ({ label: t.name, value: t.amount, n: t.orders })), (i) => `${baht(i.value)} · ${i.n}`);
        const c = s.conversion;
        $('adConv').innerHTML = `<p class="ad-big">${c.rate.toFixed(0)}<em>%</em></p>
            <p class="muted">สร้างเว็บ ${c.created} → จ่ายเงินแล้ว ${c.paid}<br>แบบร่างที่ยังไม่จ่าย ${s.sites.draft}</p>`;
    }

    /* ---------- ออเดอร์ ---------- */
    function renderOrders() {
        const rows = orders.filter((o) => filter === 'all' || o.status === filter);
        $('adCntReview').textContent = orders.filter((o) => o.status === 'review').length;
        if (!rows.length) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text-muted)">${filter === 'review' ? '🎉 ไม่มีสลิปรอตรวจ' : 'ไม่มีรายการ'}</td></tr>`;
            return;
        }
        tbody.innerHTML = rows.map((o) => {
            const st = STATUS[o.status] || [o.status, '#888'];
            const actionable = o.status === 'review' || o.status === 'pending';
            return `<tr class="clk" data-oid="${o.id}">
                <td>#${o.id}</td>
                <td>${esc(o.username || '-')}<br><small class="muted">${esc(o.email || '')}</small></td>
                <td>${esc(o.kind_label)}<br><small class="muted">${esc(String(o.package_type || '').toUpperCase())}</small></td>
                <td>${esc(o.partner_name || '-')}<br><small class="muted">${esc((o.slug || '').slice(0, 8))}</small></td>
                <td><b>${TU.money(o.amount)} ฿</b></td>
                <td><small class="muted">${fmtTime(o.created_at)}</small></td>
                <td style="color:${st[1]}">${esc(st[0])}</td>
                <td>${o.has_slip ? `<button class="btn-small" data-act="slip" data-id="${o.id}">ดูสลิป</button>` : '-'}</td>
                <td class="actions-cell">${actionable ? `
                    <button class="btn-small primary" data-act="approve" data-id="${o.id}">อนุมัติ</button>
                    <button class="btn-small danger" data-act="reject" data-id="${o.id}">ปฏิเสธ</button>` : ''}
                    <button class="btn-small" data-act="del" data-id="${o.id}" title="ลบออเดอร์นี้ถาวร">🗑</button></td>
            </tr>`;
        }).join('');
    }
    async function loadOrders() {
        const r = await TU.api('/api/admin/orders');
        if (r.status === 403) { disabledBox.style.display = 'block'; loginBox.style.display = 'none'; return false; }
        if (r.status === 401) { showLogin(); return false; }
        if (!r.ok) return false;
        loginBox.style.display = 'none'; mainBox.style.display = 'block'; logoutBtn.style.display = 'inline-block';
        orders = r.data.orders;
        const n = orders.filter((o) => o.status === 'review').length;
        document.title = (n ? `(${n}) ` : '') + baseTitle;
        if (lastReview !== null && n > lastReview) beep();
        lastReview = n;
        renderOrders();
        updateReviewCard();
        return true;
    }
    function beep() {   // เสียงเตือนเบาๆ เมื่อมีสลิปใหม่เข้ามา
        try {
            const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain();
            o.frequency.value = 880; g.gain.value = .08; o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + .18);
        } catch (e) { /* ไม่เป็นไร */ }
    }
    async function refreshAll() { if (await loadOrders()) loadStats(); }

    $('adTabs').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-f]'); if (!b) return;
        filter = b.dataset.f;
        $('adTabs').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        renderOrders();
    });

    /* ---------- อนุมัติ / ปฏิเสธ ---------- */
    async function approve(id) {
        if (!window.confirm(`ยืนยันอนุมัติออเดอร์ #${id}? เว็บจะเปิดใช้งานทันที`)) return false;
        const r = await TU.postJson(`/api/admin/orders/${id}/approve`, {});
        if (!r.ok) { TU.showAlert(esc(r.data.message || 'อนุมัติไม่สำเร็จ')); return false; }
        return true;
    }
    async function reject(id, note) {
        const r = await TU.postJson(`/api/admin/orders/${id}/reject`, { note });
        if (!r.ok) { TU.showAlert(esc(r.data.message || 'ปฏิเสธไม่สำเร็จ')); return false; }
        return true;
    }

    /* ---------- ลบถาวร (ยืนยันก่อนทุกครั้ง) ---------- */
    async function doDelete(type, ids, msg, typed) {
        if (!ids.length) return false;
        if (!window.confirm(msg)) return false;
        if (typed && (window.prompt('พิมพ์คำว่า ลบ เพื่อยืนยันการลบถาวร') || '').trim() !== 'ลบ') return false;
        const r = await TU.postJson('/api/admin/delete', { type, ids });
        if (!r.ok) { TU.showAlert(esc(r.data.message || 'ลบไม่สำเร็จ')); return false; }
        closeDet(); await refreshAll(); return true;
    }
    function delOrders(ids) {
        const paid = orders.filter((o) => ids.map(String).includes(String(o.id)) && o.status === 'completed').length;
        return doDelete('orders', ids, `ลบ ${ids.length} ออเดอร์ถาวร? ลบแล้วกู้คืนไม่ได้` + (paid ? `\n\n⚠ มี ${paid} ออเดอร์ที่ชำระแล้ว รายได้จะหายจากสถิติ (เว็บของลูกค้ายังอยู่)` : ''), paid > 0);
    }
    $('adBulkDel').addEventListener('click', () => {
        const rows = orders.filter((o) => filter === 'all' || o.status === filter);
        if (!rows.length) { TU.showAlert('ไม่มีรายการในแท็บนี้'); return; }
        delOrders(rows.map((o) => o.id));
    });

    const modal = $('adSlip');
    let cur = null;
    function openSlip(id) {
        cur = orders.find((o) => String(o.id) === String(id)); if (!cur) return;
        $('adSlipImg').src = `/slips/${cur.id}`;
        $('adSlipNo').textContent = `ออเดอร์ #${cur.id} · ${cur.kind_label}`;
        $('adSlipAmt').textContent = `ยอดที่ต้องได้ ${TU.money(cur.amount)} ฿`;
        $('adSlipInfo').innerHTML = `${esc(cur.username || '-')} <small class="muted">${esc(cur.email || '')}</small><br>เว็บ: ${esc(cur.partner_name || '-')}`;
        $('adSlipNote').value = '';
        const actionable = cur.status === 'review' || cur.status === 'pending';
        $('adSlipOk').style.display = $('adSlipNo2').style.display = $('adSlipNote').style.display = actionable ? '' : 'none';
        modal.hidden = false;
    }
    const closeSlip = () => { modal.hidden = true; cur = null; };
    $('adSlipClose').addEventListener('click', closeSlip);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeSlip(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeSlip(); });
    $('adSlipOk').addEventListener('click', async () => { const id = cur.id; if (await approve(id)) { closeSlip(); refreshAll(); } });
    $('adSlipNo2').addEventListener('click', async () => {
        const id = cur.id, note = $('adSlipNote').value.trim() || 'สลิปไม่ผ่านการตรวจสอบ';
        if (await reject(id, note)) { closeSlip(); refreshAll(); }
    });

    tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.dataset.act === 'slip') { openSlip(id); return; }
        if (btn.dataset.act === 'del') { await delOrders([id]); return; }
        if (btn.dataset.act === 'approve') { await approve(id); }
        else {
            const note = window.prompt('เหตุผลที่ปฏิเสธ (ลูกค้าจะเห็นว่าสลิปไม่ผ่าน)', 'ยอดเงินไม่ตรง') || '';
            await reject(id, note);
        }
        refreshAll();
    });


    /* ---------- หน้ารายละเอียด (กดการ์ด/แท่งกราฟ/แถวออเดอร์) ---------- */
    const det = $('adDet'), detBody = $('adDetBody'), detBack = $('adDetBack');
    let stack = [];
    const thDate = (s) => { const d = new Date(String(s || '').replace(' ', 'T') + 'Z'); return isNaN(d) ? null : new Date(d.getTime() + 7 * 3600e3); };
    const dayKey = (s) => { const d = thDate(s); return d ? d.toISOString().slice(0, 10) : ''; };
    const fmtDate = (s) => { const d = thDate(s); return d ? d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'UTC' }) : '-'; };
    function showDet(title, sub, html, push) {
        if (push !== false) stack.push({ title, sub, html });
        $('adDetTitle').textContent = title; $('adDetSub').innerHTML = sub || ''; detBody.innerHTML = html;
        detBack.hidden = stack.length < 2; det.hidden = false;
    }
    function closeDet() { det.hidden = true; stack = []; }
    detBack.addEventListener('click', () => { stack.pop(); const t = stack[stack.length - 1]; if (t) showDet(t.title, t.sub, t.html, false); });
    $('adDetClose').addEventListener('click', closeDet);
    det.addEventListener('click', (e) => { if (e.target === det) closeDet(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !det.hidden) closeDet(); });

    function orderTable(list, empty) {
        if (!list.length) return `<p class="muted" style="padding:20px 0">${empty || 'ไม่มีรายการ'}</p>`;
        const sum = list.filter((o) => o.status === 'completed').reduce((a, o) => a + o.amount, 0);
        return `<p class="muted" style="margin-bottom:10px">${list.length} รายการ${sum ? ' · รวมที่ชำระแล้ว ' + baht(sum) : ''}</p>
        <div class="table-wrapper"><table class="dash-table"><thead><tr><th>#</th><th>เวลา</th><th>ผู้ใช้</th><th>ธีม / เว็บ</th><th>รายการ</th><th>ยอด</th><th>สถานะ</th></tr></thead><tbody>
        ${list.map((o) => { const st = STATUS[o.status] || [o.status, '#888']; return `<tr class="clk" data-oid="${o.id}"><td>#${o.id}</td><td><small>${fmtTime(o.paid_at || o.created_at)}</small></td>
        <td>${esc(o.username || '-')}</td><td>${esc(o.theme_name || '-')}<br><small class="muted">${esc(o.partner_name || '')}</small></td>
        <td>${esc(o.kind_label)}<br><small class="muted">${esc(String(o.package_type || '').toUpperCase())}</small></td><td><b>${TU.money(o.amount)} ฿</b></td><td style="color:${st[1]}">${esc(st[0])}</td></tr>`; }).join('')}
        </tbody></table></div>`;
    }
    function orderDetail(o) {
        const st = STATUS[o.status] || [o.status, '#888'];
        const actionable = o.status === 'review' || o.status === 'pending';
        const row = (k, v) => `<div class="ad-kv"><span>${k}</span><b>${v}</b></div>`;
        const site = o.slug ? (o.site_status === 'active' ? `<a href="/s/${esc(o.slug)}" target="_blank" rel="noopener" style="color:var(--accent-red)">เปิดเว็บของลูกค้า ↗</a>` : '<span class="muted">แบบร่าง (ยังไม่เปิดใช้งาน)</span>') : '-';
        return `<div class="ad-kvs">
            ${row('สถานะ', `<span style="color:${st[1]}">${esc(st[0])}</span>`)}
            ${row('ยอดเงิน', baht(o.amount))}
            ${row('ประเภท', esc(o.kind_label) + ' · ' + esc(String(o.package_type || '').toUpperCase()))}
            ${row('ลูกค้า', `${esc(o.username || '-')} <small class="muted">${esc(o.email || '')}</small>`)}
            ${row('ธีม', esc(o.theme_name || '-'))}
            ${row('ชื่อในเว็บ', esc(o.partner_name || '-'))}
            ${row('เว็บ', site)}
            ${row('แพ็กเกจเว็บตอนนี้', esc(String(o.site_package || '-').toUpperCase()) + (o.site_expires ? ' · หมดอายุ ' + fmtDate(o.site_expires) : ' · ไม่มีวันหมดอายุ'))}
            ${row('สั่งซื้อเมื่อ', fmtTime(o.created_at))}
            ${row('ชำระเมื่อ', o.paid_at ? fmtTime(o.paid_at) : '-')}
            ${o.note ? row('หมายเหตุ', esc(o.note)) : ''}
        </div>
        <div class="ad-det-act">
            ${o.has_slip ? `<button class="btn-small" data-dact="slip" data-id="${o.id}">ดูสลิป</button>` : ''}
            ${actionable ? `<button class="btn-small primary" data-dact="approve" data-id="${o.id}">อนุมัติ</button><button class="btn-small danger" data-dact="reject" data-id="${o.id}">ปฏิเสธ</button>` : ''}
            <button class="btn-small" data-dact="del" data-id="${o.id}">🗑 ลบออเดอร์</button>
        </div>`;
    }
    const byPeriod = (fn) => orders.filter((o) => o.status === 'completed' && fn(dayKey(o.paid_at || o.created_at)));
    async function openCard(kind) {
        const today = dayKey(new Date().toISOString().replace('T', ' ').slice(0, 19));
        if (kind === 'review') { filter = 'review'; $('adTabs').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.dataset.f === 'review')); renderOrders(); $('adTabs').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
        if (kind === 'today') showDet('รายได้วันนี้', fmtDate(today + ' 00:00:00'), orderTable(byPeriod((d) => d === today), 'วันนี้ยังไม่มีออเดอร์ที่ชำระแล้ว'));
        if (kind === 'month') showDet('รายได้เดือนนี้', '', orderTable(byPeriod((d) => d.slice(0, 7) === today.slice(0, 7)), 'เดือนนี้ยังไม่มี'));
        if (kind === 'total') showDet('ออเดอร์ที่ชำระแล้วทั้งหมด', '', orderTable(byPeriod(() => true)));
        if (kind === 'sites') {
            const r = await TU.api('/api/admin/sites'); if (!r.ok) return;
            const list = r.data.sites.filter((x) => x.status === 'active');
            const soon = Date.now() + 7 * 864e5;
            showDet('เว็บที่ใช้งานอยู่', `${list.length} เว็บ`, `<div class="table-wrapper"><table class="dash-table"><thead><tr><th>เว็บ</th><th>ธีม</th><th>เจ้าของ</th><th>แพ็กเกจ</th><th>หมดอายุ</th><th>รูป</th><th></th><th></th></tr></thead><tbody>
            ${list.map((x) => { const ex = x.expires_at ? new Date(x.expires_at.replace(' ', 'T') + 'Z') : null; const near = ex && ex.getTime() < soon;
                return `<tr><td>${esc(x.partner_name || '-')}<br><small class="muted">${esc(x.slug.slice(0, 8))}</small></td><td>${esc(x.theme_name || '-')}</td><td>${esc(x.username || '-')}<br><small class="muted">${esc(x.email || '')}</small></td>
                <td>${esc(String(x.package || '-').toUpperCase())}</td><td style="${near ? 'color:#ff7a7a' : ''}">${x.expires_at ? fmtDate(x.expires_at) + (near ? ' ⚠' : '') : 'ไม่หมดอายุ'}</td><td>${x.photos}</td>
                <td><a href="/s/${esc(x.slug)}" target="_blank" rel="noopener" style="color:var(--accent-red)">เปิด ↗</a></td><td><button class="btn-small danger" data-dact="delsite" data-id="${x.id}">🗑 ลบ</button></td></tr>`; }).join('')}</tbody></table></div>`);
        }
        if (kind === 'users') {
            const r = await TU.api('/api/admin/users'); if (!r.ok) return;
            showDet('สมาชิกทั้งหมด', `${r.data.users.length} คน`, `<div class="table-wrapper"><table class="dash-table"><thead><tr><th>ชื่อผู้ใช้</th><th>อีเมล</th><th>สมัครเมื่อ</th><th>เว็บ</th><th>ออเดอร์</th><th>ยอดซื้อรวม</th><th></th></tr></thead><tbody>
            ${r.data.users.map((u) => `<tr data-uid="${u.id}" class="clk"><td>${esc(u.username)}</td><td>${esc(u.email)}</td><td><small>${fmtDate(u.created_at)}</small></td><td>${u.sites}</td><td>${u.orders}</td><td><b>${baht(u.spent)}</b></td><td><button class="btn-small danger" data-dact="deluser" data-id="${u.id}">🗑 ลบ</button></td></tr>`).join('')}</tbody></table></div>`);
        }
    }
    function openDay(day) {
        const list = byPeriod((d) => d === day);
        showDet('รายได้วันที่ ' + fmtDate(day + ' 00:00:00'), '', orderTable(list, 'วันนี้ไม่มีออเดอร์ที่ชำระแล้ว'));
    }
    $('adCards').addEventListener('click', (e) => { const c = e.target.closest('[data-d]'); if (c) openCard(c.dataset.d); });
    $('adChart').addEventListener('click', (e) => { const g = e.target.closest('[data-day]'); if (g) openDay(g.dataset.day); });
    ['adMonths', 'adThemes'].forEach((id) => $(id).addEventListener('click', (e) => {
        const b = e.target.closest('.ad-bar'); if (!b) return;
        if (b.dataset.month) showDet('รายได้เดือน ' + b.dataset.month, '', orderTable(byPeriod((d) => d.slice(0, 7) === b.dataset.month)));
        if (b.dataset.theme) showDet('ธีม: ' + b.dataset.theme, '', orderTable(byPeriod(() => true).filter((o) => o.theme_name === b.dataset.theme)));
    }));
    document.addEventListener('click', (e) => {
        const tr = e.target.closest('tr[data-oid]');
        if (tr && !e.target.closest('button, a')) {
            const o = orders.find((x) => String(x.id) === tr.dataset.oid); if (o) showDet('ออเดอร์ #' + o.id, '', orderDetail(o));
            return;
        }
        const ut = e.target.closest('tr[data-uid]');
        if (ut && !e.target.closest('button, a')) {
            const name = ut.children[0].textContent, list = orders.filter((o) => o.username === name);
            showDet('สมาชิก: ' + name, esc(ut.children[1].textContent), orderTable(list, 'ยังไม่มีออเดอร์'));
            return;
        }
        const b = e.target.closest('[data-dact]'); if (!b) return;
        const id = b.dataset.id;
        if (b.dataset.dact === 'slip') { openSlip(id); return; }
        if (b.dataset.dact === 'del') { delOrders([id]); return; }
        if (b.dataset.dact === 'delsite') { doDelete('sites', [id], 'ลบเว็บนี้ถาวร? รูป ออเดอร์ และสลิปของเว็บนี้จะหายทั้งหมด กู้คืนไม่ได้', true); return; }
        if (b.dataset.dact === 'deluser') { doDelete('users', [id], 'ลบสมาชิกคนนี้ถาวร? เว็บ รูป ออเดอร์ และสลิปทั้งหมดของเขาจะหาย กู้คืนไม่ได้', true); return; }
        (async () => {
            let ok;
            if (b.dataset.dact === 'approve') ok = await approve(id);
            else { const note = window.prompt('เหตุผลที่ปฏิเสธ (ลูกค้าจะเห็นว่าสลิปไม่ผ่าน)', 'ยอดเงินไม่ตรง'); ok = note !== null && await reject(id, note); }
            if (ok) { closeDet(); refreshAll(); }
        })();
    });

    $('adRefresh').addEventListener('click', refreshAll);
    $('adminLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const r = await TU.postJson('/api/admin/login', { password: $('adminPw').value });
        if (r.ok) {
            $('adminPw').value = '';
            await refreshAll();
            timer = setInterval(loadOrders, 20000);
        } else {
            TU.showAlert(esc(r.data.message || 'เข้าสู่ระบบไม่สำเร็จ'));
        }
    });
    logoutBtn.addEventListener('click', async () => { await TU.postJson('/api/admin/logout', {}); showLogin(); });

    if (root.dataset.enabled !== '1') { disabledBox.style.display = 'block'; return; }
    await refreshAll();
    if (mainBox.style.display === 'block') timer = setInterval(() => { loadOrders(); }, 20000);
});
