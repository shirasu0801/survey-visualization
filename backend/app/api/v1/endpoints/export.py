"""
Export Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
import pandas as pd
import io
from typing import List

from app.db.database import get_db
from app.db.models import Survey, Question, Answer, Response
from app.services.export_service import ExportService

router = APIRouter()


@router.get("/survey/{survey_id}/csv")
def export_csv(survey_id: int, db: Session = Depends(get_db)):
    """CSV形式でエクスポート"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # データ取得
    responses = db.query(Response).filter(Response.survey_id == survey_id).all()
    questions = db.query(Question).filter(Question.survey_id == survey_id).order_by(Question.order).all()
    
    # データフレーム作成
    data = []
    for response in responses:
        row = {"response_id": response.id, "submitted_at": response.submitted_at}
        for question in questions:
            answer = db.query(Answer).filter(
                Answer.response_id == response.id,
                Answer.question_id == question.id
            ).first()
            row[question.title] = answer.answer_value if answer else None
        data.append(row)
    
    df = pd.DataFrame(data)
    
    # CSV出力
    stream = io.StringIO()
    df.to_csv(stream, index=False, encoding="utf-8-sig")
    stream.seek(0)
    
    return StreamingResponse(
        io.BytesIO(stream.getvalue().encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=survey_{survey_id}.csv"}
    )


@router.get("/survey/{survey_id}/excel")
def export_excel(survey_id: int, db: Session = Depends(get_db)):
    """Excel形式でエクスポート"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # データ取得
    responses = db.query(Response).filter(Response.survey_id == survey_id).all()
    questions = db.query(Question).filter(Question.survey_id == survey_id).order_by(Question.order).all()
    
    # データフレーム作成
    data = []
    for response in responses:
        row = {"response_id": response.id, "submitted_at": response.submitted_at}
        for question in questions:
            answer = db.query(Answer).filter(
                Answer.response_id == response.id,
                Answer.question_id == question.id
            ).first()
            row[question.title] = answer.answer_value if answer else None
        data.append(row)
    
    df = pd.DataFrame(data)
    
    # Excel出力
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Responses")
    
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=survey_{survey_id}.xlsx"}
    )


@router.get("/survey/{survey_id}/pdf")
def export_pdf(survey_id: int, db: Session = Depends(get_db)):
    """PDF形式でエクスポート（レポート形式）"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    pdf_buffer = ExportService.generate_pdf_report(survey_id, db)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=survey_{survey_id}_report.pdf"}
    )
