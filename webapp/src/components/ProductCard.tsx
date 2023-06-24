import { Button, Card, CardBody, CardFooter, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { ZBayProductWithMetadata } from '../types/product';

interface ProductCardProps {
  product: ZBayProductWithMetadata;

  isLoading?: boolean;
  actionTitle?: string;
  onAction?: (product: ZBayProductWithMetadata) => void;
}

const ProductCard = ({ product, onAction, actionTitle, isLoading }: ProductCardProps) => {
  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow="hidden"
      variant="outline"
    >
      <Image
        objectFit="cover"
        maxW={{ base: "100%", sm: "200px" }}
        src={product.metadata.image}
        alt={product.metadata.title}
      />

      <Stack>
        <CardBody>
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
