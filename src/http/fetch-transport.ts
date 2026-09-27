import { z } from 'zod';
import {
  type ConnectionFailure,
  ManyChatApiError,
  ManyChatConnectionError,
  ManyChatResponseError,
} from '../errors.ts';
import { ErrorBody } from '../schemas/common.ts';
import type { RateLimiter } from './rate-limiter.ts';
import type { ApiRequest, HttpTransport } from './transport.ts';

export interface FetchTransportOptions {
  apiToken: string;
  baseUrl: string;
  timeoutMs: number;
  rateLimiter: RateLimiter;
  fetch: typeof fetch;
}

interface Exchange {
  response: Response;
  text: string;
}

type ParsedBody = { json: true; value: unknown } | { json: false };

const ERROR_TEXT_LIMIT = 200;

export class FetchTransport implements HttpTransport {
  // An ES private field, unlike `private`, is invisible to console.log,
  // util.inspect and JSON.stringify, so logging a client cannot print the key.
  readonly #apiToken: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly rateLimiter: RateLimiter;
  private readonly fetchImpl: typeof fetch;

  constructor(options: FetchTransportOptions) {
    this.#apiToken = options.apiToken;
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs;
    this.rateLimiter = options.rateLimiter;
    this.fetchImpl = options.fetch;
  }

  async send<Data>(request: ApiRequest<Data>): Promise<Data> {
    const { text, response } = await this.exchange(request);
    const body = parseJson(text);

    const failure = body.json ? ErrorBody.safeParse(body.value) : undefined;
    if (!response.ok || failure?.success) {
      throw apiError(request.path, response, failure?.data, text);
    }
    if (!body.json) {
      throw new ManyChatResponseError(request.path, 'the body is not JSON');
    }

    const envelope = z.looseObject({ data: request.data }).safeParse(body.value);
    if (!envelope.success) {
      throw new ManyChatResponseError(request.path, z.prettifyError(envelope.error), {
        cause: envelope.error,
      });
    }
    return envelope.data.data;
  }

  /** Waits for the rate limiter, sends, and reads the body, all under one timeout. */
  private async exchange(request: ApiRequest<unknown>): Promise<Exchange> {
    const timeout = AbortSignal.timeout(this.timeoutMs);
    const caller = request.options?.signal;
    const signal = caller ? AbortSignal.any([timeout, caller]) : timeout;

    try {
      await this.rateLimiter.acquire(signal);
      const response = await this.fetchImpl(this.urlFor(request), {
        method: request.method,
        headers: this.headersFor(request),
        signal,
        ...(request.method === 'POST' ? { body: JSON.stringify(request.params ?? {}) } : {}),
      });
      return { response, text: await response.text() };
    } catch (error) {
      const reason: ConnectionFailure = timeout.aborted
        ? 'timeout'
        : signal.aborted
          ? 'aborted'
          : 'network';
      throw new ManyChatConnectionError(request.path, reason, { cause: error });
    }
  }

  private urlFor(request: ApiRequest<unknown>): string {
    const url = `${this.baseUrl}${request.path}`;
    if (request.method !== 'GET' || request.params === undefined) return url;

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(request.params)) {
      if (value !== undefined) query.set(key, String(value));
    }
    const search = query.toString();
    return search === '' ? url : `${url}?${search}`;
  }

  private headersFor(request: ApiRequest<unknown>): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#apiToken}`,
      Accept: 'application/json',
      ...(request.method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
    };
  }
}

function parseJson(text: string): ParsedBody {
  try {
    return { json: true, value: JSON.parse(text) as unknown };
  } catch {
    return { json: false };
  }
}

function apiError(
  endpoint: string,
  response: Response,
  body: z.infer<typeof ErrorBody> | undefined,
  text: string,
): ManyChatApiError {
  const fallback = text.trim().slice(0, ERROR_TEXT_LIMIT) || response.statusText || 'no message';
  return new ManyChatApiError({
    endpoint,
    status: response.status,
    message: body?.message ?? fallback,
    code: body?.code,
    details: body?.details?.messages?.map(entry => entry.message) ?? [],
  });
}
