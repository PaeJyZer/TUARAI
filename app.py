from flask import (Flask, request, jsonify, session, render_template, redirect,
                   url_for, send_file, send_from_directory, abort, g)
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix
from functools import wraps
from datetime import datetime, timedelta, timezone
from PIL import Image, ImageOps
import sqlite3
import os
import io
import re
import json
import math
import time
import hmac
import shutil
import secrets
import socket

import qr_styles
import promptpay

# =====================================================================
#  0. ตั้งค่า (อ่านจากไฟล์ .env ในโฟลเดอร์โปรเจกต์ หรือ environment variable)
# =====================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_env_file():
    """อ่านไฟล์ .env แบบง่ายๆ (KEY=VALUE) ไม่ทับค่าที่ตั้งไว้ในระบบแล้ว"""
    path = os.path.join(BASE_DIR, '.env')
    if not os.path.isfile(path):
        return
    with open(path, encoding='utf-8') as fp:
        for line in fp:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, _, val = line.partition('=')
            os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


_load_env_file()

# DATA_DIR = โฟลเดอร์เก็บข้อมูลถาวร (ฐานข้อมูล รูปลูกค้า สลิป) ตั้งค่านี้เมื่อรันบนโฮสต์ที่มีดิสก์ถาวร
# เช่น Render Disk ที่ mount ไว้ที่ /var/data  ถ้าไม่ตั้ง จะเก็บในโฟลเดอร์โปรเจกต์เหมือนเดิม
DATA_DIR = os.environ.get('DATA_DIR', '').strip()
if DATA_DIR:
    os.makedirs(DATA_DIR, exist_ok=True)
    DATABASE = os.path.join(DATA_DIR, 'tuarai.db')
    UPLOAD_ROOT = os.path.join(DATA_DIR, 'uploads')
    PRIVATE_ROOT = os.path.join(DATA_DIR, 'private')
else:
    DATABASE = os.path.join(BASE_DIR, 'tuarai.db')
    UPLOAD_ROOT = os.path.join(BASE_DIR, 'static', 'uploads')
    PRIVATE_ROOT = os.path.join(BASE_DIR, 'private')      # ไฟล์ที่ห้ามเปิดสาธารณะ (สลิปโอนเงิน)
os.makedirs(UPLOAD_ROOT, exist_ok=True)

DEFAULT_SECRET = 'tuarai_cyberpunk_secret_key_change_me'
SECRET_KEY = os.environ.get('SECRET_KEY', DEFAULT_SECRET)
PAYMENT_MODE = os.environ.get('PAYMENT_MODE', 'demo').lower()   # demo = กดจำลองจ่ายได้ | manual = โอนพร้อมเพย์ + แนบสลิป + แอดมินอนุมัติ
PROMPTPAY_ID = os.environ.get('PROMPTPAY_ID', '').strip()       # เบอร์พร้อมเพย์ 10 หลัก หรือเลขบัตร 13 หลัก
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '')

# ----- กติกาแพ็กเกจ (แก้ตัวเลขตรงนี้ที่เดียว) -----
PACKAGES = {
    'basic': {
        'label': 'Basic',
        'max_photos': 8,          # อัปโหลดรูปได้สูงสุด
        'edit_hours': 24,         # แก้ไขได้กี่ชั่วโมงหลังชำระเงิน (None = ไม่จำกัด)
        'valid_days': 365,        # อายุเว็บ (None = ตลอดอายุการให้บริการ)
        'qr_styles': ['plain'],
        'can_switch_theme': False,
    },
    'pro': {
        'label': 'Pro',
        'max_photos': 20,
        'edit_hours': None,
        'valid_days': None,
        'qr_styles': list(qr_styles.STYLE_ORDER),
        'can_switch_theme': False,
    },
}
DEFAULT_PRICES = {'basic': 199.0, 'pro': 349.0}   # ใช้ถ้าธีมไม่ได้ตั้งราคาเฉพาะไว้ในตาราง themes
RENEW_PRICE = 99.0                                # ราคาต่ออายุ Basic ต่อ 1 ปี
RENEW_DAYS = 365
MIN_PHOTOS = 4                                    # ขั้นต่ำรูปต่อเว็บ
MAX_SIDE = 1600                                   # ย่อรูปให้ด้านยาวสุดไม่เกินกี่พิกเซล
MAX_DRAFTS_PER_USER = 10                          # ตัวอย่างที่ยังไม่จ่ายเงินต่อผู้ใช้

OCCASIONS = {
    'anniversary': {'label': 'วันครบรอบ', 'en': 'Happy Anniversary', 'date_label': 'วันที่เริ่มคบกัน (หรือวันพิเศษ)',
                    'counter_title': 'เราอยู่ด้วยกันมาแล้ว', 'wish': 'สุขสันต์วันครบรอบของเรานะ', 'mode': 'since'},
    'birthday': {'label': 'วันเกิด', 'en': 'Happy Birthday', 'date_label': 'วันเกิดของเขา/เธอ',
                 'counter_title': 'วันนี้เธออายุ', 'wish': 'สุขสันต์วันเกิดนะ', 'mode': 'age'},
}

TEXT_LIMITS = {'partner_name': 60, 'letter_text': 3000, 'letter_sign': 60}
SLUG_RE = re.compile(r'^[0-9a-f]{8,32}$')

# ตำแหน่งรูปในธีม (pic-1..pic-19) ตามจำนวนรูปที่ลูกค้าใส่ ไม่วนรูปซ้ำ
# key = จำนวนรูปรอบนอก (ไม่นับรูปกลาง) เลือกตำแหน่งให้กระจายสมดุลซ้าย-ขวา
_CORE = [1, 15, 5, 19, 6, 8, 9, 10, 4, 17, 11, 13, 12, 14]
LAYOUTS = {
    0: [],
    1: [7],
    2: [1, 19],
    3: [1, 15, 10],
    4: [1, 15, 5, 19],
    5: [1, 15, 5, 19, 7],
    6: [1, 15, 5, 19, 9, 10],
    7: [1, 15, 5, 19, 9, 10, 7],
    8: [1, 15, 5, 19, 6, 8, 9, 10],
    9: [1, 15, 5, 19, 6, 8, 9, 10, 7],
    10: _CORE[:10],
    11: _CORE[:10] + [7],
    12: _CORE[:12],
    13: _CORE[:12] + [7],
    14: _CORE[:14],
    15: _CORE[:14] + [7],
    16: _CORE[:14] + [2, 16],
    17: _CORE[:14] + [2, 16, 7],
    18: _CORE[:14] + [2, 16, 3, 18],
    19: list(range(1, 20)),
}



def package_features():
    """ข้อความสรุปของแต่ละแพ็กเกจ (ใช้ในหน้าแรก/วิธีสั่งซื้อ/หน้าเลือกซื้อ) ตัวเลขดึงจาก PACKAGES จึงตรงกับระบบจริงเสมอ"""
    b, p = PACKAGES['basic'], PACKAGES['pro']
    extra_styles = max(len(qr_styles.STYLE_ORDER) - 1, 0)
    return {
        'basic': [
            f"อัปโหลดรูปได้สูงสุด {b['max_photos']} รูป",
            f"แก้ไขข้อมูลและรูปได้ภายใน {b['edit_hours']} ชั่วโมงแรกหลังชำระเงิน หลังจากนั้นล็อก",
            f"ใช้งานได้ {max(b['valid_days'] // 365, 1)} ปี ต่ออายุได้ {RENEW_PRICE:,.0f} ฿ / ปี",
            "ได้ QR Code แบบมาตรฐาน",
            "คัดลอกลิงก์ส่งทางแชทได้",
        ],
        'pro': [
            f"อัปโหลดรูปได้สูงสุด {p['max_photos']} รูป",
            "แก้ไขข้อความและรูปได้ไม่จำกัดตลอดอายุการให้บริการ",
            f"QR Code สไตล์ตกแต่ง {extra_styles} แบบ (หัวใจ ไล่สีกุหลาบ ฯลฯ)",
            "ไม่มีวันหมดอายุ",
        ],
    }

app = Flask(__name__)
app.secret_key = SECRET_KEY
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024        # รวมไฟล์ที่อัปโหลดต่อครั้งไม่เกิน 64MB
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
# ให้ Flask รู้ที่อยู่จริงเวลาเปิดผ่าน tunnel/โฮสต์ที่มี HTTPS (Cloudflare, ngrok, Render ฯลฯ)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
CORS(app)


# =====================================================================
#  1. ฐานข้อมูล + migration อัตโนมัติ (รันทุกครั้งที่เปิดโปรแกรม ปลอดภัยถ้ารันซ้ำ)
# =====================================================================
def connect_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def get_db():
    if 'db' not in g:
        g.db = connect_db()
    return g.db


@app.before_request
def drop_stale_login():
    """ถ้าคุกกี้ล็อกอินเก่าอ้างถึงผู้ใช้ที่ไม่มีในฐานข้อมูลแล้ว (เช่นฐานข้อมูลถูกรีเซ็ต) ให้ล้างออก
    กันหน้าเว็บเด้งวนไปมาระหว่างหน้าแรกกับแดชบอร์ด"""
    uid = session.get('user_id')
    if uid and not request.path.startswith('/static/'):
        if not get_db().execute('SELECT 1 FROM users WHERE id = ?', (uid,)).fetchone():
            session.pop('user_id', None)


@app.teardown_appcontext
def close_db(exc=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def _columns(conn, table):
    return {r[1] for r in conn.execute(f'PRAGMA table_info({table})')}


def _add_columns(conn, table, cols):
    existing = _columns(conn, table)
    for name, ddl in cols.items():
        if name not in existing:
            conn.execute(f'ALTER TABLE {table} ADD COLUMN {name} {ddl}')


EXTRA_THEMES = [
    ('starry_night_v1', 'Starry Night Universe',
     'ท้องฟ้าดาวระยิบ มีดาวตก แตะดาวเพื่อเปิด รูปลอยเป็นกลุ่มดาว และจดหมายพิมพ์ทีละตัว',
     'theme_previews/starry_night.jpg', 'theme_starry.html'),
    ('vintage_diary_v1', 'Vintage Diary & Film',
     'สมุดไดอารี่ปกหนัง แตะเพื่อเปิดสมุด รูปเรียงเป็นม้วนฟิล์มโทนอบอุ่น จดหมายบนกระดาษมีเส้น',
     'theme_previews/vintage_diary.jpg', 'theme_diary.html'),
    ('flower_garden_v1', 'Blooming Flower Garden',
     'แตะดอกไม้ให้บาน กลีบดอกไม้ร่วงเบาๆ รูปในกรอบโค้งและดอกไม้ โทนพาสเทลหวานๆ',
     'theme_previews/flower_garden.jpg', 'theme_garden.html'),
    ('sunset_beach_v1', 'Sunset Beach Letters',
     'ทะเลพระอาทิตย์ตก แตะขวดแก้วเพื่อเปิด ขูดทรายเผยรูป รูปโพลารอยด์แขวนบนราว',
     'theme_previews/sunset_beach.jpg', 'theme_sunset.html'),
    ('love_post_v1', 'Love Post Envelope',
     'ซองจดหมายไปรษณีย์ แตะตราประทับเพื่อเปิดซอง หาตราไปรษณียากรหัวใจ รูปเป็นโปสการ์ด',
     'theme_previews/love_post.jpg', 'theme_envelope.html'),
    ('sakura_clear_v1', 'Sakura Photobooth',
     'ซากุระร่วงโทนใสสไตล์เกาหลี กดชัตเตอร์เพื่อเปิด หาหัวใจซ่อนในภาพ รูปเรียงเป็นแถบโฟโต้บูธ',
     'theme_previews/sakura_clear.jpg', 'theme_sakura.html'),
    ('movie_night_v1', 'Our Movie Night',
     'โรงหนังม่านแดง กดเล่นเพื่อเปิดม่าน ขูดตั๋วเข้าโรง โปสเตอร์หนังและฉากสตีลของเรา',
     'theme_previews/movie_night.jpg', 'theme_cinema.html'),
    ('y2k_pop_v1', 'Y2K Pop Cute',
     'โทนชมพูฟ้าโฮโลแกรม หน้าต่างคอมยุค 2000 กดสตาร์ทเพื่อเปิด ขูดสติกเกอร์ รูปในหน้าต่างน่ารัก',
     'theme_previews/y2k_pop.jpg', 'theme_y2k.html'),
    ('pixel_love_v1', '8-Bit Love Quest',
     'เกมพิกเซลย้อนยุค กด PRESS START เก็บหัวใจที่ซ่อนอยู่ รูปเป็นด่านต่างๆ จดหมายเป็นด่านสุดท้าย',
     'theme_previews/pixel_love.jpg', 'theme_pixel.html'),
]


# ธีมพรีเมียม (เสียงเอฟเฟกต์ + ปลดล็อกทีละขั้น) ราคาสูงกว่าธีมทั่วไป
# (code, name, desc, preview, template, price_basic, price_pro, tagline)
PREMIUM_THEMES = [
    ('birthday_cake_v1', 'Birthday Cake Party',
     'จุดเทียนบนเค้ก เป่าแล้วคอนเฟตติระเบิด ป๊อปบอลลูนปลดล็อกรูป พร้อมเสียงเอฟเฟกต์ทุกการแตะ',
     'theme_previews/birthday_cake.jpg', 'theme_cake.html', 229, 499, 'จุดเทียน · เป่า · ป๊อปบอลลูน'),
    ('arcade_love_v1', 'Neon Arcade Cabinet',
     'ตู้เกมอาร์เคดนีออน หยอดเหรียญ เล่นเกมรับหัวใจ ตารางคะแนนสูงสุด ด่านรูปและบอสจดหมาย',
     'theme_previews/arcade_love.jpg', 'theme_arcade.html', 229, 499, 'หยอดเหรียญ · เกมรับหัวใจ · บอสจดหมาย'),
    ('space_cruise_v1', 'Galaxy Cruise',
     'ยานอวกาศพุ่งทะลุกาแล็กซี กดค้างเพื่อจุดเครื่องยนต์ วาร์ปข้ามดวงดาว สแกนดาวเคราะห์ จอโฮโลแกรมรูป',
     'theme_previews/space_cruise.jpg', 'theme_space.html', 229, 499, 'กดค้างจุดเครื่อง · วาร์ป · สแกนดาว'),
    ('music_box_v1', 'Music Box & Vinyl',
     'ไขลานกล่องดนตรี นางรำหมุน เล่นโน้ตเปียโนเป็นทำนองเฉพาะ แผ่นเสียงหมุน รูปเป็นปกแผ่นเสียง',
     'theme_previews/music_box.jpg', 'theme_musicbox.html', 229, 499, 'ไขลาน · เล่นโน้ต · แผ่นเสียง'),
    ('hanami_night_v1', 'Hanami Night Lanterns',
     'ค่ำคืนใต้ต้นซากุระ จุดโคมไฟกระดาษทีละดวง กลีบซากุระพัดตามนิ้ว เขย่าต้นไม้ โอมิคุจิคำอวยพร',
     'theme_previews/hanami_night.jpg', 'theme_hanami.html', 229, 499, 'จุดโคมไฟ · เขย่าซากุระ · โอมิคุจิ'),
    ('palace_sakura_v1', 'Sakura Palace Story',
     'วิชวลโนเวลในวังซากุระ คุยกับแฟนผ่านบทสนทนาที่คุณเขียนเอง ให้เขา/เธอเลือกคำตอบ มีสรุปคำตอบท้ายเรื่อง เสียงนุ่มสบายหู',
     'theme_previews/palace_sakura.jpg', 'theme_palace.html', 249, 549, 'วิชวลโนเวล · เลือกคำตอบ · ซากุระล้อมวัง'),
]
DIALOG_THEMES = {'palace_sakura_v1'}
DEFAULT_DIALOG = [
    {'q': '{name} รู้ไหมว่าวันนี้เราอยากเจอเธอที่สุดเลย เธออยากให้เราเริ่มเล่าเรื่องไหนก่อนดี',
     'options': ['วันแรกที่เราเจอกัน', 'ช่วงเวลาที่มีความสุขที่สุด'],
     'reply': 'เรื่องนั้นเราก็จำได้ไม่เคยลืมเลย'},
    {'q': 'ถ้าได้ไปเที่ยวด้วยกันตอนนี้ เธออยากไปที่ไหนมากที่สุด',
     'options': ['ทะเลเงียบๆ', 'ภูเขาอากาศเย็น', 'เมืองใหญ่ไฟสวยๆ'],
     'reply': 'โอเค จดไว้แล้ว เดี๋ยวพาไปแน่นอน'},
    {'q': 'สิ่งที่เธออยากให้เราทำให้บ่อยขึ้นคืออะไรเอ่ย',
     'options': ['โทรหากันบ่อยๆ', 'ไปกินข้าวด้วยกัน', 'กอดแน่นๆ'],
     'reply': 'รับทราบ เราจะพยายามให้ดีที่สุดเลยนะ'},
    {'q': 'สุดท้ายนี้ เธออยากให้เรากับเธอเป็นแบบนี้ไปอีกนานแค่ไหน',
     'options': ['ไปตลอดเลย', 'ไปทุกๆ ปีเลย'],
     'reply': 'ขอบคุณที่ตอบนะ ตามเรามาอ่านจดหมายกันเลย'},
]



def migrate_db():
    conn = connect_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS themes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            preview_img TEXT,
            theme_code TEXT UNIQUE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            package_type TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS user_sites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            order_id INTEGER NOT NULL DEFAULT 0,
            theme_id INTEGER NOT NULL,
            partner_name TEXT,
            start_date TEXT,
            letter_text TEXT,
            letter_sign TEXT,
            music_url TEXT,
            images_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')

    _add_columns(conn, 'themes', {
        'price_basic': 'REAL',
        'is_premium': 'INTEGER DEFAULT 0',
        'price_pro': 'REAL',
        'template_file': "TEXT DEFAULT 'theme_100.html'",
        'is_active': 'INTEGER DEFAULT 1',
        'sort_order': 'INTEGER DEFAULT 0',
    })
    _add_columns(conn, 'orders', {
        'kind': "TEXT DEFAULT 'new'",     # new | upgrade | renew
        'site_id': 'INTEGER',
        'provider': 'TEXT',
        'slip_path': 'TEXT',
        'paid_at': 'TEXT',
        'note': 'TEXT',
    })
    _add_columns(conn, 'user_sites', {
        'package': 'TEXT',                # basic | pro
        'status': 'TEXT',                 # draft | active
        'expires_at': 'TEXT',
        'edit_until': 'TEXT',
        'paid_at': 'TEXT',
        'qr_style': "TEXT DEFAULT 'plain'",
        'reminder_sent_at': 'TEXT',
        'occasion': "TEXT DEFAULT 'anniversary'",
        'dialog': 'TEXT',
    })

    # เว็บเดิมที่สร้างไว้ก่อนมีแพ็กเกจ -> ให้เป็น Pro ที่ใช้งานอยู่ (ไม่ล็อกของเดิม)
    conn.execute("UPDATE user_sites SET package = 'pro' WHERE package IS NULL")
    conn.execute("UPDATE user_sites SET status = 'active' WHERE status IS NULL")
    conn.execute("UPDATE user_sites SET qr_style = 'plain' WHERE qr_style IS NULL")
    conn.execute("UPDATE user_sites SET occasion = 'anniversary' WHERE occasion IS NULL")
    conn.execute("UPDATE orders SET kind = 'new' WHERE kind IS NULL")

    # ธีม: ถ้ายังไม่มีเลย ใส่ธีมเริ่มต้น / ปรับข้อมูลธีมเดิมให้ตรงกับธีมปัจจุบัน
    if conn.execute('SELECT COUNT(*) FROM themes').fetchone()[0] == 0:
        conn.execute('''INSERT INTO themes (id, name, description, preview_img, theme_code)
                        VALUES (1, 'Wine Polaroid Memories', 'รูปโพลารอยด์กระจายเต็มจอ จดหมายพิมพ์ทีละตัว ตัวนับวันที่คบกัน และกุหลาบแตกเต็มจอ',
                                'theme_previews/wine_polaroid.jpg', 'cyberpunk_wine_v1')''')
    conn.execute('''UPDATE themes SET
                        name = 'Wine Polaroid Memories',
                        description = 'รูปโพลารอยด์กระจายเต็มจอ จดหมายพิมพ์ทีละตัว ตัวนับวันที่คบกัน และกุหลาบแตกเต็มจอ',
                        preview_img = 'theme_previews/wine_polaroid.jpg'
                    WHERE theme_code = 'cyberpunk_wine_v1' AND name = 'Cyberpunk Dark Wine 1st Month' ''')
    # ธีมเพิ่มเติม (เพิ่มให้อัตโนมัติถ้ายังไม่มี ไม่แตะธีมที่มีอยู่แล้ว)
    for order, (code, name, desc, preview, tpl) in enumerate(EXTRA_THEMES, start=1):
        if not conn.execute('SELECT 1 FROM themes WHERE theme_code = ?', (code,)).fetchone():
            conn.execute('''INSERT INTO themes (name, description, preview_img, theme_code, template_file, sort_order)
                            VALUES (?, ?, ?, ?, ?, ?)''', (name, desc, preview, code, tpl, order))
    # ธีมพรีเมียม: ตั้งราคาเฉพาะธีมตอนเพิ่มครั้งแรก (แก้ราคาทีหลังในตาราง themes ได้ จะไม่ถูกทับ)
    for order, (code, name, desc, preview, tpl, pb, pp, _tag) in enumerate(PREMIUM_THEMES, start=101):
        if not conn.execute('SELECT 1 FROM themes WHERE theme_code = ?', (code,)).fetchone():
            conn.execute('''INSERT INTO themes (name, description, preview_img, theme_code, template_file, sort_order, price_basic, price_pro)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)''', (name, desc, preview, code, tpl, order, pb, pp))
        conn.execute('UPDATE themes SET is_premium = 1 WHERE theme_code = ?', (code,))
    conn.execute("UPDATE themes SET template_file = 'theme_100.html' WHERE template_file IS NULL")
    conn.execute('UPDATE themes SET is_active = 1 WHERE is_active IS NULL')
    conn.execute('UPDATE themes SET price_basic = ? WHERE price_basic IS NULL', (DEFAULT_PRICES['basic'],))
    conn.execute('UPDATE themes SET price_pro = ? WHERE price_pro IS NULL', (DEFAULT_PRICES['pro'],))
    conn.commit()
    conn.close()


migrate_db()


def cleanup_old_drafts(days=7):
    """ลบตัวอย่างเว็บที่สร้างไว้แต่ไม่ชำระเงินเกิน N วัน พร้อมรูปที่อัปโหลดไว้ (กันพื้นที่เต็ม)"""
    conn = connect_db()
    cutoff = to_s(datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=days))
    rows = conn.execute("SELECT id, slug FROM user_sites WHERE status = 'draft' AND created_at < ?", (cutoff,)).fetchall()
    for r in rows:
        conn.execute("UPDATE orders SET status = 'cancelled' WHERE site_id = ? AND status IN ('pending', 'review', 'rejected')", (r['id'],))
        conn.execute('DELETE FROM user_sites WHERE id = ?', (r['id'],))
        shutil.rmtree(os.path.join(UPLOAD_ROOT, r['slug']), ignore_errors=True)
    conn.commit()
    conn.close()
    return len(rows)



if PAYMENT_MODE == 'demo' and os.environ.get('PUBLIC_BASE_URL', '').startswith('https://'):
    print('!!! คำเตือน: PAYMENT_MODE=demo แต่ตั้ง PUBLIC_BASE_URL เป็นโดเมนจริง ใครก็กดจำลองจ่ายเงินได้ ให้ตั้ง PAYMENT_MODE=manual ก่อนขายจริง !!!')


# =====================================================================
#  2. ตัวช่วยทั่วไป
# =====================================================================
FMT = '%Y-%m-%d %H:%M:%S'


def now_utc():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_s(dt):
    return dt.strftime(FMT) if dt else None


def parse_dt(s):
    try:
        return datetime.strptime(s, FMT) if s else None
    except (ValueError, TypeError):
        return None


def ts(dt):
    return int(dt.replace(tzinfo=timezone.utc).timestamp()) if dt else None


def err(message, code=400):
    return jsonify({'status': 'error', 'message': message}), code


def api_login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({'status': 'unauthorized', 'message': 'กรุณาล็อกอินก่อน'}), 401
        return fn(*args, **kwargs)
    return wrapper


def get_lan_ip():
    """หา IP ของเครื่องนี้ในวง Wi-Fi/LAN เช่น 192.168.1.20"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        return s.getsockname()[0]
    except Exception:
        return None
    finally:
        s.close()


def public_base_url():
    """ที่อยู่เว็บที่คนอื่นเปิดได้
    1) ถ้าตั้ง PUBLIC_BASE_URL ไว้ (เช่น https://love.example.com) ใช้ค่านั้น
    2) ถ้าเปิดผ่าน 127.0.0.1/localhost -> เปลี่ยนเป็น IP ในวง Wi-Fi เพื่อให้มือถือเครื่องเดียวกันเปิดได้
    3) นอกนั้นใช้โดเมนที่กำลังเปิดอยู่ (เช่นลิงก์ tunnel หรือโดเมนจริง)"""
    env = os.environ.get('PUBLIC_BASE_URL', '').strip().rstrip('/')
    if env:
        return env
    name, _, port = request.host.partition(':')
    if name in ('127.0.0.1', 'localhost'):
        ip = get_lan_ip()
        if ip:
            return f"{request.scheme}://{ip}" + (f":{port}" if port else '')
    return request.host_url.rstrip('/')


def safe_url(u):
    return isinstance(u, str) and (u.startswith('http://') or u.startswith('https://') or u.startswith('/'))


def clean_text(value, field):
    return (value or '').strip()[:TEXT_LIMITS[field]]


def valid_date(s):
    try:
        datetime.strptime(s or '', '%Y-%m-%d')
        return True
    except ValueError:
        return False


# =====================================================================
#  3. ธีม / ราคา / สถานะเว็บ
# =====================================================================
def get_theme(theme_id):
    return get_db().execute('SELECT * FROM themes WHERE id = ?', (theme_id,)).fetchone()


def active_themes():
    return get_db().execute('SELECT * FROM themes WHERE COALESCE(is_active, 1) = 1 ORDER BY sort_order, id').fetchall()


def theme_prices(theme):
    return {
        'basic': float(theme['price_basic'] or DEFAULT_PRICES['basic']),
        'pro': float(theme['price_pro'] or DEFAULT_PRICES['pro']),
    }


PREMIUM_TAGS = {t[0]: t[7] for t in PREMIUM_THEMES}


def theme_dict(theme):
    d = dict(theme)
    d['prices'] = theme_prices(theme)
    d['is_premium'] = bool(d.get('is_premium'))
    d['tagline'] = PREMIUM_TAGS.get(d.get('theme_code'), '')
    d['has_dialog'] = d.get('theme_code') in DIALOG_THEMES
    return d


def clean_dialog(raw):
    """ตรวจบทสนทนาจากลูกค้า: ไม่เกิน 6 คำถาม ตัวเลือก 2-4 ข้อ คืนค่า list (ว่าง = ไม่ได้ใส่)"""
    if isinstance(raw, str):
        try:
            raw = json.loads(raw) if raw.strip() else []
        except ValueError:
            return []
    if not isinstance(raw, list):
        return []
    out = []
    for item in raw[:6]:
        if not isinstance(item, dict):
            continue
        q = str(item.get('q') or '').strip()[:160]
        opts = [str(o or '').strip()[:60] for o in (item.get('options') or [])[:4] if isinstance(o, str) or o]
        opts = [o for o in opts if o]
        reply = str(item.get('reply') or '').strip()[:160]
        if q and len(opts) >= 2:
            out.append({'q': q, 'options': opts, 'reply': reply})
    return out


def dialog_of(site):
    try:
        d = clean_dialog(site['dialog']) if 'dialog' in site.keys() else []
    except Exception:
        d = []
    return d or DEFAULT_DIALOG


def site_images(site):
    try:
        return [u for u in json.loads(site['images_json'] or '[]') if safe_url(u)]
    except (ValueError, TypeError):
        return []


def site_state(site):
    """สรุปสถานะของเว็บ: แก้ไขได้ไหม หมดอายุหรือยัง ฯลฯ"""
    pkg_key = site['package'] if site['package'] in PACKAGES else 'pro'
    pkg = PACKAGES[pkg_key]
    now = now_utc()
    expires = parse_dt(site['expires_at'])
    edit_until = parse_dt(site['edit_until'])
    stored_status = site['status'] or 'active'

    expired = stored_status == 'active' and expires is not None and now > expires
    if stored_status == 'draft':
        status, can_edit = 'draft', True
    elif expired:
        status, can_edit = 'expired', False
    else:
        status = 'active'
        if pkg['edit_hours'] is None:
            can_edit = True
        else:
            can_edit = edit_until is not None and now <= edit_until

    days_left = None
    if expires is not None and status == 'active':
        days_left = max(0, math.ceil((expires - now).total_seconds() / 86400))

    theme = get_theme(site['theme_id'])
    prices = theme_prices(theme) if theme else DEFAULT_PRICES
    images = site_images(site)
    return {
        'id': site['id'],
        'slug': site['slug'],
        'partner_name': site['partner_name'] or '',
        'start_date': site['start_date'] or '',
        'occasion': (site['occasion'] if 'occasion' in site.keys() and site['occasion'] in OCCASIONS else 'anniversary'),
        'letter_text': site['letter_text'] or '',
        'letter_sign': site['letter_sign'] or '',
        'has_dialog': bool(theme and theme['theme_code'] in DIALOG_THEMES),
        'dialog': dialog_of(site),
        'theme_id': site['theme_id'],
        'theme_name': theme['name'] if theme else '-',
        'package': pkg_key,
        'package_label': pkg['label'],
        'status': status,
        'can_edit': can_edit,
        'edit_until_ts': ts(edit_until),
        'expires_ts': ts(expires),
        'days_left': days_left,
        'images': images,
        'image_count': len(images),
        'max_photos': pkg['max_photos'],
        'min_photos': MIN_PHOTOS,
        'qr_style': site['qr_style'] if site['qr_style'] in pkg['qr_styles'] else 'plain',
        'qr_styles_allowed': pkg['qr_styles'],
        'can_switch_theme': pkg['can_switch_theme'],
        'upgrade_price': max(prices['pro'] - prices['basic'], 1.0) if pkg_key == 'basic' else None,
        'renew_price': RENEW_PRICE if pkg_key == 'basic' else None,
        'created_at': site['created_at'],
    }


def owned_site(slug):
    """คืนแถวเว็บถ้าผู้ใช้ที่ล็อกอินเป็นเจ้าของ ไม่งั้น None"""
    user_id = session.get('user_id')
    if not user_id or not SLUG_RE.match(slug or ''):
        return None
    site = get_db().execute('SELECT * FROM user_sites WHERE slug = ?', (slug,)).fetchone()
    if not site or site['user_id'] != user_id:
        return None
    return site


# =====================================================================
#  4. รูปภาพ (อัปโหลด / ย่อ / เก็บ / ลบ)
# =====================================================================
Image.MAX_IMAGE_PIXELS = 60_000_000  # กันรูปขนาดใหญ่ผิดปกติ


def process_photos(files, max_side=MAX_SIDE):
    """ตรวจว่าเป็นรูปจริง หมุนตาม EXIF ย่อขนาด แล้วแปลงเป็น JPEG
    คืนลิสต์ bytes ถ้ามีไฟล์ที่ใช้ไม่ได้จะ raise ValueError"""
    results = []
    for f in files:
        if not f or not f.filename:
            continue
        try:
            img = Image.open(f.stream)
            img = ImageOps.exif_transpose(img)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGBA')
                bg = Image.new('RGB', img.size, (255, 255, 255))
                bg.paste(img, mask=img.split()[-1])
                img = bg
            else:
                img = img.convert('RGB')
            img.thumbnail((max_side, max_side))
            buf = io.BytesIO()
            img.save(buf, 'JPEG', quality=85, optimize=True)
            results.append(buf.getvalue())
        except Exception:
            raise ValueError(f'ไฟล์ "{f.filename}" ไม่ใช่รูปภาพที่ใช้ได้ (รองรับ JPG, PNG, WEBP)')
    return results


def write_photos(slug, blobs):
    """บันทึกรูปลง static/uploads/<slug>/ แล้วคืนลิสต์ URL ชื่อไฟล์สุ่มโดยเซิร์ฟเวอร์เอง"""
    folder = os.path.join(UPLOAD_ROOT, slug)
    os.makedirs(folder, exist_ok=True)
    urls = []
    for blob in blobs:
        name = secrets.token_hex(6) + '.jpg'
        with open(os.path.join(folder, name), 'wb') as fp:
            fp.write(blob)
        urls.append(f'/static/uploads/{slug}/{name}')
    return urls


def remove_photo_file(slug, url):
    prefix = f'/static/uploads/{slug}/'
    if isinstance(url, str) and url.startswith(prefix):
        path = os.path.join(UPLOAD_ROOT, slug, os.path.basename(url))
        if os.path.isfile(path):
            os.remove(path)


def remove_site_files(slug):
    shutil.rmtree(os.path.join(UPLOAD_ROOT, slug), ignore_errors=True)


def save_images(slug, images):
    db = get_db()
    db.execute('UPDATE user_sites SET images_json = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?',
               (json.dumps(images, ensure_ascii=False), slug))
    db.commit()


def demo_photos():
    return [url_for('static', filename=f'demo/photo_{i:02d}.jpg') for i in range(1, 21)]


# =====================================================================
#  5. แสดงเว็บเซอร์ไพรส์ (ใช้ธีมตามที่ลูกค้าเลือก)
# =====================================================================
def render_theme(theme, partner_name, start_date, letter_text, letter_sign, urls,
                 banner=None, toolbar=None, occasion='anniversary', dialog=None):
    """urls: ลิสต์รูป (รูปแรก = รูปหน้าปก/รูปกลาง) ไม่วนซ้ำ ถ้าไม่มีรูปเลยใช้รูปตัวอย่าง"""
    urls = (urls or demo_photos())[:20]
    center, others = urls[0], urls[1:]
    slots = LAYOUTS[len(others)]
    occasion = occasion if occasion in OCCASIONS else 'anniversary'
    template = os.path.basename((theme['template_file'] if theme else None) or 'theme_100.html')
    if not os.path.isfile(os.path.join(app.root_path, 'templates', template)):
        template = 'theme_100.html'
    return render_template(
        template,
        partner_name=partner_name or '',
        start_date=start_date or '',
        letter_text=letter_text or '',
        letter_sign=letter_sign or '',
        occasion=occasion,
        occ=OCCASIONS[occasion],
        flower_message=f'ขอบคุณที่อยู่ด้วยกันนะ\nกุหลาบดอกนี้ให้ {partner_name or ""} คนเดียวนะ',
        center_photo=center,
        side_photos=list(zip(slots, others)),
        banner=banner,
        toolbar=toolbar,
        dialog=dialog or DEFAULT_DIALOG,
    )


def render_site(site, banner=None, toolbar=None):
    theme = get_theme(site['theme_id'])
    return render_theme(theme, site['partner_name'], site['start_date'], site['letter_text'],
                        site['letter_sign'], site_images(site), banner=banner, toolbar=toolbar,
                        occasion=site['occasion'] if 'occasion' in site.keys() else 'anniversary',
                        dialog=dialog_of(site))


# =====================================================================
#  6. หน้าเว็บ (Pages)
# =====================================================================
@app.route('/static/uploads/<slug>/<path:name>')
def serve_upload(slug, name):
    """เสิร์ฟรูปลูกค้าจากโฟลเดอร์เก็บถาวร (UPLOAD_ROOT) ลิงก์เดิม /static/uploads/... ใช้ได้เหมือนเดิม"""
    if not SLUG_RE.match(slug):
        abort(404)
    resp = send_from_directory(os.path.join(UPLOAD_ROOT, slug), os.path.basename(name))
    resp.headers['Cache-Control'] = 'public, max-age=86400'
    return resp


@app.route('/')
def serve_index():
    themes = [theme_dict(t) for t in active_themes()]
    premium = [t for t in themes if t['is_premium']]
    standard = [t for t in themes if not t['is_premium']]
    return render_template('index.html', themes=themes, premium=premium, standard=standard, packages=PACKAGES, min_photos=MIN_PHOTOS,
                           renew_price=RENEW_PRICE, features=package_features(), default_dialog=DEFAULT_DIALOG)


@app.route('/dashboard')
def serve_dashboard():
    if 'user_id' not in session:
        return redirect(url_for('serve_index'))
    return render_template('dashboard.html')


@app.route('/how-to-buy')
def serve_how_to_buy():
    themes = [theme_dict(t) for t in active_themes()]
    return render_template('how-to-buy.html', themes=themes, packages=PACKAGES, min_photos=MIN_PHOTOS,
                           renew_price=RENEW_PRICE, features=package_features())


@app.route('/demo/<theme_code>')
def demo_page(theme_code):
    """หน้าตัวอย่างของแต่ละธีม ใช้รูปสมมติ (เติม ?photos=8 เพื่อดูหน้าตาแบบ Basic)"""
    theme = get_db().execute('SELECT * FROM themes WHERE theme_code = ? AND COALESCE(is_active, 1) = 1',
                             (theme_code,)).fetchone()
    if not theme:
        abort(404)
    try:
        n = int(request.args.get('photos', 20))
    except ValueError:
        n = 20
    n = max(1, min(20, n))
    sample_date = (datetime.now() - timedelta(days=123)).strftime('%Y-%m-%d')
    letter = ('ขอบคุณที่อยู่ข้างกันมาตลอดนะ\n\n'
              'ทุกวันที่มีเธอ ทำให้เรื่องธรรมดากลายเป็นเรื่องพิเศษ\n\n'
              'ต่อจากนี้อีกกี่วัน อีกกี่เดือน อีกกี่ปี ขอให้ได้อยู่ด้วยกันแบบนี้ตลอดไปนะ')
    return render_theme(theme, 'ที่รัก', sample_date, letter, 'จากคนที่รักเธอ', demo_photos()[:n],
                        banner='ตัวอย่างเว็บ — ข้อมูลและรูปทั้งหมดเป็นของสมมติ',
                        occasion=request.args.get('occasion', 'anniversary'))


@app.route('/preview/<slug>')
def preview_page(slug):
    site = owned_site(slug)
    if not site:
        abort(404)
    state = site_state(site)
    if state['status'] == 'draft':
        order_kind_price = theme_prices(get_theme(site['theme_id']))[state['package']]
        toolbar = {'slug': slug, 'price': int(order_kind_price), 'package': state['package_label']}
        banner = 'ตัวอย่างก่อนชำระเงิน — ยังไม่เผยแพร่ให้คนอื่นเห็น'
    else:
        toolbar, banner = None, 'มุมมองเจ้าของเว็บ'
    return render_site(site, banner=banner, toolbar=toolbar)


@app.route('/s/<slug>')
def public_site(slug):
    if not SLUG_RE.match(slug):
        return "<h1>404 - ไม่พบหน้าเว็บเซอร์ไพรส์นี้</h1>", 404
    site = get_db().execute('SELECT * FROM user_sites WHERE slug = ?', (slug,)).fetchone()
    if not site or (site['status'] or 'active') != 'active':
        return "<h1>404 - ไม่พบหน้าเว็บเซอร์ไพรส์นี้</h1>", 404
    if site_state(site)['status'] == 'expired':
        return render_template('expired.html'), 410
    return render_site(site)


@app.route('/edit/<slug>')
def edit_page(slug):
    if 'user_id' not in session:
        return redirect(url_for('serve_index'))
    if not owned_site(slug):
        abort(404)
    return render_template('edit.html', slug=slug)


@app.route('/pay/<int:order_id>')
def pay_page(order_id):
    if 'user_id' not in session:
        return redirect(url_for('serve_index'))
    order = get_db().execute('SELECT * FROM orders WHERE id = ? AND user_id = ?',
                             (order_id, session['user_id'])).fetchone()
    if not order:
        abort(404)
    return render_template('pay.html', order_id=order_id, payment_mode=PAYMENT_MODE,
                           promptpay_ready=bool(PROMPTPAY_ID))


# =====================================================================
#  7. ระบบสมาชิก (Auth)
# =====================================================================
@app.route('/api/check-session', methods=['GET'])
def check_session():
    user_id = session.get('user_id')
    username = session.get('username')
    if user_id and username:
        return jsonify({'logged_in': True, 'user': {'id': user_id, 'username': username}}), 200
    return jsonify({'logged_in': False}), 200


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''

    if not username or not email or not password:
        return err('กรอกข้อมูลให้ครบทุกช่อง')
    if len(username) > 40 or len(email) > 120 or len(password) > 200:
        return err('ข้อมูลยาวเกินกำหนด')

    db = get_db()
    if db.execute('SELECT id FROM users WHERE username = ?', (username,)).fetchone():
        return err('ชื่อผู้ใช้ (Username) นี้ถูกใช้งานไปแล้ว กรุณาเปลี่ยนใหม่ หรือใช้ชื่ออื่น')
    if db.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone():
        return err('อีเมลนี้ถูกใช้งานไปแล้ว กรุณาเปลี่ยนใหม่ หรือใช้อีเมลอื่น')

    try:
        db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                   (username, email, generate_password_hash(password)))
        db.commit()
        return jsonify({'status': 'success', 'message': 'สมัครสมาชิกสำเร็จ! กรุณาล็อกอินเพื่อใช้งาน'}), 201
    except sqlite3.IntegrityError:
        return err('ชื่อผู้ใช้หรืออีเมลนี้ซ้ำในระบบ กรุณาเปลี่ยนใหม่')


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get('username')
    password = data.get('password') or ''

    user = get_db().execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    if user and check_password_hash(user['password'], password):
        session['user_id'] = user['id']
        session['username'] = user['username']
        return jsonify({
            'status': 'success',
            'message': f'เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ {user["username"]}',
            'user': {'id': user['id'], 'username': user['username']}
        }), 200
    return err('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401)


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'status': 'success', 'message': 'ออกจากระบบเรียบร้อยแล้ว'})


# =====================================================================
#  8. ข้อมูล Dashboard / ธีม
# =====================================================================
@app.route('/api/themes', methods=['GET'])
def get_themes():
    return jsonify([theme_dict(t) for t in active_themes()])


@app.route('/api/user-profile', methods=['GET'])
def get_user_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'status': 'unauthorized', 'message': 'ยังไม่ได้ล็อกอิน'}), 401

    db = get_db()
    user = db.execute('SELECT id, username, email, created_at FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        return err('ไม่พบผู้ใช้', 404)

    base = public_base_url()
    sites = []
    for row in db.execute('SELECT * FROM user_sites WHERE user_id = ? ORDER BY id DESC', (user_id,)).fetchall():
        s = site_state(row)
        s['public_url'] = f"{base}/s/{row['slug']}"
        o = db.execute("SELECT id, kind, status FROM orders WHERE site_id = ? "
                       "AND status IN ('pending', 'review', 'rejected') ORDER BY id DESC LIMIT 1",
                       (row['id'],)).fetchone()
        s['open_order'] = dict(o) if o else None
        sites.append(s)

    orders = [dict(o) for o in db.execute(
        'SELECT id, package_type, amount, status, kind, created_at, paid_at, site_id '
        'FROM orders WHERE user_id = ? ORDER BY id DESC', (user_id,)).fetchall()]

    return jsonify({
        'status': 'success',
        'user': {'username': user['username'], 'email': user['email'], 'created_at': user['created_at']},
        'sites': sites,
        'orders': orders,
        'base_url': base,
        'payment_mode': PAYMENT_MODE,
        'qr_styles': {k: {'label': qr_styles.STYLES[k]['label'], 'pro': qr_styles.STYLES[k]['pro']}
                      for k in qr_styles.STYLE_ORDER},
        'qr_style_order': qr_styles.STYLE_ORDER,
    })


# =====================================================================
#  9. สร้างตัวอย่างเว็บ (draft) ก่อนชำระเงิน
# =====================================================================
def _read_fields(data):
    fields = {
        'partner_name': clean_text(data.get('partner_name'), 'partner_name'),
        'start_date': (data.get('start_date') or '').strip(),
        'letter_text': clean_text(data.get('letter_text'), 'letter_text'),
        'letter_sign': clean_text(data.get('letter_sign'), 'letter_sign'),
        'occasion': data.get('occasion') if data.get('occasion') in OCCASIONS else 'anniversary',
        'dialog': json.dumps(clean_dialog(data.get('dialog')), ensure_ascii=False),
    }
    if not fields['partner_name'] or not fields['letter_text'] or not fields['letter_sign']:
        return None, 'กรอกข้อมูลให้ครบทุกช่อง'
    if not valid_date(fields['start_date']):
        return None, 'วันที่ไม่ถูกต้อง'
    return fields, None


@app.route('/api/drafts', methods=['POST'])
@api_login_required
def create_draft():
    user_id = session['user_id']
    form = request.form
    files = [f for f in request.files.getlist('images') if f and f.filename]

    pkg_key = form.get('package')
    if pkg_key not in PACKAGES:
        return err('กรุณาเลือกแพ็กเกจ')
    pkg = PACKAGES[pkg_key]

    try:
        theme_id = int(form.get('theme_id') or 0)
    except ValueError:
        theme_id = 0
    theme = get_theme(theme_id)
    if not theme or not (theme['is_active'] if theme['is_active'] is not None else 1):
        return err('ไม่พบเว็บที่เลือก')

    fields, problem = _read_fields(form)
    if problem:
        return err(problem)

    if len(files) < MIN_PHOTOS:
        return err(f'กรุณาเลือกรูปอย่างน้อย {MIN_PHOTOS} รูป')
    if len(files) > pkg['max_photos']:
        return err(f'แพ็กเกจ {pkg["label"]} อัปโหลดได้สูงสุด {pkg["max_photos"]} รูป')

    db = get_db()
    drafts = db.execute("SELECT COUNT(*) FROM user_sites WHERE user_id = ? AND status = 'draft'",
                        (user_id,)).fetchone()[0]
    if drafts >= MAX_DRAFTS_PER_USER:
        return err(f'มีตัวอย่างที่ยังไม่ชำระเงินครบ {MAX_DRAFTS_PER_USER} รายการแล้ว กรุณาชำระเงินหรือลบบางรายการใน Dashboard ก่อน')

    try:
        blobs = process_photos(files)
    except ValueError as e:
        return err(str(e))

    slug = secrets.token_hex(8)
    images = write_photos(slug, blobs)
    db.execute('''INSERT INTO user_sites
        (slug, user_id, order_id, theme_id, partner_name, start_date, letter_text, letter_sign,
         music_url, images_json, package, status, qr_style, occasion, dialog)
        VALUES (?, ?, 0, ?, ?, ?, ?, ?, '', ?, ?, 'draft', 'plain', ?, ?)''',
               (slug, user_id, theme['id'], fields['partner_name'], fields['start_date'],
                fields['letter_text'], fields['letter_sign'], json.dumps(images, ensure_ascii=False), pkg_key, fields['occasion'], fields['dialog']))
    db.commit()
    return jsonify({'status': 'success', 'slug': slug, 'preview_url': url_for('preview_page', slug=slug)})


# =====================================================================
#  10. ดู / แก้ไข / ลบ เว็บของตัวเอง
# =====================================================================
@app.route('/api/sites/<slug>', methods=['GET'])
@api_login_required
def get_site_api(slug):
    site = owned_site(slug)
    if not site:
        return err('ไม่พบเว็บนี้', 404)
    state = site_state(site)
    state['themes'] = [{'id': t['id'], 'name': t['name']} for t in active_themes()]
    state['preview_url'] = url_for('preview_page', slug=slug)
    return jsonify({'status': 'success', 'site': state})


def _need_edit(site):
    state = site_state(site)
    if state['can_edit']:
        return state, None
    if state['status'] == 'expired':
        return state, err('เว็บนี้หมดอายุแล้ว กรุณาต่ออายุก่อนแก้ไข', 403)
    return state, err('หมดเวลาแก้ไขของแพ็กเกจ Basic แล้ว อัปเกรดเป็น Pro เพื่อแก้ไขได้ไม่จำกัด', 403)


@app.route('/api/sites/<slug>', methods=['PUT'])
@api_login_required
def update_site(slug):
    site = owned_site(slug)
    if not site:
        return err('ไม่พบเว็บนี้', 404)
    state, denied = _need_edit(site)
    if denied:
        return denied

    data = request.get_json(silent=True) or {}
    fields, problem = _read_fields(data)
    if problem:
        return err(problem)

    theme_id = site['theme_id']
    if data.get('theme_id') not in (None, '', site['theme_id']):
        try:
            new_theme = get_theme(int(data['theme_id']))
        except (TypeError, ValueError):
            new_theme = None
        if not new_theme or not (new_theme['is_active'] if new_theme['is_active'] is not None else 1):
            return err('ไม่พบธีมที่เลือก')
        # 1 เว็บ = 1 ธีม ทุกแพ็กเกจ (อยากได้ธีมอื่นให้ซื้อเว็บใหม่)
        return err('เว็บ 1 เว็บใช้ได้ 1 ธีม ถ้าต้องการธีมอื่นให้ซื้อเว็บใหม่', 403)

    db = get_db()
    db.execute('''UPDATE user_sites SET partner_name = ?, start_date = ?, letter_text = ?, letter_sign = ?,
                  occasion = ?, dialog = ?, theme_id = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?''',
               (fields['partner_name'], fields['start_date'], fields['letter_text'], fields['letter_sign'],
                fields['occasion'], fields['dialog'], theme_id, slug))
    db.commit()
    return jsonify({'status': 'success', 'message': 'บันทึกเรียบร้อยแล้ว'})


@app.route('/api/sites/<slug>', methods=['DELETE'])
@api_login_required
def delete_draft(slug):
    site = owned_site(slug)
    if not site:
        return err('ไม่พบเว็บนี้', 404)
    if (site['status'] or 'active') != 'draft':
        return err('ลบได้เฉพาะตัวอย่างที่ยังไม่ชำระเงิน', 403)
    db = get_db()
    db.execute("UPDATE orders SET status = 'cancelled' WHERE site_id = ? AND status IN ('pending', 'review', 'rejected')",
               (site['id'],))
    db.execute('DELETE FROM user_sites WHERE id = ?', (site['id'],))
    db.commit()
    remove_site_files(slug)
    return jsonify({'status': 'success'})


@app.route('/api/sites/<slug>/images', methods=['POST'])
@api_login_required
def add_site_images(slug):
    site = owned_site(slug)
    if not site:
        return err('ไม่พบเว็บนี้', 404)
    state, denied = _need_edit(site)
    if denied:
        return denied

    files = [f for f in request.files.getlist('images') if f and f.filename]
    if not files:
        return err('ยังไม่ได้เลือกรูป')
    current = site_images(site)
    room = state['max_photos'] - len(current)
    if len(files) > room:
        return err(f'แพ็กเกจ {state["package_label"]} มีรูปได้สูงสุด {state["max_photos"]} รูป ตอนนี้มี {len(current)} รูป '
                   f'เพิ่มได้อีก {max(room, 0)} รูป')
    try:
        blobs = process_photos(files)
    except ValueError as e:
        return err(str(e))

    current += write_photos(slug, blobs)
    save_images(slug, current)
    return jsonify({'status': 'success', 'images': current})


@app.route('/api/sites/<slug>/images/delete', methods=['POST'])
@api_login_required
def delete_site_image(slug):
    site = owned_site(slug)
    if not site:
        return err('ไม่พบเว็บนี้', 404)
    _, denied = _need_edit(site)
    if denied:
        return denied

    url = (request.get_json(silent=True) or {}).get('url')
    current = site_images(site)
    if url not in current:
        return err('ไม่พบรูปนี้', 404)
    if len(current) <= MIN_PHOTOS:
        return err(f'ต้องมีรูปอย่างน้อย {MIN_PHOTOS} รูป เพิ่มรูปใหม่ก่อนจึงลบรูปนี้ได้')

    current.remove(url)
    save_images(slug, current)
    remove_photo_file(slug, url)
    return jsonify({'status': 'success', 'images': current})


@app.route('/api/sites/<slug>/images/cover', methods=['POST'])
@api_login_required
def set_cover_image(slug):
    site = owned_site(slug)
    if not site:
        return err('ไม่พบเว็บนี้', 404)
    _, denied = _need_edit(site)
    if denied:
        return denied
    url = (request.get_json(silent=True) or {}).get('url')
    current = site_images(site)
    if url not in current:
        return err('ไม่พบรูปนี้', 404)
    current.remove(url)
    current.insert(0, url)
    save_images(slug, current)
    return jsonify({'status': 'success', 'images': current})


# =====================================================================
#  11. QR Code (ส่งมอบให้ลูกค้า)
# =====================================================================
@app.route('/api/sites/<slug>/qr-style', methods=['POST'])
@api_login_required
def set_qr_style(slug):
    site = owned_site(slug)
    if not site:
        return err('ไม่พบเว็บนี้', 404)
    state = site_state(site)
    style = (request.get_json(silent=True) or {}).get('style')
    if style not in qr_styles.STYLES:
        return err('ไม่พบสไตล์นี้')
    if style not in state['qr_styles_allowed']:
        return err('สไตล์ QR ตกแต่งใช้ได้เฉพาะแพ็กเกจ Pro', 403)
    db = get_db()
    db.execute('UPDATE user_sites SET qr_style = ? WHERE slug = ?', (style, slug))
    db.commit()
    return jsonify({'status': 'success', 'style': style})


@app.route('/api/sites/<slug>/qr.png')
@api_login_required
def site_qr(slug):
    site = owned_site(slug)
    if not site:
        return err('ไม่พบเว็บนี้', 404)
    state = site_state(site)
    if state['status'] == 'draft':
        return err('ต้องชำระเงินก่อนจึงจะได้ QR', 403)

    style = request.args.get('style') or state['qr_style']
    if style not in qr_styles.STYLES:
        style = 'plain'
    if style not in state['qr_styles_allowed']:
        return err('สไตล์ QR ตกแต่งใช้ได้เฉพาะแพ็กเกจ Pro', 403)
    try:
        size = int(request.args.get('size', 600))
    except ValueError:
        size = 600
    download = request.args.get('download') == '1'
    size = max(160, min(2000, 1600 if download and size < 1000 else size))

    data = qr_styles.qr_png_bytes(f"{public_base_url()}/s/{slug}", style, size)
    resp = send_file(io.BytesIO(data), mimetype='image/png', as_attachment=download,
                     download_name=f'qr-{slug[:8]}-{style}.png')
    resp.headers['Cache-Control'] = 'private, no-store'
    return resp


@app.route('/api/qr-sample.png')
def qr_sample():
    """ตัวอย่างหน้าตา QR แต่ละสไตล์ (ลิงก์สมมติ ไม่ใช่ของใคร) ใช้โชว์ตัวเลือกสไตล์"""
    style = request.args.get('style')
    if style not in qr_styles.STYLES:
        style = 'plain'
    data = qr_styles.qr_png_bytes('https://example.com/s/sample', style, 240)
    resp = send_file(io.BytesIO(data), mimetype='image/png')
    resp.headers['Cache-Control'] = 'public, max-age=86400'
    return resp


# =====================================================================
#  12. ออเดอร์ & การชำระเงิน
# =====================================================================
def order_amount(kind, site, theme):
    prices = theme_prices(theme)
    if kind == 'new':
        return prices[site['package']], site['package']
    if kind == 'upgrade':
        return max(prices['pro'] - prices['basic'], 1.0), 'pro'
    return RENEW_PRICE, 'basic'


@app.route('/api/orders', methods=['POST'])
@api_login_required
def create_order():
    data = request.get_json(silent=True) or {}
    kind = data.get('kind', 'new')
    site = owned_site(data.get('slug'))
    if not site or kind not in ('new', 'upgrade', 'renew'):
        return err('ไม่พบเว็บนี้', 404)

    stored_status = site['status'] or 'active'
    if kind == 'new' and stored_status != 'draft':
        return err('เว็บนี้ชำระเงินแล้ว')
    if kind in ('upgrade', 'renew'):
        if stored_status != 'active':
            return err('ต้องชำระเงินสร้างเว็บก่อน')
        if site['package'] != 'basic':
            return err('เว็บนี้เป็นแพ็กเกจ Pro อยู่แล้ว ไม่ต้องอัปเกรดหรือต่ออายุ')

    theme = get_theme(site['theme_id'])
    amount, pkg = order_amount(kind, site, theme)
    db = get_db()

    # มีออเดอร์ที่ค้างจ่ายของเว็บ+ประเภทนี้อยู่แล้ว ใช้อันเดิม ไม่สร้างซ้ำ
    existing = db.execute("SELECT * FROM orders WHERE site_id = ? AND kind = ? "
                          "AND status IN ('pending', 'review', 'rejected') ORDER BY id DESC LIMIT 1",
                          (site['id'], kind)).fetchone()
    if existing:
        if existing['status'] == 'pending' and abs(existing['amount'] - amount) > 0.001:
            db.execute('UPDATE orders SET amount = ? WHERE id = ?', (amount, existing['id']))
            db.commit()
        order_id = existing['id']
    else:
        cur = db.execute("INSERT INTO orders (user_id, package_type, amount, status, kind, site_id, provider) "
                         "VALUES (?, ?, ?, 'pending', ?, ?, ?)",
                         (session['user_id'], pkg, amount, kind, site['id'], PAYMENT_MODE))
        order_id = cur.lastrowid
        if kind == 'new':
            db.execute('UPDATE user_sites SET order_id = ? WHERE id = ?', (order_id, site['id']))
        db.commit()
    return jsonify({'status': 'success', 'order_id': order_id, 'pay_url': url_for('pay_page', order_id=order_id)})


def mark_order_paid(db, order_id):
    """ยืนยันว่าออเดอร์จ่ายแล้ว แล้วเปิดใช้งาน/อัปเกรด/ต่ออายุให้เว็บ
    ทุกช่องทางชำระเงิน (จำลอง, แอดมินอนุมัติ, webhook ของผู้ให้บริการจ่ายเงินในอนาคต) ต้องเรียกฟังก์ชันนี้ตัวเดียว
    ปลอดภัยถ้าเรียกซ้ำ (ทำงานครั้งเดียว) คืน True ถ้าเพิ่งเปลี่ยนสถานะเป็นจ่ายแล้ว"""
    now = now_utc()
    cur = db.execute("UPDATE orders SET status = 'completed', paid_at = ? WHERE id = ? AND status IN ('pending', 'review')",
                     (to_s(now), order_id))
    if cur.rowcount == 0:
        db.commit()
        return False

    order = db.execute('SELECT * FROM orders WHERE id = ?', (order_id,)).fetchone()
    site = db.execute('SELECT * FROM user_sites WHERE id = ?', (order['site_id'],)).fetchone()
    if site:
        kind = order['kind'] or 'new'
        if kind == 'new' and (site['status'] or 'active') == 'draft':
            pkg = PACKAGES[order['package_type'] if order['package_type'] in PACKAGES else 'basic']
            expires = now + timedelta(days=pkg['valid_days']) if pkg['valid_days'] else None
            edit_until = now + timedelta(hours=pkg['edit_hours']) if pkg['edit_hours'] else None
            db.execute('''UPDATE user_sites SET status = 'active', package = ?, expires_at = ?, edit_until = ?,
                          paid_at = ?, order_id = ?, reminder_sent_at = NULL WHERE id = ?''',
                       (order['package_type'], to_s(expires), to_s(edit_until), to_s(now), order_id, site['id']))
        elif kind == 'upgrade':
            db.execute("UPDATE user_sites SET package = 'pro', expires_at = NULL, edit_until = NULL, "
                       "reminder_sent_at = NULL WHERE id = ?", (site['id'],))
        elif kind == 'renew' and site['package'] == 'basic':
            base = max(now, parse_dt(site['expires_at']) or now)
            db.execute('UPDATE user_sites SET expires_at = ?, reminder_sent_at = NULL WHERE id = ?',
                       (to_s(base + timedelta(days=RENEW_DAYS)), site['id']))
    db.commit()
    order_alert(db, order_id, '💰 ออเดอร์ชำระเงินแล้ว')
    return True


def order_alert(db, order_id, title):
    """แจ้งเจ้าของร้านทางช่องทางที่ตั้งไว้ใน .env (ไม่กระทบการทำงานหลักถ้าส่งไม่ได้)"""
    try:
        import notify
        o = db.execute('SELECT * FROM orders WHERE id = ?', (order_id,)).fetchone()
        site = db.execute('SELECT s.partner_name, t.name AS theme FROM user_sites s LEFT JOIN themes t ON t.id = s.theme_id WHERE s.id = ?',
                          (o['site_id'],)).fetchone() if o and o['site_id'] else None
        base = os.environ.get('PUBLIC_BASE_URL', '').strip().rstrip('/')
        lines = [title, f"ออเดอร์ #{order_id} · {KIND_LABEL.get(o['kind'] or 'new', o['kind'])} · {o['package_type']} · {o['amount']:,.0f} บาท"]
        if site:
            lines.append(f"ธีม: {site['theme']} · ชื่อ: {site['partner_name']}")
        if base:
            lines.append(f"หลังบ้าน: {base}/admin")
        notify.notify('\n'.join(lines))
    except Exception as e:  # noqa
        print('[notify] error:', e)


def _own_order(order_id):
    user_id = session.get('user_id')
    if not user_id:
        return None
    return get_db().execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', (order_id, user_id)).fetchone()


KIND_LABEL = {'new': 'สร้างเว็บใหม่', 'upgrade': 'อัปเกรดเป็น Pro', 'renew': 'ต่ออายุ 1 ปี'}


@app.route('/api/orders/<int:order_id>', methods=['GET'])
@api_login_required
def get_order(order_id):
    order = _own_order(order_id)
    if not order:
        return err('ไม่พบออเดอร์', 404)
    site = get_db().execute('SELECT slug, partner_name FROM user_sites WHERE id = ?', (order['site_id'],)).fetchone()
    return jsonify({
        'status': 'success',
        'order': {
            'id': order['id'], 'kind': order['kind'], 'kind_label': KIND_LABEL.get(order['kind'], order['kind']),
            'package': order['package_type'], 'amount': order['amount'], 'status': order['status'],
            'has_slip': bool(order['slip_path']),
        },
        'site': {'slug': site['slug'], 'partner_name': site['partner_name']} if site else None,
        'payment_mode': PAYMENT_MODE,
        'promptpay_ready': bool(PROMPTPAY_ID),
    })


@app.route('/api/orders/<int:order_id>/promptpay.png')
@api_login_required
def order_promptpay(order_id):
    order = _own_order(order_id)
    if not order:
        return err('ไม่พบออเดอร์', 404)
    if not PROMPTPAY_ID:
        return err('ยังไม่ได้ตั้งค่า PROMPTPAY_ID', 404)
    payload = promptpay.build_payload(PROMPTPAY_ID, order['amount'])
    resp = send_file(io.BytesIO(qr_styles.qr_png_bytes(payload, 'plain', 560)), mimetype='image/png')
    resp.headers['Cache-Control'] = 'private, no-store'
    return resp


@app.route('/api/orders/<int:order_id>/demo-pay', methods=['POST'])
@api_login_required
def order_demo_pay(order_id):
    """โหมดทดสอบเท่านั้น (PAYMENT_MODE=demo) กดแล้วถือว่าจ่ายแล้วทันที"""
    if PAYMENT_MODE != 'demo':
        return err('ปิดโหมดทดสอบการชำระเงินแล้ว', 403)
    order = _own_order(order_id)
    if not order:
        return err('ไม่พบออเดอร์', 404)
    mark_order_paid(get_db(), order_id)
    return jsonify({'status': 'success'})


@app.route('/api/orders/<int:order_id>/slip', methods=['POST'])
@api_login_required
def order_upload_slip(order_id):
    order = _own_order(order_id)
    if not order:
        return err('ไม่พบออเดอร์', 404)
    if order['status'] not in ('pending', 'review', 'rejected'):
        return err('ออเดอร์นี้ไม่อยู่ในสถานะรอชำระเงิน')
    f = request.files.get('slip')
    if not f or not f.filename:
        return err('กรุณาเลือกรูปสลิป')
    try:
        blobs = process_photos([f], max_side=1800)
    except ValueError as e:
        return err(str(e))

    os.makedirs(os.path.join(PRIVATE_ROOT, 'slips'), exist_ok=True)
    rel = os.path.join('slips', f'{order_id}_{secrets.token_hex(4)}.jpg')
    with open(os.path.join(PRIVATE_ROOT, rel), 'wb') as fp:
        fp.write(blobs[0])
    if order['slip_path']:
        try:
            os.remove(os.path.join(PRIVATE_ROOT, order['slip_path']))
        except OSError:
            pass
    db = get_db()
    db.execute("UPDATE orders SET slip_path = ?, status = 'review' WHERE id = ?", (rel, order_id))
    db.commit()
    order_alert(db, order_id, '🧾 มีสลิปเข้า รอคุณอนุมัติ')
    return jsonify({'status': 'success', 'message': 'ส่งสลิปแล้ว รอตรวจสอบ'})


# =====================================================================
#  13. หลังบ้านแอดมิน (ตรวจสลิป อนุมัติ/ปฏิเสธ)
# =====================================================================
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not ADMIN_PASSWORD:
            return err('ยังไม่ได้ตั้งค่า ADMIN_PASSWORD จึงปิดหน้าแอดมินไว้', 403)
        if not session.get('is_admin'):
            return jsonify({'status': 'unauthorized', 'message': 'ต้องล็อกอินแอดมิน'}), 401
        return fn(*args, **kwargs)
    return wrapper


@app.route('/admin')
def admin_page():
    return render_template('admin.html', enabled=bool(ADMIN_PASSWORD))


@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    if not ADMIN_PASSWORD:
        return err('ยังไม่ได้ตั้งค่า ADMIN_PASSWORD จึงปิดหน้าแอดมินไว้', 403)
    pw = (request.get_json(silent=True) or {}).get('password') or ''
    if hmac.compare_digest(pw.encode(), ADMIN_PASSWORD.encode()):
        session['is_admin'] = True
        return jsonify({'status': 'success'})
    time.sleep(0.6)  # หน่วงเล็กน้อยกันเดารหัส
    return err('รหัสผ่านแอดมินไม่ถูกต้อง', 401)


@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('is_admin', None)
    return jsonify({'status': 'success'})


@app.route('/api/admin/orders')
@admin_required
def admin_orders():
    rows = get_db().execute('''
        SELECT o.id, o.kind, o.package_type, o.amount, o.status, o.created_at, o.paid_at, o.slip_path,
               u.username, u.email, s.partner_name, s.slug
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        LEFT JOIN user_sites s ON s.id = o.site_id
        ORDER BY (o.status = 'review') DESC, o.id DESC LIMIT 200''').fetchall()
    out = []
    for r in rows:
        d = dict(r)
        d['has_slip'] = bool(d.pop('slip_path'))
        d['kind_label'] = KIND_LABEL.get(d['kind'], d['kind'])
        out.append(d)
    return jsonify({'status': 'success', 'orders': out})


@app.route('/slips/<int:order_id>')
@admin_required
def admin_slip(order_id):
    order = get_db().execute('SELECT slip_path FROM orders WHERE id = ?', (order_id,)).fetchone()
    if not order or not order['slip_path']:
        abort(404)
    path = os.path.join(PRIVATE_ROOT, order['slip_path'])
    if not os.path.isfile(path):
        abort(404)
    return send_file(path, mimetype='image/jpeg')


@app.route('/api/admin/orders/<int:order_id>/approve', methods=['POST'])
@admin_required
def admin_approve(order_id):
    if not mark_order_paid(get_db(), order_id):
        return err('ออเดอร์นี้ไม่ได้อยู่ในสถานะรอตรวจสอบ')
    return jsonify({'status': 'success'})


@app.route('/api/admin/orders/<int:order_id>/reject', methods=['POST'])
@admin_required
def admin_reject(order_id):
    db = get_db()
    cur = db.execute("UPDATE orders SET status = 'rejected', note = ? WHERE id = ? AND status IN ('pending', 'review')",
                     ((request.get_json(silent=True) or {}).get('note', '')[:200], order_id))
    db.commit()
    if cur.rowcount == 0:
        return err('ออเดอร์นี้ไม่ได้อยู่ในสถานะรอตรวจสอบ')
    return jsonify({'status': 'success'})


# =====================================================================
#  14. เริ่มเซิร์ฟเวอร์
# =====================================================================
if __name__ == '__main__':
    cleanup_old_drafts()
    port = int(os.environ.get('PORT', 5000))
    # พิมพ์ที่อยู่ครั้งเดียว (ไม่พิมพ์ซ้ำตอน reloader รีสตาร์ท)
    if not os.environ.get('WERKZEUG_RUN_MAIN'):
        ip = get_lan_ip()
        print('\n==============================================')
        print(f'  เปิดบนคอมนี้:        http://127.0.0.1:{port}')
        if ip:
            print(f'  เปิดบนมือถือ/iPad:   http://{ip}:{port}   (ต้องต่อ Wi-Fi เดียวกัน)')
        print(f'  โหมดชำระเงิน:        {PAYMENT_MODE}' + ('  (กดจำลองจ่ายเงินได้ ใช้ทดสอบเท่านั้น)' if PAYMENT_MODE == 'demo' else ''))
        if SECRET_KEY == DEFAULT_SECRET:
            print('  คำเตือน: ยังใช้ SECRET_KEY ตัวอย่าง ก่อนขายจริงให้ตั้งค่าใหม่ใน .env')
        print('==============================================\n')
    # host 0.0.0.0 = ให้เครื่องอื่นในวง Wi-Fi เข้าได้
    # debug=False: ไม่เปิดหน้า debugger (อันตรายเมื่อเปิดให้เครื่องอื่นเข้าถึง) แต่ยังรีโหลดอัตโนมัติเมื่อแก้โค้ด
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=True)
