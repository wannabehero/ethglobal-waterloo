import { Module } from '@nestjs/common';
import { ReputationService } from './reputation.service';
import { ReputationController } from './reputation.controller';

@Module({
  providers: [ReputationService],
  controllers: [ReputationController],
})
export class ReputationModule {}
