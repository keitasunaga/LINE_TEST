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
SERVICE_NAME="line-test-frontend-staging"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  フロントエンド環境変数設定スクリプト${NC}"
echo -e "${BLUE}=========================================${NC}"

# 環境変数の入力を求める
echo -e "${YELLOW}必要な環境変数を入力してください:${NC}"

# NEXT_PUBLIC_API_BASE_URL
read -p "NEXT_PUBLIC_API_BASE_URL (バックエンドのURL): " API_BASE_URL
if [ -z "$API_BASE_URL" ]; then
    echo -e "${RED}エラー: NEXT_PUBLIC_API_BASE_URLは必須です${NC}"
    exit 1
fi

# NEXT_PUBLIC_LIFF_ID
read -p "NEXT_PUBLIC_LIFF_ID (LIFFアプリのID): " LIFF_ID
if [ -z "$LIFF_ID" ]; then
    echo -e "${RED}エラー: NEXT_PUBLIC_LIFF_IDは必須です${NC}"
    exit 1
fi

# その他のオプション環境変数
read -p "NEXT_PUBLIC_APP_ENV (staging/production) [staging]: " APP_ENV
APP_ENV=${APP_ENV:-staging}

# 確認メッセージ
echo -e "${YELLOW}設定する環境変数:${NC}"
echo -e "  NEXT_PUBLIC_API_BASE_URL: ${API_BASE_URL}"
echo -e "  NEXT_PUBLIC_LIFF_ID: ${LIFF_ID}"
echo -e "  NEXT_PUBLIC_APP_ENV: ${APP_ENV}"
echo -e "  NODE_ENV: production"
echo -e "  NEXT_TELEMETRY_DISABLED: 1"

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
    --set-env-vars="NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1,NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL},NEXT_PUBLIC_LIFF_ID=${LIFF_ID},NEXT_PUBLIC_APP_ENV=${APP_ENV}"

echo -e "${GREEN}✅ 環境変数の更新が完了しました${NC}"

# サービスの状態確認
echo -e "${YELLOW}サービスの状態を確認中...${NC}"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")
echo -e "${GREEN}サービスURL: ${SERVICE_URL}${NC}"

# リビジョン情報の表示
LATEST_REVISION=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.latestReadyRevisionName)")
echo -e "${GREEN}最新リビジョン: ${LATEST_REVISION}${NC}"

echo -e "${BLUE}次のステップ:${NC}"
echo -e "1. LIFFアプリの設定でエンドポイントURLを ${SERVICE_URL} に更新"
echo -e "2. アプリケーションの動作確認" 