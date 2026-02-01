"""
QR Code Service
"""
import qrcode
from io import BytesIO
from app.core.config import settings


class QRService:
    @staticmethod
    def generate_qr_code(url: str) -> BytesIO:
        """QRコード生成"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=settings.QR_CODE_SIZE,
            border=settings.QR_CODE_BORDER,
        )
        qr.add_data(url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return buffer
