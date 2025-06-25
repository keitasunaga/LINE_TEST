# LINE Bot & Web App 開発環境

Docker Compose + ローカルngrok による軽量統合開発環境

## 🚀 クイックスタート

### 1. 事前準備

#### ngrokのインストール
```bash
# macOS (Homebrew)
brew install ngrok/ngrok/ngrok

# Linux/Windows
# https://ngrok.com/download からダウンロード
```

#### 環境変数の設定
ルートディレクトリに `.env` ファイルを作成して必要な環境変数を設定してください：

```bash
# LINE Bot 設定（LINE Developers Console から取得）
LINE_CHANNEL_SECRET=your_line_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token_here

# LINE LIFF 設定
NEXT_PUBLIC_LIFF_ID=your_liff_id_here

# ngrok 設定（ngrok.com でアカウント作成後取得）
NGROK_AUTHTOKEN=your_ngrok_authtoken_here
```

### 2. 開発環境の起動

```bash
# 統合起動スクリプト実行（推奨）
./start-dev.sh

# または手動起動
docker compose up -d
cd ngrok && ./start-all.sh
```

### 3. ログ確認

```bash
# Docker サービスのログ確認
docker compose logs -f

# 特定のサービスのログのみ確認
docker compose logs -f backend
docker compose logs -f frontend
```

### 4. アクセスURL

起動後、以下のURLでアクセスできます：

- **フロントエンド（ローカル）**: http://localhost:3001
- **バックエンド（ローカル）**: http://localhost:3000
- **ngrok Dashboard**: http://localhost:4040
- **インターネット公開URL**: ngrok Dashboardで確認

### 5. LINE Bot Webhook設定

1. ngrok Dashboard (http://localhost:4040) でWebhook URLを確認
2. LINE Developers Console でWebhook URLを設定：
   ```
   https://your-ngrok-subdomain.ngrok.io/api/v1/webhook/line
   ```

### 6. 停止

```bash
# 統合スクリプト使用時
# Ctrl+C で ngrok と Docker サービスを同時停止

# 手動停止
docker compose down

# ボリュームも削除
docker compose down -v
```

## 📁 プロジェクト構成

```
LINE_TEST/
├── docker-compose.yml     # Docker開発環境設定
├── start-dev.sh           # 統合起動スクリプト
├── .env                   # 環境変数（要作成）
├── backend/               # NestJS バックエンド
├── frontend/              # Next.js フロントエンド
├── ngrok/                 # ngrok設定とスクリプト
└── docs/                  # ドキュメント
```

## ✨ 特徴

- 🚀 **ワンコマンド起動**: `./start-dev.sh` で全環境が立ち上がる
- 🌐 **自動インターネット公開**: ngrokでWebhookテストが即座に可能
- 📦 **軽量**: ngrokはローカルバイナリを使用してリソース効率化
- 🔄 **統合管理**: Docker サービスとngrokを一括管理
- 📊 **リアルタイム監視**: ngrok Dashboardでトラフィック確認
- 🛡️ **安全停止**: Ctrl+Cで全サービスを適切に終了

## 🔧 トラブルシューティング

### サービスが起動しない場合

```bash
# サービスの状態確認
docker compose ps

# ログ確認
docker compose logs [service_name]

# 再起動
docker compose restart [service_name]
```

### ngrokが起動しない場合

1. ngrokがインストールされているか確認: `ngrok version`
2. 環境変数 `NGROK_AUTHTOKEN` が正しく設定されているか確認
3. ngrok/ngrok.yml の設定を確認
4. バックエンドとフロントエンドが正常に起動しているか確認

```bash
# サービスの健康状態確認
curl http://localhost:3000/api/v1/health
curl http://localhost:3001

# ngrokの手動起動テスト
cd ngrok && ./start-all.sh
```

### 統合スクリプトでエラーが発生する場合

```bash
# 実行権限を確認
ls -la start-dev.sh

# 実行権限を付与
chmod +x start-dev.sh

# 個別に実行してエラーを特定
docker compose up -d
cd ngrok && ./start-all.sh
``` 