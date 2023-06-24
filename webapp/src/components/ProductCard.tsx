import { Button, Card, CardBody, CardFooter, Heading, Highlight, Image, Stack, Text, VStack } from '@chakra-ui/react';
import { ZBayProductWithMetadata } from '../types/product';

interface ProductCardProps {
  product: ZBayProductWithMetadata;

  status?: string;
  isLoading?: boolean;
  actionTitle?: string;
  onAction?: (product: ZBayProductWithMetadata) => void;
}

const ProductCard = ({ product, onAction, actionTitle, isLoading, status }: ProductCardProps) => {
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

        {
          actionTitle && onAction && (
            <CardFooter>
              <Button
                variant="solid"
                colorScheme="orange"
                onClick={() => onAction(product)}
                isLoading={isLoading}
              >
                {actionTitle}
              </Button>
            </CardFooter>
          )
        }
      </Stack>
    </Card>
  )
};

export default ProductCard;
