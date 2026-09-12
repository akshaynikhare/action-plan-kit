---
id: {{ID}}
title: {{TITLE}}
stage: planned
app: {{APP}}
opened: {{DATE}}
---
# {{TITLE}}

## Story
As a <user>, I want <thing>, so that <value>.

## Context
- What's broken / missing, ≤3 bullets. Evidence: `file:line` per claim.

## Acceptance criteria
- R1 — WHEN <trigger> THEN <response>.
- R2 — IF <condition> THEN <response>.

## Open questions
<!-- Must be EMPTY before /ap:run will start. Answers move to Decisions. -->
- Q1 —

## Decisions
| Question | Choice | Why |
|---|---|---|

## Prior decisions consulted
<!-- recall.sh output for every file in scope. "none" is a valid answer. -->
- none

---
## Sprint tasks
- [ ] T1 <imperative> (lane: sonnet) → <file>
- [ ] T2 <imperative> (lane: opus) → <file>
- [ ] T3 Gate: targeted verification + typecheck + lint + kit gates (orchestrator)

## Definition of Done
- [ ] All sprint tasks ticked (or parked, with why)
- [ ] R1 covered → <test file> :: "<test name>"
- [ ] R2 covered → <test file> :: "<test name>"
- [ ] Gates green · no plan number anywhere in code
- [ ] QA clean — final review evidence sealed by finish.cjs
- [-] Browser walk (only if user-facing)
- [-] SEO checklist (only if the page is public)
- [-] Design system respected (only if UI changed — tokens, shared components, light+dark)
- [ ] Human sign-off ← last, always, never ticked by an agent

<!-- Optional rows: [-] = not applicable, [x] = done. [ ] blocks archive. -->

## Parked
<!-- Populated during the sprint. Empty at start. Format: T4 — why, one line. -->

## Files touched
| File | Change |
|---|---|

## Verification
```bash
<command>   # → what you should SEE
```

## Out of scope
-

## Risks
| Risk | Mitigation |
|---|---|
