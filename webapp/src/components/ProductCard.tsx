import { Button, Card, CardBody, CardFooter, HStack, Heading, Highlight, IconButton, Image, Stack, Text, VStack } from '@chakra-ui/react';
import { ZBayProductWithMetadata } from '../types/product';
import { ChatIcon } from '@chakra-ui/icons';

interface ProductCardProps {
  product: ZBayProductWithMetadata;

  caption?: string;
  status?: string;
  isLoading?: boolean;
  actionTitle?: string;
  onAction?: (product: ZBayProductWithMetadata) => void;

  showMessageButton: boolean;
  onMessage: (product: ZBayProductWithMetadata) => void;
}

const ProductCard = ({ onMessage, showMessageButton, product, caption, onAction, actionTitle, isLoading, status }: ProductCardProps) => {
  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow="hidden"
      variant="outline"
    >
      <Image
        objectFit="cover"
        maxW={{ base: "100%", sm: "200px" }}
        src={product.metadata.photoUrl}
        alt={product.metadata.title}
      />

      <Stack>
        <CardBody>
          <VStack align="flex-start">
            <Heading size="md">{product.metadata.title}</Heading>
            <Text>
              {product.metadata.brand}
            </Text>
            <Text as="b">
              {product.metadata.condition}
            </Text>
            <Text as="i">
              {product.metadata.location}
            </Text>
            {
              status && (
                <Highlight
                  query={[status]}
                  styles={{ px: '2', py: '1', bg: 'teal.300' }}
                >
                  {status}
                </Highlight>
              )
            }
          </VStack>
        </CardBody>

        <CardFooter>
          <VStack align="flex-start">
            <HStack>
              {
                actionTitle && onAction && (
                  <Button
                    variant="solid"
                    colorScheme="orange"
                    onClick={() => onAction(product)}
                    isLoading={isLoading}
                  >
                    {actionTitle}
                  </Button>
                )
              }
              {
                showMessageButton && (
                  <IconButton
                    aria-label="Send message"
                    icon={<ChatIcon />}
                    onClick={() => onMessage(product)}
                    colorScheme="blue"
                    rounded="xl"
                  />
                )
              }
            </HStack>
            {
              actionTitle && caption && (
                <Text fontSize="sm" color="gray.400">
                  {caption}
                </Text>
              )
            }
        </VStack>
        </CardFooter>
      </Stack>
    </Card>
  )
};

export default ProductCard;
