import { DecodingError, Forbidden, ClientError, ServerError } from './errors';
import * as D from 'io-ts/Decoder';
import { decodeOrThrow } from './decode';
import { pipe } from 'fp-ts/lib/function';

const actionResponseDecoder = pipe(
  D.struct({
    success: D.boolean,
    message: D.string,
  }),
  D.intersect(D.partial({ data: D.UnknownRecord }))
);

type ActionResponse = D.TypeOf<typeof actionResponseDecoder>;

export async function http(request: RequestInfo): Promise<unknown> {
  const response = await fetch(request);
  let jsonResp;
  try {
    jsonResp = (await response.json()) as unknown;
  } catch (e) {
    throw new DecodingError(`Unable to parse response body to json: ${JSON.stringify(e)}`);
  }
  if (!response.ok) {
    const req = typeof request === 'string' ? request : `req: ${request.url}`;
    const details = `Req: ${req}\nResp:${JSON.stringify(jsonResp)}`;
    if (response.status === 403) throw new Forbidden(`Forbidden\n${details}`);
    if (response.status >= 400 && response.status < 500) throw new ClientError(`${response.statusText}\n${details}`);
    if (response.status >= 500) throw new ServerError(`${response.statusText}\n${details}`);
    throw new Error(`Unexpected error: ${response.statusText}\n${details}`);
  }

  return jsonResp;
}

export async function get(path: string, options?: { token?: string }): Promise<unknown> {
  const headers = new Headers(options?.token ? { 'authorization': `Bearer ${options.token}` } : {});
  return await http(new Request(path, { method: 'get', headers }));
}

export async function post(path: string, body: unknown, options?: { token?: string }): Promise<ActionResponse> {
  const headers = new Headers(options?.token ? { 'authorization': `Bearer ${options.token}` } : {});
  const resp = await http(new Request(path, { method: 'post', body: body === undefined ? undefined : JSON.stringify(body), headers }));
  return decodeOrThrow(actionResponseDecoder)(resp);
}
