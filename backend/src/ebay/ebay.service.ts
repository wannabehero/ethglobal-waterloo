import { Injectable } from '@nestjs/common';

const puppeteer = require('puppeteer-extra')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
  RecaptchaPlugin({
    provider: { id: '2captcha', token: 2CAPTCHA_TOKEN },
    visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)

@Injectable()
export class EbayService {


    async getEbayItem(itemUrl: string): Promise<string> {
        const response = await fetch('https://api.apify.com/v2/acts/dtrungtin~ebay-items-scraper/run-sync-get-dataset-items?token=APIFY_TOKEN', {
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


        const merchantDataRaw = await puppeteer.launch({ headless: true }).then(async browser => {
            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(60000);
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

        const regex = /(\d+%)(?:.*)feedback(.*)\sItems/;
        const match = merchantDataRaw.match(regex);

        
        const positiveFeedback = match[1];
        const itemsSold = match[2];
        console.log(positiveFeedback); 
        console.log(itemsSold);
        

        const ebayMerchantData = {
            "positiveFeedback": positiveFeedback,
            "itemsSold": itemsSold
        }

        return JSON.stringify(ebayMerchantData);
    
    }
}
