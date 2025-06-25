#!/bin/bash

# LINE Web App開発用 ngrok起動スクリプト

echo "🚀 Starting ngrok tunnel for LINE Web App development..."

# Docker Composeが起動しているか確認
if ! docker compose ps | grep -q "Up"; then
    echo "⚠️  Docker Compose services are not running. Starting them..."
    docker compose up -d
    echo "⏳ Waiting for services to start..."
    sleep 10
fi

# アプリケーションが起動しているか確認
echo "🔍 Checking if application is running..."
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Application is not responding. Please check Docker Compose logs."
    echo "Run: docker compose logs frontend"
    exit 1
fi

echo "✅ Application is running!"
echo ""
echo "🌐 Starting ngrok tunnel..."
echo "   Fixed domain: linewebapp.ngrok.io"
echo "   Local port: 3001"
echo ""
echo "📋 Web App URL for LINE LIFF Console:"
echo "   https://linewebapp.ngrok.io"
echo ""
echo "📱 Access URLs:"
echo "   - Weather Page: https://linewebapp.ngrok.io/weather"
echo "   - Menu Page: https://linewebapp.ngrok.io/menu"
echo "   - Booking Page: https://linewebapp.ngrok.io/booking"
echo ""
echo "🔧 ngrok Dashboard: http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo "=============================================="

# ngrok v3でHTTPトンネルを起動
ngrok http 3001 --url=linewebapp.ngrok.io 