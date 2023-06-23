import { OnTransactionHandler } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';

const BASE_URL = 'http://localhost:3000';
//get wallet reputation from reputation server
async function getReputation(walletAddress: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/reputation/getReputation?walletAddress=${walletAddress}`);
  const reputation = await response.text();
  return reputation;
};

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {


  const reputation = await getReputation(transaction.to as string);

  // Display reputation in the transaction insights UI.
  return {
    content: panel([
      heading('Wallet Reputation'),
      text(
        `Recipient wallet reputation is ${reputation}.`,
      ),
    ]),
  };
};



