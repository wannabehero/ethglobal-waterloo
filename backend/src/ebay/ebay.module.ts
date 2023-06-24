import { Module } from '@nestjs/common';
import { EbayService } from './ebay.service';
import { EbayController } from './ebay.controller';

import puppeteer from 'puppeteer-extra';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import { Browser } from 'puppeteer';

@Module({
  providers: [
    {
      provide: Browser,
      useFactory: async () => {
        puppeteer.use(
          RecaptchaPlugin({
            provider: { id: '2captcha', token: '264d2212bd653dfb27f462b752788f18' },
            visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
          }),
        );
        return puppeteer.launch({ headless: 'new' });
      },
    },
    EbayService,
  ],
  controllers: [EbayController],
})
export class EbayModule {}
