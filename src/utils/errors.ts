
export function logError(err: unknown): void {
  // eslint-disable-next-line no-console
  console.error(errorToString(err));
}

export function errorToString(err: unknown): string {
  if (err instanceof Error || err instanceof Forbidden || err instanceof ServerError || err instanceof DecodingError) {
    return `${err.name}: ${err.message}`;
  }
  return `An unexpected error occured (${JSON.stringify(err)})`;
}

export class DecodingError implements Error {
  name = 'DecodingError';
  constructor(public message: string) {}
}

export class Forbidden implements Error {
  name = 'Forbidden';
  constructor(public message: string) {}
}

export class ClientError implements Error {
  name = 'ClientError';
  constructor(public message: string) {}
}

export class ServerError implements Error {
  name = 'ServerError';
  constructor(public message: string) {}
}
