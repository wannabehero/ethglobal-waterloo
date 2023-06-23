import { Controller } from '@nestjs/common';
import { ReputationService } from './reputation.service';

@Controller('reputation')
export class ReputationController {
  constructor(private readonly svc: ReputationService) {}
}
