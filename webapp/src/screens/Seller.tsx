import { VStack, Text, HStack, Button, Spacer } from '@chakra-ui/react';
import useProducts from '../hooks/useProducts';
import { useAccount } from 'wagmi';
import ProductCard from '../components/ProductCard';
import { ZBayProduct } from '../types/product';
import { useState } from 'react';

const Seller = () => {
  const { address } = useAccount();
  const { products } = useProducts({ seller: address });
  const [loadingProduct, setLoadingProduct] = useState<ZBayProduct>();

  return (
    <>
      <HStack>
        <Text as="b" fontSize="xl">
          My Products
        </Text>
        <Spacer />
        <Button rounded="xl" colorScheme="green">
          Create
        </Button>
      </HStack>
      <VStack spacing="4">
        {products.map((product) => (
          <ProductCard
            key={`product-${address}-${product.id}`}
            product={product}
            isLoading={loadingProduct?.id === product.id}
          />
        ))}
      </VStack>
    </>
  );
};

export default Seller;
