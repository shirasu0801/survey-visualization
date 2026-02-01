/**
 * API接続確認ユーティリティ
 */
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function checkApiConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 })
    if (response.status === 200) {
      return { connected: true, message: 'バックエンドサーバーに接続できました' }
    }
    return { connected: false, message: `サーバーは応答しましたが、予期しないステータス: ${response.status}` }
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      return {
        connected: false,
        message: `バックエンドサーバーに接続できません。\n\n確認事項:\n1. バックエンドサーバーが起動しているか\n   (cd backend && uvicorn main:app --reload)\n2. API URLが正しいか: ${API_URL}\n3. ポート8000が使用可能か`,
      }
    }
    if (error.response) {
      return {
        connected: false,
        message: `サーバーエラー: ${error.response.status} ${error.response.statusText}`,
      }
    }
    return {
      connected: false,
      message: `接続エラー: ${error.message}`,
    }
  }
}
