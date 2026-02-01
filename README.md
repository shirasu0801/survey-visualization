# Survey Visualization App

アンケート作成・集計・可視化アプリケーション

## 機能概要

- アンケート作成機能（ドラッグ&ドロップ編集、テンプレート、ロジック分岐）
- 回収・配信機能（URL/QRコード生成、期限設定、多言語対応）
- 集計・可視化機能（自動グラフ生成、フィルタリング、データエクスポート）

## 技術スタック

- **フロントエンド**: Next.js 14 (React)
- **バックエンド**: Python (FastAPI)
- **データベース**: PostgreSQL
- **グラフライブラリ**: Recharts / Chart.js

## セットアップ

詳細なセットアップ手順は [SETUP.md](./SETUP.md) を参照してください。

### クイックスタート

1. **データベースのセットアップ**
   ```sql
   CREATE DATABASE survey_db;
   ```

2. **バックエンドの起動**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   cp .env.example .env  # .envファイルを編集
   uvicorn main:app --reload
   ```

3. **フロントエンドの起動**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. ブラウザで `http://localhost:3000` にアクセス

## プロジェクト構造

```
survey_visualization/
├── backend/          # FastAPI バックエンド
├── frontend/         # Next.js フロントエンド
├── database/         # データベースマイグレーション
└── README.md
```
