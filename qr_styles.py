"""
สร้างภาพ QR Code หลายสไตล์ (ใช้ Pillow วาดเอง)
ใช้ไลบรารี `qrcode` เฉพาะส่วนคำนวณตารางจุดของ QR (get_matrix) เท่านั้น
"""
import io
import math

import qrcode
from qrcode.constants import ERROR_CORRECT_H, ERROR_CORRECT_M, ERROR_CORRECT_Q
from PIL import Image, ImageDraw

QUIET = 4  # ขอบขาวรอบ QR (จำนวนช่อง) ตามมาตรฐาน

# key -> ข้อมูลสไตล์ (pro=True คือเฉพาะแพ็กเกจ Pro)
STYLES = {
    'plain':        {'label': 'มาตรฐาน',      'pro': False, 'ec': ERROR_CORRECT_M, 'shape': 'square',  'finder': 'square',
                     'fg': '#000000', 'fg2': None,      'bg': '#ffffff', 'logo': False},
    'rounded':      {'label': 'มนหวาน',       'pro': True,  'ec': ERROR_CORRECT_Q, 'shape': 'rounded', 'finder': 'rounded',
                     'fg': '#7a1230', 'fg2': None,      'bg': '#ffffff', 'logo': False},
    'dots':         {'label': 'จุดกลม',        'pro': True,  'ec': ERROR_CORRECT_Q, 'shape': 'dot',     'finder': 'rounded',
                     'fg': '#b32a45', 'fg2': None,      'bg': '#ffffff', 'logo': False},
    'heart_center': {'label': 'หัวใจกลาง',     'pro': True,  'ec': ERROR_CORRECT_H, 'shape': 'rounded', 'finder': 'rounded',
                     'fg': '#8b1a2b', 'fg2': None,      'bg': '#ffffff', 'logo': True},
    'hearts':       {'label': 'หัวใจเต็ม',     'pro': True,  'ec': ERROR_CORRECT_H, 'shape': 'heart',   'finder': 'rounded',
                     'fg': '#c92f4e', 'fg2': None,      'bg': '#ffffff', 'logo': True},
    'rose':         {'label': 'ไล่สีกุหลาบ',   'pro': True,  'ec': ERROR_CORRECT_H, 'shape': 'rounded', 'finder': 'rounded',
                     'fg': '#7a1230', 'fg2': '#e0405a', 'bg': '#fff6f3', 'logo': True},
}
STYLE_ORDER = ['plain', 'rounded', 'dots', 'heart_center', 'hearts', 'rose']
LOGO_COLOR = '#e0405a'


def _matrix(data, ec):
    qr = qrcode.QRCode(version=None, error_correction=ec, box_size=1, border=0)
    qr.add_data(data)
    qr.make(fit=True)
    return [[bool(c) for c in row] for row in qr.get_matrix()]


def _heart_points(cx, cy, size):
    """จุดรูปหัวใจ (สมการพาราเมตริก) ปรับให้พอดีกรอบสี่เหลี่ยม size x size ที่กึ่งกลาง cx, cy"""
    pts = []
    for i in range(72):
        t = 2 * math.pi * i / 72
        x = 16 * math.sin(t) ** 3
        y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        pts.append((x, y))
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    scale = size / max(maxx - minx, maxy - miny)
    mx, my = (minx + maxx) / 2, (miny + maxy) / 2
    return [(cx + (x - mx) * scale, cy + (y - my) * scale) for x, y in pts]


def _is_finder(r, c, n):
    return (r < 7 and c < 7) or (r < 7 and c >= n - 7) or (r >= n - 7 and c < 7)


def _gradient(size, c1, c2):
    top = Image.new('RGB', (1, 2))
    top.putpixel((0, 0), _rgb(c1))
    top.putpixel((0, 1), _rgb(c2))
    return top.resize((size, size), Image.BILINEAR)


def _rgb(hex_color):
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def render_qr(data, style='plain', size=1024):
    """คืน PIL.Image (RGB) ขนาด size x size"""
    spec = STYLES.get(style) or STYLES['plain']
    m = _matrix(data, spec['ec'])
    n = len(m)
    total = n + 2 * QUIET

    ss = 3 if size <= 700 else 2                      # วาดใหญ่กว่าแล้วย่อ เพื่อให้ขอบเนียน
    box = max(6, math.ceil(size * ss / total))
    W = box * total
    off = QUIET * box

    mask = Image.new('L', (W, W), 0)
    d = ImageDraw.Draw(mask)

    # --- จุดข้อมูล ---
    for r in range(n):
        for c in range(n):
            if not m[r][c] or _is_finder(r, c, n):
                continue
            x0, y0 = off + c * box, off + r * box
            if spec['shape'] == 'square':
                d.rectangle([x0, y0, x0 + box - 1, y0 + box - 1], fill=255)
            elif spec['shape'] == 'rounded':
                d.rounded_rectangle([x0, y0, x0 + box - 1, y0 + box - 1], radius=box * 0.22, fill=255)
            elif spec['shape'] == 'dot':
                pad = box * 0.09
                d.ellipse([x0 + pad, y0 + pad, x0 + box - 1 - pad, y0 + box - 1 - pad], fill=255)
            elif spec['shape'] == 'heart':
                d.polygon(_heart_points(x0 + box / 2, y0 + box / 2, box * 1.08), fill=255)

    # --- ตัวหมุดมุม 3 มุม (ต้องชัด เพราะใช้ตรวจจับ QR) ---
    for (fr, fc) in ((0, 0), (0, n - 7), (n - 7, 0)):
        x0, y0 = off + fc * box, off + fr * box
        if spec['finder'] == 'square':
            d.rectangle([x0, y0, x0 + 7 * box - 1, y0 + 7 * box - 1], fill=255)
            d.rectangle([x0 + box, y0 + box, x0 + 6 * box - 1, y0 + 6 * box - 1], fill=0)
            d.rectangle([x0 + 2 * box, y0 + 2 * box, x0 + 5 * box - 1, y0 + 5 * box - 1], fill=255)
        else:
            d.rounded_rectangle([x0, y0, x0 + 7 * box - 1, y0 + 7 * box - 1], radius=box * 1.0, fill=255)
            d.rounded_rectangle([x0 + box, y0 + box, x0 + 6 * box - 1, y0 + 6 * box - 1], radius=box * 0.6, fill=0)
            d.rounded_rectangle([x0 + 2 * box, y0 + 2 * box, x0 + 5 * box - 1, y0 + 5 * box - 1], radius=box * 0.5, fill=255)

    # --- เว้นที่ตรงกลางสำหรับโลโก้หัวใจ ---
    qr_w = n * box
    plate = qr_w * 0.235 if spec['logo'] else 0
    cx = cy = W / 2
    if spec['logo']:
        d.rounded_rectangle([cx - plate / 2, cy - plate / 2, cx + plate / 2, cy + plate / 2],
                            radius=plate * 0.28, fill=0)

    # --- ลงสี ---
    bg = Image.new('RGB', (W, W), _rgb(spec['bg']))
    if spec['fg2']:
        fg = _gradient(W, spec['fg'], spec['fg2'])
    else:
        fg = Image.new('RGB', (W, W), _rgb(spec['fg']))
    bg.paste(fg, (0, 0), mask)

    if spec['logo']:
        ImageDraw.Draw(bg).polygon(_heart_points(cx, cy + plate * 0.02, plate * 0.72), fill=_rgb(LOGO_COLOR))

    if W != size:
        bg = bg.resize((size, size), Image.LANCZOS)
    return bg


def qr_png_bytes(data, style='plain', size=1024):
    buf = io.BytesIO()
    render_qr(data, style, size).save(buf, 'PNG', optimize=True)
    return buf.getvalue()
