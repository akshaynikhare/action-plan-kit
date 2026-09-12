---
description: Move a plan between stages. Archive is gated — explicit sign-off + sealed final verification/reviews, then the 2-line retro.
---

Usage: `/ap:stage <id> <planned|in-progress|archived|audit>`.

1. Claim the plan before entering in-progress. Archive requires the human to have ticked sign-off
   and valid final evidence per `references/completion.md`.
   `bash .actionplan/scripts/stage.sh <id> <stage>` — relay output. A REFUSED is final until the DoD is honest.
2. On archive: append the 2-line retro to the plan (What worked / What to change). A durable lesson →
   offer `/ap:decide` or a PATTERNS.md entry — one question, then act on the answer.
