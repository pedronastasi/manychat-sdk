import { describe, expect, it } from 'vitest';
import type { Content, ManyChat } from '../../src/index.ts';
import {
  BOT_FIELD,
  CUSTOM_FIELD,
  FLOWS,
  GROWTH_TOOL,
  OTN_TOPIC,
  PAGE,
  SUBSCRIBER,
  TAG,
} from '../fixtures/responses.ts';
import { clientFor, FakeFetch } from '../helpers/fake-fetch.ts';

interface Endpoint {
  call: (client: ManyChat) => Promise<unknown>;
  method: 'GET' | 'POST';
  path: string;
  /** Query string of a GET, or JSON body of a POST. */
  sent: Record<string, unknown>;
  replyData?: unknown;
  result?: unknown;
}

const SUBSCRIBER_RESULT = expect.objectContaining({ id: SUBSCRIBER.id, first_name: 'Ada' });
const CONTENT: Content = {
  version: 'v2',
  content: { type: 'whatsapp', messages: [{ type: 'text', text: 'Hello from a test' }] },
};

// ADR-0002: one method per endpoint, named after it, taking its wire params.
const ENDPOINTS: Record<string, Endpoint> = {
  'page.getInfo': {
    call: client => client.page.getInfo(),
    method: 'GET',
    path: '/fb/page/getInfo',
    sent: {},
    replyData: PAGE,
    result: { ...PAGE, id: String(PAGE.id) },
  },
  'page.createTag': {
    call: client => client.page.createTag({ name: TAG.name }),
    method: 'POST',
    path: '/fb/page/createTag',
    sent: { name: TAG.name },
    replyData: { tag: TAG },
    result: TAG,
  },
  'page.getTags': {
    call: client => client.page.getTags(),
    method: 'GET',
    path: '/fb/page/getTags',
    sent: {},
    replyData: [TAG],
    result: [TAG],
  },
  'page.removeTag': {
    call: client => client.page.removeTag({ tag_id: TAG.id }),
    method: 'POST',
    path: '/fb/page/removeTag',
    sent: { tag_id: TAG.id },
  },
  'page.removeTagByName': {
    call: client => client.page.removeTagByName({ tag_name: TAG.name }),
    method: 'POST',
    path: '/fb/page/removeTagByName',
    sent: { tag_name: TAG.name },
  },
  'page.getWidgets': {
    call: client => client.page.getWidgets(),
    method: 'GET',
    path: '/fb/page/getWidgets',
    sent: {},
    replyData: [GROWTH_TOOL],
    result: [GROWTH_TOOL],
  },
  'page.getGrowthTools': {
    call: client => client.page.getGrowthTools(),
    method: 'GET',
    path: '/fb/page/getGrowthTools',
    sent: {},
    replyData: [GROWTH_TOOL],
    result: [GROWTH_TOOL],
  },
  'page.getFlows': {
    call: client => client.page.getFlows(),
    method: 'GET',
    path: '/fb/page/getFlows',
    sent: {},
    replyData: FLOWS,
    result: FLOWS,
  },
  'page.createCustomField': {
    call: client =>
      client.page.createCustomField({ caption: CUSTOM_FIELD.name, type: 'text', description: 'x' }),
    method: 'POST',
    path: '/fb/page/createCustomField',
    sent: { caption: CUSTOM_FIELD.name, type: 'text', description: 'x' },
    replyData: { field: CUSTOM_FIELD },
    result: CUSTOM_FIELD,
  },
  'page.getCustomFields': {
    call: client => client.page.getCustomFields(),
    method: 'GET',
    path: '/fb/page/getCustomFields',
    sent: {},
    replyData: [CUSTOM_FIELD],
    result: [CUSTOM_FIELD],
  },
  'page.getOtnTopics': {
    call: client => client.page.getOtnTopics(),
    method: 'GET',
    path: '/fb/page/getOtnTopics',
    sent: {},
    replyData: [OTN_TOPIC],
    result: [OTN_TOPIC],
  },
  'page.getBotFields': {
    call: client => client.page.getBotFields(),
    method: 'GET',
    path: '/fb/page/getBotFields',
    sent: {},
    replyData: [BOT_FIELD],
    result: [BOT_FIELD],
  },
  'page.createBotField': {
    call: client => client.page.createBotField({ name: BOT_FIELD.name, type: 'number', value: 4 }),
    method: 'POST',
    path: '/fb/page/createBotField',
    sent: { name: BOT_FIELD.name, type: 'number', value: 4 },
    replyData: { field: BOT_FIELD },
    result: BOT_FIELD,
  },
  'page.setBotField': {
    call: client => client.page.setBotField({ field_id: BOT_FIELD.id, field_value: 3 }),
    method: 'POST',
    path: '/fb/page/setBotField',
    sent: { field_id: BOT_FIELD.id, field_value: 3 },
  },
  'page.setBotFieldByName': {
    call: client => client.page.setBotFieldByName({ field_name: BOT_FIELD.name, field_value: 3 }),
    method: 'POST',
    path: '/fb/page/setBotFieldByName',
    sent: { field_name: BOT_FIELD.name, field_value: 3 },
  },
  'page.setBotFields': {
    call: client =>
      client.page.setBotFields({
        fields: [
          { field_id: BOT_FIELD.id, field_value: 3 },
          { field_name: 'demo_flag', field_value: true },
        ],
      }),
    method: 'POST',
    path: '/fb/page/setBotFields',
    sent: {
      fields: [
        { field_id: BOT_FIELD.id, field_value: 3 },
        { field_name: 'demo_flag', field_value: true },
      ],
    },
  },

  'subscriber.getInfo': {
    call: client => client.subscriber.getInfo({ subscriber_id: SUBSCRIBER.id }),
    method: 'GET',
    path: '/fb/subscriber/getInfo',
    sent: { subscriber_id: SUBSCRIBER.id },
    replyData: SUBSCRIBER,
    result: SUBSCRIBER_RESULT,
  },
  'subscriber.findByName': {
    call: client => client.subscriber.findByName({ name: 'Ada' }),
    method: 'GET',
    path: '/fb/subscriber/findByName',
    sent: { name: 'Ada' },
    replyData: [SUBSCRIBER],
    result: [SUBSCRIBER_RESULT],
  },
  'subscriber.getInfoByUserRef': {
    call: client => client.subscriber.getInfoByUserRef({ user_ref: '-1000000000000000001' }),
    method: 'GET',
    path: '/fb/subscriber/getInfoByUserRef',
    sent: { user_ref: '-1000000000000000001' },
    replyData: SUBSCRIBER,
    result: SUBSCRIBER_RESULT,
  },
  'subscriber.findByCustomField': {
    call: client => client.subscriber.findByCustomField({ field_id: 21, field_value: 'evening' }),
    method: 'GET',
    path: '/fb/subscriber/findByCustomField',
    sent: { field_id: '21', field_value: 'evening' },
    replyData: [SUBSCRIBER],
    result: [SUBSCRIBER_RESULT],
  },
  'subscriber.findBySystemField': {
    call: client => client.subscriber.findBySystemField({ email: 'ada@example.com' }),
    method: 'GET',
    path: '/fb/subscriber/findBySystemField',
    sent: { email: 'ada@example.com' },
    replyData: SUBSCRIBER,
    result: SUBSCRIBER_RESULT,
  },
  'subscriber.addTag': {
    call: client => client.subscriber.addTag({ subscriber_id: SUBSCRIBER.id, tag_id: TAG.id }),
    method: 'POST',
    path: '/fb/subscriber/addTag',
    sent: { subscriber_id: SUBSCRIBER.id, tag_id: TAG.id },
  },
  'subscriber.addTagByName': {
    call: client =>
      client.subscriber.addTagByName({ subscriber_id: SUBSCRIBER.id, tag_name: TAG.name }),
    method: 'POST',
    path: '/fb/subscriber/addTagByName',
    sent: { subscriber_id: SUBSCRIBER.id, tag_name: TAG.name },
  },
  'subscriber.removeTag': {
    call: client => client.subscriber.removeTag({ subscriber_id: SUBSCRIBER.id, tag_id: TAG.id }),
    method: 'POST',
    path: '/fb/subscriber/removeTag',
    sent: { subscriber_id: SUBSCRIBER.id, tag_id: TAG.id },
  },
  'subscriber.removeTagByName': {
    call: client =>
      client.subscriber.removeTagByName({ subscriber_id: SUBSCRIBER.id, tag_name: TAG.name }),
    method: 'POST',
    path: '/fb/subscriber/removeTagByName',
    sent: { subscriber_id: SUBSCRIBER.id, tag_name: TAG.name },
  },
  'subscriber.setCustomField': {
    call: client =>
      client.subscriber.setCustomField({
        subscriber_id: SUBSCRIBER.id,
        field_id: 21,
        field_value: 'morning',
      }),
    method: 'POST',
    path: '/fb/subscriber/setCustomField',
    sent: { subscriber_id: SUBSCRIBER.id, field_id: 21, field_value: 'morning' },
  },
  'subscriber.setCustomFields': {
    call: client =>
      client.subscriber.setCustomFields({
        subscriber_id: SUBSCRIBER.id,
        fields: [{ field_name: 'demo_shift', field_value: 'morning' }],
      }),
    method: 'POST',
    path: '/fb/subscriber/setCustomFields',
    sent: {
      subscriber_id: SUBSCRIBER.id,
      fields: [{ field_name: 'demo_shift', field_value: 'morning' }],
    },
  },
  'subscriber.setCustomFieldByName': {
    call: client =>
      client.subscriber.setCustomFieldByName({
        subscriber_id: SUBSCRIBER.id,
        field_name: 'demo_shift',
        field_value: 'morning',
      }),
    method: 'POST',
    path: '/fb/subscriber/setCustomFieldByName',
    sent: { subscriber_id: SUBSCRIBER.id, field_name: 'demo_shift', field_value: 'morning' },
  },
  'subscriber.verifyBySignedRequest': {
    call: client =>
      client.subscriber.verifyBySignedRequest({
        subscriber_id: SUBSCRIBER.id,
        signed_request: 'invented.signature',
      }),
    method: 'POST',
    path: '/fb/subscriber/verifyBySignedRequest',
    sent: { subscriber_id: SUBSCRIBER.id, signed_request: 'invented.signature' },
  },
  'subscriber.createSubscriber': {
    call: client =>
      client.subscriber.createSubscriber({
        first_name: 'Ada',
        whatsapp_phone: '+10000000000',
        has_opt_in_sms: true,
        consent_phrase: 'Invented consent phrase',
      }),
    method: 'POST',
    path: '/fb/subscriber/createSubscriber',
    sent: {
      first_name: 'Ada',
      whatsapp_phone: '+10000000000',
      has_opt_in_sms: true,
      consent_phrase: 'Invented consent phrase',
    },
    replyData: SUBSCRIBER,
    result: SUBSCRIBER_RESULT,
  },
  'subscriber.updateSubscriber': {
    call: client =>
      client.subscriber.updateSubscriber({ subscriber_id: SUBSCRIBER.id, last_name: 'Example' }),
    method: 'POST',
    path: '/fb/subscriber/updateSubscriber',
    sent: { subscriber_id: SUBSCRIBER.id, last_name: 'Example' },
    replyData: SUBSCRIBER,
    result: SUBSCRIBER_RESULT,
  },

  'sending.sendContent': {
    call: client => client.sending.sendContent({ subscriber_id: SUBSCRIBER.id, data: CONTENT }),
    method: 'POST',
    path: '/fb/sending/sendContent',
    sent: { subscriber_id: SUBSCRIBER.id, data: CONTENT },
  },
  'sending.sendContentByUserRef': {
    call: client =>
      client.sending.sendContentByUserRef({ user_ref: '-1000000000000000001', data: CONTENT }),
    method: 'POST',
    path: '/fb/sending/sendContentByUserRef',
    sent: { user_ref: '-1000000000000000001', data: CONTENT },
  },
  'sending.sendFlow': {
    call: client =>
      client.sending.sendFlow({
        subscriber_id: SUBSCRIBER.id,
        flow_ns: 'content00000000000000_000001',
      }),
    method: 'POST',
    path: '/fb/sending/sendFlow',
    sent: { subscriber_id: SUBSCRIBER.id, flow_ns: 'content00000000000000_000001' },
  },
};

describe('every endpoint in the ManyChat Page API', () => {
  it('is covered by this table', () => {
    // 34 operations in https://api.manychat.com/swagger (Page API), as of 2026-09-27.
    expect(Object.keys(ENDPOINTS)).toHaveLength(34);
  });

  it.each(Object.entries(ENDPOINTS))('%s sends the documented request', async (_name, endpoint) => {
    const fake = new FakeFetch().replySuccess(endpoint.replyData);

    await endpoint.call(clientFor(fake));

    expect(fake.last.method).toBe(endpoint.method);
    expect(fake.last.url.origin + fake.last.url.pathname).toBe(
      `https://api.manychat.com${endpoint.path}`,
    );
    if (endpoint.method === 'GET') {
      expect(Object.fromEntries(fake.last.url.searchParams)).toEqual(
        Object.fromEntries(
          Object.entries(endpoint.sent).map(([key, value]) => [key, String(value)]),
        ),
      );
      expect(fake.last.body).toBeUndefined();
    } else {
      expect(fake.last.body).toEqual(endpoint.sent);
    }
  });

  it.each(Object.entries(ENDPOINTS))(
    '%s resolves to its unwrapped data',
    async (_name, endpoint) => {
      const fake = new FakeFetch().replySuccess(endpoint.replyData);

      await expect(endpoint.call(clientFor(fake))).resolves.toEqual(endpoint.result);
    },
  );
});

describe('subscriber.findBySystemField', () => {
  it('resolves to null when ManyChat finds nobody', async () => {
    const fake = new FakeFetch().replyJson({ status: 'success', data: null });

    await expect(
      clientFor(fake).subscriber.findBySystemField({ phone: '+10000000009' }),
    ).resolves.toBeNull();
  });
});
