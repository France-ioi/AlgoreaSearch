import * as D from 'io-ts/Decoder';
import { post } from '../utils/http';
import { apiUrl } from './http-common';

export const tokenDecoder = D.struct({
  access_token: D.string
});

export async function start(path: string[], options: { token: string }): Promise<void> {
  await post(`${apiUrl}/items/${path.join('/')}/start-result?attempt_id=0`, undefined, options);
}
