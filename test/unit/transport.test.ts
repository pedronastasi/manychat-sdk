import { inspect } from 'node:util';
import { describe, expect, it } from 'vitest';
import {
  ManyChatApiError,
  ManyChatConnectionError,
  ManyChatError,
  ManyChatResponseError,
} from '../../src/index.ts';
import { PAGE, TAG } from '../fixtures/responses.ts';
import { clientFor, FakeFetch, TEST_TOKEN } from '../helpers/fake-fetch.ts';

describe('requests', () => {
  it('authenticate with the API key as a bearer token', async () => {
    const fake = new FakeFetch().replySuccess([TAG]);

    await clientFor(fake).page.getTags();

    expect(fake.last.headers.get('authorization')).toBe(`Bearer ${TEST_TOKEN}`);
    expect(fake.last.headers.get('accept')).toBe('application/json');
    expect(fake.last.headers.get('content-type')).toBeNull();
  });

  it('send a POST body as JSON', async () => {
    const fake = new FakeFetch().replySuccess();

    await clientFor(fake).page.removeTag({ tag_id: TAG.id });

    expect(fake.last.headers.get('content-type')).toBe('application/json');
  });

  it('go to a custom base URL, with trailing slashes removed', async () => {
    const fake = new FakeFetch().replySuccess([TAG]);

    await clientFor(fake, { baseUrl: 'https://proxy.example.com/manychat//' }).page.getTags();

    expect(fake.last.url.href).toBe('https://proxy.example.com/manychat/fb/page/getTags');
  });

  it('leave undefined params out of the query string', async () => {
    const fake = new FakeFetch().replySuccess(null);
    const params = { email: 'ada@example.com', phone: undefined } as unknown as { email: string };

    await clientFor(fake).subscriber.findBySystemField(params);

    expect(fake.last.url.search).toBe('?email=ada%40example.com');
  });
});

describe('ManyChat errors', () => {
  it('become a ManyChatApiError carrying the message, code and details', async () => {
    const fake = new FakeFetch().replyJson(
      {
        status: 'error',
        message: 'Validation error',
        code: 2011,
        details: { messages: [{ message: 'tag_name is required' }] },
      },
      400,
    );

    const error = await clientFor(fake)
      .subscriber.addTagByName({ subscriber_id: '1', tag_name: '' })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ManyChatApiError);
    expect(error).toBeInstanceOf(ManyChatError);
    expect(error).toMatchObject({
      name: 'ManyChatApiError',
      endpoint: '/fb/subscriber/addTagByName',
      status: 400,
      code: 2011,
      details: ['tag_name is required'],
      retryable: false,
    });
    expect((error as Error).message).toBe(
      'ManyChat /fb/subscriber/addTagByName failed with 400: Validation error',
    );
  });

  it('are recognised when ManyChat reports one with a 200', async () => {
    const fake = new FakeFetch().replyJson({ status: 'error', message: 'Subscriber not found' });

    await expect(clientFor(fake).subscriber.getInfo({ subscriber_id: '1' })).rejects.toMatchObject({
      name: 'ManyChatApiError',
      status: 200,
      message: expect.stringContaining('Subscriber not found'),
    });
  });

  it.each([
    [429, true],
    [500, true],
    [503, true],
    [400, false],
    [401, false],
    [404, false],
  ])('with status %i are retryable: %s', async (status, retryable) => {
    const fake = new FakeFetch().replyJson({ status: 'error', message: 'x' }, status);

    await expect(clientFor(fake).page.getTags()).rejects.toMatchObject({ status, retryable });
  });

  it('fall back to the raw body when it is not ManyChat JSON', async () => {
    const fake = new FakeFetch().replyText('<html>Bad gateway</html>', 502, 'Bad Gateway');

    await expect(clientFor(fake).page.getTags()).rejects.toMatchObject({
      name: 'ManyChatApiError',
      status: 502,
      message: 'ManyChat /fb/page/getTags failed with 502: <html>Bad gateway</html>',
      details: [],
    });
  });

  it('fall back to the status text when the body is empty', async () => {
    const fake = new FakeFetch().replyText('', 503, 'Service Unavailable');

    await expect(clientFor(fake).page.getTags()).rejects.toThrow(
      'failed with 503: Service Unavailable',
    );
  });

  it('keep what they can when details are malformed', async () => {
    const fake = new FakeFetch().replyJson(
      { status: 'error', message: 'Odd', details: { messages: 'not a list' } },
      400,
    );

    await expect(clientFor(fake).page.getTags()).rejects.toMatchObject({
      message: expect.stringContaining('Odd'),
      details: [],
    });
  });
});

describe('unexpected success responses', () => {
  it('reject a body that is not JSON', async () => {
    const fake = new FakeFetch().replyText('OK');

    await expect(clientFor(fake).page.getTags()).rejects.toThrow(
      new ManyChatResponseError('/fb/page/getTags', 'the body is not JSON'),
    );
  });

  // ADR-0001: refused only when the promised type cannot be produced.
  it('reject a body missing what the return type promises', async () => {
    const fake = new FakeFetch().replySuccess({ ...PAGE, name: undefined });

    const error = await clientFor(fake)
      .page.getInfo()
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ManyChatResponseError);
    expect(error).toMatchObject({ endpoint: '/fb/page/getInfo', retryable: false });
    expect((error as Error).message).toContain('name');
  });

  it('accept fields ManyChat adds later, and keep them', async () => {
    const fake = new FakeFetch().replySuccess([{ ...TAG, color: 'blue' }]);

    await expect(clientFor(fake).page.getTags()).resolves.toEqual([{ ...TAG, color: 'blue' }]);
  });
});

describe('connection failures', () => {
  it('report a timeout, which is retryable', async () => {
    const fake = new FakeFetch().hang();

    await expect(clientFor(fake, { timeoutMs: 20 }).page.getTags()).rejects.toMatchObject({
      name: 'ManyChatConnectionError',
      reason: 'timeout',
      retryable: true,
    });
  });

  it("report the caller's abort, which is not retryable", async () => {
    const fake = new FakeFetch().hang();
    const controller = new AbortController();

    const pending = clientFor(fake).page.getTags({ signal: controller.signal });
    controller.abort();

    await expect(pending).rejects.toMatchObject({ reason: 'aborted', retryable: false });
  });

  it('report a network failure, keeping the cause', async () => {
    const cause = new TypeError('fetch failed');
    const fake = new FakeFetch().failWith(cause);

    const error = await clientFor(fake)
      .page.getTags()
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ManyChatConnectionError);
    expect(error).toMatchObject({ reason: 'network', retryable: true, cause });
  });

  it('include a wait for the rate limiter in the timeout', async () => {
    const fake = new FakeFetch().replySuccess([TAG]).replySuccess([TAG]);
    const client = clientFor(fake, {
      timeoutMs: 20,
      rateLimit: { requestsPerSecond: 1, burst: 1 },
    });

    await client.page.getTags();
    await expect(client.page.getTags()).rejects.toMatchObject({ reason: 'timeout' });
    expect(fake.requests).toHaveLength(1);
  });
});

describe('the API key', () => {
  it('never appears in an error or in the printed client', async () => {
    const fake = new FakeFetch()
      .replyJson({ status: 'error', message: 'x' }, 401)
      .replySuccess({ nope: true });
    const client = clientFor(fake);

    const apiError = await client.page.getTags().catch((caught: unknown) => caught);
    const responseError = await client.page.getInfo().catch((caught: unknown) => caught);

    for (const printed of [
      inspect(client, { depth: Infinity }),
      JSON.stringify(client),
      inspect(apiError, { depth: Infinity }),
      inspect(responseError, { depth: Infinity }),
    ]) {
      expect(printed).not.toContain(TEST_TOKEN);
    }
  });
});
