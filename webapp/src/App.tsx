import { ColorModeScript, Container, Tab, TabList, TabPanel, TabPanels, Tabs, theme, useColorMode, VStack } from '@chakra-ui/react';
import { darkTheme, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';

import Footer from './components/Footer';
import Header from './components/Header';
import { chains, wagmiConfig } from './web3/wallet';
import Seller from './screens/Seller';
import Buyer from './screens/Buyer';
import { XMTPProvider } from './contexts/xmtpContext';

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
              <Tabs variant="soft-rounded" colorScheme="blue">
                <TabList>
                  <Tab>Sell something</Tab>
                  <Tab>Buy something</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Seller />
                  </TabPanel>
                  <TabPanel>
                    <Buyer />
                  </TabPanel>
                </TabPanels>
              </Tabs>
              <Footer />
            </VStack>
          </Container>
        </XMTPProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
