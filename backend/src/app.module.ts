import { Module } from '@nestjs/common';
import { ReputationModule } from './reputation/reputation.module';
import { EbayModule } from './ebay/ebay.module';
import { ZkModule } from './zk/zk.module';

@Module({
  imports: [ReputationModule, EbayModule, ZkModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
