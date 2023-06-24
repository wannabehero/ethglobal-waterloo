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
