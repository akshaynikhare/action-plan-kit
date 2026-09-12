# Troubleshooting

| Symptom | Action |
|---|---|
| Installer reports Node.js missing | Install a supported Node.js runtime and rerun; the installer does not install runtimes. |
| Same version reports no changes | This is expected. Upgrade to a new version; inspect `--force` behavior before using it to reinstall. |
| `.kit-new` files appear | Compare them with your current documents and merge intended changes. |
| Project `make check` misses kit gates | Run `node .actionplan/scripts/check.cjs` directly. |
| Verification mentions TODO commands | Fill the plan's targeted commands and configure lint/typecheck honestly. |
| Lock claim is refused | Inspect `lock.sh list`; let the owner finish or explicitly pause. Keep the same session ID across commands. |
| Registry mutex remains after a crash | A human must confirm no writer remains before removing `.actionplan/locks/.mutex`. |
| A stale lock needs takeover | Follow the human-confirmed recovery process in the completion contract. Never auto-steal a live lock. |
| Archive rejects evidence | Check explicit QA/sign-off rows, the latest round, report hashes and final verification. Do not manufacture a passing disposition. |
| Verification becomes stale | Files or verification instructions changed. Rerun targeted checks and affected reviews, then reseal. |
| Live agent evaluation hits a limit | Preserve the failed run and retry `make eval-agents` after capacity returns. It was not a pass. |
| Browser walk cannot connect | Start the app and check the scaffold's BASE_URL and installed browser. |

For unresolved problems, open a minimal reproducible report through [SUPPORT.md](../SUPPORT.md).
See [completion and lock recovery](../kit/references/completion.md) and
[installation details](INSTALLATION.md) before changing shared state.
