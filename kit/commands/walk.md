---
description: Live Chromium walk of a running app — evidence bundle + findings. Read-only on code.
---

Read `.actionplan/AP.md` and `.actionplan/prompts/qa_playwright_walk.md`.

1. `bash .actionplan/scripts/check-chromium.sh` — stop on `[VERDICT] FAIL`, print the fix line.
2. Driver: Playwright MCP browser tools if present in this session; else
   `node .actionplan/scripts/qa-walk.mjs --url <url> --out .actionplan/qa/<id>/<date>/ [--steps <file>]`.
3. Walk per the prompt's six lenses (Broken · Confusing · Wrong · Leaky · Findable · Off-brand).
4. Evidence → `.actionplan/qa/<id>/<date>/` (FINDINGS.md, JOURNEY.md, console.log, network.jsonl, screenshots/).
5. Triage every finding — REAL → new story (`/ap:new`) · DELIBERATE → `/ap:decide` · FROZEN → FROZEN.md line ·
   REFUTED → recorded as refuted in FINDINGS.md. Nothing stays as loose prose. **Stop.**
