/**
 * API Client
 */
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// エラーレスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // エラーの詳細をログに記録
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      })
    } else if (error.request) {
      console.error('API Request Error:', {
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      })
    } else {
      console.error('API Error:', error.message)
    }
    return Promise.reject(error)
  }
)

// Types
export interface Survey {
  id: number
  title: string
  description?: string
  created_at: string
  is_active: boolean
  expires_at?: string
  max_responses?: number
  theme_color?: string
  logo_url?: string
  questions: Question[]
}

export interface Question {
  id: number
  survey_id: number
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

export interface SurveyCreate {
  title: string
  description?: string
  expires_at?: string
  max_responses?: number
  theme_color?: string
  default_language?: string
}

export interface ResponseCreate {
  survey_id: number
  answers: Array<{
    question_id: number
    answer_value: any
  }>
}

// API Functions
export const surveyApi = {
  list: () => api.get<Survey[]>('/surveys'),
  get: (id: number) => api.get<Survey>(`/surveys/${id}`),
  create: (data: SurveyCreate) => api.post<Survey>('/surveys', data),
  update: (id: number, data: Partial<SurveyCreate>) => api.put<Survey>(`/surveys/${id}`, data),
  delete: (id: number) => api.delete(`/surveys/${id}`),
  
  // Questions
  addQuestion: (surveyId: number, question: any) => 
    api.post(`/surveys/${surveyId}/questions`, question),
  updateQuestion: (surveyId: number, questionId: number, question: any) =>
    api.put(`/surveys/${surveyId}/questions/${questionId}`, question),
  deleteQuestion: (surveyId: number, questionId: number) =>
    api.delete(`/surveys/${surveyId}/questions/${questionId}`),
  reorderQuestions: (surveyId: number, orders: Array<{ question_id: number; order: number }>) =>
    api.post(`/surveys/${surveyId}/questions/reorder`, orders),
}

export const responseApi = {
  submit: (data: ResponseCreate) => api.post('/responses', data),
  list: (surveyId: number) => api.get(`/responses/survey/${surveyId}`),
  get: (id: number) => api.get(`/responses/${id}`),
}

export const analyticsApi = {
  getSummary: (surveyId: number) => api.get(`/analytics/survey/${surveyId}/summary`),
  getQuestionAnalytics: (surveyId: number, questionId: number) =>
    api.get(`/analytics/survey/${surveyId}/question/${questionId}`),
  getCrossAnalysis: (surveyId: number, questionId1: number, questionId2: number) =>
    api.get(`/analytics/survey/${surveyId}/cross-analysis?question_id_1=${questionId1}&question_id_2=${questionId2}`),
}

export const exportApi = {
  csv: (surveyId: number) => api.get(`/export/survey/${surveyId}/csv`, { responseType: 'blob' }),
  excel: (surveyId: number) => api.get(`/export/survey/${surveyId}/excel`, { responseType: 'blob' }),
  pdf: (surveyId: number) => api.get(`/export/survey/${surveyId}/pdf`, { responseType: 'blob' }),
}

export const qrApi = {
  getQRCode: (surveyId: number, baseUrl: string) =>
    api.get(`/qr/survey/${surveyId}?base_url=${encodeURIComponent(baseUrl)}`, { responseType: 'blob' }),
}
