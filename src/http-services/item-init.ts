import * as D from 'io-ts/Decoder';
import { post } from '../utils/http';

export const tokenDecoder = D.struct({
  access_token: D.string
});

export async function start(path: string[], options: { token: string }): Promise<void> {
  await post(`${process.env.API_URL!}/items/${path.join('/')}/start-result?attempt_id=0`, undefined, options);
}
