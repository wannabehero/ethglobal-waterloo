import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly svc: ProductService) {}

  @Get('getProductsByMerchant')
  async getProductsList(@Query('merchantId') merchantId: string): Promise<string> {
    console.log(`in get products list controller: ${merchantId}`);
    return this.svc.getProductsByMerchant(merchantId);
  }
}
