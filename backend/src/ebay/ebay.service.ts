import { Injectable } from '@nestjs/common';

const dotenv = require("dotenv");

dotenv.config();

const puppeteer = require('puppeteer-extra')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')

const CAPTCHA_TOKEN = process.env.CAPTCHA_TOKEN;
const APIFY_TOKEN = process.env.APIFY_TOKEN;

puppeteer.use(
  RecaptchaPlugin({
    provider: { id: '2captcha', token: CAPTCHA_TOKEN },
    visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)

@Injectable()
export class EbayService {


    async getEbayItem(itemUrl: string): Promise<string> {
        const response = await fetch(`https://api.apify.com/v2/acts/dtrungtin~ebay-items-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, {
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


        const [merchantDataRaw, memberSinceRaw] = await puppeteer.launch({ headless: true }).then(async browser => {
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

            const element2 = await page.$("[class='str-about-description__seller-info']");
            let value2 = await page.evaluate(el => el.textContent, element2);
            await browser.close();
            return [value, value2];
        })

        console.log(merchantDataRaw);
        console.log(memberSinceRaw);

        const regex = /(\d+%)(?:.*)feedback(.*)\sItems/;
        const match = merchantDataRaw.match(regex);
        const positiveFeedback = match ? match[1] : "0%";
        const itemsSold = match ? match[2] : "0";
        console.log(positiveFeedback); 
        console.log(itemsSold);

        const regex2 = /since:(.*\d)/;
        const match2 = memberSinceRaw.match(regex2);
        const memberSinceDate = match2 ? new Date(match2[1]) : "N/A";
        console.log(memberSinceDate);
        

        const ebayMerchantData = {
            "positiveFeedback": positiveFeedback,
            "itemsSold": itemsSold,
            "memberSinceDate": memberSinceDate
        }

        return JSON.stringify(ebayMerchantData);
    
    }
}
