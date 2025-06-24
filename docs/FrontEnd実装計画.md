# FrontEnd実装計画

## 🎯 概要

Next.jsベースのWebアプリケーションを構築し、複数のメッセージングプラットフォーム（LINE LIFF、Telegram WebApp等）に対応した統合的なWebエクスペリエンスを提供する。

## 🏗️ アーキテクチャ設計

### ディレクトリ構造
```
web-app/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── weather/
│   │   │   └── page.tsx
│   │   ├── menu/
│   │   │   └── page.tsx
│   │   ├── booking/
│   │   │   └── page.tsx
│   │   ├── product/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── user/
│   │       │   └── route.ts
│   │       └── messaging/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layouts/
│   │   │   ├── AppLayout.tsx
│   │   │   └── PageLayout.tsx
│   │   ├── messaging/
│   │   │   ├── MessagingProvider.tsx
│   │   │   └── MessagingButton.tsx
│   │   └── features/
│   │       ├── weather/
│   │       ├── menu/
│   │       ├── booking/
│   │       └── product/
│   ├── lib/
│   │   ├── messaging/
│   │   │   ├── factory.ts
│   │   │   ├── adapters/
│   │   │   │   ├── line-adapter.ts
│   │   │   │   ├── telegram-adapter.ts
│   │   │   │   └── browser-adapter.ts
│   │   │   └── types.ts
│   │   ├── utils.ts
│   │   └── api.ts
│   ├── hooks/
│   │   ├── useMessaging.ts
│   │   ├── useUser.ts
│   │   └── useLocalStorage.ts
│   ├── store/
│   │   ├── messaging-store.ts
│   │   ├── user-store.ts
│   │   └── app-store.ts
│   └── types/
│       ├── messaging.ts
│       ├── user.ts
│       └── api.ts
├── public/
├── Dockerfile
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .dockerignore
├── tailwind.config.ts
├── next.config.js
├── package.json
└── README.md
```

## 🔧 実装詳細

### 1. メッセージング抽象化層

#### 共通インターフェース
```typescript
// src/lib/messaging/types.ts
export interface MessagingProfile {
  id: string;
  displayName: string;
  pictureUrl?: string;
  platform: MessagingPlatform;
}

export interface MessagingAdapter {
  init(): Promise<void>;
  getProfile(): Promise<MessagingProfile | null>;
  sendMessage(message: string): Promise<void>;
  shareContent(content: ShareContent): Promise<void>;
  isInApp(): boolean;
  getPlatform(): MessagingPlatform;
  close(): void;
}

export type MessagingPlatform = 'LINE' | 'Telegram' | 'Browser';

export interface ShareContent {
  title: string;
  text: string;
  url?: string;
}
```

#### LINE LIFF Adapter
```typescript
// src/lib/messaging/adapters/line-adapter.ts
import liff from '@line/liff';
import { MessagingAdapter, MessagingProfile, ShareContent } from '../types';

export class LineAdapter implements MessagingAdapter {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await liff.init({ 
        liffId: process.env.NEXT_PUBLIC_LIFF_ID!,
        withLoginOnExternalBrowser: true 
      });
      this.initialized = true;
    } catch (error) {
      console.error('LINE LIFF initialization failed:', error);
      throw error;
    }
  }

  async getProfile(): Promise<MessagingProfile | null> {
    if (!this.initialized || !liff.isLoggedIn()) {
      return null;
    }

    try {
      const profile = await liff.getProfile();
      return {
        id: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        platform: 'LINE',
      };
    } catch (error) {
      console.error('Failed to get LINE profile:', error);
      return null;
    }
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.initialized || !liff.isInClient()) {
      throw new Error('LINE LIFF not available');
    }

    await liff.sendMessages([
      {
        type: 'text',
        text: message,
      },
    ]);
  }

  async shareContent(content: ShareContent): Promise<void> {
    if (!this.initialized) {
      throw new Error('LINE LIFF not initialized');
    }

    if (liff.isApiAvailable('shareTargetPicker')) {
      await liff.shareTargetPicker([
        {
          type: 'text',
          text: `${content.title}\n${content.text}\n${content.url || ''}`,
        },
      ]);
    } else {
      await this.sendMessage(`${content.title}\n${content.text}\n${content.url || ''}`);
    }
  }

  isInApp(): boolean {
    return this.initialized && liff.isInClient();
  }

  getPlatform(): MessagingPlatform {
    return 'LINE';
  }

  close(): void {
    if (this.initialized && liff.isInClient()) {
      liff.closeWindow();
    }
  }
}
```

#### Telegram WebApp Adapter
```typescript
// src/lib/messaging/adapters/telegram-adapter.ts
import { MessagingAdapter, MessagingProfile, ShareContent } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: any;
        MainButton: any;
        BackButton: any;
        sendData: (data: string) => void;
        close: () => void;
        ready: () => void;
      };
    };
  }
}

export class TelegramAdapter implements MessagingAdapter {
  private webApp: any;

  async init(): Promise<void> {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      throw new Error('Telegram WebApp not available');
    }

    this.webApp = window.Telegram.WebApp;
    this.webApp.ready();
  }

  async getProfile(): Promise<MessagingProfile | null> {
    if (!this.webApp?.initDataUnsafe?.user) {
      return null;
    }

    const user = this.webApp.initDataUnsafe.user;
    return {
      id: user.id.toString(),
      displayName: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
      pictureUrl: user.photo_url,
      platform: 'Telegram',
    };
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.webApp) {
      throw new Error('Telegram WebApp not available');
    }

    this.webApp.sendData(message);
  }

  async shareContent(content: ShareContent): Promise<void> {
    const shareText = `${content.title}\n${content.text}\n${content.url || ''}`;
    await this.sendMessage(shareText);
  }

  isInApp(): boolean {
    return !!this.webApp;
  }

  getPlatform(): MessagingPlatform {
    return 'Telegram';
  }

  close(): void {
    if (this.webApp) {
      this.webApp.close();
    }
  }
}
```

#### Browser Adapter
```typescript
// src/lib/messaging/adapters/browser-adapter.ts
import { MessagingAdapter, MessagingProfile, ShareContent } from '../types';

export class BrowserAdapter implements MessagingAdapter {
  async init(): Promise<void> {
    // ブラウザでは特別な初期化不要
  }

  async getProfile(): Promise<MessagingProfile | null> {
    // ブラウザではプロフィール情報取得不可
    return null;
  }

  async sendMessage(message: string): Promise<void> {
    // ブラウザではネイティブシェア機能を使用
    if (navigator.share) {
      await navigator.share({ text: message });
    } else {
      // Fallback: クリップボードにコピー
      await navigator.clipboard.writeText(message);
      alert('メッセージをクリップボードにコピーしました');
    }
  }

  async shareContent(content: ShareContent): Promise<void> {
    if (navigator.share) {
      await navigator.share({
        title: content.title,
        text: content.text,
        url: content.url,
      });
    } else {
      const shareText = `${content.title}\n${content.text}\n${content.url || ''}`;
      await navigator.clipboard.writeText(shareText);
      alert('共有内容をクリップボードにコピーしました');
    }
  }

  isInApp(): boolean {
    return false;
  }

  getPlatform(): MessagingPlatform {
    return 'Browser';
  }

  close(): void {
    window.close();
  }
}
```

### 2. Factory & Hook

#### Factory
```typescript
// src/lib/messaging/factory.ts
import { MessagingAdapter } from './types';
import { LineAdapter } from './adapters/line-adapter';
import { TelegramAdapter } from './adapters/telegram-adapter';
import { BrowserAdapter } from './adapters/browser-adapter';

export function createMessagingAdapter(): MessagingAdapter {
  if (typeof window === 'undefined') {
    return new BrowserAdapter();
  }

  // Telegram WebApp 判定
  if (window.Telegram?.WebApp) {
    return new TelegramAdapter();
  }

  // LIFF 判定（window.liff が存在するかで判定）
  if (typeof window.liff !== 'undefined') {
    return new LineAdapter();
  }

  // デフォルトはブラウザ
  return new BrowserAdapter();
}
```

#### Custom Hook
```typescript
// src/hooks/useMessaging.ts
import { useState, useEffect, useCallback } from 'react';
import { createMessagingAdapter } from '@/lib/messaging/factory';
import { MessagingAdapter, MessagingProfile, MessagingPlatform } from '@/lib/messaging/types';

export function useMessaging() {
  const [adapter, setAdapter] = useState<MessagingAdapter | null>(null);
  const [profile, setProfile] = useState<MessagingProfile | null>(null);
  const [platform, setPlatform] = useState<MessagingPlatform>('Browser');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeMessaging() {
      try {
        const messagingAdapter = createMessagingAdapter();
        await messagingAdapter.init();

        if (!mounted) return;

        setAdapter(messagingAdapter);
        setPlatform(messagingAdapter.getPlatform());

        const userProfile = await messagingAdapter.getProfile();
        setProfile(userProfile);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeMessaging();

    return () => {
      mounted = false;
    };
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!adapter) throw new Error('Messaging adapter not initialized');
    return adapter.sendMessage(message);
  }, [adapter]);

  const shareContent = useCallback(async (content: any) => {
    if (!adapter) throw new Error('Messaging adapter not initialized');
    return adapter.shareContent(content);
  }, [adapter]);

  const closeApp = useCallback(() => {
    if (adapter) {
      adapter.close();
    }
  }, [adapter]);

  return {
    profile,
    platform,
    isInApp: adapter?.isInApp() || false,
    isLoading,
    error,
    sendMessage,
    shareContent,
    closeApp,
  };
}
```

### 3. 各機能ページの実装

#### 天気ページ
```typescript
// src/app/weather/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useMessaging } from '@/hooks/useMessaging';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  description: string;
}

export default function WeatherPage() {
  const { profile, platform, isInApp, sendMessage } = useMessaging();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 天気データ取得（実際はAPIから）
    const fetchWeather = async () => {
      try {
        // モックデータ
        await new Promise(resolve => setTimeout(resolve, 1000));
        setWeather({
          location: '東京',
          temperature: 22,
          condition: 'sunny',
          description: '晴れ時々曇り',
        });
      } catch (error) {
        console.error('Weather fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const handleShare = async () => {
    if (!weather) return;

    const message = `今日の天気情報\n📍 ${weather.location}\n🌡️ ${weather.temperature}°C\n☀️ ${weather.description}`;
    
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      {profile && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600">
            こんにちは、{profile.displayName}さん！
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌤️ 天気予報
            <span className="text-sm bg-blue-100 px-2 py-1 rounded">
              {platform}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weather ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{weather.temperature}°C</div>
                <div className="text-gray-600">{weather.location}</div>
                <div className="text-lg">{weather.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-semibold">湿度</div>
                  <div>65%</div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-semibold">風速</div>
                  <div>3 m/s</div>
                </div>
              </div>

              {isInApp && (
                <Button onClick={handleShare} className="w-full">
                  {platform}に送信
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              天気データを取得できませんでした
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 予約ページ
```typescript
// src/app/booking/page.tsx
'use client';

import { useState } from 'react';
import { useMessaging } from '@/hooks/useMessaging';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BookingPage() {
  const { profile, platform, isInApp, sendMessage } = useMessaging();
  const [formData, setFormData] = useState({
    name: profile?.displayName || '',
    date: '',
    time: '',
    guests: '2',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bookingMessage = `予約完了！\n📅 ${formData.date} ${formData.time}\n👥 ${formData.guests}名\n📞 ${formData.phone}`;

    try {
      // BOTサーバーに予約データ送信
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: profile?.id,
          platform,
        }),
      });

      if (response.ok) {
        if (isInApp) {
          await sendMessage(bookingMessage);
        }
        alert('予約が完了しました！');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      alert('予約に失敗しました');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>レストラン予約</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">お名前</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="date">日付</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="time">時間</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="guests">人数</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max="10"
                value={formData.guests}
                onChange={(e) => setFormData({...formData, guests: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              予約する
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🚀 実装手順

### Step 1: プロジェクトセットアップ
1. Next.js 15 プロジェクト作成
2. TypeScript, Tailwind CSS 設定
3. 必要なパッケージインストール
4. 基本的なディレクトリ構造作成

### Step 2: メッセージング抽象化層
1. 共通インターフェース定義
2. LINE LIFF Adapter 実装
3. Browser Adapter 実装
4. Factory & Custom Hook 実装

### Step 3: 基本ページ実装
1. Layout コンポーネント
2. 天気ページ
3. メニューページ
4. 予約ページ

### Step 4: 拡張機能
1. Telegram WebApp 対応
2. API Routes 実装
3. エラーハンドリング
4. パフォーマンス最適化

## 🐳 Cloud Run デプロイ設定 (Next.js 15)

### Next.js 設定
```javascript
// next.config.js (Cloud Run対応)
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloud Run用設定
  output: 'standalone',
  
  // 環境変数設定
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
  },
  
  // 最適化設定
  compress: true,
  poweredByHeader: false,
  
  // 画像最適化
  images: {
    domains: ['profile.line-scdn.net', 't.me'],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // ヘッダー設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Dockerfile (Next.js 15対応)
```dockerfile
# Next.js 15 + Node.js 20 Dockerfile
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
RUN npm run build

# Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud Run port
EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### GitHub Actions設定
```yaml
# .github/workflows/deploy.yml
name: Deploy Web App to Cloud Run

on:
  push:
    branches: [ main ]
    paths:
      - 'web-app/**'
  pull_request:
    branches: [ main ]
    paths:
      - 'web-app/**'

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GAR_LOCATION: asia-northeast1
  SERVICE: line-web-app
  REGION: asia-northeast1

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js 20
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: web-app/package-lock.json

    - name: Install dependencies
      run: npm ci
      working-directory: ./web-app

    - name: Run type check
      run: npm run type-check
      working-directory: ./web-app

    - name: Run lint
      run: npm run lint
      working-directory: ./web-app

    - name: Run build test
      run: npm run build
      working-directory: ./web-app
      env:
        NEXT_PUBLIC_API_BASE_URL: https://test-api.example.com
        NEXT_PUBLIC_LIFF_ID: test-liff-id

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      id-token: write

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Google Auth
      id: auth
      uses: google-github-actions/auth@v2
      with:
        credentials_json: '${{ secrets.GCP_SA_KEY }}'

    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v2

    - name: Configure Docker to use gcloud as a credential helper
      run: gcloud auth configure-docker $GAR_LOCATION-docker.pkg.dev

    - name: Build and push container
      run: |
        docker build \
          --build-arg NEXT_PUBLIC_API_BASE_URL=${{ secrets.NEXT_PUBLIC_API_BASE_URL }} \
          --build-arg NEXT_PUBLIC_LIFF_ID=${{ secrets.NEXT_PUBLIC_LIFF_ID }} \
          -t "$GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$SERVICE/$SERVICE:$GITHUB_SHA" \
          ./web-app
        docker push "$GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$SERVICE/$SERVICE:$GITHUB_SHA"

    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy $SERVICE \
          --image "$GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$SERVICE/$SERVICE:$GITHUB_SHA" \
          --platform managed \
          --region $REGION \
          --allow-unauthenticated \
          --port 8080 \
          --memory 1Gi \
          --cpu 1 \
          --max-instances 100 \
          --set-env-vars NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1
```

### パフォーマンス最適化設定
```typescript
// src/app/layout.tsx (Next.js 15対応)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'LINE Web App',
  description: 'Messaging platform integrated web application',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  robots: 'noindex, nofollow', // プライベートアプリのため
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* LIFF SDK */}
        <script 
          src="https://static.line-scdn.net/liff/edge/2/sdk.js"
          defer
        />
        {/* Telegram WebApp SDK */}
        <script 
          src="https://telegram.org/js/telegram-web-app.js"
          defer
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

### Progressive Web App対応
```json
// public/manifest.json
{
  "name": "LINE Web App",
  "short_name": "LINE App",
  "description": "Messaging platform integrated web application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#00B900",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🎨 UI/UX設計 (Cloud Run対応)

### デザインシステム
- **色彩**: メッセージングアプリのブランドカラーに適応
- **タイポグラフィ**: モバイルファースト、読みやすさ重視
- **レスポンシブ**: スマートフォン最適化
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **パフォーマンス**: Cloud Run最適化済み

### コンポーネント設計
- shadcn/ui ベースの統一されたUIコンポーネント
- プラットフォーム固有のスタイリング対応
- ダークモード対応
- Code splitting とLazy loading

### セキュリティ対策
```typescript
// middleware.ts (Next.js 15)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  // CSP for messaging apps
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.line-scdn.net https://telegram.org; connect-src 'self' https://api.line.me;"
  );
  
  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
```

### GitHub Secrets設定
```bash
# GitHubリポジトリのSecretsに設定
GCP_PROJECT_ID=your-project-id
GCP_SA_KEY={"type": "service_account", ...} # サービスアカウントキー
NEXT_PUBLIC_API_BASE_URL=https://your-bot-server.run.app
NEXT_PUBLIC_LIFF_ID=your-liff-id
```

### モノレポ対応
```yaml
# .github/workflows/deploy-monorepo.yml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  check-changes:
    runs-on: ubuntu-latest
    outputs:
      bot-changed: ${{ steps.changes.outputs.bot }}
      web-changed: ${{ steps.changes.outputs.web }}
    steps:
    - uses: actions/checkout@v4
    - uses: dorny/paths-filter@v2
      id: changes
      with:
        filters: |
          bot:
            - 'bot-server/**'
          web:
            - 'web-app/**'

  deploy-bot:
    needs: check-changes
    if: ${{ needs.check-changes.outputs.bot-changed == 'true' }}
    runs-on: ubuntu-latest
    # bot-serverのデプロイ処理

  deploy-web:
    needs: check-changes
    if: ${{ needs.check-changes.outputs.web-changed == 'true' }}
    runs-on: ubuntu-latest
    # web-appのデプロイ処理
```

これでGitHub Actions + Cloud Run + Next.js 15対応の高パフォーマンスなWebアプリが構築できます！ 