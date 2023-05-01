// import { getTempUserToken } from './http-services/auth';
// import { itemMetadata } from './lib/item-metadata';
// import { visibleItems } from './lib/visible-items';
import { headlessBrowser } from '../task-api-client/browser';
import { getResourcesContent } from '../task-api-client/resources-fetcher';

export async function handler(_event: unknown): Promise<unknown> {

  const { browser, page } = await headlessBrowser();

  const u = 'https://static-items.algorea.org/files/checkouts/3cbc8ca5cc2207e6e1de343db2fc3f4f/286e278e09f02b9e10d915400c4c6362/index.html';

  const res = await getResourcesContent(page, u);
  // eslint-disable-next-line no-console
  console.log(`done2 ${JSON.stringify(res)}`);

  await browser.close();

  return undefined;

}

