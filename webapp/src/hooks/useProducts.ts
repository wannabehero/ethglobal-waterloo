import { useCallback, useEffect, useState } from 'react';
import { ZBayProduct, ZBayProductWithMetadata } from '../types/product';
import { Address } from 'viem';
import { zBayABI } from '../web3/contracts';
import { ZBAY_DEPLOMENTS } from '../web3/consts';
import { useChainId, usePublicClient } from 'wagmi';
import { retrieve } from '../web3/storage';
import { fetchProducts } from '../api/client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useProducts = (_: { buyer?: Address; seller?: Address } = {}) => {
  const [products, setProducts] = useState<ZBayProductWithMetadata[]>([]);
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const refreshProducts = useCallback(async () => {
    await fetchProducts(chainId)
      .then((products) => Promise.all([
        publicClient.multicall({
          contracts: products.map((prd) => ({
            address: ZBAY_DEPLOMENTS[chainId],
            abi: zBayABI,
            functionName: 'getProduct',
            args: [prd.id],
          }))
        }),
        Promise.all(products.map((prd) => retrieve(prd.cid))),
      ]))
      .then(([products, metadatas]) => {
        setProducts(products.map((prd, i) => ({
          ...(prd.result as ZBayProduct),
          metadata: metadatas[i]
        })));
      });
  }, [chainId, publicClient, setProducts]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  return { products, refreshProducts };
};

export default useProducts;
