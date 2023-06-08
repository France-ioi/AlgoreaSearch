import { Client } from '@opensearch-project/opensearch';
import * as D from 'io-ts/Decoder';
import { decodeOrThrow } from '../utils/decode';

export interface Content {
  id: string,
  title: string,
  summary: string,
  fullText?: string,
  l2subtitles?: string[],
  l3subtitles?: string[],
  type: 'Task'|'Chapter',
}

const apiResponseDecoder = D.struct({
  /* eslint-disable @typescript-eslint/naming-convention */
  body: D.struct({
    hits: D.struct({
      hits: D.array(D.struct({
        _id: D.string,
        _score: D.number,
        _source: D.struct({
          id: D.string,
          title: D.string,
          type: D.literal('Task', 'Chapter')
        })
      }))
    })
  })
  /* eslint-enable @typescript-eslint/naming-convention */
});
interface SearchResponse {
  search_results: (D.TypeOf<typeof apiResponseDecoder>['body']['hits']['hits'][number]['_source'] & { score: number })[],
}

export class SearchClient {

  readonly client = new Client({ node: process.env.OPENSEARCH_NODE });

  async close(): Promise<void> {
    return this.client.close();
  }

  async insert({ id, title, summary, fullText, l2subtitles, l3subtitles, type }: Content): Promise<void> {
    await this.client.index({
      id,
      index: process.env.INDEX_NAME!,
      body: { id, title, summary, fullText, type, l2subtitles, l3subtitles },
      refresh: true,
    });
  }

  async search(query: string, debug = process.env.DEBUG === '1'): Promise<SearchResponse> {
    const rawResp = await this.client.search({
      /* eslint-disable @typescript-eslint/naming-convention */
      index: process.env.INDEX_NAME!,
      body: {
        query: {
          bool: {
            must: [
              {
                query_string: {
                  query,
                  fields: [ 'title^8', 'summary^4', 'l2subtitles^4', 'l3subtitles^3', 'fullText^2' ],
                },
              }
            ],
            // filter: {
            //   match: {
            //     type: 'Task'
            //   }
            // }
          }
        },
        _source: [ 'id', 'title', 'type' ],
        /* eslint-enable @typescript-eslint/naming-convention */
      },
    });
    // eslint-disable-next-line no-console
    if (debug) console.debug(`Search term: ${query}. Search response: ${JSON.stringify(rawResp)}`);
    const resp = decodeOrThrow(apiResponseDecoder)(rawResp);
    return {
      search_results: resp.body.hits.hits.map(r => ({ ...r._source, score: r._score }))
    };
  }

}