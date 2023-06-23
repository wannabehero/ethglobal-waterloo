import { Controller } from '@nestjs/common';
import { EbayService } from './ebay.service';

@Controller('ebay')
export class EbayController {
  constructor(private readonly svc: EbayService) {}
}
