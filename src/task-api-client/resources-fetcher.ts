import { Page } from 'puppeteer-core';
import * as D from 'io-ts/Decoder';
import { decodeOrThrow } from '../utils/decode';

export const resourcesDecoder = D.struct({
  content: D.array(
    D.struct({
      title: D.string,
      summary: D.string,
      level2: D.array(D.string),
      level3: D.array(D.string),
      text: D.string,
    })
  )
});

type Resources = D.TypeOf<typeof resourcesDecoder>;

export async function getResourcesContent(browserPage: Page, url: string): Promise<Resources['content']> {
  await browserPage.goto(url);
  const res = await browserPage.evaluate(() => new Promise((resolve, reject) => {
    try {
      /** run the following code in the browser console */
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      task.getResources(r => resolve(r));
    } catch (e) {
      reject(e);
    }
  }));
  return decodeOrThrow(resourcesDecoder)(res).content;
}
