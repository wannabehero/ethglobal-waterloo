import { VStack, Text, HStack, Button, Spacer } from '@chakra-ui/react';
import useProducts from '../hooks/useProducts';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import ProductCard from '../components/ProductCard';
import CreateProductModal from '../components/CreateProductModal';
import { useCallback, useState } from 'react';
import { ZBayProduct, ZBayProductMetadata, ZBayProductState } from '../types/product';
import { store } from '../web3/storage';
import { useZBayCreateProduct, useZBayDispatch } from '../web3/contracts';
import { ZBAY_DEPLOMENTS } from '../web3/consts';
import { parseEther } from 'viem';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import DispatchModal, { DispatchData } from '../components/DispatchModal';
import { generateAttestation } from '../api/client';

const Seller = () => {
  const { address } = useAccount();
  const { products } = useProducts({ seller: address });
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
  const [isDispatchModelOpen, setIsDispatchModelOpen] = useState(false);
  const [dispatchingProduct, setDispatchingProduct] = useState<ZBayProduct>();
  const chainId = useChainId();
  const addRecentTransaction = useAddRecentTransaction();
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  const { writeAsync: createProduct } = useZBayCreateProduct({
    address: ZBAY_DEPLOMENTS[chainId],
    gas: 3000000n,
  });

  const { writeAsync: dispatchProduct } = useZBayDispatch({
    address: ZBAY_DEPLOMENTS[chainId],
    gas: 3000000n,
  });

  const onCreate = () => {
    setIsCreateModelOpen(true);
  };

  const onDispatch = (product: ZBayProduct) => {
    setIsDispatchModelOpen(true);
    setDispatchingProduct(product);
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

    setIsCreateModelOpen(false);
    return true;
  }, [createProduct, addRecentTransaction, setIsCreating, setIsCreateModelOpen, publicClient, walletClient]);

  const handleDispatch = useCallback(async (data: DispatchData) => {
    if (!walletClient) {
      return false;
    }

    setIsDispatching(true);

    try {
      const attestation = await generateAttestation(
        `0x${data.secret}`,
        data.product.buyer,
        data.trackingNumber,
      );
      console.log('Attestation: ', attestation);
      const tx = await dispatchProduct({
        args: [data.product.id, attestation],
      });
      addRecentTransaction({
        hash: tx.hash,
        description: 'Dispatching product'
      });
      await publicClient.waitForTransactionReceipt(tx);
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsDispatching(false);
    }

    return true;
  }, [addRecentTransaction, dispatchProduct, publicClient, walletClient]);

  return (
    <VStack spacing="4" align="stretch">
      <HStack>
        <Text as="b" fontSize="xl">
          My Products
        </Text>
        <Spacer />
        <Button rounded="xl" colorScheme="green" onClick={() => onCreate()}>
          Create
        </Button>
      </HStack>
      <VStack spacing="4" align="stretch">
        {products.map((product) => {
          let status: string | undefined = undefined;
          let actionTitle: string | undefined = undefined;
          let onAction: ((product: ZBayProduct) => void) | undefined = undefined;

          if (product.seller === address) {
            switch (product.state) {
              case ZBayProductState.Paid:
                actionTitle = 'Confirm dispatch';
                onAction = onDispatch;
                break;
              case ZBayProductState.Dispatched:
                status = 'Waiting for the buyer to confirm delivery'
                break;
              case ZBayProductState.Delivered:
                status = 'Delivered to the buyer'
                break;
              case ZBayProductState.Cancelled:
                status = 'Cancelled and refunded'
                break;
              case ZBayProductState.Disputed:
                status = 'Waiting for the dispute resolution'
                break;
              case ZBayProductState.Resolved:
                status = 'Disputed and confirmed'
                break;
            }
          }

          return (
            <ProductCard
              key={`product-${address}-${product.id}`}
              product={product}
              actionTitle={actionTitle}
              onAction={onAction}
              status={status}
            />
          );
        })}
      </VStack>
      <CreateProductModal
        isOpen={isCreateModelOpen}
        isLoading={isCreating}
        onCreate={(data) => handleCreate(data)}
        onClose={() => setIsCreateModelOpen(false)}
      />
      {
        dispatchingProduct && (
          <DispatchModal
            isOpen={isDispatchModelOpen}
            onDispatch={(product) => handleDispatch(product)}
            onClose={() => setIsDispatchModelOpen(false)}
            product={dispatchingProduct}
            isLoading={isDispatching}
            actionTitle="Dispatch"
            allowSecretGeneration={true}
            title="Confirm the dispatch"
          />
        )
      }
    </VStack>
  );
};

export default Seller;
