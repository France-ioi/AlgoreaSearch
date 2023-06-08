
import * as D from 'io-ts/Decoder';
import { decodeOrThrow } from '../utils/decode';
import { get } from '../utils/http';

const navItemDecoder = D.struct({
  id: D.string,
  has_visible_children: D.boolean,
  type: D.literal('Chapter','Task'),
  permissions: D.struct({ can_view: D.string }),
});

const rootActivitiesDecoder = D.array(
  D.struct({
    activity: navItemDecoder
  })
);

const itemNavDecoder = D.struct({
  children: D.array(navItemDecoder)
});

export type NavItems = D.TypeOf<typeof navItemDecoder>[];

export async function getRoots(options: { token: string }): Promise<NavItems> {
  return decodeOrThrow(rootActivitiesDecoder)(await get(`${process.env.API_URL!}/current-user/group-memberships/activities`, options))
    .map(root => root.activity);
}

export async function getNav(itemId: string, options: { token: string }): Promise<NavItems> {
  return decodeOrThrow(itemNavDecoder)(await get(`${process.env.API_URL!}/items/${itemId}/navigation?attempt_id=0`, options)).children;
}
