# ADR-0001 — Validate responses, leniently, with Zod

**Status:** accepted · **Date:** 2026-09-27

## Context

Every method in this SDK promises a return type. Without a runtime check that
promise is a cast: TypeScript says `subscriber.first_name` is a `string`, and
ManyChat sends `null`, and the consumer finds out several calls later.

ManyChat's OpenAPI description cannot be taken at its word. It documents
subscriber and page ids as integers while the API returns strings. It marks
every subscriber field as required while real WhatsApp contacts come back with
`null` for most of them. It adds fields (`whatsapp_bsuid`, `whatsapp_username`)
that older responses do not carry.

So there are two ways to get this wrong. Validating strictly against the
published schema would refuse ordinary responses and break consumers in
production over a `null`. Not validating at all would pass that `null` through
under a type that says it cannot happen.

The case against validating is real: it adds a runtime dependency to a package
whose job is a few dozen HTTP calls, and every consumer installs it.

## Decision

Responses are parsed with Zod, and a response is refused only when it lacks
something the return type promises:

- Objects are loose. Fields ManyChat adds later pass through untouched.
- Identifiers that name something outside ManyChat (subscriber, page,
  Instagram, user ref) are accepted as a string or a number and returned as a
  string.
- Every other scalar is `T | null`. Missing and `null` both become `null`, so
  consumers check for one thing, not two.
- Lists default to `[]`.
- Enumerations ManyChat may extend (a custom field's `type`) are `string` in
  responses, and a closed union only where the SDK sends them.

Requests are typed, not validated. ManyChat validates them and says what it
refused, and a second validator here would only drift from ManyChat's.

## Consequences

- A return type is true at runtime. The error for one that is not is
  `ManyChatResponseError` at the call, naming the endpoint and the field.
- `zod` is a runtime dependency. Renovate keeps its range where it is
  (`rangeStrategy: update-lockfile`), so this package never forces a newer
  release onto a consumer who already has one.
- Nearly every field is nullable, which is noisier to consume than the
  published schema suggests. That is the actual API, so the types say so.
- The field list was derived from the OpenAPI description and invented
  fixtures, not from recorded live responses. The first report of a live
  response being refused is a bug in a schema here, and a fixture should be
  added from it, with every value replaced by an invented one.
