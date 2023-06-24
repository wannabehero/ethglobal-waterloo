import { Injectable } from '@nestjs/common';


import { ApolloClient, InMemoryCache, gql } from "@apollo/client/core"

const APIURL = 'https://api.studio.thegraph.com/query/48370/zbay/version/latest'

const client = new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache(),
  })

interface Product {
    id: string;
    name: string;
    price: number;
    timestamp: Date;
}

@Injectable()
export class ProductService {

    async getProductsByMerchant(merchantId: string): Promise<string> {
        const products = this.getProducts(merchantId);

        return JSON.stringify(products);
    }

    async getProducts(merchantId: string): Promise<Array<Product>> {
        const query = gql`{
            productCreateds {
                price
              id
              ZBay_id
              transactionHash
              blockTimestamp
            }
            }`;

        const response = await client.query({query});
        console.log(response)
        const products = response.data.productCreateds.map((product) => {
            return {
                id: product.id,
                name: product.ZBay_id,
                price: product.price,
                timestamp: new Date(product.blockTimestamp * 1000),
            }
        });

        return products;
        
    }

    
}
