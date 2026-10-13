#!/usr/bin/env bash
set -euo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/tool-env.sh"
cd "$HOTTO_ROOT"
node scripts/check-integrity.mjs
bash scripts/pnpm.sh exec skills list --agent codex --json > .cache/skills-discovery.json
node --input-type=module -e '
  import fs from "node:fs";
  const skills = JSON.parse(fs.readFileSync(".cache/skills-discovery.json", "utf8"));
  const expected = Object.keys(JSON.parse(fs.readFileSync("skills-lock.json", "utf8")).skills);
  if (skills.length !== expected.length || expected.some(name => !skills.some(skill =>
    skill.name === name && skill.scope === "project" && skill.agents.includes("Codex")))) {
    throw new Error("Codex no descubre todas las skills locales requeridas.");
  }
  console.log(`${skills.length} skills locales descubiertas por Codex.`);
'
bash scripts/pnpm.sh typecheck
bash scripts/pnpm.sh lint
bash scripts/pnpm.sh build
bash scripts/pnpm.sh smoke
git diff --check
echo 'Verificación del bootstrap completada. No incluye funcionalidades de producto ni servicios remotos.'
