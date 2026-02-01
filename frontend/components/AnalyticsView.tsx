'use client'

import { Survey } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AnalyticsViewProps {
  survey: Survey
  analytics: any
  onExport: (format: 'csv' | 'excel' | 'pdf') => void
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsView({ survey, analytics, onExport }: AnalyticsViewProps) {
  const { t } = useTranslation()

  if (!analytics) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-8 text-center">
        <p className="text-gray-400">集計データがありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* サマリー */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4 text-white">集計サマリー</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
            <div className="text-sm text-blue-300">総回答数</div>
            <div className="text-3xl font-bold text-blue-400">{analytics.total_responses}</div>
          </div>
          <div className="bg-green-900 border border-green-700 rounded-lg p-4">
            <div className="text-sm text-green-300">設問数</div>
            <div className="text-3xl font-bold text-green-400">{analytics.questions?.length || 0}</div>
          </div>
          <div className="bg-purple-900 border border-purple-700 rounded-lg p-4">
            <div className="text-sm text-purple-300">回答率</div>
            <div className="text-3xl font-bold text-purple-400">
              {analytics.total_responses > 0 ? '100%' : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* エクスポート */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">{t('survey.export')}</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => onExport('csv')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            CSV
          </button>
          <button
            onClick={() => onExport('excel')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Excel
          </button>
          <button
            onClick={() => onExport('pdf')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            PDF
          </button>
        </div>
      </div>

      {/* 各設問の集計 */}
      {analytics.questions?.map((questionStat: any, index: number) => (
        <div key={questionStat.question_id} className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Q{index + 1}: {questionStat.question_title}
          </h3>
          <div className="text-sm text-gray-400 mb-4">
            回答数: {questionStat.total_answers}
          </div>

          {/* 選択式のグラフ */}
          {questionStat.question_type === 'single_choice' || questionStat.question_type === 'multiple_choice' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 円グラフ */}
              <div>
                <h4 className="text-lg font-medium mb-4 text-white">円グラフ</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(questionStat.statistics?.option_counts || {}).map(([name, value]) => ({
                        name,
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(questionStat.statistics?.option_counts || {}).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* 棒グラフ */}
              <div>
                <h4 className="text-lg font-medium mb-4 text-white">棒グラフ</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(questionStat.statistics?.option_counts || {}).map(([name, value]) => ({
                      name,
                      value,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : questionStat.question_type === 'scale' ? (
            <div>
              <h4 className="text-lg font-medium mb-4 text-white">スケール分布</h4>
              <div className="mb-4">
                <div className="text-sm text-gray-300">
                  平均: {questionStat.statistics?.average?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-gray-300">
                  最小: {questionStat.statistics?.min || 'N/A'} / 最大: {questionStat.statistics?.max || 'N/A'}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(questionStat.statistics?.distribution || {}).map(([name, value]) => ({
                    name: `値 ${name}`,
                    value,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-gray-400">この設問タイプのグラフは未対応です</div>
          )}
        </div>
      ))}
    </div>
  )
}
