import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientConfig } from '@line/bot-sdk';

@Injectable()
export class LineBotConfig {
  constructor(private configService: ConfigService) { }

  getConfig(): ClientConfig {
    const channelSecret = this.configService.get<string>('LINE_CHANNEL_SECRET');
    const channelAccessToken = this.configService.get<string>('LINE_CHANNEL_ACCESS_TOKEN');

    if (!channelSecret || !channelAccessToken) {
      throw new Error('LINE Bot configuration is missing. Please check your environment variables.');
    }

    return {
      channelSecret,
      channelAccessToken,
    };
  }

  getChannelSecret(): string {
    const secret = this.configService.get<string>('LINE_CHANNEL_SECRET');
    if (!secret) {
      throw new Error('LINE_CHANNEL_SECRET is not configured');
    }
    return secret;
  }

  getChannelAccessToken(): string {
    const token = this.configService.get<string>('LINE_CHANNEL_ACCESS_TOKEN');
    if (!token) {
      throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
    }
    return token;
  }
} 