#!/usr/bin/env bash
# Source from repository scripts. Never move HOME or overwrite credentials.
HOTTO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
export XDG_CACHE_HOME="$HOTTO_ROOT/.cache/xdg/cache"
export XDG_DATA_HOME="$HOTTO_ROOT/.cache/xdg/data"
export XDG_STATE_HOME="$HOTTO_ROOT/.cache/xdg/state"
export XDG_CONFIG_HOME="$HOTTO_ROOT/.cache/xdg/config"
export PNPM_HOME="$HOTTO_ROOT/.cache/pnpm/home"
export npm_config_cache="$HOTTO_ROOT/.cache/npm"
export SUPABASE_HOME="$HOTTO_ROOT/.cache/supabase"
export NEXT_TELEMETRY_DISABLED=1
export SUPABASE_TELEMETRY_DISABLED=1
export DISABLE_TELEMETRY=1
export DO_NOT_TRACK=1

# Node 24 SDK fetch follows the inherited session proxy.
export NODE_USE_ENV_PROXY=1
