# BOTサーバー実装計画

## 🎯 概要

NestJSベースの統合BOTサーバーを構築し、複数のメッセージングプラットフォーム（LINE, Telegram等）からのWebhookを処理し、動的なWebページURLを返信する。

## 🏗️ アーキテクチャ設計

### ディレクトリ構造
```
bot-server/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/
│   │   ├── config.module.ts
│   │   └── configuration.ts
│   ├── database/
│   │   ├── database.module.ts
│   │   └── migrations/
│   ├── messaging/
│   │   ├── messaging.module.ts
│   │   ├── interfaces/
│   │   │   ├── messaging-provider.interface.ts
│   │   │   └── webhook-event.interface.ts
│   │   ├── services/
│   │   │   ├── message-processor.service.ts
│   │   │   ├── line.service.ts
│   │   │   ├── telegram.service.ts
│   │   │   └── content-generator.service.ts
│   │   ├── controllers/
│   │   │   ├── line-webhook.controller.ts
│   │   │   └── telegram-webhook.controller.ts
│   │   └── dto/
│   │       ├── line-webhook.dto.ts
│   │       └── telegram-webhook.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   └── web-api/
│       ├── web-api.module.ts
│       └── controllers/
│           └── api.controller.ts
├── test/
├── Dockerfile
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .dockerignore
├── package.json
├── nest-cli.json
└── README.md
```

## 🔧 実装詳細

### 1. 基盤モジュール

#### App Module
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MessagingModule } from './messaging/messaging.module';
import { UsersModule } from './users/users.module';
import { WebApiModule } from './web-api/web-api.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    DatabaseModule,
    MessagingModule,
    UsersModule,
    WebApiModule,
  ],
})
export class AppModule {}
```

#### Configuration
```typescript
// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  line: {
    channelSecret: process.env.LINE_CHANNEL_SECRET,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },
  webApp: {
    baseUrl: process.env.WEB_APP_BASE_URL,
  },
});
```

### 2. メッセージング処理

#### プロバイダーインターフェース
```typescript
// src/messaging/interfaces/messaging-provider.interface.ts
export interface MessagingProvider {
  sendTextMessage(userId: string, message: string): Promise<void>;
  sendWebViewMessage(userId: string, url: string, text: string): Promise<void>;
  getPlatformName(): string;
  validateWebhook(signature: string, body: string): boolean;
}

export interface WebhookEvent {
  platform: string;
  userId: string;
  messageType: string;
  content: string;
  timestamp: Date;
}
```

#### メッセージプロセッサー
```typescript
// src/messaging/services/message-processor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentGeneratorService } from './content-generator.service';

@Injectable()
export class MessageProcessorService {
  private readonly logger = new Logger(MessageProcessorService.name);
  
  constructor(
    private configService: ConfigService,
    private contentGenerator: ContentGeneratorService,
  ) {}

  async processMessage(event: WebhookEvent): Promise<any> {
    this.logger.log(`Processing message from ${event.platform}: ${event.content}`);
    
    // メッセージパターン解析
    const response = await this.analyzeMessage(event.content, event.userId);
    
    return response;
  }

  private async analyzeMessage(message: string, userId: string) {
    const baseUrl = this.configService.get<string>('webApp.baseUrl');
    
    // キーワードマッチング
    if (message.includes('天気') || message.includes('weather')) {
      return {
        type: 'webview',
        url: `${baseUrl}/weather?userId=${userId}`,
        text: '天気情報を確認 👆',
      };
    }
    
    if (message.includes('メニュー') || message.includes('menu')) {
      return {
        type: 'webview',
        url: `${baseUrl}/menu?userId=${userId}`,
        text: 'メニューを確認 👆',
      };
    }
    
    if (message.includes('予約') || message.includes('booking')) {
      return {
        type: 'webview',
        url: `${baseUrl}/booking?userId=${userId}`,
        text: '予約フォームを開く 👆',
      };
    }
    
    // 商品検索パターン
    const productMatch = message.match(/商品[:：]\s*(.+)/);
    if (productMatch) {
      const productName = productMatch[1];
      return {
        type: 'webview',
        url: `${baseUrl}/product?name=${encodeURIComponent(productName)}&userId=${userId}`,
        text: `${productName}の詳細を確認 👆`,
      };
    }
    
    // デフォルトレスポンス
    return {
      type: 'text',
      text: 'すみません、理解できませんでした。\n\n利用可能なコマンド:\n・天気\n・メニュー\n・予約\n・商品:商品名',
    };
  }
}
```

#### LINE Service
```typescript
// src/messaging/services/line.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, TextMessage, URIAction } from '@line/bot-sdk';
import { MessagingProvider } from '../interfaces/messaging-provider.interface';
import * as crypto from 'crypto';

@Injectable()
export class LineService implements MessagingProvider {
  private readonly logger = new Logger(LineService.name);
  private readonly client: Client;
  private readonly channelSecret: string;

  constructor(private configService: ConfigService) {
    const channelAccessToken = this.configService.get<string>('line.channelAccessToken');
    this.channelSecret = this.configService.get<string>('line.channelSecret');
    
    this.client = new Client({ channelAccessToken });
  }

  async sendTextMessage(userId: string, message: string): Promise<void> {
    const textMessage: TextMessage = {
      type: 'text',
      text: message,
    };
    
    await this.client.pushMessage(userId, textMessage);
  }

  async sendWebViewMessage(userId: string, url: string, text: string): Promise<void> {
    const message = {
      type: 'template',
      altText: text,
      template: {
        type: 'buttons',
        text: text,
        actions: [
          {
            type: 'webview',
            label: '開く',
            url: url,
            webviewHeightRatio: 'tall',
          } as URIAction,
        ],
      },
    };
    
    await this.client.pushMessage(userId, message);
  }

  getPlatformName(): string {
    return 'LINE';
  }

  validateWebhook(signature: string, body: string): boolean {
    const hash = crypto
      .createHmac('SHA256', this.channelSecret)
      .update(body)
      .digest('base64');
    
    return hash === signature;
  }
}
```

### 3. Webhook コントローラー

#### LINE Webhook Controller
```typescript
// src/messaging/controllers/line-webhook.controller.ts
import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { MessageProcessorService } from '../services/message-processor.service';
import { LineService } from '../services/line.service';
import { LineWebhookDto } from '../dto/line-webhook.dto';

@Controller('webhook/line')
export class LineWebhookController {
  constructor(
    private messageProcessor: MessageProcessorService,
    private lineService: LineService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: LineWebhookDto,
    @Headers('x-line-signature') signature: string,
  ) {
    // Webhook署名検証
    if (!this.lineService.validateWebhook(signature, JSON.stringify(body))) {
      throw new Error('Invalid signature');
    }

    // イベント処理
    for (const event of body.events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const webhookEvent = {
          platform: 'LINE',
          userId: event.source.userId,
          messageType: 'text',
          content: event.message.text,
          timestamp: new Date(),
        };

        const response = await this.messageProcessor.processMessage(webhookEvent);
        
        if (response.type === 'webview') {
          await this.lineService.sendWebViewMessage(
            event.source.userId,
            response.url,
            response.text,
          );
        } else {
          await this.lineService.sendTextMessage(
            event.source.userId,
            response.text,
          );
        }
      }
    }

    return { status: 'ok' };
  }
}
```

### 4. データベース設計

#### User Entity
```typescript
// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  externalId: string; // プラットフォーム固有のユーザーID

  @Column()
  platform: string; // LINE, Telegram等

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  pictureUrl: string;

  @Column({ type: 'json', nullable: true })
  preferences: any; // ユーザー設定

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 🚀 実装手順

### Step 1: 基盤セットアップ
1. NestJS プロジェクト初期化
2. 必要なパッケージインストール
3. 設定ファイル作成
4. データベース接続設定

### Step 2: LINE BOT実装
1. LINE Service 実装
2. Webhook Controller 実装
3. メッセージプロセッサー基盤
4. 基本的なレスポンス機能

### Step 3: 拡張機能
1. ユーザー管理機能
2. メッセージ履歴保存
3. エラーハンドリング
4. ログ機能

### Step 4: Telegram対応
1. Telegram Service 実装
2. Webhook Controller 追加
3. 共通処理の抽象化

## 🧪 テスト戦略

### Unit Tests
- 各Service の単体テスト
- メッセージ解析ロジックのテスト
- バリデーション機能のテスト

### Integration Tests
- Webhook エンドポイントのテスト
- データベース連携のテスト
- 外部API呼び出しのモック

### E2E Tests
- 実際のWebhookフローのテスト
- プラットフォーム別のレスポンステスト

## 🔒 セキュリティ対策

1. **Webhook署名検証**: 各プラットフォームの署名検証実装
2. **レート制限**: リクエスト頻度制限
3. **入力サニタイゼーション**: ユーザー入力の検証・無害化
4. **環境変数管理**: 機密情報の適切な管理
5. **HTTPS強制**: 全通信の暗号化

## 🐳 Cloud Run デプロイ設定

### Dockerfile
```dockerfile
# multi-stage build for Node.js 20
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Expose port for Cloud Run
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["node", "dist/main"]
```

### GitHub Actions設定
```yaml
# .github/workflows/deploy.yml
name: Deploy BOT Server to Cloud Run

on:
  push:
    branches: [ main ]
    paths:
      - 'bot-server/**'
  pull_request:
    branches: [ main ]
    paths:
      - 'bot-server/**'

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GAR_LOCATION: asia-northeast1
  SERVICE: line-bot-server
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
        cache-dependency-path: bot-server/package-lock.json

    - name: Install dependencies
      run: npm ci
      working-directory: ./bot-server

    - name: Run tests
      run: npm run test
      working-directory: ./bot-server

    - name: Run lint
      run: npm run lint
      working-directory: ./bot-server

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
        docker build -t "$GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$SERVICE/$SERVICE:$GITHUB_SHA" ./bot-server
        docker push "$GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$SERVICE/$SERVICE:$GITHUB_SHA"

    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy $SERVICE \
          --image "$GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$SERVICE/$SERVICE:$GITHUB_SHA" \
          --platform managed \
          --region $REGION \
          --allow-unauthenticated \
          --port 8080 \
          --memory 512Mi \
          --cpu 1 \
          --max-instances 10 \
          --set-env-vars NODE_ENV=production \
          --set-secrets="LINE_CHANNEL_SECRET=line-channel-secret:latest,LINE_CHANNEL_ACCESS_TOKEN=line-channel-access-token:latest"
```

### 環境設定
```typescript
// src/main.ts (Cloud Run対応)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Cloud Run環境対応
  const port = process.env.PORT || 8080;
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());
  
  // CORS設定
  app.enableCors({
    origin: process.env.WEB_APP_BASE_URL,
    credentials: true,
  });
  
  // Health check endpoint
  app.use('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  await app.listen(port);
  console.log(`BOT Server running on port ${port}`);
}
bootstrap();
```

## 📊 監視・ログ (Cloud Run)

### Cloud Logging設定
```typescript
// src/common/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CloudLogger implements LoggerService {
  log(message: string, context?: string) {
    console.log(JSON.stringify({
      severity: 'INFO',
      message,
      context,
      timestamp: new Date().toISOString(),
    }));
  }

  error(message: string, trace?: string, context?: string) {
    console.error(JSON.stringify({
      severity: 'ERROR',
      message,
      trace,
      context,
      timestamp: new Date().toISOString(),
    }));
  }

  warn(message: string, context?: string) {
    console.warn(JSON.stringify({
      severity: 'WARNING',
      message,
      context,
      timestamp: new Date().toISOString(),
    }));
  }
}
```

### Cloud Monitoring メトリクス
```typescript
// src/common/metrics.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private metrics = new Map();

  recordRequest(platform: string, endpoint: string, responseTime: number) {
    const key = `${platform}_${endpoint}`;
    console.log(JSON.stringify({
      metric: 'request_duration',
      platform,
      endpoint,
      duration: responseTime,
      timestamp: Date.now(),
    }));
  }

  recordError(platform: string, error: string) {
    console.log(JSON.stringify({
      metric: 'error_count',
      platform,
      error,
      timestamp: Date.now(),
    }));
  }
}
```

## 🔒 Cloud Run セキュリティ設定

### IAM設定
- Cloud Run Invoker権限
- Cloud SQL Client権限  
- Secret Manager Secret Accessor権限

### 環境変数管理 (Secret Manager)
```bash
# Secretの作成
gcloud secrets create line-channel-secret --data-file=-
gcloud secrets create line-channel-access-token --data-file=-

# Cloud Runにマウント
gcloud run deploy line-bot-server \
  --set-secrets="LINE_CHANNEL_SECRET=line-channel-secret:latest,LINE_CHANNEL_ACCESS_TOKEN=line-channel-access-token:latest"
```

### GitHub Secrets設定
```bash
# GitHubリポジトリのSecretsに設定
GCP_PROJECT_ID=your-project-id
GCP_SA_KEY={"type": "service_account", ...} # サービスアカウントキー
```

### 必要なGCP IAM権限
```bash
# サービスアカウントに必要な権限
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"
```

これでGitHub Actions + Cloud Run対応のBOTサーバーが構築できます！Node.js 20対応で高パフォーマンスかつスケーラブルな構成になります。 