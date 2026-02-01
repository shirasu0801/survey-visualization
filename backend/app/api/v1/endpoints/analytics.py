"""
Analytics Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from collections import Counter

from app.db.database import get_db
from app.db.models import Survey, Question, Answer, Response

router = APIRouter()


@router.get("/survey/{survey_id}/summary")
def get_survey_summary(survey_id: int, db: Session = Depends(get_db)):
    """アンケート集計サマリー"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # 回答数
    total_responses = db.query(Response).filter(Response.survey_id == survey_id).count()
    
    # 各設問の集計
    questions = db.query(Question).filter(Question.survey_id == survey_id).order_by(Question.order).all()
    
    question_stats = []
    for question in questions:
        answers = db.query(Answer).join(Response).filter(
            Answer.question_id == question.id,
            Response.survey_id == survey_id
        ).all()
        
        stats = {
            "question_id": question.id,
            "question_title": question.title,
            "question_type": question.question_type.value,
            "total_answers": len(answers),
            "statistics": {}
        }
        
        # 設問タイプ別の集計
        if question.question_type.value in ["single_choice", "multiple_choice"]:
            # 選択肢別の集計
            option_counts = Counter()
            for answer in answers:
                if isinstance(answer.answer_value, list):
                    option_counts.update(answer.answer_value)
                else:
                    option_counts[answer.answer_value] += 1
            
            stats["statistics"] = {
                "option_counts": dict(option_counts),
                "percentages": {
                    k: (v / len(answers) * 100) if len(answers) > 0 else 0
                    for k, v in option_counts.items()
                }
            }
        elif question.question_type.value == "scale":
            # スケールの平均値など
            values = []
            for answer in answers:
                if isinstance(answer.answer_value, (int, float)):
                    values.append(answer.answer_value)
            
            if values:
                stats["statistics"] = {
                    "average": sum(values) / len(values),
                    "min": min(values),
                    "max": max(values),
                    "distribution": dict(Counter(values))
                }
        
        question_stats.append(stats)
    
    return {
        "survey_id": survey_id,
        "survey_title": survey.title,
        "total_responses": total_responses,
        "questions": question_stats
    }


@router.get("/survey/{survey_id}/question/{question_id}")
def get_question_analytics(survey_id: int, question_id: int, db: Session = Depends(get_db)):
    """特定設問の詳細分析"""
    question = db.query(Question).filter(
        Question.id == question_id,
        Question.survey_id == survey_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    answers = db.query(Answer).join(Response).filter(
        Answer.question_id == question_id,
        Response.survey_id == survey_id
    ).all()
    
    return {
        "question_id": question_id,
        "question_title": question.title,
        "question_type": question.question_type.value,
        "total_answers": len(answers),
        "answers": [answer.answer_value for answer in answers]
    }


@router.get("/survey/{survey_id}/cross-analysis")
def get_cross_analysis(
    survey_id: int,
    question_id_1: int,
    question_id_2: int,
    db: Session = Depends(get_db)
):
    """クロス集計分析"""
    # 2つの設問の回答を組み合わせて分析
    responses = db.query(Response).filter(Response.survey_id == survey_id).all()
    
    cross_data = {}
    for response in responses:
        answer1 = db.query(Answer).filter(
            Answer.response_id == response.id,
            Answer.question_id == question_id_1
        ).first()
        answer2 = db.query(Answer).filter(
            Answer.response_id == response.id,
            Answer.question_id == question_id_2
        ).first()
        
        if answer1 and answer2:
            key1 = str(answer1.answer_value)
            key2 = str(answer2.answer_value)
            
            if key1 not in cross_data:
                cross_data[key1] = {}
            if key2 not in cross_data[key1]:
                cross_data[key1][key2] = 0
            cross_data[key1][key2] += 1
    
    return {
        "question_id_1": question_id_1,
        "question_id_2": question_id_2,
        "cross_data": cross_data
    }
