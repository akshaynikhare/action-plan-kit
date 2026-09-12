---
description: Run the QA-DEV loop alone — 7–8 line brief, fresh agent checks the diff, 7–8 line report back.
---

Read `.actionplan/AP.md` and `.actionplan/prompts/qa_dev_loop.md`.

1. N = next round number in `.actionplan/qa/<id>/`.
2. Write `brief-N.md` — exactly 7–8 lines: app name first, what was built, expected behaviour,
   areas to verify, "check the diff, read-only, no code changes, no deploy steps".
3. Launch the `ap-qa` agent (fresh context, gets ONLY the brief + the diff — never this conversation).
4. Save its reply verbatim as `report-N.md`. Run selected focused reviewers per
   `references/focused-review.md` and save their separate reports. Relay findings. Only if general
   QA and all selected focused reviews are clean, fill `qa/<id>/review-N.md` from `templates/review.md`.
   Require successful verification for the current file contents; run `/ap:verify` if absent or stale.
   Seal with `node .actionplan/scripts/finish.cjs <id> N`, then tick `QA clean`. Never tick human
   sign-off. A failed/incomplete round leaves QA unticked. **Stop.**
