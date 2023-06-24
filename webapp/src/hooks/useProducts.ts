import { useEffect, useState } from 'react';
import { ZBayProductWithMetadata } from '../types/product';
import { Address } from 'viem';

const useProducts = ({ buyer, seller }: { buyer?: Address; seller?: Address } = {}) => {
  const [products, setProducts] = useState<ZBayProductWithMetadata[]>([]);

  useEffect(() => {
    console.log('buyer', buyer);
    console.log('seller', seller);

    // TODO: fetch products
    // TODO: fetch metadata for each product

    setProducts([

    ]);
  }, [buyer, seller, setProducts]);

  return { products };
};

export default useProducts;
