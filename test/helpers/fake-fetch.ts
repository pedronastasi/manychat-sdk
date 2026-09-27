import { ManyChat, type ManyChatOptions } from '../../src/index.ts';

export interface RecordedRequest {
  url: URL;
  method: string;
  headers: Headers;
  body: unknown;
}

type Reply = (request: RecordedRequest, signal: AbortSignal | undefined) => Promise<Response>;

/**
 * Stands in for `fetch` at the HTTP boundary. Like the real one, a pending
 * request rejects with the signal's reason when it is aborted.
 */
export class FakeFetch {
  readonly requests: RecordedRequest[] = [];
  private readonly replies: Reply[] = [];

  readonly fetch: typeof fetch = async (input, init) => {
    const request: RecordedRequest = {
      url: new URL(input instanceof Request ? input.url : String(input)),
      method: init?.method ?? 'GET',
      headers: new Headers(init?.headers),
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
    };
    this.requests.push(request);
    init?.signal?.throwIfAborted();
    const reply = this.replies.shift();
    if (!reply) throw new Error(`FakeFetch: no reply queued for ${request.url.pathname}`);
    return reply(request, init?.signal ?? undefined);
  };

  replyJson(body: unknown, status = 200): this {
    return this.replyText(JSON.stringify(body), status);
  }

  replySuccess(data?: unknown): this {
    return this.replyJson(data === undefined ? { status: 'success' } : { status: 'success', data });
  }

  replyText(text: string, status = 200, statusText = ''): this {
    this.replies.push(async () => new Response(text, { status, statusText }));
    return this;
  }

  /** Never answers; settles only when the request's signal aborts. */
  hang(): this {
    this.replies.push(
      (_request, signal) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(signal.reason as Error), { once: true });
        }),
    );
    return this;
  }

  failWith(error: Error): this {
    this.replies.push(async () => {
      throw error;
    });
    return this;
  }

  get last(): RecordedRequest {
    const request = this.requests.at(-1);
    if (!request) throw new Error('FakeFetch: no request was made');
    return request;
  }
}

export const TEST_TOKEN = 'test-token-0000000000';

export function clientFor(fake: FakeFetch, options: Partial<ManyChatOptions> = {}): ManyChat {
  return new ManyChat({ apiToken: TEST_TOKEN, fetch: fake.fetch, rateLimit: false, ...options });
}
