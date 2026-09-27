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
them to open a Release PR.

Releasing takes two approvals:

1. **Merge the Release PR.** That tags the version, and the `publish` job
   stages it on npm with provenance. It authenticates through npm trusted
   publishing (OIDC), so there is no npm token in this repository.
2. **Approve it on npm.** Open npmjs.com → `manychat-sdk` → **Staged Packages**,
   review it, and approve with 2FA (or run `npm stage approve <stage-id>`).
   Until then the version is not installable.

The trusted publisher allows `npm stage publish` only, and the package's
publishing access disallows tokens. So neither control of this repository nor a
leaked token can ship a version without a maintainer's 2FA.

A change that breaks a consumer (a renamed export, a narrowed parameter, a
return type that is no longer produced) needs `!` after the type, or a
`BREAKING CHANGE:` footer.

Renovate opens dependency PRs on Monday mornings, three days after a release.
Patches merge on their own when CI is green; minors and majors wait for review.
Runtime dependency updates are committed as `fix(deps):` and ship as a patch
release. Dev dependency updates are committed as `chore(deps):` and do not.

### How 0.1.0 was published

npm can attach a trusted publisher only to a package that already exists, and
staged publishing cannot create one either. So 0.1.0 was published directly,
using a short-lived granular token with "bypass 2FA" held as the `npm`
environment's `NPM_TOKEN` secret. The trusted publisher was configured
immediately afterwards, the secret was deleted, and the token was revoked.

The trusted publisher is pinned to this repository, workflow `release.yml` and
environment `npm`, which only `main` may deploy to. Renaming any of those breaks
publishing until the trusted publisher on npmjs.com is updated to match.
