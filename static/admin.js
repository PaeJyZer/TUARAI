/* =========================================
   TUARAI - หลังบ้านแอดมิน: ตรวจสลิป อนุมัติ/ปฏิเสธ
   ========================================= */
document.addEventListener('DOMContentLoaded', async () => {
    const TU = window.TU;
    const esc = TU.escapeHtml;
    const root = document.getElementById('adminRoot');
    if (!root) return;

    const disabledBox = document.getElementById('adminDisabled');
    const loginBox = document.getElementById('adminLogin');
    const mainBox = document.getElementById('adminMain');
    const logoutBtn = document.getElementById('adminLogout');
    const tbody = document.getElementById('adminOrders');
    let timer = null;

    const STATUS = {
        completed: ['ชำระแล้ว', '#00ff88'], pending: ['รอชำระ', '#ffaa00'], review: ['รอตรวจสลิป', '#5ab0ff'],
        rejected: ['ไม่ผ่าน', '#ff5a5a'], cancelled: ['ยกเลิก', '#888888']
    };

    function showLogin() {
        loginBox.style.display = 'block';
        mainBox.style.display = 'none';
        logoutBtn.style.display = 'none';
        clearInterval(timer);
    }

    async function loadOrders() {
        const r = await TU.api('/api/admin/orders');
        if (r.status === 403) { disabledBox.style.display = 'block'; loginBox.style.display = 'none'; return; }
        if (r.status === 401) { showLogin(); return; }
        if (!r.ok) return;

        loginBox.style.display = 'none';
        mainBox.style.display = 'block';
        logoutBtn.style.display = 'inline-block';

        const rows = r.data.orders;
        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">ยังไม่มีออเดอร์</td></tr>';
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
                <td>${TU.money(o.amount)} ฿</td>
                <td style="color:${st[1]}">${esc(st[0])}</td>
                <td>${o.has_slip ? `<a href="/slips/${o.id}" target="_blank" rel="noopener" style="color:var(--accent-red)">ดูสลิป</a>` : '-'}</td>
                <td class="actions-cell">${actionable ? `
                    <button class="btn-small primary" data-act="approve" data-id="${o.id}">อนุมัติ</button>
                    <button class="btn-small danger" data-act="reject" data-id="${o.id}">ปฏิเสธ</button>` : ''}</td>
            </tr>`;
        }).join('');
    }

    tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.dataset.act === 'approve') {
            if (!window.confirm(`ยืนยันอนุมัติออเดอร์ #${id}? เว็บจะเปิดใช้งานทันที`)) return;
            const r = await TU.postJson(`/api/admin/orders/${id}/approve`, {});
            if (!r.ok) TU.showAlert(esc(r.data.message || 'อนุมัติไม่สำเร็จ'));
        } else {
            const note = window.prompt('เหตุผลที่ปฏิเสธ (ลูกค้าจะเห็นว่าสลิปไม่ผ่าน)', 'ยอดเงินไม่ตรง') || '';
            const r = await TU.postJson(`/api/admin/orders/${id}/reject`, { note });
            if (!r.ok) TU.showAlert(esc(r.data.message || 'ปฏิเสธไม่สำเร็จ'));
        }
        loadOrders();
    });

    document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const r = await TU.postJson('/api/admin/login', { password: document.getElementById('adminPw').value });
        if (r.ok) {
            document.getElementById('adminPw').value = '';
            await loadOrders();
            timer = setInterval(loadOrders, 20000);
        } else {
            TU.showAlert(esc(r.data.message || 'เข้าสู่ระบบไม่สำเร็จ'));
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await TU.postJson('/api/admin/logout', {});
        showLogin();
    });

    if (root.dataset.enabled !== '1') {
        disabledBox.style.display = 'block';
        return;
    }
    await loadOrders();
    if (mainBox.style.display === 'block') timer = setInterval(loadOrders, 20000);
});
