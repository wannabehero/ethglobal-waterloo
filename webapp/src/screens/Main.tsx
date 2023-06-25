import { IconButton, Spacer, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import Seller from './Seller';
import Buyer from './Buyer';
import useBalance from '../hooks/useBalance';
import { formatEther } from 'viem';
import { RepeatIcon } from '@chakra-ui/icons';

const Main = () => {
  const { balance, reloadBalance } = useBalance();

  return (
    <Tabs variant="soft-rounded" colorScheme="blue">
      <TabList alignItems="center">
        <Tab>Sell something</Tab>
        <Tab>Buy something</Tab>
        <Spacer />
        {
          balance !== undefined && (
            <Text fontSize="sm" color="gray.500">
              Balance: {formatEther(balance)} USDC
            </Text>
          )
        }
        <IconButton
          ml="1"
          size="xs"
          aria-label="Reload balance"
          icon={<RepeatIcon />}
          variant="ghost"
          rounded="full"
          color="gray.500"
          onClick={() => reloadBalance}
        />
      </TabList>
      <TabPanels>
        <TabPanel>
          <Seller />
        </TabPanel>
        <TabPanel>
          <Buyer onBalanceReload={() => reloadBalance()} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
};

export default Main;
