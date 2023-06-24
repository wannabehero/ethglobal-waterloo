import { Controller, Get, Query } from '@nestjs/common';
import { ReputationService } from './reputation.service';

@Controller('reputation')
export class ReputationController {
  constructor(private readonly svc: ReputationService) {}

  @Get('getReputation')
  async getReputation(@Query('walletAddress') walletAddress: string) {
    console.log(`in reputation controller: ${walletAddress}`);
    return this.svc.getReputation(walletAddress);
  }
}
