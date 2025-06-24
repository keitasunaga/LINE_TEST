import {
  Controller,
  Post,
  Body,
  Headers,
  HttpStatus,
  HttpException,
  Logger,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { LineBotService } from './line-bot.service';
import { LineBotConfig } from './line-bot.config';
import { WebhookEvent } from '@line/bot-sdk';
import * as crypto from 'crypto';

@Controller('webhook')
export class LineBotController {
  private readonly logger = new Logger(LineBotController.name);

  constructor(
    private readonly lineBotService: LineBotService,
    private readonly lineBotConfig: LineBotConfig,
  ) { }

  /**
   * LINE Webhook エンドポイント
   */
  @Post('line')
  async handleWebhook(
    @Body() body: any,
    @Headers('x-line-signature') signature: string,
  ): Promise<{ status: string }> {
    this.logger.log('Received LINE webhook request');

    // 署名検証
    if (!this.verifySignature(JSON.stringify(body), signature)) {
      this.logger.error('Invalid signature');
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    // イベント処理
    const events: WebhookEvent[] = body.events || [];
    await this.lineBotService.handleWebhookEvents(events);

    return { status: 'ok' };
  }

  /**
   * リッチメニューを作成・設定するエンドポイント（開発用）
   */
  @Post('rich-menu/setup/:userId')
  async setupRichMenu(@Param('userId') userId: string): Promise<{ status: string; richMenuId?: string }> {
    try {
      this.logger.log(`Setting up rich menu for user: ${userId}`);
      await this.lineBotService.setupRichMenuForUser(userId);
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Failed to setup rich menu: ${error.message}`, error.stack);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 全てのリッチメニューを削除するエンドポイント（開発用）
   */
  @Delete('rich-menu/all')
  async deleteAllRichMenus(): Promise<{ status: string; message: string }> {
    try {
      this.logger.log('Deleting all rich menus');
      await this.lineBotService.deleteAllRichMenus();
      return {
        status: 'success',
        message: 'All rich menus deleted successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to delete rich menus: ${error.message}`, error.stack);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 現在のリッチメニュー一覧を取得するエンドポイント（開発用）
   */
  @Get('rich-menu/list')
  async getRichMenuList(): Promise<{ status: string; richMenus: any[] }> {
    try {
      // LINE Bot SDKのクライアントを直接使用してリッチメニュー一覧を取得
      const client = new (require('@line/bot-sdk').Client)(this.lineBotConfig.getConfig());
      const richMenus = await client.getRichMenuList();

      return {
        status: 'success',
        richMenus: richMenus
      };
    } catch (error) {
      this.logger.error(`Failed to get rich menu list: ${error.message}`, error.stack);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 署名を検証する
   */
  private verifySignature(body: string, signature: string): boolean {
    if (!signature) {
      return false;
    }

    const channelSecret = this.lineBotConfig.getConfig().channelSecret;
    if (!channelSecret) {
      this.logger.error('Channel secret is not configured');
      return false;
    }

    const hash = crypto
      .createHmac('sha256', channelSecret)
      .update(body)
      .digest('base64');

    return signature === hash;
  }
} 