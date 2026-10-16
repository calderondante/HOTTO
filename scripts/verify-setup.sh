#!/usr/bin/env bash
set -euo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/tool-env.sh"
cd "$HOTTO_ROOT"
node scripts/check-integrity.mjs
bash scripts/pnpm.sh exec skills list --agent codex --json > .cache/skills-discovery.json
node --input-type=module -e '
  import fs from "node:fs";
  import os from "node:os";
  import path from "node:path";
  const skills = JSON.parse(fs.readFileSync(".cache/skills-discovery.json", "utf8"));
  const lock = JSON.parse(fs.readFileSync("skills-lock.json", "utf8")).skills;
  const expected = Object.keys(lock);
  if (skills.length !== expected.length || expected.some(name => !skills.some(skill =>
    skill.name === name && skill.scope === "project" && skill.source === lock[name].source &&
    path.resolve(skill.path) === path.resolve(".agents/skills", name)))) {
    throw new Error("La CLI no descubre todas las skills en la ubicación local oficial de Codex.");
  }
  // skills 1.7.2 reports provider associations only for installed agents.
  // GitHub runners have no Codex runtime; verify their actual capability.
  const codexInstalled = fs.existsSync(process.env.CODEX_HOME || path.join(os.homedir(), ".codex")) ||
    fs.existsSync("/etc/codex");
  if (codexInstalled && skills.some(skill => !skill.agents.includes("Codex"))) {
    throw new Error("Codex está instalado pero no reconoce todas las skills locales.");
  }
  console.log(`${skills.length} skills locales descubiertas en .agents/skills.`);
  console.log(codexInstalled ? "Asociación Codex verificada." : "Sin runtime Codex: verificada la ubicación compatible; ejecución del agente no aplicable.");
'
bash scripts/pnpm.sh test
bash scripts/pnpm.sh typecheck
bash scripts/pnpm.sh lint
bash scripts/pnpm.sh build
bash scripts/pnpm.sh smoke
git diff --check
echo 'Verificación frontend/backend completada: skills, dataset, búsqueda, tipos, lint, build y rutas de producción. PostgreSQL se verifica con scripts/test-postgres.sh; Auth/Storage remotos requieren proyecto conectado.'
