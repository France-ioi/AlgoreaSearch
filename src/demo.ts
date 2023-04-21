import { getTempUserToken } from './http-services/auth';
import { visibleItems } from './lib/visible-items';

export async function handler(_event: unknown): Promise<unknown> {

  const token = await getTempUserToken();

  // eslint-disable-next-line no-console
  console.log(await visibleItems(token));

  return undefined;

}

