import { Module } from '@nestjs/common';
import { LineBotController } from './line-bot.controller';
import { LineBotService } from './line-bot.service';
import { LineBotConfig } from './line-bot.config';

@Module({
  controllers: [LineBotController],
  providers: [LineBotService, LineBotConfig],
  exports: [LineBotService, LineBotConfig],
})
export class LineBotModule { } 