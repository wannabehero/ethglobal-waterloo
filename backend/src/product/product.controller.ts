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

  @Get('getProductById')
  async getProductById(@Query('productId') productId: string) {
    console.log(`in get product by id controller: ${productId}`);
    return this.svc.getProductById(productId);
  }

  @Get('getAllProducts')
  async getAllProducts(@Query('chainId') chainId: number) {
    console.log(`in get all products list controller:`);
    return this.svc.getAllProducts(chainId);
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
