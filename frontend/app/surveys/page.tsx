'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { surveyApi, Survey } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'

export default function SurveysPage() {
  const { t } = useTranslation()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSurveys()
  }, [])

  const loadSurveys = async () => {
    try {
      const response = await surveyApi.list()
      setSurveys(response.data)
    } catch (error) {
      console.error('Failed to load surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">アンケート一覧</h1>
          <Link
            href="/surveys/create"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            + 新規作成
          </Link>
        </div>

        {surveys.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-8 text-center text-gray-400">
            アンケートがありません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <Link
                key={survey.id}
                href={`/surveys/${survey.id}`}
                className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6 hover:shadow-lg hover:bg-gray-750 transition-all"
              >
                <h2 className="text-xl font-semibold mb-2 text-white">{survey.title}</h2>
                {survey.description && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{survey.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>設問数: {survey.questions?.length || 0}</span>
                  <span className={survey.is_active ? 'text-green-400' : 'text-gray-500'}>
                    {survey.is_active ? '公開中' : '非公開'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
