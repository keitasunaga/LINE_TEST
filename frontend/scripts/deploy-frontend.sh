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
IMAGE_NAME="gcr.io/${PROJECT_ID}/line-test-frontend:staging"
SERVICE_ACCOUNT="cloud-run-sa@vericerts.iam.gserviceaccount.com"

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}  フロントエンドCloudRunデプロイスクリプト${NC}"
echo -e "${BLUE}===========================================${NC}"

# Google Cloud認証とプロジェクト設定
echo -e "${YELLOW}1. Google Cloud設定を確認中...${NC}"
gcloud config set project ${PROJECT_ID}
gcloud auth configure-docker

# Docker イメージのビルドとプッシュ
echo -e "${YELLOW}2. Dockerイメージをビルド中...${NC}"
echo -e "   イメージ名: ${IMAGE_NAME}"

# Dockerビルド（linux/amd64プラットフォーム指定）
# 環境変数をビルド引数として渡す
docker buildx build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://line-test-backend-staging-rzjdhssvaa-an.a.run.app \
  --build-arg NEXT_PUBLIC_LIFF_ID=2007636688-35wNXQZa \
  --build-arg NEXT_PUBLIC_APP_ENV=staging \
  -t ${IMAGE_NAME} -f Dockerfile .

echo -e "${YELLOW}3. Dockerイメージをプッシュ中...${NC}"
docker push ${IMAGE_NAME}

# Cloud Runへデプロイ
echo -e "${YELLOW}4. Cloud Runへデプロイ中...${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --image=${IMAGE_NAME} \
  --platform=managed \
  --region=${REGION} \
  --allow-unauthenticated \
  --service-account=${SERVICE_ACCOUNT} \
  --project=${PROJECT_ID} \
  --port=3001 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1"

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}  デプロイが完了しました！${NC}"
echo -e "${GREEN}===========================================${NC}"

# デプロイされたサービスのURL取得
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")
echo -e "${GREEN}サービスURL: ${SERVICE_URL}${NC}"

# 動作確認
echo -e "${YELLOW}動作確認を実行中...${NC}"
if curl -s --head ${SERVICE_URL} | head -n 1 | grep -q "200 OK"; then
    echo -e "${GREEN}✅ サービスは正常に動作しています${NC}"
else
    echo -e "${RED}⚠️  サービスの動作確認に失敗しました${NC}"
fi

echo -e "${BLUE}次のステップ:${NC}"
echo -e "1. LIFFアプリの設定でエンドポイントURLを更新"
echo -e "2. 環境変数の設定確認"
echo -e "3. ドメイン設定（必要に応じて）" 