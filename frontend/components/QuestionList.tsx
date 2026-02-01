'use client'

import { useDrag, useDrop } from 'react-dnd'
import { useTranslation } from '@/lib/i18n'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Question {
  id: string
  order: number
  question_type: string
  title: string
}

interface QuestionListProps {
  questions: Question[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onMove: (dragIndex: number, hoverIndex: number) => void
  onAddQuestion: (type: Question['question_type']) => void
}

function QuestionItem({
  question,
  index,
  isSelected,
  onSelect,
  onDelete,
  onMove,
}: {
  question: Question
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onMove: (dragIndex: number, hoverIndex: number) => void
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'question',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'question',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        onMove(draggedItem.index, index)
        draggedItem.index = index
      }
    },
  })

  const questionTypeLabels: Record<string, string> = {
    single_choice: '単一選択',
    multiple_choice: '複数選択',
    text: '記述式',
    scale: 'スケール',
    date: '日付',
    rating: '評価',
  }

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-gray-700 border-2 rounded-lg p-4 mb-2 cursor-move ${
        isSelected ? 'border-blue-500' : 'border-gray-600'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-1">
            {questionTypeLabels[question.question_type] || question.question_type}
          </div>
          <div className="font-medium text-sm text-white">
            {question.title || `設問 ${question.order}`}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="ml-2 text-red-400 hover:text-red-300"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default function QuestionList({
  questions,
  selectedId,
  onSelect,
  onDelete,
  onMove,
  onAddQuestion,
}: QuestionListProps) {
  const { t } = useTranslation()

  const questionTypes: Array<{ type: string; label: string; icon: string }> = [
    { type: 'single_choice', label: '単一選択', icon: '🔘' },
    { type: 'multiple_choice', label: '複数選択', icon: '☑️' },
    { type: 'text', label: '記述式', icon: '📝' },
    { type: 'scale', label: 'スケール', icon: '📊' },
    { type: 'date', label: '日付', icon: '📅' },
    { type: 'rating', label: '評価', icon: '⭐' },
  ]

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">{t('question.add')}</h2>
      
      {/* 設問タイプボタン */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {questionTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onAddQuestion(type as any)}
            className="flex items-center justify-center p-3 border-2 border-gray-600 bg-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-600 transition-colors text-white"
          >
            <span className="mr-2">{icon}</span>
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* 設問リスト */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">設問一覧</h3>
        {questions.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            設問がありません
          </div>
        ) : (
          questions.map((question, index) => (
            <QuestionItem
              key={question.id}
              question={question}
              index={index}
              isSelected={selectedId === question.id}
              onSelect={() => onSelect(question.id)}
              onDelete={() => onDelete(question.id)}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </div>
  )
}
