# pip install エラー解決ガイド

## pandasインストールエラーの解決方法

Windows環境で`pandas`のインストール時に`metadata-generation-failed`エラーが発生する場合の対処法です。

## 解決方法（優先順位順）

### 方法1: プリコンパイル済みバイナリを使用（推奨・最も簡単）

`pandas`と`numpy`を個別にインストールします：

```bash
# 1. pipをアップグレード
python -m pip install --upgrade pip

# 2. wheelをインストール（バイナリパッケージのサポート）
pip install wheel

# 3. pandasとnumpyを個別にインストール
pip install numpy
pip install pandas

# 4. その後、requirements.txtの残りをインストール
pip install -r requirements.txt
```

### 方法2: バージョンを指定してインストール

最新版ではなく、安定したバージョンを指定します：

```bash
pip install numpy==1.24.3
pip install pandas==2.0.3
pip install -r requirements.txt
```

### 方法3: Visual C++ ビルドツールをインストール

`pandas`の一部の依存関係をビルドするために必要です：

1. **Microsoft C++ Build Toolsをダウンロード**
   - https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - 「Build Tools for Visual Studio」をダウンロード

2. **インストール時に以下を選択**
   - 「C++ ビルドツール」ワークロード
   - 「Windows 10 SDK」（最新版）
   - 「MSVC v143 - VS 2022 C++ x64/x86 ビルドツール」

3. **インストール後、再起動**

4. **再度インストールを試行**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

### 方法4: condaを使用する（代替案）

condaを使用すると、ビルド済みパッケージが簡単にインストールできます：

```bash
# condaをインストール（Miniconda推奨）
# https://docs.conda.io/en/latest/miniconda.html

# conda環境を作成
conda create -n survey_env python=3.11
conda activate survey_env

# pandasとnumpyをcondaでインストール
conda install pandas numpy

# 残りをpipでインストール
pip install -r requirements.txt
```

### 方法5: 軽量版のrequirements.txtを使用（一時的な回避策）

開発初期段階では、一部のパッケージを除外できます：

```bash
# 最小限のパッケージのみインストール
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic pydantic-settings python-dotenv

# pandas関連は後でインストール
pip install pandas openpyxl
```

## 推奨される手順

### ステップ1: pipをアップグレード

```bash
python -m pip install --upgrade pip
```

### ステップ2: wheelをインストール

```bash
pip install wheel
```

### ステップ3: 個別にインストール

```bash
# まず基本パッケージ
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic pydantic-settings python-dotenv

# 次にnumpy
pip install numpy

# 次にpandas
pip install pandas

# 最後に残り
pip install python-multipart python-jose[cryptography] passlib[bcrypt] qrcode[pil] openpyxl reportlab alembic pytest pytest-asyncio
```

## エラーログの確認

詳細なエラー情報を確認するには：

```bash
# 詳細なログを表示
pip install -r requirements.txt -v

# または、エラーログファイルを確認
# パス: C:\Users\PRO B850-P WIFI\AppData\Local\Temp\pip-install-*\pandas_*\meson-logs\meson-log.txt
```

## よくあるエラーと対処法

### エラー: "Microsoft Visual C++ 14.0 is required"

**対処法：**
- Visual C++ Build Toolsをインストール（方法3を参照）

### エラー: "Failed building wheel for pandas"

**対処法：**
- `pip install wheel`を実行
- プリコンパイル済みバイナリを使用（方法1を参照）

### エラー: "metadata-generation-failed"

**対処法：**
- pipをアップグレード
- 個別にインストール（方法1を参照）
- バージョンを指定（方法2を参照）

## 確認方法

インストールが成功したか確認：

```bash
python -c "import pandas; print(pandas.__version__)"
python -c "import numpy; print(numpy.__version__)"
python -c "import fastapi; print(fastapi.__version__)"
```

すべてのパッケージがインストールされているか確認：

```bash
pip list
```

## それでも解決しない場合

1. **Pythonのバージョンを確認**
   ```bash
   python --version
   ```
   - Python 3.9以上を推奨
   - Python 3.11または3.12が最も互換性が高い

2. **仮想環境を再作成**
   ```bash
   # 古い仮想環境を削除
   rmdir /s venv
   
   # 新しい仮想環境を作成
   python -m venv venv
   venv\Scripts\activate
   
   # 再度インストール
   pip install --upgrade pip
   pip install wheel
   pip install -r requirements.txt
   ```

3. **管理者権限で実行**
   - PowerShellを管理者として実行
   - 再度インストールを試行
