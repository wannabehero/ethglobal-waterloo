import { OnTransactionHandler } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';
import { get } from 'http';

const abiDecoder = require('abi-decoder');

const abi = [{"inputs":[{"internalType":"address","name":"trustedForwarer_","type":"address"},{"internalType":"contract OptimisticOracleV3Interface","name":"disputeOracle_","type":"address"},{"internalType":"contract IERC20","name":"token_","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"InvalidProof","type":"error"},{"inputs":[],"name":"InvalidState","type":"error"},{"inputs":[],"name":"NotImplemented","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"ProductCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"cid","type":"bytes"}],"name":"ProductCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"ProductDelivered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"ProductDispatched","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"ProductDisputed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"}],"name":"ProductPurchased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":true,"internalType":"bool","name":"successfully","type":"bool"}],"name":"ProductResolved","type":"event"},{"inputs":[{"internalType":"bytes32","name":"assertionId","type":"bytes32"},{"internalType":"bool","name":"assertedTruthfully","type":"bool"}],"name":"assertionResolvedCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"cancel","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"bytes","name":"proof","type":"bytes"}],"name":"confirmDelivery","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"bytes","name":"cid","type":"bytes"}],"name":"createProduct","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"attestation","type":"uint256"}],"name":"dispatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"disputeDelivery","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"getProduct","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"enum ZBayProductState","name":"state","type":"uint8"},{"internalType":"uint256","name":"attestation","type":"uint256"},{"internalType":"bytes32","name":"assertionId","type":"bytes32"},{"internalType":"bytes","name":"cid","type":"bytes"},{"internalType":"uint256","name":"coef","type":"uint256"}],"internalType":"struct ZBayProduct","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getScore","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"forwarder","type":"address"}],"name":"isTrustedForwarder","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"bytes","name":"securityCoefProof","type":"bytes"}],"name":"purchase","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"verifierId","type":"uint256"},{"internalType":"bytes","name":"proof","type":"bytes"},{"internalType":"uint256[]","name":"signals","type":"uint256[]"}],"name":"submitVerification","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"address[]","name":"verifiers","type":"address[]"},{"internalType":"uint32[]","name":"scores","type":"uint32[]"}],"name":"updateVerifiers","outputs":[],"stateMutability":"nonpayable","type":"function"}];
abiDecoder.addABI(abi);


const BASE_URL = 'http://localhost:3000';
//get wallet reputation from reputation server
async function getReputation(merchantId: string) {
  const response = await fetch(`${BASE_URL}/api/ebay/getEbayMerchantData?merchantUrl=${merchantId}`);
  const reputation = await response.json();
  return reputation;
};

async function getSellerId(productId: string){
  const response = await fetch(`${BASE_URL}/api/product/getProductById?productId=${productId}`);
  const product = await response.json();
  return product.seller;
}

function yyyymmdd(dateStr: string): string {
  const date = new Date(dateStr);
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd = date.getDate();

  return [
    date.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd,
  ].join('-');
}

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {

  const decodedData = abiDecoder.decodeMethod(transaction.data);
  const productId = decodedData.params[0].value;
  const sellerId = await getSellerId(productId);

  //TODO: resolve ENS name from sellerId
  //const reputation = await getReputation(sellerId);
  const reputation = await getReputation("perfumepoodle");

  console.log(reputation);


  // Display reputation in the transaction insights UI.
  return {
    content: panel([
      heading('Merchant Reputation'),
      text(
        `items sold: ${reputation.itemsSold}
        positive feedback: ${reputation.positiveFeedback}
        member since: ${yyyymmdd(reputation.memberSinceDate)}`,
      ),
    ]),
  };
};



