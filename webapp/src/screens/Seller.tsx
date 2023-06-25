import { VStack, Text, HStack, Button, Spacer, IconButton, useToast } from '@chakra-ui/react';
import useProducts from '../hooks/useProducts';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import ProductCard from '../components/ProductCard';
import CreateProductModal from '../components/CreateProductModal';
import { useCallback, useEffect, useState } from 'react';
import { ZBayProduct, ZBayProductMetadata, ZBayProductState, ZBayProductWithMetadata } from '../types/product';
import { store } from '../web3/storage';
import { useZBayCreateProduct, useZBayDispatch, useZBayGetScore, useZBaySubmitVerification } from '../web3/contracts';
import { ZBAY_DEPLOMENTS } from '../web3/consts';
import { Address, encodeAbiParameters, parseEther } from 'viem';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import DispatchModal, { DispatchData } from '../components/DispatchModal';
import { generateAttestation, proveReputation } from '../api/client';
import { AuthType, ClaimType, useSismoConnect } from '@sismo-core/sismo-connect-react';
import ChatModal from '../components/ChatModal';
import { RepeatIcon } from '@chakra-ui/icons';
// import { ensClient } from '../web3/wallet';

const SISMO_CONFIG = {
  config: {
    appId: '0x10f9c1b389261a5bbc0ccd0c094d1e78',
  },
};

const Seller = () => {
  const toast = useToast();
  const { address } = useAccount();
  const { products, refreshProducts } = useProducts({ seller: address });
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchingProduct, setDispatchingProduct] = useState<ZBayProduct>();
  const chainId = useChainId();
  const addRecentTransaction = useAddRecentTransaction();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isLoadingEbayVerification, setIsLoadingEbayVerification] = useState(false);
  const [isLoadingSismoVerification, setIsLoadingSismoVerification] = useState(false);
  const [messagingWith, setMessagingWith] = useState<{ companion: Address, product: ZBayProductWithMetadata }>();
  const { sismoConnect, responseBytes: sismoProof } = useSismoConnect(SISMO_CONFIG);

  const { writeAsync: createProduct } = useZBayCreateProduct({
    address: ZBAY_DEPLOMENTS[chainId],
    gas: 3000000n,
  });

  const { writeAsync: dispatchProduct } = useZBayDispatch({
    address: ZBAY_DEPLOMENTS[chainId],
    gas: 3000000n,
  });

  const { writeAsync: submitVerification } = useZBaySubmitVerification({
    address: ZBAY_DEPLOMENTS[chainId],
    gas: 3000000n,
  });

  const { data: score, refetch: reloadScore } = useZBayGetScore({
    address: ZBAY_DEPLOMENTS[chainId],
    args: address ? [address] : undefined,
    enabled: !!address
  });

  const onCreate = () => {
    setIsCreateModelOpen(true);
  };

  const onDispatch = (product: ZBayProduct) => {
    setIsDispatchModalOpen(true);
    setDispatchingProduct(product);
  };

  const onMessage = (product: ZBayProductWithMetadata) => {
    setMessagingWith({ companion: product.buyer, product });
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
      await refreshProducts();
      toast({
        title: 'Created!',
        description: "You've successfully created the product",
        status: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Create error',
        description: err.message,
        status: 'error',
      });
      console.error(err);
      return false;
    } finally {
      setIsCreating(false);
    }

    setIsCreateModelOpen(false);
    return true;
  }, [walletClient, createProduct, addRecentTransaction, toast, publicClient, refreshProducts]);

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
      await refreshProducts();
      toast({
        title: 'Dispathed!',
        description: "You've successfully dispatched the product",
        status: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Dispatch error',
        description: err.message,
        status: 'error',
      });
      console.error(err);
      return false;
    } finally {
      setIsDispatching(false);
    }

    setIsDispatchModalOpen(false);
    return true;
  }, [walletClient, dispatchProduct, addRecentTransaction, publicClient, refreshProducts, toast]);

  const handleEbayReputation = useCallback(async () => {
    if (!address) {
      return;
    }

    setIsLoadingEbayVerification(true);
    try {
      // console.log(await ensClient.getEnsName({ address }));
      // FIXME: get ens name, but using this for demo purposes
      const account = 'perfumepoodle';

      const { proof, args } = await proveReputation(account);
      const tx = await submitVerification({
        args: [1n, proof, args],
      });
      addRecentTransaction({
        hash: tx.hash,
        description: 'Submitting verification'
      });
      await publicClient.waitForTransactionReceipt(tx);
      reloadScore();
      toast({
        title: 'Verified!',
        description: "You've successfully verified you eBay profile",
        status: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Verification error',
        description: err.message,
        status: 'error',
      });
      console.error(err);
    } finally {
      setIsLoadingEbayVerification(false);
    }

  }, [address, submitVerification, addRecentTransaction, publicClient, reloadScore, toast]);

  const onSismoConnect = () => {
    if (!address) {
      return;
    }

    setIsLoadingSismoVerification(true);

    sismoConnect.request({
      auth: {authType: AuthType.VAULT},
      claim: {groupId: '0x1cde61966decb8600dfd0749bd371f12', value: 15, claimType: ClaimType.GTE},
      signature: { message: encodeAbiParameters([{ type: 'address' }], [address]) },
    });
  };

  useEffect(() => {
    if (!sismoProof || !walletClient) {
      return;
    }

    const handleSismoReputation = async (proof: Address) => {
      setIsLoadingSismoVerification(true);
      try {
        const tx = await submitVerification({
          args: [2n, proof, [BigInt(walletClient.account.address)]],
        });
        addRecentTransaction({
          hash: tx.hash,
          description: 'Submitting verification'
        });
        await publicClient.waitForTransactionReceipt(tx);
        reloadScore();
        toast({
          title: 'Verified!',
          description: "You've successfully verified your Gitcoin Passport",
          status: 'success',
        });
      } catch (err: any) {
        toast({
          title: 'Verification error',
          description: err.message,
          status: 'error',
        });
        console.error(err);
      } finally {
        setIsLoadingSismoVerification(false);
      }
    };
    handleSismoReputation(sismoProof as Address);
  }, [sismoProof, walletClient, submitVerification, addRecentTransaction, publicClient, reloadScore, toast]);

  return (
    <VStack spacing="4" align="stretch">
      {
        score !== undefined && score < 300 && (
          <VStack align="stretch">
            <Text fontSize="md">
              My reputation score: {score}
            </Text>
            <HStack>
              {
                (score === 0 || score === 200) && (
                  <Button colorScheme="orange" rounded="xl" isLoading={isLoadingEbayVerification} onClick={handleEbayReputation}>
                    Import eBay reputation
                  </Button>
                )
              }
              {
                (score === 0 || score === 100) && (
                  <Button colorScheme="purple" rounded="xl" isLoading={isLoadingSismoVerification} onClick={onSismoConnect}>
                    Sismo Connect
                  </Button>
                )
              }
            </HStack>
          </VStack>
        )
      }
      <HStack>
        <Text as="b" fontSize="xl">
          My Products
        </Text>
        <Spacer />
        <IconButton
          aria-label="Reload products"
          icon={<RepeatIcon />}
          variant="ghost"
          rounded="full"
          onClick={refreshProducts}
        />
        <Button rounded="xl" colorScheme="green" onClick={() => onCreate()}>
          Create
        </Button>
      </HStack>
      <VStack spacing="4" align="stretch">
        {products.map((product: ZBayProductWithMetadata) => {
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
              showMessageButton={product.seller === address && product.state > ZBayProductState.Created}
              onMessage={onMessage}
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
            isOpen={isDispatchModalOpen}
            onDispatch={(product) => handleDispatch(product)}
            onClose={() => setIsDispatchModalOpen(false)}
            product={dispatchingProduct}
            isLoading={isDispatching}
            actionTitle="Dispatch"
            allowSecretGeneration={true}
            title="Confirm the dispatch"
          />
        )
      }
      {
        messagingWith && (
          <ChatModal
            title={messagingWith.product.metadata.title.slice(0, 32) + '...'}
            companion={messagingWith.companion}
            isOpen={!!messagingWith}
            onClose={() => setMessagingWith(undefined)}
            isLoading={false}
            counterparty="Buyer"
          />
        )
      }
    </VStack>
  );
};

export default Seller;
