'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'

interface Question {
  id: string
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

interface QuestionEditorProps {
  question: Question
  onUpdate: (updates: Partial<Question>) => void
}

export default function QuestionEditor({ question, onUpdate }: QuestionEditorProps) {
  const { t } = useTranslation()
  const [localQuestion, setLocalQuestion] = useState(question)

  useEffect(() => {
    setLocalQuestion(question)
  }, [question])

  const handleChange = (field: keyof Question, value: any) => {
    const updated = { ...localQuestion, [field]: value }
    setLocalQuestion(updated)
    onUpdate({ [field]: value })
  }

  const addOption = () => {
    const newOptions = [...(localQuestion.options || []), `選択肢${(localQuestion.options?.length || 0) + 1}`]
    handleChange('options', newOptions)
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(localQuestion.options || [])]
    newOptions[index] = value
    handleChange('options', newOptions)
  }

  const deleteOption = (index: number) => {
    const newOptions = localQuestion.options?.filter((_, i) => i !== index) || []
    handleChange('options', newOptions)
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">設問編集</h2>

      {/* 設問タイプ */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('question.type')}
        </label>
        <select
          value={localQuestion.question_type}
          onChange={(e) => handleChange('question_type', e.target.value)}
          className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
        >
          <option value="single_choice">単一選択</option>
          <option value="multiple_choice">複数選択</option>
          <option value="text">記述式</option>
          <option value="scale">スケール</option>
          <option value="date">日付</option>
          <option value="rating">評価</option>
        </select>
      </div>

      {/* 設問文 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('question.title')} *
        </label>
        <input
          type="text"
          value={localQuestion.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
          placeholder="設問文を入力"
        />
      </div>

      {/* 説明 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          説明（オプション）
        </label>
        <textarea
          value={localQuestion.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
          rows={3}
          placeholder="設問の説明を入力"
        />
      </div>

      {/* 必須/任意 */}
      <div className="mb-4">
        <label className="flex items-center text-gray-300">
          <input
            type="checkbox"
            checked={localQuestion.required}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">{t('question.required')}</span>
        </label>
      </div>

      {/* 選択肢（単一選択・複数選択の場合） */}
      {(localQuestion.question_type === 'single_choice' || localQuestion.question_type === 'multiple_choice') && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('question.options')}
          </label>
          {localQuestion.options?.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 mr-2"
                placeholder={`選択肢 ${index + 1}`}
              />
              <button
                onClick={() => deleteOption(index)}
                className="text-red-400 hover:text-red-300 px-2"
              >
                削除
              </button>
            </div>
          ))}
          <button
            onClick={addOption}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            + {t('question.addOption')}
          </button>
        </div>
      )}

      {/* スケール設定 */}
      {localQuestion.question_type === 'scale' && (
        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                最小値
              </label>
              <input
                type="number"
                value={localQuestion.scale_min || 1}
                onChange={(e) => handleChange('scale_min', parseInt(e.target.value))}
                className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                最大値
              </label>
              <input
                type="number"
                value={localQuestion.scale_max || 5}
                onChange={(e) => handleChange('scale_max', parseInt(e.target.value))}
                className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                最小値ラベル
              </label>
              <input
                type="text"
                value={localQuestion.scale_label_min || ''}
                onChange={(e) => handleChange('scale_label_min', e.target.value)}
                className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
                placeholder="例: 全くそう思わない"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                最大値ラベル
              </label>
              <input
                type="text"
                value={localQuestion.scale_label_max || ''}
                onChange={(e) => handleChange('scale_label_max', e.target.value)}
                className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
                placeholder="例: 非常にそう思う"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
