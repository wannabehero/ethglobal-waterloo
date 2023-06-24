import { VStack } from '@chakra-ui/react';
import useProducts from '../hooks/useProducts';
import { useAccount } from 'wagmi';
import ProductCard from '../components/ProductCard';
import { ZBayProduct } from '../types/product';
import { useState } from 'react';
import { formatEther } from 'viem';

const Buyer = () => {
  const { address } = useAccount();
  const { products } = useProducts({ buyer: address });
  const [loadingProduct, setLoadingProduct] = useState<ZBayProduct>();

  const handleBuy = (product: ZBayProduct) => {
    console.log('Buying product', product);
    setLoadingProduct(product);
  };

  return (
    <>
      <VStack spacing="4">
        {products.map((product) => (
          <ProductCard
            key={`product-${address}-${product.id}`}
            product={product}
            isLoading={loadingProduct?.id === product.id}
            actionTitle={`Buy for USDC ${formatEther(product.price)}`}
            onAction={handleBuy}
          />
        ))}
      </VStack>
    </>
  );
};

export default Buyer;
