import { zeroAddress } from 'viem';
import { useWalletClient } from 'wagmi';

// thanks to lenster.xyz for that
const useViewSigner = (): {
  data: {
    getAddress: () => Promise<`0x${string}`>;
    signMessage: (message: string) => Promise<string>;
  };
  isLoading: boolean;
} => {
  const { data, isLoading } = useWalletClient();

  const ethersWalletClient = {
    getAddress: async (): Promise<`0x${string}`> => {
      return (await data?.account.address) ?? zeroAddress;
    },
    signMessage: async (message: string): Promise<string> => {
      const signature = await data?.signMessage({ message });
      return signature ?? '';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { signMessage, ...rest } = data ?? {};

  const mergedWalletClient = {
    data: {
      ...ethersWalletClient,
      ...{ ...rest }
    }
  };

  return { data: mergedWalletClient.data, isLoading };
};

export default useViewSigner;