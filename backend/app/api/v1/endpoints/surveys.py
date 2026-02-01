"""
Survey Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.db.models import Survey, Question, QuestionType
from app.schemas.survey import SurveyCreate, SurveyUpdate, SurveyResponse, QuestionCreate, QuestionUpdate

router = APIRouter()


@router.post("/", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
def create_survey(survey: SurveyCreate, db: Session = Depends(get_db)):
    """アンケート作成"""
    try:
        print(f"Received survey creation request: {survey.title}")
        
        # Pydantic v2ではmodel_dump()を使用
        try:
            survey_data = survey.model_dump()
        except AttributeError:
            # Pydantic v1の場合はdict()を使用
            survey_data = survey.dict()
        
        print(f"Survey data: {survey_data}")
        
        # 空の文字列をNoneに変換
        if survey_data.get('description') == '':
            survey_data['description'] = None
        if survey_data.get('logo_url') == '':
            survey_data['logo_url'] = None
        if survey_data.get('expires_at') == '':
            survey_data['expires_at'] = None
        
        db_survey = Survey(**survey_data)
        db.add(db_survey)
        db.commit()
        db.refresh(db_survey)
        
        print(f"Survey created successfully: ID={db_survey.id}, Title={db_survey.title}")
        return db_survey
    except Exception as e:
        db.rollback()
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error creating survey: {error_detail}")
        raise HTTPException(status_code=400, detail=f"Failed to create survey: {str(e)}")


@router.get("/", response_model=List[SurveyResponse])
def list_surveys(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """アンケート一覧取得"""
    surveys = db.query(Survey).offset(skip).limit(limit).all()
    
    # 各アンケートのquestionsを読み込む
    for survey in surveys:
        survey.questions = db.query(Question).filter(Question.survey_id == survey.id).order_by(Question.order).all()
    
    return surveys


@router.get("/{survey_id}", response_model=SurveyResponse)
def get_survey(survey_id: int, db: Session = Depends(get_db)):
    """アンケート詳細取得"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # questionsを読み込む
    survey.questions = db.query(Question).filter(Question.survey_id == survey_id).order_by(Question.order).all()
    
    return survey


@router.put("/{survey_id}", response_model=SurveyResponse)
def update_survey(survey_id: int, survey: SurveyUpdate, db: Session = Depends(get_db)):
    """アンケート更新"""
    db_survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not db_survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # Pydantic v2ではmodel_dump()を使用
    try:
        update_data = survey.model_dump(exclude_unset=True)
    except AttributeError:
        # Pydantic v1の場合はdict()を使用
        update_data = survey.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_survey, field, value)
    
    db.commit()
    db.refresh(db_survey)
    return db_survey


@router.delete("/{survey_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_survey(survey_id: int, db: Session = Depends(get_db)):
    """アンケート削除"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    db.delete(survey)
    db.commit()
    return None


@router.post("/{survey_id}/questions", response_model=dict)
def create_question(survey_id: int, question: QuestionCreate, db: Session = Depends(get_db)):
    """設問追加"""
    try:
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # 順序を決定（既存の設問の最大値+1）
        max_order = db.query(Question).filter(Question.survey_id == survey_id).count()
        
        # Pydantic v2ではmodel_dump()を使用
        try:
            question_data = question.model_dump()
        except AttributeError:
            # Pydantic v1の場合はdict()を使用
            question_data = question.dict()
        
        # 空の文字列をNoneに変換
        if question_data.get('description') == '':
            question_data['description'] = None
        if question_data.get('scale_label_min') == '':
            question_data['scale_label_min'] = None
        if question_data.get('scale_label_max') == '':
            question_data['scale_label_max'] = None
        
        # タイトルのバリデーション
        if not question_data.get('title') or not question_data['title'].strip():
            raise HTTPException(status_code=400, detail="Question title is required")
        
        # 選択肢タイプの場合、optionsのバリデーション
        if question_data.get('question_type') in ['single_choice', 'multiple_choice']:
            if not question_data.get('options') or len(question_data['options']) == 0:
                raise HTTPException(status_code=400, detail="Options are required for choice questions")
            # 空の選択肢をフィルタリング
            question_data['options'] = [opt for opt in question_data['options'] if opt and opt.strip()]
            if len(question_data['options']) == 0:
                raise HTTPException(status_code=400, detail="At least one non-empty option is required")
        else:
            # 選択肢タイプでない場合はoptionsをNoneに
            question_data['options'] = None
        
        db_question = Question(
            survey_id=survey_id,
            order=max_order + 1,
            **question_data
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        return db_question
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create question: {str(e)}")


@router.put("/{survey_id}/questions/{question_id}", response_model=dict)
def update_question(
    survey_id: int,
    question_id: int,
    question: QuestionUpdate,
    db: Session = Depends(get_db)
):
    """設問更新"""
    db_question = db.query(Question).filter(
        Question.id == question_id,
        Question.survey_id == survey_id
    ).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Pydantic v2ではmodel_dump()を使用
    try:
        update_data = question.model_dump(exclude_unset=True)
    except AttributeError:
        # Pydantic v1の場合はdict()を使用
        update_data = question.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_question, field, value)
    
    db.commit()
    db.refresh(db_question)
    return db_question


@router.delete("/{survey_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(survey_id: int, question_id: int, db: Session = Depends(get_db)):
    """設問削除"""
    question = db.query(Question).filter(
        Question.id == question_id,
        Question.survey_id == survey_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
    return None


@router.post("/{survey_id}/questions/reorder", response_model=dict)
def reorder_questions(survey_id: int, question_orders: List[dict], db: Session = Depends(get_db)):
    """設問の順序変更"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    for item in question_orders:
        question = db.query(Question).filter(
            Question.id == item["question_id"],
            Question.survey_id == survey_id
        ).first()
        if question:
            question.order = item["order"]
    
    db.commit()
    return {"message": "Questions reordered successfully"}
