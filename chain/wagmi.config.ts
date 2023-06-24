import { defineConfig } from '@wagmi/cli'
import { hardhat, react } from '@wagmi/cli/plugins';

export default defineConfig({
  out: '../webapp/src/web3/contracts.ts',
  contracts: [
  ],
  plugins: [
    hardhat({
      project: '.',
      include: ['**/ZBay.sol/**'],
    }),
    react(),
  ],
})
