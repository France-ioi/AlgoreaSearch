import { getTempUserToken } from '../http-services/auth';
import { itemMetadata } from '../lib/item-metadata';
import { visibleItems } from '../lib/visible-items';
import { Content, SearchClient } from '../search-client/search-client';
import { headlessBrowser } from '../task-api-client/browser';
import { getResourcesContent } from '../task-api-client/resources-fetcher';

export async function handler(_event: unknown): Promise<unknown> {

  const token = await getTempUserToken();
  console.log('Temp token fetched');
  const ids = await visibleItems(token);
  console.log(`Visible id list fetched (count: ${ids.length})`);
  const items = (await itemMetadata(ids, token)).slice(0,10);
  console.log(`Item metadata fetched (count with url: ${items.length})`);

  const search = new SearchClient();
  console.log('Opensearch client created');

  const { browser, page } = await headlessBrowser();
  console.log('Headless browser ready');

  for (const item of items) {
    let content: Content;
    if (item.type === 'Task' && item.url) {
      const rContent = (await getResourcesContent(page, item.url))[0];
      if (!rContent) {
        console.error(`Unexpected empty content on content with id ${item.id} and url ${item.url}`);
        continue;
      }
      content = {
        id: item.id,
        title: rContent.title,
        summary: rContent.summary,
        fullText: rContent.text,
        type: item.type // 'Task' expected
      };
    } else if (item.type === 'Chapter') {
      content = {
        id: item.id,
        title: item.string.title ?? '',
        summary: item.string.description ?? '',
        type: item.type
      };
    } else {
      console.log(`Task (${item.id}) without url, no indexation`);
      continue;
    }
    //console.debug(`item with id: ${item.id}: ${JSON.stringify(content)}`);
    await search.insert(content);
    console.log(`document ${item.id} (${item.type}) indexed`);
  }
  console.log('indexation completed');

  await search.close();
  await browser.close();

  return undefined;
}

