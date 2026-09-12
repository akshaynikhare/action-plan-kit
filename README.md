# ActionPlan Kit

Ship more, get interrupted less. Plan → answer **all** questions once → agents build everything →
QA by a different agent → **one poke** when it's your turn. Human signs off last.

## Install
Requires Bash, Make and Node.js 22 or 24.
```bash
git clone https://github.com/akshaynikhare/action-plan-kit && cd action-plan-kit
./install.sh --target ../my-repo --code AP          # add --with-e2e for the Playwright scaffold
```

## Daily use (in Claude Code)
| Command | When |
|---|---|
| `/ap:init` | Once per project — the intent interview (why, who, what, market) |
| `/ap:new <ask>` | File a story with acceptance criteria and a checklist |
| `/ap:ask` | Clear ALL open questions in one batch — then you're free |
| `/ap:run <id> [<id>…]` | The sprint: builds everything, gates, QA loop, ONE poke |
| `/ap:status` | Board + the Mirror (hard numbers, plain verdicts) |
| `make help` | Quick launch: dev · test · lint · check · status |

## The contract
```mermaid
flowchart LR
    P[plan] --> A[ask everything once] --> B[build ALL tasks] --> Q[QA loop] --> K[🔔 one poke] --> S[you sign off]
```
- Questions are batched before code. Mid-sprint blockers get **parked**, never guessed.
- QA is always a **different agent** reading the diff only. No agent ever ticks human sign-off.
- Focused reviewers check acceptance coverage, caller regressions, security boundaries and cleanup when relevant.
- Completion requires final verification and sealed review evidence; the human ticks sign-off.
- One session per file — `.actionplan/locks/` stops parallel sessions colliding.
- No plan ids in code, ever. Agents never touch git.

## What lands in your repo
`.actionplan/` (plans, QA evidence, gates, scripts — agents' folder) · `docs/` (intent, constitution,
design, SDLC, engineering standard — your folder) · `Makefile` · `/ap:*` commands · `.mcp.json`.
Run kit gates directly: `node .actionplan/scripts/check.cjs` (works with an existing Makefile).

## Guides and community
[Install / upgrade / remove](docs/INSTALLATION.md) · [Usage](docs/USAGE.md) · [Troubleshooting](docs/TROUBLESHOOTING.md)
[Contributing](CONTRIBUTING.md) · [Code of conduct](CODE_OF_CONDUCT.md) · [Security](SECURITY.md) · [Support](SUPPORT.md)
[Changelog](CHANGELOG.md) · [Releasing](docs/RELEASING.md) · [Maintainers](MAINTAINERS.md) · [Cite this repository](docs/CITATION.md)
[Sponsor Akshay](https://github.com/sponsors/akshaynikhare) · [Other ways to help](SPONSORING.md) · [MIT license](LICENSE) · [Website](https://akshaynikhare.github.io/action-plan-kit/)
