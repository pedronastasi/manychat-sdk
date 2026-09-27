import { describe, expect, it } from 'vitest';
import { SUBSCRIBER } from '../fixtures/responses.ts';
import { clientFor, FakeFetch } from '../helpers/fake-fetch.ts';

// ADR-0001: lenient where ManyChat is inconsistent, strict about the promised type.
describe('a subscriber response', () => {
  it('turns numeric ids into strings', async () => {
    const fake = new FakeFetch().replySuccess({
      ...SUBSCRIBER,
      id: 900000001,
      page_id: 100000000000001,
      ig_id: 17800000000000,
      user_refs: [{ user_ref: 123, opted_in: '2026-01-01T10:00:00+00:00' }],
    });

    const subscriber = await clientFor(fake).subscriber.getInfo({ subscriber_id: 900000001 });

    expect(subscriber).toMatchObject({
      id: '900000001',
      page_id: '100000000000001',
      ig_id: '17800000000000',
      user_refs: [{ user_ref: '123' }],
    });
  });

  it('reads a missing optional field as null and a missing list as empty', async () => {
    const { whatsapp_bsuid, custom_fields, ...older } = SUBSCRIBER;
    const fake = new FakeFetch().replySuccess({ ...older, tags: null });

    const subscriber = await clientFor(fake).subscriber.getInfo({ subscriber_id: SUBSCRIBER.id });

    expect(subscriber.whatsapp_bsuid).toBeNull();
    expect(subscriber.custom_fields).toEqual([]);
    expect(subscriber.tags).toEqual([]);
  });

  it('is refused without an id', async () => {
    const { id, ...anonymous } = SUBSCRIBER;
    const fake = new FakeFetch().replySuccess(anonymous);

    await expect(
      clientFor(fake).subscriber.getInfo({ subscriber_id: SUBSCRIBER.id }),
    ).rejects.toMatchObject({ name: 'ManyChatResponseError' });
  });

  it('keeps an unset custom field value as null', async () => {
    const fake = new FakeFetch().replySuccess({
      ...SUBSCRIBER,
      custom_fields: [{ id: 21, name: 'demo_shift', type: 'text', description: '', value: null }],
    });

    const subscriber = await clientFor(fake).subscriber.getInfo({ subscriber_id: SUBSCRIBER.id });

    expect(subscriber.custom_fields[0]?.value).toBeNull();
  });
});
