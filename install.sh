#!/usr/bin/env bash
# Pipe-safe installer: no prompts, git operations, or package manager execution.
set -euo pipefail
command -v node >/dev/null 2>&1 || { echo '[install] Node.js is required' >&2; exit 2; }
exec node "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/kit/scripts/install.cjs" "$@"
