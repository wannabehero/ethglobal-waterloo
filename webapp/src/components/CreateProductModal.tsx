import { Button, Divider, FormControl, FormHelperText, FormLabel, HStack, Input, InputGroup, InputRightAddon, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, VStack } from '@chakra-ui/react';
import { useState } from 'react';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateProductModal = ({ isOpen, onClose }: CreateProductModalProps) => {
  const [ebayUrl, setEbayUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [type, setType] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [condition, setCondition] = useState('Used');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');

  const handleImport = () => {
    setIsImporting(true);
    // TODO: import
    setIsImporting(false);
  };

  const isFormValid = false;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create new product</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing="4">
            <FormControl>
              <FormLabel>Import from eBay</FormLabel>
              <InputGroup>
                <Input
                  type="url"
                  pr="5rem"
                  placeholder="https://www.ebay.com/itm/069420"
                  value={ebayUrl}
                  onChange={(e) => setEbayUrl(e.target.value)}
                />
                <InputRightElement width="5rem">
                  <Button h="1.75rem" size="sm" onClick={handleImport} isLoading={isImporting}>
                    Import
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormHelperText>Enter a link to your eBay listed product</FormHelperText>
            </FormControl>
            <Divider />
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input placeholder="Something I don't need anymore" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Brand</FormLabel>
              <Input placeholder="Apple" type="text" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Type</FormLabel>
              <Input placeholder="Phone" type="text" value={type} onChange={(e) => setType(e.target.type)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Condition</FormLabel>
              <RadioGroup value={condition} onChange={(value) => setCondition(value)}>
                <HStack spacing="24px">
                  <Radio value="Used">Used</Radio>
                  <Radio value="New">New</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Photo URL</FormLabel>
              <Input placeholder="https://img.url/photo.jpg" type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Location</FormLabel>
              <Input placeholder="Waterloo, Canada" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Price</FormLabel>
              <InputGroup>
                <Input placeholder="100" type="text" value={price} onChange={(e) => setPrice(e.target.value)} />
                <InputRightAddon children="USDC" />
              </InputGroup>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="green" rounded="xl" isDisabled={!isFormValid}>
            Create
          </Button>
          <Button variant="ghost" ml={3} rounded="xl" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateProductModal;
