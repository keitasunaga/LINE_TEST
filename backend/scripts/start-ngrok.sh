#!/bin/bash

# LINE Bot開発用 ngrok起動スクリプト（シンプル版）

echo "🚀 Starting ngrok tunnel for LINE Bot development..."

# Docker Composeが起動しているか確認
if ! docker compose ps | grep -q "Up"; then
    echo "⚠️  Docker Compose services are not running. Starting them..."
    docker compose up -d
    echo "⏳ Waiting for services to start..."
    sleep 10
fi

# アプリケーションが起動しているか確認
echo "🔍 Checking if application is running..."
if ! curl -s http://localhost:3000/api/v1/health > /dev/null; then
    echo "❌ Application is not responding. Please check Docker Compose logs."
    echo "Run: docker compose logs app"
    exit 1
fi

echo "✅ Application is running!"
echo ""
echo "🌐 Starting ngrok tunnel..."
echo "   Fixed domain: linebot-webhook.ngrok.io"
echo "   Local port: 3000"
echo ""
echo "📋 Webhook URL for LINE Developers Console:"
echo "   https://linebot-webhook.ngrok.io/api/v1/webhook/line"
echo ""
echo "🔧 ngrok Dashboard: http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo "=============================================="

# ngrok v3でHTTPトンネルを起動
ngrok http 3000 --url=linebot-webhook.ngrok.io 