import { PageApi } from './api/page.ts';
import { SendingApi } from './api/sending.ts';
import { SubscriberApi } from './api/subscriber.ts';
import { FetchTransport } from './http/fetch-transport.ts';
import {
  type RateLimiter,
  type RateLimitOptions,
  TokenBucketRateLimiter,
  UnlimitedRateLimiter,
} from './http/rate-limiter.ts';

export interface ManyChatOptions {
  /** The account's API key, from Settings → API in ManyChat. */
  apiToken: string;
  /** Defaults to `https://api.manychat.com`. */
  baseUrl?: string;
  /** Bounds each call, including any wait for the rate limiter. Defaults to 10 seconds. */
  timeoutMs?: number;
  /**
   * A client-side limit applied before every request, or `false` to send
   * without one. Defaults to 10 per second, well under ManyChat's documented
   * ceiling, and applies per client instance.
   */
  rateLimit?: RateLimitOptions | false;
  /** A `fetch` to use in place of the global one. */
  fetch?: typeof fetch;
}

const DEFAULT_BASE_URL = 'https://api.manychat.com';
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RATE_LIMIT: RateLimitOptions = { requestsPerSecond: 10 };

export class ManyChat {
  readonly page: PageApi;
  readonly subscriber: SubscriberApi;
  readonly sending: SendingApi;

  constructor(options: ManyChatOptions) {
    if (typeof options.apiToken !== 'string' || options.apiToken.trim() === '') {
      throw new TypeError('ManyChat: apiToken must be a non-empty string');
    }
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    if (!(timeoutMs > 0) || !Number.isFinite(timeoutMs)) {
      throw new RangeError('ManyChat: timeoutMs must be a positive, finite number');
    }

    const transport = new FetchTransport({
      apiToken: options.apiToken,
      baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
      timeoutMs,
      rateLimiter: rateLimiterFor(options.rateLimit ?? DEFAULT_RATE_LIMIT),
      // Bound, because native fetch rejects being called with another `this`.
      fetch: options.fetch ?? globalThis.fetch.bind(globalThis),
    });
    this.page = new PageApi(transport);
    this.subscriber = new SubscriberApi(transport);
    this.sending = new SendingApi(transport);
  }
}

function rateLimiterFor(rateLimit: RateLimitOptions | false): RateLimiter {
  return rateLimit === false ? new UnlimitedRateLimiter() : new TokenBucketRateLimiter(rateLimit);
}
