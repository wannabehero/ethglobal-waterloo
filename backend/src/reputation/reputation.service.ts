import { Injectable } from '@nestjs/common';


import { ApolloClient, InMemoryCache, gql } from "@apollo/client/core"

const AIRSTACK_ENDPOINT = "https://api.airstack.xyz/gql"
const AIRSTACK_API_KEY = "3119c035cfa24462b8cca0ef4a89772f"

const client = new ApolloClient({
    uri: AIRSTACK_ENDPOINT,
    cache: new InMemoryCache(),
    headers: { Authorization: AIRSTACK_API_KEY },
})

@Injectable()
export class ReputationService {

    async getReputation(walletAddress: string): Promise<number> {
        console.log(`in reputation service: ${walletAddress}`);

        const firstTransactionDate = await this.getDateOfFirstTransaction(walletAddress);
        const accountAge = new Date().getTime() - firstTransactionDate.getTime();
        const accountAgeInDays = Math.round(accountAge / (1000 * 3600 * 24));
        console.log(accountAgeInDays);

        const poapsLength = await this.getPOAPs(walletAddress);
        console.log(poapsLength);

        const numberOfTransactions = await this.getCountOfTransactions(walletAddress);
        console.log(numberOfTransactions);

        const numberOfSocialProfiles = await this.getSocialProfiles(walletAddress);
        console.log(numberOfSocialProfiles);

        const reputationAge = accountAgeInDays * 0.1;
        const reputationPOAPs = poapsLength * 10;
        const reputationTransactions = numberOfTransactions * 0.1;
        const reputationSocial = numberOfSocialProfiles * 10;
        console.log(reputationAge + reputationPOAPs + reputationTransactions + reputationSocial);
        const reputation = 1 + (1 - (Math.round(reputationAge + reputationPOAPs + reputationTransactions + reputationSocial))/100)

        console.log(reputation);

        return reputation;
    }

    async getCountOfTransactions(walletAddress: string): Promise<number> {
        const query = gql`{
            ethereum: TokenTransfers(
              input: {filter: {_or: [{from: {_eq: "${walletAddress}"}}, {to: {_eq: "${walletAddress}"}}]}, blockchain: ethereum, limit: 200}
            ) {
              TokenTransfer {
                transactionHash
                blockchain
              }
            },
            polygon: TokenTransfers(
              input: {filter: {_or: [{from: {_eq: "${walletAddress}"}}, {to: {_eq: "${walletAddress}"}}]}, blockchain: polygon, limit: 200}
            ) {
              TokenTransfer {
                transactionHash
                blockchain
              }
            }
          }`;

        const response = await client.query({query});

        return response.data.ethereum.TokenTransfer.length + response.data.polygon.TokenTransfer.length;
    }

    async getDateOfFirstTransaction(walletAddress: string): Promise<Date> {
        const query = gql`{
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
        
        const response = await client.query({query});
        const dateEthereum = new Date(response.data.ethereum.TokenTransfer[0].blockTimestamp);
        const datePolygon = new Date(response.data.polygon.TokenTransfer[0].blockTimestamp);

        
        return dateEthereum < datePolygon ? dateEthereum : datePolygon;

    
    }

    async getPOAPs(walletAddress: string): Promise<number> {
        const query = gql`{
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

        const response = await client.query({query});

        return response.data.Poaps?.length ? response.data.Poaps.length : 0;
    
    }

    async getSocialProfiles(walletAddress: string): Promise<number> {
        const query = gql`{
            Wallet(input: {identity: "${walletAddress}", blockchain: ethereum}) {
              socials {
                dappName
                profileName
              }
            }
          }`;

        const response = await client.query({query});

        return response.data.Wallet.socials.length;
    }
}
