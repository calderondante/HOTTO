import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";

const sourceOnly = process.argv.includes("--source-only");
const readJSON = path => JSON.parse(readFileSync(path, "utf8"));
for (const path of ["AGENTS.md", "README.md", ".node-version", ".env.example", ".gitignore",
  "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "tsconfig.json", "next.config.ts",
  "eslint.config.mjs", "components.json", "src/app/page.tsx", "src/app/layout.tsx",
  "src/app/globals.css", "src/lib/utils.ts", "scripts/setup-cloud.sh", "scripts/verify-setup.sh",
  "supabase/config.toml", "supabase/migrations/README.md", "design/README.md",
  ...["PRODUCTO", "ARQUITECTURA", "BASE_DE_DATOS", "DISENO", "ROADMAP", "SKILLS", "DECISIONES", "ENTORNO"].map(name => `docs/${name}.md`)]) {
  assert(existsSync(path), `Falta archivo requerido: ${path}`);
}
const pkg = readJSON("package.json");
assert.match(pkg.packageManager, /^pnpm@\d+\.\d+\.\d+$/);
assert.equal(readJSON("tsconfig.json").compilerOptions.strict, true);
assert.equal(readJSON("components.json").tailwind.css, "src/app/globals.css");
for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  assert.match(version, /^\d+\.\d+\.\d+$/, `Versión directa no fijada: ${name}`);
  if (!sourceOnly) {
    assert.equal(readJSON(`node_modules/${name}/package.json`).version, version,
      `Dependencia ausente o versión diferente del lockfile: ${name}`);
  }
}
const sources = readJSON("scripts/skills-sources.json");
const lock = readJSON("skills-lock.json").skills;
const expected = sources.flatMap(source => source.skills);
assert.equal(expected.length, 19, "Debe haber 19 skills seleccionadas.");
assert.deepEqual(Object.keys(lock).sort(), [...expected].sort());
const files = [];
function walk(path) {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const file = `${path}/${entry.name}`;
    assert(!lstatSync(file).isSymbolicLink(), `Skill no autocontenida: ${file}`);
    if (entry.isDirectory()) walk(file);
    else files.push(file);
  }
}
walk(".agents/skills");
const hashes = readJSON("scripts/skills-integrity.json");
assert.deepEqual(files.sort(), Object.keys(hashes).sort(), "Cambió el conjunto de archivos de skills.");
for (const file of files) {
  assert.equal(createHash("sha256").update(readFileSync(file)).digest("hex"), hashes[file],
    `Cambió la skill o un archivo auxiliar: ${file}; revisar el origen y actualizar el manifiesto explícitamente.`);
}
for (const source of sources) {
  for (const skill of source.skills) {
    assert.equal(lock[skill].source, source.repository, `Origen inesperado: ${skill}`);
    const entry = `.agents/skills/${skill}/SKILL.md`;
    const text = readFileSync(entry, "utf8");
    assert.match(text, new RegExp(`^---\\s*\\nname: ${skill}\\s*\\n`));
    assert.match(text, /\ndescription:/);
    // Verify concrete relative Markdown references in each skill entry point.
    for (const [, target] of text.matchAll(/\]\(([^)]+\.md(?:#[^)]*)?)\)/g)) {
      if (/^(https?:|#)/.test(target) || /[<>*]/.test(target)) continue;
      const destination = resolve(dirname(entry), target.split("#")[0]);
      assert(!relative(resolve(".agents/skills"), destination).startsWith(".."), `Referencia externa: ${entry}`);
      assert(existsSync(destination), `Referencia auxiliar ausente: ${entry} -> ${target}`);
    }
  }
}
for (const line of readFileSync(".env.example", "utf8").split("\n")) {
  if (!line || line.startsWith("#")) continue;
  assert.match(line, /^[A-Z][A-Z0-9_]*=$/, ".env.example debe contener solo variables vacías.");
}
const ignored = execFileSync("git", ["check-ignore", "--no-index", ".env.local", ".cache/test"], { encoding: "utf8" });
assert(ignored.includes(".env.local") && ignored.includes(".cache/test"), "Estado local sin protección Git.");
const candidates = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"])
  .toString().split("\0").filter(Boolean);
for (const file of new Set(candidates)) {
  assert(!/(^|\/)\.env(\.|$)/.test(file) || file === ".env.example", `Variable local incluida en Git: ${file}`);
  assert(!/^\.cache\//.test(file), `Estado de herramientas incluido en Git: ${file}`);
  if (!file.startsWith(".agents/") && existsSync(file) && lstatSync(file).isFile()) {
    const text = readFileSync(file, "utf8");
    assert(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{40,}/.test(text),
      `Posible credencial en ${file}; revisar sin imprimir el valor.`);
  }
}
console.log(`Integridad: ${expected.length} skills, ${files.length} archivos auxiliares, configuración y exclusiones Git correctas${sourceOnly ? " (sin verificar instalación)" : ""}.`);
