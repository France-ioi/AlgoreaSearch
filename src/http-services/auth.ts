import * as D from 'io-ts/Decoder';
import { decodeOrThrow } from '../utils/decode';
import { post } from '../utils/http';
import { apiUrl } from './http-common';

export const tokenDecoder = D.struct({
  access_token: D.string
});

export async function getTempUserToken(): Promise<string> {
  const token = decodeOrThrow(tokenDecoder)((await post(`${apiUrl}/auth/temp-user?default_language=en`, undefined)).data);
  return token.access_token;
}
