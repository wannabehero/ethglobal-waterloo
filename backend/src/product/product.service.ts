import { Injectable } from '@nestjs/common';

import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';

const APIURL = 'https://api.studio.thegraph.com/query/48370/zbay/version/latest';

const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache(),
});

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

  async getAllProducts() {
    const products = await this.getProducts(null);

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

  async getProducts(merchantId: string): Promise<Array<Product>> {
    let query = gql`
      {
        productCreateds {
          id
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
                    id
                    cid
                    price
                    seller
                    blockTimestamp
                }
                }`;
    }

    const response = await client.query({ query });
    const products = response.data.productCreateds.map((product) => {
      return {
        id: product.id,
        cid: product.cid,
        price: product.price,
        seller: product.seller,
        timestamp: product.blockTimestamp,
      };
    });

    return products;
  }

  async getProductsBought(buyerId: string): Promise<Array<ProductBought>> {
    let query = gql`
      {
        productPurchaseds {
          id
          buyer
          blockTimestamp
        }
      }
    `;

    if (buyerId != null) {
      query = gql`{
                productPurchaseds (where: {buyer: "${buyerId}"}) {
                    id
                    buyer
                    blockTimestamp
                }
                }`;
    }

    const response = await client.query({ query });
    const products = response.data.productPurchaseds.map((product) => {
      return {
        id: product.id,
        buyer: product.buyer,
        timestamp: product.blockTimestamp,
      };
    });

    return products;
  }
}
