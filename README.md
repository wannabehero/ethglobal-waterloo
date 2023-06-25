# zBay

The suite is deployed on Polygon Mumbai, Ethereum Goerli, and Gnosis Mainnet.

Main contracts are verified.

[Deployment addresses](./chain/deployments.json)

There are two main flows: Seller and Buyer.

### Seller
- Should first verify their reputation with any of the two methods:
  - By using [Sismo Connect](./webapp/src/screens/Seller.tsx) and submitting a proof of Gitcoin Passport score to be [verified on chain](./chain/contracts/verifiers/ZBaySismoVerifier.sol)
  - By using an [eBay profile importer](./backend/src/ebay/ebay.service.ts) which uses [zk-circuit](./circuits/src/reputation.circom) to validate the reputation and verify [proof on chain](./chain/contracts/verifiers/ZBayReputationVerifier.sol)
- Then sellers can create products manually or via [import from eBay](./backend/src/ebay/ebay.service.ts)
- Product metadata [is stored via web3.storage on ipfs](./webapp/src/web3/storage.ts)
- After buyer purchases the product, seller dispatches the shipment and sends an [attestation](./backend/src/zk/zk.service.ts) `hash(secret + trackingNumber + buyerAddress)` on chain to be verified via a the proof later by the buyer
- Seller can communicate with the buyer about the product and delivery via [XMTP](./webapp/src/components/ChatModal.tsx)

### Buyer
- Buyers browse products using backend endpoint built on [thegraph](./backend/src/product/product.service.ts)
- Buyers can purchase the product they like buy paying its price + insurance deposit based on the reputation calculated [using airstack](./backend/src/reputation/reputation.service.ts)
- Buyers can communicate with the sellers about the product via [XMTP](./webapp/src/components/ChatModal.tsx)
- To prove the receipt of the shipment buyer should [provide a proof](./circuits/src/attestation.circom) of `hash(secret + trackingNumber + account)` to be verified on chain

### Disputes
- Any party can also dispute the transaction via UMA ([example](https://testnet.oracle.umaproject.org/?transactionHash=0x4f7102cb1a0764e2910696d6114ebd5cd1560634bf405d45c625fa23da5e141a&eventIndex=23))

### ZK Technologies
- Sismo for Proof of Gitcoin Passport score: [frontend integration](./webapp/src/screens/Seller.tsx) + [on-chain proof verififcation](./chain/contracts/verifiers/ZBaySismoVerifier.sol)
- zk-snarks for reputation: [circom circuit](./circuits/src/reputation.circom) + [backend proof generation](./backend/src/zk/zk.service.ts) + [on-chain proof verification](./chain/contracts/verifiers/ZBayReputationVerifier.sol)
- zk-snarks for attestation: [circom circuit](./circuits/src/attestation.circom) + [backend proof generation](./backend/src/zk/zk.service.ts) + [on-chain proof verification](./chain/contracts/verifiers/ZBayReputationVerifier.sol)

Frontend:
- vite + react
- rainbowkit + wagmi + viem
- @chakra-ui for layout and UI

Backend:
- nest.js
- Apify to parse ebay product info
- puppetter to parse ebay profile
- thegraph for [smart contract db](./backend/src/product/product.service.ts)
- airstack for [reputation coefficient](./backend/src/reputation/reputation.service.ts)

Snap (not integrated, though implemented):
- [display reputation](./snap/transaction-insights-snap/packages/snap/src/index.ts) of the seller

Smart Contracts:
- hardhat + solidity
- unit-tests to simplify development
- UMA for Optimistic Oracle and dispute resolution
