---
description: Generate CLAUDE.md + docs from what IS. --deep adds per-app cascading context in big repos.
---

Read `.actionplan/AP.md`. Usage: `/ap:map [--deep]`.

1. Read the code before writing a word. Every fact date-stamped `(verified <date>)`; unknowns `TODO(verify):` —
   never a guess, never an aspiration presented as shipped.
2. Root pass: fill `docs/_architecture/` (system shape, mermaid diagrams) and the divergences section of
   `docs/_workflow/ENGINEERING_STANDARD.md` with the code as it actually is.
3. `--deep` (monorepos / big repos): for every app in `config.json` apps[] (or detected workspaces),
   write from `templates/claude-app.md`: a SHORT `CLAUDE.md` (~30–60 lines, scope pointer UP, key files,
   local gotchas) + a `README.md` for humans. An app whose intent/design differs gets its own
   `docs/INTENT.md` / `docs/_design/` linking back to the root. Nearest file wins; nothing global repeated.
4. Never overwrite an existing file — write `<name>.kit-new` beside it and list the diffs to review. **Stop.**
