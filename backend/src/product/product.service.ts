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

    const response = await client.query({ query, fetchPolicy: 'no-cache' });
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

  async getProductsBought(buyerId: string): Promise<Array<ProductBought>> {
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

    const response = await client.query({ query });
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
