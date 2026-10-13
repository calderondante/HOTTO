#!/usr/bin/env bash
set -euo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/tool-env.sh"
cd "$HOTTO_ROOT"
export AGENT_BROWSER_SOCKET_DIR="$HOTTO_ROOT/.cache/agent-browser"
export AGENT_BROWSER_SCREENSHOT_DIR="$HOTTO_ROOT/.cache/browser/screenshots"
export AGENT_BROWSER_SESSION="${AGENT_BROWSER_SESSION:-$(bash scripts/pnpm.sh exec agent-browser session id --scope worktree --prefix next-dev-loop)}"
export AGENT_BROWSER_RESTORE="${AGENT_BROWSER_RESTORE:-$AGENT_BROWSER_SESSION}"
# agent-browser 0.39.1 writes named restore files under HOME, which is read-only
# in this cloud image. A supported persistent Chrome profile keeps session state
# in the checkout instead; disable only that unwritable automatic state export.
export AGENT_BROWSER_PROFILE="${AGENT_BROWSER_PROFILE:-$HOTTO_ROOT/.cache/browser/profile-$AGENT_BROWSER_SESSION}"
export AGENT_BROWSER_RESTORE_SAVE="${AGENT_BROWSER_RESTORE_SAVE:-never}"
export AGENT_BROWSER_ENABLE="${AGENT_BROWSER_ENABLE:-react-devtools}"
if [[ -z "${AGENT_BROWSER_EXECUTABLE_PATH:-}" ]] && command -v chromium >/dev/null 2>&1; then
  export AGENT_BROWSER_EXECUTABLE_PATH="$(command -v chromium)"
fi
exec bash scripts/pnpm.sh exec agent-browser "$@"
