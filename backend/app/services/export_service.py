"""
Export Service
"""
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from sqlalchemy.orm import Session
from typing import List

from app.db.models import Survey, Question, Answer, Response


class ExportService:
    @staticmethod
    def generate_pdf_report(survey_id: int, db: Session) -> BytesIO:
        """PDFレポート生成"""
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        if not survey:
            raise ValueError("Survey not found")
        
        # PDFバッファ作成
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        
        # スタイル設定
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Heading1"],
            fontSize=24,
            textColor=colors.HexColor(survey.theme_color or "#3b82f6"),
            spaceAfter=30
        )
        
        # タイトル
        story.append(Paragraph(survey.title, title_style))
        if survey.description:
            story.append(Paragraph(survey.description, styles["Normal"]))
        story.append(Spacer(1, 0.3 * inch))
        
        # 回答数
        total_responses = db.query(Response).filter(Response.survey_id == survey_id).count()
        story.append(Paragraph(f"総回答数: {total_responses}", styles["Heading2"]))
        story.append(Spacer(1, 0.2 * inch))
        
        # 各設問の集計
        questions = db.query(Question).filter(Question.survey_id == survey_id).order_by(Question.order).all()
        
        for question in questions:
            story.append(Paragraph(f"Q{question.order}: {question.title}", styles["Heading3"]))
            
            # 回答取得
            answers = db.query(Answer).join(Response).filter(
                Answer.question_id == question.id,
                Response.survey_id == survey_id
            ).all()
            
            if question.question_type.value in ["single_choice", "multiple_choice"]:
                # 選択肢別集計
                from collections import Counter
                option_counts = Counter()
                for answer in answers:
                    if isinstance(answer.answer_value, list):
                        option_counts.update(answer.answer_value)
                    else:
                        option_counts[str(answer.answer_value)] += 1
                
                # テーブル作成
                table_data = [["選択肢", "回答数", "割合"]]
                total = len(answers)
                for option, count in option_counts.most_common():
                    percentage = (count / total * 100) if total > 0 else 0
                    table_data.append([option, str(count), f"{percentage:.1f}%"])
                
                table = Table(table_data)
                table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 12),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black)
                ]))
                story.append(table)
            
            story.append(Spacer(1, 0.3 * inch))
        
        # PDF生成
        doc.build(story)
        buffer.seek(0)
        return buffer
