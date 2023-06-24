import { Body, Controller, Post } from '@nestjs/common';
import { ZkService } from './zk.service';
import { AttestationRequest } from './types';

@Controller('zk')
export class ZkController {
  constructor(private readonly svc: ZkService) {}

  @Post('prove-attestation')
  async proveAttestation(@Body() body: AttestationRequest) {
    return this.svc.proveAttestation(BigInt(body.secret), BigInt(body.buyer), body.trackingNumber);
  }

  @Post('generate-attestation')
  async generateAttestation(@Body() body: AttestationRequest) {
    const attestation = await this.svc.generateAttestation(
      BigInt(body.secret),
      BigInt(body.buyer),
      body.trackingNumber,
    );
    return {
      attestation: attestation.toString(),
    };
  }

  @Post('prove-reputation')
  async proveReputation(@Body() body: { account: string }) {
    return this.svc.proveReputation(body.account);
  }
}
