import { Controller, Get, Query } from '@nestjs/common';
import { EbayService } from './ebay.service';

@Controller('ebay')
export class EbayController {
  constructor(private readonly svc: EbayService) {}

  @Get('getEbayItem')
  async getEbayItem(@Query('itemUrl') itemUrl: string): Promise<any> {
    console.log(`in ebay controller: ${itemUrl}`);
    return this.svc.getEbayItem(itemUrl);
  }

}
