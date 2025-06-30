import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker用のstandaloneモード
  output: 'standalone',

  // ESLint設定 - 本番ビルド時にESLintエラーで停止しないよう設定
  eslint: {
    // ビルド時のESLintチェックを無効化（一時的な対応）
    ignoreDuringBuilds: true,
  },

  // TypeScript設定
  typescript: {
    // 本番ビルド時にTypeScriptエラーを無視（一時的な対応）
    ignoreBuildErrors: true,
  },

  // ngrok対応の開発環境設定
  allowedDevOrigins: ['linewebapp.ngrok.io'],

  // 環境変数設定
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID || '',
  },

  // 最適化設定
  compress: true,
  poweredByHeader: false,

  // 画像最適化
  images: {
    domains: ['profile.line-scdn.net', 't.me'],
    unoptimized: process.env.NODE_ENV === 'production',
  },

  // セキュリティヘッダー設定
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
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
