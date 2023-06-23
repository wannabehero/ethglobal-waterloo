import { Module } from '@nestjs/common';
import { EbayService } from './ebay.service';
import { EbayController } from './ebay.controller';

@Module({
  providers: [EbayService],
  controllers: [EbayController],
})
export class EbayModule {}
