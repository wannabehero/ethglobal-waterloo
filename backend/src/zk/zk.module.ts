import { Module } from '@nestjs/common';
import { buildMimcSponge } from 'circomlibjs';
import { ZkService } from './zk.service';
import { ZkController } from './zk.controller';
import { MIMC } from './consts';
import { EbayModule } from '../ebay/ebay.module';

@Module({
  imports: [EbayModule],
  providers: [
    {
      provide: MIMC,
      useFactory: async () => buildMimcSponge(),
    },
    ZkService,
  ],
  controllers: [ZkController],
})
export class ZkModule {}
