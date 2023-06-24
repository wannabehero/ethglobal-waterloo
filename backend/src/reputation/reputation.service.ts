import { Injectable } from '@nestjs/common';

import { fetchQuery, fetchQueryWithPagination } from "@airstack/airstack-react";

@Injectable()
export class ReputationService {

    async getReputation(walletAddress: string): Promise<string> {
        console.log(`in reputation service: ${walletAddress}`);

        const firstTransactionDate = await this.getDateOfFirstTransaction(walletAddress);
        const accountAge = new Date().getTime() - firstTransactionDate.getTime();
        const accountAgeInDays = Math.round(accountAge / (1000 * 3600 * 24));
        console.log(accountAgeInDays);

        const poapsLength = await this.getPOAPs(walletAddress);
        console.log(poapsLength);

        const numberOfTransactions = await this.getCountOfTransactions(walletAddress);
        console.log(numberOfTransactions);

        const reputationAge = accountAgeInDays * 0.4;
        const reputationPOAPs = poapsLength * 0.1;
        
        const reputationTransactions = numberOfTransactions * 0.5;

        const reputation = reputationAge + reputationPOAPs + reputationTransactions;
        console.log(reputation);

        return String(reputation);
    }

    async getCountOfTransactions(walletAddress: string): Promise<number> {
        const query = `{
            ethereum: TokenTransfers(
              input: {filter: {_or: [{from: {_eq: "${walletAddress}"}}, {to: {_eq: "bayka.eth"}}]}, blockchain: ethereum, limit: 200}
            ) {
              TokenTransfer {
                transactionHash
                blockchain
              }
            },
            polygon: TokenTransfers(
              input: {filter: {_or: [{from: {_eq: "${walletAddress}"}}, {to: {_eq: "bayka.eth"}}]}, blockchain: polygon, limit: 200}
            ) {
              TokenTransfer {
                transactionHash
                blockchain
              }
            }
          }`;

        const { data, error } = await fetchQuery(query);

        return data.ethereum.TokenTransfer.length + data.polygon.TokenTransfer.length;
    }

    async getDateOfFirstTransaction(walletAddress: string): Promise<Date> {
        const query = `{
            ethereum: TokenTransfers(
              input: {
                filter: {
                  _or: [
                    {from: {_eq: "${walletAddress}"}},
                    {to: {_eq: "${walletAddress}"}}
                  ]
                },
                blockchain: ethereum,
                order: {blockTimestamp: ASC},
                limit: 1
              }
            ) {
              TokenTransfer {
                blockTimestamp
                blockchain
              }
            },
            polygon: TokenTransfers(
                input: {
                  filter: {
                    _or: [
                      {from: {_eq: "${walletAddress}"}},
                      {to: {_eq: "${walletAddress}"}}
                    ]
                  },
                  blockchain: polygon,
                  order: {blockTimestamp: ASC},
                  limit: 1
                }
              ) {
                TokenTransfer {
                  blockTimestamp
                  blockchain
                }
              }
          }`;
        
        const { data, error } = await fetchQuery(query);
        const dateEthereum = new Date(data.ethereum.TokenTransfer[0].blockTimestamp);
        const datePolygon = new Date(data.polygon.TokenTransfer[0].blockTimestamp);

        
        return dateEthereum < datePolygon ? dateEthereum : datePolygon;

    
    }

    async getPOAPs(walletAddress: string): Promise<number> {
        const query = `{
            Poaps(
              input: {filter: {owner: {_eq: "${walletAddress}"}}, blockchain: ALL, limit: 200}) 
              {
              Poap {
                id
                eventId
                tokenId
                poapEvent {
                  eventName
                  eventURL
                  startDate
                  endDate
                  country
                  city
                  contentValue {
                    image {
                      extraSmall
                      large
                      medium
                      original
                      small
                    }
                  }
                }
              }
            }
          }`;

        const { data, error } = await fetchQuery(query);

        return data.Poaps?.length ? data.Poaps.length : 0;
    
    }
}
