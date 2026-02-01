'use client'

import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useTranslation } from '@/lib/i18n'
import QuestionEditor from './QuestionEditor'
import QuestionList from './QuestionList'
import SurveySettings from './SurveySettings'

interface Question {
  id: string
  order: number
  question_type: 'single_choice' | 'multiple_choice' | 'text' | 'scale' | 'date' | 'rating'
  title: string
  description?: string
  required: boolean
  options?: string[]
  scale_min?: number
  scale_max?: number
  scale_label_min?: string
  scale_label_max?: string
}

interface SurveyData {
  title: string
  description?: string
  expires_at?: string
  max_responses?: number
  theme_color?: string
  questions: Question[]
}

interface SurveyBuilderProps {
  onSave: (data: SurveyData) => void
  loading?: boolean
}

export default function SurveyBuilder({ onSave, loading }: SurveyBuilderProps) {
  const { t } = useTranslation()
  const [surveyData, setSurveyData] = useState<SurveyData>({
    title: '',
    description: '',
    theme_color: '#3b82f6',
    questions: [],
  })
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)

  const addQuestion = (type: Question['question_type']) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      order: surveyData.questions.length + 1,
      question_type: type,
      title: '',
      description: '',
      required: true,
      ...(type === 'single_choice' || type === 'multiple_choice' ? { options: ['選択肢1', '選択肢2'] } : {}),
      ...(type === 'scale' ? { scale_min: 1, scale_max: 5 } : {}),
    }
    setSurveyData({
      ...surveyData,
      questions: [...surveyData.questions, newQuestion],
    })
    setSelectedQuestionId(newQuestion.id)
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setSurveyData({
      ...surveyData,
      questions: surveyData.questions.map(q =>
        q.id === id ? { ...q, ...updates } : q
      ),
    })
  }

  const deleteQuestion = (id: string) => {
    const newQuestions = surveyData.questions
      .filter(q => q.id !== id)
      .map((q, index) => ({ ...q, order: index + 1 }))
    setSurveyData({
      ...surveyData,
      questions: newQuestions,
    })
    if (selectedQuestionId === id) {
      setSelectedQuestionId(null)
    }
  }

  const moveQuestion = (dragIndex: number, hoverIndex: number) => {
    const draggedQuestion = surveyData.questions[dragIndex]
    const newQuestions = [...surveyData.questions]
    newQuestions.splice(dragIndex, 1)
    newQuestions.splice(hoverIndex, 0, draggedQuestion)
    const reorderedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order: index + 1,
    }))
    setSurveyData({
      ...surveyData,
      questions: reorderedQuestions,
    })
  }

  const handleSave = () => {
    if (!surveyData.title.trim()) {
      alert('タイトルを入力してください')
      return
    }
    onSave(surveyData)
  }

  const selectedQuestion = surveyData.questions.find(q => q.id === selectedQuestionId)

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左サイドバー: 設問リスト */}
        <div className="lg:col-span-1">
          <QuestionList
            questions={surveyData.questions}
            selectedId={selectedQuestionId}
            onSelect={setSelectedQuestionId}
            onDelete={deleteQuestion}
            onMove={moveQuestion}
            onAddQuestion={addQuestion}
          />
        </div>

        {/* 中央: 設問編集 */}
        <div className="lg:col-span-1">
          {selectedQuestion ? (
            <QuestionEditor
              question={selectedQuestion}
              onUpdate={(updates) => updateQuestion(selectedQuestion.id, updates)}
            />
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-8 text-center text-gray-400">
              設問を選択または追加してください
            </div>
          )}
        </div>

        {/* 右サイドバー: アンケート設定 */}
        <div className="lg:col-span-1">
          <SurveySettings
            surveyData={surveyData}
            onUpdate={(updates) => setSurveyData({ ...surveyData, ...updates })}
            onSave={handleSave}
            loading={loading}
          />
        </div>
      </div>
    </DndProvider>
  )
}
