import { ColorModeScript, Container, theme, useColorMode, VStack } from '@chakra-ui/react';
import { darkTheme, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';

import Footer from './components/Footer';
import Header from './components/Header';
import { chains, wagmiConfig } from './web3/wallet';
import { XMTPProvider } from './contexts/xmtpContext';
import Main from './screens/Main';

function App() {
  const { colorMode } = useColorMode();

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={colorMode === 'light' ? lightTheme() : darkTheme()}
        showRecentTransactions
      >
        <XMTPProvider>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Container py="16px">
            <VStack align="stretch">
              <Header />
              <Main />
              <Footer />
            </VStack>
          </Container>
        </XMTPProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
