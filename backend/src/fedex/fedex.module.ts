import { Module } from '@nestjs/common';
import { FedexService } from './fedex.service';
import { FedexController } from './fedex.controller';

@Module({
  providers: [FedexService],
  controllers: [FedexController],
})

export class FedexModule {}
