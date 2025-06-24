import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { LineBotModule } from './line-bot/line-bot.module';

@Module({
  imports: [
    // 環境変数の設定
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // LINE Bot モジュール
    LineBotModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule { }
