import { Injectable } from '@nestjs/common';

const puppeteer = require('puppeteer-extra')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
  RecaptchaPlugin({
    provider: { id: '2captcha', token: '264d2212bd653dfb27f462b752788f18' },
    visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)

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

    async getEbayMerchantData(merchantUrl: string): Promise<string> {
        merchantUrl = 'https://www.ebay.com/str/perfumepoodle';

        const merchantData = await puppeteer.launch({ headless: true }).then(async browser => {
            const page = await browser.newPage();
            await page.goto(merchantUrl);
          
            await page.solveRecaptchas();
            
            const html = await page.content();
            //save html to file
            const fs = require('fs');
            fs.writeFile("response.html", html, function(err) {});
            //save screenshot to file
            await page.screenshot({ path: 'response.png', fullPage: true });
            
            const element = await page.$("[class='str-seller-card__stats-content']");
            let value = await page.evaluate(el => el.textContent, element);
            await browser.close();
            return value;
        })


        console.log(`merchant data: ${merchantData}`);

        return String(merchantData);
    
    }
}
