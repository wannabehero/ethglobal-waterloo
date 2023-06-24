import { Controller, Get, Query } from '@nestjs/common';
import { FedexService } from './fedex.service';

@Controller('fedex')
export class FedexController {
  constructor(private readonly svc: FedexService) {}

  @Get('getFedexPackageStatus')
  async getFedexPackageStatus(@Query('trackingId') trackingId: string): Promise<string> {
    console.log(`in get fedex package status controller: ${trackingId}`);
    return this.svc.getFedexPackageStatus(trackingId);
  }
}
