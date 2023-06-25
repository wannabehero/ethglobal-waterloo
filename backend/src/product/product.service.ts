import { Injectable } from '@nestjs/common';

import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';

const clients = {
  80001: new ApolloClient({
    uri: 'https://api.studio.thegraph.com/query/48370/zbay/version/latest',
    cache: new InMemoryCache(),
  }),
  5: new ApolloClient({
    uri: 'https://api.studio.thegraph.com/query/48370/zbay_goerli/version/latest',
    cache: new InMemoryCache(),
  }),
  100: new ApolloClient({
    uri: 'https://api.studio.thegraph.com/query/48370/zbay_gnosis/version/latest',
    cache: new InMemoryCache(),
  }),
};

export interface Product {
  id: string;
  cid: string;
  price: string;
  seller: string;
  timestamp: string;
}

export interface ProductBought {
  id: string;
  buyer: string;
  timestamp: string;
}

@Injectable()
export class ProductService {
  async getProductsByMerchant(merchantId: string) {
    const products = await this.getProducts(merchantId);

    console.log(products);

    return products;
  }

  async getProductById(productId: string) {
    const query = gql`
        {
            productCreateds (where: {ZBay_id: "${productId}"}) {
                ZBay_id
                cid
                price
                seller
                blockTimestamp
            }
            }
        `;

    const response = await clients[80001].query({ query, fetchPolicy: 'no-cache' });

    const productData = response.data.productCreateds[0];

    console.log(productData);

    const product: Product = {
      id: productData.ZBay_id,
      cid: productData.cid,
      price: productData.price,
      seller: productData.seller,
      timestamp: productData.blockTimestamp,
    };

    return product;
  }

  async getAllProducts(chainId: number) {
    const products = await this.getProducts(null, chainId);

    console.log(products);

    return products;
  }

  async getProductsByBuyer(buyerId: string) {
    const products = await this.getProductsBought(buyerId);

    console.log(products);

    return products;
  }

  async getAllProductsBought() {
    const products = await this.getProductsBought(null);

    console.log(products);

    return products;
  }

  async getProducts(merchantId: string, chainId = 80001): Promise<Array<Product>> {
    let query = gql`
      {
        productCreateds {
          ZBay_id
          cid
          price
          seller
          blockTimestamp
        }
      }
    `;

    if (merchantId != null) {
      query = gql`{
                productCreateds (where: {seller: "${merchantId}"}) {
                  ZBay_id
                    cid
                    price
                    seller
                    blockTimestamp
                }
                }`;
    }

    const response = await clients[chainId].query({ query, fetchPolicy: 'no-cache' });
    const products = response.data.productCreateds.map((product) => {
      return {
        id: product.ZBay_id,
        cid: product.cid,
        price: product.price,
        seller: product.seller,
        timestamp: product.blockTimestamp,
      };
    });

    return products;
  }

  async getProductsBought(buyerId: string, chainId = 80001): Promise<Array<ProductBought>> {
    let query = gql`
      {
        productPurchaseds {
          ZBay_id
          buyer
          blockTimestamp
        }
      }
    `;

    if (buyerId != null) {
      query = gql`{
                productPurchaseds (where: {buyer: "${buyerId}"}) {
                    ZBay_id
                    buyer
                    blockTimestamp
                }
                }`;
    }

    const response = await clients[chainId].query({ query });
    const products = response.data.productPurchaseds.map((product) => {
      return {
        id: product.ZBay_id,
        buyer: product.buyer,
        timestamp: product.blockTimestamp,
      };
    });

    return products;
  }
}
