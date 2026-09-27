export interface RateLimiter {
  /** Resolves when a request may be sent; rejects with the signal's reason if aborted first. */
  acquire(signal?: AbortSignal): Promise<void>;
}

export interface RateLimitOptions {
  /** Sustained requests per second. */
  requestsPerSecond: number;
  /** Requests allowed back to back before the sustained rate applies. Defaults to `requestsPerSecond`. */
  burst?: number;
}

export class TokenBucketRateLimiter implements RateLimiter {
  private readonly capacity: number;
  private readonly refillPerMs: number;
  private tokens: number;
  private refilledAt: number;

  constructor(options: RateLimitOptions) {
    const burst = options.burst ?? options.requestsPerSecond;
    if (!(options.requestsPerSecond > 0) || !Number.isFinite(options.requestsPerSecond)) {
      throw new RangeError('rateLimit.requestsPerSecond must be a positive, finite number');
    }
    if (!(burst >= 1) || !Number.isFinite(burst)) {
      throw new RangeError('rateLimit.burst must be a finite number of at least 1');
    }
    this.capacity = burst;
    this.refillPerMs = options.requestsPerSecond / 1000;
    this.tokens = burst;
    this.refilledAt = Date.now();
  }

  async acquire(signal?: AbortSignal): Promise<void> {
    for (;;) {
      signal?.throwIfAborted();
      this.refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      // Concurrent waiters all wake and re-check; whoever loses sleeps again.
      await delay(Math.ceil((1 - this.tokens) / this.refillPerMs), signal);
    }
  }

  private refill(): void {
    const now = Date.now();
    this.tokens = Math.min(this.capacity, this.tokens + (now - this.refilledAt) * this.refillPerMs);
    this.refilledAt = now;
  }
}

export class UnlimitedRateLimiter implements RateLimiter {
  acquire(signal?: AbortSignal): Promise<void> {
    return signal?.aborted ? Promise.reject(signal.reason as Error) : Promise.resolve();
  }
}

// Not `node:timers/promises`: the SDK runs on any runtime with `fetch`.
function delay(ms: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(signal?.reason as Error);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
