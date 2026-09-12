# e2e — committed Playwright suite

Prereq: the app is RUNNING (this suite never starts it). `npm i && npm run install:browser` once.

- `npm test` — everything. `npm run test:journey` — must-pass. `npm run test:gate` — everything except @known-bug.
- Tags: `@journey` must pass · `@known-bug` proven finding held as `test.fail()` · `@authz` · `@money`.
- Locators: getByRole / getByLabel / getByText only — the locator-policy gate blocks test ids.
- Headed by default; auto-headless under CI/agent sessions. `HEADED=0` forces headless.
- Test names NEVER contain a plan id — the plan points here, never back.
