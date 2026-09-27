import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenBucketRateLimiter, UnlimitedRateLimiter } from '../../src/http/rate-limiter.ts';

describe('TokenBucketRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('lets a burst through at once, then paces to the sustained rate', async () => {
    const limiter = new TokenBucketRateLimiter({ requestsPerSecond: 10, burst: 3 });
    const acquiredAt: number[] = [];
    const start = Date.now();

    const acquisitions = Array.from({ length: 5 }, () =>
      limiter.acquire().then(() => acquiredAt.push(Date.now() - start)),
    );
    await vi.runAllTimersAsync();
    await Promise.all(acquisitions);

    expect(acquiredAt.slice(0, 3)).toEqual([0, 0, 0]);
    expect(acquiredAt[3]).toBe(100);
    expect(acquiredAt[4]).toBe(200);
  });

  it('refills while idle, up to the burst size and no further', async () => {
    const limiter = new TokenBucketRateLimiter({ requestsPerSecond: 10, burst: 2 });
    await limiter.acquire();
    await limiter.acquire();

    await vi.advanceTimersByTimeAsync(10_000);
    const acquiredAt: number[] = [];
    const start = Date.now();
    const acquisitions = Array.from({ length: 3 }, () =>
      limiter.acquire().then(() => acquiredAt.push(Date.now() - start)),
    );
    await vi.runAllTimersAsync();
    await Promise.all(acquisitions);

    expect(acquiredAt).toEqual([0, 0, 100]);
  });

  it('defaults the burst to the sustained rate', async () => {
    const limiter = new TokenBucketRateLimiter({ requestsPerSecond: 4 });
    let acquired = 0;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      void limiter.acquire().then(() => (acquired += 1));
    }
    await vi.advanceTimersByTimeAsync(0);

    expect(acquired).toBe(4);
  });

  it('stops waiting when the signal aborts', async () => {
    const limiter = new TokenBucketRateLimiter({ requestsPerSecond: 1, burst: 1 });
    await limiter.acquire();
    const controller = new AbortController();

    const waiting = limiter.acquire(controller.signal);
    controller.abort(new Error('caller gave up'));

    await expect(waiting).rejects.toThrow('caller gave up');
  });

  it('refuses a signal that is already aborted', async () => {
    const limiter = new TokenBucketRateLimiter({ requestsPerSecond: 1 });

    await expect(limiter.acquire(AbortSignal.abort())).rejects.toThrow();
  });

  it.each([
    [{ requestsPerSecond: 0 }],
    [{ requestsPerSecond: -1 }],
    [{ requestsPerSecond: Number.NaN }],
    [{ requestsPerSecond: Number.POSITIVE_INFINITY }],
    [{ requestsPerSecond: 5, burst: 0.5 }],
    [{ requestsPerSecond: 5, burst: Number.POSITIVE_INFINITY }],
  ])('rejects %o', options => {
    expect(() => new TokenBucketRateLimiter(options)).toThrow(RangeError);
  });
});

describe('UnlimitedRateLimiter', () => {
  it('never waits, but still honours an aborted signal', async () => {
    const limiter = new UnlimitedRateLimiter();

    await expect(limiter.acquire()).resolves.toBeUndefined();
    await expect(limiter.acquire(AbortSignal.abort())).rejects.toThrow();
  });
});
