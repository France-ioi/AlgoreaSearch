

import { pipe } from 'fp-ts/lib/function';
import * as D from 'io-ts/Decoder';
import { decodeOrThrow } from '../utils/decode';
import { get } from '../utils/http';
import { apiUrl } from './http-common';

const itemDecoder = pipe(
  D.struct({
    id: D.string,
    requires_explicit_entry: D.boolean,
    string: pipe(
      D.struct({
        title: D.nullable(D.string),
        language_tag: D.string,
        image_url: D.nullable(D.string),
      }),
      D.intersect(
        D.partial({
          subtitle: D.nullable(D.string),
          description: D.nullable(D.string),
        })
      )
    ),
    type: D.literal('Chapter','Task'),
    text_id: D.nullable(D.string),
    validation_type: D.literal('None','All','AllButOne','Categories','One','Manual'),
    no_score: D.boolean,
    allows_multiple_attempts: D.boolean,
  }),
  D.intersect(
    D.partial({
      url: D.nullable(D.string),
      uses_api: D.nullable(D.boolean),
    })
  )
);

export type Item = D.TypeOf<typeof itemDecoder>;

export async function getItem(itemId: string, options: { token: string }): Promise<Item> {
  return decodeOrThrow(itemDecoder)(await get(`${apiUrl}/items/${itemId}`, options));
}
