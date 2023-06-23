import { Module } from '@nestjs/common';
import { ReputationModule } from './reputation/reputation.module';
import { EbayModule } from './ebay/ebay.module';

@Module({
  imports: [ReputationModule, EbayModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
