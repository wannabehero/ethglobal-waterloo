import { Address } from 'viem';

export type AttestationRequest = {
  secret: string;
  buyer: string;
  trackingNumber: string;
};

export type EbayItemResponse = EbayItemData[];

export interface EbayItemData {
  url: string;
  categories: string[];
  itemNumber: string;
  title: string;
  condition: 'Used' | 'New';
  price: number;
  priceWithCurrency: string;
  image: string;
  images: string[];
  seller: string;
  itemLocation: string;
  ean: string | null;
  mpn: string;
  upc: string;
  brand: string;
  type: string;
}

export type ProductInfoResponse = ProductInfo[];

export interface ProductInfo {
  id: bigint;
  cid: Address;
  price: bigint;
  seller: Address;
  timestamp: number;
}
