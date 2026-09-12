# Install, upgrade and remove

Use Bash, Make and Node.js 22 or 24 on macOS or Linux. Claude Code provides the `/ap:*` agent
workflow; the static scripts can be run directly. The core installer needs no npm dependencies.

## Install from a clone

```bash
git clone https://github.com/akshaynikhare/action-plan-kit.git
cd action-plan-kit
./install.sh --target ../my-project --code AP --dry-run
./install.sh --target ../my-project --code AP
```

The code is a two- or three-letter plan prefix. Review `.actionplan/config.json` after installation,
fill unresolved commands and project facts, then follow [USAGE.md](USAGE.md).
The installer prints a preview without writing when `--dry-run` is supplied. It never prompts,
changes git state or invokes a package manager.

Release assets also contain an installable source bundle. Download the archive and SHA256SUMS from
[Releases](https://github.com/akshaynikhare/action-plan-kit/releases), verify the checksum with
`sha256sum -c SHA256SUMS` (Linux) or `shasum -a 256 -c SHA256SUMS` (macOS), extract it, and run its installer.

## Optional browser tests

Pass `--with-e2e` to copy the Playwright scaffold. It keeps an existing `e2e/` directory.
Browser dependencies are installed separately by you; see [the scaffold guide](../kit/e2e/README.md).
The application must already be running before browser tests execute.

## Upgrade

Fetch the release you want in your kit clone, review its changelog, and rerun the installer against
an existing target. A matching installed VERSION makes a normal rerun a no-op.
Kit machinery and agent commands are refreshed on an upgrade. Existing user-owned documents are
preserved and proposed replacements are written as `.kit-new`. Config is create-only; decisions
and gate baselines are not overwritten. Review proposed replacements instead of blindly accepting them.

`--force` also overwrites ordinary document seeds and MCP configuration; use it only when you intend
those replacements. It still preserves config, decisions and baselines. Back up local customizations.
Older plans need the [completion evidence](../kit/references/completion.md) before passing archive checks.

## Remove

First save plans, decisions, QA evidence and custom configuration that you want to keep. Remove
`.actionplan/`, `.claude/commands/ap/`, and only the kit's `ap-*` agent files under `.claude/agents/`.
Remove the `actionplan-kit:start` through `actionplan-kit:end` blocks from CLAUDE.md and AGENTS.md.
Review any `.mcp.json`, Makefile and docs changes individually; these may contain your own work.
No uninstall command should restore whole files from git or delete unrelated agents/configuration.
