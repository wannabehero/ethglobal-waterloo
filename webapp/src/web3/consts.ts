import deployments from '../../../chain/deployments.json';
import { Address } from 'viem';
import { gnosis, goerli, polygonMumbai } from 'wagmi/chains';

function readDeployments() {
  return [polygonMumbai.id, goerli.id, gnosis.id]
    .map((id) => ({
      chainId: id,
      address: deployments[id].ZBay,
    }))
    .reduce((acc, val) => {
      acc[val.chainId] = val.address as `0x${string}`;
      return acc;
    }, {} as Record<number, Address>);
}

export const ZBAY_DEPLOMENTS: Record<number, Address> = readDeployments();
