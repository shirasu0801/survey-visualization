"""
Survey Schemas
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from app.db.models import QuestionType


class QuestionCreate(BaseModel):
    question_type: QuestionType
    title: str
    description: Optional[str] = None
    required: bool = True
    options: Optional[List[str]] = None
    scale_min: Optional[int] = None
    scale_max: Optional[int] = None
    scale_label_min: Optional[str] = None
    scale_label_max: Optional[str] = None
    conditional_logic: Optional[Dict[str, Any]] = None


class QuestionUpdate(BaseModel):
    order: Optional[int] = None
    question_type: Optional[QuestionType] = None
    title: Optional[str] = None
    description: Optional[str] = None
    required: Optional[bool] = None
    options: Optional[List[str]] = None
    scale_min: Optional[int] = None
    scale_max: Optional[int] = None
    scale_label_min: Optional[str] = None
    scale_label_max: Optional[str] = None
    conditional_logic: Optional[Dict[str, Any]] = None


class QuestionResponse(BaseModel):
    id: int
    survey_id: int
    order: int
    question_type: QuestionType
    title: str
    description: Optional[str]
    required: bool
    options: Optional[List[str]]
    scale_min: Optional[int]
    scale_max: Optional[int]
    scale_label_min: Optional[str]
    scale_label_max: Optional[str]
    conditional_logic: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class SurveyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    created_by: Optional[str] = None
    expires_at: Optional[Union[datetime, str]] = None
    max_responses: Optional[int] = None
    allow_multiple_responses: bool = False
    theme_color: Optional[str] = "#3b82f6"
    logo_url: Optional[str] = None
    default_language: Optional[str] = "ja"
    
    @field_validator('expires_at', mode='before')
    @classmethod
    def parse_expires_at(cls, v):
        """expires_atを文字列からdatetimeに変換"""
        if v is None or v == '':
            return None
        if isinstance(v, str):
            try:
                # ISO形式の文字列をdatetimeに変換
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                try:
                    # 'YYYY-MM-DDTHH:MM'形式を試す
                    return datetime.strptime(v, '%Y-%m-%dT%H:%M')
                except ValueError:
                    return None
        return v


class SurveyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None
    max_responses: Optional[int] = None
    allow_multiple_responses: Optional[bool] = None
    theme_color: Optional[str] = None
    logo_url: Optional[str] = None
    default_language: Optional[str] = None


class SurveyResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    created_by: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    is_active: bool
    expires_at: Optional[datetime]
    max_responses: Optional[int]
    allow_multiple_responses: bool
    theme_color: Optional[str]
    logo_url: Optional[str]
    default_language: str
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True
