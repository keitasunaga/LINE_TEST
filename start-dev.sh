#!/bin/bash

# ===========================================
# LINE Bot & Web App 統合開発環境起動スクリプト
# Docker Compose + ngrok による軽量な開発環境
# ===========================================

echo "🚀 Starting LINE Bot & Web App development environment..."
echo ""

# スクリプトのディレクトリに移動
cd "$(dirname "$0")"

# Docker Composeを起動
echo "📦 Starting Docker services..."
docker compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Docker services"
    exit 1
fi

# サービスの起動を待つ
echo "⏳ Waiting for services to start..."
timeout=120
counter=0

while [ $counter -lt $timeout ]; do
    # バックエンドの健康状態確認
    backend_healthy=false
    if curl -s http://localhost:3000/api/v1/health > /dev/null 2>&1; then
        backend_healthy=true
    fi
    
    # フロントエンドの確認
    frontend_healthy=false
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        frontend_healthy=true
    fi
    
    if [ "$backend_healthy" = true ] && [ "$frontend_healthy" = true ]; then
        echo "✅ All Docker services are ready!"
        break
    fi
    
    echo "⏳ Waiting for services... ($counter/$timeout seconds)"
    sleep 5
    counter=$((counter + 5))
done

if [ $counter -ge $timeout ]; then
    echo "❌ Services failed to start within timeout"
    echo "📋 Check service status:"
    echo "   docker compose ps"
    echo "   docker compose logs"
    exit 1
fi

echo ""
echo "🌐 Starting ngrok tunnels..."
echo "   Backend: https://linebot-webhook.ngrok.io (port 3000)"
echo "   Frontend: https://linewebapp.ngrok.io (port 3001)"
echo ""

# ngrokの起動チェック
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed or not in PATH"
    echo "📥 Please install ngrok from https://ngrok.com/download"
    exit 1
fi

echo "📋 Service URLs:"
echo "   Local Frontend: http://localhost:3001"
echo "   Local Backend: http://localhost:3000"
echo "   ngrok Dashboard: http://localhost:4040"
echo ""
echo "📱 After ngrok starts, configure LINE Bot Webhook:"
echo "   https://your-ngrok-subdomain.ngrok.io/api/v1/webhook/line"
echo ""
echo "🔧 Useful commands:"
echo "   Stop all: Ctrl+C (this script) + docker compose down"
echo "   Logs: docker compose logs -f"
echo "   Status: docker compose ps"
echo ""
echo "Press Ctrl+C to stop ngrok and Docker services"
echo "=============================================="

# ngrokを起動（既存のスクリプトを活用）
cd ngrok && ./start-all.sh

# ngrok終了時の処理
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    cd ..
    docker compose down
    echo "✅ All services stopped"
    exit 0
}

# シグナルハンドラーを設定
trap cleanup SIGINT SIGTERM 