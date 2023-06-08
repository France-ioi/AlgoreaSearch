import * as D from 'io-ts/Decoder';
import { decodeOrThrow } from '../utils/decode';
import { post } from '../utils/http';

export const tokenDecoder = D.struct({
  access_token: D.string
});

export async function getTempUserToken(): Promise<string> {
  const token = decodeOrThrow(tokenDecoder)((await post(`${process.env.API_URL!}/auth/temp-user?default_language=en`, undefined)).data);
  return token.access_token;
}
