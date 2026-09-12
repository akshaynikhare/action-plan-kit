# Focused reviewer evaluations

`make test` validates the 12-case dataset and basic scorer boundaries without model calls.
`make eval-agents` explicitly runs the installed Claude CLI using its existing authentication;
normal model usage charges/limits apply. Each case starts a fresh nonpersistent session with the
agent's actual system prompt and model, safe mode, no tools, and only synthetic inline context.
The suite stops on authentication/runtime failure. It never marks unavailable execution as PASS.

Reports and SUMMARY.md go to a new temporary directory printed by the runner. To keep a run:
`node tests/agent-evals.cjs --run --out tests/evals/results/<run-name>`.
The summary records fixture and agent hashes for reproducibility. Never include real project data
or secrets in fixtures. Expected answers are kept out of model prompts.

Each role has a planted bug, a clean change and a missing-context case. Automated checks measure
expected classification, evidence filename grounding, missed planted issues, false alarms and
extra finding rows. The latter are candidates for duplicate review, not a semantic duplicate metric.
Review raw reports against this rubric before accepting or tuning prompts:

- Planted issue: correct scenario, affected file and real impact; no invented second finding.
- Clean case: no confirmed issue or speculative requirement; runtime success is never claimed.
- Missing context: uncertainty named without promoting it to a confirmed defect or safe deletion.
- Scope: no file edits, user questions, unrelated advice, or unsupported assertions.
- Duplicates: combine rows that identify the same root cause and consequence.

These cases evaluate reasoning on supplied context. They do not prove live tool permissions,
file discovery or orchestration in Claude Code. Extend the fixtures when a real miss is observed.
