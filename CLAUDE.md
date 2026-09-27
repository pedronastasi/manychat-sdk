# CLAUDE.md

## Project overview

`manychat-sdk`: an unofficial, typed TypeScript client for the ManyChat API,
published to npm. It covers every endpoint of ManyChat's Page API
(`https://api.manychat.com/swagger`, `compileJson?type=Page_API`), with one
method per endpoint.

## Commands

| Command              | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `pnpm build`         | Clean `dist/` and compile with `tsc`                   |
| `pnpm typecheck`     | `tsc --noEmit`                                         |
| `pnpm lint`          | ESLint (type-aware)                                    |
| `pnpm format`        | Prettier write                                         |
| `pnpm format:check`  | Prettier check                                         |
| `pnpm test`          | `vitest run`                                           |
| `pnpm test:coverage` | Vitest with coverage thresholds enforced               |
| `pnpm check:package` | `publint --strict` + `attw` against the packed tarball |

## Tech stack

- **Runtime:** Node.js >= 22.12, ESM only (ADR-0003); no `node:` imports in `src/`
- **Language:** TypeScript ~6.0 (strict, `verbatimModuleSyntax`, `erasableSyntaxOnly`)
- **Validation:** Zod 4, the only runtime dependency (ADR-0001)
- **Testing:** Vitest 5, V8 coverage
- **Linting:** ESLint 10 (type-aware), Prettier (100 chars, single quotes)
- **Release:** release-please; CI stages each version through npm trusted
  publishing (OIDC, provenance), and a maintainer approves it on npm with 2FA
- **Dependencies:** Renovate
- **Package manager:** pnpm

## Architecture

- `ManyChat` (`src/client.ts`) validates options and wires everything together.
  It exposes `page`, `subscriber` and `sending`.
- `PageApi`, `SubscriberApi` and `SendingApi` (`src/api/`) have one method per
  endpoint, named after it, and take its wire params (ADR-0002).
- `HttpTransport` (`src/http/transport.ts`) is the port. `FetchTransport` is the
  only class that does HTTP: auth, timeout, rate limit, error mapping and
  response validation.
- `RateLimiter` is a port, implemented by `TokenBucketRateLimiter` and
  `UnlimitedRateLimiter`.
- `src/schemas/` holds the Zod response schemas. They are lenient, strict only
  about what the return type promises (ADR-0001).
- `src/errors.ts` defines `ManyChatError`, and under it `ManyChatApiError`,
  `ManyChatResponseError` and `ManyChatConnectionError`. None of them retries
  (ADR-0004).

Classes hold dependencies; pure transformations are functions.

## Testing conventions

- Fake only `fetch` (`test/helpers/fake-fetch.ts`).
- Fixtures are English and invented. Never use data from a real ManyChat
  account.
- `test/unit/endpoints.test.ts` must have a row for every endpoint. Its count
  is checked against the published spec.
- Coverage floor: 95% statements, 90% branches, 95% functions, 95% lines.

## Code style

- `.ts` extensions in relative imports; `import type` for type-only imports.
- No single-letter identifiers (`id-length`).
- No console output. The library reports by throwing.
- Conventional commits. A breaking change needs `!`, since the changelog and
  the version number come from commit subjects.
- PRs open with `## Why`.
- English throughout.
