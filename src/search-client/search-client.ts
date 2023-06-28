import { Client } from '@opensearch-project/opensearch';
import * as D from 'io-ts/Decoder';
import { decodeOrThrow } from '../utils/decode';

const nbHightlights = 3;

interface Content {
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
        }),
        highlight: D.partial({
          title: D.array(D.string),
          summary: D.array(D.string),
          l2subtitles: D.array(D.string),
          l3subtitles: D.array(D.string),
          fullText: D.array(D.string),
        })
      }))
    })
  })
  /* eslint-enable @typescript-eslint/naming-convention */
});
interface SearchResponse {
  search_results: (D.TypeOf<typeof apiResponseDecoder>['body']['hits']['hits'][number]['_source'] & {
    score: number,
    title_highlight: string|null,
    highlights: string[],
  })[],
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
                multi_match: {
                  query,
                  fuzziness: 'AUTO', // allow several (depending on the query length) character edits
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
        highlight: {
          fields: {
            title: {},
            summary: {},
            l2subtitles: {},
            l3subtitles: {},
            fullText: {}
          },
          number_of_fragments: nbHightlights
        },
        _source: [ 'id', 'title', 'type' ],
        /* eslint-enable @typescript-eslint/naming-convention */
      },
    });
    // eslint-disable-next-line no-console
    if (debug) console.debug(`Search term: ${query}. Search response: ${JSON.stringify(rawResp)}`);
    const resp = decodeOrThrow(apiResponseDecoder)(rawResp);
    return {
      search_results: resp.body.hits.hits.map(r => ({
        ...r._source,
        score: r._score,
        title_highlight: r.highlight.title?.at(0) ?? null,
        highlights: [
          ...(r.highlight.summary ?? []),
          ...(r.highlight.l2subtitles ?? []),
          ...(r.highlight.l3subtitles ?? []),
          ...(r.highlight.fullText ?? [])
        ].slice(0, nbHightlights),
      }))
    };
  }

}