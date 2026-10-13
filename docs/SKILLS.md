# Skills locales

Se consultaron las cinco fuentes con `npx skills@latest add <repo> --list` y se
instalaron únicamente las seleccionadas mediante `--agent codex --copy --yes`,
sin `--global`. CLI utilizada: `skills` 1.7.2, publicada por
[vercel-labs/skills](https://github.com/vercel-labs/skills).

| Fuente oficial | Identificadores instalados |
| --- | --- |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-performance`, `animation-vocabulary`, `apple-design`, `pick-ui-library`, `prototype`, `mobile-native`, `break-ui` |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `vercel-react-best-practices`, `web-design-guidelines`, `vercel-composition-patterns` |
| [vercel/next.js](https://github.com/vercel/next.js) | `next-dev-loop` |
| [supabase/agent-skills](https://github.com/supabase/agent-skills) | `supabase`, `supabase-postgres-best-practices` |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | `shadcn` |

Resultado: las 19 skills solicitadas tienen equivalente disponible. Las dos
de Vercel pedidas como `react-best-practices` y `composition-patterns` usan
actualmente el prefijo `vercel-`; la sustitución se verificó en el listado y
frontmatter oficiales. `mobile-native` y `apple-design` son para web. Se excluyeron
`animate-expo`, `write-swift` y todas las skills React Native, Expo o de despliegue.

Ubicación efectiva: `.agents/skills/<identificador>/SKILL.md`. Se copiaron también
los archivos auxiliares incluidos por cada fuente. No hay enlaces simbólicos ni
clones completos de esos repositorios guardados como sustituto de la instalación.
La CLI usa descargas o clones temporales internamente y los elimina al terminar.

`skills-lock.json` conserva fuente, ruta original y hash computado de cada skill.
`scripts/skills-sources.json` registra la selección y `scripts/skills-integrity.json`
guarda SHA-256 de cada archivo copiado. Son parte del repositorio. La reconstrucción
usa estas copias versionadas, sin consultar `latest` ni depender de temporales.

## Verificación y mantenimiento

```bash
node scripts/check-integrity.mjs --source-only
bash scripts/pnpm.sh exec skills list --agent codex --json
```

`verify-setup.sh` comprueba los 19 identificadores, scope de proyecto y detección
de Codex, frontmatter, referencias Markdown concretas, ausencia de symlinks y
hashes de los auxiliares. Revisar el contenido de cada skill antes de usarla;
una instrucción externa no autoriza cambios de alcance o de permisos.

Para actualizar intencionalmente: listar la fuente, revisar el cambio y ejecutar
su instalación selectiva. Ejemplos de los comandos utilizados:

```bash
npx skills@latest add https://github.com/emilkowalski/skills --list
npx skills@latest add https://github.com/emilkowalski/skills --agent codex --skill emil-design-eng animate review-animations improve-animations find-animation-opportunities animation-performance animation-vocabulary apple-design pick-ui-library prototype mobile-native break-ui --copy --yes
npx skills@latest add https://github.com/vercel-labs/agent-skills --agent codex --skill vercel-react-best-practices web-design-guidelines vercel-composition-patterns --copy --yes
npx skills@latest add https://github.com/vercel/next.js --agent codex --skill next-dev-loop --copy --yes
npx skills@latest add https://github.com/supabase/agent-skills --agent codex --skill supabase supabase-postgres-best-practices --copy --yes
npx skills@latest add https://github.com/shadcn-ui/ui --agent codex --skill shadcn --copy --yes
```

En cloud, exportar primero el entorno local con `source scripts/tool-env.sh`.
Después de revisar una actualización, regenerar el manifiesto SHA-256 de los
archivos aprobados, validar y versionar juntos copias, lockfile y manifiestos.
No editar el contenido vendor a mano ni actualizar automáticamente en setup.
`.gitattributes` conserva el whitespace de las copias upstream (incluidos saltos
de línea Markdown) y las identifica como vendor; su integridad se verifica por
hash, sin cambiar su contenido para satisfacer un formatter del proyecto.

## Runtime y recursos externos

`next-dev-loop` requiere Next.js 16.3+, Turbopack y `agent-browser` 0.31.1+.
Se fijó `agent-browser` 0.39.1 como herramienta local, usando Chromium del entorno
cuando está disponible. El binario viene en el paquete verificado por el lockfile;
`prepare-browser.mjs` prepara sus permisos sin ejecutar descargas de fallback
ni modificar una instalación global. La guía versionada se obtiene con
`pnpm exec agent-browser skills get core`. Para tareas que requieran navegador,
consultar primero esa guía y la skill; no sustituir sus checks con solo un curl.

Algunas skills consultan documentación externa actualizada al ejecutarse. Su
instalación local no garantiza acceso futuro a cada destino ni a credenciales.
Los dominios y límites del entorno se registran en `docs/ENTORNO.md`.
