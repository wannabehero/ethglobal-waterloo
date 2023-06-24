import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly svc: ProductService) {}

  @Get('getProductsByMerchant')
  async getProductsByMerchant(@Query('merchantId') merchantId: string) {
    console.log(`in get products list by merchant controller: ${merchantId}`);
    return this.svc.getProductsByMerchant(merchantId);
  }

  @Get('getAllProducts')
  async getAllProducts() {
    console.log(`in get all products list controller:`);
    return this.svc.getAllProducts();
  }

  @Get('getProductsByBuyer')
  async getProductsByBuyer(@Query('buyerId') buyerId: string) {
    console.log(`in get products list by buyerId controller: ${buyerId}`);
    return this.svc.getProductsByBuyer(buyerId);
  }

  @Get('getAllProductsBought')
  async getAllProductsBought() {
    console.log(`in get all products list controller:`);
    return this.svc.getAllProductsBought();
  }
}
