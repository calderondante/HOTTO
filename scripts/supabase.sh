#!/usr/bin/env bash
set -euo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/tool-env.sh"
cd "$HOTTO_ROOT"
exec bash scripts/pnpm.sh exec supabase "$@"
