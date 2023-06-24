import '@rainbow-me/rainbowkit/styles.css';

import { connectorsForWallets, getDefaultWallets } from '@rainbow-me/rainbowkit';
import {
  braveWallet,
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig } from 'wagmi';
import { polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const WC_PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID ?? '';

export const { chains, publicClient } = configureChains(
  [polygonMumbai],
  [publicProvider()],
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
