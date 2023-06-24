import { Module } from '@nestjs/common';
import { ReputationModule } from './reputation/reputation.module';
import { EbayModule } from './ebay/ebay.module';
import { FedexModule} from './fedex/fedex.module';



@Module({
  imports: [ReputationModule, EbayModule, FedexModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
