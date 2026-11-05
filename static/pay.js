/* =========================================
   TUARAI - หน้าชำระเงิน (พร้อมเพย์ + แนบสลิป / โหมดทดสอบ)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const TU = window.TU;
    const esc = TU.escapeHtml;
    const root = document.getElementById('payRoot');
    if (!root) return;

    const orderId = root.dataset.order;
    const summary = document.getElementById('paySummary');
    const ppBox = document.getElementById('ppBox');
    const ppImg = document.getElementById('ppImg');
    const ppMissing = document.getElementById('ppMissing');
    const slipBox = document.getElementById('slipBox');
    const slipNote = document.getElementById('slipNote');
    const demoBox = document.getElementById('demoBox');
    let pollTimer = null;
    let ppLoaded = false;

    const show = (el, on) => { el.style.display = on ? 'block' : 'none'; };

    function nextUrl(d) {
        // จ่ายสร้างเว็บ/อัปเกรดแล้ว ให้ไปเปิดหน้าส่งมอบ QR ต่อเลย
        const kind = d.order.kind;
        if (d.site && (kind === 'new' || kind === 'upgrade')) return `/dashboard?deliver=${encodeURIComponent(d.site.slug)}`;
        if (d.site && kind === 'extra_q') return `/edit/${encodeURIComponent(d.site.slug)}`;
        return '/dashboard';
    }

    function render(d) {
        const o = d.order;
        const siteName = d.site ? esc(d.site.partner_name) : '-';
        let statusHtml = '';
        if (o.status === 'completed') statusHtml = '<span style="color:#00ff88">ชำระเงินแล้ว ✓</span>';
        else if (o.status === 'review') statusHtml = '<span style="color:#5ab0ff">ส่งสลิปแล้ว รอตรวจสอบ</span>';
        else if (o.status === 'rejected') statusHtml = '<span style="color:#ff5a5a">สลิปไม่ผ่านการตรวจสอบ กรุณาส่งสลิปใหม่</span>';
        else if (o.status === 'cancelled') statusHtml = '<span style="color:#888">ออเดอร์นี้ถูกยกเลิกแล้ว</span>';
        else statusHtml = '<span style="color:#ffaa00">รอชำระเงิน</span>';

        summary.innerHTML = `
            <h4>สรุปรายการ #ORD-${o.id}</h4>
            <table class="pay-table">
                <tr><td>รายการ</td><td>${esc(o.kind_label)}</td></tr>
                <tr><td>เว็บ</td><td>${siteName}</td></tr>
                ${o.extra_q ? `<tr><td>คำถามเพิ่ม</td><td>${o.extra_q} ข้อ × ${TU.money(o.extra_price)} ฿ ${o.kind === 'new' ? '(รวมอยู่ในยอดแล้ว)' : ''}</td></tr>` : ''}
                <tr><td>แพ็กเกจ</td><td>${esc(String(o.package).toUpperCase())}</td></tr>
                <tr><td>ยอดที่ต้องชำระ</td><td class="pay-amount">${TU.money(o.amount)} ฿</td></tr>
                <tr><td>สถานะ</td><td>${statusHtml}</td></tr>
            </table>
            <p class="photo-hint">สินค้าเป็นบริการดิจิทัล ชำระเงินแล้วไม่รับคืนเงิน กรุณาตรวจตัวอย่างเว็บให้เรียบร้อยก่อนชำระ</p>`;

        const payable = o.status === 'pending' || o.status === 'rejected';
        const canSendSlip = payable || o.status === 'review';

        show(demoBox, d.payment_mode === 'demo' && payable);
        show(ppBox, false);
        show(ppMissing, false);
        show(slipBox, false);

        if (d.payment_mode === 'manual' && canSendSlip) {
            if (d.promptpay_ready) {
                if (!ppLoaded) {
                    ppImg.src = `/api/orders/${o.id}/promptpay.png`;
                    ppLoaded = true;
                }
                show(ppBox, o.status !== 'review');
                show(slipBox, true);
                slipNote.textContent = o.status === 'review'
                    ? 'ระบบได้รับสลิปแล้ว กำลังรอตรวจสอบ ส่งสลิปใหม่ได้ถ้าส่งผิดไฟล์'
                    : 'โอนตามยอดข้างบนแล้วแนบรูปสลิปที่นี่ ใช้เวลาตรวจสอบสั้นๆ';
            } else {
                show(ppMissing, true);
            }
        }

        if (o.status === 'completed') {
            clearInterval(pollTimer);
            summary.insertAdjacentHTML('beforeend',
                `<a class="btn-submit" style="display:inline-block;width:auto;padding:10px 24px;text-decoration:none;margin-top:14px;"
                    href="${nextUrl(d)}">ไปรับ QR Code / ดูเว็บของฉัน →</a>`);
        }

        // รอแอดมินตรวจสลิป: เช็กสถานะซ้ำเป็นระยะ พออนุมัติแล้วหน้าจะอัปเดตเอง
        clearInterval(pollTimer);
        if (o.status === 'review') pollTimer = setInterval(load, 15000);
    }

    async function load() {
        const r = await TU.api(`/api/orders/${orderId}`);
        if (r.status === 401) { window.location.href = '/'; return; }
        if (!r.ok) {
            summary.textContent = r.data.message || 'ไม่พบออเดอร์นี้';
            return;
        }
        render(r.data);
    }

    document.getElementById('demoPay').addEventListener('click', async (e) => {
        e.target.disabled = true;
        const r = await TU.postJson(`/api/orders/${orderId}/demo-pay`, {});
        if (r.ok) {
            const info = await TU.api(`/api/orders/${orderId}`);
            window.location.href = info.ok ? nextUrl(info.data) : '/dashboard';
        } else {
            e.target.disabled = false;
            TU.showAlert(esc(r.data.message || 'เกิดข้อผิดพลาด'));
        }
    });

    document.getElementById('slipSend').addEventListener('click', async (e) => {
        const file = document.getElementById('slipInput').files[0];
        if (!file) { TU.showAlert('กรุณาเลือกรูปสลิปก่อน'); return; }
        e.target.disabled = true;
        const fd = new FormData();
        fd.append('slip', file);
        const r = await TU.api(`/api/orders/${orderId}/slip`, { method: 'POST', body: fd });
        e.target.disabled = false;
        if (r.ok) {
            TU.showAlert('ส่งสลิปแล้ว กำลังรอตรวจสอบ');
            document.getElementById('slipInput').value = '';
            load();
        } else {
            TU.showAlert(esc(r.data.message || 'ส่งสลิปไม่สำเร็จ'));
        }
    });

    load();
});
