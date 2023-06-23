import { Injectable } from '@nestjs/common';

@Injectable()
export class ReputationService {

    async getReputation(walletAddress: string): Promise<string> {
        return '0.5';
    }


}
