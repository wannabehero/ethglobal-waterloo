import { VStack, Text, HStack, Button, Spacer } from '@chakra-ui/react';
import useProducts from '../hooks/useProducts';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import ProductCard from '../components/ProductCard';
import CreateProductModal from '../components/CreateProductModal';
import { useCallback, useState } from 'react';
import { ZBayProductMetadata } from '../types/product';
import { store } from '../web3/storage';
import { useZBayCreateProduct } from '../web3/contracts';
import { ZBAY_DEPLOMENTS } from '../web3/consts';
import { parseEther } from 'viem';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';

const Seller = () => {
  const { address } = useAccount();
  const { products } = useProducts({ seller: address });
  const [isModelOpen, setIsModelOpen] = useState(false);
  const chainId = useChainId();
  const addRecentTransaction = useAddRecentTransaction();
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const [isCreating, setIsCreating] = useState(false);

  const { writeAsync: createProduct } = useZBayCreateProduct({
    address: ZBAY_DEPLOMENTS[chainId],
    gas: 3000000n,
  });

  const onCreate = () => {
    setIsModelOpen(true);
  };

  const handleCreate = useCallback(async (data: ZBayProductMetadata) => {
    if (!walletClient) {
      // TODO: connect
      return false;
    }

    setIsCreating(true);

    try {
      const cid = await store(data);
      console.log('Stored product metadata at', cid);
      const tx = await createProduct({
        args: [parseEther(data.price!.toString()), cid],
      });
      addRecentTransaction({
        hash: tx.hash,
        description: 'Creating product'
      });
      await publicClient.waitForTransactionReceipt(tx);
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsCreating(false);
    }

    setIsModelOpen(false);
    return true;
  }, [createProduct, addRecentTransaction, setIsCreating, setIsModelOpen, publicClient, walletClient]);

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
        isLoading={isCreating}
        onCreate={(data) => handleCreate(data)}
        onClose={() => setIsModelOpen(false)}
      />
    </>
  );
};

export default Seller;
