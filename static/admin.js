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
            <div class="ad-bar"><span class="n">${esc(i.label)}</span>
            <span class="b"><i style="width:${Math.max(3, i.value / max * 100)}%"></i></span>
            <span class="v">${fmt(i)}</span></div>`).join('') : '<p class="muted">ยังไม่มีข้อมูล</p>';
    }
    function chart(days) {
        const W = 720, H = 190, P = 24, max = Math.max(1, ...days.map((d) => d.amount));
        const bw = (W - P * 2) / days.length;
        const bars = days.map((d, i) => {
            const h = d.amount / max * (H - 50), x = P + i * bw;
            return `<g><title>${d.date}: ${baht(d.amount)} (${d.orders} ออเดอร์)</title>
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
    async function loadStats() {
        const r = await TU.api('/api/admin/stats');
        if (!r.ok) return;
        const s = r.data.stats;
        $('adCards').innerHTML = `
            <div class="ad-card hot"><span>รอตรวจสลิป</span><b>${s.review.orders} <em>ออเดอร์</em></b><small>${baht(s.review.amount)}</small></div>
            <div class="ad-card"><span>รายได้วันนี้</span><b>${baht(s.today.amount)}</b>${delta(s.today.amount, s.today.vs_yesterday)} <small>${s.today.orders} ออเดอร์</small></div>
            <div class="ad-card"><span>รายได้เดือนนี้</span><b>${baht(s.month.amount)}</b>${delta(s.month.amount, s.month.vs_last)} <small>${s.month.orders} ออเดอร์</small></div>
            <div class="ad-card"><span>รายได้ทั้งหมด (อนุมัติแล้ว)</span><b>${baht(s.total.amount)}</b><small>${s.total.orders} ออเดอร์</small></div>
            <div class="ad-card"><span>เว็บที่ใช้งานอยู่</span><b>${s.sites.active}</b><small>${s.sites.expiring7 ? `<i class="down">ใกล้หมดอายุ 7 วัน: ${s.sites.expiring7}</i>` : 'ไม่มีเว็บใกล้หมดอายุ'}</small></div>
            <div class="ad-card"><span>สมาชิก</span><b>${s.users}</b><small>รอชำระ ${s.pending} ออเดอร์</small></div>`;
        chart(s.daily);
        $('adChartTotal').textContent = 'รวม ' + baht(s.daily.reduce((a, d) => a + d.amount, 0));
        bars($('adMonths'), s.months.map((m) => ({ label: m.month, value: m.amount })), (i) => baht(i.value));
        bars($('adThemes'), s.by_theme.slice(0, 6).map((t) => ({ label: t.name, value: t.amount, n: t.orders })), (i) => `${baht(i.value)} · ${i.n}`);
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
            return `<tr>
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
                    <button class="btn-small danger" data-act="reject" data-id="${o.id}">ปฏิเสธ</button>` : ''}</td>
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
        if (btn.dataset.act === 'approve') { await approve(id); }
        else {
            const note = window.prompt('เหตุผลที่ปฏิเสธ (ลูกค้าจะเห็นว่าสลิปไม่ผ่าน)', 'ยอดเงินไม่ตรง') || '';
            await reject(id, note);
        }
        refreshAll();
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
