import { Address } from 'viem';
import { EbayItemData, EbayItemResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export async function generateAttestation(
  secret: Address,
  buyer: Address,
  trackingNumber: string,
): Promise<bigint> {
  const response = await fetch(`${BASE_URL}/generate-attestation`, {
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
  const response = await fetch(`${BASE_URL}/prove-attestation`, {
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

export async function getEbayItemData(itemUrl: string): Promise<EbayItemData> {
  const query = new URLSearchParams({ itemUrl });
  const response: EbayItemResponse = await fetch(`${BASE_URL}/ebay/getEbayItem?${query.toString()}`)
    .then((res) => res.json());

  return response[0];
}