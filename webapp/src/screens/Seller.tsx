import { VStack, Text, HStack, Button, Spacer } from '@chakra-ui/react';
import useProducts from '../hooks/useProducts';
import { useAccount } from 'wagmi';
import ProductCard from '../components/ProductCard';
import CreateProductModal from '../components/CreateProductModal';
import { useState } from 'react';

const Seller = () => {
  const { address } = useAccount();
  const { products } = useProducts({ seller: address });
  const [isModelOpen, setIsModelOpen] = useState(false);

  const onCreate = () => {
    setIsModelOpen(true);
  };

  return (
    <>
      <HStack>
        <Text as="b" fontSize="xl">
          My Products
        </Text>
        <Spacer />
        <Button rounded="xl" colorScheme="green" onClick={() => onCreate()}>
          Create
        </Button>
      </HStack>
      <VStack spacing="4">
        {products.map((product) => (
          <ProductCard
            key={`product-${address}-${product.id}`}
            product={product}
          />
        ))}
      </VStack>
      <CreateProductModal
        isOpen={isModelOpen}
        onClose={() => setIsModelOpen(false)}
      />
    </>
  );
};

export default Seller;
