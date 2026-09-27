# ADR-0002 — Mirror ManyChat's API, one method per endpoint

**Status:** accepted · **Date:** 2026-09-27

## Context

An SDK can present the API it wraps as-is, or redesign it. The redesign is
tempting here. `addTag` and `addTagByName` could be one method that takes
`{ id } | { name }`. `getTags` could be `tags.list()`. Snake case could become
camel case.

Each of those renames is defensible on its own. Together they make a second API
that has to be documented separately from ManyChat's. Every answer a user finds
in ManyChat's reference, in its community or in a support ticket then has to be
translated before it applies. The SDK would also own a mapping layer, and
getting a mapping wrong means sending the wrong field name.

## Decision

- The client groups methods by ManyChat's own namespaces, not by nouns of our
  choosing: `page` (`/fb/page/*`), `subscriber` (`/fb/subscriber/*`) and
  `sending` (`/fb/sending/*`).
- Each endpoint is one method with the endpoint's name.
- Each method takes the endpoint's parameters as one object, with ManyChat's
  field names (`subscriber_id`, `flow_ns`), plus an optional `RequestOptions`.
- Each method resolves to the response's `data`, unwrapped from its envelope.
  Endpoints that return only a status resolve to `void`.

The groups are classes that take an `HttpTransport` in their constructor. They
hold no state beyond it. The one class that talks HTTP is `FetchTransport`, so
auth, timeouts, rate limiting, error mapping and response validation each live
in one place.

## Consequences

- ManyChat's reference is this SDK's reference. A method's name, path and
  parameters can be read off the endpoint.
- Adding an endpoint is a method and a row in `test/unit/endpoints.test.ts`,
  and that test's count against the published spec shows whether one is
  missing.
- The API keeps ManyChat's rough edges. `page.getWidgets` and
  `page.getGrowthTools` both exist, and parameter objects are snake case in a
  camel-case language.
- The only departures are where the published spec is wrong about types (see
  ADR-0001), and returning `data` rather than the envelope.
