# PostgreSQL セットアップガイド

## 1. PostgreSQLのインストール

### Windowsでのインストール

1. **PostgreSQL公式サイトからダウンロード**
   - https://www.postgresql.org/download/windows/
   - または https://www.postgresql.org/download/ からWindows用インストーラーをダウンロード

2. **インストール手順**
   - インストーラーを実行
   - インストールパスを選択（デフォルト: `C:\Program Files\PostgreSQL\<version>`）
   - **データディレクトリ**を選択（デフォルト: `C:\Program Files\PostgreSQL\<version>\data`）
   - **スーパーユーザー（postgres）のパスワード**を設定（重要：忘れないように！）
   - ポート番号を選択（デフォルト: `5432`）
   - ロケールを選択（デフォルト: `Japanese, Japan` または `C`）

## 2. PostgreSQLサービスの起動

### 方法1: Windowsサービスとして起動（推奨）

PostgreSQLは通常、Windowsサービスとして自動起動するように設定されます。

1. **サービス管理画面で確認**
   - `Win + R` キーを押す
   - `services.msc` と入力してEnter
   - `postgresql-x64-<version>` というサービスを探す
   - ステータスが「実行中」になっているか確認

2. **手動で起動する場合**
   - サービスを右クリック → 「開始」

3. **自動起動に設定**
   - サービスを右クリック → 「プロパティ」
   - 「スタートアップの種類」を「自動」に設定

### 方法2: コマンドラインで起動

```powershell
# PostgreSQLサービスの起動
net start postgresql-x64-<version>

# 例: PostgreSQL 15の場合
net start postgresql-x64-15
```

### 方法3: pg_ctlコマンドで起動

```powershell
# PostgreSQLのbinディレクトリに移動
cd "C:\Program Files\PostgreSQL\<version>\bin"

# データディレクトリを指定して起動
.\pg_ctl.exe -D "C:\Program Files\PostgreSQL\<version>\data" start
```

## 3. 接続確認

### psqlコマンドで接続確認

```powershell
# PostgreSQLのbinディレクトリに移動
cd "C:\Program Files\PostgreSQL\<version>\bin"

# postgresユーザーで接続
.\psql.exe -U postgres

# パスワードを求められたら、インストール時に設定したパスワードを入力
```

接続成功すると、以下のようなプロンプトが表示されます：
```
postgres=#
```

### 接続情報の確認

```sql
-- データベース一覧を表示
\l

-- 現在の接続情報を表示
\conninfo

-- PostgreSQLのバージョンを確認
SELECT version();
```

## 4. データベースとユーザーの作成

### スーパーユーザー（postgres）で接続して作成

```sql
-- データベースの作成
CREATE DATABASE survey_db;

-- ユーザーの作成（オプション）
CREATE USER survey_user WITH PASSWORD 'your_password_here';

-- 権限の付与
GRANT ALL PRIVILEGES ON DATABASE survey_db TO survey_user;

-- 作成したデータベースに接続
\c survey_db

-- スキーマへの権限付与（PostgreSQL 15以降では必要）
GRANT ALL ON SCHEMA public TO survey_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO survey_user;
```

### コマンドラインから直接作成

```powershell
# binディレクトリに移動
cd "C:\Program Files\PostgreSQL\<version>\bin"

# データベース作成
.\createdb.exe -U postgres survey_db

# ユーザー作成
.\createuser.exe -U postgres -P survey_user
# パスワードを求められたら設定
```

## 5. 接続文字列の設定

作成したデータベース情報を `.env` ファイルに設定します：

```env
# backend/.env
DATABASE_URL=postgresql://survey_user:your_password_here@localhost:5432/survey_db

# または、postgresユーザーを使用する場合
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/survey_db
```

## 6. トラブルシューティング

### ポート5432が使用中

```powershell
# ポート5432を使用しているプロセスを確認
netstat -ano | findstr :5432

# プロセスIDを確認したら、タスクマネージャーで終了
```

### サービスが起動しない

1. **イベントビューアーでエラーログを確認**
   - `Win + R` → `eventvwr.msc`
   - Windowsログ → アプリケーション
   - PostgreSQL関連のエラーを確認

2. **データディレクトリの権限を確認**
   - データディレクトリ（通常は `C:\Program Files\PostgreSQL\<version>\data`）の権限を確認
   - PostgreSQLサービスアカウントに読み書き権限があるか確認

3. **ログファイルを確認**
   - データディレクトリ内の `log` フォルダまたは `pg_log` フォルダを確認

### 接続が拒否される

1. **PostgreSQLが起動しているか確認**
   ```powershell
   net start | findstr postgresql
   ```

2. **ファイアウォールの設定を確認**
   - Windowsファイアウォールでポート5432が許可されているか確認

3. **pg_hba.confの設定を確認**
   - ファイル位置: `C:\Program Files\PostgreSQL\<version>\data\pg_hba.conf`
   - ローカル接続が許可されているか確認
   - 変更後はPostgreSQLサービスを再起動

### よくあるエラー

**エラー: "password authentication failed"**
- パスワードが間違っている
- ユーザー名が間違っている

**エラー: "could not connect to server"**
- PostgreSQLサービスが起動していない
- ポート番号が間違っている

**エラー: "database does not exist"**
- データベースが作成されていない
- データベース名が間違っている

## 7. 便利なコマンド

```powershell
# PostgreSQLサービスの停止
net stop postgresql-x64-<version>

# PostgreSQLサービスの再起動
net stop postgresql-x64-<version>
net start postgresql-x64-<version>

# PostgreSQLのバージョン確認
cd "C:\Program Files\PostgreSQL\<version>\bin"
.\psql.exe --version
```

## 8. GUIツール（オプション）

PostgreSQLの管理を簡単にするGUIツール：

- **pgAdmin**: PostgreSQL公式の管理ツール
  - https://www.pgadmin.org/
  - インストール時に一緒にインストールされる場合があります

- **DBeaver**: 汎用データベース管理ツール
  - https://dbeaver.io/

- **TablePlus**: モダンなデータベース管理ツール
  - https://tableplus.com/

## 9. 次のステップ

PostgreSQLが起動し、データベースが作成できたら：

1. `backend/.env` ファイルに接続情報を設定
2. バックエンドを起動して接続を確認
3. アプリケーションを使用開始

詳細は [SETUP.md](./SETUP.md) を参照してください。
