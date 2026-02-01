# セットアップガイド

## 前提条件

- Python 3.9以上
- Node.js 18以上
- PostgreSQL 12以上
- npm または yarn

## 1. データベースのセットアップ

PostgreSQLを起動し、データベースを作成します：

```sql
CREATE DATABASE survey_db;
CREATE USER survey_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE survey_db TO survey_user;
```

## 2. バックエンドのセットアップ

```bash
cd backend

# 仮想環境の作成
python -m venv venv

# 仮想環境の有効化
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して、データベース接続情報を設定

# サーバーの起動
uvicorn main:app --reload
```

バックエンドは `http://localhost:8000` で起動します。

APIドキュメントは `http://localhost:8000/docs` で確認できます。

## 3. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

## 4. 環境変数の設定

### バックエンド (.env)

```env
DATABASE_URL=postgresql://survey_user:your_password@localhost:5432/survey_db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
API_V1_PREFIX=/api/v1
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
QR_CODE_SIZE=10
QR_CODE_BORDER=4
```

### フロントエンド

`.env.local` ファイルを作成（オプション）：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 5. 使用方法

1. ブラウザで `http://localhost:3000` にアクセス
2. 「アンケートを作成」をクリック
3. 設問を追加してアンケートを作成
4. 作成したアンケートのURLを共有して回答を収集
5. 「集計・分析」タブで結果を確認

## トラブルシューティング

### データベース接続エラー

- PostgreSQLが起動しているか確認
- `.env`ファイルの`DATABASE_URL`が正しいか確認
- データベースとユーザーが作成されているか確認

### CORSエラー

- バックエンドの`.env`で`CORS_ORIGINS`にフロントエンドのURLが含まれているか確認

### ポートが使用中

- バックエンド: デフォルトポート8000を変更する場合は`uvicorn main:app --reload --port 8001`
- フロントエンド: `package.json`の`dev`スクリプトを変更

## 本番環境へのデプロイ

### セキュリティチェックリスト

- [ ] `SECRET_KEY`を強力なランダム文字列に変更
- [ ] SSL/TLS証明書を設定
- [ ] データベース接続を暗号化
- [ ] CORS設定を本番環境のドメインに制限
- [ ] 環境変数を適切に管理（.envファイルをgitにコミットしない）

### 推奨デプロイ方法

- **バックエンド**: Docker、Heroku、AWS Lambda、Google Cloud Run
- **フロントエンド**: Vercel、Netlify、AWS Amplify
- **データベース**: AWS RDS、Google Cloud SQL、Heroku Postgres
