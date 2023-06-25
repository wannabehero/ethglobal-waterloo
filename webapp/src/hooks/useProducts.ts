import { useCallback, useEffect, useState } from 'react';
import { ZBayProduct, ZBayProductWithMetadata } from '../types/product';
import { Address } from 'viem';
import { zBayABI } from '../web3/contracts';
import { ZBAY_DEPLOMENTS } from '../web3/consts';
import { useChainId, usePublicClient } from 'wagmi';
import { retrieve } from '../web3/storage';
import { fetchProducts } from '../api/client';
import { gnosis } from 'wagmi/chains';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useProducts = (_: { buyer?: Address; seller?: Address } = {}) => {
  const [products, setProducts] = useState<ZBayProductWithMetadata[]>([]);
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const refreshProducts = useCallback(async () => {
    await fetchProducts(chainId)
      .then((products) => {
        let productsPromise: Promise<ZBayProduct[]>;
        if (chainId === gnosis.id) {
          // gnosis doesn't support multicall
          productsPromise = Promise.all(products.map((prd) => publicClient.readContract({
            address: ZBAY_DEPLOMENTS[chainId],
            abi: zBayABI,
            functionName: 'getProduct',
            args: [prd.id],
          })));
        } else {
          productsPromise = publicClient.multicall({
            contracts: products.map((prd) => ({
              address: ZBAY_DEPLOMENTS[chainId],
              abi: zBayABI,
              functionName: 'getProduct',
              args: [prd.id],
            }))
          }).then((res) => res.map((prd) => prd.result as ZBayProduct));
        }

        return Promise.all([
          productsPromise,
          Promise.all(products.map((prd) => retrieve(prd.cid))),
        ]);
      })
      .then(([products, metadatas]) => {
        setProducts(products.map((prd, i) => ({
          ...(prd as ZBayProduct),
          metadata: metadatas[i]
        })));
      });
  }, [chainId, setProducts, publicClient]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  return { products, refreshProducts };
};

export default useProducts;
