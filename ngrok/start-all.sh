#!/bin/bash

# LINE Bot & Web App 統合ngrok起動スクリプト

echo "🚀 Starting integrated ngrok tunnels for LINE Bot & Web App..."
echo ""

# プロジェクトルートに移動
cd "$(dirname "$0")/.."

# Backend Docker Composeが起動しているか確認
echo "🔍 Checking backend services..."
cd backend
if ! docker compose ps | grep -q "Up"; then
    echo "⚠️  Backend Docker Compose services are not running. Starting them..."
    docker compose up -d
    echo "⏳ Waiting for backend services to start..."
    sleep 15
fi

# Frontend Docker Composeが起動しているか確認
echo "🔍 Checking frontend services..."
cd ../frontend
if ! docker compose ps | grep -q "Up"; then
    echo "⚠️  Frontend Docker Compose services are not running. Starting them..."
    docker compose up -d
    echo "⏳ Waiting for frontend services to start..."
    sleep 10
fi

# サービスの起動確認
echo "🔍 Checking service health..."
cd ..

# Backend health check
if ! curl -s http://localhost:3000/api/v1/health > /dev/null; then
    echo "❌ Backend is not responding. Please check logs."
    echo "Run: cd backend && docker compose logs app"
    exit 1
fi

# Frontend health check
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Frontend is not responding. Please check logs."
    echo "Run: cd frontend && docker compose logs frontend"
    exit 1
fi

echo "✅ All services are running!"
echo ""
echo "🌐 Starting ngrok tunnels..."
echo "   Backend: https://linebot-webhook.ngrok.io (port 3000)"
echo "   Frontend: https://linewebapp.ngrok.io (port 3001)"
echo ""
echo "📋 Configuration URLs:"
echo "   LINE Bot Webhook: https://linebot-webhook.ngrok.io/api/v1/webhook/line"
echo "   LINE LIFF App URL: https://linewebapp.ngrok.io"
echo ""
echo "📱 Frontend Pages:"
echo "   - Weather: https://linewebapp.ngrok.io/weather"
echo "   - Menu: https://linewebapp.ngrok.io/menu"
echo "   - Booking: https://linewebapp.ngrok.io/booking"
echo ""
echo "🔧 ngrok Dashboard: http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop all tunnels"
echo "=============================================="

# ngrok v3でエージェントを起動（設定ファイルからすべてのトンネルを起動）
ngrok start --all --config=./ngrok/ngrok.yml 