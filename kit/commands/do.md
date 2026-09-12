---
description: Exception mode — one task from a plan, then stop. Same lock rules as the sprint.
---

Read `.actionplan/AP.md` first. Usage: `/ap:do <plan-id> <task-id>`.

1. Open questions empty? Lock claimed (`lock.sh claim <id>`)? Frozen check per file?
2. Do exactly that task. Tick it. Batch typecheck+lint only if the user asks.
3. Report in ≤5 lines. Release the lock only if the user says the plan is paused. **Stop.**
