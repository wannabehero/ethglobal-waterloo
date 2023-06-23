import { Injectable } from '@nestjs/common';


@Injectable()
export class EbayService {


    async getEbayItem(itemUrl: string): Promise<string> {
        const response = await fetch('https://api.apify.com/v2/acts/dtrungtin~ebay-items-scraper/run-sync-get-dataset-items?token=apify_api_Mu3Gri5HGx2TYBpgWInZIL5VjxNfws3YVkMU', {
            method: 'POST',
            body: JSON.stringify({
                "maxItems": 1,
                "proxyConfig": {
                    "useApifyProxy": true
                },
                "startUrls": [
                    {
                        "url": itemUrl
                    },
                ]
            }),
            headers: {
                'Content-Type': 'application/json'
            }
            });
            const data = await response.text();
            return data;

    }
}
