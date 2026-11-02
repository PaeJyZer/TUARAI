# TUARAI: ติดตั้งและเปิดขายจริง

## รันในเครื่อง
1. แตก zip ทับโปรเจกต์ `C:\xampp\htdocs\tuarai` (Replace) ห้ามลบ `tuarai.db`
2. `pip install -r requirements.txt`
3. คัดลอก `.env.example` เป็น `.env` แล้วแก้ค่า
4. `python app.py` แล้วเปิด http://127.0.0.1:5000

เว็บเดิมที่เคยสร้างไว้จะถูกปรับเป็นแพ็กเกจ Pro ใช้งานได้ต่อโดยอัตโนมัติ

## ก่อนเปิดขายจริง
- ตั้ง `PAYMENT_MODE=manual` และ `PROMPTPAY_ID` (เบอร์/เลขบัตรที่รับเงิน) ลูกค้าจะเห็น QR พร้อมยอด แนบสลิป แล้วคุณอนุมัติที่ `/admin`
- ตั้ง `ADMIN_PASSWORD` และ `SECRET_KEY` ใหม่
- ตั้ง `PUBLIC_BASE_URL` เป็นโดเมนจริง (https) เพื่อให้ลิงก์/QR เปิดได้ในมือถือลูกค้า
- เมื่อใช้ผู้ให้บริการชำระเงินอัตโนมัติ ให้เรียก `mark_order_paid()` จาก webhook (ต้องมีบัญชีผู้ให้บริการ)

## โดเมน/เซิร์ฟเวอร์
- เช่า VPS หรือ PaaS รัน `waitress-serve --port=5000 app:app` หลัง Nginx/Caddy ที่เปิด HTTPS
- ชี้โดเมนมาที่เซิร์ฟเวอร์
- โฟลเดอร์ที่ต้องเก็บถาวรและสำรองข้อมูล: `tuarai.db`, `static/uploads/`, `private/`

## อีเมลเตือนต่ออายุ
`python send_expiry_reminders.py --dry-run` ดูรายชื่อ, ไม่ใส่ `--dry-run` เพื่อส่งจริง ตั้งให้รันวันละครั้ง

## ขึ้น Render ให้ข้อมูลไม่หาย (สำคัญ)
Render แบบฟรีไม่มีดิสก์ถาวร ทุกครั้งที่รีสตาร์ท/หลับ/deploy ใหม่ ไฟล์ `tuarai.db` และรูป/สลิปจะถูกล้าง
ทำให้บัญชีผู้ใช้และเว็บที่ลูกค้าซื้อหายหมด วิธีแก้:
1. เปลี่ยน Web Service เป็นแผนเสียเงิน (Starter ขึ้นไป) แล้วไปที่ **Disks → Add Disk**
   ตั้ง Mount Path = `/var/data` ขนาด 1 GB ก็พอเริ่มต้น
2. ที่ **Environment** เพิ่มตัวแปร `DATA_DIR=/var/data`
   (และ `SECRET_KEY`, `ADMIN_PASSWORD`, `PAYMENT_MODE=manual`, `PROMPTPAY_ID`, `PUBLIC_BASE_URL=https://ชื่อเว็บ.onrender.com`, `DISCORD_WEBHOOK_URL`)
3. Start Command: `waitress-serve --port=$PORT app:app`
4. Deploy ใหม่ ฐานข้อมูล รูป และสลิปจะอยู่ใน `/var/data` และไม่หายเมื่อรีสตาร์ท
หมายเหตุ: ดิสก์ผูกกับเซิร์ฟเวอร์ตัวเดียว (ห้ามเพิ่มเป็นหลาย instance) และควรดาวน์โหลดสำรอง `tuarai.db` เป็นระยะ
