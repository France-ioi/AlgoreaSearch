import { Client } from '@opensearch-project/opensearch';
import { ALBEvent, ALBResult } from 'aws-lambda';

export async function handler(event: ALBEvent): Promise<ALBResult> {
  const queryParams = event.queryStringParameters;
  if (!queryParams) throw new Error('expected query params');
  const query = queryParams['q'];
  if (!query) throw new Error('missing q (query) parameter');

  const client = new Client({
    node: `https://${process.env.SEARCH_AUTH ?? ''}@search-algorea-orbdsfmhccs7qnb27q2weasx3y.eu-west-3.es.amazonaws.com/`
  });

  const resp = await client.search({
    index: 'content',
    body: {
      query: {
        bool: {
          must: [
            {
              query_string: {
                query: 'blockchain',
                fields: [ 'title^4', 'subtitle^2', 'description' ],
              },
            }
          ],
          filter: {
            match: {
              type: 'Task'
            }
          }
        }
      },
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify(resp)
  };

}

