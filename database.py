import sqlite3

def init_db():
    conn = sqlite3.connect('tuarai.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS themes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            preview_img TEXT NOT NULL,
            theme_code TEXT UNIQUE NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            package_type TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            order_id INTEGER NOT NULL,
            theme_id INTEGER NOT NULL,
            partner_name TEXT,
            start_date TEXT,
            letter_text TEXT,
            letter_sign TEXT,
            music_url TEXT,
            images_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (theme_id) REFERENCES themes (id)
        )
    ''')

    cursor.execute('''
        INSERT OR IGNORE INTO themes (id, name, description, preview_img, theme_code)
        VALUES (1, 'Cyberpunk Dark Wine 1st Month', 'ธีมสีแดงไวน์สายดาร์ก อนิเมชันหัวใจ+กุหลาบพุ่ง', 'img/preview_theme1.jpg', 'cyberpunk_wine_v1')
    ''')

    conn.commit()
    conn.close()
    print("Database `tuarai.db` (New Generator System) Created Successfully!")

if __name__ == '__main__':
    init_db()