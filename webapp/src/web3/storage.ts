// @ts-expect-error - no types
import { Web3Storage } from 'web3.storage';

const WEB3_STORAGE_TOKEN = import.meta.env.VITE_WEB3_STORAGE_TOKEN as string;

const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });

function makeFile(contents: string, filename: string) {
  const blob = new Blob([JSON.stringify(contents)], { type: 'application/json' });
  return new File([blob], filename);
}

export async function store(object: Record<string, unknown>) {
  const cid = await client.put([makeFile(JSON.stringify(object), 'metadata.json')]);
  return cid;
}

export async function retrieve(cid: string) {
  const res = await client.get(cid);
  const [file] = await res.files();
  return JSON.parse(Buffer.from(file).toString('utf-8'));
}
