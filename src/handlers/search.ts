import { ALBEvent, ALBResult } from 'aws-lambda';
import { SearchClient } from '../search-client/search-client';

export async function handler(event: ALBEvent): Promise<ALBResult> {
  const queryParams = event.queryStringParameters;
  if (!queryParams) throw new Error('expected query params');
  const query = queryParams['q'];
  if (!query) throw new Error('missing q (query) parameter');

  const client = new SearchClient();
  const resp = await client.search(query);

  return {
    statusCode: 200,
    body: JSON.stringify(resp)
  };

}

