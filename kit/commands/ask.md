---
description: The clarification gate — critic pass, then ALL open questions in one batch. Zero code before answers.
---

Read `.actionplan/AP.md` first. Target: the named plan, else the newest in `planned/`.

1. **Critic pass:** launch the `ap-critic` agent with the plan + `docs/CONSTITUTION.md` +
   `docs/_design/DESIGN_SYSTEM.md` (if UI). It attacks with real-world scenarios and returns extra questions.
   Merge them into `## Open questions` (dedupe).
2. **Web-search before asking.** For each question where the web helps (library choice, pattern, pricing,
   platform behaviour), search first so options carry evidence.
3. **Ask everything in one batch** via AskUserQuestion (≤4 per call, chain calls until done). Every question:
   Option A/B(/C) with ✅ pros / ❌ cons and a 💡 recommendation placed first.
4. Write answers into `## Decisions` (| Question | Choice | Why |). Delete answered questions.
5. When `## Open questions` is empty, say: "CLEAR TO BUILD — `/ap:run <id>`." **Stop. Do not start coding.**
