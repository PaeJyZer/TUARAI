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
