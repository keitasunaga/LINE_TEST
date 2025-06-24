import { Injectable, Logger } from '@nestjs/common';
import { Client, Message, WebhookEvent, TextMessage, RichMenu } from '@line/bot-sdk';
import { LineBotConfig } from './line-bot.config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LineBotService {
  private readonly logger = new Logger(LineBotService.name);
  private client: Client;

  constructor(private lineBotConfig: LineBotConfig) {
    this.client = new Client(this.lineBotConfig.getConfig());
  }

  /**
   * Webhookイベントを処理する
   */
  async handleWebhookEvents(events: WebhookEvent[]): Promise<void> {
    this.logger.log(`Received ${events.length} events`);

    for (const event of events) {
      await this.handleEvent(event);
    }
  }

  /**
   * 個別のイベントを処理する
   */
  private async handleEvent(event: WebhookEvent): Promise<void> {
    this.logger.log(`Processing event: ${event.type}`);

    try {
      switch (event.type) {
        case 'message':
          await this.handleMessageEvent(event);
          break;
        case 'follow':
          await this.handleFollowEvent(event);
          break;
        case 'unfollow':
          await this.handleUnfollowEvent(event);
          break;
        default:
          this.logger.log(`Unknown event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error handling event: ${error.message}`, error.stack);
    }
  }

  /**
   * メッセージイベントを処理する（エコーBot機能）
   */
  private async handleMessageEvent(event: any): Promise<void> {
    if (event.message.type === 'text') {
      // リッチメニューからのメッセージに対する特別な処理
      if (event.message.text === 'デジタルID') {
        const replyMessage: TextMessage = {
          type: 'text',
          text: '🆔 デジタルIDサービスを選択されました。\n\nデジタルIDの発行や管理を行います。\n詳細については、こちらのWebページをご確認ください。',
        };
        await this.replyMessage(event.replyToken, [replyMessage]);
        return;
      }

      if (event.message.text === 'デジタル証明書') {
        const replyMessage: TextMessage = {
          type: 'text',
          text: '📜 デジタル証明書サービスを選択されました。\n\n各種証明書の発行や確認を行います。\n詳細については、こちらのWebページをご確認ください。',
        };
        await this.replyMessage(event.replyToken, [replyMessage]);
        return;
      }

      // 通常のエコーBot機能
      const echoMessage = `あなたは「${event.message.text}」と言いましたね！`;

      const replyMessage: TextMessage = {
        type: 'text',
        text: echoMessage,
      };

      await this.replyMessage(event.replyToken, [replyMessage]);
      this.logger.log(`Replied to user ${event.source.userId}: ${echoMessage}`);
    } else {
      // テキスト以外のメッセージの場合
      const replyMessage: TextMessage = {
        type: 'text',
        text: 'テキストメッセージを送ってくださいね！',
      };

      await this.replyMessage(event.replyToken, [replyMessage]);
    }
  }

  /**
   * フォローイベントを処理する
   */
  private async handleFollowEvent(event: any): Promise<void> {
    const welcomeMessage: TextMessage = {
      type: 'text',
      text: 'フォローありがとうございます！\n\n下のメニューからサービスを選択するか、メッセージを送ってみてください。',
    };

    await this.replyMessage(event.replyToken, [welcomeMessage]);
    this.logger.log(`Welcome message sent to user ${event.source.userId}`);

    // フォロー時にリッチメニューを設定
    try {
      await this.setupRichMenuForUser(event.source.userId);
    } catch (error) {
      this.logger.error(`Failed to setup rich menu for user ${event.source.userId}: ${error.message}`);
    }
  }

  /**
   * アンフォローイベントを処理する
   */
  private async handleUnfollowEvent(event: any): Promise<void> {
    this.logger.log(`User ${event.source.userId} unfollowed the bot`);
    // アンフォローの場合は特に何もしない（ログのみ）
  }

  /**
   * メッセージを返信する
   */
  private async replyMessage(replyToken: string, messages: Message[]): Promise<void> {
    try {
      await this.client.replyMessage(replyToken, messages);
    } catch (error) {
      this.logger.error(`Failed to reply message: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * プッシュメッセージを送信する
   */
  async pushMessage(userId: string, messages: Message[]): Promise<void> {
    try {
      await this.client.pushMessage(userId, messages);
      this.logger.log(`Push message sent to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to push message: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * ユーザーにリッチメニューを設定する
   */
  async setupRichMenuForUser(userId: string): Promise<void> {
    try {
      // デジタルサービス用のリッチメニューを作成
      const richMenuId = await this.createDigitalServicesRichMenu();

      // ユーザーにリッチメニューを適用
      await this.client.linkRichMenuToUser(userId, richMenuId);

      this.logger.log(`Rich menu linked to user ${userId}: ${richMenuId}`);
    } catch (error) {
      this.logger.error(`Failed to setup rich menu for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * デジタルサービス用のリッチメニューを作成する
   */
  private async createDigitalServicesRichMenu(): Promise<string> {
    // リッチメニューの設定
    const richMenu: RichMenu = {
      size: {
        width: 2500,
        height: 1686,
      },
      selected: false,
      name: 'デジタルサービスメニュー',
      chatBarText: 'メニュー',
      areas: [
        {
          bounds: {
            x: 0,
            y: 0,
            width: 1250,
            height: 1686,
          },
          action: {
            type: 'message',
            text: 'デジタルID',
          },
        },
        {
          bounds: {
            x: 1250,
            y: 0,
            width: 1250,
            height: 1686,
          },
          action: {
            type: 'message',
            text: 'デジタル証明書',
          },
        },
      ],
    };

    try {
      // リッチメニューを作成
      const richMenuId = await this.client.createRichMenu(richMenu);
      this.logger.log(`Created rich menu: ${richMenuId}`);

      // リッチメニュー画像をアップロード
      await this.uploadRichMenuImage(richMenuId);

      return richMenuId;
    } catch (error) {
      this.logger.error(`Failed to create rich menu: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * リッチメニュー画像をアップロードする
   */
  private async uploadRichMenuImage(richMenuId: string): Promise<void> {
    try {
      // assetsディレクトリから画像ファイルを読み込み
      // PNGとJPGの両方をチェック
      let imagePath = path.join(__dirname, '../../assets/richmenu-digital-services.png');
      if (!fs.existsSync(imagePath)) {
        imagePath = path.join(__dirname, '../../assets/richmenu-digital-services.jpg');
      }

      // 画像ファイルが存在するかチェック
      if (!fs.existsSync(imagePath)) {
        this.logger.warn(`Rich menu image not found: ${imagePath}`);
        this.logger.warn('Creating a simple placeholder image...');

        // プレースホルダー画像を作成（1x1の透明画像）
        const placeholderBuffer = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
          0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x09, 0xC4, 0x00, 0x00, 0x06, 0x96,
          0x08, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
          0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);

        await this.client.setRichMenuImage(richMenuId, placeholderBuffer, 'image/png');
        this.logger.log('Placeholder rich menu image uploaded');
        return;
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const imageSize = imageBuffer.length;

      // ファイルサイズをチェック（1MB = 1048576 bytes）
      if (imageSize > 1048576) {
        this.logger.warn(`Image size too large: ${imageSize} bytes (max: 1MB)`);
        this.logger.warn('Using placeholder image instead...');

        // プレースホルダー画像を使用
        const placeholderBuffer = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
          0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x09, 0xC4, 0x00, 0x00, 0x06, 0x96,
          0x08, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
          0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);

        await this.client.setRichMenuImage(richMenuId, placeholderBuffer, 'image/png');
        this.logger.log('Placeholder rich menu image uploaded due to size limit');
        return;
      }

      // ファイル拡張子からContent-Typeを判定
      const contentType = imagePath.toLowerCase().endsWith('.jpg') || imagePath.toLowerCase().endsWith('.jpeg')
        ? 'image/jpeg'
        : 'image/png';

      await this.client.setRichMenuImage(richMenuId, imageBuffer, contentType);
      this.logger.log(`Rich menu image uploaded: ${imagePath} (${imageSize} bytes, ${contentType})`);

    } catch (error) {
      this.logger.error(`Failed to upload rich menu image: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 既存のリッチメニューを削除する（開発用）
   */
  async deleteAllRichMenus(): Promise<void> {
    try {
      const richMenuList = await this.client.getRichMenuList();

      for (const richMenu of richMenuList) {
        await this.client.deleteRichMenu(richMenu.richMenuId);
        this.logger.log(`Deleted rich menu: ${richMenu.richMenuId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete rich menus: ${error.message}`, error.stack);
    }
  }
} 