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
export class FedexService {

    async getFedexPackageStatus(trackingId: string): Promise<string> {
        console.log("in getFedexPackageStatus");
        const trackingStatusRaw = await puppeteer.launch({ headless: true }).then(async browser => {
            const page = await browser.newPage();
            console.log("before page goto updd");
            await page.setDefaultNavigationTimeout(60000);
            await page.goto(`https://www.fedex.com/fedextrack/?trknbr=${trackingId}`, { waitUntil: 'networkidle0' });
            console.log("after page goto");
          
            await page.solveRecaptchas();
            
            const html = await page.content();
            //save html to file
            const fs = require('fs');
            fs.writeFile("response.html", html, function(err) {});
            //save screenshot to file
            await page.screenshot({ path: 'response.png', fullPage: true });
            
            const element = await page.$("trk-shared-shipment-delivery-status");
            let value = await page.evaluate(el => el.textContent, element);
            await browser.close();
            return value;
        })

        console.log(trackingStatusRaw)

        // const regex = /DELIVERY STATUS(.*)/;
        // const match = trackingStatusRaw.match(regex);

        
        // const positiveFeedback = match[1];
        // const itemsSold = match[2];
        // console.log(positiveFeedback); 
        // console.log(itemsSold);
        

        // const ebayMerchantData = {
        //     "positiveFeedback": positiveFeedback,
        //     "itemsSold": itemsSold
        // }

        return trackingStatusRaw;
    }

}