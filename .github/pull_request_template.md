## Why

<!--
The problem, the constraint, or the decision - not a summary of the diff.

A reader who thinks this change is wrong should be able to point at the sentence
they disagree with. Say what was rejected and why, if anything was.
-->

## What changed

<!-- Short. The diff has the detail; this orients the reader inside it. -->

## Verification

<!-- What you actually ran and what it returned. Numbers, not adjectives. -->

| Check                                              | Result |
| -------------------------------------------------- | ------ |
| `pnpm test:coverage`                               |        |
| `pnpm typecheck && pnpm lint && pnpm format:check` |        |
| `pnpm build && pnpm check:package`                 |        |

## Risk

<!--
What could break for someone who installs the next release. A changed return
type, a response that used to parse and now does not, a renamed export: each is
breaking, and the commit needs `!` or a `BREAKING CHANGE:` footer. Delete this
section when no public behaviour changed.
-->

---

- [ ] **No real account data.** No API keys, subscriber ids, phone numbers, names
      or responses copied from a live ManyChat account, in the diff, the fixtures or
      this description. Fixtures are invented.
- [ ] **An ADR**, if this makes a non-obvious decision or reverses one.
