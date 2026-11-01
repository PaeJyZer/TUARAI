<<<<<<< HEAD
import sqlite3

DATABASE = 'tuarai.db'

def init_database():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # สร้างตาราง users (ถ้ายังไม่มี)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # สร้างตาราง themes (ตามที่ต้องการ)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS themes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            template_file TEXT NOT NULL
        )
    ''')

    # สร้างตาราง orders (ถ้ายังไม่มี)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            package_type TEXT,
            amount REAL,
            status TEXT DEFAULT 'completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # สร้างตาราง user_sites (ถ้ายังไม่มี)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            user_id INTEGER,
            order_id INTEGER,
            theme_id INTEGER,
            partner_name TEXT,
            start_date TEXT,
            letter_text TEXT,
            letter_sign TEXT,
            music_url TEXT,
            images_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # เคลียร์ข้อมูลเก่าใน themes แล้วใส่ข้อมูลธีม 100 บาทใหม่เข้าไป
    cursor.execute('DELETE FROM themes')
    cursor.execute('''
        INSERT INTO themes (id, name, price, template_file)
        VALUES (1, 'เว็บครบรอบมินิมอลดาร์ก (v1)', 100.0, 'theme_100.html')
    ''')

    conn.commit()
    conn.close()
    print("Database initialized & Themes updated successfully!")

if __name__ == '__main__':
=======
import sqlite3

DATABASE = 'tuarai.db'

def init_database():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # สร้างตาราง users (ถ้ายังไม่มี)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # สร้างตาราง themes (ตามที่ต้องการ)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS themes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            template_file TEXT NOT NULL
        )
    ''')

    # สร้างตาราง orders (ถ้ายังไม่มี)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            package_type TEXT,
            amount REAL,
            status TEXT DEFAULT 'completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # สร้างตาราง user_sites (ถ้ายังไม่มี)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            user_id INTEGER,
            order_id INTEGER,
            theme_id INTEGER,
            partner_name TEXT,
            start_date TEXT,
            letter_text TEXT,
            letter_sign TEXT,
            music_url TEXT,
            images_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # เคลียร์ข้อมูลเก่าใน themes แล้วใส่ข้อมูลธีม 100 บาทใหม่เข้าไป
    cursor.execute('DELETE FROM themes')
    cursor.execute('''
        INSERT INTO themes (id, name, price, template_file)
        VALUES (1, 'เว็บครบรอบมินิมอลดาร์ก (v1)', 100.0, 'theme_100.html')
    ''')

    conn.commit()
    conn.close()
    print("Database initialized & Themes updated successfully!")

if __name__ == '__main__':
>>>>>>> 684e8725f15ed4ff9a467d4dff3f13f69cc087f4
    init_database()