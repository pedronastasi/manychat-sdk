# ADR-0004 — Classify failures; never retry them

**Status:** accepted · **Date:** 2026-09-27

## Context

Most HTTP SDKs retry 429s, 5xx responses and timeouts with backoff by default.
For read endpoints that is harmless. For ManyChat's write endpoints it is not.
`sendFlow` and `sendContent` deliver messages to a person. A request that timed
out may already have been delivered, and ManyChat offers no idempotency key, so
a retry can put the same message on someone's phone twice.

Whether a duplicate is acceptable depends on the caller. A marketing broadcast
may accept one. A conversational reply arriving minutes late, after the
conversation has moved on, is worse than a missing one. The SDK cannot know
which case it is in.

## Decision

The SDK makes one attempt per call. Every error it throws extends
`ManyChatError` and carries `retryable`:

| Error                     | `retryable`                                               |
| ------------------------- | --------------------------------------------------------- |
| `ManyChatApiError`        | `true` for 429 and 5xx; `false` otherwise                 |
| `ManyChatConnectionError` | `true` for `timeout` and `network`; `false` for `aborted` |
| `ManyChatResponseError`   | `false`                                                   |

`retryable` means repeating the request could succeed. It does not mean
repeating it is safe, and the property's documentation says so.

## Consequences

- A call does exactly one thing, in bounded time: the timeout covers the rate
  limiter wait and the request together.
- Callers write their own retry loop, and the error tells them whether one is
  worth attempting.
- A caller who wants retries for reads only has to write that distinction
  themselves. If that turns out to be what most users write, an opt-in
  `retry` option limited to GET endpoints is the likely next step, recorded
  in an ADR that supersedes this one.
