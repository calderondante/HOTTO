#!/usr/bin/env bash
set -euo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/tool-env.sh"
cd "$HOTTO_ROOT"
for tool in node npm git; do
  command -v "$tool" >/dev/null 2>&1 || { echo "Falta herramienta crítica: $tool" >&2; exit 1; }
done
node --input-type=module -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major !== 24 || minor < 19) {
    console.error("Se requiere Node.js 24.19+ de la rama 24 LTS; consultar .node-version.");
    process.exit(1);
  }
'
node scripts/check-integrity.mjs --source-only
bash scripts/pnpm.sh install --frozen-lockfile
node scripts/prepare-browser.mjs
bash scripts/pnpm.sh exec agent-browser --version
bash scripts/pnpm.sh peers check
node scripts/check-integrity.mjs
bash scripts/pnpm.sh exec supabase --version
bash scripts/pnpm.sh exec shadcn info --json > .cache/shadcn-info.json
HOTTO_BUILD_DIR=.next-production bash scripts/pnpm.sh exec next typegen
echo 'Dependencias y herramientas preparadas. Ejecutar bash scripts/verify-setup.sh.'
