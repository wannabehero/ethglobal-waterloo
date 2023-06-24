import { VStack } from '@chakra-ui/react';
import useProducts from '../hooks/useProducts';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import ProductCard from '../components/ProductCard';
import { ZBayProduct, ZBayProductState } from '../types/product';
import { useCallback, useEffect, useState } from 'react';
import { encodeAbiParameters, formatEther } from 'viem';
import { useZBayConfirmDelivery, useZBayPurchase } from '../web3/contracts';
import { ZBAY_DEPLOMENTS } from '../web3/consts';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import DispatchModal, { DispatchData } from '../components/DispatchModal';
import { fetchReputationCoef, proveAttestation } from '../api/client';

const Buyer = () => {
  const { address } = useAccount();
  const { products, refreshProducts } = useProducts({ buyer: address });
  const [buyingProduct, setBuyingProduct] = useState<ZBayProduct>();
  const chainId = useChainId();
  const addRecentTransaction = useAddRecentTransaction();
  const publicClient = usePublicClient();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmingProduct, setConfirmingProduct] = useState<ZBayProduct>();
  const [reputationCoef, setReputationCoef] = useState<number>(1.5);

  const { writeAsync: purchaseProduct } = useZBayPurchase({
    address: ZBAY_DEPLOMENTS[chainId],
    gas: 3000000n,
  });

  const { writeAsync: confirmDelivery } = useZBayConfirmDelivery({
    address: ZBAY_DEPLOMENTS[chainId],
    gas: 3000000n,
  });

  const onConfirm = (product: ZBayProduct) => {
    setIsConfirmModalOpen(true);
    setConfirmingProduct(product);
  };

  const handleBuy = useCallback(async (product: ZBayProduct) => {
    setBuyingProduct(product);

    try {
      const tx = await purchaseProduct({
        args: [product.id, encodeAbiParameters([{ type: 'uint256' }], [BigInt(Math.floor(reputationCoef * 100))])],
      });
      addRecentTransaction({
        hash: tx.hash,
        description: 'Purchasing product'
      });
      await publicClient.waitForTransactionReceipt(tx);
      await refreshProducts();
    } catch (e) {
      console.error(e);
    }

    setBuyingProduct(undefined);
  }, [purchaseProduct, addRecentTransaction, publicClient, setBuyingProduct, refreshProducts, reputationCoef]);

  const handleConfirmDelivery = useCallback(async (data: DispatchData) => {
    console.log('Confirming delivery of', data.product.id);

    setIsConfirming(true);

    try {
      const { proof } = await proveAttestation(
        `0x${data.secret}`,
        data.product.buyer,
        data.trackingNumber,
      );
      const tx = await confirmDelivery({
        args: [data.product.id, proof],
      });
      addRecentTransaction({
        hash: tx.hash,
        description: 'Confirming delivery'
      });
      await publicClient.waitForTransactionReceipt(tx);
      await refreshProducts();
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsConfirming(false);
    }

    return true;
  }, [addRecentTransaction, confirmDelivery, publicClient, setIsConfirming, refreshProducts]);

  useEffect(() => {
    if (!address) {
      return;
    }
    fetchReputationCoef(address)
      .then((coef) => setReputationCoef(coef));
  }, [address]);

  return (
    <>
      <VStack spacing="4">
        {products.map((product) => {
          let status: string | undefined = undefined;
          let actionTitle: string | undefined = undefined;
          let onAction: ((product: ZBayProduct) => void) | undefined = undefined;
          switch (product.state) {
            case ZBayProductState.Created:
              actionTitle = `Buy for USDC ${formatEther(product.price)}`;
              onAction = handleBuy;
              break;
            case ZBayProductState.Paid:
              if (product.buyer === address) {
                status = 'Waiting for the seller to dispatch';
              }
              break;
            case ZBayProductState.Dispatched:
              if (product.buyer === address) {
                actionTitle = 'Confirm delivery';
                onAction = onConfirm;
              }
              break;
            case ZBayProductState.Delivered:
              if (product.buyer === address) {
                status = 'Delivered to you'
              }
              break;
            case ZBayProductState.Cancelled:
              if (product.buyer === address) {
                status = 'Cancelled and refunded'
              }
              break;
            case ZBayProductState.Disputed:
              if (product.buyer === address) {
                status = 'Waiting for the dispute resolution'
              }
              break;
            case ZBayProductState.Resolved:
              if (product.buyer === address) {
                status = 'Disputed and confirmed'
              }
              break;
          }

          const lockedValue = product.price * (BigInt(Math.floor(reputationCoef * 100)) - 100n) / 100n;

          return (
            <ProductCard
              key={`product-${address}-${product.id}`}
              product={product}
              isLoading={buyingProduct?.id === product.id}
              actionTitle={actionTitle}
              onAction={onAction}
              status={status}
              caption={`Also ${formatEther(lockedValue)} will be locked (${reputationCoef}x)`}
            />
           );
          }
        )}
      </VStack>
      {
        confirmingProduct && (
          <DispatchModal
            isOpen={isConfirmModalOpen}
            onDispatch={(data) => handleConfirmDelivery(data)}
            onClose={() => setIsConfirmModalOpen(false)}
            product={confirmingProduct}
            isLoading={isConfirming}
            actionTitle="Confirm"
            allowSecretGeneration={false}
            title="Confirm the delivery"
          />
        )
      }
    </>
  );
};

export default Buyer;
