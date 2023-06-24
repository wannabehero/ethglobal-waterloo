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

export interface ZBayProduct {
  id: bigint;
  cid: string;
  price: bigint;
  seller: Address;
  buyer: Address;
  state: ZBayProductState;
  attestation: bigint;
  assertionId: string;
}

export interface ZBayProductMetadata {
  title: string;
  photoUrl: string;
  location: string;
  brand: string;
  type: string;
  condition: string;
  price?: number;
}

export interface ZBayProductWithMetadata extends ZBayProduct {
  metadata: ZBayProductMetadata;
}

