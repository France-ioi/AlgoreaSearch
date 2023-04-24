import { getItem, Item } from '../http-services/item';

export async function itemMetadata(itemIds: string[], token: string): Promise<Item[]> {
  const list = [];
  for (const id of itemIds) {
    list.push(await getItem(id, { token }));
  }
  return list;
}