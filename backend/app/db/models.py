"""
Database Models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.db.database import Base


class QuestionType(str, enum.Enum):
    """設問タイプ"""
    SINGLE_CHOICE = "single_choice"  # 単一選択
    MULTIPLE_CHOICE = "multiple_choice"  # 複数選択
    TEXT = "text"  # 記述式
    SCALE = "scale"  # スケール（1-5など）
    DATE = "date"  # 日付
    RATING = "rating"  # 評価（星など）


class Survey(Base):
    """アンケート"""
    __tablename__ = "surveys"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 設定
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    max_responses = Column(Integer, nullable=True)
    allow_multiple_responses = Column(Boolean, default=False)
    
    # デザイン設定
    theme_color = Column(String(7), default="#3b82f6")  # テーマカラー
    logo_url = Column(String(500), nullable=True)
    
    # 多言語対応
    default_language = Column(String(10), default="ja")
    
    # リレーション
    questions = relationship("Question", back_populates="survey", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="survey", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Survey(id={self.id}, title='{self.title}')>"


class Question(Base):
    """設問"""
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id"), nullable=False)
    order = Column(Integer, nullable=False)  # 表示順序
    question_type = Column(SQLEnum(QuestionType), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    required = Column(Boolean, default=True)
    
    # 選択肢（JSON形式で保存）
    options = Column(JSON, nullable=True)  # ["選択肢1", "選択肢2", ...]
    
    # スケール設定
    scale_min = Column(Integer, nullable=True)  # 最小値
    scale_max = Column(Integer, nullable=True)  # 最大値
    scale_label_min = Column(String(100), nullable=True)  # 最小値ラベル
    scale_label_max = Column(String(100), nullable=True)  # 最大値ラベル
    
    # ロジック分岐設定
    conditional_logic = Column(JSON, nullable=True)  # {"show_if": {"question_id": 1, "answer": "はい"}}
    
    # リレーション
    survey = relationship("Survey", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Question(id={self.id}, title='{self.title}', type='{self.question_type}')>"


class Response(Base):
    """回答"""
    __tablename__ = "responses"
    
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id"), nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 回答者情報（オプション）
    respondent_id = Column(String(100), nullable=True)  # 匿名化されたID
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # リレーション
    survey = relationship("Survey", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Response(id={self.id}, survey_id={self.survey_id})>"


class Answer(Base):
    """個別の回答"""
    __tablename__ = "answers"
    
    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("responses.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    
    # 回答内容（JSON形式で保存、複数選択に対応）
    answer_value = Column(JSON, nullable=False)  # 文字列、数値、配列など
    
    # リレーション
    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
    
    def __repr__(self):
        return f"<Answer(id={self.id}, question_id={self.question_id}, value='{self.answer_value}')>"
