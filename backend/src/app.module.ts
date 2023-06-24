import { Module } from '@nestjs/common';
import { ReputationModule } from './reputation/reputation.module';
import { EbayModule } from './ebay/ebay.module';
import { ZkModule } from './zk/zk.module';
import { FedexModule } from './fedex/fedex.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [ReputationModule, EbayModule, ZkModule, FedexModule, ProductModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
