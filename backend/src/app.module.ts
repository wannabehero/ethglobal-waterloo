import { Module } from '@nestjs/common';
import { ReputationModule } from './reputation/reputation.module';

@Module({
  imports: [ReputationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
