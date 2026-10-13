#!/usr/bin/env bash
set -euo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/tool-env.sh"
cd "$HOTTO_ROOT"
required_version="$(node -p "require('./package.json').packageManager.split('@')[1]")"
if command -v pnpm >/dev/null 2>&1 && [[ "$(pnpm --version)" == "$required_version" ]]; then
  exec pnpm "$@"
fi
command -v npm >/dev/null 2>&1 || { echo 'Falta npm para ejecutar el pnpm fijado en package.json.' >&2; exit 1; }
# Project cache only; no global package installation, lockfile or tool upgrade.
exec npm exec --yes --package="pnpm@$required_version" -- pnpm "$@"
