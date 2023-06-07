import { ApiResponse, Client } from '@opensearch-project/opensearch';

export interface Content {
  id: string,
  title: string,
  summary: string,
  fullText?: string,
  type: 'Task'|'Chapter',
}

export class SearchClient {

  readonly client = new Client({ node: process.env.OPENSEARCH_NODE });

  async close(): Promise<void> {
    return this.client.close();
  }

  async insert({ id, title, summary, fullText, type }: Content): Promise<void> {
    await this.client.index({
      id,
      index: 'content',
      body: { id, title, summary, fullText, type },
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
                  fields: [ 'title^4', 'summary^2', 'fullText' ],
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