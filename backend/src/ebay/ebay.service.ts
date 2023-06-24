import * as fs from 'fs';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Browser } from 'puppeteer';

const APIFY_TOKEN = process.env.APIFY_TOKEN;

@Injectable()
export class EbayService implements OnModuleDestroy {
  constructor(private readonly browser: Browser) {}

  async onModuleDestroy() {
    await this.browser.close();
  }

  async getEbayItem(itemUrl: string) {
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
    await page.setDefaultNavigationTimeout(60000);
    await page.goto(merchantUrl);
    await page.solveRecaptchas();

    const html = await page.content();
    //save html to file
    fs.writeFileSync('response.html', html);
    //save screenshot to file
    await page.screenshot({ path: 'response.png', fullPage: true });

    await page.waitForSelector("[class='str-seller-card__stats-content']", { timeout: 10000 });

    const element1 = await page.$("[class='str-seller-card__stats-content']");
    const merchantDataRaw = await page.evaluate((el) => el.textContent, element1);

    const element2 = await page.$("[class='str-about-description__seller-info']");
    const memberSinceRaw = await page.evaluate((el) => el.textContent, element2);

    // 100% Positive feedback (4)7 Items sold1 Follower
    // 100% Positive feedback (1)
    console.log(merchantDataRaw);
    console.log(memberSinceRaw);

    const match1 = merchantDataRaw.match(/(\d+%)(?:.*)feedback(.*)\sItems/);
    const positiveFeedback = match1 ? match1[1] : '0%';
    const itemsSold = match1 ? match1[2] : '0';

    const match2 = memberSinceRaw.match(/since:(.*\d)/);
    const memberSinceDate = match2 ? new Date(match2[1]) : 'N/A';
    console.log(memberSinceDate);

    console.log(positiveFeedback);
    console.log(itemsSold);

    return {
      itemsSold,
      positiveFeedback,
      memberSinceDate,
    };
  }
}
