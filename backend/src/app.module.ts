import { Module } from '@nestjs/common';
import { ReputationModule } from './reputation/reputation.module';
import { EbayModule } from './ebay/ebay.module';
import { ZkModule } from './zk/zk.module';
import { FedexModule } from './fedex/fedex.module';

@Module({
  imports: [ReputationModule, EbayModule, ZkModule, FedexModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
