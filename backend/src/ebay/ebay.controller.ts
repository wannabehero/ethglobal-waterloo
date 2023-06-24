import { Controller, Get, Query } from '@nestjs/common';
import { EbayService } from './ebay.service';

@Controller('ebay')
export class EbayController {
  constructor(private readonly svc: EbayService) {}

  @Get('getEbayItem')
  async getEbayItem(@Query('itemUrl') itemUrl: string): Promise<string> {
    console.log(`in get ebay item controller: ${itemUrl}`);
    return this.svc.getEbayItem(itemUrl);
  }

  @Get('getEbayMerchantData')
  async getEbayMerchantData(@Query('merchantUrl') merchantUrl: string): Promise<string> {
    console.log(`in get ebay merchant controller: ${merchantUrl}`);
    return this.svc.getEbayMerchantData(merchantUrl);
  }

}
