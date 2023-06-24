import { Module } from '@nestjs/common';
import { ReputationModule } from './reputation/reputation.module';
import { EbayModule } from './ebay/ebay.module';
import { ZkModule } from './zk/zk.module';

import { init} from "@airstack/airstack-react";

const AIRSTACK_API_KEY = "3119c035cfa24462b8cca0ef4a89772f";

init(AIRSTACK_API_KEY);

@Module({
  imports: [ReputationModule, EbayModule, ZkModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
