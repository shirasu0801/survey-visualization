'use client'

import { useTranslation } from '@/lib/i18n'

interface SurveySettingsProps {
  surveyData: {
    title: string
    description?: string
    expires_at?: string
    max_responses?: number
    theme_color?: string
  }
  onUpdate: (updates: Partial<SurveySettingsProps['surveyData']>) => void
  onSave: () => void
  loading?: boolean
}

export default function SurveySettings({
  surveyData,
  onUpdate,
  onSave,
  loading,
}: SurveySettingsProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">アンケート設定</h2>

      {/* タイトル */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('survey.title')} *
        </label>
        <input
          type="text"
          value={surveyData.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
          placeholder="アンケートタイトル"
        />
      </div>

      {/* 説明 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('survey.description')}
        </label>
        <textarea
          value={surveyData.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
          rows={3}
          placeholder="アンケートの説明"
        />
      </div>

      {/* テーマカラー */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          テーマカラー
        </label>
        <input
          type="color"
          value={surveyData.theme_color || '#3b82f6'}
          onChange={(e) => onUpdate({ theme_color: e.target.value })}
          className="w-full h-10 border border-gray-600 rounded-lg"
        />
      </div>

      {/* 回答期限 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          回答期限
        </label>
        <input
          type="datetime-local"
          value={surveyData.expires_at || ''}
          onChange={(e) => onUpdate({ expires_at: e.target.value })}
          className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
        />
      </div>

      {/* 回答数上限 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          回答数上限
        </label>
        <input
          type="number"
          value={surveyData.max_responses || ''}
          onChange={(e) => onUpdate({ max_responses: e.target.value ? parseInt(e.target.value) : undefined })}
          className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
          placeholder="未設定"
        />
      </div>

      {/* 保存ボタン */}
      <button
        onClick={onSave}
        disabled={loading || !surveyData.title.trim()}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {loading ? '保存中...' : t('survey.save')}
      </button>
    </div>
  )
}
