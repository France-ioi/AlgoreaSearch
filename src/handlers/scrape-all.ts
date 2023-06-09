import { getTempUserToken } from '../http-services/auth';
import { itemMetadata } from '../lib/item-metadata';
import { visibleItems } from '../lib/visible-items';
import { SearchClient } from '../search-client/search-client';
import { headlessBrowser } from '../task-api-client/browser';
import { getResourcesContent } from '../task-api-client/resources-fetcher';
import { tLog } from '../utils/timed_log';

export async function handler(_event: unknown): Promise<unknown> {

  const token = await getTempUserToken();
  tLog('Temp token fetched');
  const ids = await visibleItems(token);
  tLog(`Visible id list fetched (count: ${ids.length})`);
  const items = (await itemMetadata(ids, token));
  tLog(`Item metadata fetched (count with url: ${items.length})`);

  const search = new SearchClient();
  tLog('Opensearch client created');

  const { browser, page } = await headlessBrowser();
  tLog('Headless browser ready');

  for (const item of items) {
    let rContent: Awaited<ReturnType<typeof getResourcesContent>>[number]|undefined;

    if (item.type === 'Task' && item.url) {
      try {
        rContent = (await getResourcesContent(page, item.url))[0];
      } catch (e) {
        const name = typeof(e) === 'object' && e !== null && 'name' in e ? e.name as string : '?';
        const message = typeof(e) === 'object' && e !== null && 'message' in e ? e.message as string : '?';
        tLog(`unable to get resources content from ${item.id}, url: ${item.url}, error name: ${name}, message: ${message.slice(0,200)}`);
      }
    }
    if (rContent) {
      await search.insert({
        id: item.id,
        title: item.string.title ?? rContent.title,
        summary: rContent.summary,
        l2subtitles: rContent.level2,
        l3subtitles: rContent.level3,
        fullText: rContent.text,
        type: item.type // 'Task' expected
      });
    } else {
      await search.insert({
        id: item.id,
        title: item.string.title ?? '',
        summary: item.string.description ?? '',
        type: item.type
      });
    }
    tLog(`document ${item.id} (${item.type}) indexed`);
  }
  tLog('indexing completed');

  await search.close();
  await browser.close();

  return undefined;
}

