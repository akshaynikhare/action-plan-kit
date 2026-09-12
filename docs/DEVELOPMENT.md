# Development guide

The repository is the kit source, not an installed target project.

| Path | Purpose |
|---|---|
| `kit/commands/` | Claude Code `/ap:*` command instructions |
| `kit/agents/` | General and focused reviewer roles |
| `kit/scripts/` | Installer, gates, locks, stages and verification |
| `kit/templates/` | Seeds copied/rendered into target projects |
| `kit/references/` | Shared workflow contracts |
| `tests/` | Offline integration tests and optional model evaluations |
| `.github/workflows/` | CI, release and Pages automation |
| `.github/scripts/` | Release validation, packaging and site staging |
| `index.html`, `404.html`, `assets/` | Self-contained public site |

`make test` checks script syntax, all gate selftests, integration tests and the evaluation dataset.
CI runs the offline checks on Linux/macOS with Node.js 22 and 24. No live model calls run in CI.
`make package` produces the installable archive and SHA256SUMS in ignored `dist/`.
`make site` stages the explicit public-site allowlist in ignored `_site/`.

`make eval-agents` is optional and requires an authenticated Claude CLI. It uses synthetic inputs;
see [the evaluation guide](../tests/evals/README.md) for scoring limits and manual review requirements.

Keep the root README short. Tests must exercise behavior or meaningful boundary conditions;
avoid tests that merely repeat prompt wording. Update the changelog and guides when behavior changes.
Use [CONTRIBUTING.md](../CONTRIBUTING.md) for the review process and [RELEASING.md](RELEASING.md) for publishing.
