'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { surveyApi, Survey, analyticsApi, exportApi } from '@/lib/api'
import SurveyView from '@/components/SurveyView'
import AnalyticsView from '@/components/AnalyticsView'
import { useTranslation } from '@/lib/i18n'

export default function SurveyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'view' | 'analytics'>('view')
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      loadSurvey()
    }
  }, [params.id])

  const loadSurvey = async () => {
    try {
      const response = await surveyApi.get(Number(params.id))
      setSurvey(response.data)
      
      // 集計データも取得
      try {
        const analyticsResponse = await analyticsApi.getSummary(Number(params.id))
        setAnalytics(analyticsResponse.data)
      } catch (error) {
        console.error('Failed to load analytics:', error)
      }
    } catch (error) {
      console.error('Failed to load survey:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      let response
      switch (format) {
        case 'csv':
          response = await exportApi.csv(Number(params.id))
          break
        case 'excel':
          response = await exportApi.excel(Number(params.id))
          break
        case 'pdf':
          response = await exportApi.pdf(Number(params.id))
          break
      }
      
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `survey_${params.id}.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      alert('エクスポートに失敗しました')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">読み込み中...</div>
  }

  if (!survey) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">アンケートが見つかりません</div>
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2 text-white">{survey.title}</h1>
          {survey.description && <p className="text-gray-300">{survey.description}</p>}
        </div>

        {/* タブ */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'view'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              回答画面
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              集計・分析
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        {activeTab === 'view' ? (
          <SurveyView survey={survey} />
        ) : (
          <AnalyticsView survey={survey} analytics={analytics} onExport={handleExport} />
        )}
      </div>
    </div>
  )
}
