import { afterEach, describe, expect, it, vi } from 'vitest';
import { ManyChat } from '../../src/index.ts';
import { TAG } from '../fixtures/responses.ts';
import { FakeFetch, TEST_TOKEN } from '../helpers/fake-fetch.ts';

describe('new ManyChat()', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([[''], ['   '], [undefined]])('refuses an apiToken of %o', apiToken => {
    expect(() => new ManyChat({ apiToken } as unknown as { apiToken: string })).toThrow(TypeError);
  });

  it.each([[0], [-5], [Number.NaN], [Number.POSITIVE_INFINITY]])(
    'refuses a timeoutMs of %o',
    timeoutMs => {
      expect(() => new ManyChat({ apiToken: TEST_TOKEN, timeoutMs })).toThrow(RangeError);
    },
  );

  it('uses the global fetch when none is given', async () => {
    const fake = new FakeFetch().replyJson({ status: 'success', data: [TAG] });
    vi.stubGlobal('fetch', fake.fetch);

    await new ManyChat({ apiToken: TEST_TOKEN }).page.getTags();

    expect(fake.last.url.href).toBe('https://api.manychat.com/fb/page/getTags');
  });

  it('rate limits by default', async () => {
    vi.useFakeTimers();
    try {
      const fake = new FakeFetch();
      for (let reply = 0; reply < 11; reply += 1) fake.replyJson({ status: 'success', data: [] });
      const client = new ManyChat({ apiToken: TEST_TOKEN, fetch: fake.fetch });

      const calls = Array.from({ length: 11 }, () => client.page.getTags());
      await vi.advanceTimersByTimeAsync(0);
      expect(fake.requests).toHaveLength(10);

      await vi.advanceTimersByTimeAsync(100);
      await Promise.all(calls);
      expect(fake.requests).toHaveLength(11);
    } finally {
      vi.useRealTimers();
    }
  });
});
