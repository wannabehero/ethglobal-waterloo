import { Injectable } from '@nestjs/common';

@Injectable()
export class ReputationService {

    async getReputation(walletAddress: string): Promise<string> {
        console.log(`in reputation service: ${walletAddress}`);
        return '0.5';
    }


}
