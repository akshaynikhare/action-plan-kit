# CLAUDE.md

This repo IS the ActionPlan Kit — the source that `install.sh` copies into target repos.

- `kit/` is the staging tree: `commands/` → `.claude/commands/ap/`, `scripts/` → `.actionplan/scripts/`,
  `templates/` are seeds with `{{PLACEHOLDERS}}`. Edit here, never in an installed copy.
- Every gate change must keep its `--selftest` passing (`make test`).
- `install.sh` must stay pipe-safe (no prompts) and must never touch git or run a package manager.
- `index.html` is the GitHub Pages front door (self-contained, zero external requests, SEO per
  `kit/templates/SEO_MARKETING.md` §2). README stays ≤60 lines — it is the github.com repo view.
- No plan ids in code. Guides use Markdown + Mermaid.
- Repository releases and the public site publish through `.github/workflows/` when authorized.
  Installed kit agents never publish web artifacts or touch git.
