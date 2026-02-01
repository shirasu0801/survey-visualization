'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Survey, responseApi } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'
import QRCode from 'qrcode.react'

interface SurveyViewProps {
  survey: Survey
}

export default function SurveyView({ survey }: SurveyViewProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleSubmit = async () => {
    // 必須チェック
    for (const question of survey.questions) {
      if (question.required) {
        const answer = answers[question.id]
        // 複数選択の場合は空配列チェック
        if (question.question_type === 'multiple_choice') {
          if (!answer || !Array.isArray(answer) || answer.length === 0) {
            alert(`${question.title}は必須です`)
            return
          }
        } else {
          // その他のタイプは通常のチェック
          if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
            alert(`${question.title}は必須です`)
            return
          }
        }
      }
    }

    setSubmitting(true)
    try {
      // 回答データを整形
      const answersData = Object.entries(answers)
        .filter(([questionId, answerValue]) => {
          // 空の回答を除外
          if (answerValue === null || answerValue === undefined) return false
          if (typeof answerValue === 'string' && answerValue.trim() === '') return false
          if (Array.isArray(answerValue) && answerValue.length === 0) return false
          return true
        })
        .map(([questionId, answerValue]) => ({
          question_id: Number(questionId),
          answer_value: answerValue, // JSON型なので、そのまま送信（配列もOK）
        }))

      console.log('Submitting response:', {
        survey_id: survey.id,
        answers: answersData,
      })

      const response = await responseApi.submit({
        survey_id: survey.id,
        answers: answersData,
      })
      
      console.log('Response submitted successfully:', response.data)
      setSubmitted(true)
    } catch (error: any) {
      console.error('Failed to submit response:', error)
      
      // 詳細なエラーメッセージを取得
      let errorMessage = '回答の送信に失敗しました'
      
      if (error.response) {
        // APIからのエラーレスポンス
        const status = error.response.status
        const errorData = error.response.data
        
        if (status === 400) {
          if (errorData?.detail) {
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail
            } else if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join('\n')
            }
          } else {
            errorMessage = 'リクエストが不正です。入力内容を確認してください。'
          }
        } else if (status === 404) {
          errorMessage = 'アンケートが見つかりません。'
        } else if (status === 500) {
          errorMessage = 'サーバーエラーが発生しました。しばらくしてから再度お試しください。'
        } else {
          errorMessage = `エラーが発生しました（ステータス: ${status}）`
        }
        
        console.error('Error response:', status, errorData)
      } else if (error.request) {
        // リクエストは送信されたが、レスポンスが返ってこない
        errorMessage = 'サーバーに接続できません。バックエンドサーバーが起動しているか確認してください。'
        console.error('Request error:', error.request)
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(`エラー: ${errorMessage}`)
    } finally {
      setSubmitting(false)
    }
  }

  const surveyUrl = typeof window !== 'undefined' ? `${window.location.origin}/surveys/${survey.id}` : ''

  if (submitted) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold mb-2 text-white">{t('response.submitted')}</h2>
        <p className="text-gray-300">ご回答ありがとうございました</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 回答フォーム */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-6 text-white">回答フォーム</h2>
          
          {survey.questions.map((question, index) => (
            <div key={question.id} className="mb-6">
              <label className="block text-lg font-medium mb-2 text-white">
                {index + 1}. {question.title}
                {question.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {question.description && (
                <p className="text-sm text-gray-300 mb-3">{question.description}</p>
              )}

              {/* 設問タイプ別の入力 */}
              {question.question_type === 'single_choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center text-gray-200">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === 'multiple_choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center text-gray-200">
                      <input
                        type="checkbox"
                        checked={(answers[question.id] || []).includes(option)}
                        onChange={(e) => {
                          const current = answers[question.id] || []
                          const updated = e.target.checked
                            ? [...current, option]
                            : current.filter((v: string) => v !== option)
                          handleAnswerChange(question.id, updated)
                        }}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === 'text' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
                  rows={4}
                  placeholder="回答を入力"
                />
              )}

              {question.question_type === 'scale' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">{question.scale_label_min || question.scale_min}</span>
                    <span className="text-sm text-gray-300">{question.scale_label_max || question.scale_max}</span>
                  </div>
                  <input
                    type="range"
                    min={question.scale_min || 1}
                    max={question.scale_max || 5}
                    value={answers[question.id] || question.scale_min || 1}
                    onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center mt-2 font-medium text-white">
                    {answers[question.id] || question.scale_min || 1}
                  </div>
                </div>
              )}

              {question.question_type === 'date' && (
                <input
                  type="date"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2"
                />
              )}

              {question.question_type === 'rating' && (
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleAnswerChange(question.id, rating)}
                      className={`text-3xl ${
                        answers[question.id] === rating ? 'text-yellow-400' : 'text-gray-500'
                      } hover:text-yellow-400`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {submitting ? '送信中...' : t('response.submit')}
          </button>
        </div>
      </div>

      {/* サイドバー: 共有・QRコード */}
      <div className="lg:col-span-1">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6 sticky top-4">
          <h3 className="text-lg font-semibold mb-4 text-white">{t('survey.share')}</h3>
          
          {/* URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              共有URL
            </label>
            <div className="flex">
              <input
                type="text"
                value={surveyUrl}
                readOnly
                className="flex-1 border border-gray-600 bg-gray-700 text-white rounded-l-lg px-3 py-2 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(surveyUrl)
                  alert('URLをコピーしました')
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-r-lg hover:bg-gray-500"
              >
                コピー
              </button>
            </div>
          </div>

          {/* QRコード */}
          {surveyUrl && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('survey.qrCode')}
              </label>
              <div className="flex justify-center p-4 bg-gray-700 rounded-lg">
                <QRCode value={surveyUrl} size={200} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
