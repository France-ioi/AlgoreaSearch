import { Page, Browser } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

/**
 * Launch an init browser and return it, as well as a new page. The browser should be closed when the app completes.
 */
export async function headlessBrowser(): Promise<{ browser: Browser, page: Page }> {
  chromium.setHeadlessMode = true;
  chromium.setGraphicsMode = false;
  const browser = await puppeteer.launch({
    args: process.env.IS_LOCAL ? puppeteer.defaultArgs() : chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: process.env.IS_LOCAL ?
      '/tmp/localChromium/chrome/mac-1134431/chrome-mac/Chromium.app/Contents/MacOS/Chromium' :
      await chromium.executablePath(),
    headless: process.env.IS_LOCAL ? false : chromium.headless,
  });
  return { browser, page: await browser.newPage() };
}