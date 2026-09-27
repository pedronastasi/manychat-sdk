# manychat-sdk

[![npm](https://img.shields.io/npm/v/manychat-sdk)](https://www.npmjs.com/package/manychat-sdk)
[![CI](https://github.com/pedronastasi/manychat-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/pedronastasi/manychat-sdk/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/manychat-sdk)](LICENSE)

A typed TypeScript client for the [ManyChat API](https://api.manychat.com/swagger).

> **Unofficial.** This project is not affiliated with, endorsed by or supported
> by ManyChat.

- **Every Page API endpoint**, one method each, named after the endpoint.
- **Responses checked at runtime.** Each return type is guaranteed by a Zod
  schema written for what ManyChat actually sends, not just what its spec says.
- **One error hierarchy** that tells you whether a retry could succeed.
- **Built-in rate limiting, timeouts and cancellation.**
- **One runtime dependency** (`zod`). ESM, with types included.

## Install

```sh
npm install manychat-sdk
```

Requires Node.js 22.12 or later. It is an ES module, and `require()` loads it
on those versions too.

## Quick start

```ts
import { ManyChat } from 'manychat-sdk';

const manychat = new ManyChat({ apiToken: process.env.MANYCHAT_API_TOKEN! });

const subscriber = await manychat.subscriber.getInfo({ subscriber_id: '123456789' });

await manychat.subscriber.addTagByName({ subscriber_id: subscriber.id, tag_name: 'lead' });

await manychat.sending.sendFlow({
  subscriber_id: subscriber.id,
  flow_ns: 'content20260101000000_000000',
});
```

The API key is under **Settings → API** in ManyChat. It grants full access to
that account, so keep it on a server.

## The API

Methods mirror ManyChat's endpoints one to one. The group is the path's
namespace, the method name is the endpoint's, and parameters use ManyChat's own
field names. [ManyChat's reference](https://api.manychat.com/swagger) applies as
written. Each method resolves to the response's `data`, or to `void` for
endpoints that only report success.

| `manychat.page.*`   | `manychat.subscriber.*` | `manychat.sending.*`   |
| ------------------- | ----------------------- | ---------------------- |
| `getInfo`           | `getInfo`               | `sendContent`          |
| `getTags`           | `getInfoByUserRef`      | `sendContentByUserRef` |
| `createTag`         | `findByName`            | `sendFlow`             |
| `removeTag`         | `findByCustomField`     |                        |
| `removeTagByName`   | `findBySystemField`     |                        |
| `getCustomFields`   | `addTag`                |                        |
| `createCustomField` | `addTagByName`          |                        |
| `getBotFields`      | `removeTag`             |                        |
| `createBotField`    | `removeTagByName`       |                        |
| `setBotField`       | `setCustomField`        |                        |
| `setBotFieldByName` | `setCustomFieldByName`  |                        |
| `setBotFields`      | `setCustomFields`       |                        |
| `getFlows`          | `verifyBySignedRequest` |                        |
| `getGrowthTools`    | `createSubscriber`      |                        |
| `getWidgets`        | `updateSubscriber`      |                        |
| `getOtnTopics`      |                         |                        |

`page.*` works on the whole account. `page.setBotField` changes a value every
subscriber sees. For a value that belongs to one contact, use
`subscriber.setCustomField`.

### Sending messages

`sendContent` takes ManyChat's Dynamic Block v2 payload, and it is fully typed:

```ts
await manychat.sending.sendContent({
  subscriber_id: '123456789',
  data: {
    version: 'v2',
    content: {
      type: 'whatsapp',
      messages: [{ type: 'text', text: 'Your booking is confirmed.' }],
    },
  },
});
```

WhatsApp and Messenger accept free-form messages only within 24 hours of the
contact's last message. Outside that window, `sendFlow` a flow that starts
with an approved template.

### What responses look like

Responses keep ManyChat's snake_case field names. Their types follow what the
API returns, not its spec:

- Subscriber, page and Instagram ids are always strings.
- Optional fields are `null` when ManyChat leaves them out, never `undefined`.
- Lists are `[]` when missing.
- Fields ManyChat adds later are kept.

[ADR-0001](docs/adr/0001-lenient-response-validation.md) explains why.

## Errors

Every error extends `ManyChatError`, and every one has `retryable`:

```ts
import { ManyChatApiError, ManyChatConnectionError, ManyChatError } from 'manychat-sdk';

try {
  await manychat.sending.sendFlow({ subscriber_id, flow_ns });
} catch (error) {
  if (error instanceof ManyChatApiError) {
    console.error(error.status, error.code, error.message, error.details);
  } else if (error instanceof ManyChatConnectionError) {
    console.error(error.reason); // 'timeout' | 'aborted' | 'network'
  }
  if (error instanceof ManyChatError && error.retryable) {
    // A retry could succeed.
  }
}
```

| Error                     | When                                                                  |
| ------------------------- | --------------------------------------------------------------------- |
| `ManyChatApiError`        | ManyChat returned an error, including the ones it sends with HTTP 200 |
| `ManyChatResponseError`   | ManyChat reported success, but the body is not the promised type      |
| `ManyChatConnectionError` | No answer: the request timed out, was aborted, or never connected     |

**The SDK never retries.** `retryable` says a retry could succeed, not that one
is safe: a `sendFlow` that timed out may already have reached the contact, and
retrying it can deliver it twice.
[ADR-0004](docs/adr/0004-no-automatic-retries.md) explains the reasoning.

## Options

```ts
new ManyChat({
  apiToken: '…',
  baseUrl: 'https://api.manychat.com', // default
  timeoutMs: 10_000, // default; covers the rate-limit wait too
  rateLimit: { requestsPerSecond: 10, burst: 10 }, // default; `false` disables
  fetch: customFetch, // default: globalThis.fetch
});
```

The rate limit applies per client instance, so share one instance across your
process. Every method also takes `{ signal }` as its last argument:

```ts
await manychat.page.getTags({ signal: AbortSignal.timeout(2_000) });
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Design decisions are recorded in
[`docs/adr/`](docs/adr/).

## License

[MIT](LICENSE)
