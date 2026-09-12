---
description: Run a plan's Verification block and report what was actually SEEN.
---

Read `.actionplan/AP.md`. Target: the named plan, else the newest in `in-progress/`.

1. Inspect `## Verification`: explicit targeted commands, including the named acceptance tests;
   never global coverage or a full suite. Fill placeholders before execution.
2. Run `node .actionplan/scripts/verify.cjs <id>`. It also runs configured typecheck/lint and every
   ActionPlan gate, independent of the project's Makefile. It records output, exit statuses and a
   fingerprint of the scoped files in `qa/<id>/verification.md`.
3. Relay failures with their output. Do not rerun until a fix or explained environmental change.
   No code changes after PASS without another verification and affected QA pass.
