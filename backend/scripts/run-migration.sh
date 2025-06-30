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
JOB_NAME="line-test-migration-job"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  データベースマイグレーション実行${NC}"
echo -e "${BLUE}=========================================${NC}"

# 確認メッセージ
echo -e "${YELLOW}以下の設定でマイグレーションを実行します:${NC}"
echo -e "  プロジェクト: ${PROJECT_ID}"
echo -e "  リージョン: ${REGION}"
echo -e "  イメージ: ${IMAGE_NAME}"
echo -e "  ジョブ名: ${JOB_NAME}"

read -p "マイグレーションを実行しますか？ (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${YELLOW}キャンセルしました${NC}"
    exit 0
fi

# 既存のジョブがあれば削除
echo -e "${YELLOW}既存のマイグレーションジョブをクリーンアップ中...${NC}"
if gcloud run jobs describe ${JOB_NAME} --region=${REGION} --project=${PROJECT_ID} >/dev/null 2>&1; then
    gcloud run jobs delete ${JOB_NAME} --region=${REGION} --project=${PROJECT_ID} --quiet
    echo -e "${GREEN}既存のジョブを削除しました${NC}"
fi

# バックエンドサービスから環境変数を取得
echo -e "${YELLOW}バックエンドサービスから環境変数を取得中...${NC}"
ENV_VARS=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --project=${PROJECT_ID} --format="value(spec.template.spec.template.spec.containers[0].env[].name,spec.template.spec.template.spec.containers[0].env[].value)" | tr '\t' '=' | tr '\n' ',' | sed 's/,$//')

if [ -z "$ENV_VARS" ]; then
    echo -e "${RED}エラー: バックエンドサービスから環境変数を取得できませんでした${NC}"
    exit 1
fi

# Cloud Run Jobでマイグレーション実行
echo -e "${YELLOW}Cloud Run Jobを作成してマイグレーションを実行中...${NC}"
gcloud run jobs create ${JOB_NAME} \
    --image=${IMAGE_NAME} \
    --region=${REGION} \
    --project=${PROJECT_ID} \
    --set-env-vars="${ENV_VARS}" \
    --vpc-connector=vericerts-vpc-connector \
    --add-cloudsql-instances=vericerts:asia-northeast1:vericerts-staging \
    --memory=1Gi \
    --cpu=1 \
    --max-retries=3 \
    --parallelism=1 \
    --command="npx" \
    --args="prisma,migrate,deploy"

# ジョブ実行
echo -e "${YELLOW}マイグレーションジョブを実行中...${NC}"
EXECUTION_NAME=$(gcloud run jobs execute ${JOB_NAME} --region=${REGION} --project=${PROJECT_ID} --format="value(metadata.name)")

# ジョブの完了を待つ
echo -e "${YELLOW}ジョブの完了を待機中... (実行名: ${EXECUTION_NAME})${NC}"
while true; do
    STATUS=$(gcloud run jobs executions describe ${EXECUTION_NAME} --region=${REGION} --project=${PROJECT_ID} --format="value(status.conditions[0].type)")
    if [ "$STATUS" = "Completed" ]; then
        echo -e "${GREEN}✅ マイグレーションが完了しました${NC}"
        break
    elif [ "$STATUS" = "Failed" ]; then
        echo -e "${RED}❌ マイグレーションが失敗しました${NC}"
        gcloud run jobs executions describe ${EXECUTION_NAME} --region=${REGION} --project=${PROJECT_ID}
        exit 1
    else
        echo -e "${BLUE}ステータス: ${STATUS} - 待機中...${NC}"
        sleep 10
    fi
done

# ログの表示
echo -e "${YELLOW}マイグレーションログ:${NC}"
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=${JOB_NAME}" --limit=50 --format="value(textPayload)" --project=${PROJECT_ID}

# ジョブのクリーンアップ
echo -e "${YELLOW}マイグレーションジョブを削除中...${NC}"
gcloud run jobs delete ${JOB_NAME} --region=${REGION} --project=${PROJECT_ID} --quiet

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}  マイグレーションが正常に完了しました！${NC}"
echo -e "${GREEN}===========================================${NC}" 