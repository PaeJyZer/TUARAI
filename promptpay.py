"""
สร้างข้อความสำหรับ QR พร้อมเพย์ (PromptPay / EMVCo) พร้อมยอดเงิน
รองรับเบอร์มือถือ (10 หลัก), เลขบัตรประชาชน/เลขผู้เสียภาษี (13 หลัก), e-Wallet (15 หลัก)
"""
import re


def _tlv(tag, value):
    return f"{tag}{len(value):02d}{value}"


def crc16_ccitt(text):
    """CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) ตามที่ EMVCo QR กำหนด"""
    crc = 0xFFFF
    for byte in text.encode('ascii'):
        crc ^= byte << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) if (crc & 0x8000) else (crc << 1)
            crc &= 0xFFFF
    return crc


def build_payload(target, amount=None):
    """target: เบอร์พร้อมเพย์/เลขบัตร, amount: ยอด (บาท) หรือ None ถ้าไม่ระบุยอด"""
    digits = re.sub(r'\D', '', str(target or ''))
    if len(digits) == 10 and digits.startswith('0'):
        sub_tag, value = '01', '0066' + digits[1:]
    elif len(digits) == 11 and digits.startswith('66'):
        sub_tag, value = '01', '00' + digits
    elif len(digits) == 13:
        sub_tag, value = '02', digits
    elif len(digits) == 15:
        sub_tag, value = '03', digits
    else:
        raise ValueError('เลขพร้อมเพย์ไม่ถูกต้อง (ใช้เบอร์ 10 หลัก, เลขบัตร 13 หลัก หรือ e-Wallet 15 หลัก)')

    account = _tlv('00', 'A000000677010111') + _tlv(sub_tag, value)
    body = _tlv('00', '01')
    body += _tlv('01', '12' if amount else '11')   # 12 = ใช้ครั้งเดียว มียอด, 11 = ใช้ซ้ำได้
    body += _tlv('29', account)
    body += _tlv('53', '764')                      # สกุลเงิน THB
    if amount:
        body += _tlv('54', f"{float(amount):.2f}")
    body += _tlv('58', 'TH')
    body += '6304'
    return body + f"{crc16_ccitt(body):04X}"


def verify_payload(payload):
    """ตรวจ CRC ของข้อความ QR (ใช้ทดสอบ)"""
    return payload[-4:] == f"{crc16_ccitt(payload[:-4]):04X}"
