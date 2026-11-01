"""ส่งอีเมลเตือนลูกค้า Basic ที่เว็บจะหมดอายุภายใน 30 วัน
ใช้: python send_expiry_reminders.py --dry-run   (ดูรายชื่ออย่างเดียว ไม่ส่ง)
     python send_expiry_reminders.py             (ส่งจริง)
ตั้งให้รันวันละครั้ง (Windows Task Scheduler / cron)
ต้องตั้งใน .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, PUBLIC_BASE_URL
"""
import os
import smtplib
import sys
from datetime import datetime, timedelta
from email.message import EmailMessage

import app as shop  # ใช้ค่าตั้งและฐานข้อมูลชุดเดียวกับเว็บ

DAYS_BEFORE = 30


def main():
    dry = '--dry-run' in sys.argv
    now = datetime.utcnow()
    limit = (now + timedelta(days=DAYS_BEFORE)).strftime(shop.FMT)
    conn = shop.connect_db()
    rows = conn.execute('''SELECT s.id, s.slug, s.partner_name, s.expires_at, u.email
        FROM user_sites s JOIN users u ON u.id = s.user_id
        WHERE s.package = 'basic' AND s.status = 'active' AND s.expires_at IS NOT NULL
          AND s.expires_at <= ? AND s.expires_at > ? AND s.reminder_sent_at IS NULL
          AND u.email IS NOT NULL AND u.email != \'\'''', (limit, now.strftime(shop.FMT))).fetchall()
    print(f'พบ {len(rows)} เว็บที่ต้องเตือน')
    if not rows or dry:
        for r in rows:
            print(' -', r['email'], r['partner_name'], r['expires_at'])
        return

    host = os.environ.get('SMTP_HOST')
    if not host:
        print('ยังไม่ได้ตั้ง SMTP_HOST ใน .env'); return
    base = os.environ.get('PUBLIC_BASE_URL', '').rstrip('/')
    with smtplib.SMTP(host, int(os.environ.get('SMTP_PORT', 587))) as smtp:
        smtp.starttls()
        smtp.login(os.environ.get('SMTP_USER', ''), os.environ.get('SMTP_PASSWORD', ''))
        for r in rows:
            msg = EmailMessage()
            msg['Subject'] = f'เว็บของ {r["partner_name"]} ใกล้หมดอายุ'
            msg['From'] = os.environ.get('SMTP_FROM', os.environ.get('SMTP_USER', ''))
            msg['To'] = r['email']
            msg.set_content(f'เว็บเซอร์ไพรส์ของ {r["partner_name"]} จะหมดอายุวันที่ {r["expires_at"][:10]}\n'
                            f'ต่ออายุได้ที่ {base}/dashboard (ต่ออายุปีละ {shop.RENEW_PRICE} บาท)\n')
            try:
                smtp.send_message(msg)
                conn.execute('UPDATE user_sites SET reminder_sent_at = ? WHERE id = ?', (now.strftime(shop.FMT), r['id']))
                conn.commit()
                print('ส่งแล้ว', r['email'])
            except Exception as e:
                print('ส่งไม่สำเร็จ', r['email'], e)


if __name__ == '__main__':
    main()
