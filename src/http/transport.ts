import type { z } from 'zod';

export interface RequestOptions {
  /** Cancels the request, including any wait for the rate limiter. */
  signal?: AbortSignal;
}

export interface ApiRequest<Data> {
  readonly method: 'GET' | 'POST';
  /** Path under the API root, such as `/fb/page/getTags`. */
  readonly path: string;
  /** The query string of a GET, or the JSON body of a POST. */
  readonly params?: object | undefined;
  /** Schema for the envelope's `data`; what it outputs is what `send` resolves to. */
  readonly data: z.ZodType<Data>;
  readonly options?: RequestOptions | undefined;
}

export interface HttpTransport {
  send<Data>(request: ApiRequest<Data>): Promise<Data>;
}
