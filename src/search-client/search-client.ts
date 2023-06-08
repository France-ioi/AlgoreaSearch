import { ApiResponse, Client } from '@opensearch-project/opensearch';

export interface Content {
  id: string,
  title: string,
  summary: string,
  fullText?: string,
  l2subtitles?: string[],
  l3subtitles?: string[],
  type: 'Task'|'Chapter',
}

export class SearchClient {

  readonly client = new Client({ node: process.env.OPENSEARCH_NODE });

  async close(): Promise<void> {
    return this.client.close();
  }

  async insert({ id, title, summary, fullText, l2subtitles, l3subtitles, type }: Content): Promise<void> {
    await this.client.index({
      id,
      index: 'content',
      body: { id, title, summary, fullText, type, l2subtitles, l3subtitles },
      refresh: true,
    });
  }

  async search(query: string): Promise<ApiResponse<Record<string, any>, unknown>> {
    return this.client.search({
      index: 'content',
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
      },
    });
  }

}