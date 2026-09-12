---
description: The sprint. Builds EVERY task of one or more plans, gates, QA loop — then ONE poke. No mid-sprint questions.
---

Read `.actionplan/AP.md` first. Usage: `/ap:run <id> [<id>…]`. Process plans in the given order.

Per plan:
1. **Preflight:** `## Open questions` must be empty. Set a stable `ACTIONPLAN_SESSION_ID` for this
   sprint if `CLAUDE_SESSION_ID` is unavailable; reuse it for every lock/stage invocation.
2. **Claim before moving:** `bash .actionplan/scripts/lock.sh claim <id>` validates the Files touched
   manifest (light plans too), frozen paths and ownership. A refusal stops this plan; continue other
   queued plans. Then `bash .actionplan/scripts/stage.sh <id> in-progress`. Resume is idempotent and
   retains the claim. Add any newly discovered file to the manifest and re-claim before editing it.
3. **Build every task in order.** Tick tasks as they land. Dispatch bulk work with distinct-file
   manifests; complex work and plan writes stay with the orchestrator. A blocker is parked with its
   dependents and a reason; never guess or ask mid-sprint.
4. **Verify:** `node .actionplan/scripts/verify.cjs <id>` runs the explicit targeted commands in the
   plan's Verification block, configured typecheck/lint, and the dedicated kit gate runner. Inspect
   the commands first: include the named acceptance tests, never a full suite/global coverage.
   Failure stops completion and is recorded in `qa/<id>/verification.md`; fix or park it.
5. **QA-DEV loop:** follow `prompts/qa_dev_loop.md` and `references/focused-review.md`. Save general
   and selected focused reports. After any fix, repeat verification and reviews affected by the fix;
   general QA reviews the updated diff. A later code edit invalidates earlier verification evidence.
   Use `config.json`'s `qaMaxRounds` (default 3); reaching the cap parks unresolved work.
6. Walk/SEO/design rows: run if applicable, else mark `[-]`. Any resulting code fix returns to
   verification and QA. Once final checks and reviews are clean, fill `qa/<id>/review-N.md` from
   `templates/review.md` with honest PASS/SKIP dispositions and reasons. Run
   `node .actionplan/scripts/finish.cjs <id> N` to seal evidence, then tick Gates green / QA clean.
   The agent never ticks Human sign-off. See `references/completion.md` for the archive contract.
7. Release the owned claim with `bash .actionplan/scripts/lock.sh release <id>`, including when
   pausing or parking after failure. Never release another session's claim. A killed session leaves
   its lock for explicit human recovery; never auto-steal it.

After the LAST plan — the poke:
`bash .actionplan/scripts/poke.sh "<ids> sprint done — needs you" "<one line per plan>"`
Then print the full summary: per plan — built/parked, QA rounds, `git diff --stat` totals (read-only!), evidence paths,
and "Your turn:" list. **Never tick Human sign-off. Never commit. Stop.**
