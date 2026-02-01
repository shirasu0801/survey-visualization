# SECRET_KEY 設定ガイド

## SECRET_KEYとは？

`SECRET_KEY`は、アプリケーションのセキュリティに関わる重要な設定値です。主に以下の用途で使用されます：

1. **JWT（JSON Web Token）の署名**
   - ユーザー認証トークンの生成と検証
   - トークンの改ざんを防ぐ

2. **セッション管理**
   - セッションIDの暗号化
   - Cookieの署名

3. **パスワードリセットトークン**
   - パスワードリセット用の一時トークン生成

4. **CSRF保護**
   - クロスサイトリクエストフォージェリ対策

## 現在の実装状況

**重要：現在の実装では、認証機能がまだ実装されていないため、`SECRET_KEY`は実際には使用されていません。**

ただし、将来的に認証機能を追加する際に必要になるため、設定ファイルには含まれています。

## 開発環境での設定

### 今すぐ設定する必要はあるか？

**開発環境では、今すぐ設定する必要はありません。**

理由：
- 現在の実装では認証機能が未実装
- `.env.example`のデフォルト値で動作する
- 開発中は簡単な値でも問題ない

### 開発環境での推奨設定

```env
# 開発環境用（簡単な値でOK）
SECRET_KEY=dev-secret-key-change-in-production
```

または、`.env`ファイルに記載しなくても、`config.py`のデフォルト値が使用されます。

## 本番環境での設定

### 本番環境では必須

本番環境にデプロイする際は、**必ず強力なランダム文字列に変更してください。**

### 強力なSECRET_KEYの生成方法

#### 方法1: Pythonで生成（推奨）

```python
import secrets

# 32バイト（256ビット）のランダム文字列を生成
secret_key = secrets.token_urlsafe(32)
print(secret_key)
```

実行例：
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 方法2: OpenSSLで生成

```bash
openssl rand -hex 32
```

#### 方法3: オンラインツール（非推奨）

セキュリティ上の理由から、オンラインツールでの生成は避けてください。

### 本番環境での設定例

```env
# 本番環境用（強力なランダム文字列）
SECRET_KEY=K8j3mN9pQ2rT5vX8zA1bC4dE7fG0hI3jK6mN9pQ2rT5vX8zA1bC4dE7fG0hI3jK6m
```

## 設定のタイミング

### 開発段階

1. **初期セットアップ時**
   - `.env.example`をコピーして`.env`を作成
   - デフォルト値のままでもOK（認証機能未実装のため）

2. **認証機能を実装する時**
   - その時点で適切な値を設定
   - 開発環境用の簡単な値でOK

### 本番デプロイ時

1. **デプロイ前に必ず変更**
   - 強力なランダム文字列を生成
   - `.env`ファイルまたは環境変数に設定
   - **絶対にGitにコミットしない**

## よくある質問

### Q1: 今すぐ設定する必要がありますか？

**A: いいえ、開発環境では今すぐ設定する必要はありません。**
- 現在の実装では認証機能が未実装のため、使用されていません
- `.env.example`のデフォルト値で動作します
- 認証機能を実装する際に設定すればOKです

### Q2: デフォルト値のままでも大丈夫ですか？

**A: 開発環境では大丈夫ですが、本番環境では絶対にダメです。**
- 開発環境：デフォルト値でも動作します
- 本番環境：必ず強力なランダム文字列に変更してください

### Q3: SECRET_KEYが漏洩したらどうなりますか？

**A: 深刻なセキュリティリスクがあります。**
- トークンの偽造が可能になる
- ユーザーアカウントの乗っ取りが可能になる
- すぐに新しいSECRET_KEYに変更する必要がある

### Q4: どのくらいの長さが必要ですか？

**A: 最低32文字（256ビット）以上を推奨します。**
- 短すぎると推測されやすい
- 長すぎても問題ないが、32-64文字が一般的

### Q5: 定期的に変更すべきですか？

**A: 通常は変更不要ですが、漏洩が疑われる場合は即座に変更。**
- 正常な運用では変更不要
- 漏洩が疑われる場合は即座に変更
- 変更時は既存のトークンが無効になるため、ユーザーに再ログインを促す

## 実装例（将来の認証機能で使用）

将来的に認証機能を実装する際の使用例：

```python
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import settings

def create_access_token(data: dict):
    """JWTトークンを生成"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """JWTトークンを検証"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None
```

## まとめ

| 環境 | 設定の必要性 | 推奨値 |
|------|------------|--------|
| **開発環境（現在）** | 不要（デフォルト値でOK） | `dev-secret-key-change-in-production` |
| **開発環境（認証実装後）** | 必要 | 簡単な値でOK |
| **本番環境** | **必須** | 32文字以上の強力なランダム文字列 |

**結論：**
- **今すぐ設定する必要はありません**（認証機能未実装のため）
- 本番環境にデプロイする際は、**必ず強力なランダム文字列に変更**してください
