# .envファイル設定ガイド

## PostgreSQL接続情報の設定

`.env`ファイルには、PostgreSQLデータベースへの接続に必要な情報を設定します。

### DATABASE_URLの形式

```
postgresql://[ユーザー名]:[パスワード]@[ホスト名]:[ポート番号]/[データベース名]
```

### 各項目の説明

| 項目 | 説明 | 例 |
|------|------|-----|
| **ユーザー名** | PostgreSQLのユーザー名 | `postgres` または `survey_user` |
| **パスワード** | そのユーザーのパスワード | インストール時や作成時に設定したパスワード |
| **ホスト名** | PostgreSQLサーバーのアドレス | `localhost`（ローカルの場合） |
| **ポート番号** | PostgreSQLのポート番号 | `5432`（デフォルト） |
| **データベース名** | 接続するデータベース名 | `survey_db` |

### 設定例

#### 例1: postgresユーザーを使用する場合

```env
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/survey_db
```

**説明：**
- ユーザー名: `postgres`（PostgreSQLのデフォルトスーパーユーザー）
- パスワード: `your_postgres_password`（インストール時に設定したパスワード）
- ホスト: `localhost`（ローカルマシン）
- ポート: `5432`（デフォルトポート）
- データベース: `survey_db`

#### 例2: 専用ユーザー（survey_user）を使用する場合

```env
DATABASE_URL=postgresql://survey_user:your_password_here@localhost:5432/survey_db
```

**説明：**
- ユーザー名: `survey_user`（作成した専用ユーザー）
- パスワード: `your_password_here`（ユーザー作成時に設定したパスワード）
- ホスト: `localhost`
- ポート: `5432`
- データベース: `survey_db`

#### 例3: リモートサーバーに接続する場合

```env
DATABASE_URL=postgresql://survey_user:password@192.168.1.100:5432/survey_db
```

**説明：**
- ホスト: `192.168.1.100`（リモートサーバーのIPアドレス）
- その他の項目は同じ

### 完全な.envファイルの例

```env
# ============================================
# Database Configuration
# ============================================
# PostgreSQL接続情報
# 形式: postgresql://ユーザー名:パスワード@ホスト:ポート/データベース名
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/survey_db

# ============================================
# Security Configuration
# ============================================
# JWT認証用の秘密鍵（本番環境では強力なランダム文字列に変更）
SECRET_KEY=your-secret-key-here-change-in-production

# JWTアルゴリズム
ALGORITHM=HS256

# アクセストークンの有効期限（分）
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ============================================
# Application Configuration
# ============================================
# APIのプレフィックス
API_V1_PREFIX=/api/v1

# CORS許可オリジン（カンマ区切り）
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# ============================================
# QR Code Configuration
# ============================================
# QRコードのサイズ
QR_CODE_SIZE=10

# QRコードのボーダーサイズ
QR_CODE_BORDER=4
```

## 設定手順

### 1. .envファイルの作成

```bash
cd backend
cp .env.example .env
```

### 2. .envファイルを編集

テキストエディタで`.env`ファイルを開き、以下の情報を実際の値に置き換えます：

```env
DATABASE_URL=postgresql://postgres:実際のパスワード@localhost:5432/survey_db
```

### 3. パスワードに特殊文字が含まれる場合

パスワードに特殊文字（`@`, `:`, `/`, `%`など）が含まれる場合は、URLエンコードする必要があります：

| 文字 | URLエンコード |
|------|--------------|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `%` | `%25` |
| `#` | `%23` |
| `&` | `%26` |
| `=` | `%3D` |
| `?` | `%3F` |
| ` ` (スペース) | `%20` |

**例：**
パスワードが `P@ssw0rd!` の場合：
```env
DATABASE_URL=postgresql://postgres:P%40ssw0rd%21@localhost:5432/survey_db
```

### 4. 接続確認

設定後、バックエンドを起動して接続を確認：

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

エラーがなければ接続成功です。エラーが出た場合は、以下を確認してください：

- PostgreSQLサービスが起動しているか
- データベース名が正しいか
- ユーザー名とパスワードが正しいか
- ポート番号が正しいか

## よくある設定ミス

### ❌ 間違った例

```env
# パスワードがそのまま書かれていない
DATABASE_URL=postgresql://postgres@localhost:5432/survey_db

# ポート番号が間違っている
DATABASE_URL=postgresql://postgres:password@localhost:3306/survey_db

# データベース名が間違っている
DATABASE_URL=postgresql://postgres:password@localhost:5432/survey

# プロトコルが間違っている（mysql://ではなくpostgresql://）
DATABASE_URL=mysql://postgres:password@localhost:5432/survey_db
```

### ✅ 正しい例

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/survey_db
```

## セキュリティに関する注意事項

⚠️ **重要：**

1. **`.env`ファイルは絶対にGitにコミットしない**
   - `.gitignore`に`.env`が含まれていることを確認
   - 機密情報（パスワードなど）が含まれています

2. **本番環境では環境変数を使用**
   - 本番環境では`.env`ファイルではなく、環境変数として設定
   - サーバーの環境変数設定機能を使用

3. **強力なパスワードを使用**
   - 本番環境では複雑なパスワードを設定
   - 定期的にパスワードを変更

4. **SECRET_KEYを変更**
   - デフォルトの`SECRET_KEY`は本番環境では使用しない
   - 強力なランダム文字列を生成して使用

## 接続文字列の検証

接続文字列が正しいか確認するには、Pythonで簡単にテストできます：

```python
from sqlalchemy import create_engine

# .envから読み込んだ接続文字列
DATABASE_URL = "postgresql://postgres:password@localhost:5432/survey_db"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("✅ 接続成功！")
except Exception as e:
    print(f"❌ 接続失敗: {e}")
```

## 参考リンク

- [PostgreSQL接続文字列の公式ドキュメント](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [SQLAlchemy接続文字列](https://docs.sqlalchemy.org/en/20/core/engines.html#database-urls)
