"""แจ้งเตือนเจ้าของร้านเมื่อมีออเดอร์ (ตั้งค่าใน .env ใช้ได้หลายช่องทางพร้อมกัน ช่องไหนไม่ตั้งค่าก็ข้าม)
หมายเหตุ: LINE Notify ปิดบริการแล้ว (31 มี.ค. 2025) ใช้ LINE Official Account (Messaging API) แทน
ช่องทางที่รองรับ: Telegram, LINE OA, Discord, อีเมล
ทดสอบ: python notify.py"""
import os, json, smtplib, threading, urllib.request, urllib.parse, urllib.error
from email.mime.text import MIMEText


def _post_json(url, payload, headers=None, form=False):
    data = urllib.parse.urlencode(payload).encode() if form else json.dumps(payload).encode()
    # Discord/Cloudflare บล็อก User-Agent ดีฟอลต์ของ Python (ตอบ 403) จึงต้องระบุเอง
    h = {'Content-Type': 'application/x-www-form-urlencoded' if form else 'application/json',
         'User-Agent': 'TUARAI-Notify/1.0 (+shop order alerts)'}
    h.update(headers or {})
    req = urllib.request.Request(url, data=data, headers=h, method='POST')
    try:
        urllib.request.urlopen(req, timeout=10).read()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'HTTP {e.code} {e.read()[:200].decode("utf-8", "ignore")}')


def _telegram(text):
    tok, chat = os.environ.get('TELEGRAM_BOT_TOKEN'), os.environ.get('TELEGRAM_CHAT_ID')
    if tok and chat:
        _post_json(f'https://api.telegram.org/bot{tok}/sendMessage', {'chat_id': chat, 'text': text}, form=True)
        return True


def _line(text):
    tok, uid = os.environ.get('LINE_CHANNEL_TOKEN'), os.environ.get('LINE_USER_ID')
    if tok and uid:
        _post_json('https://api.line.me/v2/bot/message/push',
                   {'to': uid, 'messages': [{'type': 'text', 'text': text[:4900]}]},
                   {'Authorization': 'Bearer ' + tok})
        return True


def _discord(text):
    url = (os.environ.get('DISCORD_WEBHOOK_URL') or '').strip().replace('discordapp.com', 'discord.com')
    if url:
        _post_json(url, {'content': text[:1900]})
        return True


def _email(text):
    host, to = os.environ.get('SMTP_HOST'), os.environ.get('NOTIFY_EMAIL')
    if host and to:
        msg = MIMEText(text, 'plain', 'utf-8')
        msg['Subject'] = '[TUARAI] ' + text.splitlines()[0][:60]
        msg['From'] = os.environ.get('SMTP_FROM', os.environ.get('SMTP_USER', ''))
        msg['To'] = to
        with smtplib.SMTP(host, int(os.environ.get('SMTP_PORT', 587)), timeout=15) as s:
            s.starttls(); s.login(os.environ.get('SMTP_USER', ''), os.environ.get('SMTP_PASSWORD', ''))
            s.send_message(msg)
        return True


def send_all(text):
    """ส่งทุกช่องทางที่ตั้งค่าไว้ (คืนรายชื่อช่องที่ส่งสำเร็จ) error ของช่องหนึ่งไม่กระทบช่องอื่น"""
    ok = []
    for name, fn in (('telegram', _telegram), ('line', _line), ('discord', _discord), ('email', _email)):
        try:
            if fn(text):
                ok.append(name)
        except Exception as e:  # noqa
            print(f'[notify] {name} ส่งไม่สำเร็จ: {e}')
    return ok


def notify(text):
    """ส่งเบื้องหลัง ไม่ให้หน้าเว็บช้าหรือพังถ้าช่องทางแจ้งเตือนมีปัญหา"""
    threading.Thread(target=send_all, args=(text,), daemon=True).start()


def _load_env():
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if not os.path.isfile(path):
        print('!! ไม่พบไฟล์ .env ในโฟลเดอร์นี้ (ต้องชื่อ .env ไม่ใช่ .env.example)  ที่ค้นหา:', path)
        return
    for line in open(path, encoding='utf-8-sig'):
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, _, v = line.partition('=')
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


if __name__ == '__main__':
    _load_env()
    got = [n for n, k in (('telegram', 'TELEGRAM_BOT_TOKEN'), ('line', 'LINE_CHANNEL_TOKEN'), ('discord', 'DISCORD_WEBHOOK_URL'), ('email', 'NOTIFY_EMAIL')) if os.environ.get(k)]
    print('ช่องทางที่ตั้งค่าไว้:', got or 'ไม่มีเลย (ตรวจไฟล์ .env)')
    print('ส่งสำเร็จที่:', send_all('🔔 ทดสอบแจ้งเตือนจาก TUARAI\nถ้าเห็นข้อความนี้ แปลว่าตั้งค่าถูกต้อง') or 'ไม่มี (ดูข้อความ error ด้านบน)')
