import { useEffect, useState } from 'react';
import { ZBayProductWithMetadata } from '../types/product';
import { Address } from 'viem';
import { useZBayGetProduct } from '../web3/contracts';
import { ZBAY_DEPLOMENTS } from '../web3/consts';
import { useChainId } from 'wagmi';
import { retrieve } from '../web3/storage';

const useProducts = ({ buyer, seller }: { buyer?: Address; seller?: Address } = {}) => {
  const [products, setProducts] = useState<ZBayProductWithMetadata[]>([]);
  const chainId = useChainId();

  const { data: prd0 } = useZBayGetProduct({
    address: ZBAY_DEPLOMENTS[chainId],
    args: [0n],
    enabled: true,
  });

  useEffect(() => {
    if (!prd0) {
      return;
    }

    // TODO: fetch products
    const products = [
      prd0
    ];
    Promise.all(
      products.map((prd) => retrieve(prd.cid))
    ).then((metadatas) => {
      setProducts(products.map((prd, i) => ({
        ...prd,
        metadata: metadatas[i]
      })));
    })
  }, [buyer, seller, setProducts, prd0]);

  return { products };
};

export default useProducts;
