import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import * as snarkjs from 'snarkjs';
import { MIMC } from './consts';

@Injectable()
export class ZkService {
  constructor(@Inject(MIMC) private readonly mimc: any) {}

  private prepareTrackingNumber(value: string): bigint {
    const hashedTrackingNumber = createHash('sha256').update(value).digest('hex');
    return BigInt(`0x${hashedTrackingNumber}`);
  }

  async proveAttestation(secret: bigint, buyer: bigint, trackingNumber: string) {
    const payload = {
      secret,
      buyer,
      trackingNumber: this.prepareTrackingNumber(trackingNumber),
    };

    const { proof, publicSignals } = await snarkjs.plonk.fullProve(
      payload,
      '../circuits/snarks/attestation_js/attestation.wasm',
      '../circuits/snarks/attestation_plonk.zkey',
    );
    const calldata: string = await snarkjs.plonk.exportSolidityCallData(proof, publicSignals);

    const [, ...params] = calldata.match(/^(0x[\w]+),(\[.+\])$/);

    const argv = params[1]
      .replace(/[\"\[\]\s]/g, '')
      .split(',')
      .map((x) => BigInt(x));

    return {
      proof: params[0],
      attestation: argv[0].toString(),
    };
  }

  async generateAttestation(secret: bigint, buyer: bigint, trackingNumber: string) {
    const attestation = BigInt(
      this.mimc.F.toString(
        this.mimc.multiHash([secret, buyer, this.prepareTrackingNumber(trackingNumber)]),
      ),
    );

    return attestation;
  }
}
