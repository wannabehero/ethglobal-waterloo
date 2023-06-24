import { PropsWithChildren, createContext, useEffect, useState } from 'react';
import { Client as XMTPClient } from '@xmtp/xmtp-js';
import { useWalletClient } from 'wagmi';
import { GetWalletClientResult } from 'wagmi/actions';
import { zeroAddress } from 'viem';
// import useViewSigner from '../hooks/useViemSigner';

function walletClientToSigner(walletClient: GetWalletClientResult) {
  const ethersWalletClient = {
    getAddress: async (): Promise<`0x${string}`> => {
      return (await walletClient?.account.address) ?? zeroAddress;
    },
    signMessage: async (message: string): Promise<string> => {
      const signature = await walletClient?.signMessage({ message });
      return signature ?? '';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { signMessage, ...rest } = walletClient ?? {};

  return {
    ...ethersWalletClient,
    ...{ ...rest }
  }
}

export const XMTPContext = createContext<XMTPClient | null>(null);

export const XMTPProvider = ({ children }: PropsWithChildren) => {
  // const { data: signer } = useViewSigner();
  const { data: walletClient } = useWalletClient();
  const [xmtpClient, setXmtpClient] = useState<XMTPClient | null>(null);

  useEffect(() => {
    if (!walletClient) {
      return;
    }

    XMTPClient.create(walletClientToSigner(walletClient), { env: 'production' })
      .then(setXmtpClient);
  }, [walletClient]);

  return (
    <XMTPContext.Provider value={xmtpClient}>
      {children}
    </XMTPContext.Provider>
  );
};

