import { Address } from 'viem';
import { gnosis, goerli, polygonMumbai } from 'wagmi/chains';

export const ZBAY_DEPLOMENTS: Record<number, Address> = {
  [polygonMumbai.id]: '0x93387F4cc9EC76233272D2a38Cc77a0B729925a6',
  [goerli.id]: '0x278e18C83466D44b78b21d5d1EFd8ddb73033563',
  [gnosis.id]: '0x278e18C83466D44b78b21d5d1EFd8ddb73033563',
  // [polygonZkEvmTestnet.id]: '0x93387F4cc9EC76233272D2a38Cc77a0B729925a6',
  // [lineaTestnet.id]: '0x278e18C83466D44b78b21d5d1EFd8ddb73033563',
};
