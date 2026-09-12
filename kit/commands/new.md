---
description: New story → .actionplan/planned/. Flags — --light, --from-backlog N, --skip-intent.
---

Read `.actionplan/AP.md` first.

1. **Intent gate:** if `docs/INTENT.md` is missing → refuse, offer `/ap:init`. `--skip-intent` overrides
   (record `intent: skipped` in frontmatter).
2. `--from-backlog N`: take line N of `.actionplan/BACKLOG.md` as the ask; delete the line after writing the story.
3. Id: `bash .actionplan/scripts/plan-id.sh`. Template: `templates/plan.md` (or `plan-light.md` with `--light`).
   Suggest `--light` yourself when the ask touches ≤2 files and nothing user-facing.
4. Fill: Story (one line) · Context with `file:line` evidence (read the code first — search before write) ·
   Acceptance criteria as EARS R-rows (`references/ears.md`) — unhappy paths included ·
   Sprint tasks with lanes (`references/lanes.md`) · Files touched (concrete paths, including light plans) ·
   Verification (explicit targeted commands and expected output; include named acceptance tests).
5. Run `bash .actionplan/scripts/recall.sh <keyword>` for every file/area in scope → fill
   `## Prior decisions consulted` (titles or `none`). Check `docs/CONSTITUTION.md` — a conflicting ask is
   flagged in the plan, not silently built.
6. Seed `## Open questions` with everything genuinely undecided. Do NOT answer them yourself.
7. Write the file. Say: "Story filed as <id>. Next: `/ap:ask` to clear the questions." **Stop.**
