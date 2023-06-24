import * as fs from 'fs';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Browser } from 'puppeteer';

const APIFY_TOKEN = 'apify_api_Mu3Gri5HGx2TYBpgWInZIL5VjxNfws3YVkMU';

@Injectable()
export class EbayService implements OnModuleDestroy {
  constructor(private readonly browser: Browser) {}

  async onModuleDestroy() {
    await this.browser.close();
  }

  async getEbayItem(itemUrl: string) {
    console.log(`in get ebay item controller: ${itemUrl}`);
    const response = await fetch(
      `https://api.apify.com/v2/acts/dtrungtin~ebay-items-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: 'POST',
        body: JSON.stringify({
          maxItems: 1,
          proxyConfig: {
            useApifyProxy: true,
          },
          startUrls: [
            {
              url: itemUrl,
            },
          ],
        }),
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    return response.json();
  }

  async getEbayMerchantData(merchantUrl: string) {
    const page = await this.browser.newPage();
    await page.goto(merchantUrl);
    await page.solveRecaptchas();

    const html = await page.content();
    //save html to file
    fs.writeFileSync('response.html', html);
    //save screenshot to file
    await page.screenshot({ path: 'response.png', fullPage: true });

    await page.waitForSelector("[class='str-seller-card__stats-content']", { timeout: 10000 });

    const element = await page.$("[class='str-seller-card__stats-content']");
    const merchantDataRaw = await page.evaluate((el) => el.textContent, element);
    console.log(merchantDataRaw);

    // 100% Positive feedback (4)7 Items sold1 Follower
    // 100% Positive feedback (1)
    const regex = /(\d+%)(?:.*)feedback(.*)\sItems/;
    const match = merchantDataRaw.match(regex);

    const positiveFeedback = match[1];
    const itemsSold = match[2];
    console.log(positiveFeedback);
    console.log(itemsSold);

    return {
      itemsSold,
      positiveFeedback,
    };
  }
}
