import { Injectable } from '@nestjs/common';

import { fetchQuery } from "@airstack/airstack-react";

@Injectable()
export class ReputationService {

    async getReputation(walletAddress: string): Promise<string> {
        console.log(`in reputation service: ${walletAddress}`);

        const query = `{
            TokenBalances(
              input: {filter: {owner: {_in: ["${walletAddress}"]}, tokenType: {_in: [ERC1155, ERC721]}}, blockchain: ethereum, limit: 10}
            ) {
              TokenBalance {
                tokenAddress
                amount
                formattedAmount
                tokenType
                owner {
                  addresses
                }
                tokenNfts {
                  address
                  tokenId
                  blockchain
                  contentValue {
                    image {
                      original
                    }
                  }
                }
              }
            }
          }`;

        const { data, error } = await fetchQuery(query);

        data.TokenBalances.TokenBalance.forEach((tokenBalance) => {
            console.log(tokenBalance);
        });
        

        return '0.5';
    }


}
