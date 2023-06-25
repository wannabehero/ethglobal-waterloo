import { Address } from 'viem';
import { EbayItemData, EbayItemResponse, ProductInfo, ProductInfoResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export async function generateAttestation(
  secret: Address,
  buyer: Address,
  trackingNumber: string,
): Promise<bigint> {
  const response = await fetch(`${BASE_URL}/zk/generate-attestation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret,
      buyer,
      trackingNumber,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate attestation');
  }

  return response.json().then((res) => BigInt(res.attestation));
}

export async function proveAttestation(
  secret: Address,
  buyer: Address,
  trackingNumber: string,
): Promise<{ proof: Address, attestation: bigint }> {
  const response = await fetch(`${BASE_URL}/zk/prove-attestation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret,
      buyer,
      trackingNumber,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate attestation');
  }

  return response.json().then((res) => ({
    proof: res.proof,
    attestation: BigInt(res.attestation),
  }));
}

export async function proveReputation(
  account: string,
): Promise<{ proof: Address, args: bigint[] }> {
  const response = await fetch(`${BASE_URL}/zk/prove-reputation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      account
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate attestation');
  }

  return response.json().then((res) => ({
    proof: res.proof,
    args: res.args.map((arg: string) => BigInt(arg)),
  }));
}

export async function getEbayItemData(itemUrl: string): Promise<EbayItemData> {
  const query = new URLSearchParams({ itemUrl });
  const response: EbayItemResponse = await fetch(`${BASE_URL}/ebay/getEbayItem?${query.toString()}`)
    .then((res) => res.json());

  return response[0];
}

export async function fetchProducts(chainId: number): Promise<ProductInfo[]> {
  const items: ProductInfoResponse = await fetch(`${BASE_URL}/product/getAllProducts?chainId=${chainId}`)
    .then((res) => res.json());
  return items.map((item) => ({
    ...item,
    id: BigInt(item.id),
    price: BigInt(item.price),
    timestamp: Number(item.timestamp),
  }));
}

export async function fetchReputationCoef(walletAddress: Address): Promise<number> {
  const query = new URLSearchParams({
    walletAddress,
  })
  const { coef } = await fetch(`${BASE_URL}/reputation/getReputation?${query.toString()}`)
    .then((res) => res.json());
  return coef ?? 1.5;
}
