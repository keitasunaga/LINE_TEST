# Next.js UIデザイン移行計画（簡略版）

## 概要
bolt.newで作成されたUIデザイン（`project/`ディレクトリ）を既存の`frontend/`ディレクトリに移行する計画です。
frontendは基本的な雛形のみのため、UIコンポーネントとページのコピーが中心となります。

## 現状分析

### projectディレクトリ（bolt.new）
- **Next.js バージョン**: 13.5.1
- **主要ライブラリ**: shadcn/ui（Radix UI + Tailwind CSS）、React Hook Form + Zod
- **UIコンポーネント**: 完成されたshadcn/uiコンポーネント群
- **ページ数**: 6つのページ（dashboard, did-info, request-vc, credential/[id]など）

### frontendディレクトリ（既存）
- **Next.js バージョン**: 15.3.4（新しいバージョンを維持）
- **現状**: Next.jsのデフォルト雛形のみ
- **既存コンテンツ**: 基本的なpage.tsx、layout.tsx、globals.css

## 簡略化された移行手順

### Phase 1: 依存関係の追加 (30分)
frontendの`package.json`にbolt.newプロジェクトで使用している依存関係を追加

**追加が必要な主要パッケージ:**
```json
{
  "@hookform/resolvers": "^3.9.0",
  "@radix-ui/react-*": "各種UIコンポーネント",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.1",
  "react-hook-form": "^7.53.0",
  "tailwindcss-animate": "^1.0.7",
  "zod": "^3.23.8"
}
```

### Phase 2: 設定ファイルのコピー (15分)
```bash
# shadcn/ui設定
project/components.json → frontend/components.json

# Tailwind設定（v4形式に調整が必要）
project/tailwind.config.ts → frontend/tailwind.config.ts (内容を参考にv4形式で作成)

# ユーティリティ
project/lib/utils.ts → frontend/src/lib/utils.ts
```

### Phase 3: UIコンポーネントのコピー (45分)
```bash
# shadcn/uiコンポーネント群をそのままコピー
project/components/ui/* → frontend/src/components/ui/*
project/hooks/* → frontend/src/hooks/*
```

### Phase 4: アプリケーションコンテンツのコピー (60分)
```bash
# ページファイル（Next.js 15互換性チェック後）
project/app/page.tsx → frontend/src/app/page.tsx
project/app/layout.tsx → frontend/src/app/layout.tsx（一部調整）
project/app/globals.css → frontend/src/app/globals.css（統合）

# 各ページディレクトリ
project/app/dashboard/* → frontend/src/app/dashboard/*
project/app/did-info/* → frontend/src/app/did-info/*
project/app/request-vc/* → frontend/src/app/request-vc/*
project/app/credential/* → frontend/src/app/credential/*

# アプリケーションコンポーネント
project/app/components/* → frontend/src/app/components/*
project/app/contexts/* → frontend/src/app/contexts/*
project/app/types/* → frontend/src/app/types/*
```

### Phase 5: 最小限の調整・テスト (30分)
1. **Next.js 15互換性の調整**
   - 非同期API（`cookies()`, `headers()`など）の調整（使用している場合のみ）
   
2. **Tailwind v4対応**
   - `globals.css`のTailwind v4形式への調整
   
3. **ビルドテスト**
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

## 主要な調整点

### 1. Tailwind CSS v3 → v4
- 設定ファイル形式の変更
- CSS import方式の変更（`@import "tailwindcss"`）

### 2. Next.js互換性
- 大部分は互換性あり
- 非同期APIを使用している箇所のみ調整

## 予想所要時間
- **Phase 1**: 30分（依存関係追加）
- **Phase 2**: 15分（設定ファイル）
- **Phase 3**: 45分（UIコンポーネント）
- **Phase 4**: 60分（ページ・コンテンツ）
- **Phase 5**: 30分（調整・テスト）

**合計**: 約3時間

## 確認項目
- [ ] 依存関係インストール成功
- [ ] 開発サーバー起動
- [ ] 全ページの表示確認
- [ ] UIコンポーネントの動作確認
- [ ] ビルド成功

## 注意事項
- frontendの既存ファイルは基本的に上書き
- LIFFライブラリとの統合は後工程
- Next.js 15の新機能を活用するための最低限の調整のみ実施