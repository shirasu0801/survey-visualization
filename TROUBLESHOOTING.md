# トラブルシューティングガイド

## 「Not Found」エラーが発生する場合

### 1. バックエンドサーバーが起動しているか確認

**確認方法：**
```bash
# バックエンドディレクトリに移動
cd backend

# サーバーを起動
uvicorn main:app --reload
```

**正常に起動している場合：**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 2. ブラウザでAPIエンドポイントにアクセスして確認

以下のURLにアクセスして、JSONレスポンスが返ってくるか確認：

- http://localhost:8000/health
- http://localhost:8000/
- http://localhost:8000/docs (Swagger UI)

### 3. データベース接続を確認

`.env`ファイルの`DATABASE_URL`が正しく設定されているか確認：

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/survey_db
```

### 4. よくある問題と解決方法

#### 問題1: ポート8000が既に使用されている

**解決方法：**
```bash
# ポート8000を使用しているプロセスを確認
netstat -ano | findstr :8000

# 別のポートで起動
uvicorn main:app --reload --port 8001
```

フロントエンドの`.env.local`も更新：
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

#### 問題2: データベース接続エラー

**解決方法：**
1. PostgreSQLが起動しているか確認
2. データベースが作成されているか確認
3. `.env`ファイルの接続情報が正しいか確認

#### 問題3: CORSエラー

**解決方法：**
`backend/.env`ファイルで`CORS_ORIGINS`を確認：
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 5. デバッグ方法

#### フロントエンドのコンソールログを確認

ブラウザの開発者ツール（F12）を開いて、Consoleタブでエラーログを確認。

#### バックエンドのログを確認

バックエンドサーバーのターミナル出力でエラーメッセージを確認。

#### ネットワークタブで確認

ブラウザの開発者ツールのNetworkタブで、APIリクエストの詳細を確認：
- リクエストURL
- リクエストメソッド
- レスポンスステータス
- レスポンスボディ

## アンケート作成時のエラー

### エラー: "Not Found"

**原因：**
- バックエンドサーバーが起動していない
- APIエンドポイントのパスが間違っている

**解決方法：**
1. バックエンドサーバーを起動
2. ブラウザで http://localhost:8000/docs にアクセスしてAPIが動作しているか確認

### エラー: "Failed to create survey"

**原因：**
- データベース接続エラー
- データ形式のエラー
- バリデーションエラー

**解決方法：**
1. バックエンドのログを確認
2. データベース接続を確認
3. 送信するデータ形式を確認（ブラウザのコンソールログ）

## 接続確認コマンド

### バックエンドのヘルスチェック

```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:8000/health

# またはブラウザで直接アクセス
# http://localhost:8000/health
```

### APIエンドポイントの確認

```bash
# アンケート一覧取得
Invoke-WebRequest -Uri http://localhost:8000/api/v1/surveys

# Swagger UIで確認
# http://localhost:8000/docs
```

## ログの確認場所

- **フロントエンド**: ブラウザの開発者ツール（F12）→ Consoleタブ
- **バックエンド**: ターミナル出力（uvicornを実行しているウィンドウ）
