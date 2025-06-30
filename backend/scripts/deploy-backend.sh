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
IMAGE_NAME="gcr.io/${PROJECT_ID}/line-test-backend:staging"
SERVICE_ACCOUNT="cloud-run-sa@vericerts.iam.gserviceaccount.com"

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}  バックエンドCloudRunデプロイスクリプト${NC}"
echo -e "${BLUE}===========================================${NC}"

# Google Cloud認証とプロジェクト設定
echo -e "${YELLOW}1. Google Cloud設定を確認中...${NC}"
gcloud config set project ${PROJECT_ID}
gcloud auth configure-docker

# Docker イメージのビルドとプッシュ
echo -e "${YELLOW}2. Dockerイメージをビルド中...${NC}"
echo -e "   イメージ名: ${IMAGE_NAME}"

# Dockerビルド（linux/amd64プラットフォーム指定）
docker buildx build --platform linux/amd64 -t ${IMAGE_NAME} -f Dockerfile .

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
  --port=8080 \
  --memory=2Gi \
  --cpu=2 \
  --timeout=300 \
  --cpu-throttling \
  --execution-environment=gen2 \
  --max-instances=20 \
  --concurrency=100 \
  --vpc-connector=vericerts-vpc-connector \
  --add-cloudsql-instances=vericerts:asia-northeast1:vericerts-staging \
  --set-env-vars="NODE_ENV=production,DATABASE_URL=postgresql://postgres:iJNpe3b3D5da@localhost/line_test?host=/cloudsql/vericerts:asia-northeast1:vericerts-staging,LINE_CHANNEL_ACCESS_TOKEN=47TqSH1fu8sflk8ldNVKaY3QGFo3gY4WIdeiGLtrm6BQ+edswtmo4zQSMSKTHsIU4IZD8PU/iYefRB7iDH5qQgY3R8tMrCOvm1fCHzA7OLsPyHD2lhFr2IfyUtg4TIeJUq7kVVA0zZIUEd7/cxHTNAdB04t89/1O/w1cDnyilFU=,LINE_CHANNEL_SECRET=33471a0ebccc6c4a513945af409674ce"

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}  デプロイが完了しました！${NC}"
echo -e "${GREEN}===========================================${NC}"

# デプロイされたサービスのURL取得
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")
echo -e "${GREEN}サービスURL: ${SERVICE_URL}${NC}"

# ヘルスチェック
echo -e "${YELLOW}ヘルスチェックを実行中...${NC}"
if curl -s --connect-timeout 10 ${SERVICE_URL}/health | grep -q "ok\|OK\|healthy" 2>/dev/null; then
    echo -e "${GREEN}✅ サービスは正常に動作しています${NC}"
else
    echo -e "${RED}⚠️  ヘルスチェックに失敗しました（サービスは起動していますが、ヘルスエンドポイントが応答しない可能性があります）${NC}"
fi

echo -e "${BLUE}次のステップ:${NC}"
echo -e "1. CloudSQLで 'line_test' データベースを作成（初回のみ）:"
echo -e "   ${YELLOW}CREATE DATABASE line_test;${NC}"
echo -e "2. 環境変数の設定確認（./scripts/set-env-vars.sh）"
echo -e "3. データベースマイグレーションの実行（./scripts/run-migration.sh）"
echo -e "4. フロントエンドのAPI_BASE_URLを ${SERVICE_URL} に更新"
echo -e "5. カスタムドメインの設定（必要に応じて）" 