---
description: Hygiene/quality audit — orchestrator + parallel scanners, findings only, report-only.
---

Read `.actionplan/AP.md` and `.actionplan/prompts/code_hygiene_audit.md`. Usage: `/ap:audit [path]`.

Rules (non-negotiable):
- Orchestrator plans, scopes, dispatches, dedupes, writes the report. It does not grep files itself.
- Scanners are `bulk`-lane subagents, ALL dispatched in one message, each with a distinct territory,
  the exclusion list, and the finding format. They return findings only.
- Report-only — no source changes. Generated code is never a finding. Never install anything.
- Before filing, check `recall.sh` — a finding that contradicts a DECISIONS entry is dropped with a note.
- File as `.actionplan/audit/<CODE>-NNNN-<slug>.md` (id via plan-id.sh): summary table
  (ID | Category | Severity | Confidence | Area | One-liner) then findings with `file:line` evidence.
- End with a triage order and: "Approve items → they become stories. Nothing is fixed in this pass." **Stop.**
