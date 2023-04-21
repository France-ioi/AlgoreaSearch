

import { pipe } from 'fp-ts/lib/function';
import * as D from 'io-ts/Decoder';
import { decodeOrThrow } from '../utils/decode';
import { get } from '../utils/http';

const itemDecoder = pipe(
  D.struct({
    id: D.string,
    requiresExplicitEntry: D.boolean,
    string: pipe(
      D.struct({
        title: D.nullable(D.string),
        languageTag: D.string,
        imageUrl: D.nullable(D.string),
      }),
      D.intersect(
        D.partial({
          subtitle: D.nullable(D.string),
          description: D.nullable(D.string),
        })
      )
    ),
    type: D.literal('Chapter','Task'),
    textId: D.nullable(D.string),
    validationType: D.literal('None','All','AllButOne','Categories','One','Manual'),
    noScore: D.boolean,
    fullScreen: D.literal('forceYes','forceNo','default'),
    childrenLayout: D.literal('List', 'Grid'),
    allowsMultipleAttempts: D.boolean,
    entryParticipantType: D.literal('Team', 'User'),
  }),
  D.intersect(
    D.partial({
      url: D.nullable(D.string),
      usesApi: D.nullable(D.boolean),
    })
  )
);

export type Item = D.TypeOf<typeof itemDecoder>;

export async function getItem(itemId: string, options: { token: string }): Promise<Item> {
  return decodeOrThrow(itemDecoder)(await get(`/items/${itemId}`, options));
}
