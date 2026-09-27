# ADR-0003 — Ship ESM only, compiled by `tsc`

**Status:** accepted · **Date:** 2026-09-27

## Context

Dual ESM and CommonJS builds were the norm for npm libraries. They cost a
bundler (tsup, unbuild or rollup), two sets of declaration files that
`arethetypeswrong` has to check, and the dual-package hazard: one process can
load both copies, and then `instanceof ManyChatApiError` fails against an error
thrown by the other one. For an SDK whose error handling is built on
`instanceof`, that hazard is more than theoretical.

Since Node 22.12, `require()` loads an ES module synchronously without a flag,
so CommonJS consumers can use an ESM-only package directly.

## Decision

The package is ESM only. `tsc` emits `dist/` straight from `src/`, one file per
module, with `rewriteRelativeImportExtensions` turning `.ts` imports into `.js`.
There is no bundler, and `engines.node` is `>=22.12`.

CI runs `publint --strict` and `attw --profile esm-only` against the packed
tarball, which checks what npm would actually publish rather than the working
tree.

## Consequences

- There is one copy of each class at runtime, so `instanceof` is reliable.
- The build is `tsc`. What is in `dist/` is what is in `src/`, file for file,
  and a stack trace points to a file that exists in the repository.
- Consumers on Node before 22.12 who use `require()` cannot use this package.
  They can use `await import('manychat-sdk')`, or upgrade.
- The SDK uses only `fetch`, `AbortSignal` and timers, never a `node:` import,
  so it also runs on Deno, Bun and edge runtimes. Nothing tests those, so it is
  not claimed in the README.
