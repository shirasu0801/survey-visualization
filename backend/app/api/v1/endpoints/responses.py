"""
Response Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.db.models import Survey, Response, Answer, Question
from app.schemas.response import ResponseCreate, ResponseResponse

router = APIRouter()


@router.post("/", response_model=ResponseResponse, status_code=status.HTTP_201_CREATED)
def submit_response(response: ResponseCreate, request: Request, db: Session = Depends(get_db)):
    """回答送信"""
    try:
        print(f"Received response submission for survey_id: {response.survey_id}")
        print(f"Number of answers: {len(response.answers)}")
        
        # アンケートの存在確認
        survey = db.query(Survey).filter(Survey.id == response.survey_id).first()
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # アンケートがアクティブか確認
        if not survey.is_active:
            raise HTTPException(status_code=400, detail="Survey is not active")
        
        # 期限チェック
        if survey.expires_at and datetime.now() > survey.expires_at:
            raise HTTPException(status_code=400, detail="Survey has expired")
        
        # 回答数上限チェック
        if survey.max_responses:
            current_count = db.query(Response).filter(Response.survey_id == response.survey_id).count()
            if current_count >= survey.max_responses:
                raise HTTPException(status_code=400, detail="Maximum responses reached")
        
        # 重複回答チェック（allow_multiple_responsesがFalseの場合）
        if not survey.allow_multiple_responses:
            client_ip = request.client.host if request.client else None
            existing_response = db.query(Response).filter(
                Response.survey_id == response.survey_id,
                Response.ip_address == client_ip
            ).first()
            if existing_response:
                raise HTTPException(status_code=400, detail="Response already submitted")
        
        # 回答を作成
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "")
        
        db_response = Response(
            survey_id=response.survey_id,
            ip_address=client_ip,
            user_agent=user_agent,
            respondent_id=response.respondent_id
        )
        db.add(db_response)
        db.flush()
        
        print(f"Response created with ID: {db_response.id}")
        
        # 各設問への回答を保存
        saved_answers = 0
        for answer_data in response.answers:
            # 設問の存在確認
            question = db.query(Question).filter(
                Question.id == answer_data.question_id,
                Question.survey_id == response.survey_id
            ).first()
            if not question:
                print(f"Warning: Question {answer_data.question_id} not found for survey {response.survey_id}")
                continue
            
            # answer_valueをそのまま保存（JSON型なので、文字列、数値、配列などすべて対応）
            db_answer = Answer(
                response_id=db_response.id,
                question_id=answer_data.question_id,
                answer_value=answer_data.answer_value
            )
            db.add(db_answer)
            saved_answers += 1
            print(f"Answer saved: question_id={answer_data.question_id}, value={answer_data.answer_value}")
        
        if saved_answers == 0:
            db.rollback()
            raise HTTPException(status_code=400, detail="No valid answers provided")
        
        db.commit()
        db.refresh(db_response)
        
        # answersを読み込む
        db_response.answers = db.query(Answer).filter(Answer.response_id == db_response.id).all()
        
        print(f"Response submitted successfully: ID={db_response.id}, Answers={saved_answers}")
        return db_response
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error submitting response: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Failed to submit response: {str(e)}")


@router.get("/survey/{survey_id}", response_model=List[ResponseResponse])
def get_responses(survey_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """アンケートの回答一覧取得"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    responses = db.query(Response).filter(
        Response.survey_id == survey_id
    ).offset(skip).limit(limit).all()
    
    # 各回答のanswersを読み込む
    for response in responses:
        response.answers = db.query(Answer).filter(Answer.response_id == response.id).all()
    
    return responses


@router.get("/{response_id}", response_model=ResponseResponse)
def get_response(response_id: int, db: Session = Depends(get_db)):
    """回答詳細取得"""
    response = db.query(Response).filter(Response.id == response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    
    # answersを読み込む
    response.answers = db.query(Answer).filter(Answer.response_id == response.id).all()
    
    return response
