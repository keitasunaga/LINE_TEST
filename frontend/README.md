# LINE Web App Frontend

Next.js 15ベースのWebアプリケーション。複数のメッセージングプラットフォーム（LINE LIFF、Telegram WebApp等）に対応。

## 🚀 セットアップ

### 前提条件
- Node.js 20以上
- pnpm
- Docker & Docker Compose

### 開発環境セットアップ

1. **依存関係のインストール**
```bash
pnpm install
```

2. **環境変数の設定**
```bash
# .env.localファイルを作成
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_LIFF_ID=your-liff-id-here
```

3. **開発サーバーの起動**
```bash
# 通常の開発サーバー
pnpm dev

# または Docker Composeを使用
docker compose up
```

4. **アクセス**
- 開発サーバー: http://localhost:3001
- Docker版: http://localhost:3001

## 🐳 Docker使用方法

### 開発環境
```bash
# 開発サーバーの起動
docker compose up

# バックグラウンドで起動
docker compose up -d

# 停止
docker compose down
```

### 本番環境ビルド
```bash
# 本番用イメージをビルド
docker build -t line-web-app .

# 本番環境で実行
docker run -p 3001:3001 line-web-app
```

## 🏗️ アーキテクチャ

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Deployment**: Docker + Cloud Run

## 📁 プロジェクト構造

```
frontend/
├── src/
│   ├── app/              # App Router
│   ├── components/       # Reactコンポーネント
│   ├── lib/              # ユーティリティ関数
│   ├── hooks/            # カスタムフック
│   └── types/            # TypeScript型定義
├── public/               # 静的ファイル
├── Dockerfile            # 本番用Dockerfile
├── Dockerfile.dev        # 開発用Dockerfile
└── docker-compose.yml    # Docker Compose設定
```

## 📱 対応プラットフォーム

- LINE LIFF
- Telegram WebApp
- 通常のWebブラウザ

## 🔧 環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | バックエンドAPIのURL | `http://localhost:3000` |
| `NEXT_PUBLIC_LIFF_ID` | LINE LIFF ID | - |
| `NODE_ENV` | 実行環境 | `development` |

## 🚀 デプロイ

### Cloud Run
```bash
# イメージをビルド
docker build -t gcr.io/PROJECT_ID/line-web-app .

# Cloud Runにデプロイ
gcloud run deploy line-web-app \
  --image gcr.io/PROJECT_ID/line-web-app \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated
```

## 🛠️ 開発

### ローカル開発
```bash
# 開発サーバー起動
pnpm dev

# 型チェック
pnpm type-check

# リント
pnpm lint

# ビルド
pnpm build
```

### Docker開発
```bash
# 開発環境起動
docker compose up

# ログ確認
docker compose logs -f frontend

# コンテナに入る
docker compose exec frontend sh
```

### 🌐 ngrok使用方法

外部からアクセス可能にするためにngrokを使用できます：

```bash
# ngrokでトンネルを作成（Docker Composeも自動起動）
pnpm run ngrok

# 手動でDocker Composeを起動してからngrok
pnpm run docker:up
./scripts/start-ngrok.sh
```

**ngrok設定:**
- **ローカルポート**: 3001
- **固定ドメイン**: linewebapp.ngrok.io
- **Web App URL**: https://linewebapp.ngrok.io

**アクセス可能なページ:**
- 天気ページ: https://linewebapp.ngrok.io/weather
- メニューページ: https://linewebapp.ngrok.io/menu
- 予約ページ: https://linewebapp.ngrok.io/booking

### 🔧 Docker便利コマンド

```bash
# Docker Composeを起動
pnpm run docker:up

# Docker Composeを停止
pnpm run docker:down

# ログをリアルタイム表示
pnpm run docker:logs
```

## 🔧 開発環境のセットアップ

### Linter/IntelliSenseを使用する場合

```bash
# ホスト側でも依存関係をインストール（Linter/IntelliSense用）
pnpm install
```

### VS Code Dev Containersを使用する場合

1. VS Code Dev Containers拡張をインストール
2. `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"
3. コンテナ内で開発環境が自動的にセットアップされます

## 📝 注意事項

- Docker内で開発する場合、ホスト側のnode_modulesは不要ですが、Linter/IntelliSenseを使用するためにインストールしています
- コンテナとホストの両方でnode_modulesを管理するため、依存関係の更新時は両方で更新してください：
  ```bash
  # ホスト側
  pnpm install
  
  # コンテナ側（自動更新）
  docker compose up --build
  ```
