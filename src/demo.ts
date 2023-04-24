import { getTempUserToken } from './http-services/auth';
import { itemMetadata } from './lib/item-metadata';
import { visibleItems } from './lib/visible-items';

export async function handler(_event: unknown): Promise<unknown> {

  const token = await getTempUserToken();
  const visibleIds = await visibleItems(token);
  const allInfo = await itemMetadata(visibleIds, token);

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(allInfo));

  return undefined;

}

