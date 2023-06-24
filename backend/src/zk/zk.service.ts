import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import * as snarkjs from 'snarkjs';
import { MIMC } from './consts';
import { EbayService } from 'src/ebay/ebay.service';

@Injectable()
export class ZkService {
  constructor(@Inject(MIMC) private readonly mimc: any, private readonly ebay: EbayService) {}

  private prepareTrackingNumber(value: string): bigint {
    const hashedTrackingNumber = createHash('sha256').update(value).digest('hex');
    return BigInt(`0x${hashedTrackingNumber}`);
  }

  async proveReputation(merchantId: string) {
    const { positiveFeedback, itemsSold } = await this.ebay.getEbayMerchantData(merchantId);

    const payload = {
      feedbackSource: positiveFeedback,
      itemsSource: itemsSold,
      feedbackTarget: 80,
      itemsTarget: 0,
    };

    const { proof, publicSignals } = await snarkjs.plonk.fullProve(
      payload,
      '../circuits/snarks/reputation_js/reputation.wasm',
      '../circuits/snarks/reputation_plonk.zkey',
    );

    const calldata: string = await snarkjs.plonk.exportSolidityCallData(proof, publicSignals);

    const [, ...params] = calldata.match(/^(0x[\w]+),(\[.+\])$/);

    const argv = params[1]
      .replace(/[\"\[\]\s]/g, '')
      .split(',')
      .map((x) => BigInt(x));

    return {
      proof: params[0],
      args: argv.map((arg) => arg.toString()),
    };
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
