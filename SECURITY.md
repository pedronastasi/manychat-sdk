# Security

## Reporting a vulnerability

Open a private security advisory through GitHub's "Report a vulnerability"
flow, not a public issue.

## What this SDK does with your data

A ManyChat API key grants full access to its account: every contact, every
conversation, and the ability to message them. The SDK treats it that way.

- **The key is held in an ES private field** (`#apiToken`), not a TypeScript
  `private` one. It does not appear in `console.log(client)`, `util.inspect`
  or `JSON.stringify`, so logging a client does not print it. A test asserts
  this.
- **Errors never contain the key or the parameters you sent.** An error
  message carries the endpoint, the HTTP status and ManyChat's own message.
  ManyChat's message may echo an identifier back, so treat error messages as
  you would any log line that names a contact.
- **The SDK writes nothing** to stdout, stderr or disk. It has no telemetry and
  talks to no host other than `baseUrl`.
- **One runtime dependency**, `zod`. Releases are published from GitHub Actions
  through npm trusted publishing, with provenance, so every published version
  can be traced to the commit and workflow that built it.

## Using it safely

- Keep the key on a server. Never ship it to a browser or a mobile app.
- Give each environment its own ManyChat account or key, so a leaked
  development key cannot message production contacts.
- `page.setBotField` and its relatives write account-wide values that every
  subscriber sees. Write a value that belongs to one contact with
  `subscriber.setCustomField`, or it can reach every other contact.
