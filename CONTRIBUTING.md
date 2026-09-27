# Contributing

```sh
pnpm install && pnpm test
```

No ManyChat account is needed. Tests fake `fetch` and nothing else.

## Before opening a PR

```sh
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test:coverage && pnpm build && pnpm check:package
```

CI runs exactly these on Node 22 and 24, plus secret scanning and CodeQL.

The PR template opens with `## Why`. Write that part first: the problem or the
decision, not a summary of the diff.

## Conventions

- **One method per endpoint, named after it** ([ADR-0002](docs/adr/0002-mirror-the-manychat-api.md)).
  A new endpoint is a method on the class for its namespace, plus a row in
  `test/unit/endpoints.test.ts`.
- **Response schemas guarantee the return type and nothing more**
  ([ADR-0001](docs/adr/0001-lenient-response-validation.md)). Keep objects loose,
  nullable fields `nullable()`, and lists `list()`.
- **Classes for things with dependencies, functions for pure transformation.**
  Dependencies arrive through the constructor. `erasableSyntaxOnly` is on, so
  fields are declared and assigned by hand rather than as parameter properties.
- **No single-letter identifiers**, enforced by `id-length`. The name is the
  documentation.
- **No `node:` imports in `src/`.** The SDK needs only `fetch`, `AbortSignal`
  and timers.
- **Nothing is written to the console.** A library reports by throwing.
- **Comments say why, never what.**

## Tests

- Fake only `fetch`, using `test/helpers/fake-fetch.ts`. It honours `fetch`'s
  contract: a pending request rejects when its signal aborts.
- **Fixtures are invented.** Never paste a response, id, phone number or name
  from a real ManyChat account, even a test one. When a live response exposes a
  schema bug, rebuild its shape with invented values.
- Coverage thresholds are a floor that only ratchets up.
- A test that enforces an ADR cites it.

## Decisions

A non-obvious decision gets an ADR in [`docs/adr/`](docs/adr/). A change that
reverses one gets a new ADR that supersedes it, rather than an edit.

## Commits and releases

Commit subjects follow Conventional Commits (`feat:`, `fix:`, `refactor:`,
`docs:`, `test:`, `chore:`, `ci:`). They are the changelog: release-please reads
them to open a Release PR, and merging that PR tags the version and publishes it
to npm with provenance.

A change that breaks a consumer (a renamed export, a narrowed parameter, a
return type that is no longer produced) needs `!` after the type, or a
`BREAKING CHANGE:` footer.

Renovate opens dependency PRs on Monday mornings, three days after a release.
Patches merge on their own when CI is green; minors and majors wait for review.
Runtime dependency updates are committed as `fix(deps):` and ship as a patch
release. Dev dependency updates are committed as `chore(deps):` and do not.

### Releasing for the first time

npm can only attach a trusted publisher to a package that already exists, so the
first release needs a token:

1. On npmjs.com, create a granular access token that can publish, and save it
   as the `NPM_TOKEN` secret of the `npm` environment in this repository.
2. Merge the first Release PR. The `publish` job publishes with that token.
3. On npmjs.com, open the package's settings and add a trusted publisher: this
   repository, workflow `release.yml`, environment `npm`.
4. Delete the `NPM_TOKEN` secret and revoke the token. Later releases
   authenticate through OIDC, and no long-lived credential is left to leak.
