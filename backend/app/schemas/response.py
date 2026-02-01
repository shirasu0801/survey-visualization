"""
Response Schemas
"""
from pydantic import BaseModel
from typing import List, Any, Optional
from datetime import datetime


class AnswerCreate(BaseModel):
    question_id: int
    answer_value: Any  # 文字列、数値、配列など


class ResponseCreate(BaseModel):
    survey_id: int
    respondent_id: Optional[str] = None
    answers: List[AnswerCreate]


class AnswerResponse(BaseModel):
    id: int
    question_id: int
    answer_value: Any

    class Config:
        from_attributes = True


class ResponseResponse(BaseModel):
    id: int
    survey_id: int
    submitted_at: datetime
    respondent_id: Optional[str]
    answers: List[AnswerResponse] = []

    class Config:
        from_attributes = True
