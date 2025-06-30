#!/bin/bash
set -e

# カラーコード設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# プロジェクト設定
PROJECT_ID="vericerts"
REGION="asia-northeast1"
SERVICE_NAME="line-test-backend-staging"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  バックエンド環境変数設定スクリプト${NC}"
echo -e "${BLUE}=========================================${NC}"

# 環境変数の入力を求める
echo -e "${YELLOW}必要な環境変数を入力してください:${NC}"

# DATABASE_URL（CloudSQL用にデフォルト値を設定）
read -p "DATABASE_URL (データベース接続URL) [CloudSQL用デフォルト]: " DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    DATABASE_URL="postgresql://postgres:iJNpe3b3D5da@localhost/line_test?host=/cloudsql/vericerts:asia-northeast1:vericerts-staging"
    echo -e "${GREEN}CloudSQL用のデフォルトDATABASE_URLを使用します${NC}"
fi

# LINE_CHANNEL_ACCESS_TOKEN
read -p "LINE_CHANNEL_ACCESS_TOKEN (LINEチャンネルアクセストークン): " LINE_CHANNEL_ACCESS_TOKEN
if [ -z "$LINE_CHANNEL_ACCESS_TOKEN" ]; then
    echo -e "${RED}エラー: LINE_CHANNEL_ACCESS_TOKENは必須です${NC}"
    exit 1
fi

# LINE_CHANNEL_SECRET
read -p "LINE_CHANNEL_SECRET (LINEチャンネルシークレット): " LINE_CHANNEL_SECRET
if [ -z "$LINE_CHANNEL_SECRET" ]; then
    echo -e "${RED}エラー: LINE_CHANNEL_SECRETは必須です${NC}"
    exit 1
fi

# その他のオプション環境変数
read -p "JWT_SECRET (JWT署名用シークレット) [auto-generated]: " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}JWT_SECRETを自動生成しました${NC}"
fi

read -p "APP_ENV (staging/production) [staging]: " APP_ENV
APP_ENV=${APP_ENV:-staging}

read -p "CORS_ORIGIN (フロントエンドのURL) [https://line-stg.vericerts.io]: " CORS_ORIGIN
CORS_ORIGIN=${CORS_ORIGIN:-https://line-stg.vericerts.io}

# 確認メッセージ
echo -e "${YELLOW}設定する環境変数:${NC}"
echo -e "  NODE_ENV: production"
echo -e "  PORT: 3000"
echo -e "  DATABASE_URL: ${DATABASE_URL:0:30}..."
echo -e "  LINE_CHANNEL_ACCESS_TOKEN: ${LINE_CHANNEL_ACCESS_TOKEN:0:20}..."
echo -e "  LINE_CHANNEL_SECRET: ${LINE_CHANNEL_SECRET:0:10}..."
echo -e "  JWT_SECRET: ${JWT_SECRET:0:10}..."
echo -e "  APP_ENV: ${APP_ENV}"
echo -e "  CORS_ORIGIN: ${CORS_ORIGIN}"

read -p "この設定で環境変数を更新しますか？ (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${YELLOW}キャンセルしました${NC}"
    exit 0
fi

# Cloud Runサービスの環境変数を更新
echo -e "${YELLOW}環境変数を更新中...${NC}"
gcloud run services update ${SERVICE_NAME} \
    --region=${REGION} \
    --project=${PROJECT_ID} \
    --set-env-vars="NODE_ENV=production,PORT=3000,DATABASE_URL=${DATABASE_URL},LINE_CHANNEL_ACCESS_TOKEN=${LINE_CHANNEL_ACCESS_TOKEN},LINE_CHANNEL_SECRET=${LINE_CHANNEL_SECRET},JWT_SECRET=${JWT_SECRET},APP_ENV=${APP_ENV},CORS_ORIGIN=${CORS_ORIGIN}"

echo -e "${GREEN}✅ 環境変数の更新が完了しました${NC}"

# サービスの状態確認
echo -e "${YELLOW}サービスの状態を確認中...${NC}"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")
echo -e "${GREEN}サービスURL: ${SERVICE_URL}${NC}"

# リビジョン情報の表示
LATEST_REVISION=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.latestReadyRevisionName)")
echo -e "${GREEN}最新リビジョン: ${LATEST_REVISION}${NC}"

echo -e "${BLUE}次のステップ:${NC}"
echo -e "1. データベースマイグレーションの実行"
echo -e "2. フロントエンドのNEXT_PUBLIC_API_BASE_URLを ${SERVICE_URL} に更新"
echo -e "3. アプリケーションの動作確認" 