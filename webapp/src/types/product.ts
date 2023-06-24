import { Address } from 'viem';

export enum ZBayProductState {
  Created,
  Paid,
  Dispatched,
  Delivered,
  Disputed,
  Resolved,
  Cancelled
}

export type ZBayProduct = {
  id: bigint;
  cid: string;
  price: bigint;
  seller: Address;
  buyer: Address;
  state: ZBayProductState;
  attestation: bigint;
  assertionId: string;
};

export type ZBayProductWithMetadata = ZBayProduct & {
  metadata: {
    title: string;
    image: string;
    location: string;
    brand: string;
    type: string;
    condition: string;
  }
};

