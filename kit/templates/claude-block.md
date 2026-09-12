<!-- actionplan-kit:start (managed block — reruns of install.sh replace only this) -->
# ActionPlan Kit

This repo uses the ActionPlan sprint model. **It supersedes any global "one task at a time" rule here.**

- Flow: `/ap:new` → `/ap:ask` (ALL questions, one batch) → `/ap:run` (build everything) → QA → ONE poke. Human signs off last.
- Rules for every session and tool:
  1. Never `git add/commit/stash/checkout/restore` — the human commits.
  2. **Locks**: before editing any file, check `.actionplan/locks/*.json`. Overlap → stop, name the holder. One session per file.
  3. No plan ids (e.g. `{{CODE}}-0001`) in code or test names.
  4. Never invoke a skill the user didn't ask for. Never publish to Claude web artifacts — output is repo markdown, diagrams are mermaid.
  5. Read `.actionplan/DECISIONS.md` via `.actionplan/scripts/recall.sh <query>` — never whole.
- Full rules: `.actionplan/AP.md` · board: `make status` · docs for humans: `docs/`
<!-- actionplan-kit:end -->
