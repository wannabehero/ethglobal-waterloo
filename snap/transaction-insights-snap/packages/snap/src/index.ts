import { OnTransactionHandler } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';

const BASE_URL = 'https://reputation-server.com';
//get wallet reputation from reputation server
async function getReputation(walletAddress: string): Promise<string> {
  return '0.5';
  const response = await fetch(`/reputation?${walletAddress}`);
  const reputation = await response.text();
  return reputation;
};

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {

  console.log(transaction);
  console.log(transaction.to);

  const reputation = await getReputation("0x123456789");

  // Display reputation in the transaction insights UI.
  return {
    content: panel([
      heading('Wallet Reputation'),
      text(
        `Recipient wallet reputation${reputation}.`,
      ),
    ]),
  };
};



