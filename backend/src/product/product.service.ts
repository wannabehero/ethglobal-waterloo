import { Injectable } from '@nestjs/common';


import { ApolloClient, InMemoryCache, gql } from "@apollo/client/core"

const APIURL = 'https://api.studio.thegraph.com/query/48370/zbay/version/latest'

const client = new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache(),
  })

interface Product {
    id: string;
    cid: string; 
    price: string;
    seller: string;
    timestamp: string;
}

@Injectable()
export class ProductService {

    async getProductsByMerchant(merchantId: string): Promise<string> {
        const products = await this.getProducts(merchantId);

        console.log(products);

        return JSON.stringify(products);
    }

    async getAllProducts(): Promise<string> {
        const products = await this.getProducts(null);

        console.log(products);

        return JSON.stringify(products);
    }

    async getProducts(merchantId: string): Promise<Array<Product>> {
        let query = gql`{
            productCreateds {
                id
                cid
                price
                seller
                blockTimestamp
            }
            }`;

        if (merchantId != null)  {
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

        const response = await client.query({query});
        const products = response.data.productCreateds.map((product) => {
            return {
                id: product.id,
                cid: product.cid,
                price: product.price,
                seller: product.seller,
                timestamp: product.blockTimestamp
            }
        });

        return products;
        
    }

    
}