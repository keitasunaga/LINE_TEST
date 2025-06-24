import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS設定 - LINE WebhookとLIFFアプリからのリクエストを許可
  app.enableCors({
    origin: [
      'https://line.me',
      'https://liff.line.me',
      process.env.FRONTEND_URL || 'http://localhost:3001',
    ],
    credentials: true,
  });

  // グローバルバリデーション設定
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // APIプレフィックス設定
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;

  console.log(`Server is running on port ${port}`);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
