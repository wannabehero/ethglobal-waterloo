import { useAccount, useChainId } from 'wagmi';
import { useIerc20BalanceOf, useZBayToken } from '../web3/contracts';
import { ZBAY_DEPLOMENTS } from '../web3/consts';

const useBalance = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const { data: tokenAddress } = useZBayToken({
    address: ZBAY_DEPLOMENTS[chainId],
  });

  const { data: balance, refetch: reloadBalance } = useIerc20BalanceOf({
    address: tokenAddress,
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  return { balance, reloadBalance };
};

export default useBalance;
