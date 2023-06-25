import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, mainnet } from 'wagmi';
import { gnosis, goerli, polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { createPublicClient, http } from 'viem';

const WC_PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID ?? '';
const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_KEY ?? '';

export const { chains, publicClient } = configureChains(
  [polygonMumbai, goerli, gnosis],
  [alchemyProvider({ apiKey: ALCHEMY_KEY }), publicProvider()],
);

const { connectors } = getDefaultWallets({
  chains,
  appName: 'zBay',
  projectId: WC_PROJECT_ID,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
