"""
QR Code Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Survey
from app.services.qr_service import QRService

router = APIRouter()


@router.get("/survey/{survey_id}")
def get_survey_qr_code(survey_id: int, base_url: str, db: Session = Depends(get_db)):
    """アンケート用QRコード生成"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # 回答URL
    survey_url = f"{base_url}/survey/{survey_id}"
    
    # QRコード生成
    qr_buffer = QRService.generate_qr_code(survey_url)
    
    return StreamingResponse(
        qr_buffer,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=survey_{survey_id}_qr.png"}
    )
