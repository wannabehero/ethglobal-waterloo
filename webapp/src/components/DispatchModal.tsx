import { Button, FormControl, FormHelperText, FormLabel, Input, InputGroup, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, VStack } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { ZBayProduct } from '../types/product';
import { toHex } from 'viem';
import { randomBytes } from 'crypto';

export type DispatchData = {
  secret: string;
  trackingNumber: string;
  product: ZBayProduct;
}

interface DispatchModalProps {
  title: string;
  isOpen: boolean;
  isLoading: boolean;
  product: ZBayProduct;
  actionTitle: string;
  allowSecretGeneration: boolean;

  onClose: () => void;
  onDispatch: (data: DispatchData) => Promise<boolean>;
}

const DispatchModal = ({ title, isOpen, actionTitle, allowSecretGeneration, onClose, onDispatch, isLoading, product }: DispatchModalProps) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [secret, setSecret] = useState('');

  const clearForm = useCallback(() => {
    setTrackingNumber('');
    setSecret('');
  }, [setSecret, setTrackingNumber]);

  const handleGenerateSecret = useCallback(() => {
    const secret = toHex(randomBytes(8)).replace('0x', '').toUpperCase();
    setSecret(secret);
  }, [setSecret]);

  const isFormValid = trackingNumber.length > 0 && secret.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing="4">
            <FormControl isRequired>
              <FormLabel>Tracking number</FormLabel>
              <Input placeholder="XXX112233GBUS" type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Secret</FormLabel>
              <InputGroup>
                <Input
                  type="text"
                  pr="6rem"
                  placeholder="XYZ123"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value.toUpperCase())}
                />
                {
                  allowSecretGeneration && (
                    <InputRightElement width="6rem">
                      <Button h="1.75rem" size="sm" onClick={handleGenerateSecret}>
                        Generate
                      </Button>
                    </InputRightElement>
                  )
                }
              </InputGroup>
              {
                allowSecretGeneration && (
                  <FormHelperText>Please include the secret with the product</FormHelperText>
                )
              }
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="green"
            rounded="xl"
            isDisabled={!isFormValid}
            onClick={() => {
              onDispatch({ secret, trackingNumber, product })
                .then((success) => success && clearForm());
            }}
            isLoading={isLoading}
          >
            {actionTitle}
          </Button>
          <Button variant="ghost" ml={3} rounded="xl" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DispatchModal;
