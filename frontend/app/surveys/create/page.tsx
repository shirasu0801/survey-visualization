'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n'
import { surveyApi, SurveyCreate } from '@/lib/api'
import { checkApiConnection } from '@/lib/api-check'
import SurveyBuilder from '@/components/SurveyBuilder'

export default function CreateSurveyPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [apiConnected, setApiConnected] = useState<boolean | null>(null)

  useEffect(() => {
    // ページ読み込み時にAPI接続を確認
    checkApiConnection().then((result) => {
      setApiConnected(result.connected)
      if (!result.connected) {
        console.warn('API接続確認:', result.message)
      }
    })
  }, [])

  const handleSave = async (surveyData: SurveyCreate & { questions: any[] }) => {
    setLoading(true)
    try {
      const { questions, ...surveyInfo } = surveyData
      
      // タイトルのバリデーション
      if (!surveyInfo.title || !surveyInfo.title.trim()) {
        alert('アンケートタイトルを入力してください')
        setLoading(false)
        return
      }
      
      // expires_atをdatetime形式に変換（文字列の場合はそのまま、空の場合はundefined）
      const surveyPayload: any = {
        title: surveyInfo.title.trim(),
        allow_multiple_responses: surveyInfo.allow_multiple_responses || false,
        theme_color: surveyInfo.theme_color || '#3b82f6',
        default_language: surveyInfo.default_language || 'ja',
      }
      
      // オプショナルフィールドの処理
      if (surveyInfo.description && surveyInfo.description.trim()) {
        surveyPayload.description = surveyInfo.description.trim()
      }
      if (surveyInfo.expires_at && surveyInfo.expires_at.trim()) {
        // datetime-localの形式（YYYY-MM-DDTHH:MM）をISO形式に変換
        const dateStr = surveyInfo.expires_at.trim()
        surveyPayload.expires_at = dateStr.includes('T') ? dateStr : `${dateStr}T00:00`
      }
      if (surveyInfo.max_responses && surveyInfo.max_responses > 0) {
        surveyPayload.max_responses = surveyInfo.max_responses
      }
      
      console.log('Creating survey with payload:', surveyPayload)
      const surveyResponse = await surveyApi.create(surveyPayload)
      const surveyId = surveyResponse.data.id
      
      console.log('Survey created with ID:', surveyId)
      console.log('Total questions to add:', questions?.length || 0)
      
      // 設問を追加
      const failedQuestions: number[] = []
      const successQuestions: number[] = []
      
      if (questions && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i]
          
          // 設問タイトルが空の場合はスキップ（エラーとして記録）
          if (!question.title || question.title.trim() === '') {
            console.warn(`設問${i + 1}のタイトルが空のためスキップします`)
            failedQuestions.push(i + 1)
            continue
          }
          
          // 設問データを整形（idとorderを除外）
          const { id, order, ...questionData } = question
          
          // タイトルをトリム
          questionData.title = questionData.title.trim()
          
          // 空のdescriptionをundefinedに
          if (!questionData.description || questionData.description.trim() === '') {
            questionData.description = undefined
          } else {
            questionData.description = questionData.description.trim()
          }
          
          // 選択肢タイプの場合、optionsが必須
          if (questionData.question_type === 'single_choice' || questionData.question_type === 'multiple_choice') {
            if (!questionData.options || questionData.options.length === 0) {
              console.warn(`設問${i + 1}（${questionData.title}）に選択肢がないためスキップします`)
              failedQuestions.push(i + 1)
              continue
            }
            // 空の選択肢をフィルタリング
            questionData.options = questionData.options.filter((opt: string) => opt && opt.trim() !== '')
            if (questionData.options.length === 0) {
              console.warn(`設問${i + 1}（${questionData.title}）に有効な選択肢がないためスキップします`)
              failedQuestions.push(i + 1)
              continue
            }
          } else {
            // 選択肢タイプでない場合はoptionsを削除
            delete questionData.options
          }
          
          // スケールタイプの場合、デフォルト値を設定
          if (questionData.question_type === 'scale') {
            if (!questionData.scale_min) questionData.scale_min = 1
            if (!questionData.scale_max) questionData.scale_max = 5
            if (!questionData.scale_label_min || questionData.scale_label_min.trim() === '') {
              questionData.scale_label_min = undefined
            }
            if (!questionData.scale_label_max || questionData.scale_label_max.trim() === '') {
              questionData.scale_label_max = undefined
            }
          } else {
            // スケールタイプでない場合はスケール関連フィールドを削除
            delete questionData.scale_min
            delete questionData.scale_max
            delete questionData.scale_label_min
            delete questionData.scale_label_max
          }
          
          console.log(`Adding question ${i + 1}/${questions.length}:`, questionData)
          try {
            const questionResponse = await surveyApi.addQuestion(surveyId, questionData)
            console.log(`Question ${i + 1} added successfully:`, questionResponse.data)
            successQuestions.push(i + 1)
          } catch (error: any) {
            console.error(`Failed to add question ${i + 1}:`, error)
            failedQuestions.push(i + 1)
            // エラーが発生しても続行（他の設問を追加するため）
          }
        }
        
        // 結果を表示
        const totalQuestions = questions.length
        const successCount = successQuestions.length
        const failedCount = failedQuestions.length
        
        if (failedCount > 0) {
          // 一部失敗した場合
          alert(`${successCount}個の設問を追加しました。${failedCount}個の設問の追加に失敗しました（設問番号: ${failedQuestions.join(', ')}）`)
        } else if (successCount > 0) {
          // すべて成功した場合
          console.log(`All ${successCount} questions added successfully`)
        } else {
          // すべて失敗した場合
          alert(`設問の追加に失敗しました。バックエンドサーバーが起動しているか確認してください。`)
        }
      }
      
      router.push(`/surveys/${surveyId}`)
    } catch (error: any) {
      console.error('Failed to create survey:', error)
      
      // 詳細なエラーメッセージを取得
      let errorMessage = 'アンケートの作成に失敗しました'
      
      if (error.response) {
        // APIからのエラーレスポンス
        const status = error.response.status
        const errorData = error.response.data
        
        if (status === 404) {
          errorMessage = 'APIエンドポイントが見つかりません。バックエンドサーバーが起動しているか確認してください。'
        } else if (status === 500) {
          errorMessage = 'サーバーエラーが発生しました。バックエンドのログを確認してください。'
        } else if (errorData?.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join('\n')
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          }
        } else {
          errorMessage = `HTTPエラー ${status}: ${error.response.statusText || 'Unknown error'}`
        }
        console.error('Error response:', status, errorData)
      } else if (error.request) {
        // リクエストは送信されたが、レスポンスが返ってこない
        errorMessage = `バックエンドサーバーに接続できません。\n\n確認事項:\n1. バックエンドサーバーが起動しているか\n2. API URLが正しいか (${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'})\n3. ネットワーク接続が正常か`
        console.error('Request error:', error.request)
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(`エラー: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">{t('survey.create')}</h1>
        
        {/* API接続警告 */}
        {apiConnected === false && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-200 mr-2">⚠️</span>
              <div className="text-red-200">
                <div className="font-semibold mb-1">バックエンドサーバーに接続できません</div>
                <div className="text-sm text-red-300">
                  バックエンドサーバーを起動してください: <code className="bg-red-800 px-2 py-1 rounded">cd backend && uvicorn main:app --reload</code>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <SurveyBuilder onSave={handleSave} loading={loading} />
      </div>
    </div>
  )
}
